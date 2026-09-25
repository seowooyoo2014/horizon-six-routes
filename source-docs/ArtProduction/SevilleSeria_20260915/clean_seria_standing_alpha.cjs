const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { PNG } = require('pngjs');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const root = __dirname;
const output = path.join(root, 'seria_standing_alpha_v1');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const originalManifestBytes = fs.readFileSync(path.join(root, 'seria_design_manifest.json'));
const manifest = JSON.parse(originalManifestBytes);
const atlasBytes = fs.readFileSync(path.join(root, manifest.atlas));
assert.equal(hash(atlasBytes), 'd43891e02f05a12e01ba471cbf25e74e6e751d4d70e87f13d9ef230b6242b5ac');
assert.equal(hash(fs.readFileSync(path.join(root, manifest.source))), manifest.sourceSha256);
const beforeAtlas = PNG.sync.read(atlasBytes);
const afterAtlas = PNG.sync.read(atlasBytes);
const inputs = new Map([[manifest.atlas, hash(atlasBytes)], ['seria_design_manifest.json', hash(originalManifestBytes)], [manifest.source, manifest.sourceSha256]]);

function exteriorMask(png) {
  const { width: w, height: h, data } = png;
  const exterior = new Uint8Array(w * h), queue = [];
  const add = i => {
    if (!exterior[i] && data[i * 4 + 3] === 0) { exterior[i] = 1; queue.push(i); }
  };
  for (let x = 0; x < w; x++) { add(x); add((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { add(y * w); add(y * w + w - 1); }
  for (let n = 0; n < queue.length; n++) {
    const i = queue[n], x = i % w, y = Math.floor(i / w);
    if (x) add(i - 1);
    if (x < w - 1) add(i + 1);
    if (y) add(i - w);
    if (y < h - 1) add(i + w);
  }
  return exterior;
}

function opaqueBounds(png) {
  let left = png.width, top = png.height, right = -1, bottom = -1, opaquePixels = 0;
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
    if (!png.data[(y * png.width + x) * 4 + 3]) continue;
    opaquePixels++;
    left = Math.min(left, x); right = Math.max(right, x);
    top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  return { opaquePixels, alphaBounds: [left, top, right - left + 1, bottom - top + 1] };
}

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const frames = [];
  for (const frame of manifest.frames) {
    const bytes = fs.readFileSync(path.join(root, frame.file));
    inputs.set(frame.file, hash(bytes));
    const original = PNG.sync.read(bytes), clean = PNG.sync.read(bytes);
    assert.equal(original.width, 48); assert.equal(original.height, 72);
    const exterior = exteriorMask(original), removed = [];
    // Only inspect the original exterior once: no iterative inward erosion.
    for (let y = 0; y < 72; y++) for (let x = 0; x < 48; x++) {
      const i = (y * 48 + x) * 4;
      const [r, g, b, a] = original.data.subarray(i, i + 4);
      if (!a || b < 28 || b - g < 18 || b < r * 0.5 || r <= g * 1.6 || b <= g * 1.6) continue;
      let touchesExterior = false;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < 48 && ny < 72 && exterior[ny * 48 + nx]) touchesExterior = true;
      }
      if (!touchesExterior) continue;
      clean.data[i + 3] = 0;
      removed.push({ pixel: [x, y], originalRGBA: [r, g, b, a] });
    }
    assert(removed.length < frame.opaquePixels * 0.04, 'Unexpectedly broad alpha removal');
    for (let y = 0; y < 72; y++) for (let x = 0; x < 48; x++) {
      const i = (y * 48 + x) * 4;
      const j = ((y + frame.atlasRect[1]) * 192 + x + frame.atlasRect[0]) * 4;
      for (let channel = 0; channel < 4; channel++) assert.equal(original.data[i + channel], beforeAtlas.data[j + channel]);
      for (let channel = 0; channel < 3; channel++) assert.equal(clean.data[i + channel], original.data[i + channel]);
      afterAtlas.data[j + 3] = clean.data[i + 3];
    }
    const file = `${frame.direction}.png`, cleanBytes = PNG.sync.write(clean);
    fs.writeFileSync(path.join(output, file), cleanBytes);
    const decoded = PNG.sync.read(cleanBytes);
    assert.deepEqual(decoded.data, clean.data, 'PNG roundtrip must preserve even hidden RGB');
    frames.push({ ...frame, originalFile: `../${frame.file}`, file, originalSha256: hash(bytes), sha256: hash(cleanBytes), ...opaqueBounds(clean), removedPixels: removed });
  }
  const atlas = 'seria_direction_design_48x72_alpha_v1.png';
  const cleanAtlasBytes = PNG.sync.write(afterAtlas);
  fs.writeFileSync(path.join(output, atlas), cleanAtlasBytes);
  assert.deepEqual(PNG.sync.read(cleanAtlasBytes).data, afterAtlas.data);
  for (let i = 0; i < beforeAtlas.data.length; i++) {
    if (i % 4 !== 3) assert.equal(beforeAtlas.data[i], afterAtlas.data[i]);
    else assert(afterAtlas.data[i] === beforeAtlas.data[i] || (beforeAtlas.data[i] === 255 && afterAtlas.data[i] === 0));
  }
  const originalImage = await loadImage(atlasBytes), cleanImage = await loadImage(cleanAtlasBytes);
  for (const [name, background, foreground] of [['black', '#000000', '#ffffff'], ['white', '#ffffff', '#000000']]) {
    const c = createCanvas(1536, 612), ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = background; ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = foreground; ctx.font = '16px sans-serif';
    ctx.fillText('Original standing sheet', 16, 24);
    ctx.fillText('Alpha cleanup v1 - same RGB / frame grid / pivot', 784, 24);
    ctx.drawImage(originalImage, 0, 36, 768, 576);
    ctx.drawImage(cleanImage, 768, 36, 768, 576);
    fs.writeFileSync(path.join(output, `before_after_${name}_4x.png`), c.toBuffer('image/png'));
  }
  for (const [file, expected] of inputs) assert.equal(hash(fs.readFileSync(path.join(root, file))), expected, `Original changed: ${file}`);
  const result = {
    schema: 'seria-eight-standing-alpha-review.v1',
    characterId: manifest.characterId,
    purpose: 'Eight standing direction design frames only; alpha-only derivative',
    originalManifest: '../seria_design_manifest.json',
    originalAtlas: `../${manifest.atlas}`,
    originalAtlasSha256: hash(atlasBytes),
    sourceSha256: manifest.sourceSha256,
    atlas, atlasSha256: hash(cleanAtlasBytes), atlasSize: [192, 144], frameSize: [48, 72], pivotTopLeft: [24, 69],
    directions: manifest.directions, frames,
    processing: 'One pass on original exterior-connected silhouette: B>=28, B-G>=18, B>=0.5R, R>1.6G, B>1.6G; eight-neighbor adjacency to four-connected transparent exterior. Set selected alpha 255 to 0. Preserve every RGB byte, including RGB beneath zero alpha. No resampling, repositioning, recolor, accessory or design edit.',
    verification: { originalFilesUnchanged: inputs.size, rgbChannelChanges: 0, alphaPixelsRemoved: frames.reduce((sum, frame) => sum + frame.removedPixels.length, 0), alphaPixelsAdded: 0, partialAlphaPixels: 0, frameAtlasMismatch: 0 },
    artReview: '2026-09-21: alpha cleanup accepted for standing-design review after black/white inspection; no runtime or animation approval; see ../BOUNDED_ART_REVIEW_20260920.md',
    standingViews: 8, animationFramesCompleted: 0, animationReady: false, runtimeInstalled: false
  };
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ output, verification: result.verification, frames: frames.map(frame => ({ direction: frame.direction, removed: frame.removedPixels.length, alphaBounds: frame.alphaBounds })) }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
