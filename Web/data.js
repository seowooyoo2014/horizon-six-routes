window.HL=window.HL||{};
HL.DATA={
  version:3,
  directions:[[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]],
  directionNames:["북","북동","동","남동","남","남서","서","북서"],
  goods:[
    {id:"glass",name:"유리 공예품",base:78},{id:"wine",name:"포도주",base:52},{id:"timber",name:"목재",base:64},
    {id:"salt",name:"소금",base:38},{id:"wool",name:"양모",base:48},{id:"spice",name:"향신료",base:180}
  ],
  ships:{
    caravel:{name:"카라벨",power:6,handling:8,cargo:40,crewMin:8,crewMax:36,hull:100,price:900},
    cog:{name:"코그",power:4,handling:5,cargo:65,crewMin:10,crewMax:44,hull:125,price:1200},
    galley:{name:"소형 갤리",power:7,handling:6,cargo:32,crewMin:18,crewMax:62,hull:140,price:1700},
    brig:{name:"브리그",power:8,handling:7,cargo:54,crewMin:20,crewMax:70,hull:165,price:2300}
  },
  ports:{
    bella:{name:"벨라 항",x:12,y:52,nation:"루시타 왕국",economy:430,industry:390,market:{glass:[72,62],wine:[55,43],timber:[68,55],salt:[41,33],wool:[57,46],spice:[205,170]}},
    lume:{name:"루메 항",x:27,y:43,nation:"갈리아 자유령",economy:380,industry:300,market:{glass:[126,112],wine:[38,31],timber:[49,41],salt:[44,35],wool:[43,35],spice:[190,158]}},
    genoa:{name:"제노아 남항",x:63,y:49,nation:"남부 도시동맹",economy:590,industry:520,market:{glass:[143,126],wine:[46,37],timber:[82,68],salt:[34,27],wool:[52,42],spice:[165,138]}},
    azur:{name:"아주르 보급항",x:45,y:29,nation:"중립",economy:90,industry:70,market:{glass:[100,80],wine:[66,48],timber:[58,45],salt:[39,30],wool:[60,44],spice:[210,160]}}
  },
  townBuildings:[
    {id:"market",name:"시장",x:3,y:4,w:6,h:4,color:"#a6633d"},{id:"inn",name:"여관",x:12,y:3,w:6,h:5,color:"#7e4a37"},
    {id:"mansion",name:"팔코 저택",x:23,y:2,w:7,h:6,color:"#777d72"},{id:"shipyard",name:"조선소",x:3,y:13,w:7,h:5,color:"#755239"},
    {id:"guild",name:"길드",x:13,y:12,w:6,h:5,color:"#596b68"},{id:"lodge",name:"숙소",x:22,y:12,w:7,h:5,color:"#786140"},
    {id:"harbor",name:"항구",x:23,y:20,w:6,h:3,color:"#4c7180"}
  ],
  npcs:[
    {id:"orphan",name:"부두 아이",x:20,y:20,lines:["저택에서 사람을 보냈어요. 북동쪽 큰 건물이에요.","오늘은 바람이 동쪽으로 불어요. 돛을 잘 맞추세요!"]},
    {id:"merchant",name:"유리 상인",x:8,y:10,lines:["리스본 유리는 북쪽 안트베르펜에서 두 배 가까운 값을 받아요.","한 항구에 너무 많이 팔면 시세가 떨어져요."]},
    {id:"sailor",name:"퇴역 선원",x:20,y:9,lines:["바다에서는 배가 계속 나아가오. 방향을 먼저 정하고 메뉴를 열어 판단하시오.","망원경이 있으면 먼 항구와 함대를 먼저 발견할 수 있소."]}
  ]
};

const townBuildings=(variant=0)=>[
  {id:"market",name:"시장",x:1,y:2,w:6,h:5,door:[4,7],style:"shop"},
  {id:"inn",name:"여관",x:8,y:1,w:6,h:6,door:[11,7],style:"inn"},
  {id:"guild",name:"길드",x:17,y:1,w:6,h:6,door:[20,7],style:"guild"},
  {id:"mansion",name:"저택",x:25,y:1,w:6,h:6,door:[28,7],style:"mansion"},
  {id:"shipyard",name:"조선소",x:1,y:10,w:7,h:5,door:[5,15],style:"yard"},
  {id:"lodge",name:"숙소",x:9,y:11,w:6,h:4,door:[12,15],style:"lodge"},
  {id:"harbor",name:"항구",x:24,y:11,w:7,h:4,door:[27,15],style:"harbor"}
].map((b,i)=>variant&&i>3?{...b,x:b.x+(variant===1&&i===5?1:0)}:b);
const townNpcs=(port)=>[
  {id:"guide",name:port==="bella"?"부두 아이":"항구 안내인",x:17,y:14,bounds:[14,12,20,16],important:true,lines:["시설 이름표를 따라가면 길을 잃지 않아요.","광장 사람들은 시간마다 자리를 바꿔요."]},
  {id:"merchant",name:"행상인",x:14,y:9.5,bounds:[12,8,16,11],lines:["항구마다 잘 팔리는 물건이 다르답니다.","시세 장부는 시장 안쪽에 있어요."]},
  {id:"sailor",name:"노련한 선원",x:20,y:10.5,bounds:[17,8,20.5,12],lines:["출항 전에는 물과 식량을 반드시 살피시오.","길드 게시판에는 항로에 관한 소문도 붙소."]}
];
HL.DATA.townMaps={
  bella:{id:"bella",palette:"bella",spawn:[16,16],buildings:townBuildings(0),props:[{type:"fountain",x:16,y:10,block:true},{type:"barrel",x:22,y:13,block:true},{type:"crates",x:8,y:14,block:true},{type:"stall",x:14,y:8,block:true}],npcs:townNpcs("bella")},
  lume:{id:"lume",palette:"lume",spawn:[16,16],buildings:townBuildings(1),props:[{type:"well",x:16,y:10,block:true},{type:"cloth",x:7,y:9,block:true},{type:"barrel",x:23,y:13,block:true},{type:"bench",x:20,y:9,block:true}],npcs:townNpcs("lume")},
  genoa:{id:"genoa",palette:"genoa",spawn:[16,16],buildings:townBuildings(2),props:[{type:"statue",x:16,y:10,block:true},{type:"books",x:22,y:13,block:true},{type:"crates",x:8,y:14,block:true},{type:"stall",x:14,y:8,block:true}],npcs:[...townNpcs("genoa"),{id:"scribe",name:"서점 심부름꾼",x:24,y:8,bounds:[23,8,26,10],important:true,lines:["북동쪽 큰 건물이 남항 서점입니다."]}]},
  azur:{id:"azur",palette:"azur",spawn:[16,16],buildings:townBuildings(3),props:[{type:"well",x:16,y:10,block:true},{type:"nets",x:23,y:13,block:true},{type:"barrel",x:8,y:14,block:true},{type:"bench",x:14,y:8,block:true}],npcs:townNpcs("azur")}
};

const interior=(id,owner,hotspots,theme)=>({id,theme,walkArea:[3,11,28,16],spawn:[16,15],exit:{rect:[14,16,4,2],label:"나가기"},owner:{x:16,y:9,name:owner},hotspots});
HL.DATA.interiorScenes={
  market:interior("market","시장 주인",[{id:"owner",rect:[14,10,5,2],label:"거래하기",action:"facility:market"},{id:"stock",rect:[4,10,5,2],label:"상품 진열대",action:"facility:market"},{id:"ledger",rect:[23,10,4,2],label:"시세 장부",action:"market-view"}],"market"),
  inn:interior("inn","여관 주인",[{id:"owner",rect:[14,10,5,2],label:"여관 이용",action:"facility:inn"},{id:"rumor",rect:[4,10,5,2],label:"소문을 듣는다",action:"gossip"},{id:"dice",rect:[23,10,4,2],label:"주사위 탁자",action:"gamble"}],"inn"),
  shipyard:interior("shipyard","조선공",[{id:"owner",rect:[14,10,5,2],label:"조선소 이용",action:"facility:shipyard"},{id:"model",rect:[4,10,5,2],label:"선박 모형",action:"facility:shipyard"},{id:"bench",rect:[23,10,4,2],label:"수리 작업대",action:"repair"}],"shipyard"),
  guild:interior("guild","길드장",[{id:"owner",rect:[14,10,5,2],label:"길드 이용",action:"facility:guild"},{id:"board",rect:[4,10,5,2],label:"의뢰 게시판",action:"guild-job"},{id:"tools",rect:[23,10,4,2],label:"항해 도구",action:"facility:guild"}],"guild"),
  lodge:interior("lodge","숙소 관리인",[{id:"owner",rect:[14,10,5,2],label:"숙소 이용",action:"facility:lodge"},{id:"beds",rect:[4,10,5,2],label:"침대",action:"rest"},{id:"status",rect:[23,10,4,2],label:"상태 장부",action:"status"}],"lodge"),
  harbor:interior("harbor","항만 관리인",[{id:"owner",rect:[14,10,5,2],label:"항구 이용",action:"facility:harbor"},{id:"supply",rect:[4,10,5,2],label:"보급 창고",action:"facility:harbor"},{id:"papers",rect:[23,10,4,2],label:"출항 문서",action:"facility:harbor"}],"harbor"),
  mansion:interior("mansion","데미안 팔코",[{id:"owner",rect:[14,10,5,2],label:"이야기한다",action:"facility:mansion"},{id:"ledger",rect:[4,10,5,2],label:"항로 장부",action:"story-ledger"},{id:"chart",rect:[23,10,4,2],label:"벽면 해도",action:"story-chart"}],"mansion")
};

const appearancePalettes=[
  ["#246b82","#d5a56e","#213541"],["#874d32","#e0b07b","#3e2b25"],["#4f7046","#c99764","#26372d"],
  ["#6e446f","#d7a578","#35283c"],["#8a7138","#bc8358","#302b25"],["#3d6489","#e2b688","#222f42"],
  ["#7b3f42","#c88e62","#342427"],["#35706a","#d2a171","#203c3c"]
];
HL.DATA.appearances={
  rian:{body:"slim",hair:"tousled",outfit:"navigator",hat:"none",accessory:"satchel",palette:["#17617b","#d8a36f","#1d3340"],spriteSheet:"rian"},
  damian:{body:"tall",hair:"silver",outfit:"admiral",hat:"none",accessory:"ledger",palette:["#263f62","#d1a075","#b78a3c"],spriteSheet:"damian"},
  orso:{body:"broad",hair:"grey_beard",outfit:"sailor",hat:"blue_cap",accessory:"rope",palette:["#8a572d","#c58e62","#243f59"],spriteSheet:"orso"},
  acel:{body:"slim",hair:"black",outfit:"bookseller",hat:"round_cap",accessory:"book",palette:["#516449","#d6a478","#4b3027"],spriteSheet:"acel"},
  vardo:{body:"broad",hair:"dark",outfit:"officer",hat:"plumed",accessory:"sword",palette:["#702f38","#bd815c","#222936"],spriteSheet:"vardo"}
};
let appearanceIndex=0;
for(const [port,map] of Object.entries(HL.DATA.townMaps))for(const npc of map.npcs){npc.appearanceId=`${port}_${npc.id}`;const palette=appearancePalettes[appearanceIndex++%appearancePalettes.length];HL.DATA.appearances[npc.appearanceId]={body:appearanceIndex%3===0?"broad":appearanceIndex%2?"slim":"average",hair:`style_${appearanceIndex%6}`,outfit:`${port}_citizen`,hat:appearanceIndex%3?"cap":"none",accessory:["basket","satchel","rope","ledger"][appearanceIndex%4],palette,spriteSheet:"citizen"}}
for(const port of Object.keys(HL.DATA.townMaps))for(const id of Object.keys(HL.DATA.interiorScenes)){const key=`owner_${port}_${id}`,palette=appearancePalettes[appearanceIndex++%appearancePalettes.length];HL.DATA.appearances[key]={body:appearanceIndex%2?"average":"broad",hair:`owner_${appearanceIndex%5}`,outfit:`${id}_owner`,hat:appearanceIndex%4===0?"cap":"none",accessory:id,palette,spriteSheet:"owner"}}

for(const map of Object.values(HL.DATA.townMaps)){
  map.collision={
    walkBounds:[1,7,30,9.55],
    solids:[...map.buildings.map(b=>[b.x,b.y,b.w,b.h]),[.2,8.2,8.8,6.6],[21,8.2,10.8,6.6],...map.props.filter(p=>p.block).map(p=>[p.x-.42,p.y-.38,.84,.76])],
    polygons:[],doors:map.buildings.map(b=>({id:b.id,rect:[b.door[0]-.5,b.door[1]-.42,1,.84],approach:0}))
  };
}
for(const scene of Object.values(HL.DATA.interiorScenes))scene.collision={walkBounds:[3,12.35,26,3.95],solids:[],polygons:[],doors:[{id:"exit",rect:scene.exit.rect,approach:4}],interactions:scene.hotspots};

HL.DATA.cutscenes={
  prologue:{id:"prologue",steps:[
    {background:"cutscene_bella_dawn",speaker:"기록관",text:"1526년, 리스본. 알려진 항로는 장부의 선으로 묶였지만 서쪽 수평선에는 아직 이름 없는 바다가 남아 있었다.",duration:10,music:"sea",sfx:"port_bell"},
    {background:"cutscene_bella_dawn",speaker:"기록관",text:"팔코 가문의 후계자 리안은 해도를 읽는 법은 배웠으나, 거친 바람 속에서 자신의 판단을 증명한 적은 없었다.",duration:10,music:"sea"},
    {background:"cutscene_falco_legacy",speaker:"데미안 팔코",text:"내가 끝내 증명하지 못한 항로가 있다. 같은 날 두 번의 일몰을 보았다는 기록, 왕립 해운회사가 지우려 드는 그 길이다.",duration:10,music:"port",sfx:"page_turn"},
    {background:"cutscene_falco_legacy",speaker:"리안 팔코",text:"아버지의 실패를 되풀이하라는 말씀이십니까? 아니면 그 기록이 거짓이 아니었다는 것을 제가 밝혀야 합니까?",duration:10,music:"port"},
    {background:"cutscene_dawn_raven",speaker:"데미안 팔코",text:"조선소에 카라벨 새벽까마귀를 준비했다. 오르소 벤이 네게 바다에서 살아남는 법을 가르칠 것이다.",duration:10,music:"port",sfx:"wood_knock"},
    {background:"cutscene_dawn_raven",speaker:"오르소 벤",text:"배는 명령보다 망설임을 먼저 알아챕니다. 선장님, 조선소에서 기다리겠습니다. 첫 바람을 놓치지 마십시오.",duration:10,music:"port",sfx:"port_bell"}
  ]}
};

HL.DATA.sceneAssets={};
for(const id of Object.keys(HL.DATA.townMaps)){
  const assetId=`town_${id}`;HL.DATA.townMaps[id].visual=assetId;
  HL.DATA.sceneAssets[assetId]={background:`../Assets/Resources/Sprites/Scenes/Towns/${id}.png`,foreground:null,waterMask:`../Assets/Resources/Sprites/Scenes/WaterMasks/${id}_towns.png`,fallback:"procedural",nativeSize:[960,540]};
}
for(const id of Object.keys(HL.DATA.interiorScenes)){
  const assetId=`interior_${id}`;HL.DATA.interiorScenes[id].visual=assetId;
  HL.DATA.sceneAssets[assetId]={background:`../Assets/Resources/Sprites/Scenes/Interiors/${id}.png`,foreground:`../Assets/Resources/Sprites/Scenes/Interiors/${id}_foreground.png`,foregroundLayers:[{layer:"foreground",depth:10.8,role:"rear-counter"}],waterMask:`../Assets/Resources/Sprites/Scenes/WaterMasks/${id}_interiors.png`,fallback:"procedural",nativeSize:[960,540]};
}
HL.DATA.sceneAssets.cutscene_bella_dawn={background:"../Assets/Resources/Sprites/Cutscenes/bella_dawn.png",nativeSize:[960,540]};
HL.DATA.sceneAssets.cutscene_falco_legacy={background:"../Assets/Resources/Sprites/Cutscenes/falco_legacy.png",nativeSize:[960,540]};
HL.DATA.sceneAssets.cutscene_dawn_raven={background:"../Assets/Resources/Sprites/Cutscenes/dawn_raven_handoff.png",nativeSize:[960,540]};
