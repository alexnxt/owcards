// Mount the existing controls together; their editing paths stay unchanged.
(function(){
 restoreToolNodes();
 const upload=document.querySelector('label.upload'),fit=$('imageFit'),label=document.querySelector('label[for="imageFit"]'),row=document.createElement('div'),fitBox=document.createElement('div');row.id='photoInputRow';fitBox.className='photo-fit-control';upload.before(row);fitBox.append(label,fit);row.append(upload,fitBox);fit.title='Cómo encajar las fotos';for(let o of fit.options)o.textContent=o.value==='cover'?'Rellenar':'Ver completa';
 const before=toolNodes;toolNodes=function(name){let nodes=before(name);return name==='photos'&&photoToolMode==='photos'?[row,...nodes.filter(el=>el!==upload&&el!==label&&el!==fit)]:nodes};
 const toggle=document.createElement('button');
 toggle.id='toggleImageFit';toggle.type='button';
 fit.hidden=true;fitBox.append(toggle);
 function updateFit(){
  const mode=state.pages[state.current].imageFit==='contain'?'contain':'cover';
  const complete=mode==='contain',name=complete?'Foto completa':'Llenar marco';
  const hint=complete?'Cambiar a llenar marco (puede recortar la foto)':'Cambiar a foto completa (con fondo de relleno)';
  if(toggle.dataset.fit!==mode){
   toggle.dataset.fit=mode;
   toggle.innerHTML=editorIcon(complete?'fitContain':'fitCover')+'<span>'+name+'</span>';
   toggle.title=name+' · '+hint;
   toggle.setAttribute('aria-label',name+'. '+hint);
  }
  setEditorProperty(toggle,'disabled',fit.disabled);
 }
 toggle.onclick=()=>{
  historyGroup=null;
  fit.value=state.pages[state.current].imageFit==='contain'?'cover':'contain';
  fit.dispatchEvent(new Event('input',{bubbles:true}));
  historyGroup=null;
 };
 const previousRender=render;render=function(refresh=true){previousRender(refresh);updateFit()};
 updateFit();
 const remove=$('deleteSelectedText');remove.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6"/></svg>';$('addFreeText').after(remove);
 if(mobileTool)activatePanel(mobileTool);else refreshSelection();
})();
