window.HL=window.HL||{};
(function(){
  'use strict';
  const D=HL.DATA,T=24,ROOT='../Assets/Resources/Sprites/Game/StartPortArt/',ART_REV='21-interiors-20260913-2',isNode=typeof process!=='undefined'&&!!process.versions?.node;
  // Native Node image fakes commonly resolve paths literally; browser requests retain the revision.
  const cacheSrc=src=>{if(!src||isNode)return src;return src.includes('?')?`${src}&v=${ART_REV}`:`${src}?v=${ART_REV}`};
  const copy=v=>JSON.parse(JSON.stringify(v)),unit=r=>r.map(v=>v/T);
  // Coordinates are authored in the 960x540 display plane, not inferred from dark pixels.
  const definitions=[
    {number:1,port:'seville',facility:'lodge',floor:'2f',source:'lodge:2f'},
    {number:2,port:'seville',facility:'market',floor:'2f',source:'guild:b1',title:'항해용품 보관·수리실'},
    {number:3,port:'seville',facility:'guild',floor:'2f',source:'guild:2f'},
    {number:4,port:'seville',facility:'guild',floor:'1f',source:'guild:1f'},
    {number:5,port:'lume',facility:'market',floor:'1f',title:'교역소 · 검품과 거래',
      walks:[[31,112,199,303],[230,111,502,317],[751,115,172,113],[710,256,119,118],[706,210,44,219],[710,195,64,33],[682,346,65,28],[447,427,58,91]],
      blocks:[[357,139,248,57],[349,263,263,117],[32,118,102,153],[33,291,123,86],[785,158,100,68],[230,177,24,243],[732,119,18,76],[694,239,15,107],[694,378,15,48],[853,312,74,165]],landing:[808,335],owner:[470,126],
      anchors:[[479,209],[268,296],[620,324],[766,211],[321,407],[679,190],[795,295]]},
    {number:6,port:'london',facility:'harbor',floor:'1f',title:'항만 · 선박 조사실',
      walks:[[34,132,190,272],[255,116,429,303],[224,173,34,51],[718,128,198,129],[686,169,35,50],[714,287,110,136],[446,413,61,101],[672,242,41,181]],
      blocks:[[369,124,220,65],[366,251,244,128],[62,148,139,96],[756,152,125,100],[36,278,96,114],[822,286,105,193],[238,229,20,173],[688,241,22,151]],landing:[778,391],owner:[479,111],
      anchors:[[478,205],[341,298],[630,317],[735,230],[478,401],[272,171],[771,301]]},
    {number:7,port:'venice',facility:'guild',floor:'1f',title:'감정소 · 유물과 계약 기록',
      walks:[[32,124,191,295],[248,120,437,308],[218,168,33,56],[718,114,211,89],[669,177,74,33],[710,253,118,153],[686,208,31,211],[446,425,62,89]],
      blocks:[[370,126,227,65],[380,261,223,141],[63,166,94,121],[757,127,134,67],[33,325,165,83],[227,193,20,119],[226,330,20,92],[823,310,108,174],[744,241,177,18]],landing:[777,403],owner:[480,112],
      anchors:[[482,206],[358,286],[627,297],[731,176],[490,416],[265,313],[773,279]]},
    {number:8,port:'bella',facility:'mansion',floor:'1f',title:'벨라르 저택 · 응접과 가족 식당',
      walks:[[34,123,174,293],[228,116,38,307],[285,107,386,50],[270,236,421,192],[698,114,39,310],[755,126,169,273],[445,422,62,94],[253,281,46,54],[669,281,48,54],[193,211,48,40],[193,361,48,34],[254,128,52,24],[650,128,66,24],[726,214,50,34],[726,301,60,38]],
      blocks:[[420,103,158,45],[369,294,253,112],[62,186,111,78],[37,322,129,81],[783,163,109,91],[755,268,167,26],[828,329,101,148],[277,168,411,58],[755,105,167,14]],landing:[792,327],owner:[470,260],
      anchors:[[482,278],[341,323],[641,334],[770,217],[481,417],[236,195],[784,328]]},
    {number:9,port:'constantinople',facility:'harbor',floor:'1f',title:'항만 · 통역과 선원 명부',
      walks:[[33,133,192,280],[250,120,437,308],[217,168,37,52],[717,126,210,59],[670,159,90,29],[715,227,117,191],[686,174,31,254],[446,425,62,90]],
      blocks:[[370,135,220,62],[375,265,228,140],[46,141,145,83],[33,258,111,153],[775,123,133,64],[755,223,163,25],[828,305,103,175],[228,229,20,188],[695,190,20,144]],landing:[777,402],owner:[478,122],
      anchors:[[479,210],[356,295],[624,310],[730,165],[474,416],[264,174],[785,279]]},
    {number:10,port:'london',facility:'guild',floor:'1f',title:'길드 · 해도와 의뢰 접수',
      walks:[[34,125,195,282],[250,122,453,307],[227,159,28,58],[751,126,175,60],[716,267,116,72],[707,175,38,253],[693,271,77,30],[686,156,80,34],[446,427,61,88]],
      blocks:[[369,132,224,61],[365,260,235,126],[44,150,105,74],[34,281,117,121],[832,305,98,175],[230,181,21,228],[744,195,178,37],[762,126,86,50]],landing:[801,321],owner:[479,117],
      anchors:[[480,207],[343,282],[624,315],[768,184],[480,415],[278,182],[774,286]]},
    {number:11,port:'bella',facility:'guild',floor:'1f',title:'길드 · 항해 기록과 측량',
      walks:[[32,111,195,295],[249,120,456,309],[224,161,29,63],[751,116,176,69],[716,267,116,72],[708,169,38,259],[694,271,76,29],[690,150,77,34],[446,427,61,89]],
      blocks:[[370,129,224,66],[365,260,234,127],[43,151,97,75],[34,275,125,128],[833,306,97,172],[231,176,19,238],[744,193,178,40],[835,143,77,44]],landing:[801,321],owner:[477,116],
      anchors:[[478,208],[343,288],[625,314],[775,187],[480,416],[270,180],[777,287]]}
  ];
  function collision(q){
    const solids=[];
    for(let y=0;y<540;y+=4){let start=-1;for(let x=0;x<=960;x+=4){const blocked=x<960&&!q.walks.some(r=>x+2>=r[0]&&y+2>=r[1]&&x+2<r[0]+r[2]&&y+2<r[1]+r[3]);if(blocked&&start<0)start=x;if(!blocked&&start>=0){solids.push(unit([start,y,x-start,4]));start=-1}}}
    return{walkBounds:[0,0,40,22.5],solids:[...solids,...q.blocks.map(unit)],polygons:[],doors:[]};
  }
  const cw=new HL.CollisionWorld(.28);
  const components=new WeakMap(),STEP=.25;
  const distance=(point,r)=>Math.hypot(point[0]-Math.max(r[0],Math.min(point[0],r[0]+r[2])),point[1]-Math.max(r[1],Math.min(point[1],r[1]+r[3])));
  function component(scene){
    if(components.has(scene))return components.get(scene);
    const [left,top,width,height]=scene.collision.walkBounds,points=[],seen=new Set();
    let seed=null,best=Infinity;
    for(let y=Math.ceil(top/STEP)*STEP;y<top+height;y+=STEP)for(let x=Math.ceil(left/STEP)*STEP;x<left+width;x+=STEP){
      const d=(x-scene.spawn[0])**2+(y-scene.spawn[1])**2;
      if(d<best&&!cw.blocked(scene.collision,x,y,.28)){best=d;seed=[x,y]}
    }
    if(!seed)throw Error('No safe entrance tile');
    points.push(seed);seen.add(seed.join(','));
    for(let i=0;i<points.length;i++)for(const [dx,dy]of [[STEP,0],[-STEP,0],[0,STEP],[0,-STEP]]){
      const [x,y]=points[i],p=[x+dx,y+dy],key=p.join(',');
      if(!seen.has(key)&&!cw.blocked(scene.collision,...p,.28)&&!cw.blocked(scene.collision,x+dx/2,y+dy/2,.28)){seen.add(key);points.push(p)}
    }
    const result={points,seen};components.set(scene,result);return result;
  }
  function safe(scene,point){
    if(!point?.every(Number.isFinite))point=scene.spawn;
    const graph=component(scene),gx=Math.round(point[0]/STEP)*STEP,gy=Math.round(point[1]/STEP)*STEP;
    if(!cw.blocked(scene.collision,...point,.28)&&graph.seen.has([gx,gy].join(','))&&!cw.blocked(scene.collision,(gx+point[0])/2,(gy+point[1])/2,.28))return point.slice();
    let best=graph.points[0],nearest=Infinity;
    for(const p of graph.points){const d=(p[0]-point[0])**2+(p[1]-point[1])**2;if(d<nearest){nearest=d;best=p}}
    return best;
  }
  function validate(scene){
    const points=component(scene).points;
    for(const target of [...scene.hotspots,...scene.stairs,...(scene.floorId==='1f'?[scene.exit]:[])]){
      if(!target.rect?.every(Number.isFinite)||!points.some(p=>distance(p,target.rect)<.8))throw Error(`Unreachable ${target.id||target.label||'exit'}`);
    }
    for(const n of scene.npcs)if(cw.blocked(scene.collision,n.x,n.y,.28))throw Error(`Blocked NPC ${n.id}`);
    return true;
  }
  const records={},errors=[],diagnostics={
    asset:{revision:ART_REV,root:ROOT,requested:0,ready:0,failed:0,pending:0},
    loading:{status:'loading',startedAt:Date.now(),finishedAt:null,failures:[]},
    renderer:{calls:0,ready:0,fallbacks:0,failures:[],last:null}
  };
  function registryBindings(d){
    const specs=[
      ['buildingScenes',D.buildingScenes?.[d.port]?.[d.facility]?.floors],
      ['floorVisualSetsV21',D.floorVisualSetsV21?.[d.port]?.[d.facility]]
    ];
    return specs.map(([name,owner])=>{
      if(!owner||!Object.prototype.hasOwnProperty.call(owner,d.floor))throw Error(`Missing ${name} registry ${d.port}:${d.facility}:${d.floor}`);
      return{name,owner,key:d.floor,value:owner[d.floor]};
    });
  }
  function restore(record){for(const binding of record.bindings||[])binding.owner[binding.key]=binding.value}
  function assetCounts(){
    const assets=Object.values(records).map(r=>r.asset).filter(Boolean);
    diagnostics.asset.requested=assets.length;
    diagnostics.asset.ready=assets.filter(a=>a.status==='ready').length;
    diagnostics.asset.failed=assets.filter(a=>a.status==='error').length;
    diagnostics.asset.pending=assets.filter(a=>a.status==='pending'||a.status==='loading').length;
  }
  function registryState(){
    return Object.fromEntries(Object.entries(records).map(([key,record])=>[key,Object.fromEntries((record.bindings||[]).map(binding=>[
      binding.name,binding.owner[binding.key]===record.scene?'candidate':binding.owner[binding.key]===binding.value?'previous':'unexpected'
    ]))]));
  }
  const InteriorSceneManifest={version:21,saveVersion:21,graphicsVersion:21,revision:ART_REV,assetRoot:ROOT,mappings:definitions.map(d=>({...d,key:[d.port,d.facility,d.floor].join(':')})),records,diagnostics};
  for(const d of definitions){
    const key=[d.port,d.facility,d.floor].join(':');
    try{
    const building=D.buildingScenes[d.port]?.[d.facility],previous=building?.floors[d.floor];
    if(!previous)throw Error(`Unknown floor ${key}`);
    const bindings=registryBindings(d);
    const q=d.source?copy(D.sevilleQualityLayouts[d.source].quality):{...d,spawn:[476,492],exit:[446,499,62,13],props:d.blocks};
    if(d.source&&q.exit)q.exit=q.exit.map(v=>v*T);
    q.title=d.title||q.title;
    const scene={...previous,width:40,height:22.5,quality:undefined,startportArt:key,props:[],collision:collision(q),visual:{...previous.visual,version:21,background:ROOT+`reference_${String(d.number).padStart(2,'0')}.png`,foreground:null},spawn:unit(q.spawn),hotspots:[],npcs:[],stairs:[],exit:{...previous.exit,rect:d.floor==='1f'?unit(q.exit):[-10,-10,1,1]}};
    scene.spawn=safe(scene,scene.spawn);scene.landing=safe(scene,unit(q.landing||d.landing));
    const anchors=(d.anchors||[]).map(unit);
    const spots=d.source?copy(q.spots):copy(previous.hotspots||[]);
    if(d.number===2){spots.forEach(s=>{s.action=`startport-inspect:${s.id}`;if(s.id==='cellar')s.label='보관 장부'});}
    scene.hotspots=spots.map((h,i)=>{
      const p=safe(scene,anchors.length?anchors[i%anchors.length]:[h.rect[0]+h.rect[2]/2,h.rect[1]+h.rect[3]/2]);
      return{...h,rect:[p[0]-.2,p[1]-.2,.4,.4]};
    });
    if(d.floor==='1f'&&!scene.hotspots.some(h=>h.action===`facility:${d.facility}`)){
      const p=safe(scene,anchors[0]||scene.spawn);scene.hotspots.push({id:'service',label:building.name||d.facility,action:`facility:${d.facility}`,rect:[p[0]-.2,p[1]-.2,.4,.4]});
    }
    scene.npcs=copy(previous.npcs||[]).map((n,i)=>{const p=safe(scene,d.source?[n.x,n.y]:unit(i===0?d.owner:d.anchors[(i+1)%d.anchors.length]));return{...n,x:p[0],y:p[1],workZone:[p[0]-.1,p[1]-.1,.2,.2],moving:false}});
    scene.navigation=scene.collision;scene.collision.interactions=scene.hotspots;
    const destinations=d.floor==='1f'?Object.keys(building.floors).filter(f=>f!=='1f'):['1f'];
    scene.stairs=destinations.length?[{id:'art-stair',label:d.floor==='1f'?'층 이동':'1층으로',toFloor:destinations[0],approach:2,rect:[scene.landing[0]-.25,scene.landing[1]-.25,.5,.5],startportLink:true,destinations}]:[];
    validate(scene);
    records[key]={key,definition:d,layout:q,scene,previous,bindings,status:'loading',image:null,error:null,asset:{source:scene.visual.background,requestedSource:null,status:'pending',width:0,height:0}};
    }catch(error){const message=String(error.message||error);errors.push({key,message});records[key]={key,definition:d,status:'error',error:message};console.warn('실내 원화 연결 보류',key,message)}
  }
  function activate(record){
    if(record.status==='ready')return;
    try{
      for(const binding of record.bindings)binding.owner[binding.key]=record.scene;
      record.status='ready';record.asset.status='ready';
    }catch(error){restore(record);throw error}
  }
  function validateRenderer(){
    const proto=HL.Art?.prototype;if(typeof proto?.drawActorV19!=='function'||typeof proto?.nearV10Interaction!=='function'||typeof proto?.v21Interior!=='function')throw Error('Interior renderer is not installed');
    return true;
  }
  const ready=Promise.all(Object.values(records).map(record=>new Promise(resolve=>{
    if(record.status==='error'){resolve(record);return}
    const image=new Image();record.image=image;record.asset.requestedSource=cacheSrc(record.asset.source);record.asset.status='loading';assetCounts();let done=false;
    const fail=error=>{if(done)return;done=true;record.status='error';record.asset.status='error';record.error=String(error?.message||error);restore(record);diagnostics.loading.failures.push({key:record.key,message:record.error});assetCounts();resolve(record)};
    const finish=()=>{if(done)return;if(!(image.naturalWidth||image.width)||!(image.naturalHeight||image.height))return fail('empty image');try{record.asset.width=image.naturalWidth||image.width;record.asset.height=image.naturalHeight||image.height;validate(record.scene);validateRenderer();activate(record);done=true;assetCounts();resolve(record)}catch(error){fail(error)}};
    image.onload=()=>{try{if(image.decode)Promise.resolve(image.decode()).then(finish,fail);else finish()}catch(error){fail(error)}};image.onerror=()=>fail('image load failed');try{image.src=record.asset.requestedSource;if(image.complete&&(image.naturalWidth||image.width))queueMicrotask(()=>image.onload?.())}catch(error){fail(error)}
  }))).then(result=>{diagnostics.loading.status=diagnostics.loading.failures.length?'degraded':'ready';diagnostics.loading.finishedAt=Date.now();assetCounts();return result});
  const opaqueFrames=new WeakMap(),actorContexts=new WeakMap(),opacityErrors=[];
  function opaqueFrame(source){
    if(!source?.getContext||source.width>64||source.height>96)return source;
    if(opaqueFrames.has(source))return opaqueFrames.get(source);
    try{
      const buffer=document.createElement('canvas');buffer.width=source.width;buffer.height=source.height;
      const c=buffer.getContext('2d');c.drawImage(source,0,0);
      const pixels=c.getImageData(0,0,buffer.width,buffer.height);
      for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=pixels.data[i]>32?255:0;
      c.putImageData(pixels,0,0);opaqueFrames.set(source,buffer);return buffer;
    }catch(error){opacityErrors.push(String(error.message||error));opaqueFrames.set(source,source);return source}
  }
  function actorContext(c){
    if(!actorContexts.has(c))actorContexts.set(c,new Proxy(c,{
      get(target,key){if(key==='drawImage')return(source,...args)=>target.drawImage(opaqueFrame(source),...args);const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value},
      set(target,key,value){return Reflect.set(target,key,value,target)}
    }));
    return actorContexts.get(c);
  }
  function noteRenderer(record,status,error){
    diagnostics.renderer.calls++;diagnostics.renderer.last={key:record?.key||null,status,source:record?.asset?.source||null,requestedSource:record?.asset?.requestedSource||null,error:error?String(error.message||error):null};
    if(status==='ready')diagnostics.renderer.ready++;else diagnostics.renderer.fallbacks++;
    if(error)diagnostics.renderer.failures.push({key:record?.key||null,message:String(error.message||error)});
  }
  function fallbackInterior(renderer,game,scene,pos){
    const visual=scene?.visual||{};
    if(visual.version===20&&visual.background&&renderer.v20SpecialInterior)return renderer.v20SpecialInterior(game,scene,pos);
    if(visual.version===20&&!visual.background)return oldInteriorRender.call(renderer,game);
    return oldDraw.call(renderer,game,scene,pos);
  }
  function invalidateAfterRenderFailure(game,record,pos,error){
    restore(record);record.status='error';record.renderError=String(error?.message||error);record.error=`renderer: ${record.renderError}`;
    const scene=record.previous||pos,player=game.s?.interior;
    if(player&&scene){const next=safe(scene,[player.x,player.y]);player.x=next[0];player.y=next[1];game.startportSceneStamp=null;game.playerVelocity={x:0,y:0};game.lastSafe={x:player.x,y:player.y};game.resetFollowersV19?.();if(pos!==player){pos.x=player.x;pos.y=player.y}}
    return scene;
  }
  diagnostics.snapshot=()=>({asset:{...diagnostics.asset},loading:{...diagnostics.loading,failures:diagnostics.loading.failures.slice()},registry:registryState(),renderer:{...diagnostics.renderer,failures:diagnostics.renderer.failures.slice()}});
  HL.InteriorSceneManifest=InteriorSceneManifest;
  HL.StartPortInteriors={manifest:InteriorSceneManifest,records,ready,safe,validate,errors,opaqueFrame,opacityErrors,diagnostics};
  const game=HL.Game.prototype,art=HL.Art.prototype,oldSafe=game.ensureSafePosition,oldScene=game.interiorScene,oldChange=game.changeFloor,oldDispatch=game.dispatchAction,oldExecute=game.executeV10InteriorAction,oldDraw=art.v21Interior,oldInteriorRender=art.interior;
  game.interiorScene=function(){
    const scene=oldScene.call(this);if(!scene?.startportArt||!this.s.interior){this.startportSceneStamp=null;return scene}
    // A scene may become ready while the player is inside its fallback layout.
    const p=this.s.interior,stamp=scene.startportArt;
    if(this.startportSceneStamp!==stamp){this.startportSceneStamp=stamp;const next=safe(scene,[p.x,p.y]);p.x=next[0];p.y=next[1];this.playerVelocity={x:0,y:0};this.lastSafe={x:p.x,y:p.y};this.resetFollowersV19();}
    return scene;
  };
  game.ensureSafePosition=function(){const s=this.mode==='interior'?this.interiorScene():null;if(!s?.startportArt)return oldSafe.call(this);const p=this.s.interior,next=safe(s,[p.x,p.y]),moved=p.x!==next[0]||p.y!==next[1];p.x=next[0];p.y=next[1];this.lastSafe={x:p.x,y:p.y};if(moved){this.playerVelocity={x:0,y:0};this.resetFollowersV19()}};
  function travel(g,toFloor){const target=g.currentBuilding()?.floors[toFloor];if(!target)return;let spawn=target.landing;
    if(!spawn){const back=target.stairs?.find(s=>s.toFloor===g.s.interior.floorId);spawn=safe(target,back?[back.rect[0]+back.rect[2]/2,back.rect[1]+back.rect[3]+.8]:target.spawn)}
    g.beginTransition(()=>{Object.assign(g.s.interior,{floorId:toFloor,x:spawn[0],y:spawn[1]});g.startportSceneStamp=null;g.ensureSafePosition();g.resetFollowersV19();g.save();g.e.sfx('wood_knock',.25)});
  }
  game.changeFloor=function(link){const current=this.interiorScene(),target=this.currentBuilding()?.floors[link.toFloor];if(!current?.startportArt&&!target?.startportArt)return oldChange.call(this,link);
    const options=link.destinations||[link.toFloor];if(options.length>1)return this.e.dialogue('계단','어느 층으로 갈까?',[...options.map(f=>({label:f==='b1'?'지하 작업실':'2층',action:`startport-floor:${f}`})),{label:'돌아선다',action:'close'}]);return travel(this,options[0]);
  };
  game.dispatchAction=function(action,button){if(action.startsWith('startport-floor:')){const floor=action.slice(16),scene=this.interiorScene();if(!scene?.stairs.some(s=>(s.destinations||[]).includes(floor)))return;this.e.close();return travel(this,floor)}return oldDispatch.call(this,action,button)};
  game.executeV10InteriorAction=function(action){if(action.startsWith('startport-inspect:')||action.startsWith('seville-inspect:')){const s=this.interiorScene();if(s?.startportArt){const h=s.hotspots.find(h=>h.action===action);if(h)return this.e.dialogue(h.label,h.text||'손때가 묻은 기록과 도구가 가지런히 놓여 있다.',[{label:'돌아선다',action:'close'}])}}return oldExecute.call(this,action)};
  art.v21Interior=function(g,s,pos){if(!s.startportArt)return oldDraw.call(this,g,s,pos);const r=records[s.startportArt],fallback=r?.previous||s;if(!r||r.status!=='ready'||!(r.image.naturalWidth||r.image.width)){noteRenderer(r,'fallback');return fallbackInterior(this,g,fallback,pos)}
    const c=g.e.ctx,e=g.e;try{e.clear('#000');c.save();c.imageSmoothingEnabled=false;c.globalAlpha=1;
      const iw=r.image.naturalWidth||r.image.width,ih=r.image.naturalHeight||r.image.height,scale=Math.min(960/iw,540/ih),w=iw*scale,h=ih*scale,ox=(960-w)/2,oy=(540-h)/2;
      c.drawImage(r.image,ox,oy,w,h);
      const actors=[...(s.npcs||[]),...(g.s.partyFollowerState?.render||[]),{...pos,player:true}].sort((a,b)=>a.y-b.y);
      for(const a of actors){c.globalAlpha=1;this.drawActorV19(actorContext(c),a.player?g.s.captainId:(a.appearanceId||a.id),Math.round(a.x*T),Math.round(a.y*T),a.dir??4,a.player?g.playerMoving:!!a.moving,a.player?g.playerAnim:0,1)}
      c.restore();const near=this.nearV10Interaction(pos,s);if(near){c.fillStyle='rgba(3,10,14,.94)';c.fillRect(280,495,400,30);e.text(near.label,480,516,'#ffe2a2','center',15)}
      c.fillStyle='rgba(3,10,14,.88)';c.fillRect(210,6,540,25);e.text(r.layout.title,480,24,'#f6dab1','center',14);
      const wake=g.s.openingWakeV21;if(wake&&!wake.completed&&wake.reveal<1){c.save();c.globalAlpha=1-wake.reveal;c.fillStyle='#000';c.fillRect(0,0,960,540);c.restore();if(wake.reveal>.18&&!wake.heardCall)e.text(D.openingWakeDefinitionsV21.calls[g.s.captainId].wake,480,475,'#fff1d7','center',15)}
      noteRenderer(r,'ready');
    }catch(error){try{c.restore()}catch{}const restored=invalidateAfterRenderFailure(g,r,pos,error);noteRenderer(r,'fallback',error);return fallbackInterior(this,g,restored,g.s?.interior||pos)}
  };
  // Route start-port scenes through the full game render entry point.
  art.interior=function(g){const s=g.interiorScene?.();if(s?.startportArt)return this.v21Interior(g,s,g.s.interior);return oldInteriorRender.call(this,g)};
})();
