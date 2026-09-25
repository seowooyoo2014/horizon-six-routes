const fs=require("fs"),vm=require("vm"),path=require("path");
global.window=global;global.HL={};global.addEventListener=()=>{};global.localStorage={data:new Map(),getItem(k){return this.data.get(k)||null},setItem(k,v){this.data.set(k,v)},removeItem(k){this.data.delete(k)}};
global.Audio=class{constructor(){this.volume=1;this.currentTime=0;this.listeners={};this.dataset={}}addEventListener(k,v){this.listeners[k]=v}load(){}play(){return Promise.resolve()}pause(){}};global.Image=class{};
const root=path.resolve(__dirname,"..");for(const file of["data.js","world_data.js","v5_data.js","collision.js","systems.js","v5_systems.js","sea_navigation_v6.js","engine.js","art.js","game.js","expansion.js","v5_art.js","legacy_animation.js","v5_expansion.js","dos_sea_v6.js","horizon_v7.js","story_v8.js"])vm.runInThisContext(fs.readFileSync(path.join(root,file),"utf8"),{filename:file});
const failures=[];
if(HL.DATA.version!==8||Object.keys(HL.DATA.musicTracks).length!==7)failures.push("v8 music data failed");
if(HL.DATA.storyCutscenes.length!==24)failures.push(`expected 24 cutscenes, got ${HL.DATA.storyCutscenes.length}`);
for(let chapter=0;chapter<8;chapter++)if(HL.DATA.storyCutscenes.filter(cs=>cs.chapter===chapter).length!==3)failures.push(`chapter ${chapter} does not have three cutscenes`);
if(new Set(HL.DATA.storyCutscenes.map(cs=>cs.id)).size!==24)failures.push("duplicate cutscene ids");
const router=new HL.RegionMusicRouter();
for(const [culture,key]of Object.entries({north:"theme_north_europe",iberia:"theme_west_europe",africa:"theme_africa",china:"theme_china",japan:"theme_asia"}))if(router.cultureKey(culture)!==key)failures.push(`culture music failed: ${culture}`);
if(router.seaKey(120,32)!=="theme_china"||router.seaKey(80,10)!=="theme_asia"||router.seaKey(20,5)!=="theme_africa"||router.seaKey(-70,12)!=="theme_main")failures.push("sea region music failed");

const state=HL.Game.freshState(),director=new HL.CutsceneDirector();director.ensure(state);director.enqueue(state,"ch2_turn","battle-end");
const fake={s:state,mode:"sea",e:{overlay:{innerHTML:""}},transition:null};state.sea.anchor=false;if(!director.safe(fake,state.cutsceneState.pending[0]))failures.push("battle-end cutscene was not safe");
director.enqueue(state,"ch3_intro","event");if(state.cutsceneState.pending.length!==2)failures.push("cutscene queue failed");

const old=HL.Game.freshState();old.version=7;old.money=4321;old.bank.balance=2100;old.fragmentBoard.owned=["glass-cipher"];old.campaign.completed=["claim-ship","rescue-aeron"];old.endingState={path:"league",title:"열린 시장의 항로"};localStorage.setItem("horizon-ledger-v7-slot-1",JSON.stringify(old));const engine=Object.create(HL.Engine.prototype);engine.migrateOld(1);const migrated=JSON.parse(localStorage.getItem("horizon-ledger-v8-slot-1"));
if(!migrated||migrated.version!==8||migrated.money!==4321||migrated.bank.balance!==2100||migrated.endingState.path!=="league"||!migrated.fragmentBoard.owned.includes("glass-cipher"))failures.push("v7 migration preservation failed");
if(!migrated.cutsceneState.seen.includes("ch0_end")||!migrated.cutsceneState.seen.includes("ch2_turn"))failures.push("completed task cutscene migration failed");
if(!localStorage.getItem("horizon-ledger-v7-slot-1"))failures.push("v7 source was removed");

const game=Object.create(HL.Game.prototype);game.s=HL.Game.freshState();game.fragmentSystem=new HL.FragmentSystem();game.fragmentSystem.ensure(game.s);for(const item of HL.DATA.chartFragments.filter(item=>item.required))game.fragmentSystem.grant(game.s,item.id);if(game.endingChoices().length!==3)failures.push("all endings did not unlock with eight required fragments");
for(const pathName of["crown","league","free"]){const branch=HL.Game.freshState(),branchGame=Object.create(HL.Game.prototype);branchGame.s=branch;branchGame.fragmentSystem=new HL.FragmentSystem();branchGame.fragmentSystem.ensure(branch);branchGame.applyEnding(pathName);if(branch.endingState.path!==pathName||!branch.endingState.epilogue)failures.push(`ending epilogue failed: ${pathName}`)}

console.log(JSON.stringify({version:HL.DATA.version,tracks:Object.keys(HL.DATA.musicTracks),cutscenes:HL.DATA.storyCutscenes.length,migrated:migrated?.version,seen:migrated?.cutsceneState?.seen?.length,failures},null,2));if(failures.length)process.exitCode=1;
