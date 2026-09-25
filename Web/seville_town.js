window.HL=window.HL||{};
(function(){
  "use strict";
  const D=HL.DATA,map=D.townDefinitionsV19.seville,oldTown=HL.Art.prototype.town;
  const SW=1672,SH=941,T=30,TW=1920,TH=1080,ASSET="../Assets/Resources/Sprites/Game/SevilleQuality/seville_town_source_v2.png",FOREGROUND_ROOT="../Assets/Resources/Sprites/Game/SevilleQuality/foreground_objects/",actorRenderer=HL.Art.prototype.drawActorV19;
  const point=([x,y])=>[x*64/SW,y*36/SH],rect=([x,y,w,h])=>[x*64/SW,y*36/SH,w*64/SW,h*36/SH];
  const copy=value=>JSON.parse(JSON.stringify(value));
  const inside=(x,y,r)=>x>=r[0]&&y>=r[1]&&x<r[0]+r[2]&&y<r[1]+r[3];
  const containScale=Math.min(TW/SW,TH/SH),containSize=[SW*containScale,SH*containScale],containOffset=[(TW-containSize[0])/2,(TH-containSize[1])/2];
  const foregroundDefinitions=[
    {id:"plaza-nw",type:"tree",sourceRect:[677,331,69,79],anchor:[710,406]},
    {id:"plaza-east-upper",type:"tree",sourceRect:[1007,340,72,87],anchor:[1043,424]},
    {id:"plaza-west-middle",type:"tree",sourceRect:[678,464,71,86],anchor:[712,548]},
    {id:"plaza-east-middle",type:"tree",sourceRect:[917,461,77,89],anchor:[954,548]},
    {id:"plaza-east-outer",type:"tree",sourceRect:[1007,469,72,81],anchor:[1043,548]},
    {id:"plaza-sw",type:"tree",sourceRect:[691,613,83,90],anchor:[729,708]},
    {id:"home-west-tree",type:"tree",sourceRect:[208,567,79,97],anchor:[245,660]},
    {id:"southwest-tree",type:"tree",sourceRect:[47,566,78,92],anchor:[85,655]},
    {id:"harbor-west-tree",type:"tree",sourceRect:[1151,333,69,82],anchor:[1185,412]},
    {id:"harbor-east-tree",type:"tree",sourceRect:[1484,329,77,91],anchor:[1525,416]},
    {id:"market-west-canvas",type:"awning",sourceRect:[116,444,79,52],anchor:[151,520]},
    {id:"market-upper-canvas",type:"awning",sourceRect:[201,375,79,46],anchor:[239,489]},
    {id:"market-east-canvas",type:"awning",sourceRect:[282,450,68,45],anchor:[313,520]},
    {id:"market-farwest-canvas",type:"awning",sourceRect:[81,396,30,38],anchor:[91,479]}
  ].map(definition=>({...definition,anchorY:definition.anchor[1],source:FOREGROUND_ROOT+definition.id+".png"}));

  // These are observed source pixels from seville_day_source_v2_review.png.
  const sourceBuildings=[
    {id:"bank",extent:[48,24,263,256],footprint:[2,1,8,9],door:[181,257],approach:[181,296]},
    {id:"estate",extent:[350,12,312,267],footprint:[13,1,10,9],door:[529,263],approach:[529,296]},
    {id:"mansion",extent:[688,12,292,266],footprint:[26,1,10,9],door:[834,248],approach:[834,296]},
    {id:"guild",extent:[1021,0,308,279],footprint:[39,1,10,9],door:[1176,259],approach:[1176,296]},
    {id:"lodge",extent:[1356,13,273,264],footprint:[53,1,9,9],door:[1480,257],approach:[1480,296]},
    {id:"market",extent:[82,333,298,218],footprint:[2,15,9,7],door:[236,528],approach:[236,560]},
    {id:"inn",extent:[411,323,252,220],footprint:[14,15,9,7],door:[531,530],approach:[531,560]},
    {id:"home",extent:[291,563,245,182],footprint:[8,25,10,4],door:[402,738],approach:[402,767]},
    // The roof overhang begins at y=284, but the paved route in front of it
    // remains ground-clear until the traced road edge at y=293.
    {id:"harbor",extent:[1170,284,411,263],collisionTop:293,footprint:[49,15,12,7],door:[1280,525],approach:[1280,559]},
    {id:"shipyard",extent:[1057,555,493,190],footprint:[44,25,16,4],door:[1194,730],approach:[1194,767]}
  ];
  const doorWalkways=sourceBuildings.map(building=>[building.door[0]-20,building.door[1]-30,40,150]);
  const walkRegions=[
    // Visible road core is y=293..330. The expanded source mask carries the
    // actor-radius clearance up to the upper-door landings and into the next
    // plaza band; the harbor projection splits the upper route into west and
    // east branches so guild/lodge travel detours around it on visible ground.
    [25,271,1145,70],
    [1415,271,230,70],
    [25,326,1620,234],
    [25,545,1620,185],
    [25,710,1620,96],
    [785,764,100,177],
    [742,326,38,440],
    [895,326,26,440],
    ...doorWalkways
  ];
  const sourceProps=[
    [782,403,109,115], // dry fountain basin and pedestal
    [680,332,48,78],[943,332,48,78],[1001,332,48,78],
    [682,492,56,73],[922,492,56,73],[1010,493,50,73],
    [31,348,44,58],[365,348,44,58],[676,431,34,54],[936,431,34,54],
    [45,650,46,28],[465,650,42,28],[1001,652,92,24],
    [151,606,46,48],[540,611,40,47],[45,348,30,58],[642,441,28,48],
    [1182,423,43,69],[1595,582,33,90],[1546,379,33,114],
    [1030,628,116,104],[1454,627,66,92]
  ];
  // Ground-contact planter rims for the approved tree foregrounds. Harbor tree
  // bases are already inside the harbor building solid.
  const treePlanterBases=[
    [693,391,35,23],[1027,405,35,23],
    [692,530,48,48],[931,529,47,49],[1019,530,48,33],
    [705,679,49,53],[230,644,38,26],[66,637,38,25]
  ];
  // Ground-contact cargo on the harbor apron. These narrow footprints stop at the
  // visible cargo bases and leave the central door, steps, and southern apron open.
  const harborCargoRects=[
    [1340,523,28,18], // blue stacked crates
    [1418,526,23,16]  // brown crate stack
  ],harborCargoPolygons=[[
    [1307,523],[1324,523],[1329,530],[1328,536],[1323,541],[1313,542],[1307,538],[1304,531]
  ]];

  // Leave a source-pixel door gap in each visual envelope. The gap is intentionally
  // wider than the actor radius so both entry and return landings remain reachable.
  function buildingSolids(building){
    const [x,y,w]=building.extent,[dx,dy]=building.door,gapW=34,gapH=80,solidTop=building.collisionTop??y;
    const groundY=Math.max(y,dy-120),groundH=Math.max(1,dy-18-groundY),groundBottom=groundY+groundH;
    const gx=dx-gapW/2,gy=dy-gapH/2,bottom=dy+gapH/2;
    return [
      [x,solidTop,w,Math.max(0,gy-solidTop)],
      [x,gy,Math.max(0,gx-x),Math.max(0,Math.min(groundBottom,bottom)-gy)],
      [gx+gapW,gy,Math.max(0,x+w-(gx+gapW)),Math.max(0,Math.min(groundBottom,bottom)-gy)],
      [x,bottom,w,Math.max(0,groundBottom-bottom)]
    ].filter(r=>r[2]>0&&r[3]>0);
  }
  function rasterizedOutside(){
    const solids=[];
    for(let y=0;y<SH;y+=4){
      let start=-1;
      for(let x=0;x<=SW;x+=4){
        const open=x<SW&&walkRegions.some(r=>inside(x+2,y+2,r));
        if(!open&&start<0)start=x;
        if((open||x===SW)&&start>=0){solids.push(rect([start,y,x-start,Math.min(4,SH-y)]));start=-1}
      }
    }
    return solids;
  }
  function rasterizedSourceSolids(){
    const solids=[];
    for(const source of sourceSolids){
      for(let y=source[1];y<source[1]+source[3];y+=4){
        const endX=source[0]+source[2],endY=Math.min(source[1]+source[3],y+4);
        let start=-1;
        for(let x=source[0];x<endX;x+=4){
          if(start<0)start=x;
        }
        if(start>=0)solids.push(rect([start,y,endX-start,endY-y]));
      }
    }
    return solids;
  }
  const sourceSolids=[...sourceBuildings.flatMap(buildingSolids),...sourceProps,...treePlanterBases,...harborCargoRects];
  const sourcePolygons=harborCargoPolygons.map(polygon=>polygon.map(point));
  const candidate=copy(map);
  const oldBuildings=map.buildings||[];
  candidate.width=64;candidate.height=36;
  candidate.spawn=point([834,737]);
  candidate.water=rect([0,806,SW,SH-806]);
  candidate.dock=rect([785,764,100,177]);
  candidate.roads=walkRegions.map(rect);
  candidate.buildings=sourceBuildings.map((building,index)=>{
    const old=oldBuildings.find(item=>item.id===building.id)||{};
    return{...old,id:building.id,label:old.label||building.id,name:old.name||old.label||building.id,rect:building.footprint,door:point(building.door),style:index%4};
  });
  candidate.collision={
    walkBounds:[0,0,64,36],
    solids:[...rasterizedOutside(),...rasterizedSourceSolids(),...sourceProps.map(rect),...treePlanterBases.map(rect)],
    polygons:sourcePolygons,
    doors:candidate.buildings.map(building=>({id:building.id,rect:[building.door[0]-.62,building.door[1]-.62,1.24,1.24]}))
  };
  candidate.visual={
    ...map.visual,
    version:21,
    special:true,
    sevilleQuality:true,
    background:ASSET,
    foreground:foregroundDefinitions.map(({id,type,sourceRect,anchor,anchorY})=>({id,type,sourceRect:[...sourceRect],anchor:[...anchor],anchorY})),
    sourceSize:[SW,SH],
    nativeSize:[TW,TH],
    transform:{type:"contain",scale:containScale,offset:containOffset,drawSize:containSize},
    structuralHash:"seville-town-source-v2-pixel-20260914"
  };
  candidate.qualityGeometry={
    sourceSize:[SW,SH],riverBoundaryPx:806,walkRegions,sourceSolids,buildings:sourceBuildings.map(building=>({...building,rect:building.extent,collisionRect:[building.extent[0],Math.max(building.extent[1],building.door[1]-120),building.extent[2],Math.max(1,building.door[1]-18-Math.max(building.extent[1],building.door[1]-120))]}))
  };
  candidate.structuralHash="seville-town-source-v2-pixel-20260914";
  const anchorTiles=sourceBuildings.map(building=>point(building.approach));
  candidate.npcs=(map.npcs||[]).map((npc,index)=>({...npc,x:anchorTiles[index%anchorTiles.length][0],y:anchorTiles[index%anchorTiles.length][1],bounds:[1,10.3,63,29.5]}));
  D.sevilleTownQuality=candidate;

  const mapFields=["width","height","spawn","water","dock","roads","buildings","npcs","collision","visual","qualityGeometry","structuralHash"],baselineMap=Object.fromEntries(mapFields.map(field=>[field,map[field]]));
  const game=HL.Game.prototype,art=HL.Art.prototype,oldSafe=game.ensureSafePosition,runtimeBaselines=new WeakMap(),scratchPools=new WeakMap();
  const asset={status:"idle",image:null,foreground:[],error:null,committed:false,lastRender:[]};
  let reachableCache=null,validationCache=null;

  function loadImageRecord(source,expected){
    const image=new Image(),record={image,status:"loading",error:null};let loaded=false,decoded=!image.decode,settled=false,resolveReady,rejectReady;
    record.promise=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject});
    const fail=error=>{if(settled)return;settled=true;record.status="error";record.error=String(error?.message||error||"image load failed");rejectReady(error)};
    const maybeReady=()=>{
      if(settled||!loaded||!decoded)return;
      const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
      if(expected&&(width!==expected[0]||height!==expected[1]))return fail(Error(`unexpected image size ${source}: ${width}x${height}, expected ${expected[0]}x${expected[1]}`));
      settled=true;record.status="ready";resolveReady(record)
    };
    image.onload=()=>{loaded=true;maybeReady()};image.onerror=fail;
    try{image.src=source;if(image.decode)Promise.resolve(image.decode()).then(()=>{decoded=true;maybeReady()},fail);else decoded=true;if(image.complete&&(image.naturalWidth||image.width)){loaded=true;maybeReady()}}
    catch(error){fail(error)}
    record.promise.catch(()=>{});return record;
  }
  function startAssetLoad(){
    if(asset.status!=="idle")return asset;
    asset.status="loading";
    const records=[loadImageRecord(ASSET,[SW,SH]),...foregroundDefinitions.map(definition=>loadImageRecord(definition.source,definition.sourceRect.slice(2)))];
    asset.image=records[0].image;asset.foreground=records.slice(1);
    Promise.all(records.map(record=>record.promise)).then(()=>{if(asset.status==="loading")asset.status="ready"}).catch(error=>{asset.status="error";asset.error=String(error?.message||error||"town art load failed")});
    return asset;
  }
  function reachable(){
    if(reachableCache)return reachableCache;
    const world=new HL.CollisionWorld(.28),step=.25,start=candidate.spawn.map(value=>Math.round(value/step)*step),queue=[start],seen=new Set([start.join(",")]);
    if(world.blocked(candidate.collision,...start)){reachableCache=[];return reachableCache}
    for(let i=0;i<queue.length;i++){
      const [x,y]=queue[i];
      for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]]){
        const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;
        if(!seen.has(key)&&!world.blocked(candidate.collision,nx,ny)){seen.add(key);queue.push([nx,ny])}
      }
    }
    reachableCache=queue;return reachableCache;
  }
  function nearestReachable(position){
    const points=reachable(),world=new HL.CollisionWorld(.28);if(!points.length)return [...candidate.spawn];
    let best=points[0],distance=Infinity;
    for(const point of points){const distanceToPoint=(point[0]-position[0])**2+(point[1]-position[1])**2;if(distanceToPoint<distance&&!world.blocked(candidate.collision,point[0],point[1])){best=point;distance=distanceToPoint}}
    return [...best];
  }
  function safePosition(position){
    const world=new HL.CollisionWorld(.28),points=reachable();
    if(!world.blocked(candidate.collision,position[0],position[1])&&points.some(point=>Math.hypot(point[0]-position[0],point[1]-position[1])<.6))return [...position];
    return nearestReachable(position);
  }
  function safeBaselinePosition(position,preferred){
    const asPoint=point=>Array.isArray(point)?point:(point&&[point.x,point.y]);
    const world=new HL.CollisionWorld(.28),scene=baselineMap.collision,candidates=[position,preferred,baselineMap.spawn].map(asPoint).filter(point=>point&&Number.isFinite(point[0])&&Number.isFinite(point[1]));
    for(const point of candidates)if(!world.blocked(scene,point[0],point[1]))return[point[0],point[1]];
    const origin=candidates[0]||[0,0];
    for(let radius=.5;radius<=12;radius+=.5)for(let angle=0;angle<Math.PI*2;angle+=Math.PI/8){const point=[origin[0]+Math.cos(angle)*radius,origin[1]+Math.sin(angle)*radius];if(!world.blocked(scene,point[0],point[1]))return point}
    for(let y=.25;y<36;y+=.25)for(let x=.25;x<64;x+=.25)if(!world.blocked(scene,x,y))return[x,y];
    return baselineMap.spawn?[...baselineMap.spawn]:[origin[0],origin[1]];
  }
  function placeActors(){
    const used=[],points=reachable();
    const pick=(preferred,index)=>{
      const ordered=points.slice().sort((a,b)=>((a[0]-preferred[0])**2+(a[1]-preferred[1])**2)-((b[0]-preferred[0])**2+(b[1]-preferred[1])**2));
      return ordered.find(point=>used.every(item=>Math.hypot(item[0]-point[0],item[1]-point[1])>.72))||ordered[index%Math.max(1,ordered.length)]||candidate.spawn;
    };
    candidate.npcs.forEach((npc,index)=>{const p=pick([npc.x,npc.y],index);npc.x=p[0];npc.y=p[1];used.push(p)});
  }
  placeActors();
  function validateCandidate(){
    if(validationCache)return validationCache;
    const world=new HL.CollisionWorld(.28),dock=candidate.dock,reasons=[],fail=reason=>reasons.push(reason);
    if(world.blocked(candidate.collision,...candidate.spawn))fail("spawn blocked");
    if(world.blocked(candidate.collision,dock[0]+dock[2]/2,dock[1]+dock[3]/2))fail("dock center blocked");
    for(const building of candidate.buildings){
      if(world.blocked(candidate.collision,...building.door))fail(`${building.id} threshold blocked`);
      if(world.blocked(candidate.collision,building.door[0],building.door[1]+.72))fail(`${building.id} return landing blocked`);
      if(!reachable().some(point=>Math.hypot(point[0]-building.door[0],point[1]-building.door[1])<.5))fail(`${building.id} not connected`);
    }
    candidate.npcs.forEach(npc=>{if(world.blocked(candidate.collision,npc.x,npc.y))fail(`NPC ${npc.id} blocked`)});
    const result={ok:reasons.length===0,reasons};validationCache=result;if(D.sevilleTownIntegration)D.sevilleTownIntegration.validation=result;return result;
  }

  function activate(gameInstance){
    const validation=validateCandidate();
    if(asset.status!=="ready"||!validation.ok){if(!validation.ok)asset.error=`candidate validation: ${validation.reasons.join(", ")}`;return false}
    if(asset.committed)return true;
    runtimeBaselines.set(gameInstance,{town:gameInstance?.s?.town&&{...gameInstance.s.town},npcs:(gameInstance?.npcs||[]).map(npc=>({...npc})),followers:gameInstance?.s?.partyFollowerState&&copy(gameInstance.s.partyFollowerState),lastSafe:gameInstance?.lastSafe&&{...gameInstance.lastSafe},velocity:gameInstance?.playerVelocity&&{...gameInstance.playerVelocity}});
    // All map-facing fields are assigned in one synchronous commit after the asset gate.
    const patch={};for(const field of mapFields)patch[field]=candidate[field];
    Object.assign(map,patch);D.sevilleTownQuality=map;asset.committed=true;
    const move=(actor,preferred)=>{const next=safePosition(preferred||[actor.x,actor.y]);actor.x=next[0];actor.y=next[1]};
    if(gameInstance?.s?.town)move(gameInstance.s.town);
    if(gameInstance?.npcs)gameInstance.npcs.forEach((npc,index)=>{const source=candidate.npcs[index%candidate.npcs.length];npc.x=source.x;npc.y=source.y;npc.bounds=[1,10.3,63,29.5]});
    if(gameInstance?.s?.partyFollowerState){gameInstance.s.partyFollowerState.render=[];if(gameInstance.mode==="town")gameInstance.resetFollowersV19?.()}
    if(gameInstance?.playerVelocity)gameInstance.playerVelocity={x:0,y:0};
    if(gameInstance?.s?.town)gameInstance.lastSafe={x:gameInstance.s.town.x,y:gameInstance.s.town.y};
    return true;
  }
  game.ensureSafePosition=function(){
    if(this.mode!=="town"||this.s?.currentPort!=="seville"||!asset.committed)return oldSafe.call(this);
    const p=this.s.town,next=safePosition([p.x,p.y]),moved=p.x!==next[0]||p.y!==next[1];p.x=next[0];p.y=next[1];
    this.lastSafe={x:p.x,y:p.y};if(moved)this.playerVelocity={x:0,y:0};
  };

  function drawContain(c,image,cam){
    const sx=(cam.x-containOffset[0])/containScale,sy=(cam.y-containOffset[1])/containScale;
    c.drawImage(image,sx,sy,960/containScale,540/containScale,0,0,960,540);
  }
  function sourceToCanvas([x,y,w,h],cam){return[containOffset[0]+x*containScale-cam.x,containOffset[1]+y*containScale-cam.y,w*containScale,h*containScale]}
  function makeCanvas(){
    const canvas=typeof OffscreenCanvas==="function"?new OffscreenCanvas(960,540):document.createElement("canvas");canvas.width=960;canvas.height=540;return canvas;
  }
  function scratchBuffer(){const canvas=makeCanvas();return{canvas,ctx:canvas.getContext("2d")}}
  function resetScratch(buffer){const c=buffer.ctx;c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation="source-over";c.imageSmoothingEnabled=false;c.clearRect(0,0,960,540);return c}
  function scratchPool(){return{mask:scratchBuffer(),full:scratchBuffer(),outside:scratchBuffer(),overlap:scratchBuffer()}}
  function actorMayOverlap(actor,definition){
    const [x,y,w,h]=definition.sourceRect,ax=actor.x*SW/64,ay=actor.y*SH/36,halfWidth=16/containScale,bodyHeight=55/containScale;
    return ax+halfWidth>x&&ax-halfWidth<x+w&&ay>y&&ay-bodyHeight<y+h;
  }
  function drawForeground(c,record,definition,cam,mask,pool){
    const destination=sourceToCanvas(definition.sourceRect,cam),[dx,dy,dw,dh]=destination;
    if(!mask){c.save();c.globalAlpha=1;c.drawImage(record.image,0,0,definition.sourceRect[2],definition.sourceRect[3],dx,dy,dw,dh);c.restore();return}
    // Keep the source crop on its own layer, then use actor alpha as a GPU-side
    // mask. No readback is needed, so this remains safe for file:// canvases.
    const full=pool.full.canvas,fullCtx=resetScratch(pool.full);fullCtx.drawImage(record.image,0,0,definition.sourceRect[2],definition.sourceRect[3],dx,dy,dw,dh);
    const outside=pool.outside.canvas,outsideCtx=resetScratch(pool.outside);outsideCtx.drawImage(full,0,0);outsideCtx.globalCompositeOperation="destination-out";outsideCtx.drawImage(mask,0,0);
    const overlap=pool.overlap.canvas,overlapCtx=resetScratch(pool.overlap);overlapCtx.drawImage(full,0,0);overlapCtx.globalCompositeOperation="destination-in";overlapCtx.drawImage(mask,0,0);
    c.save();c.globalAlpha=1;c.drawImage(outside,0,0);c.globalAlpha=.45;c.drawImage(overlap,0,0);c.restore();
  }
  function drawSeville(gameInstance){
    const e=gameInstance.e,c=e.ctx,cam=this.v19Camera(candidate,gameInstance.s.town);e.clear("#050b0b");c.save();
    try{
      c.imageSmoothingEnabled=false;c.globalAlpha=1;asset.lastRender=[];let pool=scratchPools.get(this);if(!pool){pool=scratchPool();scratchPools.set(this,pool)}drawContain(c,asset.image,cam);
      const actors=[...(gameInstance.npcs||[]),...(gameInstance.s.partyFollowerState?.render||[]),{...gameInstance.s.town,player:true}],layers=[...actors.map(actor=>({kind:"actor",sortY:actor.y,actor})),...foregroundDefinitions.map((definition,index)=>({kind:"foreground",sortY:definition.anchorY*36/SH,definition,record:asset.foreground[index]}))].sort((a,b)=>a.sortY-b.sortY||(a.kind===b.kind?0:a.kind==="foreground"?-1:1));
      for(const layer of layers){if(layer.kind==="actor"){const actor=layer.actor,id=actor.player?gameInstance.s.captainId:(actor.appearanceId||actor.id),actorX=actor.x*T+T/2-cam.x,actorY=actor.y*T+25-cam.y;asset.lastRender.push({kind:"actor",id,sortY:actor.y,opacity:1});c.globalAlpha=1;this.drawActorV19(c,id,actorX,actorY,actor.dir??4,actor.player?gameInstance.playerMoving:!!actor.moving,actor.player?gameInstance.playerAnim:(actor.animTime||0),1);c.globalAlpha=1}else{const [dx,dy,dw,dh]=sourceToCanvas(layer.definition.sourceRect,cam),offscreen=dx>=960||dy>=540||dx+dw<=0||dy+dh<=0;if(offscreen){asset.lastRender.push({kind:"foreground",id:layer.definition.id,sortY:layer.sortY,masked:false,culled:true,opacity:1});continue}const behind=actors.filter(actor=>actor.y<layer.sortY&&actorMayOverlap(actor,layer.definition)),mask=behind.length?pool.mask.canvas:null;if(mask){const maskCtx=resetScratch(pool.mask);for(const actor of behind){const id=actor.player?gameInstance.s.captainId:(actor.appearanceId||actor.id);actorRenderer.call(this,maskCtx,id,actor.x*T+T/2-cam.x,actor.y*T+25-cam.y,actor.dir??4,actor.player?gameInstance.playerMoving:!!actor.moving,actor.player?gameInstance.playerAnim:(actor.animTime||0),1)}}asset.lastRender.push({kind:"foreground",id:layer.definition.id,sortY:layer.sortY,masked:!!mask,culled:false,opacity:mask?.45:1});drawForeground(c,layer.record,layer.definition,cam,mask,pool)}}
    }finally{c.restore()}
    const nearby=candidate.buildings.find(building=>Math.hypot(building.door[0]-gameInstance.s.town.x,building.door[1]-gameInstance.s.town.y)<2.3);
    if(nearby){const x=nearby.door[0]*T-cam.x,y=nearby.door[1]*T-cam.y;c.fillStyle="rgba(7,16,20,.92)";c.fillRect(Math.max(6,Math.min(780,x-80)),Math.max(28,y-97),160,27);e.text(nearby.name,Math.max(86,Math.min(860,x)),Math.max(47,y-78),"#ffe7a9","center",14)}
    c.fillStyle="rgba(7,16,20,.88)";c.fillRect(8,498,190,30);e.text("세비야 · 강변 광장",16,520,"#fff0d1","left",15);
  }
  art.town=function(gameInstance){
    if(gameInstance.s?.currentPort!=="seville")return oldTown.call(this,gameInstance);
    const record=startAssetLoad();
    if(record.status!=="ready")return oldTown.call(this,gameInstance);
    const oldMap={};for(const field of mapFields)oldMap[field]=map[field];
    const oldTownPosition=gameInstance.s?.town&&{...gameInstance.s.town},oldNpcs=(gameInstance.npcs||[]).map(npc=>({...npc})),oldFollowers=gameInstance.s?.partyFollowerState&&copy(gameInstance.s.partyFollowerState),oldSafePosition=gameInstance.lastSafe&&{...gameInstance.lastSafe},oldVelocity=gameInstance.playerVelocity&&{...gameInstance.playerVelocity};
    try{
      if(!activate(gameInstance))return oldTown.call(this,gameInstance);
      return drawSeville.call(this,gameInstance);
    }catch(error){
      const runtime=runtimeBaselines.get(gameInstance),failedTown=gameInstance.s?.town&&{...gameInstance.s.town},fallbackTown=runtime?.town||oldTownPosition;for(const field of mapFields)map[field]=baselineMap[field];D.sevilleTownQuality=map;asset.committed=false;asset.status="error";asset.error=String(error?.message||error||"town draw failed");
      if(gameInstance?.s?.town){const safe=safeBaselinePosition(failedTown,fallbackTown);gameInstance.s.town.x=safe[0];gameInstance.s.town.y=safe[1];gameInstance.lastSafe={x:safe[0],y:safe[1]};gameInstance.playerVelocity={x:0,y:0}}
      if(typeof gameInstance?.spawnTownNpcs==="function")gameInstance.spawnTownNpcs();else if(runtime)gameInstance.npcs=runtime.npcs;else gameInstance.npcs=oldNpcs;
      if(gameInstance?.s?.partyFollowerState&&typeof gameInstance.resetFollowersV19==="function")gameInstance.resetFollowersV19();else if(runtime?.followers)gameInstance.s.partyFollowerState=runtime.followers;else if(oldFollowers)gameInstance.s.partyFollowerState=oldFollowers;
      if(!gameInstance?.s?.town){if(runtime?.lastSafe)gameInstance.lastSafe=runtime.lastSafe;else if(oldSafePosition)gameInstance.lastSafe=oldSafePosition;if(runtime?.velocity)gameInstance.playerVelocity=runtime.velocity;else if(oldVelocity)gameInstance.playerVelocity=oldVelocity}
      runtimeBaselines.delete(gameInstance);
      return oldTown.call(this,gameInstance);
    }
  };
  D.sevilleTownIntegration={asset,sourceSize:[SW,SH],targetSize:[TW,TH],logicalSize:[64,36],riverBoundaryPx:806,assetPath:ASSET,foregroundDefinitions:foregroundDefinitions.map(definition=>({id:definition.id,type:definition.type,source:definition.source,sourceRect:[...definition.sourceRect],anchor:[...definition.anchor],anchorY:definition.anchorY})),contain:{scale:containScale,size:containSize,offset:containOffset},validation:null};
})();
