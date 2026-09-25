const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
require('./boot_v21.js');
for(const name of ['seville_quality.js','seville_town.js'])vm.runInThisContext(fs.readFileSync(path.join(__dirname,'..',name),'utf8'));
setImmediate(()=>{
  const m=HL.DATA.sevilleTownQuality,c=new HL.CollisionWorld(.28),step=.25,start=m.spawn.map(v=>Math.round(v/step)*step),queue=[start],seen=new Set([start.join(',')]);
  assert(!c.blocked(m.collision,...m.spawn));
  for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]]){const nx=x+dx,ny=y+dy,k=[nx,ny].join(',');if(!seen.has(k)&&!c.blocked(m.collision,nx,ny)){seen.add(k);queue.push([nx,ny])}}}
  for(const b of m.buildings){assert(!c.blocked(m.collision,...b.door),`${b.id} threshold blocked`);assert(!c.blocked(m.collision,b.door[0],b.door[1]+.72),`${b.id} exit blocked`);assert(queue.some(p=>Math.hypot(p[0]-b.door[0],p[1]-b.door[1])<.5),`${b.id} unreachable`)}
  for(const n of m.npcs)assert(!c.blocked(m.collision,n.x,n.y),`NPC ${n.id}`);
  assert(c.blocked(m.collision,2,34),'seawater');assert(c.blocked(m.collision,32,4),'roof');
  assert.equal(m.buildings.length,10,'source has all ten doors');
  assert.equal(m.visual.sourceSize.join('x'),'1672x941');
  assert.equal(m.visual.nativeSize.join('x'),'1920x1080');
  console.log(JSON.stringify({doors:m.buildings.length,npcs:m.npcs.length,reachable:queue.length,roundTrips:'PASS',runtimeGate:'seville_town_runtime.js'}));
});
