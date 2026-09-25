const fs = require("fs");
const vm = require("vm");
const path = require("path");

global.window = global;
global.HL = {};
const values = new Map();
global.localStorage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
const root = path.resolve(__dirname, "..");
for (const file of ["data.js", "world_data.js", "v5_data.js", "systems.js", "v5_systems.js", "sea_navigation_v6.js", "engine.js", "art.js", "game.js", "expansion.js", "v5_art.js", "v5_expansion.js", "dos_sea_v6.js"]) {
  vm.runInThisContext(fs.readFileSync(path.join(root, file), "utf8"), { filename: file });
}

const previous = HL.Game.freshState();
previous.version = 4;
previous.money = 4321;
previous.currentPort = "genoa";
previous.lastPort = "lume";
previous.bank.balance = 900;
previous.properties.bella = { boughtDay: 3 };
previous.discoveries.push({ id: "old-wreck", name: "오래된 난파선", lon: 8, lat: 40, value: 300 });
previous.fleet[0].hull = 77;
values.set("horizon-ledger-v4-slot-1", JSON.stringify(previous));

const engine = Object.create(HL.Engine.prototype);
engine.migrateOld(1);
const migrated = JSON.parse(values.get("horizon-ledger-v6-slot-1"));
const failures = [];
if (!values.has("horizon-ledger-v4-slot-1")) failures.push("v4 source save was removed");
if (migrated.version !== 6) failures.push("migrated version is not 6");
if (migrated.money !== 4321 || migrated.bank.balance !== 900 || migrated.fleet[0].hull !== 77) failures.push("financial or fleet state lost");
if (!migrated.properties.bella || migrated.discoveries[0]?.id !== "old-wreck") failures.push("property or discovery state lost");
if (migrated.currentPort !== "genoa" || migrated.lastPort !== "lume") failures.push("port state lost");
if (!migrated.campaign || !Array.isArray(migrated.seaFleets) || !migrated.fleet[0].voyage) failures.push("v6 fields missing");

console.log(JSON.stringify({ version: migrated.version, money: migrated.money, bank: migrated.bank.balance, hull: migrated.fleet[0].hull, sourcePreserved: values.has("horizon-ledger-v4-slot-1"), failures }, null, 2));
if (failures.length) process.exitCode = 1;
