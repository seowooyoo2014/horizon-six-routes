window.HL=window.HL||{};
HL.AssetLoader=class{
  constructor(manifest){this.manifest=manifest;this.images=new Map();this.layers=[];for(const[id,asset]of Object.entries(manifest))for(const layer of["background","foreground","waterMask"])if(asset[layer])this.layers.push([id,layer,asset[layer]]);this.total=this.layers.length;this.loaded=0;this.failed=0;this.ready=false;this.onProgress=null}
  load(){return Promise.all(this.layers.map(([id,layer,src])=>this.loadImage(id,layer,src))).then(()=>{this.ready=true;this.notify();return this})}
  loadImage(id,layer,src){return new Promise(resolve=>{const image=new Image();image.onload=()=>{this.images.set(`${id}:${layer}`,image);this.loaded++;this.notify();resolve(image)};image.onerror=()=>{this.failed++;this.notify();resolve(null)};image.src=src})}
  get(id,layer="background"){return this.images.get(`${id}:${layer}`)||null}
  progress(){return this.total?Math.round((this.loaded+this.failed)/this.total*100):100}
  notify(){this.onProgress?.({loaded:this.loaded,failed:this.failed,total:this.total,percent:this.progress(),ready:this.ready})}
};
