window.HL=window.HL||{};
(function(){
  "use strict";
  const D=HL.DATA,art=HL.Art.prototype,oldTown=art.town,oldInterior=art.v10InteriorScene,TT=30,IT=24;
  const pixel=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
  art.ensureV21=function(){this.ensureV20();this.assetLoadStateV21=this.assetLoadStateV21||{}};
  const ART_REV="21-interiors-20260913-2",isNode=typeof process!=="undefined"&&!!process.versions?.node;
  // Native Node image fakes commonly resolve paths literally; browser requests retain the revision.
  const cacheSrc=src=>{if(!src||isNode)return src;return src.includes("?")?`${src}&v=${ART_REV}`:`${src}?v=${ART_REV}`};
  art.v21Image=function(src){this.ensureV21();if(this.assetLoadStateV21[src])return this.assetLoadStateV21[src];const image=new Image(),requestedSource=cacheSrc(src),record={image,status:"loading",error:null,source:src,requestedSource};this.assetLoadStateV21[src]=record;const ready=()=>{record.status="ready"},fail=e=>{record.status="error";record.error=String(e?.message||e||"load failed")};image.onload=ready;image.onerror=fail;image.src=requestedSource;if(image.decode)image.decode().then(ready).catch(()=>{if(!image.complete)fail("decode failed")});else if((image.naturalWidth||image.width)>0)ready();return record};
  art.v21Town=function(game,map){
    const e=game.e,c=e.ctx,time=performance.now()/1000,cam=this.v19Camera(map,game.s.town),bg=this.v21Image(map.visual.background),fg=this.v21Image(map.visual.foreground);e.clear("#040708");c.imageSmoothingEnabled=false;
    if(bg.status!=="ready")return this.v20Town(game,map);
    c.drawImage(bg.image,cam.x,cam.y,960,540,0,0,960,540);
    // The water movement is restrained and remains aligned to the 30 px town grid.
    const wr=map.water,wy=wr[1]*TT-cam.y,wx=wr[0]*TT-cam.x,ww=wr[2]*TT,wh=wr[3]*TT;c.save();c.beginPath();c.rect(wx,wy,ww,wh);c.clip();for(let y=wy+8;y<wy+wh;y+=14){const off=(Math.floor(time*12)+y+map.seed)%48;for(let x=wx+off;x<wx+ww;x+=62)pixel(c,x,y,24,2,"rgba(116,190,198,.62)")}c.restore();
    const followers=(game.s.partyFollowerState?.render||[]).map(q=>({q,y:q.y})),actors=[...game.npcs.map(q=>({q,y:q.y})),...followers,{q:game.s.town,y:game.s.town.y,player:true}].sort((a,b)=>a.y-b.y);
    for(const a of actors){const q=a.q,id=a.player?game.s.captainId:(q.appearanceId||q.id);c.save();c.globalAlpha=1;this.drawActorV19(c,id,q.x*TT+TT/2-cam.x,q.y*TT+25-cam.y,q.dir??4,a.player?game.playerMoving:!!q.moving,a.player?game.playerAnim:(q.animTime||time),1);c.restore()}
    if(fg.status==="ready"){c.save();c.globalAlpha=1;c.drawImage(fg.image,cam.x,cam.y,960,540,0,0,960,540);c.restore()}
    const target=game.questTarget?.();for(const b of game.townBuildings()){if(b.id!==target)continue;const x=b.door[0]*TT-cam.x,y=b.door[1]*TT-cam.y-45;pixel(c,x-54,y,108,27,"rgba(49,31,16,.96)");c.strokeStyle="#efc052";c.strokeRect(x-53.5,y+.5,107,26);e.text(`◆ ${b.name}`,x,y+18,"#fff0ad","center",13)}e.text(`${D.ports[game.s.currentPort].name} · 항구 지구`,14,521,"#fff0bd","left",15)
  };
  art.town=function(game){const map=game.townMap();if(map?.visual?.version===21)return this.v21Town(game,map);return oldTown.call(this,game)};
  art.v21Interior=function(game,scene,pos){
    const e=game.e,c=e.ctx,time=performance.now()/1000,bg=this.v21Image(scene.visual.background),fg=this.v21Image(scene.visual.foreground);e.clear("#020304");c.imageSmoothingEnabled=false;if(bg.status!=="ready"){if(scene.fallbackVisualV20)return oldInterior.call(this,game,scene.fallbackVisualV20,pos,game.s.captainId,false);c.fillStyle="#173b40";c.fillRect(36,36,888,468);return}c.drawImage(bg.image,0,0,960,540);
    const actors=[...(scene.npcs||[]).map(n=>({q:n,y:n.y})),...(game.s.partyFollowerState?.render||[]).map(q=>({q,y:q.y})),{q:pos,y:pos.y,player:true}].sort((a,b)=>a.y-b.y);
    for(const actor of actors){const q=actor.q,id=actor.player?game.s.captainId:(q.appearanceId||q.id);c.save();c.globalAlpha=1;this.drawV20Actor(c,id,q.x*IT,q.y*IT+7,q.dir??4,actor.player?game.playerMoving:!!q.moving,actor.player?game.playerAnim:(q.anim||time),actor.player);c.restore()}
    if(fg.status==="ready"){const close=(scene.collision.solids||[]).some(r=>pos.x>r[0]-.3&&pos.x<r[0]+r[2]+.3&&pos.y>r[1]-.2&&pos.y<r[1]+r[3]+1.7);c.save();c.globalAlpha=close?.48:1;c.drawImage(fg.image,0,0,960,540);c.restore()}
    const near=this.nearV10Interaction(pos,scene);if(near){const label=`Enter/Z  ${near.label}`,w=Math.min(510,Math.max(190,label.length*14+38));pixel(c,480-w/2,493,w,34,"rgba(3,13,16,.96)");c.strokeStyle="#dfb85d";c.strokeRect(480-w/2+.5,493.5,w-1,33);e.text(label,480,516,"#fff0b5","center",14)}
    pixel(c,14,14,460,42,"rgba(3,12,15,.92)");c.strokeStyle="#a87f42";c.strokeRect(14.5,14.5,459,41);e.text(`${D.ports[game.s.currentPort]?.name||""} · ${game.currentBuilding()?.name||scene.facility} ${scene.floorId.toUpperCase()}`,30,41,"#f1d18b","left",16);
    const wake=game.s.openingWakeV21;if(wake&&!wake.completed&&wake.reveal<1){c.save();c.globalAlpha=1-wake.reveal;pixel(c,0,0,960,540,"#000");c.restore();if(wake.reveal>.18&&!wake.heardCall)e.text(`“${D.openingWakeDefinitionsV21.calls[game.s.captainId].wake}”`,480,455,"#f1dfbd","center",17)}
  };
  art.v10InteriorScene=function(game,scene,pos,actorId,prologue){if(scene?.visual?.version===21)return this.v21Interior(game,scene,pos);return oldInterior.call(this,game,scene,pos,actorId,prologue)};
})();
