const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("@napi-rs/canvas");

const root = path.resolve(__dirname, "../..");
const characterRoot = path.join(root, "Assets/Resources/Sprites/Game/V11/Characters");
const characters = ["rian", "damian", "orso", "mira", "vardo"];
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };

function bounds(data, width, height) {
  let left = width, top = height, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] <= 8) continue;
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  return right < 0 ? null : { left, top, right, bottom };
}

(async () => {
  let checked = 0;
  for (const character of characters) {
    const manifest = JSON.parse(fs.readFileSync(path.join(characterRoot, `${character}_SpriteManifestV11.json`), "utf8"));
    expect(manifest.version === 11 && manifest.id === character, `${character}: manifest identity`);
    expect(manifest.directions.join(",") === "N,NE,E,SE,S,SW,W,NW", `${character}: direction order`);
    for (const [mode, width, height, baseline] of [["town", 48, 72, 68], ["interior", 64, 96, 92]]) {
      const file = path.join(characterRoot, `${character}_${mode}_v11.png`), image = await loadImage(file);
      expect(image.width === width * 10 && image.height === height * 8, `${character} ${mode}: sheet dimensions`);
      const canvas = createCanvas(image.width, image.height), context = canvas.getContext("2d"); context.drawImage(image, 0, 0);
      for (let row = 0; row < 8; row++) for (let column = 0; column < 10; column++) {
        const data = context.getImageData(column * width, row * height, width, height).data, box = bounds(data, width, height), label = `${character} ${mode} ${manifest.directions[row]} ${column + 1}`;
        expect(!!box, `${label}: empty`); if (!box) continue;
        expect(Math.min(box.left, box.top, width - 1 - box.right, height - 1 - box.bottom) >= 3, `${label}: unsafe margin`);
        expect(box.bottom === baseline, `${label}: baseline ${box.bottom}`);
        const frame = manifest.modes[mode].frames[row][column];
        expect(frame.x === column * width && frame.y === row * height && frame.w === width && frame.h === height, `${label}: frame rect`);
        expect(frame.pivot[1] === baseline + 1, `${label}: pivot`); checked++;
      }
    }
    const report = JSON.parse(fs.readFileSync(path.join(root, `Docs/Screenshots/${character}_sprite_report_v11.json`), "utf8"));
    for (const mode of ["town", "interior"]) {
      expect(report[mode].filter(frame => frame.direction === "W" && frame.mirrored).length === 10, `${character} ${mode}: W reconstruction report`);
      expect(report[mode].filter(frame => frame.direction !== "W" && frame.mirrored).length === 0, `${character} ${mode}: unexpected mirrored direction`);
      const expectedRepeats = character === "mira" ? 8 : 0;
      expect(report[mode].filter(frame => frame.repeatedSource).length === expectedRepeats, `${character} ${mode}: repeated source count`);
    }
  }
  console.log(JSON.stringify({ characters: characters.length, frames: checked, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
