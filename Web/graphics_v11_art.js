window.HL=window.HL||{};
(function(){
  "use strict";
  const T=30,art=HL.Art.prototype;
  class SpriteRendererV11{
    constructor(owner){this.owner=owner;this.images={};this.buffers={}}
    override(id){return window.__HL_GAME__?.s?.userGraphics?.enabled===false?null:HL.UserAssetStore.overrides[id]}
    manifest(id){const base=HL.DATA.spriteManifestsV11[id]||HL.DATA.spriteManifestsV11.citizen,override=this.override(id)?.manifest;return override?{...base,...override,modes:{...base.modes,...override.modes}}:base}
    image(id,mode){
      const override=this.override(id),usesOverride=!!override?.manifest?.modes?.[mode]&&!!(override?.images?.[mode]||override?.image),key=`${id}:${mode}:${usesOverride?"user":"base"}`;if(this.images[key])return this.images[key];
      const image=new Image(),manifest=this.manifest(id),custom=override?.images?.[mode]||override?.image,source=usesOverride?(custom?.src||custom):(manifest.modes[mode]?.src||HL.DATA.spriteManifestsV11.rian.modes[mode].src);image.src=source;this.images[key]=image;return image
    }
    frame(id,mode,dir,anim,moving){const manifest=this.manifest(id),m=manifest.modes[mode]||manifest.modes.town,sequence=moving?manifest.walkFrames:manifest.idleFrames,fps=moving?manifest.fps.walk:manifest.fps.idle,index=sequence[Math.floor(anim*fps)%sequence.length];return m.frames[(dir+8)%8]?.[index]||m.frames[0][0]}
    draw(e,x,y,dir,anim,scale,id,moving,hero){
      const c=e.ctx,mode=scale>1.05?"interior":"town",manifest=this.manifest(id),sourceId=HL.DATA.spriteManifestsV11[id]||this.override(id)?id:"citizen",image=this.image(sourceId,mode),frame=this.frame(sourceId,mode,dir,anim,moving),pivot=frame.pivot||[frame.w/2,frame.h-3],bob=moving?Math.round(Math.sin(anim*Math.PI*2)):0,drawScale=1;
      c.fillStyle="rgba(2,8,10,.38)";c.beginPath();c.ellipse(Math.round(x),Math.round(y+2),mode==="interior"?17:13,mode==="interior"?6:5,0,0,Math.PI*2);c.fill();
      const dx=Math.round(x-pivot[0]*drawScale),dy=Math.round(y-(pivot[1]-3)*drawScale+bob),dw=Math.round(frame.w*drawScale),dh=Math.round(frame.h*drawScale);
      if(!image?.complete||!image.naturalWidth){c.fillStyle="#2e6f7c";c.fillRect(dx+dw*.28,dy+dh*.22,dw*.44,dh*.68);return}
      if(hero||HL.DATA.spriteManifestsV11[id]||this.override(id)){c.drawImage(image,frame.x,frame.y,frame.w,frame.h,dx,dy,dw,dh);return}
      const key=`${frame.w}x${frame.h}`,buffer=this.buffers[key]||(this.buffers[key]=document.createElement("canvas"));buffer.width=frame.w;buffer.height=frame.h;const b=buffer.getContext("2d");b.imageSmoothingEnabled=false;b.clearRect(0,0,frame.w,frame.h);b.drawImage(image,frame.x,frame.y,frame.w,frame.h,0,0,frame.w,frame.h);
      const appearance=HL.DATA.appearances[id]||{},hash=this.owner.hash(id);b.globalCompositeOperation="source-atop";b.fillStyle=(appearance.palette?.[0]||["#315f73","#6d4935","#7e3f3b","#496241"][hash%4])+"70";b.fillRect(0,Math.floor(frame.h*.23),frame.w,Math.floor(frame.h*.58));b.globalCompositeOperation="source-over";c.drawImage(buffer,dx,dy,dw,dh);
      if(appearance.hat!=="none"){c.fillStyle=appearance.palette?.[2]||"#d5ab61";c.fillRect(dx+Math.floor(dw*.27),dy+Math.floor(dh*.12),Math.floor(dw*.46),mode==="interior"?5:3)}
      if(appearance.accessory&&appearance.accessory!=="none"){c.fillStyle="#d1a956";c.fillRect(dx+(hash%2?Math.floor(dw*.78):Math.floor(dw*.14)),dy+Math.floor(dh*.52),mode==="interior"?5:3,mode==="interior"?15:10)}
    }
  }
  class ShipRendererV11{
    constructor(){this.images={}}
    image(src){if(this.images[src])return this.images[src];const image=new Image();image.src=src;this.images[src]=image;return image}
    draw(e,type,x,y,heading,hull=100,time=0,scale=1,size="world",equipment={}){
      const manifest=HL.DATA.shipVisualManifestsV11[type]||HL.DATA.shipVisualManifestsV11.caravel,m=manifest[size],layers=manifest.layers[size],damaged=hull<45,bob=Math.round(Math.sin(time*2.45+(heading||0))*(size==="battle"?3:2)),sx=((heading||0)+8)%8*m.frameWidth,dy=Math.round(y-m.frameHeight*scale*.55+bob),dx=Math.round(x-m.frameWidth*scale/2),dw=Math.round(m.frameWidth*scale),dh=Math.round(m.frameHeight*scale);
      const draw=src=>{const image=this.image(src);if(image.complete&&image.naturalWidth)e.ctx.drawImage(image,sx,0,m.frameWidth,m.frameHeight,dx,dy,dw,dh)};
      draw(damaged?layers.hullDamaged:layers.hull);draw(damaged?layers.sailsDamaged:layers.sails);draw(layers.equipment);
      const c=e.ctx;if(equipment?.armor&&equipment.armor!=="none"){c.strokeStyle="rgba(166,177,172,.82)";c.lineWidth=Math.max(1,Math.round(scale*2));c.beginPath();c.ellipse(x,y+10*scale,16*scale,27*scale,0,0,Math.PI*2);c.stroke()}
      if(equipment?.figurehead&&equipment.figurehead!=="none"){const d=HL.DATA.directions[heading]||[0,-1];c.fillStyle=equipment.figurehead==="dragon"?"#e4b44f":"#80c5bd";c.fillRect(Math.round(x+d[0]*37*scale-2),Math.round(y+d[1]*37*scale-2),Math.max(3,Math.round(5*scale)),Math.max(3,Math.round(5*scale)))}
      return true
    }
  }
  HL.SpriteRenderer=SpriteRendererV11;HL.V11ShipRenderer=ShipRendererV11;
  HL.SeaShipVisual=class{constructor(){this.renderer=new ShipRendererV11()}draw(e,type,x,y,heading,hull=100,time=0,scale=1,equipment){const fitted=equipment||window.__HL_GAME__?.s?.fleet?.[0]?.equipment||{};return this.renderer.draw(e,type,x,y,heading,hull,time,scale,"world",fitted)}};
  art.ensureV11=function(){
    if(!this.spriteRendererV11)this.spriteRendererV11=new SpriteRendererV11(this);if(!this.shipRendererV11)this.shipRendererV11=new ShipRendererV11();
    if(!this.images.v11Tiles){const image=new Image();image.src=HL.DATA.tileSetV11.atlas;this.images.v11Tiles=image}
  };
  art.loadV11UserAssets=async function(){this.ensureV11();for(const record of await HL.UserAssetStore.all()){const legacyModes=Object.keys(record.manifest?.modes||{}),sources=record.images||Object.fromEntries(legacyModes.map(mode=>[mode,record.image])),images={};for(const mode of["town","interior"]){if(!sources?.[mode])continue;const image=new Image();image.src=sources[mode];await new Promise(resolve=>{image.onload=image.onerror=resolve});images[mode]=image}HL.UserAssetStore.overrides[record.id]={manifest:record.manifest,images}}this.spriteRendererV11.images={}};
  const oldEnsure=art.ensureV5Images;art.ensureV5Images=function(){oldEnsure.call(this);this.ensureV11();if(!(this.seaShipVisual instanceof HL.SeaShipVisual))this.seaShipVisual=new HL.SeaShipVisual();if(!this.v11UserLoadStarted){this.v11UserLoadStarted=true;this.loadV11UserAssets()}};
  art.person=function(e,x,y,dir=4,hero=false,anim=0,scale=1,appearanceId="citizen",moving=false){this.ensureV11();this.spriteRendererV11.draw(e,x,y,dir,anim,scale,appearanceId,moving,hero)};
  art.ship=function(e,x,y,dir,type="caravel",scale=1){this.ensureV11();const game=window.__HL_GAME__,equipment=game?.s?.fleet?.[0]?.equipment||{},battle=this.v11BattleMode===true;return this.shipRendererV11.draw(e,type,x,y,dir,game?.s?.fleet?.[0]?.hull||100,performance.now()/1000,battle?scale*.68:scale,battle?"battle":"world",equipment)};
  const tileMap={0:0,1:1,2:2,3:3,4:4,5:5,6:22,7:24,8:14,9:17,10:20,11:10,12:12,13:9,14:6,15:7};
  art.drawV11Tile=function(c,row,index,x,y,w=T,h=T){this.ensureV11();const image=this.images.v11Tiles,col=typeof index==="string"?HL.DATA.tileSetV11.tileIndex[index]:(tileMap[index]??index);if(image?.complete&&image.naturalWidth)c.drawImage(image,col*T,row*T,T,T,Math.round(x),Math.round(y),Math.round(w),Math.round(h));else{c.fillStyle=col===5?"#205f73":col===2?"#4b382d":"#8b704f";c.fillRect(x,y,w,h)}};
  art.drawV10Tile=art.drawV11Tile;
  art.drawV11Object=function(c,scene,p){
    if(p.hiddenV11)return;const x=p.x*T,y=p.y*T,w=p.w,h=p.h,row=scene.cultureRow;
    if(p.type==="bed"){for(let ix=0;ix<w;ix++)for(let iy=0;iy<h;iy++)this.drawV11Tile(c,row,ix===0?"bedHead":ix===w-1?"bedFoot":"bedMid",x+ix*T,y+iy*T)}
    else if(p.type==="counter"){for(let ix=0;ix<w;ix++)for(let iy=0;iy<h;iy++)this.drawV11Tile(c,row,ix===0?"counterLeft":ix===w-1?"counterRight":"counterMid",x+ix*T,y+iy*T)}
    else if(p.type==="shelf"){for(let ix=0;ix<w;ix++)for(let iy=0;iy<h;iy++)this.drawV11Tile(c,row,ix===0?"shelfLeft":ix===w-1?"shelfRight":"shelfMid",x+ix*T,y+iy*T)}
    else for(let ix=0;ix<w;ix++)for(let iy=0;iy<h;iy++)this.drawV11Tile(c,row,p.type,x+ix*T,y+iy*T);
    if(p.type==="water"){const time=performance.now()/1000;c.save();c.beginPath();c.rect(x,y,p.w*T,p.h*T);c.clip();for(let band=0;band<p.h*3;band++){const yy=y+7+band*10+Math.sin(time*2+band)*2;c.strokeStyle=band%2?"rgba(122,222,218,.48)":"rgba(238,225,157,.3)";c.beginPath();for(let px=x-20;px<x+p.w*T+20;px+=20){const wave=yy+Math.sin(px*.04-time*2.4)*2;c.moveTo(px,wave);c.lineTo(px+12,wave-2)}c.stroke()}c.restore()}
    if(p.solid){c.fillStyle="rgba(7,5,4,.15)";c.fillRect(x+4,y+p.h*T-4,p.w*T-4,5)}
  };
  art.drawV10Prop=art.drawV11Object;
  art.drawV11Stair=function(c,scene,stair,front=false){const v=stair.visual;if(!v)return;const row=scene.cultureRow,style=v.style,parts=style==="grand"?["stoneStairTop","stoneStairMid","stoneStairBottom"]:style==="side"?["woodStairTop","woodStairMid","woodStairBottom"]:["hatch"];
    if(style==="hatch"){if(!front)for(let yy=0;yy<v.h;yy++)for(let xx=0;xx<v.w;xx++)this.drawV11Tile(c,row,"hatch",(v.x+xx)*T,(v.y+yy)*T);return}
    if(!front){for(let yy=0;yy<v.h;yy++)for(let xx=0;xx<v.w;xx++){const part=yy<2?parts[0]:yy>=v.h-2?parts[2]:parts[1];this.drawV11Tile(c,row,part,(v.x+xx)*T,(v.y+yy)*T)}}
    else{for(let yy=0;yy<v.h;yy++){this.drawV11Tile(c,row,"rail",v.x*T,(v.y+yy)*T);this.drawV11Tile(c,row,"rail",(v.x+v.w-1)*T,(v.y+yy)*T)}}
  };
  const oldScene=art.v10InteriorScene;
  art.v10InteriorScene=function(game,scene,position,actorId="rian",prologue=false){
    window.__HL_GAME__=game;this.ensureV11();const e=game.e,c=e.ctx,t=performance.now()/1000;e.clear("#0c1112");
    for(let y=0;y<scene.height;y++)for(let x=0;x<scene.width;x++)this.drawV11Tile(c,scene.cultureRow,scene.tiles[y][x],x*T,y*T);
    for(const p of scene.props||[])if(!p.high)this.drawV11Object(c,scene,p);for(const stair of scene.stairs||[])this.drawV11Stair(c,scene,stair,false);
    const actors=[...(scene.npcs||[]).map(n=>({npc:n,y:n.y})),{player:true,y:position.y}].sort((a,b)=>a.y-b.y);
    for(const actor of actors)if(actor.player)this.person(e,position.x*T+T/2,position.y*T+25,position.dir,actorId==="rian",game.playerAnim,scene.actorScale||1.15,actorId,game.playerMoving);else{const n=actor.npc;this.person(e,n.x*T+T/2,n.y*T+25,n.dir??4,false,t+(this.hash(n.appearanceId)%37)/11,scene.actorScale||1.15,n.appearanceId||"citizen",false);if(n.name)this.renderNameplate(e,n.name,n.x*T+T/2,n.y*T-12,false,false)}
    for(const p of scene.props||[])if(p.high)this.drawV11Object(c,scene,p);for(const stair of scene.stairs||[])this.drawV11Stair(c,scene,stair,true);
    const title=prologue?({"ship-lower":"1511년 · 폭풍 전야 · 팔코호 하층 선실","ship-deck":"1511년 · 팔코호 갑판",lighthouse:"1511년 · 성 루시아 등대","mansion-2f":"1526년 · 팔코 저택 2층","mansion-1f":"1526년 · 팔코 저택 1층"}[game.s.prologueState.phase]||"두 번째 일몰"):`${HL.DATA.ports[game.s.currentPort].name} · ${game.currentBuilding()?.name||scene.facility} ${scene.floorId.toUpperCase()}`;
    c.fillStyle="rgba(3,12,15,.93)";c.fillRect(0,0,960,58);c.strokeStyle="#b8924f";c.strokeRect(.5,.5,959,57);e.text(title,20,25,"#f1cf83","left",17);e.text(prologue?"통로를 따라 조사하십시오. 계단 끝에 닿으면 자동으로 층을 이동합니다.":"가구와 사람 앞에서 Enter/Z · 계단은 중앙 통로로 이동",20,48,"#d8dfd1","left",12);
    const near=this.nearV10Interaction(position,scene);if(near){const label=`Enter/Z · ${near.label}`,w=Math.max(190,label.length*14+34);c.fillStyle="rgba(4,18,22,.95)";c.fillRect(480-w/2,489,w,34);c.strokeStyle="#d2a953";c.strokeRect(481-w/2,490,w-2,32);e.text(label,480,512,"#fff0b6","center",14)}window.__HL_GAME__=null
  };
  const oldTown=art.town;art.town=function(game){window.__HL_GAME__=game;const result=oldTown.call(this,game);window.__HL_GAME__=null;return result};
  const oldWorldSea=art.worldSea;art.worldSea=function(game){window.__HL_GAME__=game;const result=oldWorldSea.call(this,game);window.__HL_GAME__=null;return result};
  const oldBattle=art.battle;art.battle=function(game){window.__HL_GAME__=game;this.v11BattleMode=true;oldBattle.call(this,game);this.v11BattleMode=false;window.__HL_GAME__=null;const b=game.battle,c=game.e.ctx;if(b?.effect?.type==="cannon"){const age=Math.min(1,(performance.now()-(b.effect.started||0))/700),x=b.effect.x||480,y=b.effect.y||270;c.fillStyle=`rgba(235,230,204,${1-age})`;for(let i=0;i<9;i++){c.beginPath();c.arc(x+(i%3-1)*10*age,y+(Math.floor(i/3)-1)*8*age,9+age*8,0,Math.PI*2);c.fill()}c.fillStyle="#8b5a35";for(let i=0;i<7;i++)c.fillRect(x+(i-3)*12*age,y+(i%3-1)*9*age,3,7)}if(b?.effect?.type==="board"){c.strokeStyle="#d1b06b";c.lineWidth=2;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(430,260+i*7);c.lineTo(530,260-i*5);c.stroke()}}};
})();
