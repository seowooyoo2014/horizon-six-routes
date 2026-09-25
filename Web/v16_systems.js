window.HL=window.HL||{};
(function(){
  "use strict";
  const copy=v=>JSON.parse(JSON.stringify(v));
  const captain=id=>HL.DATA.captainsV16.find(c=>c.id===id)||HL.DATA.captainsV16[0];
  const campaignFor=state=>HL.DATA.campaignsV16[state?.campaignId];
  const safeTown=(portId)=>{const map=HL.WorldData.townMapFor(portId);HL.DATA.townMaps[portId]=map;return map};

  HL.migrateStateV16=function(prior){
    const source=copy(prior||HL.Game.freshState()),isV16=!!source.captainId&&!!HL.DATA.campaignsV16[source.campaignId];
    const state=source.version===15?HL.migrateStateV15(source):source;
    state.version=16;state.graphicsVersion=16;state.v16={migratedAt:Date.now(),logicalResolution:"480x270",...(state.v16||{})};
    if(!isV16){state.captainId="rian";state.campaignId="legacy-rian-v15";state.legacyCampaign=true}
    state.crossEncounters=state.crossEncounters||{seen:[],choices:{}};
    state.playTime=state.playTime||0;
    return state
  };

  const engine=HL.Engine.prototype;
  engine.v15SlotKey=i=>`horizon-ledger-v15-slot-${i}`;
  engine.slotKey=i=>`horizon-ledger-v16-slot-${i}`;
  engine.loadSlot=function(i){try{const state=JSON.parse(localStorage.getItem(this.slotKey(i)));return state?.version===16?state:null}catch{return null}};
  engine.migrateOld=function(i){
    if(this.loadSlot(i))return;
    try{
      const keys=[this.v15SlotKey(i),`horizon-ledger-v14-slot-${i}`,`horizon-ledger-v13-slot-${i}`,`horizon-ledger-v12-slot-${i}`,`horizon-ledger-v11-slot-${i}`,`horizon-ledger-v10-slot-${i}`,`horizon-ledger-v9-slot-${i}`];
      const old=keys.map(k=>JSON.parse(localStorage.getItem(k)||"null")).find(Boolean);
      if(old)this.saveSlot(i,HL.migrateStateV16(old))
    }catch(error){console.warn("V16 저장 변환 실패",error)}
  };
  engine.deleteSlot=function(i){localStorage.removeItem(this.slotKey(i))};

  const game=HL.Game.prototype,oldFresh=HL.Game.freshState,oldEnsure=game.ensureExpansion,oldResume=game.resume,oldUpdate=game.update,oldRender=game.render,oldDispatch=game.dispatchAction,oldCompleteDock=game.completeDock,oldProgress=game.progressCampaign,oldLodge=game.lodgeMenu,oldMansion=game.mansionStory,oldOwnerName=game.ownerName;
  const oldCampaign={ensure:HL.CampaignSystem.prototype.ensure,chapter:HL.CampaignSystem.prototype.chapter,currentTask:HL.CampaignSystem.prototype.currentTask,recommendation:HL.CampaignSystem.prototype.recommendation,matches:HL.CampaignSystem.prototype.matches,evaluate:HL.CampaignSystem.prototype.evaluate,syncQuest:HL.CampaignSystem.prototype.syncQuest,checklist:HL.CampaignSystem.prototype.checklist};

  HL.Game.freshState=function(){const state=oldFresh.call(this);state.version=16;state.graphicsVersion=16;state.v16={logicalResolution:"480x270"};state.crossEncounters={seen:[],choices:{}};state.playTime=0;return state};

  HL.applyCaptainV16=function(state,id){
    const c=captain(id),port=HL.DATA.ports[c.startPort],map=safeTown(c.startPort),shipData=HL.DATA.ships[c.ship]||HL.DATA.ships.caravel;
    state.captainId=c.id;state.captain=c.id;state.captainName=c.name;state.campaignId=c.campaignId;state.legacyCampaign=false;
    state.currentPort=c.startPort;state.lastPort=c.startPort;state.town={x:map.spawn[0],y:map.spawn[1],dir:4};state.interior=null;state.mode="v16-prologue";
    state.money=c.money;state.knownPorts=[c.startPort];state.fame={trade:0,battle:0,adventure:0};state.mates=[];state.flags={...(state.flags||{}),cutsceneSeen:false,shipGranted:true,campaignComplete:false};
    state.inventory={...(state.inventory||{}),telescope:c.id==="ines",sextant:c.id==="ines",chart:c.id==="ines",sword:["kemal","anne"].includes(c.id)};
    state.fleet=[{id:`${c.id}-flagship`,name:c.shipName,type:c.ship,hull:shipData.hull||100,crew:c.crew,food:18,water:18,lumber:3,guns:c.id==="anne"?8:c.id==="kemal"?3:2,sail:1,figurehead:0,locked:false,sailCondition:100,rudder:100,equipment:{}}];
    state.sea={...(state.sea||{}),lon:port.lon,lat:port.lat,x:port.lon,y:port.lat,anchor:true,heading:2,autoTarget:null};
    state.campaign={chapterId:HL.DATA.campaignsV16[c.campaignId].chapters[0].id,taskIndex:0,completed:[],log:[],startedDay:state.day||1};
    state.campaignSpecial={choices:{},relationships:{},chapterCheckpoints:[],encounters:[]};state.crossEncounters={seen:[],choices:{}};
    state.prologueV16={index:0,reveal:0,completed:false};state.quest={stage:0,title:HL.DATA.campaignsV16[c.campaignId].chapters[0].title,objective:HL.DATA.campaignsV16[c.campaignId].chapters[0].tasks[0].description};
    return state
  };

  game.showFiles=function(){
    this.mode="file";this.s=null;this.e.hud.innerHTML="";for(let i=1;i<=3;i++)this.e.migrateOld(i);
    const slots=[1,2,3].map(i=>{const s=this.e.loadSlot(i),c=s?.captainId==="rian"?{name:"리안의 항해 기록"}:captain(s?.captainId);return`<article class="slot v16-slot"><strong>항해 파일 ${i}</strong><small>${s?`${c.name}<br>${HL.DATA.ports[s.currentPort]?.name||"해상"} · ${s.quest?.title||"항해 기록"}<br>${s.savedAt||"기록됨"}`:"새로운 항로를 기다리고 있습니다."}</small><div class="actions">${s?this.e.button("이어하기",`continue:${i}`,"primary")+this.e.button("새로 시작",`new:${i}`)+this.e.button("삭제",`delete:${i}`,"danger"):this.e.button("새 항해",`new:${i}`,"primary")}</div></article>`}).join("");
    this.e.window(`<div class="file-title v16-title"><small>HORIZON: SIX ROUTES</small><h1>수평선의 여섯 항로</h1><p>서로 다른 이유로 바다에 나선 여섯 사람의 기록</p></div><div class="slots">${slots}</div><div class="toolbar right">${this.e.button("소리 설정","settings")}</div>`,`center wide v16-file`)
  };

  game.showScenarios=function(slot,selected="kemal"){
    this.e.selectedSlot=slot;this.e.selectedCaptain=selected;this.mode="scenario";const chosen=captain(selected);
    const cards=HL.DATA.captainsV16.map(c=>`<button class="captain v16-captain ${c.id===selected?"selected":""}" data-action="captain-preview:${c.id}"><span class="captain-sigil" style="--captain:${c.color}">${c.name.slice(0,1)}</span><strong>${c.name}</strong><small>${c.nation}<br>${c.role}</small></button>`).join("");
    const bars=Object.entries(chosen.stats).map(([key,value])=>`<div class="stat-line"><span>${{sailing:"항해",battle:"전투",knowledge:"지식",intuition:"직감",leadership:"통솔",charm:"매력",luck:"운"}[key]}</span><i><b style="width:${value}%"></b></i><em>${value}</em></div>`).join("");
    this.e.window(`<header class="scenario-head"><div><small>여섯 항로 중 하나를 선택하십시오</small><h1>선장 선택</h1></div><span>파일 ${slot}</span></header><div class="v16-scenario"><div class="v16-captain-grid">${cards}</div><section class="captain-detail" style="--captain:${chosen.color}"><div><small>${chosen.nation}</small><h2>${chosen.name}</h2><p>${chosen.hook}</p><strong>${chosen.specialty}</strong></div><div class="captain-stats">${bars}</div><dl><div><dt>시작항</dt><dd>${HL.DATA.ports[chosen.startPort].name}</dd></div><div><dt>자금</dt><dd>${chosen.money.toLocaleString()} 금</dd></div><div><dt>기함</dt><dd>${chosen.shipName}</dd></div></dl></section></div><div class="toolbar right">${this.e.button("파일 선택","files")}${this.e.button(`${chosen.name}로 시작`,`captain-start:${chosen.id}`,"primary")}</div>`,`center wide v16-select`)
  };

  game.newGame=function(id=this.e.selectedCaptain||"kemal"){
    this.s=HL.applyCaptainV16(HL.Game.freshState(),id);this.s.slot=this.e.selectedSlot;this.mode="v16-prologue";this.spawnTownNpcs();this.e.close();this.save()
  };

  game.resume=function(i){
    const state=this.e.loadSlot(i);if(!state)return this.showFiles();
    if(state.legacyCampaign)return oldResume.call(this,i);
    this.s=HL.migrateStateV16(state);this.s.slot=i;this.mode=this.s.mode||"town";if(this.mode==="v16-prologue"&&!this.s.prologueV16)this.mode="town";
    this.ensureExpansion();this.spawnTownNpcs();this.e.close();this.ensureSafePosition();this.e.playMusic(this.mode==="sea"?"sea":"port")
  };

  game.ensureExpansion=function(){
    oldEnsure.call(this);if(!this.s)return;
    this.s.version=16;this.s.graphicsVersion=16;this.s.v16={logicalResolution:"480x270",...(this.s.v16||{})};
    if(campaignFor(this.s)){this.s.legacyCampaign=false;this.s.campaignId=this.s.campaignId;HL.CampaignSystem.prototype.ensure.call(this.campaignSystem,this.s)}
  };

  HL.CampaignSystem.prototype.ensure=function(state){
    const data=campaignFor(state);if(!data)return oldCampaign.ensure.call(this,state);
    const valid=data.chapters.some(ch=>ch.id===state.campaign?.chapterId);if(!valid)state.campaign={chapterId:data.chapters[0].id,taskIndex:0,completed:state.campaign?.completed||[],log:state.campaign?.log||[],startedDay:state.day||1};
    state.campaign.completed=Array.from(new Set(state.campaign.completed||[]));state.campaign.log=state.campaign.log||[];this.syncQuest(state);return state.campaign
  };
  HL.CampaignSystem.prototype.chapter=function(state){const data=campaignFor(state);if(!data)return oldCampaign.chapter.call(this,state);this.ensure(state);return data.chapters.find(ch=>ch.id===state.campaign.chapterId)||data.chapters[0]};
  HL.CampaignSystem.prototype.currentTask=function(state){const data=campaignFor(state);if(!data)return oldCampaign.currentTask.call(this,state);const ch=this.chapter(state);return ch.tasks[state.campaign.taskIndex]||null};
  HL.CampaignSystem.prototype.matches=function(state,event,task){if(!campaignFor(state))return oldCampaign.matches.call(this,state,event,task);const t=task?.trigger;if(!t||t.type!==event.type)return false;if(t.port&&t.port!==event.port)return false;if(t.id&&t.id!==event.id)return false;return true};
  HL.CampaignSystem.prototype.syncQuest=function(state){
    const data=campaignFor(state);if(!data)return oldCampaign.syncQuest.call(this,state);const ch=data.chapters.find(c=>c.id===state.campaign.chapterId),t=ch?.tasks[state.campaign.taskIndex];state.quest=state.quest||{};state.quest.title=ch?.title||data.title;state.quest.objective=t?.description||"이 항해의 기록을 마쳤습니다. 자유롭게 세계를 항해하십시오."
  };
  HL.CampaignSystem.prototype.evaluate=function(state,event){
    if(!campaignFor(state))return oldCampaign.evaluate.call(this,state,event);this.ensure(state);const data=campaignFor(state),ch=this.chapter(state),t=this.currentTask(state);if(!t||!this.matches(state,event,t))return false;
    state.campaign.completed.push(t.id);state.campaign.log.unshift(`${state.year}.${state.month}.${state.day} · ${t.title}`);state.campaign.log=state.campaign.log.slice(0,60);state.fame.adventure+=(t.rewardFame||0);state.campaign.taskIndex++;
    let chapterChanged=false;if(state.campaign.taskIndex>=ch.tasks.length){const index=data.chapters.indexOf(ch),next=data.chapters[index+1];if(next){state.campaign.chapterId=next.id;state.campaign.taskIndex=0;chapterChanged=true}else{state.flags.campaignComplete=true;state.campaign.taskIndex=ch.tasks.length}}
    this.syncQuest(state);return{completed:true,task:t,chapter:ch,chapterChanged}
  };
  HL.CampaignSystem.prototype.recommendation=function(state,task=this.currentTask(state)){if(!campaignFor(state))return oldCampaign.recommendation.call(this,state,task);return oldCampaign.recommendation.call(this,state,task)};
  HL.CampaignSystem.prototype.checklist=function(state){
    if(!campaignFor(state))return oldCampaign.checklist.call(this,state);const ch=this.chapter(state),t=this.currentTask(state),r=this.recommendation(state,t),checks=[];
    if(t?.port)checks.push({done:state.currentPort===t.port&&state.mode!=="sea",text:`목적지 · ${HL.DATA.ports[t.port]?.name||t.port}${t.facility?` · ${this.facilityName(t.facility)}`:""}`});
    return{chapter:ch,task:t,recommendation:r,checks}
  };

  game.progressCampaign=function(event){
    if(!campaignFor(this.s))return oldProgress.call(this,event);
    const result=this.campaignSystem.evaluate(this.s,event);if(!result)return false;
    const choice=campaignFor(this.s).choices?.find(c=>c.afterTask===result.task.id);if(choice)this.pendingV16Choice=choice;
    this.save();this.e.toast(`목표 완료 · ${result.task.title}`);
    const ci=campaignFor(this.s).chapters.indexOf(result.chapter),scene=result.chapter.cutscenes[result.chapterChanged||this.s.flags.campaignComplete?2:1];
    this.v16SceneQueue=this.v16SceneQueue||[];if(result.chapterChanged){const next=campaignFor(this.s).chapters[ci+1];if(next)this.v16SceneQueue.push(next.cutscenes[0])}this.startV16Scene(scene);return true
  };

  game.startV16Scene=function(scene,replay=false){if(!scene)return;this.v16Scene={scene,index:0,replay,returnMode:this.mode==="v16-cutscene"?"town":this.mode};this.mode="v16-cutscene";this.e.close()};
  game.finishV16Scene=function(){const returnMode=this.v16Scene?.returnMode||"town";this.v16Scene=null;this.mode=returnMode;if(this.pendingV16Choice){const choice=this.pendingV16Choice;this.pendingV16Choice=null;return this.showV16Choice(choice)}const queued=this.v16SceneQueue?.shift();if(queued)return this.startV16Scene(queued);this.save();if(this.s.flags.campaignComplete&&!this.s.campaignSpecial.endingShown)this.showV16Ending()};
  game.showV16Choice=function(choice){this.activeV16Choice=choice;this.e.window(`<div class="choice-warning"><small>항해의 선택</small><h1>${choice.title}</h1><p>${choice.prompt}</p></div><div class="v9-choice-list">${choice.options.map((o,i)=>`<button class="v9-choice ${i===0?"primary":""}" data-action="v16-choice:${choice.id}:${o.id}"><strong>${o.label}</strong><small>${i===0?"현실적인 판단을 남깁니다.":"사람 사이의 연대를 남깁니다."}</small></button>`).join("")}</div>`,`center wide story-choice`)};
  game.applyV16Choice=function(id,value){const data=campaignFor(this.s),choice=data?.choices?.find(c=>c.id===id),option=choice?.options.find(o=>o.id===value);if(!option)return;this.s.campaignSpecial.choices[id]=value;for(const[k,v]of Object.entries(option.effect||{}))this.s.campaignSpecial.relationships[k]=(this.s.campaignSpecial.relationships[k]||0)+v;this.activeV16Choice=null;this.e.close();this.save();const queued=this.v16SceneQueue?.shift();if(queued)this.startV16Scene(queued)};
  game.showV16Ending=function(){const c=captain(this.s.captainId),solidarity=this.s.campaignSpecial.relationships.solidarity||0,encounters=this.s.crossEncounters.seen.length;this.s.campaignSpecial.endingShown=true;const epilogue={kemal:"레일라는 살아 돌아왔고, 두 사람은 실종 선원의 이름과 마지막 목격항을 누구나 찾을 수 있는 기록소에 남겼다.",ines:"이네스의 지도에는 안전한 길뿐 아니라 실패한 측량과 위험한 해역까지 기록되었다.",duarte:"두아르트는 전설의 왕국 대신 실제 나라와 안내인의 이름을 가지고 귀환했다.",matteo:"위조 채무는 무효가 되었고, 발견물은 가격표와 출처를 함께 단 항해 박물관에 놓였다.",anne:"앤은 국새 없는 명령을 공개하고 전투선보다 구조선이 먼저 움직이는 독립 함대를 세웠다.",marieke:"마리커는 최고 부호가 되었지만 장부의 마지막 줄에는 공동 보험과 비상 곡물 창고의 몫을 남겼다."}[c.id];this.save();this.e.window(`<small>항해 완료</small><h1>${campaignFor(this.s).title}</h1><p>${epilogue}</p><div class="status-grid"><div class="status-cell"><small>다른 항해자와의 조우</small>${encounters} / 5</div><div class="status-cell"><small>선택의 흔적</small>${solidarity>=2?"연대와 구조":"현실과 책임"}</div></div><p>이 저장 파일에서는 세계를 계속 자유롭게 항해할 수 있습니다.</p><div class="toolbar right">${this.e.button("항해 계속","close","primary")}${this.e.button("파일 선택","files")}</div>`,`center wide v16-ending`)};

  game.startV16Prologue=function(){this.mode="v16-prologue";this.s.prologueV16=this.s.prologueV16||{index:0,reveal:0,completed:false};this.e.close()};
  game.finishV16Prologue=function(){const c=HL.DATA.campaignsV16[this.s.campaignId],scene=c.chapters[0].cutscenes[0];this.s.prologueV16.completed=true;this.s.flags.cutsceneSeen=true;this.mode="town";this.s.mode="town";this.save();this.startV16Scene(scene)};

  game.update=function(dt){
    if(this.s?.captainId&&campaignFor(this.s))this.s.playTime=(this.s.playTime||0)+dt;
    if(this.mode==="v16-prologue"){
      if(this.e.hit("Enter","z","Z"," ")){const p=this.s.prologueV16,c=captain(this.s.captainId);if(p.index<c.prologue.length-1){p.index++;p.reveal=0}else this.finishV16Prologue()}
      else if(this.e.hit("Escape","x","X"))this.finishV16Prologue();return
    }
    if(this.mode==="v16-cutscene"){
      if(this.e.hit("Enter","z","Z"," ")){const v=this.v16Scene;if(v.index<v.scene.steps.length-1)v.index++;else this.finishV16Scene()}
      else if(this.e.hit("Escape","x","X"))this.finishV16Scene();return
    }
    return oldUpdate.call(this,dt)
  };
  game.render=function(){if(this.mode==="v16-prologue")return this.art.v16Prologue(this);if(this.mode==="v16-cutscene")return this.art.v16Cutscene(this);return oldRender.call(this)};

  game.openV16Journal=function(){
    const info=this.campaignSystem.checklist(this.s),data=campaignFor(this.s),chIndex=data.chapters.indexOf(info.chapter),task=info.task,rec=info.recommendation,c=captain(this.s.captainId),seen=this.s.crossEncounters?.seen?.length||0;
    this.e.window(`<header class="journal-head"><div><small>${c.name}의 항해 일지</small><h1>${info.chapter.title}</h1></div><strong>${chIndex+1} / 6</strong></header><section class="objective-card"><small>지금 할 일</small><h2>${task?.title||"자유 항해"}</h2><p>${task?.description||"주인공의 항해를 마쳤습니다."}</p></section><div class="journal-grid"><section><h3>가는 곳</h3><p>${task?`${HL.DATA.ports[task.port]?.name||task.port} · ${this.campaignSystem.facilityName(task.facility)}`:"정해진 목적지 없음"}</p><p>완료 조건: ${task?.title||"캠페인 완료"}</p></section><section><h3>필요한 준비</h3><p>예상 ${rec.days}일 · 식량 ${rec.food} · 물 ${rec.water}</p><p>위험도 ${rec.danger} · 의약품 ${rec.medicine}</p></section><section><h3>다른 항해자</h3><p>교차 조우 ${seen} / 5</p><p>필수 이야기를 방해하지 않는 항구 사건으로 만납니다.</p></section></div><div class="toolbar right">${this.e.button("세계지도 · M","world-map")}${this.e.button("저장","manual-save")}${this.e.button("닫기","close","primary")}</div>`,`center wide journal v16-journal`)
  };

  game.ownerName=function(id){if(!campaignFor(this.s))return oldOwnerName.call(this,id);return{market:"시장 상인",inn:"여관 주인",shipyard:"조선공",guild:"항해자 길드장",lodge:"숙소 관리인",harbor:"항만 관리인",mansion:"도시 의회 서기관"}[id]||id};
  game.lodgeMenu=function(){if(!campaignFor(this.s))return oldLodge.call(this);const c=captain(this.s.captainId),ship=this.s.fleet[0];this.e.window(`<h1>${c.name}</h1><p>${c.role}</p><div class="status-grid"><div class="status-cell"><small>특기</small>${c.specialty}</div><div class="status-cell"><small>명성</small>교역 ${this.s.fame.trade} · 탐험 ${this.s.fame.adventure}</div><div class="status-cell"><small>기함</small>${ship.name} · 선체 ${ship.hull}</div><div class="status-cell"><small>현재 항로</small>${this.s.quest.title}</div></div><div class="toolbar">${this.e.button("숙박 · 20","rest")}${this.e.button("끝내기","close")}</div>`,`facility-panel`)};
  game.mansionStory=function(){if(!campaignFor(this.s))return oldMansion.call(this);if(this.progressCampaign({type:"facility",id:"mansion",port:this.s.currentPort}))return;this.e.dialogue("도시 의회 서기관",`${captain(this.s.captainId).name} 선장, 현재 목적은 항해 일지에 기록되어 있습니다. 필요한 서류가 생기면 이곳에서 확인하십시오.`,[{label:"확인",action:"close"}])};

  game.tryV16Encounter=function(portId){
    if(!campaignFor(this.s))return false;const seen=this.s.crossEncounters.seen,candidates=HL.DATA.crossEncountersV16.filter(e=>e.captains.includes(this.s.captainId)&&!seen.includes(e.id));let event=candidates.find(e=>e.port===portId);
    const chapterIndex=campaignFor(this.s).chapters.findIndex(ch=>ch.id===this.s.campaign.chapterId)+1;if(!event)event=candidates.find(e=>chapterIndex>=e.fallbackChapter);if(!event)return false;
    seen.push(event.id);this.s.money+=event.reward.money;this.s.fame.adventure+=event.reward.fame;this.s.campaignSpecial.encounters.push(event.id);this.save();const other=captain(event.captains.find(id=>id!==this.s.captainId));
    this.e.dialogue(other.name,`${event.title}. ${event.summary} 두 선장은 다시 바다에서 만날 것을 약속했다.`,[{label:"항해 기록에 남긴다",action:"close"}]);return true
  };
  if(oldCompleteDock)game.completeDock=function(id){const result=oldCompleteDock.call(this,id);if(campaignFor(this.s)&&this.mode==="town"&&!this.e.overlay.innerHTML)this.tryV16Encounter(id);return result};

  game.dispatchAction=function(action,button){
    if(action.startsWith("captain-preview:")){return this.showScenarios(this.e.selectedSlot,action.slice(16))}
    if(action.startsWith("captain-start:")){return this.newGame(action.slice(14))}
    if(action==="v16-prologue-next"){
      const p=this.s.prologueV16,c=captain(this.s.captainId);if(p.index<c.prologue.length-1){p.index++;p.reveal=0}else this.finishV16Prologue();return
    }
    if(action==="v16-prologue-skip")return this.finishV16Prologue();
    if(action==="v16-scene-next"){const v=this.v16Scene;if(v.index<v.scene.steps.length-1)v.index++;else this.finishV16Scene();return}
    if(action==="v16-scene-skip")return this.finishV16Scene();
    if(action.startsWith("v16-choice:")){const[,id,value]=action.split(":");return this.applyV16Choice(id,value)}
    if(action==="journal"&&campaignFor(this.s))return this.openV16Journal();
    return oldDispatch.call(this,action,button)
  };
})();
