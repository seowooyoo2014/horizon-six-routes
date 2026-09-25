const fs=require("fs"),vm=require("vm"),path=require("path");
global.window=global;global.HL={};global.addEventListener=()=>{};
global.localStorage={data:new Map(),getItem(k){return this.data.get(k)||null},setItem(k,v){this.data.set(k,v)},removeItem(k){this.data.delete(k)}};
global.Audio=class{constructor(){this.volume=1;this.currentTime=0;this.listeners={};this.dataset={}}addEventListener(k,v){this.listeners[k]=v}load(){}play(){return Promise.resolve()}pause(){}};
global.Image=class{};global.performance={now:()=>1000};global.document={title:"",querySelector(){return null}};
const root=path.resolve(__dirname,"..");
const files=["data.js","world_data.js","v5_data.js","assets.js","collision.js","systems.js","v5_systems.js","sea_navigation_v6.js","engine.js","art.js","game.js","expansion.js","v5_art.js","legacy_animation.js","v5_expansion.js","dos_sea_v6.js","horizon_v7.js","story_v8.js","story_v9_data.js","story_v9.js"];
for(const file of files)vm.runInThisContext(fs.readFileSync(path.join(root,file),"utf8"),{filename:file});
const failures=[];
if(HL.DATA.version!==9)failures.push("version is not 9");
if(HL.DATA.seaSpeedScale!==1.25)failures.push("sea speed is not 1.25");
if(HL.DATA.coreStoryPorts.length!==16||new Set(HL.DATA.coreStoryPorts).size!==16)failures.push("core port route invalid");
if(HL.DATA.storyCutscenes.length!==24)failures.push(`expected 24 cutscenes, got ${HL.DATA.storyCutscenes.length}`);
for(let chapter=0;chapter<8;chapter++)if(HL.DATA.storyCutscenes.filter(cs=>cs.chapter===chapter).length!==3)failures.push(`chapter ${chapter+1} cutscene count invalid`);
if(HL.DATA.storyCutscenes.filter(cs=>cs.kind==="illustration").length!==12)failures.push("illustration count is not 12");
for(const [id,file] of Object.entries(HL.DATA.v9Illustrations))if(!fs.existsSync(path.resolve(root,HL.DATA.sceneAssets[id].background)))failures.push(`missing illustration asset: ${file}`);
if(HL.DATA.chartFragments.length!==12)failures.push("fragment count invalid");
const difficulty=HL.DATA.chartFragments.reduce((a,v)=>(a[v.difficulty]=(a[v.difficulty]||0)+1,a),{});
if(difficulty.easy!==3||difficulty.medium!==7||difficulty.hard!==2)failures.push("fragment difficulty distribution invalid");
if(HL.DATA.chartFragments.filter(f=>f.required).length!==8)failures.push("required fragment count invalid");
if(Object.keys(HL.DATA.v9Choices).length!==10)failures.push("major choice count invalid");
if(HL.DATA.companionQuests.length!==8)failures.push("companion quest count invalid");
for(const id of["orso","mira","bardo","aeron"])if(HL.DATA.companionQuests.filter(q=>q.companion===id).length!==2)failures.push(`${id} quest count invalid`);

const state=HL.Game.freshState(),campaign=new HL.CampaignSystem();campaign.ensure(state);
if(state.campaign.chapterId!=="lights-out"||campaign.currentTask(state).id!=="v9-claim-ship")failures.push("fresh campaign start invalid");
const director=new HL.V9CutsceneDirector();director.ensure(state);if(!director.data("v9_ch0_intro"))failures.push("v9 director data missing");

const simulation=new HL.SeaSimulation(),speedState=HL.Game.freshState();
speedState.mode="sea";speedState.sea={...speedState.sea,lon:-12,lat:38,heading:2,wind:2,current:2,anchor:false};simulation.ensure(speedState);
HL.DATA.seaSpeedScale=1;const originalSpeed=simulation.fleetSpeed(speedState);HL.DATA.seaSpeedScale=1.25;const v9Speed=simulation.fleetSpeed(speedState);
if(Math.abs(v9Speed/originalSpeed-1.25)>1e-10)failures.push("sea speed is not exactly 25% above the original baseline");
const movementState=JSON.parse(JSON.stringify(speedState)),distances=[],fakeGrid={navigation:{current:()=>2},move(s,distance){distances.push(distance);return{blocked:false,impact:0}},depth:()=>200};
HL.DATA.seaSpeedScale=1;simulation.step(movementState,fakeGrid);movementState.seaSim.ticks=0;movementState.seaSim.hourTicks=0;HL.DATA.seaSpeedScale=1.25;simulation.step(movementState,fakeGrid);
if(Math.abs(distances[1]/distances[0]-1.25)>1e-10)failures.push("world movement is not exactly 25% above the original baseline");

const old=HL.Game.freshState();old.version=8;old.money=5312;old.bank.balance=2220;old.fragmentBoard.owned=["glass-cipher","navigator-oath"];old.fragmentBoard.placements={0:"glass-cipher",2:"navigator-oath"};old.fragmentBoard.rotations={"glass-cipher":1,"navigator-oath":0};old.campaign={chapterId:"tide-staff",taskIndex:2,completed:["claim-ship","rescue-aeron"],log:[]};
localStorage.setItem("horizon-ledger-v8-slot-1",JSON.stringify(old));const engine=Object.create(HL.Engine.prototype);engine.migrateOld(1);const migrated=JSON.parse(localStorage.getItem("horizon-ledger-v9-slot-1"));
if(!migrated||migrated.version!==9||migrated.money!==5312||migrated.bank.balance!==2220)failures.push("v8 migration preservation failed");
if(!migrated.fragmentBoard.owned.includes("glass-cipher")||!migrated.fragmentBoard.owned.includes("burnt-margin"))failures.push("fragment migration failed");
if(!localStorage.getItem("horizon-ledger-v8-slot-1"))failures.push("v8 source save was removed");

const choiceGame=Object.create(HL.Game.prototype);choiceGame.s=HL.Game.freshState();choiceGame.e={close(){},toast(){},dialogue(){},overlay:{innerHTML:""}};choiceGame.campaignSystem=new HL.CampaignSystem();choiceGame.fragmentSystem=new HL.FragmentSystem();choiceGame.companionQuestSystem=new HL.CompanionQuestSystem();choiceGame.cutsceneDirector=new HL.V9CutsceneDirector();choiceGame.fleetSystem={ensureStoryFleet(){}};choiceGame.save=()=>{};choiceGame.ensureExpansion=()=>{};choiceGame.s.campaign.chapterId="red-strait";choiceGame.s.campaign.taskIndex=3;choiceGame.applyV9Choice("massawa-rescue","instrument");
if(choiceGame.s.companions.aeron.alive!==false)failures.push("Aeron consequence failed");

const fragmentState=HL.Game.freshState(),fragmentSystem=new HL.FragmentSystem();for(const item of HL.DATA.chartFragments)fragmentSystem.grant(fragmentState,item.id);for(const item of HL.DATA.chartFragments){fragmentState.fragmentBoard.placements[item.slot]=item.id;fragmentState.fragmentBoard.rotations[item.id]=item.rotation}fragmentSystem.refresh(fragmentState);
if(fragmentSystem.interpreted(fragmentState).length!==12||fragmentSystem.requiredCount(fragmentState)!==8)failures.push("fragment completion failed");

console.log(JSON.stringify({version:HL.DATA.version,title:HL.DATA.gameTitle,chapters:HL.DATA.campaign.chapters.length,cutscenes:HL.DATA.storyCutscenes.length,illustrations:HL.DATA.storyCutscenes.filter(cs=>cs.kind==="illustration").length,speedRatio:v9Speed/originalSpeed,movementRatio:distances[1]/distances[0],fragments:difficulty,choices:Object.keys(HL.DATA.v9Choices).length,sideQuests:HL.DATA.companionQuests.length,migrated:migrated?.version,failures},null,2));
if(failures.length)process.exitCode=1;
