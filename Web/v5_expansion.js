window.HL=window.HL||{};
(function(){
  const proto=HL.Game.prototype,oldFresh=HL.Game.freshState,oldEnsure=proto.ensureExpansion,oldUpdate=proto.update,oldDispatch=proto.dispatchAction,oldCompleteDock=proto.completeDock,oldSearchSea=proto.searchSea,oldWinBattle=proto.winBattle,oldDiscover=proto.discoverNearby,oldQuestTarget=proto.questTarget,oldAdvanceHour=proto.advanceHour;
  HL.Game.freshState=function(){const state=oldFresh.call(this);state.version=5;state.campaign={chapterId:"inherited-route",taskIndex:0,completed:[],log:[],startedDay:state.day};state.seaFleets=[];state.crew.assignment={navigation:8,lookout:4,combat:6};state.sea.zoom=1.12;return state};

  proto.ensureExpansion=function(){
    oldEnsure.call(this);if(!this.campaignSystem)this.campaignSystem=new HL.CampaignSystem();if(!this.fleetSystem)this.fleetSystem=new HL.FleetSystem(this.navigation,this.campaignSystem);if(this.s){this.s.version=5;this.s.crew=this.s.crew||{health:100,fatigue:0,morale:80,disease:null};const crew=Math.max(3,this.s.fleet?.[0]?.crew||18);if(!this.s.crew.assignment){const navigation=Math.max(1,Math.floor(crew*.45)),lookout=Math.max(1,Math.floor(crew*.2));this.s.crew.assignment={navigation,lookout,combat:Math.max(1,crew-navigation-lookout)}}this.s.sea=this.s.sea||{};this.s.sea.zoom=this.s.sea.zoom||1.12;this.s.seaFleets=this.s.seaFleets||[];this.campaignSystem.ensure(this.s);this.fleetSystem.ensure(this.s)}
  };
  proto.campaignBeatText=function(id){return{
    "claim-ship":"오르소가 새벽까마귀의 열쇠와 선원 명부를 건넸다. 푸른 장부의 첫 숫자는 안트베르펜의 유리 시세를 가리키고 있었다.",
    "hear-royal-rumor":"왕실 항해자 아에론이 세우타 근해에서 사라졌다는 소문이 퍼졌다. 마지막으로 목격된 배에는 왕립 해운회사의 회색 봉인이 찍혀 있었다.",
    "reach-ceuta":"항만 관리인은 아에론의 배가 서쪽으로 끌려갔다고 증언했다. 출항하면 회색 봉인 사략선이 수평선에 나타날 것이다.",
    "rescue-aeron":"아에론은 푸른 봉인장을 리안에게 맡겼다. 장부의 항로가 왕실 독점 계약보다 오래된 기록임을 증명하는 문서였다.",
    "report-rescue":"데미안은 봉인장을 읽고 다음 단서인 황동 관측구가 홍해로 옮겨졌음을 알아냈다.",
    "receive-staff-order":"데미안은 알렉산드리아 기록고에서 조류의 지팡이라 불린 황동 관측구를 추적하라고 명했다.",
    "alexandria-archive":"기록에는 관측구가 마사와 앞바다에서 침몰한 순례선에 실려 있었다고 적혀 있었다.",
    "massawa-search":"해저에서 황동 관측구와 온전한 조류표가 발견됐다. 동시에 붉은 돛 함대가 항구 쪽으로 선회했다.",
    "massawa-defense":"마사와를 지켜낸 뒤 오르소는 관측구가 동쪽의 날짜와 서쪽의 바람을 한 장부에 겹쳐 기록한다는 사실을 알아냈다.",
    "scholar-request":"학자 에네오는 같은 기록을 일본의 천문 관측과 대조하겠다며 동행을 요청했다.",
    "nagasaki-arrival":"나가사키의 기록은 서쪽 항해자가 같은 날 두 번의 일몰을 보았다는 오래된 증언과 일치했다.",
    "sakai-record":"사카이 천문관은 두 번째 일몰이 섬이 아니라 날짜선과 계절풍이 만나는 항로 암호임을 확인했다.",
    "western-letter":"에네오의 편지는 왕립 해운회사가 남미 대하에 비밀 해상 거점을 세웠다고 경고했다.",
    "cartagena-contact":"미라 소렐이 카르타헤나에 숨어 있다는 흔적을 찾았다. 술집의 사략선들이 먼저 그녀를 붙잡고 있었다.",
    "tavern-rescue":"미라는 대하 입구의 검은 표식과 자오선 요새의 보급 시간을 알려 주었다. 바르도의 함대가 항구 밖에서 기다리고 있다.",
    "rival-captain":"패배한 바르도는 해운회사가 자신의 선원까지 버렸음을 깨닫고 요새의 수로 암호를 넘겼다.",
    "amazon-mouth":"수로 아래에서 데미안의 잃어버린 장부 원본과 요새로 이어지는 부표 사슬을 찾았다.",
    "citadel-battle":"자오선 요새의 봉쇄선이 무너졌다. 미라의 증언과 장부 원본은 두 번째 일몰 항로가 조작이 아니었음을 증명한다.",
    "return-lisbon":"데미안은 리안의 항해를 왕실 기록으로 남겼다. 숨겨졌던 항로는 모든 항해자에게 공개되고 리안은 자신의 이름으로 새 장부를 시작했다."
  }[id]||"항해 일지에 새로운 기록이 추가되었다."};
  proto.progressCampaign=function(event){
    this.ensureExpansion();const before=this.campaignSystem.currentTask(this.s);if(!before||!this.campaignSystem.evaluate(this.s,event))return false;this.fleetSystem.ensureStoryFleet(this.s,this.campaignSystem.currentTask(this.s));this.save();const ending=this.s.flags.campaignComplete,title=ending?"수평선의 장부 완성":before.title,text=this.campaignBeatText(before.id);this.e.dialogue(title,text,[{label:ending?"자유 항해를 시작한다":"항해 일지에 기록한다",action:"close",primary:true}]);return true
  };

  proto.update=function(dt){
    this.ensureExpansion();if(this.s&&this.e.hit("j","J")&&!this.e.overlay.innerHTML){if(this.mode==="worldmap")this.closeWorldMap();this.openJournal();return}const result=oldUpdate.call(this,dt);if(this.s&&this.mode==="sea")this.fleetSystem.update(this,dt);return result
  };
  proto.renderHud=function(){
    if(!this.s||["file","scenario","cutscene","worldmap","tavernEvent"].includes(this.mode)){this.e.hud.innerHTML="";return}this.ensureExpansion();const ship=this.s.fleet[0],p=HL.DATA.ports[this.s.currentPort],sea=this.s.sea,where=this.mode==="sea"?`${Math.abs(sea.lat).toFixed(1)}°${sea.lat>=0?"N":"S"} ${Math.abs(sea.lon).toFixed(1)}°${sea.lon>=0?"E":"W"}`:p.name,task=this.campaignSystem.currentTask(this.s),assignment=this.s.crew.assignment;this.e.hud.innerHTML=`<div class="hud-group"><span class="hud-gold">${this.s.year}.${this.s.month}.${this.s.day} ${String(this.s.hour).padStart(2,"0")}:00</span><span>${where}</span><span>침로 ${HL.DATA.directionNames[sea.heading]}</span><span>${this.navigation.speed(this.s).toFixed(1)}kn</span><span>선체 ${ship.hull}%</span><span>선원 ${ship.crew} · 항해 ${assignment.navigation}/전망 ${assignment.lookout}/전투 ${assignment.combat}</span><span>식량 ${Math.floor(ship.food)} · 물 ${Math.floor(ship.water)}</span></div><div class="hud-objective">${this.campaignSystem.chapter(this.s).title} · ${task?.title||"자유 항해"} · ${task?.description||"세계의 항로를 완성하라."}</div>`
  };
  proto.openJournal=function(){
    this.ensureExpansion();const info=this.campaignSystem.checklist(this.s),task=info.task,rec=info.recommendation,chapterIndex=HL.DATA.campaign.chapters.findIndex(c=>c.id===info.chapter.id),history=this.s.campaign.log.slice(0,5);this.e.window(`<div class="journal-head"><div><small>리안 팔코의 항해 일지</small><h1>${info.chapter.title}</h1></div><strong>${chapterIndex+1} / ${HL.DATA.campaign.chapters.length}</strong></div><section class="objective-card"><small>현재 해야 할 일</small><h2>${task?.title||"캠페인 완료"}</h2><p>${task?.description||"전 세계를 자유롭게 항해하고 발견 기록을 완성하십시오."}</p></section><div class="journal-grid"><section><h3>완료 조건</h3>${info.checks.length?info.checks.map(c=>`<p class="check ${c.done?"done":""}">${c.done?"✓":"□"} ${c.text}</p>`).join(""):"<p>목적지에 도착해 표시된 인물이나 장소를 조사하십시오.</p>"}</section><section><h3>항해 준비</h3><p>거리 약 ${rec.distance}° · 예상 ${rec.days}일 · 위험도 ${rec.danger}</p><p>권장 식량 ${rec.food} · 물 ${rec.water} · 의약품 ${rec.medicine}</p></section><section><h3>최근 기록</h3>${history.length?history.map(x=>`<p>${x}</p>`).join(""):"<p>아직 완료한 기록이 없습니다.</p>"}</section></div><div class="toolbar right">${this.e.button("세계지도 · M","world-map")}${this.e.button("선원 배치","crew-menu")}${this.e.button("저장","manual-save")}${this.e.button("닫기","close","primary")}</div>`,"center wide journal")
  };
  proto.openPause=function(){return this.openJournal()};
  proto.crewMenu=function(){const a=this.s.crew.assignment,crew=this.s.fleet[0].crew;this.e.window(`<h1>선원 배치</h1><p>총원 ${crew} · 항해 ${a.navigation} · 전망 ${a.lookout} · 전투 ${a.combat}</p><div class="menu-grid">${this.e.button("균형 배치","crew-preset:balanced","primary")}${this.e.button("항해 우선","crew-preset:navigation")}${this.e.button("전망 우선","crew-preset:lookout")}${this.e.button("전투 우선","crew-preset:combat")}${this.e.button("항해 일지","journal")}</div>`,"center")};
  proto.applyCrewPreset=function(id){const crew=this.s.fleet[0].crew,ratio={balanced:[.45,.2,.35],navigation:[.65,.15,.2],lookout:[.38,.42,.2],combat:[.3,.15,.55]}[id]||[.45,.2,.35],navigation=Math.max(1,Math.floor(crew*ratio[0])),lookout=Math.max(1,Math.floor(crew*ratio[1]));this.s.crew.assignment={navigation,lookout,combat:Math.max(1,crew-navigation-lookout)};this.save();this.crewMenu()};
  proto.questTarget=function(){this.ensureExpansion();const task=this.campaignSystem.currentTask(this.s);if(task?.port===this.s.currentPort&&task.facility)return task.facility;return oldQuestTarget.call(this)};

  proto.completeDock=function(id){const result=oldCompleteDock.call(this,id);this.progressCampaign({type:"dock",port:id});return result};
  for(const [facility,method]of Object.entries({inn:"innMenu",guild:"guildMenu",mansion:"mansionStory"})){
    const old=proto[method];proto[method]=function(){if(this.progressCampaign({type:"facility",id:facility,port:this.s.currentPort}))return;return old.call(this)}
  }
  proto.searchSea=function(){
    this.ensureExpansion();const task=this.campaignSystem.currentTask(this.s);if(task?.trigger?.type==="search"){if(task.requiredItem&&!this.s.inventory[task.requiredItem])return this.e.toast(`${task.requiredItem==="sextant"?"육분의":"휴대 해도"}가 필요합니다`);if(this.progressCampaign({type:"search",lon:this.s.sea.lon,lat:this.s.sea.lat})){this.s.discoveries.push({id:`story-${task.id}`,name:task.title,lon:this.s.sea.lon,lat:this.s.sea.lat,value:1200});return}}
    const before=this.s.discoveries.length,result=oldSearchSea.call(this);if(this.s.discoveries.length>before)this.s.fame.adventure+=315;return result
  };
  proto.discoverNearby=function(){const before=new Set(this.s.knownPorts);oldDiscover.call(this);const added=this.s.knownPorts.filter(id=>!before.has(id));if(added.length){this.s.fame.adventure+=added.length*185;this.save()}};
  proto.advanceHour=function(){const result=oldAdvanceHour.call(this);this.s.worldPhase=this.s.fame.adventure>=30000?3:this.s.flags.chapterComplete?2:1;return result};

  proto.startFleetEncounter=function(fleet){this.activeFleetId=fleet.id;const threat=fleet.strength>=1.8?"최상":fleet.strength>=1.25?"높음":"보통";this.e.dialogue(fleet.name,`해적 함대가 진로를 가로막았다. 위협도 ${threat}. 포격으로 침몰시키거나 백병전으로 나포할 수 있다.`,[{label:"교전",action:`fleet-fight:${fleet.id}`,primary:true},{label:"도주 시도",action:`fleet-flee:${fleet.id}`},{label:"화물과 휴대금 포기",action:`fleet-surrender:${fleet.id}`}])};
  proto.startFleetBattle=function(fleet){this.activeFleetId=fleet.id;this.startBattle(fleet.kind==="story"?"story":"pirate");this.battle.fleetId=fleet.id;this.battle.storyTag=fleet.storyTag||null;this.battle.enemy.hp=Math.round(this.battle.enemy.hp*fleet.strength);this.battle.enemy.crew=Math.round(this.battle.enemy.crew*fleet.strength);this.battle.log=`${fleet.name}이 포문을 열었다.`};
  proto.winBattle=function(result="captured"){const fleetId=this.battle?.fleetId,tag=this.battle?.storyTag,returnValue=oldWinBattle.call(this,result);if(fleetId)this.fleetSystem.defeat(this.s,fleetId);if(tag)this.progressCampaign({type:"battle",tag});this.save();return returnValue};

  proto.dispatchAction=function(a,b){
    const frontAction=!this.s||a==="files"||a==="settings"||a==="locked"||/^(new|continue|delete|captain):/.test(a);if(frontAction)return oldDispatch.call(this,a,b);
    this.ensureExpansion();if(a==="journal")return this.openJournal();if(a==="crew-menu")return this.crewMenu();if(a.startsWith("crew-preset:"))return this.applyCrewPreset(a.split(":")[1]);
    if(a.startsWith("fleet-fight:")){const fleet=this.s.seaFleets.find(f=>f.id===a.split(":")[1]);this.e.close();if(fleet)return this.startFleetBattle(fleet)}
    if(a.startsWith("fleet-flee:")){const fleet=this.s.seaFleets.find(f=>f.id===a.split(":")[1]),rng=new HL.SeededRandom(this.s.rngSeed);this.s.rngSeed=rng.seed;if(rng.next()+this.s.stats.navigation/100>.82){fleet.ai="return";fleet.cooldown=12;this.e.close();return this.e.toast("해적의 추격을 따돌렸습니다")}this.e.close();return this.startFleetBattle(fleet)}
    if(a.startsWith("fleet-surrender:")){const fleet=this.s.seaFleets.find(f=>f.id===a.split(":")[1]);if(fleet){fleet.ai="return";fleet.cooldown=18}return this.pirateSurrender()}
    if(a==="battle-command"){const fleets=this.fleetSystem.visible(this.s).sort((x,y)=>this.fleetSystem.distance(x,this.s.sea)-this.fleetSystem.distance(y,this.s.sea)),fleet=fleets[0];if(!fleet||this.fleetSystem.distance(fleet,this.s.sea)>1.6)return this.e.toast("교전 가능한 함대가 가까이 없습니다");this.e.close();return this.startFleetBattle(fleet)}
    const result=oldDispatch.call(this,a,b);if(a==="accept-ship"||a==="story-accept")this.progressCampaign({type:"action",id:"accept-ship"});if(a==="chapter-complete"){this.campaignSystem.setChapter(this.s,"missing-navigator");this.save()}return result
  };
})();
