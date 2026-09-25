window.HL=window.HL||{};
(function(){
  "use strict";
  HL.DATA.version=10;
  const cultures=["iberia","north","med","island","maghreb","ottoman","africa","arabia","india","seasia","china","japan","caribbean","americas"];
  const cultureRows=Object.fromEntries(cultures.map((id,index)=>[id,index]));
  const twoFloor=new Set(["market","inn","lodge","guild","mansion"]);
  const names={market:"시장",inn:"여관",lodge:"숙소",guild:"길드",mansion:"저택",shipyard:"조선소",harbor:"항만",bank:"은행",estate:"부동산 사무소",home:"선장의 집"};
  const tile={stone:0,wood:1,wall:2,wallTop:3,rug:4,water:5,stairUp:6,stairDown:7,bed:8,counter:9,shelf:10,crate:11,table:12,window:13,door:14,yard:15};
  const actionByFacility={market:"facility:market",inn:"facility:inn",lodge:"facility:lodge",guild:"facility:guild",mansion:"facility:mansion",shipyard:"facility:shipyard",harbor:"facility:harbor",bank:"bank-menu",estate:"property-menu",home:"home-menu"};
  const prop=(type,x,y,w=1,h=1,solid=true,high=false)=>({type,x,y,w,h,solid,high,tile:tile[type]??tile.table});
  const hotspot=(id,rect,label,action,extra={})=>({id,rect,label,action,...extra});
  const blankTiles=(floorType="stone")=>Array.from({length:18},(_,y)=>Array.from({length:32},(_,x)=>{
    if(y<2||x===0||x===31||y===17)return tile.wall;
    return floorType==="wood"?tile.wood:tile.stone;
  }));
  const finishFloor=(data)=>{
    const tiles=data.tiles;tiles[17][15]=tile.door;tiles[17][16]=tile.door;
    const solids=[];for(let y=0;y<18;y++)for(let x=0;x<32;x++)if(tiles[y][x]===tile.wall)solids.push([x,y,1,1]);
    for(const p of data.props)if(p.solid)solids.push([p.x,p.y,p.w,p.h]);
    data.collision={walkBounds:[.8,1.8,30.4,15.35],solids,polygons:[],doors:[],interactions:data.hotspots};
    data.exit={rect:[14.8,16.25,2.4,1],label:"나가기"};return data
  };
  const floorLayout=(portId,facility,floor,culture,seed)=>{
    const upper=floor===2,wood=["inn","lodge","mansion","home","shipyard","harbor"].includes(facility),tiles=blankTiles(wood?"wood":"stone"),props=[],hotspots=[],npcs=[];
    const id=`${portId}:${facility}:${floor}`;
    if(!upper){
      if(facility==="shipyard"){
        props.push(prop("counter",3,5,8,2,true,true),prop("table",15,5,5,3,true),prop("crate",24,5,4,3,true),prop("water",2,12,7,4,true));
        hotspots.push(hotspot("owner",[3,5,8,2],"조선공과 이야기",actionByFacility[facility]),hotspot("model",[15,5,5,3],"선박 모형",actionByFacility[facility]));npcs.push({id:"owner",x:7,y:4,appearanceId:`owner_${portId}_${facility}`});
      }else if(facility==="harbor"){
        props.push(prop("counter",10,5,12,2,true,true),prop("crate",3,5,5,4,true),prop("table",25,6,3,3,true));
        hotspots.push(hotspot("owner",[10,5,12,2],"항만 업무",actionByFacility[facility]),hotspot("supply",[3,5,5,4],"보급 창고",actionByFacility[facility]),hotspot("papers",[25,6,3,3],"출항 문서",actionByFacility[facility]));npcs.push({id:"owner",x:16,y:4,appearanceId:`owner_${portId}_${facility}`});
      }else if(facility==="bank"){
        props.push(prop("counter",8,5,16,2,true,true),prop("crate",25,4,4,5,true),prop("table",3,6,3,3,true));hotspots.push(hotspot("owner",[8,5,16,2],"예금과 대출",actionByFacility[facility]),hotspot("vault",[25,4,4,5],"금고",actionByFacility[facility]));npcs.push({id:"owner",x:16,y:4,appearanceId:`owner_${portId}_mansion`});
      }else if(facility==="estate"){
        props.push(prop("counter",10,5,12,2,true,true),prop("shelf",3,4,5,4,true,true),prop("table",24,7,4,3,true));hotspots.push(hotspot("owner",[10,5,12,2],"주택 계약",actionByFacility[facility]),hotspot("deeds",[3,4,5,4],"매물 장부",actionByFacility[facility]));npcs.push({id:"owner",x:16,y:4,appearanceId:`owner_${portId}_lodge`});
      }else if(facility==="home"){
        props.push(prop("bed",3,4,6,3,true),prop("shelf",23,4,5,3,true,true),prop("table",13,7,6,3,true));hotspots.push(hotspot("bed",[3,4,6,3],"집에서 휴식","home-rest"),hotspot("storage",[23,4,5,3],"개인 창고","home-storage"),hotspot("homeport",[13,7,6,3],"귀환항 지정","home-port"));
      }else{
        props.push(prop("counter",10,5,12,2,true,true),prop(facility==="lodge"?"bed":"shelf",3,4,5,4,true,true),prop(facility==="inn"?"table":"shelf",24,5,4,4,true,true));
        hotspots.push(hotspot("owner",[10,5,12,2],`${names[facility]} 이용`,actionByFacility[facility]));npcs.push({id:"owner",x:16,y:4,appearanceId:facility==="mansion"&&portId==="bella"?"damian":`owner_${portId}_${facility}`});
        if(facility==="market")hotspots.push(hotspot("stock",[3,4,5,4],"상품 진열대","facility:market"),hotspot("ledger",[24,5,4,4],"시세 장부","market-view"));
        if(facility==="inn")hotspots.push(hotspot("rumor",[3,4,5,4],"소문을 듣는다","gossip"),hotspot("dice",[24,5,4,4],"도박 탁자","gamble"));
        if(facility==="lodge")hotspots.push(hotspot("beds",[3,4,5,4],"숙박","rest"),hotspot("status",[24,5,4,4],"함대 상태","status"));
        if(facility==="guild")hotspots.push(hotspot("board",[3,4,5,4],"의뢰 게시판","guild-job"),hotspot("tools",[24,5,4,4],"항해 도구","facility:guild"));
        if(facility==="mansion")hotspots.push(hotspot("ledger",[3,4,5,4],"항로 장부","story-ledger"),hotspot("chart",[24,5,4,4],"가문 해도","story-chart"));
      }
    }else{
      if(facility==="market"){props.push(prop("crate",3,4,7,4,true),prop("shelf",12,4,7,4,true,true),prop("crate",22,4,7,4,true));hotspots.push(hotspot("specialty",[12,4,7,4],"특산품 장부","market-view"),hotspot("smuggle",[22,4,7,4],"봉인된 상자","gossip"))}
      if(facility==="inn"){props.push(prop("bed",3,4,6,3,true),prop("bed",13,4,6,3,true),prop("bed",23,4,6,3,true),prop("table",12,10,8,3,true));hotspots.push(hotspot("rest",[3,4,26,3],"객실에서 쉰다","rest"),hotspot("companion",[12,10,8,3],"동료와 식사","gossip"))}
      if(facility==="lodge"){props.push(prop("bed",4,4,7,3,true),prop("bed",21,4,7,3,true),prop("shelf",13,4,6,3,true,true));hotspots.push(hotspot("heal",[4,4,24,3],"치료와 숙박","rest"),hotspot("record",[13,4,6,3],"건강 기록","status"))}
      if(facility==="guild"){props.push(prop("shelf",2,3,8,5,true,true),prop("shelf",22,3,8,5,true,true),prop("table",11,6,10,4,true));hotspots.push(hotspot("archive",[2,3,8,5],"기록고","guild-job"),hotspot("fragments",[11,6,10,4],"황혼 해도편","fragment-board"))}
      if(facility==="mansion"){props.push(prop("bed",3,4,7,3,true),prop("shelf",22,3,7,5,true,true),prop("table",12,7,8,3,true));hotspots.push(hotspot("bedroom",[3,4,7,3],"침실",portId==="bella"?"v10-room-bed":"status"),hotspot("study",[22,3,7,5],"서재",portId==="bella"?"story-ledger":"nation-info"),hotspot("family-chart",[12,7,8,3],"가족 해도","story-chart"))}
    }
    props.push(prop("rug",11+(seed%5),11+((seed>>2)%2),5+(seed%3),2,false));
    props.push(prop("window",4+(seed%4)*5,2,3,1,false,true),prop("window",22-(seed%3)*3,2,3,1,false,true));
    for(const npc of npcs)npc.x=Math.max(12,Math.min(20,npc.x+(seed%5)-2));
    const stairs=[];
    if(twoFloor.has(facility)){const up=!upper;props.push(prop(up?"stairUp":"stairDown",27,13,3,3,false,true));stairs.push({id:up?"up":"down",rect:[27,13,3,3],toFloor:up?"2f":"1f",spawn:[26,14],approach:up?2:6,label:up?"2층으로":"1층으로"})}
    if(portId==="bella"&&facility==="mansion"&&upper){
      hotspots.length=0;
      hotspots.push(hotspot("seizure",[3,4,7,3],"압류 통지서","v10-room-notice"),hotspot("keepsake",[22,3,7,5],"어머니의 유품","v10-room-keepsake"),hotspot("school",[12,7,4,3],"항해학교 통지","v10-room-school"),hotspot("family-chart",[16,7,4,3],"오래된 가족 해도","story-chart"))
    }
    return finishFloor({id,floorId:`${floor}f`,portId,facility,culture,cultureRow:cultureRows[culture]??2,width:32,height:18,tiles,props,hotspots,npcs,stairs,spawn:upper?[26,14]:[16,15],actorScale:1.15,seed})
  };
  const building=(portId,facility,culture,seed)=>{const floors={"1f":floorLayout(portId,facility,1,culture,seed)};if(twoFloor.has(facility))floors["2f"]=floorLayout(portId,facility,2,culture,seed+17);return{id:`${portId}:${facility}`,portId,facility,culture,name:names[facility],entryFloor:"1f",floors}};

  HL.DATA.buildingScenes={};
  for(const[portIndex,portId]of HL.DATA.portOrder.entries()){
    const p=HL.DATA.ports[portId],culture=cultureRows[p.culture]!=null?p.culture:"med",facilities=["market","inn","shipyard","guild","lodge","harbor","mansion","bank","estate","home"];
    HL.DATA.buildingScenes[portId]=Object.fromEntries(facilities.map((facility,index)=>[facility,building(portId,facility,culture,portIndex*37+index*11)]));
  }

  const specialFloor=(id,culture,floorType,props,hotspots,npcs=[],stairs=[])=>finishFloor({id,floorId:id,portId:"prologue",facility:"prologue",culture,cultureRow:cultureRows[culture],width:32,height:18,tiles:blankTiles(floorType),props,hotspots,npcs,stairs,spawn:[7,13],actorScale:1.15});
  HL.DATA.v10PrologueFloors={
    shipLower:specialFloor("ship-lower","island","wood",[prop("bed",3,5,7,3,true),prop("crate",13,4,5,4,true),prop("table",20,7,5,3,true),prop("stairUp",27,12,3,3,false,true)],[hotspot("bed",[3,5,7,3],"젖은 침대","v10-prologue:bed"),hotspot("log",[20,7,5,3],"항해 일지","v10-prologue:log"),hotspot("cargo",[13,4,5,4],"젖은 선창","v10-prologue:cargo")],[{id:"young-orso",x:24,y:12,appearanceId:"orso",name:"젊은 오르소"}],[{id:"deck",rect:[27,12,3,3],to:"ship-deck",spawn:[26,14],label:"갑판으로 올라간다"}]),
    shipDeck:specialFloor("ship-deck","island","wood",[prop("water",0,2,4,15,true),prop("water",28,2,4,15,true),prop("table",13,6,6,3,true),prop("crate",5,4,4,3,true),prop("counter",22,4,4,2,true,true)],[hotspot("signals",[1,6,3,5],"세 척의 구조 신호","v10-prologue:signals"),hotspot("orso",[22,4,4,2],"오르소와 상의한다","v10-prologue:orso"),hotspot("helm",[13,6,6,3],"성 루시아로 침로를 잡는다","v10-prologue:helm")],[{id:"young-orso",x:23,y:8,appearanceId:"orso",name:"젊은 오르소"},{id:"watch",x:9,y:8,appearanceId:"bella_sailor",name:"당직 선원"}]),
    lighthouse:specialFloor("lighthouse","med","stone",[prop("table",12,5,8,5,true),prop("window",3,3,5,3,true,true),prop("window",24,3,5,3,true,true),prop("stairUp",26,12,3,3,false,true)],[hotspot("window",[3,3,5,3],"폭풍 속 호송선","v10-prologue:signals"),hotspot("winch",[12,5,8,5],"등대 권양기","v10-prologue:winch")],[{id:"young-orso",x:23,y:11,appearanceId:"orso",name:"젊은 오르소"}])
  };
  HL.DATA.v10={cultures,cultureRows,tile,names,twoFloor:[...twoFloor],tileAtlas:"../Assets/Resources/Sprites/Game/V10/interior_tiles_v10.png"};
  HL.DATA.appearances.bella_sailor={body:"slim",hair:"wet_cropped",outfit:"1511_watch",hat:"none",accessory:"signal_lantern",palette:["#6b4b32","#d0a06d","#416879"],spriteSheet:"citizen"};
})();
