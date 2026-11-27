(function(){let trigger=$('projectMenuButton'),menu=$('projectMenu'),media=matchMedia('(max-width:850px)'),actions=document.querySelector('.header-actions'),zip=$('exportZip'),theme=$('themeToggle');let items=()=>[...menu.querySelectorAll('button')].filter(b=>!b.disabled&&!b.hidden);for(let b of items())b.setAttribute('role','menuitem');
let separator=document.createElement('hr');separator.className='theme-menu-separator';function orderActions(){close();let project=trigger.parentElement;if(media.matches){actions.append($('status'),project,$('export'),$('undo'),$('redo'));menu.append(zip,separator,theme);zip.textContent='Guardar carrusel ZIP';zip.setAttribute('role','menuitem');theme.setAttribute('role','menuitemcheckbox');theme.setAttribute('aria-checked',String(document.documentElement.dataset.theme==='dark'))}else{actions.append($('status'),$('undo'),$('redo'),theme,project,$('export'),zip);zip.textContent='Carrusel ZIP';for(let b of [zip,theme]){b.removeAttribute('role');b.removeAttribute('aria-checked')}}}media.addEventListener('change',orderActions);orderActions();
function close(focus=false){menu.hidden=true;trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus({preventScroll:true})}
function open(index){menu.hidden=false;trigger.setAttribute('aria-expanded','true');if(index!==undefined)items()[index]?.focus({preventScroll:true})}
trigger.onclick=()=>menu.hidden?open():close();trigger.onkeydown=e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();open(e.key==='ArrowDown'?0:items().length-1)}if(e.key==='Escape')close(true)};
menu.addEventListener('click',e=>{let action=e.composedPath().find(n=>n instanceof HTMLButtonElement);if(action)close(action.id==='themeToggle'||action.id==='newSingleCard'||action.id==='openRecentCards'||!!action.dataset.projectMode)});menu.addEventListener('keydown',e=>{if(e.target instanceof HTMLSelectElement||e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;let buttons=items(),i=buttons.indexOf(document.activeElement);if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();let next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowDown'?1:buttons.length-1))%buttons.length;buttons[next]?.focus()}else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true)}else if(e.key==='Tab')close()});document.addEventListener('pointerdown',e=>{if(!e.target.closest('.file-menu'))close()});document.addEventListener('focusin',e=>{if(!e.target.closest('.file-menu'))close()});})();

// Clear only this card's content; its signature and design stay available.
(function(){
 const trigger=document.createElement('button'),dialog=document.createElement('dialog');
 trigger.id='cleanCard';trigger.type='button';trigger.textContent='Limpiar tarjeta';
 trigger.setAttribute('role','menuitem');
 trigger.title='Quitar fotos y textos de esta tarjeta, excepto la firma';
 trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','cleanCardDialog');
 $('resetAll').before(trigger);
 dialog.id='cleanCardDialog';
 dialog.setAttribute('aria-labelledby','cleanCardTitle');
 dialog.setAttribute('aria-describedby','cleanCardDescription');
 dialog.innerHTML='<h2 id="cleanCardTitle">¿Limpiar esta tarjeta y conservar la firma?</h2><p id="cleanCardDescription">Se quitarán las fotos y los textos de la tarjeta actual, excepto Marca / usuario. Se conservará el diseño. Puedes recuperar todo con Deshacer.</p><div class="clear-text-actions"><button type="button" id="cancelCleanCard">Cancelar</button><button type="button" id="confirmCleanCard" class="primary">Limpiar tarjeta</button></div>';
 document.body.append(dialog);
 let pending=null;
 function hasContent(page){return page.overlays?.length>0||sources(page).length>0||page.freeTextKeys?.length>0||cardTextKeys(page).some(key=>key!=='brand'&&!!page[key])}
 function update(){setEditorProperty(trigger,'disabled',!hasContent(state.pages[state.current]))}
 trigger.onclick=()=>{
  const page=state.pages[state.current];
  if(!hasContent(page))return;
  pending={page,revision:owProjectStorage.revision};
  dialog.showModal();
  $('cancelCleanCard').focus({preventScroll:true});
 };
 $('cancelCleanCard').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{pending=null;$('projectMenuButton').focus({preventScroll:true})});
 dialog.addEventListener('keydown',event=>event.stopPropagation());
 $('confirmCleanCard').onclick=()=>{
  const current=pending;
  pending=null;
  if(!current)return;
  const {page,revision}=current;
  if(page!==state.pages[state.current]||revision!==owProjectStorage.revision){
   dialog.close();toast('La tarjeta cambió. Vuelve a elegir Limpiar tarjeta.');return;
  }
  if(!hasContent(page)){dialog.close();return}
  historyGroup=null;
  for(const key of cardTextKeys(page))if(key!=='brand')deleteTextBlock(page,key);
  page.overlays=[];
  page.image=null;
  page.images=[];
  page.crops=[];
  if(typeof photoFramesOpen!=='undefined')photoFramesOpen.delete(page);
  selectedText=null;
  activePhoto=null;
  replacementPhoto=null;
  window.owSelectionCleared=true;
  clearTextGuides();
  closeToolDrawer();
  dialog.close();
  sync();
  persist();
  historyGroup=null;
  const action=historyEntry(true);
  toast('Tarjeta limpia. Firma conservada.',{label:'Deshacer',run:()=>{
   if(action&&historyEntry(true)===action)travelHistory(true);
   else toast('Usa Deshacer en la barra para retroceder desde el último cambio.');
  }});
 };
 const before=render;render=function(refresh=true){before(refresh);update()};
 update();
})();
