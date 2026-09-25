const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {createCanvas, loadImage, ImageData} = require('@napi-rs/canvas');
const dir = __dirname;
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const saveJson = (name, value) => fs.writeFileSync(path.join(dir,name),JSON.stringify(value,null,2)+'\n');
const inside = (x,y,p) => {
  let hit=false;
  for(let i=0,j=p.length-1;i<p.length;j=i++) {
    const [xi,yi]=p[i],[xj,yj]=p[j];
    if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)hit=!hit;
  }
  return hit;
};
function bounds(points) {
  const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  return [Math.floor(Math.min(...xs)),Math.floor(Math.min(...ys)),Math.ceil(Math.max(...xs))-Math.floor(Math.min(...xs))+1,Math.ceil(Math.max(...ys))-Math.floor(Math.min(...ys))+1];
}
function closeAndFill(mask,w,h) {
  const dil=new Uint8Array(w*h),closed=new Uint8Array(w*h);
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++)if(mask[y*w+x])for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)dil[(y+dy)*w+x+dx]=1;
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){let hit=true;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(!dil[(y+dy)*w+x+dx])hit=false;if(hit)closed[y*w+x]=1;}
  const exterior=new Uint8Array(w*h),queue=[];
  const add=i=>{if(!closed[i]&&!exterior[i]){exterior[i]=1;queue.push(i);}};
  for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
  for(let at=0;at<queue.length;at++){const i=queue[at],x=i%w,y=Math.floor(i/w);if(x)add(i-1);if(x<w-1)add(i+1);if(y)add(i-w);if(y<h-1)add(i+w);}
  const result=closed.map((v,i)=>v||!exterior[i]?1:0),visited=new Uint8Array(w*h);
  for(let seed=0;seed<result.length;seed++)if(result[seed]&&!visited[seed]){
    const component=[seed];visited[seed]=1;
    for(let k=0;k<component.length;k++){const i=component[k],x=i%w,y=Math.floor(i/w);for(const j of [x?i-1:-1,x<w-1?i+1:-1,y?i-w:-1,y<h-1?i+w:-1])if(j>=0&&result[j]&&!visited[j]){visited[j]=1;component.push(j);}}
    if(component.length<6)for(const i of component)result[i]=0;
  }
  return result;
}
function canvasFromPixels(pixels,w,h) {const c=createCanvas(w,h);c.getContext('2d').putImageData(new ImageData(pixels,w,h),0,0);return c;}
async function extractForeground() {
  const traces=JSON.parse(fs.readFileSync(path.join(dir,'foreground_traces.json'))),sourcePath=path.resolve(dir,traces.source),sourceBytes=fs.readFileSync(sourcePath);
  if(hash(sourceBytes)!==traces.sourceSha256)throw Error('Town source hash changed');
  const source=await loadImage(sourcePath),W=source.width,H=source.height,sourceCanvas=createCanvas(W,H),ctx=sourceCanvas.getContext('2d');ctx.drawImage(source,0,0);
  const pixels=ctx.getImageData(0,0,W,H).data,combined=new Uint8ClampedArray(W*H*4),objects=[];
  fs.mkdirSync(path.join(dir,'foreground_objects'),{recursive:true});
  for(const object of traces.objects){
    const pts=object.type==='tree'?[...object.canopy,...object.trunk]:object.polygon;
    const [x,y,w,h]=bounds(pts),selection=new Uint8Array(w*h);
    for(let v=0;v<h;v++)for(let u=0;u<w;u++){
      const px=x+u+.5,py=y+v+.5,i=((y+v)*W+x+u)*4;
      if(object.type==='awning'){if(inside(px,py,object.polygon))selection[v*w+u]=1;continue;}
      if(!inside(px,py,object.canopy))continue;
      const r=pixels[i],g=pixels[i+1],b=pixels[i+2];
      const leaf=g>=r*.92&&g>b*1.32&&g-b>12;
      const fruit=r>g*1.28&&g>b*1.4&&r-b>55;
      if(leaf||fruit)selection[v*w+u]=1;
    }
    const mask=object.type==='tree'?closeAndFill(selection,w,h):selection;
    const output=new Uint8ClampedArray(w*h*4);let count=0;
    for(let v=0;v<h;v++)for(let u=0;u<w;u++){
      const px=x+u+.5,py=y+v+.5,i=((y+v)*W+x+u)*4,k=(v*w+u)*4;
      const chosen=object.type==='tree'?(mask[v*w+u]&&inside(px,py,object.canopy))||inside(px,py,object.trunk):mask[v*w+u];
      if(!chosen)continue;
      output.set([pixels[i],pixels[i+1],pixels[i+2],255],k);combined.set([pixels[i],pixels[i+1],pixels[i+2],255],i);count++;
    }
    if(count<20)throw Error('Empty object '+object.id);
    const filename=`foreground_objects/${object.id}.png`,canvas=canvasFromPixels(output,w,h);fs.writeFileSync(path.join(dir,filename),canvas.toBuffer('image/png'));
    objects.push({...object,filename,sourceRect:[x,y,w,h],anchorLocal:[object.anchor[0]-x,object.anchor[1]-y],anchorTile:[object.anchor[0]*64/W,object.anchor[1]*36/H],opaquePixels:count});
  }
  const fg=canvasFromPixels(combined,W,H),file='seville_foreground_registered_1672x941.png';fs.writeFileSync(path.join(dir,file),fg.toBuffer('image/png'));
  const png=await loadImage(path.join(dir,file)),check=createCanvas(W,H),cc=check.getContext('2d');cc.drawImage(png,0,0);const read=cc.getImageData(0,0,W,H).data;
  let opaque=0,clear=0,partial=0,mismatch=0;for(let i=0;i<read.length;i+=4){if(read[i+3]===0)clear++;else{opaque++;if(read[i+3]!==255)partial++;if(read[i]!==pixels[i]||read[i+1]!==pixels[i+1]||read[i+2]!==pixels[i+2])mismatch++;}}
  if(partial||mismatch||!clear||!opaque)throw Error('Foreground alpha/registration failed');
  const proof=createCanvas(W,H),pc=proof.getContext('2d');pc.drawImage(source,0,0);pc.drawImage(png,0,0);const proofData=pc.getImageData(0,0,W,H).data;let proofMismatch=0;for(let i=0;i<proofData.length;i++)if(proofData[i]!==pixels[i])proofMismatch++;
  if(proofMismatch)throw Error('Registration composite differs');
  const preview=createCanvas(W,H),pv=preview.getContext('2d');pv.fillStyle='#c33795';pv.fillRect(0,0,W,H);pv.drawImage(fg,0,0);fs.writeFileSync(path.join(dir,'foreground_silhouette_review.png'),preview.toBuffer('image/png'));
  const contact=createCanvas(960,Math.ceil(objects.length/6)*180),ct=contact.getContext('2d');ct.imageSmoothingEnabled=false;ct.fillStyle='#a63283';ct.fillRect(0,0,contact.width,contact.height);
  for(let i=0;i<objects.length;i++){const o=objects[i],im=await loadImage(path.join(dir,o.filename)),x=(i%6)*160,y=Math.floor(i/6)*180;const s=Math.min(140/im.width,145/im.height);ct.drawImage(im,x+(160-im.width*s)/2,y,Math.round(im.width*s),Math.round(im.height*s));ct.fillStyle='#fff';ct.font='11px sans-serif';ct.fillText(o.id,x+4,y+168);}
  fs.writeFileSync(path.join(dir,'foreground_object_contact.png'),contact.toBuffer('image/png'));
  const manifest={schema:'seville-foreground-assets.v1',source:traces.source,sourceSha256:traces.sourceSha256,sourceSize:[W,H],foreground:file,foregroundSha256:hash(fs.readFileSync(path.join(dir,file))),origin:'top-left',registeredOffset:[0,0],tileTransform:[64/W,36/H],scope:traces.selection,objects,verification:{opaquePixels:opaque,transparentPixels:clear,partialAlphaPixels:partial,sourceRgbMismatches:mismatch,recompositeChannelMismatches:proofMismatch},artReview:'pending',runtimeInstalled:false};saveJson('foreground_manifest.json',manifest);
  console.log(JSON.stringify({foreground:manifest.verification,objects:objects.length}));
}
async function prepareSeria() {
  const filename='seria_bagfree_design_v2_source.png',bytes=fs.readFileSync(path.join(dir,filename)),image=await loadImage(path.join(dir,filename));
  const source=createCanvas(image.width,image.height),sc=source.getContext('2d');sc.drawImage(image,0,0);const pixels=sc.getImageData(0,0,image.width,image.height).data;
  const order=['N','NE','E','SE','S','SW','W','NW'],atlas=createCanvas(192,144),ac=atlas.getContext('2d'),frames=[];ac.imageSmoothingEnabled=false;fs.mkdirSync(path.join(dir,'seria_direction_frames'),{recursive:true});
  const matte=(r,g,b)=>r>100&&b>100&&g<Math.min(r,b)*.65;
  for(let n=0;n<8;n++){
    const cx=n%4,cy=Math.floor(n/4),x0=Math.round(cx*image.width/4),x1=Math.round((cx+1)*image.width/4),y0=Math.round(cy*image.height/2),y1=Math.round((cy+1)*image.height/2);
    let left=x1,right=x0,top=y1,bottom=y0;
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*image.width+x)*4;if(!matte(pixels[i],pixels[i+1],pixels[i+2])){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}}
    const sw=right-left+1,sh=bottom-top+1,scale=Math.min(60/sh,38/sw),w=Math.round(sw*scale),h=Math.round(sh*scale),ox=Math.round(24-w/2),oy=69-h;
    const data=new Uint8ClampedArray(48*72*4);let count=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const sx=left+Math.min(sw-1,Math.floor((x+.5)*sw/w)),sy=top+Math.min(sh-1,Math.floor((y+.5)*sh/h)),si=(sy*image.width+sx)*4,di=((oy+y)*48+ox+x)*4;if(matte(pixels[si],pixels[si+1],pixels[si+2]))continue;data.set([pixels[si],pixels[si+1],pixels[si+2],255],di);count++;}
    const frame=canvasFromPixels(data,48,72),file=`seria_direction_frames/${order[n]}.png`;fs.writeFileSync(path.join(dir,file),frame.toBuffer('image/png'));ac.drawImage(frame,cx*48,cy*72);
    frames.push({direction:order[n],file,atlasRect:[cx*48,cy*72,48,72],sourceCell:[x0,y0,x1-x0,y1-y0],sourceContent:[left,top,sw,sh],targetContent:[ox,oy,w,h],pivotTopLeft:[24,69],opaquePixels:count});
  }
  const atlasFile='seria_direction_design_48x72.png';fs.writeFileSync(path.join(dir,atlasFile),atlas.toBuffer('image/png'));
  const review=createCanvas(768,576),rc=review.getContext('2d');rc.imageSmoothingEnabled=false;rc.fillStyle='#243b45';rc.fillRect(0,0,768,576);rc.drawImage(atlas,0,0,768,576);fs.writeFileSync(path.join(dir,'seria_direction_design_contact_4x.png'),review.toBuffer('image/png'));
  const manifest={schema:'seria-eight-direction-design.v1',characterId:'ines',source:filename,sourceSha256:hash(bytes),sourceSize:[image.width,image.height],atlas:atlasFile,atlasSize:[192,144],frameSize:[48,72],pivotTopLeft:[24,69],directions:order,frames,processing:'Source magenta keyed to zero alpha, nearest-neighbor source-pixel sampling, uniform fit to 60px height/38px width, foot baseline y=69. No repaint, recolor or composited accessories.',purpose:'Eight direction design/key-pose frames only',animationFramesCompleted:0,requiredAnimationFrames:80,animationReady:false,artReview:'pending',runtimeInstalled:false};saveJson('seria_design_manifest.json',manifest);console.log(JSON.stringify({seriaFrames:frames.length,atlasSize:manifest.atlasSize,animationReady:false}));
}
async function compareCaptures(){
  const names=['seville_guild_1f_1920x1080.png','seville_lodge_2f_1280x720.png'],reports=[];
  for(const name of names){const beforePath=path.join('/tmp/horizon-v21-before-20260915',name),afterPath=path.resolve(dir,'../../Screenshots/StartPortArt/GameRenderInterior',name),before=await loadImage(beforePath),after=await loadImage(afterPath),w=after.width,h=after.height;const a=createCanvas(w,h),b=createCanvas(w,h);a.getContext('2d').drawImage(before,0,0);b.getContext('2d').drawImage(after,0,0);const pa=a.getContext('2d').getImageData(0,0,w,h).data,pb=b.getContext('2d').getImageData(0,0,w,h).data;let changed=0;for(let i=0;i<pa.length;i+=4)if(pa[i]!==pb[i]||pa[i+1]!==pb[i+1]||pa[i+2]!==pb[i+2])changed++;
    const regions=name.includes('guild')?[[1195,220,85,150],[918,805,90,143]]:[[375,230,62,88],[430,283,52,79]];const roi=[];for(let k=0;k<regions.length;k++){const [x,y,rw,rh]=regions[k];let diff=0;for(let v=y;v<y+rh;v++)for(let u=x;u<x+rw;u++){const i=(v*w+u)*4;if(pa[i]!==pb[i]||pa[i+1]!==pb[i+1]||pa[i+2]!==pb[i+2])diff++;}roi.push({region:regions[k],changedPixels:diff});const review=createCanvas(rw*6,rh*3),c=review.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(before,x,y,rw,rh,0,0,rw*3,rh*3);c.drawImage(after,x,y,rw,rh,rw*3,0,rw*3,rh*3);fs.writeFileSync(path.join(dir,`capture_compare_${name.replace('.png','')}_${k}.png`),review.toBuffer('image/png'));}
    reports.push({name,beforePath,afterPath,beforeSha256:hash(fs.readFileSync(beforePath)),afterSha256:hash(fs.readFileSync(afterPath)),changedPixels:changed,regions:roi,captureType:'offline actual rendering path, not browser'});
  }saveJson('interior_before_after.json',reports);console.log(JSON.stringify(reports.map(r=>({name:r.name,changedPixels:r.changedPixels,regions:r.regions}))));
}
async function main(){await extractForeground();await prepareSeria();await compareCaptures();}
main().catch(e=>{console.error(e);process.exitCode=1;});
