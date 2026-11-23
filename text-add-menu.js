// One compact Add menu selects existing base blocks or restores their own saved copy.
(function(){
 const menu=document.createElement('div');menu.id='textAddMenu';menu.hidden=true;menu.setAttribute('role','menu');menu.setAttribute('aria-label','Añadir o restaurar texto');document.body.append(menu);let anchor=null,sourcePage=null;
 const trigger=$('addFreeText'),row=document.createElement('div');row.id='textAddMenuRow';$('textWorkflow').before(row);row.append(trigger);trigger.innerHTML=editorIcon('write')+'<span>Añadir texto</span><span aria-hidden="true">▾</span>';
 const triggers=[trigger,$('quickTextAdd'),$('desktopAddText')];for(let button of triggers){button.title=button.id==='quickTextAdd'?'Añadir texto':'Añadir o restaurar texto';button.setAttribute('aria-label',button.title);button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-controls',menu.id);button.setAttribute('aria-expanded','false');button.onclick=e=>open(e.currentTarget)}
 function close(focus=false){menu.hidden=true;if(anchor){anchor.setAttribute('aria-expanded','false');if(focus&&anchor.getClientRects().length)anchor.focus({preventScroll:true})}anchor=null;sourcePage=null}
 function position(){if(!anchor)return;const r=anchor.getBoundingClientRect(),height=window.visualViewport?.height||innerHeight,width=window.visualViewport?.width||innerWidth;menu.style.width=Math.min(280,width-16)+'px';menu.style.maxHeight=Math.max(80,height-16)+'px';let h=menu.getBoundingClientRect().height;menu.style.left=Math.max(8,Math.min(r.left,width-menu.offsetWidth-8))+'px';menu.style.top=Math.max(8,Math.min(r.bottom+6+h<=height-8?r.bottom+6:r.top-h-6,height-h-8))+'px'}
 function choose(key){const p=sourcePage;if(p!==state.pages[state.current]){close();return}close();if(key==='free'){addFreeText();return}let missing=!p[key].trim(),saved=p.deletedTexts?.[key];if(missing){historyGroup=null;p[key]=saved?.content||(key==='source'?'Fuente: ':fresh()[key]);if(saved){p.textStyles??={};p.textStyles[key]=structuredClone(saved.style);p.textPositions??={};if(saved.position)p.textPositions[key]=structuredClone(saved.position);else delete p.textPositions[key];p.textLocks??={};p.textLocks[key]=saved.locked}sync();persist()}
  window.owSelectionCleared=false;selectedText=key;activePhoto=null;$('richTarget').value=key;$('richTarget').dispatchEvent(new Event('change',{bubbles:true}));activatePanel('text');$('richTarget').value=key;$('richTarget').dispatchEvent(new Event('change',{bubbles:true}));if(key==='source'){$('textMode-write').click();$('richContent').select()}else $('richTab-text').click();render(false);requestAnimationFrame(()=>{$('toolDrawerContent').scrollTop=0;refreshSelection()});if(missing)toast(saved?textName(key)+' restaurado. Puedes deshacerlo.':textName(key)+' añadido con texto de ejemplo.')
 }

 const clearDialog=document.createElement('dialog');
 clearDialog.id='clearAllTextDialog';
 clearDialog.setAttribute('aria-labelledby','clearAllTextTitle');
 clearDialog.innerHTML='<h2 id="clearAllTextTitle">¿Quitar todos los textos?</h2><p>Se quitarán los textos de esta tarjeta. Puedes recuperarlos con Deshacer.</p><div class="clear-text-actions"><button type="button" id="cancelClearAllText">Cancelar</button><button type="button" id="confirmClearAllText">Quitar textos</button></div>';
 document.body.append(clearDialog);
 let clearPage=null;
 $('cancelClearAllText').onclick=()=>clearDialog.close();
 clearDialog.addEventListener('close',()=>{clearPage=null});
 clearDialog.addEventListener('keydown',event=>{if(event.key==='Escape')event.stopPropagation()});
 $('confirmClearAllText').onclick=()=>{
  const page=clearPage;
  if(page!==state.pages[state.current]){clearDialog.close();return;}
  const keys=cardTextKeys(page);
  if(!keys.some(key=>page[key]?.trim())){clearDialog.close();return;}
  historyGroup=null;
  for(const key of keys)deleteTextBlock(page,key);
  selectedText=null;
  activePhoto=null;
  window.owSelectionCleared=true;
  clearTextGuides();
  closeToolDrawer();
  clearDialog.close();
  sync();
  persist();
  historyGroup=null;
  toast('Textos quitados. Deshacer los recupera.');
 };
 function menuItem(key,parent=menu){
  const button=document.createElement('button');
  button.type='button';
  button.dataset.addText=key;
  button.setAttribute('role','menuitem');
  button.tabIndex=-1;
  const missing=key!=='free'&&!sourcePage[key]?.trim();
  const saved=sourcePage.deletedTexts?.[key];
  const label=document.createElement('span'),action=document.createElement('small');
  label.textContent=key==='free'?'＋ Texto libre':textName(key);
  action.textContent=key==='free'?'Añadir':missing?(saved?'Restaurar':'Añadir'):'Seleccionar';
  button.classList.toggle('restore-text-option',missing);
  button.append(label,action);
  button.disabled=key==='free'&&sourcePage.freeTextKeys.length>=12;
  button.onclick=()=>choose(key);
  parent.append(button);
 }
 function open(button){
  if(anchor===button&&!menu.hidden){close(true);return;}
  close();
  anchor=button;
  sourcePage=state.pages[state.current];
  menu.replaceChildren();
  menuItem('free');
  menuItem('source');
  const missing=['title','body','tag','brand'].filter(key=>!sourcePage[key]?.trim());
  if(missing.length){
   const recover=document.createElement('button'),options=document.createElement('div');
   recover.type='button';
   recover.textContent='Recuperar texto ▾';
   recover.setAttribute('role','menuitem');
   recover.setAttribute('aria-expanded','false');
   recover.setAttribute('aria-controls','textRestoreOptions');
   options.id='textRestoreOptions';
   options.hidden=true;
   options.setAttribute('role','group');
   options.setAttribute('aria-label','Textos para recuperar');
   menu.append(recover,options);
   missing.forEach(key=>menuItem(key,options));
   recover.onclick=()=>{
    options.hidden=!options.hidden;
    recover.setAttribute('aria-expanded',String(!options.hidden));
    position();
   };
  }
  const remove=document.createElement('button');
  remove.id='removeAllCardText';
  remove.type='button';
  remove.setAttribute('role','menuitem');
  remove.tabIndex=-1;
  remove.textContent='Quitar todos los textos';
  remove.disabled=!cardTextKeys(sourcePage).some(key=>sourcePage[key]?.trim());
  remove.onclick=()=>{
   const page=sourcePage;
   close();
   clearPage=page;
   clearDialog.showModal();
   $('cancelClearAllText').focus({preventScroll:true});
  };
  menu.append(remove);
  menu.hidden=false;
  button.setAttribute('aria-expanded','true');
  position();
  menu.querySelector('button:not(:disabled)').focus({preventScroll:true});
 }
 menu.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);return}if(e.key==='Tab'){close();return}if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;e.preventDefault();e.stopPropagation();let buttons=[...menu.querySelectorAll('button:not(:disabled)')].filter(button=>button.getClientRects().length),i=buttons.indexOf(document.activeElement),next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowDown'?1:buttons.length-1))%buttons.length;buttons[next].focus({preventScroll:true})});
 document.addEventListener('pointerdown',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!triggers.some(b=>b.contains(e.target)))close()},true);window.addEventListener('resize',()=>close());window.visualViewport?.addEventListener('resize',()=>close());
 const before=render;render=function(refresh=true){before(refresh);trigger.disabled=false;$('quickTextAdd').disabled=false;if(!menu.hidden&&sourcePage!==state.pages[state.current])close()};
})();
