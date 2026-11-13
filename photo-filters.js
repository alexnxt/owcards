// One shared filter inspector targets a photo; applying to all stays within this card.
(function(){
 restoreToolNodes();const panel=document.createElement('section');panel.id='photoFilterPanel';panel.setAttribute('aria-label','Filtros de la foto');panel.innerHTML='<div id="filterPhotoChoices" role="group" aria-label="Foto a ajustar"></div><p id="filterPhotoName"></p><div id="photoFilterPresets" role="group" aria-label="Filtros disponibles"></div><label for="photoFilterIntensity">Intensidad</label><input id="photoFilterIntensity" type="range" min="0" max="100" step="1" aria-label="Intensidad del filtro"><button id="applyFilterAllPhotos" type="button">'+editorIcon('pages')+'<span>Aplicar a todas las fotos</span></button><p id="photoFilterHint" class="panel-help">Solo cambia la foto seleccionada.</p>';$('imagesPanel').append(panel);
 const range=$('photoFilterIntensity'),buttons=[],photoButtons=[];let previews=null,pendingSource=null,lastPage=null,lastSources=[];
 function target(){let p=state.pages[state.current],n=sources(p).length,index=activePhoto?.page===p&&activePhoto.index<n?activePhoto.index:0;return{p,n,index,crop:p.crops[index]}}
 const stack=document.createElement('ol'), add=document.createElement('button');
 stack.id='photoFilterStack';
 stack.setAttribute('aria-label','Filtros aplicados en orden');
 add.type='button';
 add.id='addPhotoFilter';
 $('photoFilterPresets').after(add,stack);
 let activePreset=null, adding=false, selectedCrop=null, stackKey='';
 function writeFilters(crop,list){
  if(!list.length)delete crop.filter;
  else crop.filter=list.length===1?{...list[0]}:list.map(item=>({...item}));
 }
 function commitFilters(crop,list,grouped=false){
  if(!grouped)historyGroup=null;
  writeFilters(crop,list);
  render(false);
  persist();
 }
 function selectPreset(preset){
  const {crop}=target();
  if(!crop)return;
  const list=photoFilterList(crop.filter);
  if(preset==='original'){
   adding=false;
   activePreset=null;
   commitFilters(crop,[]);
   return;
  }
  if(list.some(item=>item.preset===preset)){
   activePreset=preset;
   adding=false;
   update();
   return;
  }
  const current=list.find(item=>item.preset===activePreset);
  const item={preset,intensity:preset==='enhance'?40:adding?100:current?.intensity||100};
  const next=adding?[...list,item]:current?list.map(entry=>entry===current?item:entry):[item];
  activePreset=preset;
  adding=false;
  commitFilters(crop,next);
 }
 add.onclick=()=>{
  adding=!adding;
  update();
 };
 for(const [preset,title] of Object.entries(photoFilterNames)){
  const b=document.createElement('button'), canvas=document.createElement('canvas'), label=document.createElement('span');
  b.type='button';
  b.dataset.photoFilter=preset;
  b.title=title;
  b.setAttribute('aria-label','Filtro '+title);
  canvas.width=112;
  canvas.height=84;
  canvas.setAttribute('aria-hidden','true');
  label.textContent=title;
  b.append(canvas,label);
  b.onclick=()=>selectPreset(preset);
  $('photoFilterPresets').append(b);
  buttons.push({b,canvas,preset});
 }
 function updateStack(list){
  const key=JSON.stringify([list,activePreset]);
  if(key===stackKey)return;
  stackKey=key;
  const focus=document.activeElement?.dataset.filterEntry;
  stack.replaceChildren();
  for(const item of list){
   const row=document.createElement('li'), choose=document.createElement('button'), remove=document.createElement('button');
   const name=photoFilterNames[item.preset];
   choose.type=remove.type='button';
   choose.dataset.filterEntry=item.preset;
   choose.textContent=name+' · '+item.intensity+' %';
   choose.setAttribute('aria-pressed',String(item.preset===activePreset));
   choose.onclick=()=>{activePreset=item.preset;adding=false;update()};
   remove.textContent='×';
   remove.setAttribute('aria-label','Quitar '+name);
   remove.onclick=()=>{
    const {crop}=target();
    if(!crop)return;
    adding=false;
    commitFilters(crop,photoFilterList(crop.filter).filter(entry=>entry.preset!==item.preset));
    (stack.querySelector('[aria-pressed="true"]')||buttons[0].b).focus({preventScroll:true});
   };
   row.append(choose,remove);
   stack.append(row);
   if(focus===item.preset)choose.focus({preventScroll:true});
  }
 }
 const compare=document.createElement('button');
 compare.type='button';
 compare.id='comparePhotoEnhance';
 compare.textContent='Antes / Después · 100 %';
 $('applyFilterAllPhotos').before(compare);

 const dialog=document.createElement('dialog');
 dialog.id='photoEnhanceDialog';
 dialog.setAttribute('aria-label','Comparación de la foto al tamaño de exportación');
 dialog.innerHTML='<div class="photo-compare-bar"><div role="group" aria-label="Vista de comparación"><button type="button" data-compare="before">Antes</button><button type="button" data-compare="after">Después</button></div><form method="dialog"><button>Cerrar</button></form></div><p class="panel-help">Tamaño de exportación al 100 %. Desplázate para ver el resto.</p><div class="photo-compare-scroll" tabindex="0" aria-label="Tarjeta a tamaño completo"><canvas aria-label="Vista de la tarjeta"></canvas></div>';
 document.body.append(dialog);
 const canvas=dialog.querySelector('canvas'), viewport=canvas.parentElement;
 let comparison=null;
 function showComparison(mode){
  if(!comparison)return;
  const left=viewport.scrollLeft,top=viewport.scrollTop;
  const card=structuredClone(comparison.card);
  if(mode==='before')delete card.crops[comparison.index].filter;
  draw(canvas,card,0,comparison.format);
  viewport.scrollLeft=left;
  viewport.scrollTop=top;
  for(const button of dialog.querySelectorAll('[data-compare]')){
   button.setAttribute('aria-pressed',String(button.dataset.compare===mode));
  }
 }
 for(const button of dialog.querySelectorAll('[data-compare]')){
  button.onclick=()=>showComparison(button.dataset.compare);
 }
 compare.onclick=async()=>{
  const {p,index,crop}=target();
  if(!photoFilterList(crop?.filter).length||dialog.open)return;
  const format=state.format, card=structuredClone(p);
  compare.disabled=true;
  try{
   await readyExportPages([card]);
   if(state.pages[state.current]!==p||target().index!==index||!photoFilterList(p.crops[index]?.filter).length)return;
   comparison={card,format,index};
   dialog.showModal();
   showComparison('after');
   viewport.scrollLeft=Math.max(0,(canvas.width-viewport.clientWidth)/2);
   viewport.scrollTop=Math.max(0,(canvas.height-viewport.clientHeight)/2);
  }catch{toast('No se pudo preparar la comparación.')}
  finally{compare.disabled=false}
 };
 dialog.addEventListener('close',()=>{
  comparison=null;
  canvas.width=canvas.height=1;
 });
 range.oninput=()=>{
  const {crop}=target();
  const list=photoFilterList(crop?.filter);
  if(!adding&&list.some(item=>item.preset===activePreset)){
   commitFilters(crop,list.map(item=>item.preset===activePreset?{...item,intensity:+range.value}:item),true);
  }
 };
 $('applyFilterAllPhotos').onclick=()=>{
  const {p,n,crop}=target();
  if(n<2||!crop)return;
  const list=photoFilterList(crop.filter);
  historyGroup=null;
  for(const other of p.crops.slice(0,n))writeFilters(other,list);
  render(false);
  persist();
  toast('Ajustes de filtro copiados a las '+n+' fotos. Puedes deshacerlo.');
 };
 function photoChoices(p,src){if(lastPage===p&&src.length===lastSources.length&&src.every((s,i)=>s===lastSources[i]))return;lastPage=p;lastSources=src.slice();photoButtons.length=0;$('filterPhotoChoices').replaceChildren();src.forEach((source,index)=>{let b=document.createElement('button'),im=document.createElement('img'),label=document.createElement('span');b.type='button';b.title='Ajustar Foto '+(index+1);b.setAttribute('aria-label',b.title);b.dataset.filterPhotoIndex=index;im.src=source;im.alt='';label.textContent='Foto '+(index+1);b.append(im,label);b.onclick=()=>{selectedText=null;window.owSelectionCleared=false;selectPhoto(p,index);render(false);refreshSelection()};$('filterPhotoChoices').append(b);photoButtons.push(b)})}
 function previewPhotos(p,index){let src=sources(p)[index];if(!src)return;let crop=p.crops[index],key=JSON.stringify([crop.x,crop.y,crop.zoom,crop.region]);if(previews?.source===src&&previews.key===key)return;let im=picture(src);if(!im||!im.naturalWidth){if(pendingSource!==src){pendingSource=src;readyExportPhoto(src).then(()=>{pendingSource=null;update()}).catch(()=>{pendingSource=null;$('photoFilterHint').textContent='No se pudo cargar la foto. Prueba a reemplazarla.'})}return}previews={source:src,key};for(let{canvas,preset}of buttons){canvas.width=112;canvas.height=84;cover(canvas.getContext('2d'),im,0,0,112,84,{...crop,filter:undefined},'cover',0,'all');applyPhotoFilterPixels(canvas,preset,100)}}
 function update(){
  const {p,n,index,crop}=target(), visible=mobileTool==='photos'&&photoToolMode==='filters'&&!$('toolDrawer').hidden;
  const list=photoFilterList(crop?.filter);
  if(crop!==selectedCrop){selectedCrop=crop;activePreset=null;adding=false}
  const current=list.find(item=>item.preset===activePreset)||list.at(-1);
  activePreset=current?.preset||null;
  photoChoices(p,sources(p));
  $('filterPhotoChoices').hidden=n<2;
  $('filterPhotoName').textContent=n?'Foto '+(index+1)+(adding?' · Elige otro filtro':''):'Añade una foto para usar filtros.';
  for(const {b,preset} of buttons){
   b.disabled=!n;
   b.setAttribute('aria-pressed',String(preset===(activePreset||'original')&&!adding));
  }
  add.hidden=!list.length;
  add.disabled=!adding&&list.length===buttons.length-1;
  add.textContent=adding?'Cancelar':'＋ Añadir filtro';
  stack.hidden=!list.length;
  updateStack(list);
  compare.hidden=!list.length;
  range.disabled=!current||adding;
  range.value=current?.intensity||0;
  $('applyFilterAllPhotos').disabled=n<2;
  photoButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
  if(visible&&n){activePhoto={page:p,index};previewPhotos(p,index)}
  window.refreshPrecisionControls?.();
 }
 const nodes=toolNodes;toolNodes=function(name){if(name==='photos'&&photoToolMode==='filters')return[panel];return nodes(name)};
 const before=render;render=function(refresh=true){before(refresh);update()};const previousSelect=selectPhoto;selectPhoto=function(p,index){previousSelect(p,index);update()};
 update();if(mobileTool)activatePanel(mobileTool);
})();
