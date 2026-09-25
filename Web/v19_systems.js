window.HL=window.HL||{};
(function(){
  "use strict";
  const copy=v=>JSON.parse(JSON.stringify(v));
  const captain=id=>HL.DATA.captainsV16.find(c=>c.id===id)||HL.DATA.captainsV16[0];
  const nearest=(scene,x,y)=>{const world=new HL.CollisionWorld(HL.DATA.actorMovementProfileV19.collisionRadius);if(!world.blocked(scene.collision,x,y,HL.DATA.actorMovementProfileV19.collisionRadius))return[x,y];for(let r=.5;r<12;r+=.5)for(let a=0;a<Math.PI*2;a+=Math.PI/8){const nx=x+Math.cos(a)*r,ny=y+Math.sin(a)*r;if(!world.blocked(scene.collision,nx,ny,HL.DATA.actorMovementProfileV19.collisionRadius))return[nx,ny]}return[...scene.spawn]};
  HL.migrateStateV19=function(prior){
    const s=copy(prior||HL.Game.freshState());s.version=19;s.graphicsVersion=19;s.v19={migratedAt:Date.now(),uniqueTowns:true,playableOpening:true,...(s.v19||{})};
    s.openingV19=s.openingV19||{captainId:s.captainId,step:3,completed:true,startedAt:Date.now()};
    s.partyFollowerState=s.partyFollowerState||{active:[],history:[],spacing:.72,render:[]};
    const map=HL.WorldData.townMapFor(s.currentPort);if(s.mode==="town"){const q=nearest(map,Number(s.town?.x)||map.spawn[0],Number(s.town?.y)||map.spawn[1]);s.town={x:q[0],y:q[1],dir:s.town?.dir??4}}
    if(s.mode==="interior"&&s.interior){const facility=s.interior.buildingId||s.interior.id,building=HL.DATA.buildingScenes[s.currentPort]?.[facility],floor=building?.floors[s.interior.floorId]||building?.floors[building?.entryFloor];if(floor){const q=nearest(floor,Number(s.interior.x)||floor.spawn[0],Number(s.interior.y)||floor.spawn[1]);Object.assign(s.interior,{id:facility,buildingId:facility,floorId:floor.floorId,x:q[0],y:q[1]})}else{s.mode="town";s.interior=null;s.town={x:map.spawn[0],y:map.spawn[1],dir:4}}}
    return s
  };
  const engine=HL.Engine.prototype;engine.v18SlotKey=i=>`horizon-ledger-v18-slot-${i}`;engine.slotKey=i=>`horizon-ledger-v19-slot-${i}`;
  engine.loadSlot=function(i){try{const s=JSON.parse(localStorage.getItem(this.slotKey(i)));return s?.version===19?s:null}catch{return null}};
  engine.migrateOld=function(i){if(this.loadSlot(i))return;try{const keys=[this.v18SlotKey(i),`horizon-ledger-v17-slot-${i}`,`horizon-ledger-v16-slot-${i}`,`horizon-ledger-v15-slot-${i}`],old=keys.map(k=>JSON.parse(localStorage.getItem(k)||"null")).find(Boolean);if(old)this.saveSlot(i,HL.migrateStateV19(old))}catch(error){console.warn("V19 저장 변환 실패",error)}};
  engine.deleteSlot=function(i){localStorage.removeItem(this.slotKey(i))};

  const game=HL.Game.prototype,oldFresh=HL.Game.freshState,oldEnsure=game.ensureExpansion,oldNew=game.newGame,oldResume=game.resume,oldExecute=game.executeV10InteriorAction,oldProgress=game.progressCampaign;
  HL.Game.freshState=function(){const s=oldFresh.call(this);s.version=19;s.graphicsVersion=19;s.v19={uniqueTowns:true,playableOpening:true};s.openingV19=null;return s};
  game.ensureExpansion=function(){oldEnsure.call(this);if(this.s){this.s.version=19;this.s.graphicsVersion=19;this.s.v19={uniqueTowns:true,playableOpening:true,...(this.s.v19||{})};this.s.partyFollowerState=this.s.partyFollowerState||{active:[],history:[],spacing:.72,render:[]}}};
  game.beginPlayableOpeningV19=function(id){
    const c=captain(id),opening=HL.DATA.playableOpeningsV19[id],building=HL.DATA.buildingScenes[c.startPort][opening.facility],floor=building.floors[building.entryFloor];
    this.mode="interior";this.s.mode="interior";this.s.openingV19={captainId:id,step:0,completed:false,startedAt:Date.now(),log:[]};
    this.s.interior={id:opening.facility,buildingId:opening.facility,floorId:building.entryFloor,x:floor.spawn[0],y:floor.spawn[1],dir:0};
    this.s.quest={stage:0,title:opening.title,objective:"주변을 살펴보고 오늘 맡은 일을 시작하라."};this.lastSafe={x:floor.spawn[0],y:floor.spawn[1]};this.playerVelocity={x:0,y:0};this.e.close();this.resetFollowersV19();this.save();this.e.playMusic("port");this.e.toast("직접 움직여 오늘 맡은 일을 확인하십시오")
  };
  game.newGame=function(id=this.e.selectedCaptain||"kemal"){oldNew.call(this,id);this.s=HL.migrateStateV19(this.s);this.s.slot=this.e.selectedSlot;this.beginPlayableOpeningV19(id)};
  game.resume=function(i){const s=this.e.loadSlot(i);if(!s)return this.showFiles();this.s=HL.migrateStateV19(s);this.s.slot=i;this.mode=this.s.mode||"town";this.ensureExpansion();this.spawnTownNpcs();this.e.close();this.ensureSafePosition();this.resetFollowersV19();this.e.playMusic(this.mode==="sea"?"sea":"port")};
  game.townBuildings=function(){const map=this.townMap(),list=map.buildings.map(b=>({...b,name:b.label||b.name||b.id}));if(this.s?.properties?.[this.s.currentPort]&&!list.some(b=>b.id==="home"))list.push({id:"home",label:"선장의 집",name:"선장의 집",rect:[2,map.height-9,5,4],door:[4,map.height-4.65],virtual:true});return list};
  game.leaveInterior=function(){const b=this.townBuildings().find(x=>x.id===this.s.interior.id)||this.townBuildings()[0];this.playerVelocity={x:0,y:0};this.beginTransition(()=>{this.mode="town";this.s.mode="town";this.s.town={x:b.door[0],y:b.door[1]+.72,dir:4};this.lastSafe={x:this.s.town.x,y:this.s.town.y};this.s.interior=null;this.e.close();this.resetFollowersV19();this.save()})};
  game.progressCampaign=function(event){if(this.s?.openingV19&&!this.s.openingV19.completed)return false;return oldProgress.call(this,event)};
  game.handleOpeningV19=function(part){
    const state=this.s.openingV19,opening=HL.DATA.playableOpeningsV19[this.s.captainId],order=["work","witness","confirm"],expected=order[state.step];
    if(state.completed)return this.e.dialogue("지난 일",[opening.work,opening.witness,opening.confirm][Math.max(0,order.indexOf(part))],[{label:"돌아선다",action:"close"}]);
    if(part!==expected)return this.e.toast(state.step===0?"먼저 오늘 맡은 일을 확인하십시오":state.step===1?"일을 마친 뒤 찾아온 사람과 이야기하십시오":"받은 소식을 책임자에게 확인하십시오");
    const text=opening[part],speaker=part==="work"?captain(this.s.captainId).name:part==="witness"?"찾아온 사람":"가족과 책임자";state.log.push(text);state.step++;
    if(state.step===1)this.s.quest.objective="일을 마쳤다. 나를 찾는 사람이 있는지 살펴보라.";
    if(state.step===2)this.s.quest.objective="전해 들은 소식을 가족이나 책임자에게 확인하라.";
    if(state.step>=3){state.completed=true;state.completedAt=Date.now();this.s.prologueV16={index:0,reveal:0,completed:true};this.s.flags.cutsceneSeen=true;this.s.quest.objective=opening.objective}
    this.save();return this.e.dialogue(speaker,text,[{label:state.completed?"출항 준비를 시작한다":"계속",action:"close",primary:state.completed}])
  };
  game.executeV10InteriorAction=function(action){if(action.startsWith("v19-opening:"))return this.handleOpeningV19(action.slice(12));return oldExecute.call(this,action)};

  game.resetFollowersV19=function(){if(!this.s)return;const pos=this.mode==="interior"?this.s.interior:this.s.town;if(!pos)return;const p=this.s.partyFollowerState||(this.s.partyFollowerState={active:[],history:[],spacing:.72,render:[]});p.history=Array.from({length:150},()=>({x:pos.x,y:pos.y,dir:pos.dir||4}));p.render=[]};
  game.updateFollowersV19=function(){const pos=this.mode==="interior"?this.s.interior:this.s.town,p=this.s.partyFollowerState;if(!pos||!p)return;const h=p.history||(p.history=[]),last=h[0];if(!last||Math.hypot(last.x-pos.x,last.y-pos.y)>.07)h.unshift({x:pos.x,y:pos.y,dir:pos.dir});if(h.length>210)h.length=210;const active=this.activeFollowersV17?this.activeFollowersV17():[];p.render=active.slice(0,3).map((id,i)=>{const target=h[Math.min(h.length-1,Math.round((i+1)*14*(p.spacing||.72)))]||pos;return{id,x:target.x,y:target.y,dir:target.dir,anim:(this.playerAnim||0)-i*.12,moving:this.playerMoving}})};
  game.updateTown=function(dt){
    if(this.e.overlay.innerHTML)return;const profile=HL.DATA.actorMovementProfileV19,input=this.inputVector(),speed=profile.speed,accel=profile.acceleration;this.playerVelocity.x=this.approach(this.playerVelocity.x,input.x*speed,accel*dt);this.playerVelocity.y=this.approach(this.playerVelocity.y,input.y*speed,accel*dt);this.playerMoving=Math.hypot(this.playerVelocity.x,this.playerVelocity.y)>.12;if(input.dir>=0)this.s.town.dir=input.dir;if(this.playerMoving)this.playerAnim+=dt;
    const dynamic=this.npcs.map(n=>({x:n.x,y:n.y,radius:.25})),next=this.collision.move(this.townMap().collision,this.s.town,{x:this.playerVelocity.x*dt,y:this.playerVelocity.y*dt},profile.collisionRadius,dynamic);this.s.town.x=next.x;this.s.town.y=next.y;this.updateTownNpcs(dt);this.updateFollowersV19();this.checkTownDoor(input);this.ensureSafePosition();if(this.e.hit("Enter","z","Z"," "))this.interactTown()
  };
  game.updateInterior=function(dt){
    if(this.e.overlay.innerHTML)return;const profile=HL.DATA.actorMovementProfileV19,input=this.inputVector(),speed=profile.speed,accel=profile.acceleration;this.playerVelocity.x=this.approach(this.playerVelocity.x,input.x*speed,accel*dt);this.playerVelocity.y=this.approach(this.playerVelocity.y,input.y*speed,accel*dt);this.playerMoving=Math.hypot(this.playerVelocity.x,this.playerVelocity.y)>.12;if(input.dir>=0)this.s.interior.dir=input.dir;if(this.playerMoving)this.playerAnim+=dt;
    const next=this.collision.move(this.interiorScene().collision,this.s.interior,{x:this.playerVelocity.x*dt,y:this.playerVelocity.y*dt},profile.collisionRadius);this.s.interior.x=next.x;this.s.interior.y=next.y;this.updateFollowersV19();const exit=this.interiorScene().exit.rect;if(input.y>.2&&this.pointInRect(this.s.interior.x,this.s.interior.y+.3,exit)){this.leaveInterior();return}this.ensureSafePosition();if(this.e.hit("Enter","z","Z"," "))this.interactInterior()
  };
})();
