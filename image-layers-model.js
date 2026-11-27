// Independent image layers share the same renderer in previews and exports.
function imageAssets(page){return [...sources(page),...(page.overlays||[]).map(layer=>layer.src)]}
function validImageLayers(page){
 if(page.overlays===undefined)return true;
 return Array.isArray(page.overlays)&&page.overlays.length<=12&&new Set(page.overlays.map(layer=>layer?.id)).size===page.overlays.length&&page.overlays.every(layer=>layer&&typeof layer.id==='string'&&layer.id.length<=100&&typeof layer.src==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(layer.src)&&['x','y','width','ratio','opacity'].every(key=>Number.isFinite(layer[key]))&&layer.x>=0&&layer.x<=100&&layer.y>=0&&layer.y<=100&&layer.width>=5&&layer.width<=100&&layer.ratio>0&&layer.ratio<=10000&&layer.opacity>=0&&layer.opacity<=100&&typeof layer.locked==='boolean');
}
function imageLayerRect(layer,width,height){const w=width*layer.width/100,h=w/layer.ratio;return {x:width*layer.x/100-w/2,y:height*layer.y/100-h/2,w,h}}
function drawImageLayers(context,page,width,height){
 for(const layer of page.overlays||[]){
  if(!layer.opacity)continue;
  const image=picture(layer.src);if(!image)continue;
  const rect=imageLayerRect(layer,width,height);
  context.save();context.globalAlpha*=layer.opacity/100;
  context.drawImage(image,rect.x,rect.y,rect.w,rect.h);context.restore();
 }
}
