const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
require('./boot_v21.js');
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'../seville_quality.js'),'utf8'));
setImmediate(()=>{
  const collision=new HL.CollisionWorld(.28),report=[];
  for(const [id,s] of Object.entries(HL.DATA.sevilleQualityLayouts)){
    assert(!collision.blocked(s.collision,...s.spawn),`${id}: spawn`);
    const step=.25,start=s.spawn.map(v=>Math.round(v/step)*step),queue=[start],seen=new Set([start.join(',')]);
    for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]]){const a=x+dx,b=y+dy,k=[a,b].join(',');if(!seen.has(k)&&!collision.blocked(s.collision,a,b)){seen.add(k);queue.push([a,b])}}}
    for(const target of [...s.hotspots,...s.stairs,...(s.quality.exit?[s.exit]:[])]){
      const r=target.rect,dist=([x,y])=>Math.hypot(x-Math.max(r[0],Math.min(x,r[0]+r[2])),y-Math.max(r[1],Math.min(y,r[1]+r[3])));
      assert(queue.some(p=>dist(p)<1),`${id}: unreachable ${target.id||target.label||'exit'}`);
    }
    assert(collision.blocked(s.collision,.5,.5),`${id}: black exterior`);
    for(const r of s.quality.blocks)assert(collision.blocked(s.collision,(r[0]+r[2]/2)/24,(r[1]+r[3]/2)/24),`${id}: furniture`);
    for(const n of s.npcs)assert(!collision.blocked(s.collision,n.x,n.y),`${id}: NPC ${n.id}`);
    report.push({id,reachable:queue.length,hotspots:s.hotspots.length});
  }
  const g=new HL.Game();g.e.selectedSlot=98;g.newGame('ines');g.beginTransition=f=>f();
  assert.equal(g.interiorScene().quality.title,'세리아의 방');
  assert(!collision.blocked(g.interiorScene().collision,g.s.interior.x,g.s.interior.y));
  g.changeFloor(g.interiorScene().stairs[0]);assert.equal(g.s.interior.floorId,'1f');
  g.changeFloor(g.interiorScene().stairs.find(s=>s.toFloor==='2f'));assert.equal(g.s.interior.floorId,'2f');
  assert(!collision.blocked(g.interiorScene().collision,g.s.interior.x,g.s.interior.y));
  g.s.interior={id:'guild',buildingId:'guild',floorId:'1f',x:20,y:19.5,dir:4};
  for(const floor of ['2f','b1']){g.dispatchAction(`seville-floor:${floor}`);assert.equal(g.s.interior.floorId,floor);assert(!collision.blocked(g.interiorScene().collision,g.s.interior.x,g.s.interior.y));g.changeFloor(g.interiorScene().stairs[0]);assert.equal(g.s.interior.floorId,'1f')}
  g.save();const before={...g.s.interior};g.resume(98);assert.deepEqual(g.s.interior,before);
  g.s.interior.x=1;g.s.interior.y=1;g.ensureSafePosition();assert(!collision.blocked(g.interiorScene().collision,g.s.interior.x,g.s.interior.y));
  console.log(JSON.stringify(report,null,2));
});
