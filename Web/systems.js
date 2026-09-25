window.HL=window.HL||{};

HL.SeededRandom=class{
  constructor(seed=1526){this.seed=seed>>>0||1}
  next(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296}
};

HL.WorldNavigation=class{
  constructor(){
    this.land=[
      [[-10,36],[-9,44],[-10,60],[5,71],[30,71],[45,58],[42,42],[30,36],[26,31],[10,36],[-5,36]],
      [[-17,36],[10,36],[34,31],[44,12],[51,-12],[40,-35],[18,-35],[8,-6],[-17,15]],
      [[26,31],[45,42],[90,75],[180,72],[180,8],[145,-8],[105,2],[78,8],[52,12],[44,12]],
      [[95,8],[145,-8],[154,-30],[116,-39],[105,-8]],
      [[-168,72],[-55,72],[-52,48],[-82,25],[-97,8],[-125,20],[-130,48]],
      [[-82,13],[-34,8],[-35,-56],[-72,-56],[-82,-5]],
      [[43,-12],[51,-12],[50,-26],[43,-26]],
      [[128,32],[146,46],[146,30],[134,24]],[[120,25],[127,19],[124,6],[116,6]]
    ];
    this.reefs=[[-80,22,4],[-76,18,3],[40,-7,3],[56,25,2],[103,2,3],[127,1,4],[151,-20,3],[-16,29,2]];
  }
  pointInPolygon(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside}return inside}
  isLand(lon,lat){return this.land.some(poly=>this.pointInPolygon(lon,lat,poly))}
  reefRisk(lon,lat){return this.reefs.reduce((risk,[x,y,r])=>Math.max(risk,Math.max(0,1-Math.hypot(lon-x,lat-y)/r)),0)}
  depth(lon,lat){const reef=this.reefRisk(lon,lat);if(reef>.1)return Math.max(3,Math.round(28*(1-reef)));let coast=99;for(const p of Object.values(HL.DATA.ports))coast=Math.min(coast,Math.hypot((lon-p.lon)*Math.cos(lat*Math.PI/180),lat-p.lat));return coast<1?18:coast<3?55:180}
  wind(day,month,lat){const seasonal=(month>=5&&month<=9?1:-1),band=lat>25?2:lat<-25?6:seasonal>0?5:1;return(band+Math.floor(day/5))%8}
  current(lon,lat){if(Math.abs(lat)<18)return lon<0?6:2;if(lat>30)return 2;return 6}
  equipmentModifier(ship,key){const eq=ship.equipment||{},parts=[HL.DATA.shipEquipment.figureheads[eq.figurehead||"none"],HL.DATA.shipEquipment.sails[eq.sail||"square"],HL.DATA.shipEquipment.hulls[eq.hull||"wood"]];return parts.reduce((value,part)=>value*(part?.[key]??1),1)}
  reduction(ship,key){const value=HL.DATA.shipEquipment.figureheads[ship.equipment?.figurehead||"none"]?.[key]||0;return Math.min(.4,value)}
  speed(state){const ship=state.fleet[0],spec=HL.DATA.ships[ship.type],heading=state.sea.heading,wind=state.sea.wind,diff=Math.min((heading-wind+8)%8,(wind-heading+8)%8),windEffect=diff<=1?1.2:diff<=3?1:.55,sailKey=diff>=3?"headwind":"tailwind",sail=this.equipmentModifier(ship,sailKey),hull=this.equipmentModifier(ship,"speed"),load=Object.values(state.cargo).reduce((a,b)=>a+b,0),loadEffect=Math.max(.5,1-load/spec.cargo*.3),crewEffect=Math.min(1,ship.crew/spec.crewMin);return Math.max(.2,spec.power/6*windEffect*sail*hull*loadEffect*crewEffect)}
};

HL.EconomySystem=class{
  price(port,goodId,day,buy=true){const base=port.market[goodId]||[100,80],season=.92+((day+goodId.length*7+HL.DATA.portOrder.indexOf(port.id))%19)/100;return Math.max(1,Math.round(base[buy?0:1]*season))}
  cargoValue(state){return Object.entries(state.cargo).reduce((sum,[id,count])=>sum+(HL.DATA.goods.find(g=>g.id===id)?.base||0)*count,0)}
  effectSummary(ship){const f=HL.DATA.shipEquipment.figureheads[ship.equipment?.figurehead||"none"],s=HL.DATA.shipEquipment.sails[ship.equipment?.sail||"square"],h=HL.DATA.shipEquipment.hulls[ship.equipment?.hull||"wood"];return`${f.name} · ${s.name} · ${h.name}`}
};

HL.EncounterSystem=class{
  constructor(navigation){this.navigation=navigation}
  daily(state){const rng=new HL.SeededRandom(state.rngSeed=(state.rngSeed*1664525+1013904223)>>>0),ship=state.fleet[0],events=[];state.rngSeed=rng.seed;const latitude=Math.abs(state.sea.lat),season=Math.abs(7-state.month),stormBase=.025+Math.max(0,latitude-35)/900+season/800,stormChance=stormBase*(1-this.navigation.reduction(ship,"stormReduction"));if(rng.next()<stormChance)events.push("storm");if(state.voyageDays>=45&&rng.next()<.035+(state.voyageDays-45)/2200)events.push("scurvy");if(state.crew.health<55&&rng.next()<.04)events.push("disease");if(rng.next()<.025*(1-this.navigation.reduction(ship,"encounterReduction")))events.push("pirate");return events}
  stormDamage(state){const ship=state.fleet[0],severity=8+(state.day*7%17);ship.hull=Math.max(0,ship.hull-severity);ship.sailCondition=Math.max(0,(ship.sailCondition??100)-Math.round(severity*.8));state.crew.health=Math.max(0,state.crew.health-Math.round(severity*.35));state.crew.morale=Math.max(0,state.crew.morale-8);return severity}
  disease(state,type){state.crew.disease=type;state.crew.health=Math.max(1,state.crew.health-12);state.crew.fatigue=Math.min(100,state.crew.fatigue+15)}
};

HL.BattleSystem=class{
  cannonDamage(attacker,defender,distance,rng){const guns=Math.max(1,attacker.guns||0),accuracy=Math.max(.25,1-distance*.09),damage=Math.round((6+guns*2)*(accuracy+rng.next()*.35));defender.hp=Math.max(0,defender.hp-damage);return damage}
  boardingDamage(attacker,defender,rng){const attack=attacker.crew*(.65+rng.next()*.55),guard=defender.crew*(.55+rng.next()*.45),loss=Math.max(1,Math.round(Math.abs(attack-guard)/7));if(attack>=guard)defender.crew=Math.max(0,defender.crew-loss);else attacker.crew=Math.max(0,attacker.crew-loss);return{winner:attack>=guard?"attacker":"defender",loss}}
};

HL.SpriteAnimator=class{
  constructor(meta=HL.DATA.spriteMeta){this.meta=meta}
  frame(direction,time,moving=true){const sequence=moving?this.meta.walkFrames:this.meta.idleFrames,index=sequence[Math.floor(time*(moving?10:3))%sequence.length],cardinal=direction===0||direction===1||direction===7?"north":direction===2||direction===3?"east":direction===4?"south":"west";return{x:index*this.meta.frameWidth,y:this.meta.sourceRows[cardinal]*this.meta.frameHeight,w:this.meta.frameWidth,h:this.meta.frameHeight,pivot:this.meta.pivot}}
};
