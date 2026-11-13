// Only live intensity gestures use a reduced source; settled renders/export stay full size.
var photoFilterPreviewActive=false;
const filterPreviewSources=new WeakMap();
let filterPreviewTimer=null,filterPreviewFrame=null;
function filterPreviewSource(image){let cached=filterPreviewSources.get(image);if(cached)return cached;let w=image.naturalWidth||image.width,h=image.naturalHeight||image.height,scale=Math.min(1,640/Math.max(w,h));if(scale===1)return image;let canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(w*scale));canvas.height=Math.max(1,Math.round(h*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);filterPreviewSources.set(image,canvas);return canvas}
function queueFilterPreview(){
 clearTimeout(filterPreviewTimer);
 filterPreviewTimer=setTimeout(finishFilterPreview,150);
 if(filterPreviewFrame!==null)return;
 filterPreviewFrame=requestAnimationFrame(()=>{
  filterPreviewFrame=null;
  photoFilterPreviewActive=true;
  render(false);
 });
}
function finishFilterPreview(){
 clearTimeout(filterPreviewTimer);
 const pending=filterPreviewFrame!==null;
 if(pending){
  cancelAnimationFrame(filterPreviewFrame);
  filterPreviewFrame=null;
 }
 if(!pending&&!photoFilterPreviewActive)return;
 photoFilterPreviewActive=false;
 render(false);
}
for(const event of ['change','pointerup','pointercancel','keyup','focusout']){
 document.addEventListener(event,()=>{
  if(filterPreviewFrame!==null||photoFilterPreviewActive)queueMicrotask(finishFilterPreview);
 });
}
// Explicit downloads can start before a pointer gesture's final event.
document.addEventListener('click',e=>{if(e.target.closest?.('#export,#confirmZipExport,#downloadSelection,#save'))finishFilterPreview()},true);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')finishFilterPreview()});
