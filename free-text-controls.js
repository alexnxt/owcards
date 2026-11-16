function duplicateTextBlock(source){
 const page=state.pages[state.current];
 if(!cardTextKeys(page).includes(source)||!page[source]?.trim())return;
 const key=Array.from({length:12},(_,i)=>'free'+(i+1)).find(k=>!page.freeTextKeys.includes(k));
 if(!key){toast('Puedes añadir hasta 12 textos libres por tarjeta.');return;}
 const position=currentTextPosition(source);
 historyGroup=null;
 page[key]=page[source];
 saveFragmentColors(page,key,page[key],fragmentColors(page,source));
 page.textStyles[key]=richStyle(page,source,{size:textBounds[source]?.size??richStyle(page,source).size});
 page.textPositions[key]={...position,y:position.y>96?position.y-4:position.y+4};
 page.textLocks[key]=!!page.textLocks[source];
 page.freeTextKeys.push(key);
 window.owSelectionCleared=false;
 selectedText=key;
 activePhoto=null;
 syncTextTargets();
 $('richTarget').value=key;
 $('richTarget').dispatchEvent(new Event('change',{bubbles:true}));
 sync();
 persist();
 return key;
}
function addFreeText(){let p=state.pages[state.current];normalize(p);let key=Array.from({length:12},(_,i)=>'free'+(i+1)).find(k=>!p.freeTextKeys.includes(k));if(!key)return toast('Puedes añadir hasta 12 textos libres por tarjeta.');historyGroup=null;p[key]='Texto libre';p.textStyles[key]={font:p.bodyFont||'sans',size:40,color:p.fg,align:'left'};p.textPositions[key]={x:50,y:Math.min(84,65+p.freeTextKeys.length*4),width:60};p.freeTextKeys.push(key);syncTextTargets();selectedText=key;activePhoto=null;$('richTarget').value=key;$('richTarget').dispatchEvent(new Event('change',{bubbles:true}));sync();persist();activatePanel('text');$('richTarget').value=key;$('richTarget').dispatchEvent(new Event('change',{bubbles:true}));$('textMode-write').click();$('richContent').select()}
(function(){let select=$('richTarget'),row=document.createElement('div'),add=document.createElement('button');row.className='text-target-row';select.before(row);add.type='button';add.id='addFreeText';add.title='Añadir texto libre';add.setAttribute('aria-label','Añadir texto libre');add.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 5h12M9 5v15m-4 0h8M19 9v8m-4-4h8"/></svg>';add.onclick=addFreeText;row.append(select,add);const before=render;render=function(refresh=true){before(refresh);add.disabled=false};syncTextTargets()})();
