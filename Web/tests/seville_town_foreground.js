const assert=require("assert"),fs=require("node:fs"),path=require("node:path"),{createCanvas}=require("@napi-rs/canvas");
const {bootHtmlOrder}=require("./offline_html_order_harness.js");
const harness=bootHtmlOrder();
const originalCreateElement=document.createElement.bind(document);let scratchCanvasCreates=0;document.createElement=type=>{if(type==="canvas")scratchCanvasCreates++;return originalCreateElement(type)};
const evidenceDir=path.resolve(__dirname,"../../Docs/Screenshots/SevilleTown/GameRenderTown");

async function waitForImage(){
  for(let i=0;i<250&&HL.DATA.sevilleTownIntegration.asset.status==="loading";i++)await new Promise(resolve=>setTimeout(resolve,20));
}
function setupGame(){
  const game=new HL.Game();game.e.canvas=harness.canvas;game.e.ctx=harness.canvas.getContext("2d");
  game.s=HL.Game.freshState();game.s.captainId="ines";game.s.currentPort="seville";game.s.mode="town";game.s.town={x:1,y:1,dir:4};game.s.partyFollowerState={active:[],history:[],spacing:.72,render:[]};game.mode="town";game.spawnTownNpcs();return game;
}
function findOverlap(map,definitions){
  const world=new HL.CollisionWorld(.28),SW=1672,SH=941;let best=null,bestArea=-1;
  for(const definition of definitions){
    const [x,y,w,h]=definition.sourceRect,sortY=definition.anchorY*36/SH;
    for(let iy=.25;iy<36;iy+=.25)for(let ix=.25;ix<64;ix+=.25){
      const ax=ix*SW/64,ay=iy*SH/36,left=Math.max(x,ax-28),top=Math.max(y,ay-96),right=Math.min(x+w,ax+28),bottom=Math.min(y+h,ay);
      const width=right-left,height=bottom-top,area=width*height;if(iy<sortY&&width>0&&height>0&&area>bestArea&&!world.blocked(map.collision,ix,iy)){best={definition,position:[ix,iy]};bestArea=area}
    }
  }
  if(best)return best;throw Error("no reachable behind-actor foreground overlap sample");
}
function capture(game,name,width,height){
  const canvas=createCanvas(width,height),ctx=canvas.getContext("2d");ctx.scale(width/960,height/540);game.e.canvas=canvas;game.e.ctx=ctx;game.renderTown();const file=path.join(evidenceDir,name);fs.mkdirSync(evidenceDir,{recursive:true});fs.writeFileSync(file,canvas.toBuffer("image/png"));return{file,canvas};
}

function assertCaptureOverlap(capture,width,height,overlapPixel){
  const ctx=capture.canvas.getContext("2d"),centerX=Math.round(overlapPixel.px*width/960),centerY=Math.round(overlapPixel.py*height/540),expected=overlapPixel.expected,full=overlapPixel.full;let match=null;
  for(let y=Math.max(0,centerY-3);y<=Math.min(height-1,centerY+3)&&!match;y++)for(let x=Math.max(0,centerX-3);x<=Math.min(width-1,centerX+3);x++){const actual=Array.from(ctx.getImageData(x,y,1,1).data);if(actual.slice(0,3).every((value,channel)=>Math.abs(value-expected[channel])<=8)&&actual.slice(0,3).some((value,channel)=>Math.abs(value-full[channel])>3))match={x,y,actual}}
  assert(match,`capture contains the validated overlap pixel near ${centerX},${centerY}`);return match;
}
function registrationFrame(game,map,quality,position){
  const canvas=createCanvas(960,540),ctx=canvas.getContext("2d"),calls=[],native=ctx.drawImage.bind(ctx);ctx.drawImage=function(image,...args){const index=quality.asset.foreground.findIndex(record=>record.image===image);if(index>=0)calls.push({id:quality.foregroundDefinitions[index].id,index,args:[...args]});return native(image,...args)};
  game.e.canvas=canvas;game.e.ctx=ctx;game.s.town={x:position[0],y:position[1],dir:4};game.ensureSafePosition();const actual=[game.s.town.x,game.s.town.y];game.renderTown();const cam=game.art.v19Camera(map,{x:actual[0],y:actual[1]}),scale=quality.contain.scale,offset=quality.contain.offset;
  for(const call of calls){const definition=quality.foregroundDefinitions[call.index],[sx,sy,sw,sh,dx,dy,dw,dh]=call.args;assert(Number.isFinite(scale)&&Number.isFinite(cam.x)&&Number.isFinite(definition.sourceRect[0]),`${call.id} registration inputs position=${JSON.stringify(position)} actual=${JSON.stringify(actual)} cam=${JSON.stringify(cam)} scale=${scale}`);assert(Math.abs(dx-(offset[0]+definition.sourceRect[0]*scale-cam.x))<1e-6,`${call.id} source X registration actual=${dx} expected=${offset[0]+definition.sourceRect[0]*scale-cam.x}`);assert(Math.abs(dy-(offset[1]+definition.sourceRect[1]*scale-cam.y))<1e-6,`${call.id} source Y registration`);assert(Math.abs(dw-definition.sourceRect[2]*scale)<1e-6,`${call.id} source width registration`);assert(Math.abs(dh-definition.sourceRect[3]*scale)<1e-6,`${call.id} source height registration`);assert.equal(sx,0);assert.equal(sy,0);assert.equal(sw,definition.sourceRect[2]);assert.equal(sh,definition.sourceRect[3]);
    const sourceCanvas=createCanvas(sw,sh),sourceCtx=sourceCanvas.getContext("2d");sourceCtx.imageSmoothingEnabled=false;sourceCtx.drawImage(quality.asset.foreground[call.index].image,0,0);const sourceData=sourceCtx.getImageData(0,0,sw,sh).data,expectedCanvas=createCanvas(960,540),expectedCtx=expectedCanvas.getContext("2d");expectedCtx.imageSmoothingEnabled=false;expectedCtx.drawImage(quality.asset.foreground[call.index].image,0,0,sw,sh,dx,dy,dw,dh);const expectedData=expectedCtx.getImageData(0,0,960,540).data;let sample=null;for(let y=0;y<sh&&!sample;y++)for(let x=0;x<sw;x++){const i=(y*sw+x)*4;if(sourceData[i+3]>250){const sampleX=dx+(x+.5)*scale,sampleY=dy+(y+.5)*scale,px=Math.round(sampleX),py=Math.round(sampleY);if(sampleX>=0&&sampleX<960&&sampleY>=0&&sampleY<540&&px>=0&&px<960&&py>=0&&py<540){const offset=(py*960+px)*4,expectedPixel=Array.from(expectedData.slice(offset,offset+4)),actualPixel=Array.from(ctx.getImageData(px,py,1,1).data);if(expectedPixel[3]>250&&actualPixel.slice(0,3).every((value,channel)=>value===expectedPixel[channel]))sample={x,y,px,py,rgba:expectedPixel}}}}
    assert(sample,`${call.id} has a visible opaque registration sample`);const actualPixel=Array.from(ctx.getImageData(sample.px,sample.py,1,1).data);assert.deepEqual(actualPixel.slice(0,3),sample.rgba.slice(0,3),`${call.id} pixel registration at camera ${cam.x},${cam.y}: actual=${actualPixel} expected=${sample.rgba} px=${sample.px},${sample.py}`);
  }
  return{canvas,actual,cam,visible:calls.map(call=>call.id)};
}

function fixedCameraRender(game,quality,map,position,camera,foregroundEnabled){
  const canvas=createCanvas(960,540),ctx=canvas.getContext("2d"),originalCamera=game.art.v19Camera,originalImages=quality.asset.foreground.map(record=>record.image),blankImages=[];
  try{
    game.art.v19Camera=()=>camera;
    game.s.town={x:position[0],y:position[1],dir:4};game.ensureSafePosition();
    if(!foregroundEnabled)quality.asset.foreground.forEach((record,index)=>{const [,,w,h]=quality.foregroundDefinitions[index].sourceRect,blank=createCanvas(w,h);blankImages.push(blank);record.image=blank});
    game.e.canvas=canvas;game.e.ctx=ctx;game.renderTown();
    return{canvas,ctx,data:ctx.getImageData(0,0,960,540).data};
  }finally{quality.asset.foreground.forEach((record,index)=>{record.image=originalImages[index]});game.art.v19Camera=originalCamera}
}

function assertActualOverlapPixel(game,quality,map,overlap){
  const camera=game.art.v19Camera(map,{x:overlap.position[0],y:overlap.position[1]}),underlay=fixedCameraRender(game,quality,map,overlap.position,camera,false),full=fixedCameraRender(game,quality,map,map.spawn,camera,true),overlapFrame=fixedCameraRender(game,quality,map,overlap.position,camera,true),definition=overlap.definition,index=quality.foregroundDefinitions.findIndex(item=>item.id===definition.id),[sx,sy,sw,sh]=definition.sourceRect,sourceCanvas=createCanvas(sw,sh),sourceCtx=sourceCanvas.getContext("2d");sourceCtx.imageSmoothingEnabled=false;sourceCtx.drawImage(quality.asset.foreground[index].image,0,0);const sourceData=sourceCtx.getImageData(0,0,sw,sh).data,scale=quality.contain.scale,offset=quality.contain.offset,cam=camera;
  let evidence=null,visible=0,fullMatches=0,diffFromFull=0,expectedMatches=0,first=null;
  for(let y=0;y<sh&&!evidence;y++)for(let x=0;x<sw;x++){const sourceIndex=(y*sw+x)*4;if(sourceData[sourceIndex+3]<250)continue;const px=Math.round(offset[0]+(sx+x+.5)*scale-cam.x),py=Math.round(offset[1]+(sy+y+.5)*scale-cam.y);if(px<0||px>=960||py<0||py>=540)continue;visible++;const at=(py*960+px)*4,source=Array.from(sourceData.slice(sourceIndex,sourceIndex+4)),under=Array.from(underlay.data.slice(at,at+4)),fullPixel=Array.from(full.data.slice(at,at+4)),actual=Array.from(overlapFrame.data.slice(at,at+4)),expected=source.map((value,channel)=>channel<3?Math.round(value*.45+under[channel]*.55):255);if(fullPixel.slice(0,3).every((value,channel)=>value===source[channel])){fullMatches++;if(!first)first={x,y,px,py,source,under,full:fullPixel,actual,expected};if(actual.slice(0,3).some((value,channel)=>value!==fullPixel[channel]))diffFromFull++;if(actual.slice(0,3).every((value,channel)=>Math.abs(value-expected[channel])<=3))expectedMatches++;if(actual.slice(0,3).every((value,channel)=>Math.abs(value-expected[channel])<=3)&&actual.slice(0,3).some((value,channel)=>value!==fullPixel[channel]))evidence={x,y,px,py,source,under,full:fullPixel,actual,expected}}}
  const renderEntry=quality.asset.lastRender.find(event=>event.kind==="foreground"&&event.id===definition.id);assert(evidence,`actual overlap pixel exists for ${definition.id}; visible=${visible} fullMatches=${fullMatches} diffFromFull=${diffFromFull} expectedMatches=${expectedMatches} first=${JSON.stringify(first)} render=${JSON.stringify(renderEntry)} position=${JSON.stringify(overlap.position)} camera=${JSON.stringify(camera)}`);return evidence;
}

(async()=>{
  const game=setupGame();game.renderTown();await waitForImage();game.renderTown();
  const map=HL.DATA.townDefinitionsV19.seville,quality=HL.DATA.sevilleTownIntegration,definitions=quality.foregroundDefinitions;
  assert.equal(quality.asset.status,"ready",quality.asset.error);assert.equal(quality.asset.committed,true);
  const postCommitCanvasCreates=scratchCanvasCreates;
  const approved=definitions.map(definition=>definition.id);
  assert.equal(approved.length,14);assert.deepEqual(map.visual.foreground.map(definition=>definition.id),approved);
  assert(definitions.every(definition=>definition.sourceRect[2]===quality.asset.foreground[definitions.indexOf(definition)].image.width&&definition.sourceRect[3]===quality.asset.foreground[definitions.indexOf(definition)].image.height),"registered cutout dimensions are exact");
  game.npcs=[];game.s.partyFollowerState.render=[];
  const ctx=game.e.ctx,originalDrawImage=ctx.drawImage.bind(ctx),originalActor=game.art.drawActorV19,events=[];
  ctx.drawImage=function(image,...args){
    const foregroundIndex=quality.asset.foreground.findIndex(record=>record.image===image),kind=image===quality.asset.image?"background":foregroundIndex>=0?"foreground":"other";
    events.push({kind,id:foregroundIndex>=0?definitions[foregroundIndex].id:undefined,alpha:ctx.globalAlpha});return originalDrawImage(image,...args);
  };
  game.art.drawActorV19=function(canvas,id,x,y,...args){events.push({kind:"actor",id,alpha:canvas.globalAlpha,x,y});return originalActor.call(this,canvas,id,x,y,...args)};
  const renderAndCheck=(position,name)=>{
    events.length=0;game.s.town={x:position[0],y:position[1],dir:4};game.ensureSafePosition();const actualPosition=[game.s.town.x,game.s.town.y];game.renderTown();
    assert.equal(events.filter(event=>event.kind==="background").length,1,`${name} draws the committed background`);
    const renderLog=quality.asset.lastRender,renderObjects=renderLog.filter(event=>event.kind==="foreground");
    for(const id of approved)assert(renderObjects.some(event=>event.id===id),`${name} draws approved foreground ${id}`);
    if(name==="clear frame")for(const object of renderObjects.filter(event=>!event.culled))assert(events.some(event=>event.kind==="foreground"&&event.id===object.id),`${name} draws visible source PNG ${object.id}`);
    assert(renderObjects.every(event=>event.opacity===1||Math.abs(event.opacity-.45)<.02),`${name} uses only full or overlap opacity: ${JSON.stringify(renderObjects)}`);
    assert(events.filter(event=>event.kind==="actor").every(event=>event.alpha===1),`${name} never fades actor alpha`);
    return{actualPosition,events:events.map(event=>({...event})),renderLog:renderLog.map(event=>({...event}))};
  };
  const clearFrame=renderAndCheck(map.spawn,"clear frame");assert.equal(clearFrame.renderLog.filter(event=>event.kind==="foreground"&&event.masked).length,0,"clear frame has no false whole-object fade");
  const overlap=findOverlap(map,definitions),overlapFrame=renderAndCheck(overlap.position,"overlap frame");
  assert.deepEqual(overlapFrame.actualPosition,overlap.position,"overlap sample remains on its reachable source position");
  const faded=overlapFrame.renderLog.filter(event=>event.kind==="foreground"&&event.masked&&Math.abs(event.opacity-.45)<.02);assert(faded.length>0,`overlap frame selectively fades foreground pixels: ${JSON.stringify({overlap,masked:overlapFrame.renderLog.filter(event=>event.kind==="foreground"&&event.masked)})}`);
  const overlapPixel=assertActualOverlapPixel(game,quality,map,overlap);
  const actorIndex=overlapFrame.renderLog.findIndex(event=>event.kind==="actor"),objectIndex=overlapFrame.renderLog.findIndex(event=>event.kind==="foreground"&&event.id===overlap.definition.id);
  assert(actorIndex>=0&&objectIndex>=0);assert(actorIndex<objectIndex,"behind actor is drawn before its foreground occluder");
  assert.equal(overlapFrame.renderLog.filter(event=>event.kind==="foreground"&&event.id===overlap.definition.id).length,1,"overlap object is one depth layer with a clipped mask");
  const registrationSamples=[];for(let x=20;x<45&&registrationSamples.length<2;x+=.25)if(!new HL.CollisionWorld(.28).blocked(map.collision,x,map.spawn[1]))registrationSamples.push([x,map.spawn[1]+.13]);assert.equal(registrationSamples.length,2,"two fractional camera samples are walkable");
  const registration=registrationSamples.map(position=>registrationFrame(game,map,quality,position));assert(registration.every(frame=>frame.visible.length>0),"registration samples draw visible approved cutouts");
  const first=registrationFrame(game,map,quality,registrationSamples[0]),second=registrationFrame(game,map,quality,registrationSamples[0]);assert(first.canvas.toBuffer("image/png").equals(second.canvas.toBuffer("image/png")),"fractional no-NPC frame is bitwise idempotent");
  assert.equal(scratchCanvasCreates,postCommitCanvasCreates,"foreground scratch pool is reused after commit");assert(postCommitCanvasCreates>=4,"foreground scratch pool allocated four buffers");
  const normalCamera=game.art.v19Camera;game.art.v19Camera=normalCamera;game.s.town={x:overlap.position[0],y:overlap.position[1],dir:4};game.ensureSafePosition();assert.deepEqual([game.s.town.x,game.s.town.y],overlap.position,"final captures restore the validated overlap position");const clearCapture=capture(game,"seville_town_foreground_overlap_1920x1080.png",1920,1080),wideCapture=capture(game,"seville_town_foreground_overlap_2880x1620.png",2880,1620),capturePixels=[assertCaptureOverlap(clearCapture,1920,1080,overlapPixel),assertCaptureOverlap(wideCapture,2880,1620,overlapPixel)];
  console.log(JSON.stringify({status:"PASS",approved,overlap:{id:overlap.definition.id,position:overlap.position,maskedObjects:faded.length,pixel:{x:overlapPixel.x,y:overlapPixel.y,canvas:[overlapPixel.px,overlapPixel.py],actual:overlapPixel.actual,expected:overlapPixel.expected}},actorAlpha:1,scratchCanvases:{postCommit:postCommitCanvasCreates,addedAfterCommit:scratchCanvasCreates-postCommitCanvasCreates},registration:registration.map(frame=>({camera:frame.cam,visible:frame.visible})),captures:[clearCapture.file,wideCapture.file],capturePixels},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
