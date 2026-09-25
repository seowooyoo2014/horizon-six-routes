const fs=require("fs"),vm=require("vm"),path=require("path");
global.window=global;global.HL={};global.performance={now:()=>1000};
global.localStorage={data:new Map(),getItem(k){return this.data.get(k)||null},setItem(k,v){this.data.set(k,v)},removeItem(k){this.data.delete(k)}};
const root=path.resolve(__dirname,"..");
for(const file of["data.js","world_data.js","v5_data.js","collision.js","systems.js","v5_systems.js","sea_navigation_v6.js","engine.js","art.js","game.js","expansion.js","v5_art.js","legacy_animation.js","v5_expansion.js","dos_sea_v6.js","horizon_v7.js","story_v8.js","story_v9_data.js","story_v9.js","topdown_v10_data.js","topdown_v10.js"]){
  vm.runInThisContext(fs.readFileSync(path.join(root,file),"utf8"),{filename:file});
}
const failures=[],expectedFacilities=["market","inn","shipyard","guild","lodge","harbor","mansion","bank","estate","home"],two=new Set(["market","inn","lodge","guild","mansion"]);
const blocked=(floor,x,y)=>floor.collision.solids.some(r=>x+.5>=r[0]&&x+.5<r[0]+r[2]&&y+.5>=r[1]&&y+.5<r[1]+r[3]);
const reachable=floor=>{const start=[Math.floor(floor.spawn[0]),Math.floor(floor.spawn[1])],seen=new Set([start.join(",")]),queue=[start];while(queue.length){const[x,y]=queue.shift();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;if(nx<0||ny<0||nx>=32||ny>=18||seen.has(key)||blocked(floor,nx,ny))continue;seen.add(key);queue.push([nx,ny])}}return seen};
const nearRect=(seen,r,range=1)=>{for(const key of seen){const[x,y]=key.split(",").map(Number),cx=x+.5,cy=y+.5,rx=Math.max(r[0],Math.min(cx,r[0]+r[2])),ry=Math.max(r[1],Math.min(cy,r[1]+r[3]));if(Math.hypot(cx-rx,cy-ry)<=range)return true}return false};

if(HL.DATA.version!==10)failures.push(`version ${HL.DATA.version}`);
if(Object.keys(HL.DATA.buildingScenes).length!==120)failures.push("building port count");
if(JSON.stringify(HL.DATA.buildingScenes.bella.market.floors["1f"].props)===JSON.stringify(HL.DATA.buildingScenes.lume.market.floors["1f"].props))failures.push("port seed does not vary layouts");
for(const portId of HL.DATA.portOrder){
  const group=HL.DATA.buildingScenes[portId];
  for(const facility of expectedFacilities){
    const building=group?.[facility];if(!building){failures.push(`${portId}:${facility} missing`);continue}
    const floorIds=Object.keys(building.floors);if(floorIds.length!==(two.has(facility)?2:1))failures.push(`${portId}:${facility} floor count`);
    for(const floor of Object.values(building.floors)){
      if(floor.width!==32||floor.height!==18||floor.tiles.length!==18||floor.tiles.some(row=>row.length!==32))failures.push(`${floor.id} dimensions`);
      if(blocked(floor,Math.floor(floor.spawn[0]),Math.floor(floor.spawn[1])))failures.push(`${floor.id} blocked spawn`);
      const seen=reachable(floor);if(!nearRect(seen,floor.exit.rect,1.1))failures.push(`${floor.id} exit unreachable`);
      for(const stair of floor.stairs||[])if(!nearRect(seen,stair.rect,1.1))failures.push(`${floor.id}:${stair.id} unreachable`);
      for(const hot of floor.hotspots||[])if(!nearRect(seen,hot.rect,1.6))failures.push(`${floor.id}:${hot.id} unreachable`)
    }
  }
}
const v9=HL.Game.freshState();v9.version=9;v9.money=7777;v9.bank.balance=333;v9.mode="interior";v9.interior={id:"market",x:7,y:14,dir:2};v9.fragmentBoard.owned=["f01"];
const migrated=HL.migrateStateV10(v9);
if(migrated.version!==10||migrated.money!==7777||migrated.bank.balance!==333||migrated.fragmentBoard.owned[0]!=="f01")failures.push("v9 values not preserved");
if(migrated.interior.floorId!=="1f"||migrated.interior.x!==16||migrated.interior.y!==15)failures.push("v9 interior conversion");
const fresh=HL.Game.freshState();if(fresh.prologueState.phase!=="dark-damian"||fresh.prologueState.actorId!=="damian"||fresh.prologueState.completed)failures.push("fresh prologue state");
if(!HL.DATA.appearances.bella_sailor||HL.DATA.appearances.bella_sailor.spriteSheet===HL.DATA.appearances.orso.spriteSheet)failures.push("prologue crew appearances are not distinct");
const bella=HL.DATA.buildingScenes.bella.mansion.floors["2f"],labels=bella.hotspots.map(h=>h.label);
for(const label of["압류 통지서","어머니의 유품","항해학교 통지","오래된 가족 해도"])if(!labels.includes(label))failures.push(`missing room clue ${label}`);
console.log(JSON.stringify({version:HL.DATA.version,ports:Object.keys(HL.DATA.buildingScenes).length,floors:Object.values(HL.DATA.buildingScenes).reduce((n,g)=>n+Object.values(g).reduce((m,b)=>m+Object.keys(b.floors).length,0),0),failures:failures.slice(0,30),failureCount:failures.length},null,2));
if(failures.length)process.exitCode=1;
