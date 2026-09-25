window.HL=window.HL||{};
(function(){
  "use strict";
  const copy=value=>JSON.parse(JSON.stringify(value));
  HL.migrateStateV11=function(prior){
    const state=HL.migrateStateV10(prior||HL.Game.freshState());state.version=11;state.graphicsVersion=11;
    state.userGraphics=state.userGraphics||{enabled:true,manifestIds:[]};state.stairCooldown=0;
    return state
  };
  const engine=HL.Engine.prototype,oldDelete=engine.deleteSlot;
  engine.v10SlotKey=function(i){return`horizon-ledger-v10-slot-${i}`};engine.slotKey=function(i){return`horizon-ledger-v11-slot-${i}`};
  engine.loadSlot=function(i){try{const value=JSON.parse(localStorage.getItem(this.slotKey(i)));return value&&value.version===11?value:null}catch{return null}};
  engine.migrateOld=function(i){if(this.loadSlot(i))return;try{const keys=[this.v10SlotKey(i),`horizon-ledger-v9-slot-${i}`,`horizon-ledger-v8-slot-${i}`,`horizon-ledger-v7-slot-${i}`,`horizon-ledger-v6-slot-${i}`,`horizon-ledger-v5-slot-${i}`],prior=keys.map(k=>JSON.parse(localStorage.getItem(k)||"null")).find(Boolean);if(prior)this.saveSlot(i,HL.migrateStateV11(prior))}catch(error){console.warn("v11 save migration failed",error)}};
  engine.deleteSlot=function(i){oldDelete.call(this,i);localStorage.removeItem(this.slotKey(i))};

  HL.UserAssetStore={
    db:null,overrides:{},
    open(){if(this.db)return Promise.resolve(this.db);return new Promise((resolve,reject)=>{const request=indexedDB.open("horizon-ledger-user-assets",11);request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains("sprites"))db.createObjectStore("sprites",{keyPath:"id"})};request.onsuccess=()=>{this.db=request.result;resolve(this.db)};request.onerror=()=>reject(request.error)})},
    async all(){try{const db=await this.open();return await new Promise((resolve,reject)=>{const r=db.transaction("sprites").objectStore("sprites").getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)})}catch{return[]}},
    async put(record){const db=await this.open();return new Promise((resolve,reject)=>{const r=db.transaction("sprites","readwrite").objectStore("sprites").put(record);r.onsuccess=()=>resolve(record);r.onerror=()=>reject(r.error)})},
    async remove(id){const db=await this.open();return new Promise((resolve,reject)=>{const r=db.transaction("sprites","readwrite").objectStore("sprites").delete(id);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error)})},
    inspect(image){const canvas=document.createElement("canvas");canvas.width=image.width;canvas.height=image.height;const c=canvas.getContext("2d",{willReadFrequently:true});c.drawImage(image,0,0);const pixels=c.getImageData(0,0,canvas.width,canvas.height).data;let transparent=0,semi=0;for(let i=3;i<pixels.length;i+=4){if(pixels[i]===0)transparent++;else if(pixels[i]<255)semi++}const corners=[[0,0],[canvas.width-1,0],[0,canvas.height-1],[canvas.width-1,canvas.height-1]].map(([x,y])=>pixels[(y*canvas.width+x)*4+3]);return{transparent,semi,cornersOpaque:corners.every(alpha=>alpha===255)}},
    validate(manifest,inputImages){
      const images=inputImages?.town||inputImages?.interior?inputImages:{town:inputImages,interior:inputImages};
      const errors=[];if(!manifest||manifest.version!==11)errors.push("SpriteManifestV11의 version은 11이어야 합니다.");
      if(!manifest?.id)errors.push("캐릭터 id가 없습니다.");for(const modeName of["town","interior"])if(!manifest?.modes?.[modeName])errors.push(`${modeName==="town"?"마을":"실내"} 프레임 정보가 없습니다.`);
      for(const [modeName,m]of Object.entries(manifest?.modes||{})){const label=modeName==="town"?"마을":"실내",image=images[modeName];if(!image){errors.push(`${label} PNG가 없습니다.`);continue}const directions=Object.entries(m.frames||{});if(directions.length!==8)errors.push(`${label} 방향이 8개가 아닙니다.`);for(const [dir,frames]of directions){if(frames.length<10)errors.push(`${label} ${dir}방향 프레임이 10개보다 적습니다.`);for(const [index,f]of frames.entries()){if(f.x<0||f.y<0||f.w<=0||f.h<=0||f.x+f.w>image.width||f.y+f.h>image.height)errors.push(`${label} ${dir}방향 ${index+1}번 프레임이 PNG 밖으로 나갑니다.`);for(let other=index+1;other<frames.length;other++){const b=frames[other];if(f.x<b.x+b.w&&f.x+f.w>b.x&&f.y<b.y+b.h&&f.y+f.h>b.y)errors.push(`${label} ${dir}방향 ${index+1}번과 ${other+1}번 프레임이 겹칩니다.`)}}const pivots=frames.map(f=>f.pivot?.[1]).filter(Number.isFinite);if(pivots.length&&Math.max(...pivots)-Math.min(...pivots)>1)errors.push(`${label} ${dir}방향 발 피벗이 1픽셀 넘게 흔들립니다.`)}if(image._hlAlpha&&(image._hlAlpha.transparent===0||image._hlAlpha.cornersOpaque))errors.push(`${label} PNG에 투명 배경이 없습니다.`)}
      return[...new Set(errors)]
    }
  };

  const proto=HL.Game.prototype,oldFresh=HL.Game.freshState,oldEnsure=proto.ensureExpansion,oldUpdateInterior=proto.updateInterior,oldUpdateV10Prologue=proto.updateV10Prologue,oldSettings=proto.settings,oldDispatch=proto.dispatchAction;
  HL.Game.freshState=function(){const state=oldFresh.call(this);state.version=11;state.graphicsVersion=11;state.userGraphics={enabled:true,manifestIds:[]};state.stairCooldown=0;return state};
  proto.ensureExpansion=function(){oldEnsure.call(this);if(this.s){this.s.version=11;this.s.graphicsVersion=11;this.s.userGraphics=this.s.userGraphics||{enabled:true,manifestIds:[]};this.s.stairCooldown=Number.isFinite(this.s.stairCooldown)?this.s.stairCooldown:0}};
  proto.updateInterior=function(dt){
    if(this.s?.stairCooldown>0)this.s.stairCooldown=Math.max(0,this.s.stairCooldown-dt);
    const result=oldUpdateInterior.call(this,dt),scene=this.interiorScene?.(),pos=this.s?.interior;
    if(scene&&pos&&this.s.stairCooldown<=0&&!this.e.overlay.innerHTML){const stair=(scene.stairs||[]).find(s=>s.auto&&this.pointInRect(pos.x,pos.y,s.autoRect));if(stair){this.s.stairCooldown=.65;this.changeFloor(stair)}}
    return result
  };
  proto.updateV10Prologue=function(dt){
    const before=this.s?.prologueState?.phase,result=oldUpdateV10Prologue.call(this,dt),ps=this.s?.prologueState,scene=this.prologueScene?.();
    if(before===ps?.phase&&scene&&this.s.stairCooldown<=0&&!this.transition&&!this.e.overlay.innerHTML){const stair=(scene.stairs||[]).find(s=>s.auto&&this.pointInRect(ps.position.x,ps.position.y,s.autoRect));if(stair){this.s.stairCooldown=.65;if(ps.phase==="ship-lower")this.setV10Phase("ship-deck",stair.spawn);else if(ps.phase==="mansion-2f")this.setV10Phase("mansion-1f",stair.spawn)}}
    return result
  };
  const safeVolume=game=>Math.round(((game.e.music?.sea?.volume??game.s?.settings?.musicVolume??.45))*100);
  proto.settings=function(){
    const enabled=this.s?.userGraphics?.enabled!==false,assetSection=this.s?`<label class="asset-toggle"><input data-setting="user-graphics" type="checkbox" ${enabled?"checked":""}> 사용자 스프라이트 사용</label><section><h3>사용자 스프라이트</h3><p>마을 PNG, 실내 PNG, SpriteManifestV11 JSON을 함께 선택하십시오.</p><div class="asset-import-row"><label class="file-button">마을 PNG<input id="v11-town-png" type="file" accept="image/png"></label><label class="file-button">실내 PNG<input id="v11-interior-png" type="file" accept="image/png"></label><label class="file-button">JSON<input id="v11-json" type="file" accept="application/json,.json"></label>${this.e.button("세 파일 적용","v11-import-sprite","primary")}${this.e.button("기본 그림으로 복귀","v11-reset-sprites")}</div><div id="v11-asset-status">적용된 사용자 캐릭터: ${(this.s.userGraphics?.manifestIds||[]).join(", ")||"없음"}</div><p><a href="../Tools/sprite_editor.html" target="_blank" rel="noopener">스프라이트 편집기 열기</a></p></section>`:`<section><h3>사용자 스프라이트</h3><p>항해 파일을 시작한 뒤 설정에서 캐릭터 PNG를 적용할 수 있습니다.</p><p><a href="../Tools/sprite_editor.html" target="_blank" rel="noopener">스프라이트 편집기 열기</a></p></section>`;
    this.e.window(`<h2>설정</h2><div class="settings-v11"><label>음악 <input data-setting="music" type="range" min="0" max="100" value="${safeVolume(this)}"></label><label>효과음 <input data-setting="sfx" type="range" min="0" max="100" value="${Math.round((this.e.sfxVolume??.7)*100)}"></label>${assetSection}</div><div class="confirm">${this.e.button("닫기","close")}</div>`,`center`);
    document.querySelector('[data-setting="music"]')?.addEventListener("input",event=>this.e.setVolume(+event.target.value/100));
    document.querySelector('[data-setting="sfx"]')?.addEventListener("input",event=>{this.e.sfxVolume=+event.target.value/100;localStorage.setItem("hl2-sfx-volume",this.e.sfxVolume)});
    document.querySelector('[data-setting="user-graphics"]')?.addEventListener("change",event=>{if(this.s){this.s.userGraphics.enabled=event.target.checked;this.save()}})
  };
  proto.importV11Sprite=async function(){
    if(!this.s)return;
    const townFile=document.getElementById("v11-town-png")?.files?.[0],interiorFile=document.getElementById("v11-interior-png")?.files?.[0],json=document.getElementById("v11-json")?.files?.[0],status=document.getElementById("v11-asset-status");
    if(!townFile||!interiorFile||!json){if(status)status.textContent="마을 PNG, 실내 PNG, JSON을 모두 선택하십시오.";return}
    try{
      const manifest=JSON.parse(await json.text());
      const read=file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)}),urls={town:await read(townFile),interior:await read(interiorFile)};
      const load=(src,label)=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(`${label} PNG를 읽을 수 없습니다.`));image.src=src}),images={town:await load(urls.town,"마을"),interior:await load(urls.interior,"실내")};
      images.town._hlAlpha=HL.UserAssetStore.inspect(images.town);images.interior._hlAlpha=HL.UserAssetStore.inspect(images.interior);
      const errors=HL.UserAssetStore.validate(manifest,images);if(errors.length)throw new Error(errors.join("\n"));
      await HL.UserAssetStore.put({id:manifest.id,manifest,images:urls,updatedAt:Date.now()});HL.UserAssetStore.overrides[manifest.id]={manifest,images};
      this.s.userGraphics.manifestIds=[...new Set([...(this.s.userGraphics.manifestIds||[]),manifest.id])];this.save();if(status)status.textContent=`${manifest.id} 적용 완료. 다음 장면부터 표시됩니다.`;this.art?.loadV11UserAssets?.()
    }catch(error){if(status)status.textContent=`적용 실패: ${error.message}`}
  };
  proto.resetV11Sprites=async function(){if(!this.s)return;for(const id of this.s.userGraphics.manifestIds||[])await HL.UserAssetStore.remove(id);HL.UserAssetStore.overrides={};this.s.userGraphics.manifestIds=[];this.save();this.art.spriteRendererV11&&(this.art.spriteRendererV11.images={});this.settings()};
  proto.dispatchAction=function(action,button){if(action==="v11-import-sprite")return this.importV11Sprite();if(action==="v11-reset-sprites")return this.resetV11Sprites();return oldDispatch.call(this,action,button)};
})();
