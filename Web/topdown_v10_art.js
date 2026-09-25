window.HL=window.HL||{};
(function(){
  "use strict";
  const art=HL.Art.prototype,oldInterior=art.interior;
  const T=30;
  const cultureColors=[
    ["#c89d68","#774c34","#efe0bd","#366f7b"],["#8a7c6c","#4b3e42","#d8c7a3","#456b78"],["#b98a5e","#754334","#e8d0a0","#34707a"],["#a98c61","#62462e","#eee0ae","#32727a"],
    ["#c3a36b","#765b3d","#f0dfb1","#39716b"],["#9e7858","#563a43","#e1caa1","#34636a"],["#9a6b47","#4d3c2d","#e0b87c","#3d6b58"],["#bea06a","#705239","#eddaa7","#347078"],
    ["#a66b55","#573947","#e6c58f","#3e6f6b"],["#96684c","#433b31","#dfbd82","#32746c"],["#a66d58","#573633","#dfc68d","#376b70"],["#8d735f","#403e4a","#e4d2a4","#4a647b"],
    ["#ae7950","#51392f","#e7c681","#2f737b"],["#9a704e","#4c3c2d","#dec18b","#536f47"]
  ];
  const phaseTitles={
    "ship-lower":"1511년 · 폭풍 전야 · 팔코호 하층 선실",
    "ship-deck":"1511년 · 팔코호 갑판",
    lighthouse:"1511년 · 성 루시아 등대",
    "mansion-2f":"1526년 · 팔코 저택 2층",
    "mansion-1f":"1526년 · 팔코 저택 1층"
  };
  const phaseObjectives={
    "ship-lower":"선실을 살펴본 뒤 우현 계단으로 올라가십시오",
    "ship-deck":"구조 신호를 확인하고 오르소와 상의하십시오",
    lighthouse:"호송선의 신호를 확인한 뒤 권양기로 가십시오",
    "mansion-2f":"방을 살펴보고 아래층으로 내려가십시오",
    "mansion-1f":"압류관과 데미안의 이야기를 들으십시오"
  };

  art.ensureV10Tiles=function(){
    if(this.images.v10Tiles)return;
    const image=new Image();image.src=HL.DATA.v10.tileAtlas;this.images.v10Tiles=image
  };
  art.drawV10Tile=function(c,row,index,x,y,w=T,h=T){
    const image=this.images.v10Tiles;
    if(image?.complete&&image.naturalWidth){c.drawImage(image,index*T,row*T,T,T,Math.round(x),Math.round(y),Math.round(w),Math.round(h));return true}
    const colors=["#9a805b","#6d452e","#4a3229","#30231e","#844e39","#176d83","#bd8b50","#8f704e","#835d44","#65412d","#473126","#765036","#684831","#8bc1c4","#49301f","#8b6b43"];
    c.fillStyle=colors[index]||"#75563c";c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));return false
  };
  art.drawV10Prop=function(c,scene,p,waterTime=0){
    const x=p.x*T,y=p.y*T,w=p.w*T,h=p.h*T,[base,dark,light,accent]=cultureColors[scene.cultureRow]||cultureColors[2],line=(xx,yy,ww,hh,color)=>{c.fillStyle=color;c.fillRect(Math.round(xx),Math.round(yy),Math.round(ww),Math.round(hh))};
    this.drawV10Tile(c,scene.cultureRow,p.tile,x,y,w,h);
    if(p.type==="water"){
      c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
      for(let band=0;band<Math.ceil(h/14);band++){
        const yy=y+8+band*14+Math.sin(waterTime*1.8+band)*2;
        c.strokeStyle=band%2?"rgba(126,222,223,.44)":"rgba(232,239,190,.34)";c.lineWidth=2;c.beginPath();
        for(let px=x-15;px<x+w+15;px+=18){const py=yy+Math.sin(px*.035-waterTime*2.2)*2;c.moveTo(px,py);c.lineTo(px+10,py)}c.stroke()
      }
      c.restore()
    }else if(p.type==="shelf"){
      line(x,y,w,h,dark);line(x+4,y+4,w-8,h-8,"#2c231e");
      for(let sy=y+17,row=0;sy<y+h-6;sy+=22,row++){
        line(x+7,sy,w-14,4,base);line(x+7,sy+4,w-14,2,"#241b17");
        let bx=x+10+(row%2)*5,index=0;while(bx<x+w-13){const bw=4+((index*7+scene.seed)%6),bh=8+((index*11+row*3)%9),colors=[accent,light,"#9e5f45","#53706a","#c49c56"];line(bx,sy-bh,bw,bh,colors[(index+scene.seed)%colors.length]);if(index%4===0)line(bx,sy-bh,bw,2,light);bx+=bw+3;index++}
      }
      line(x,y,w,5,light);line(x,y+h-6,w,6,dark)
    }else if(p.type==="counter"){
      line(x,y,w,h,dark);line(x,y,w,8,light);line(x,y+8,w,4,base);
      const panels=Math.max(2,Math.floor(w/48)),gap=7,pw=(w-gap*(panels+1))/panels;
      for(let i=0;i<panels;i++){const px=x+gap+i*(pw+gap);line(px,y+18,pw,h-25,base);line(px+4,y+22,pw-8,h-33,"#5a3828");c.strokeStyle=light;c.strokeRect(px+.5,y+18.5,pw-1,h-26)}
    }else if(p.type==="crate"){
      line(x,y,w,h,dark);for(let cy=y+3;cy<y+h-3;cy+=30)for(let cx=x+3;cx<x+w-3;cx+=30){const cw=Math.min(27,x+w-3-cx),ch=Math.min(27,y+h-3-cy);line(cx,cy,cw,ch,base);line(cx+3,cy+3,cw-6,3,light);c.strokeStyle=dark;c.strokeRect(cx+.5,cy+.5,cw-1,ch-1);c.beginPath();c.moveTo(cx+3,cy+3);c.lineTo(cx+cw-3,cy+ch-3);c.moveTo(cx+cw-3,cy+3);c.lineTo(cx+3,cy+ch-3);c.stroke()}
    }else if(p.type==="table"){
      line(x+5,y+7,w-10,h-18,dark);line(x+1,y+2,w-2,11,light);line(x+5,y+6,w-10,7,base);line(x+9,y+h-15,8,15,dark);line(x+w-17,y+h-15,8,15,dark);
      for(let px=x+18;px<x+w-12;px+=34){line(px,y+5,14,5,accent);line(px+2,y+4,10,2,"#d8cc9b")}
    }else if(p.type==="bed"){
      line(x,y+5,w,h-5,dark);line(x+5,y+9,w-10,h-15,light);line(x+8,y+12,Math.min(42,w*.28),h-21,"#eadfbf");line(x+Math.min(48,w*.32),y+12,w-Math.min(56,w*.36),h-21,accent);
      for(let sy=y+17;sy<y+h-10;sy+=10)line(x+Math.min(48,w*.32),sy,w-Math.min(56,w*.36),2,"rgba(238,225,180,.45)");line(x,y,w,7,base)
    }else if(p.type==="window"){
      line(x,y,w,h,dark);line(x+7,y+7,w-14,h-14,"#1b7d99");const sky=c.createLinearGradient(x,y,x,y+h);sky.addColorStop(0,"#83cbd4");sky.addColorStop(1,"#17647f");c.fillStyle=sky;c.fillRect(x+10,y+10,w-20,h-20);line(x+w/2-2,y+7,4,h-14,light);line(x+7,y+h/2-2,w-14,4,light)
    }else if(p.type==="rug"){
      line(x,y,w,h,dark);line(x+5,y+5,w-10,h-10,accent);line(x+10,y+10,w-20,h-20,base);c.strokeStyle=light;c.setLineDash([6,5]);c.strokeRect(x+12.5,y+12.5,w-25,h-25);c.setLineDash([]);
      for(let px=x+15;px<x+w-10;px+=24){line(px,y+5,2,5,light);line(px,y+h-10,2,5,light)}
    }else if(p.type==="stairUp"||p.type==="stairDown"){
      line(x,y,w,h,dark);const count=Math.max(5,Math.floor(h/10));for(let i=0;i<count;i++){const inset=p.type==="stairUp"?i*4:(count-i-1)*4;line(x+5+inset,y+5+i*(h-10)/count,w-10-inset,6,light);line(x+5+inset,y+10+i*(h-10)/count,w-10-inset,2,base)}
    }
  };
  art.nearV10Interaction=function(position,scene){
    const centers=[];
    for(const h of scene.hotspots||[])centers.push({label:h.label,rect:h.rect});
    for(const s of scene.stairs||[])centers.push({label:s.label,rect:s.rect});
    centers.push({label:"나가기",rect:scene.exit?.rect});
    let best=null;
    for(const item of centers){if(!item.rect)continue;const r=item.rect,cx=r[0]+r[2]/2,cy=r[1]+r[3]/2,d=Math.hypot(position.x-cx,position.y-cy);if(d<2.35&&(!best||d<best.d))best={...item,d}}
    return best
  };
  art.v10InteriorScene=function(game,scene,position,actorId="rian",prologue=false){
    this.ensureV10Tiles();const e=game.e,c=e.ctx,t=performance.now()/1000;e.clear("#101719");
    for(let y=0;y<scene.height;y++)for(let x=0;x<scene.width;x++)this.drawV10Tile(c,scene.cultureRow,scene.tiles[y][x],x*T,y*T);
    for(const p of scene.props||[])if(!p.high)this.drawV10Prop(c,scene,p,t);
    const actors=[...(scene.npcs||[]).map(n=>({npc:n,y:n.y})),{player:true,y:position.y}].sort((a,b)=>a.y-b.y);
    for(const actor of actors){
      if(actor.player)this.person(e,position.x*T+T/2,position.y*T+25,position.dir,actorId==="rian",game.playerAnim,scene.actorScale||1.15,actorId,game.playerMoving);
      else{const n=actor.npc;this.person(e,n.x*T+T/2,n.y*T+25,n.dir??4,false,(t+(this.hash(n.appearanceId)%31)/10),scene.actorScale||1.15,n.appearanceId||"citizen",false);if(n.name)this.renderNameplate(e,n.name,n.x*T+T/2,n.y*T-12,false,false)}
    }
    for(const p of scene.props||[])if(p.high)this.drawV10Prop(c,scene,p,t);
    const top=prologue?phaseTitles[game.s.prologueState.phase]:`${HL.DATA.ports[game.s.currentPort].name} · ${game.currentBuilding()?.name||scene.facility} ${scene.floorId.toUpperCase()}`;
    c.fillStyle="rgba(3,14,18,.91)";c.fillRect(0,0,960,62);c.strokeStyle="#b68a45";c.strokeRect(.5,.5,959,61);
    e.text(top,20,27,"#f2ce79","left",17);e.text(prologue?phaseObjectives[game.s.prologueState.phase]:"가구와 사람 앞에서 Enter/Z · 계단과 출구는 아래 안내를 확인",20,51,"#d7dfcf","left",12);
    const near=this.nearV10Interaction(position,scene);if(near){const label=`Enter/Z · ${near.label}`,w=Math.max(190,label.length*14+34);c.fillStyle="rgba(4,20,25,.94)";c.fillRect(480-w/2,486,w,36);c.strokeStyle="#d1a24c";c.strokeRect(481-w/2,487,w-2,34);e.text(label,480,510,"#fff0b6","center",14)}
  };
  art.interior=function(game){const scene=game.interiorScene?.();if(scene?.tiles)return this.v10InteriorScene(game,scene,game.s.interior,"rian",false);return oldInterior.call(this,game)};
  art.v10Dark=function(game,damian=true){
    const e=game.e,c=e.ctx,ps=game.s.prologueState,p=Math.min(1,ps.elapsed/(damian?3.6:4));e.clear("#020507");
    const alpha=Math.max(0,(p-.18)/.82);c.fillStyle=`rgba(20,30,30,${alpha*.28})`;c.fillRect(0,0,960,540);
    const title=damian?"1511년 10월 · 성 루시아 앞바다":"15년 뒤 · 리스본";
    const line=damian?'젊은 오르소  “선장님, 일어나십시오. 바깥에서 구조 신호가 보입니다.”':'아래층의 목소리  “배상 채권은 오늘 일몰에 집행하겠습니다.”';
    e.text(title,480,236,`rgba(240,204,117,${Math.min(1,p*1.8)})`,"center",19);e.text(line,480,286,`rgba(238,232,209,${Math.min(1,Math.max(0,(p-.25)*1.7))})`,"center",16);e.text("Esc/X · 이 장면 건너뛰기",930,520,"#817f72","right",11)
  };
  art.v10Storm=function(game){
    const e=game.e,c=e.ctx,ps=game.s.prologueState,t=performance.now()/1000;e.clear("#061321");
    const g=c.createLinearGradient(0,0,0,540);g.addColorStop(0,"#0b1c2e");g.addColorStop(1,"#123f51");c.fillStyle=g;c.fillRect(0,0,960,540);
    for(let i=0;i<80;i++){const x=(i*83+t*410)%1120-80,y=(i*47+t*570)%700-80;c.strokeStyle=`rgba(192,220,226,${.25+(i%4)*.08})`;c.beginPath();c.moveTo(x,y);c.lineTo(x-42,y+94);c.stroke()}
    c.fillStyle="#1f1510";c.fillRect(0,420,960,120);for(let i=0;i<3;i++){const alive=ps.elapsed<1.2+i*1.35,x=280+i*200,y=270+Math.sin(t*2+i)*5;c.fillStyle=alive?"#ffd87a":"#293640";c.beginPath();c.arc(x,y,alive?10:5,0,Math.PI*2);c.fill();c.strokeStyle=alive?"rgba(255,220,130,.36)":"#41515a";c.beginPath();c.arc(x,y,alive?28:11,0,Math.PI*2);c.stroke()}
    e.text("하나씩, 수평선의 신호가 사라졌다.",480,382,"#f1dec0","center",19);e.text("오르소는 사라진 불빛의 수를 장부에 적었다.",480,414,"#c5cfc8","center",14);e.text("Esc/X · 이 장면 건너뛰기",930,520,"#a8aaa1","right",11)
  };
  art.v10Prologue=function(game){const ps=game.s.prologueState;if(ps.phase==="dark-damian")return this.v10Dark(game,true);if(ps.phase==="dark-rian")return this.v10Dark(game,false);if(ps.phase==="storm")return this.v10Storm(game);const scene=game.prologueScene();if(scene)this.v10InteriorScene(game,scene,ps.position,ps.actorId,true)};
})();
