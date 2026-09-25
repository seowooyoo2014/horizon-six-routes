window.HL=window.HL||{};
(function(){
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const geoDistance=(a,b)=>Math.hypot((a.lon-b.lon)*Math.cos((a.lat+b.lat)*Math.PI/360),a.lat-b.lat);
  const V5Navigation=HL.WorldNavigation;
  HL.WorldNavigation=class extends V5Navigation{
    constructor(){
      super();const remainder=this.land.filter((_,index)=>![0,16,17].includes(index));
      const mainland=[[-10,36],[-9.5,43],[-5.5,48],[-1.5,48.7],[1.5,49.4],[3,50.8],[4,53.4],[8,54.1],[9.4,55],[13,54.7],[18.5,54.3],[24,54.8],[28,59],[31,52],[30,48],[26,41],[20,39],[13,44],[4,43],[-1,37]];
      const britain=[[-5.8,50.7],[1.2,51.2],[1.1,54.8],[-1,58.7],[-5.7,58.6],[-7.6,55],[-6.5,52]];
      const ireland=[[-10.7,51.2],[-6,51.3],[-5.4,55.4],[-8.4,55.6],[-10.8,53.7]];
      const scandinavia=[[4.8,58],[7.8,55.2],[12.4,55.5],[18.5,55],[24.5,59.5],[30,71],[5,71]];
      const denmark=[[8,54.3],[12.9,54.4],[12.2,57.8],[9,57.6]];
      this.land=[mainland,britain,ireland,scandinavia,denmark,...remainder]
    }
  };

  HL.SeaNavigationGrid=class{
    constructor(navigation){this.navigation=navigation;this.approachCache=new Map()}
    distanceToSegment(lon,lat,a,b){
      const cos=Math.max(.25,Math.cos(lat*Math.PI/180)),ax=(a[0]-lon)*cos,ay=a[1]-lat,bx=(b[0]-lon)*cos,by=b[1]-lat,dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy;
      const t=length?clamp(-(ax*dx+ay*dy)/length,0,1):0;return Math.hypot(ax+dx*t,ay+dy*t)
    }
    coastDistance(lon,lat){
      let best=180;for(const poly of this.navigation.land)for(let i=0;i<poly.length;i++)best=Math.min(best,this.distanceToSegment(lon,lat,poly[i],poly[(i+1)%poly.length]));return best
    }
    blocked(lon,lat,radius=.16){
      if(lat<=-59.5||lat>=79.5||this.navigation.isLand(lon,lat))return true;
      const cos=Math.max(.25,Math.cos(lat*Math.PI/180));for(let i=0;i<12;i++){const angle=i*Math.PI/6,x=lon+Math.cos(angle)*radius/cos,y=lat+Math.sin(angle)*radius;if(this.navigation.isLand(x,y))return true}return false
    }
    depth(lon,lat){const reef=this.navigation.reefRisk(lon,lat),coast=this.coastDistance(lon,lat);if(reef>.72)return 3;if(reef>.42)return 9;if(coast<.22)return 7;if(coast<.55)return 16;if(coast<1.2)return 34;if(coast<2.4)return 72;return 180}
    escapeVector(lon,lat,radius=.16){
      const cos=Math.max(.25,Math.cos(lat*Math.PI/180));let best={x:0,y:0,score:-1};for(let i=0;i<16;i++){const angle=i*Math.PI/8,x=Math.cos(angle),y=Math.sin(angle),tx=lon+x*.34/cos,ty=lat+y*.34;if(this.blocked(tx,ty,radius))continue;const score=this.coastDistance(tx,ty)-this.navigation.reefRisk(tx,ty)*2;if(score>best.score)best={x,y,score}}return best
    }
    move(state,distance){
      const sea=state.sea,heading=HL.DATA.directions[sea.heading],current=HL.DATA.directions[sea.current]||[0,0],cos=Math.max(.3,Math.cos(sea.lat*Math.PI/180)),drift=Math.min(Math.abs(distance)*.15,.018),dx=heading[0]*distance+current[0]*drift,dy=-heading[1]*distance-current[1]*drift,steps=Math.max(1,Math.ceil(Math.hypot(dx*cos,dy)/.035)),stepX=dx/steps,stepY=dy/steps,radius=.16;
      let lon=sea.lon,lat=sea.lat,blocked=false,slid=false;for(let step=0;step<steps;step++){
        const nx=lon+stepX/cos,ny=lat+stepY;if(!this.blocked(nx,ny,radius)){lon=nx;lat=ny;continue}
        blocked=true;const xOnly=lon+stepX/cos,yOnly=lat+stepY;if(!this.blocked(xOnly,lat,radius)){lon=xOnly;slid=true;continue}if(!this.blocked(lon,yOnly,radius)){lat=yOnly;slid=true;continue}
        const away=this.escapeVector(lon,lat,radius);if(away.score>=0){lon+=away.x*.025/cos;lat+=away.y*.025}break
      }
      sea.lon=((lon+180)%360+360)%360-180;sea.lat=clamp(lat,-59,79);sea.x=sea.lon;sea.y=sea.lat;return{blocked,slid,impact:blocked?Math.max(0,Math.abs(distance)-.035):0}
    }
    portApproach(port){
      if(this.approachCache.has(port.id))return this.approachCache.get(port.id);const cos=Math.max(.3,Math.cos(port.lat*Math.PI/180));let best=null;
      for(const radius of[.65,.9,1.2,1.6,2.1,2.7,3.5,4.5,6,8,11,15]){let ringBest=null;for(let i=0;i<32;i++){const angle=i*Math.PI/16,lon=port.lon+Math.cos(angle)*radius/cos,lat=port.lat+Math.sin(angle)*radius;if(this.blocked(lon,lat,.2)||this.navigation.reefRisk(lon,lat)>.68)continue;const outerLon=port.lon+Math.cos(angle)*(radius+1.1)/cos,outerLat=port.lat+Math.sin(angle)*(radius+1.1),clear=!this.blocked(outerLon,outerLat,.2),score=this.coastDistance(lon,lat)+(clear?2:0)-this.navigation.reefRisk(lon,lat)*3;if(!ringBest||score>ringBest.score)ringBest={score,spawn:[lon,lat],channel:clear?[outerLon,outerLat]:[lon,lat],angle,clear}}if(ringBest){best=ringBest;if(ringBest.clear||radius>=4.5)break}}
      if(!best)best={spawn:[port.lon,port.lat-2],channel:[port.lon,port.lat-3],angle:-Math.PI/2};const approach={port:port.id,spawn:best.spawn,channel:best.channel,heading:this.headingBetween(best.spawn,best.channel)};this.approachCache.set(port.id,approach);return approach
    }
    headingBetween(from,to){const dx=(to[0]-from[0])*Math.cos(from[1]*Math.PI/180),dy=to[1]-from[1];let heading=0,score=-Infinity;for(let i=0;i<8;i++){const d=HL.DATA.directions[i],dot=d[0]*dx-d[1]*dy;if(dot>score){score=dot;heading=i}}return heading}
    forecast(lon,lat,heading,distance=1.5){
      const d=HL.DATA.directions[heading],cos=Math.max(.3,Math.cos(lat*Math.PI/180));for(let step=.18;step<=distance;step+=.18){const x=lon+d[0]*step/cos,y=lat-d[1]*step,reef=this.navigation.reefRisk(x,y);if(this.blocked(x,y,.16)||reef>.72)return{danger:true,distance:step,kind:reef>.72?"암초":"해안",safeHeading:this.safestHeading(lon,lat,heading)}}return{danger:false,distance}
    }
    safestHeading(lon,lat,preferred){let best=preferred,score=-Infinity;for(let offset=0;offset<8;offset++){const candidates=offset?[preferred+offset,preferred-offset]:[preferred];for(const raw of candidates){const h=(raw+8)%8,d=HL.DATA.directions[h],cos=Math.max(.3,Math.cos(lat*Math.PI/180)),x=lon+d[0]*1.4/cos,y=lat-d[1]*1.4,clear=this.blocked(x,y,.16)?-10:this.coastDistance(x,y)-this.navigation.reefRisk(x,y)*4-offset*.08;if(clear>score){score=clear;best=h}}}return best}
  };

  HL.SeaRouteGuide=class{
    constructor(grid){this.grid=grid;this.cache=new Map()}
    targetPosition(id){const port=HL.DATA.ports[id];return port?this.grid.portApproach(port).spawn:null}
    lineClear(from,to){const distance=geoDistance({lon:from[0],lat:from[1]},{lon:to[0],lat:to[1]}),steps=Math.max(2,Math.ceil(distance/.45));for(let i=1;i<steps;i++){const q=i/steps,lon=from[0]+(to[0]-from[0])*q,lat=from[1]+(to[1]-from[1])*q;if(this.grid.blocked(lon,lat,.2)||this.grid.navigation.reefRisk(lon,lat)>.76)return false}return true}
    route(state,targetId){
      const target=this.targetPosition(targetId);if(!target)return[];const start=[state.sea.lon,state.sea.lat],key=`${Math.round(start[0]/2)}:${Math.round(start[1]/2)}:${targetId}`;if(this.cache.has(key))return this.cache.get(key);if(this.lineClear(start,target)){const route=[target];this.cache.set(key,route);return route}
      const directDistance=geoDistance({lon:start[0],lat:start[1]},{lon:target[0],lat:target[1]}),step=directDistance<50?1:3,startNode=[Math.round(start[0]/step),Math.round(start[1]/step)],endNode=[Math.round(target[0]/step),Math.round(target[1]/step)],nodeKey=n=>`${n[0]}:${n[1]}`,open=[startNode],came=new Map(),cost=new Map([[nodeKey(startNode),0]]),heuristic=n=>Math.hypot((n[0]-endNode[0])*Math.cos(n[1]*step*Math.PI/180),n[1]-endNode[1]);let found=null,guard=0;
      const maxX=Math.floor(180/step)-1,minY=Math.ceil(-59/step),maxY=Math.floor(79/step);while(open.length&&guard++<30000){open.sort((a,b)=>(cost.get(nodeKey(a))+heuristic(a))-(cost.get(nodeKey(b))+heuristic(b)));const node=open.shift(),k=nodeKey(node);if(Math.abs(node[0]-endNode[0])<=1&&Math.abs(node[1]-endNode[1])<=1){found=node;break}for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){let x=node[0]+dx,y=node[1]+dy;if(x>maxX)x=-maxX;if(x<-maxX)x=maxX;if(y<minY||y>maxY)continue;const lon=x*step,lat=y*step;if(this.grid.blocked(lon,lat,.24)||this.grid.navigation.reefRisk(lon,lat)>.76)continue;const nk=`${x}:${y}`,next=(cost.get(k)||0)+Math.hypot(dx,dy)+Math.max(0,.7-this.grid.coastDistance(lon,lat))*.15;if(next>=(cost.get(nk)??Infinity))continue;cost.set(nk,next);came.set(nk,node);open.push([x,y])}}
      const nodes=[];if(found){let node=found;while(node){nodes.push([node[0]*step,node[1]*step]);node=came.get(nodeKey(node))}nodes.reverse()}nodes.push(target);const route=[];let anchor=start;for(let i=0;i<nodes.length;){let next=i;for(let j=i;j<nodes.length;j++){if(this.lineClear(anchor,nodes[j]))next=j;else break}route.push(nodes[next]);anchor=nodes[next];i=next+1}this.cache.set(key,route);return route
    }
    info(state,targetId){const target=this.targetPosition(targetId);if(!target)return null;const route=this.route(state,targetId),next=route[0]||target,distance=geoDistance({lon:state.sea.lon,lat:state.sea.lat},{lon:target[0],lat:target[1]}),heading=this.grid.headingBetween([state.sea.lon,state.sea.lat],next);let supply=null,best=Infinity;for(const id of state.knownPorts||[]){if(id===targetId)continue;const p=HL.DATA.ports[id];if(!p)continue;const d=geoDistance({lon:p.lon,lat:p.lat},{lon:(state.sea.lon+target[0])/2,lat:(state.sea.lat+target[1])/2});if(d<best){best=d;supply=id}}return{target,targetId,route,next,heading,distance,supply:best<12?supply:null}}
  };

  HL.SeaShipVisual=class{
    constructor(root="../Assets/Resources/Sprites/Game/SeaV6/"){this.frameWidth=96;this.frameHeight=128;this.images={};for(const type of["caravel","cog","galley","brig"]){const image=new Image();image.src=`${root}${type}_8dir.png`;this.images[type]=image}}
    draw(e,type,x,y,heading,hull=100,time=0,scale=1){const c=e.ctx,img=this.images[type]||this.images.caravel,row=hull<45?1:0,w=this.frameWidth,h=this.frameHeight,bob=Math.round(Math.sin(time*2.5)*2);if(img?.complete&&img.naturalWidth){c.drawImage(img,heading*w,row*h,w,h,Math.round(x-w*scale/2),Math.round(y-h*scale*.58+bob),Math.round(w*scale),Math.round(h*scale));return true}return false}
  };
})();
