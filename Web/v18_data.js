window.HL=window.HL||{};
(function(){
  "use strict";
  const D=HL.DATA,T=16,two=new Set(["market","inn","lodge","guild","mansion"]);
  const cultures=["iberia","north","med","island","maghreb","ottoman","africa","arabia","india","seasia","china","japan","caribbean","americas"];
  const names={market:"시장",inn:"여관",lodge:"선원 숙소",harbor:"항만",guild:"항해자 길드",shipyard:"조선소",mansion:"저택",bank:"은행",estate:"부동산 사무소",home:"선장의 집"};
  const palettes={
    iberia:["#34251f","#76503a","#b98252","#dfbd79","#efe0b0","#8e3540","#31586a","#151416"],north:["#26252a","#4d4e58","#777a7c","#b9aa89","#ded4b5","#703844","#385763","#111216"],
    med:["#32231d","#6f4934","#ad7850","#dcb66f","#eddaa5","#983f43","#2f6570","#141316"],island:["#2d241d","#654934","#a47448","#d3a562","#ead9a1","#9b4f38","#267078","#111518"],
    maghreb:["#35271e","#75583b","#ad8150","#d8ba78","#eee0ae","#8d3e46","#39706d","#151416"],ottoman:["#2b2225","#60404a","#8e5d50","#c99c62","#ead49c","#8e354f","#2f6868","#131317"],
    africa:["#2d211b","#62422d","#98643d","#c98b50","#e4bd75","#9d4934","#3e684d","#121413"],arabia:["#30241d","#6d4f34","#a77a4a","#d6b16d","#ead69e","#945044","#31636c","#131416"],
    india:["#302025","#6e3d49","#a45b51","#d08d59","#e4c484","#9d354b","#276b68","#151318"],seasia:["#29221b","#5c4930","#8e6b3d","#c18f4d","#e1bb70","#a13f39","#2b705f","#101513"],
    china:["#2d2020","#643936","#984b3d","#c8824f","#e3bd79","#a32e35","#2f6068","#141316"],japan:["#27242a","#454956","#716b62","#b39a72","#dcc89c","#964b4c","#3c6268","#111317"],
    caribbean:["#30221b","#69472f","#a66e3f","#d49a54","#e9ca82","#a74439","#216f79","#101518"],americas:["#2b221b","#5e4930","#8d6a3f","#bd9256","#dbc07e","#a34a36","#486746","#111413"]
  };
  const hash=v=>{let h=2166136261;for(const ch of String(v))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0};
  const grid=(w,h)=>Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>x===0||x===w-1||y===0||y===1||y===h-1?"wall":"floor"));
  const set=(g,x,y,v)=>{if(g[y]&&g[y][x]!=null)g[y][x]=v};
  const wallH=(g,y,a,b,doors=[])=>{for(let x=a;x<=b;x++)set(g,x,y,doors.includes(x)?"door":"wall")};
  const wallV=(g,x,a,b,doors=[])=>{for(let y=a;y<=b;y++)set(g,x,y,doors.includes(y)?"door":"wall")};
  const P=(type,x,y,w=1,h=1,high=false)=>({type,x,y,w,h,high,solid:!["rug","lamp","chart","papers","rope","plant","stair","water"].includes(type)});
  const plans={
    market:{walls:g=>{wallV(g,15,2,10,[6,7]);wallH(g,10,1,28,[6,7,22,23])},props:[P("counter",3,3,9,2,true),P("scale",7,5),P("produce",18,3,3,2),P("cloth",23,3,3,2),P("sacks",3,11,3,2),P("crates",20,11,3,2),P("ledger",12,11,2,1)],owner:[7,2.7]},
    inn:{walls:g=>{wallH(g,8,1,28,[13,14]);wallV(g,19,2,8,[5]);wallV(g,9,8,14,[11])},props:[P("bar",3,3,8,2,true),P("hearth",23,2,3,2,true),P("table",13,3,3,2),P("table",13,10,3,2),P("kitchen",21,5,5,2,true),P("barrels",3,10,2,2),P("notice",24,10,2,1,true)],owner:[6,2.7]},
    lodge:{walls:g=>{wallV(g,11,2,14,[7,8]);wallH(g,9,11,28,[19,20])},props:[P("counter",3,3,6,2,true),P("treatment",15,3,4,2),P("medicine",23,3,3,2,true),P("bed",14,11,4,2),P("bed",21,11,4,2),P("basin",4,10),P("wardrobe",4,12,2,2,true)],owner:[6,2.7]},
    guild:{walls:g=>{wallV(g,10,2,14,[6,7]);wallV(g,21,2,14,[10,11]);wallH(g,9,10,21,[15,16])},props:[P("counter",2,3,6,2,true),P("notice",13,2,5,1,true),P("maptable",13,4,5,3),P("shelf",23,3,4,2,true),P("telescope",24,10,2,2),P("chart",13,11,4,2),P("books",3,11,4,2,true)],owner:[5,2.7]},
    shipyard:{walls:g=>{wallV(g,20,2,14,[8,9]);wallH(g,11,1,20,[7,8])},props:[P("hull",3,3,14,6),P("workbench",22,3,5,2,true),P("mast",3,12,5,1),P("sails",10,12,5,2),P("rope",17,12,2,2),P("crane",23,9,4,3,true),P("plans",23,12,3,1)],owner:[24,7]},
    harbor:{walls:g=>{wallV(g,11,2,10,[6,7]);wallH(g,10,1,28,[6,7,19,20])},props:[P("counter",3,3,6,2,true),P("documents",14,3,4,2),P("crates",22,3,4,2),P("sacks",3,11,3,2),P("rope",9,11,2,2),P("bollard",23,11),P("water",26,10,3,5)],owner:[6,2.7]},
    mansion:{walls:g=>{wallV(g,9,2,14,[6,7]);wallV(g,21,2,14,[10,11]);wallH(g,9,9,21,[15,16])},props:[P("desk",2,3,5,2,true),P("hearth",13,2,4,2,true),P("dining",12,4,6,3),P("books",23,3,4,2,true),P("portrait",24,10,2,1,true),P("sofa",12,11,5,2),P("cabinet",3,11,4,2,true)],owner:[5,2.7]},
    bank:{walls:g=>{wallH(g,8,1,28,[21,22]);wallV(g,20,2,8,[5])},props:[P("counter",3,3,14,2,true),P("ledger",8,5,2,1),P("safe",23,3,3,3,true),P("desk",22,10,4,2),P("chest",4,10,2,2),P("notice",12,10,4,1,true)],owner:[8,2.7]},
    estate:{walls:g=>{wallV(g,17,2,14,[7,8]);wallH(g,9,17,28,[22,23])},props:[P("counter",3,3,9,2,true),P("contracts",5,6,4,2),P("model",21,3,4,3),P("shelf",23,10,3,2,true),P("desk",4,11,4,2),P("notice",11,11,4,1,true)],owner:[7,2.7]},
    home:{walls:g=>{wallV(g,11,2,14,[7,8]);wallH(g,9,11,28,[20,21])},props:[P("table",3,3,4,3),P("hearth",16,2,4,2,true),P("bed",16,11,5,2),P("chest",24,11,2,2),P("shelf",3,11,4,2,true),P("plant",24,3),P("rug",13,4,5,4)],owner:null}
  };
  const labels={counter:"업무대",scale:"황동 저울",produce:"식료품 판매대",cloth:"직물 판매대",sacks:"향신료 포대",crates:"화물 상자",ledger:"시세 장부",bar:"여관 카운터",hearth:"벽난로",table:"선원들의 탁자",kitchen:"부엌",barrels:"숙성 술통",notice:"게시판",treatment:"치료대",medicine:"약품장",bed:"침대",basin:"세면대",wardrobe:"옷장",maptable:"대형 해도",shelf:"기록 선반",telescope:"천문 관측기",chart:"항로 기록",books:"고서 선반",hull:"건조 중인 선체",workbench:"조선공 작업대",mast:"다듬은 돛대",sails:"돛 제작대",rope:"밧줄 걸이",crane:"선박용 기중기",plans:"선박 설계도",documents:"출항 문서",bollard:"계선주",water:"부두 수면",desk:"문서 책상",dining:"긴 식탁",portrait:"가문의 초상",sofa:"응접 의자",cabinet:"진열장",safe:"철제 금고",chest:"보관 상자",contracts:"매매 계약서",model:"항구 모형",plant:"창가 화분",rug:"낡은 융단"};
  const actions={market:"facility:market",inn:"facility:inn",lodge:"facility:lodge",guild:"facility:guild",shipyard:"facility:shipyard",harbor:"facility:harbor",mansion:"facility:mansion",bank:"bank-menu",estate:"property-menu",home:"home-menu"};
  function dressFloor(g,facility){
    const h=g.length,w=g[0].length,base={market:"stone",inn:"wood",lodge:"wood",guild:"slate",shipyard:"wood",harbor:"stone",mansion:"marble",bank:"marble",estate:"wood",home:"wood"}[facility]||"floor";
    for(let y=2;y<h-1;y++)for(let x=1;x<w-1;x++)if(g[y][x]==="floor")g[y][x]=base;
    const carpet=(x1,y1,x2,y2)=>{for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)if(g[y]?.[x]&&g[y][x]!=="wall"&&g[y][x]!=="door")g[y][x]=(x===x1||x===x2||y===y1||y===y2)?"carpetEdge":"carpet"};
    if(facility==="mansion")carpet(11,3,19,13);if(facility==="guild")carpet(12,3,19,8);if(facility==="inn")carpet(11,9,17,13);if(facility==="home")carpet(13,4,20,8);if(facility==="bank")carpet(3,9,17,13)
  }
  function makeFloor(portId,facility,level,culture,seed){
    const w=30,h=16,g=grid(w,h),plan=plans[facility]||plans.home;plan.walls(g);dressFloor(g,facility);set(g,14,h-1,"door");set(g,15,h-1,"door");
    const props=plan.props.map(p=>({...p})),stairs=[];
    for(const x of [2,9,20,27])if(g[2]?.[x]!=="wall")props.push(P("lamp",x,2,1,1,true));
    if(["guild","mansion"].includes(facility)){props.push(P("column",10,3,1,3,true),P("column",20,3,1,3,true))}
    if(two.has(facility)){props.push(P("stair",26,11,2,3,true));stairs.push({id:level===1?"up":"down",rect:[26,11,2,3],toFloor:level===1?"2f":"1f",spawn:[25.5,12.5],approach:level===1?2:6,label:level===1?"2층으로":"1층으로"})}
    const interactive=props.filter(p=>!["rug","lamp","water","stair","column"].includes(p.type)).slice(0,8),service=Math.max(0,interactive.findIndex(p=>["counter","bar","workbench","desk","table"].includes(p.type)));
    const hotspots=interactive.map((p,i)=>({id:`${facility}-${level}-${i}`,rect:[p.x,p.y,p.w,p.h],label:labels[p.type]||"살펴보기",action:level===1&&i===service?actions[facility]:`v18-inspect:${p.type}`}));
    const solid=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(g[y][x]==="wall")solid.push([x,y,1,1]);for(const p of props)if(p.solid)solid.push([p.x+.08,p.y+.12,p.w-.16,p.h-.18]);
    const owner=level===1&&plan.owner?{id:"owner",name:{market:"시장 상인",inn:"여관 주인",lodge:"숙소 관리인",guild:"길드장",shipyard:"조선공",harbor:"항만 관리인",mansion:"집사",bank:"은행가",estate:"중개인"}[facility],x:plan.owner[0],y:plan.owner[1],dir:4,appearanceId:`owner_${portId}_${facility}`,workZone:[plan.owner[0]-1,2,2,2]}:null;
    return{id:`${portId}:${facility}:${level}`,floorId:`${level}f`,portId,facility,culture,width:w,height:h,tiles:g,props,hotspots,npcs:owner?[owner]:[],stairs,spawn:[14.5,13.6],exit:{rect:[14,14,2,1.8],label:"밖으로"},actorScale:1,visual:{version:18,logical:[480,270],pixelScale:2,seed},navigation:{walkBounds:[1,2,w-2,h-3],solids:solid,ownerZones:owner?[owner.workZone]:[],corridorWidth:2},collision:{walkBounds:[1,2,w-2,h-3],solids:solid,polygons:[],doors:[],interactions:hotspots}};
  }
  D.interiorTemplatesV18={};D.buildingScenes=D.buildingScenes||{};
  D.portOrder.forEach((portId,pi)=>{const p=D.ports[portId],culture=cultures.includes(p.culture)?p.culture:"med";D.buildingScenes[portId]={};D.interiorTemplatesV18[portId]={};for(const facility of Object.keys(plans)){const floors={"1f":makeFloor(portId,facility,1,culture,hash(`${portId}:${facility}:1`))};if(two.has(facility))floors["2f"]=makeFloor(portId,facility,2,culture,hash(`${portId}:${facility}:2`));const b={id:`${portId}:${facility}`,portId,facility,culture,name:names[facility],entryFloor:"1f",floors,version:18};D.buildingScenes[portId][facility]=b;D.interiorTemplatesV18[portId][facility]=b}}
  );
  D.careerProgressionV18={
    kemal:{career:"adventure",label:"모험 명성",gates:[0,500,1400,2800,4800,7500],home:"constantinople",facility:"inn"},
    ines:{career:"adventure",label:"모험 명성",gates:[0,500,1400,2800,4800,7500],home:"seville",facility:"guild"},
    duarte:{career:"adventure",label:"모험 명성",gates:[0,500,1400,2800,4800,7500],home:"bella",facility:"mansion"},
    matteo:{career:"adventure",label:"모험 명성",gates:[0,500,1400,2800,4800,7500],home:"venice",facility:"guild"},
    anne:{career:"battle",label:"전투 명성",gates:[0,350,900,1800,3200,5200],home:"london",facility:"harbor"},
    marieke:{career:"trade",label:"교역 명성",gates:[0,250,700,1500,2800,4800],home:"lume",facility:"market"}
  };
  D.progressionV18={version:18,principles:["선장별 직업 명성을 쌓는다","자유 항해 중 고향의 소식을 받는다","지정 항구의 시설 재방문으로 사건을 시작한다","다른 선장과 반복해 만나 단서를 교환한다","후반에는 국가와 개인의 목적이 충돌한다"]};
  D.tileMetaV18={tileSize:T,pixelScale:2,palettes,cultures};D.version=18;
})();
