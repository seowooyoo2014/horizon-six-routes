window.HL=window.HL||{};
(function(){
  "use strict";
  const copy=value=>JSON.parse(JSON.stringify(value));
  const phaseOrder=["dark-damian","ship-lower","ship-deck","lighthouse","storm","dark-rian","mansion-2f","mansion-1f","town"];
  const phaseActor=phase=>phase.includes("rian")||phase.includes("mansion")?"rian":"damian";
  const phaseScene=(game,phase)=>{
    if(phase==="ship-lower")return HL.DATA.v10PrologueFloors.shipLower;
    if(phase==="ship-deck")return HL.DATA.v10PrologueFloors.shipDeck;
    if(phase==="lighthouse")return HL.DATA.v10PrologueFloors.lighthouse;
    if(phase==="mansion-2f")return HL.DATA.buildingScenes.bella.mansion.floors["2f"];
    if(phase==="mansion-1f")return HL.DATA.buildingScenes.bella.mansion.floors["1f"];
    return null
  };

  HL.migrateStateV10=function(prior){
    const state=copy(prior||HL.Game.freshState());state.version=10;state.flags=state.flags||{};
    const finished=!!(state.flags.v9PrologueSeen||state.flags.cutsceneSeen||state.campaign?.completed?.length||state.quest?.stage>0);
    state.prologueState={era:finished?1526:1511,phase:finished?"town":"dark-damian",actorId:finished?"rian":"damian",position:{x:7,y:13,dir:2},elapsed:0,checkpoint:finished?"prologue-complete":"opening",completed:finished,skipped:[],flags:{},...(state.prologueState||{})};
    state.prologueState.flags=state.prologueState.flags||{};state.prologueState.skipped=state.prologueState.skipped||[];
    state.floorCheckpoints=state.floorCheckpoints||[];
    if(state.mode==="interior"&&state.interior){const facility=state.interior.buildingId||state.interior.id;state.interior={id:facility,buildingId:facility,floorId:state.interior.floorId||"1f",x:16,y:15,dir:state.interior.dir||0}}
    return state
  };

  const engine=HL.Engine.prototype,oldDelete=engine.deleteSlot;
  engine.v9SlotKey=function(i){return`horizon-ledger-v9-slot-${i}`};engine.slotKey=function(i){return`horizon-ledger-v10-slot-${i}`};
  engine.loadSlot=function(i){try{const value=JSON.parse(localStorage.getItem(this.slotKey(i)));return value&&value.version===10?value:null}catch{return null}};
  engine.migrateOld=function(i){if(this.loadSlot(i))return;try{const keys=[this.v9SlotKey(i),`horizon-ledger-v8-slot-${i}`,`horizon-ledger-v7-slot-${i}`,`horizon-ledger-v6-slot-${i}`,`horizon-ledger-v5-slot-${i}`],prior=keys.map(k=>JSON.parse(localStorage.getItem(k)||"null")).find(Boolean);if(prior)this.saveSlot(i,HL.migrateStateV10(prior))}catch(error){console.warn("v10 save migration failed",error)}};
  engine.deleteSlot=function(i){oldDelete.call(this,i);localStorage.removeItem(this.slotKey(i))};

  const proto=HL.Game.prototype,oldFresh=HL.Game.freshState,oldEnsure=proto.ensureExpansion,oldResume=proto.resume,oldStartCutscene=proto.startCutscene,oldUpdate=proto.update,oldRender=proto.render,oldRenderHud=proto.renderHud,oldTownBuildings=proto.townBuildings,oldOwnerName=proto.ownerName,oldDispatch=proto.dispatchAction;
  HL.Game.freshState=function(){const state=oldFresh.call(this);state.version=10;state.prologueState={era:1511,phase:"dark-damian",actorId:"damian",position:{x:7,y:13,dir:2},elapsed:0,checkpoint:"opening",completed:false,skipped:[],flags:{}};state.floorCheckpoints=[];return state};
  proto.ensureExpansion=function(){oldEnsure.call(this);if(this.s){this.s.version=10;this.s.floorCheckpoints=this.s.floorCheckpoints||[];if(!this.s.prologueState)this.s.prologueState=HL.migrateStateV10(this.s).prologueState}};
  proto.resume=function(i){const result=oldResume.call(this,i);if(!this.s)return result;this.ensureExpansion();if(!this.s.prologueState.completed&&this.s.prologueState.phase!=="town"){this.mode="prologue-v10";this.playerVelocity={x:0,y:0};this.lastSafe={...this.s.prologueState.position};this.e.close()}else if(this.mode==="interior"&&this.s.interior){const floor=this.interiorScene();if(!floor){this.mode="town";this.s.interior=null}else{this.s.interior.x=floor.spawn[0];this.s.interior.y=floor.spawn[1];this.lastSafe={x:this.s.interior.x,y:this.s.interior.y}}}return result};

  proto.startCutscene=function(replay=false){if(replay)return oldStartCutscene.call(this,true);return this.startV10Prologue()};
  proto.startV10Prologue=function(){this.mode="prologue-v10";this.s.prologueState={era:1511,phase:"dark-damian",actorId:"damian",position:{x:7,y:13,dir:2},elapsed:0,checkpoint:"opening",completed:false,skipped:[],flags:{}};this.playerVelocity={x:0,y:0};this.lastSafe={x:7,y:13};this.e.close();this.e.hud.innerHTML="";this.e.playMusic("theme_main")};
  proto.saveV10Checkpoint=function(id){const ps=this.s.prologueState;ps.checkpoint=id;this.s.floorCheckpoints=(this.s.floorCheckpoints||[]).filter(c=>c.id!==id);this.s.floorCheckpoints.push({id,phase:ps.phase,actorId:ps.actorId,position:copy(ps.position),year:this.s.year,month:this.s.month,day:this.s.day});this.s.floorCheckpoints=this.s.floorCheckpoints.slice(-5);this.save()};
  proto.setV10Phase=function(phase,spawn){const ps=this.s.prologueState;ps.phase=phase;ps.actorId=phaseActor(phase);ps.era=phaseActor(phase)==="damian"?1511:1526;ps.elapsed=0;const scene=phaseScene(this,phase);const point=spawn||scene?.spawn||[7,13];ps.position={x:point[0],y:point[1],dir:phase.includes("mansion")?4:2};this.playerVelocity={x:0,y:0};this.lastSafe={x:ps.position.x,y:ps.position.y};this.saveV10Checkpoint(phase);if(phase==="mansion-1f")this.showV10EstateDialogue(0)};
  proto.prologueScene=function(){return phaseScene(this,this.s.prologueState.phase)};
  proto.openV10Skip=function(){const phase=this.s.prologueState.phase;this.e.window(`<h2>현재 장면을 건너뛸까요?</h2><p>이 장면의 기록과 다음 체크포인트는 정상적으로 적용됩니다.</p><div class="confirm">${this.e.button("계속 진행","v10-skip-cancel")}${this.e.button("현재 장면 건너뛰기","v10-skip-current","primary")}</div>`,`center`)};
  proto.skipV10Phase=function(){const ps=this.s.prologueState,phase=ps.phase;if(!ps.skipped.includes(phase))ps.skipped.push(phase);if(phase==="ship-deck"){ps.flags.signalsSeen=true;ps.flags.orsoWarned=true}if(phase==="lighthouse")ps.flags.beaconExtinguished=true;if(phase==="mansion-1f")ps.flags.estateHeard=true;this.e.close();this.advanceV10Phase()};
  proto.advanceV10Phase=function(){const ps=this.s.prologueState,index=phaseOrder.indexOf(ps.phase),next=phaseOrder[Math.min(index+1,phaseOrder.length-1)];if(next==="town")return this.finishV10Prologue();this.setV10Phase(next)};
  proto.updateV10Prologue=function(dt){
    const ps=this.s.prologueState;if(this.e.overlay.innerHTML)return;ps.elapsed+=dt;
    if(ps.phase==="dark-damian"&&ps.elapsed>=3.6)return this.setV10Phase("ship-lower");
    if(ps.phase==="storm"&&ps.elapsed>=6)return this.setV10Phase("dark-rian");
    if(ps.phase==="dark-rian"&&ps.elapsed>=4)return this.setV10Phase("mansion-2f",[7,12]);
    if(this.e.hit("Escape","x","X"))return this.openV10Skip();
    const scene=this.prologueScene();if(!scene)return;
    const input=this.inputVector(),speed=4.05,accel=27;this.playerVelocity.x=this.approach(this.playerVelocity.x,input.x*speed,accel*dt);this.playerVelocity.y=this.approach(this.playerVelocity.y,input.y*speed,accel*dt);this.playerMoving=Math.hypot(this.playerVelocity.x,this.playerVelocity.y)>.12;if(input.dir>=0)ps.position.dir=input.dir;if(this.playerMoving)this.playerAnim+=dt;
    const next=this.collision.move(scene.collision,ps.position,{x:this.playerVelocity.x*dt,y:this.playerVelocity.y*dt},.28);ps.position.x=next.x;ps.position.y=next.y;if(!this.collision.blocked(scene.collision,next.x,next.y,.28))this.lastSafe={x:next.x,y:next.y};
    if(this.e.hit("Enter","z","Z"," "))this.interactV10Prologue(scene)
  };
  proto.interactV10Prologue=function(scene){const ps=this.s.prologueState,v=HL.DATA.directions[ps.position.dir],x=ps.position.x+v[0]*1.15,y=ps.position.y+v[1]*1.15,stair=(scene.stairs||[]).find(s=>this.distanceToRect(x,y,s.rect)<.9);if(stair){if(ps.phase==="ship-lower")return this.setV10Phase("ship-deck",stair.spawn);if(ps.phase==="mansion-2f")return this.setV10Phase("mansion-1f",[26,14])}const hot=(scene.hotspots||[]).find(h=>this.distanceToRect(x,y,h.rect)<1);if(hot)return hot.action.startsWith("v10-prologue:")?this.handleV10PrologueAction(hot.action):this.executeV10InteriorAction(hot.action);const npc=(scene.npcs||[]).find(n=>Math.hypot(x-n.x,y-n.y)<1.1);if(npc)this.e.dialogue(npc.name||"선원","갑판의 신호를 확인하십시오. 폭풍이 예상보다 빠르게 다가오고 있습니다.",[{label:"알겠다",action:"v10-skip-cancel"}])};
  proto.handleV10PrologueAction=function(action){const ps=this.s.prologueState;if(action==="v10-prologue:bed")return this.e.dialogue("데미안 팔코","침대 곁 물잔이 바닥으로 떨어져 있다. 파도가 평소보다 거칠다.",[{label:"일어난다",action:"v10-skip-cancel"}]);if(action==="v10-prologue:log")return this.e.dialogue("데미안의 항해 일지","마티아스의 측량선이 오늘 밤 회랑을 확인한다. 등대가 켜져 있는 한 그들도 수로를 찾을 것이다.",[{label:"덮는다",action:"v10-skip-cancel"}]);if(action==="v10-prologue:cargo")return this.e.dialogue("젖은 선창","구조용 밧줄은 충분하지만 세 척을 동시에 끌 인력은 없다.",[{label:"확인",action:"v10-skip-cancel"}]);if(action==="v10-prologue:signals"){ps.flags.signalsSeen=true;return this.e.dialogue("당직 선원","민간 호송선 세 척이 구조 신호를 올립니다. 그 뒤로 벨로르의 무장선도 접근 중입니다.",[{label:"오르소와 상의한다",action:"v10-skip-cancel"}])}if(action==="v10-prologue:orso"){if(!ps.flags.signalsSeen)return this.e.toast("먼저 왼쪽 난간에서 신호를 확인하십시오");ps.flags.orsoWarned=true;return this.e.dialogue("젊은 오르소","등대를 끄면 벨로르도 길을 잃습니다. 하지만 호송선도 마찬가지입니다. 어느 위험도 작지 않습니다.",[{label:"성 루시아로 간다",action:"v10-skip-cancel"}])}if(action==="v10-prologue:helm"){if(!ps.flags.signalsSeen||!ps.flags.orsoWarned)return this.e.toast("구조 신호와 오르소의 보고를 먼저 확인하십시오");return this.e.dialogue("데미안 팔코","등대로 간다. 오늘 그들이 항로를 소유하면 앞으로 모든 구조 신호에 가격표가 붙는다.",[{label:"성 루시아 등대로",action:"v10-to-lighthouse",primary:true}])}if(action==="v10-prologue:winch")return this.showV10BeaconDialogue(0)};
  proto.showV10BeaconDialogue=function(index){const lines=[["젊은 오르소","지금 렌즈를 내리면 저 세 척은 수로를 잃습니다. 알고 계십니까?"],["데미안 팔코","알고 있다. 오늘 밤의 죄를 피하려다 앞으로 수백 척의 길을 한 사람에게 넘길 수도 있다."],["젊은 오르소","그렇다면 이 명령과 사라지는 신호의 수를 모두 장부에 남기겠습니다."],["데미안 팔코","남겨라. 공로만 기록한 장부는 거짓말과 다르지 않다."]],line=lines[index],last=index===lines.length-1;this.e.dialogue(line[0],line[1],[{label:last?"권양기를 내린다":"계속",action:last?"v10-extinguish":`v10-beacon-line:${index+1}`,primary:last}])};
  proto.showV10EstateDialogue=function(index){const lines=[["왕실 압류관","팔코 저택과 창고는 오늘 일몰에 봉인됩니다. 1511년 호송대 배상 채권의 합법적인 집행입니다."],["리안 팔코","사람들이 죽은 빚을 해운회사가 사들인 뒤, 이제 그 빚으로 우리 집까지 사겠다는 겁니까?"],["데미안 팔코","새벽까마귀는 오르소 명의다. 압류할 수 없는 마지막 배지. 안트베르펜의 보험 장부를 찾아라."],["리안 팔코","가문의 명예가 아니라 이 집과 선원들의 몫을 지키기 위해 갑니다. 아버지가 감춘 것도 제 눈으로 확인하겠습니다."]],line=lines[index],last=index===lines.length-1;this.e.dialogue(line[0],line[1],[{label:last?"조선소로 간다":"계속",action:last?"v10-estate-done":`v10-estate-line:${index+1}`,primary:last}])};
  proto.finishV10Prologue=function(){const ps=this.s.prologueState;ps.phase="town";ps.actorId="rian";ps.era=1526;ps.completed=true;ps.checkpoint="prologue-complete";this.mode="town";this.s.flags.v9PrologueSeen=true;this.s.flags.cutsceneSeen=true;this.s.flags.metFather=true;this.s.flags.shipGranted=false;this.s.fleet[0].locked=true;this.s.town={x:28,y:7.5,dir:4};this.lastSafe={x:28,y:7.5};for(const id of["v9_ch0_intro","v9_ch0_turn"])if(!this.s.cutsceneState.seen.includes(id))this.s.cutsceneState.seen.push(id);this.spawnTownNpcs();this.campaignSystem.syncQuest(this.s);this.saveV10Checkpoint("town");this.syncRegionMusic();this.e.close();this.e.toast("리스본 조선소에서 새벽까마귀를 인수하십시오")};

  proto.update=function(dt){if(this.mode==="prologue-v10")return this.updateV10Prologue(dt);return oldUpdate.call(this,dt)};
  proto.render=function(){if(this.mode==="prologue-v10"){this.help("방향키/WASD 이동 · Enter/Z 조사 · Esc/X 현재 장면 건너뛰기");this.art.v10Prologue(this);this.renderHud();return}return oldRender.call(this)};
  proto.renderHud=function(){if(this.mode==="prologue-v10"){this.e.hud.innerHTML="";return}return oldRenderHud.call(this)};

  proto.townBuildings=function(){const base=oldTownBuildings.call(this),p=HL.DATA.ports[this.s.currentPort],extra=[];if(this.s.currentPort==="bella"&&p.facilities.includes("bank"))extra.push({id:"bank",name:"은행",door:[11,15],virtual:true});if(p.facilities.includes("estate"))extra.push({id:"estate",name:"부동산",door:[14,15],virtual:true});if(this.s.properties?.[this.s.currentPort])extra.push({id:"home",name:"선장의 집",door:[2,15],virtual:true});return[...base,...extra]};
  proto.buildingFacility=function(id){if(id==="mansion"&&this.s.currentPort!=="bella"&&HL.DATA.ports[this.s.currentPort].facilities.includes("bank"))return"bank";return id};
  proto.enterInterior=function(id){const facility=this.buildingFacility(id),building=HL.DATA.buildingScenes[this.s.currentPort]?.[facility];if(!building)return;const floor=building.floors[building.entryFloor];this.playerVelocity={x:0,y:0};this.beginTransition(()=>{this.mode="interior";this.s.interior={id,buildingId:facility,floorId:building.entryFloor,x:floor.spawn[0],y:floor.spawn[1],dir:0};this.lastSafe={x:floor.spawn[0],y:floor.spawn[1]};this.e.close();if(facility==="shipyard"&&!this.s.flags.shipGranted)this.saveV10Checkpoint("shipyard-arrival");else this.save();this.e.sfx("port_bell",.3)})};
  proto.currentBuilding=function(){return HL.DATA.buildingScenes[this.s.currentPort]?.[this.s.interior?.buildingId||this.s.interior?.id]};
  proto.interiorScene=function(){const building=this.currentBuilding();return building?.floors[this.s.interior?.floorId||building?.entryFloor]||null};
  proto.changeFloor=function(link){const floor=this.currentBuilding()?.floors[link.toFloor];if(!floor)return;this.beginTransition(()=>{this.s.interior.floorId=link.toFloor;this.s.interior.x=link.spawn?.[0]||floor.spawn[0];this.s.interior.y=link.spawn?.[1]||floor.spawn[1];this.s.interior.dir=(link.approach+4)%8;this.lastSafe={x:this.s.interior.x,y:this.s.interior.y};this.save();this.e.sfx("wood_knock",.25)})};
  proto.interactInterior=function(){const scene=this.interiorScene(),v=HL.DATA.directions[this.s.interior.dir],x=this.s.interior.x+v[0]*1.2,y=this.s.interior.y+v[1]*1.2,stair=(scene.stairs||[]).find(s=>this.distanceToRect(x,y,s.rect)<.9);if(stair)return this.changeFloor(stair);const hot=(scene.hotspots||[]).find(h=>this.distanceToRect(x,y,h.rect)<1);if(hot)return this.executeV10InteriorAction(hot.action);const npc=(scene.npcs||[]).find(n=>Math.hypot(x-n.x,y-n.y)<1.05);if(npc)return this.executeV10InteriorAction(`facility:${scene.facility}`);if(this.pointInRect(x,y,scene.exit.rect))this.leaveInterior()};
  proto.executeV10InteriorAction=function(action){if(action.startsWith("facility:")){const id=action.slice(9);if(id==="mansion")return this.mansionStory();return{market:()=>this.marketMenu(),inn:()=>this.innMenu(),shipyard:()=>this.shipyardMenu(),guild:()=>this.guildMenu(),lodge:()=>this.lodgeMenu(),harbor:()=>this.harborMenu()}[id]?.()}if(action==="home-menu")return this.propertyMenu();if(action==="story-ledger")return this.e.dialogue(this.ownerName("mansion"),"푸른 잉크는 항구가 아니라 같은 날짜의 바람을 잇는다. 몇 장은 칼로 잘라 낸 듯 비어 있다.",[{label:"덮는다",action:"close"}]);if(action==="story-chart")return this.e.dialogue("리안 팔코","가족 해도의 서쪽 가장자리에는 어머니의 글씨가 남아 있다. '길을 숨긴 사람과 길을 훔친 사람을 구별할 것.'",[{label:"기억한다",action:"close"}]);if(action==="v10-room-bed")return this.e.dialogue("리안 팔코","아침마다 아래층의 언쟁을 모른 척하고 싶었다. 오늘은 그럴 수 없었다.",[{label:"일어난다",action:"close"}]);if(action==="v10-room-notice")return this.e.dialogue("왕실 압류 통지서","1511년 조난 배상 채권. 오늘 일몰까지 변제가 없으면 저택과 창고를 봉인한다. 채권자는 왕립 해운회사 마티아스 벨로르.",[{label:"접는다",action:"close"}]);if(action==="v10-room-keepsake")return this.e.dialogue("어머니의 작은 나침반","바늘은 오래전에 멎었다. 뒷면에는 '돌아올 곳이 있어야 항해도 길이 된다'고 새겨져 있다.",[{label:"내려놓는다",action:"close"}]);if(action==="v10-room-school")return this.e.dialogue("왕립 항해학교 통지","리안 팔코. 필기 우수, 실선 지휘 부적합. 풍랑 중 판단을 미루는 버릇을 고치기 전까지 승선 실습을 허가하지 않음.",[{label:"구겨 넣는다",action:"close"}]);return this.dispatchAction(action)};
  proto.ownerName=function(id){if(id==="bank")return"은행가";if(id==="estate")return"부동산 중개인";if(id==="home")return"선장의 집";return oldOwnerName.call(this,id)};

  proto.dispatchAction=function(action,button){
    if(action==="v10-skip-cancel"){this.e.close();return}if(action==="v10-skip-current")return this.skipV10Phase();
    if(action==="v10-to-lighthouse"){this.e.close();return this.setV10Phase("lighthouse",[7,13])}
    if(action.startsWith("v10-beacon-line:")){this.e.close();return this.showV10BeaconDialogue(+action.split(":")[1])}
    if(action==="v10-extinguish"){this.s.prologueState.flags.beaconExtinguished=true;this.e.close();this.e.sfx("wood_knock",.8);return this.setV10Phase("storm")}
    if(action.startsWith("v10-estate-line:")){this.e.close();return this.showV10EstateDialogue(+action.split(":")[1])}
    if(action==="v10-estate-done"){this.s.prologueState.flags.estateHeard=true;this.e.close();return this.finishV10Prologue()}
    if(action.startsWith("v10-prologue:"))return this.handleV10PrologueAction(action);
    const result=oldDispatch.call(this,action,button);if(action==="accept-ship"||action==="story-accept")this.saveV10Checkpoint("shipyard-arrival");return result
  };
})();
