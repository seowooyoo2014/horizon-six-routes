const fs = require("fs");
const vm = require("vm");
const path = require("path");
const { createCanvas, Image, loadImage } = require("@napi-rs/canvas");

const root = path.resolve(__dirname, "..");
const output = path.resolve(root, "../Docs/Screenshots");
process.chdir(root);
global.window = global;
global.HL = {};
global.Image = Image;
global.Audio = class { play() { return Promise.resolve(); } pause() {} };
global.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
global.indexedDB = { open() { const request={error:new Error("disabled in render test")}; queueMicrotask(()=>request.onerror?.()); return request; } };
global.document = { createElement: () => createCanvas(1, 1) };

for (const file of ["data.js", "world_data.js", "v5_data.js", "collision.js", "systems.js", "v5_systems.js", "sea_navigation_v6.js", "engine.js", "art.js", "game.js", "expansion.js", "v5_art.js", "v5_expansion.js", "dos_sea_v6.js", "horizon_v7.js", "story_v8.js", "story_v9_data.js", "story_v9.js", "topdown_v10_data.js", "topdown_v10.js", "topdown_v10_art.js", "graphics_v11_data.js", "graphics_v11.js", "graphics_v11_art.js", "v12_data.js", "v12_systems.js", "v12_art.js", "v13_data.js", "v13_systems.js", "v13_art.js"]) {
  vm.runInThisContext(fs.readFileSync(path.join(root, file), "utf8"), { filename: file });
}

async function main() {
  const imageCache = new Map();
  for (const [id, asset] of Object.entries(HL.DATA.sceneAssets)) {
    for (const role of ["background", "foreground", "waterMask"]) {
      if (!asset[role]) continue;
      const source=path.resolve(root,asset[role]);
      if(fs.existsSync(source))imageCache.set(`${id}:${role}`,await loadImage(source));
    }
  }

const canvas = createCanvas(960, 540);
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const engine = {
  canvas,
  ctx,
  clear(color) { ctx.fillStyle = color; ctx.fillRect(0, 0, 960, 540); },
  text(value, x, y, color = "white", align = "left", size = 16) {
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    ctx.font = `${size}px sans-serif`;
    ctx.fillText(value, x, y);
  }
};
const assets = { get(id, role = "background") { return imageCache.get(`${id}:${role}`); } };
const art = new HL.Art(assets);
art.images.atlas = await loadImage(path.resolve(root, "../Assets/Resources/Sprites/Game/maritime_sprite_atlas_v2.png"));
art.images.rianTown = await loadImage(path.resolve(root, "../Assets/Resources/Sprites/Game/V5/rian_town_v5.png"));
art.images.rianInterior = await loadImage(path.resolve(root, "../Assets/Resources/Sprites/Game/V5/rian_interior_v5.png"));
for (const id of ["orso", "damian", "mira", "vardo"]) {
  art.images[`${id}Town`] = await loadImage(path.resolve(root, `../Assets/Resources/Sprites/Game/V5/${id}_town_v5.png`));
  art.images[`${id}Interior`] = await loadImage(path.resolve(root, `../Assets/Resources/Sprites/Game/V5/${id}_interior_v5.png`));
}
art.images.worldOverview = await loadImage(path.resolve(root, "../Assets/Resources/Sprites/Game/V5/world_map_source_v5.png"));
art.images.oceanV6 = await loadImage(path.resolve(root, "../Assets/Resources/Sprites/Game/SeaV6/ocean_depth_source_v6.png"));
art.images.terrainV6 = await loadImage(path.resolve(root, "../Assets/Resources/Sprites/Game/SeaV6/terrain_climate_source_v6.png"));
art.images.v10Tiles = await loadImage(path.resolve(root, "../Assets/Resources/Sprites/Game/V10/interior_tiles_v10.png"));
art.images.v11Tiles = await loadImage(path.resolve(root, "../Assets/Resources/Sprites/Game/V11/interior_tiles_v11.png"));
art.seaShipVisual = new HL.SeaShipVisual();
const chunkImages = new Map();
for (let row = 0; row < 4; row++) for (let col = 0; col < 8; col++) {
  chunkImages.set(`${row}:${col}`, await loadImage(path.resolve(root, `../Assets/Resources/Sprites/Game/V5/WorldChunks/world_${row}_${col}.png`)));
}
art.chunkCache = { preload() {}, get(row, col) { return chunkImages.get(`${row}:${(col + 8) % 8}`) || null; } };
art.v5Ready = true;
art.ensureV11();
for (const id of ["rian", "orso", "damian", "mira", "vardo", "citizen"]) {
  const manifest=HL.DATA.spriteManifestsV11[id];
  art.spriteRendererV11.images[`${id}:town:base`] = await loadImage(path.resolve(root,manifest.modes.town.src));
  art.spriteRendererV11.images[`${id}:interior:base`] = await loadImage(path.resolve(root,manifest.modes.interior.src));
}
for (const manifest of Object.values(HL.DATA.shipVisualManifestsV11)) for (const layers of Object.values(manifest.layers)) for (const src of Object.values(layers)) {
  const image=await loadImage(path.resolve(root,src));art.shipRendererV11.images[src]=image;art.seaShipVisual.renderer.images[src]=image;
}
art.images.v12Tiles = await loadImage(path.resolve(root, HL.DATA.tileSetV12.atlas));
art.images.v12Objects = await loadImage(path.resolve(root, HL.DATA.objectSpritesV12.atlas));
art.ensureV12();
const v12NpcIds = [
  "owner_bella_market", "owner_bella_inn", "owner_bella_shipyard",
  "owner_bella_guild", "owner_bella_harbor", "owner_bella_bank",
  "owner_bella_mansion", "bella_guide", "bella_sailor"
];
for (const id of v12NpcIds) {
  const recipe = HL.DATA.appearanceRecipeV12(id);
  for (const src of Object.values(recipe.sheet)) {
    if (!art.spriteRendererV12.images[src]) art.spriteRendererV12.images[src] = await loadImage(path.resolve(root, src));
  }
}
for (const manifest of Object.values(HL.DATA.shipVisualManifestsV12)) for (const layers of Object.values(manifest.layers)) for (const src of Object.values(layers)) {
  const image = await loadImage(path.resolve(root, src));
  art.shipRendererV12.images[src] = image;
  art.seaShipVisual.renderer.images[src] = image;
}
let clock = 0;
global.performance = { now: () => clock };
const diffPixels = (first, second) => {
  let changed = 0;
  for (let index = 0; index < first.length; index += 4) {
    if (first[index] !== second[index] || first[index + 1] !== second[index + 1] || first[index + 2] !== second[index + 2]) changed++;
  }
  return changed;
};

for(const id of Object.keys(HL.DATA.v9Illustrations)){
  const image=assets.get(id);
  if(!image)throw new Error(`missing v9 illustration: ${id}`);
  ctx.drawImage(image,0,0,960,540);
  fs.mkdirSync(output,{recursive:true});
  fs.writeFileSync(path.join(output,`${id}.png`),canvas.toBuffer("image/png"));
}

const cutsceneGame={
  e:engine,
  s:HL.Game.freshState(),
  cutsceneDirector:new HL.V9CutsceneDirector(),
  cutscene:{id:"v9_ch2_turn",index:2,elapsed:8,reveal:true}
};
art.cutscene(cutsceneGame);
fs.writeFileSync(path.join(output,"cutscene_v9_massawa.png"),canvas.toBuffer("image/png"));

const map = HL.DATA.townMaps.bella;
const state = { currentPort: "bella", town: { x: 19.5, y: 8.4, dir: 4 }, quest: { stage: 0 } };
const game = {
  e: engine,
  s: state,
  npcs: map.npcs.map((npc, index) => ({ ...npc, dir: 2 + index * 2, animTime: index * 0.37, moving: true })),
  playerAnim: 0.35,
  playerMoving: false,
  townMap: () => map,
  townBuildings: () => map.buildings,
  questTarget: () => "shipyard"
};

fs.mkdirSync(output, { recursive: true });
art.town(game);
const frameA = ctx.getImageData(0, 0, 960, 540).data;
fs.writeFileSync(path.join(output, "town_animation_v7.png"), canvas.toBuffer("image/png"));

clock = 1400;
art.town(game);
const frameB = ctx.getImageData(0, 0, 960, 540).data;
const townChangedPixels = diffPixels(frameA, frameB);

const interiorScene = HL.DATA.interiorScenes.guild;
const interiorGame = {
  e: engine,
  s: { currentPort: "bella", interior: { id: "guild", x: 16, y: 14.6, dir: 0 } },
  playerAnim: 0.5,
  playerMoving: false,
  interiorScene: () => interiorScene,
  ownerName: () => "벨라 길드장"
};
clock = 0;
art.interior(interiorGame);
const interiorA = ctx.getImageData(0, 0, 960, 540).data;
fs.writeFileSync(path.join(output, "interior_animation_v7.png"), canvas.toBuffer("image/png"));
clock = 1400;
art.interior(interiorGame);
const interiorB = ctx.getImageData(0, 0, 960, 540).data;
const interiorChangedPixels = diffPixels(interiorA, interiorB);

const v10Scene=HL.DATA.buildingScenes.bella.guild.floors["2f"];
const v10Game={
  e:engine,
  s:{currentPort:"bella",interior:{id:"guild",buildingId:"guild",floorId:"2f",x:16,y:15.2,dir:6},v12:{enteredAt:-5000},onboarding:{enabled:true,seen:[]}},
  playerAnim:.65,playerMoving:true,
  interiorScene:()=>v10Scene,
  currentBuilding:()=>HL.DATA.buildingScenes.bella.guild,
  ownerName:()=>"리스본 길드장"
};
clock=350;art.interior(v10Game);const v10InteriorA=ctx.getImageData(0,0,960,540).data;fs.writeFileSync(path.join(output,"interior_compact_v13.png"),canvas.toBuffer("image/png"));
clock=1750;v10Game.playerAnim=1.15;art.interior(v10Game);const v10InteriorB=ctx.getImageData(0,0,960,540).data,v10InteriorChangedPixels=diffPixels(v10InteriorA,v10InteriorB);

engine.clear("#07171b");
const shipTypes=["caravel","cog","galley","brig","carrack"];
for(let row=0;row<shipTypes.length;row++)for(let dir=0;dir<8;dir++)art.shipRendererV12.draw(engine,shipTypes[row],70+dir*118,58+row*106,dir,100,.28,.48,"world",{});
fs.writeFileSync(path.join(output,"ship_directions_v12.png"),canvas.toBuffer("image/png"));

engine.clear("#162126");
for(let index=0;index<v12NpcIds.length;index++){
  const col=index%5,row=Math.floor(index/5),id=v12NpcIds[index];
  art.spriteRendererV12.draw(engine,95+col*190,190+row*245,index%8,index*.17,1.15,id,true);
  engine.text(HL.DATA.appearanceRecipeV12(id).profession,95+col*190,220+row*245,"#f1d796","center",14);
}
fs.writeFileSync(path.join(output,"npc_professions_v12.png"),canvas.toBuffer("image/png"));

const prologueState=HL.Game.freshState();prologueState.prologueState.phase="ship-deck";prologueState.prologueState.position={x:15,y:13,dir:0};
const prologueGame={e:engine,s:prologueState,playerAnim:.4,playerMoving:false,prologueScene:()=>HL.DATA.v10PrologueFloors.shipDeck};
clock=600;art.v10Prologue(prologueGame);const prologueA=ctx.getImageData(0,0,960,540).data;fs.writeFileSync(path.join(output,"prologue_ship_deck_v11.png"),canvas.toBuffer("image/png"));
clock=2100;art.v10Prologue(prologueGame);const prologueB=ctx.getImageData(0,0,960,540).data,prologueChangedPixels=diffPixels(prologueA,prologueB);

const seaState = HL.Game.freshState();
seaState.knownPorts = ["bella", "porto", "cadiz", "azur"];
seaState.sea = { ...seaState.sea, lon: -10.7, lat: 38.2, x: -10.7, y: 38.2, heading: 2, wind: 2, current: 1, depth: 180, weather: "맑음", zoom: 1 };
const seaGame = {
  e: engine,
  s: seaState,
  navigation: new HL.WorldNavigation(),
  campaignSystem: new HL.CampaignSystem()
};
seaGame.seaGrid = new HL.SeaNavigationGrid(seaGame.navigation);
seaGame.routeGuide = new HL.SeaRouteGuide(seaGame.seaGrid);
seaGame.fleetSystem = new HL.FleetSystem(seaGame.navigation, seaGame.campaignSystem);
seaGame.seaSimulation = new HL.SeaSimulation();
seaGame.fragmentSystem = new HL.FragmentSystem();
seaGame.seaSimulation.ensure(seaState);
seaGame.fragmentSystem.ensure(seaState);
seaGame.campaignSystem.ensure(seaState);
seaGame.fleetSystem.ensure(seaState);
clock = 0;
art.worldSea(seaGame);
const seaA = ctx.getImageData(0, 0, 960, 540).data;
fs.writeFileSync(path.join(output, "world_navigation_v7.png"), canvas.toBuffer("image/png"));
clock = 1400;
art.worldSea(seaGame);
const seaB = ctx.getImageData(0, 0, 960, 540).data;
const seaChangedPixels = diffPixels(seaA, seaB);

art.worldMap(seaGame);
fs.writeFileSync(path.join(output, "world_map_v7.png"), canvas.toBuffer("image/png"));

console.log(JSON.stringify({
  screenshots: ["cutscene_v9_massawa.png", "town_animation_v7.png", "interior_animation_v7.png", "interior_compact_v13.png", "ship_directions_v12.png", "npc_professions_v12.png", "prologue_ship_deck_v11.png", "world_navigation_v7.png", "world_map_v7.png"],
  townChangedPixels,
  interiorChangedPixels,
  v10InteriorChangedPixels,
  prologueChangedPixels,
  seaChangedPixels
}, null, 2));
if (!townChangedPixels || !interiorChangedPixels || !v10InteriorChangedPixels || !prologueChangedPixels || !seaChangedPixels) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
