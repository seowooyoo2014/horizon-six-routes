window.HL=window.HL||{};
(function(){
  const art=HL.Art.prototype;
  art.animationVersion="atlas-v2";
  art.person=function(e,x,y,dir=4,hero=false,anim=0,scale=1,appearanceId="citizen",moving=false){
    const c=e.ctx,a=this.images.atlas,appearance=HL.DATA.appearances[appearanceId]||HL.DATA.appearances.rian,hv=this.hash(appearanceId),w=48*scale,h=72*scale,bob=moving?Math.round(Math.sin(anim*Math.PI*2)*1.4):Math.round(Math.sin(anim*.8)*.45);c.fillStyle="rgba(2,11,14,.34)";c.beginPath();c.ellipse(Math.round(x),Math.round(y+4),15*scale,6*scale,0,0,Math.PI*2);c.fill();
    if(a.complete&&a.naturalWidth){let sx,sy,sw=108,sh=160;if(hero||appearanceId==="rian"){const sequence=moving?[0,1,2,3,2,1]:[0,0,0,1],index=sequence[Math.floor(anim*(moving?10:3))%sequence.length],row=dir===0||dir===1||dir===7?0:dir===2||dir===3?1:dir===4?2:3;sx=index*108;sy=row*160}else{const row=appearance.spriteSheet==="orso"||appearance.body==="broad"?5:4,col=dir===0||dir===1||dir===7?0:dir===2||dir===3?3:dir===4?2:1;sx=col*108;sy=row*160}if(this.spriteCanvas){const sc=this.spriteCanvas.getContext("2d");sc.clearRect(0,0,48,72);sc.imageSmoothingEnabled=false;sc.drawImage(a,sx,sy,sw,sh,0,0,48,72);sc.globalCompositeOperation="source-atop";sc.fillStyle=(appearance.palette?.[0]||"#416b78")+"38";sc.fillRect(0,18,48,45);sc.globalCompositeOperation="source-over";c.drawImage(this.spriteCanvas,Math.round(x-w/2),Math.round(y-h+8+bob),w,h)}else c.drawImage(a,sx,sy,sw,sh,Math.round(x-w/2),Math.round(y-h+8+bob),w,h)
    }else{c.fillStyle=appearance.palette?.[0]||"#285f78";c.fillRect(x-10,y-36,20,30);c.fillStyle=appearance.palette?.[1]||"#d7a26c";c.fillRect(x-7,y-50,14,14)}
    c.fillStyle=appearance.palette?.[2]||"#d7b15c";if(appearance.hat&&appearance.hat!=="none")c.fillRect(x-9*scale,y-52*scale,18*scale,4*scale);if(appearance.accessory&&appearance.accessory!=="none"){const side=hv%2?1:-1;c.fillRect(x+side*12*scale,y-25*scale,4*scale,12*scale)}
  };
})();
