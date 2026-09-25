'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
require('./boot_v21.js');
for(const f of ['seville_quality','seville_town','seville_trade','seville_opening'])vm.runInThisContext(fs.readFileSync(path.join(__dirname,'..',f+'.js'),'utf8'),{filename:f});
const mode=process.argv[2]||'late',pending=[],snapshots=new Map();
for(const [p,buildings]of Object.entries(HL.DATA.buildingScenes))for(const [b,building]of Object.entries(buildings))for(const [f,scene]of Object.entries(building.floors))snapshots.set([p,b,f].join(':'),scene);
const visualSnapshots=new Map(Object.entries(HL.DATA.floorVisualSetsV21).flatMap(([p,buildings])=>Object.entries(buildings).flatMap(([b,floors])=>Object.entries(floors).map(([f,scene])=>[[p,b,f].join(':'),scene]))));
const maskSnapshots=new Map(Object.entries(HL.DATA.floorCollisionMasksV21).flatMap(([p,buildings])=>Object.entries(buildings).flatMap(([b,floors])=>Object.entries(floors).map(([f,mask])=>[[p,b,f].join(':'),mask]))));
if(mode==='invalid')delete HL.DATA.buildingScenes.london.guild.floors['1f'];
const previousImage=global.Image;
global.Image=class{
  constructor(){this.naturalWidth=1672;this.naturalHeight=941}
  set src(v){this._src=v;pending.push(this)}
  get src(){return this._src}
  decode(){return mode==='decode'&&this.src.includes('reference_05')?Promise.reject(Error('simulated decode rejection')):Promise.resolve()}
};
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'../startport_interiors.js'),'utf8'),{filename:'startport_interiors'});
global.Image=previousImage;
assert.equal(HL.InteriorSceneManifest.mappings.length,11,'manifest mapping count');
assert.equal(HL.InteriorSceneManifest.saveVersion,21,'manifest save version');
const g=new HL.Game();g.e.selectedSlot=91;g.newGame('ines');
assert.equal(g.interiorScene(),snapshots.get('seville:lodge:2f'),'loading retains old scene');
for(const r of Object.values(HL.StartPortInteriors.records))if(r.status==='loading'){
  const d=r.definition,actual=HL.DATA.buildingScenes[d.port][d.facility].floors[d.floor];
  const key=r.key;assert.equal(actual,r.previous);assert.equal(actual.collision,r.previous.collision);assert.equal(actual.stairs,r.previous.stairs);assert.equal(actual.visual,r.previous.visual);
  assert.equal(HL.DATA.floorVisualSetsV21[d.port][d.facility][d.floor],visualSnapshots.get(key));assert.equal(HL.DATA.floorCollisionMasksV21[d.port][d.facility][d.floor],maskSnapshots.get(key));
}
g.s.interior.x=.1;g.s.interior.y=.1;g.s.partyFollowerState.history=[{x:.1,y:.1}];
for(const image of pending){if(mode==='error'&&image.src.includes('reference_05'))image.onerror();else image.onload()}
HL.StartPortInteriors.ready.then(()=>{
  const api=HL.StartPortInteriors,records=Object.values(api.records),failed=records.filter(r=>r.status==='error');
  assert.equal(failed.length,mode==='late'?0:1);
  if(mode==='error'||mode==='decode'){
    assert.equal(HL.DATA.buildingScenes.lume.market.floors['1f'],snapshots.get('lume:market:1f'),'failure keeps entire fallback');
    assert.equal(HL.DATA.floorVisualSetsV21.lume.market['1f'],snapshots.get('lume:market:1f'));
    assert.equal(HL.DATA.floorCollisionMasksV21.lume.market['1f'],maskSnapshots.get('lume:market:1f'));
  }
  if(mode==='invalid')assert.equal(api.errors.length,1,'invalid definition isolated');
  const scene=g.interiorScene();assert(scene.startportArt);assert(!g.collision.blocked(scene.collision,g.s.interior.x,g.s.interior.y));
  assert(g.s.partyFollowerState.history.every(p=>p.x===g.s.interior.x&&p.y===g.s.interior.y));
  for(const r of records.filter(r=>r.status==='ready')){assert.equal(HL.DATA.buildingScenes[r.definition.port][r.definition.facility].floors[r.definition.floor],r.scene);assert.equal(HL.DATA.floorCollisionMasksV21[r.definition.port][r.definition.facility][r.definition.floor],maskSnapshots.get(r.key));}
  const report=api.diagnostics.snapshot();assert.equal(report.asset.requested,mode==='invalid'?10:11);assert.equal(report.asset.pending,0);assert.equal(report.registry['lume:market:1f'].buildingScenes,mode==='error'||mode==='decode'?'previous':'candidate');
  console.log(`PASS ${mode}: ${records.length-failed.length} ready, ${failed.length} isolated, fallback geometry and late-load recovery.`);
}).catch(error=>{console.error(error);process.exitCode=1});
