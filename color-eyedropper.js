// One sampler for every color field; reuse their existing input/history paths.
(function(){
 editorIconPaths.eyedropper='m15 3 6 6-3 3-6-6 3-3ZM13 7 4 16v4h4l9-9M10 6l8 8M3 21l2-2';
 const dialog=document.createElement('dialog');
 dialog.id='colorSamplerDialog';
 dialog.setAttribute('aria-labelledby','colorSamplerTitle');
 dialog.setAttribute('aria-describedby','colorSamplerHint');
 dialog.innerHTML='<div class="color-sampler-heading"><h2 id="colorSamplerTitle">Tomar color</h2><button type="button" id="colorSamplerCancel">Cancelar</button></div><p id="colorSamplerHint">Toca un color o arrastra y suelta para elegirlo.</p><div id="colorSamplerStage"><canvas id="colorSamplerCanvas" tabindex="0" aria-label="Tarjeta para tomar color. Usa las flechas para mover la muestra y Enter para elegir."></canvas><div id="colorSamplerLens" hidden aria-hidden="true"><canvas width="84" height="84"></canvas><span></span></div></div><div class="color-sampler-actions"><div id="colorSamplerValue"><span id="colorSamplerSwatch" aria-hidden="true"></span><output id="colorSamplerHex">Elige un punto</output></div><button type="button" id="colorSamplerScreen" hidden>Pantalla</button><button type="button" id="colorSamplerApply" class="primary" disabled>Usar color</button></div><p id="colorSamplerStatus" role="status" aria-live="polite"></p>';
 document.body.append(dialog);
 const preview=$('colorSamplerCanvas'),context=preview.getContext('2d',{willReadFrequently:true});
 const stage=$('colorSamplerStage'),lens=$('colorSamplerLens'),zoom=lens.querySelector('canvas').getContext('2d');
 let session=null,pointer=null,frame=null,pendingPoint=null,releaseClick=null;
 // Closing on release must not pass the resulting click to the palette behind it.
 document.addEventListener('click',event=>{
  if(!releaseClick)return;
  const point=releaseClick;
  releaseClick=null;
  if(performance.now()<=point.until&&Math.hypot(event.clientX-point.x,event.clientY-point.y)<24){
   event.preventDefault();event.stopImmediatePropagation();
  }
 },true);
 function cleanup(){
  if(frame!==null)cancelAnimationFrame(frame);
  frame=null;pendingPoint=null;pointer=null;
  session?.abort?.abort();
  const trigger=session?.trigger;
  session=null;
  lens.hidden=true;
  preview.width=preview.height=1;
  zoom.clearRect(0,0,84,84);
  if(trigger?.isConnected&&trigger.getClientRects().length)trigger.focus({preventScroll:true});
 }
 function close(){if(dialog.open)dialog.close();else cleanup()}
 dialog.addEventListener('close',cleanup);
 $('colorSamplerCancel').onclick=close;
 dialog.addEventListener('cancel',event=>{event.stopPropagation()});
 dialog.addEventListener('keydown',event=>{
  event.stopPropagation();
  if(event.key==='Escape'){event.preventDefault();close()}
 });
 dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();
 });
 function sample(x,y){
  if(!session)return;
  x=Math.max(0,Math.min(preview.width-1,Math.round(x)));
  y=Math.max(0,Math.min(preview.height-1,Math.round(y)));
  try{
   const pixel=context.getImageData(x,y,1,1).data;
   const color='#'+Array.from(pixel.slice(0,3),value=>value.toString(16).padStart(2,'0')).join('');
   session.point={x,y};session.color=color;
   $('colorSamplerHex').textContent=color.toUpperCase();
   $('colorSamplerSwatch').style.backgroundColor=color;
   $('colorSamplerApply').disabled=false;
   zoom.imageSmoothingEnabled=false;
   zoom.clearRect(0,0,84,84);
   zoom.drawImage(preview,x-5,y-5,11,11,0,0,84,84);
   const rect=preview.getBoundingClientRect(),box=stage.getBoundingClientRect();
   const px=rect.left-box.left+x*rect.width/preview.width,py=rect.top-box.top+y*rect.height/preview.height;
   const top=py>108?py-104:py+24;
   lens.style.left=Math.max(0,Math.min(box.width-84,px-42))+'px';
   lens.style.top=Math.max(0,Math.min(box.height-84,top))+'px';
   lens.hidden=false;
  }catch{
   $('colorSamplerStatus').textContent='No se puede leer esta imagen. Prueba con otra foto o elige un color manualmente.';
   $('colorSamplerApply').disabled=true;
   session.color=null;
  }
 }
 function eventPoint(event){
  const rect=preview.getBoundingClientRect();
  return {x:(event.clientX-rect.left)*preview.width/rect.width,y:(event.clientY-rect.top)*preview.height/rect.height};
 }
 function queueSample(event){
  pendingPoint=eventPoint(event);
  if(frame!==null)return;
  frame=requestAnimationFrame(()=>{frame=null;const point=pendingPoint;pendingPoint=null;if(point)sample(point.x,point.y)});
 }
 function apply(color){
  const current=session;
  if(!current||!/^#[a-f\d]{6}$/i.test(color||''))return;
  if(!current.valid()){
   close();toast('El destino cambió. Vuelve a abrir el cuentagotas.');return;
  }
  // End the sampling session before rendering or saving the edit.
  close();
  historyGroup=null;
  if(current.textColor)current.textColor.apply(color);
  else{
   current.input.value=color;
   current.input.dispatchEvent(new Event('input',{bubbles:true}));
   current.input.dispatchEvent(new Event('change',{bubbles:true}));
  }
  historyGroup=null;
 }
 preview.onpointerdown=event=>{
  if(!session||event.button!==0)return;
  event.preventDefault();pointer=event.pointerId;
  preview.focus({preventScroll:true});
  preview.setPointerCapture(pointer);
  const point=eventPoint(event);sample(point.x,point.y);
 };
 preview.onpointermove=event=>{if(session&&(pointer===null&&event.pointerType==='mouse'||pointer===event.pointerId))queueSample(event)};
 preview.onpointerup=event=>{
  if(pointer!==event.pointerId)return;
  event.preventDefault();pointer=null;
  if(frame!==null){cancelAnimationFrame(frame);frame=null;pendingPoint=null}
  const point=eventPoint(event);sample(point.x,point.y);
  if(preview.hasPointerCapture(event.pointerId))preview.releasePointerCapture(event.pointerId);
  releaseClick={x:event.clientX,y:event.clientY,until:performance.now()+500};
  apply(session?.color);
 };
 preview.onpointercancel=()=>{pointer=null;lens.hidden=true};
 preview.onkeydown=event=>{
  if(!session)return;
  if(event.key==='Enter'||event.key===' '){event.preventDefault();apply(session.color);return}
  const direction={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
  if(!direction)return;
  event.preventDefault();
  const point=session.point||{x:preview.width/2,y:preview.height/2},step=event.shiftKey?10:1;
  sample(point.x+direction[0]*step,point.y+direction[1]*step);
 };
 $('colorSamplerApply').onclick=()=>apply(session?.color);
 $('colorSamplerScreen').onclick=async()=>{
  if(!session||!window.EyeDropper)return;
  const current=session;
  current.abort=new AbortController();
  try{
   const result=await new EyeDropper().open({signal:current.abort.signal});
   if(current===session)apply(result.sRGBHex);
  }catch(error){
   if(current===session&&error.name!=='AbortError')$('colorSamplerStatus').textContent='No se pudo tomar el color de la pantalla. Puedes elegirlo en la tarjeta.';
  }
 };
 function open(input,trigger){
  if(input.disabled||dialog.open)return;
  flushEditorPreview();
  const textColor=input.id==='rich-color'?window.owCaptureTextColor?.():null;
  const page=state.pages[state.current],key=input.dataset.rich?$('richTarget').value:null;
  const valid=()=>input.isConnected&&!input.disabled&&page===state.pages[state.current]&&(!key||key===$('richTarget').value)&&(!textColor||textColor.valid());
  session={input,trigger,textColor,valid,color:null,point:null};
  preview.width=cv.width;preview.height=cv.height;
  context.drawImage(cv,0,0);
  $('colorSamplerTitle').textContent='Tomar color · '+trigger.dataset.colorName;
  $('colorSamplerHex').textContent='Elige un punto';
  $('colorSamplerSwatch').style.backgroundColor=input.value;
  $('colorSamplerStatus').textContent='';
  $('colorSamplerApply').disabled=true;
  $('colorSamplerScreen').hidden=!(typeof window.EyeDropper==='function'&&matchMedia('(pointer:fine)').matches);
  lens.hidden=true;
  dialog.showModal();
  preview.focus({preventScroll:true});
 }
 function attach(){
  const names={'rich-color':'Texto','rich-background':'Fondo del texto','rich-borderColor':'Contorno','rich-shadowColor':'Sombra',bg:'Fondo de tarjeta',fg:'Texto general',accent:'Acento',fillColorPicker:'Fondo de relleno'};
  for(const input of document.querySelectorAll('input[type="color"]')){
   if(input.closest('.color-eyedropper-controls'))continue;
   const wrapper=document.createElement('span'),button=document.createElement('button');
   wrapper.className='color-eyedropper-controls';
   button.type='button';button.className='color-eyedropper-button';
   button.dataset.colorInput=input.id;
   button.dataset.colorName=names[input.id]||input.getAttribute('aria-label')||'Color';
   button.title='Cuentagotas · '+button.dataset.colorName;
   button.setAttribute('aria-label',button.title);
   button.setAttribute('aria-haspopup','dialog');
   button.setAttribute('aria-controls',dialog.id);
   button.innerHTML=editorIcon('eyedropper');
   // Do not let a surrounding label open its native color dialog as well.
   button.onclick=event=>{event.preventDefault();event.stopPropagation();open(input,button)};
   input.before(wrapper);wrapper.append(input,button);
  }
 }
 attach();
 document.addEventListener('DOMContentLoaded',attach,{once:true});
})();
