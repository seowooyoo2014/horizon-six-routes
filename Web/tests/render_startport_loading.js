'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { bootHtmlOrder, createLocalImageClass, root } = require('./offline_html_order_harness.js');

const withTimeout = (promise, label, ms = 10000) => Promise.race([
  promise,
  new Promise((resolve, reject) => setTimeout(() => reject(Error(`${label} timed out after ${ms}ms`)), ms))
]);

function stateFor(record, captainId = 'ines') {
  const state = HL.migrateStateV21(HL.Game.freshState());
  state.currentPort = record.definition.port;
  state.mode = 'interior';
  state.captainId = captainId;
  state.openingWakeV21 = { completed: true, reveal: 1 };
  state.partyFollowerState = { render: [], history: [] };
  state.interior = {
    id: record.definition.facility,
    buildingId: record.definition.facility,
    floorId: record.definition.floor,
    x: record.previous.spawn[0],
    y: record.previous.spawn[1],
    dir: 4
  };
  return state;
}

async function waitFor(predicate, label, ms = 4000) {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > ms) throw Error(`${label} timed out after ${ms}ms`);
    await new Promise(resolve => setTimeout(resolve, 5));
  }
}

async function main() {
  const ImageClass = createLocalImageClass({ delaySource: 'reference_01.png', errorSource: 'reference_02.png' });
  const { canvas } = bootHtmlOrder({ ImageClass });
  const ctx = canvas.getContext('2d');
  const drawSources = [];
  const rawDrawImage = ctx.drawImage.bind(ctx);
  ctx.drawImage = (source, ...args) => { drawSources.push(source); return rawDrawImage(source, ...args); };
  const game = new HL.Game();
  game.e.ctx = ctx;
  game.e.canvas = canvas;
  const out = path.resolve(root, '../Docs/Screenshots/StartPortArt/GameRenderInterior');
  fs.mkdirSync(out, { recursive: true });
  const delayed = HL.StartPortInteriors.records['seville:lodge:2f'];
  const decodeError = HL.StartPortInteriors.records['seville:market:2f'];
  assert.equal(delayed.status, 'loading', 'delayed scene remains loading before release');
  await waitFor(() => decodeError.status === 'error', 'decode-error scene failure');
  assert.match(decodeError.error, /simulated decode rejection/);

  const oldImageRecord = game.art.v21Image(delayed.previous.visual.background);
  await waitFor(() => oldImageRecord.status === 'ready', 'previous scene image readiness');
  game.s = stateFor(delayed);
  game.mode = 'interior';
  game.startportSceneStamp = null;
  game.playerVelocity = { x: 0, y: 0 };
  drawSources.length = 0;
  game.renderInterior();
  assert.equal(game.interiorScene(), delayed.previous, 'loading keeps previous active scene');
  assert.equal(game.interiorScene().collision, delayed.previous.collision, 'loading keeps previous collision');
  assert(drawSources.includes(oldImageRecord.image), 'loading renders the previous decoded image through Game.renderInterior');
  assert(!drawSources.includes(delayed.image), 'loading does not pass candidate image to ctx.drawImage');
  fs.writeFileSync(path.join(out, 'loading_reference_01_previous.png'), canvas.toBuffer('image/png'));

  ImageClass.release('reference_01.png');
  await withTimeout(HL.StartPortInteriors.ready, 'delayed scene readiness', 10000);
  assert.equal(delayed.status, 'ready', 'released decode activates candidate');
  assert.equal(HL.DATA.buildingScenes.seville.lodge.floors['2f'], delayed.scene, 'ready installs candidate building scene');
  assert.equal(HL.DATA.floorVisualSetsV21.seville.lodge['2f'], delayed.scene, 'ready installs candidate visual scene');
  game.s.interior.x = delayed.scene.spawn[0];
  game.s.interior.y = delayed.scene.spawn[1];
  game.ensureSafePosition();
  assert(!game.collision.blocked(delayed.scene.collision, game.s.interior.x, game.s.interior.y, .28), 'ready relocates actor to safe candidate position');
  drawSources.length = 0;
  game.renderInterior();
  assert(drawSources.includes(delayed.image), 'ready renders the new decoded image through Game.renderInterior');
  assert.equal(HL.StartPortInteriors.diagnostics.renderer.last.source, delayed.asset.source, 'ready diagnostics capture candidate source');
  fs.writeFileSync(path.join(out, 'loading_reference_01_ready.png'), canvas.toBuffer('image/png'));

  game.e.selectedSlot = 2;
  game.s.slot = 2;
  game.save();
  const saved = JSON.parse(global.localStorage.getItem(game.e.slotKey(2)));
  game.s.interior.x = delayed.scene.spawn[0] + 0.75;
  game.s.interior.y = delayed.scene.spawn[1] + 0.75;
  game.resume(2);
  assert.equal(game.mode, 'interior', 'reentry restores interior mode');
  assert.equal(game.interiorScene(), delayed.scene, 'reentry restores the activated scene');
  assert.equal(game.s.interior.floorId, saved.interior.floorId, 'reentry restores saved floor');
  assert.deepEqual([game.s.interior.x, game.s.interior.y], [saved.interior.x, saved.interior.y], 'reentry restores saved safe position');
  assert(!game.collision.blocked(delayed.scene.collision, game.s.interior.x, game.s.interior.y, .28), 'reentry position remains safe');

  game.s = stateFor(decodeError, 'rian');
  game.mode = 'interior';
  game.startportSceneStamp = null;
  drawSources.length = 0;
  const errorImageRecord = game.art.v21Image(decodeError.previous.visual.background);
  await waitFor(() => errorImageRecord.status === 'ready', 'decode-error previous image readiness');
  game.renderInterior();
  assert.equal(game.interiorScene(), decodeError.previous, 'decode error keeps previous active scene');
  assert.equal(game.interiorScene().collision, decodeError.previous.collision, 'decode error keeps previous collision');
  assert(drawSources.includes(errorImageRecord.image), 'decode error renders previous image through Game.renderInterior');
  assert.equal(HL.DATA.buildingScenes.seville.market.floors['2f'], decodeError.previous, 'decode error restores building registry');
  assert.equal(HL.DATA.floorVisualSetsV21.seville.market['2f'], decodeError.previous, 'decode error restores visual registry');
  const diagnostics = HL.StartPortInteriors.diagnostics.snapshot();
  assert.equal(diagnostics.registry['seville:market:2f'].buildingScenes, 'previous', 'decode error diagnostics capture restored building registry');
  fs.writeFileSync(path.join(out, 'loading_reference_02_decode_error.png'), canvas.toBuffer('image/png'));
  const report = {
    captureMode: 'offline internal 960x540 Game.renderInterior canvas; loading/fallback states, not browser or responsive UI captures',
    captures: [
      'loading_reference_01_previous.png',
      'loading_reference_01_ready.png',
      'loading_reference_02_decode_error.png'
    ],
    delayed: {
      key: delayed.key,
      loadingScene: 'previous',
      loadingCollision: 'previous',
      loadingRenderedSource: oldImageRecord.source || delayed.previous.visual.background,
      readyScene: 'candidate',
      readyCollision: 'candidate',
      readyRenderedSource: delayed.asset.source,
      actorSafe: !game.collision.blocked(delayed.scene.collision, delayed.scene.spawn[0], delayed.scene.spawn[1], .28)
    },
    decodeError: {
      key: decodeError.key,
      status: decodeError.status,
      scene: diagnostics.registry[decodeError.key].buildingScenes,
      collision: diagnostics.registry[decodeError.key].buildingScenes,
      renderedSource: errorImageRecord.source || decodeError.previous.visual.background
    },
    renderer: diagnostics.renderer
  };
  fs.writeFileSync(path.join(out, 'loading-diagnostics.json'), JSON.stringify(report, null, 2));

  console.log(JSON.stringify({
    delayed: 'loading -> decoded -> rendered',
    decodeError: 'decode rejection -> fallback rendered',
    saveReentry: 'restored',
    diagnostics: path.join(out, 'loading-diagnostics.json'),
    renderer: diagnostics.renderer,
    mode: 'offline HTML script order with native canvas decode; no browser or responsive UI'
  }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
