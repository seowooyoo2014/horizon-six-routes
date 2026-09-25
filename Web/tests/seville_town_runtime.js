const assert=require("assert"),fs=require("node:fs"),{createCanvas}=require("@napi-rs/canvas");
const {bootHtmlOrder}=require("./offline_html_order_harness.js");
const harness=bootHtmlOrder();

async function waitForImage(){
  for(let i=0;i<200&&HL.DATA.sevilleTownIntegration.asset.status==="loading";i++)await new Promise(resolve=>setTimeout(resolve,20));
}
function connectedPoints(map){
  const world=new HL.CollisionWorld(.28),step=.25,start=map.spawn.map(value=>Math.round(value/step)*step),queue=[start],seen=new Set([start.join(",")]);
  for(let i=0;i<queue.length;i++){
    const [x,y]=queue[i];
    for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]]){
      const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;
      if(!seen.has(key)&&!world.blocked(map.collision,nx,ny)){seen.add(key);queue.push([nx,ny])}
    }
  }
  return queue;
}
function hasNear(points,target,r=.5){return points.some(point=>Math.hypot(point[0]-target[0],point[1]-target[1])<r)}

(async()=>{
  const before=HL.DATA.townDefinitionsV19.seville,oldVisual=before.visual,oldCollision=before.collision,oldTownCount=Object.keys(HL.DATA.townDefinitionsV19).length;
  const otherTownReferences=new Map(Object.entries(HL.DATA.townDefinitionsV19).filter(([id])=>id!=='seville'));
  const otherTownSnapshots=new Map([...otherTownReferences].map(([id,definition])=>[id,JSON.stringify(definition)]));
  const savedSlots=new Map(localStorage.data);
  const game=new HL.Game();
  game.e.canvas=harness.canvas;game.e.ctx=harness.canvas.getContext("2d");
  game.s=HL.Game.freshState();game.s.slot=73;game.s.captainId="ines";game.s.slot=73;game.s.currentPort="seville";game.s.mode="town";game.s.town={x:1,y:1,dir:4};game.s.partyFollowerState={active:[],history:[{x:1,y:1}],spacing:.72,render:[{id:"follower",appearanceId:"seville_guide",x:1,y:1}]};game.mode="town";game.spawnTownNpcs();
  game.renderTown();
  assert.equal(HL.DATA.sevilleTownIntegration.asset.status,"loading","new town remains gated while loading");
  assert.strictEqual(before.visual,oldVisual,"old visual stays live during load");
  assert.strictEqual(before.collision,oldCollision,"old collision stays live during load");
  await waitForImage();
  game.renderTown();

  const map=HL.DATA.townDefinitionsV19.seville,quality=HL.DATA.sevilleTownIntegration;
  assert.equal(quality.asset.status,"ready");
  assert.equal(quality.asset.committed,true,JSON.stringify(quality.validation));
  assert.equal(quality.asset.image.width,1672);assert.equal(quality.asset.image.height,941);
  assert.equal(map.width,64);assert.equal(map.height,36);
  assert.deepEqual(map.visual.sourceSize,[1672,941]);assert.deepEqual(map.visual.nativeSize,[1920,1080]);
  const approvedForegroundIds=["plaza-nw","plaza-east-upper","plaza-west-middle","plaza-east-middle","plaza-east-outer","plaza-sw","home-west-tree","southwest-tree","harbor-west-tree","harbor-east-tree","market-west-canvas","market-upper-canvas","market-east-canvas","market-farwest-canvas"];
  assert.deepEqual(map.visual.foreground.map(object=>object.id),approvedForegroundIds,"only Astra-approved foreground cutouts are integrated");assert.equal(quality.asset.foreground.length,approvedForegroundIds.length,"all approved foreground images decoded");
  assert.equal(quality.riverBoundaryPx,806);assert.equal(Object.keys(HL.DATA.townDefinitionsV19).length,oldTownCount,"town count preserved");
  assert.equal(game.s.version,21);assert.equal(game.s.slot,73,"save slot is untouched");
  for(const [id,definition] of otherTownReferences){assert.strictEqual(HL.DATA.townDefinitionsV19[id],definition,`${id} town definition preserved`);assert.equal(JSON.stringify(definition),otherTownSnapshots.get(id),`${id} town definition deep snapshot preserved`)}
  assert.deepEqual(new Map(localStorage.data),savedSlots,"original save slots are untouched");

  const world=new HL.CollisionWorld(.28),points=connectedPoints(map);
  assert(points.length>1000,"spawn has a connected walkable region");assert(!world.blocked(map.collision,...map.spawn));
  for(const building of map.buildings){
    assert(!world.blocked(map.collision,...building.door),`${building.id} threshold walkable`);
    assert(!world.blocked(map.collision,building.door[0],building.door[1]+.72),`${building.id} return landing walkable`);
    assert(hasNear(points,building.door),`${building.id} connected to spawn`);
  }
  for(const building of map.qualityGeometry.buildings){
    const [x,y,w,h]=building.rect,center=[(x+w/2)*64/1672,(y+h/2)*36/941];
    assert(world.blocked(map.collision,...center),`${building.id} interior remains blocked`);
    const frontageY=(building.door[1]-29)*36/941,offset=26*64/1672;
    assert(world.blocked(map.collision,(building.door[0]-26)*64/1672,frontageY),`${building.id} left frontage remains blocked`);
    assert(world.blocked(map.collision,(building.door[0]+26)*64/1672,frontageY),`${building.id} right frontage remains blocked`);
  }
  assert(world.blocked(map.collision,2,34),"river is blocked away from pier");
  assert(!world.blocked(map.collision,32,32.5),"visible pier remains walkable");
  assert(!world.blocked(map.collision,map.dock[0]+map.dock[2]/2,map.dock[1]+map.dock[3]/2),"dock center is valid");
  assert(world.blocked(map.collision,32,16),"fountain/plaza object area remains blocked");
  for(const [x,y,label] of [[120,245,"bank facade"],[1100,245,"guild facade"],[1420,245,"lodge facade"]])assert(world.blocked(map.collision,x*64/1672,y*36/941),`${label} remains blocked`);
  assert(world.blocked(map.collision,1000*64/1672,263*36/941),"main road upper edge remains blocked");
  assert(!world.blocked(map.collision,1000*64/1672,286*36/941),"main road clearance remains walkable");
  assert(world.blocked(map.collision,1300*64/1672,278*36/941),"harbor projection blocks direct upper crossing");
  for(const [x,y,label] of [[1315,525,"harbor barrel"],[1350,530,"harbor blue crates"],[1430,529,"harbor brown crates"]])assert(world.blocked(map.collision,x*64/1672,y*36/941),`${label} ground footprint remains blocked`);
  assert(!world.blocked(map.collision,1280*64/1672,544*36/941),"harbor return steps remain walkable");
  for(const npc of map.npcs)assert(!world.blocked(map.collision,npc.x,npc.y),`NPC ${npc.id} safe`);
  for(const npc of game.npcs)assert(!world.blocked(map.collision,npc.x,npc.y),`live NPC ${npc.id} safe`);
  assert(game.s.partyFollowerState.history.every(actor=>!world.blocked(map.collision,actor.x,actor.y)),"followers reset to safe history");
  game.beginTransition=callback=>callback();game.e.close=()=>{};game.e.sfx=()=>{};game.save=()=>{};
  for(const building of map.buildings){
    game.mode='town';game.s.mode='town';game.s.currentPort='seville';game.s.town={x:building.door[0],y:building.door[1],dir:4};
    game.enterInterior(building.id);assert.equal(game.s.interior.id,building.id,`${building.id} entered`);
    game.leaveInterior();assert.equal(game.mode,'town',`${building.id} returned`);assert(!world.blocked(map.collision,game.s.town.x,game.s.town.y),`${building.id} return landing walkable`);
  }
  const continuous=[map.spawn[0]+.13,map.spawn[1]];game.s.town={x:continuous[0],y:continuous[1],dir:4};game.ensureSafePosition();assert.equal(game.s.town.x,continuous[0],"connected position is not snapped");
  const captureDirs=["/private/tmp/seville_town_runtime_captures","/Users/seol-eunjin/Documents/game/HorizonLedger_Unity/Docs/Screenshots/SevilleTown/GameRenderTown"];
  for(const directory of captureDirs)fs.mkdirSync(directory,{recursive:true});
  const writeCapture=(name,buffer)=>{for(const directory of captureDirs)fs.writeFileSync(`${directory}/${name}`,buffer);return `${captureDirs[1]}/${name}`};
  const assertSourceFrame=(ctx,width,height,label)=>{
    const reference=createCanvas(width,height),referenceCtx=reference.getContext("2d"),camera=game.art.v19Camera(map,game.s.town),sourceX=(camera.x-quality.contain.offset[0])/quality.contain.scale,sourceY=(camera.y-quality.contain.offset[1])/quality.contain.scale;
    referenceCtx.scale(width/960,height/540);referenceCtx.imageSmoothingEnabled=false;referenceCtx.drawImage(quality.asset.image,sourceX,sourceY,960/quality.contain.scale,540/quality.contain.scale,0,0,960,540);
    const probeX=Math.round(width*100/960),probeY=Math.round(height*100/540),actual=Array.from(ctx.getImageData(probeX,probeY,1,1).data),expected=Array.from(referenceCtx.getImageData(probeX,probeY,1,1).data);
    assert.deepEqual(actual,expected,`${label} contains the committed source image: actual ${actual} expected ${expected}`);
  };
  const captures=[];
  for(const [width,height] of [[1280,720],[1920,1080],[2880,1620]]){
    const capture=createCanvas(width,height),ctx=capture.getContext("2d");ctx.scale(width/960,height/540);game.e.canvas=capture;game.e.ctx=ctx;game.renderTown();
    const pixels=ctx.getImageData(0,0,width,height).data,nonBlank=Array.from(pixels).some((value,index)=>index%4===3&&value>0);assert(nonBlank,`Game.renderTown produced ${width}x${height} pixels`);
    assertSourceFrame(ctx,width,height,`${width}x${height} capture`);
    captures.push(writeCapture(`seville_town_${width}x${height}.png`,capture.toBuffer("image/png")));
    if(width===1920){
      const overlay=createCanvas(width,height),overlayCtx=overlay.getContext("2d");overlayCtx.drawImage(capture,0,0);const cam=game.art.v19Camera(map,game.s.town);overlayCtx.save();overlayCtx.scale(width/960,height/540);overlayCtx.translate(-cam.x,-cam.y);overlayCtx.fillStyle="rgba(214,38,48,.26)";for(const rect of map.collision.solids)overlayCtx.fillRect(rect[0]*30,rect[1]*30,rect[2]*30,rect[3]*30);for(const polygon of map.collision.polygons||[]){overlayCtx.beginPath();polygon.forEach(([x,y],index)=>index?overlayCtx.lineTo(x*30,y*30):overlayCtx.moveTo(x*30,y*30));overlayCtx.closePath();overlayCtx.fill()}overlayCtx.restore();
      writeCapture("seville_town_collision_overlay_1920x1080.png",overlay.toBuffer("image/png"));
    }
  }
  const focusCaptures=[];
  for(const id of ["guild","lodge","harbor"]){
    const building=map.buildings.find(candidate=>candidate.id===id);assert(building,`${id} focus building exists`);
    game.s.town={x:building.door[0],y:building.door[1]+.72,dir:4};game.ensureSafePosition();
    const width=1920,height=1080,capture=createCanvas(width,height),ctx=capture.getContext("2d");ctx.scale(width/960,height/540);game.e.canvas=capture;game.e.ctx=ctx;game.renderTown();
    assertSourceFrame(ctx,width,height,`${id} upper-street capture`);
    const baseName=`seville_town_${id}_upper_1920x1080`,capturePath=writeCapture(`${baseName}.png`,capture.toBuffer("image/png"));
    const overlay=createCanvas(width,height),overlayCtx=overlay.getContext("2d");overlayCtx.drawImage(capture,0,0);const cam=game.art.v19Camera(map,game.s.town);overlayCtx.save();overlayCtx.scale(width/960,height/540);overlayCtx.translate(-cam.x,-cam.y);overlayCtx.fillStyle="rgba(214,38,48,.26)";for(const rect of map.collision.solids)overlayCtx.fillRect(rect[0]*30,rect[1]*30,rect[2]*30,rect[3]*30);for(const polygon of map.collision.polygons||[]){overlayCtx.beginPath();polygon.forEach(([x,y],index)=>index?overlayCtx.lineTo(x*30,y*30):overlayCtx.moveTo(x*30,y*30));overlayCtx.closePath();overlayCtx.fill()}overlayCtx.restore();
    focusCaptures.push({id,capture:capturePath,collisionOverlay:writeCapture(`${baseName}_collision_overlay.png`,overlay.toBuffer("image/png"))});
  }
  for(const [id,definition] of otherTownReferences)assert.equal(JSON.stringify(definition),otherTownSnapshots.get(id),`${id} town definition deep snapshot preserved after captures`);
  console.log(JSON.stringify({scriptOrder:harness.scriptFiles.slice(-5),asset:quality.asset.status,committed:quality.asset.committed,source:map.visual.sourceSize,target:map.visual.nativeSize,riverBoundaryPx:quality.riverBoundaryPx,doors:map.buildings.length,npcs:map.npcs.length,reachable:points.length,captures,collisionOverlay:`${captureDirs[1]}/seville_town_collision_overlay_1920x1080.png`,focusCaptures,roundTrips:'PASS',preserved:{otherTowns:otherTownReferences.size,deepTownSnapshots:true,saveSlots:true},save:{version:game.s.version,slot:game.s.slot}},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
