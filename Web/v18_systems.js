window.HL=window.HL||{};
(function(){
  "use strict";
  const copy=v=>JSON.parse(JSON.stringify(v));
  const campaignFor=s=>HL.DATA.campaignsV16[s?.campaignId];
  const careerFor=s=>HL.DATA.careerProgressionV18[s?.captainId];
  const captain=id=>HL.DATA.captainsV16.find(c=>c.id===id)||HL.DATA.captainsV16[0];
  const chapterIndex=s=>{const data=campaignFor(s);return Math.max(0,data?.chapters.findIndex(ch=>ch.id===s.campaign?.chapterId)??0)};
  HL.migrateStateV18=function(prior){
    const s=copy(prior||HL.Game.freshState());s.version=18;s.graphicsVersion=15;s.v18={migratedAt:Date.now(),interiorStyle:"original-16bit",progression:"career-fame",...(s.v18||{})};
    s.fame={trade:0,battle:0,adventure:0,...(s.fame||{})};s.careerProgress=s.careerProgress||{waiting:null,notified:[],rivalMeetings:[]};
    if(s.mode==="interior"&&s.interior){const f=s.interior.buildingId||s.interior.id,b=HL.DATA.buildingScenes[s.currentPort]?.[f],floor=b?.floors[s.interior.floorId]||b?.floors[b?.entryFloor];if(floor){Object.assign(s.interior,{buildingId:f,floorId:floor.floorId,x:floor.spawn[0],y:floor.spawn[1]})}else{s.mode="town";s.interior=null}}
    return s
  };
  const engine=HL.Engine.prototype;engine.v17SlotKey=i=>`horizon-ledger-v17-slot-${i}`;engine.slotKey=i=>`horizon-ledger-v18-slot-${i}`;
  engine.loadSlot=function(i){try{const s=JSON.parse(localStorage.getItem(this.slotKey(i)));return s?.version===18?s:null}catch{return null}};
  engine.migrateOld=function(i){if(this.loadSlot(i))return;try{const keys=[this.v17SlotKey(i),`horizon-ledger-v16-slot-${i}`,`horizon-ledger-v15-slot-${i}`],old=keys.map(k=>JSON.parse(localStorage.getItem(k)||"null")).find(Boolean);if(old)this.saveSlot(i,HL.migrateStateV18(old))}catch(error){console.warn("V18 저장 변환 실패",error)}};
  engine.deleteSlot=function(i){localStorage.removeItem(this.slotKey(i))};

  const game=HL.Game.prototype,oldFresh=HL.Game.freshState,oldEnsure=game.ensureExpansion,oldNew=game.newGame,oldResume=game.resume,oldProgress=game.progressCampaign,oldJournal=game.openV16Journal,oldExecute=game.executeV10InteriorAction,oldTradeCommit=game.commitV13Trade;
  HL.Game.freshState=function(){const s=oldFresh.call(this);s.version=18;s.v18={interiorStyle:"original-16bit",progression:"career-fame"};s.careerProgress={waiting:null,notified:[],rivalMeetings:[]};return s};
  game.ensureExpansion=function(){oldEnsure.call(this);if(this.s){this.s.version=18;this.s.v18={interiorStyle:"original-16bit",progression:"career-fame",...(this.s.v18||{})};this.s.careerProgress=this.s.careerProgress||{waiting:null,notified:[],rivalMeetings:[]}}};
  game.newGame=function(id=this.e.selectedCaptain||"kemal"){oldNew.call(this,id);this.s=HL.migrateStateV18(this.s);this.save()};
  game.resume=function(i){const s=this.e.loadSlot(i);if(!s)return this.showFiles();this.s=HL.migrateStateV18(s);this.s.slot=i;this.mode=this.s.mode||"town";if(this.mode==="v16-prologue"&&!this.s.prologueV16)this.mode="town";this.ensureExpansion();this.spawnTownNpcs();this.e.close();this.ensureSafePosition();this.e.playMusic(this.mode==="sea"?"sea":"port")};

  const cs=HL.CampaignSystem.prototype,oldCurrent=cs.currentTask,oldSync=cs.syncQuest,oldChecklist=cs.checklist;
  cs.currentTask=function(state){if(campaignFor(state)&&state.careerProgress?.waiting)return null;return oldCurrent.call(this,state)};
  cs.syncQuest=function(state){if(!campaignFor(state))return oldSync.call(this,state);const wait=state.careerProgress?.waiting,rule=careerFor(state);if(wait&&rule){const have=state.fame[rule.career]||0,home=HL.DATA.ports[rule.home]?.name||rule.home;state.quest=state.quest||{};state.quest.title=`새로운 소문 · ${rule.label}`;state.quest.objective=have<wait.required?`${rule.label} ${wait.required.toLocaleString()}을 쌓으십시오. 현재 ${have.toLocaleString()}.`:`${home}의 ${this.facilityName(rule.facility)}로 돌아가 새 소식을 확인하십시오.`;return}return oldSync.call(this,state)};
  cs.checklist=function(state){if(!campaignFor(state)||!state.careerProgress?.waiting)return oldChecklist.call(this,state);const rule=careerFor(state),wait=state.careerProgress.waiting,have=state.fame[rule.career]||0;return{chapter:this.chapter(state),task:null,recommendation:{days:0,food:0,water:0,danger:"자유 항해",medicine:0},checks:[{done:have>=wait.required,text:`${rule.label} ${wait.required.toLocaleString()} · 현재 ${have.toLocaleString()}`},{done:state.currentPort===rule.home,text:`소식 확인 · ${HL.DATA.ports[rule.home]?.name} ${this.facilityName(rule.facility)}`}],waiting:wait}};
  cs.evaluateV18=function(state,event){
    this.ensure(state);const data=campaignFor(state),ch=this.chapter(state),task=oldCurrent.call(this,state);if(!task||!this.matches(state,event,task))return false;
    const rule=careerFor(state);state.campaign.completed.push(task.id);state.campaign.log.unshift(`${state.year}.${state.month}.${state.day} · ${task.title}`);state.campaign.log=state.campaign.log.slice(0,60);state.fame[rule.career]=(state.fame[rule.career]||0)+(task.rewardFame||180);state.campaign.taskIndex++;
    const ended=state.campaign.taskIndex>=ch.tasks.length,index=data.chapters.indexOf(ch),next=data.chapters[index+1];
    if(ended&&next){state.careerProgress.waiting={fromChapter:ch.id,nextChapter:next.id,required:rule.gates[index+1],startedDay:state.day};state.campaign.taskIndex=ch.tasks.length}
    else if(ended){state.flags.campaignComplete=true;state.campaign.taskIndex=ch.tasks.length}
    this.syncQuest(state);return{completed:true,task,chapter:ch,chapterEnded:ended,campaignComplete:!next&&ended}
  };
  game.unlockCareerChapterV18=function(event){
    const wait=this.s.careerProgress?.waiting,rule=careerFor(this.s),data=campaignFor(this.s);if(!wait||!rule)return false;
    if(event.type!=="facility"||event.id!==rule.facility||event.port!==rule.home)return false;
    const have=this.s.fame[rule.career]||0;if(have<wait.required){this.e.dialogue("항구의 소문",`아직 ${rule.label}이 부족합니다. ${wait.required.toLocaleString()}이 필요하며 현재는 ${have.toLocaleString()}입니다. 자유 항해에서 ${rule.career==="trade"?"이익을 내고 항구에 투자":rule.career==="battle"?"적대 함대를 물리치고 나포":"항구와 발견물을 찾아 보고"}하십시오.`,[{label:"알겠다",action:"close"}]);return true}
    const next=data.chapters.find(ch=>ch.id===wait.nextChapter);this.s.campaign.chapterId=next.id;this.s.campaign.taskIndex=0;this.s.careerProgress.waiting=null;this.campaignSystem.syncQuest(this.s);this.save();this.e.toast(`${next.title}이 시작되었습니다`);this.startV16Scene(next.cutscenes[0]);return true
  };
  game.progressCampaign=function(event){
    if(!campaignFor(this.s)||this.s.captainId==="rian")return oldProgress.call(this,event);
    if(this.unlockCareerChapterV18(event))return true;
    const result=this.campaignSystem.evaluateV18(this.s,event);if(!result)return false;
    const data=campaignFor(this.s),choice=data.choices?.find(c=>c.afterTask===result.task.id);if(choice)this.pendingV16Choice=choice;
    this.save();this.e.toast(`목표 완료 · ${result.task.title}`);const scene=result.chapter.cutscenes[result.chapterEnded?2:1];this.v16SceneQueue=[];this.startV16Scene(scene);return true
  };
  game.openV16Journal=function(){
    if(!campaignFor(this.s)||this.s.captainId==="rian")return oldJournal.call(this);
    const info=this.campaignSystem.checklist(this.s),data=campaignFor(this.s),idx=chapterIndex(this.s),c=captain(this.s.captainId),rule=careerFor(this.s),have=this.s.fame[rule.career]||0,next=info.waiting?.required||rule.gates[Math.min(5,idx)],pct=Math.min(100,Math.round(have/Math.max(1,next)*100)),task=info.task,rec=info.recommendation;
    const objective=info.waiting?`<section class="v18-fame-card"><strong>자유 항해 기간</strong><p>${this.s.quest.objective}</p><div class="v18-fame-meter"><b style="width:${pct}%"></b></div></section>`:`<section class="objective-card"><small>지금 할 일</small><h2>${task?.title||"자유 항해"}</h2><p>${task?.description||"항해를 계속하십시오."}</p></section>`;
    this.e.window(`<header class="journal-head"><div><small>${c.name}의 항해 일지 · ${rule.label} ${have.toLocaleString()}</small><h1>${info.chapter.title}</h1></div><strong>${idx+1} / 6</strong></header>${objective}<div class="journal-grid"><section><h3>다음 사건</h3><p>${task?`${HL.DATA.ports[task.port]?.name||task.port} · ${this.campaignSystem.facilityName(task.facility)}`:`${HL.DATA.ports[rule.home]?.name} · ${this.campaignSystem.facilityName(rule.facility)}`}</p><p>${info.checks.map(x=>`${x.done?"완료":"미완료"} · ${x.text}`).join("<br>")}</p></section><section><h3>항해 준비</h3><p>${task?`예상 ${rec.days}일 · 식량 ${rec.food} · 물 ${rec.water}`:"교역·탐험·전투를 자유롭게 선택"}</p><p>다음 사건은 조건을 만족한 뒤 시설을 방문하면 시작됩니다.</p></section><section><h3>이야기의 흐름</h3><p>사건 사이에는 자유롭게 항해하며 직업 명성을 쌓습니다.</p><p>다른 선장은 여관과 항구에서 다시 만날 수 있습니다.</p></section></div><div class="toolbar right">${this.e.button("세계지도 · M","world-map")}${this.e.button("저장","manual-save")}${this.e.button("닫기","close","primary")}</div>`,`center wide journal v16-journal`)
  };
  game.commitV13Trade=function(){const before=this.s?.fame?.trade||0,quantity=this.s?.tradeState?.quantity||1,result=oldTradeCommit.call(this);if(this.s&&this.s.captainId==="marieke"){this.s.fame.trade=Math.max(this.s.fame.trade||0,before)+Math.min(80,Math.max(4,quantity*4));this.campaignSystem.syncQuest(this.s);this.save()}return result};
  game.executeV10InteriorAction=function(action){if(!action.startsWith("v18-inspect:"))return oldExecute.call(this,action);const id=action.slice(12),text={scale:"추의 홈마다 오래 거래한 항구의 약호가 새겨져 있다.",produce:"제철 식품과 장기 항해용 절임이 칸마다 나뉘어 있다.",cloth:"산지와 염색법이 다른 천이 바닷바람에 상하지 않도록 말려 있다.",sacks:"향과 무게가 다른 포대가 선적 순서대로 묶여 있다.",crates:"목적항과 적재일이 찍힌 상자다.",ledger:"매입가와 매도가 사이에 회계사의 작은 메모가 보인다.",hearth:"항해를 마친 이들이 젖은 장화를 말리고 있다.",table:"칼자국, 잔 자국, 급히 그린 항로가 겹쳐 있다.",notice:"구인, 실종, 호송 의뢰가 날짜순으로 붙어 있다.",treatment:"깨끗한 천과 식초, 약초가 손이 닿는 순서로 놓여 있다.",medicine:"항해일수와 증상에 따라 약병이 나뉘어 있다.",bed:"교대 근무를 마친 선원의 외투가 걸려 있다.",maptable:"여러 선장이 덧그린 해안선과 바람 기록이다.",telescope:"렌즈 가장자리에 소금기가 하얗게 남아 있다.",chart:"지워진 침로 아래 이전 항해의 실패가 희미하게 보인다.",books:"항구별 관세와 계절풍 기록이 같은 서가에 꽂혀 있다.",hull:"용골과 늑재가 완성되어 배의 균형이 드러난다.",workbench:"대패, 송곳, 먹줄이 조선공의 손 순서대로 놓여 있다.",mast:"옹이를 피해 다듬은 긴 목재다.",sails:"재단선과 바느질 간격이 돛의 용도를 보여 준다.",crane:"도르래의 하중 표시가 새로 칠해져 있다.",plans:"선체 단면과 적재선이 세밀하게 그려져 있다.",documents:"출항 허가, 검역, 선원 명부가 한 묶음으로 정리돼 있다.",bollard:"수많은 밧줄이 문질러 간 홈이 패여 있다.",desk:"밀랍 봉인과 아직 마르지 않은 잉크가 보인다.",portrait:"화가는 인물보다 그 뒤의 배를 더 자세히 그렸다.",safe:"서로 다른 열쇠 세 개가 있어야 열리는 금고다.",contracts:"작은 글씨로 적힌 책임 조항이 유난히 길다.",model:"창고와 수로까지 표시한 항구 모형이다."}[id]||"오래 쓰인 물건에서 이곳 사람들의 생활이 느껴진다.";return this.e.dialogue("조사",text,[{label:"돌아선다",action:"close"}])};
})();
