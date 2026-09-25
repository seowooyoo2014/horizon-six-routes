const fs = require('node:fs');
const path = require('node:path');
const {createCanvas, loadImage} = require('@napi-rs/canvas');
const root = path.resolve(__dirname, '../../..');
async function main() {
  const town = await loadImage(path.join(root, 'Docs/ArtProduction/SevilleSeria_20260913/seville_day_source_v2_review.png'));
  const crops = [[0,280,700,485], [660,300,440,450], [1060,280,585,490], [0,0,1672,290]];
  for (let i=0; i<crops.length; i++) {
    const [x,y,w,h]=crops[i], c=createCanvas(w*2,h*2), ctx=c.getContext('2d');
    ctx.imageSmoothingEnabled=false; ctx.drawImage(town,x,y,w,h,0,0,w*2,h*2);
    fs.writeFileSync(path.join(__dirname, `town_inspect_${i}.png`),c.toBuffer('image/png'));
  }
  const entries=[['owner_seville_guild','V12/NPC/tall_guildmaster_town.png',6,0],['caller_ines','V12/NPC/child_citizen_town.png',6,0],['ines','V20/Captains/ines_town_v20.png',4,2]];
  const stats=[];
  for(const [id,source,row,col] of entries){
    const image=await loadImage(path.join(root,'Assets/Resources/Sprites/Game',source));
    const c=createCanvas(48,72),ctx=c.getContext('2d');ctx.drawImage(image,col*48,row*72,48,72,0,0,48,72);
    const pixels=ctx.getImageData(0,0,48,72).data, hist={},colors={},body=[];
    for(let i=0;i<pixels.length;i+=4){const a=pixels[i+3];hist[a]=(hist[a]||0)+1;if(a>32){body.push(a);const rgb=Array.from(pixels.slice(i,i+3)).join(',');colors[rgb]=(colors[rgb]||0)+1;}}
    stats.push({id,source,row,col,alphaHistogram:hist,visibleCount:body.length,partialVisibleCount:body.filter(a=>a<255).length,meanVisibleAlpha:body.reduce((a,b)=>a+b,0)/body.length,topColors:Object.entries(colors).sort((a,b)=>b[1]-a[1]).slice(0,8)});
    const contact=createCanvas(384,288),cc=contact.getContext('2d');cc.imageSmoothingEnabled=false;cc.fillStyle='#243b45';cc.fillRect(0,0,384,288);cc.drawImage(c,0,0,192,288);
    const data=ctx.getImageData(0,0,48,72);for(let i=3;i<data.data.length;i+=4)data.data[i]=data.data[i]>32?255:0;ctx.putImageData(data,0,0);cc.drawImage(c,192,0,192,288);
    fs.writeFileSync(path.join(__dirname,`${id}_original_vs_alpha_normalized.png`),contact.toBuffer('image/png'));
  }
  fs.writeFileSync(path.join(__dirname,'original_sprite_inspection.json'),JSON.stringify(stats,null,2)+'\n');
  console.log(JSON.stringify(stats.map(({id,source,visibleCount,partialVisibleCount,meanVisibleAlpha,topColors})=>({id,source,visibleCount,partialVisibleCount,meanVisibleAlpha,topColors})),null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
