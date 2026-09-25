const fs=require("fs");
const vm=require("vm");
const path=require("path");

global.window=global;
global.HL={};
global.localStorage={getItem(){return null},setItem(){},removeItem(){}};
const root=path.resolve(__dirname,"..");
for(const file of["data.js","world_data.js","v5_data.js","collision.js","systems.js","v5_systems.js","sea_navigation_v6.js","engine.js","art.js","game.js","expansion.js","v5_art.js","legacy_animation.js","v5_expansion.js","dos_sea_v6.js","horizon_v7.js","story_v8.js","story_v9_data.js","story_v9.js"]){
  vm.runInThisContext(fs.readFileSync(path.join(root,file),"utf8"),{filename:file});
}

const failures=[];
const engine={
  overlay:{innerHTML:"",querySelector(){return null}},hud:{innerHTML:""},
  close(){this.overlay.innerHTML=""},window(html){this.overlay.innerHTML=html},button(label){return`<button>${label}</button>`},
  toast(){},dialogue(){},playMusic(){},sfx(){},saveSlot(){},loadSlot(){return null}
};
const game=Object.create(HL.Game.prototype);
game.e=engine;
game.s=HL.Game.freshState();
game.mode="town";
game.npcs=[];
game.playerVelocity={x:0,y:0};
game.lastSafe={x:16,y:16};
game.navigation=new HL.WorldNavigation();
game.save=()=>{};
game.syncRegionMusic=()=>{};
game.spawnTownNpcs=()=>{};
game.ensureSafePosition=()=>{};
game.ensureExpansion();

const eventFor=task=>{
  const trigger=task.trigger;
  if(trigger.type==="search")return{type:"search",lon:trigger.near[0],lat:trigger.near[1]};
  return{...trigger};
};
const choices={
  "mira-identity":"protect","massawa-rescue":"people","orso-confession":"keep","goa-medicine":"harbor",
  "damian-terms":"witness","mira-trust":"trust","bardo-alliance":"ally","final-command":"united",
  "father-forgiveness":"distance",ending:"free"
};

let guard=0;
while(!game.s.flags.campaignComplete&&guard++<100){
  const task=game.campaignSystem.currentTask(game.s);
  if(!task){failures.push("campaign lost its current task");break}
  if(task.id==="v9-chart-assembly"){
    for(const item of HL.DATA.chartFragments.filter(fragment=>fragment.required)){
      if(!game.s.fragmentBoard.owned.includes(item.id))game.grantFragment(item.id);
      game.s.fragmentBoard.placements[item.slot]=item.id;
      game.s.fragmentBoard.rotations[item.id]=item.rotation;
    }
  }
  let advanced;
  if(task.trigger.type==="choice")advanced=game.applyV9Choice(task.trigger.id,choices[task.trigger.id]);
  else advanced=game.progressCampaign(eventFor(task));
  if(!advanced){failures.push(`task did not advance: ${task.id}`);break}
}

if(guard>=100)failures.push("campaign flow guard exhausted");
if(!game.s.flags.campaignComplete)failures.push("campaign did not complete");
const expectedTasks=HL.DATA.campaign.chapters.reduce((total,chapter)=>total+chapter.tasks.length,0);
if(game.s.campaign.completed.length!==expectedTasks)failures.push(`expected ${expectedTasks} tasks, got ${game.s.campaign.completed.length}`);
if(game.s.endingState?.path!=="free")failures.push("free navigator ending was not applied");
if(!game.s.companions.aeron.alive||!game.s.companions.orso.alive||!game.s.companions.bardo.alive)failures.push("safe choices did not preserve companions");
if(game.s.companions.mira.trust<3||!game.s.companions.mira.romance)failures.push("Mira trust route did not resolve");
if(new HL.FragmentSystem().requiredCount(game.s)!==8)failures.push("required fragment count is not eight");
if(HL.DATA.seaSpeedScale!==1.25)failures.push("sea speed scale is not 1.25");

console.log(JSON.stringify({
  version:game.s.version,
  completedTasks:game.s.campaign.completed.length,
  ending:game.s.endingState?.title,
  fragments:game.s.fragmentBoard.owned.length,
  required:new HL.FragmentSystem().requiredCount(game.s),
  survivors:game.s.endingState?.survivors,
  failures
},null,2));
if(failures.length)process.exitCode=1;
