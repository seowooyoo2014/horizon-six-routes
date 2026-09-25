window.HL=window.HL||{};
(function(){
  "use strict";
  const copy=value=>JSON.parse(JSON.stringify(value));
  const removeMate=(state,name)=>{state.mates=(state.mates||[]).filter(m=>m.name!==name)};
  const addMate=(state,mate)=>{if(!(state.mates||[]).some(item=>item.name===mate.name))state.mates.push(mate)};
  const companionNames={orso:"오르소 벤",mira:"미라 소렐",bardo:"바르도 카인",aeron:"아에론",damian:"데미안 팔코"};

  HL.CompanionQuestSystem=class{
    ensure(state){
      state.companions=state.companions||{};
      for(const id of["orso","mira","bardo","aeron","damian"]){
        const defaults={alive:true,status:id==="orso"?"aboard":"unmet",trust:0,personalCompleted:[],romance:false};
        state.companions[id]={...defaults,...(state.companions[id]||{})};
        state.companions[id].personalCompleted=state.companions[id].personalCompleted||[];
      }
      state.sideQuests={active:null,completed:[],...(state.sideQuests||{})};
      state.sideQuests.completed=Array.from(new Set(state.sideQuests.completed||[]));
      return state.sideQuests;
    }
    chapterIndex(state){return Math.max(0,HL.DATA.campaign.chapters.findIndex(ch=>ch.id===state.campaign?.chapterId))}
    data(id){return HL.DATA.companionQuests.find(q=>q.id===id)}
    available(state){
      this.ensure(state);const chapter=this.chapterIndex(state);
      return HL.DATA.companionQuests.filter(q=>chapter>=q.unlockChapter&&chapter<6&&!state.sideQuests.completed.includes(q.id)&&state.companions[q.companion]?.alive);
    }
    start(state,id){const q=this.data(id);if(!q||!this.available(state).some(item=>item.id===id))return false;state.sideQuests.active=id;return true}
    matches(event,trigger){if(!event||!trigger||event.type!==trigger.type)return false;if(trigger.id&&event.id!==trigger.id)return false;if(trigger.port&&event.port!==trigger.port)return false;if(trigger.tag&&event.tag!==trigger.tag)return false;return true}
    evaluate(state,event){
      const side=this.ensure(state),q=this.data(side.active);if(!q||!this.matches(event,q.trigger))return null;
      side.completed.push(q.id);side.active=null;const person=state.companions[q.companion];person.trust+=2;person.personalCompleted.push(q.id);
      state.campaign.log.unshift(`${state.year}.${state.month}.${state.day} · 동료 이야기: ${q.title}`);
      return q
    }
  };

  HL.DATA.fragmentChallenges={
    "porcelain-current":{title:"쌍룡 도자기 해류도",intro:"도자기 비늘 수와 세 품목의 시세 끝자리를 차례로 읽으십시오.",questions:[
      {text:"푸른 용의 비늘은 8개, 붉은 용은 3개다. 먼저 읽을 방향은?",answers:["동쪽에서 서쪽","서쪽에서 동쪽","북쪽에서 남쪽"],correct:1,hint:"안트베르펜 장부의 첫 규칙은 서쪽에서 동쪽이었다."},
      {text:"비단 12, 차 19, 도자기 26. 일곱씩 늘어나는 수열의 다음 수는?",answers:["31","33","35"],correct:1,hint:"끝자리보다 항목 사이의 차이를 보십시오."},
      {text:"8·3·33을 해류표에 놓을 때 비어 있는 계절은?",answers:["북동 계절풍","남서 계절풍","무풍기"],correct:2,hint:"두 바람 사이의 빈 시기가 회랑의 문입니다."}
    ]},
    "star-calendar":{title:"열아홉 해의 달력",intro:"리스본·광저우·사카이에서 얻은 그림자 기록을 같은 달력에 겹치십시오.",questions:[
      {text:"리스본 기록의 기준 그림자는 어느 방향인가?",answers:["서쪽","동쪽","남쪽"],correct:0,hint:"해가 진 뒤 길어진 그림자는 서쪽 항로의 시작을 가리켰습니다."},
      {text:"광저우 해류표에서 무풍기는 몇 번째 칸인가?",answers:["17번째","18번째","19번째"],correct:2,hint:"두 번째 일몰은 열아홉 해마다 열린다고 기록되어 있습니다."},
      {text:"사카이의 날짜를 서쪽 기록과 겹치면 무엇이 두 번 보이는가?",answers:["달","일몰","북극성"],correct:1,hint:"이 항로의 이름을 떠올리십시오."},
      {text:"세 기록이 가리키는 것은 무엇인가?",answers:["황금의 섬","고정된 운하","계절풍 회랑"],correct:2,hint:"장소가 아니라 날짜와 바람이 만드는 길입니다."}
    ]}
  };

  const campaignProto=HL.CampaignSystem.prototype;
  campaignProto.ensure=function(state){
    const valid=HL.DATA.campaign.chapters.some(ch=>ch.id===state.campaign?.chapterId);
    if(!state.campaign||!valid)state.campaign={chapterId:"lights-out",taskIndex:0,completed:state.campaign?.completed||[],log:state.campaign?.log||[],startedDay:state.day||1};
    state.campaign.completed=Array.from(new Set(state.campaign.completed||[]));state.campaign.log=state.campaign.log||[];
    this.data=HL.DATA.campaign;this.syncQuest(state);return state.campaign
  };
  campaignProto.matches=function(state,event,task){
    const trigger=task?.trigger;if(!trigger||trigger.type!==event.type)return false;
    if(trigger.id&&trigger.id!==event.id)return false;if(trigger.port&&trigger.port!==event.port)return false;if(trigger.tag&&trigger.tag!==event.tag)return false;
    if(task.minFragments&&new HL.FragmentSystem().requiredCount(state)<task.minFragments)return false;
    if(trigger.near){const lon=event.lon??state.sea.lon,lat=event.lat??state.sea.lat,dx=(lon-trigger.near[0])*Math.cos(lat*Math.PI/180);if(Math.hypot(dx,lat-trigger.near[1])>(trigger.radius||1))return false}
    return true
  };
  campaignProto.evaluate=function(state,event){
    this.ensure(state);const chapter=this.chapter(state),task=this.currentTask(state);if(!task||!this.matches(state,event,task))return false;
    state.campaign.completed.push(task.id);state.campaign.log.unshift(`${state.year}.${state.month}.${state.day} · ${task.title}`);state.campaign.log=state.campaign.log.slice(0,60);state.fame.adventure+=(task.rewardFame||0);state.campaign.taskIndex++;
    if(state.campaign.taskIndex>=chapter.tasks.length){
      const index=this.data.chapters.indexOf(chapter),next=this.data.chapters[index+1];
      if(next){state.campaign.chapterId=next.id;state.campaign.taskIndex=0}else{state.campaign.taskIndex=chapter.tasks.length;state.flags.campaignComplete=true;state.worldPhase=3}
    }
    this.syncQuest(state);return true
  };
  const oldChecklist=campaignProto.checklist;
  campaignProto.checklist=function(state){
    const result=oldChecklist.call(this,state),task=result.task;
    if(task?.trigger?.type==="challenge")result.checks.push({done:false,text:`조사 과제 · ${task.title}`});
    if(task?.minFragments)result.checks.push({done:new HL.FragmentSystem().requiredCount(state)>=task.minFragments,text:`필수 해도편 ${task.minFragments}개 이상`});
    return result
  };

  HL.V9CutsceneDirector=class extends HL.CutsceneDirector{
    ensure(state){
      const cs=super.ensure(state);cs.relationships={orso:0,mira:0,bardo:0,aeron:0,damian:0,...(cs.relationships||{})};cs.evidence=Array.from(new Set(cs.evidence||[]));return cs
    }
    finish(game,skipped=false){
      const data=this.current(game),replay=game.cutscene?.replay,returnMode=game.cutscene?.returnMode||"town",action=data?.onComplete;
      game.cutscene=null;
      if(!replay&&data){const cs=this.ensure(game.s);if(!cs.seen.includes(data.id))cs.seen.push(data.id);this.applyCompletion(game,data,skipped)}
      game.mode=returnMode==="cutscene"?"town":returnMode;game.e.close();game.syncRegionMusic();if(!replay)game.save();
      if(replay||!action)return;
      if(action.startsWith("queue:"))return this.start(game,action.slice(6),false);
      if(action==="finish-v9-prologue")return game.finishV9Prologue();
      if(action.startsWith("show-v9-choice:"))return game.showV9Choice(action.slice(15));
    }
    applyCompletion(game,data,skipped){super.applyCompletion(game,data,skipped);const evidence={v9_ch0_end:"antwerp-insurance",v9_ch1_intro:"damian-genoa-order",v9_ch1_turn:"aeron-blue-seal",v9_ch4_end:"lost-ships-register",v9_ch5_turn:"damian-original-order",v9_ch7_intro:"public-testimony"}[data.id];if(evidence&&!game.s.cutsceneState.evidence.includes(evidence))game.s.cutsceneState.evidence.push(evidence)}
  };

  HL.migrateStateV9=function(prior){
    const state=copy(prior||{});state.version=9;state.flags=state.flags||{};state.quest=state.quest||{};state.campaign=state.campaign||{};
    const oldChapter=state.campaign.chapterId,chapterMap={"inherited-route":"lights-out","blue-ledger":"lights-out","missing-navigator":"blue-ledger-v9","tide-staff":"red-strait","second-sunset":"second-sunset-v9","western-river":"western-letter-v9","meridian-citadel":"meridian-fortress","homecoming":"three-horizons"};
    const completionMap={"claim-ship":"v9-claim-ship","legacy-clue":"v9-antwerp-ledger","rescue-aeron":"v9-rescue-aeron","report-rescue":"v9-aeron-joins","alexandria-archive":"v9-alexandria-archive","massawa-search":"v9-massawa-rescue","massawa-defense":"v9-massawa-recovery","zanzibar-crossing":"v9-reach-zanzibar","nagasaki-arrival":"v9-reach-nagasaki","sakai-record":"v9-sakai-calendar","tavern-rescue":"v9-rescue-mira","rival-captain":"v9-rival-battle","amazon-mouth":"v9-amazon-channel","citadel-battle":"v9-meridian-battle","return-lisbon":"v9-public-testimony"};
    const completed=new Set((state.campaign.completed||[]).map(id=>completionMap[id]||id));state.campaign.completed=[...completed];state.campaign.chapterId=chapterMap[oldChapter]||"lights-out";state.campaign.log=state.campaign.log||[];
    const chapter=HL.DATA.campaign.chapters.find(ch=>ch.id===state.campaign.chapterId)||HL.DATA.campaign.chapters[0];let next=chapter.tasks.findIndex(t=>!completed.has(t.id));state.campaign.taskIndex=next<0?Math.max(0,chapter.tasks.length-1):next;
    const fragmentMap={"navigator-oath":"burnt-margin","sunset-record":"porcelain-current","mira-cipher":"lantern-seal","damian-confession":"amazon-rubbing"},legacy={"glass-cipher":[0,1],"blue-seal":[1,2],"navigator-oath":[2,0],"alexandria-star":[3,3],"tide-staff":[4,1],"monsoon-veil":[5,2],"sunset-record":[6,0],"star-calendar":[7,3],"mira-cipher":[8,1],"rival-half":[9,2],"amazon-rubbing":[10,0],"damian-confession":[11,3]};
    const oldBoard=state.fragmentBoard||{},owned=Array.from(new Set((oldBoard.owned||[]).map(id=>fragmentMap[id]||id))).filter(id=>HL.DATA.chartFragments.some(f=>f.id===id));state.fragmentBoard={owned,placements:{},rotations:{},selected:owned[0]||null,unlocks:[]};
    for(const oldId of oldBoard.owned||[]){const placed=Object.entries(oldBoard.placements||{}).find(([,id])=>id===oldId),meta=legacy[oldId],newId=fragmentMap[oldId]||oldId,item=HL.DATA.chartFragments.find(f=>f.id===newId);if(item&&placed&&meta&&+placed[0]===meta[0]&&(oldBoard.rotations?.[oldId]||0)===meta[1]){state.fragmentBoard.placements[item.slot]=newId;state.fragmentBoard.rotations[newId]=item.rotation}else if(item)state.fragmentBoard.rotations[newId]=0}
    state.storyChoices=state.storyChoices||{};state.factions={crown:0,league:0,free:0,...(state.factions||{})};state.chapterCheckpoints=state.chapterCheckpoints||[];
    new HL.CompanionQuestSystem().ensure(state);new HL.V9CutsceneDirector().ensure(state);new HL.FragmentSystem().ensure(state);
    if(state.mates?.some(m=>m.name==="아에론"))state.companions.aeron.status="aboard";if(state.mates?.some(m=>m.name==="바르도 카인"))state.companions.bardo.status="aboard";
    return state
  };

  const engine=HL.Engine.prototype,oldDelete=engine.deleteSlot;
  engine.v8SlotKey=function(i){return`horizon-ledger-v8-slot-${i}`};engine.slotKey=function(i){return`horizon-ledger-v9-slot-${i}`};
  engine.loadSlot=function(i){try{const value=JSON.parse(localStorage.getItem(this.slotKey(i)));return value&&value.version===9?value:null}catch{return null}};
  engine.migrateOld=function(i){if(this.loadSlot(i))return;try{const keys=[this.v8SlotKey(i),`horizon-ledger-v7-slot-${i}`,`horizon-ledger-v6-slot-${i}`,`horizon-ledger-v5-slot-${i}`,this.v4SlotKey(i),this.v3SlotKey(i),this.oldSlotKey(i)],prior=keys.map(key=>JSON.parse(localStorage.getItem(key)||"null")).find(Boolean);if(prior)this.saveSlot(i,HL.migrateStateV9(prior))}catch(error){console.warn("v9 save migration failed",error)}};
  engine.deleteSlot=function(i){oldDelete.call(this,i);localStorage.removeItem(this.slotKey(i))};

  const proto=HL.Game.prototype,oldFresh=HL.Game.freshState,oldEnsure=proto.ensureExpansion,oldUpdate=proto.update,oldRender=proto.render,oldDispatch=proto.dispatchAction,oldProgress=proto.progressCampaign,oldJournal=proto.openJournal,oldShowFiles=proto.showFiles,oldResume=proto.resume,oldSetSail=proto.setSail,oldSearch=proto.searchSea;
  HL.Game.freshState=function(){
    const state=oldFresh.call(this);state.version=9;state.campaign={chapterId:"lights-out",taskIndex:0,completed:[],log:[],startedDay:state.day};state.quest={title:"제1장 · 꺼진 불빛",objective:"1511년 성 루시아 등대에서 오르소의 기억을 확인한다."};state.storyChoices={};state.factions={crown:0,league:0,free:0};state.endingState=null;state.chapterCheckpoints=[];state.flags.v9PrologueSeen=false;new HL.CompanionQuestSystem().ensure(state);new HL.V9CutsceneDirector().ensure(state);new HL.FragmentSystem().ensure(state);return state
  };
  proto.ensureExpansion=function(){
    oldEnsure.call(this);if(!this.companionQuestSystem)this.companionQuestSystem=new HL.CompanionQuestSystem();if(!(this.cutsceneDirector instanceof HL.V9CutsceneDirector))this.cutsceneDirector=new HL.V9CutsceneDirector();if(this.campaignSystem)this.campaignSystem.data=HL.DATA.campaign;
    if(this.s){this.s.version=9;this.companionQuestSystem.ensure(this.s);this.cutsceneDirector.ensure(this.s);this.campaignSystem.ensure(this.s);this.fragmentSystem.ensure(this.s)}
  };
  proto.showFiles=function(){const result=oldShowFiles.call(this);const title=this.e.overlay.querySelector?.(".file-title h1");if(title)title.textContent=HL.DATA.gameTitle;document.title=HL.DATA.gameTitle;return result};
  proto.resume=function(i){const result=oldResume.call(this,i);if(this.s){this.ensureExpansion();this.makeChapterCheckpoint(true);this.syncRegionMusic()}return result};

  proto.startCutscene=function(replay=false){if(replay)return this.cutsceneDirector.start(this,"v9_ch0_intro",true);return this.startV9Prologue()};
  proto.startV9Prologue=function(){this.mode="prologue";this.prologue={x:96,y:432,vx:0,vy:0,elapsed:0,complete:false};this.e.close();this.e.hud.innerHTML="";this.e.playMusic("theme_main")};
  proto.updateV9Prologue=function(dt){
    if(this.e.overlay.innerHTML)return;const p=this.prologue,speed=155,dx=(this.e.held("ArrowRight","d","D")?1:0)-(this.e.held("ArrowLeft","a","A")?1:0),dy=(this.e.held("ArrowDown","s","S")?1:0)-(this.e.held("ArrowUp","w","W")?1:0),length=Math.hypot(dx,dy)||1;
    p.vx+=(dx/length*speed-p.vx)*Math.min(1,dt*8);p.vy+=(dy/length*speed-p.vy)*Math.min(1,dt*8);p.x=Math.max(62,Math.min(835,p.x+p.vx*dt));const floor=450-(p.x-62)*.29;p.y=Math.max(floor-45,Math.min(472,p.y+p.vy*dt));if(p.y<floor-45)p.y=floor-45;p.elapsed+=dt;
    const near=Math.hypot(p.x-790,p.y-228)<85;if(near&&this.e.hit("Enter","z","Z"," ")){this.mode="cutscene";this.cutsceneDirector.start(this,"v9_ch0_intro",false)}
    if(this.e.hit("Escape","x","X"))this.e.window(`<h2>1511년 프롤로그를 건너뛸까요?</h2><p>이야기 상태와 첫 임무는 동일하게 적용됩니다.</p><div class="confirm">${this.e.button("계속 걷기","prologue-continue")}${this.e.button("건너뛰기","prologue-skip","primary")}</div>`,`center`)
  };
  proto.renderV9Prologue=function(){
    const e=this.e,c=e.ctx,p=this.prologue,t=performance.now()/1000,image=this.assets.get("cs9_beacon_night");e.clear("#07121d");if(image)c.drawImage(image,0,0,960,540);else{const sky=c.createLinearGradient(0,0,0,540);sky.addColorStop(0,"#111a2b");sky.addColorStop(.65,"#26394b");sky.addColorStop(1,"#07111b");c.fillStyle=sky;c.fillRect(0,0,960,540);c.fillStyle="#173b50";c.fillRect(0,390,960,150);for(let i=0;i<18;i++){c.fillStyle=i%3?"#24566c":"#92b7bd";c.fillRect((i*83+t*35)%1040-40,410+Math.sin(i+t)*26,70,3)}c.fillStyle="#4c443a";c.beginPath();c.moveTo(0,490);c.lineTo(870,195);c.lineTo(960,230);c.lineTo(960,540);c.lineTo(0,540);c.fill();c.fillStyle="#777064";c.fillRect(748,92,100,185);c.fillStyle="#c79a4b";c.fillRect(765,74,70,34)}
    c.fillStyle="rgba(2,8,14,.42)";c.fillRect(0,0,960,540);for(let i=0;i<80;i++){const x=(i*47+t*260)%1050-50,y=(i*83+t*410)%650-60;c.strokeStyle="rgba(190,218,225,.28)";c.beginPath();c.moveTo(x,y);c.lineTo(x-18,y+30);c.stroke()}
    this.art.person(e,p.x,p.y,2,false,p.elapsed,1.2,"orso",Math.hypot(p.vx,p.vy)>8);const near=Math.hypot(p.x-790,p.y-228)<85;e.text("1511년 · 성 루시아 등대",26,42,"#f0cc75","left",17);e.text("오르소를 조작해 등대의 권양기까지 가십시오",26,68,"#d3dfd7","left",13);if(near){c.fillStyle="rgba(3,17,23,.93)";c.fillRect(620,315,290,42);c.strokeStyle="#c49a4e";c.strokeRect(621,316,288,40);e.text("Enter/Z · 등대 권양기를 잡는다",765,342,"#fff0bd","center",14)}
  };
  proto.finishV9Prologue=function(){this.mode="town";this.s.flags.v9PrologueSeen=true;this.s.flags.cutsceneSeen=true;this.s.flags.metFather=true;this.s.flags.shipGranted=false;this.s.fleet[0].locked=true;this.s.town={x:19.5,y:8.4,dir:4};this.lastSafe={x:19.5,y:8.4};for(const id of["v9_ch0_intro","v9_ch0_turn"])if(!this.s.cutsceneState.seen.includes(id))this.s.cutsceneState.seen.push(id);this.spawnTownNpcs();this.campaignSystem.syncQuest(this.s);this.makeChapterCheckpoint(true);this.save();this.syncRegionMusic();this.e.toast("리스본 조선소에서 새벽까마귀를 인수하십시오")};

  proto.update=function(dt){if(this.mode==="prologue")return this.updateV9Prologue(dt);return oldUpdate.call(this,dt)};
  proto.render=function(){if(this.mode==="prologue"){this.help("방향키/WASD 이동 · Enter/Z 조사 · Esc/X 건너뛰기");this.renderV9Prologue();return}return oldRender.call(this)};

  proto.makeChapterCheckpoint=function(force=false){
    if(!this.s?.campaign)return;const id=this.s.campaign.chapterId,last=this.s.chapterCheckpoints?.at?.(-1);if(!force&&last?.chapterId===id)return;
    const snapshot=copy(this.s);delete snapshot.chapterCheckpoints;snapshot.mode=snapshot.mode==="cutscene"||snapshot.mode==="prologue"?"town":snapshot.mode;snapshot.cutsceneState.pending=[];
    this.s.chapterCheckpoints=(this.s.chapterCheckpoints||[]).filter(item=>item.chapterId!==id).slice(-1);this.s.chapterCheckpoints.push({chapterId:id,createdAt:`${this.s.year}.${this.s.month}.${this.s.day}`,state:snapshot})
  };
  proto.restoreChapterCheckpoint=function(){const cp=this.s.chapterCheckpoints?.at?.(-1);if(!cp)return this.e.toast("되돌릴 장 시작 기록이 없습니다");const slot=this.s.slot;this.s=copy(cp.state);this.s.slot=slot;this.s.chapterCheckpoints=[cp];this.mode=this.s.mode||"town";this.ensureExpansion();this.spawnTownNpcs();this.ensureSafePosition();this.e.close();this.save();this.e.toast(`${this.campaignSystem.chapter(this.s).title} 시작으로 돌아왔습니다`)};

  proto.progressCampaign=function(event){
    this.ensureExpansion();const side=this.companionQuestSystem.evaluate(this.s,event);if(side){if(side.rewardFragment)this.grantFragment(side.rewardFragment);this.save();this.e.toast(`동료 이야기 완료 · ${side.title}`)}
    const beforeChapter=this.s.campaign.chapterId,result=oldProgress.call(this,event);if(result&&beforeChapter!==this.s.campaign.chapterId)this.makeChapterCheckpoint();
    if(result){const next=this.campaignSystem.currentTask(this.s),hasQueued=this.s.cutsceneState.pending.length>0;if(next?.trigger?.type==="choice"&&!hasQueued&&!this.cutscene)this.showV9Choice(next.trigger.id)}
    return result||!!side
  };

  proto.showV9Choice=function(id){
    const data=HL.DATA.v9Choices[id],task=this.campaignSystem.currentTask(this.s);if(!data||task?.trigger?.type!=="choice"||task.trigger.id!==id)return false;
    this.e.window(`<div class="choice-warning"><small>중요한 선택</small><h1>${data.title}</h1><p>${data.prompt}</p></div><div class="v9-choice-list">${data.options.map((option,index)=>`<button class="v9-choice ${option.danger?"danger":""} ${index===0?"primary":""}" data-action="v9-choice:${id}:${option.id}"><strong>${option.label}</strong><small>${option.warning}</small></button>`).join("")}</div>`,`center wide story-choice`);return true
  };
  proto.applyV9Choice=function(id,value){
    this.ensureExpansion();const task=this.campaignSystem.currentTask(this.s);if(task?.trigger?.type!=="choice"||task.trigger.id!==id)return false;this.s.storyChoices[id]=value;const c=this.s.companions;
    if(id==="mira-identity"){c.mira.status="contact";c.mira.trust+=value==="protect"?2:0;if(value==="protect")this.s.cutsceneState.evidence.push("mira-protected")}
    if(id==="massawa-rescue"){this.grantFragment("tide-staff");if(value==="people"){c.aeron.status="aboard";c.aeron.trust+=2;addMate(this.s,{name:"아에론",sailing:39,battle:18,loyalty:86,skill:"astronavigation"})}else{c.aeron.alive=false;c.aeron.status="lost-at-massawa";removeMate(this.s,"아에론");this.s.campaign.log.unshift("마사와 폭풍 · 아에론이 순례선 구조 중 돌아오지 못했다.")}}
    if(id==="orso-confession"){if(value==="keep"){c.orso.status="aboard";c.orso.trust+=2}else{c.orso.status="departed";removeMate(this.s,"오르소 벤")}}
    if(id==="goa-medicine"){if(value==="harbor"){c.mira.trust++;this.s.crew.health=Math.min(100,(this.s.crew.health||70)+20);this.grantFragment("goa-remedy")}else{this.s.money+=800;this.s.relations["루시타 왕국"]=(this.s.relations["루시타 왕국"]||0)+8}}
    if(id==="damian-terms"){c.damian.status="aboard";c.damian.trust+=value==="witness"?2:1;addMate(this.s,{name:"데미안 팔코",sailing:value==="navigator"?46:38,battle:27,loyalty:62,skill:"twilight-route"})}
    if(id==="mira-trust"){c.mira.status="aboard";c.mira.trust+=value==="trust"?3:1;c.mira.romance=value==="trust";addMate(this.s,{name:"미라 소렐",sailing:25,battle:22,loyalty:value==="trust"?88:68,skill:"accounting"})}
    if(id==="bardo-alliance"){if(value==="ally"){c.bardo.status="aboard";c.bardo.trust+=2;addMate(this.s,{name:"바르도 카인",sailing:34,battle:43,loyalty:76,skill:"fleet-command"})}else c.bardo.status="departed"}
    if(id==="final-command"){
      if(c.orso.status==="departed"){c.orso.alive=false;c.orso.status="lost-in-channel"}
      if(c.bardo.status==="departed"){c.bardo.alive=false;c.bardo.status="lost-in-blockade"}
      if(value==="bardo-decoy"&&c.bardo.status==="aboard"){c.bardo.alive=false;c.bardo.status="fallen-in-battle";removeMate(this.s,"바르도 카인")}
      if(value==="orso-guide"&&c.orso.status==="aboard"){c.orso.alive=false;c.orso.status="fallen-guiding-channel";removeMate(this.s,"오르소 벤")}
      this.s.flags.finalFormation=value
    }
    if(id==="father-forgiveness")this.s.flags.fatherAnswer=value;
    if(id==="ending"){this.applyEnding(value);this.s.factions[value]=(this.s.factions[value]||0)+3}
    this.e.close();const result=this.progressCampaign({type:"choice",id});const scene=HL.DATA.storyCutscenes.find(cs=>cs.trigger===`choice:${id}`);if(scene)this.cutsceneDirector.enqueue(this.s,scene.id,"event");this.save();return result
  };

  proto.applyEnding=function(path){
    const interpreted=this.fragmentSystem.interpreted(this.s),complete=interpreted.length===12,survivors=Object.entries(this.s.companions).filter(([id,p])=>["orso","aeron","bardo"].includes(id)&&p.alive).map(([id])=>companionNames[id]);
    const title={crown:"왕실의 자오선",league:"열두 항구의 협약",free:"자유 항해자의 불빛"}[path],base={crown:"왕실 순찰이 회랑을 지키지만 일부 관측 기록은 국가 기밀로 남았습니다.",league:"열두 항구가 사본과 구조 비용을 나눴지만 작은 항구에는 사용료 논쟁이 남았습니다.",free:"해도와 구조 신호가 공개되어 자발적 구조망이 생겼고 해적 또한 새 길을 배웠습니다."}[path];
    let epilogue=base;if(path==="free"&&complete)epilogue="열두 조각의 증거와 희생자 명부가 모든 항구에 공개되었습니다. 항해자들은 국가를 넘는 구조망을 만들었고, 어느 한 세력도 항로를 다시 지울 수 없게 되었습니다.";
    if(this.s.companions.mira.romance&&this.s.companions.mira.trust>=3)epilogue+=" 미라는 다음 항해를 위한 빈 장부를 새벽까마귀의 해도 옆에 두었습니다.";
    this.s.endingState={path,title,text:base,epilogue,variant:complete?"complete-truth":"eight-fragments",survivors,completedAt:`${this.s.year}.${this.s.month}.${this.s.day}`,fatherAnswer:this.s.flags.fatherAnswer||"distance"};
    if(path==="crown")for(const fleet of this.s.seaFleets.filter(f=>f.kind==="pirate"))fleet.strength*=.9;if(path==="league")this.s.flags.marketLeagueBonus=true;if(path==="free")this.s.flags.publicChart=true
  };

  proto.openV9Challenge=function(id){
    if(id==="chart-assembly"){this.openFragmentBoard();this.e.toast("필수 해도편 8개를 올바른 자리와 방향에 맞추십시오");return}
    const data=HL.DATA.fragmentChallenges[id];if(!data)return;this.v9Challenge={id,index:0,correct:0};this.renderV9Challenge()
  };
  proto.renderV9Challenge=function(message=""){
    const state=this.v9Challenge,data=HL.DATA.fragmentChallenges[state.id],q=data.questions[state.index];this.e.window(`<div class="puzzle-head"><small>황혼 해도편 조사</small><h1>${data.title}</h1><p>${state.index?`${state.index+1} / ${data.questions.length}`:data.intro}</p></div><section class="puzzle-question"><h2>${q.text}</h2>${message?`<p class="puzzle-feedback">${message}</p>`:""}<div class="v9-choice-list">${q.answers.map((answer,index)=>this.e.button(answer,`v9-puzzle:${index}`,index===0?"primary":"")).join("")}</div><div class="toolbar right">${this.e.button("동료에게 힌트를 묻는다","v9-puzzle-hint")}${this.e.button("항해 일지","journal")}</div></section>`,"center wide fragment-puzzle")
  };
  proto.answerV9Challenge=function(index){const state=this.v9Challenge,data=HL.DATA.fragmentChallenges[state.id],q=data.questions[state.index];if(index!==q.correct)return this.renderV9Challenge(`그 배열로는 기록이 이어지지 않습니다. ${q.hint}`);state.correct++;state.index++;if(state.index<data.questions.length)return this.renderV9Challenge("기록 한 줄이 맞았습니다.");this.e.close();const id=state.id;this.v9Challenge=null;this.progressCampaign({type:"challenge",id});this.save()};

  proto.openJournal=function(){
    this.ensureExpansion();const info=this.campaignSystem.checklist(this.s),task=info.task,rec=info.recommendation,chapterIndex=HL.DATA.campaign.chapters.findIndex(c=>c.id===info.chapter.id),history=this.s.campaign.log.slice(0,5),available=this.companionQuestSystem.available(this.s),active=this.companionQuestSystem.data(this.s.sideQuests.active),owned=this.s.fragmentBoard.owned.length,interpreted=this.fragmentSystem.interpreted(this.s).length,companions=Object.entries(this.s.companions).filter(([id])=>id!=="damian").map(([id,p])=>`<span class="companion-state ${p.alive?"":"lost"}"><b>${companionNames[id]}</b>${p.alive?`${p.status} · 신뢰 ${p.trust}`:"사망"}</span>`).join("");
    this.e.window(`<div class="journal-head"><div><small>리안 팔코의 항해 일지</small><h1>${info.chapter.title}</h1></div><strong>${chapterIndex+1} / 8</strong></div><section class="objective-card"><small>현재 해야 할 일</small><h2>${task?.title||"자유 항해"}</h2><p>${task?.description||this.s.endingState?.epilogue||"두 번째 일몰 항로의 기록을 완성했습니다."}</p></section><div class="journal-grid"><section><h3>완료 조건</h3>${info.checks.length?info.checks.map(c=>`<p class="check ${c.done?"done":""}">${c.done?"✓":"□"} ${c.text}</p>`).join(""):"<p>표시된 장소나 인물을 조사하십시오.</p>"}<p>해도편 ${owned}/12 · 해석 ${interpreted}/12</p></section><section><h3>항해 준비</h3><p>거리 약 ${rec.distance}° · 예상 ${rec.days}일 · 위험도 ${rec.danger}</p><p>권장 식량 ${rec.food} · 물 ${rec.water} · 의약품 ${rec.medicine}</p><p>${active?`진행 중 · ${active.title}<br>${active.description}`:"진행 중인 동료 이야기가 없습니다."}</p></section><section><h3>최근 기록</h3>${history.length?history.map(x=>`<p>${x}</p>`).join(""):"<p>아직 기록이 없습니다.</p>"}</section></div><div class="companion-strip">${companions}</div><section class="sidequest-list"><h3>동료 이야기</h3>${available.length?available.map(q=>`<button data-action="v9-sidequest:${q.id}" ${active&&active.id!==q.id?"disabled":""}><strong>${q.title}</strong><small>${q.description}</small></button>`).join(""):"<p>현재 시작할 수 있는 동료 이야기가 없습니다.</p>"}</section><div class="toolbar right">${this.e.button("사건 회상","cutscene-gallery")}${this.e.button("황혼 해도편","fragment-board","primary")}${this.e.button("세계지도 · M","world-map")}${this.e.button("장 시작으로","v9-restore")}${this.e.button("저장","manual-save")}${this.e.button("닫기","close")}</div>`,"center wide journal v9-journal")
  };

  for(const method of["marketMenu","harborMenu","shipyardMenu"]){const old=proto[method];proto[method]=function(){this.ensureExpansion();const task=this.campaignSystem.currentTask(this.s);if(task?.trigger?.type==="challenge"&&task.port===this.s.currentPort&&task.facility===method.replace("Menu","").replace("harbor","harbor").replace("shipyard","shipyard").replace("market","market"))return this.openV9Challenge(task.trigger.id);if(this.progressCampaign({type:"facility",id:method.replace("Menu",""),port:this.s.currentPort}))return;return old.call(this)}}
  for(const method of["guildMenu","innMenu","mansionStory"]){const old=proto[method];proto[method]=function(){this.ensureExpansion();const task=this.campaignSystem.currentTask(this.s),facility=method==="guildMenu"?"guild":method==="innMenu"?"inn":"mansion";if(task?.trigger?.type==="challenge"&&task.port===this.s.currentPort&&task.facility===facility)return this.openV9Challenge(task.trigger.id);return old.call(this)}}

  proto.setSail=function(){const port=this.s?.currentPort,task=this.campaignSystem?.currentTask(this.s),result=oldSetSail.call(this);if(port==="nagasaki"&&task?.id==="v9-depart-nagasaki"){this.progressCampaign({type:"action",id:"depart-nagasaki"});const queued=this.s.cutsceneState.pending.find(item=>item.id==="v9_ch4_intro");if(queued)queued.reason="dock"}return result};
  proto.searchSea=function(){this.ensureExpansion();const side=this.companionQuestSystem.data(this.s.sideQuests.active);if(side?.trigger.type==="search"){const completed=this.companionQuestSystem.evaluate(this.s,{type:"search",lon:this.s.sea.lon,lat:this.s.sea.lat});if(completed){if(completed.rewardFragment)this.grantFragment(completed.rewardFragment);this.save();return this.e.toast(`동료 이야기 완료 · ${completed.title}`)}}return oldSearch.call(this)};

  proto.dispatchAction=function(action,button){
    if(action==="prologue-continue"){this.e.close();return}if(action==="prologue-skip"){this.e.close();return this.finishV9Prologue()}
    if(action.startsWith("v9-choice:")){const[,id,value]=action.split(":");return this.applyV9Choice(id,value)}
    if(action.startsWith("v9-sidequest:")){const id=action.split(":")[1];if(this.companionQuestSystem.start(this.s,id)){this.save();this.e.close();return this.e.toast(`동료 이야기 시작 · ${this.companionQuestSystem.data(id).title}`)}}
    if(action==="v9-restore"){this.e.window(`<h2>장 시작으로 돌아갈까요?</h2><p>현재 장에서 얻은 진행과 저장은 장 시작 상태로 되돌아갑니다.</p><div class="confirm">${this.e.button("취소","journal")}${this.e.button("되돌리기","v9-restore-confirm","danger")}</div>`,`center`);return}
    if(action==="v9-restore-confirm")return this.restoreChapterCheckpoint();
    if(action.startsWith("v9-puzzle:"))return this.answerV9Challenge(+action.split(":")[1]);if(action==="v9-puzzle-hint")return this.renderV9Challenge(HL.DATA.fragmentChallenges[this.v9Challenge.id].questions[this.v9Challenge.index].hint);
    const result=oldDispatch.call(this,action,button);
    if(["fragment-cell","fragment-rotate"].some(prefix=>action.startsWith(prefix))){const task=this.campaignSystem.currentTask(this.s),correct=this.fragmentSystem.interpreted(this.s).filter(f=>f.required).length;if(task?.id==="v9-chart-assembly"&&correct>=8){this.e.close();this.progressCampaign({type:"challenge",id:"chart-assembly"})}}
    return result
  };

  const oldCutsceneArt=HL.Art.prototype.cutscene;
  HL.Art.prototype.renderV9Fallback=function(game,data){const e=game.e,c=e.ctx,t=performance.now()/1000,key=data.background;e.clear("#07151d");const g=c.createLinearGradient(0,0,0,540);g.addColorStop(0,key.includes("storm")||key.includes("beacon")?"#101928":"#254a54");g.addColorStop(1,"#071117");c.fillStyle=g;c.fillRect(0,0,960,540);c.fillStyle="#173e50";for(let i=0;i<14;i++){c.fillRect(i*82-30,350+Math.sin(i+t)*16,72,4)}if(key.includes("beacon")||key.includes("meridian")){c.fillStyle="#5e5548";c.fillRect(690,90,115,285);c.fillStyle="#d3a44e";c.fillRect(708,68,78,42);c.fillStyle="rgba(245,209,102,.16)";c.beginPath();c.moveTo(747,90);c.lineTo(960,170);c.lineTo(960,10);c.fill()}else{c.fillStyle="#47352b";c.fillRect(90,205,780,210);c.fillStyle="#8d744e";c.fillRect(130,245,700,12)}return true};
  HL.Art.prototype.cutscene=function(game){
    const data=game.cutsceneDirector?.current(game),current=game.cutsceneDirector?.currentStep(game);if(!data||!data.id.startsWith("v9_"))return oldCutsceneArt.call(this,game);const e=game.e,c=e.ctx,image=this.assets?.get(current.background||data.background),elapsed=game.cutscene.elapsed||0;if(image)c.drawImage(image,0,0,960,540);else this.renderV9Fallback(game,data);
    if(data.kind==="ingame"){const ids=["rian",current.speaker.includes("미라")?"mira":current.speaker.includes("오르소")?"orso":current.speaker.includes("바르도")?"vardo":"citizen"];this.person(e,380,360,2,true,elapsed,.95,ids[0],false);this.person(e,580,360,6,false,elapsed,.95,ids[1],false)}
    const shade=c.createLinearGradient(0,170,0,540);shade.addColorStop(0,"rgba(2,10,14,0)");shade.addColorStop(.58,"rgba(2,10,14,.46)");shade.addColorStop(1,"rgba(2,10,14,.96)");c.fillStyle=shade;c.fillRect(0,140,960,400);e.text(`제${data.chapter+1}장 · ${data.title}`,28,52,"#f0cc75","left",15);c.fillStyle="rgba(3,17,23,.96)";c.fillRect(42,370,876,144);c.strokeStyle="#ba914b";c.lineWidth=2;c.strokeRect(43,371,874,142);e.text(current.speaker,68,405,"#edbc5f","left",19);const visible=game.cutscene.reveal?current.text:current.text.slice(0,Math.floor(elapsed*30));this.wrapText(e,visible,68,440,792,24,"#f5e5bb",16);e.text(`${game.cutscene.index+1} / ${data.steps.length}`,890,405,"#a9bbb0","right",12);e.text("Enter/Z 계속 · Esc/X 건너뛰기",890,530,"#cbbd90","right",11)
  };
})();
