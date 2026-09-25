window.HL=window.HL||{};
(function(){
  "use strict";
  const T=30,art=HL.Art.prototype,main=new Set(["rian","damian","orso","mira","vardo"]),oldPerson=art.person,oldScene=art.v10InteriorScene;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  class SpriteRendererV12{
    constructor(owner){this.owner=owner;this.images={};this.buffers={}}
    image(src){if(this.images[src])return this.images[src];const image=new Image();image.src=src;this.images[src]=image;return image}
    draw(e,x,y,dir,anim,scale,id,moving){
      const mode=scale>1.05?"interior":"town",recipe=HL.DATA.appearanceRecipeV12(id),src=recipe.sheet[mode],image=this.image(src),fw=mode==="interior"?64:48,fh=mode==="interior"?96:72,sequence=moving?[4,5,6,7,8,9]:[0,1,2,3],fps=moving?10:3,frame=sequence[Math.floor(anim*fps)%sequence.length],sx=frame*fw,sy=((dir+8)%8)*fh,bob=moving?Math.round(Math.sin(anim*Math.PI*2)):0,dx=Math.round(x-fw/2),dy=Math.round(y-fh+4+bob);
      const c=e.ctx;c.fillStyle="rgba(2,8,10,.38)";c.beginPath();c.ellipse(Math.round(x),Math.round(y+2),mode==="interior"?17:13,mode==="interior"?6:5,0,0,Math.PI*2);c.fill();
      if(!image.complete||!image.naturalWidth){oldPerson.call(this.owner,e,x,y,dir,false,anim,scale,id,moving);return}
      const key=`${id}:${mode}:${dir}:${frame}`;let buffer=this.buffers[key];if(!buffer){buffer=this.buffers[key]=document.createElement("canvas");buffer.width=fw;buffer.height=fh;const b=buffer.getContext("2d"),u=fw/48,v=fh/72;b.imageSmoothingEnabled=false;b.drawImage(image,sx,sy,fw,fh,0,0,fw,fh);b.globalCompositeOperation="source-atop";b.fillStyle=(recipe.palette[recipe.paletteIndex%recipe.palette.length]||recipe.palette[0])+"26";b.fillRect(Math.floor(fw*.18),Math.floor(fh*.34),Math.floor(fw*.64),Math.floor(fh*.46));b.fillStyle=recipe.palette[(recipe.paletteIndex+2)%recipe.palette.length];if(recipe.accessory%3===0)b.fillRect(Math.round(fw*.34),Math.round(fh*.48),Math.max(1,Math.round(2*u)),Math.round(9*v));else if(recipe.accessory%3===1)b.fillRect(Math.round(fw*.62),Math.round(fh*.51),Math.max(1,Math.round(2*u)),Math.round(7*v));b.globalCompositeOperation="source-over"}
      c.drawImage(buffer,dx,dy)
    }
  }
  class ShipRendererV12{
    constructor(){this.images={}}
    image(src){if(this.images[src])return this.images[src];const image=new Image();image.src=src;this.images[src]=image;return image}
    draw(e,type,x,y,heading,hull=100,time=0,scale=1,size="world",equipment={}){
      const manifest=HL.DATA.shipVisualManifestsV12[type]||HL.DATA.shipVisualManifestsV12.caravel,m=manifest[size],layers=manifest.layers[size],damaged=hull<45,phase=Math.floor(time*4)%4,sx=(((heading||0)+8)%8*4+phase)*m.frameWidth,bob=Math.round(Math.sin(time*2.3+(heading||0))*(size==="battle"?3:2)),dw=Math.round(m.frameWidth*scale),dh=Math.round(m.frameHeight*scale),dx=Math.round(x-dw/2),dy=Math.round(y-dh*.57+bob),c=e.ctx;
      const draw=src=>{const image=this.image(src);if(image.complete&&image.naturalWidth)c.drawImage(image,sx,0,m.frameWidth,m.frameHeight,dx,dy,dw,dh)};
      draw(damaged?layers.hullDamaged:layers.hull);draw(damaged?layers.sailsDamaged:layers.sails);draw(layers.equipment);
      if(equipment?.armor&&equipment.armor!=="none"){c.strokeStyle="rgba(177,184,178,.8)";c.lineWidth=Math.max(1,Math.round(scale*2));c.beginPath();c.ellipse(x,y+10*scale,20*scale,34*scale,0,0,Math.PI*2);c.stroke()}
      if(equipment?.figurehead&&equipment.figurehead!=="none"){const d=HL.DATA.directions[heading]||[0,-1];c.fillStyle=equipment.figurehead==="dragon"?"#e7b84d":"#86c8bd";c.fillRect(Math.round(x+d[0]*48*scale-3),Math.round(y+d[1]*48*scale-3),Math.max(4,Math.round(6*scale)),Math.max(4,Math.round(6*scale)))}return true
    }
  }
  art.ensureV12=function(){
    if(!this.spriteRendererV12)this.spriteRendererV12=new SpriteRendererV12(this);if(!this.shipRendererV12)this.shipRendererV12=new ShipRendererV12();
    if(!this.images.v12Tiles){const image=new Image();image.src=HL.DATA.tileSetV12.atlas;this.images.v12Tiles=image}
    if(!this.images.v12Objects){const image=new Image();image.src=HL.DATA.objectSpritesV12.atlas;this.images.v12Objects=image}
  };
  art.person=function(e,x,y,dir=4,hero=false,anim=0,scale=1,appearanceId="citizen",moving=false){this.ensureV12();if(hero||main.has(appearanceId)||HL.UserAssetStore?.overrides?.[appearanceId])return oldPerson.call(this,e,x,y,dir,hero,anim,scale,appearanceId,moving);return this.spriteRendererV12.draw(e,x,y,dir,anim,scale,appearanceId,moving)};
  art.drawV12Tile=function(c,row,tile,x,y){this.ensureV12();const image=this.images.v12Tiles,index=HL.DATA.tileSetV12.tileIndex[tile]??0;if(image.complete&&image.naturalWidth)c.drawImage(image,index*T,row*T,T,T,Math.round(x),Math.round(y),T,T);else{c.fillStyle=tile.startsWith("wall")?"#49352c":tile.startsWith("water")?"#24677a":"#94704d";c.fillRect(x,y,T,T)}};
  art.drawV12Object=function(c,scene,p,time,alpha=1){this.ensureV12();const image=this.images.v12Objects,index=HL.DATA.objectSpritesV12.index[p.sprite],x=p.x*T,y=p.y*T,w=p.w*T,h=p.h*T;c.save();c.globalAlpha=alpha;if(index!=null&&image.complete&&image.naturalWidth)c.drawImage(image,index*128,0,128,128,Math.round(x),Math.round(y),Math.round(w),Math.round(h));else{c.fillStyle="#725036";c.fillRect(x,y,w,h)}if(p.sprite==="lantern"){c.globalCompositeOperation="screen";const g=c.createRadialGradient(x+w/2,y+h*.45,2,x+w/2,y+h*.45,w*.7);g.addColorStop(0,`rgba(255,207,104,${.18+Math.sin(time*3)*.03})`);g.addColorStop(1,"rgba(255,196,80,0)");c.fillStyle=g;c.fillRect(x-w*.3,y-h*.2,w*1.6,h*1.5)}c.restore()};
  art.v12Camera=function(scene,position){const maxX=Math.max(0,scene.width*T-960),maxY=Math.max(0,scene.height*T-540),targetX=position.x*T-480,targetY=position.y*T-300;return{x:Math.round(clamp(targetX,0,maxX)),y:Math.round(clamp(targetY,0,maxY))}};
  art.v12InteriorScene=function(game,scene,position,actorId="rian",prologue=false){
    this.ensureV12();const e=game.e,c=e.ctx,time=performance.now()/1000,camera=this.v12Camera(scene,position),startX=Math.max(0,Math.floor(camera.x/T)-1),endX=Math.min(scene.width,Math.ceil((camera.x+960)/T)+1),startY=Math.max(0,Math.floor(camera.y/T)-1),endY=Math.min(scene.height,Math.ceil((camera.y+540)/T)+1);e.clear("#090d0e");c.save();c.translate(-camera.x,-camera.y);
    for(let y=startY;y<endY;y++)for(let x=startX;x<endX;x++)this.drawV12Tile(c,scene.cultureRow,scene.tiles[y][x],x*T,y*T);
    for(const p of scene.props)if(!p.high)this.drawV12Object(c,scene,p,time);
    const actors=[...scene.npcs.map(n=>({npc:n,y:n.y})),{player:true,y:position.y}].sort((a,b)=>a.y-b.y);for(const actor of actors){if(actor.player)this.person(e,position.x*T+T/2,position.y*T+25,position.dir,actorId==="rian",game.playerAnim,scene.actorScale,actorId,game.playerMoving);else{const n=actor.npc;this.person(e,n.x*T+T/2,n.y*T+25,n.dir??4,false,time+(this.hash(n.appearanceId)%37)/11,scene.actorScale,n.appearanceId,false);if(n.name)this.renderNameplate(e,n.name,n.x*T+T/2,n.y*T-14,false,false)}}
    for(const p of scene.props)if(p.high){const occludes=position.x>p.x-.3&&position.x<p.x+p.w+.3&&position.y<p.y+p.h&&position.y>p.y-1;this.drawV12Object(c,scene,p,time,occludes ? .48 : 1)}c.restore();
    const building=game.currentBuilding?.(),elapsed=performance.now()-(game.s.v12?.enteredAt||0);if(elapsed<2200){const alpha=Math.min(1,(2200-elapsed)/500);c.fillStyle=`rgba(3,13,16,${.88*alpha})`;c.fillRect(18,18,Math.min(500,(building?.name||scene.facility).length*24+110),44);e.text(`${HL.DATA.ports[game.s.currentPort]?.name||""} · ${building?.name||scene.facility} ${scene.floorId.toUpperCase()}`,34,47,`rgba(245,209,129,${alpha})`,"left",18)}
    const near=this.nearV10Interaction(position,scene);if(near){const label=`Enter/Z  ${near.label}`,w=Math.max(170,label.length*14+30);c.fillStyle="rgba(4,18,22,.94)";c.fillRect(480-w/2,494,w,32);c.strokeStyle="#d2a953";c.strokeRect(481-w/2,495,w-2,30);e.text(label,480,516,"#fff0b6","center",14)}
  };
  art.v10InteriorScene=function(game,scene,position,actorId="rian",prologue=false){if(scene?.visual?.version===12)return this.v12InteriorScene(game,scene,position,actorId,prologue);return oldScene.call(this,game,scene,position,actorId,prologue)};
  HL.V12ShipRenderer=ShipRendererV12;HL.SeaShipVisual=class{constructor(){this.renderer=new ShipRendererV12()}draw(e,type,x,y,heading,hull=100,time=0,scale=1,equipment){return this.renderer.draw(e,type,x,y,heading,hull,time,scale,"world",equipment||window.__HL_GAME__?.s?.fleet?.[0]?.equipment||{})}};
  art.ship=function(e,x,y,dir,type="caravel",scale=1){this.ensureV12();const game=window.__HL_GAME__,battle=this.v11BattleMode===true,equipment=game?.s?.fleet?.[0]?.equipment||{};return this.shipRendererV12.draw(e,type,x,y,dir,game?.s?.fleet?.[0]?.hull||100,performance.now()/1000,battle?scale*.62:scale,battle?"battle":"world",equipment)};
  const oldEnsure=art.ensureV5Images;art.ensureV5Images=function(){oldEnsure.call(this);this.ensureV12();if(!(this.seaShipVisual instanceof HL.SeaShipVisual))this.seaShipVisual=new HL.SeaShipVisual()};
})();
