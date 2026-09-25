window.HL=window.HL||{};
HL.CollisionWorld=class{
  constructor(radius=.28){this.radius=radius}
  circleRect(x,y,r,rect){const [rx,ry,rw,rh]=rect,cx=Math.max(rx,Math.min(x,rx+rw)),cy=Math.max(ry,Math.min(y,ry+rh)),dx=x-cx,dy=y-cy;return dx*dx+dy*dy<r*r}
  pointInPolygon(x,y,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside}return inside}
  distanceToSegment(x,y,a,b){const vx=b[0]-a[0],vy=b[1]-a[1],d=vx*vx+vy*vy,t=d?Math.max(0,Math.min(1,((x-a[0])*vx+(y-a[1])*vy)/d)):0,px=a[0]+vx*t,py=a[1]+vy*t;return Math.hypot(x-px,y-py)}
  circlePolygon(x,y,r,points){if(this.pointInPolygon(x,y,points))return true;for(let i=0;i<points.length;i++)if(this.distanceToSegment(x,y,points[i],points[(i+1)%points.length])<r)return true;return false}
  blocked(scene,x,y,r=this.radius,dynamic=[]){const b=scene.walkBounds;if(x-r<b[0]||y-r<b[1]||x+r>b[0]+b[2]||y+r>b[1]+b[3])return true;for(const rect of scene.solids||[])if(this.circleRect(x,y,r,rect))return true;for(const poly of scene.polygons||[])if(this.circlePolygon(x,y,r,poly))return true;for(const actor of dynamic)if(Math.hypot(x-actor.x,y-actor.y)<r+(actor.radius||r)*.82)return true;return false}
  move(scene,position,delta,r=this.radius,dynamic=[]){const maxStep=.12,total=Math.max(Math.abs(delta.x),Math.abs(delta.y)),steps=Math.max(1,Math.ceil(total/maxStep)),sx=delta.x/steps,sy=delta.y/steps;let x=position.x,y=position.y;for(let i=0;i<steps;i++){if(!this.blocked(scene,x+sx,y,r,dynamic))x+=sx;if(!this.blocked(scene,x,y+sy,r,dynamic))y+=sy}return{x,y}}
  nearestSafe(scene,position,fallback,r=this.radius){return this.blocked(scene,position.x,position.y,r)?{x:fallback.x,y:fallback.y}:{x:position.x,y:position.y}}
};
