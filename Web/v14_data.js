window.HL=window.HL||{};
(function(){
  "use strict";
  const T=24,cultures=HL.DATA.v10.cultures;
  const facilities=["market","inn","shipyard","guild","lodge","harbor","mansion","bank","estate","home"];
  const twoFloor=new Set(["market","inn","lodge","guild","mansion"]);
  const sizes={bank:[20,14],estate:[20,14],home:[20,14],market:[26,16],inn:[26,16],lodge:[26,16],harbor:[26,16],guild:[28,18],mansion:[32,20],shipyard:[32,20]};
  const names={market:"시장",inn:"여관",shipyard:"조선소",guild:"길드",lodge:"숙소",harbor:"항만",mansion:"저택",bank:"은행",estate:"부동산 사무소",home:"선장의 집"};
  const jobs={market:"merchant",inn:"innkeeper",shipyard:"shipwright",guild:"guildmaster",lodge:"innkeeper",harbor:"harbormaster",mansion:"noble",bank:"banker",estate:"banker",home:"noble"};
  const actions={market:"facility:market",inn:"facility:inn",shipyard:"facility:shipyard",guild:"facility:guild",lodge:"facility:lodge",harbor:"facility:harbor",mansion:"facility:mansion",bank:"bank-menu",estate:"property-menu",home:"home-menu"};
  const floors={market:"floorStoneA",guild:"floorTileA",bank:"floorStoneB",estate:"floorStoneA",inn:"floorWoodA",lodge:"floorWoodB",harbor:"floorWoodA",mansion:"floorWoodB",home:"floorWoodA",shipyard:"floorWoodA"};
  const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
  const prop=(sprite,x,y,w=1,h=1,solid=false,high=false,label="",action="")=>({type:"v12Object",sprite,x,y,w,h,solid,high,label,action});
  const hot=(id,rect,label,action)=>({id,rect,label,action});

  function tilePlan(w,h,facility,upper){
    const base=upper?floors[facility].replace(/A$/,"B"):floors[facility],tiles=Array.from({length:h},()=>Array(w).fill(base));
    for(let x=0;x<w;x++){tiles[0][x]="wallTop";tiles[1][x]="wallBase";tiles[h-1][x]="wallBase"}
    for(let y=0;y<h;y++){tiles[y][0]="wallBase";tiles[y][w-1]="wallBase"}
    const cx=Math.floor(w/2);tiles[h-1][cx]="door";tiles[h-1][cx-1]="door";
    for(let x=3;x<w-3;x+=6)tiles[1][x]="window";
    const split=Math.floor(w*.34),roomBottom=Math.floor(h*.52),doorY=Math.max(4,roomBottom-2);
    for(let y=2;y<=roomBottom;y++)if(y!==doorY&&y!==doorY+1)tiles[y][split]="wallBase";
    for(let x=1;x<split;x++)if(x!==Math.floor(split/2)&&x!==Math.floor(split/2)+1)tiles[roomBottom][x]="wallBase";
    if(w>=28){const right=Math.floor(w*.73);for(let y=2;y<=roomBottom+1;y++)if(y!==doorY&&y!==doorY+1)tiles[y][right]="wallBase"}
    const rugY=h-6;for(let y=rugY;y<h-2;y++)for(let x=cx-3;x<=cx+3;x++)tiles[y][x]=(x===cx-3||x===cx+3||y===rugY||y===h-3)?"rugB":"rugA";
    return tiles;
  }

  function addFunctional(scene,upper,portId){
    const {width:w,height:h,facility:f,props:p,hotspots:hs,npcs}=scene,cx=Math.floor(w/2),serviceY=h>=20?7:h>=18?5:4;
    const add=(id,sprite,x,y,pw,ph,label,action,solid=true,high=false)=>{p.push(prop(sprite,x,y,pw,ph,solid,high,label,action));hs.push(hot(id,[x,y,pw,ph],label,action))};
    if(!upper){
      const counter=f==="inn"?"tavernBar":f==="shipyard"?"workbench":f==="bank"||f==="estate"?"contractDesk":"writingDesk";
      add("owner",counter,cx-2,serviceY,4,2,`${names[f]} 이용`,actions[f],true,true);
      npcs.push({id:"owner",name:`${names[f]} 주인`,x:cx,y:serviceY-.38,dir:4,appearanceId:`owner_${portId}_${f}`,workZone:[cx-1.5,serviceY-1.2,3,1]});
    }
    const y2=h-6,right=w-6;
    const layouts={
      market:[["goods","grainSacks",2,3,3,2,"상품 진열","facility:market"],["scale","scale",right,3,2,2,"저울과 시세표","market-view"],["stock","supplies",2,y2,3,2,"특산품 포대","facility:market"],["ledger","wallChart",right,y2,2,2,"오늘의 시세","market-view"],["seal","vault",6,3,2,2,"봉인 상자","v13-inspect:samples"]],
      inn:[["fire","fireplace",2,3,2,2,"벽난로","v13-inspect:fireplace"],["barrel","barrels",right,3,2,2,"술통과 소문","gossip"],["dice","chartTable",2,y2,3,2,"놀이 탁자","gamble"],["meal","tavernBar",right-1,y2,3,2,"선원 식탁","v13-inspect:meal"],["kitchen","supplies",6,3,2,2,"작은 부엌","v14-inspect:kitchen"]],
      shipyard:[["hull","hullCradle",2,3,5,3,"건조 중인 선체","facility:shipyard"],["crane","crane",right-1,3,4,3,"인양 크레인","v13-inspect:crane"],["tools","workbench",2,y2,3,2,"수리 작업대","repair"],["rigging","ropes",right,y2,3,2,"돛과 밧줄","v13-inspect:rigging"],["model","chartTable",9,3,2,2,"선박 설계도","v14-inspect:model"]],
      guild:[["board","wallChart",2,3,3,2,"의뢰 게시판","guild-job"],["archive","wardrobe",right,3,2,2,"항해 기록고","nation-info"],["chart","chartTable",2,y2,3,2,"해도 열람대","fragment-board"],["scope","telescope",right,y2,2,2,"천문 관측구","v13-inspect:telescope"],["letters","contractDesk",6,3,2,2,"도착한 서신","v14-inspect:letters"]],
      lodge:[["fire","fireplace",2,3,2,2,"벽난로","v13-inspect:fireplace"],["status","contractDesk",right,3,2,2,"함대 장부","status"],["bed","bed",2,y2,3,2,"침대","rest"],["medicine","wardrobe",right,y2,2,2,"약품장","v13-inspect:medicine"],["wash","supplies",6,3,2,2,"세면대","v14-inspect:wash"]],
      harbor:[["supply","supplies",2,3,3,2,"보급 창고","facility:harbor"],["crane","crane",right-1,3,4,3,"부두 크레인","v13-inspect:crane"],["papers","contractDesk",2,y2,3,2,"출항 문서","facility:harbor"],["signal","lantern",right,y2,2,2,"신호등","v13-inspect:signal"],["rope","ropes",6,3,2,2,"계류 밧줄","v14-inspect:rope"]],
      mansion:[["fire","fireplace",2,3,2,2,"가문의 벽난로","v13-inspect:fireplace"],["chart","wallChart",right,3,3,2,"가문 해도","story-chart"],["ledger","contractDesk",2,y2,3,2,"항로 장부","story-ledger"],["portrait","wallChart",right,y2,2,2,"가족 초상","v13-inspect:portrait"],["tea","tavernBar",7,3,2,2,"응접 탁자","v14-inspect:tea"]],
      bank:[["vault","vault",2,3,3,2,"금고","bank-menu"],["scale","scale",right,3,2,2,"화폐 저울","v13-inspect:scale"],["ledger","contractDesk",2,y2,3,2,"예금 장부","bank-menu"],["notice","wallChart",right,y2,2,2,"환율 고시","v14-inspect:rates"],["coins","supplies",6,3,2,2,"동전 상자","v14-inspect:coins"]],
      estate:[["deeds","contractDesk",2,3,3,2,"매물 장부","property-menu"],["plans","wallChart",right,3,2,2,"건물 도면","v13-inspect:plans"],["model","wardrobe",2,y2,2,2,"축척 모형","v13-inspect:model"],["keys","supplies",right,y2,2,2,"열쇠함","v14-inspect:keys"],["bench","tavernBar",6,3,2,2,"상담 탁자","property-menu"]],
      home:[["bed","bed",2,3,3,2,"휴식","home-rest"],["storage","wardrobe",right,3,2,2,"개인 창고","home-storage"],["homeport","chartTable",2,y2,3,2,"귀환항 해도","home-port"],["desk","writingDesk",right,y2,2,2,"항해 일지","journal"],["hearth","fireplace",6,3,2,2,"작은 난로","v13-inspect:fireplace"]]
    };
    const upperLayouts={market:[["stores","supplies",2,3,3,2,"특산품 창고","market-view"],["sealed","vault",right,3,2,2,"봉인 상자","gossip"],["ledger","contractDesk",2,y2,3,2,"창고 장부","market-view"],["samples","grainSacks",right,y2,3,2,"견본 포대","v13-inspect:samples"],["window","wallChart",7,3,2,2,"선적 기록","v14-inspect:manifest"]],inn:[["bedA","bed",2,3,3,2,"객실","rest"],["bedB","bed",right,3,3,2,"객실","rest"],["meal","tavernBar",2,y2,3,2,"동료 식탁","gossip"],["chest","wardrobe",right,y2,2,2,"보관함","v13-inspect:chest"],["wash","supplies",7,3,2,2,"세면대","v14-inspect:wash"]],lodge:[["bedA","bed",2,3,3,2,"치료와 숙박","rest"],["bedB","bed",right,3,3,2,"치료와 숙박","rest"],["record","contractDesk",2,y2,3,2,"건강 기록","status"],["medicine","wardrobe",right,y2,2,2,"약품장","v13-inspect:medicine"],["wash","supplies",7,3,2,2,"세면대","v14-inspect:wash"]],guild:[["archiveA","wardrobe",2,3,2,2,"항해 기록고","guild-job"],["archiveB","wardrobe",right,3,2,2,"국가 기록고","nation-info"],["fragments","chartTable",2,y2,3,2,"황혼 해도편","fragment-board"],["scope","telescope",right,y2,2,2,"천문 관측구","v13-inspect:telescope"],["letters","contractDesk",7,3,2,2,"미분류 기록","v14-inspect:letters"]],mansion:[["bed","bed",2,3,3,2,"침실",portId==="bella"?"v10-room-bed":"status"],["study","writingDesk",right-1,3,3,2,"서재",portId==="bella"?"story-ledger":"nation-info"],["family","wallChart",2,y2,3,2,"가족 해도","story-chart"],["keepsake","wardrobe",right,y2,2,2,"유품장","v13-inspect:keepsake"],["notice","contractDesk",7,3,2,2,"오래된 서류",portId==="bella"?"v10-room-notice":"v14-inspect:letters"]]};
    const selected=upper?upperLayouts[f]:layouts[f];for(const item of selected||[])add(...item,true,["wallChart","wardrobe","fireplace"].includes(item[1]));
  }

  function addLife(scene,seed){
    const {width:w,height:h,props:p,facility:f}=scene,target=w>=32?32:w>=28?28:w>=26?24:18;
    const set=f==="shipyard"||f==="harbor"?["ropes","barrels","supplies","lantern"]:f==="market"?["grainSacks","barrels","supplies","scale"]:f==="inn"?["barrels","lantern","supplies","grainSacks"]:["wallChart","lantern","wardrobe","supplies"];
    const anchors=[[2,2],[w-7,2],[2,h-6],[w-7,h-6]];let i=0;
    while(p.length<target&&i<100){const a=anchors[(i+seed)%4],x=a[0]+(i%3)*.72,y=a[1]+(Math.floor(i/3)%2)*.72,sprite=set[(i+seed)%set.length];i++;if(Math.abs(x-w/2)<2.5||x>w-2||y>h-3)continue;p.push(prop(sprite,x,y,.58,.58,false,y<3.5))}
  }

  function finish(scene){
    const solids=[];for(let y=0;y<scene.height;y++)for(let x=0;x<scene.width;x++)if(["wallBase","wallTop"].includes(scene.tiles[y][x]))solids.push([x,y,1,1]);
    for(const p of scene.props)if(p.solid)solids.push([p.x+.1,p.y+.15,Math.max(.3,p.w-.2),Math.max(.3,p.h-.2)]);
    scene.navigation={walkBounds:[.7,1.7,scene.width-1.4,scene.height-2.5],solids,ownerZones:scene.npcs.map(n=>n.workZone).filter(Boolean),corridorWidth:2};
    scene.collision={walkBounds:scene.navigation.walkBounds,solids,polygons:[],doors:[],interactions:scene.hotspots};scene.propCount=scene.props.length;scene.interactionCount=scene.hotspots.length;return scene;
  }

  function makeFloor(portId,facility,floor,culture,seed){
    const [width,height]=sizes[facility],upper=floor===2,scene={id:`${portId}:${facility}:${floor}`,floorId:`${floor}f`,portId,facility,culture,cultureRow:cultures.indexOf(culture),width,height,tiles:tilePlan(width,height,facility,upper),props:[],hotspots:[],npcs:[],stairs:[],roomZones:[],seed,actorScale:.66,visual:{version:14}};
    addFunctional(scene,upper,portId);addLife(scene,seed);const cx=Math.floor(width/2);scene.spawn=[cx,height-2.15];scene.exit={rect:[cx-1.15,height-1.5,2.3,.85],label:"나가기"};
    if(twoFloor.has(facility)){const grand=["mansion","guild"].includes(facility),sw=grand?4:3,sh=grand?4:3,x=width-sw-2,y=height-sh-3;scene.props.push(prop(grand?"grandStair":"sideStair",x,y,sw,sh,false,true,upper?"1층":"2층",""));scene.stairs.push({id:upper?"down":"up",rect:[x,y,sw,sh],autoRect:[x+.5,upper?y+sh-1:y+.2,sw-1,1],toFloor:upper?"1f":"2f",spawn:[x+sw/2,upper?y+1.35:y+sh-1.35],approach:upper?6:2,label:upper?"1층으로":"2층으로",style:grand?"grand":"side",auto:true,visual:{version:14,sprite:grand?"grandStair":"sideStair",x,y,w:sw,h:sh}})}
    scene.roomZones=[{id:"service",rect:[1,2,width-2,Math.floor(height*.48)]},{id:"side-room",rect:[1,2,Math.floor(width*.34)-1,Math.floor(height*.5)]},{id:"public",rect:[1,Math.floor(height*.5)+1,width-2,height-Math.floor(height*.5)-2]}];return finish(scene);
  }

  HL.DATA.buildingScenes={};for(const [pi,portId] of HL.DATA.portOrder.entries()){const culture=HL.DATA.ports[portId].culture;HL.DATA.buildingScenes[portId]=Object.fromEntries(facilities.map((facility,fi)=>{const fs={"1f":makeFloor(portId,facility,1,culture,pi*97+fi*17)};if(twoFloor.has(facility))fs["2f"]=makeFloor(portId,facility,2,culture,pi*97+fi*17+11);return[facility,{id:`${portId}:${facility}`,portId,facility,culture,name:names[facility],entryFloor:"1f",floors:fs,version:14}]}))}

  const oldTownFor=HL.WorldData.townMapFor.bind(HL.WorldData),towns={};for(const [i,id] of HL.DATA.portOrder.entries()){const old=oldTownFor(id),culture=HL.DATA.ports[id].culture,seed=hash(id),extras=[];for(let n=0;n<14;n++)extras.push({type:["barrel","crate","plant","bench","cart","stall","rope"][n%7],x:9+(seed+n*7)%13,y:8+((seed>>>4)+n*5)%7,variant:(seed+n)%4});towns[id]={...old,id,culture,width:32,height:18,visual:{version:14},townPropsV14:extras,buildings:old.buildings.map(b=>({...b})),props:old.props.map(p=>({...p})),npcs:old.npcs.map(n=>({...n})),collision:{...old.collision,solids:old.collision.solids.map(r=>[...r]),doors:old.collision.doors.map(d=>({...d,rect:[...d.rect]})),polygons:[]}}}
  HL.DATA.townTemplatesV14=towns;
  HL.DATA.scaleProfileV14={tileSize:T,townCharacter:[36,54],interiorCharacter:[42,63],moveSpeed:4.5,acceleration:30,hitRadius:.24,interactionDistance:1.05,canvas:[960,540]};
  HL.DATA.v14={version:14,facilities,twoFloor:[...twoFloor],floorSizes:sizes,types:["ScaleProfileV14","TownTemplateV14","FloorTemplateV14","RoomZoneV14","PropClusterV14"]};HL.DATA.version=14;
})();
