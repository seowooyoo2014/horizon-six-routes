window.HL=window.HL||{};
(function(){
  "use strict";
  const D=HL.DATA,T=30,IT=24;
  const hash=value=>{let h=2166136261;for(const ch of String(value))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0};
  const rng=seed=>()=>{seed|=0;seed=seed+0x6d2b79f5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const cultures={
    iberia:{ground:"limestone",wall:"stucco",roof:"terracotta",plant:"orange",landmarks:["azulejo-fountain","arcade","watchtower"]},
    north:{ground:"cobble",wall:"brick",roof:"slate",plant:"elm",landmarks:["brick-bourse","canal-crane","guild-clock"]},
    med:{ground:"flagstone",wall:"sandstone",roof:"tile",plant:"cypress",landmarks:["loggia","campanile","marble-well"]},
    island:{ground:"coralstone",wall:"lime",roof:"tile",plant:"palm",landmarks:["sea-gate","signal-tower","cistern"]},
    maghreb:{ground:"warmstone",wall:"adobe",roof:"flat",plant:"date",landmarks:["horseshoe-gate","courtyard-well","caravan-yard"]},
    ottoman:{ground:"mosaic",wall:"plaster",roof:"dome",plant:"plane",landmarks:["covered-bazaar","domed-bath","fountain-court"]},
    africa:{ground:"redstone",wall:"coral",roof:"thatch",plant:"baobab",landmarks:["trade-court","carved-gate","canoe-yard"]},
    arabia:{ground:"sandstone",wall:"stucco",roof:"flat",plant:"date",landmarks:["wind-tower","incense-court","water-clock"]},
    india:{ground:"laterite",wall:"painted",roof:"tile",plant:"banyan",landmarks:["step-well","spice-hall","carved-pavilion"]},
    seasia:{ground:"packedearth",wall:"timber",roof:"steep",plant:"banana",landmarks:["stilt-market","river-shrine","warehouse-pier"]},
    china:{ground:"greybrick",wall:"plaster",roof:"curved",plant:"willow",landmarks:["moon-gate","tea-court","drum-tower"]},
    japan:{ground:"stonepath",wall:"timber",roof:"ceramic",plant:"pine",landmarks:["merchant-machiya","stone-lantern","canal-store"]},
    caribbean:{ground:"coralstone",wall:"painted",roof:"tile",plant:"palm",landmarks:["fort-battery","sugar-yard","arcaded-square"]},
    americas:{ground:"earthstone",wall:"adobe",roof:"tile",plant:"ceiba",landmarks:["river-landing","mission-court","silver-warehouse"]}
  };
  const capitalPorts=new Set(["bella","lume","seville","london","venice","constantinople","alexandria","goa","malacca","guangzhou","sakai","havana","cartagena"]);
  const corePorts=new Set(["bella","lume","seville","london","venice","constantinople","alexandria","athens","ceuta","massawa","aden","goa","malacca","guangzhou","sakai","havana","cartagena","bristol","hamburg","cape_verde","zanzibar"]);
  const facilityLabels={market:"시장",inn:"여관",shipyard:"조선소",guild:"항해자 길드",lodge:"숙소",harbor:"항만",mansion:"관청·저택",bank:"은행",estate:"부동산"};
  const mainFacilities=["market","inn","shipyard","guild","lodge","harbor","mansion"];
  function sizeFor(id,index){if(capitalPorts.has(id))return[64,36,"capital"];if(corePorts.has(id)||index<48)return[48,27,"medium"];return[32,18,"small"]}
  function buildingSlots(count,w,h,size,waterSide,seed){
    const left=waterSide==="west"?5:1,right=waterSide==="east"?w-5:w-1,bottom=waterSide==="south"?h-4:h-1;
    const bw=size==="small"?4:size==="medium"?6:7,bh=size==="small"?3:4,cx=Math.floor((left+right-bw)/2),cy=Math.floor((2+bottom-bh)/2);
    const xs=[left+1,cx,right-bw-1],ys=[2,cy,bottom-bh-1],slots=[];
    for(const y of ys)for(const x of xs)slots.push([x,y,bw,bh]);
    return slots.slice(0,count)
  }
  function spawnFor(w,h,waterSide){if(waterSide==="east")return[w-6.5,Math.floor(h/2)];if(waterSide==="west")return[5.5,Math.floor(h/2)];return[Math.floor(w/2),h-5]}
  function overlap(a,b,pad=1){return a[0]-pad<b[0]+b[2]&&a[0]+a[2]+pad>b[0]&&a[1]-pad<b[1]+b[3]&&a[1]+a[3]+pad>b[1]}
  function makeTown(id,index){
    const port=D.ports[id],seed=hash(`${id}:town:v19`),random=rng(seed),[w,h,size]=sizeFor(id,index),culture=cultures[port.culture]||cultures.med,waterSide=["south","east","west"][seed%3];
    const facilities=[...mainFacilities,...(port.facilities.includes("bank")?["bank"]:[]),...(port.facilities.includes("estate")?["estate"]:[])],buildings=[],dockApproach=spawnFor(w,h,waterSide),slots=buildingSlots(facilities.length,w,h,size,waterSide,seed);
    const harborIndex=slots.reduce((best,r,index)=>{const d=Math.hypot(r[0]+r[2]/2-dockApproach[0],r[1]+r[3]+.35-dockApproach[1]);return d<best.d?{index,d}:best},{index:0,d:Infinity}).index,harborSlot=slots[harborIndex],available=slots.filter((_,i)=>i!==harborIndex);
    facilities.forEach((facility,i)=>{const r=facility==="harbor"?harborSlot:available.splice((seed+i*17)%available.length,1)[0],door=[r[0]+Math.floor(r[2]/2),r[1]+r[3]+.35];buildings.push({id:facility,label:facilityLabels[facility],rect:r,door,style:(seed+i*13)%6,questTarget:false})});
    const harborBuilding=buildings.find(b=>b.id==="harbor"),spawn=[harborBuilding.door[0],harborBuilding.door[1]+.9];
    const water=waterSide==="south"?[0,h-3,w,3]:waterSide==="east"?[w-4,0,4,h]:[0,0,4,h],dock=waterSide==="south"?[Math.floor(w/2)-2,h-5,5,2]:waterSide==="east"?[w-6,Math.floor(h/2)-2,2,5]:[4,Math.floor(h/2)-2,2,5];
    const landmark=culture.landmarks[(seed>>>5)%culture.landmarks.length],landmarkSize=size==="small"?2:3,landmarkCandidates=[[Math.floor(w/2-landmarkSize/2),Math.floor(h/2-landmarkSize/2)],[Math.floor(w*.35),Math.floor(h*.52)],[Math.floor(w*.65)-landmarkSize,Math.floor(h*.48)]],landmarkPoint=landmarkCandidates.find(([x,y])=>!buildings.some(b=>overlap([x,y,landmarkSize,landmarkSize],b.rect,.5)))||landmarkCandidates[0],landmarkPos=[landmarkPoint[0],landmarkPoint[1],landmarkSize,landmarkSize];
    const solids=buildings.map(b=>[...b.rect]);solids.push(water,landmarkPos);
    const props=[];for(let i=0;i<12+Math.floor(random()*10);i++){const kind=["crate","barrel","stall","well","tree","bench","laundry","cart","rope","lamp"][Math.floor(random()*10)];let x=3+Math.floor(random()*(w-6)),y=5+Math.floor(random()*(h-10));if(solids.some(r=>x>=r[0]-1&&x<=r[0]+r[2]+1&&y>=r[1]-1&&y<=r[1]+r[3]+1))continue;props.push({type:kind,x,y,variant:(seed+i)%5})}
    const npcSeeds=["guide","merchant","sailor","scribe","porter","child"],npcs=[],freeForNpc=(x,y)=>x>1.5&&y>2.5&&x<w-1.5&&y<h-1.5&&!solids.some(r=>x>=r[0]-.55&&x<=r[0]+r[2]+.55&&y>=r[1]-.55&&y<=r[1]+r[3]+.55)&&!npcs.some(n=>Math.hypot(x-n.x,y-n.y)<1.4);
    npcSeeds.forEach((role,i)=>{let point=null;for(let n=0;n<w*h&&!point;n++){const x=2+((seed+i*31+n*7)%(w-4)),y=3+(((seed>>>7)+i*19+n*11)%Math.max(2,h-6));if(freeForNpc(x+.5,y+.5))point=[x+.5,y+.5]}point=point||[spawn[0]+(i%2?1:-1)*(1+i*.15),spawn[1]-1.2-i*.35];npcs.push({id:`${id}_${role}`,name:i===0?`${port.name} 안내인`:["상인","선원","서기관","짐꾼","아이"][i-1],appearanceId:`${id}_${role}`,x:point[0],y:point[1],bounds:[2,3,w-2,h-2],lines:[`${port.name}에서는 ${port.specialties.map(g=>D.goods.find(x=>x.id===g)?.name).filter(Boolean).join(", ")}을 자주 볼 수 있습니다.`,`${facilityLabels[mainFacilities[(seed+i)%mainFacilities.length]]}은 이 길을 따라가면 나옵니다.`]})});
    const signature=[w,h,waterSide,landmark,...buildings.map(b=>`${b.id}:${b.rect.join(".")}`)].join("|");
    return{id,width:w,height:h,size,culture:port.culture,cultureStyle:culture,seed,spawn,water,waterSide,dock,landmark:{type:landmark,rect:landmarkPos},buildings,props,npcs,visual:{version:19,nativeTile:T},collision:{walkBounds:[1,1,w-2,h-2],solids,polygons:[],doors:buildings.map(b=>({id:b.id,rect:[b.door[0]-.65,b.door[1]-.65,1.3,1.3]}))},signature}
  }
  D.townDefinitionsV19={};D.portOrder.forEach((id,index)=>D.townDefinitionsV19[id]=makeTown(id,index));
  const signatures=new Set;for(const map of Object.values(D.townDefinitionsV19)){let sig=map.signature;while(signatures.has(sig))sig+="+";signatures.add(sig);map.signature=sig}
  const oldTownFor=HL.WorldData.townMapFor.bind(HL.WorldData);HL.WorldData.townMapFor=id=>D.townDefinitionsV19[id]||oldTownFor(id);D.townMaps=D.townDefinitionsV19;

  const captainVisuals={
    kemal:{skin:"#bc7b54",hair:"#211b1a",coat:"#28766d",trim:"#e1b85f",head:"turban",tool:"ledger"},
    ines:{skin:"#d49a70",hair:"#43251e",coat:"#b15a43",trim:"#efd08a",head:"braid",tool:"sextant"},
    duarte:{skin:"#d3a073",hair:"#30241f",coat:"#345f98",trim:"#e5c26f",head:"cap",tool:"rapier"},
    matteo:{skin:"#c68b65",hair:"#5c3928",coat:"#76518e",trim:"#d9b46e",head:"beret",tool:"lens"},
    anne:{skin:"#d7a078",hair:"#9a512d",coat:"#8b3742",trim:"#e2c77d",head:"ponytail",tool:"sabre"},
    marieke:{skin:"#d6a47a",hair:"#c18a45",coat:"#397080",trim:"#e5ce88",head:"hood",tool:"account"},
    rian:{skin:"#d5a273",hair:"#33251d",coat:"#315f86",trim:"#d9b15d",head:"short",tool:"chart"}
  };
  for(const c of D.captainsV16)c.visual={...(captainVisuals[c.id]||captainVisuals.rian),portrait:c.portrait,portraitCell:c.portraitCell};
  D.captainVisualDefinitionsV19=captainVisuals;
  D.actorMovementProfileV19={display:[48,72],directions:8,idleFrames:4,walkFrames:6,speed:4.5,acceleration:28,collisionRadius:.28,interactionDistance:1.2,pivot:[24,69]};
  D.playableOpeningsV19={
    kemal:{facility:"harbor",title:"항만의 평범한 아침",work:"누락된 선원 명부를 날짜와 선박별로 정리했다.",witness:"부상당한 선원이 알렉산드리아에서 라에나와 닮은 통역사를 보았다며 그녀의 푸른 매듭을 내밀었다.",confirm:"항만장은 그 배가 홍해 방면으로 떠났음을 확인해 주었다.",objective:"조선소와 항만에서 푸른 등불호의 출항 준비를 마쳐라."},
    ines:{facility:"guild",title:"지도 공방의 기준선",work:"조수표와 실제 부두 수위를 비교해 해안선의 오차를 바로잡았다.",witness:"왕실 압류관이 들이닥쳐 스승 오르델과 여섯 권의 측량 기록을 끌고 갔다.",confirm:"견습생이 숨겨 둔 압수 목록에는 첫 기록의 목적지가 카디스로 적혀 있었다.",objective:"카디스로 갈 수 있도록 육분의와 보급을 확인하라."},
    duarte:{facility:"mansion",title:"채권자가 앉은 식탁",work:"하인들의 밀린 임금과 저택의 남은 식량을 장부에 적었다.",witness:"실패한 동방 원정의 생존자가 아버지의 편지와 낯선 교역 인장을 들고 돌아왔다.",confirm:"편지는 전설의 증명이 아니라 세우타에서 한 안내인을 찾아 달라는 부탁이었다.",objective:"세우타로 향할 배와 원정 보급을 준비하라."},
    matteo:{facility:"market",title:"감정소의 마지막 의뢰",work:"흔한 모조 성상을 가려내고 의뢰인에게 근거와 값을 설명했다.",witness:"채권자가 창고를 봉인하자 잠수부가 아버지의 계약 표식이 붙은 상자를 가져왔다.",confirm:"상자 속 계약서는 서명보다 잉크가 훨씬 새로웠고 원본 인양지는 아테네였다.",objective:"아테네의 난파선을 조사할 자금과 장비를 마련하라."},
    anne:{facility:"harbor",title:"구조 보고서",work:"손상된 민간선의 파공과 생존자 수를 직접 확인해 보고서에 적었다.",witness:"상관은 보고서를 폐기하라 명했지만 생존자는 봉쇄 함대가 구조 항로를 막았다고 증언했다.",confirm:"로드릭 베인은 국새 없는 사략 허가장을 내밀었다. 독립 지휘권을 얻어 진상을 확인할 유일한 길이었다.",objective:"브리스틀에서 옛 포수와 북풍의 맹세호를 준비하라."},
    marieke:{facility:"market",title:"불탄 창고의 열 닢",work:"타지 않은 천 한 묶음을 골라 금화 열 닢으로 첫 거래를 마쳤다.",witness:"회계원이 같은 화물에 서로 다른 보증서 두 장이 발급된 사실을 발견했다.",confirm:"두 번째 보증서에는 실종된 세인 도르프의 서명과 함부르크 창고 번호가 남아 있었다.",objective:"함부르크로 갈 첫 화물과 최소 보급을 마련하라."}
  };
  for(const [portId,buildings] of Object.entries(D.buildingScenes))for(const building of Object.values(buildings))for(const floor of Object.values(building.floors)){
    floor.visual={version:19,tileSize:IT,seed:hash(`${floor.id}:visual`)};floor.actorScale=1;
    const mx=Math.floor(floor.width/2),my=Math.floor(floor.height/2);floor.rooms=[
      {id:"northwest",rect:[1,2,mx-1,my-2]},{id:"northeast",rect:[mx,2,floor.width-mx-1,my-2]},
      {id:"southwest",rect:[1,my,mx-1,floor.height-my-1]},{id:"southeast",rect:[mx,my,floor.width-mx-1,floor.height-my-1]}
    ];
  }
  for(const c of D.captainsV16){
    const opening=D.playableOpeningsV19[c.id],floor=D.buildingScenes[c.startPort]?.[opening.facility]?.floors["1f"];
    if(!floor||floor.hotspots.length<4)continue;
    const sequence=["work","witness","confirm"];
    sequence.forEach((step,i)=>{const target=floor.hotspots[Math.min(floor.hotspots.length-1,i+1)];target.action=`v19-opening:${step}`;target.label=["오늘의 일","찾아온 사람","출항의 단서"][i];target.openingCaptain=c.id});
  }
  D.storyTriggersV19={career:D.careerProgressionV18,safeMoments:["dock","facility","npc","battle-end"]};
  D.version=19;
})();
