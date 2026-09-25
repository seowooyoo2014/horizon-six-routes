'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
require('./boot_v21.js');
for(const file of ['seville_quality','seville_town','seville_trade','seville_opening','startport_interiors'])vm.runInThisContext(fs.readFileSync(path.join(__dirname,'..',file+'.js'),'utf8'),{filename:file});
const collision=new HL.CollisionWorld(.28),report=[];
function distance(p,r){return Math.hypot(p[0]-Math.max(r[0],Math.min(p[0],r[0]+r[2])),p[1]-Math.max(r[1],Math.min(p[1],r[1]+r[3])))}
function flood(s){const step=.25,start=s.spawn.map(v=>Math.round(v/step)*step),q=[start],seen=new Set([start.join()]);
  for(let i=0;i<q.length;i++)for(const [dx,dy]of [[step,0],[-step,0],[0,step],[0,-step]]){const p=[q[i][0]+dx,q[i][1]+dy],key=p.join();if(!seen.has(key)&&!collision.blocked(s.collision,...p)){seen.add(key);q.push(p)}}return q;
}
setImmediate(async()=>{
  await HL.StartPortInteriors.ready;
  let failures=0;
  for(const [key,r]of Object.entries(HL.StartPortInteriors.records)){
    assert.equal(r.status,'ready',`${key}: ${r.error}`);const s=r.scene,q=flood(s);
    const targets=[...s.hotspots,...s.stairs,...(s.floorId==='1f'?[s.exit]:[])];
    const missing=targets.filter(h=>!q.some(p=>distance(p,h.rect)<.8)).map(h=>({id:h.id||h.label,rect:h.rect,distance:Math.min(...q.map(p=>distance(p,h.rect)))}));
    const blockedNPCs=s.npcs.filter(n=>collision.blocked(s.collision,n.x,n.y));
    failures+=missing.length+blockedNPCs.length;
    report.push({key,reachable:q.length,missing,blockedNPCs:blockedNPCs.map(n=>n.id)});
    assert(!collision.blocked(s.collision,...s.spawn),`${key} spawn`);
    assert(collision.blocked(s.collision,.1,.1),`${key} black exterior`);
  }
  console.log(JSON.stringify(report,null,2));assert.equal(failures,0,'unreachable scene targets');
  const g=new HL.Game();g.e.selectedSlot=81;g.newGame('ines');g.beginTransition=fn=>fn();
  for(const r of Object.values(HL.StartPortInteriors.records)){
    const s=r.scene;g.s.currentPort=s.portId;g.mode=g.s.mode='interior';g.s.interior={id:s.facility,buildingId:s.facility,floorId:s.floorId,x:s.spawn[0],y:s.spawn[1],dir:4};g.startportSceneStamp=null;
    const floors=s.stairs[0]?.destinations||[];
    for(const toFloor of floors){
      if(floors.length>1)g.dispatchAction('startport-floor:'+toFloor);else g.changeFloor(s.stairs[0]);
      assert.equal(g.s.interior.floorId,toFloor,s.id+' outward stair');
      assert(!collision.blocked(g.interiorScene().collision,g.s.interior.x,g.s.interior.y),s.id+' landing');
      const back=g.interiorScene().stairs.find(l=>l.toFloor===s.floorId||(l.destinations||[]).includes(s.floorId));assert(back,s.id+' reciprocal stair');
      if(back.destinations?.length>1)g.dispatchAction('startport-floor:'+s.floorId);else g.changeFloor(back);
      assert.equal(g.s.interior.floorId,s.floorId,s.id+' return');
      assert(!collision.blocked(g.interiorScene().collision,g.s.interior.x,g.s.interior.y),s.id+' return landing');
    }
    const before={...g.s.interior},money=g.s.money,fleet=JSON.stringify(g.s.fleet);g.save();g.resume(81);
    assert.deepEqual(g.s.interior,before,s.id+' saved position');assert.equal(g.s.money,money);assert.equal(JSON.stringify(g.s.fleet),fleet);
    g.s.interior.x=.1;g.s.interior.y=.1;g.s.partyFollowerState.history=[{x:.1,y:.1}];g.ensureSafePosition();
    assert(!collision.blocked(s.collision,g.s.interior.x,g.s.interior.y),s.id+' saved black exterior repair');
    assert(g.s.partyFollowerState.history.every(p=>p.x===g.s.interior.x&&p.y===g.s.interior.y),s.id+' followers repaired');
  }
  const disconnected={spawn:[1,1],collision:{walkBounds:[0,0,8,5],solids:[[3,0,1,5]],polygons:[],doors:[]}};
  assert(!collision.blocked(disconnected.collision,6,2));assert(HL.StartPortInteriors.safe(disconnected,[6,2])[0]<3,'empty disconnected room is not safe');
  for(const captain of HL.DATA.captainsV16){
    g.e.selectedSlot=82;g.newGame(captain.id);g.beginTransition=fn=>fn();
    g.executeV10InteriorAction('v21-wake:caller');
    const facility=HL.DATA.openingWakeDefinitionsV21.openingFacility[captain.id],s=HL.DATA.buildingScenes[g.s.currentPort][facility].floors['1f'];
    g.s.interior={id:facility,buildingId:facility,floorId:'1f',x:s.spawn[0],y:s.spawn[1],dir:4};
    for(const step of ['work','news','consult','prepare']){
      assert(s.hotspots.some(h=>h.action==='v21-opening:'+step),captain.id+' hotspot '+step);
      g.executeV10InteriorAction('v21-opening:'+step);
    }
    assert(g.s.openingWakeV21.completed,captain.id+' preparation');
    const messages=[];g.e.toast=text=>messages.push(text);
    g.leaveInterior();
    if(g.s.fleet[0].crew<HL.DATA.ships[g.s.fleet[0].type].crewMin){
      const money=g.s.money;g.action('recruit');assert.equal(g.s.money,money-50,'recruitment uses real funds');
    }
    if(captain.id==='marieke')assert.equal(g.s.money,10,'merchant still starts with ten gold');
    g.setSail();if(g.mode!=='sea')g.dispatchAction('v13-confirm-sail');
    assert.equal(g.mode,'sea',captain.id+' departure: '+messages.join(' / '));
    g.save();const before=JSON.stringify(g.s.fleet);g.resume(82);assert.equal(g.mode,'sea');assert.equal(JSON.stringify(g.s.fleet),before);
  }
  console.log('PASS 11 layouts, reciprocal stairs, save restore, connected recovery and followers (Node model only).');
  console.log('PASS six opening action sequences through departure and sea-save restore (not physical input).');
  g.newGame('marieke');g.s.fleet[0].crew=8;g.save();g.resume(82);assert.equal(g.s.fleet[0].crew,8,'existing crew count is not rewritten');
});
