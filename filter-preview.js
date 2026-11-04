// Only live intensity gestures use a reduced source; settled renders/export stay full size.
var photoFilterPreviewActive=false;
const filterPreviewSources=new WeakMap();let filterPreviewTimer=null;
function filterPreviewSource(image){let cached=filterPreviewSources.get(image);if(cached)return cached;let w=image.naturalWidth||image.width,h=image.naturalHeight||image.height,scale=Math.min(1,640/Math.max(w,h));if(scale===1)return image;let canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(w*scale));canvas.height=Math.max(1,Math.round(h*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);filterPreviewSources.set(image,canvas);return canvas}
function finishFilterPreview(){clearTimeout(filterPreviewTimer);if(!photoFilterPreviewActive)return;photoFilterPreviewActive=false;render(false)}
document.addEventListener('input',e=>{if(e.target.id!=='photoFilterIntensity')return;photoFilterPreviewActive=true;clearTimeout(filterPreviewTimer);filterPreviewTimer=setTimeout(finishFilterPreview,150)},true);
for(let event of ['change','pointerup','pointercancel','keyup','focusout'])document.addEventListener(event,()=>{if(photoFilterPreviewActive)queueMicrotask(finishFilterPreview)});
// Explicit downloads can start before a pointer gesture's final event.
document.addEventListener('click',e=>{if(e.target.closest?.('#export,#confirmZipExport,#downloadSelection,#save'))finishFilterPreview()},true);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')finishFilterPreview()});
