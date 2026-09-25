window.HL=window.HL||{};
(function(){
  "use strict";
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const deepCopy=value=>JSON.parse(JSON.stringify(value));
  const dirName=index=>HL.DATA.directionNames[(index+8)%8];

  HL.DATA.version=6;

  HL.SeaSimulation=class{
    constructor(){this.stepSeconds=.1;this.hourTicks=12}
    ensure(state){
      const sea=state.sea||(state.sea={});
      state.seaSim={mode:sea.anchor?"Anchored":"Sailing",ticks:0,hourTicks:0,autoSail:null,lastTarget:sea.autoTarget||null,weatherEvent:null,shore:null,lastEvent:"",...(state.seaSim||{})};
      state.seaSim.mode=state.seaSim.mode||"Anchored";
      state.crew=state.crew||{health:100,fatigue:0,morale:82,disease:null};
      state.crew.roles={captain:0,firstMate:0,bookkeeper:0,chiefNavigator:0,...(state.crew.roles||{})};
      state.crew.wageRate=state.crew.wageRate||100;
      state.inventory={quadrant:false,theodolite:false,...state.inventory};
      state.cargo={balm:0,rat_poison:0,cat:0,...state.cargo};
      for(const [index,ship] of state.fleet.entries())this.ensureShip(ship,index===0?state.crew.assignment:null);
      state.crew.assignment={...state.fleet[0].voyage.assignment};
      sea.speed=1;sea.autoTarget=null;sea.weather=state.seaSim.weatherEvent?.phase==="storm"?"폭풍":sea.weather||"맑음";
      return state.seaSim
    }
    ensureShip(ship,legacy){
      const crew=Math.max(1,ship.crew||1),nav=Math.max(1,Math.floor(crew*.45)),look=Math.max(1,Math.floor(crew*.2));
      ship.sailCondition??=100;ship.cannonballs??=24;ship.captainIndex??=0;
      ship.voyage={assignment:{navigation:nav,lookout:look,combat:Math.max(0,crew-nav-look),...(legacy||ship.voyage?.assignment)},rationFood:ship.voyage?.rationFood??100,rationWater:ship.voyage?.rationWater??100,rudder:ship.voyage?.rudder??100,flooding:ship.voyage?.flooding??0,condition:ship.voyage?.condition??100,wagesPaid:ship.voyage?.wagesPaid??true};
      this.normalizeAssignment(ship)
    }
    normalizeAssignment(ship){
      const a=ship.voyage.assignment,total=Math.max(1,ship.crew),sum=Math.max(1,(a.navigation||0)+(a.lookout||0)+(a.combat||0));
      a.navigation=Math.max(1,Math.floor((a.navigation||0)*total/sum));
      a.lookout=Math.max(0,Math.floor((a.lookout||0)*total/sum));
      a.combat=Math.max(0,total-a.navigation-a.lookout)
    }
    hasCelestial(state){return state.stats?.knowledge>=65||state.mates?.some(m=>m.skills?.celestialNavigation||m.celestialNavigation||m.name==="오르소 벤"&&m.sailing>=30)}
    instrument(state){if(state.inventory?.theodolite)return{key:"theodolite",error:.05};if(state.inventory?.sextant)return{key:"sextant",error:.18};if(state.inventory?.quadrant)return{key:"quadrant",error:.55};return null}
    canAutoSail(state){return!!(this.hasCelestial(state)&&this.instrument(state))}
    cargoLoad(state,ship,index){
      const trade=index===0?Object.values(state.cargo||{}).reduce((sum,value)=>sum+(typeof value==="number"?value:0),0):0;
      return trade+(ship.food||0)+(ship.water||0)+(ship.lumber||0)+(ship.cannonballs||0)*.08
    }
    shipSpeed(state,ship,index=0){
      const spec=HL.DATA.ships[ship.type]||HL.DATA.ships.caravel,heading=state.sea.heading,wind=state.sea.wind,diff=Math.min((heading-wind+8)%8,(wind-heading+8)%8),equipment=ship.equipment||{},lateen=equipment.sail==="lateen",topsail=equipment.sail==="topsail";
      const windEffect=diff<=1?(lateen?1.08:topsail?1.34:1.25):diff<=3?(lateen?1.1:1):(lateen?.8:.46);
      const handling=(spec.handling||5)/8,load=clamp(1-this.cargoLoad(state,ship,index)/Math.max(1,spec.cargo)*.32,.42,1),minimum=Math.max(1,spec.crewMin),a=ship.voyage.assignment,crew=clamp(a.navigation/minimum,.35,1.18),condition=clamp(Math.min(ship.hull/(spec.hull||ship.hull),ship.sailCondition/100,ship.voyage.rudder/100),.2,1),level=1+clamp((state.stats?.navigation||0)/500,0,.2);
      return Math.max(.14,(spec.power/6)*(windEffect*(.72+handling*.28))*load*crew*condition*level)
    }
    fleetSpeed(state){this.ensure(state);return state.fleet.reduce((slowest,ship,index)=>Math.min(slowest,this.shipSpeed(state,ship,index)),Infinity)}
    headingTo(state,port,grid){return grid.headingBetween([state.sea.lon,state.sea.lat],grid.portApproach(port).spawn)}
    updateHeading(state,grid){const sim=this.ensure(state);if(!sim.autoSail||!this.canAutoSail(state))return;const port=HL.DATA.ports[sim.autoSail];if(!port||!state.knownPorts.includes(sim.autoSail)){sim.autoSail=null;return}state.sea.heading=this.headingTo(state,port,grid)}
    step(state,grid){
      const sim=this.ensure(state),events=[];sim.ticks++;sim.hourTicks++;
      this.updateHeading(state,grid);state.sea.current=grid.navigation.current(state.sea.lon,state.sea.lat);
      const adrift=sim.mode==="Adrift",moving=!state.sea.anchor&&sim.mode!=="Shore"&&sim.mode!=="Encounter";
      if(moving){
        const speed=adrift?.12:this.fleetSpeed(state),savedHeading=state.sea.heading;
        if(adrift)state.sea.heading=state.sea.current;
        const result=grid.move(state,speed*.0035);state.sea.heading=savedHeading;state.sea.depth=grid.depth(state.sea.lon,state.sea.lat);
        const draft=Math.max(...state.fleet.map(ship=>({caravel:6,cog:10,galley:7,brig:12}[ship.type]||8)));
        if(result.blocked||state.sea.depth<draft){const hard=result.impact>.012||state.sea.depth<Math.max(5,draft*.7);if(hard){for(const ship of state.fleet){ship.hull=Math.max(0,ship.hull-2);ship.sailCondition=Math.max(0,ship.sailCondition-1)}events.push({type:"grounding"})}}
      }
      if(sim.hourTicks>=this.hourTicks){sim.hourTicks=0;events.push(...this.advanceHour(state))}
      return events
    }
    advanceHour(state){
      const sim=this.ensure(state),events=[];state.hour=(state.hour||0)+1;
      const weather=sim.weatherEvent;
      if(weather?.phase==="warning"&&--weather.hours<=0){weather.phase="storm";weather.hours=6+Math.floor(this.random(state)*9);sim.mode=state.sea.anchor?"Anchored":"Storm";state.sea.weather="폭풍";events.push({type:"storm-start"})}
      else if(weather?.phase==="storm"){
        this.applyStormHour(state,weather,events);if(--weather.hours<=0){sim.weatherEvent=null;state.sea.weather="맑음";sim.mode=state.sea.anchor?"Anchored":"Sailing";events.push({type:"storm-end"})}
      }
      if(state.hour>=24){state.hour=0;this.advanceDate(state);events.push(...this.advanceDay(state))}
      return events
    }
    advanceDate(state){const days=[31,28,31,30,31,30,31,31,30,31,30,31];state.day++;if(state.day>days[(state.month||1)-1]){state.day=1;state.month++;if(state.month>12){state.month=1;state.year++}}}
    advanceDay(state){
      const sim=this.ensure(state),events=[];state.voyageDays=(state.voyageDays||0)+1;
      for(const ship of state.fleet)this.consumeShip(state,ship,events);
      state.crew.fatigue=clamp(state.crew.fatigue+3,0,100);state.sea.wind=state.sea.weather==="폭풍"?state.sea.wind:gridlessWind(state);
      if(!sim.weatherEvent&&this.random(state)<this.stormChance(state)){sim.weatherEvent={phase:"warning",hours:2,severity:.65+this.random(state)*.7};state.sea.weather="폭풍 전조";events.push({type:"storm-warning"})}
      if(state.voyageDays>=45&&!state.crew.disease&&this.random(state)<.035+(state.voyageDays-45)/1800){state.crew.disease="괴혈병";state.crew.health=clamp(state.crew.health-10,0,100);events.push({type:"scurvy"})}
      else if(state.voyageDays>=14&&!state.crew.rats&&this.random(state)<.025){state.crew.rats=true;events.push({type:"rats"})}
      if(state.crew.rats){for(const ship of state.fleet)ship.food=Math.max(0,ship.food-.5);if(this.random(state)<.035&&!state.crew.disease)state.crew.disease="열병"}
      if(state.day===1)this.payWages(state,events);return events
    }
    consumeShip(state,ship,events){
      const vf=ship.voyage,foodUse=Math.max(.2,ship.crew/12*vf.rationFood/100),waterUse=Math.max(.2,ship.crew/12*vf.rationWater/100),foodBefore=ship.food||0,waterBefore=ship.water||0;
      ship.food=Math.max(0,foodBefore-foodUse);ship.water=Math.max(0,waterBefore-waterUse);
      const short=foodBefore<foodUse||waterBefore<waterUse,low=vf.rationFood<90||vf.rationWater<90;
      if(short||low){const penalty=short?9:Math.ceil((90-Math.min(vf.rationFood,vf.rationWater))/15);state.crew.health=clamp(state.crew.health-penalty,0,100);state.crew.morale=clamp(state.crew.morale-(short?7:2),0,100);vf.condition=clamp(vf.condition-penalty,0,100);if(state.crew.health<22&&this.random(state)<.35){ship.crew=Math.max(0,ship.crew-1);this.normalizeAssignment(ship);events.push({type:"crew-loss",ship:ship.name})}}
    }
    stormChance(state){const latitude=Math.abs(state.sea.lat||0),season=Math.abs(7-(state.month||1)),base=.025+Math.max(0,latitude-35)/900+season/800,ship=state.fleet[0];return base*(1-(this.navigationReduction(ship,"stormReduction")))}
    navigationReduction(ship,key){const part=HL.DATA.shipEquipment?.figureheads?.[ship.equipment?.figurehead||"none"];return Math.min(.4,part?.[key]||0)}
    applyStormHour(state,weather,events){
      if(state.sea.anchor||this.ensure(state).mode==="Shore")return;
      for(const ship of state.fleet){const damage=Math.max(1,Math.round(weather.severity*(1+this.random(state)*2)));ship.hull=Math.max(0,ship.hull-damage);ship.sailCondition=Math.max(0,ship.sailCondition-Math.ceil(damage*.6));if(this.random(state)<.045*weather.severity)ship.crew=Math.max(0,ship.crew-1);if(ship.voyage.rudder>0&&this.random(state)<.055*weather.severity){ship.voyage.rudder=0;this.ensure(state).mode="Adrift";events.push({type:"rudder-loss",ship:ship.name})}}
      state.crew.health=clamp(state.crew.health-1,0,100)
    }
    payWages(state,events){const due=Math.ceil(state.fleet.reduce((sum,ship)=>sum+ship.crew,0)*(state.crew.wageRate||100)/100);if(state.money>=due){state.money-=due;state.crew.morale=clamp(state.crew.morale+2,0,100)}else{state.crew.morale=clamp(state.crew.morale-14,0,100);events.push({type:"unpaid",amount:due})}}
    random(state){const rng=new HL.SeededRandom(state.rngSeed||1526),value=rng.next();state.rngSeed=rng.seed;return value}
  };
  function gridlessWind(state){const month=state.month||1,lat=state.sea.lat||0,band=lat>25?2:lat<-25?6:month>=5&&month<=9?5:1;return(band+Math.floor((state.day||1)/5))%8}

  HL.migrateStateV6=function(prior){
    const fresh=HL.Game.freshState(),port=HL.DATA.ports[prior?.currentPort]?prior.currentPort:"bella",map=HL.WorldData.townMapFor(port),state={...fresh,...deepCopy(prior||{}),version:6,currentPort:port,lastPort:HL.DATA.ports[prior?.lastPort]?prior.lastPort:port};
    for(const key of["sea","quest","fame","flags","inventory","cargo","crew","bank","properties","campaign"])state[key]={...fresh[key],...(prior?.[key]||{})};
    state.fleet=(prior?.fleet?.length?deepCopy(prior.fleet):deepCopy(fresh.fleet));state.seaFleets=deepCopy(prior?.seaFleets||fresh.seaFleets||[]);state.discoveries=deepCopy(prior?.discoveries||[]);state.knownPorts=deepCopy(prior?.knownPorts||fresh.knownPorts);state.mode=prior?.mode==="interior"?"town":prior?.mode||fresh.mode;if(state.mode==="town")state.town={x:map.spawn[0],y:map.spawn[1],dir:prior?.town?.dir||0};
    new HL.SeaSimulation().ensure(state);return state
  };

  const engine=HL.Engine.prototype,oldHit=engine.hit;
  engine.hit=function(...names){if(names.includes("Escape")&&this.pressed.has("0"))return true;return oldHit.call(this,...names)};
  engine.slotKey=function(i){return`horizon-ledger-v6-slot-${i}`};
  engine.v5SlotKey=function(i){return`horizon-ledger-v5-slot-${i}`};
  engine.loadSlot=function(i){try{const value=JSON.parse(localStorage.getItem(this.slotKey(i)));return value&&value.version===6?value:null}catch{return null}};
  engine.migrateOld=function(i){
    if(this.loadSlot(i))return;try{const keys=[this.v5SlotKey(i),this.v4SlotKey(i),this.v3SlotKey(i),this.oldSlotKey(i),`horizon-ledger-${i}`],prior=keys.map(key=>JSON.parse(localStorage.getItem(key)||"null")).find(Boolean);if(prior)this.saveSlot(i,HL.migrateStateV6(prior))}catch(error){console.warn("v6 save migration failed",error)}
  };
  const oldDelete=engine.deleteSlot;engine.deleteSlot=function(i){oldDelete.call(this,i);localStorage.removeItem(this.slotKey(i));localStorage.removeItem(this.v5SlotKey(i))};

  const proto=HL.Game.prototype,oldFresh=HL.Game.freshState,oldEnsure=proto.ensureExpansion,oldSetSail=proto.setSail,oldDock=proto.completeDock,oldDispatch=proto.dispatchAction,oldRenderHud=proto.renderHud,oldWinBattle=proto.winBattle,oldSeaArt=HL.Art.prototype.worldSea,oldWorldMap=HL.Art.prototype.worldMap;
  HL.Game.freshState=function(){const state=oldFresh.call(this);state.version=6;state.seaSim={mode:"Anchored",ticks:0,hourTicks:0,autoSail:null,lastTarget:null,weatherEvent:null,shore:null,lastEvent:""};new HL.SeaSimulation().ensure(state);return state};
  proto.ensureExpansion=function(){oldEnsure.call(this);if(!this.seaSimulation)this.seaSimulation=new HL.SeaSimulation();if(this.s){this.s.version=6;this.seaSimulation.ensure(this.s)}};
  proto.setSail=function(){const result=oldSetSail.call(this);if(this.s&&this.mode==="sea"){this.ensureExpansion();this.s.seaSim.mode="Sailing";this.s.seaSim.shore=null;this.s.sea.anchor=false;this.s.sea.speed=1;this.save()}return result};
  proto.completeDock=function(id){if(this.s?.voyageDays){const xp=Math.min(9800,this.s.voyageDays*this.s.voyageDays*2);this.s.stats.navigation=clamp(this.s.stats.navigation+Math.max(1,Math.floor(xp/700)),0,100);for(const mate of this.s.mates||[])mate.sailing=(mate.sailing||0)+Math.max(1,Math.floor(xp/1400))}const result=oldDock.call(this,id);if(this.s){this.s.seaSim.mode="Anchored";this.s.seaSim.autoSail=null;this.s.seaSim.weatherEvent=null;this.s.sea.weather="맑음";this.save()}return result};
  proto.winBattle=function(result="captured"){const value=oldWinBattle.call(this,result);if(this.s&&this.mode==="sea"){this.s.seaSim.mode="Sailing";this.s.sea.anchor=false;this.save()}return value};
  proto.updateSea=function(dt){
    if(this.e.overlay.innerHTML||this.seaMenu)return;this.ensureExpansion();const sim=this.s.seaSim,input=this.inputDirection();if(input>=0&&sim.mode!=="Adrift"){this.s.sea.heading=input;this.s.sea.anchor=false;sim.mode="Sailing";sim.autoSail=null}
    this.dosSeaAccumulator=Math.min(.5,(this.dosSeaAccumulator||0)+dt);while(this.dosSeaAccumulator>=this.seaSimulation.stepSeconds){this.dosSeaAccumulator-=this.seaSimulation.stepSeconds;for(const event of this.seaSimulation.step(this.s,this.seaGrid))this.handleDosSeaEvent(event);if(this.s.seaSim.hourTicks===0)this.discoverNearby()}
    if(this.s.fleet.some(ship=>ship.hull<=0||ship.crew<=0)||this.s.crew.health<=0)return this.rescueAfterLoss("함대가 항해 불능이 되었습니다");if(this.e.hit("Enter","z","Z"," "))this.openSeaMenu()
  };
  proto.handleDosSeaEvent=function(event){const messages={grounding:"좌초 충격으로 함대가 손상되었습니다","storm-warning":"부관: 검은 구름입니다. 곧 폭풍이 옵니다","storm-start":"폭풍이 함대를 덮쳤습니다","storm-end":"폭풍이 잦아들었습니다","rudder-loss":`${event.ship}의 방향타가 파손되어 표류합니다`,scurvy:"선원 사이에 괴혈병이 퍼졌습니다",rats:"쥐 떼가 식량을 갉아먹기 시작했습니다","crew-loss":`${event.ship}에서 선원 한 명을 잃었습니다`,unpaid:`급료 ${event.amount}금을 지급하지 못했습니다`};if(messages[event.type])this.e.toast(messages[event.type]);if(["storm-start","rudder-loss","scurvy","crew-loss","unpaid"].includes(event.type))this.save()};
  proto.openSeaMenu=function(){this.ensureExpansion();this.seaMenu=true;const port=this.nearbyPort(),sim=this.s.seaSim,emergency=sim.weatherEvent?this.e.button("향유 사용","use-balm"):this.s.crew.rats?this.e.button("쥐약 사용","use-rat-poison"):"";this.e.window(`<div class="dos-command-head"><small>SEA COMMAND</small><h1>해상 명령</h1><p>${sim.mode} · 풍 ${dirName(this.s.sea.wind)} · 해류 ${dirName(this.s.sea.current)} · 항해 ${this.s.voyageDays}일</p></div><div class="menu-grid">${this.e.button(this.s.sea.anchor?"출항":"정박","anchor")}${this.e.button("관측","dos-look")}${this.e.button("전투","battle-command")}${this.e.button(port?`${HL.DATA.ports[port].name} 입항`:"입항","dock",port?"primary":"")}${this.e.button("상륙","dos-shore")}${this.e.button("정보","dos-info")}${this.e.button("명령","dos-order")}${this.e.button("자동항해","dos-auto")}${emergency}${this.e.button("저장","manual-save")}${this.e.button("닫기","sea-close")}</div>`,"center dos-sea-menu")};
  proto.dosLookMenu=function(){this.e.window(`<h1>관측</h1><div class="menu-grid">${this.e.button("망원경 관측","inspect")}${this.e.button("천문 측량","survey")}${this.e.button("함대 협상","negotiate")}${this.e.button("해역 수색","search-sea")}${this.e.button("뒤로","dos-sea-root")}</div>`,"center dos-sea-menu")};
  proto.dosInfoMenu=function(){this.e.window(`<h1>정보</h1><div class="menu-grid">${this.e.button("함대","fleet-info")}${this.e.button("화물","cargo-info")}${this.e.button("인물","dos-mates")}${this.e.button("아이템","dos-items")}${this.e.button("해도","world-map")}${this.e.button("뒤로","dos-sea-root")}</div>`,"center dos-sea-menu")};
  proto.dosOrderMenu=function(){this.e.window(`<h1>함대 명령</h1><div class="menu-grid">${this.e.button("배급","dos-ration")}${this.e.button("선원 배치","dos-crew")}${this.e.button("급료","dos-wages")}${this.e.button("기함 변경","dos-flagship")}${this.e.button("보급 이동","dos-transfer")}${this.e.button("응급 수리","dos-repair")}${this.e.button("뒤로","dos-sea-root")}</div>`,"center dos-sea-menu")};
  proto.dosInspect=function(){const range=(this.s.inventory.telescope?1.7:1)*(1.8+(this.s.fleet[0].voyage.assignment.lookout||0)*.18),fleets=(this.fleetSystem?.visible(this.s)||[]).filter(f=>this.fleetSystem.distance(f,this.s.sea)<=range),ports=this.s.knownPorts.map(id=>HL.DATA.ports[id]).filter(p=>Math.hypot((p.lon-this.s.sea.lon)*Math.cos(this.s.sea.lat*Math.PI/180),p.lat-this.s.sea.lat)<=range);const lines=[...ports.map(p=>`항구 · ${p.name} · ${p.nation}`),...fleets.map(f=>`함대 · ${f.name} · ${f.shipType} · ${f.ai}`)];this.e.dialogue("망루 관측",lines.length?lines.join("\n"):"수평선에서 확인되는 항구나 함대가 없습니다.",[{label:"확인",action:"dos-look"}])};
  proto.dosSurvey=function(){const instrument=this.seaSimulation.instrument(this.s);if(!instrument)return this.e.toast("측량 도구가 필요합니다");if(!this.seaSimulation.hasCelestial(this.s))return this.e.toast("천문항법을 익힌 항해사가 필요합니다");const seed=((this.s.day*31+this.s.hour*7)%17-8)/8,error=instrument.error*seed,lat=this.s.sea.lat+error,lon=this.s.sea.lon-error*.7;this.e.dialogue("천문 측량",`${instrument.key.toUpperCase()}\n${Math.abs(lat).toFixed(2)}°${lat>=0?"N":"S"} · ${Math.abs(lon).toFixed(2)}°${lon>=0?"E":"W"}`,[{label:"확인",action:"dos-look"}])};
  proto.dosNegotiate=function(){const fleets=(this.fleetSystem?.visible(this.s)||[]).sort((a,b)=>this.fleetSystem.distance(a,this.s.sea)-this.fleetSystem.distance(b,this.s.sea)),fleet=fleets[0];if(!fleet||this.fleetSystem.distance(fleet,this.s.sea)>1.6)return this.e.toast("교신 가능한 함대가 없습니다");this.negotiatingFleetId=fleet.id;this.e.dialogue(fleet.name,"깃발 신호에 응답했습니다. 무엇을 제안하시겠습니까?",[{label:"해역 소식 교환",action:"dos-news",primary:true},{label:"금화 100으로 통과 협상",action:"dos-bribe"},{label:"그만둔다",action:"dos-negotiate-close"}])};
  proto.dosShore=function(){const coast=this.seaGrid.coastDistance(this.s.sea.lon,this.s.sea.lat);if(coast>1.25)return this.e.toast("상륙 가능한 해안이 가깝지 않습니다");this.s.sea.anchor=true;this.s.seaSim.mode="Shore";this.s.seaSim.shore={lon:this.s.sea.lon,lat:this.s.sea.lat};this.openShoreMenu();this.save()};
  proto.openShoreMenu=function(){this.seaMenu=true;this.e.window(`<h1>해안 상륙</h1><p>함대가 보트를 내리고 야영지를 세웠습니다.</p><div class="menu-grid">${this.e.button("다시 출항","dos-shore-sail","primary")}${this.e.button("목재로 수리","dos-repair")}${this.e.button("6시간 대기","dos-shore-wait")}${this.e.button("샘 찾기","dos-shore-water")}${this.e.button("보물 탐색","search-sea")}${this.e.button("보급 이동","dos-transfer")}</div>`,"center dos-sea-menu")};
  proto.dosRationMenu=function(){const ship=this.s.fleet[0],v=ship.voyage;this.e.window(`<h1>배급 설정</h1><p>${ship.name} · 식량 ${v.rationFood}% · 물 ${v.rationWater}%</p><div class="menu-grid">${[100,90,75,50].map(n=>this.e.button(`식량 ${n}%`,`dos-ration-food:${n}`)).join("")}${[100,90,75,50].map(n=>this.e.button(`물 ${n}%`,`dos-ration-water:${n}`)).join("")}${this.e.button("뒤로","dos-order")}</div>`,"center dos-sea-menu")};
  proto.dosCrewMenu=function(){const rows=this.s.fleet.map((ship,index)=>{const a=ship.voyage.assignment;return`<div class="row"><span>${ship.name}<small>항해 ${a.navigation} · 망보기 ${a.lookout} · 전투 ${a.combat}</small></span>${this.e.button("항해",`dos-crew-set:${index}:navigation`)}${this.e.button("망보기",`dos-crew-set:${index}:lookout`)}${this.e.button("전투",`dos-crew-set:${index}:combat`)}</div>`}).join("");this.e.window(`<h1>선원 배치</h1><div class="rows">${rows}</div><div class="toolbar right">${this.e.button("뒤로","dos-order")}</div>`,"center wide")};
  proto.dosTransferMenu=function(){if(this.s.fleet.length<2)return this.e.toast("보급을 이동할 다른 선박이 없습니다");const a=this.s.fleet[0],b=this.s.fleet[1];this.e.window(`<h1>보급 이동</h1><p>${a.name} ↔ ${b.name}</p><div class="menu-grid">${this.e.button(`식량 1 → ${b.name}`,"dos-transfer-item:food:0:1")}${this.e.button(`식량 1 → ${a.name}`,"dos-transfer-item:food:1:0")}${this.e.button(`물 1 → ${b.name}`,"dos-transfer-item:water:0:1")}${this.e.button(`물 1 → ${a.name}`,"dos-transfer-item:water:1:0")}${this.e.button(`목재 1 → ${b.name}`,"dos-transfer-item:lumber:0:1")}${this.e.button(`목재 1 → ${a.name}`,"dos-transfer-item:lumber:1:0")}${this.e.button("뒤로","dos-order")}</div>`,"center dos-sea-menu")};
  proto.dosAutoMenu=function(){if(!this.seaSimulation.canAutoSail(this.s))return this.e.toast("천문항법 기술과 측량 도구가 필요합니다");const buttons=this.s.knownPorts.filter(id=>HL.DATA.ports[id]?.tier<=this.s.worldPhase).map(id=>this.e.button(HL.DATA.ports[id].name,`dos-auto-target:${id}`)).join("");this.e.window(`<h1>자동항해</h1><p>알려진 항구를 향해 침로만 자동 조정합니다. 위험은 회피하지 않습니다.</p><div class="route-list">${buttons}${this.e.button("자동항해 해제","dos-auto-stop")}${this.e.button("뒤로","dos-sea-root")}</div>`,"center")};
  proto.dosRepair=function(){let repaired=false;for(const ship of this.s.fleet){if(ship.lumber<=0)continue;if(ship.hull<(HL.DATA.ships[ship.type]?.hull||100)||ship.voyage.rudder<100||ship.sailCondition<100){ship.lumber--;ship.hull=Math.min(HL.DATA.ships[ship.type]?.hull||100,ship.hull+12);ship.sailCondition=Math.min(100,ship.sailCondition+18);ship.voyage.rudder=Math.min(100,ship.voyage.rudder+45);repaired=true}}if(repaired&&this.s.seaSim.mode==="Adrift")this.s.seaSim.mode=this.s.sea.anchor?"Anchored":"Sailing";this.save();this.e.toast(repaired?"목재로 함대를 응급 수리했습니다":"수리할 손상이나 목재가 없습니다")};

  proto.startFleetEncounter=function(fleet){this.activeFleetId=fleet.id;this.s.seaSim.mode="Encounter";this.s.sea.anchor=true;const surprise=this.fleetSystem.distance(fleet,this.s.sea)>this.fleetSystem.detectionRange(this.s)*.8;this.e.dialogue(fleet.name,surprise?"안개 속에서 적선이 기습해 왔습니다.":"함대가 신호 깃발을 올리고 진로를 막았습니다.",[{label:"관측",action:"inspect"},{label:"협상",action:"negotiate"},{label:"공격",action:`fleet-fight:${fleet.id}`,primary:true},{label:"도주",action:`fleet-flee:${fleet.id}`},{label:"항복",action:`fleet-surrender:${fleet.id}`}])};
  proto.startFleetBattle=function(fleet){if(this.s.hour<6||this.s.hour>=18)return this.e.toast("야간에는 전투를 시작할 수 없습니다");this.activeFleetId=fleet.id;this.startBattle(fleet.kind==="story"?"story":"pirate");if(!this.battle)return;this.battle.fleetId=fleet.id;this.battle.storyTag=fleet.storyTag||null;for(const enemy of this.battle.enemies){enemy.hp=Math.round(enemy.hp*fleet.strength);enemy.crew=Math.round(enemy.crew*fleet.strength)}this.syncBattleSelection();this.battle.log=`${fleet.name}이 포문을 열었다.`;this.openBattleMenu()};
  proto.startBattle=function(kind="pirate"){
    if(this.s.hour<6||this.s.hour>=18){this.s.seaSim.mode="Encounter";return this.e.toast("야간에는 전투를 시작할 수 없습니다")}
    this.battleReturn={lon:this.s.sea.lon,lat:this.s.sea.lat};const enemyCount=kind==="port"?3:kind==="story"?3:2,allies=this.s.fleet.slice(0,10).map((ship,index)=>({id:ship.id,name:ship.name,type:ship.type,x:1+(index%3),y:2+Math.floor(index/3)*2,hp:ship.hull,crew:ship.crew,heading:this.s.sea.heading,flagship:index===0,shipIndex:index})),enemies=Array.from({length:enemyCount},(_,index)=>({id:`enemy-${index}`,name:index?`호위선 ${index}`:"적 기함",type:index%2?"galley":"brig",x:10-(index%3),y:2+index*2,hp:kind==="port"?125:88,crew:kind==="port"?30:22,heading:(this.s.sea.heading+4)%8,flagship:index===0}));
    this.mode="battle";this.s.seaSim.mode="Encounter";this.s.sea.anchor=true;this.battle={version:6,kind,allies,enemies,selectedAlly:0,selectedEnemy:0,player:allies[0],enemy:enemies[0],round:1,hour:this.s.hour,wind:this.s.sea.wind,log:kind==="port"?"항만 경비 함대가 수로를 봉쇄했다.":"전투 깃발을 올렸다.",portTarget:kind==="port"?this.pendingPort:null};this.e.close();this.seaMenu=false;this.e.playMusic("danger");this.openBattleMenu()
  };
  proto.syncBattleSelection=function(){const b=this.battle;b.allies=b.allies.filter(s=>s.hp>0&&s.crew>0);b.enemies=b.enemies.filter(s=>s.hp>0&&s.crew>0);b.selectedAlly=clamp(b.selectedAlly,0,Math.max(0,b.allies.length-1));b.selectedEnemy=clamp(b.selectedEnemy,0,Math.max(0,b.enemies.length-1));b.player=b.allies[b.selectedAlly]||b.allies[0];b.enemy=b.enemies[b.selectedEnemy]||b.enemies[0]};
  proto.openBattleMenu=function(){if(this.mode!=="battle")return;this.syncBattleSelection();const b=this.battle,ship=this.s.fleet[b.player.shipIndex]||this.s.fleet[0],dist=Math.max(Math.abs(b.player.x-b.enemy.x),Math.abs(b.player.y-b.enemy.y));this.e.window(`<h2>함대전 · ${b.hour}:00 · 제 ${b.round}턴</h2><p>${b.player.name} → ${b.enemy.name} · 거리 ${dist} · 풍 ${dirName(b.wind)}</p><div class="menu-grid">${this.e.button("이동","battle-move")}${this.e.button("정지","battle-wait")}${this.e.button("정보","battle-view")}${this.e.button(`포격 · ${ship.cannonballs||0}`,"battle-fire")}${this.e.button("백병 돌격","battle-rush")}${this.e.button("도주","battle-flee")}${this.e.button("다음 아군","battle-next-ally")}${this.e.button("다음 적선","battle-next-target")}</div><section class="window battle-log">${b.log}</section>`,"battle-menu")};
  proto.battleAction=function(kind){
    const b=this.battle;if(!b)return;this.syncBattleSelection();const actor=b.player,target=b.enemy,ship=this.s.fleet[actor.shipIndex]||this.s.fleet[0],dist=Math.max(Math.abs(actor.x-target.x),Math.abs(actor.y-target.y)),rng=new HL.SeededRandom(this.s.rngSeed||1526),a=ship.voyage.assignment,spec=HL.DATA.ships[ship.type],windDiff=Math.min((actor.heading-b.wind+8)%8,(b.wind-actor.heading+8)%8),mobility=Math.max(1,Math.floor((spec.handling||5)/3+(windDiff<=2?1:0)-ship.voyage.flooding/30));
    if(kind==="move"){for(let i=0;i<mobility;i++){const nx=actor.x+Math.sign(target.x-actor.x),ny=actor.y+Math.sign(target.y-actor.y);if(this.battleShallow(nx,ny)&&["cog","brig"].includes(actor.type)){b.log="흘수가 깊어 얕은 수역으로 들어갈 수 없다.";break}actor.x=clamp(nx,0,11);actor.y=clamp(ny,0,7)}actor.heading=this.seaGrid.headingBetween([actor.x,actor.y],[target.x,target.y]);b.log=`${actor.name}이 이동력 ${mobility}로 선회했다.`}
    else if(kind==="fire"){const range=ship.cannonType==="culverin"?6:ship.cannonType==="cannon"?4:5;if(!ship.cannonballs)return this.e.toast("포탄이 없습니다");if(dist>range)return this.e.toast("적선이 사거리 밖에 있습니다");ship.cannonballs--;const accuracy=clamp(.35+a.combat/Math.max(1,ship.crew)*.45-dist*.045+(this.s.stats.combat||0)/500,.15,.92),hit=rng.next()<accuracy,damage=hit?Math.max(2,Math.round((ship.guns||1)*(ship.cannonType==="cannon"?2.7:1.8)*( .65+rng.next()*.55))):0;target.hp=Math.max(0,target.hp-damage);b.log=hit?`${target.name}에 포격 명중 · 선체 -${damage}`:"포탄이 파도 위로 빗나갔다.";this.e.sfx("wood_knock")}
    else if(kind==="rush"){if(dist>1)return this.e.toast("백병 돌격은 적선에 인접해야 합니다");const attack=actor.crew*(.55+a.combat/Math.max(1,ship.crew)*.75)*( .8+rng.next()*.4),defense=target.crew*(.7+rng.next()*.35),loss=Math.max(1,Math.round(Math.abs(attack-defense)/8));if(attack>=defense)target.crew=Math.max(0,target.crew-loss);else actor.crew=Math.max(0,actor.crew-loss);b.log=attack>=defense?`갈고리를 걸어 ${target.name} 선원 ${loss}명을 제압했다.`:`돌격이 밀려 아군 ${loss}명을 잃었다.`;if(target.flagship&&target.crew>0&&target.crew<=4){this.s.rngSeed=rng.seed;return this.startDuel()}}
    else if(kind==="flee"){if(rng.next()+mobility/8>.78){this.s.rngSeed=rng.seed;this.mode="sea";this.s.seaSim.mode="Sailing";this.s.sea.anchor=false;this.e.close();this.e.playMusic("sea");return this.e.toast("전장을 이탈했습니다")}b.log="퇴로가 막혔다."}
    else if(kind==="view")return this.e.dialogue("함대 정보",[...b.allies,...b.enemies].map(s=>`${s.flagship?"★":"·"} ${s.name} · 선체 ${s.hp} · 선원 ${s.crew}`).join("\n"),[{label:"확인",action:"battle-wait"}]);
    else b.log=`${actor.name}이 위치를 유지한다.`;
    this.s.rngSeed=rng.seed;this.syncBattleSelection();if(!b.enemies.some(s=>s.flagship))return this.winBattle(kind==="fire"?"sunk":"captured");if(!b.allies.some(s=>s.flagship))return this.loseBattle();this.enemyTurn()
  };
  proto.battleShallow=function(x,y){return((x*7+y*11+(this.s?.rngSeed||0))%13)<2};
  proto.enemyTurn=function(){const b=this.battle,rng=new HL.SeededRandom(this.s.rngSeed||1526);for(const enemy of b.enemies){const target=b.allies[0];if(!target)break;const dist=Math.max(Math.abs(enemy.x-target.x),Math.abs(enemy.y-target.y));if(dist<=1){const loss=Math.max(1,Math.round((enemy.crew*(.5+rng.next()*.4)-target.crew*.35)/12));target.crew=Math.max(0,target.crew-loss);b.log+=`\n${enemy.name} 백병 돌격 · 아군 -${loss}`}else if(dist<=5){const damage=Math.max(1,Math.round((3+rng.next()*7)));target.hp=Math.max(0,target.hp-damage);b.log+=`\n${enemy.name} 포격 · 선체 -${damage}`}else{enemy.x-=Math.sign(enemy.x-target.x);enemy.y-=Math.sign(enemy.y-target.y)}}this.s.rngSeed=rng.seed;b.round++;if(b.round%2===0)b.hour++;this.syncBattleSelection();if(!b.allies.some(s=>s.flagship))return this.loseBattle();if(b.hour>=18){for(const ally of b.allies){const ship=this.s.fleet[ally.shipIndex];if(ship){ship.hull=ally.hp;ship.crew=ally.crew}}this.mode="sea";this.s.seaSim.mode="Sailing";this.s.sea.anchor=false;this.e.close();this.e.playMusic("sea");return this.e.toast("일몰로 양 함대가 전투를 중단했습니다")}this.openBattleMenu()};

  proto.dispatchAction=function(action,button){
    if(!this.s)return oldDispatch.call(this,action,button);this.ensureExpansion();
    if(action==="dos-sea-root")return this.openSeaMenu();if(action==="dos-look")return this.dosLookMenu();if(action==="dos-info")return this.dosInfoMenu();if(action==="dos-order")return this.dosOrderMenu();if(action==="dos-shore")return this.dosShore();if(action==="dos-ration")return this.dosRationMenu();if(action==="dos-crew")return this.dosCrewMenu();if(action==="dos-transfer")return this.dosTransferMenu();if(action==="dos-auto")return this.dosAutoMenu();
    if(action==="inspect")return this.dosInspect();if(action==="survey")return this.dosSurvey();if(action==="negotiate")return this.dosNegotiate();
    if(action==="anchor"){this.s.sea.anchor=!this.s.sea.anchor;this.s.seaSim.mode=this.s.sea.anchor?"Anchored":"Sailing";this.s.seaSim.autoSail=null;this.seaMenu=false;this.e.close();return}
    if(action.startsWith("dos-ration-food:")||action.startsWith("dos-ration-water:")){const food=action.includes("food"),value=+action.split(":")[1];for(const ship of this.s.fleet)ship.voyage[food?"rationFood":"rationWater"]=value;this.save();return this.dosRationMenu()}
    if(action.startsWith("dos-crew-set:")){const[,index,type]=action.split(":"),ship=this.s.fleet[+index],ratios={navigation:[.7,.1,.2],lookout:[.35,.45,.2],combat:[.25,.1,.65]}[type],nav=Math.max(1,Math.floor(ship.crew*ratios[0])),look=Math.floor(ship.crew*ratios[1]);ship.voyage.assignment={navigation:nav,lookout:look,combat:Math.max(0,ship.crew-nav-look)};if(+index===0)this.s.crew.assignment={...ship.voyage.assignment};this.save();return this.dosCrewMenu()}
    if(action.startsWith("dos-transfer-item:")){const[,item,from,to]=action.split(":"),source=this.s.fleet[+from],target=this.s.fleet[+to];if((source[item]||0)<1)return this.e.toast("이동할 보급이 없습니다");source[item]-=1;target[item]=(target[item]||0)+1;this.save();return this.dosTransferMenu()}
    if(action==="dos-wages"){this.s.crew.wageRate=this.s.crew.wageRate>=120?80:this.s.crew.wageRate+20;this.e.toast(`선원 급료를 기준의 ${this.s.crew.wageRate}%로 정했습니다`);this.save();return this.dosOrderMenu()}
    if(action==="dos-flagship"){if(this.s.fleet.length<2)return this.e.toast("변경할 다른 선박이 없습니다");this.s.fleet.push(this.s.fleet.shift());this.seaSimulation.ensure(this.s);this.save();return this.dosOrderMenu()}
    if(action==="dos-repair"){this.dosRepair();return this.s.seaSim.mode==="Shore"?this.openShoreMenu():this.dosOrderMenu()}
    if(action==="dos-shore-sail"){this.s.sea.anchor=false;this.s.seaSim.mode="Sailing";this.s.seaSim.shore=null;this.seaMenu=false;this.e.close();return}
    if(action==="dos-shore-wait"){for(let i=0;i<6;i++)for(const event of this.seaSimulation.advanceHour(this.s))this.handleDosSeaEvent(event);this.save();return this.openShoreMenu()}
    if(action==="dos-shore-water"){const amount=2+Math.floor(this.seaSimulation.random(this.s)*5),ship=this.s.fleet[0];ship.water+=amount;this.e.toast(`샘을 찾아 물 ${amount}을 보충했습니다`);this.save();return this.openShoreMenu()}
    if(action.startsWith("dos-auto-target:")){const id=action.split(":")[1];this.s.seaSim.autoSail=id;this.s.seaSim.lastTarget=id;this.s.seaSim.mode="Sailing";this.s.sea.anchor=false;this.seaMenu=false;this.e.close();return this.e.toast(`${HL.DATA.ports[id].name} 자동항해를 시작합니다`)}
    if(action==="dos-auto-stop"){this.s.seaSim.autoSail=null;return this.openSeaMenu()}
    if(action==="dos-news"||action==="dos-negotiate-close"){this.s.seaSim.mode="Sailing";this.s.sea.anchor=false;this.e.close();return this.e.toast(action==="dos-news"?"인근 폭풍과 항구 시세 소식을 교환했습니다":"교신을 끝냈습니다")}
    if(action==="dos-bribe"){if(this.s.money<100)return this.e.toast("협상금이 부족합니다");this.s.money-=100;const fleet=this.s.seaFleets.find(f=>f.id===this.negotiatingFleetId);if(fleet){fleet.ai="return";fleet.cooldown=20}this.s.seaSim.mode="Sailing";this.s.sea.anchor=false;this.e.close();this.save();return this.e.toast("함대가 통과를 허락했습니다")}
    if(action==="dos-mates")return this.e.dialogue("항해사",(this.s.mates||[]).map((m,i)=>`${i===this.s.crew.roles.firstMate?"★":"·"} ${m.name} · 항해 ${m.sailing||0} · 전투 ${m.battle||0}`).join("\n")||"동행 항해사가 없습니다.",[{label:"확인",action:"dos-info"}]);
    if(action==="dos-items")return this.e.dialogue("항해 도구",Object.entries(this.s.inventory).filter(([,v])=>v).map(([k])=>k).concat([`향유 ${this.s.cargo.balm||0}`,`쥐약 ${this.s.cargo.rat_poison||0}`,`라임 주스 ${this.s.cargo.lime_juice||0}`]).join("\n"),[{label:"확인",action:"dos-info"}]);
    if(action==="use-balm"){if(!(this.s.cargo.balm>0))return this.e.toast("향유가 없습니다");this.s.cargo.balm--;this.s.seaSim.weatherEvent=null;this.s.sea.weather="맑음";this.s.seaSim.mode=this.s.sea.anchor?"Anchored":"Sailing";this.save();return this.openSeaMenu()}
    if(action==="use-rat-poison"){if(!(this.s.cargo.rat_poison>0))return this.e.toast("쥐약이 없습니다");this.s.cargo.rat_poison--;this.s.crew.rats=false;this.save();return this.openSeaMenu()}
    if(action==="battle-view")return this.battleAction("view");if(action==="battle-next-ally"){this.battle.selectedAlly=(this.battle.selectedAlly+1)%this.battle.allies.length;return this.openBattleMenu()}if(action==="battle-next-target"){this.battle.selectedEnemy=(this.battle.selectedEnemy+1)%this.battle.enemies.length;return this.openBattleMenu()}
    if(action==="battle-command"&&(this.s.hour<6||this.s.hour>=18))return this.e.toast("야간에는 전투를 시작할 수 없습니다");
    if(action.startsWith("fleet-flee:")){const fleet=this.s.seaFleets.find(f=>f.id===action.split(":")[1]),rng=new HL.SeededRandom(this.s.rngSeed||1526),escaped=rng.next()+(this.s.stats.navigation||0)/100>.82;this.s.rngSeed=rng.seed;this.e.close();if(escaped){if(fleet){fleet.ai="return";fleet.cooldown=12}this.s.seaSim.mode="Sailing";this.s.sea.anchor=false;return this.e.toast("추격을 따돌렸습니다")}if(fleet)return this.startFleetBattle(fleet);return}
    if(action.startsWith("fleet-surrender:")){const fleet=this.s.seaFleets.find(f=>f.id===action.split(":")[1]);if(fleet){fleet.ai="return";fleet.cooldown=18}this.s.seaSim.mode="Sailing";this.s.sea.anchor=false;return this.pirateSurrender()}
    return oldDispatch.call(this,action,button)
  };

  proto.renderHud=function(){if(this.s&&this.mode==="sea"){this.ensureExpansion();const ship=this.s.fleet[0],sim=this.s.seaSim,totalFood=this.s.fleet.reduce((n,v)=>n+(v.food||0),0),totalWater=this.s.fleet.reduce((n,v)=>n+(v.water||0),0);this.e.hud.innerHTML=`<div class="hud-group dos-hud"><span class="hud-gold">${this.s.year}.${this.s.month}.${this.s.day} ${String(this.s.hour).padStart(2,"0")}:00</span><span>항해 ${this.s.voyageDays}일</span><span>침로 ${dirName(this.s.sea.heading)}</span><span>풍 ${dirName(this.s.sea.wind)}</span><span>해류 ${dirName(this.s.sea.current)}</span><span>${this.seaSimulation.fleetSpeed(this.s).toFixed(1)}kn</span><span>선체 ${ship.hull}</span><span>선원 ${this.s.fleet.reduce((n,v)=>n+v.crew,0)}</span><span>식량 ${Math.floor(totalFood)}</span><span>물 ${Math.floor(totalWater)}</span><span>${sim.mode}</span></div>`;return}return oldRenderHud.call(this)};
  HL.Art.prototype.worldSea=function(game){const target=game.s.sea.autoTarget,forecast=game.seaGrid.forecast;game.s.sea.autoTarget=null;game.seaGrid.forecast=()=>({danger:false,distance:0});oldSeaArt.call(this,game);game.seaGrid.forecast=forecast;game.s.sea.autoTarget=target;const e=game.e,c=e.ctx,s=game.s,sim=s.seaSim,food=s.fleet.reduce((n,v)=>n+(v.food||0),0),water=s.fleet.reduce((n,v)=>n+(v.water||0),0);c.fillStyle="rgba(2,13,20,.96)";c.fillRect(0,468,960,72);e.text(`${s.year}.${s.month}.${s.day} ${String(s.hour).padStart(2,"0")}:00  |  ${sim.mode}  |  풍 ${dirName(s.sea.wind)}  |  해류 ${dirName(s.sea.current)}  |  항해 ${s.voyageDays}일`,18,495,"#e8d9a2","left",14);e.text(`함대 ${s.fleet.length}척  |  선원 ${s.fleet.reduce((n,v)=>n+v.crew,0)}  |  식량 ${Math.floor(food)}  |  물 ${Math.floor(water)}  |  선체 ${s.fleet[0].hull}  |  ${sim.autoSail?`자동항해 ${HL.DATA.ports[sim.autoSail]?.name}`:"수동 항해"}`,18,523,"#f0bd55","left",13)};
  HL.Art.prototype.worldMap=function(game){const saved=game.s.sea.autoTarget,task=game.campaignSystem?.currentTask,route=game.routeGuide;game.s.sea.autoTarget=null;if(game.campaignSystem)game.campaignSystem.currentTask=()=>null;game.routeGuide={info:()=>null};oldWorldMap.call(this,game);game.s.sea.autoTarget=saved;if(game.campaignSystem&&task)game.campaignSystem.currentTask=task;game.routeGuide=route};
  HL.Art.prototype.battle=function(game){const e=game.e,c=e.ctx,b=game.battle;e.clear("#123f52");for(let x=0;x<12;x++)for(let y=0;y<8;y++){c.fillStyle=game.battleShallow(x,y)?"#2c8a91":(x+y)&1?"#175a70":"#1b6679";c.fillRect(160+x*52,78+y*52,52,52);c.strokeStyle="rgba(148,205,202,.22)";c.strokeRect(160+x*52+.5,78+y*52+.5,51,51)}for(const ship of b.allies||[]){this.ship(e,186+ship.x*52,104+ship.y*52,ship.heading,ship.type,.72);if(ship.flagship)e.text("★",186+ship.x*52,76+ship.y*52,"#f2dfad","center",13)}for(const ship of b.enemies||[]){this.ship(e,186+ship.x*52,104+ship.y*52,ship.heading,ship.type,.72);if(ship.flagship)e.text("★",186+ship.x*52,76+ship.y*52,"#ff9a6b","center",13)}e.text(`풍 ${dirName(b.wind)} · ${b.hour}:00 · 남은 주간 ${Math.max(0,18-b.hour)}시간`,20,42,"#f2dfad","left",15)};
})();
