window.HL=window.HL||{};
(function(){
  "use strict";
  const copy=value=>JSON.parse(JSON.stringify(value));
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const fragment=(id,name,slot,rotation,region,clue,method,required=true)=>({id,name,slot,rotation,region,clue,method,required});

  HL.DATA.version=7;
  HL.DATA.seaSpeedScale=1.1;
  HL.DATA.chartFragments=[
    fragment("glass-cipher","유리 상인의 암호",0,1,"북해","푸른 유리 가격표의 여백은 서쪽에서 동쪽으로 읽어야 한다.","안트베르펜 교역 장부",true),
    fragment("blue-seal","푸른 봉인장",1,2,"지브롤터","왕실 인장 아래 지워진 숫자가 세우타 서쪽 수로를 가리킨다.","아에론 구조",true),
    fragment("navigator-oath","항해자의 증언",2,0,"리스본","데미안은 실패한 것이 아니라 누군가에게서 항로를 감추었다.","왕실 항해자 귀환",true),
    fragment("alexandria-star","알렉산드리아 성반",3,3,"동지중해","황동 선은 홍해의 조류가 북쪽으로 멎는 날을 기록한다.","알렉산드리아 기록고",true),
    fragment("tide-staff","조류의 지팡이",4,1,"홍해","별 셋이 수평선에 걸릴 때 마사와의 물길이 열린다.","마사와 연안 수색",true),
    fragment("monsoon-veil","계절풍의 베일",5,2,"인도양","폭풍의 바깥 고리에는 언제나 남동쪽으로 흐르는 잔잔한 틈이 있다.","인도양 폭풍 생존",false),
    fragment("sunset-record","첫 일몰 기록",6,0,"일본","같은 날짜의 두 그림자가 서로 반대 방향으로 길어졌다.","나가사키 도착",true),
    fragment("star-calendar","별자리 달력",7,3,"동아시아","두 번째 일몰은 섬이 아니라 날짜와 바람을 겹쳐 읽는 암호다.","사카이 천문 기록",true),
    fragment("mira-cipher","미라의 수로 암호",8,1,"카리브해","독점 함대는 달이 없는 밤마다 남쪽 보급선을 비운다.","카르타헤나 구출",true),
    fragment("rival-half","바르도의 반쪽 해도",9,2,"서인도 제도","붉은 닻 표식은 적의 요새가 아니라 버려진 구조 항로였다.","바르도 함대 나포",false),
    fragment("amazon-rubbing","대하의 부표 탁본",10,0,"남미 대하","세 번째 부표에서 동쪽이 아니라 조류가 사라지는 쪽으로 선회한다.","대하 입구 수색",false),
    fragment("damian-confession","데미안의 마지막 장",11,3,"자오선 해역","항로는 왕의 것도 상인의 것도 아니다. 살아서 돌아갈 모든 이의 것이다.","숨겨진 장부 원본",false)
  ];
  HL.DATA.fragmentByTask={
    "legacy-clue":"glass-cipher","rescue-aeron":"blue-seal","report-rescue":"navigator-oath",
    "alexandria-archive":"alexandria-star","massawa-search":"tide-staff","nagasaki-arrival":"sunset-record",
    "sakai-record":"star-calendar","tavern-rescue":"mira-cipher","rival-captain":"rival-half",
    "amazon-mouth":"amazon-rubbing","citadel-battle":"damian-confession"
  };
  HL.DATA.campaign={id:"rian-twilight-chart",title:"수평선의 장부",chapters:[
    {id:"inherited-route",title:"제0장 · 상속된 항로",tasks:[{id:"claim-ship",title:"새벽까마귀 인수",description:"리스본 조선소에서 오르소 벤을 만나 데미안이 남긴 배를 인수한다.",trigger:{type:"action",id:"accept-ship"},port:"bella",facility:"shipyard",rewardFame:100}]},
    {id:"blue-ledger",title:"제1장 · 푸른 장부",legacyQuest:true,tasks:[]},
    {id:"missing-navigator",title:"제2장 · 사라진 항해자",tasks:[
      {id:"hear-royal-rumor",title:"불타지 않은 소문",description:"탐험 명성 2,000을 쌓은 뒤 술집에서 회색 봉인 함대의 소문을 듣는다.",trigger:{type:"facility",id:"inn"},minFame:2000,facility:"inn",rewardFame:300},
      {id:"reach-ceuta",title:"세우타의 빈 계류장",description:"세우타에 입항해 아에론의 배가 끌려간 방향을 확인한다.",trigger:{type:"dock",port:"ceuta"},port:"ceuta",facility:"harbor"},
      {id:"rescue-aeron",title:"검은 돛 추격",description:"세우타 서쪽에서 아에론을 억류한 회색 봉인 사략선을 나포한다.",trigger:{type:"battle",tag:"royal-rescue"},marker:[-7.8,35.7],spawnFleet:"royal-rescue",recommendedThreat:"위험",rewardFame:1500},
      {id:"aeron-choice",title:"봉인장의 주인",description:"구조한 아에론의 봉인장을 누구에게 먼저 보여 줄지 결정한다.",trigger:{type:"choice",id:"aeron"}},
      {id:"report-rescue",title:"감춰진 실패",description:"리스본 저택에서 아에론의 증언과 푸른 봉인장을 데미안에게 전달한다.",trigger:{type:"facility",id:"mansion",port:"bella"},port:"bella",facility:"mansion",rewardFame:700}
    ]},
    {id:"tide-staff",title:"제3장 · 조류의 지팡이",tasks:[
      {id:"receive-staff-order",title:"황동 관측구",description:"탐험 명성 10,000을 달성하고 리스본 저택에서 홍해 임무를 받는다.",trigger:{type:"facility",id:"mansion",port:"bella"},port:"bella",facility:"mansion",minFame:10000},
      {id:"alexandria-archive",title:"지워진 별자리",description:"알렉산드리아 길드에서 황동 관측구가 사라진 기록을 복원한다.",trigger:{type:"facility",id:"guild",port:"alexandria"},port:"alexandria",facility:"guild",rewardFame:600},
      {id:"massawa-search",title:"붉은 해협 수색",description:"마사와 연안에서 육분의로 조류의 지팡이를 수색한다.",trigger:{type:"search",near:[39.2,15.4],radius:1.4},port:"massawa",marker:[39.2,15.4],requiredItem:"sextant",rewardFame:1800},
      {id:"massawa-defense",title:"마사와의 붉은 돛",description:"항구와 피난선을 노리는 붉은 돛 함대를 격파한다.",trigger:{type:"battle",tag:"massawa-defense"},marker:[39.8,15.2],spawnFleet:"massawa-defense",recommendedThreat:"매우 위험",rewardFame:2200},
      {id:"orso-choice",title:"오르소의 침묵",description:"데미안의 옛 항해사였다는 사실을 숨긴 오르소와 대화한다.",trigger:{type:"choice",id:"orso"}}
    ]},
    {id:"second-sunset",title:"제4장 · 두 번째 일몰",tasks:[
      {id:"scholar-request",title:"동쪽으로 간 학자",description:"탐험 명성 30,000을 달성한 뒤 술집에서 학자 에네오의 호송 의뢰를 받는다.",trigger:{type:"facility",id:"inn"},minFame:30000,facility:"inn"},
      {id:"zanzibar-crossing",title:"계절풍의 문",description:"잔지바르에 입항해 동쪽 항해를 위한 계절풍 기록을 구한다.",trigger:{type:"dock",port:"zanzibar"},port:"zanzibar",rewardFame:900},
      {id:"nagasaki-arrival",title:"나가사키의 첫 일몰",description:"에네오와 함께 나가사키에 입항해 그림자 기록을 대조한다.",trigger:{type:"dock",port:"nagasaki"},port:"nagasaki",recommendedThreat:"위험",rewardFame:1600},
      {id:"sakai-record",title:"사카이 천문 기록",description:"사카이 길드에서 두 번째 일몰의 진짜 의미를 확인한다.",trigger:{type:"facility",id:"guild",port:"sakai"},port:"sakai",facility:"guild",rewardFame:2400}
    ]},
    {id:"western-river",title:"제5장 · 서쪽에서 온 편지",tasks:[
      {id:"western-letter",title:"밀랍이 녹은 편지",description:"탐험 명성 40,000을 달성하고 리스본 길드에서 미라의 편지를 받는다.",trigger:{type:"facility",id:"guild",port:"bella"},port:"bella",facility:"guild",minFame:40000},
      {id:"cartagena-contact",title:"카르타헤나의 도망자",description:"카르타헤나에 입항해 해운회사 기록관 미라의 흔적을 찾는다.",trigger:{type:"dock",port:"cartagena"},port:"cartagena",rewardFame:800},
      {id:"tavern-rescue",title:"닫힌 술집",description:"카르타헤나 술집에서 미라를 억류한 사략선 선원들과 맞선다.",trigger:{type:"facility",id:"inn",port:"cartagena"},port:"cartagena",facility:"inn"},
      {id:"rival-captain",title:"경쟁자의 반쪽 해도",description:"항구 밖에서 바르도 함대를 제압하고 자오선 요새의 수로 암호를 얻는다.",trigger:{type:"battle",tag:"cartagena-rival"},marker:[-75.9,10.7],spawnFleet:"cartagena-rival",recommendedThreat:"매우 위험",rewardFame:3000},
      {id:"bardo-choice",title:"패자의 깃발",description:"바르도를 포로로 보낼지, 동맹으로 받아들일지 결정한다.",trigger:{type:"choice",id:"bardo"}}
    ]},
    {id:"meridian-citadel",title:"제6장 · 자오선 요새",tasks:[
      {id:"amazon-mouth",title:"대하의 검은 표식",description:"해도편 8개를 모아 남미 대하 입구의 부표 수로를 수색한다.",trigger:{type:"search",near:[-49.5,.2],radius:2},marker:[-49.5,.2],requiredItem:"chart",minFragments:8,rewardFame:2200},
      {id:"citadel-battle",title:"자오선 요새 결전",description:"비밀 수로를 통과해 해운회사의 봉쇄 함대를 격파한다.",trigger:{type:"battle",tag:"meridian-final"},marker:[-50.2,.5],spawnFleet:"meridian-final",minFragments:8,recommendedThreat:"최종 결전",rewardFame:5000},
      {id:"return-lisbon",title:"증거와 함께 귀환",description:"리스본 저택에서 데미안에게 원본 장부와 생존자 증언을 전달한다.",trigger:{type:"facility",id:"mansion",port:"bella"},port:"bella",facility:"mansion",rewardFame:2500},
      {id:"final-choice",title:"항로의 주인",description:"복원한 항로를 누구에게 맡길지 결정한다.",trigger:{type:"choice",id:"ending"}}
    ]},
    {id:"homecoming",title:"종장 · 세 개의 수평선",complete:true,tasks:[]}
  ]};
  HL.DATA.campaignBeats={
    "claim-ship":"오르소는 녹슨 열쇠와 함께 데미안이 찢어 버렸다는 장부의 표지를 내밀었다. 새벽까마귀의 선창에는 누군가 먼저 뒤진 흔적과 푸른 유리 가루가 남아 있었다.",
    "hear-royal-rumor":"술집의 소문은 한 방향을 가리켰다. 왕실 항해자 아에론의 배가 사라진 날, 회색 봉인 함대가 세우타에서 모든 항해 일지를 사들였다.",
    "reach-ceuta":"빈 계류장에는 밧줄이 칼이 아니라 안쪽에서 풀린 흔적이 남아 있었다. 아에론은 납치된 것이 아니라 누군가를 믿고 배에 올랐던 것이다.",
    "rescue-aeron":"갈고리가 떨어진 갑판 아래에서 아에론을 찾았다. 그는 데미안이 항로를 발견하지 못한 것이 아니라, 발견한 뒤 세상에서 지웠다고 증언했다.",
    "report-rescue":"데미안은 봉인장을 보자 오래 침묵했다. 명예를 잃은 탐험가의 표정이 아니라, 다시 열린 문을 두려워하는 사람의 얼굴이었다.",
    "receive-staff-order":"데미안은 알렉산드리아 기록고의 황동 관측구를 찾아 달라고 부탁했다. 명령이 아니라, 오래 미뤄 둔 고백의 첫 문장이었다.",
    "alexandria-archive":"불에 그을린 성반 뒤에는 해류선과 별자리가 한 몸처럼 새겨져 있었다. 같은 손이 장부를 없애면서도 누군가 복원할 길을 남겨 놓았다.",
    "massawa-search":"해저의 순례선에서 조류의 지팡이를 끌어올리자 바늘이 동쪽이 아닌 폭풍의 중심을 가리켰다. 수평선에는 이미 붉은 돛이 늘어서고 있었다.",
    "massawa-defense":"피난선이 마지막 방파제를 넘자 붉은 돛 기함이 물러났다. 오르소는 그제야 자신이 데미안의 마지막 항해에 함께 있었다고 털어놓았다.",
    "scholar-request":"에네오는 두 개의 일몰을 본 선원들의 기록이 일본에도 남아 있다고 말했다. 미신으로 흩어진 증언을 하나의 세계 지도 위에 올릴 때가 왔다.",
    "zanzibar-crossing":"잔지바르의 노항해사는 바람을 기다리는 법부터 가르쳤다. 빠른 길은 지도에 그어진 선이 아니라 떠날 날짜를 아는 데서 시작되었다.",
    "nagasaki-arrival":"저녁 종이 울린 뒤에도 오래된 관측지의 그림자는 서쪽을 가리켰다. 에네오는 날짜가 바뀌는 바다의 존재를 확신했다.",
    "sakai-record":"별자리 달력과 장부가 정확히 겹쳤다. 두 번째 일몰은 황금의 섬이 아니라 세계를 한 바퀴 잇는 계절풍 회랑이었다.",
    "western-letter":"미라의 편지에는 한 문장만 온전히 남아 있었다. '그들은 항로를 독점하려는 것이 아니라 돌아오지 못한 배의 숫자를 숨기려 한다.'",
    "cartagena-contact":"미라의 숙소는 비어 있었지만 창틀에는 구조 신호가 새겨져 있었다. 술집 지하에서 들려오는 노랫소리가 일부러 너무 컸다.",
    "tavern-rescue":"미라는 수로표를 품에 안은 채 버티고 있었다. 그녀가 훔친 것은 보물이 아니라 해운회사가 버린 선원들의 명부였다.",
    "rival-captain":"바르도의 반쪽 해도는 리안의 조각과 정확히 이어졌다. 그는 데미안을 미워해 추적했지만, 자신의 가족도 같은 봉쇄선에서 버려졌음을 알게 되었다.",
    "amazon-mouth":"부표 아래에서 데미안의 원본 장부를 찾았다. 마지막 장은 뜯겨 있었고, 요새 쪽에서 새벽까마귀와 같은 푸른 신호등이 세 번 깜박였다.",
    "citadel-battle":"봉쇄선이 무너지자 요새의 창고에서 수백 척의 조난 기록이 쏟아졌다. 마지막 장에는 항로를 숨긴 데미안의 서명과 공개하라는 뒤늦은 부탁이 함께 남아 있었다.",
    "return-lisbon":"데미안은 변명하지 않았다. 그는 항로를 숨겨 사람을 살렸지만, 침묵 때문에 또 다른 사람들을 잃었다고 인정했다. 이제 장부의 마지막 문장은 리안이 써야 한다."
  };

  HL.FragmentSystem=class{
    ensure(state){
      state.fragmentBoard={owned:[],placements:{},rotations:{},selected:null,unlocks:[],...(state.fragmentBoard||{})};
      state.fragmentBoard.owned=Array.from(new Set(state.fragmentBoard.owned||[]));
      state.fragmentBoard.placements=state.fragmentBoard.placements||{};state.fragmentBoard.rotations=state.fragmentBoard.rotations||{};
      state.factions={crown:0,league:0,free:0,...(state.factions||{})};state.storyChoices=state.storyChoices||{};state.endingState=state.endingState||null;
      this.refresh(state);return state.fragmentBoard
    }
    data(id){return HL.DATA.chartFragments.find(item=>item.id===id)}
    grant(state,id){const board=this.ensure(state),item=this.data(id);if(!item||board.owned.includes(id))return false;board.owned.push(id);board.rotations[id]=0;board.selected=id;state.campaign.log.unshift(`${state.year}.${state.month}.${state.day} · 황혼 해도편: ${item.name}`);state.campaign.log=state.campaign.log.slice(0,40);return true}
    place(state,id,slot){const board=this.ensure(state);if(!board.owned.includes(id))return false;for(const key of Object.keys(board.placements))if(board.placements[key]===id)delete board.placements[key];const displaced=board.placements[slot];if(displaced)board.selected=displaced;board.placements[slot]=id;this.refresh(state);return true}
    rotate(state,id){const board=this.ensure(state);if(!board.owned.includes(id))return;board.rotations[id]=((board.rotations[id]||0)+1)%4;this.refresh(state)}
    interpreted(state){const board=this.ensure(state);return HL.DATA.chartFragments.filter(item=>board.placements[item.slot]===item.id&&(board.rotations[item.id]||0)===item.rotation)}
    refresh(state){const board=state.fragmentBoard;if(!board)return;let count=0;for(const item of HL.DATA.chartFragments)if(board.placements[item.slot]===item.id&&(board.rotations[item.id]||0)===item.rotation)count++;board.interpreted=count;board.unlocks=[3,6,9,12].filter(n=>count>=n)}
    requiredCount(state){const owned=new Set(this.ensure(state).owned);return HL.DATA.chartFragments.filter(f=>f.required&&owned.has(f.id)).length}
  };

  const speed=HL.SeaSimulation.prototype.shipSpeed;
  HL.SeaSimulation.prototype.shipSpeed=function(state,ship,index=0){return speed.call(this,state,ship,index)*HL.DATA.seaSpeedScale};
  const instrument=HL.SeaSimulation.prototype.instrument;
  HL.SeaSimulation.prototype.instrument=function(state){const result=instrument.call(this,state);if(result&&new HL.FragmentSystem().interpreted(state).length>=3)result.error*=.65;return result};

  HL.migrateStateV7=function(prior){
    const state=copy(prior||HL.Game.freshState());state.version=7;
    state.campaign=state.campaign||{chapterId:"inherited-route",taskIndex:0,completed:[],log:[],startedDay:state.day||1};state.campaign.completed=state.campaign.completed||[];state.campaign.log=state.campaign.log||[];
    state.fragmentBoard=state.fragmentBoard||{owned:[],placements:{},rotations:{},selected:null,unlocks:[]};
    state.factions={crown:0,league:0,free:0,...(state.factions||{})};state.storyChoices=state.storyChoices||{};state.endingState=state.endingState||null;
    const completed=new Set(state.campaign?.completed||[]),discoveries=new Set((state.discoveries||[]).map(d=>d.id)),chapterMap={"eastbound-scholar":"second-sunset"};
    if(state.campaign){
      state.campaign.chapterId=chapterMap[state.campaign.chapterId]||state.campaign.chapterId;
      let chapterIndex=Math.max(0,HL.DATA.campaign.chapters.findIndex(c=>c.id===state.campaign.chapterId)),chapter=HL.DATA.campaign.chapters[chapterIndex];
      state.campaign.chapterId=chapter.id;
      if(!chapter.legacyQuest&&!chapter.complete){let next=chapter.tasks.findIndex(task=>!completed.has(task.id));while(next<0&&chapterIndex<HL.DATA.campaign.chapters.length-1){chapter=HL.DATA.campaign.chapters[++chapterIndex];state.campaign.chapterId=chapter.id;if(chapter.legacyQuest||chapter.complete){next=0;break}next=chapter.tasks.findIndex(task=>!completed.has(task.id))}state.campaign.taskIndex=Math.max(0,next)}
    }
    const system=new HL.FragmentSystem();for(const [task,id] of Object.entries(HL.DATA.fragmentByTask))if(completed.has(task)||discoveries.has(`story-${task}`))system.grant(state,id);
    if(state.flags?.gotClue)system.grant(state,"glass-cipher");system.ensure(state);return state
  };

  const engine=HL.Engine.prototype,oldDelete=engine.deleteSlot;
  engine.v6SlotKey=function(i){return`horizon-ledger-v6-slot-${i}`};
  engine.slotKey=function(i){return`horizon-ledger-v7-slot-${i}`};
  engine.loadSlot=function(i){try{const value=JSON.parse(localStorage.getItem(this.slotKey(i)));return value&&value.version===7?value:null}catch{return null}};
  engine.migrateOld=function(i){if(this.loadSlot(i))return;try{const keys=[this.v6SlotKey(i),`horizon-ledger-v5-slot-${i}`,this.v4SlotKey(i),this.v3SlotKey(i),this.oldSlotKey(i),`horizon-ledger-${i}`],prior=keys.map(key=>JSON.parse(localStorage.getItem(key)||"null")).find(Boolean);if(prior)this.saveSlot(i,HL.migrateStateV7(prior))}catch(error){console.warn("v7 save migration failed",error)}};
  engine.deleteSlot=function(i){oldDelete.call(this,i);localStorage.removeItem(this.slotKey(i))};

  const campaignMatches=HL.CampaignSystem.prototype.matches;
  HL.CampaignSystem.prototype.matches=function(state,event,task){if(task?.minFragments&&new HL.FragmentSystem().requiredCount(state)<task.minFragments)return false;return campaignMatches.call(this,state,event,task)};
  const campaignChecks=HL.CampaignSystem.prototype.checklist;
  HL.CampaignSystem.prototype.checklist=function(state){const result=campaignChecks.call(this,state),task=result.task;if(task?.minFragments)result.checks.unshift({done:new HL.FragmentSystem().requiredCount(state)>=task.minFragments,text:`필수 황혼 해도편 ${task.minFragments}개 · 현재 ${new HL.FragmentSystem().requiredCount(state)}개`});return result};

  const proto=HL.Game.prototype,oldFresh=HL.Game.freshState,oldEnsure=proto.ensureExpansion,oldProgress=proto.progressCampaign,oldDispatch=proto.dispatchAction,oldJournal=proto.openJournal,oldHandleEvent=proto.handleDosSeaEvent,oldSeaArt=HL.Art.prototype.worldSea,oldRenderHud=proto.renderHud,oldSearchSea=proto.searchSea,oldSurvey=proto.dosSurvey;
  HL.Game.freshState=function(){const state=oldFresh.call(this);state.version=7;state.fragmentBoard={owned:[],placements:{},rotations:{},selected:null,unlocks:[]};state.factions={crown:0,league:0,free:0};state.storyChoices={};state.endingState=null;return state};
  proto.ensureExpansion=function(){oldEnsure.call(this);if(!this.fragmentSystem)this.fragmentSystem=new HL.FragmentSystem();if(this.s){this.s.version=7;this.fragmentSystem.ensure(this.s);if(this.campaignSystem?.data!==HL.DATA.campaign)this.campaignSystem.data=HL.DATA.campaign}};
  proto.campaignBeatText=function(id){return HL.DATA.campaignBeats[id]||"바람이 바뀌었다. 장부의 다음 빈칸은 더 먼 바다를 가리키고 있다."};
  proto.grantFragment=function(id){this.ensureExpansion();if(!this.fragmentSystem.grant(this.s,id))return false;const item=this.fragmentSystem.data(id);this.save();this.e.toast(`황혼 해도편 획득 · ${item.name}`);return true};
  proto.nextStoryChoice=function(){const task=this.campaignSystem.currentTask(this.s);if(task?.trigger?.type!=="choice")return false;const prompts={
    aeron:["봉인장을 어떻게 처리할까?",[{label:"왕실에 먼저 보고한다",action:"story-choice:aeron:crown"},{label:"도시 길드와 사본을 나눈다",action:"story-choice:aeron:league"},{label:"아에론에게 보관시킨다",action:"story-choice:aeron:free"}]],
    orso:["오르소는 데미안과 함께 항로를 숨겼다고 고백했다.",[{label:"다시 믿는다",action:"story-choice:orso:free"},{label:"왕실 심문을 요구한다",action:"story-choice:orso:crown"},{label:"증거를 길드 금고에 맡긴다",action:"story-choice:orso:league"}]],
    bardo:["패배한 바르도는 자신의 반쪽 해도와 검을 내려놓았다.",[{label:"동맹으로 받아들인다",action:"story-choice:bardo:free"},{label:"왕실 포로로 넘긴다",action:"story-choice:bardo:crown"},{label:"도시동맹의 호위로 고용한다",action:"story-choice:bardo:league"}]],
    ending:["복원된 항로의 주인을 결정해야 한다.",this.endingChoices()]
  },entry=prompts[task.trigger.id];if(!entry)return false;this.e.dialogue("리안 팔코",entry[0],entry[1].map((choice,index)=>({...choice,primary:index===0})));return true};
  proto.endingChoices=function(){const choices=[{label:"왕실에 맡긴다",action:"story-choice:ending:crown"},{label:"도시동맹이 관리한다",action:"story-choice:ending:league"}];if(this.fragmentSystem.interpreted(this.s).length===12)choices.push({label:"모든 항해자에게 공개한다",action:"story-choice:ending:free"});return choices};
  proto.applyStoryChoice=function(id,path){this.s.storyChoices[id]=path;this.s.factions[path]=(this.s.factions[path]||0)+2;if(id==="bardo"&&path!=="crown"&&!this.s.mates.some(m=>m.name==="바르도 카인"))this.s.mates.push({name:"바르도 카인",sailing:34,battle:43,loyalty:path==="free"?78:62});if(id==="ending")this.applyEnding(path);this.progressCampaign({type:"choice",id});this.save()};
  proto.applyEnding=function(path){const names={crown:"왕실의 자오선",league:"열린 시장의 항로",free:"자유 항해자의 해도"},effects={crown:"왕실 순찰이 주요 항로를 지키며 해적 함대가 약화됩니다.",league:"교역 수수료가 낮아지고 주요 시장의 재고가 늘어납니다.",free:"모든 항구가 해도에 공개되지만 해적들도 새로운 항로를 이용합니다."};this.s.endingState={path,title:names[path],text:effects[path],completedAt:`${this.s.year}.${this.s.month}.${this.s.day}`};if(path==="crown"){this.s.relations["루시타 왕국"]=(this.s.relations["루시타 왕국"]||0)+40;for(const f of this.s.seaFleets.filter(f=>f.kind==="pirate"))f.strength*=.9}else if(path==="league"){this.s.relations["남부 도시동맹"]=(this.s.relations["남부 도시동맹"]||0)+40;this.s.flags.marketLeagueBonus=true}else{this.s.knownPorts=Object.keys(HL.DATA.ports);this.s.flags.publicChart=true;for(const f of this.s.seaFleets.filter(f=>f.kind==="pirate"))f.strength*=1.05}};
  proto.progressCampaign=function(event){const before=this.campaignSystem.currentTask(this.s),result=oldProgress.call(this,event);if(!result)return false;const fragmentId=HL.DATA.fragmentByTask[before?.id];if(fragmentId)this.grantFragment(fragmentId);const next=this.campaignSystem.currentTask(this.s);if(next?.trigger?.type==="choice")this.s.pendingStoryChoice=next.trigger.id;return true};
  proto.handleDosSeaEvent=function(event){oldHandleEvent.call(this,event);if(event.type==="storm-end"&&this.s.sea.lon>35&&this.s.sea.lon<100&&!this.s.fragmentBoard.owned.includes("monsoon-veil"))this.grantFragment("monsoon-veil")};
  proto.dosSurvey=function(){const result=oldSurvey.call(this),count=this.fragmentSystem.interpreted(this.s).length;if(count>=6)this.e.toast(`계절풍 기록 · 사흘 뒤 예상 풍향 ${HL.DATA.directionNames[(this.s.sea.wind+1)%8]}`);return result};
  proto.searchSea=function(){const before=this.s.discoveries.length,result=oldSearchSea.call(this),count=this.fragmentSystem.interpreted(this.s).length;if(count>=9&&this.seaGrid?.coastDistance(this.s.sea.lon,this.s.sea.lat)<1.5&&!this.s.flags.twilightSpringFound&&this.s.discoveries.length===before){this.s.flags.twilightSpringFound=true;this.s.discoveries.push({id:"twilight-spring",name:"황혼의 샘",lon:this.s.sea.lon,lat:this.s.sea.lat,value:1800});this.s.fleet[0].water+=4;this.save();this.e.toast("해도편의 해안선을 따라 황혼의 샘을 발견했습니다")};return result};

  proto.openJournal=function(){
    this.ensureExpansion();const info=this.campaignSystem.checklist(this.s),task=info.task,rec=info.recommendation,chapterIndex=HL.DATA.campaign.chapters.findIndex(c=>c.id===info.chapter.id),history=this.s.campaign.log.slice(0,4),owned=this.s.fragmentBoard.owned.length,interpreted=this.fragmentSystem.interpreted(this.s).length;
    this.e.window(`<div class="journal-head"><div><small>리안 팔코의 항해 일지</small><h1>${info.chapter.title}</h1></div><strong>${chapterIndex+1} / ${HL.DATA.campaign.chapters.length}</strong></div><section class="objective-card"><small>현재 해야 할 일</small><h2>${task?.title||"자유 항해"}</h2><p>${task?.description||this.s.endingState?.text||"세계의 빈 항로를 기록하십시오."}</p></section><div class="faction-meter"><span>왕실 ${this.s.factions.crown}</span><span>도시동맹 ${this.s.factions.league}</span><span>자유항해자 ${this.s.factions.free}</span></div><div class="journal-grid"><section><h3>완료 조건</h3>${info.checks.length?info.checks.map(c=>`<p class="check ${c.done?"done":""}">${c.done?"✓":"□"} ${c.text}</p>`).join(""):"<p>표시된 인물이나 장소를 조사하십시오.</p>"}</section><section><h3>항해 준비</h3><p>거리 약 ${rec.distance}° · 예상 ${rec.days}일 · 위험도 ${rec.danger}</p><p>권장 식량 ${rec.food} · 물 ${rec.water} · 의약품 ${rec.medicine}</p><p>해도편 ${owned}/12 · 해석 ${interpreted}/12</p></section><section><h3>최근 기록</h3>${history.length?history.map(x=>`<p>${x}</p>`).join(""):"<p>아직 기록이 없습니다.</p>"}</section></div><div class="toolbar right">${this.e.button("황혼 해도편","fragment-board","primary")}${this.e.button("세계지도 · M","world-map")}${this.e.button("선원 배치","crew-menu")}${this.e.button("저장","manual-save")}${this.e.button("닫기","close")}</div>`,`center wide journal`)
  };
  proto.openFragmentBoard=function(){
    this.ensureExpansion();const board=this.s.fragmentBoard,correct=new Set(this.fragmentSystem.interpreted(this.s).map(f=>f.id)),selected=board.selected,item=this.fragmentSystem.data(selected),cells=Array.from({length:12},(_,slot)=>{const id=board.placements[slot],piece=this.fragmentSystem.data(id);return`<button class="fragment-cell ${id===selected?"selected":""} ${correct.has(id)?"correct":""}" data-action="fragment-cell:${slot}"><small>${slot+1} · ${HL.DATA.chartFragments[slot].region}</small><b>${piece?piece.name:"빈 자리"}</b><i>${piece?`회전 ${(board.rotations[id]||0)*90}°`:"조각을 선택"}</i></button>`}).join(""),inventory=HL.DATA.chartFragments.filter(f=>board.owned.includes(f.id)).map(f=>this.e.button(`${board.placements[f.slot]===f.id&&correct.has(f.id)?"◆":"◇"} ${f.name}`,`fragment-pick:${f.id}`,f.id===selected?"primary":"")).join("")||"<p>아직 발견한 해도편이 없습니다.</p>";
    const milestones=[[3,"천문 좌표 보정"],[6,"계절풍 기록"],[9,"숨은 상륙지"],[12,"자유 항로 공개"]].map(([n,label])=>`<p class="check ${correct.size>=n?"done":""}">${correct.size>=n?"✓":"□"} ${n}개 · ${label}</p>`).join("");
    this.e.window(`<div class="fragment-summary"><div><small>TWILIGHT CHART</small><h1>황혼 해도편</h1></div><strong>${correct.size} / 12 해석</strong></div><div class="fragment-layout"><div><div class="fragment-grid">${cells}</div><div class="fragment-clue">${item?`<strong>${item.region} · ${item.name}</strong><br>${item.clue}`:"목록에서 조각을 선택한 뒤 빈 자리에 배치하십시오."}</div></div><aside><h3>발견한 조각</h3><div class="fragment-inventory">${inventory}</div><div class="toolbar">${this.e.button("선택 조각 회전","fragment-rotate")}${this.e.button("항해 일지","journal")}</div>${milestones}</aside></div>`,`center wide fragment-board`)
  };

  proto.dispatchAction=function(action,button){
    if(!this.s)return oldDispatch.call(this,action,button);this.ensureExpansion();
    if((action==="close"||action==="dialogue-next")&&this.s.pendingStoryChoice){this.s.pendingStoryChoice=null;this.e.close();return this.nextStoryChoice()}
    if(action==="fragment-board")return this.openFragmentBoard();if(action==="journal")return this.openJournal();
    if(action.startsWith("fragment-pick:")){this.s.fragmentBoard.selected=action.split(":")[1];return this.openFragmentBoard()}
    if(action.startsWith("fragment-cell:")){const slot=+action.split(":")[1],id=this.s.fragmentBoard.selected;if(!id)return this.e.toast("먼저 해도편을 선택하십시오");this.fragmentSystem.place(this.s,id,slot);this.save();return this.openFragmentBoard()}
    if(action==="fragment-rotate"){const id=this.s.fragmentBoard.selected;if(!id)return this.e.toast("회전할 해도편을 선택하십시오");this.fragmentSystem.rotate(this.s,id);this.save();return this.openFragmentBoard()}
    if(action.startsWith("story-choice:")){const[,id,path]=action.split(":");this.e.close();return this.applyStoryChoice(id,path)}
    const result=oldDispatch.call(this,action,button);if(action==="get-clue")this.grantFragment("glass-cipher");return result
  };

  proto.renderHud=function(){if(this.s&&this.mode==="sea"){this.e.hud.innerHTML="";return}return oldRenderHud.call(this)};
  function bar(art,label,value,max,y,color){const e=art.e,c=e.ctx,w=98,p=clamp(value/Math.max(1,max),0,1);e.text(label,18,y+10,"#d8cba5","left",11);c.fillStyle="#06171b";c.fillRect(18,y+16,w,8);c.fillStyle=color;c.fillRect(19,y+17,Math.floor((w-2)*p),6);e.text(`${Math.round(value)}`,132,y+23,"#e9dba8","right",10)}
  function dial(e,x,y,label,direction,value){const c=e.ctx;c.fillStyle="#102f32";c.beginPath();c.arc(x,y,28,0,Math.PI*2);c.fill();c.strokeStyle="#c59b51";c.lineWidth=2;c.stroke();const angle=(direction-2)*Math.PI/4;c.strokeStyle="#f2dc93";c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(angle)*20,y+Math.sin(angle)*20);c.stroke();c.lineWidth=1;e.text(label,x,y+43,"#cdbd91","center",11);e.text(String(value),x,y+4,"#fff1b8","center",11)}
  HL.Art.prototype.worldSea=function(game){
    oldSeaArt.call(this,game);const e=game.e,c=e.ctx,s=game.s,ship=s.fleet[0],spec=HL.DATA.ships[ship.type]||{hull:100,cargo:100},sim=s.seaSim,totalCrew=s.fleet.reduce((n,v)=>n+v.crew,0),load=game.seaSimulation.cargoLoad(s,ship,0),speed=game.seaSimulation.fleetSpeed(s);
    c.fillStyle="#071d22";c.fillRect(0,0,154,540);c.fillRect(806,0,154,540);c.strokeStyle="#c09a55";c.strokeRect(6.5,6.5,141,527);c.strokeRect(812.5,6.5,141,527);c.fillStyle="#102e31";c.fillRect(12,12,130,34);e.text("FLEET STATE",77,34,"#e9c36b","center",15);
    bar({e},"선체",ship.hull,spec.hull,58,"#a74e40");bar({e},"돛",ship.sailCondition,100,91,"#d1b866");bar({e},"방향타",ship.voyage.rudder,100,124,"#5ca9a0");bar({e},"적재",load,spec.cargo,157,"#9c7fc3");bar({e},"포탄",ship.cannonballs,Math.max(24,ship.cannonballs),190,"#c87451");bar({e},"선원",totalCrew,s.fleet.reduce((n,v)=>n+(HL.DATA.ships[v.type]?.crewMax||v.crew),0),223,"#d2a064");bar({e},"건강",s.crew.health,100,256,"#62a86e");bar({e},"사기",s.crew.morale,100,289,"#d6c253");
    e.text(ship.name,77,350,"#f1d079","center",14);e.text(`${HL.DATA.ships[ship.type]?.name||ship.type} · ${s.fleet.length}척`,77,371,"#a9beb3","center",11);e.text(sim.mode,77,405,sim.mode==="Storm"?"#ff8a6a":"#86d4c1","center",15);e.text(`식량 ${Math.floor(s.fleet.reduce((n,v)=>n+(v.food||0),0))}`,18,449,"#dfd2aa","left",11);e.text(`물 ${Math.floor(s.fleet.reduce((n,v)=>n+(v.water||0),0))}`,18,468,"#dfd2aa","left",11);e.text(`항해 ${s.voyageDays}일`,18,487,"#dfd2aa","left",11);
    c.fillStyle="#ead9ae";c.fillRect(816,12,134,53);c.strokeStyle="#835d2e";c.strokeRect(818.5,14.5,129,48);e.text(`${s.year}.${s.month}.${s.day}`,883,36,"#3a2a1c","center",13);e.text(`${String(s.hour).padStart(2,"0")}:00`,883,55,"#64472a","center",12);
    dial(e,848,112,"바람",s.sea.wind,"풍");dial(e,918,112,"해류",s.sea.current,"류");dial(e,848,202,"침로",s.sea.heading,"선");dial(e,918,202,"속도",s.sea.heading,speed.toFixed(1));
    e.text("NAVIGATION",883,272,"#e9c36b","center",14);e.text(HL.DATA.directionNames[s.sea.heading],883,300,"#f1dfad","center",18);e.text(`풍력 ${s.sea.weather==="폭풍"?8:4}/8`,824,329,"#c9bea0","left",11);e.text(`수심 ${Math.round(s.sea.depth||0)}m`,824,350,"#c9bea0","left",11);e.text(`해도편 ${s.fragmentBoard.owned.length}/12`,824,371,"#c9bea0","left",11);e.text(`해석 ${game.fragmentSystem.interpreted(s).length}/12`,824,392,"#c9bea0","left",11);e.text("Enter  명령",883,450,"#e9c36b","center",12);e.text("J  항해 일지",883,472,"#e9c36b","center",12);e.text("M  세계 해도",883,494,"#e9c36b","center",12);
    c.fillStyle="#031015";c.fillRect(154,468,652,72);c.strokeStyle="#987a43";c.strokeRect(154.5,468.5,651,70);const task=game.campaignSystem.currentTask(s),notice=sim.lastEvent||`${sim.mode} · 풍 ${HL.DATA.directionNames[s.sea.wind]} · 해류 ${HL.DATA.directionNames[s.sea.current]} · 항해 ${s.voyageDays}일`;e.text(notice,480,491,"#c9d6c4","center",12);e.text(task?`${game.campaignSystem.chapter(s).title} · ${task.title}`:(s.endingState?.title||"자유 항해"),480,523,"#f0d688","center",13)
  };
})();
