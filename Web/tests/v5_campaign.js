const fs = require("fs");
const vm = require("vm");
const path = require("path");

global.window = global;
global.HL = {};
const root = path.resolve(__dirname, "..");
for (const file of ["data.js", "world_data.js", "v5_data.js", "collision.js", "systems.js", "v5_systems.js", "sea_navigation_v6.js", "art.js", "game.js", "expansion.js", "v5_art.js", "v5_expansion.js"]) {
  vm.runInThisContext(fs.readFileSync(path.join(root, file), "utf8"), { filename: file });
}

const failures = [];
const state = HL.Game.freshState();
const campaign = new HL.CampaignSystem();
const navigation = new HL.WorldNavigation();
const fleets = new HL.FleetSystem(navigation, campaign);
campaign.ensure(state);

if (HL.DATA.version !== 5 || HL.DATA.campaign.chapters.length !== 8) failures.push("v5 campaign shape failed");
if (!campaign.evaluate(state, { type: "action", id: "accept-ship" }) || state.campaign.chapterId !== "blue-ledger") failures.push("chapter zero did not advance");
campaign.setChapter(state, "missing-navigator");
state.fame.adventure = 2000;
const events = [
  { type: "facility", id: "inn", port: "bella" },
  { type: "dock", port: "ceuta" },
  { type: "battle", tag: "royal-rescue" },
  { type: "facility", id: "mansion", port: "bella" }
];
for (const event of events) if (!campaign.evaluate(state, event)) failures.push(`missing navigator event failed: ${JSON.stringify(event)}`);
state.fame.adventure = 10000;
for (const event of [
  { type: "facility", id: "mansion", port: "bella" },
  { type: "facility", id: "guild", port: "alexandria" },
  { type: "search", lon: 39.2, lat: 15.4 },
  { type: "battle", tag: "massawa-defense" }
]) if (!campaign.evaluate(state, event)) failures.push(`tide staff event failed: ${JSON.stringify(event)}`);
state.fame.adventure = 30000;
for (const event of [
  { type: "facility", id: "inn", port: "massawa" },
  { type: "dock", port: "nagasaki" },
  { type: "facility", id: "guild", port: "sakai" }
]) if (!campaign.evaluate(state, event)) failures.push(`eastbound event failed: ${JSON.stringify(event)}`);
state.fame.adventure = 40000;
for (const event of [
  { type: "facility", id: "guild", port: "bella" },
  { type: "dock", port: "cartagena" },
  { type: "facility", id: "inn", port: "cartagena" },
  { type: "battle", tag: "cartagena-rival" },
  { type: "search", lon: -49.5, lat: .2 },
  { type: "battle", tag: "meridian-final" },
  { type: "facility", id: "mansion", port: "bella" }
]) if (!campaign.evaluate(state, event)) failures.push(`western campaign event failed: ${JSON.stringify(event)}`);
if (state.campaign.chapterId !== "homecoming" || !state.flags.campaignComplete) failures.push("campaign did not finish");

const meta = HL.DATA.spriteSheets.rian;
for (const mode of [meta.town, meta.interior]) {
  if (Object.keys(mode.frames).length !== 8) failures.push("sprite directions missing");
  for (let direction = 0; direction < 8; direction++) {
    const frames = mode.frames[direction];
    if (!frames || frames.length !== 10) failures.push(`sprite frame count failed at ${direction}`);
    for (const frame of frames || []) if (frame.w !== mode.frameWidth || frame.h !== mode.frameHeight) failures.push("sprite frame dimensions failed");
  }
}

state.mode = "sea";
state.sea.lon = -12;
state.sea.lat = 36;
fleets.ensure(state);
const initialFleetCount = state.seaFleets.length;
const game = { s: state, mode: "sea", e: { overlay: { innerHTML: "" } }, startFleetEncounter() { this.encounters = (this.encounters || 0) + 1; } };
for (let tick = 0; tick < 240; tick++) fleets.update(game, .1);
if (initialFleetCount < 20) failures.push("not enough persistent pirate fleets");
if (state.seaFleets.some(f => f.active && navigation.isLand(f.lon, f.lat))) failures.push("pirate fleet entered land");
if (!state.seaFleets.some(f => ["patrol", "chase", "return"].includes(f.ai))) failures.push("pirate AI state missing");

const chunks = fs.readdirSync(path.resolve(root, "../Assets/Resources/Sprites/Game/V5/WorldChunks")).filter(x => x.endsWith(".png"));
if (chunks.length !== 32) failures.push(`world chunk count is ${chunks.length}`);
for (const file of ["rian_town_v5.png", "rian_interior_v5.png", "world_map_source_v5.png"]) if (!fs.existsSync(path.resolve(root, `../Assets/Resources/Sprites/Game/V5/${file}`))) failures.push(`missing asset ${file}`);

console.log(JSON.stringify({
  version: HL.DATA.version,
  chapters: HL.DATA.campaign.chapters.length,
  completedTasks: state.campaign.completed.length,
  campaignComplete: state.flags.campaignComplete,
  spriteDirections: Object.keys(meta.town.frames).length,
  spriteFramesPerDirection: meta.town.frames[0].length,
  pirateFleets: initialFleetCount,
  worldChunks: chunks.length,
  failures
}, null, 2));
if (failures.length) process.exitCode = 1;
