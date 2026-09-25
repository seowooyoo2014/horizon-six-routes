window.HL=window.HL||{};
(function(){
  "use strict";const copy=v=>JSON.parse(JSON.stringify(v));
  const blocked=(scene,x,y)=>!scene||new HL.CollisionWorld(.28).blocked(scene.collision,x,y,.28),nearest=(scene,x,y)=>{if(!blocked(scene,x,y))return[x,y];for(let r=.5;r<10;r+=.5)for(let a=0;a<Math.PI*2;a+=Math.PI/8){const nx=x+Math.cos(a)*r,ny=y+Math.sin(a)*r;if(!blocked(scene,nx,ny))return[nx,ny]}return[...scene.spawn]};
  HL.migrateStateV15=function(prior){const s=HL.migrateStateV13(copy(prior||HL.Game.freshState()));s.version=15;s.graphicsVersion=15;s.v15={migratedAt:Date.now(),lisbonInteriors:true,...(s.v15||{})};if(s.mode==="interior"&&s.interior){const f=s.interior.buildingId||s.interior.id,b=HL.DATA.buildingScenes[s.currentPort]?.[f],floor=b?.floors[s.interior.floorId]||b?.floors[b?.entryFloor];if(floor){const q=nearest(floor,Number(s.interior.x)||floor.spawn[0],Number(s.interior.y)||floor.spawn[1]);Object.assign(s.interior,{buildingId:f,floorId:floor.floorId,x:q[0],y:q[1]})}else{s.mode="town";s.interior=null}}return s};
  const e=HL.Engine.prototype;e.v14SlotKey=i=>`horizon-ledger-v14-slot-${i}`;e.v13SlotKey=i=>`horizon-ledger-v13-slot-${i}`;e.slotKey=i=>`horizon-ledger-v15-slot-${i}`;e.loadSlot=function(i){try{const s=JSON.parse(localStorage.getItem(this.slotKey(i)));return s?.version===15?s:null}catch{return null}};e.migrateOld=function(i){if(this.loadSlot(i))return;try{const keys=[this.v14SlotKey(i),this.v13SlotKey(i),`horizon-ledger-v12-slot-${i}`,`horizon-ledger-v11-slot-${i}`,`horizon-ledger-v10-slot-${i}`,`horizon-ledger-v9-slot-${i}`,`horizon-ledger-v8-slot-${i}`,`horizon-ledger-v7-slot-${i}`,`horizon-ledger-v6-slot-${i}`,`horizon-ledger-v5-slot-${i}`],old=keys.map(k=>JSON.parse(localStorage.getItem(k)||"null")).find(Boolean);if(old)this.saveSlot(i,HL.migrateStateV15(old))}catch(error){console.warn("v15 save migration failed",error)}};e.deleteSlot=function(i){localStorage.removeItem(this.slotKey(i))};
  const p=HL.Game.prototype,oldFresh=HL.Game.freshState,oldEnsure=p.ensureExpansion,oldDispatch=p.dispatchAction;
  HL.Game.freshState=function(){const s=oldFresh.call(this);s.version=15;s.graphicsVersion=15;s.v15={migratedAt:Date.now(),lisbonInteriors:true};return s};
  p.ensureExpansion=function(){oldEnsure.call(this);if(this.s){this.s.version=15;this.s.graphicsVersion=15;this.s.v15={migratedAt:Date.now(),lisbonInteriors:true,...(this.s.v15||{})}}};
  p.dispatchAction=function(action,button){
    if(action.startsWith("v15-inspect:")){
      const key=action.slice(12),texts={cloth:"손으로 짠 직물 견본마다 산지와 염료 값이 적혀 있다.",kitchen:"구리 냄비에서는 선원들에게 내놓을 따뜻한 수프가 끓고 있다.",wash:"긴 항해 뒤 몸을 씻을 수 있도록 빗물과 데운 물을 섞어 둔다.",rope:"굵기와 꼬임이 다른 밧줄이 출항 순서에 맞춰 정돈돼 있다.",letters:"봉랍 색만 보아도 어느 나라와 길드에서 온 서신인지 알 수 있다.",tea:"찻잔 하나는 오래 식었고, 맞은편 자리는 여전히 비어 있다.",manifest:"날짜와 무게, 선주의 서명을 맞춰 보면 화물이 지나온 항로가 드러난다.",model:"설계도 가장자리에는 바람을 덜 받는 새 돛 배치가 연필로 덧그려져 있다."};
      return this.e.dialogue("조사",texts[key]||"매일 쓰인 흔적이 이곳의 역할을 분명히 보여 준다.",[{label:"돌아선다",action:"close"}])
    }
    return oldDispatch.call(this,action,button)
  };
})();
