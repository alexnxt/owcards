// The inline inspector and writing dialog share their color controls and history.
(function(){
 const input=$('rich-color'),pane=$('richPane-color'),writing=$('richContent'),target=$('richTarget');
 const storageKey='owcards-text-colors-v1';
 const presets=[['#ffffff','Blanco'],['#000000','Negro'],['#d1d5db','Gris claro'],['#6b7280','Gris'],['#ff8a3d','Naranja'],['#facc15','Amarillo'],['#ef4444','Rojo'],['#f472b6','Rosa'],['#a78bfa','Violeta'],['#3b82f6','Azul'],['#22c55e','Verde'],['#14b8a6','Turquesa']];
 function normalize(value){
  const hex=String(value).trim().toLowerCase().replace(/^#/,'');
  if(/^[a-f0-9]{3}$/.test(hex))return '#'+Array.from(hex,c=>c+c).join('');
  return /^[a-f0-9]{6}$/.test(hex)?'#'+hex:null;
 }
 let recent=[];
 try{
  const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');
  if(Array.isArray(saved))recent=[...new Set(saved.filter(c=>typeof c==='string').map(normalize).filter(Boolean))].slice(0,6);
 }catch{}
 const controls=document.createElement('section');
 controls.id='textColorControls';
 controls.setAttribute('aria-label','Color del texto');
 controls.innerHTML='<div id="textColorScope" role="group" aria-label="Aplicar color a"><button type="button" data-color-scope="block" aria-pressed="true">Todo el bloque</button><button type="button" data-color-scope="selection" aria-pressed="false" disabled>Selección</button></div><p id="textColorSelection" aria-live="polite" hidden></p><div id="textColorPalette"><div id="textPresetColors" class="text-color-swatches" role="group" aria-label="Colores del texto"></div><div id="textRecentColors" hidden><span class="palette-caption">Recientes</span><div id="textRecentSwatches" class="text-color-swatches" role="group" aria-label="Colores recientes"></div></div></div>';
 const custom=input.closest('label'),customRow=custom.parentElement;
 custom.firstChild.textContent='Personalizado';
 custom.classList.add('text-custom-color');
 const hexLabel=document.createElement('label');
 hexLabel.className='text-color-hex';
 hexLabel.htmlFor='textColorHex';
 hexLabel.innerHTML='<span>HEX</span><input id="textColorHex" type="text" maxlength="7" spellcheck="false" autocomplete="off" aria-label="Código HEX del color del texto" placeholder="#FFFFFF">';
 custom.after(hexLabel);
 pane.prepend(controls);
 controls.append(customRow);
 const unify=document.createElement('button'),restore=document.createElement('button');
 unify.type=restore.type='button';
 unify.id='unifyTextColor';
 unify.textContent='Unificar color';
 unify.title='Aplicar el color elegido a todo el bloque y quitar los colores de palabras';
 restore.id='clearFragmentColor';
 restore.textContent='Volver al color del bloque';
 controls.append(restore,unify);
 const hex=$('textColorHex'),selectionButton=controls.querySelector('[data-color-scope="selection"]');
 const excerpt=$('textColorSelection');
 let scope='block',selection=null,hexDirty=false;
 let colorPage=state.pages[state.current],colorKey=target.value;
 function validSelection(){
  return selection&&selection.page===state.pages[state.current]&&selection.key===target.value&&
   selection.text===state.pages[state.current][target.value]&&selection.start<selection.end;
 }
 function captureSelection(){
  if(document.activeElement!==writing)return;
  const {selectionStart:start,selectionEnd:end}=writing;
  selection=start<end?{page:state.pages[state.current],key:target.value,text:writing.value,start,end}:null;
  sync();
 }
 function colors(){
  return typeof fragmentColors==='function'?fragmentColors(state.pages[state.current],target.value):[];
 }
 function chosenColor(){
  const fallback=richStyle(state.pages[state.current],target.value).color;
  if(scope==='selection'&&validSelection()){
   const current=colors();
   const values=new Set(Array.from({length:selection.end-selection.start},(_,i)=>current[selection.start+i]||fallback));
   return values.size===1?values.values().next().value:null;
  }
  return fallback;
 }
 function remember(value){
  const color=normalize(value);
  if(!color)return;
  recent=[color,...recent.filter(c=>c!==color)].slice(0,6);
  try{localStorage.setItem(storageKey,JSON.stringify(recent))}catch{}
  drawRecents();
 }
 function applyFragment(color){
  if(!validSelection())return;
  const {page,key,text,start,end}=selection,current=colors();
  const next=Array.from({length:text.length},(_,i)=>current[i]||null);
  next.fill(color,start,end);
  historyGroup=null;
  saveFragmentColors(page,key,text,next);
  render(false);
  persist();
  historyGroup=null;
 }
 function apply(value){
  const color=normalize(value);
  if(!color)return;
  historyGroup=null;
  if(scope==='selection'){
   applyFragment(color);
   remember(color);
  }
  else{
   input.value=color;
   input.dispatchEvent(new Event('input',{bubbles:true}));
  }
  sync();
 }
 function swatch(parent,color,name){
  const button=document.createElement('button');
  button.type='button';
  button.className='text-color-swatch';
  button.dataset.textColor=color;
  button.style.setProperty('--swatch-color',color);
  button.title=name+' · '+color.toUpperCase();
  button.setAttribute('aria-label',name+' '+color.toUpperCase());
  button.innerHTML='<span class="swatch-tick" aria-hidden="true">✓</span>';
  button.onpointerdown=()=>{
   if(document.activeElement===hex){hexDirty=false;hex.blur()}
  };
  button.onclick=()=>apply(color);
  parent.append(button);
 }
 for(const [color,name] of presets)swatch($('textPresetColors'),color,name);
 function drawRecents(){
  const host=$('textRecentSwatches');
  const focused=host.contains(document.activeElement)?document.activeElement.dataset.textColor:null;
  host.replaceChildren();
  for(const color of recent)swatch(host,color,'Color reciente');
  $('textRecentColors').hidden=!recent.length;
  if(focused)host.querySelector('[data-text-color="'+focused+'"]')?.focus({preventScroll:true});
 }
 function sync(){
  const page=state.pages[state.current],key=target.value;
  if(page!==colorPage||key!==colorKey){
   selection=null;
   scope='block';
   colorPage=page;
   colorKey=key;
  }
  const available=!!validSelection();
  if(!available)scope='block';
  selectionButton.disabled=!available;
  selectionButton.title=available?'Colorear las palabras seleccionadas':'Selecciona una palabra o frase en el campo de escritura';
  controls.querySelectorAll('[data-color-scope]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.colorScope===scope)));
  excerpt.hidden=scope!=='selection';
  if(!excerpt.hidden)excerpt.textContent='Selección · '+selection.text.slice(selection.start,selection.end);
  const color=normalize(chosenColor());
  controls.querySelectorAll('[data-text-color]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.textColor===color)));
  const fallback=richStyle(page,key).color;
  if(document.activeElement!==input)input.value=color||fallback;
  if(document.activeElement!==hex){
   hex.value=(color||fallback).toUpperCase();
   hex.removeAttribute('aria-invalid');
   hex.setCustomValidity('');
  }
  restore.hidden=scope!=='selection';
  unify.disabled=!colors().some(Boolean);
 }
 for(const button of controls.querySelectorAll('[data-color-scope]'))button.onclick=()=>{
  scope=button.dataset.colorScope;
  sync();
 };
 restore.onclick=()=>{applyFragment(null);sync()};
 unify.onclick=()=>{
  const color=normalize(input.value);
  if(!color||!colors().some(Boolean))return;
  historyGroup=null;
  const page=state.pages[state.current],key=target.value;
  saveFragmentColors(page,key,page[key],[]);
  scope='block';
  apply(color);
  historyGroup=null;
 };
 const blockInput=input.oninput;
 input.oninput=function(event){
  if(scope==='selection')applyFragment(input.value);
  else blockInput.call(this,event);
  remember(input.value);
  sync();
 };
 function applyHex(){
  if(!hexDirty)return;
  const color=normalize(hex.value);
  if(!color){
   hex.setAttribute('aria-invalid','true');
   hex.setCustomValidity('Escribe un color HEX válido, por ejemplo #FF8A3D.');
   return;
  }
  hexDirty=false;
  hex.removeAttribute('aria-invalid');
  hex.setCustomValidity('');
  apply(color);
 }
 hex.addEventListener('change',applyHex);
 hex.addEventListener('input',()=>{hexDirty=true;hex.removeAttribute('aria-invalid');hex.setCustomValidity('')});
 hex.addEventListener('keydown',event=>{
  if(event.key==='Enter'){event.preventDefault();applyHex()}
  if(event.key==='Escape'){event.preventDefault();hexDirty=false;hex.blur();sync()}
 });
 const trigger=document.createElement('button'),dialog=document.createElement('dialog');
 trigger.type='button';
 trigger.id='openFragmentColors';
 trigger.textContent='Color';
 trigger.title='Color de todo el bloque o de las palabras seleccionadas';
 writing.closest('.text-writing-field').after(trigger);
 dialog.id='fragmentColorDialog';
 dialog.setAttribute('aria-labelledby','fragmentColorTitle');
 dialog.innerHTML='<h2 id="fragmentColorTitle">Color del texto</h2><form method="dialog"><button>Cerrar</button></form>';
 document.body.append(dialog);
 dialog.addEventListener('keydown',event=>{if(event.key==='Escape')event.stopPropagation()});
 trigger.onpointerdown=captureSelection;
 trigger.onclick=()=>{
  scope=validSelection()?'selection':'block';
  sync();
  dialog.insertBefore(controls,dialog.querySelector('form'));
  dialog.showModal();
 };
 dialog.addEventListener('close',()=>{
  pane.prepend(controls);
  if(validSelection()&&writing.getClientRects().length)writing.setSelectionRange(selection.start,selection.end);
 });
 const before=render;
 render=function(refresh=true){before(refresh);sync();if(dialog.open&&(mobileTool!=='text'||$('toolDrawer').hidden))dialog.close()};
 writing.addEventListener('select',captureSelection);
 document.addEventListener('selectionchange',captureSelection);
 writing.addEventListener('input',()=>{selection=null;sync()});
 target.addEventListener('change',sync);
 drawRecents();
 sync();
})();
