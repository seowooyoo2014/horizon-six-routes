const fs=require('fs'),path=require('path'),vm=require('vm');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
require('./boot_v21.js');
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'../seville_quality.js'),'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(__dirname,'../seville_town.js'),'utf8'));
setImmediate(async()=>{
  try{
    document.createElement=()=>createCanvas(48,72);
    const root=path.join(__dirname,'..'),out=path.resolve(root,'../Docs/Screenshots/SevilleQuality');fs.mkdirSync(out,{recursive:true});
    const art=new HL.Art({get(){return null}});art.ensureV21();art.ensureV12();
    const m=HL.DATA.captainSpriteManifestsV20.ines;
    art.captainSpriteRendererV20.images[m.images.town]=await loadImage(path.resolve(root,m.images.town));
    const canvas=createCanvas(960,540),ctx=canvas.getContext('2d'),e={ctx,clear(color){ctx.fillStyle=color;ctx.fillRect(0,0,960,540)},text(t,x,y,color,align,size){ctx.fillStyle=color;ctx.font=`${size}px sans-serif`;ctx.textAlign=align;ctx.fillText(t,x,y)}};
    for(const [id,scene] of Object.entries(HL.DATA.sevilleQualityLayouts)){
      art.assetLoadStateV21[scene.visual.background]={status:'ready',image:await loadImage(path.resolve(root,scene.visual.background))};
      for(const npc of scene.npcs){const src=HL.DATA.appearanceRecipeV12(npc.appearanceId).sheet.town;art.spriteRendererV12.images[src]=await loadImage(path.resolve(root,src))}
      const pos={x:scene.spawn[0],y:scene.spawn[1],dir:4},game={e,s:{captainId:'ines',partyFollowerState:{render:[]}},playerMoving:false,playerAnim:0};
      art.v21Interior(game,scene,pos);
      const filename=id.replace(':','_');fs.writeFileSync(path.join(out,`${filename}_renderer.png`),canvas.toBuffer('image/png'));
      for(const [w,h] of [[1280,720],[1920,1080],[2880,1620]]){const scaled=createCanvas(w,h),c=scaled.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(canvas,0,0,w,h);fs.writeFileSync(path.join(out,`${filename}_${w}x${h}_static.png`),scaled.toBuffer('image/png'))}
      ctx.fillStyle='rgba(230,40,60,.20)';for(const r of scene.collision.solids)ctx.fillRect(...r.map(v=>v*24));
      for(const h of [...scene.hotspots,...scene.stairs]){ctx.strokeStyle='#40ff90';ctx.strokeRect(...h.rect.map(v=>v*24))}
      fs.writeFileSync(path.join(out,`${filename}_collision.png`),canvas.toBuffer('image/png'));
    }
    const town=HL.DATA.sevilleTownQuality;
    art.assetLoadStateV21[town.visual.background]={status:'ready',image:await loadImage(path.resolve(root,town.visual.background))};
    for(const npc of town.npcs){const src=HL.DATA.appearanceRecipeV12(npc.appearanceId||npc.id).sheet.town;art.spriteRendererV12.images[src]=await loadImage(path.resolve(root,src))}
    for(const [label,position] of [['square',[32,20]],['guild',[45.25,11.5]],['lodge',[57.55,11.5]],['pier',town.spawn]]){
      const s={captainId:'ines',currentPort:'seville',town:{x:position[0],y:position[1],dir:4},partyFollowerState:{render:[]}};
      art.town({e,s,npcs:town.npcs,playerMoving:false,playerAnim:0});
      fs.writeFileSync(path.join(out,`town_${label}_renderer.png`),canvas.toBuffer('image/png'));
      for(const [w,h] of [[1280,720],[1920,1080],[2880,1620]]){const output=createCanvas(w,h),c=output.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(canvas,0,0,w,h);fs.writeFileSync(path.join(out,`town_${label}_${w}x${h}_static.png`),output.toBuffer('image/png'))}
    }
    console.log(`Static game-renderer captures (NOT browser gameplay): ${out}`);
  }catch(error){console.error(error);process.exitCode=1}
});
