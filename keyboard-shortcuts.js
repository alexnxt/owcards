// Editor commands yield to text entry, dialogs, menus and focused UI controls.
(function(){
 window.owEditorKeyboardEnabled=true;
 const directions={ArrowLeft:['x',-1],ArrowRight:['x',1],ArrowUp:['y',-1],ArrowDown:['y',1]};
 const visible=element=>!!element&&!element.hidden&&element.getClientRects().length>0;
 const menuOpen=()=>[...document.querySelectorAll('[role="menu"]')].some(visible);
 const dialogOpen=()=>!!document.querySelector('dialog[open]');
 const typing=target=>target?.isContentEditable||!!target?.closest?.('input,textarea,select,[role="textbox"]');
 let gesture=null;
 function endGesture(){if(gesture)historyGroup=null;gesture=null;window.owKeyboardHistoryGroup=null}
 function selected(){
  if(window.owSelectionCleared)return null;
  const page=state.pages[state.current];
  if(selectedText&&cardTextKeys(page).includes(selectedText)&&page[selectedText])return {page,key:selectedText};
  if(activePhoto?.page===page&&sources(page)[activePhoto.index])return {page,index:activePhoto.index};
  return null;
 }
 function nudge(target,axis,direction,step,event){
  const {page,key,index}=target;
  if(key){
   if(page.textLocks?.[key])return;
   const bounds=textBounds[key];
   if(!bounds)return;
   const span=axis==='x'?cv.width-bounds.w:cv.height-bounds.h;
   if(span<=0)return;
   const position=currentTextPosition(key),next=Math.max(0,Math.min(100,position[axis]+direction*step/span*100));
   if(next===position[axis])return;
   page.textPositions[key]={...position,[axis]:next};
  }else{
   const crop=page.crops[index];
   if(!crop||crop.locked)return;
   const image=picture(sources(page)[index]);
   if(!image)return;
   let width=cv.width,height=cv.height;
   if(usesCollage(page)){
    const cell=cells(sources(page).length,width-2*page.margin,height-2*page.margin,page.collageStyle,page.gap)[index];
    width=cell[2];height=cell[3];
   }
   const photo=croppedPhoto(image,crop.region);
   const scale=(page.imageFit==='contain'?Math.min(width/photo.width,height/photo.height):Math.max(width/photo.width,height/photo.height))*crop.zoom;
   const span=axis==='x'?width-photo.width*scale:height-photo.height*scale;
   if(Math.abs(span)<.5)return;
   const next=Math.max(0,Math.min(100,crop[axis]+direction*step/span*100));
   if(next===crop[axis])return;
   crop[axis]=next;
   const input=document.querySelector('[data-photo-index="'+index+'"] input[aria-label^="'+(axis==='x'?'Horizontal':'Vertical')+'"]');
   if(input)input.value=next;
  }
  if(!event.repeat||!gesture||gesture.page!==page||gesture.key!==key||gesture.index!==index||gesture.code!==event.key){
   endGesture();gesture={page,key,index,code:event.key};
  }
  clearTextGuides();
  render(false);
  syncTextControls();
  window.owKeyboardHistoryGroup=gesture;
  try{persist()}finally{window.owKeyboardHistoryGroup=null}
 }
 // Escape belongs to the topmost editor surface before it clears the canvas.
 document.addEventListener('keydown',event=>{
  if(event.key!=='Escape'||event.isComposing||dialogOpen())return;
  const project=$('projectMenu'),textMenu=$('textAddMenu');
  let trigger=null;
  if(visible(project))trigger=$('projectMenuButton');
  else if(visible(textMenu))trigger=document.querySelector('[aria-controls="textAddMenu"][aria-expanded="true"]');
  if(trigger){event.preventDefault();event.stopImmediatePropagation();trigger.click();trigger.focus({preventScroll:true});endGesture();return}
  if(visible($('photoSwapPrompt')))return;
  if(selected()||visible($('toolDrawer'))){
   event.preventDefault();event.stopImmediatePropagation();endGesture();
   window.owFinishSelection();
   if(typing(document.activeElement))document.activeElement.blur();
  }
 },true);
 document.addEventListener('keydown',event=>{
  if(!directions[event.key])endGesture();
  if(event.defaultPrevented||event.isComposing||event.ctrlKey||event.metaKey||event.altKey||typing(event.target)||dialogOpen()||menuOpen()||visible($('photoSwapPrompt'))||drag||window.owClosingCards)return;
  const target=selected();
  if(event.key.toLowerCase()==='t'&&!event.shiftKey){
   if(target||event.repeat)return;
   event.preventDefault();activatePanel('text');
   return;
  }
  if(event.key==='Delete'&&!event.shiftKey){
   if(!target||event.repeat)return;
   event.preventDefault();
   endGesture();
   if(target.key){
    historyGroup=null;
    deleteTextBlock(target.page,target.key);
    window.owFinishSelection();
    persist();historyGroup=null;
    toast('Texto eliminado. Deshacer lo recupera.');
   }else{
    window.owFinishSelection();
    removePhoto(target.page,target.index);
   }
   return;
  }
  if(!target||!directions[event.key]||event.target.closest?.('button,a,summary,[role="tab"],[role="slider"]'))return;
  event.preventDefault();
  const [axis,direction]=directions[event.key];
  nudge(target,axis,direction,event.shiftKey?10:1,event);
 });
 document.addEventListener('keyup',event=>{if(directions[event.key]||event.key==='Shift')endGesture()});
 document.addEventListener('pointerdown',endGesture,true);
 window.addEventListener('blur',endGesture);
 const trigger=document.createElement('button'),dialog=document.createElement('dialog');
 trigger.id='showKeyboardShortcuts';trigger.type='button';trigger.textContent='Atajos de teclado';
 trigger.setAttribute('role','menuitem');trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','keyboardShortcutsDialog');
 $('cleanCard').before(trigger);
 dialog.id='keyboardShortcutsDialog';dialog.setAttribute('aria-labelledby','keyboardShortcutsTitle');
 dialog.innerHTML='<div class="keyboard-help-heading"><h2 id="keyboardShortcutsTitle">Atajos de teclado</h2><button type="button" id="closeKeyboardShortcuts">Listo</button></div><dl><div><dt><kbd>Ctrl / ⌘</kbd> + <kbd>Z</kbd></dt><dd>Deshacer</dd></div><div><dt><kbd>Ctrl / ⌘</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd></dt><dd>Rehacer</dd></div><div><dt><kbd>T</kbd></dt><dd>Abrir Texto, sin selección</dd></div><div><dt><kbd>Esc</kbd></dt><dd>Cerrar menú, ajustes o selección</dd></div><div><dt><kbd>Suprimir</kbd></dt><dd>Quitar el texto o la foto seleccionada</dd></div><div><dt><kbd>← ↑ ↓ →</kbd></dt><dd>Mover la selección · 1 píxel</dd></div><div><dt><kbd>Shift</kbd> + <kbd>← ↑ ↓ →</kbd></dt><dd>Mover más rápido · 10 píxeles</dd></div></dl><p>Los atajos de mover y eliminar se usan fuera de los campos de escritura. Las flechas respetan los bloqueos de posición.</p>';
 document.body.append(dialog);
 trigger.onclick=()=>{endGesture();dialog.showModal();$('closeKeyboardShortcuts').focus({preventScroll:true})};
 $('closeKeyboardShortcuts').onclick=()=>dialog.close();
 dialog.addEventListener('keydown',event=>event.stopPropagation());
 dialog.addEventListener('close',()=>$('projectMenuButton').focus({preventScroll:true}));
 document.querySelectorAll('[data-desktop-tool="text"],[data-mobile-tool="text"]').forEach(button=>button.setAttribute('aria-keyshortcuts','T'));
})();
