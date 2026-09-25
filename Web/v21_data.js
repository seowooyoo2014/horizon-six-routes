window.HL=window.HL||{};
(function(){
  "use strict";
  const D=HL.DATA,G=HL.V21_GENERATED,starts=Object.keys(G.towns),captainPort={kemal:"constantinople",ines:"seville",duarte:"bella",matteo:"venice",anne:"london",marieke:"lume"};
  const openingFacility={kemal:"harbor",ines:"guild",duarte:"mansion",matteo:"market",anne:"harbor",marieke:"market"};
  const calls={
    kemal:{caller:"하산",wake:"카이르, 일어나게. 알렉산드리아에서 라에나를 보았다는 선원이 왔네.",task:"누락된 선원 명부를 대조하고 목격자의 매듭 표식을 확인하라."},
    ines:{caller:"마엘",wake:"세리아, 일어나요. 왕실 압류관들이 지도 공방 앞에 도착했어요.",task:"조수표의 오류를 고친 뒤 압수 목록에서 오르델의 기록을 찾아라."},
    duarte:{caller:"집사 로엔",wake:"도련님, 일어나십시오. 동방 원정에서 살아 돌아온 사람이 문 앞에 있습니다.",task:"밀린 임금을 정리하고 생존자가 가져온 편지와 인장을 확인하라."},
    matteo:{caller:"조수 니아",wake:"테오란, 일어나세요. 채권자가 왔고 잠수부가 이상한 인양 상자를 가져왔어요.",task:"의뢰품을 감정하고 상자의 계약 표식과 잉크 연대를 조사하라."},
    anne:{caller:"옛 부관 로웨",wake:"에린 대위님, 일어나십시오. 어젯밤 난파선에서 구조된 사람이 있습니다.",task:"손상 보고서를 작성하고 생존자의 항로 변경 증언을 확인하라."},
    marieke:{caller:"회계원 브람",wake:"메이라, 일어나요. 세인 도르프의 서명이 함부르크 보증서에서 발견됐습니다.",task:"남은 상품을 세고 이중 보증서의 발행 날짜를 대조하라."}
  };
  const townVisuals={};
  for(const portId of starts){
    const source=G.towns[portId],map=D.townDefinitionsV19[portId],oldNpcs=map.npcs||[];
    map.width=source.width;map.height=source.height;map.spawn=[...source.spawn];map.water=[...source.water];map.dock=[...source.dock];map.roads=source.roads.map(r=>[...r]);
    map.buildings=source.buildings.map((b,i)=>({...b,name:b.label,style:i%4,door:[...b.door]}));map.npcs=oldNpcs.map((n,i)=>({...n,x:8+(i*9)%48,y:11+(i%2)*9,bounds:[3,9,61,31]}));
    map.collision={walkBounds:[1,1,62,34],solids:source.solids.map(r=>[...r]),polygons:[],doors:source.buildings.map(b=>({id:b.id,rect:[b.door[0]-.65,b.door[1]-.65,1.3,1.3]}))};
    map.visual={version:21,special:true,background:source.background,foreground:source.foreground,collisionImage:source.collisionImage,nativeSize:[1920,1080],tileSize:30};map.structuralHash=source.structuralHash;townVisuals[portId]=map;
  }
  const floorVisuals={};
  for(const portId of starts){floorVisuals[portId]={};for(const [facility,floors] of Object.entries(G.floors[portId])){
    const building=D.buildingScenes[portId][facility]||(D.buildingScenes[portId][facility]={id:`${portId}-${facility}`,portId,facility,name:facility,entryFloor:"1f",floors:{}}),fallbackFloors={...building.floors};floorVisuals[portId][facility]={};
    for(const [floorId,q] of Object.entries(floors)){
      const exit=floorId==="1f"?{...q.exit,rect:[...q.exit.rect]}:{...q.exit,rect:[-10,-10,1,1]},scene={id:`${portId}-${facility}-${floorId}`,portId,facility,floorId,culture:D.ports[portId].culture,width:q.width,height:q.height,spawn:[...q.spawn],exit,stairs:q.stairs.map(s=>({...s,rect:[...s.rect],spawn:[...s.spawn]})),props:q.props.map(o=>({...o})),hotspots:q.hotspots.map(h=>({...h,rect:[...h.rect]})),npcs:floorId==="1f"?[{id:"owner",name:`${building.name||facility} 책임자`,x:20,y:4.8,dir:4,appearanceId:`owner_${portId}_${facility}`,workZone:[17,3,6,2.5]}]:[],rooms:[],tiles:[],navigation:{walkBounds:[...q.walkBounds],solids:q.solids.map(r=>[...r]),ownerZones:[[17,3,6,2.5]],corridorWidth:2},collision:{walkBounds:[...q.walkBounds],solids:q.solids.map(r=>[...r]),polygons:[],doors:[],interactions:q.hotspots},visual:{version:21,background:q.background,foreground:q.foreground,collisionImage:q.collisionImage,nativeSize:[960,540],structuralHash:q.structuralHash,role:q.role},fallbackVisualV20:fallbackFloors[floorId]||fallbackFloors["1f"]||null};
      building.floors[floorId]=scene;floorVisuals[portId][facility][floorId]=scene;
    }
  }}
  for(const [captainId,portId] of Object.entries(captainPort)){
    const wake=floorVisuals[portId].lodge["2f"],call=calls[captainId],facility=openingFacility[captainId],work=floorVisuals[portId][facility]["1f"];
    wake.hotspots.push({id:"wake-bed",rect:[4,4,3,2],label:"침대",action:"v21-wake:bed"},{id:"wake-caller",rect:[8,5,2,2],label:call.caller,action:"v21-wake:caller"});wake.collision.interactions=wake.hotspots;
    wake.npcs.push({id:`caller-${captainId}`,name:call.caller,x:9,y:7,dir:6,appearanceId:`caller_${captainId}`,workZone:[7,5,5,5]});
    work.hotspots.unshift({id:"opening-work",rect:[8,12,3,2],label:"오늘의 업무",action:"v21-opening:work"},{id:"opening-news",rect:[29,12,3,2],label:"도착한 소식",action:"v21-opening:news"},{id:"opening-consult",rect:[18,5,4,2],label:"가족·동료와 상의",action:"v21-opening:consult"},{id:"opening-prepare",rect:[18,17,4,2],label:"출항 준비 점검",action:"v21-opening:prepare"});work.collision.interactions=work.hotspots;
  }
  D.townVisualSetsV21=townVisuals;D.floorVisualSetsV21=floorVisuals;D.floorCollisionMasksV21=Object.fromEntries(starts.map(p=>[p,Object.fromEntries(Object.entries(floorVisuals[p]).map(([f,fs])=>[f,Object.fromEntries(Object.entries(fs).map(([id,s])=>[id,s.visual.collisionImage]))]))]));
  D.basementLinksV21={facilities:["market","inn","guild","mansion","shipyard"],entryFloor:"1f"};D.openingWakeDefinitionsV21={captainPort,openingFacility,calls};
  D.classicMarketRulesV21={dailyRecovery:.12,repeatBuyImpact:.018,repeatSellImpact:.016,minIndex:.55,maxIndex:1.75,investmentUnit:1000,economyPerUnit:8,specialtyThreshold:3000};
  D.classicSailingRulesV21={cargoGrace:.30,minCrewFactor:.35,maxNavigationBonus:.20,speedScale:1.25,roundEachStage:true,slowestShip:true,autoAvoidance:false};
  D.v21Types=["TownVisualSetV21","FloorVisualSetV21","FloorCollisionMaskV21","BasementLinkV21","OpeningWakeStateV21","ClassicMarketStateV21","ClassicSailingStateV21"];
  D.version=21;
})();
