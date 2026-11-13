// One text inspector on both devices, with a compact writing mode on phones.
(function(){let editor=$('richEditor'),drawer=$('toolDrawer'),content=$('toolDrawerContent'),group=editor.querySelector('.rich-content-group'),summary=group.querySelector('summary'),input=$('richContent'),styleTabs=editor.querySelector('.rich-tabs');document.body.classList.add('simple-workflow');let mode='style',styleTab='text',writing=false,wasMobile=isMobileEditor(),modeScroll=new Map(),styleButtons=[];
let nav=document.createElement('div');nav.id='textWorkflow';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','Herramientas del texto');for(let [key,label] of [['write','Escribir'],['style','Estilo'],['position','Posición']]){let b=document.createElement('button');b.type='button';b.id='textMode-'+key;b.dataset.textMode=key;b.textContent=label;b.setAttribute('role','tab');b.setAttribute('aria-controls',key==='write'?'textWritePane':key==='position'?'richPane-layout':'textStylePane');b.onclick=()=>setMode(key,key==='write');b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();let keys=['write','style','position'],i=keys.indexOf(key),next=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;setMode(keys[next],false);$('textMode-'+keys[next]).focus({preventScroll:true})};nav.append(b)}
let writePane=document.createElement('div');writePane.id='textWritePane';writePane.setAttribute('role','tabpanel');writePane.setAttribute('aria-labelledby','textMode-write');writePane.append(input);group.replaceWith(writePane);editor.querySelector('label[for="richContent"]')?.remove();let stylePane=document.createElement('div');stylePane.id='textStylePane';stylePane.setAttribute('role','tabpanel');stylePane.setAttribute('aria-labelledby','textMode-style');styleTabs.before(stylePane);stylePane.append(styleTabs);for(let name of ['text','color','effects'])stylePane.append($('richPane-'+name));$('richPane-layout').setAttribute('aria-labelledby','textMode-position');$('richTab-layout').remove();editor.querySelector('label[for="richTarget"]').textContent='Texto seleccionado';$('richTarget').after(nav);
let reset=document.createElement('details');reset.id='textResetMenu';let resetTitle=document.createElement('summary');resetTitle.textContent='Restablecer…';editor.append(reset);reset.append(resetTitle,$('resetText'),$('richReset'));$('resetText').textContent='Solo posición';$('richReset').textContent='Solo estilo';reset.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>reset.open=false));
function choose(key){if(!cardTextKeys(state.pages[state.current]).includes(key))key='title';$('richTarget').value=key;$('richTarget').dispatchEvent(new Event('change',{bubbles:true}));selectedText=key;input.setAttribute('aria-label','Contenido de '+$('richTarget').selectedOptions[0].textContent);refreshSelection()}
function compact(on){writing=on&&mobileTool==='text'&&!drawer.hidden;document.body.classList.toggle('mobile-writing',writing&&isMobileEditor());document.body.classList.toggle('inspector-writing',writing);if(mobileTool==='text')$('toolDrawerName').textContent=writing?$('richTarget').selectedOptions[0].textContent:'Texto';if(writing){content.scrollTop=0;clearTextGuides()}updateMobileLayout()}
function showMode(){writePane.hidden=mode!=='write';stylePane.hidden=mode!=='style';$('richPane-layout').hidden=mode!=='position';reset.hidden=mode==='write';nav.querySelectorAll('[data-text-mode]').forEach(b=>{let on=b.dataset.textMode===mode;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1});styleButtons.forEach(b=>{let on=mode==='style'&&b.dataset.richTab===styleTab;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1});for(let name of ['text','color','effects'])$('richPane-'+name).hidden=name!==styleTab;stylePane.setAttribute('aria-labelledby','richTab-'+styleTab)}
function selectSample(){
  const key=$('richTarget').value;
  const isSample=(key==='title'||key==='body')&&[
    fresh(),...Object.values(cardDesignExamples),
    {title:'Una nueva\nperspectiva.',body:'Continúa tu historia aquí.'}
  ].some(example=>example[key]===input.value);
  if(isSample)input.select();
}
input.addEventListener('focus',()=>{if(!isMobileEditor())selectSample()});
function setMode(next,focus=false){modeScroll.set(mode,content.scrollTop);if(document.activeElement===input&&next!=='write')input.blur();mode=next;showMode();compact(next==='write');content.scrollTop=modeScroll.get(mode)||0;if(focus&&next==='write'){
  input.focus({preventScroll:true});
  selectSample();
}}
styleButtons=Array.from(styleTabs.querySelectorAll('button'));$('textMode-style').hidden=true;$('textMode-style').tabIndex=-1;for(let b of styleButtons)nav.insertBefore(b,$('textMode-position'));styleTabs.hidden=true;nav.classList.add('single-text-row');
for(let b of Array.from(nav.children).filter(b=>!b.hidden)){let key=b.dataset.richTab||b.dataset.textMode,icons={write:'write',text:'font',color:'color',effects:'effects',position:'position'},labels={write:'Escribir',text:'Fuente',color:'Color',effects:'Efectos',position:'Posición'};b.innerHTML=editorIcon(icons[key])+'<span>'+labels[key]+'</span>';b.title=labels[key];b.setAttribute('aria-label',labels[key]);b.onclick=()=>{if(b.dataset.richTab){styleTab=b.dataset.richTab;setMode('style')}else setMode(b.dataset.textMode,b.dataset.textMode==='write')};b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();let buttons=Array.from(nav.children).filter(b=>!b.hidden),i=buttons.indexOf(b),next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:buttons.length-1))%buttons.length,target=buttons[next];if(target.dataset.richTab){styleTab=target.dataset.richTab;setMode('style')}else setMode(target.dataset.textMode,false);target.focus({preventScroll:true})}}input.addEventListener('focus',()=>{if(mode==='write')compact(true)});let finish=document.createElement('button');finish.type='button';finish.id='finishTextWriting';finish.textContent='Listo';finish.className='primary';finish.onclick=()=>{input.blur();setMode('style');$('richTab-'+styleTab).focus({preventScroll:true})};drawer.querySelector('.drawer-heading').append(finish);
const originalOpen=openTool,originalActivate=activatePanel,originalClose=closeToolDrawer;
function prepareText(){choose(selectedText||$('richTarget').value);if(mode==='write')mode='style';showMode();compact(false)}
openTool=function(name){if(name!=='text'){input.blur();compact(false)}originalOpen(name);if(name==='text'&&!drawer.hidden)prepareText();else if(drawer.hidden)compact(false)};
activatePanel=function(name){let text=name==='text';if(!text){input.blur();compact(false)}originalActivate(name);if(text&&!drawer.hidden&&!(isMobileEditor()&&drag))prepareText()};
closeToolDrawer=function(){input.blur();compact(false);originalClose()};$('closeToolDrawer').onclick=closeToolDrawer;
let start=null,moved=false,down=cv.onpointerdown,up=cv.onpointerup;cv.onpointerdown=e=>{start={x:e.clientX,y:e.clientY};moved=false;down(e)};cv.onpointerup=e=>{moved=!!start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>8;up(e);start=null};
openMobileSheet=function(){if(!isMobileEditor()||!selectedText)return;let key=selectedText;if(mobileTool==='text'&&!drawer.hidden)choose(key);else{if(mobileTool==='text')mobileTool=null;originalOpen('text');choose(key)}setMode(moved?'position':mode==='write'?'style':mode,false)};
// Legacy quick-sheet nodes stay hidden; every visible text action uses this editor.
$('mobileSheet').hidden=true;document.body.classList.remove('mobile-adjust');$('mobileStyle').onclick=()=>{openTool('text');setMode('style')};$('mobileEdit').onclick=()=>setMode('write',true);
let hint=document.createElement('p');hint.id='collageHint';hint.className='panel-help';hint.textContent='Añade otra foto para crear un collage.';$('imageList').after(hint);const previousNodes=toolNodes;toolNodes=function(name){let nodes=previousNodes(name).filter(n=>n!==$('removeImage'));if(name==='photos'&&photoToolMode==='photos')nodes.push(hint,$('removeImage'));return nodes};
$('save').textContent='Guardar proyecto editable';$('open').textContent='Abrir proyecto editable';$('saveCardDesign').textContent='Guardar diseño reutilizable';$('removeImage').textContent='Quitar todas las fotos';stylePane.append($('applyStyleAll'));
function refreshContext(){let count=sources(state.pages[state.current]).length;$('applyStyleAll').hidden=state.pages.length<2||writing;hint.hidden=count!==1;$('removeImage').hidden=count===0;if(typeof refreshToolNavigation==='function')refreshToolNavigation()}
let before=render;render=function(refresh=true){before(refresh);refreshContext()};$('richTarget').addEventListener('change',()=>{selectedText=$('richTarget').value;input.setAttribute('aria-label','Contenido de '+$('richTarget').selectedOptions[0].textContent);if(writing)$('toolDrawerName').textContent=$('richTarget').selectedOptions[0].textContent});
function viewportChanged(){let mobile=isMobileEditor();if(mobile!==wasMobile){wasMobile=mobile;input.blur();showMode();compact(mode==='write')}else compact(writing)}window.addEventListener('resize',viewportChanged);window.visualViewport?.addEventListener('resize',viewportChanged);window.visualViewport?.addEventListener('scroll',()=>{if(writing)updateMobileLayout()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&writing){e.preventDefault();input.blur();setMode('style')}});refreshContext();showMode();
})();
// Writing shortcuts share the main history and keep the keyboard focused.
(function(){
 const input=$('richContent'),group=document.createElement('div');group.id='writingHistory';group.setAttribute('role','group');group.setAttribute('aria-label','Historial de cambios');
 for(let [id,back] of [['writingUndo',true],['writingRedo',false]]){let button=document.createElement('button');button.id=id;button.type='button';button.title=back?'Deshacer':'Rehacer';button.setAttribute('aria-label',button.title);button.innerHTML='<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(back?'m9 5-6 6 6 6M3 11h11a6 6 0 0 1 6 6':'m15 5 6 6-6 6M21 11H10a6 6 0 0 0-6 6')+'"/></svg>';button.addEventListener('pointerdown',e=>e.preventDefault());button.onclick=()=>{let start=input.selectionStart,end=input.selectionEnd;travelHistory(back);input.focus({preventScroll:true});input.setSelectionRange(Math.min(start,input.value.length),Math.min(end,input.value.length))};group.append(button)}
 $('finishTextWriting').before(group);const before=updateHistoryButtons;updateHistoryButtons=function(){before();$('writingUndo').disabled=$('undo').disabled;$('writingRedo').disabled=$('redo').disabled};updateHistoryButtons();
})();
// Clear the writing field without deleting its block, style or position.
(function(){
 const input=$('richContent'),field=document.createElement('div'),clear=document.createElement('button');field.className='text-writing-field';input.before(field);clear.id='clearTextContent';clear.type='button';clear.title='Vaciar texto';clear.setAttribute('aria-label','Vaciar texto');clear.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';field.append(input,clear);
 function update(){let value=state.pages[state.current][$('richTarget').value]||'';if(input.value!==value)input.value=value;clear.hidden=!input.value;clear.disabled=input.disabled}
 clear.addEventListener('pointerdown',e=>e.preventDefault());clear.onclick=()=>{if(!input.value||input.disabled)return;input.focus({preventScroll:true});historyGroup=null;input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));historyGroup=null;update()};
 input.addEventListener('input',update);$('richTarget').addEventListener('change',update);const before=render;render=function(refresh=true){before(refresh);update()};update();
})();

// Insert a suggested label through the normal text editing path.
(function(){
  const target=$('richTarget'), input=$('richContent');
  const row=document.createElement('label'), picker=document.createElement('select');
  row.id='tagPresetRow';
  row.htmlFor='tagPresetPicker';
  row.append('Etiqueta predefinida',picker);
  picker.id='tagPresetPicker';
  picker.append(new Option('Elegir etiqueta',''));
  for(const label of [defaultCardTag,'Arte de Fans','Actualización','Evento','Guía','Discusión','Comunidad']){
    picker.append(new Option(label,label));
  }
  input.closest('.text-writing-field').before(row);
  function update(){
    row.hidden=target.value!=='tag';
    picker.disabled=input.disabled;
  }
  picker.onchange=()=>{
    if(target.value!=='tag'||!picker.value||input.disabled)return;
    historyGroup=null;
    input.value=picker.value;
    input.dispatchEvent(new Event('input',{bubbles:true}));
    picker.value='';
    historyGroup=null;
  };
  target.addEventListener('change',update);
  const before=render;
  render=function(refresh=true){before(refresh);update()};
  update();
})();
