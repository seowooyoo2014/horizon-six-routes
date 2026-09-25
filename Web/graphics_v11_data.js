window.HL=window.HL||{};
(function(){
  "use strict";
  HL.DATA.version=11;
  const V11="../Assets/Resources/Sprites/Game/V11/";
  const tileNames=["floorA","floorB","wall","wallTop","rug","water","door","yard","pillar","window","crate","barrel","table","bedHead","bedMid","bedFoot","counterLeft","counterMid","counterRight","shelfLeft","shelfMid","shelfRight","stoneStairBottom","stoneStairMid","stoneStairTop","woodStairBottom","woodStairMid","woodStairTop","hatch","rail","lamp","decor"];
  const tileIndex=Object.fromEntries(tileNames.map((name,index)=>[name,index]));
  const mainCharacters=["rian","damian","orso","mira","vardo"];
  const normalizeManifest=(id,source)=>({
    id,version:11,directions:["N","NE","E","SE","S","SW","W","NW"],idleFrames:[0,1,2,3],walkFrames:[4,5,6,7,8,9],fps:{idle:3,walk:10},hitRadius:source?.hitRadius||.28,
    modes:Object.fromEntries(["town","interior"].map(mode=>{
      const entry=source?.[mode],w=entry?.frameWidth||(mode==="town"?48:64),h=entry?.frameHeight||(mode==="town"?72:96);
      return[mode,{src:entry?.src||"",frameWidth:w,frameHeight:h,frames:entry?.frames||Object.fromEntries(Array.from({length:8},(_,direction)=>[direction,Array.from({length:10},(_,frame)=>({x:frame*w,y:direction*h,w,h,pivot:[Math.floor(w/2),h-3],shadow:[Math.floor(w/2),h-2]}))]))}]
    }))
  });
  HL.DATA.spriteManifestsV11=Object.fromEntries(mainCharacters.map(id=>[id,normalizeManifest(id,HL.DATA.spriteSheets[id])]));
  for(const id of mainCharacters){HL.DATA.spriteManifestsV11[id].modes.town.src=`${V11}Characters/${id}_town_v11.png`;HL.DATA.spriteManifestsV11[id].modes.interior.src=`${V11}Characters/${id}_interior_v11.png`}
  HL.DATA.spriteManifestsV11.citizen=normalizeManifest("citizen",HL.DATA.spriteSheets.rian);
  const ships=["caravel","cog","galley","brig","carrack"];
  HL.DATA.shipVisualManifestsV11=Object.fromEntries(ships.map(type=>[type,{
    type,directions:8,world:{frameWidth:96,frameHeight:128},battle:{frameWidth:144,frameHeight:192},
    layers:Object.fromEntries(["world","battle"].map(size=>[size,{
      hull:`${V11}Ships/${type}_${size}_hull.png`,hullDamaged:`${V11}Ships/${type}_${size}_hull_damaged.png`,
      sails:`${V11}Ships/${type}_${size}_sails.png`,sailsDamaged:`${V11}Ships/${type}_${size}_sails_damaged.png`,equipment:`${V11}Ships/${type}_${size}_equipment.png`
    }]))
  }]));
  HL.DATA.tileSetV11={version:11,tileSize:30,columns:32,atlas:`${V11}interior_tiles_v11.png`,cultures:HL.DATA.v10.cultures,tileIndex};
  HL.DATA.stairTemplatesV11={
    grand:{id:"grand",label:"석조 대계단",width:5,height:6,tiles:["stoneStairBottom","stoneStairMid","stoneStairTop"],rail:true},
    side:{id:"side",label:"목조 측면 계단",width:3,height:6,tiles:["woodStairBottom","woodStairMid","woodStairTop"],rail:true},
    hatch:{id:"hatch",label:"선박 해치",width:3,height:3,tiles:["hatch"],rail:false}
  };
  const styleFor=facility=>["mansion","guild"].includes(facility)?"grand":["market","inn","lodge"].includes(facility)?"side":"hatch";
  const patchFloor=(floor,facility)=>{
    if(!floor)return;
    floor.visual={version:11,tileSet:"interior_v11",culture:floor.culture};
    for(const prop of floor.props||[]){
      if(prop.type==="stairUp"||prop.type==="stairDown")prop.hiddenV11=true;
      prop.depthGroup=prop.high?"high":"low";
    }
    for(const stair of floor.stairs||[]){
      stair.style=styleFor(facility);stair.auto=true;
      const grand=stair.style==="grand",hatch=stair.style==="hatch",x=grand?24:27,y=grand?9:hatch?12:10,w=grand?5:3,h=grand?7:hatch?3:6;
      stair.rect=[x,y,w,h];stair.autoRect=stair.toFloor==="2f"?[x+.45,y+.15,w-.9,1.15]:[x+.45,y+h-1.35,w-.9,1.15];
      stair.spawn=stair.toFloor==="2f"?[x+w/2,y+h-1.7]:[x+w/2,y+1.7];
      stair.visual={style:stair.style,x,y,w,h};
      floor.collision.solids.push([x,y,1,h],[x+w-1,y,1,h]);
    }
    floor.collision.solids=(floor.collision.solids||[]).filter(r=>!(r[0]===27&&r[1]===13&&r[2]===3&&r[3]===3));
  };
  for(const facilities of Object.values(HL.DATA.buildingScenes))for(const [facility,building] of Object.entries(facilities))for(const floor of Object.values(building.floors))patchFloor(floor,facility);
  for(const [id,floor] of Object.entries(HL.DATA.v10PrologueFloors)){
    patchFloor(floor,"ship");
    if(id==="shipLower"&&floor.stairs?.[0]){const s=floor.stairs[0];s.autoRect=[27.4,12.2,2.2,1.1]}
  }
  HL.DATA.v11={version:11,mainCharacters,ships,styleFor,tileIndex,assetRoot:V11};
})();
