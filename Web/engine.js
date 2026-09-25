window.HL=window.HL||{};
HL.Engine=class{
  constructor(){
    this.canvas=document.querySelector("#world");this.ctx=this.canvas.getContext("2d");this.ctx.imageSmoothingEnabled=false;
    this.hud=document.querySelector("#hud");this.overlay=document.querySelector("#overlay");this.toastEl=document.querySelector("#toast");this.helpEl=document.querySelector("#help");
    this.keys=new Set();this.pressed=new Set();this.last=performance.now();this.running=false;this.toastTimer=0;this.selectedSlot=1;
    this.music={sea:new Audio("../Assets/Resources/Audio/horizon_ledger_theme.wav"),port:new Audio("../Assets/Resources/Audio/harbor_theme.wav"),danger:new Audio("../Assets/Resources/Audio/chase_theme.wav")};
    Object.values(this.music).forEach(a=>{a.loop=true;a.volume=+(localStorage.getItem("hl2-volume")||.42)});this.activeMusic=null;
    addEventListener("keydown",e=>{if(!this.keys.has(e.key))this.pressed.add(e.key);this.keys.add(e.key);if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," ","Enter"].includes(e.key))e.preventDefault()});
    addEventListener("keyup",e=>this.keys.delete(e.key));
    this.overlay.addEventListener("click",e=>{const b=e.target.closest("[data-action]");if(b&&!b.disabled&&this.onAction)this.onAction(b.dataset.action,b)});
  }
  start(update,render){this.update=update;this.render=render;this.running=true;requestAnimationFrame(t=>this.frame(t))}
  frame(now){if(!this.running)return;const dt=Math.min(.05,(now-this.last)/1000);this.last=now;this.pollGamepad();this.handleMenuInput();this.update(dt);this.render();this.pressed.clear();requestAnimationFrame(t=>this.frame(t))}
  pollGamepad(){const g=navigator.getGamepads?.()[0];if(!g)return;const map=[[12,"ArrowUp"],[13,"ArrowDown"],[14,"ArrowLeft"],[15,"ArrowRight"],[0,"z"],[1,"x"],[8,"m"],[9,"Enter"]];for(const [i,k]of map){if(g.buttons[i]?.pressed&&!this.keys.has("gp"+i)){this.pressed.add(k);this.keys.add("gp"+i)}else if(!g.buttons[i]?.pressed)this.keys.delete("gp"+i)}}
  handleMenuInput(){const buttons=[...this.overlay.querySelectorAll("button:not(:disabled)")];if(!buttons.length)return;if(this.hit("Escape","x","X")){const cancel=buttons.find(b=>["close","sea-close","files"].includes(b.dataset.action));if(cancel)cancel.click();for(const key of["Escape","x","X"])this.pressed.delete(key);return}let index=buttons.indexOf(document.activeElement);if(index<0){index=0;buttons[0].focus({preventScroll:true})}let delta=0;if(this.hit("ArrowUp","ArrowLeft"))delta=-1;if(this.hit("ArrowDown","ArrowRight"))delta=1;if(delta){index=(index+delta+buttons.length)%buttons.length;buttons[index].focus({preventScroll:true})}if(this.hit("Enter","z","Z"," ")){buttons[index].click();for(const key of["Enter","z","Z"," "])this.pressed.delete(key)}}
  hit(...names){return names.some(n=>this.pressed.has(n))}
  held(...names){return names.some(n=>this.keys.has(n))}
  clear(color="#071b22"){this.ctx.fillStyle=color;this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)}
  text(text,x,y,color="#f2dfad",align="left",size=6){const c=this.ctx;c.fillStyle="#001014";c.font=`${size}px monospace`;c.textAlign=align;c.fillText(text,x+1,y+1);c.fillStyle=color;c.fillText(text,x,y)}
  rect(x,y,w,h,color,stroke){const c=this.ctx;c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));if(stroke){c.strokeStyle=stroke;c.strokeRect(Math.round(x)+.5,Math.round(y)+.5,Math.round(w)-1,Math.round(h)-1)}}
  slotKey(i){return`horizon-ledger-v5-slot-${i}`}
  v4SlotKey(i){return`horizon-ledger-v4-slot-${i}`}
  v3SlotKey(i){return`horizon-ledger-v3-slot-${i}`}
  oldSlotKey(i){return`horizon-ledger-v2-slot-${i}`}
  loadSlot(i){try{const v=JSON.parse(localStorage.getItem(this.slotKey(i)));return v&&v.version===HL.DATA.version?v:null}catch{return null}}
  saveSlot(i,state){const copy=JSON.parse(JSON.stringify(state));copy.version=HL.DATA.version;copy.savedAt=new Date().toLocaleString("ko-KR");localStorage.setItem(this.slotKey(i),JSON.stringify(copy))}
  deleteSlot(i){localStorage.removeItem(this.slotKey(i));localStorage.removeItem(this.v4SlotKey(i));localStorage.removeItem(this.v3SlotKey(i));localStorage.removeItem(this.oldSlotKey(i))}
  migrateOld(i){if(this.loadSlot(i))return;try{const prior=JSON.parse(localStorage.getItem(this.v4SlotKey(i)))||JSON.parse(localStorage.getItem(this.v3SlotKey(i)))||JSON.parse(localStorage.getItem(this.oldSlotKey(i)));if(prior){const fresh=HL.Game.freshState(),port=HL.DATA.ports[prior.currentPort]?prior.currentPort:"bella",map=HL.WorldData.townMapFor(port),s={...fresh,...prior,version:HL.DATA.version,currentPort:port,lastPort:HL.DATA.ports[prior.lastPort]?prior.lastPort:port,town:{x:map.spawn[0],y:map.spawn[1],dir:prior.town?.dir||0},interior:null,sea:{...fresh.sea,...prior.sea},quest:{...fresh.quest,...prior.quest},fame:{...fresh.fame,...prior.fame},flags:{...fresh.flags,...prior.flags},inventory:{...fresh.inventory,...prior.inventory},cargo:{...fresh.cargo,...prior.cargo},crew:{...fresh.crew,...prior.crew},bank:{...fresh.bank,...prior.bank},properties:{...fresh.properties,...prior.properties},campaign:{...fresh.campaign,...prior.campaign},seaFleets:prior.seaFleets||fresh.seaFleets};s.mode=prior.mode==="interior"?"town":prior.mode;this.saveSlot(i,s);return}const old=JSON.parse(localStorage.getItem("horizon-ledger-"+i));if(!old)return;const s=HL.Game.freshState();s.money=old.money||s.money;s.day=old.day||1;s.fame.adventure=old.fame||0;s.quest.stage=Math.min(1,old.stage||0);this.saveSlot(i,s)}catch{}}
  button(label,action,cls=""){return`<button class="${cls}" data-action="${action}">${label}</button>`}
  window(html,cls="center"){this.overlay.innerHTML=`<div class="layer dim"><section class="window ${cls}">${html}</section></div>`}
  close(){this.overlay.innerHTML=""}
  toast(msg){this.toastEl.textContent=msg;this.toastEl.classList.add("show");clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>this.toastEl.classList.remove("show"),1700)}
  playMusic(kind){const next=this.music[kind];if(!next||this.activeMusic===next){next?.play().catch(()=>{});return}this.activeMusic?.pause();this.activeMusic=next;next.currentTime=0;next.play().catch(()=>{})}
  sfx(name,volume=.65){const a=new Audio(`../Assets/Resources/Audio/${name}.wav`);a.volume=volume;a.play().catch(()=>{})}
  setVolume(v){Object.values(this.music).forEach(a=>a.volume=v);localStorage.setItem("hl2-volume",v)}
  portraitFor(speaker){if(speaker.includes("데미안"))return 0;if(speaker.includes("오르소")||speaker.includes("선원"))return 1;if(speaker.includes("여관")||speaker.includes("의사"))return 2;if(speaker.includes("길드")||speaker.includes("상인"))return 3;if(speaker.includes("서점")||speaker.includes("아셀"))return 4;if(speaker.includes("추적")||speaker.includes("바르도"))return 5;return 1}
  dialogue(speaker,text,choices=[{label:"계속",action:"dialogue-next"}]){const portrait=this.portraitFor(speaker),px=portrait%3*50,py=Math.floor(portrait/3)*100;this.overlay.innerHTML=`<div class="layer"><section class="window dialogue"><div class="portrait" style="background-position:${px}% ${py}%"></div><div class="dialogue-copy"><span class="speaker">${speaker}</span><div class="text" id="dialogue-text"></div></div><span class="continue">▼</span><div class="choices">${choices.map(c=>this.button(c.label,c.action,c.primary?"primary":"")).join("")}</div></section></div>`;const el=document.querySelector("#dialogue-text");let i=0;const type=()=>{if(!el||i>=text.length)return;el.textContent+=text[i++];setTimeout(type,14)};type();this.sfx("page_turn",.35)}
};
