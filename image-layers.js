(function(){
 editorIconPaths.layerLocked='M5 10h14v11H5zM8 10V7a4 4 0 0 1 8 0v3';
 editorIconPaths.layerUnlocked='M5 10h14v11H5zM8 10V7a4 4 0 0 1 7.5-2';
 let active=null,gesture=null,lastListPage=null,lastLayers=[];
 const selected=()=>active?.page===state.pages[state.current]?active.page.overlays.find(layer=>layer.id===active.id)||null:null;
 window.owSelectedOverlay=()=>{const layer=selected();return layer?{page:active.page,layer}:null};
 const add=document.createElement('button'),file=document.createElement('input'),panel=document.createElement('div'),photoOpacity=document.createElement('div'),outline=document.createElement('div');
 add.id='addOverlayImage';add.type='button';add.innerHTML=editorIcon('photos')+'<span>Superponer imagen</span>';
 file.type='file';file.hidden=true;file.accept='image/png,image/jpeg,image/webp';file.id='overlayImageFile';
 panel.id='imageLayersPanel';panel.innerHTML='<h3>Imágenes superpuestas</h3><div id="imageLayerChoices" role="group" aria-label="Seleccionar imagen superpuesta"></div><div id="imageLayerControls" hidden><div class="layer-heading"><strong id="imageLayerName"></strong><button type="button" id="lockImageLayer" aria-label="Bloquear posición"></button></div><div id="imageLayerRanges"></div><div class="layer-order"><button type="button" id="lowerImageLayer">'+editorIcon('pages')+'<span>Atrás</span></button><button type="button" id="raiseImageLayer">'+editorIcon('pages')+'<span>Adelante</span></button><button type="button" id="deleteImageLayer" aria-label="Eliminar imagen superpuesta">'+editorIcon('trash')+'</button></div></div>';
 photoOpacity.id='photoOpacityControl';
 outline.id='imageLayerOutline';outline.hidden=true;outline.setAttribute('aria-hidden','true');
 outline.innerHTML='<span>Imagen superpuesta</span>';
 document.body.append(file,outline);$('imagesPanel').append(add,panel,photoOpacity);
 const ranges={};
 function range(host,key,label,min,max,step,change){
  const row=document.createElement('div'),heading=document.createElement('label'),output=document.createElement('output'),input=document.createElement('input');
  row.className='layer-range';heading.htmlFor='layer-'+key;heading.append(document.createTextNode(label),output);input.id='layer-'+key;input.type='range';input.min=min;input.max=max;input.step=step;input.setAttribute('aria-label',label);
  input.oninput=()=>change(+input.value);
  row.append(heading,input);host.append(row);ranges[key]={input,output};return input;
 }
 function edit(key,value){const layer=selected();if(!layer||layer.locked&&key!=='opacity')return;layer[key]=value;requestEditorPreview();persist()}
 range($('imageLayerRanges'),'width','Tamaño',5,100,1,value=>edit('width',value));
 range($('imageLayerRanges'),'x','Horizontal',0,100,1,value=>edit('x',value));
 range($('imageLayerRanges'),'y','Vertical',0,100,1,value=>edit('y',value));
 range($('imageLayerRanges'),'opacity','Opacidad',0,100,1,value=>edit('opacity',value));
 range(photoOpacity,'photoOpacity','Opacidad de la foto',0,100,1,value=>{const p=state.pages[state.current];if(activePhoto?.page!==p||!p.crops[activePhoto.index])return;p.crops[activePhoto.index].opacity=value;requestEditorPreview();persist()});
 const beforeNodes=toolNodes;toolNodes=function(name){let nodes=beforeNodes(name);if(name==='photos'&&photoToolMode==='photos'){const index=nodes.indexOf($('photoInputRow'));nodes.splice(index<0?0:index+1,0,add,panel);nodes.push(photoOpacity)}return nodes};
 function drawOutline(){
  const layer=selected(),rect=cv.getBoundingClientRect();
  outline.hidden=!layer||!rect.width||!!document.querySelector('dialog[open]');
  if(outline.hidden)return;
  const box=imageLayerRect(layer,cv.width,cv.height);
  Object.assign(outline.style,{left:rect.left+box.x*rect.width/cv.width+'px',top:rect.top+box.y*rect.height/cv.height+'px',width:box.w*rect.width/cv.width+'px',height:box.h*rect.height/cv.height+'px'});
  outline.classList.toggle('is-locked',layer.locked);
 }
 function choose(layer){
  window.owFinishSelection();
  active={page:state.pages[state.current],id:layer.id};
  window.owSelectionCleared=false;selectedText=null;activePhoto=null;
  if(mobileTool!=='photos'||$('toolDrawer').hidden){photoToolMode='photos';activatePanel('photos')}
  update();refreshSelection();
 }
 add.onclick=()=>{if(state.pages[state.current].overlays.length>=12)return toast('Puedes superponer hasta 12 imágenes por tarjeta.');file.click()};
 file.onchange=async()=>{
  const chosen=file.files[0],page=state.pages[state.current];file.value='';
  if(!chosen)return;
  if(!['image/png','image/jpeg','image/webp'].includes(chosen.type)||chosen.size>20*1024*1024)return toast('Usa PNG, JPG o WebP de menos de 20 MB.');
  add.disabled=true;
  const revision=owProjectStorage.revision;
  try{
   const src=await preparePhoto(chosen),image=new Image();image.src=src;await image.decode();
   if(page!==state.pages[state.current]||revision!==owProjectStorage.revision)return toast('La tarjeta cambió. Vuelve a añadir la imagen.');
   if(page.overlays.length>=12)return;
   imageCache.set(src,image);
   const layer={id:crypto.randomUUID(),src,x:50,y:50,width:Math.min(40,60*cv.height/cv.width*(image.naturalWidth/image.naturalHeight)),ratio:image.naturalWidth/image.naturalHeight,opacity:100,locked:false};
   layer.width=Math.max(5,layer.width);
   historyGroup=null;page.overlays.push(layer);choose(layer);sync();persist();historyGroup=null;
  }catch{toast('No se pudo abrir la imagen superpuesta.')}
  finally{add.disabled=false}
 };
 function update(){
  const page=state.pages[state.current],layer=selected();if(active&&!layer)active=null;
  panel.hidden=!page.overlays.length;
  if(mobileTool==='photos'&&photoToolMode==='photos')$('removeImage').hidden=!imageAssets(page).length;
  const changed=lastListPage!==page||lastLayers.length!==page.overlays.length||page.overlays.some((layer,i)=>layer.id!==lastLayers[i]?.id||layer.src!==lastLayers[i]?.src);
  if(changed){
   lastListPage=page;lastLayers=page.overlays.map(({id,src})=>({id,src}));const list=$('imageLayerChoices');list.replaceChildren();
   page.overlays.forEach((layer,index)=>{const button=document.createElement('button'),image=document.createElement('img'),label=document.createElement('span');button.type='button';button.dataset.layerId=layer.id;image.src=layer.src;image.alt='';label.textContent='Imagen '+(index+1);button.append(image,label);button.onclick=()=>choose(layer);list.append(button)});
  }
  panel.querySelectorAll('[data-layer-id]').forEach(button=>setEditorAttribute(button,'aria-pressed',String(button.dataset.layerId===layer?.id)));
  $('imageLayerControls').hidden=!layer;
  if(layer){
   setEditorText($('imageLayerName'),'Imagen superpuesta '+(page.overlays.indexOf(layer)+1));
   for(const key of ['width','x','y','opacity']){const {input,output}=ranges[key];if(document.activeElement!==input)input.value=layer[key];setEditorText(output,Math.round(layer[key])+' %');setEditorProperty(input,'disabled',layer.locked&&key!=='opacity')}
   const lock=$('lockImageLayer'),label=layer.locked?'Desbloquear posición':'Bloquear posición';
   setEditorAttribute(lock,'aria-label',label);setEditorAttribute(lock,'title',label);setEditorAttribute(lock,'aria-pressed',String(layer.locked));
   if(lock.dataset.locked!==String(layer.locked)){lock.dataset.locked=String(layer.locked);lock.innerHTML=editorIcon(layer.locked?'layerLocked':'layerUnlocked')}
   $('lowerImageLayer').disabled=page.overlays.indexOf(layer)===0;
   $('raiseImageLayer').disabled=page.overlays.indexOf(layer)===page.overlays.length-1;
  }
  const photo=activePhoto?.page===page&&sources(page)[activePhoto.index];
  photoOpacity.hidden=!photo||!!layer;
  if(photo){const value=page.crops[activePhoto.index].opacity??100;if(document.activeElement!==ranges.photoOpacity.input)ranges.photoOpacity.input.value=value;setEditorText(ranges.photoOpacity.output,Math.round(value)+' %')}
  window.refreshPrecisionControls?.();
  drawOutline();
 }
 $('lockImageLayer').onclick=()=>{const layer=selected();if(!layer)return;historyGroup=null;layer.locked=!layer.locked;render(false);persist()};
 function reorder(delta){const page=state.pages[state.current],layer=selected(),index=page.overlays.indexOf(layer);if(index<0||index+delta<0||index+delta>=page.overlays.length)return;historyGroup=null;[page.overlays[index],page.overlays[index+delta]]=[page.overlays[index+delta],page.overlays[index]];render(false);persist()}
 $('lowerImageLayer').onclick=()=>reorder(-1);$('raiseImageLayer').onclick=()=>reorder(1);
 window.owRemoveOverlay=()=>{const page=state.pages[state.current],layer=selected();if(!layer)return;historyGroup=null;page.overlays.splice(page.overlays.indexOf(layer),1);active=null;window.owFinishSelection();sync();persist();historyGroup=null;toast('Imagen superpuesta eliminada. Deshacer la recupera.')};
 $('deleteImageLayer').onclick=window.owRemoveOverlay;
 window.owNudgeOverlay=(layer,axis,direction,step)=>{if(layer.locked)return false;const next=Math.max(0,Math.min(100,layer[axis]+direction*step/(axis==='x'?cv.width:cv.height)*100));if(next===layer[axis])return false;layer[axis]=next;return true};
 function hit(event){const page=state.pages[state.current],pt=point(event);if(textHitKeys(page).some(key=>page[key]&&textBounds[key]&&pt.x>=textBounds[key].x&&pt.x<=textBounds[key].x+textBounds[key].w&&pt.y>=textBounds[key].y&&pt.y<=textBounds[key].y+textBounds[key].h))return null;return [...page.overlays].reverse().find(layer=>{const r=imageLayerRect(layer,cv.width,cv.height);return pt.x>=r.x&&pt.x<=r.x+r.w&&pt.y>=r.y&&pt.y<=r.y+r.h})}
 const down=cv.onpointerdown,move=cv.onpointermove,up=cv.onpointerup,cancel=cv.onpointercancel;
 cv.onpointerdown=event=>{
  const layer=hit(event);if(!layer||event.button!==0){active=null;drawOutline();return down(event)}
  if(!selected())window.owFinishSelection();active={page:state.pages[state.current],id:layer.id};window.owSelectionCleared=false;
  gesture={layer,page:active.page,id:event.pointerId,x:event.clientX,y:event.clientY,originalX:layer.x,originalY:layer.y,rect:cv.getBoundingClientRect(),changed:false};
  cv.setPointerCapture(event.pointerId);event.preventDefault();update();
 };
 cv.onpointermove=event=>{if(!gesture)return move(event);if(gesture.id!==event.pointerId||gesture.page!==state.pages[state.current]||gesture.layer.locked)return;
  const g=gesture,dx=event.clientX-g.x,dy=event.clientY-g.y;if(Math.hypot(dx,dy)<5&&!g.changed)return;
  g.layer.x=Math.max(0,Math.min(100,g.originalX+dx/g.rect.width*100));g.layer.y=Math.max(0,Math.min(100,g.originalY+dy/g.rect.height*100));g.changed=true;event.preventDefault();requestEditorPreview();
 };
 cv.onpointerup=event=>{if(!gesture)return up(event);if(gesture.id!==event.pointerId)return;const g=gesture;gesture=null;event.preventDefault();if(g.page!==state.pages[state.current])return;if(g.changed){historyGroup=null;render(false);persist();historyGroup=null}if(mobileTool!=='photos'||$('toolDrawer').hidden){photoToolMode='photos';activatePanel('photos')}update()};
 cv.onpointercancel=event=>{if(!gesture)return cancel(event);if(gesture.id!==event.pointerId)return;const g=gesture;gesture=null;g.layer.x=g.originalX;g.layer.y=g.originalY;render(false)};
 cv.addEventListener('lostpointercapture',event=>{if(gesture?.id===event.pointerId)cv.onpointercancel(event)});
 const finish=window.owFinishSelection;window.owFinishSelection=function(){if(gesture){gesture.layer.x=gesture.originalX;gesture.layer.y=gesture.originalY;gesture=null}active=null;finish();drawOutline()};
 const removeAll=$('removeImage').onclick;$('removeImage').onclick=()=>{active=null;state.pages[state.current].overlays=[];removeAll()};
 const select=selectPhoto;selectPhoto=function(...args){active=null;select(...args);update()};
 const activate=activatePanel;activatePanel=function(name){if(name!=='photos')active=null;activate(name);update()};
 $('richTarget').addEventListener('change',()=>{active=null;drawOutline()});
 const refresh=refreshSelection;refreshSelection=function(){refresh();drawOutline()};
 const before=render;render=function(value=true){before(value);update()};
 window.addEventListener('resize',()=>{if(gesture)cv.onpointercancel({pointerId:gesture.id});drawOutline()});window.addEventListener('scroll',drawOutline,{passive:true});
 window.visualViewport?.addEventListener('resize',drawOutline);
 update();
})();
