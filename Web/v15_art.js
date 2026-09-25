window.HL=window.HL||{};
(function(){
  "use strict";
  const T=24, art=HL.Art.prototype, oldInterior=art.v10InteriorScene;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  art.ensureV15=function(){
    this.images=this.images||{};
    if(!this.images.v15Tiles){const image=new Image();image.src=HL.DATA.tileMetaV15.src;this.images.v15Tiles=image}
    if(!this.images.v15Props){const image=new Image();image.src=HL.DATA.propSpritesV15.src;this.images.v15Props=image}
    return this.images.v15Tiles.complete&&this.images.v15Tiles.naturalWidth&&this.images.v15Props.complete&&this.images.v15Props.naturalWidth
  };

  art.v15Offset=function(scene){
    return{x:Math.round((960-scene.width*T)/2),y:Math.round((540-scene.height*T)/2)}
  };

  art.drawV15Tile=function(c,id,x,y,time){
    const image=this.images.v15Tiles,index=HL.DATA.tileMetaV15.index[id]??0;
    if(image?.complete&&image.naturalWidth)c.drawImage(image,index*T,0,T,T,Math.round(x),Math.round(y),T,T);
    else{c.fillStyle=id==="water"?"#23677a":id.includes("wall")?"#574940":id.includes("wood")?"#805638":"#917456";c.fillRect(x,y,T,T)}
    if(id==="water"){
      const phase=Math.floor(time*8)%24;
      c.fillStyle="rgba(180,224,211,.48)";
      c.fillRect(x+(phase%11),y+5,8,1);
      c.fillRect(x+((phase+8)%15),y+16,6,1)
    }
  };

  art.drawV15Prop=function(c,p,time,alpha=1){
    const image=this.images.v15Props,index=HL.DATA.propSpritesV15.index[p.sprite],x=p.x*T,y=p.y*T,w=p.w*T,h=p.h*T;
    c.save();c.globalAlpha=alpha;
    if(index!=null&&image?.complete&&image.naturalWidth)c.drawImage(image,index*96,0,96,96,Math.round(x),Math.round(y),Math.round(w),Math.round(h));
    else{c.fillStyle="#765039";c.fillRect(x,y,w,h);c.strokeStyle="#bd9156";c.strokeRect(x+.5,y+.5,w-1,h-1)}
    if(p.sprite==="lantern"||p.sprite==="fireplace"){
      c.globalCompositeOperation="screen";
      const cx=x+w/2,cy=y+h*.52,r=Math.max(w,h)*(.58+Math.sin(time*3)*.02),g=c.createRadialGradient(cx,cy,1,cx,cy,r);
      g.addColorStop(0,"rgba(255,194,78,.23)");g.addColorStop(1,"rgba(255,179,57,0)");c.fillStyle=g;c.fillRect(cx-r,cy-r,r*2,r*2)
    }
    c.restore()
  };

  art.drawV15Person=function(game,scene,actor,offset,time){
    const e=game.e,c=e.ctx,isPlayer=actor.player,n=actor.npc,pos=isPlayer?game.s.interior:n;
    const x=offset.x+pos.x*T+T/2,y=offset.y+pos.y*T+20,id=isPlayer?"rian":(n.appearanceId||"citizen"),dir=pos.dir??4;
    c.save();c.translate(x,y);c.scale(.65625,.65625);c.translate(-x,-y);
    this.person(e,x,y,dir,isPlayer,id==="rian"?(game.playerAnim||0):time+(this.hash(id)%37)/11,1.15,id,isPlayer&&game.playerMoving);
    c.restore();
    if(!isPlayer&&n.name)this.renderNameplate(e,n.name,x,y-49,false,false)
  };

  art.v15InteriorScene=function(game,scene,position,actorId="rian"){
    if(!this.ensureV15()){
      const fallback=HL.DATA.v15FallbackBuildings?.[scene.facility],floor=fallback?.floors?.[scene.floorId]||fallback?.floors?.[fallback?.entryFloor];
      if(floor)return oldInterior.call(this,game,floor,position,actorId,false)
    }
    const e=game.e,c=e.ctx,time=performance.now()/1000,offset=this.v15Offset(scene);
    e.clear("#080b0c");
    c.save();
    c.fillStyle="#241d1a";c.fillRect(offset.x-18,offset.y-20,scene.width*T+36,scene.height*T+40);
    c.fillStyle="#151313";c.fillRect(offset.x-9,offset.y-10,scene.width*T+18,scene.height*T+20);
    c.translate(offset.x,offset.y);
    for(let y=0;y<scene.height;y++)for(let x=0;x<scene.width;x++)this.drawV15Tile(c,scene.tiles[y][x],x*T,y*T,time);
    for(const p of scene.props||[])if(!p.high)this.drawV15Prop(c,p,time);
    const actors=[...(scene.npcs||[]).map(n=>({npc:n,y:n.y})),{player:true,y:position.y}].sort((a,b)=>a.y-b.y);
    c.translate(-offset.x,-offset.y);
    for(const actor of actors)this.drawV15Person(game,scene,actor,offset,time);
    c.translate(offset.x,offset.y);
    for(const p of scene.props||[])if(p.high){
      const covered=position.x>p.x-.25&&position.x<p.x+p.w+.25&&position.y>p.y-.65&&position.y<p.y+p.h+.2;
      this.drawV15Prop(c,p,time,covered ? .48 : 1)
    }
    c.restore();
    const near=this.nearV10Interaction(position,scene),targetFacility=game.questTarget?.(),quest=targetFacility===scene.facility;
    if(near){const label=`Enter/Z  ${near.label}`,w=clamp(label.length*14+42,190,470);c.fillStyle=quest?"rgba(76,48,13,.96)":"rgba(4,18,22,.95)";c.fillRect(480-w/2,491,w,35);c.strokeStyle=quest?"#f2bd50":"#78948d";c.strokeRect(480-w/2+.5,491.5,w-1,34);e.text(label,480,515,quest?"#fff0ad":"#eef1df","center",14)}
    const building=game.currentBuilding?.(),entered=game.s.v12?.enteredAt||game.s.v15?.enteredAt||0;
    if(performance.now()-entered<1800){const title=`리스본 · ${building?.name||scene.facility} ${scene.floorId.toUpperCase()}`,w=clamp(title.length*20+54,250,520);c.fillStyle="rgba(3,13,16,.92)";c.fillRect(480-w/2,18,w,39);c.strokeStyle="#b8924f";c.strokeRect(480-w/2+.5,18.5,w-1,38);e.text(title,480,44,"#f2d079","center",17)}
  };

  art.v10InteriorScene=function(game,scene,position,actorId="rian",prologue=false){
    if(scene?.visual?.version===15)return this.v15InteriorScene(game,scene,position,actorId,prologue);
    return oldInterior.call(this,game,scene,position,actorId,prologue)
  };
})();
