// Reuse preview nodes and rasterize only cards whose content or resources changed.
const cardPreviewCache=new WeakMap();let cardPreviewOrder=[],cardPreviewFontRevision=0;
const visibleCardPreviews=new Set();
let photoCacheTrimTimer;
function schedulePhotoCacheTrim(){
 clearTimeout(photoCacheTrimTimer);
 photoCacheTrimTimer=setTimeout(()=>{
  const active=new Set(sources(state.pages[state.current]));
  const limit=18;
  for(const [source,image] of imageCache){
   if(imageCache.size<=limit)break;
   if(image.complete&&!active.has(source))imageCache.delete(source);
  }
 },250);
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
 state.pages.forEach((p,i)=>{normalize(p);let item=cardPreviewCache.get(p);if(!item){let button=document.createElement('button'),canvas=document.createElement('canvas'),label=document.createElement('small');button.append(canvas,label);button.onclick=()=>{let index=state.pages.indexOf(p);if(index<0)return;if(index===state.current)return;
    historyGroup=null;
    selectedText=null;
    if(typeof activePhoto!=='undefined')activePhoto=null;
    state.current=index;
    sync();
    persist();
    button.scrollIntoView?.({block:'nearest',inline:'nearest'});};canvas.width=canvas.height=1;item={button,canvas,label,key:null,sources:[]};cardPreviewCache.set(p,item)}
  item.button.className='thumb'+(i===state.current?' selected':'');item.button.setAttribute('aria-label','Tarjeta '+(i+1)+(p.title.trim()?' · '+p.title.trim().replace(/\s+/g,' '):''));
  item.button.setAttribute('aria-current',String(i===state.current));
  item.label.textContent=String(i+1);if(!same){host.append(item.button);cardPreviewObserver?.observe(item.button)}
  if(cardPreviewObserver&&!visibleCardPreviews.has(item.button))return;
  let src=sources(p),key=state.format+':'+i+':'+cardPreviewFontRevision+':'+JSON.stringify(p,(key,value)=>key==='image'||key==='images'?undefined:value);
  if(item.key===key&&src.length===item.sources.length&&src.every((s,j)=>s===item.sources[j]))return;
  if(typeof photoFilterPreviewActive!=='undefined'&&photoFilterPreviewActive&&item.key!==null)return;
  draw(item.canvas,p,i,state.format,240);
  item.key=src.every(source=>imageCache.get(source)?.naturalWidth)?key:null;
  item.sources=src.slice();
 });
}
