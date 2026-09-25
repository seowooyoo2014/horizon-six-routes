window.HL=window.HL||{};
(function(){
  "use strict";
  const T=30,cultures=HL.DATA.v10.cultures;
  const facilities=["market","inn","shipyard","guild","lodge","harbor","mansion","bank","estate","home"];
  const twoFloor=new Set(["market","inn","lodge","guild","mansion"]);
  const sizes={bank:[24,16],estate:[24,16],home:[24,16],market:[30,18],inn:[30,18],lodge:[30,18],harbor:[30,18],guild:[32,18],mansion:[40,24],shipyard:[40,24]};
  const names={market:"시장",inn:"여관",shipyard:"조선소",guild:"길드",lodge:"숙소",harbor:"항만",mansion:"저택",bank:"은행",estate:"부동산 사무소",home:"선장의 집"};
  const professions={market:"merchant",inn:"innkeeper",shipyard:"shipwright",guild:"guildmaster",lodge:"innkeeper",harbor:"harbormaster",mansion:"noble",bank:"banker",estate:"banker",home:"noble"};
  const actions={market:"facility:market",inn:"facility:inn",shipyard:"facility:shipyard",guild:"facility:guild",lodge:"facility:lodge",harbor:"facility:harbor",mansion:"facility:mansion",bank:"bank-menu",estate:"property-menu",home:"home-menu"};
  const floorByFacility={market:"floorStoneA",guild:"floorTileA",bank:"floorStoneB",estate:"floorStoneA",inn:"floorWoodA",lodge:"floorWoodB",harbor:"floorWoodA",mansion:"floorWoodB",home:"floorWoodA",shipyard:"floorWoodA"};
  const hash=text=>{let h=2166136261;for(const ch of String(text)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
  const prop=(sprite,x,y,w=2,h=2,solid=false,high=false,label="",action="")=>({type:"v12Object",sprite,x,y,w,h,solid,high,label,action});
  const decor=(sprite,x,y,high=false,w=1,h=1)=>({type:"v12Object",sprite,x,y,w,h,solid:false,high});
  const hot=(id,rect,label,action)=>({id,rect,label,action});

  function baseTiles(w,h,facility,upper){
    const floor=upper?(floorByFacility[facility].replace(/A$/,"B")):floorByFacility[facility],tiles=Array.from({length:h},()=>Array(w).fill(floor));
    for(let x=0;x<w;x++){tiles[0][x]="wallTop";tiles[1][x]="wallBase";tiles[h-1][x]="wallBase"}
    for(let y=0;y<h;y++){tiles[y][0]="wallBase";tiles[y][w-1]="wallBase"}
    const cx=Math.floor(w/2);tiles[h-1][cx]="door";tiles[h-1][cx-1]="door";
    for(let x=3;x<w-3;x+=5)tiles[1][x]="window";
    const rugTop=Math.max(8,h-8),rugHalf=facility==="mansion"?6:4;
    for(let y=rugTop;y<h-3;y++)for(let x=cx-rugHalf;x<=cx+rugHalf;x++)tiles[y][x]=(x===cx-rugHalf||x===cx+rugHalf||y===rugTop||y===h-4)?"rugB":"rugA";
    if(w>=40){const split=12;for(let y=2;y<9;y++)if(y!==6&&y!==7)tiles[y][split]="wallBase"}
    return tiles;
  }

  function addDecor(scene,seed){
    const {width:w,height:h,props:P,hotspots:H,facility:f}=scene,wallSet=f==="shipyard"||f==="harbor"?["ropes","barrels","supplies","lantern"]:["wallChart","lantern","wardrobe","wallChart"];
    const cx=Math.floor(w/2),target=w>=40?58:w>=32?46:w>=30?42:35;
    // 장식은 벽 전체에 도배하지 않고 선반, 작업대, 창고 주변에 작은 군집으로 묶는다.
    for(let x=3;x<w-3;x+=5)P.push(decor(wallSet[(x+seed)%wallSet.length],x,2,true,x%10===3?2:1,1));
    for(let y=5;y<h-5;y+=4){P.push(decor(wallSet[(y+seed+1)%wallSet.length],1,y,true));P.push(decor(wallSet[(y+seed+2)%wallSet.length],w-2,y,true))}
    const clusterSprites=f==="shipyard"||f==="harbor"?["ropes","barrels","supplies","lantern"]:f==="market"?["grainSacks","barrels","supplies","scale"]:f==="inn"?["barrels","lantern","supplies","grainSacks"]:["wallChart","lantern","wardrobe","supplies"];
    const anchors=[[3,4],[w-7,4],[3,h-8],[w-7,h-8]];
    let serial=0;
    while(P.length<target&&serial<160){
      const anchor=anchors[(serial+seed)%anchors.length],dx=(serial*3+seed)%4,dy=Math.floor(serial/4)%3;
      const col=anchor[0]+dx,row=anchor[1]+dy;
      serial++;
      if(col<2||row<3||col>w-3||row>h-5||Math.abs(col-cx)<3)continue;
      if(P.some(p=>Math.abs((p.x+p.w/2)-(col+.5))<.65&&Math.abs((p.y+p.h/2)-(row+.5))<.65))continue;
      P.push(decor(clusterSprites[(serial+seed)%clusterSprites.length],col,row,dy===0&&serial%3===0));
    }
    // 좁은 방은 큰 가구 때문에 빈 타일이 적다. 남은 수량은 벽 선반 위의 작은 병과 도구로 채운다.
    for(let i=0;P.length<target&&i<120;i++){
      const left=i%2===0,x=left?2.25+(i%8)*.72:w-7.75+(i%8)*.72,y=2.2+(Math.floor(i/8)%2)*.72;
      if(Math.abs(x-cx)<3)continue;
      P.push(decor(clusterSprites[(i+seed)%clusterSprites.length],x,y,true,.58,.58));
    }
    H.push(hot("room-window",[3,1,1,2],"창밖 풍경","v13-inspect:window"),hot("room-detail",[w-5,1,2,2],f==="shipyard"||f==="harbor"?"밧줄과 도구":"벽의 장식","v13-inspect:room"));
  }

  function addMajor(scene,upper,portId){
    const {width:w,height:h,facility:f,props:P,hotspots:H,npcs:N}=scene,cx=Math.floor(w/2);
    const add=(id,sprite,x,y,pw,ph,label,action,solid=true,high=false)=>{P.push(prop(sprite,x,y,pw,ph,solid,high,label,action));H.push(hot(id,[x,y,pw,ph],label,action))};
    if(!upper){
      const counter=f==="inn"?"tavernBar":f==="shipyard"?"workbench":f==="bank"||f==="estate"?"contractDesk":"writingDesk";
      add("owner",counter,cx-3,5,6,3,`${names[f]} 이용`,actions[f],true,true);
      N.push({id:"owner",name:`${names[f]} 주인`,x:cx,y:4.35,dir:4,appearanceId:`owner_${portId}_${f}`,workZone:[cx-2,3,4,2]});
      const layouts={
        market:[["scale","scale",3,5,3,3,"저울과 시세표","market-view"],["stock","grainSacks",w-8,5,5,4,"특산품 진열","facility:market"],["barrels","barrels",3,h-7,4,4,"술과 기름","v13-inspect:barrels"],["notice","wallChart",w-7,h-7,4,4,"오늘의 시세표","market-view"]],
        inn:[["fire","fireplace",3,4,4,4,"벽난로","v13-inspect:fireplace"],["rumor","barrels",w-7,4,4,4,"술통과 소문","gossip"],["dice","chartTable",3,h-7,5,4,"도박 탁자","gamble"],["meal","tavernBar",w-8,h-7,5,4,"선원 식탁","v13-inspect:meal"]],
        shipyard:[["hull","hullCradle",3,7,8,6,"건조 중인 선체","facility:shipyard"],["crane","crane",w-10,5,7,6,"인양 크레인","v13-inspect:crane"],["tools","workbench",4,h-7,6,4,"수리 작업대","repair"],["rope","ropes",w-8,h-7,5,4,"돛과 밧줄","v13-inspect:rigging"]],
        guild:[["board","wallChart",3,4,5,4,"의뢰 게시판","guild-job"],["chart","chartTable",w-8,4,5,4,"해도 열람대","fragment-board"],["scope","telescope",3,h-7,4,4,"천문 관측구","v13-inspect:telescope"],["archive","wardrobe",w-7,h-7,4,4,"항해 기록고","nation-info"]],
        lodge:[["fire","fireplace",3,4,4,4,"벽난로","v13-inspect:fireplace"],["status","contractDesk",w-7,4,4,4,"함대 장부","status"],["bed","bed",3,h-7,5,4,"침대","rest"],["medicine","wardrobe",w-7,h-7,4,4,"약품장","v13-inspect:medicine"]],
        harbor:[["supply","supplies",3,5,6,5,"보급 창고","facility:harbor"],["crane","crane",w-9,4,6,6,"부두 크레인","v13-inspect:crane"],["papers","contractDesk",3,h-7,5,4,"출항 문서","facility:harbor"],["signal","lantern",w-6,h-7,3,4,"신호등","v13-inspect:signal"]],
        mansion:[["fire","fireplace",3,4,4,4,"가문의 벽난로","v13-inspect:fireplace"],["chart","wallChart",w-8,4,5,4,"가문 해도","story-chart"],["ledger","contractDesk",3,h-7,6,4,"항로 장부","story-ledger"],["portrait","wallChart",w-7,h-7,4,4,"가족 초상","v13-inspect:portrait"]],
        bank:[["vault","vault",3,4,5,4,"금고","bank-menu"],["scale","scale",w-6,4,3,3,"화폐 저울","v13-inspect:scale"],["ledger","contractDesk",3,h-6,5,3,"예금 장부","bank-menu"]],
        estate:[["deeds","contractDesk",3,4,5,4,"매물 장부","property-menu"],["plans","wallChart",w-7,4,4,4,"건물 도면","v13-inspect:plans"],["model","wardrobe",3,h-6,4,3,"축척 모형","v13-inspect:model"]],
        home:[["bed","bed",3,4,5,4,"휴식","home-rest"],["storage","wardrobe",w-7,4,4,4,"개인 창고","home-storage"],["homeport","chartTable",3,h-6,5,3,"귀환항 해도","home-port"]]
      };
      for(const [id,sprite,x,y,pw,ph,label,action] of layouts[f])add(id,sprite,x,y,pw,ph,label,action,true,sprite==="wallChart"||sprite==="wardrobe"||sprite==="fireplace");
    }else{
      const layouts={
        market:[["stores","supplies",3,4,6,5,"특산품 창고","market-view"],["sealed","vault",w-8,4,5,4,"봉인 상자","gossip"],["ledger","contractDesk",3,h-7,5,4,"창고 장부","market-view"],["samples","grainSacks",w-8,h-7,5,4,"견본 포대","v13-inspect:samples"]],
        inn:[["bedA","bed",3,4,5,4,"객실","rest"],["bedB","bed",w-8,4,5,4,"객실","rest"],["meal","tavernBar",3,h-7,6,4,"동료 식탁","gossip"],["chest","wardrobe",w-7,h-7,4,4,"여행객 보관함","v13-inspect:chest"]],
        lodge:[["bedA","bed",3,4,5,4,"치료와 숙박","rest"],["bedB","bed",w-8,4,5,4,"치료와 숙박","rest"],["record","contractDesk",3,h-7,5,4,"건강 기록","status"],["medicine","wardrobe",w-7,h-7,4,4,"약품장","v13-inspect:medicine"]],
        guild:[["archiveA","wardrobe",3,4,4,4,"항해 기록고","guild-job"],["archiveB","wardrobe",w-7,4,4,4,"국가 기록고","nation-info"],["fragments","chartTable",3,h-7,6,4,"황혼 해도편","fragment-board"],["scope","telescope",w-7,h-7,4,4,"천문 관측구","v13-inspect:telescope"]],
        mansion:[["bed","bed",3,4,5,4,"침실",portId==="bella"?"v10-room-bed":"status"],["study","writingDesk",w-9,4,6,4,"서재",portId==="bella"?"story-ledger":"nation-info"],["family","wallChart",3,h-7,5,4,"가족 해도","story-chart"],["keepsake","wardrobe",w-7,h-7,4,4,"유품장","v13-inspect:keepsake"]]
      };
      for(const [id,sprite,x,y,pw,ph,label,action] of layouts[f])add(id,sprite,x,y,pw,ph,label,action,true,["wardrobe","wallChart"].includes(sprite));
    }
  }

  function finish(scene){
    const solids=[];
    for(let y=0;y<scene.height;y++)for(let x=0;x<scene.width;x++)if(scene.tiles[y][x]==="wallBase"||scene.tiles[y][x]==="wallTop")solids.push([x,y,1,1]);
    for(const p of scene.props)if(p.solid)solids.push([p.x+.12,p.y+.18,p.w-.24,p.h-.22]);
    scene.navigation={walkBounds:[.8,1.8,scene.width-1.6,scene.height-2.7],solids,ownerZones:scene.npcs.map(n=>n.workZone).filter(Boolean),corridorWidth:2};
    scene.collision={walkBounds:scene.navigation.walkBounds,solids,polygons:[],doors:[],interactions:scene.hotspots};
    scene.interactionCount=scene.hotspots.length;scene.propCount=scene.props.length;return scene;
  }

  function makeFloor(portId,facility,floor,culture,seed){
    const [width,height]=sizes[facility],upper=floor===2,scene={id:`${portId}:${facility}:${floor}`,floorId:`${floor}f`,portId,facility,culture,cultureRow:cultures.indexOf(culture),width,height,tiles:baseTiles(width,height,facility,upper),props:[],hotspots:[],npcs:[],stairs:[],modules:[],seed,actorScale:1.15,visual:{version:13}};
    addMajor(scene,upper,portId);addDecor(scene,seed);
    const cx=Math.floor(width/2);scene.spawn=[cx,height-2.2];scene.exit={rect:[cx-1.2,height-1.5,2.4,.9],label:"나가기"};
    if(twoFloor.has(facility)){
      const grand=["mansion","guild"].includes(facility),sprite=grand?"grandStair":"sideStair",sw=grand?5:4,sh=grand?5:4,x=width-sw-2,y=height-sh-3;
      scene.props.push(prop(sprite,x,y,sw,sh,false,true,upper?"1층":"2층",""));
      scene.stairs.push({id:upper?"down":"up",rect:[x,y,sw,sh],autoRect:[x+.7,upper?y+sh-1.2:y+.2,sw-1.4,1],toFloor:upper?"1f":"2f",spawn:[x+sw/2,upper?y+1.5:y+sh-1.5],approach:upper?6:2,label:upper?"1층으로":"2층으로",style:grand?"grand":"side",auto:true,visual:{version:13,sprite,x,y,w:sw,h:sh}});
    }
    scene.modules=[{id:`${facility}-service`,role:"service",rect:[2,2,width-4,7]},{id:`${facility}-public`,role:"public",rect:[2,9,width-4,height-11]}];
    return finish(scene);
  }

  HL.DATA.buildingScenes={};
  for(const [portIndex,portId] of HL.DATA.portOrder.entries()){
    const culture=HL.DATA.ports[portId].culture;
    HL.DATA.buildingScenes[portId]=Object.fromEntries(facilities.map((facility,index)=>{
      const floors={"1f":makeFloor(portId,facility,1,culture,portIndex*97+index*17)};
      if(twoFloor.has(facility))floors["2f"]=makeFloor(portId,facility,2,culture,portIndex*97+index*17+11);
      return[facility,{id:`${portId}:${facility}`,portId,facility,culture,name:names[facility],entryFloor:"1f",floors,version:13}];
    }));
  }
  HL.DATA.v13={version:13,tileSize:T,facilities,twoFloor:[...twoFloor],floorSizes:sizes,types:["InteriorTemplateV13","CompactRoomModule","PropPlacementV13","InteractionHintState","TradeViewModel","OnboardingState","BeginnerProtectionState"]};
  HL.DATA.version=13;
})();
