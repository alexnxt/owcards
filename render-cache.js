// Reuse preview nodes and rasterize only cards whose content or resources changed.
const cardPreviewCache=new WeakMap();let cardPreviewOrder=[],cardPreviewFontRevision=0;
if(typeof document!=='undefined'&&document.fonts?.addEventListener)document.fonts.addEventListener('loadingdone',()=>{cardPreviewFontRevision++;render(false)});
function renderCardPreviews(){
 const host=$('pages'),same=cardPreviewOrder.length===state.pages.length&&cardPreviewOrder.every((p,i)=>p===state.pages[i]);
 if(!same){host.replaceChildren();cardPreviewOrder=state.pages.slice()}
 state.pages.forEach((p,i)=>{normalize(p);let item=cardPreviewCache.get(p);if(!item){let button=document.createElement('button'),canvas=document.createElement('canvas'),label=document.createElement('small');button.append(canvas,label);button.onclick=()=>{let index=state.pages.indexOf(p);if(index<0)return;state.current=index;sync();persist()};item={button,canvas,label,key:null,sources:[]};cardPreviewCache.set(p,item)}
  item.button.className='thumb'+(i===state.current?' selected':'');item.button.setAttribute('aria-label','Seleccionar página '+(i+1));item.label.textContent='PÁGINA '+String(i+1).padStart(2,'0');if(!same)host.append(item.button);
  let src=sources(p),key=state.format+':'+i+':'+cardPreviewFontRevision+':'+JSON.stringify(p,(key,value)=>key==='image'||key==='images'?undefined:value)+':'+src.map(s=>imageCache.get(s)?.naturalWidth||0).join(',');
  if(item.key===key&&src.length===item.sources.length&&src.every((s,j)=>s===item.sources[j]))return;
  if(typeof photoFilterPreviewActive!=='undefined'&&photoFilterPreviewActive&&item.key!==null)return;
  draw(item.canvas,p,i,state.format,240);item.key=key;item.sources=src.slice();
 });
}
