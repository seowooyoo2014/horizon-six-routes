const assert=require('node:assert/strict');
const {bootHtmlOrder}=require('./offline_html_order_harness.js');

function protectedState(state){
  return JSON.stringify({version:state.version,graphicsVersion:state.graphicsVersion,captainId:state.captainId,currentPort:state.currentPort,mode:state.mode,money:state.money,cargo:state.cargo,flags:state.flags,quest:state.quest,campaign:state.campaign,fleet:state.fleet,crew:state.crew,bank:state.bank,properties:state.properties,portWarehouses:state.portWarehouses,classicMarket:state.classicMarket,openingWakeV21:state.openingWakeV21});
}

(async()=>{
  const harness=bootHtmlOrder(),map=HL.DATA.townDefinitionsV19.seville,oldVisual=map.visual,oldCollision=map.collision,oldSpawn=map.spawn,oldTownCount=Object.keys(HL.DATA.townDefinitionsV19).length;
  const oldWorld=new HL.CollisionWorld(.28),game=new HL.Game();game.e.canvas=harness.canvas;game.e.ctx=harness.canvas.getContext('2d');
  game.s=HL.migrateStateV21(HL.Game.freshState());game.s.slot=75;game.s.captainId='ines';game.s.currentPort='seville';game.s.mode='town';game.s.town={x:32,y:31.5,dir:4};game.s.v21.positionConverted=true;game.s.money=4321;game.s.cargo.glass=17;game.s.flags.metFather=true;game.s.quest.stage=3;game.s.quest.objective='post-commit recovery';game.s.campaign.chapterId='bounded-seville';game.mode='town';game.spawnTownNpcs();
  game.renderTown();
  for(let i=0;i<200&&HL.DATA.sevilleTownIntegration.asset.status==='loading';i++)await new Promise(resolve=>setTimeout(resolve,20));
  game.renderTown();
  assert.equal(HL.DATA.sevilleTownIntegration.asset.status,'ready');assert.equal(HL.DATA.sevilleTownIntegration.asset.committed,true);
  const newWorld=new HL.CollisionWorld(.28);let walked=null;
  for(let y=.5;y<35.5&&!walked;y+=.25)for(let x=.5;x<63.5&&!walked;x+=.25)if(Math.hypot(x-32,y-31.5)>2&&!newWorld.blocked(map.collision,x,y)&&!oldWorld.blocked(oldCollision,x,y))walked=[x,y];
  assert(walked,'found a moved position safe on both the committed and old maps');
  game.s.town={x:walked[0],y:walked[1],dir:2};game.ensureSafePosition();assert.deepEqual([game.s.town.x,game.s.town.y],walked,'walked position remains valid on committed map');
  game.save();const slotKey=game.e.slotKey(game.s.slot),savedAfterWalk=localStorage.getItem(slotKey),storedAfterWalk=JSON.parse(savedAfterWalk);assert(savedAfterWalk,'walked state was persisted');
  const expectedProtected=protectedState(storedAfterWalk),loadedGame=new HL.Game();loadedGame.e.canvas=harness.canvas;loadedGame.e.ctx=harness.canvas.getContext('2d');loadedGame.resume(75);assert.equal(loadedGame.s.version,21);assert.equal(loadedGame.s.slot,75);assert.equal(protectedState(loadedGame.s),expectedProtected,'save/load preserves campaign and resources before draw failure');assert.deepEqual([loadedGame.s.town.x,loadedGame.s.town.y],walked,'save/load restores the walked Seville position');
  const loadedTown={...loadedGame.s.town};let failOnce=true;const originalDrawActor=loadedGame.art.drawActorV19;
  loadedGame.art.drawActorV19=function(...args){if(failOnce){failOnce=false;throw Error('simulated post-commit draw failure after save/load on second game')}return originalDrawActor.apply(this,args)};
  loadedGame.renderTown();loadedGame.art.drawActorV19=originalDrawActor;
  assert.equal(HL.DATA.sevilleTownIntegration.asset.status,'error');assert.equal(HL.DATA.sevilleTownIntegration.asset.committed,false);
  assert.strictEqual(map.visual,oldVisual,'post-commit failure restores pristine visual');assert.strictEqual(map.collision,oldCollision,'post-commit failure restores pristine collision');assert.strictEqual(map.spawn,oldSpawn,'post-commit failure restores pristine spawn');assert.equal(Object.keys(HL.DATA.townDefinitionsV19).length,oldTownCount,'post-commit failure preserves town registry');
  assert(!oldWorld.blocked(oldCollision,loadedGame.s.town.x,loadedGame.s.town.y),'rollback chooses a safe old-map player position');assert.deepEqual([loadedGame.s.town.x,loadedGame.s.town.y],[loadedTown.x,loadedTown.y],'current safe old-map position is preserved after rollback');assert.deepEqual([loadedGame.lastSafe.x,loadedGame.lastSafe.y],[loadedGame.s.town.x,loadedGame.s.town.y],'lastSafe follows the old-map recovery position');assert.equal(loadedGame.playerVelocity.x,0);assert.equal(loadedGame.playerVelocity.y,0);
  assert(loadedGame.npcs.every(npc=>!oldWorld.blocked(oldCollision,npc.x,npc.y)),'rollback respawns NPCs on old-map-safe positions');assert(loadedGame.s.partyFollowerState.history.every(actor=>!oldWorld.blocked(oldCollision,actor.x,actor.y)),'rollback keeps follower history old-map-safe');
  assert.equal(localStorage.getItem(slotKey),savedAfterWalk,'draw failure does not rewrite the loaded save');assert.equal(protectedState(loadedGame.s),expectedProtected,'draw failure preserves campaign and resource fields');
  console.log(JSON.stringify({postCommit:'PASS',asset:HL.DATA.sevilleTownIntegration.asset.status,committed:HL.DATA.sevilleTownIntegration.asset.committed,walked,rollbackTown:[loadedGame.s.town.x,loadedGame.s.town.y],safePositionPreserved:true,secondGameBaseline:true,saveUnchanged:true,campaignResourcesPreserved:true}));
})().catch(error=>{console.error(error);process.exitCode=1});
