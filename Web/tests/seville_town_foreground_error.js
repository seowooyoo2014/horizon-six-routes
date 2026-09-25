const assert=require("assert"),{bootHtmlOrder,createLocalImageClass}=require("./offline_html_order_harness.js");
const harness=bootHtmlOrder({ImageClass:createLocalImageClass({errorSource:"foreground_objects/plaza-nw.png"})});
async function waitForImage(){for(let i=0;i<250&&HL.DATA.sevilleTownIntegration.asset.status==="loading";i++)await new Promise(resolve=>setTimeout(resolve,20))}
(async()=>{
  const before=HL.DATA.townDefinitionsV19.seville,oldFields={visual:before.visual,collision:before.collision,buildings:before.buildings,roads:before.roads},game=new HL.Game();game.e.canvas=harness.canvas;game.e.ctx=harness.canvas.getContext("2d");game.s=HL.Game.freshState();game.s.captainId="ines";game.s.currentPort="seville";game.s.mode="town";game.s.town={x:1,y:1,dir:4};game.mode="town";game.spawnTownNpcs();
  game.renderTown();await waitForImage();game.renderTown();const asset=HL.DATA.sevilleTownIntegration.asset;assert.equal(asset.status,"error");assert.equal(asset.committed,false);for(const [field,value] of Object.entries(oldFields))assert.strictEqual(before[field],value,`${field} stays on the whole previous map`);assert.strictEqual(before.visual.foreground,oldFields.visual.foreground);console.log(JSON.stringify({status:"PASS",failure:"approved foreground decode",fallback:"previous whole map",committed:false},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
