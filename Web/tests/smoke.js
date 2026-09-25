const fs = require("fs");
const vm = require("vm");
const path = require("path");

global.window = global;
global.HL = {};

const root = path.resolve(__dirname, "..");
for (const file of ["data.js", "world_data.js", "v5_data.js", "collision.js", "systems.js", "v5_systems.js", "sea_navigation_v6.js"]) {
  vm.runInThisContext(fs.readFileSync(path.join(root, file), "utf8"), { filename: file });
}

const collision = new HL.CollisionWorld(0.28);
const failures = [];
const openingStart = { x: 19.5, y: 8.4 };

for (const townId of HL.DATA.portOrder) {
  const town = HL.WorldData.townMapFor(townId);
  const start = townId === "bella" ? openingStart : { x: town.spawn[0], y: town.spawn[1] };
  if (collision.blocked(town.collision, start.x, start.y)) {
    failures.push(`${townId}: opening spawn is blocked`);
  }

  const step = 0.25;
  const queue = [[start.x, start.y]];
  const seen = new Set();
  const key = (x, y) => `${Math.round(x / step)},${Math.round(y / step)}`;
  seen.add(key(start.x, start.y));

  for (let index = 0; index < queue.length; index++) {
    const [x, y] = queue[index];
    for (const [dx, dy] of [[step, 0], [-step, 0], [0, step], [0, -step]]) {
      const nextX = x + dx;
      const nextY = y + dy;
      const nextKey = key(nextX, nextY);
      if (seen.has(nextKey) || collision.blocked(town.collision, nextX, nextY)) continue;
      seen.add(nextKey);
      queue.push([nextX, nextY]);
    }
  }

  for (const door of town.collision.doors) {
    const [x, y, width, height] = door.rect;
    const reachable = queue.some(([px, py]) =>
      px >= x - 0.35 && px <= x + width + 0.35 && py >= y - 0.35 && py <= y + height + 0.35
    );
    if (!reachable) failures.push(`${townId}: ${door.id} door is unreachable`);
  }
}

const npcAppearanceIds = HL.DATA.portOrder
  .flatMap(id => HL.WorldData.townMapFor(id).npcs.map(npc => npc.appearanceId));
if (new Set(npcAppearanceIds).size !== npcAppearanceIds.length) {
  failures.push("NPC appearance IDs are not unique");
}

const prologue = HL.DATA.cutscenes.prologue;
const duration = prologue.steps.reduce((total, step) => total + step.duration, 0);
if (duration < 60 || duration > 90) failures.push(`prologue duration is ${duration}s`);
if (HL.DATA.version !== 5) failures.push(`save version is ${HL.DATA.version}`);
if (HL.DATA.portOrder.length !== 120) failures.push(`port count is ${HL.DATA.portOrder.length}`);
if (HL.DATA.goods.length !== 60) failures.push(`goods count is ${HL.DATA.goods.length}`);
if (HL.WorldData.activePorts(1).length !== 24) failures.push("phase 1 is not 24 ports");
if (HL.WorldData.activePorts(2).length !== 72) failures.push("phase 2 is not 72 ports");
for (const port of Object.values(HL.DATA.ports)) {
  if (!port.specialties.length || port.specialties.some(id => !HL.DATA.goods.some(good => good.id === id))) failures.push(`${port.id}: invalid specialty`);
  if (!Number.isFinite(port.lon) || !Number.isFinite(port.lat)) failures.push(`${port.id}: invalid coordinates`);
}
const navigation = new HL.WorldNavigation();
const testShip = { equipment: { figurehead: "dragon", sail: "lateen", hull: "copper" } };
if (navigation.reduction(testShip, "stormReduction") !== 0.15) failures.push("dragon figurehead modifier failed");
const lisbon = HL.DATA.ports.bella;
const lisbonSeaAccess = [[-1.2,0],[-2,0],[-3,0],[0,-2]].some(([dx,dy]) => !navigation.isLand(lisbon.lon+dx,lisbon.lat+dy));
if (!lisbonSeaAccess) failures.push("Lisbon has no valid sea spawn");

let checkedSceneFiles = 0;
const pngSize = file => {
  const header = fs.readFileSync(file).subarray(0, 24);
  return [header.readUInt32BE(16), header.readUInt32BE(20)];
};
for (const [assetId, asset] of Object.entries(HL.DATA.sceneAssets)) {
  const files = [asset.background, asset.foreground, asset.waterMask].filter(Boolean);
  for (const relativeFile of files) {
    const file = path.resolve(root, relativeFile);
    if (!fs.existsSync(file)) {
      failures.push(`${assetId}: missing ${relativeFile}`);
      continue;
    }
    checkedSceneFiles++;
    const [width, height] = pngSize(file);
    if (width !== 960 || height !== 540) failures.push(`${assetId}: ${width}x${height} asset`);
  }
}

const result = {
  towns: HL.DATA.portOrder.length,
  reachableDoors: HL.DATA.portOrder.reduce((sum, id) => sum + HL.WorldData.townMapFor(id).collision.doors.length, 0),
  appearances: Object.keys(HL.DATA.appearances).length,
  checkedSceneFiles,
  cutsceneSteps: prologue.steps.length,
  cutsceneDuration: duration,
  failures
};

console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
