const fs = require("fs");
const vm = require("vm");
const path = require("path");

global.window = global;
global.HL = {};
const root = path.resolve(__dirname, "..");
for (const file of ["data.js", "world_data.js", "v5_data.js", "collision.js", "systems.js", "v5_systems.js", "sea_navigation_v6.js", "engine.js", "art.js", "game.js", "expansion.js", "v5_art.js", "v5_expansion.js", "dos_sea_v6.js", "horizon_v7.js", "story_v8.js", "story_v9_data.js", "story_v9.js"]) {
  vm.runInThisContext(fs.readFileSync(path.join(root, file), "utf8"), { filename: file });
}

const failures = [];
const engine = {
  overlay: { innerHTML: "", firstElementChild: null },
  window() {}, button(label) { return `<button>${label}</button>`; }, close() { this.overlay.innerHTML = ""; },
  toast(message) { this.lastToast = message; }, dialogue(speaker, text) { this.lastDialogue = `${speaker}:${text}`; },
  sfx() {}, playMusic() {}, saveSlot() {}, loadSlot() { return null; }
};
const game = Object.create(HL.Game.prototype);
game.e = engine;
game.s = HL.Game.freshState();
game.mode = "town";
game.seaMenu = false;
game.npcs = [];
game.playerVelocity = { x: 0, y: 0 };
game.lastSafe = { x: 16, y: 16 };
game.save = () => {};
game.ensureExpansion();

if (game.s.version !== 9 || game.s.crew.health !== 100 || game.s.bank.balance !== 0 || !game.s.fleet[0].voyage || !game.s.fragmentBoard || !game.s.cutsceneState || !game.s.companions) failures.push("fresh v9 state failed");
const seaSpawn = game.findSeaSpawn(HL.DATA.ports.bella);
if (game.navigation.isLand(seaSpawn.x, seaSpawn.y)) failures.push("Lisbon sea spawn is on land");

game.s.currentPort = "lume";
game.s.quest.stage = 2;
game.s.money = 5000;
game.s.cargo.glass = 1;
game.marketMenu = () => {};
game.trade("glass", false);
game.trade("wine", true);
game.trade("timber", true);
if (game.s.quest.stage !== 3) failures.push("first trade quest did not advance");

game.s.money = 1200;
game.dispatchAction("bank-deposit:100");
if (game.s.money !== 1100 || game.s.bank.balance !== 100) failures.push("bank deposit failed");
game.dispatchAction("bank-withdraw:100");
if (game.s.money !== 1200 || game.s.bank.balance !== 0) failures.push("bank withdrawal failed");

game.s.currentPort = "bella";
game.s.money = 5000;
game.dispatchAction("buy-property");
if (!game.s.properties.bella) failures.push("property purchase failed");

game.s.money = 0;
for (const id of Object.keys(game.s.cargo)) game.s.cargo[id] = 0;
game.pirateSurrender();
if (game.s.money !== 100 || !game.s.encounters.piratePity) failures.push("pirate pity event failed");

game.s.cargo.lime_juice = 1;
game.s.crew.health = 45;
game.s.crew.disease = "괴혈병";
game.openSeaMenu = () => {};
game.dispatchAction("use-lime");
if (game.s.crew.disease || game.s.crew.health <= 45 || game.s.cargo.lime_juice !== 0) failures.push("lime treatment failed");

game.mode = "sea";
game.openWorldMap();
game.closeWorldMap();
if (game.mode !== "sea" || game.seaMenu) failures.push("world map return failed");

game.s.hour = 12;
game.startBattle("pirate");
if (game.mode !== "battle" || game.battle.enemy.hp <= 0 || game.battle.kind !== "pirate") failures.push("battle start failed");

console.log(JSON.stringify({
  version: game.s.version,
  ports: HL.DATA.portOrder.length,
  goods: HL.DATA.goods.length,
  seaSpawn,
  bank: game.s.bank,
  properties: Object.keys(game.s.properties),
  piratePity: game.s.encounters.piratePity,
  battleMode: game.mode,
  failures
}, null, 2));
if (failures.length) process.exitCode = 1;
