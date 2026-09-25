window.HL=window.HL||{};
(function(){
  "use strict";
  const V12="../Assets/Resources/Sprites/Game/V12/",T=30;
  const cultures=HL.DATA.v10.cultures,bodies=["child","slim","average","broad","tall","short","elder","stooped"],professions=["citizen","merchant","innkeeper","shipwright","guildmaster","harbormaster","banker","noble","sailor","guard","scholar","artisan"];
  const facilities=["market","inn","shipyard","guild","lodge","harbor","mansion","bank","estate","home"],twoFloor=new Set(["market","inn","lodge","guild","mansion"]);
  const names={market:"시장",inn:"여관",shipyard:"조선소",guild:"길드",lodge:"숙소",harbor:"항만",mansion:"저택",bank:"은행",estate:"부동산 사무소",home:"선장의 집"};
  const roleByFacility={market:"merchant",inn:"innkeeper",shipyard:"shipwright",guild:"guildmaster",lodge:"innkeeper",harbor:"harbormaster",mansion:"noble",bank:"banker",estate:"banker",home:"noble"};
  const actionByFacility={market:"facility:market",inn:"facility:inn",shipyard:"facility:shipyard",guild:"facility:guild",lodge:"facility:lodge",harbor:"facility:harbor",mansion:"facility:mansion",bank:"bank-menu",estate:"property-menu",home:"home-menu"};
  const floorSizes={market:[48,30],inn:[48,30],lodge:[48,30],harbor:[48,30],guild:[56,34],mansion:[64,40],shipyard:[64,40],bank:[40,24],estate:[40,24],home:[40,24]};
  const tileNames=["floorStoneA","floorStoneB","floorWoodA","floorWoodB","floorTileA","floorTileB","wallBase","wallTop","wallCorner","door","window","pillar","rugA","rugB","waterA","waterB","dock","rail","counterL","counterM","counterR","shelfL","shelfM","shelfR","bedHead","bedMid","bedFoot","crate","barrel","table","chair","stool","partition","arch","lamp","plant","banner","painting","stairsStone","stairsWood","hatch","rope","net","cannon","mast","forge","anvil","decor"];
  const objectNames=["writingDesk","scale","grainSacks","barrels","tavernBar","fireplace","bed","wardrobe","chartTable","wallChart","telescope","workbench","hullCradle","crane","ropes","supplies","vault","contractDesk","grandStair","sideStair","hatch","mastBase","cannon","lantern"];
  const tileIndex=Object.fromEntries(tileNames.map((id,index)=>[id,index])),objectIndex=Object.fromEntries(objectNames.map((id,index)=>[id,index]));
  const hash=text=>{let h=2166136261;for(const ch of String(text)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
  const paletteByCulture={iberia:["#315f73","#9b563e","#d1a45f"],north:["#3d5d75","#73505b","#c2ab7c"],med:["#735044","#2f6870","#c59555"],island:["#2d6b69","#81583a","#d0a45e"],maghreb:["#81623c","#35685f","#c79655"],ottoman:["#69445f","#315f68","#c49a5d"],africa:["#496342","#8b5437","#d0a167"],arabia:["#755f3f","#335f64","#bd8e53"],india:["#854953","#3f665f","#d4a746"],seasia:["#336b62","#9a593b","#cda163"],china:["#7a403e","#315c65","#c99b59"],japan:["#415b70","#a45f54","#d1af72"],caribbean:["#30686f","#a45f38","#cfa358"],americas:["#52683f","#98593b","#c89d5e"]};

  function professionFor(id){if(id.startsWith("owner_")){const facility=id.split("_").pop();return roleByFacility[facility]||"merchant"}if(id.includes("merchant"))return"merchant";if(id.includes("sailor")||id.includes("watch"))return"sailor";if(id.includes("guard"))return"guard";if(id.includes("scribe"))return"scholar";if(id.includes("guide"))return"citizen";return"citizen"}
  function cultureFor(id){for(const portId of HL.DATA.portOrder)if(id.includes(portId))return HL.DATA.ports[portId].culture;return"iberia"}
  const recipes={},used=new Set();let serial=0;
  function makeRecipe(id,forcedProfession){
    if(recipes[id])return recipes[id];const h=hash(id),profession=forcedProfession||professionFor(id),culture=cultureFor(id),body=bodies[(h+serial*3)%bodies.length],age=["young","adult","mature","elder"][(h>>>5)%4],hair=(h>>>8)%16,hat=(h>>>13)%12,accessory=(h>>>17)%16,paletteIndex=(h>>>21)%12,variant=serial++;
    let signature=[body,age,hair,culture,profession,hat,accessory,paletteIndex,variant].join("|");while(used.has(signature))signature+="+";used.add(signature);
    return recipes[id]={id,body,age,hair,culture,profession,hat,accessory,paletteIndex,variant,palette:paletteByCulture[culture]||paletteByCulture.iberia,appearanceSignature:signature,sheet:{town:`${V12}NPC/${body}_${profession}_town.png`,interior:`${V12}NPC/${body}_${profession}_interior.png`}}
  }
  for(const portId of HL.DATA.portOrder){for(const role of["guide","merchant","sailor","scribe"])makeRecipe(`${portId}_${role}`);for(const facility of facilities)makeRecipe(`owner_${portId}_${facility}`,roleByFacility[facility])}
  makeRecipe("bella_sailor","sailor");HL.DATA.appearanceRecipesV12=recipes;HL.DATA.appearanceRecipeV12=id=>makeRecipe(id);

  const prop=(sprite,x,y,w=4,h=4,solid=true,high=false,label="",action="")=>({type:"v12Object",sprite,x,y,w,h,solid,high,label,action});
  const hotspot=(id,rect,label,action)=>({id,rect,label,action});
  function paintBase(width,height,facility,culture,upper){
    const wood=["inn","lodge","mansion","home","shipyard","harbor"].includes(facility),floor=wood?(upper?"floorWoodB":"floorWoodA"):(upper?"floorTileB":"floorStoneA"),tiles=Array.from({length:height},()=>Array(width).fill(floor));
    for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(x===0||x===width-1||y<3||y===height-1)tiles[y][x]="wallBase";
    const doorX=Math.floor(width/2);tiles[height-1][doorX]="door";tiles[height-1][doorX-1]="door";
    for(let x=4;x<width-4;x+=8)tiles[2][x]="window";
    const split=Math.floor(width*.34),end=Math.floor(height*.44),doorY=Math.floor(end*.66);for(let y=3;y<=end;y++)if(y!==doorY&&y!==doorY+1)tiles[y][split]="wallBase";
    if(width>=56){const split2=Math.floor(width*.7);for(let y=3;y<=end+3;y++)if(y!==doorY+2&&y!==doorY+3)tiles[y][split2]="wallBase"}
    if(upper){const wallY=Math.floor(height*.55);for(let x=1;x<Math.floor(width*.45);x++)if(x!==Math.floor(width*.22)&&x!==Math.floor(width*.22)+1)tiles[wallY][x]="wallBase"}
    return tiles
  }
  function decorateFloor(scene,upper){
    const {tiles,width:w,height:h,facility:f}=scene,cx=Math.floor(w/2);
    const rugTop=upper?h-15:h-14,rugBottom=h-5,rugHalf=["guild","mansion"].includes(f)?7:5;
    for(let y=rugTop;y<rugBottom;y++)for(let x=cx-rugHalf;x<=cx+rugHalf;x++)tiles[y][x]=(x===cx-rugHalf||x===cx+rugHalf||y===rugTop||y===rugBottom-1)?"rugB":"rugA";
    const dividerY=upper?Math.floor(h*.43):Math.floor(h*.4),openings=[Math.floor(w*.25),cx,Math.floor(w*.75)];
    for(let x=2;x<w-2;x++)if(!openings.some(open=>Math.abs(x-open)<=1))tiles[dividerY][x]="wallBase";
    for(const x of [2,w-3])for(let y=5;y<h-5;y+=7)tiles[y][x]="pillar";
    if(["shipyard","harbor"].includes(f))for(let x=3;x<w-3;x++)for(let y=h-7;y<h-3;y++)tiles[y][x]=(x+y)%2?"dock":"floorWoodB";
    if(f==="harbor")for(let x=3;x<w-3;x++)tiles[h-3][x]="rail";
  }
  function addCommon(scene,seed){const {width:w,height:h}=scene;scene.props.push(prop("lantern",3,3,2,3,false,true,"등불","v12-inspect:lamp"),prop("lantern",w-5,3,2,3,false,true,"등불","v12-inspect:lamp"));if(seed%2)scene.props.push(prop("wardrobe",w-9,7,4,5,true,true,"수납장","v12-inspect:wardrobe"))}
  function addFacility(scene,upper,portId){
    const w=scene.width,h=scene.height,f=scene.facility,ownerId=`owner_${portId}_${f}`,ownerAction=actionByFacility[f],P=scene.props,H=scene.hotspots,N=scene.npcs;
    const add=(id,sprite,x,y,pw,ph,label,action,solid=true,high=false)=>{P.push(prop(sprite,x,y,pw,ph,solid,high,label,action));if(action)H.push(hotspot(id,[x,y,pw,ph],label,action))};
    if(!upper){
      const deskX=Math.floor(w*.48)-2;add("owner",f==="inn"?"tavernBar":f==="shipyard"?"workbench":f==="bank"?"contractDesk":"writingDesk",deskX,5,f==="inn"?7:5,4,names[f]+" 이용",ownerAction,true,true);N.push({id:"owner",name:names[f]+" 주인",x:deskX+2.2,y:4.4,dir:4,appearanceId:ownerId,workZone:[deskX+1,3,3,2]});
      if(f==="market"){add("scale","scale",5,6,4,4,"저울과 시세표","market-view");add("stock","grainSacks",w-11,6,6,5,"특산품 포대","facility:market");add("barrels","barrels",5,h-10,5,5,"술통","v12-inspect:barrels")}
      if(f==="inn"){add("fireplace","fireplace",4,5,5,5,"벽난로","v12-inspect:fireplace");add("rumor","barrels",w-10,6,5,5,"술통과 소문","gossip");add("dice","chartTable",Math.floor(w*.46),h-10,6,5,"도박 탁자","gamble")}
      if(f==="shipyard"){add("hull","hullCradle",5,7,10,7,"건조 중인 선체","facility:shipyard");add("crane","crane",w-12,6,7,7,"인양 크레인","v12-inspect:crane");add("tools","workbench",Math.floor(w*.48),h-10,6,5,"수리 작업대","repair")}
      if(f==="guild"){add("board","wallChart",4,5,6,5,"의뢰 게시판","guild-job");add("chart","chartTable",w-12,6,7,5,"해도 열람대","fragment-board");add("scope","telescope",Math.floor(w*.5),h-10,5,5,"천문 관측구","v12-inspect:telescope")}
      if(f==="lodge"){add("fireplace","fireplace",4,5,5,5,"벽난로","v12-inspect:fireplace");add("status","contractDesk",w-10,6,5,5,"함대 상태 장부","status");add("rest","bed",Math.floor(w*.47),h-10,6,5,"침대","rest")}
      if(f==="harbor"){add("supply","supplies",4,6,7,6,"보급 창고","facility:harbor");add("crane","crane",w-12,6,7,7,"부두 크레인","v12-inspect:crane");add("papers","contractDesk",Math.floor(w*.46),h-10,6,5,"출항 문서","facility:harbor")}
      if(f==="mansion"){add("fireplace","fireplace",4,5,5,5,"가문의 벽난로","v12-inspect:fireplace");add("chart","wallChart",w-11,5,6,5,"가문 해도","story-chart");add("ledger","contractDesk",Math.floor(w*.46),h-11,7,5,"항로 장부","story-ledger")}
      if(f==="bank"){add("vault","vault",4,6,6,5,"금고","bank-menu");add("scale","scale",w-9,6,4,4,"화폐 저울","v12-inspect:scale")}
      if(f==="estate"){add("deeds","contractDesk",4,6,6,5,"매물 장부","property-menu");add("model","wardrobe",w-9,6,4,5,"건물 도면함","v12-inspect:plans")}
      if(f==="home"){add("bed","bed",4,6,6,5,"휴식","home-rest");add("storage","wardrobe",w-9,6,4,5,"개인 창고","home-storage");add("homeport","chartTable",Math.floor(w*.44),h-10,6,5,"귀환항 해도","home-port")}
    }else{
      if(f==="market"){add("stores","supplies",5,6,8,6,"특산품 창고","market-view");add("sealed","vault",w-12,6,6,5,"봉인된 상자","gossip");add("ledger","contractDesk",Math.floor(w*.46),h-10,6,5,"창고 장부","market-view")}
      if(f==="inn"){add("bedA","bed",4,5,6,5,"객실에서 쉰다","rest");add("bedB","bed",w-11,5,6,5,"객실에서 쉰다","rest");add("meal","tavernBar",Math.floor(w*.43),h-11,8,5,"동료와 식사","gossip")}
      if(f==="lodge"){add("bedA","bed",4,5,6,5,"치료와 숙박","rest");add("bedB","bed",w-11,5,6,5,"치료와 숙박","rest");add("record","contractDesk",Math.floor(w*.46),h-10,6,5,"건강 기록","status")}
      if(f==="guild"){add("archiveA","wardrobe",4,5,5,6,"항해 기록고","guild-job");add("archiveB","wardrobe",w-10,5,5,6,"국가 기록고","nation-info");add("archiveC","wardrobe",Math.floor(w*.2),h-12,5,6,"선장 기록고","guild-job");add("archiveD","wardrobe",Math.floor(w*.72),h-12,5,6,"항구 기록고","nation-info");add("fragments","chartTable",Math.floor(w*.43),h-12,9,6,"황혼 해도편","fragment-board");add("scope","telescope",Math.floor(w*.34),h-11,4,5,"천문 관측구","v12-inspect:telescope",true,false)}
      if(f==="mansion"){add("bedroom","bed",4,5,7,5,"침실",portId==="bella"?"v10-room-bed":"status");add("study","writingDesk",w-12,5,7,5,"서재",portId==="bella"?"story-ledger":"nation-info");add("family","wallChart",Math.floor(w*.45),h-12,7,6,"가족 해도","story-chart")}
    }
  }
  function finishFloor(scene){
    const solids=[];for(let y=0;y<scene.height;y++)for(let x=0;x<scene.width;x++)if(scene.tiles[y][x]==="wallBase")solids.push([x,y,1,1]);for(const p of scene.props)if(p.solid)solids.push([p.x+.12,p.y+.18,p.w-.24,p.h-.22]);
    scene.navigation={walkBounds:[.8,2.8,scene.width-1.6,scene.height-3.7],solids,ownerZones:scene.npcs.map(n=>n.workZone).filter(Boolean),corridorWidth:2};scene.collision={walkBounds:scene.navigation.walkBounds,solids,polygons:[],doors:[],interactions:scene.hotspots};return scene
  }
  function floorLayout(portId,facility,floor,culture,seed){
    const [width,height]=floorSizes[facility],upper=floor===2,scene={id:`${portId}:${facility}:${floor}`,floorId:`${floor}f`,portId,facility,culture,cultureRow:cultures.indexOf(culture),width,height,tiles:paintBase(width,height,facility,culture,upper),props:[],hotspots:[],npcs:[],stairs:[],modules:[],seed,actorScale:1.15,visual:{version:12}};
    decorateFloor(scene,upper);addFacility(scene,upper,portId);addCommon(scene,seed);const doorX=Math.floor(width/2);scene.spawn=[doorX,height-2.2];scene.exit={rect:[doorX-1.2,height-2,2.4,1.2],label:"나가기"};
    if(twoFloor.has(facility)){const sprite=["mansion","guild"].includes(facility)?"grandStair":"sideStair",sw=sprite==="grandStair"?6:4,sh=sprite==="grandStair"?6:5,x=width-sw-3,y=height-sh-4,toFloor=upper?"1f":"2f";scene.props.push(prop(sprite,x,y,sw,sh,false,true,upper?"1층으로":"2층으로",""));scene.stairs.push({id:upper?"down":"up",rect:[x,y,sw,sh],autoRect:[x+.6,upper?y+sh-1.4:y+.2,sw-1.2,1.2],toFloor,spawn:[x+sw/2,upper?y+1.7:y+sh-1.7],approach:upper?6:2,label:upper?"1층으로":"2층으로",style:sprite==="grandStair"?"grand":"side",auto:true,visual:{version:12,sprite,x,y,w:sw,h:sh}})}
    scene.modules=[{id:`${facility}-service`,role:"service",rect:[2,3,width-4,9]},{id:`${facility}-public`,role:"public",rect:[2,12,width-4,height-15]}];return finishFloor(scene)
  }
  HL.DATA.buildingScenes={};
  for(const [portIndex,portId] of HL.DATA.portOrder.entries()){const culture=HL.DATA.ports[portId].culture;HL.DATA.buildingScenes[portId]=Object.fromEntries(facilities.map((facility,index)=>{const floors={"1f":floorLayout(portId,facility,1,culture,portIndex*97+index*17)};if(twoFloor.has(facility))floors["2f"]=floorLayout(portId,facility,2,culture,portIndex*97+index*17+11);return[facility,{id:`${portId}:${facility}`,portId,facility,culture,name:names[facility],entryFloor:"1f",floors,version:12}]}))}

  HL.DATA.tileSetV12={version:12,tileSize:T,atlas:`${V12}Interiors/interior_tiles_v12.png`,cultures,tileIndex};
  HL.DATA.objectSpritesV12={version:12,atlas:`${V12}Interiors/interior_objects_v12.png`,cell:128,index:objectIndex};
  HL.DATA.shipVisualManifestsV12=Object.fromEntries(Object.entries({caravel:[128,160,192,256],cog:[128,160,192,256],galley:[128,160,192,256],brig:[128,160,192,256],carrack:[128,160,192,256]}).map(([type,d])=>[type,{type,directions:8,phases:4,world:{frameWidth:d[0],frameHeight:d[1]},battle:{frameWidth:d[2],frameHeight:d[3]},layers:Object.fromEntries(["world","battle"].map(size=>[size,{hull:`${V12}Ships/${type}_${size}_hull.png`,hullDamaged:`${V12}Ships/${type}_${size}_hull_damaged.png`,sails:`${V12}Ships/${type}_${size}_sails.png`,sailsDamaged:`${V12}Ships/${type}_${size}_sails_damaged.png`,equipment:`${V12}Ships/${type}_${size}_equipment.png`}]))}]));
  HL.DATA.shipDeckTemplatesV12={caravel:{size:[36,24],masts:[[18,8],[18,15]],hatch:[18,19],rails:2},cog:{size:[38,26],masts:[[19,11]],hatch:[19,20],rails:3},galley:{size:[48,20],masts:[[24,9]],hatch:[24,15],oars:true},brig:{size:[42,26],masts:[[21,8],[21,17]],hatch:[21,21],rails:2},carrack:{size:[48,30],masts:[[24,7],[24,15],[24,22]],hatch:[24,25],rails:3}};
  HL.DATA.v12={version:12,assetRoot:V12,cultures,bodies,professions,facilities,floorSizes,tileIndex,objectIndex,types:["AppearanceRecipeV12","SpriteLayerManifestV12","InteriorTemplateV12","RoomModule","PropDefinitionV12","NavigationMapV12","ShipVisualManifestV12","ShipDeckTemplateV12"]};HL.DATA.version=12;
})();
