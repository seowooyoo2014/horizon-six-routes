const fs=require("fs"),vm=require("vm"),path=require("path");
const gradient={addColorStop(){}};
const context=new Proxy({imageSmoothingEnabled:false,createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,measureText:t=>({width:String(t).length*8})},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
const makeElement=()=>({innerHTML:"",textContent:"",style:{},classList:{add(){},remove(){}},addEventListener(){},insertAdjacentHTML(where,html){this.innerHTML+=html},querySelectorAll(){return[]},querySelector(){return null},get firstElementChild(){return null}});
const canvas={width:960,height:540,getContext:()=>context};
const elements={"#world":canvas,"#hud":makeElement(),"#overlay":makeElement(),"#toast":makeElement(),"#help":makeElement()};
global.window=global;global.document={querySelector:s=>elements[s]||null,getElementById:()=>null,createElement:t=>t==="canvas"?{...canvas}:makeElement(),activeElement:null};
global.addEventListener=()=>{};global.navigator={getGamepads:()=>[]};global.requestAnimationFrame=()=>1;global.confirm=()=>false;global.prompt=()=>null;global.performance={now:()=>1000};
global.localStorage={data:new Map(),getItem(k){return this.data.get(k)??null},setItem(k,v){this.data.set(k,v)},removeItem(k){this.data.delete(k)}};
global.indexedDB={open(){return{}}};global.Audio=class{constructor(src=""){this.src=src;this.volume=1;this.currentTime=0;this.listeners={}}addEventListener(t,h){this.listeners[t]=h}load(){}play(){return Promise.resolve()}pause(){}};
global.Image=class{constructor(){this.complete=true;this.naturalWidth=1536;this.naturalHeight=1024}set src(v){this._src=v;queueMicrotask(()=>this.onload?.())}get src(){return this._src}};
global.HL={};
const root=path.resolve(__dirname,".."),files=["data.js","world_data.js","v5_data.js","assets.js","collision.js","systems.js","v5_systems.js","sea_navigation_v6.js","engine.js","art.js","game.js","expansion.js","v5_art.js","v5_expansion.js","dos_sea_v6.js","horizon_v7.js","story_v8.js","story_v9_data.js","story_v9.js","topdown_v10_data.js","topdown_v10.js","topdown_v10_art.js","graphics_v11_data.js","graphics_v11.js","graphics_v11_art.js","v12_data.js","v12_systems.js","v12_art.js","v13_data.js","v13_systems.js","v13_art.js"];
for(const file of files)vm.runInThisContext(fs.readFileSync(path.join(root,file),"utf8"),{filename:file});
const failures=[],expect=(ok,msg)=>{if(!ok)failures.push(msg)},game=new HL.Game();
setImmediate(()=>{
  expect(HL.DATA.version===13,`version ${HL.DATA.version}`);expect(game.mode==="file",`boot mode ${game.mode}`);expect(elements["#overlay"].innerHTML.includes("항해 파일 1"),"file screen missing");
  try{game.dispatchAction("new:1");expect(game.mode==="scenario","new game did not open captain selection");game.dispatchAction("captain:0");expect(game.mode==="prologue-v10","new game did not start playable prologue")}catch(error){failures.push(`new game: ${error.message}`)}
  const saved=HL.Game.freshState();saved.slot=2;saved.mode="town";saved.currentPort="bella";saved.prologueState.completed=true;saved.prologueState.phase="town";game.e.saveSlot(2,saved);game.showFiles();
  try{game.resume(2);expect(game.s.version===13,"resume did not migrate to v13");expect(game.mode==="town","resume did not restore town")}catch(error){failures.push(`resume: ${error.message}`)}
  try{const unavailable=HL.DATA.goods.find(g=>!HL.DATA.ports.bella.market[g.id]);game.s.tradeState.selected=unavailable?.id||"missing-good";game.renderV13Trade();expect(game.s.tradeState.selected!==unavailable?.id,"unavailable selection was not repaired");expect(!elements["#overlay"].innerHTML.includes("구입 0 · 판매 0"),"unavailable good shown as free");expect(elements["#overlay"].innerHTML.includes("거래 후 금화"),"trade detail missing")}catch(error){failures.push(`trade ui: ${error.message}`)}
  console.log(JSON.stringify({version:HL.DATA.version,mode:game.mode,saveVersion:game.s.version,tradeGood:game.s.tradeState.selected,failures},null,2));if(failures.length)process.exitCode=1;
});
