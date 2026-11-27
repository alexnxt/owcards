// Group membership is editor-only. One input event commits every chosen crop.
(function(){
 let page=null,sourceOrder=[],mode='single',picked=new Set(),busy=false;
 function ensure(){
  const current=state.pages[state.current],sourcesNow=sources(current);
  if(current!==page||sourcesNow.length!==sourceOrder.length||sourcesNow.some((src,i)=>src!==sourceOrder[i])){
   page=current;sourceOrder=sourcesNow.slice();mode='single';picked=new Set();
  }
  if(sourcesNow.length<2){mode='single';picked.clear()}
 }
 function targets(index){
  const indexes=mode==='single'?[index]:mode==='all'?sourceOrder.map((_,i)=>i):[...picked];
  return indexes.filter(i=>sourceOrder[i]&&page.crops[i]&&!page.crops[i].locked);
 }
 function makeBar(card){
  const index=+card.dataset.photoIndex,bar=document.createElement('div'),label=document.createElement('span'),buttons=document.createElement('div'),status=document.createElement('p');
  bar.className='photo-zoom-scope';
  label.className='photo-zoom-scope-label';label.textContent='Aplicar acercamiento a';
  buttons.className='photo-zoom-scope-buttons';buttons.setAttribute('role','group');buttons.setAttribute('aria-label','Fotos que reciben el acercamiento');
  for(const [value,text] of [['single','Esta foto'],['some','Varias'],['all','Todas']]){
   const button=document.createElement('button');button.type='button';button.dataset.zoomScope=value;button.textContent=text;
   button.onclick=()=>{
    ensure();
    if(mode!==value){mode=value;if(mode==='some')picked=new Set(page.crops[index]?.locked?[]:[index])}
    update();
   };
   buttons.append(button);
  }
  status.id='photoZoomScopeStatus-'+index;status.className='photo-zoom-scope-status';status.setAttribute('role','status');
  bar.append(label,buttons,status);
  card.querySelector('.photo-frame').prepend(bar);
  const input=card.querySelector('input[aria-label^="Acercamiento"]');
  input.setAttribute('aria-describedby',status.id);
 }
 function decorate(){
  for(const card of $('imageList').querySelectorAll('.photo-card'))if(!card.querySelector('.photo-zoom-scope'))makeBar(card);
  update();
 }
 function update(){
  if(busy)return;busy=true;
  try{
   ensure();
   const count=sourceOrder.length,locked=page.crops.slice(0,count).filter(crop=>crop.locked).length;
   for(const card of $('imageList').querySelectorAll('.photo-card')){
    const index=+card.dataset.photoIndex,bar=card.querySelector('.photo-zoom-scope'),heading=card.querySelector('.photo-heading'),input=card.querySelector('input[aria-label^="Acercamiento"]');
    if(!bar||!input)continue;
    bar.hidden=count<2;
    bar.querySelectorAll('[data-zoom-scope]').forEach(button=>setEditorAttribute(button,'aria-pressed',String(button.dataset.zoomScope===mode)));
    const selected=targets(index),values=new Set(selected.map(i=>page.crops[i].zoom));
    let text=mode==='single'?'Solo esta foto.':mode==='some'?selected.length+' de '+count+' fotos elegidas. Marca las miniaturas.':selected.length+' de '+count+' fotos.';
    if(mode!=='single'&&locked)text+=' '+locked+(locked===1?' bloqueada fuera del ajuste.':' bloqueadas fuera del ajuste.');
    if(mode!=='single'&&values.size>1)text+=' Valores distintos; el próximo ajuste usará el mismo acercamiento.';
    setEditorText(bar.querySelector('.photo-zoom-scope-status'),text);
    // Current-photo position locks never disable a group of other unlocked photos.
    setEditorProperty(input,'disabled',!selected.length);
    if(mode!=='single'&&selected.length&&document.activeElement!==input)input.value=page.crops[selected[0]].zoom;
    else if(mode==='single'&&document.activeElement!==input)input.value=page.crops[index].zoom;
    const member=mode!=='single'&&selected.includes(index);
    card.classList.toggle('photo-zoom-picked',member);
    let check=heading.querySelector('.photo-zoom-check');
    if(!check){check=document.createElement('span');check.className='photo-zoom-check';check.textContent='✓';check.setAttribute('aria-hidden','true');heading.append(check)}
    check.hidden=!member;
    if(mode==='some'){
     setEditorAttribute(heading,'aria-pressed',String(member));
     setEditorAttribute(heading,'aria-label',page.crops[index].locked?'Foto '+(index+1)+' bloqueada. Seleccionar para desbloquear':(member?'Excluir':'Incluir')+' foto '+(index+1)+' del acercamiento');
    }else{
     heading.removeAttribute('aria-pressed');setEditorAttribute(heading,'aria-label','Seleccionar imagen '+(index+1));
    }
    setEditorAttribute(heading,'title',heading.getAttribute('aria-label'));
   }
   window.refreshPrecisionControls?.();
   window.refreshCompactControls?.();
  }finally{busy=false}
 }
 $('imageList').addEventListener('click',event=>{
  const heading=event.target.closest('.photo-heading');
  if(!heading)return;
  ensure();if(mode!=='some')return;
  const index=+heading.closest('.photo-card').dataset.photoIndex;
  if(page.crops[index]?.locked)return; // Keep the locked photo accessible for unlocking.
  event.preventDefault();event.stopImmediatePropagation();
  if(picked.has(index))picked.delete(index);else picked.add(index);
  update();
 },true);
 window.owApplyPhotoZoom=(target,index,value,input)=>{
  ensure();
  if(target!==page)return false;
  const selected=targets(index),zoom=Math.max(1,Math.min(3,Math.round(value*20)/20));
  if(!selected.length){update();return true}
  let changed=false;
  for(const i of selected)if(page.crops[i].zoom!==zoom){page.crops[i].zoom=zoom;changed=true}
  if(mode==='single')selectPhoto(page,index);
  if(changed){requestEditorPreview();persist()}
  update();return true;
 };
 const beforeList=imageList;imageList=function(){beforeList();decorate()};
 const beforeSelect=selectPhoto;selectPhoto=function(...args){beforeSelect(...args);update()};
 const beforeRender=render;render=function(value=true){beforeRender(value);update()};
 const beforePrecision=window.refreshPrecisionControls;window.refreshPrecisionControls=function(){beforePrecision?.();if(!busy)update()};
 window.addEventListener('resize',update);
 decorate();
})();
