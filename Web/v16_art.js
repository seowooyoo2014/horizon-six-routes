window.HL=window.HL||{};
(function(){
  "use strict";
  const art=HL.Art.prototype,oldTown=art.town,oldInterior=art.v10InteriorScene,oldTitle=art.title,oldSea=art.sea,oldBattle=art.battle,oldDuel=art.duel,oldShip=art.ship;
  const W=480,H=270,T=16,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const cultures={
    iberia:["#b59a72","#d1b27b","#87543b","#5d382d","#355b68"],north:["#738286","#a4a29a","#85493b","#343f4c","#31576a"],med:["#b38a63","#d4ad79","#9b4e38","#604034","#28718a"],ottoman:["#8d7962","#c1a06c","#6f4742","#304f58","#2b7182"],maghreb:["#b99a69","#d2bd86","#80523c","#576a62","#2b7790"],africa:["#956f4d","#bd945d","#69452e","#49644c","#26758a"],arabia:["#a98a5f","#ccb27c","#75493b","#49615e","#24758c"],india:["#a67b58","#ca9b67","#814b45","#4f585b","#31758d"],seasia:["#8f754d","#ba9560","#74432f","#3e6350","#25778a"],china:["#8e866a","#bdab76","#84423a","#38564d","#286f82"],japan:["#8f7968","#bca884","#684a45","#405762","#2c7082"],caribbean:["#b69b6e","#d4bd82","#8d5034","#4d6b55","#238099"],americas:["#987954","#c19c66","#77452f","#4e684b","#29778e"],island:["#ae9265","#ccb078","#86503a","#49645a","#267c92"]
  };
  function surface(self){if(!self.v16Canvas){self.v16Canvas=document.createElement("canvas");self.v16Canvas.width=W;self.v16Canvas.height=H;self.v16ctx=self.v16Canvas.getContext("2d");self.v16ctx.imageSmoothingEnabled=false}return self.v16ctx}
  function present(self,e){const c=e.ctx;c.imageSmoothingEnabled=false;c.clearRect(0,0,960,540);c.drawImage(self.v16Canvas,0,0,960,540)}
  function hash(v){let h=2166136261;for(const ch of String(v))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0}
  function palette(game){return cultures[HL.DATA.ports[game.s.currentPort]?.culture]||cultures.iberia}
  function text(c,value,x,y,color="#f5dfaa",align="left",size=7){c.font=`${size}px sans-serif`;c.textAlign=align;c.fillStyle="#071013";c.fillText(value,x+1,y+1);c.fillStyle=color;c.fillText(value,x,y)}
  function person(c,x,y,dir,id,moving,time,color){
    const h=hash(id),skin=["#d7a576","#b77e57","#e0b58b","#8f6248"][h%4],coat=color||["#285e72","#7c453d","#496b4c","#765b83","#9a773d"][h%5],trim=["#d5b05b","#d6d0b5","#809da2"][h%3],frame=moving?Math.floor(time*8)%4:Math.floor(time*2)%2,bob=moving&&frame%2?1:0;
    c.fillStyle="rgba(3,9,12,.36)";c.fillRect(x-5,y+1,10,3);
    c.fillStyle="#34271f";c.fillRect(x-4,y-4,3,5);c.fillRect(x+1,y-4,3,5);
    c.fillStyle=coat;c.fillRect(x-6,y-14+bob,12,11);c.fillStyle=trim;c.fillRect(x-6,y-11+bob,12,2);
    const swing=moving?(frame===1?2:frame===3?-2:0):0;c.fillStyle=skin;c.fillRect(x-8,y-13+bob+swing,2,7);c.fillRect(x+6,y-13+bob-swing,2,7);
    c.fillStyle=skin;c.fillRect(x-5,y-22+bob,10,8);c.fillStyle=["#2b201c","#6b492e","#c5a063","#4d3b31"][h%4];c.fillRect(x-6,y-24+bob,12,4);c.fillRect(x-6,y-21+bob,2,4);
    if(id==="kemal"){c.fillStyle="#e1d0a4";c.fillRect(x-6,y-25+bob,12,3);c.fillRect(x-4,y-27+bob,8,2)}
    else if(id==="ines"){c.fillStyle="#34251f";c.fillRect(x+4,y-21+bob,3,8)}
    else if(id==="duarte"){c.fillStyle="#4c3527";c.fillRect(x-7,y-26+bob,14,3);c.fillRect(x-3,y-28+bob,7,2)}
    else if(id==="matteo"){c.fillStyle="#6d5140";c.fillRect(x-6,y-25+bob,12,2);c.fillStyle=trim;c.fillRect(x+6,y-14+bob,2,8)}
    else if(id==="anne"){c.fillStyle="#202a36";c.fillRect(x-7,y-26+bob,14,3);c.fillStyle="#c5a45d";c.fillRect(x-7,y-23+bob,14,1)}
    else if(id==="marieke"){c.fillStyle="#e0d7ba";c.fillRect(x-6,y-25+bob,12,3);c.fillStyle="#597d88";c.fillRect(x-7,y-23+bob,2,5)}
    else if(h%3===0){c.fillStyle=trim;c.fillRect(x-7,y-25+bob,14,2)}
    if(dir===2||dir===3)c.fillStyle=skin,c.fillRect(x+4,y-20+bob,2,2);else if(dir===6||dir===7)c.fillStyle=skin,c.fillRect(x-6,y-20+bob,2,2);
    if(dir===0||dir===1||dir===7){c.fillStyle=coat;c.fillRect(x-2,y-18+bob,4,4)}
  }
  function building(c,b,p,t){
    const x=b.x*T,y=b.y*T,w=b.w*T,h=b.h*T,roof=Math.min(18,Math.max(10,h*.28));
    c.fillStyle="rgba(12,17,18,.28)";c.fillRect(x+3,y+5,w,h);
    c.fillStyle=p[1];c.fillRect(x,y+roof,w,h-roof);c.fillStyle=p[2];c.fillRect(x-2,y,w+4,roof);
    c.fillStyle=p[3];for(let yy=y+2;yy<y+roof;yy+=4)for(let xx=x+((yy/4)%2?3:0);xx<x+w;xx+=8)c.fillRect(xx,yy,6,2);
    c.fillStyle="rgba(255,235,170,.45)";for(let xx=x+7;xx<x+w-7;xx+=16)c.fillRect(xx,y+roof+7,5,7);
    c.fillStyle="#382820";c.fillRect(b.door[0]*T+3,b.door[1]*T-12,10,13);c.fillStyle="#c39955";c.fillRect(b.door[0]*T+5,b.door[1]*T-10,1,1);
    c.fillStyle="rgba(41,31,25,.24)";for(let yy=y+roof+3;yy<y+h;yy+=6)c.fillRect(x,yy,w,1)
  }

  art.title=function(e){
    const c=surface(this),t=performance.now()/1000;c.fillStyle="#092f42";c.fillRect(0,0,W,H);
    for(let y=0;y<H;y+=8){c.fillStyle=y%16?"#0c4256":"#0e4a5e";c.fillRect(0,y,W,8);for(let x=0;x<W;x+=24){const q=(x+Math.floor(t*8)+y)%31;c.fillStyle="rgba(120,191,187,.24)";c.fillRect(x+q%9,y+3,10,1)}}
    c.fillStyle="#08171d";c.fillRect(0,0,W,42);c.fillStyle="#d1a650";c.fillRect(0,41,W,1);text(c,"수평선의 여섯 항로",24,27,"#f4deb0","left",16);text(c,"SIX ROUTES ACROSS THE HORIZON",26,37,"#b9c6b4","left",6);
    c.fillStyle="#71472d";c.fillRect(350,142,44,63);c.fillStyle="#d9c494";c.fillRect(366,95,4,66);c.beginPath();c.moveTo(370,98);c.lineTo(414,138);c.lineTo(370,136);c.fill();c.fillStyle="#c69e57";c.fillRect(346,201,53,4);present(this,e)
  };

  art.town=function(game){
    if(!game.s?.captainId||!HL.DATA.campaignsV16[game.s.campaignId])return oldTown.call(this,game);
    const c=surface(this),map=game.townMap(),p=palette(game),px=game.s.town.x*T,py=game.s.town.y*T,camX=clamp(px-W/2,0,Math.max(0,32*T-W)),camY=clamp(py-H/2,0,Math.max(0,18*T-H)),t=performance.now()/1000;
    c.fillStyle=p[0];c.fillRect(0,0,W,H);c.save();c.translate(-camX,-camY);
    for(let y=0;y<18;y++)for(let x=0;x<32;x++){c.fillStyle=(x+y)%3?p[0]:p[1];c.fillRect(x*T,y*T,T,T);c.fillStyle="rgba(34,31,26,.18)";c.fillRect(x*T,y*T+15,T,1);if((hash(`${x},${y},${game.s.currentPort}`)%13)===0)c.fillRect(x*T+3,y*T+6,4,1)}
    c.fillStyle=p[4];c.fillRect(0,16*T,32*T,2*T);for(let x=0;x<32*T;x+=18){c.fillStyle=`rgba(166,220,210,${.24+.12*Math.sin(t+x)})`;c.fillRect(x,16*T+5+Math.floor(Math.sin(t*3+x)*2),11,1)}
    for(const b of game.townBuildings())building(c,b,p,t);
    const actors=[...game.npcs.map(n=>({n,y:n.y})),{player:true,y:game.s.town.y}].sort((a,b)=>a.y-b.y);const cap=captainColor(game.s.captainId);
    for(const a of actors){const q=a.player?game.s.town:a.n;person(c,q.x*T+8,q.y*T+14,q.dir,a.player?game.s.captainId:q.appearanceId,a.player?game.playerMoving:q.moving,a.player?game.playerAnim:q.animTime,a.player?cap:null)}
    const target=game.questTarget?.();for(const b of game.townBuildings()){const active=b.id===target||b.facility===target,label=b.name||b.label;c.fillStyle=active?"#7e5424":"rgba(7,20,23,.87)";const w=Math.max(34,label.length*7+10),x=b.door[0]*T+8-w/2,y=Math.max(7,b.door[1]*T-27);c.fillRect(x,y,w,13);c.strokeStyle=active?"#f0c45f":"#738883";c.strokeRect(x+.5,y+.5,w-1,12);text(c,active?`◆ ${label}`:label,b.door[0]*T+8,y+9,active?"#fff1ae":"#e9d5a4","center",6)}
    c.restore();text(c,HL.DATA.ports[game.s.currentPort].name,8,263,"#fff0bd","left",8);present(this,game.e)
  };
  function captainColor(id){return HL.DATA.captainsV16.find(c=>c.id===id)?.color||"#356b7b"}

  art.v10InteriorScene=function(game,scene,position,actorId="rian",prologue=false){
    if(!game.s?.captainId||!HL.DATA.campaignsV16[game.s.campaignId])return oldInterior.call(this,game,scene,position,actorId,prologue);
    const c=surface(this),p=palette(game),sw=(scene.width||32)*T,sh=(scene.height||18)*T,ox=Math.floor((W-sw)/2),oy=Math.floor((H-sh)/2),time=performance.now()/1000;c.fillStyle="#090b0d";c.fillRect(0,0,W,H);c.save();c.translate(ox,oy);
    for(let y=0;y<(scene.height||18);y++)for(let x=0;x<(scene.width||32);x++){const id=scene.tiles?.[y]?.[x]||"floor",wall=String(id).includes("wall")||String(id).includes("void"),water=String(id).includes("water");c.fillStyle=water?p[4]:wall?p[3]:((x+y)&1?p[0]:p[1]);c.fillRect(x*T,y*T,T,T);if(!wall&&!water){c.fillStyle="rgba(43,31,24,.15)";c.fillRect(x*T,y*T+15,T,1)}if(water){c.fillStyle="rgba(169,219,208,.38)";c.fillRect(x*T+(Math.floor(time*6+y)%8),y*T+5,7,1)}}
    const props=scene.props||[];for(const q of props){const x=q.x*T,y=q.y*T,w=(q.w||1)*T,h=(q.h||1)*T;c.fillStyle=q.high?p[3]:"#765139";c.fillRect(x+1,y+2,w-2,h-3);c.fillStyle="#b88b50";c.fillRect(x+2,y+3,w-4,2);if(String(q.sprite).includes("bed")){c.fillStyle="#d3c49b";c.fillRect(x+3,y+4,w-6,Math.max(4,h-8))}if(String(q.sprite).includes("shelf")){c.fillStyle="#33261f";for(let yy=y+5;yy<y+h-3;yy+=5)c.fillRect(x+3,yy,w-6,2)}}
    const actors=[...(scene.npcs||[]).map(n=>({n,y:n.y})),{player:true,y:position.y}].sort((a,b)=>a.y-b.y);for(const a of actors){const q=a.player?position:a.n;person(c,q.x*T+8,q.y*T+14,q.dir,a.player?game.s.captainId:q.appearanceId,a.player?game.playerMoving:false,a.player?game.playerAnim:time,a.player?captainColor(game.s.captainId):null)}
    c.restore();const near=this.nearV10Interaction?.(position,scene);if(near){c.fillStyle="rgba(5,18,21,.94)";c.fillRect(145,240,190,20);c.strokeStyle="#c39b55";c.strokeRect(145.5,240.5,189,19);text(c,`Enter/Z  ${near.label}`,240,253,"#f7e4ae","center",7)}present(this,game.e)
  };

  art.v16Prologue=function(game){
    const c=surface(this),cap=HL.DATA.captainsV16.find(x=>x.id===game.s.captainId),p=game.s.prologueV16,index=p.index,t=performance.now()/1000;c.fillStyle="#07151d";c.fillRect(0,0,W,H);
    c.fillStyle="#173e4b";c.fillRect(0,95,W,175);for(let x=0;x<W;x+=20){c.fillStyle="rgba(106,184,181,.25)";c.fillRect(x,135+Math.sin(x+t*2)*3,12,1)}c.fillStyle="#6e482d";c.fillRect(44,105,175,90);c.fillStyle="#c8ad79";c.fillRect(68,75,4,80);c.fillRect(121,66,4,88);c.fillStyle=cap.color;c.fillRect(72,78,49,35);c.fillStyle="#0a1115";c.fillRect(0,0,W,38);text(c,"1526년 · "+HL.DATA.ports[cap.startPort].name,18,24,"#d8bc7b","left",9);
    c.fillStyle="rgba(4,14,18,.94)";c.fillRect(18,174,444,78);c.strokeStyle="#b5904d";c.strokeRect(18.5,174.5,443,77);text(c,cap.name,31,194,cap.color,"left",8);wrap(c,cap.prologue[index],31,210,414,12,8);text(c,`${index+1} / ${cap.prologue.length}  Enter/Z 계속 · Esc/X 건너뛰기`,449,245,"#bfc7b3","right",6);present(this,game.e);game.e.hud.innerHTML="";game.help("Enter/Z 계속 · Esc/X 건너뛰기")
  };
  art.v16Cutscene=function(game){
    const c=surface(this),v=game.v16Scene,step=v.scene.steps[v.index],cap=HL.DATA.captainsV16.find(x=>x.id===game.s.captainId),t=performance.now()/1000;c.fillStyle="#102c38";c.fillRect(0,0,W,H);c.fillStyle="#244b50";c.fillRect(0,100,W,170);
    for(let i=0;i<7;i++){c.fillStyle=i%2?"#77513a":"#98704a";c.fillRect(20+i*72,75+(i%3)*8,58,80);c.fillStyle="#342723";c.fillRect(38+i*72,121+(i%3)*8,14,34)}
    c.fillStyle="rgba(4,13,17,.94)";c.fillRect(16,166,448,87);c.strokeStyle="#c09a54";c.strokeRect(16.5,166.5,447,86);text(c,v.scene.title,28,183,"#dcb963","left",7);text(c,step.speaker,28,198,cap.color,"left",8);wrap(c,step.text,28,214,420,12,8);text(c,`${v.index+1}/${v.scene.steps.length} · Enter/Z`,449,246,"#c9cfbc","right",6);present(this,game.e);game.e.hud.innerHTML="";game.help("Enter/Z 계속 · Esc/X 건너뛰기")
  };
  function wrap(c,value,x,y,max,line,size){let s="",py=y;c.font=`${size}px sans-serif`;for(const ch of value){if(c.measureText(s+ch).width>max&&s){text(c,s,x,py,"#f2e2bb","left",size);s=ch;py+=line}else s+=ch}if(s)text(c,s,x,py,"#f2e2bb","left",size)}

  function pixelate(self,e,draw){draw.call(self,e);const c=surface(self);c.clearRect(0,0,W,H);c.imageSmoothingEnabled=false;c.drawImage(e.canvas,0,0,W,H);present(self,e)}
  art.sea=function(game){if(game.s?.captainId&&HL.DATA.campaignsV16[game.s.campaignId]){window.__HL_GAME__=game;const result=pixelate(this,game.e,()=>oldSea.call(this,game));window.__HL_GAME__=null;return result}return oldSea.call(this,game)};
  art.battle=function(game){if(game.s?.captainId&&HL.DATA.campaignsV16[game.s.campaignId]){window.__HL_GAME__=game;const result=pixelate(this,game.e,()=>oldBattle.call(this,game));window.__HL_GAME__=null;return result}return oldBattle.call(this,game)};
  art.duel=function(game){if(game.s?.captainId&&HL.DATA.campaignsV16[game.s.campaignId]){window.__HL_GAME__=game;const result=pixelate(this,game.e,()=>oldDuel.call(this,game));window.__HL_GAME__=null;return result}return oldDuel.call(this,game)};
  art.ship=function(e,x,y,dir,type="caravel",scale=1){
    const game=window.__HL_GAME__;if(!game?.s?.captainId||!HL.DATA.campaignsV16[game.s.campaignId])return oldShip.call(this,e,x,y,dir,type,scale);
    const c=e.ctx,size=type==="galley"?18:type==="brig"?16:type==="cog"?14:15,dx=[0,1,1,1,0,-1,-1,-1][dir],dy=[-1,-1,0,1,1,1,0,-1][dir],sideX=-dy,sideY=dx;c.save();c.fillStyle="#3d291e";c.beginPath();c.moveTo(x+dx*size*scale,y+dy*size*scale);c.lineTo(x+sideX*7*scale-dx*10*scale,y+sideY*7*scale-dy*10*scale);c.lineTo(x-sideX*7*scale-dx*10*scale,y-sideY*7*scale-dy*10*scale);c.closePath();c.fill();c.strokeStyle="#b17b45";c.stroke();c.fillStyle="#d3c18e";c.beginPath();c.moveTo(x,y);c.lineTo(x+sideX*13*scale-dx*4*scale,y+sideY*13*scale-dy*4*scale);c.lineTo(x-sideX*2*scale-dx*7*scale,y-sideY*2*scale-dy*7*scale);c.closePath();c.fill();c.fillStyle="#8f3d39";c.fillRect(Math.round(x+sideX*2),Math.round(y+sideY*2),2,2);c.restore()
  };
})();
