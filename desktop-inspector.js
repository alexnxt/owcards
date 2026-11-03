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
 function refresh(){if(busy)return;busy=true;try{let desktop=!isMobileEditor();document.body.classList.toggle('desktop-inspector',desktop);home.hidden=!desktop||!drawer.hidden;row.hidden=!desktop||mobileTool!=='text'||document.body.classList.contains('inspector-writing');duplicate.disabled=state.pages[state.current].freeTextKeys.length>=12;if(desktop){dock.hidden=true;document.body.classList.remove('context-action-mode');$('contextInspectorBack').hidden=true;}}finally{busy=false}}
 const up=cv.onpointerup;cv.onpointerup=e=>{up(e);if(!isMobileEditor()){
  if(selectedText&&state.pages[state.current][selectedText]){activatePanel('text');$('richTab-text').click()}
  else if(activePhoto?.page===state.pages[state.current])activatePanel('photos');
 }refresh()};
 const renderBefore=render;render=function(value=true){renderBefore(value);refresh()};
 new MutationObserver(refresh).observe(drawer,{attributes:true,attributeFilter:['hidden']});
 new MutationObserver(()=>{if(!isMobileEditor()&&!dock.hidden)dock.hidden=true}).observe(dock,{attributes:true,attributeFilter:['hidden']});
 window.addEventListener('resize',refresh);document.addEventListener('click',()=>queueMicrotask(refresh));refresh();
})();
