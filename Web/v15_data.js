window.HL=window.HL||{};
(function(){
  "use strict";
  const root="../Assets/Resources/Sprites/Game/V15/Lisbon/",two=new Set(["market","inn","lodge","guild","mansion"]),sizes={market:[26,16],inn:[26,16],lodge:[26,16],harbor:[26,16],guild:[28,18],mansion:[32,20],shipyard:[32,20]};
  const tileIds=["stone","stoneDark","wood","woodDark","wall","wallTop","door","window","rug","rugEdge","water","dock","partition","arch"],propIds=["counter","shelf","bed","fireplace","table","crates","barrels","scale","mapTable","desk","wardrobe","telescope","crane","hull","ropes","supplies","grandStair","sideStair","lantern","kitchen","treatment","notice","loom","chest"];
  HL.DATA.tileMetaV15={tileSize:24,src:root+"lisbon_tiles_v15.png",index:Object.fromEntries(tileIds.map((id,i)=>[id,i]))};HL.DATA.propSpritesV15={cell:96,src:root+"lisbon_props_v15.png",index:Object.fromEntries(propIds.map((id,i)=>[id,i]))};
  const p=(sprite,x,y,w=1,h=1,solid=true,high=false,label="",action="")=>({type:"v15Prop",sprite,x,y,w,h,solid,high,label,action}),hot=(id,rect,label,action)=>({id,rect,label,action});
  const floorFor=f=>["inn","lodge","mansion","shipyard","harbor"].includes(f)?"wood":"stone";
  function shell(w,h,f,upper){
    const base=upper?(floorFor(f)==="wood"?"woodDark":"stoneDark"):floorFor(f),a=Array.from({length:h},()=>Array(w).fill(base)),cx=Math.floor(w/2),splitY=h>=20?9:7,left=Math.floor(w*.32),right=Math.floor(w*.7);
    for(let x=0;x<w;x++){a[0][x]="wallTop";a[1][x]="wall";a[h-1][x]="wall"}
    for(let y=0;y<h;y++){a[y][0]="wall";a[y][w-1]="wall"}
    a[h-1][cx-1]="door";a[h-1][cx]="door";
    for(let x=4;x<w-3;x+=7)a[1][x]="window";
    for(let y=2;y<=splitY;y++){if(y!==splitY-2&&y!==splitY-1)a[y][left]="partition";if(y!==splitY-2&&y!==splitY-1)a[y][right]="partition"}
    const doors=[Math.floor(left/2),Math.floor((left+right)/2),Math.floor((right+w-1)/2)];
    for(let x=1;x<w-1;x++)if(!doors.some(d=>x===d||x===d+1))a[splitY][x]="partition";
    for(const d of doors){a[splitY][d]="arch";a[splitY][d+1]="arch"}
    for(let y=h-6;y<h-2;y++)for(let x=cx-3;x<=cx+3;x++)a[y][x]=(x===cx-3||x===cx+3||y===h-6||y===h-3)?"rugEdge":"rug";
    return a
  }
  const lower={
    market:[["owner","counter",11,4,4,2,"거래대","facility:market"],["goods","shelf",2,2,3,3,"상품 진열대","facility:market"],["scale","scale",21,2,2,2,"저울과 시세표","market-view"],["cloth","loom",2,10,3,3,"직물 견본","v15-inspect:cloth"],["stock","supplies",20,10,3,2,"특산품 포대","facility:market"],["notice","notice",6,2,2,2,"오늘의 시세","market-view"]],
    inn:[["owner","counter",11,4,4,2,"여관 이용","facility:inn"],["fire","fireplace",2,2,3,3,"벽난로","v13-inspect:fireplace"],["rumor","barrels",21,2,2,2,"술통과 소문","gossip"],["meal","table",2,10,3,3,"선원 식탁","v13-inspect:meal"],["kitchen","kitchen",20,10,3,3,"작은 부엌","v15-inspect:kitchen"],["dice","table",6,2,2,2,"놀이 탁자","gamble"]],
    lodge:[["owner","counter",11,4,4,2,"숙소 이용","facility:lodge"],["treat","treatment",2,2,3,3,"치료대","rest"],["medicine","wardrobe",21,2,2,3,"약품장","v13-inspect:medicine"],["bed","bed",2,10,3,3,"침대","rest"],["status","desk",20,10,3,2,"함대 장부","status"],["wash","supplies",6,2,2,2,"세면대","v15-inspect:wash"]],
    harbor:[["owner","counter",11,4,4,2,"출항 창구","facility:harbor"],["supply","supplies",2,2,3,3,"보급 창고","facility:harbor"],["crane","crane",21,2,3,3,"부두 크레인","v13-inspect:crane"],["papers","desk",2,10,3,2,"출항 문서","facility:harbor"],["rope","ropes",20,10,3,2,"계류 밧줄","v15-inspect:rope"],["signal","lantern",7,2,2,2,"항구 신호등","v13-inspect:signal"]],
    guild:[["owner","counter",12,4,4,2,"길드 이용","facility:guild"],["board","notice",2,2,3,3,"의뢰 게시판","guild-job"],["archive","shelf",23,2,3,3,"항해 기록고","nation-info"],["chart","mapTable",2,12,3,3,"해도 열람대","fragment-board"],["scope","telescope",23,12,2,3,"천문 관측구","v13-inspect:telescope"],["letters","desk",7,2,2,2,"도착한 서신","v15-inspect:letters"]],
    shipyard:[["owner","counter",14,6,4,2,"조선소 이용","facility:shipyard"],["hull","hull",2,2,6,4,"건조 중인 선체","facility:shipyard"],["crane","crane",26,2,3,4,"인양 크레인","v13-inspect:crane"],["tools","desk",2,14,3,2,"수리 작업대","repair"],["rigging","ropes",26,14,3,2,"돛과 밧줄","v13-inspect:rigging"],["plans","mapTable",9,2,3,2,"선박 설계도","v15-inspect:model"]],
    mansion:[["owner","counter",14,6,4,2,"데미안과 이야기","facility:mansion"],["fire","fireplace",2,2,3,3,"가문의 벽난로","v13-inspect:fireplace"],["chart","notice",26,2,3,3,"가문 해도","story-chart"],["ledger","desk",2,14,3,2,"항로 장부","story-ledger"],["portrait","notice",27,14,2,2,"가족 초상","v13-inspect:portrait"],["tea","table",9,2,3,2,"응접 탁자","v15-inspect:tea"]]
  };
  const upper={
    market:[["stores","supplies",2,2,3,3,"특산품 창고","market-view"],["sealed","chest",21,2,3,2,"봉인 상자","gossip"],["ledger","desk",2,10,3,2,"창고 장부","market-view"],["samples","crates",20,10,3,3,"견본품","v13-inspect:samples"],["loom","loom",6,2,2,3,"직물 작업대","v15-inspect:cloth"],["manifest","notice",17,2,2,2,"선적 기록","v15-inspect:manifest"]],
    inn:[["bedA","bed",2,2,3,3,"객실","rest"],["bedB","bed",21,2,3,3,"객실","rest"],["meal","table",2,10,3,3,"동료 식탁","gossip"],["chest","chest",20,10,3,2,"여행객 보관함","v13-inspect:chest"],["wash","supplies",6,2,2,2,"세면대","v15-inspect:wash"],["window","notice",17,2,2,2,"숙박 장부","v15-inspect:manifest"]],
    lodge:[["bedA","bed",2,2,3,3,"치료와 숙박","rest"],["bedB","bed",21,2,3,3,"치료와 숙박","rest"],["record","desk",2,10,3,2,"건강 기록","status"],["medicine","wardrobe",21,10,2,3,"약품장","v13-inspect:medicine"],["treat","treatment",6,2,2,2,"치료 도구","rest"],["wash","supplies",17,2,2,2,"세면대","v15-inspect:wash"]],
    guild:[["archiveA","shelf",2,2,3,3,"항해 기록고","guild-job"],["archiveB","shelf",23,2,3,3,"국가 기록고","nation-info"],["fragments","mapTable",2,12,3,3,"황혼 해도편","fragment-board"],["scope","telescope",23,12,2,3,"천문 관측구","v13-inspect:telescope"],["letters","desk",7,2,2,2,"미분류 기록","v15-inspect:letters"],["notice","notice",18,2,2,2,"항로 공고","guild-job"]],
    mansion:[["bed","bed",2,2,3,3,"리안의 침대","v10-room-bed"],["study","desk",26,2,3,2,"가족 서재","story-ledger"],["family","notice",2,14,3,2,"가족 해도","story-chart"],["keepsake","wardrobe",27,14,2,3,"어머니의 유품","v10-room-keepsake"],["notice","notice",9,2,2,2,"압류 통지서","v10-room-notice"],["school","desk",20,2,2,2,"항해학교 통지","v10-room-school"]]
  };
  function scene(f,floor){
    const [w,h]=sizes[f],up=floor===2,cx=Math.floor(w/2),splitY=h>=20?9:7;
    const s={id:`bella:${f}:${floor}`,floorId:`${floor}f`,portId:"bella",facility:f,culture:"iberia",cultureRow:0,width:w,height:h,tiles:shell(w,h,f,up),props:[],hotspots:[],npcs:[],stairs:[],roomZones:[],spawn:[cx,h-2.15],exit:{rect:[cx-1.15,h-1.5,2.3,.85],label:"나가기"},actorScale:.66,visual:{version:15}};
    for(const [id,sprite,x,y,pw,ph,label,action] of (up?upper[f]:lower[f])){
      const high=["counter","shelf","fireplace","wardrobe","notice"].includes(sprite);
      s.props.push(p(sprite,x,y,pw,ph,true,high,label,action));s.hotspots.push(hot(id,[x,y,pw,ph],label,action))
    }
    if(!up){const sy=h>=20?6:4;s.npcs.push({id:"owner",name:{market:"시장 상인",inn:"여관 주인",lodge:"숙소 관리인",harbor:"항만 관리인",guild:"길드장",shipyard:"조선공",mansion:"데미안 팔코"}[f],x:cx,y:sy-.35,dir:4,appearanceId:f==="mansion"?"damian":`owner_bella_${f}`,workZone:[cx-1.4,sy-1.2,2.8,1]})}
    const decor=[
      ["lantern",1.25,1.9,1,1,true],["lantern",w-2.25,1.9,1,1,true],["crates",1.4,splitY+1.2,1.45,1.45,false],["barrels",w-2.9,splitY+1.15,1.5,1.5,false],
      ["chest",4.4,splitY+1.3,1.5,1,false],["supplies",w-6,splitY+1.2,1.6,1.3,false],["lantern",Math.floor(w*.32)-1.2,splitY-1.2,.9,.9,true],["lantern",Math.floor(w*.7)+.3,splitY-1.2,.9,.9,true],
      ["notice",1.25,4.1,1.1,1.4,true],["ropes",w-2.5,4.2,1.2,1.2,false],["crates",4.7,2.1,1.2,1.2,false],["barrels",w-6,2.1,1.25,1.25,false]
    ];
    for(const [sprite,x,y,pw,ph,high] of decor){
      if(s.props.some(o=>x<o.x+o.w+.25&&x+pw+.25>o.x&&y<o.y+o.h+.25&&y+ph+.25>o.y))continue;
      s.props.push(p(sprite,x,y,pw,ph,false,high))
    }
    const accents=[];
    for(let x=2;x<w-2;x+=3)accents.push([x,h-2.35]);
    for(let x=3;x<w-3;x+=4)accents.push([x,splitY+1.15]);
    for(const [x,y] of accents){
      if(s.props.length>=20)break;
      const pw=.78,ph=.78;if(Math.abs(x-cx)<2.2&&y>h-4)continue;
      if(s.props.some(o=>x<o.x+o.w+.12&&x+pw+.12>o.x&&y<o.y+o.h+.12&&y+ph+.12>o.y))continue;
      const sprite=["crates","barrels","supplies","chest"][s.props.length%4];s.props.push(p(sprite,x,y,pw,ph,false,false))
    }
    if(two.has(f)){
      const grand=["guild","mansion"].includes(f),sw=grand?4:3,sh=grand?4:3,x=w-sw-2,y=h-sh-3;
      s.props.push(p(grand?"grandStair":"sideStair",x,y,sw,sh,false,true));
      s.stairs.push({id:up?"down":"up",rect:[x,y,sw,sh],toFloor:up?"1f":"2f",spawn:[x+sw/2,up?y+1.3:y+sh-1.3],approach:up?6:2,label:up?"1층으로":"2층으로",style:grand?"grand":"side",visual:{version:15,sprite:grand?"grandStair":"sideStair",x,y,w:sw,h:sh}})
    }
    const solids=[];
    for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(["wall","wallTop","partition"].includes(s.tiles[y][x]))solids.push([x,y,1,1]);
    for(const o of s.props)if(o.solid)solids.push([o.x+.12,o.y+.18,Math.max(.3,o.w-.24),Math.max(.3,o.h-.22)]);
    s.navigation={walkBounds:[.7,1.7,w-1.4,h-2.5],solids,ownerZones:s.npcs.map(n=>n.workZone).filter(Boolean),corridorWidth:2};s.collision={walkBounds:s.navigation.walkBounds,solids,polygons:[],doors:[],interactions:s.hotspots};
    s.roomZones=[{id:"west",rect:[1,2,Math.floor(w*.32)-1,splitY-2]},{id:"office",rect:[Math.floor(w*.32)+1,2,Math.floor(w*.38)-1,splitY-2]},{id:"east",rect:[Math.floor(w*.7)+1,2,w-Math.floor(w*.7)-2,splitY-2]},{id:"hall",rect:[1,splitY+1,w-2,h-splitY-2]}];return s
  }
  HL.DATA.v15FallbackBuildings={};
  const facilities=Object.keys(sizes);
  for(const f of facilities){
    HL.DATA.v15FallbackBuildings[f]=HL.DATA.buildingScenes.bella[f];
    const floors={"1f":scene(f,1)};
    if(two.has(f))floors["2f"]=scene(f,2);
    if(f==="harbor"){
      const floor=floors["1f"],water=[];
      for(let y=floor.height-7;y<floor.height-2;y++)for(let x=floor.width-6;x<floor.width-1;x++){
        floor.tiles[y][x]=x===floor.width-6?"dock":"water";
        if(x>floor.width-6)water.push([x,y,1,1])
      }
      floor.navigation.solids.push(...water);floor.collision.solids=floor.navigation.solids
    }
    HL.DATA.buildingScenes.bella[f]={id:`bella:${f}`,portId:"bella",facility:f,culture:"iberia",name:HL.DATA.v15FallbackBuildings[f].name,entryFloor:"1f",floors,version:15}
  }
  HL.DATA.lisbonInteriorSetV15={portId:"bella",facilities,tiles:HL.DATA.tileMetaV15,props:HL.DATA.propSpritesV15,floorCount:12};HL.DATA.v15={version:15,types:["LisbonInteriorSetV15","TileMetaV15","RoomLayoutV15","PropSpriteV15"]};HL.DATA.version=15;
})();
