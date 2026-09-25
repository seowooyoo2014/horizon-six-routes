const fs=require("fs");
const vm=require("vm");
const path=require("path");

global.window=global;
global.HL={};
global.Image=class{set src(value){this._src=value}};
global.Audio=class{play(){return Promise.resolve()}pause(){}};
global.localStorage={values:new Map(),getItem(key){return this.values.get(key)||null},setItem(key,value){this.values.set(key,value)},removeItem(key){this.values.delete(key)}};
const root=path.resolve(__dirname,"..");
for(const file of["data.js","world_data.js","v5_data.js","collision.js","systems.js","v5_systems.js","sea_navigation_v6.js","engine.js","art.js","game.js","expansion.js","v5_art.js","legacy_animation.js","v5_expansion.js","dos_sea_v6.js","horizon_v7.js"])vm.runInThisContext(fs.readFileSync(path.join(root,file),"utf8"),{filename:file});

const failures=[];
for(const chapter of HL.DATA.campaign.chapters)for(const task of chapter.tasks||[]){if(task.port&&!HL.DATA.ports[task.port])failures.push(`unknown campaign port ${task.port}`);if(!task.trigger)failures.push(`missing trigger ${task.id}`)}
if(HL.DATA.chartFragments.length!==12||new Set(HL.DATA.chartFragments.map(item=>item.id)).size!==12||new Set(HL.DATA.chartFragments.map(item=>item.slot)).size!==12)failures.push("fragment data is not a unique twelve-piece board");
const simulation=new HL.SeaSimulation(),state=HL.Game.freshState();
state.mode="sea";state.sea={...state.sea,lon:-12,lat:38,heading:2,wind:2,current:2,anchor:false};simulation.ensure(state);
HL.DATA.seaSpeedScale=1;const baseSpeed=simulation.fleetSpeed(state);HL.DATA.seaSpeedScale=1.1;const boostedSpeed=simulation.fleetSpeed(state);
if(Math.abs(boostedSpeed/baseSpeed-1.1)>1e-10)failures.push("sea speed is not exactly 10% faster");
const movementState=JSON.parse(JSON.stringify(state)),distances=[],fakeGrid={navigation:{current:()=>2},move(s,distance){distances.push(distance);return{blocked:false,impact:0}},depth:()=>200};
HL.DATA.seaSpeedScale=1;simulation.step(movementState,fakeGrid);movementState.seaSim.ticks=0;movementState.seaSim.hourTicks=0;HL.DATA.seaSpeedScale=1.1;simulation.step(movementState,fakeGrid);
if(Math.abs(distances[1]/distances[0]-1.1)>1e-10)failures.push("world movement is not exactly 10% faster");

const fragments=new HL.FragmentSystem();fragments.ensure(state);
for(const item of HL.DATA.chartFragments){fragments.grant(state,item.id);fragments.place(state,item.id,item.slot);while(state.fragmentBoard.rotations[item.id]!==item.rotation)fragments.rotate(state,item.id)}
if(fragments.interpreted(state).length!==12||state.fragmentBoard.owned.length!==12)failures.push("fragment board completion failed");
if(state.fragmentBoard.unlocks.join(",")!=="3,6,9,12")failures.push("fragment milestone unlocks failed");
const first=state.fragmentBoard.owned[0];fragments.place(state,first,11);if(!state.fragmentBoard.owned.includes(first))failures.push("misplaced fragment was lost");

const old=HL.Game.freshState();old.version=6;old.money=7654;old.bank.balance=2300;old.campaign={chapterId:"eastbound-scholar",taskIndex:1,completed:["scholar-request"],log:[]};old.flags.gotClue=true;old.discoveries=[{id:"story-massawa-search",name:"조류의 지팡이"}];localStorage.setItem("horizon-ledger-v6-slot-1",JSON.stringify(old));
const engine=Object.create(HL.Engine.prototype);engine.migrateOld(1);const migrated=JSON.parse(localStorage.getItem("horizon-ledger-v7-slot-1"));
if(!migrated||migrated.version!==7||migrated.money!==7654||migrated.bank.balance!==2300)failures.push("v6 migration values failed");
if(migrated?.campaign?.chapterId!=="second-sunset")failures.push("campaign chapter migration failed");
if(!migrated?.fragmentBoard?.owned.includes("glass-cipher")||!migrated.fragmentBoard.owned.includes("tide-staff"))failures.push("legacy discovery fragment migration failed");
if(!localStorage.getItem("horizon-ledger-v6-slot-1"))failures.push("v6 source save removed");

const campaign=new HL.CampaignSystem(),gateState=HL.Game.freshState();fragments.ensure(gateState);const finalTask=HL.DATA.campaign.chapters.find(c=>c.id==="meridian-citadel").tasks[0],required=HL.DATA.chartFragments.filter(item=>item.required);
for(const item of required.slice(0,7))fragments.grant(gateState,item.id);
if(campaign.matches(gateState,{type:"search",lon:-49.5,lat:.2},finalTask))failures.push("final region opened with fewer than eight required fragments");
fragments.grant(gateState,required[7].id);
if(!campaign.matches(gateState,{type:"search",lon:-49.5,lat:.2},finalTask))failures.push("final region stayed locked with eight required fragments");

const endingState=HL.Game.freshState();fragments.ensure(endingState);for(const item of HL.DATA.chartFragments){fragments.grant(endingState,item.id);fragments.place(endingState,item.id,item.slot);while(endingState.fragmentBoard.rotations[item.id]!==item.rotation)fragments.rotate(endingState,item.id)}
const mockGame=Object.create(HL.Game.prototype);mockGame.s=endingState;mockGame.fragmentSystem=fragments;
if(mockGame.endingChoices().length!==3)failures.push("free-sailor ending did not unlock after twelve interpretations");
fragments.rotate(endingState,"glass-cipher");if(mockGame.endingChoices().length!==2)failures.push("free-sailor ending unlocked before twelve interpretations");
for(const pathName of["crown","league","free"]){const branch=HL.Game.freshState(),branchGame=Object.create(HL.Game.prototype);branchGame.s=branch;branchGame.applyEnding(pathName);if(branch.endingState?.path!==pathName)failures.push(`ending state failed for ${pathName}`)}

console.log(JSON.stringify({version:HL.DATA.version,baseSpeed,boostedSpeed,speedRatio:boostedSpeed/baseSpeed,movementRatio:distances[1]/distances[0],fragments:state.fragmentBoard.owned.length,interpreted:fragments.interpreted(state).length,migrated:migrated?.version,chapter:migrated?.campaign?.chapterId,failures},null,2));
if(failures.length)process.exitCode=1;
