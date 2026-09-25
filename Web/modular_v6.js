window.HL=window.HL||{};
(function(){
  const T=30;
  const cultures={
    iberia:{floor:["#b89463","#a77d50"],wall:["#d7bd8c","#8c5138"],wood:["#6c4129","#3d261e"],cloth:"#9f3d32",accent:"#e0b552"},
    north:{floor:["#8b8373","#756e63"],wall:["#9b8070","#5b3b38"],wood:["#58412f","#302721"],cloth:"#315b71",accent:"#d4aa58"},
    med:{floor:["#b48b5d","#997147"],wall:["#d1b07e","#744032"],wood:["#65402a","#38231c"],cloth:"#a74335",accent:"#d9ae55"},
    island:{floor:["#a98c62","#8f704c"],wall:["#c9b289","#675448"],wood:["#6c4b31","#38291f"],cloth:"#317276",accent:"#ddb95f"},
    maghreb:{floor:["#b89a68","#9d7b50"],wall:["#d9c99f","#806541"],wood:["#6a472c","#3a2a1d"],cloth:"#3e7770",accent:"#e3bd61"},
    ottoman:{floor:["#a4815a","#8d6747"],wall:["#c7aa7e","#6b4658"],wood:["#62422c","#38251e"],cloth:"#70435e",accent:"#dcb95a"},
    africa:{floor:["#aa8051","#8d633e"],wall:["#c7a06e","#6c4b32"],wood:["#664128","#34241c"],cloth:"#4e7145",accent:"#e0ae50"},
    arabia:{floor:["#b49462","#95784f"],wall:["#d8c497","#7b6142"],wood:["#68452b","#38271d"],cloth:"#365f63",accent:"#dfbd65"},
    india:{floor:["#ad7f55","#945f47"],wall:["#d1ae7d","#824650"],wood:["#65402a","#35241d"],cloth:"#934553",accent:"#e1b94d"},
    seasia:{floor:["#9a7650","#7d5c3d"],wall:["#c7a874","#456b63"],wood:["#604027","#30231a"],cloth:"#37716a",accent:"#ddb253"},
    china:{floor:["#9b7550","#80583e"],wall:["#c3a270","#783b36"],wood:["#5b3625","#2e201a"],cloth:"#8c3834",accent:"#d5ad50"},
    japan:{floor:["#a98f69","#8e7457"],wall:["#d5c6a5","#4e5965"],wood:["#5f4430","#30271f"],cloth:"#445f79",accent:"#d9b768"},
    caribbean:{floor:["#ad8c5e","#937044"],wall:["#d5c28d","#397079"],wood:["#694329","#37251b"],cloth:"#b25a32",accent:"#e2bc59"},
    americas:{floor:["#a57c4f","#885d39"],wall:["#c8a373","#597044"],wood:["#65402a","#34231a"],cloth:"#9b5035",accent:"#dbaf53"}
  };
  const layouts={
    market:{title:"교역소",owner:[16,5.65],objects:[
      ["counter",9,7,14,2,"거래대"],["shelf",2,3,6,2,"향신료 선반"],["shelf",24,3,6,2,"직물 선반"],["crate",4,10,3,2,"입고품"],["ledger",25,10,3,2,"시세 장부"]]},
    inn:{title:"술집과 여관",owner:[16,5.65],objects:[
      ["counter",10,7,12,2,"주점대"],["table",3,10,5,3,"소문 탁자"],["table",24,10,5,3,"포커 탁자"],["barrel",3,4,2,2,"술통"],["bed",24,3,6,3,"객실"]]},
    shipyard:{title:"조선소",owner:[16,5.65],objects:[
      ["counter",10,7,12,2,"작업 지시대"],["shipmodel",2,3,7,3,"선박 모형"],["bench",23,3,7,3,"개조 작업대"],["crate",3,11,4,2,"선재"],["barrel",26,11,2,2,"타르"]]},
    guild:{title:"항해자 길드",owner:[16,5.65],objects:[
      ["counter",10,7,12,2,"접수대"],["board",2,3,7,3,"의뢰 게시판"],["chart",23,3,7,3,"세계 해도"],["shelf",3,11,5,2,"항해 도구"],["ledger",25,11,3,2,"국가 장부"]]},
    lodge:{title:"여관",owner:[16,5.65],objects:[
      ["counter",11,7,10,2,"안내대"],["bed",2,3,7,3,"침대"],["bed",23,3,7,3,"침대"],["table",4,11,4,2,"상태 장부"],["chest",25,11,3,2,"보관함"]]},
    harbor:{title:"항만 사무소",owner:[16,5.65],objects:[
      ["counter",10,7,12,2,"항만 접수대"],["crate",2,3,7,3,"보급 창고"],["chart",23,3,7,3,"항로표"],["barrel",4,11,2,2,"식수"],["ledger",25,11,3,2,"출항 문서"]]},
    mansion:{title:"선장 저택",owner:[16,5.65],objects:[
      ["desk",10,7,12,2,"서재 책상"],["shelf",2,3,7,3,"항로 장부"],["chart",23,3,7,3,"푸른 자오선"],["chair",5,11,2,2,"의자"],["chest",25,11,3,2,"가문 보관함"]]}
  };
  HL.DATA.interiorModules={tileSize:T,cultures,layouts};

  const hotspotAction={
    market:["facility:market","facility:market","facility:market","facility:market","market-view"],
    inn:["facility:inn","gossip","gamble","facility:inn","rest"],
    shipyard:["facility:shipyard","facility:shipyard","facility:shipyard","repair","facility:shipyard"],
    guild:["facility:guild","guild-job","facility:guild","facility:guild","nation-info"],
    lodge:["facility:lodge","rest","rest","status","facility:lodge"],
    harbor:["facility:harbor","facility:harbor","facility:harbor","facility:harbor","facility:harbor"],
    mansion:["facility:mansion","story-ledger","story-chart","facility:mansion","story-ledger"]
  };
  for(const[id,scene]of Object.entries(HL.DATA.interiorScenes)){
    const layout=layouts[id],solids=[[0,0,32,2.2],[0,0,1.2,18],[30.8,0,1.2,18]];
    for(const[,x,y,w,h]of layout.objects)solids.push([x,y,w,h]);
    scene.modular=layout;scene.spawn=[16,15.4];scene.exit={rect:[14.4,16.25,3.2,1.1],label:"나가기"};
    scene.owner={x:layout.owner[0],y:layout.owner[1],name:scene.owner.name};
    scene.hotspots=layout.objects.map((o,index)=>({id:`${id}-${index}`,rect:[o[1],o[2],o[3],o[4]],label:o[5],action:hotspotAction[id][index]}));
    scene.collision={walkBounds:[1.2,2.2,29.6,14.9],solids,polygons:[],doors:[{id:"exit",rect:scene.exit.rect,approach:4}],interactions:scene.hotspots};
  }

  const art=HL.Art.prototype;
  art.modulePalette=function(game){const p=HL.DATA.ports[game.s.currentPort],culture=p?.culture||"iberia";return cultures[culture]||cultures.iberia};
  art.pixelRect=function(c,x,y,w,h,fill,edge){c.fillStyle=fill;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));if(edge){c.strokeStyle=edge;c.lineWidth=2;c.strokeRect(Math.round(x)+1,Math.round(y)+1,Math.round(w)-2,Math.round(h)-2)}};
  art.drawInteriorModule=function(e,o,p){
    const c=e.ctx,[type,tx,ty,tw,th]=o,x=tx*T,y=ty*T,w=tw*T,h=th*T,wood=p.wood;
    if(type==="counter"||type==="desk"){this.pixelRect(c,x,y,w,h,wood[0],wood[1]);for(let q=x+16;q<x+w;q+=32)this.pixelRect(c,q,y+9,16,h-18,"rgba(222,170,88,.12)","#3a241b");c.fillStyle=p.accent;c.fillRect(x+8,y+5,w-16,3)}
    else if(type==="shelf"){this.pixelRect(c,x,y,w,h,wood[1],"#291b16");for(let row=12;row<h-5;row+=20){c.fillStyle=wood[0];c.fillRect(x+5,y+row,w-10,5);for(let bx=x+10;bx<x+w-10;bx+=11){c.fillStyle=[p.cloth,p.accent,"#557a66","#b7784b"][(bx/11+row)%4|0];c.fillRect(bx,y+row-10,7,10)}}}
    else if(type==="table"){this.pixelRect(c,x+8,y+5,w-16,h-14,wood[0],wood[1]);this.pixelRect(c,x+14,y+h-15,12,15,wood[1]);this.pixelRect(c,x+w-26,y+h-15,12,15,wood[1])}
    else if(type==="bed"){this.pixelRect(c,x,y,w,h,"#d3c18f",wood[1]);c.fillStyle=p.cloth;c.fillRect(x+10,y+22,w-20,h-30);c.fillStyle="#eee1b8";c.fillRect(x+12,y+8,w-24,18)}
    else if(type==="chart"||type==="board"){this.pixelRect(c,x,y,w,h,type==="chart"?"#cbb27b":wood[0],wood[1]);c.strokeStyle=type==="chart"?"#6f684b":p.accent;for(let i=1;i<5;i++){c.beginPath();c.moveTo(x+12,y+i*h/5);c.lineTo(x+w-12,y+i*h/5-5);c.stroke()}}
    else if(type==="shipmodel"){this.pixelRect(c,x,y+h-17,w,17,wood[0],wood[1]);c.fillStyle="#74452d";c.beginPath();c.moveTo(x+18,y+h-25);c.lineTo(x+w-16,y+h-25);c.lineTo(x+w-35,y+h-8);c.lineTo(x+30,y+h-8);c.fill();c.strokeStyle="#d3b66d";c.beginPath();c.moveTo(x+w/2,y+8);c.lineTo(x+w/2,y+h-24);c.stroke();c.fillStyle="#ddd0a1";c.beginPath();c.moveTo(x+w/2+2,y+10);c.lineTo(x+w/2+2,y+h-28);c.lineTo(x+w-18,y+h-28);c.fill()}
    else if(type==="bench"){this.pixelRect(c,x,y,w,h,wood[0],wood[1]);c.fillStyle="#7c8b84";for(let i=0;i<4;i++)c.fillRect(x+14+i*28,y+8,18,7)}
    else if(type==="crate"||type==="chest"){this.pixelRect(c,x,y,w,h,wood[0],wood[1]);c.strokeStyle=p.accent;c.beginPath();c.moveTo(x+5,y+5);c.lineTo(x+w-5,y+h-5);c.moveTo(x+w-5,y+5);c.lineTo(x+5,y+h-5);c.stroke()}
    else if(type==="barrel"){c.fillStyle=wood[0];c.beginPath();c.ellipse(x+w/2,y+h/2,w*.36,h*.46,0,0,Math.PI*2);c.fill();c.strokeStyle="#2d211b";c.stroke();c.fillRect(x+w*.2,y+h*.32,w*.6,4);c.fillRect(x+w*.2,y+h*.65,w*.6,4)}
    else if(type==="ledger"){this.pixelRect(c,x,y,w,h,wood[0],wood[1]);c.fillStyle="#d9c58e";c.fillRect(x+10,y+8,w-20,h-16);c.strokeStyle="#7a5f42";c.beginPath();c.moveTo(x+w/2,y+8);c.lineTo(x+w/2,y+h-8);c.stroke()}
    else if(type==="chair"){this.pixelRect(c,x+8,y+4,w-16,h-10,wood[0],wood[1])}
  };
  art.interior=function(game){
    this.ensureV5Images();const e=game.e,c=e.ctx,s=game.s,scene=game.interiorScene(),layout=scene.modular||layouts[scene.id],p=this.modulePalette(game),t=performance.now()/1000;e.clear(p.floor[0]);
    for(let y=0;y<18;y++)for(let x=0;x<32;x++){c.fillStyle=(x+y)%2?p.floor[0]:p.floor[1];c.fillRect(x*T,y*T,T,T);c.fillStyle="rgba(255,236,176,.045)";c.fillRect(x*T+2,y*T+2,T-4,2)}
    c.fillStyle=p.wall[1];c.fillRect(0,0,960,68);for(let x=0;x<960;x+=48){c.fillStyle=(x/48)%2?p.wall[0]:p.wall[1];c.fillRect(x,8,46,53)}c.fillStyle=woodShade(p.wood[1],.72);c.fillRect(0,62,960,10);for(const lx of[286,674]){const flicker=.3+(Math.sin(t*7+lx)*.5+.5)*.18;c.fillStyle=`rgba(255,201,92,${flicker})`;c.fillRect(lx-8,46,16,9);c.fillStyle="#4a3020";c.fillRect(lx-11,55,22,5)}
    const port=HL.DATA.ports[s.currentPort],culture=port?.culture||"iberia";e.text(`${port?.name||"항구"} · ${layout.title}`,20,44,"#fff0bd","left",20);e.text(culture.toUpperCase(),936,43,p.accent,"right",11);
    const ownerId=scene.id==="mansion"&&s.currentPort==="bella"?"damian":scene.id==="guild"&&s.currentPort==="genoa"?"acel":`owner_${s.currentPort}_${scene.id}`,actors=[{kind:"owner",x:scene.owner.x,y:scene.owner.y,dir:4,id:ownerId},{kind:"hero",x:s.interior.x,y:s.interior.y,dir:s.interior.dir,id:"rian"}];
    const objects=layout.objects.map(o=>({kind:"object",x:o[1],y:o[2]+o[4],data:o}));for(const item of[...objects,...actors].sort((a,b)=>a.y-b.y)){if(item.kind==="object")this.drawInteriorModule(e,item.data,p);else this.person(e,item.x*T,item.y*T+8,item.dir,item.kind==="hero",item.kind==="hero"?game.playerAnim:t*.18,1.34,item.id,item.kind==="hero"&&game.playerMoving)}
    e.text(game.ownerName(scene.id),scene.owner.x*T,scene.owner.y*T-89,"#fff0bd","center",13);for(const h of scene.hotspots)this.renderHotspotHint(game,h);c.fillStyle="rgba(5,22,27,.9)";c.fillRect(432,508,96,25);c.strokeStyle=p.accent;c.strokeRect(433,509,94,23);e.text("▼ 나가기",480,526,"#f3d887","center",13)
  };
  function woodShade(hex,f){const v=hex.replace("#","");return`rgb(${[0,2,4].map(i=>Math.round(parseInt(v.slice(i,i+2),16)*f)).join(",")})`}

  const game=HL.Game.prototype,oldEnsure=game.ensureExpansion,oldDispatch=game.dispatchAction;
  game.ensureExpansion=function(){oldEnsure.call(this);if(this.s?.interior){const scene=HL.DATA.interiorScenes[this.s.interior.id];if(scene&&this.collision.blocked(scene.collision,this.s.interior.x,this.s.interior.y,.28)){this.s.interior.x=scene.spawn[0];this.s.interior.y=scene.spawn[1];this.lastSafe={x:scene.spawn[0],y:scene.spawn[1]}}}};
  game.marketMenu=function(){
    const p=HL.DATA.ports[this.s.currentPort],ids=[...new Set([...p.specialties,"grain","salt","timber","wine","medicine","lime_juice","gunpowder","weapons"])],goods=ids.map(id=>HL.DATA.goods.find(g=>g.id===id)).filter(Boolean),used=Object.values(this.s.cargo).reduce((a,b)=>a+b,0),cap=HL.DATA.ships[this.s.fleet[0].type].cargo;
    const rows=goods.map((g,i)=>{const q=this.s.cargo[g.id]||0,buy=this.economy.price(p,g.id,this.s.day,true),sell=this.economy.price(p,g.id,this.s.day,false),base=g.base||buy,trend=buy<base*.9?"호재":buy>base*1.12?"고가":"보통",tone=trend==="호재"?"good":trend==="고가"?"bad":"";return`<div class="trade-row"><span class="good-icon c${i%6}">${g.name.slice(0,1)}</span><span class="good-name"><strong>${g.name}</strong><small>${g.category||"교역품"} · 보유 ${q}</small></span><span class="price"><small>구입</small>${buy}</span><span class="price"><small>판매</small>${sell}</span><span class="trend ${tone}">${trend}</span><span class="trade-actions">${this.e.button("+1",`buy:${g.id}`)}${this.e.button("+5",`trade-buy5:${g.id}`)}${this.e.button("-1",`sell:${g.id}`)}${this.e.button("-5",`trade-sell5:${g.id}`)}</span></div>`}).join("");
    this.e.window(`<div class="trade-head"><div><small>${p.modern||""} · ${HL.DATA.nations[p.nation]?.name||""}</small><h1>${p.name} 교역소</h1></div><div class="trade-wallet"><strong>${this.s.money.toLocaleString()} 금화</strong><span>적재 ${used} / ${cap}</span><i><b style="width:${Math.min(100,used/cap*100)}%"></b></i></div></div><div class="trade-tabs"><button class="active">전체 상품</button><button disabled>특산품 ${p.specialties.length}</button><button disabled>보유 화물</button></div><div class="trade-columns"><span>품목</span><span>구입가</span><span>판매가</span><span>시세</span><span>수량</span></div><div class="trade-list">${rows}</div><footer class="trade-footer"><span>Enter/Z 버튼 선택 · 가격은 날짜와 투자에 따라 변합니다.</span><div>${this.e.button("1,000 투자","market-invest")}${this.e.button("거래 종료","close","primary")}</div></footer>`,"trade-window")
  };
  game.dispatchAction=function(a,b){if(a.startsWith("trade-buy5:")||a.startsWith("trade-sell5:")){const buy=a.startsWith("trade-buy5:"),id=a.split(":")[1];for(let i=0;i<5;i++){const beforeMoney=this.s.money,beforeQty=this.s.cargo[id]||0;this.trade(id,buy);this.e.close();if(beforeMoney===this.s.money&&beforeQty===(this.s.cargo[id]||0))break}return this.marketMenu()}return oldDispatch.call(this,a,b)};
})();
