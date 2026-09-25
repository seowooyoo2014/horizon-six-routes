const fs=require("fs"),vm=require("vm"),path=require("path");
const root=path.resolve(__dirname,"..");global.window=global;global.HL={};global.Image=class{};global.performance={now:()=>1000};
global.document={createElement:()=>null};
for(const file of["data.js","world_data.js","v5_data.js","collision.js","systems.js","v5_systems.js","sea_navigation_v6.js","art.js","game.js","expansion.js","v5_art.js","v5_expansion.js","modular_v6.js"]){vm.runInThisContext(fs.readFileSync(path.join(root,file),"utf8"),{filename:file})}
const failures=[],world=new HL.CollisionWorld(.28);
for(const[id,scene]of Object.entries(HL.DATA.interiorScenes)){
  if(!scene.modular||scene.modular.objects.length<5)failures.push(`${id}: modules`);
  if(world.blocked(scene.collision,scene.spawn[0],scene.spawn[1],.28))failures.push(`${id}: spawn blocked`);
  const counter=scene.modular.objects[0];
  if(!world.blocked(scene.collision,counter[1]+counter[3]/2,counter[2]+counter[4]/2,.28))failures.push(`${id}: counter passable`);
  if(scene.owner.y>=counter[2])failures.push(`${id}: owner on counter`);
}
const cultures=new Set(HL.DATA.portOrder.map(id=>HL.DATA.ports[id].culture).filter(id=>HL.DATA.interiorModules.cultures[id]));
if(cultures.size<12)failures.push(`culture kits ${cultures.size}`);
let tradeHtml="";const fake={s:HL.Game.freshState(),economy:{price:(p,id,day,buy)=>buy?100:80},e:{button:(label,action)=>`<button data-action="${action}">${label}</button>`,window:html=>tradeHtml=html}};HL.Game.prototype.marketMenu.call(fake);if(!tradeHtml.includes("trade-list")||!tradeHtml.includes("trade-buy5:"))failures.push("trade UI missing list or quantity actions");
console.log(JSON.stringify({interiors:Object.keys(HL.DATA.interiorScenes).length,moduleTypes:new Set(Object.values(HL.DATA.interiorScenes).flatMap(s=>s.modular.objects.map(o=>o[0]))).size,cultureKits:Object.keys(HL.DATA.interiorModules.cultures).length,tradeRows:(tradeHtml.match(/trade-row/g)||[]).length,failures},null,2));
if(failures.length)process.exitCode=1;
