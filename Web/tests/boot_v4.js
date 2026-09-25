const fs = require("fs");
const vm = require("vm");
const path = require("path");

const gradient = { addColorStop() {} };
const context = new Proxy({
  imageSmoothingEnabled: false,
  createLinearGradient: () => gradient,
  createRadialGradient: () => gradient,
  measureText: text => ({ width: String(text).length * 8 })
}, { get(target, key) { return key in target ? target[key] : () => {}; }, set(target, key, value) { target[key] = value; return true; } });
const makeElement = () => ({
  innerHTML: "", textContent: "", style: {}, classList: { add() {}, remove() {} },
  addEventListener() {}, querySelectorAll() { return []; }, querySelector() { return null; },
  get firstElementChild() { return null; }
});
const canvas = { width: 960, height: 540, getContext: () => context };
const elements = { "#world": canvas, "#hud": makeElement(), "#overlay": makeElement(), "#toast": makeElement(), "#help": makeElement() };

global.window = global;
global.document = { querySelector: selector => elements[selector] || null, createElement: tag => tag === "canvas" ? { ...canvas } : makeElement(), activeElement: null };
global.addEventListener = () => {};
global.navigator = { getGamepads: () => [] };
global.requestAnimationFrame = () => 1;
global.confirm = () => false;
global.prompt = () => null;
global.localStorage = { data: new Map(), getItem(key) { return this.data.get(key) ?? null; }, setItem(key, value) { this.data.set(key, value); }, removeItem(key) { this.data.delete(key); } };
global.Audio = class { constructor(src="") { this.src=src;this.volume = 1; this.currentTime = 0;this.listeners={}; } addEventListener(type,handler){this.listeners[type]=handler} trigger(type){this.listeners[type]?.()} load(){} play() { return Promise.resolve(); } pause() {} };
global.Image = class {
  constructor() { this.complete = true; this.naturalWidth = 1536; this.naturalHeight = 1024; }
  set src(value) { this._src = value; queueMicrotask(() => this.onload?.()); }
  get src() { return this._src; }
};

global.HL = {};
const root = path.resolve(__dirname, "..");
for (const file of ["data.js", "world_data.js", "v5_data.js", "assets.js", "collision.js", "systems.js", "v5_systems.js", "sea_navigation_v6.js", "engine.js", "art.js", "game.js", "expansion.js", "v5_art.js", "legacy_animation.js", "v5_expansion.js", "dos_sea_v6.js", "horizon_v7.js", "story_v8.js", "story_v9_data.js", "story_v9.js", "topdown_v10_data.js", "topdown_v10.js", "topdown_v10_art.js"]) {
  vm.runInThisContext(fs.readFileSync(path.join(root, file), "utf8"), { filename: file });
}

const game = new HL.Game();
setImmediate(() => {
  const failures = [];
  if (game.mode !== "file") failures.push(`booted in ${game.mode}`);
  if (!elements["#overlay"].innerHTML.includes("항해 파일 1")) failures.push("file selection did not render");
  if (!game.assets.ready || game.assets.failed) failures.push("scene preload failed");
  if (HL.DATA.version !== 10 || HL.DATA.portOrder.length !== 120) failures.push("v10 world data missing");
  if(HL.Art.prototype.animationVersion!=="atlas-v2")failures.push("legacy character animation not active");
  game.assets.ready=false;
  try{game.dispatchAction("new:2");if(game.mode!=="scenario")failures.push("new game did not open scenario while loading");game.dispatchAction("captain:0");if(game.mode!=="prologue-v10"||!game.s)failures.push("captain selection did not start v10 playable prologue")}catch(error){failures.push(`new game flow: ${error.message}`)}
  game.showFiles();
  const stale=HL.Game.freshState();delete stale.crew.assignment;stale.slot=1;localStorage.setItem(game.e.slotKey(1),JSON.stringify(stale));
  try{game.resume(1);if(!game.s.crew.assignment||!game.s.fleet[0].voyage)failures.push("stale save crew assignment not repaired")}catch(error){failures.push(`stale save resume: ${error.message}`)}
  if(Object.keys(game.e.musicDirector?.tracks||{}).length!==7||Object.keys(game.e.music||{}).length)failures.push("v9 restricted music registry failed");
  console.log(JSON.stringify({ mode: "file", resumedMode:game.mode, assets: game.assets.loaded, ports: HL.DATA.portOrder.length, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
});
