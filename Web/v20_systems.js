window.HL=window.HL||{};
(function(){
  "use strict";
  const copy=v=>JSON.parse(JSON.stringify(v));
  HL.migrateStateV20=function(prior){
    const s=copy(prior||HL.Game.freshState()),previousTownRevision=s.v20?.townArtRevision||0;s.version=20;s.graphicsVersion=20;s.v20={spriteSystem:"explicit-8dir",interiorArt:"nautical-cutaway",migratedAt:Date.now(),...(s.v20||{}),townArtRevision:2};
    const town=HL.DATA.specialTownDefinitionsV20?.[s.currentPort];if(s.mode==="town"&&town&&previousTownRevision<2)s.town={x:town.spawn[0],y:town.spawn[1],dir:s.town?.dir??0};
    if(s.mode==="interior"&&s.interior){const id=s.interior.buildingId||s.interior.id,b=HL.DATA.buildingScenes[s.currentPort]?.[id],f=b?.floors[s.interior.floorId]||b?.floors[b?.entryFloor];if(f){s.interior.id=id;s.interior.buildingId=id;s.interior.floorId=f.floorId;s.interior.x=f.spawn[0];s.interior.y=f.spawn[1];s.interior.dir=s.interior.dir??0}else{s.mode="town";s.interior=null}}
    return s
  };
  const engine=HL.Engine.prototype;engine.v19SlotKey=i=>`horizon-ledger-v19-slot-${i}`;engine.slotKey=i=>`horizon-ledger-v20-slot-${i}`;
  engine.loadSlot=function(i){try{const s=JSON.parse(localStorage.getItem(this.slotKey(i)));return s?.version===20?s:null}catch{return null}};
  engine.migrateOld=function(i){if(this.loadSlot(i))return;try{const keys=[this.v19SlotKey(i),`horizon-ledger-v18-slot-${i}`,`horizon-ledger-v17-slot-${i}`,`horizon-ledger-v16-slot-${i}`,`horizon-ledger-v15-slot-${i}`],old=keys.map(k=>JSON.parse(localStorage.getItem(k)||"null")).find(Boolean);if(old)this.saveSlot(i,HL.migrateStateV20(old))}catch(error){console.warn("V20 저장 변환 실패",error)}};
  engine.deleteSlot=function(i){localStorage.removeItem(this.slotKey(i))};
  const game=HL.Game.prototype,oldFresh=HL.Game.freshState,oldEnsure=game.ensureExpansion,oldNew=game.newGame,oldResume=game.resume;
  HL.Game.freshState=function(){const s=oldFresh.call(this);s.version=20;s.graphicsVersion=20;s.v20={spriteSystem:"explicit-8dir",interiorArt:"nautical-cutaway",townArtRevision:2};return s};
  game.ensureExpansion=function(){oldEnsure.call(this);if(this.s){this.s.version=20;this.s.graphicsVersion=20;this.s.v20={spriteSystem:"explicit-8dir",interiorArt:"nautical-cutaway",...(this.s.v20||{}),townArtRevision:2}}};
  game.newGame=function(id=this.e.selectedCaptain||"kemal"){oldNew.call(this,id);this.s=HL.migrateStateV20(this.s);this.s.slot=this.e.selectedSlot;this.save()};
  game.resume=function(i){const state=this.e.loadSlot(i);if(!state)return this.showFiles();this.s=HL.migrateStateV20(state);this.s.slot=i;this.mode=this.s.mode||"town";this.ensureExpansion();this.spawnTownNpcs();this.e.close();this.ensureSafePosition();this.resetFollowersV19();this.e.playMusic(this.mode==="sea"?"sea":"port")};
})();
