'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const {createCanvas,Image:CanvasImage,loadImage}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scriptFiles=[...index.matchAll(/<script\s+src="([^"]+)"\s*><\/script>/g)].map(match=>match[1].split('?')[0]);
assert(!scriptFiles.includes('interior_kit_v21.js'),'legacy interior kit is not in index execution');

const canvas=createCanvas(960,540),makeElement=()=>({innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){}},addEventListener(){},insertAdjacentHTML(){},querySelectorAll(){return[]},querySelector(){return null},firstElementChild:null});
const elements={'#world':canvas,'#hud':makeElement(),'#overlay':makeElement(),'#toast':makeElement(),'#help':makeElement()};
global.window=global;global.HL={};global.document={querySelector:selector=>elements[selector]||null,getElementById:()=>null,createElement:type=>type==='canvas'?createCanvas(48,72):makeElement(),activeElement:null};
global.addEventListener=()=>{};Object.defineProperty(global,'navigator',{value:{getGamepads:()=>[]},configurable:true});global.requestAnimationFrame=()=>1;global.confirm=()=>false;global.prompt=()=>null;global.performance={now:()=>4200};
global.localStorage={data:new Map(),getItem(key){return this.data.get(key)??null},setItem(key,value){this.data.set(key,value)},removeItem(key){this.data.delete(key)}};
global.indexedDB={open(){return{}}};global.Audio=class{addEventListener(){}load(){}play(){return Promise.resolve()}pause(){}};
class LocalImage extends CanvasImage{
  set src(value){
    this._src=value;const clean=String(value).split('?')[0];
    const onload=this.onload,onerror=this.onerror;this.onload=null;this.onerror=null;
    try{
      const filename=path.resolve(root,clean);if(!fs.existsSync(filename))throw Error(`missing image ${filename}`);
      super.src=filename;
      const nativeReady=new Promise((resolve,reject)=>{const started=Date.now(),poll=()=>{if(this.width>0)return resolve();if(Date.now()-started>3000)return reject(Error(`native image timeout ${filename}`));setTimeout(poll,5)};poll()});
      const boundedLoad=Promise.race([loadImage(filename),new Promise((resolve,reject)=>setTimeout(()=>reject(Error(`image decode timeout ${filename}`)),1500))]);
      this._decodePromise=Promise.all([boundedLoad,nativeReady]).then(([decoded])=>{this._decoded=decoded;onload?.();return decoded},error=>{onerror?.(error);throw error});
      this._decodePromise.catch(()=>{});
    }catch(error){this._decodePromise=Promise.reject(error);this._decodePromise.catch(()=>{});onerror?.(error)}
  }
  get src(){return this._src}
  get naturalWidth(){return this.width}
  get naturalHeight(){return this.height}
  get complete(){return this.width>0}
  decode(){return this._decodePromise||Promise.reject(Error('image source not assigned'))}
}
global.Image=LocalImage;
for(const file of scriptFiles)vm.runInThisContext(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});

const e=canvas.getContext('2d'),drawSources=[],drawRecords=[],rawDrawImage=e.drawImage.bind(e);let renderOverride=null;e.drawImage=(source,...args)=>{drawSources.push(source);drawRecords.push({source,alpha:e.globalAlpha,width:source?.width||0,height:source?.height||0,args});const actual=renderOverride?.source===source?renderOverride.image:source;return rawDrawImage(actual,...args)};
const game=new HL.Game();game.e.ctx=e;game.e.canvas=canvas;
const out=path.resolve(root,'../Docs/Screenshots/StartPortArt/GameRenderInterior');fs.mkdirSync(out,{recursive:true});
const withTimeout=(promise,label,ms=10000)=>Promise.race([promise,new Promise((resolve,reject)=>setTimeout(()=>reject(Error(`${label} timed out after ${ms}ms`)),ms))]);
async function preloadActors(art,scene,captainId){
  art.ensureV20();art.ensureV12();const manifest=HL.DATA.captainSpriteManifestsV20[captainId];
  if(manifest)art.captainSpriteRendererV20.images[manifest.images.town]=await loadImage(path.resolve(root,manifest.images.town));
  for(const npc of scene.npcs||[]){const recipe=HL.DATA.appearanceRecipeV12(npc.appearanceId||npc.id);for(const src of Object.values(recipe?.sheet||{}))if(!art.spriteRendererV12.images[src])art.spriteRendererV12.images[src]=await loadImage(path.resolve(root,src))}
}
function sampledStats(pixels){const colors=new Set();let nonBlack=0,total=0;for(let y=0;y<540;y+=8)for(let x=0;x<960;x+=8){const i=(y*960+x)*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];colors.add(`${r>>3},${g>>3},${b>>3}`);if(r+g+b>30)nonBlack++;total++}return{colors,nonBlack,total}}
function sourceFrame(record){const source=createCanvas(960,540),ctx=source.getContext('2d'),iw=record.image.naturalWidth||record.image.width,ih=record.image.naturalHeight||record.image.height,scale=Math.min(960/iw,540/ih),w=iw*scale,h=ih*scale,ox=(960-w)/2,oy=(540-h)/2;ctx.fillStyle='#000';ctx.fillRect(0,0,960,540);ctx.imageSmoothingEnabled=false;ctx.drawImage(record.image,0,0,iw,ih,ox,oy,w,h);return ctx.getImageData(0,0,960,540).data}
function matchingSamples(source,frame){let matches=0,total=0,nonBlackMatches=0;for(let y=0;y<540;y+=16)for(let x=0;x<960;x+=16){const i=(y*960+x)*4,sr=source[i],sg=source[i+1],sb=source[i+2];if(sr+sg+sb<=30)continue;const d=Math.abs(sr-frame[i])+Math.abs(sg-frame[i+1])+Math.abs(sb-frame[i+2]);total++;if(d<=12)matches++;if(frame[i]+frame[i+1]+frame[i+2]>30)nonBlackMatches++}return{matches,total,ratio:total?matches/total:0,nonBlackMatches,nonBlackRatio:total?nonBlackMatches/total:0}}
async function expectDecodeError(){const image=new LocalImage(),result=await withTimeout(new Promise(resolve=>{image.onload=()=>resolve('loaded');image.onerror=()=>resolve('error');image.src=path.join(root,'index.html')}),'malformed bitmap',2000);assert.equal(result,'error','malformed bitmap rejects through adapter')}
async function main(){
  await expectDecodeError();await withTimeout(HL.StartPortInteriors.ready,'interior scene readiness',15000);
  assert.equal(HL.InteriorSceneManifest.mappings.length,11);
  const rendered=[],layerEvidence={},negativeControls={};
  for(const [key,record] of Object.entries(HL.StartPortInteriors.records)){
    assert.equal(record.status,'ready',`${key}: ${record.error}`);assert(record.image.width>0&&record.image.height>0,`${key}: decoded image`);
    assert.equal(typeof HL.DATA.floorCollisionMasksV21[record.definition.port][record.definition.facility][record.definition.floor],'string',`${key}: collision mask registry remains an asset path`);
    const captainId=Object.entries(HL.DATA.openingWakeDefinitionsV21.captainPort).find(([,port])=>port===record.definition.port)?.[0]||'rian';
    await preloadActors(game.art,record.scene,captainId);
    const state=HL.migrateStateV21(HL.Game.freshState());state.currentPort=record.definition.port;state.mode='interior';state.captainId=captainId;state.openingWakeV21={completed:true,reveal:1};state.partyFollowerState={render:[],history:[]};state.interior={id:record.definition.facility,buildingId:record.definition.facility,floorId:record.definition.floor,x:record.scene.spawn[0],y:record.scene.spawn[1],dir:4};
    game.s=state;game.mode='interior';game.startportSceneStamp=null;game.playerMoving=false;game.playerAnim=.7;game.npcs=[];
    const sourcePixels=sourceFrame(record),calls=HL.StartPortInteriors.diagnostics.renderer.calls;drawSources.length=0;drawRecords.length=0;game.renderInterior();
    assert.equal(HL.StartPortInteriors.diagnostics.renderer.calls,calls+1,`${key}: Game.renderInterior call`);
    assert.equal(HL.StartPortInteriors.diagnostics.renderer.last.status,'ready',`${key}: renderer status`);
    assert.equal(HL.StartPortInteriors.diagnostics.renderer.last.source,record.asset.source,`${key}: rendered source`);assert(drawSources.includes(record.image),`${key}: decoded record image reached ctx.drawImage`);
    const layers=drawRecords.map(({source,alpha,width,height,args})=>({source:source===record.image?'candidate-background':'actor-layer',alpha,width,height,args}));
    assert(layers.filter(layer=>layer.source==='actor-layer').every(layer=>layer.alpha===1),`${key}: actor layers render at full alpha`);
    if(key==='seville:guild:1f'||key==='seville:lodge:2f')layerEvidence[key]=layers;
    const framePixels=e.getImageData(0,0,960,540).data,sourceStats=sampledStats(sourcePixels),frameStats=sampledStats(framePixels),matches=matchingSamples(sourcePixels,framePixels);assert(sourceStats.colors.size>16,`${key}: source color diversity`);assert(frameStats.colors.size>=Math.max(12,Math.floor(sourceStats.colors.size*.2)),`${key}: rendered color diversity`);assert(frameStats.nonBlack>=Math.max(40,Math.floor(sourceStats.nonBlack*.15)),`${key}: rendered non-black coverage`);assert(matches.ratio>=.8,`${key}: rendered pixels match contain-scaled source (${(matches.ratio*100).toFixed(1)}%)`);assert(matches.nonBlackRatio>=.8,`${key}: rendered non-black samples retained (${(matches.nonBlackRatio*100).toFixed(1)}%)`);
    if(key==='seville:lodge:2f'){
      const other=Object.values(HL.StartPortInteriors.records).find(candidate=>candidate!==record&&candidate.status==='ready'),black=createCanvas(1,1),blackCtx=black.getContext('2d');blackCtx.fillStyle='#000';blackCtx.fillRect(0,0,1,1);
      renderOverride={source:record.image,image:black};drawSources.length=0;drawRecords.length=0;game.renderInterior();const blackMatch=matchingSamples(sourcePixels,e.getImageData(0,0,960,540).data);assert(blackMatch.ratio<.8,'black background negative control must fail source match');assert(blackMatch.nonBlackRatio<.8,'black background negative control must fail non-black match');
      renderOverride={source:record.image,image:other.image};drawSources.length=0;drawRecords.length=0;game.renderInterior();const differentMatch=matchingSamples(sourcePixels,e.getImageData(0,0,960,540).data);assert(differentMatch.ratio<.8,'different image negative control must fail source match');renderOverride=null;negativeControls.black=blackMatch;negativeControls.differentImage=differentMatch;drawSources.length=0;drawRecords.length=0;game.renderInterior();assert.equal(HL.StartPortInteriors.diagnostics.renderer.last.status,'ready','negative controls restore a genuine render before capture');
    }
    for(const [width,height] of [[1280,720],[1920,1080],[2880,1620]]){const scaled=createCanvas(width,height),ctx=scaled.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(canvas,0,0,width,height);const name=`${key.replaceAll(':','_')}_${width}x${height}.png`;fs.writeFileSync(path.join(out,name),scaled.toBuffer('image/png'));rendered.push(name)}
  }
  const failureRecord=HL.StartPortInteriors.records['seville:lodge:2f'],failureState=HL.migrateStateV21(HL.Game.freshState());failureState.currentPort='seville';failureState.mode='interior';failureState.captainId='ines';failureState.openingWakeV21={completed:true,reveal:1};failureState.partyFollowerState={render:[],history:[]};failureState.interior={id:'lodge',buildingId:'lodge',floorId:'2f',x:failureRecord.scene.spawn[0],y:failureRecord.scene.spawn[1],dir:4};game.s=failureState;game.mode='interior';game.startportSceneStamp=null;
  const drawActor=game.art.drawActorV19;let failOnce=true;game.art.drawActorV19=function(...args){if(failOnce){failOnce=false;throw Error('simulated renderer failure')}return drawActor.apply(this,args)};game.renderInterior();game.art.drawActorV19=drawActor;
  assert.equal(failureRecord.status,'error','renderer failure invalidates record');assert.equal(HL.DATA.buildingScenes.seville.lodge.floors['2f'],failureRecord.previous,'renderer failure restores building registry');assert.equal(HL.DATA.floorVisualSetsV21.seville.lodge['2f'],failureRecord.bindings.find(b=>b.name==='floorVisualSetsV21').value,'renderer failure restores visual registry');assert.equal(game.interiorScene(),failureRecord.previous,'renderer failure restores active scene');assert(!game.collision.blocked(game.interiorScene().collision,game.s.interior.x,game.s.interior.y,.28),'renderer failure repairs safe position');
  const report=HL.StartPortInteriors.diagnostics.snapshot();assert.equal(report.renderer.ready,14);assert.equal(report.renderer.fallbacks,1);assert.equal(report.renderer.last.source,failureRecord.asset.source);assert.equal(report.registry['seville:lodge:2f'].buildingScenes,'previous');assert.equal(report.asset.ready,11);assert.equal(report.asset.failed,0);const result={rendered:rendered.length,out,captureMode:'offline internal 960x540 Game.renderInterior canvas scaled to 1280x720, 1920x1080, and 2880x1620; not responsive UI captures',scriptFiles:scriptFiles.slice(-6),negativeControls,layerEvidence,diagnostics:report};fs.writeFileSync(path.join(out,'diagnostics.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1});
