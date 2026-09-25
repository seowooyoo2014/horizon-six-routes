window.HL=window.HL||{};
(function(){
  "use strict";
  const art=HL.Art.prototype,oldV10=art.v10InteriorScene,S=2,L=16,T=L*S,Y0=28,palettes=HL.DATA.tileMetaV18.palettes;
  const px=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x)*S,Math.round(y)*S,Math.round(w)*S,Math.round(h)*S)};
  const hash=v=>{let h=2166136261;for(const ch of String(v))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0};
  art.v18Camera=function(scene,pos){return{x:Math.max(0,Math.min(scene.width*L-480,Math.round(pos.x*L-240))),y:Math.max(0,Math.min(scene.height*L-256,Math.round(pos.y*L-132)))}};
  art.drawV18Tile=function(c,id,x,y,p,seed){const [ink,dark,mid,light,hi,red,blue,black]=p,X=x*L,Y=y*L;if(id==="wall"){px(c,X,Y,L,L,ink);px(c,X+1,Y+1,14,13,mid);px(c,X+1,Y+1,14,3,light);for(let i=0;i<3;i++){px(c,X+2+(i%2)*6,Y+6+i*3,5,1,dark)}px(c,X,Y+14,16,2,black);return}if(id==="door"){px(c,X,Y,L,L,ink);px(c,X+2,Y+1,12,15,dark);px(c,X+4,Y+3,8,12,mid);px(c,X+10,Y+8,1,1,hi);return}if(id==="wood"){px(c,X,Y,L,L,dark);px(c,X,Y+1,L,14,mid);px(c,X,Y+7,L,1,dark);px(c,X+(x*5+y*3+seed)%12,Y+3,4,1,light);px(c,X+13,Y+1,1,6,dark);return}if(id==="stone"||id==="marble"||id==="slate"){const base=id==="slate"?blue:id==="marble"?light:mid;px(c,X,Y,L,L,dark);px(c,X+1,Y+1,14,14,base);px(c,X+1,Y+8,14,1,dark);px(c,X+((y%2)*7),Y+1,1,7,dark);if(id==="marble"){px(c,X+4,Y+3,6,1,hi);px(c,X+10,Y+11,3,1,mid)}return}if(id==="carpet"||id==="carpetEdge"){px(c,X,Y,L,L,ink);px(c,X+1,Y+1,14,14,red);if(id==="carpetEdge"){px(c,X+2,Y+2,12,2,hi);px(c,X+2,Y+12,12,2,hi)}else{px(c,X+4,Y+4,2,2,hi);px(c,X+10,Y+10,2,2,hi);px(c,X+7,Y+7,2,2,dark)}return}px(c,X,Y,L,L,dark);px(c,X+1,Y+1,15,15,mid);const n=(x*13+y*7+seed)%5;if(n===0){px(c,X+3,Y+5,4,1,light);px(c,X+10,Y+12,3,1,dark)}else if(n===1){px(c,X+7,Y+2,1,4,light);px(c,X+2,Y+13,5,1,dark)}};
  art.drawV18Prop=function(c,o,p,time,alpha=1){
    const [ink,dark,mid,light,hi,red,blue,black]=p,X=o.x*L,Y=o.y*L,W=o.w*L,H=o.h*L;c.save();c.globalAlpha=alpha;
    const box=(x=X,y=Y,w=W,h=H,a=dark,b=mid,d=light)=>{px(c,x,y,w,h,ink);px(c,x+1,y+1,w-2,h-2,a);px(c,x+2,y+2,w-4,3,d);px(c,x+3,y+6,w-6,h-8,b)};
    if(["counter","bar"].includes(o.type)){box();for(let x=X+5;x<X+W-4;x+=14){px(c,x,Y+9,1,H-11,ink);px(c,x+2,Y+10,8,H-13,dark)}px(c,X,Y,W,3,hi)}
    else if(["shelf","books","medicine","wardrobe","cabinet"].includes(o.type)){box();for(let y=Y+6;y<Y+H-3;y+=7){px(c,X+3,y,W-6,2,ink);for(let x=X+5;x<X+W-4;x+=5)px(c,x,y-4,3,4,[red,blue,light,hi][(x+y)%4])}}
    else if(["table","dining","maptable","desk","workbench","contracts","documents"].includes(o.type)){px(c,X+2,Y+5,W-4,H-8,ink);px(c,X+1,Y+2,W-2,7,light);px(c,X+3,Y+4,W-6,4,mid);px(c,X+4,Y+H-4,3,4,ink);px(c,X+W-7,Y+H-4,3,4,ink);if(["maptable","contracts","documents"].includes(o.type)){px(c,X+6,Y+3,W-12,5,hi);px(c,X+8,Y+5,W-16,1,blue)}}
    else if(o.type==="hearth"){box();px(c,X+5,Y+7,W-10,H-7,black);const flick=Math.floor(time*5)%2;px(c,X+9+flick,Y+H-9,5,7,"#e45f35");px(c,X+11-flick,Y+H-7,4,5,"#f2bd55")}
    else if(o.type==="hull"){for(let i=0;i<Math.floor(H/2)-4;i++){const inset=Math.floor(Math.abs(i-(H/4-2))*.32)+2;px(c,X+inset,Y+5+i*2,W-inset*2,2,ink);px(c,X+inset+1,Y+5+i*2,W-inset*2-2,1,i%3?mid:light)}px(c,X+W/2-2,Y+1,4,H-5,ink);px(c,X+W/2-1,Y+1,2,H-6,hi);for(let x=X+12;x<X+W-10;x+=12)px(c,x,Y+9,2,H-18,dark)}
    else if(o.type==="stair"){px(c,X,Y,W,H,black);for(let i=0;i<9;i++){px(c,X+2,Y+2+i*5,W-4,3,i%2?mid:light)}px(c,X,Y,2,H,hi);px(c,X+W-2,Y,2,H,hi)}
    else if(o.type==="water"){px(c,X,Y,W,H,"#123747");for(let y=Y+3;y<Y+H;y+=7){const off=Math.floor(time*4+y)%5;px(c,X+off,y,8,1,blue);px(c,X+11+off,y,5,1,"#6aa6a1")}}
    else if(["produce","cloth","sacks","crates","barrels"].includes(o.type)){box();for(let x=X+4;x<X+W-3;x+=8){const color=o.type==="produce"?["#718b42","#b75e3e","#d6ad53"][x%3]:o.type==="cloth"?[red,blue,hi][x%3]:light;px(c,x,Y+5,5,Math.max(4,H-9),color);px(c,x,Y+4,5,1,hi)}}
    else if(o.type==="bed"){box();px(c,X+4,Y+4,9,H-8,hi);px(c,X+14,Y+4,W-18,H-8,red);for(let y=Y+7;y<Y+H-4;y+=5)px(c,X+15,y,W-20,1,light)}
    else if(o.type==="treatment"){box();px(c,X+5,Y+4,W-10,H-9,hi);px(c,X+W/2-1,Y+6,2,H-13,red);px(c,X+8,Y+H/2-1,W-16,2,red)}
    else if(o.type==="telescope"){px(c,X+4,Y+H-3,3,3,ink);px(c,X+W-7,Y+H-3,3,3,ink);for(let i=0;i<4;i++)px(c,X+5+i*5,Y+H-7-i*5,8,3,i===3?hi:light)}
    else if(o.type==="crane"){px(c,X+3,Y+2,4,H-3,ink);px(c,X+4,Y+2,2,H-4,light);px(c,X+5,Y+3,W-8,4,mid);px(c,X+W-7,Y+6,1,H-11,hi);px(c,X+W-9,Y+H-6,5,3,ink)}
    else if(o.type==="safe"){box();px(c,X+6,Y+7,W-12,H-13,black);px(c,X+W/2-2,Y+H/2-2,4,4,hi);px(c,X+W/2-1,Y+H/2-1,2,2,red)}
    else if(o.type==="portrait"){box();px(c,X+5,Y+4,W-10,H-8,blue);px(c,X+W/2-3,Y+7,6,6,light);px(c,X+W/2-5,Y+13,10,H-16,red)}
    else if(o.type==="sofa"){box();px(c,X+4,Y+5,W-8,H-10,red);for(let x=X+7;x<X+W-5;x+=9)px(c,x,Y+7,1,H-14,hi)}
    else if(o.type==="plant"){px(c,X+5,Y+10,7,6,mid);px(c,X+8,Y+3,2,8,"#35613d");px(c,X+3,Y+4,6,4,"#4f8145");px(c,X+9,Y+2,5,5,"#71964c")}
    else if(o.type==="lamp"){px(c,X+6,Y+1,4,4,hi);px(c,X+7,Y+5,2,7,light);px(c,X+5,Y+11,6,2,ink);px(c,X+4,Y+2,1,5,red);px(c,X+11,Y+2,1,5,red)}
    else if(o.type==="column"){px(c,X+3,Y,W-6,H,ink);px(c,X+5,Y+2,W-10,H-4,light);for(let y=Y+4;y<Y+H-4;y+=5)px(c,X+6,y,W-12,2,hi);px(c,X,Y,W,4,ink);px(c,X+1,Y+1,W-2,2,light);px(c,X,Y+H-5,W,5,ink);px(c,X+2,Y+H-4,W-4,2,light)}
    else if(o.type==="rug"){px(c,X,Y,W,H,ink);px(c,X+1,Y+1,W-2,H-2,red);for(let y=Y+4;y<Y+H-3;y+=6)for(let x=X+4;x<X+W-3;x+=7)px(c,x,y,2,2,hi)}
    else if(["mast","rope","sails"].includes(o.type)){box();if(o.type==="rope")for(let x=X+4;x<X+W-2;x+=6){c.strokeStyle=hi;c.lineWidth=2*S;c.beginPath();c.arc((x+3)*S,(Y+8)*S,3*S,0,Math.PI*2);c.stroke()}if(o.type==="sails")px(c,X+4,Y+5,W-8,H-9,"#ded2aa")}
    else{box();px(c,X+W/2-2,Y+H/2-2,4,4,hi)}
    c.restore()
  };
  art.drawV18Actor=function(c,id,x,y,dir,moving,time,p){
    const h=hash(id),skin=["#e2b17d","#bd805c","#8b5a43","#d39768"][h%4],hair=["#2a2020","#5a3424","#8a642f","#b7a27b"][Math.floor(h/7)%4],coat=id.startsWith("owner_")?p[5]:[p[5],p[6],"#49683f","#76508a","#a56d38"][Math.floor(h/13)%5],X=Math.round(x-8),Y=Math.round(y-23),step=moving?Math.floor(time*8)%4:0,bob=moving&&step%2?1:0;
    px(c,X+4,Y+1+bob,8,8,p[0]);px(c,X+5,Y+2+bob,6,6,skin);if(dir<3||dir>5){px(c,X+4,Y+1+bob,8,3,hair);px(c,X+4,Y+3+bob,2,4,hair)}else px(c,X+4,Y+1+bob,8,5,hair);
    px(c,X+3,Y+9+bob,10,9,p[0]);px(c,X+4,Y+9+bob,8,8,coat);px(c,X+1,Y+10+bob,3,7,p[0]);px(c,X+12,Y+10+bob,3,7,p[0]);px(c,X+2,Y+11+bob,2,5,skin);px(c,X+12,Y+11+bob,2,5,skin);
    const a=step===1||step===2?1:0;px(c,X+4-a,Y+18,4,5,p[0]);px(c,X+8+a,Y+18,4,5,p[0]);px(c,X+5-a,Y+18,3,4,p[2]);px(c,X+8+a,Y+18,3,4,p[2]);
    if(id.startsWith("owner_")&&id.includes("shipyard")){px(c,X+13,Y+12,2,7,p[4]);px(c,X+12,Y+17,4,2,p[0])}
  };
  art.v18InteriorScene=function(game,scene,pos,actorId){
    const e=game.e,c=e.ctx,time=performance.now()/1000,p=palettes[scene.culture]||palettes.med,cam=this.v18Camera(scene,pos),seed=scene.visual.seed||0;e.clear(p[7]);c.save();c.imageSmoothingEnabled=false;c.translate(-cam.x*S,Y0-cam.y*S);
    for(let y=0;y<scene.height;y++)for(let x=0;x<scene.width;x++)this.drawV18Tile(c,scene.tiles[y][x],x,y,p,seed);
    for(const o of scene.props)if(!o.high)this.drawV18Prop(c,o,p,time);
    const followers=(game.s.partyFollowerState?.render||[]).map(f=>({q:f,y:f.y})),actors=[...(scene.npcs||[]).map(n=>({q:n,y:n.y,npc:true})),...followers,{q:pos,y:pos.y,player:true}].sort((a,b)=>a.y-b.y);
    for(const a of actors){const q=a.q,id=a.player?(game.s.captainId||actorId||"rian"):(q.appearanceId||q.id||"citizen");this.drawV18Actor(c,id,q.x*L+L/2,q.y*L+15,q.dir??4,a.player?game.playerMoving:!!q.moving,a.player?game.playerAnim:time+(hash(id)%17)/10,p)}
    for(const o of scene.props)if(o.high){const cover=pos.x>o.x-.2&&pos.x<o.x+o.w+.2&&pos.y>o.y-.5&&pos.y<o.y+o.h+.4;this.drawV18Prop(c,o,p,time,cover?.62:1)}c.restore();
    c.fillStyle=p[7];c.fillRect(0,0,960,28);c.fillStyle=p[3];c.fillRect(0,26,960,2);e.text(`${HL.DATA.ports[game.s.currentPort]?.name||""} · ${game.currentBuilding()?.name||scene.facility} ${scene.floorId.toUpperCase()}`,12,20,p[4],"left",13);
    const near=this.nearV10Interaction(pos,scene);if(near){const label=`Z  ${near.label}`,w=Math.max(150,label.length*13+30);c.fillStyle=p[7];c.fillRect(480-w/2,496,w,32);c.fillStyle=p[3];c.fillRect(480-w/2,496,w,2);c.fillRect(480-w/2,526,w,2);e.text(label,480,518,p[4],"center",13)}
  };
  art.v10InteriorScene=function(game,scene,pos,actorId="rian",prologue=false){if(scene?.visual?.version===18&&!prologue)return this.v18InteriorScene(game,scene,pos,actorId);return oldV10.call(this,game,scene,pos,actorId,prologue)};
})();
