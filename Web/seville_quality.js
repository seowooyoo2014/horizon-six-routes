window.HL=window.HL||{};
(function(){
  "use strict";
  const D=HL.DATA,T=24,ROOT="../Assets/Resources/Sprites/Game/V21/";
  const unit=r=>r.map(v=>v/T),inside=(x,y,r)=>x>=r[0]&&y>=r[1]&&x<r[0]+r[2]&&y<r[1]+r[3];
  const h=(id,label,x,y,action,text)=>({id,label,rect:unit([x-8,y-8,16,16]),action,text});
  const layouts={
    "guild:1f":{
      image:"seville_guild_quality_draft.png",title:"지도 공방 · 접수와 측량실",spawn:[480,469],landing:[744,416],
      walks:[[295,169,370,271],[45,155,220,150],[260,155,40,47],[87,397,214,44],[287,362,480,79],[698,155,219,148],[661,155,39,47],[665,300,102,141],[448,434,60,78]],
      blocks:[[366,112,220,57],[364,198,241,159],[102,174,129,108],[77,136,43,25],[725,175,108,96],[147,388,113,32],[599,114,36,40]],
      props:[[366,112,220,57],[364,198,241,159],[102,174,129,108],[725,175,108,96]],
      spots:[h("opening-work","조수표 작업대",352,244,"v21-opening:work"),h("opening-news","압수 목록",717,240,"v21-opening:news"),h("opening-consult","마엘과 상의",605,172,"v21-opening:consult"),h("opening-prepare","출항 준비 장부",480,374,"v21-opening:prepare"),h("guild-service","공방 접수",475,181,"facility:guild"),h("telescope","측량 망원경",73,177,"seville-inspect:telescope","렌즈 테두리에 손때가 묻어 있다. 오르델은 측정값 옆에 날씨도 적으라고 늘 말했다."),h("charts","해도 서랍",850,165,"seville-inspect:charts","수심을 고친 흔적이 여러 겹이다. 해도 한 장에도 이름 없는 항해자들의 경험이 남는다.")],
      exit:unit([451,497,54,14])
    },
    "guild:2f":{
      image:"seville_guild_2f_quality.png",title:"지도 공방 · 열람실과 기록고",spawn:[721,403],landing:[721,403],
      walks:[[294,133,373,246],[44,133,222,244],[263,157,35,45],[695,147,222,155],[663,157,36,45],[586,327,185,113],[665,299,104,141]],
      blocks:[[98,176,121,78],[98,260,123,81],[728,173,132,100],[742,136,144,15]],
      props:[[98,176,121,78],[98,260,123,81],[728,173,132,100]],
      spots:[h("reading","항해 일지",232,225,"seville-inspect:reading","서쪽 항구에서 온 일지다. 여백에는 조류와 다시 측량해야 할 곶이 적혀 있다."),h("notes","견습생 필사장",234,310,"seville-inspect:notes","같은 해안선을 세 번 그렸다. 마지막 그림에만 작은 모래톱이 추가되어 있다."),h("archive","측량 기록함",851,156,"seville-inspect:archive","날짜와 관측 지점 순서로 정리된 서랍이다. 빈 칸에는 압수된 기록의 번호가 적혀 있다."),h("upperdesk","해도 대조대",717,240,"seville-inspect:upperdesk","다른 선장이 그린 두 해도를 겹치면 서로 빠뜨린 곳이 드러난다."),h("catalogue","기록 목록",510,146,"seville-inspect:catalogue","누가 어떤 기록을 빌렸는지 꼼꼼히 적혀 있다."),h("model","선박 모형",461,152,"seville-inspect:model","측량선을 본뜬 모형이다. 선체보다 갑판의 관측 공간을 넓게 만들었다.")]
    },
    "guild:b1":{
      image:"seville_guild_b1_quality.png",title:"지도 공방 · 보관 및 수리 작업실",spawn:[865,322],landing:[865,322],
      walks:[[60,146,850,220],[266,353,362,56]],
      blocks:[[59,159,225,154],[701,158,208,152],[391,206,185,128],[749,334,136,32]],
      props:[[59,159,225,154],[701,158,208,152],[391,206,185,128]],
      spots:[h("repair","측량 기구 수리대",290,279,"seville-inspect:repair","휘어진 나침반 바늘과 새 황동 고리가 작은 접시에 나뉘어 있다."),h("sealed","봉인된 해도함",489,155,"seville-inspect:sealed","습기를 막기 위해 밀랍으로 이음새를 막았다. 함은 잠겨 있다."),h("sorting","기록 분류대",378,278,"seville-inspect:sorting","젖은 해도를 말릴 때 쓰는 천과 무게추가 놓여 있다."),h("tools","부품 서랍",692,283,"seville-inspect:tools","같은 모양의 나사도 길이가 다르다. 조수는 자를 옆에 두고 분류했다."),h("sail","보관한 돛감",415,174,"seville-inspect:sail","못 쓰는 돛감은 기록함을 감싸는 데 다시 쓰인다."),h("cellar","지하 장부",597,243,"seville-inspect:cellar","수리비보다 기록을 말리는 데 쓴 땔감 비용이 더 크다.")]
    },
    "lodge:2f":{
      image:"seville_bedroom_quality.png",title:"세리아의 방",spawn:[301,236],landing:[724,407],
      walks:[[133,145,695,283],[663,380,86,58]],
      blocks:[[191,83,88,175],[409,109,177,94],[744,88,84,108],[93,245,51,111],[660,280,180,105],[139,380,59,49],[829,209,40,55]],
      props:[[191,83,88,175],[409,109,177,94],[744,88,84,108],[660,280,180,105]],
      spots:[h("wake-bed","침대",291,231,"v21-wake:bed"),h("wake-caller","마엘",341,266,"v21-wake:caller"),h("wash","세면대",325,165,"seville-inspect:wash","아직 물이 차다. 아래층에서는 아침 그릇을 옮기는 소리가 들린다."),h("desk","연습 해도",498,218,"seville-inspect:desk","어젯밤까지 고친 해도다. 오르델에게 보여 드릴 곳을 붉은 실로 표시했다."),h("books","교본",732,218,"seville-inspect:books","책갈피가 끼워진 쪽에는 조수표를 읽는 방법이 적혀 있다."),h("chest","여행 가방",184,280,"seville-inspect:chest","빈 가방이다. 아직 이 방을 떠날 생각으로 짐을 싼 적은 없다.")]
    }
  };
  // Keep the walkable silhouette and object footprints in one coordinate source.
  function collision(q){
    const solids=[];
    for(let y=0;y<540;y+=6){let start=-1;for(let x=0;x<=960;x+=6){const blocked=x<960&&!q.walks.some(r=>inside(x+3,y+3,r));if(blocked&&start<0)start=x;if(!blocked&&start>=0){solids.push(unit([start,y,x-start,6]));start=-1}}}
    return{walkBounds:[0,0,40,22.5],solids:[...solids,...q.blocks.map(unit)],polygons:[],doors:[]};
  }
  const installed={};
  D.sevilleQualityOriginals={};
  for(const [key,q] of Object.entries(layouts)){
    const [facility,floorId]=key.split(":"),building=D.buildingScenes.seville[facility],old=building.floors[floorId];
    D.sevilleQualityOriginals[key]=old;
    const scene={...old,width:40,height:22.5,spawn:unit(q.spawn),props:[],hotspots:q.spots,npcs:[],collision:collision(q),stairs:[],exit:{...old.exit,rect:q.exit||[-10,-10,1,1]},visual:{...old.visual,background:ROOT+q.image,qualitySeville:true},quality:q};
    scene.navigation=scene.collision;scene.collision.interactions=scene.hotspots;
    const toFloor=floorId==="1f"?"2f":"1f";
    scene.stairs=[{id:"quality-stair",label:floorId==="1f"?"기록고 · 지하 계단":"1층으로",rect:unit([q.landing[0]-8,q.landing[1]-8,16,16]),approach:2,toFloor,qualityLink:true}];
    building.floors[floorId]=scene;D.floorVisualSetsV21.seville[facility][floorId]=scene;installed[key]=scene;
  }
  D.sevilleQualityLayouts=installed;
  installed["guild:1f"].npcs=[{id:"owner",appearanceId:"owner_seville_guild",name:"공방 접수원",x:620/T,y:180/T,dir:6}];
  installed["lodge:2f"].npcs=[{id:"caller-ines",appearanceId:"caller_ines",name:"마엘",x:341/T,y:266/T,dir:6}];
  const game=HL.Game.prototype,art=HL.Art.prototype;
  const sprites=HL.CaptainSpriteRendererV20.prototype,oldSprite=sprites.draw;
  sprites.draw=function(c,id,x,y,dir,moving,time,mode){
    if(id!=="ines")return oldSprite.call(this,c,id,x,y,dir,moving,time,mode);
    const m=D.captainSpriteManifestsV20.ines,sequence=moving?m.walkFrames:m.idleFrames;
    const index=sequence[Math.floor(time*(moving?m.fps.walk:m.fps.idle))%sequence.length];
    const frame=m.frames[["N","NE","E","SE","S","SW","W","NW"][(dir+8)%8]][index],image=this.image(m.images.town);
    if(!(image.naturalWidth||image.width))return oldSprite.call(this,c,id,x,y,dir,moving,time,mode);
    this.opaqueSevilleFrames=this.opaqueSevilleFrames||{};
    const key=`${dir}:${index}`;let buffer=this.opaqueSevilleFrames[key];
    if(!buffer){buffer=document.createElement("canvas");buffer.width=frame.w;buffer.height=frame.h;const b=buffer.getContext("2d");b.drawImage(image,frame.x,frame.y,frame.w,frame.h,0,0,frame.w,frame.h);
      try{const data=b.getImageData(0,0,frame.w,frame.h);for(let i=3;i<data.data.length;i+=4)data.data[i]=data.data[i]>32?255:0;b.putImageData(data,0,0)}catch(error){/* file-origin canvas restrictions leave the original frame usable. */}
      this.opaqueSevilleFrames[key]=buffer;
    }
    c.save();c.globalAlpha=1;c.imageSmoothingEnabled=false;
    c.drawImage(buffer,Math.round(x-frame.pivot[0]),Math.round(y-frame.pivot[1]));c.restore();
  };
  const oldWake=game.beginWakeOpeningV21,oldChange=game.changeFloor,oldAction=game.dispatchAction,oldExecute=game.executeV10InteriorAction,oldDraw=art.v21Interior;
  const oldSafe=game.ensureSafePosition;
  game.ensureSafePosition=function(){
    const scene=this.mode==="interior"?this.interiorScene():null;if(!scene?.quality)return oldSafe.call(this);
    const p=this.s.interior;if(this.collision.blocked(scene.collision,p.x,p.y,.28)){
      let best=scene.spawn,distance=Infinity;
      for(let y=.5;y<22;y+=.5)for(let x=.5;x<40;x+=.5){const d=(x-p.x)**2+(y-p.y)**2;if(d<distance&&!this.collision.blocked(scene.collision,x,y,.28)){distance=d;best=[x,y]}}
      p.x=best[0];p.y=best[1];this.playerVelocity={x:0,y:0};
    }this.lastSafe={x:p.x,y:p.y};
  };
  game.beginWakeOpeningV21=function(id){oldWake.call(this,id);if(id!=="ines")return;const s=installed["lodge:2f"];Object.assign(this.s.interior,{x:s.spawn[0],y:s.spawn[1]});this.lastSafe={x:s.spawn[0],y:s.spawn[1]};this.resetFollowersV19();this.save()};
  game.changeFloor=function(link){
    const current=this.interiorScene();
    if(current?.quality&&link.qualityLink&&current.floorId==="1f")return this.e.dialogue("공방 계단","위층은 열람실, 아래층은 보관 작업실이다.",[{label:"2층 기록고",action:"seville-floor:2f"},{label:"지하 작업실",action:"seville-floor:b1"},{label:"돌아선다",action:"close"}]);
    const destination=this.currentBuilding()?.floors[link.toFloor];
    if(destination?.quality)link={...link,spawn:unit(destination.quality.landing)};
    else if(current?.quality&&destination){
      const reciprocal=destination.stairs?.find(s=>s.toFloor===current.floorId);
      if(reciprocal){const r=reciprocal.rect,cx=r[0]+r[2]/2,cy=r[1]+r[3]/2;
        const candidates=[[cx,cy+2],[cx-2,cy],[cx+2,cy],[cx,cy-2]];
        const safe=candidates.find(([x,y])=>!this.collision.blocked(destination.collision,x,y,.28));if(safe)link={...link,spawn:safe};
      }
    }
    return oldChange.call(this,link);
  };
  game.dispatchAction=function(action,button){if(action.startsWith("seville-floor:")){const toFloor=action.slice(14),destination=this.currentBuilding()?.floors[toFloor];if(!destination?.quality)return;this.e.close();return oldChange.call(this,{toFloor,approach:2,spawn:unit(destination.quality.landing)})}return oldAction.call(this,action,button)};
  game.executeV10InteriorAction=function(action){if(action.startsWith("seville-inspect:")){const h=this.interiorScene()?.hotspots.find(h=>h.action===action);if(h)return this.e.dialogue(h.label,h.text,[{label:"돌아선다",action:"close"}])}return oldExecute.call(this,action)};
  art.v21Interior=function(game,scene,pos){
    if(!scene.quality)return oldDraw.call(this,game,scene,pos);
    const q=scene.quality,c=game.e.ctx,e=game.e,record=this.v21Image(scene.visual.background);e.clear("#000");c.save();c.imageSmoothingEnabled=false;c.globalAlpha=1;
    if(record.status==="ready")c.drawImage(record.image,0,0,960,540);
    else{c.fillStyle="#24454a";for(const r of q.walks)c.fillRect(...r);c.fillStyle="#624831";for(const r of q.blocks)c.fillRect(...r)}
    const actors=[...(scene.npcs||[]),...(game.s.partyFollowerState?.render||[]),{...pos,player:true}].sort((a,b)=>a.y-b.y);
    for(const a of actors){const x=Math.round(a.x*T),y=Math.round(a.y*T),id=a.player?game.s.captainId:(a.appearanceId||a.id);c.globalAlpha=1;this.drawActorV19(c,id,x,y,a.dir??4,a.player?game.playerMoving:!!a.moving,a.player?game.playerAnim:0,1)}
    // Only redraw the individual foreground footprint; never fade the character.
    if(record.status==="ready")for(const r of q.props){if(pos.y*T<r[1]+r[3]&&pos.y*T>r[1]-70&&pos.x*T>r[0]-24&&pos.x*T<r[0]+r[2]+24){c.globalAlpha=.45;c.drawImage(record.image,r[0]*record.image.width/960,r[1]*record.image.height/540,r[2]*record.image.width/960,r[3]*record.image.height/540,...r)}}
    c.restore();const near=this.nearV10Interaction(pos,scene);
    if(near){c.fillStyle="rgba(3,10,14,.94)";c.fillRect(280,495,400,30);e.text(near.label,480,516,"#ffe2a2","center",15)}
    e.text(q.title,480,22,"#f6dab1","center",14);
    const wake=game.s.openingWakeV21;if(wake&&!wake.completed&&wake.reveal<1){c.save();c.globalAlpha=1-wake.reveal;c.fillStyle="#000";c.fillRect(0,0,960,540);c.restore();if(wake.reveal>.18)e.text(D.openingWakeDefinitionsV21.calls.ines.wake,480,475,"#fff1d7","center",15)}
  };
})();
