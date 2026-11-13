// Desktop uses the shared inspector in the sidebar; mobile keeps its action dock.
(function(){
 const host=$('desktopToolHost'),drawer=$('toolDrawer'),dock=$('contextActionDock');let busy=false;
 editorIconPaths.photos=editorIconPaths.frame;editorIconPaths.copy='M8 3h13v13H8zM3 8v13h13';editorIconPaths.trash='M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6';
 const home=document.createElement('section');home.id='desktopStart';home.innerHTML='<h3>Tu tarjeta, a tu manera</h3><p>Selecciona un texto o una foto para ajustarlo aquí.</p>';
 function button(parent,id,label,icon,run){let b=document.createElement('button');b.type='button';b.id=id;b.innerHTML=editorIcon(icon)+'<span>'+label+'</span>';b.onclick=run;parent.append(b);return b}
 button(home,'desktopAddPhotos','Añadir fotos','photos',()=>$('image').click());
 button(home,'desktopAddText','Añadir texto','write',()=>addFreeText());
 button(home,'desktopDesigns','Elegir prediseño','design',()=>$('openDesignLibrary').click());host.prepend(home);
 const row=document.createElement('div');row.id='desktopTextActions';
 button(row,'desktopEditText','Editar','write',()=>{$('textMode-write').click();$('richContent').focus()});
 const duplicate=button(row,'desktopDuplicateText','Duplicar','copy',()=>{
  let p=state.pages[state.current],from=selectedText||$('richTarget').value,key=Array.from({length:12},(_,i)=>'free'+(i+1)).find(k=>!p.freeTextKeys.includes(k));if(!key)return toast('Puedes añadir hasta 12 textos libres por tarjeta.');
  historyGroup=null;p[key]=p[from];p.textStyles[key]=structuredClone(richStyle(p,from));let pos=currentTextPosition(from);p.textPositions[key]={...pos,y:Math.min(95,pos.y+4)};p.freeTextKeys.push(key);syncTextTargets();selectedText=key;activePhoto=null;$('richTarget').value=key;$('richTarget').dispatchEvent(new Event('change',{bubbles:true}));sync();persist();activatePanel('text');$('richTab-text').click();refresh();
 });
 button(row,'desktopDeleteText','Eliminar','trash',()=>$('deleteSelectedText').click());$('textWorkflow').before(row);
 const collage=button(drawer.querySelector('.drawer-heading'),'desktopPhotoCollage','Collage','collage',()=>openCollageDesigns());
 editorIconPaths.swap='M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4';
 const exchange=button(drawer.querySelector('.drawer-heading'),'desktopPhotoSwap','Intercambiar fotos','swap',()=>startPhotoSwap());
 exchange.querySelector('span').remove();
 exchange.title='Intercambiar fotos';
 exchange.setAttribute('aria-label','Intercambiar fotos');
 const filters=button(drawer.querySelector('.drawer-heading'),'desktopPhotoFilters','Filtros de la foto','filters',openSelectedPhotoFilters);
 filters.querySelector('span').remove();
 filters.title='Filtros de la foto';
 filters.setAttribute('aria-label',filters.title);
 const remove=button(drawer.querySelector('.drawer-heading'),'desktopPhotoDelete','Eliminar foto','trash',removeSelectedCollagePhoto);
 remove.querySelector('span').remove();
 remove.title='Eliminar foto (Suprimir)';
 remove.setAttribute('aria-label','Eliminar foto');
 remove.setAttribute('aria-keyshortcuts','Delete');
 function refresh(){if(busy)return;busy=true;try{let desktop=!isMobileEditor();document.body.classList.toggle('desktop-inspector',desktop);home.hidden=!desktop||!drawer.hidden;const page=state.pages[state.current];filters.hidden=!desktop||drawer.hidden||mobileTool!=='photos'||photoToolMode!=='photos'||activePhoto?.page!==page||!sources(page)[activePhoto.index];exchange.hidden=remove.hidden=collage.hidden=filters.hidden||sources(page).length<2;row.hidden=!desktop||mobileTool!=='text'||document.body.classList.contains('inspector-writing');duplicate.disabled=state.pages[state.current].freeTextKeys.length>=12;if(desktop){dock.hidden=true;document.body.classList.remove('context-action-mode');$('contextInspectorBack').hidden=true;}}finally{busy=false}}
 const up=cv.onpointerup;cv.onpointerup=e=>{up(e);if(!isMobileEditor()){
  if(selectedText&&state.pages[state.current][selectedText]){activatePanel('text');$('richTab-text').click()}
  else if(activePhoto?.page===state.pages[state.current]){
   activatePanel('photos');
   $('imageList').querySelector('.photo-card[aria-current="true"]')?.scrollIntoView({block:'nearest',inline:'nearest'});
  }
 }refresh()};
 const renderBefore=render;render=function(value=true){renderBefore(value);refresh()};
 new MutationObserver(refresh).observe(drawer,{attributes:true,attributeFilter:['hidden']});
 new MutationObserver(()=>{if(!isMobileEditor()&&!dock.hidden)dock.hidden=true}).observe(dock,{attributes:true,attributeFilter:['hidden']});
 window.addEventListener('resize',refresh);document.addEventListener('click',()=>queueMicrotask(refresh));refresh();
})();

// Keep the desktop text picker and style controls bound to the shared editor.
document.addEventListener('DOMContentLoaded',()=>{
 const target=$('richTarget'),add=$('addFreeText'),picker=$('textAddMenuRow');
 const write=$('textWritePane'),workflow=$('textWorkflow'),style=$('textMode-style');
 const styleTabs=$('textStylePane').querySelector('.rich-tabs');
 const styleButtons=Array.from(workflow.querySelectorAll('[data-rich-tab]'));
 const position=$('textMode-position');
 const preset=$('textPresetColors');
 const colorsHome=preset.parentElement;
 const buttons=new Map();
 picker.setAttribute('role','group');
 picker.setAttribute('aria-label','Bloques de texto');
 function select(key){
  target.value=key;
  target.dispatchEvent(new Event('change',{bubbles:true}));
 }
 for(const [key,label] of [['title','Titular'],['body','Apoyo'],['tag','Etiqueta'],['brand','Marca']]){
  const chip=document.createElement('button');
  chip.type='button';
  chip.className='desktop-text-chip';
  chip.textContent=label;
  chip.onclick=()=>select(key);
  picker.insertBefore(chip,add);
  buttons.set(key,chip);
 }
 const free=document.createElement('select');
 free.id='desktopFreeTexts';
 free.setAttribute('aria-label','Textos libres');
 free.onchange=()=>{if(free.value)select(free.value)};
 picker.after(free);
 function syncPicker(){
  const page=state.pages[state.current];
  for(const [key,chip] of buttons){
   chip.hidden=!page[key]?.trim()&&target.value!==key;
   chip.setAttribute('aria-pressed',String(target.value===key));
  }
  const keys=page.freeTextKeys;
  if(free.options.length!==keys.length+1||keys.some((key,i)=>free.options[i+1].value!==key)){
   free.replaceChildren(new Option('Textos libres',''),...keys.map(key=>new Option(textName(key),key)));
  }
  free.hidden=!keys.length;
  free.value=keys.includes(target.value)?target.value:'';
 }
 function navigate(event,items){
  if(isMobileEditor()||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const index=items.indexOf(event.currentTarget);
  const next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowRight'?1:items.length-1))%items.length;
  items[next].click();
  items[next].focus({preventScroll:true});
 }
 for(const button of [style,position])button.addEventListener('keydown',event=>navigate(event,[style,position]),true);
 for(const button of styleButtons)button.addEventListener('keydown',event=>navigate(event,styleButtons),true);
 const updateModes=()=>{
  if(isMobileEditor())return;
  const on=position.getAttribute('aria-selected')!=='true';
  style.setAttribute('aria-selected',String(on));
  style.tabIndex=on?0:-1;
 };
 style.addEventListener('click',updateModes);
 for(const button of [position,...styleButtons])button.addEventListener('click',updateModes);
 let wasMobile;
 function layout(){
  const mobile=isMobileEditor();
  if(mobile===wasMobile)return;
  wasMobile=mobile;
  style.hidden=mobile;
  styleTabs.hidden=mobile;
  if(mobile){
   workflow.after(write);
   for(const button of styleButtons)workflow.insertBefore(button,position);
   colorsHome.prepend(preset);
  }else{
   workflow.before(write);
   styleTabs.append(...styleButtons);
   $('typographyQuickRow').after(preset);
  }
  updateModes();
 }
 const before=render;
 render=function(refresh=true){before(refresh);syncPicker();updateModes()};
 target.addEventListener('change',syncPicker);
 window.addEventListener('resize',layout);
 layout();
 syncPicker();
});
