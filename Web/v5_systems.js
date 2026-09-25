window.HL=window.HL||{};
(function(){
  const LegacyNavigation=HL.WorldNavigation;
  HL.WorldNavigation=class extends LegacyNavigation{
    constructor(){super();this.land=[
      [[-10,36],[-9,43],[-5,48],[-10,51],[-6,59],[5,71],[30,71],[40,60],[30,48],[26,41],[20,39],[13,44],[4,43],[-1,37]],
      [[-17,36],[-5,35],[10,37],[25,33],[34,31],[44,12],[51,10],[50,-26],[40,-35],[18,-35],[8,-6],[-17,15]],
      [[26,41],[40,60],[90,75],[180,72],[180,49],[145,45],[142,35],[130,30],[122,23],[110,20],[104,10],[98,8],[90,20],[80,25],[70,30],[55,28],[45,40]],
      [[34,31],[55,28],[58,20],[50,12],[43,12]],[[67,25],[89,25],[82,8],[76,8]],[[90,23],[110,20],[106,1],[98,7]],
      [[95,6],[106,6],[105,-7],[99,-7]],[[106,5],[119,6],[116,-9],[108,-8]],[[118,4],[130,6],[128,-8],[119,-7]],
      [[112,-10],[154,-11],[154,-30],[142,-39],[116,-39]],[[43,-12],[51,-12],[50,-26],[43,-26]],
      [[-168,72],[-55,72],[-52,50],[-66,45],[-82,25],[-97,8],[-112,20],[-130,48]],
      [[-74,60],[-20,60],[-24,83],[-55,84]],
      [[-82,13],[-71,12],[-60,8],[-50,1],[-35,-6],[-38,-15],[-48,-28],[-53,-34],[-68,-56],[-75,-50],[-80,-5]],
      [[128,32],[142,46],[146,40],[145,30],[134,24]],[[120,25],[127,19],[124,6],[116,6]],
      [[-10,50],[2,51],[1,59],[-6,58]],[[-8,51],[-5,55],[-10,56]],[[166,-34],[179,-34],[178,-47],[166,-47]]
    ]}
  };

  HL.CampaignSystem=class{
    constructor(data=HL.DATA.campaign){this.data=data}
    ensure(state){
      if(!state.campaign)state.campaign={chapterId:"inherited-route",taskIndex:0,completed:[],log:[],startedDay:state.day||1};
      state.campaign.completed=state.campaign.completed||[];state.campaign.log=state.campaign.log||[];
      if(state.flags?.chapterComplete&&["inherited-route","blue-ledger"].includes(state.campaign.chapterId)){state.campaign.chapterId="missing-navigator";state.campaign.taskIndex=0}
      this.syncQuest(state);return state.campaign
    }
    chapter(state){this.ensure(state);return this.data.chapters.find(c=>c.id===state.campaign.chapterId)||this.data.chapters[0]}
    legacyTask(state){
      const stage=state.quest?.stage||0,flags=state.flags||{};
      if(stage===0)return{id:"legacy-ship",title:"새벽까마귀 인수",description:"리스본 조선소에서 배와 오르소를 인수한다.",port:"bella",facility:"shipyard"};
      if(stage===1)return{id:"legacy-supply",title:"첫 항해 준비",description:"리스본 시장에서 유리를 사고 선원·식량·물을 준비한 뒤 안트베르펜으로 출항한다.",port:"lume",facility:"market"};
      if(stage===2)return{id:"legacy-trade",title:"첫 교역 완수",description:"안트베르펜 시장에서 유리를 팔고 포도주와 목재를 구입한다.",port:"lume",facility:"market"};
      if(stage===3)return{id:"legacy-rumor",title:"푸른 장부의 소문",description:flags.heardRumor?"안트베르펜 길드에서 제노바 장부 조사 의뢰를 받는다.":"안트베르펜 술집에서 두 번째 일몰의 소문을 듣는다.",port:"lume",facility:flags.heardRumor?"guild":"inn"};
      if(stage===4)return{id:"legacy-genoa",title:"제노바의 기록",description:"제노바 길드에서 푸른 잉크 장부를 조사한다.",port:"genoa",facility:"guild"};
      if(stage===5)return{id:"legacy-battle",title:"추적 함대 돌파",description:"제노바를 떠나 추적 함대를 격파하고 증거를 지킨다.",port:"bella",recommendedThreat:"위험"};
      return{id:"legacy-report",title:"리스본 귀환",description:"리스본 저택에서 데미안에게 푸른 장부의 증거를 전달한다.",port:"bella",facility:"mansion"}
    }
    currentTask(state){const chapter=this.chapter(state);if(chapter.legacyQuest)return this.legacyTask(state);return chapter.tasks[state.campaign.taskIndex]||null}
    distance(state,task=this.currentTask(state)){
      if(!task)return 0;let lon,lat;if(task.marker){[lon,lat]=task.marker}else if(task.port&&HL.DATA.ports[task.port])({lon,lat}=HL.DATA.ports[task.port]);else return 0;
      const sea=state.mode==="sea"?state.sea:HL.DATA.ports[state.currentPort]||state.sea,dx=(lon-(sea.lon??sea.x))*Math.cos((lat+(sea.lat??sea.y))*Math.PI/360);return Math.hypot(dx,lat-(sea.lat??sea.y))
    }
    recommendation(state,task=this.currentTask(state)){
      const distance=this.distance(state,task),crew=Math.max(1,state.fleet?.[0]?.crew||18),days=Math.max(4,Math.ceil(distance/2.8)),danger=task?.recommendedThreat||(distance>45?"위험":distance>18?"보통":"낮음");
      return{distance:Math.round(distance),days,food:Math.max(12,Math.ceil(days*crew/18*1.35)),water:Math.max(12,Math.ceil(days*crew/18*1.5)),medicine:days>18?2:1,danger}
    }
    matches(state,event,task){
      const trigger=task?.trigger;if(!trigger||trigger.type!==event.type)return false;
      if(task.minFame&&state.fame.adventure<task.minFame)return false;
      if(trigger.id&&trigger.id!==event.id)return false;if(trigger.port&&trigger.port!==event.port)return false;if(trigger.tag&&trigger.tag!==event.tag)return false;
      if(trigger.near){const lon=event.lon??state.sea.lon,lat=event.lat??state.sea.lat;if(Math.hypot((lon-trigger.near[0])*Math.cos(lat*Math.PI/180),lat-trigger.near[1])>(trigger.radius||1))return false}
      return true
    }
    evaluate(state,event){
      this.ensure(state);const chapter=this.chapter(state),task=this.currentTask(state);if(chapter.legacyQuest)return false;if(!this.matches(state,event,task))return false;
      state.campaign.completed.push(task.id);state.campaign.log.unshift(`${state.year}.${state.month}.${state.day} · ${task.title}`);state.campaign.log=state.campaign.log.slice(0,30);state.fame.adventure+=(task.rewardFame||0);state.campaign.taskIndex++;
      if(state.campaign.taskIndex>=chapter.tasks.length){const index=this.data.chapters.indexOf(chapter),next=this.data.chapters[Math.min(index+1,this.data.chapters.length-1)];state.campaign.chapterId=next.id;state.campaign.taskIndex=0;if(next.complete){state.flags.campaignComplete=true;state.worldPhase=3}}
      this.syncQuest(state);return true
    }
    setChapter(state,id){state.campaign.chapterId=id;state.campaign.taskIndex=0;this.syncQuest(state)}
    syncQuest(state){
      if(!state.campaign)return;const chapter=this.data.chapters.find(c=>c.id===state.campaign.chapterId),task=chapter?.legacyQuest?this.legacyTask(state):chapter?.tasks[state.campaign.taskIndex];
      if(!chapter)return;state.quest=state.quest||{};state.quest.title=chapter.title;state.quest.objective=task?.description||(chapter.complete?"리안의 항로가 완성되었다. 전 세계를 자유롭게 항해하라.":"항해 일지에서 다음 목표를 확인하라.")
    }
    checklist(state){const chapter=this.chapter(state),task=this.currentTask(state),r=this.recommendation(state,task),checks=[];if(task?.minFame)checks.push({done:state.fame.adventure>=task.minFame,text:`탐험 명성 ${task.minFame.toLocaleString()} 이상 · 현재 ${state.fame.adventure.toLocaleString()}`});if(task?.requiredItem)checks.push({done:!!state.inventory[task.requiredItem],text:`필요 장비 · ${task.requiredItem==="sextant"?"육분의":"휴대 해도"}`});if(task?.port)checks.push({done:state.currentPort===task.port&&state.mode!=="sea",text:`목적지 · ${HL.DATA.ports[task.port]?.name||task.port}${task.facility?` ${this.facilityName(task.facility)}`:""}`});return{chapter,task,recommendation:r,checks}}
    facilityName(id){return{market:"시장",inn:"술집",shipyard:"조선소",guild:"길드",lodge:"숙소",harbor:"항구",mansion:"저택"}[id]||id}
  };

  HL.FleetSystem=class{
    constructor(navigation,campaign){this.navigation=navigation;this.campaign=campaign;this.elapsed=0}
    seaPosition(lon,lat){for(const radius of[0,.8,1.6,2.8,4.2,6,9,13,18,25])for(let i=0;i<16;i++){const angle=i*Math.PI/8,x=lon+Math.cos(angle)*radius/Math.max(.35,Math.cos(lat*Math.PI/180)),y=lat+Math.sin(angle)*radius;if(!this.navigation.isLand(x,y)&&this.navigation.reefRisk(x,y)<.72)return[x,y]}return[lon,lat]}
    ensure(state){
      if(!state.crew.assignment)state.crew.assignment={navigation:Math.max(1,Math.floor(state.fleet[0].crew*.45)),lookout:Math.max(1,Math.floor(state.fleet[0].crew*.2)),combat:Math.max(1,Math.floor(state.fleet[0].crew*.35))};
      if(!Array.isArray(state.seaFleets)||!state.seaFleets.length)state.seaFleets=this.seedFleets(state.rngSeed||1526);return state.seaFleets
    }
    seedFleets(seed){
      const zones=[[-12,36,2],[-4,30,2],[4,37,2],[18,34,3],[39,13,4],[58,22,3],[75,12,3],[102,3,4],[127,2,4],[-82,20,5],[-74,11,4],[-49,1,6]],rng=new HL.SeededRandom(seed),fleets=[];let n=0;
      for(const[lon,lat,count]of zones)for(let i=0;i<count;i++){const candidate=[lon+(rng.next()-.5)*7,lat+(rng.next()-.5)*5],[x,y]=this.seaPosition(candidate[0],candidate[1]);fleets.push({id:`pirate-${n++}`,name:["검은 파도단","붉은 닻단","회색 상어단","폭풍 칼날단"][n%4],kind:"pirate",lon:x,lat:y,home:[x,y],heading:Math.floor(rng.next()*8),speed:.55+rng.next()*.5,strength:.7+rng.next()*.9,shipType:n%3===0?"galley":"brig",ai:"patrol",alert:0,cooldown:0,active:true})}return fleets
    }
    ensureStoryFleet(state,task){const tag=task?.spawnFleet;if(!tag||state.campaign.completed.includes(task.id))return;this.ensure(state);if(state.seaFleets.some(f=>f.storyTag===tag&&f.active))return;const d=HL.DATA.storyFleets[tag];if(!d)return;const[lon,lat]=this.seaPosition(d.lon,d.lat);state.seaFleets.push({id:`story-${tag}`,name:d.name,kind:"story",storyTag:tag,lon,lat,home:[lon,lat],heading:4,speed:.72,strength:d.strength,shipType:d.shipType,ai:"patrol",alert:0,cooldown:0,active:true})}
    distance(a,b){return Math.hypot((a.lon-b.lon)*Math.cos((a.lat+b.lat)*Math.PI/360),a.lat-b.lat)}
    detectionRange(state){const lookout=state.crew.assignment?.lookout||2,weather=state.sea.weather==="안개"?.48:state.sea.weather==="폭풍"?.68:1,glass=state.inventory.telescope?1.7:1;return(1.8+lookout*.18)*weather*glass}
    visible(state){const range=this.detectionRange(state);return this.ensure(state).filter(f=>f.active&&this.distance(f,state.sea)<=range*1.7)}
    update(game,dt){
      const state=game.s;if(!state||game.mode!=="sea")return;this.ensure(state);this.ensureStoryFleet(state,this.campaign.currentTask(state));this.elapsed+=dt;if(this.elapsed<.08)return;dt=this.elapsed;this.elapsed=0;const speedScale=state.sea.speed||1,detect=this.detectionRange(state);
      for(const fleet of state.seaFleets){if(!fleet.active)continue;if(this.navigation.isLand(fleet.lon,fleet.lat)){const safe=this.seaPosition(fleet.home[0],fleet.home[1]);fleet.lon=safe[0];fleet.lat=safe[1];fleet.home=[...safe]}fleet.cooldown=Math.max(0,(fleet.cooldown||0)-dt);const dist=this.distance(fleet,state.sea);if(dist<detect&&(fleet.kind==="story"||state.fame.battle<2500||fleet.strength>1.2)){fleet.ai="chase";fleet.alert=1}else if(fleet.ai==="chase"&&dist>detect*1.8){fleet.ai="return";fleet.alert=0}
        let target=fleet.home;if(fleet.ai==="chase")target=[state.sea.lon,state.sea.lat];if(fleet.ai==="patrol"){const angle=(Number(fleet.id.replace(/\D/g,""))*.91+state.day*.08)%6.28;target=[fleet.home[0]+Math.cos(angle)*2.2,fleet.home[1]+Math.sin(angle)*1.4]}
        let angle=Math.atan2(target[1]-fleet.lat,(target[0]-fleet.lon)*Math.cos(fleet.lat*Math.PI/180)),heading=Math.round((angle/(Math.PI/4)+2+8))%8;const dirs=HL.DATA.directions;let moved=false;for(let turn=0;turn<8;turn++){const h=(heading+(turn%2?Math.ceil(turn/2):-Math.ceil(turn/2))+8)%8,d=dirs[h],v=.065*fleet.speed*speedScale*dt,nx=fleet.lon+d[0]*v/Math.max(.3,Math.cos(fleet.lat*Math.PI/180)),ny=fleet.lat-d[1]*v;if(!this.navigation.isLand(nx,ny)&&this.navigation.reefRisk(nx,ny)<.75){fleet.lon=nx;fleet.lat=ny;fleet.heading=h;moved=true;break}}if(!moved)fleet.heading=(fleet.heading+2)%8;if(fleet.ai==="return"&&this.distance(fleet,{lon:fleet.home[0],lat:fleet.home[1]})<.4)fleet.ai="patrol";
        if(dist<.24&&fleet.cooldown<=0&&!game.e.overlay.innerHTML){fleet.cooldown=8;game.startFleetEncounter(fleet);break}
      }
    }
    defeat(state,id){const fleet=state.seaFleets?.find(f=>f.id===id);if(fleet){fleet.active=false;fleet.ai="defeated"}}
  };

  HL.SeaChunkCache=class{
    constructor(data=HL.DATA.worldChunks){this.data=data;this.images=new Map()}
    get(row,column){if(row<0||row>=this.data.rows)return null;column=(column+this.data.columns)%this.data.columns;const key=`${row}:${column}`;if(this.images.has(key))return this.images.get(key);if(typeof Image==="undefined")return null;const image=new Image();image.src=this.data.path(row,column);this.images.set(key,image);return image}
    preload(lon,lat){const x=(lon+180)/360*this.data.width,y=(90-lat)/180*this.data.height,col=Math.floor(x/this.data.tileSize),row=Math.floor(y/this.data.tileSize);for(let ry=row-1;ry<=row+1;ry++)for(let cx=col-1;cx<=col+1;cx++)this.get(ry,cx)}
  };

  if(HL.EncounterSystem){const daily=HL.EncounterSystem.prototype.daily;HL.EncounterSystem.prototype.daily=function(state){return daily.call(this,state).filter(event=>event!=="pirate")}}
  if(HL.WorldNavigation){const speed=HL.WorldNavigation.prototype.speed;HL.WorldNavigation.prototype.speed=function(state){const base=speed.call(this,state),assigned=state.crew?.assignment?.navigation??state.fleet[0].crew,minimum=HL.DATA.ships[state.fleet[0].type].crewMin;return base*Math.max(.45,Math.min(1.12,assigned/minimum))}}
})();
