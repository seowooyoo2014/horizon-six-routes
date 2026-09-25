window.HL=window.HL||{};
(function(){
  'use strict';
  const D=HL.DATA,art=HL.Art.prototype,IT=24;
  const palettes={
    iberia:{floor:'#536e68', grout:'#2b4748', wood:'#70432d', trim:'#b77b45', wall:'#c8ad7d', rug:'#8d3040', light:'#f5c96b'},
    med:{floor:'#4d6570', grout:'#263b47', wood:'#6e442d', trim:'#b47b43', wall:'#b9a27b', rug:'#344e83', light:'#f0c36a'},
    north:{floor:'#495b63', grout:'#25353e', wood:'#583a2b', trim:'#9b6c43', wall:'#8b877b', rug:'#71384b', light:'#e5b95e'},
    ottoman:{floor:'#35666a', grout:'#1d3e49', wood:'#62402b', trim:'#ae7840', wall:'#bba276', rug:'#7d3045', light:'#f1c463'},
    default:{floor:'#50666a', grout:'#273f43', wood:'#67432f', trim:'#a87343', wall:'#aa9674', rug:'#713849', light:'#e9bb61'}
  };
  const palette=s=>palettes[s.culture]||palettes.default;
  const px=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
  const rect=(c,x,y,w,h,fill,stroke)=>{px(c,x,y,w,h,fill);if(stroke){c.strokeStyle=stroke;c.strokeRect(Math.round(x)+.5,Math.round(y)+.5,Math.round(w)-1,Math.round(h)-1)}};
  function drawProp(c,o,p,time){
    const x=o.x*IT,y=o.y*IT,w=o.w*IT,h=o.h*IT;
    rect(c,x,y,w,h,'#281d1a',p.wood);
    if(['counter','desk','table','maptable','dining','workbench'].includes(o.type)){
      rect(c,x+3,y+3,w-6,Math.min(10,h-6),p.trim);
      px(c,x+7,y+7,w-14,2,'#e0b56b');
      for(let xx=x+10;xx<x+w-8;xx+=18)px(c,xx,y+h-8,3,Math.max(4,h-12),'#38251d');
    } else if(['shelf','books','cabinet','wardrobe','medicine','ledger','documents'].includes(o.type)){
      rect(c,x+3,y+4,w-6,h-7,'#3a2924',p.wood);
      for(let yy=y+12;yy<y+h-5;yy+=11){px(c,x+5,yy,w-10,2,p.trim);for(let xx=x+7;xx<x+w-7;xx+=8)px(c,xx,yy-7,5,7,['#8c3c42','#315b67','#c29c53'][Math.floor((xx+yy)/8)%3])}
    } else if(['crate','sacks','textile','rope','sail','chest','safe'].includes(o.type)){
      rect(c,x+3,y+3,w-6,h-6,'#755036',p.trim);c.strokeStyle='#3b261f';c.beginPath();c.moveTo(x+5,y+5);c.lineTo(x+w-5,y+h-5);c.moveTo(x+w-5,y+5);c.lineTo(x+5,y+h-5);c.stroke();
    } else if(['bed','hearth'].includes(o.type)){
      rect(c,x+3,y+3,w-6,h-6,o.type==='bed'?'#263f55':'#3a2923',p.trim);if(o.type==='hearth'){px(c,x+w/2-5,y+h-12,10,9,'#e36b34');px(c,x+w/2-2,y+h-10,5,6,p.light)}
    } else if(['scale','telescope','chart','plans','model','portrait','seal','keepsake'].includes(o.type)){
      px(c,x+w/2-2,y+4,4,h-8,p.light);px(c,x+5,y+h/2-2,w-10,4,p.trim);
    } else if(o.type==='water'){
      px(c,x,y,w,h,'#1e6475');for(let yy=y+6;yy<y+h;yy+=10)px(c,x+(Math.floor(time*12+yy)%18),yy,18,2,'#7fb9b7');
    } else if(o.type==='stair'||o.type==='stairUp'||o.type==='stairDown'){
      for(let yy=y+4;yy<y+h-3;yy+=7){px(c,x+4,yy,w-8,4,p.trim);px(c,x+5,yy+1,w-10,1,'#e1bb74')}
    } else {
      px(c,x+5,y+5,w-10,h-10,p.trim);
    }
  }
  art.v21KitInterior=function(game,scene,pos){
    const e=game.e,c=e.ctx,time=performance.now()/1000,p=palette(scene),W=scene.width*IT,H=scene.height*IT;
    e.clear('#050708');c.save();c.translate(Math.round((960-W)/2),Math.round((540-H)/2));
    rect(c,0,0,W,H,p.floor,p.grout);
    for(let y=0;y<H;y+=IT)for(let x=0;x<W;x+=IT){c.strokeStyle='rgba(238,220,170,.10)';c.strokeRect(x+.5,y+.5,IT-1,IT-1);if((x/IT+y/IT+(scene.seed||0))%7===0)px(c,x+5,y+9,7,2,'rgba(24,31,31,.20)')}
    px(c,0,0,W,IT*1.5,p.wall);px(c,0,0,IT*1.5,H,p.wall);px(c,W-IT*1.5,0,IT*1.5,H,p.wall);px(c,0,H-IT*1.2,W,IT*1.2,p.wood);
    for(let x=IT*2;x<W-IT*2;x+=IT*6){px(c,x,5,4,IT-8,p.light);px(c,x+5,8,2,IT-14,'rgba(255,224,150,.34)')}
    const rug=[W*.30,H*.42,W*.40,H*.27];rect(c,...rug,p.rug,p.trim);rect(c,rug[0]+8,rug[1]+8,rug[2]-16,rug[3]-16,'rgba(40,20,28,.24)',p.trim);
    for(const o of scene.props||[])if(!o.high)drawProp(c,o,p,time);
    const actors=[...(scene.npcs||[]).map(n=>({q:n,y:n.y})),...(game.s.partyFollowerState?.render||[]).map(q=>({q,y:q.y})),{q:pos,y:pos.y,player:true}].sort((a,b)=>a.y-b.y);
    for(const a of actors){const q=a.q,id=a.player?game.s.captainId:(q.appearanceId||q.id);c.globalAlpha=1;this.drawActorV19(c,id,q.x*IT+IT/2,q.y*IT+25,q.dir??4,a.player?game.playerMoving:!!q.moving,a.player?game.playerAnim:(q.anim||time),1)}
    for(const o of scene.props||[])if(o.high)drawProp(c,o,p,time);
    c.restore();
    const near=this.nearV10Interaction(pos,scene);if(near){px(c,280,495,400,30,'rgba(3,10,14,.94)');e.text(near.label,480,516,'#ffe2a2','center',15)}
    px(c,210,6,540,25,'rgba(3,10,14,.88)');e.text(`${D.ports[game.s.currentPort]?.name||''} · ${game.currentBuilding()?.name||scene.facility} ${scene.floorId.toUpperCase()}`,480,24,'#f6dab1','center',14);
  };
  const oldInterior=art.interior;
  art.interior=function(game){const s=game.interiorScene?.();if(s&&!s.startportArt&&s.visual?.version===20)return this.v21KitInterior(game,s,game.s.interior);return oldInterior.call(this,game)};
})();
