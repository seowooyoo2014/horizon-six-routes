const assert=require("assert"),{bootHtmlOrder,createLocalImageClass}=require("./offline_html_order_harness.js");
const ImageClass=createLocalImageClass({delaySource:"foreground_objects/plaza-nw.png"}),harness=bootHtmlOrder({ImageClass});
async function waitForImage(){for(let i=0;i<250&&HL.DATA.sevilleTownIntegration.asset.status==="loading";i++)await new Promise(resolve=>setTimeout(resolve,20))}
(async()=>{
  const before=HL.DATA.townDefinitionsV19.seville,visual=before.visual,collision=before.collision,game=new HL.Game();game.e.canvas=harness.canvas;game.e.ctx=harness.canvas.getContext("2d");game.s=HL.Game.freshState();game.s.captainId="ines";game.s.currentPort="seville";game.s.mode="town";game.s.town={x:1,y:1,dir:4};game.mode="town";game.spawnTownNpcs();
  game.renderTown();assert.equal(HL.DATA.sevilleTownIntegration.asset.status,"loading");assert.strictEqual(before.visual,visual);assert.strictEqual(before.collision,collision);assert.equal(HL.DATA.sevilleTownIntegration.asset.committed,false);
  ImageClass.release("foreground_objects/plaza-nw.png");await waitForImage();assert.equal(HL.DATA.sevilleTownIntegration.asset.status,"ready",HL.DATA.sevilleTownIntegration.asset.error);game.renderTown();assert.equal(HL.DATA.sevilleTownIntegration.asset.committed,true);assert.equal(before.visual.foreground.length,14);console.log(JSON.stringify({status:"PASS",gate:"background+14 foreground decodes",committed:true},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
