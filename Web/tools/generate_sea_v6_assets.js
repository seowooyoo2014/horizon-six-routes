const fs=require("fs");
const path=require("path");
const{createCanvas}=require("@napi-rs/canvas");

const output=path.resolve(__dirname,"../../Assets/Resources/Sprites/Game/SeaV6");
fs.mkdirSync(output,{recursive:true});

const palette={
  caravel:{hull:"#8d572f",dark:"#3b241b",trim:"#d0a04f",sail:"#eee2bd",accent:"#275f7a",length:50,width:20,masts:2},
  cog:{hull:"#755036",dark:"#30231d",trim:"#c78c45",sail:"#e8d3a6",accent:"#7c3c32",length:44,width:25,masts:1},
  galley:{hull:"#9b4d35",dark:"#3b1e1a",trim:"#ddae54",sail:"#dec997",accent:"#8b2830",length:56,width:16,masts:1},
  brig:{hull:"#604632",dark:"#231d19",trim:"#d0aa58",sail:"#e7ddbd",accent:"#274d67",length:54,width:22,masts:2}
};

function polygon(ctx,points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()}
function drawNorth(type,damaged=false){
  const p=palette[type],c=createCanvas(48,64),x=c.getContext("2d");x.imageSmoothingEnabled=false;x.clearRect(0,0,48,64);
  const top=32-p.length/2,bottom=32+p.length/2,half=p.width/2;
  polygon(x,[[24,top],[24+half*.72,top+7],[24+half,bottom-9],[24+half*.48,bottom],[24-half*.48,bottom],[24-half,bottom-9],[24-half*.72,top+7]],p.dark);
  polygon(x,[[24,top+2],[24+half*.58,top+8],[24+half*.77,bottom-10],[24+half*.38,bottom-3],[24-half*.38,bottom-3],[24-half*.77,bottom-10],[24-half*.58,top+8]],p.hull);
  x.fillStyle="#be8a50";x.fillRect(24-half*.48,top+10,half*.96,bottom-top-17);x.fillStyle=p.trim;x.fillRect(24-half*.62,top+8,Math.max(2,p.width-7),2);x.fillRect(24-half*.57,bottom-12,Math.max(2,p.width-6),2);
  if(type==="galley"){x.fillStyle="#d6c092";for(let y=top+11;y<bottom-7;y+=5){x.fillRect(7,y,13,1);x.fillRect(28,y,13,1)}}
  const mastYs=p.masts===2?[top+15,top+31]:[top+23];for(const my of mastYs){x.fillStyle="#3a2419";x.fillRect(23,my-8,2,18);x.fillStyle=p.sail;polygon(x,[[25,my-7],[35,my-2],[25,my+7]],damaged?"#9b8870":p.sail);x.fillStyle="#ae986f";x.fillRect(25,my-1,10,1)}
  x.fillStyle=p.accent;x.fillRect(20,bottom-10,8,4);x.fillStyle=p.trim;x.fillRect(21,bottom-9,6,1);x.fillStyle="#10171a";x.fillRect(22,bottom-5,4,2);
  if(damaged){x.fillStyle="#281b18";x.fillRect(17,top+19,4,3);x.fillRect(29,bottom-17,3,4);x.fillStyle="#6f3029";x.fillRect(24,top+9,2,5)}
  return c
}

for(const type of Object.keys(palette)){
  const sheet=createCanvas(96*8,128*2),ctx=sheet.getContext("2d");ctx.imageSmoothingEnabled=false;
  for(let damage=0;damage<2;damage++){const source=drawNorth(type,!!damage);for(let dir=0;dir<8;dir++){const cell=createCanvas(96,128),c=cell.getContext("2d");c.imageSmoothingEnabled=false;c.translate(48,64);c.rotate(dir*Math.PI/4);c.drawImage(source,-48,-64,96,128);c.setTransform(1,0,0,1,0,0);ctx.drawImage(cell,dir*96,damage*128)}}
  fs.writeFileSync(path.join(output,`${type}_8dir.png`),sheet.toBuffer("image/png"));
}

const ocean=createCanvas(128,128*4),ctx=ocean.getContext("2d"),colors=[["#073d67","#0b527c"],["#07557b","#08749a"],["#087b91","#19a8ae"],["#249da2","#58c5b4"]];ctx.imageSmoothingEnabled=false;
for(let band=0;band<4;band++){const y0=band*128;ctx.fillStyle=colors[band][0];ctx.fillRect(0,y0,128,128);for(let y=0;y<128;y+=4)for(let x=0;x<128;x+=4){const h=((x*37+y*71+band*101)>>>2)%17;if(h<4){ctx.fillStyle=h===0?colors[band][1]:"rgba(126,213,209,.16)";ctx.fillRect(x,y0+y,4+h%2*4,h===0?2:1)}}for(let i=0;i<18;i++){const x=(i*43+band*17)%128,y=y0+(i*29+band*31)%128;ctx.fillStyle=band>1?"rgba(221,240,202,.30)":"rgba(109,193,207,.20)";ctx.fillRect(x,y,12,1)}}
fs.writeFileSync(path.join(output,"ocean_depth_tiles.png"),ocean.toBuffer("image/png"));

const terrain=createCanvas(128*4,128),tc=terrain.getContext("2d"),lands=[["#506f43","#7f9a52"],["#8b743f","#b89550"],["#2f6849","#527f47"],["#b8c2bb","#e0dfcb"]];tc.imageSmoothingEnabled=false;
for(let band=0;band<4;band++){const x0=band*128;tc.fillStyle=lands[band][0];tc.fillRect(x0,0,128,128);for(let i=0;i<220;i++){const x=x0+(i*47+band*19)%128,y=(i*79+band*23)%128,size=2+(i%3);tc.fillStyle=i%5?lands[band][1]:"rgba(39,54,31,.42)";tc.fillRect(x,y,size,size)}for(let i=0;i<9;i++){const x=x0+(i*31+17)%116,y=(i*53+9)%112;polygon(tc,[[x,y+12],[x+7,y],[x+14,y+12]],band===3?"#89959a":"#66533b");polygon(tc,[[x+4,y+7],[x+7,y],[x+10,y+7]],"#d8d4bd")}}
fs.writeFileSync(path.join(output,"terrain_climate_tiles.png"),terrain.toBuffer("image/png"));
console.log(`generated sea assets in ${output}`);
