window.HL=window.HL||{};
(function(){
  "use strict";
  const copy=value=>JSON.parse(JSON.stringify(value));
  const pointBlocked=(scene,x,y)=>!scene||x<scene.navigation.walkBounds[0]||y<scene.navigation.walkBounds[1]||x>scene.navigation.walkBounds[0]+scene.navigation.walkBounds[2]||y>scene.navigation.walkBounds[1]+scene.navigation.walkBounds[3]||scene.navigation.solids.some(r=>x>=r[0]&&y>=r[1]&&x<=r[0]+r[2]&&y<=r[1]+r[3]);
  const nearestSafe=(scene,x,y)=>{if(!pointBlocked(scene,x,y))return[x,y];for(let radius=.5;radius<12;radius+=.5)for(let angle=0;angle<Math.PI*2;angle+=Math.PI/8){const nx=x+Math.cos(angle)*radius,ny=y+Math.sin(angle)*radius;if(!pointBlocked(scene,nx,ny))return[nx,ny]}return[...scene.spawn]};
  HL.migrateStateV12=function(prior){
    const state=HL.migrateStateV11(prior||HL.Game.freshState());state.version=12;state.graphicsVersion=12;state.v12={migratedAt:Date.now(),camera:{x:0,y:0}};
    if(state.mode==="interior"&&state.interior){const facility=state.interior.buildingId||state.interior.id,building=HL.DATA.buildingScenes[state.currentPort]?.[facility],floor=building?.floors[state.interior.floorId]||building?.floors[building?.entryFloor];if(floor){const safe=nearestSafe(floor,Number(state.interior.x)||floor.spawn[0],Number(state.interior.y)||floor.spawn[1]);state.interior.buildingId=facility;state.interior.floorId=floor.floorId;state.interior.x=safe[0];state.interior.y=safe[1]}else{state.mode="town";state.interior=null}}
    return state
  };
  const engine=HL.Engine.prototype,oldDelete=engine.deleteSlot;
  engine.v11SlotKey=function(i){return`horizon-ledger-v11-slot-${i}`};engine.slotKey=function(i){return`horizon-ledger-v12-slot-${i}`};
  engine.loadSlot=function(i){try{const value=JSON.parse(localStorage.getItem(this.slotKey(i)));return value&&value.version===12?value:null}catch{return null}};
  engine.migrateOld=function(i){if(this.loadSlot(i))return;try{const keys=[this.v11SlotKey(i),`horizon-ledger-v10-slot-${i}`,`horizon-ledger-v9-slot-${i}`,`horizon-ledger-v8-slot-${i}`,`horizon-ledger-v7-slot-${i}`,`horizon-ledger-v6-slot-${i}`,`horizon-ledger-v5-slot-${i}`],prior=keys.map(k=>JSON.parse(localStorage.getItem(k)||"null")).find(Boolean);if(prior)this.saveSlot(i,HL.migrateStateV12(prior))}catch(error){console.warn("v12 save migration failed",error)}};
  engine.deleteSlot=function(i){oldDelete.call(this,i);localStorage.removeItem(this.slotKey(i))};

  const proto=HL.Game.prototype,oldFresh=HL.Game.freshState,oldEnsure=proto.ensureExpansion,oldEnter=proto.enterInterior,oldChange=proto.changeFloor,oldDispatch=proto.dispatchAction;
  HL.Game.freshState=function(){const state=oldFresh.call(this);state.version=12;state.graphicsVersion=12;state.v12={camera:{x:0,y:0},enteredAt:0};return state};
  proto.ensureExpansion=function(){oldEnsure.call(this);if(this.s){this.s.version=12;this.s.graphicsVersion=12;this.s.v12=this.s.v12||{camera:{x:0,y:0},enteredAt:0}}};
  proto.enterInterior=function(id){if(this.s?.v12)this.s.v12.enteredAt=performance.now();return oldEnter.call(this,id)};
  proto.changeFloor=function(link){if(this.s?.v12)this.s.v12.enteredAt=performance.now();return oldChange.call(this,link)};
  const inspectText={lamp:"기름 심지가 일정하게 타고 있다. 이 항구의 밤일은 아직 끝나지 않은 모양이다.",wardrobe:"두꺼운 문짝 안쪽에 항구의 소금기가 하얗게 배어 있다.",barrels:"향과 봉인을 보니 가까운 항구에서 들어온 술이다.",fireplace:"젖은 외투와 밧줄을 말릴 만큼 불길이 오래 유지되고 있다.",crane:"도르래와 밧줄의 마모를 보면 오늘도 무거운 화물이 여러 번 오갔다.",telescope:"황동 경통에는 여러 항구의 위도가 작은 흠집으로 새겨져 있다.",scale:"추의 무게는 정확하다. 이곳 상인은 속임수보다 시세 차이로 돈을 버는 사람이다.",plans:"항구의 골목과 창고 위치가 표시된 매물 도면이 층층이 꽂혀 있다."};
  proto.showV12Inspect=function(key){this.e.dialogue("조사",inspectText[key]||"오래 사용한 흔적이 남아 있다. 이 항구에서 살아온 사람들의 손길이 느껴진다.",[{label:"돌아선다",action:"close"}])};
  proto.dispatchAction=function(action,button){if(action.startsWith("v12-inspect:"))return this.showV12Inspect(action.slice(12));return oldDispatch.call(this,action,button)};
})();
