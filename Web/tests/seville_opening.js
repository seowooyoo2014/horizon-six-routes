"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
require("./boot_v21.js");
const root=path.resolve(__dirname,".."),load=name=>vm.runInThisContext(fs.readFileSync(path.join(root,name),"utf8"),{filename:name});
load("seville_quality.js");
load("seville_town.js");
load("seville_trade.js");
const copy=value=>JSON.parse(JSON.stringify(value));
const originalGame={...HL.Game.prototype},originalSync=HL.CampaignSystem.prototype.syncQuest;
let checks=0,slot=30;
function test(name,body){body();checks++;console.log(`PASS ${name}`);}
function fresh(id="ines"){
  const g=new HL.Game();g.e.selectedSlot=slot++;g.newGame(id);
  g.dialogues=[];g.toasts=[];
  g.e.dialogue=(speaker,text,buttons)=>{g.dialogues.push({speaker,text,buttons});};
  g.e.toast=text=>g.toasts.push(text);
  return g;
}
function room(g,building="guild",floor="1f",port="seville"){
  const scene=HL.DATA.buildingScenes[port][building].floors[floor];
  g.mode=g.s.mode="interior";g.s.currentPort=port;
  g.s.interior={id:building,buildingId:building,floorId:floor,x:scene.spawn[0],y:scene.spawn[1],dir:4};
}
function act(g,action,entry="executeV10InteriorAction"){g[entry](action);}
function unchanged(g,body,message){const before=copy(g.s);body();assert.deepEqual(g.s,before,message);}
function reload(g){
  const objective=g.s.quest.objective,interior=copy(g.s.interior),fame=copy(g.s.fame);
  g.save();const stored=g.e.loadSlot(g.s.slot);
  assert.equal(stored.version,21);assert.equal(stored.quest.objective,objective);
  g.s=HL.migrateStateV21(stored);g.resume(stored.slot);
  assert.equal(g.s.quest.objective,objective);assert.deepEqual(g.s.interior,interior);assert.deepEqual(g.s.fame,fame);
  g.campaignSystem.ensure(g.s);g.ensureExpansion();g.campaignSystem.syncQuest(g.s);
  assert.equal(g.s.quest.objective,objective);
}
setImmediate(async()=>{
  // Compare full state deltas against the unmodified handlers for other captains.
  const baselines={};
  for(const id of ["kemal","duarte","matteo","anne","marieke"]){
    const g=fresh(id);g.save=()=>{};
    const initial=copy(g.s);
    originalGame.handleWakeV21.call(g,"caller");
    for(const step of ["work","news","consult","prepare"])originalGame.handleOpeningV21.call(g,step);
    originalSync.call(g.campaignSystem,g.s);
    baselines[id]={initial,result:copy(g.s),dialogues:copy(g.dialogues)};
  }
  load("seville_opening.js");
  const installedHandlers=Object.fromEntries(Object.keys(HL.SevilleOpening.wrappers).map(name=>[name,HL.Game.prototype[name]||HL.CampaignSystem.prototype[name]]));
  load("startport_interiors.js");
  await HL.StartPortInteriors.ready;
  test("installation exports actual wrappers and preserves all hotspot action IDs",()=>{
    const api=HL.SevilleOpening;
    assert.equal(api.installed,true);
    for(const [name,fn]of Object.entries(api.wrappers))assert.equal(fn,installedHandlers[name]);
    for(const key of ["lodge:2f","guild:1f"]){
      for(const hot of HL.DATA.sevilleQualityLayouts[key].hotspots.filter(h=>h.action.startsWith("v21-")))assert.ok(api.actions.includes(hot.action));
    }
    load("seville_opening.js");assert.equal(HL.SevilleOpening,api);
    assert.doesNotMatch(HL.DATA.openingWakeDefinitionsV21.calls.ines.wake,/압류|압수|카디스/);
  });
  test("wake, work, news, consultation and preparation survive real saves and quest sync",()=>{
    const g=fresh(),initialMoney=g.s.money,initialFleet=copy(g.s.fleet),initialFame=g.s.fame.adventure;
    assert.equal(g.s.interior.buildingId,"lodge");assert.equal(g.s.interior.floorId,"2f");
    assert.deepEqual([g.s.interior.x,g.s.interior.y],HL.DATA.sevilleQualityLayouts["lodge:2f"].spawn);
    assert.match(g.s.quest.objective,/숙소 2층.*마엘/);reload(g);
    unchanged(g,()=>act(g,"v21-wake:bed"));
    act(g,"v21-wake:caller","dispatchAction");assert.match(g.s.quest.objective,/조수표 작업대/);reload(g);
    assert.match(g.dialogues.at(-1).text,/세리아.*빵/s);assert.doesNotMatch(g.dialogues.at(-1).text,/압수|카디스/);
    room(g);
    const objectives=[/압수 목록/,/마엘과 상의/,/출항 준비 장부/,/카디스.*조수 높이/];
    for(const [index,step]of ["work","news","consult","prepare"].entries()){
      act(g,`v21-opening:${step}`,index%2?"dispatchAction":"executeV10InteriorAction");
      assert.match(g.s.quest.objective,objectives[index]);
      assert.equal(g.s.openingWakeV21.completedSteps.length,index+1);
      if(step!=="prepare"){
        const info=g.campaignSystem.checklist(g.s);
        assert.equal(info.task.description,g.s.quest.objective);
        g.openV16Journal();assert.ok(g.e.overlay.innerHTML.includes(g.s.quest.objective));
      }
      reload(g);
    }
    assert.match(g.dialogues.find(d=>d.speaker==="세리아"&&d.text.includes("만조")).text,/기준.*보정/s);
    assert.match(g.dialogues.find(d=>d.text.includes("여섯 권")).text,/카디스 항만 제3창고, 이송 17호/);
    assert.match(g.dialogues.find(d=>d.speaker==="마엘과 세리아").text,/틀린 곳.*원본과 실제 바다/s);
    assert.equal(g.s.openingWakeV21.completed,true);assert.equal(g.s.openingV19.completed,true);
    assert.equal(g.s.prologueV16.completed,true);assert.equal(g.s.flags.shipGranted,true);
    assert.equal(g.s.campaign.taskIndex,1);assert.deepEqual(g.s.campaign.completed,["i1-1"]);
    assert.equal(g.s.fame.adventure,initialFame+HL.DATA.campaignsV16["ines-atlas"].chapters[0].tasks[0].rewardFame);
    assert.equal(g.s.money,initialMoney);assert.deepEqual(g.s.fleet,initialFleet);
    assert.equal(g.s.careerProgress.waiting,null);
    assert.equal(g.s.openingWakeV21.checkpoints.filter(c=>c.id==="departure-ready").length,1);
    const history=g.s.campaign.log.length;
    unchanged(g,()=>{for(const id of HL.SevilleOpening.actions)act(g,id);});
    assert.equal(g.s.campaign.log.length,history);
    g.mode=g.s.mode="town";g.s.interior=null;g.setSail();assert.equal(g.mode,"sea");
    assert.match(g.e.loadSlot(g.s.slot).quest.objective,/^카디스로 항해/);
    g.mode=g.s.mode="town";g.s.currentPort="cadiz";
    g.ensureExpansion();assert.match(g.s.quest.objective,/^카디스 항만/);
    assert.equal(g.progressCampaign({type:"facility",id:"harbor",port:"cadiz"}),true);
    assert.equal(g.s.campaign.taskIndex,2);g.ensureExpansion();
    assert.doesNotMatch(g.s.quest.objective,/이송 17호/);assert.match(g.s.quest.objective,/라스팔마스/);
  });
  test("wrong order, wrong port, wrong floor and direct campaign evaluation cannot bypass opening",()=>{
    const g=fresh();
    unchanged(g,()=>{
      for(const step of ["work","news","consult","prepare"])act(g,`v21-opening:${step}`);
      g.setSail();assert.equal(g.progressCampaign({type:"facility",id:"guild",port:"seville"}),false);
      assert.equal(g.campaignSystem.evaluate(g.s,{type:"facility",id:"guild",port:"seville"}),false);
      assert.equal(g.campaignSystem.evaluateV18(g.s,{type:"facility",id:"guild",port:"seville"}),false);
    });
    room(g);unchanged(g,()=>act(g,"v21-wake:caller"));
    room(g,"lodge","1f");unchanged(g,()=>act(g,"v21-wake:caller"));
    room(g,"lodge","2f");act(g,"v21-wake:caller");
    unchanged(g,()=>act(g,"v21-opening:work"));
    room(g,"guild","2f");unchanged(g,()=>act(g,"v21-opening:work"));
    room(g,"guild","1f","cadiz");unchanged(g,()=>act(g,"v21-opening:work"));
    room(g);g.mode="town";unchanged(g,()=>act(g,"v21-opening:work"));g.mode="interior";
    for(const step of ["work","news","consult","prepare"]){
      unchanged(g,()=>{for(const later of ["work","news","consult","prepare"].slice(["work","news","consult","prepare"].indexOf(step)+1))act(g,`v21-opening:${later}`);});
      act(g,`v21-opening:${step}`);
      unchanged(g,()=>{act(g,`v21-opening:${step}`);act(g,"v21-wake:caller");});
    }
  });
  test("legacy V19 action IDs share prerequisites and still require preparation",()=>{
    const g=fresh();room(g);unchanged(g,()=>act(g,"v19-opening:confirm","dispatchAction"));
    room(g,"lodge","2f");act(g,"v21-wake:caller");room(g);
    for(const part of ["work","witness","confirm"]){act(g,`v19-opening:${part}`,"dispatchAction");reload(g);}
    assert.deepEqual(g.s.openingWakeV21.completedSteps,["work","news","consult"]);
    assert.equal(g.s.openingV19.completed,false);unchanged(g,()=>g.setSail());
    act(g,"v21-opening:prepare");assert.equal(g.s.openingV19.completed,true);
  });
  test("partial V21 saves retain completed work and do not count duplicates as prerequisites",()=>{
    for(const count of [0,1,2,3]){
      const g=fresh();g.s.openingWakeV21.heardCall=true;
      g.s.openingWakeV21.completedSteps=["work","news","consult"].slice(0,count);g.s.openingWakeV21.stage=Math.max(1,count);
      room(g);g.ensureExpansion();reload(g);
      unchanged(g,()=>{for(const step of g.s.openingWakeV21.completedSteps)act(g,`v21-opening:${step}`);});
      for(const step of ["work","news","consult","prepare"].slice(count))act(g,`v21-opening:${step}`);
      assert.equal(g.s.campaign.taskIndex,1);
    }
    const g=fresh();act(g,"v21-wake:caller");room(g);
    g.s.openingWakeV21.completedSteps=["work","work","unknown"];
    unchanged(g,()=>act(g,"v21-opening:prepare"));act(g,"v21-opening:news");
    assert.deepEqual(g.s.openingWakeV21.completedSteps,["work","news"]);
    delete g.s.openingWakeV21.completedSteps;g.s.openingWakeV21.stage=2;
    g.ensureExpansion();assert.match(g.s.quest.objective,/마엘과 상의/);
    unchanged(g,()=>act(g,"v21-opening:work"));act(g,"v21-opening:consult");act(g,"v21-opening:prepare");
    assert.equal(g.s.openingWakeV21.completed,true);
    for(const worked of [false,true]){
      const old=fresh();old.s.openingWakeV21.heardCall=true;old.s.openingWakeV21.stage=1;
      delete old.s.openingWakeV21.completedSteps;
      if(worked)old.s.openingWakeV21.checkpoints.push({id:"daily-work"});
      room(old);old.ensureExpansion();
      assert.match(old.s.quest.objective,worked?/압수 목록/:/조수표 작업대/);
      reload(old);
    }
  });
  test("completed and advanced saves cannot replay rewards or regress to the lodge",()=>{
    for(const variant of ["completed","advanced","waiting","pre-v21"]){
      const g=fresh();room(g);g.s.money=8765;g.s.fame.adventure=990;
      if(variant==="completed")g.s.openingWakeV21={completed:true,reveal:1,stage:4,checkpoints:[]};
      if(variant==="advanced"||variant==="waiting"){
        g.s.campaign.chapterId="i2";g.s.campaign.taskIndex=1;g.s.campaign.completed=["i1-1","i1-2","i1-3","i2-1"];
        if(variant==="waiting")g.s.careerProgress.waiting={nextChapter:"i3",required:9000};
      }
      if(variant==="pre-v21"){delete g.s.openingWakeV21;g.s.openingV19.completed=true;g.s.version=20;g.s=HL.migrateStateV21(g.s);}
      const campaign=copy(g.s.campaign),wake=copy(g.s.openingWakeV21),position=copy(g.s.interior);
      g.ensureExpansion();const expected=g.s.quest.objective;reload(g);
      assert.deepEqual(g.s.campaign,campaign);assert.deepEqual(g.s.openingWakeV21,wake);assert.deepEqual(g.s.interior,position);
      assert.equal(g.s.money,8765);assert.equal(g.s.fame.adventure,990);assert.equal(g.s.quest.objective,expected);
      assert.equal(g.s.openingV19.completed,true);
      unchanged(g,()=>{for(const id of HL.SevilleOpening.actions)act(g,id);});
      if(variant==="completed")assert.equal(g.progressCampaign({type:"facility",id:"guild",port:"seville"}),true);
    }
  });
  test("all five other captains retain original state transitions and dialogue",()=>{
    const now=Date.now;
    try{
      for(const [id,baseline]of Object.entries(baselines)){
        const g=fresh(id);g.s=copy(baseline.initial);g.save=()=>{};g.dialogues=[];
        let index=0;const times=baseline.result.openingWakeV21.checkpoints.slice(1).map(c=>c.at);
        Date.now=()=>times[index++]||times.at(-1);
        g.handleWakeV21("caller");for(const step of ["work","news","consult","prepare"])g.handleOpeningV21(step);
        g.campaignSystem.syncQuest(g.s);
        assert.deepEqual(g.s,baseline.result,id);assert.deepEqual(g.dialogues,baseline.dialogues,id);
      }
    }finally{Date.now=now;}
  });
  console.log(`Seville opening: ${checks} groups passed (Node only).`);
});
