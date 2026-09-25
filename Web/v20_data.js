window.HL=window.HL||{};
(function(){
  "use strict";
  const D=HL.DATA,ROOT="../Assets/Resources/Sprites/Game/V20/",dirs=["N","NE","E","SE","S","SW","W","NW"];
  const captainLooks={
    kemal:{base:"tall_harbormaster",tint:"#16786f",accent:"#e2bd62",head:"turban",tool:"rope"},
    ines:{base:"slim_scholar",tint:"#a74343",accent:"#f0cb78",head:"braid",tool:"sextant"},
    duarte:{base:"broad_noble",tint:"#315d91",accent:"#e5c46f",head:"cap",tool:"rapier"},
    matteo:{base:"short_artisan",tint:"#56734b",accent:"#d4ae63",head:"beret",tool:"lens"},
    anne:{base:"average_guard",tint:"#8f3440",accent:"#e4cc82",head:"ponytail",tool:"sabre"},
    marieke:{base:"average_merchant",tint:"#b07a2f",accent:"#356d7b",head:"hood",tool:"ledger"}
  };
  const makeFrames=()=>Object.fromEntries(dirs.map((dir,row)=>[dir,Array.from({length:10},(_,col)=>({x:col*48,y:row*72,w:48,h:72,pivot:[24,69],shadow:[24,69],collisionRadius:.28}))]));
  D.captainSpriteManifestsV20={};
  for(const [id,look] of Object.entries(captainLooks))D.captainSpriteManifestsV20[id]={id,version:20,frameWidth:48,frameHeight:72,directions:dirs,idleFrames:[0,1,2,3],walkFrames:[4,5,6,7,8,9],fps:{idle:3,walk:10},frames:makeFrames(),images:{town:`${ROOT}Captains/${id}_town_v20.png`,interior:`${ROOT}Captains/${id}_interior_v20.png`},look};
  D.npcPaletteRecipesV20={cultures:{iberia:["#b45a45","#315f75","#c1964d"],north:["#70465a","#386777","#8d774d"],med:["#a94f42","#34716d","#d09a4d"],ottoman:["#2f746c","#8e4257","#c19646"],africa:["#aa5938","#3f6d55","#d0a04f"],arabia:["#3e6e73","#985149","#c9a255"],india:["#a1445c","#347064","#d29642"],seasia:["#9b493b","#2f7561","#c29047"],china:["#a43c3f","#3d6278","#c39842"],japan:["#8b4e53","#48677a","#9a8047"],caribbean:["#b65b39","#247282","#cf9745"],americas:["#a8543a","#4d704b","#bd8a46"]},minSceneDifferences:2};
  D.townArtKitV20={tileSize:30,layerOrder:["terrain","roads","water","buildings","landmarks","props","actors","weather"],animations:{water:8,flag:6,smoke:10,awning:5,tools:4}};
  const townThemes={
    constantinople:{name:"황금뿔 항만",palette:{ground:"#b89a6b",road:"#796754",roadHi:"#c6ae7b",wall:"#d7c58e",roof:"#39736f",roof2:"#9a4c49",wood:"#60402d",water:"#245f73",accent:"#d8ad51",green:"#496d43"},water:[0,33,64,3],dock:[28,30,8,3],landmark:{type:"fountain-court",rect:[28,14,5,5]},roads:[[29,0,6,33],[0,16,64,5],[9,7,46,4]],slots:{mansion:[3,3,9,5],guild:[16,3,9,5],market:[28,3,10,5],inn:[43,3,8,5],lodge:[54,3,7,5],bank:[3,23,8,5],estate:[14,23,8,5],shipyard:[43,23,10,5],harbor:[27,25,10,5]},props:["bazaar","lamp","orange","barrel","awning","rope"]},
    seville:{name:"과달키비르 지도 지구",palette:{ground:"#c5ad7d",road:"#8e765c",roadHi:"#dbc696",wall:"#e1d3ad",roof:"#b95f43",roof2:"#52768a",wood:"#67422d",water:"#2e687b",accent:"#d5a64d",green:"#567746"},water:[0,0,5,36],dock:[5,15,4,7],landmark:{type:"orange-court",rect:[28,14,6,5]},roads:[[7,15,57,6],[29,0,6,36],[12,7,43,4]],slots:{harbor:[7,4,8,5],guild:[18,3,10,5],mansion:[40,3,10,5],bank:[53,4,8,5],market:[9,25,10,5],inn:[22,25,8,5],lodge:[34,25,8,5],shipyard:[47,24,11,6],estate:[3,25,6,5]},props:["orange","fountain","awning","cart","mapstall","lamp"]},
    bella:{name:"테주 언덕 항구",palette:{ground:"#b9a77f",road:"#756d65",roadHi:"#d2c59f",wall:"#e0d6b6",roof:"#a54d3e",roof2:"#356d83",wood:"#62412e",water:"#2a6376",accent:"#d9b154",green:"#477046"},water:[0,33,64,3],dock:[27,29,10,4],landmark:{type:"azulejo-fountain",rect:[29,14,5,5]},roads:[[28,0,7,33],[0,15,64,6],[6,7,52,4]],slots:{mansion:[4,3,11,5],guild:[19,3,9,5],market:[37,3,10,5],bank:[52,3,8,5],estate:[4,24,8,5],inn:[15,24,8,5],lodge:[40,24,8,5],shipyard:[50,23,11,6],harbor:[27,24,10,5]},props:["azulejo","orange","laundry","cart","rope","lamp"]},
    venice:{name:"리알토 수로 지구",palette:{ground:"#aa9872",road:"#746b63",roadHi:"#c7b891",wall:"#d0bd91",roof:"#9b4c42",roof2:"#315f70",wood:"#5a3b2a",water:"#286276",accent:"#d4a750",green:"#4c7043"},water:[0,15,27,6],canals:[[38,15,26,6],[30,0,5,14],[30,22,5,14]],dock:[25,14,14,8],landmark:{type:"canal-bridge",rect:[27,14,11,8]},roads:[[5,7,54,5],[5,25,54,5]],slots:{market:[5,3,10,5],guild:[18,3,9,5],mansion:[39,3,10,5],bank:[52,3,8,5],harbor:[4,23,9,5],inn:[16,25,8,5],lodge:[40,25,8,5],estate:[51,25,9,5],shipyard:[3,9,11,5]},props:["gondola","lamp","awning","barrel","bridgepost","rope"]},
    london:{name:"템스 조선 부두",palette:{ground:"#8e8d84",road:"#5e6268",roadHi:"#aaa9a0",wall:"#b9ae95",roof:"#584d55",roof2:"#8d493f",wood:"#55402f",water:"#315b69",accent:"#c39b4c",green:"#415f42"},water:[0,33,64,3],dock:[25,29,14,4],landmark:{type:"guild-clock",rect:[29,13,5,6]},roads:[[28,0,7,33],[0,15,64,6],[7,7,50,4]],slots:{mansion:[3,3,9,5],guild:[15,3,9,5],bank:[39,3,9,5],estate:[51,3,9,5],market:[4,24,9,5],inn:[16,24,8,5],lodge:[40,24,8,5],shipyard:[50,22,11,7],harbor:[27,24,10,5]},props:["crane","smoke","barrel","rope","lamp","cart"]},
    lume:{name:"스헬더 상업 지구",palette:{ground:"#9c9380",road:"#66686b",roadHi:"#b6ad98",wall:"#b79c7d",roof:"#75413d",roof2:"#3b6070",wood:"#5c3b29",water:"#2c6170",accent:"#cf9f49",green:"#466448"},water:[0,0,5,36],canals:[[0,0,5,36],[30,0,5,15]],dock:[5,14,5,8],landmark:{type:"brick-bourse",rect:[28,13,8,7]},roads:[[7,15,57,6],[10,6,48,5],[29,20,6,16]],slots:{market:[8,3,10,5],guild:[21,3,8,5],bank:[38,3,9,5],mansion:[50,3,10,5],harbor:[7,24,8,5],inn:[18,25,8,5],lodge:[40,25,8,5],estate:[51,25,9,5],shipyard:[3,8,10,5]},props:["warehouse","crane","barrel","cart","lamp","rope"]}
  };
  function applySpecialTown(id,theme){
    const map=D.townDefinitionsV19[id];if(!map)return;const buildings=[];
    for(const old of map.buildings){const r=theme.slots[old.id]||old.rect,door=[r[0]+Math.floor(r[2]/2),r[1]+r[3]+.35];buildings.push({...old,rect:[...r],door})}
    const harbor=buildings.find(b=>b.id==="harbor")||buildings[0],water=theme.water,landmark=[...theme.landmark.rect],solids=[...buildings.map(b=>[...b.rect]),[...water]];if(theme.landmark.type!=="canal-bridge")solids.push([...landmark]);
    for(const canal of theme.canals||[])if(!solids.some(r=>r.join(",")===canal.join(",")))solids.push([...canal]);
    map.buildings=buildings;map.water=[...water];map.dock=[...theme.dock];map.landmark={type:theme.landmark.type,rect:landmark};map.spawn=[harbor.door[0],harbor.door[1]+.9];map.roads=theme.roads.map(r=>[...r]);map.canals=(theme.canals||[]).map(r=>[...r]);
    const occupied=[...solids,[...theme.dock]],clear=(x,y)=>!occupied.some(r=>x>=r[0]-.7&&x<=r[0]+r[2]+.7&&y>=r[1]-.7&&y<=r[1]+r[3]+.7)&&!buildings.some(b=>Math.hypot(x-b.door[0],y-b.door[1])<2.1),props=[];
    for(let i=0;i<120&&props.length<30;i++){const x=5+((map.seed+i*11)%54),y=3+(((map.seed>>>6)+i*7)%29);if(clear(x,y)&&!props.some(o=>Math.hypot(o.x-x,o.y-y)<1.2))props.push({type:theme.props[i%theme.props.length],x,y,variant:(map.seed+i)%5,decorative:true})}
    map.props=props;map.visual={version:20,nativeTile:30,special:true,theme:id};map.artTheme=theme;map.collision={walkBounds:[1,1,map.width-2,map.height-2],solids,polygons:[],doors:buildings.map(b=>({id:b.id,rect:[b.door[0]-.65,b.door[1]-.65,1.3,1.3]}))};
    map.npcs.forEach((npc,i)=>{npc.x=12+(i*8)%40;npc.y=12+(i%2)*10;npc.bounds=[7,6,58,31]});
  }
  for(const [id,theme] of Object.entries(townThemes))applySpecialTown(id,theme);
  D.specialTownDefinitionsV20=Object.fromEntries(Object.keys(townThemes).map(id=>[id,D.townDefinitionsV19[id]]));
  const special={
    kemal:{port:"constantinople",facility:"harbor",background:`${ROOT}Interiors/constantinople_harbor_v20.png`,owner:[20,4.8]},
    ines:{port:"seville",facility:"guild",background:`${ROOT}Interiors/seville_guild_v20.png`,owner:[20,4.8]},
    duarte:{port:"bella",facility:"mansion",background:`${ROOT}Interiors/lisbon_mansion_v20.png`,owner:[20,4.8]},
    matteo:{port:"venice",facility:"market",background:`${ROOT}Interiors/venice_appraisal_v20.png`,owner:[20,4.8]},
    anne:{port:"london",facility:"harbor",background:`${ROOT}Interiors/london_harbor_v20.png`,owner:[20,4.8]},
    marieke:{port:"lume",facility:"market",background:`${ROOT}Interiors/antwerp_warehouse_v20.png`,owner:[20,4.8]}
  };
  const actions={market:"facility:market",guild:"facility:guild",harbor:"facility:harbor",mansion:"facility:mansion"};
  const labels={market:["감정대","거래 장부","보관 선반"],guild:["조수표","압수 목록","스승의 책상"],harbor:["선원 명부","목격자의 자리","항만 기록"],mansion:["가문 장부","생존자의 편지","원정 인장"]};
  const solids=[[0,0,40,2.3],[0,0,1.2,22],[38.8,0,1.2,22],[0,21.2,18.7,.8],[21.3,21.2,18.7,.8],[15.1,10.8,10.1,5.2],[15.8,3.1,8.4,3.2],[1.1,3.2,7.5,5.3],[31.2,3.1,7.6,5.5],[1.2,11.1,6.8,7.8],[32,11.3,6.8,7.6]];
  D.specialInteriorsV20=special;
  for(const [captainId,spec] of Object.entries(special)){
    const floor=D.buildingScenes[spec.port]?.[spec.facility]?.floors?.["1f"];if(!floor)continue;
    const opening=D.playableOpeningsV19[captainId],names=labels[spec.facility]||["오늘의 일","찾아온 사람","출항의 단서"];
    floor.width=40;floor.height=22;floor.tiles=Array.from({length:22},()=>Array(40).fill("floor"));floor.props=[];floor.rooms=[{id:"main",rect:[1.2,2.3,37.6,18.9]}];floor.spawn=[20,19.5];floor.exit={rect:[18.7,20.4,2.6,1.6],label:"밖으로"};
    floor.hotspots=[
      {id:"opening-work",rect:[10.5,12.1,3,2.4],label:names[0],action:"v19-opening:work"},
      {id:"opening-witness",rect:[27,12,3,2.4],label:names[1],action:"v19-opening:witness"},
      {id:"opening-confirm",rect:[18,5.2,4,2],label:names[2],action:"v19-opening:confirm"},
      {id:"service",rect:[16,4.8,8,2.4],label:`${D.buildingScenes[spec.port][spec.facility].name} 이용`,action:actions[spec.facility]},
      {id:"central-chart",rect:[15,10.8,10,5.2],label:"중앙 해도 탁자",action:"v18-inspect:maptable"},
      {id:"records",rect:[31,4,5,4],label:"항로 기록 게시판",action:"v18-inspect:notice"},
      {id:"survey",rect:[2,4,6,5],label:"측량 도구",action:"v18-inspect:telescope"},
      {id:"stairs",rect:[34,15.5,4,4.5],label:"위층 계단",action:"v18-inspect:stair"}
    ];
    floor.npcs=[{id:"owner",name:D.buildingScenes[spec.port][spec.facility].name+" 책임자",x:spec.owner[0],y:spec.owner[1],dir:4,appearanceId:`owner_${spec.port}_${spec.facility}`,workZone:[16,3.5,8,2]}];
    floor.stairs=[];floor.visual={version:20,background:spec.background,nativeSize:[960,540],captainId};floor.navigation={walkBounds:[1.2,2.3,37.6,18.9],solids:solids.map(r=>[...r]),ownerZones:[[16,3.5,8,2]],corridorWidth:2};floor.collision={walkBounds:[1.2,2.3,37.6,18.9],solids:solids.map(r=>[...r]),polygons:[],doors:[],interactions:floor.hotspots};floor.actorScale=1;
  }
  for(const buildings of Object.values(D.buildingScenes))for(const building of Object.values(buildings))for(const floor of Object.values(building.floors))if(floor.visual?.version!==20)floor.visual={...(floor.visual||{}),version:20,facility:floor.facility,culture:floor.culture,procedural:true};
  D.interiorArtKitsV20={tileSize:24,cultures:Object.keys(D.npcPaletteRecipesV20.cultures),layerOrder:["floor","lower-wall","low-props","actors","high-props","upper-wall","light"]};
  D.facilityLayoutsV20={market:"trade-hall",inn:"common-house",lodge:"infirmary",guild:"chart-house",shipyard:"dry-dock",harbor:"customs-office",mansion:"merchant-house",bank:"counting-house",estate:"contract-office",home:"captain-home"};
  D.version=20;
})();
