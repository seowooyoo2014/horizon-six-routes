const assert=require('node:assert/strict');
const {bootHtmlOrder,createLocalImageClass}=require('./offline_html_order_harness.js');

function townGame(harness){
  const game=new HL.Game();
  game.e.canvas=harness.canvas;game.e.ctx=harness.canvas.getContext('2d');
  game.s=HL.Game.freshState();game.s.slot=74;game.s.captainId='ines';game.s.currentPort='seville';game.s.mode='town';game.s.town={x:1,y:1,dir:4};game.mode='town';
  game.spawnTownNpcs();
  return game;
}

async function waitForImage(){
  for(let i=0;i<100&&HL.DATA.sevilleTownIntegration.asset.status==='loading';i++)await new Promise(resolve=>setTimeout(resolve,20));
}

(async()=>{
  const harness=bootHtmlOrder({ImageClass:createLocalImageClass({errorSource:'seville_town_source_v2.png'})});
  const map=HL.DATA.townDefinitionsV19.seville,oldVisual=map.visual,oldCollision=map.collision,game=townGame(harness);
  game.renderTown();
  await waitForImage();
  assert.equal(HL.DATA.sevilleTownIntegration.asset.status,'error');
  assert.equal(HL.DATA.sevilleTownIntegration.asset.committed,false);
  assert.strictEqual(map.visual,oldVisual,'decode failure keeps old visual');
  assert.strictEqual(map.collision,oldCollision,'decode failure keeps old collision');
  game.renderTown();
  assert.strictEqual(map.visual,oldVisual,'error fallback remains stable');
  assert.strictEqual(map.collision,oldCollision,'error collision fallback remains stable');
  console.log(JSON.stringify({fallback:'PASS',asset:HL.DATA.sevilleTownIntegration.asset.status,committed:HL.DATA.sevilleTownIntegration.asset.committed}));
})().catch(error=>{console.error(error);process.exitCode=1});
