// Reuse preview nodes and rasterize only cards whose content or resources changed.
const cardPreviewCache=new WeakMap();let cardPreviewOrder=[],cardPreviewFontRevision=0;
const visibleCardPreviews=new Set();
// These budgets cover reusable decoded surfaces, not originals saved in the project.
const PHOTO_CACHE_BUDGET=64*1024*1024;
const photoSourcePins=new Map();
let photoCacheTrimTimer;
function retainPhotoSources(pages){
 const held=[...new Set(pages.flatMap(sources))];let released=false;
 for(const source of held)photoSourcePins.set(source,(photoSourcePins.get(source)||0)+1);
 return ()=>{if(released)return;released=true;for(const source of held){const count=photoSourcePins.get(source)-1;if(count>0)photoSourcePins.set(source,count);else photoSourcePins.delete(source)}schedulePhotoCacheTrim()};
}
function decodedPhotoBytes(image){
 let bytes=(image.naturalWidth||image.width||0)*(image.naturalHeight||image.height||0)*4;
 const cropped=croppedPhotoCache.get(image)?.canvas;
 if(cropped)bytes+=cropped.width*cropped.height*4;
 if(typeof filterPreviewSources!=='undefined')for(const source of [image,cropped]){const preview=source&&filterPreviewSources.get(source);if(preview)bytes+=preview.width*preview.height*4}
 return bytes;
}
function releaseDecodedPhoto(source){
 const image=imageCache.get(source);if(!image)return;
 const cropped=croppedPhotoCache.get(image)?.canvas;
 for(const surface of [image,cropped])if(surface){
  releasePhotoFilterResults(surface);
  if(typeof filterPreviewSources!=='undefined'){const preview=filterPreviewSources.get(surface);if(preview){releasePhotoFilterResults(preview);filterPreviewSources.delete(surface)}}
 }
 croppedPhotoCache.delete(image);
 imageCache.delete(source);
}
function trimPhotoCache(){
 const active=new Set([...sources(state.pages[state.current]),...photoSourcePins.keys()]);
 const project=new Set(state.pages.flatMap(sources));
 for(const [source,image] of imageCache)if(image.complete&&!project.has(source)&&!active.has(source))releaseDecodedPhoto(source);
 let bytes=0;for(const image of imageCache.values())bytes+=decodedPhotoBytes(image);
 for(const [source,image] of imageCache){
  if(bytes<=PHOTO_CACHE_BUDGET)break;
  if(image.complete&&!active.has(source)){bytes-=decodedPhotoBytes(image);releaseDecodedPhoto(source)}
 }
 trimPhotoFilterCache();
}
function schedulePhotoCacheTrim(){
 clearTimeout(photoCacheTrimTimer);
 photoCacheTrimTimer=setTimeout(trimPhotoCache,250);
}
const cardPreviewObserver=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{
 for(const {target,isIntersecting} of entries){
  if(isIntersecting&&target.isConnected)visibleCardPreviews.add(target);
  else visibleCardPreviews.delete(target);
 }
 renderCardPreviews();
}):null;
if(typeof document!=='undefined'&&document.fonts?.addEventListener)document.fonts.addEventListener('loadingdone',()=>{cardPreviewFontRevision++;render(false)});
function renderCardPreviews(){
 const library=$('filmstripLibrary');
 if(library&&!library.onclick)library.onclick=()=>$('openRecentCards').click();
 const host=$('pages'),same=cardPreviewOrder.length===state.pages.length&&cardPreviewOrder.every((p,i)=>p===state.pages[i]);
 if(!same){cardPreviewObserver?.disconnect();visibleCardPreviews.clear();host.replaceChildren();cardPreviewOrder=state.pages.slice()}
 state.pages.forEach((p,i)=>{normalize(p);let item=cardPreviewCache.get(p);if(!item){let container=document.createElement('div'),button=document.createElement('button'),close=document.createElement('button'),canvas=document.createElement('canvas'),label=document.createElement('small');container.className='filmstrip-card';button.type=close.type='button';close.className='filmstrip-card-close';close.textContent='×';container.append(button,close);button.append(canvas,label);close.onclick=async event=>{event.stopPropagation();const index=state.pages.indexOf(p),focused=document.activeElement===close;const closed=await window.owCloseActiveCard?.(p);if(closed&&focused&&document.activeElement===document.body){const next=host.querySelectorAll('.thumb');next[Math.min(index,next.length-1)]?.focus({preventScroll:true})}};button.onclick=()=>{let index=state.pages.indexOf(p);if(index<0)return;if(index===state.current)return;
    historyGroup=null;
    selectedText=null;
    if(typeof activePhoto!=='undefined')activePhoto=null;
    state.current=index;
    sync();
    persist();
    button.scrollIntoView?.({block:'nearest',inline:'nearest'});};canvas.width=canvas.height=1;item={container,button,close,canvas,label,key:null,sources:[]};cardPreviewCache.set(p,item)}
  item.button.className='thumb'+(i===state.current?' selected':'');item.button.setAttribute('aria-label','Tarjeta '+(i+1)+(p.title.trim()?' · '+p.title.trim().replace(/\s+/g,' '):''));
  item.button.setAttribute('aria-current',String(i===state.current));
  item.container.classList.toggle('is-current',i===state.current);
  setEditorAttribute(item.close,'aria-label','Cerrar tarjeta '+(i+1)+(p.title.trim()?' · '+p.title.trim().replace(/\s+/g,' '):''));
  setEditorProperty(item.close,'disabled',state.pages.length===1||!!window.owClosingCards);
  setEditorAttribute(item.close,'title',state.pages.length===1?'Conserva al menos una tarjeta activa':'Cerrar tarjeta');
  item.label.textContent=String(i+1);if(!same){host.append(item.container);cardPreviewObserver?.observe(item.button)}
  if(cardPreviewObserver&&!visibleCardPreviews.has(item.button))return;
  let src=sources(p),key=state.format+':'+i+':'+cardPreviewFontRevision+':'+JSON.stringify(p,(key,value)=>key==='image'||key==='images'?undefined:value);
  if(item.key===key&&src.length===item.sources.length&&src.every((s,j)=>s===item.sources[j]))return;
  if(typeof photoFilterPreviewActive!=='undefined'&&photoFilterPreviewActive&&item.key!==null)return;
  draw(item.canvas,p,i,state.format,240);
  item.key=src.every(source=>imageCache.get(source)?.naturalWidth)?key:null;
  item.sources=src.slice();
 });
}
