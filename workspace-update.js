// One active-card workspace; carousel membership exists only during export.
(function(){
 document.body.classList.add('card-workspace');$('projectModeOptions').hidden=true;
 const dialog=$('recentCardsDialog'),grid=$('activeCardsGrid'),tools=document.createElement('div'),order=document.createElement('div');tools.id='carouselSelectionTools';order.id='carouselOrder';
 tools.innerHTML='<button type="button" id="selectCarousel">'+editorIcon('pages')+'<span>Seleccionar carrusel</span></button><button type="button" id="selectAllCards" hidden>Seleccionar todas</button><button type="button" id="downloadSelection" class="primary" hidden disabled>Descargar carrusel</button><p id="carouselSelectionHint" role="status" hidden></p>';grid.before(tools,order);
 let choosing=false,selected=[];
 function paint(){selected=selected.filter(p=>state.pages.includes(p));dialog.classList.toggle('selecting-carousel',choosing);$('selectCarousel').querySelector('span').textContent=choosing?'Terminar selección':'Seleccionar carrusel';$('selectAllCards').hidden=$('downloadSelection').hidden=$('carouselSelectionHint').hidden=!choosing;$('downloadSelection').disabled=!selected.length;$('downloadSelection').textContent='Descargar carrusel'+(selected.length?' · '+selected.length:'');$('carouselSelectionHint').textContent=selected.length?'Orden de descarga. Usa las flechas para cambiarlo.':'Marca las tarjetas activas que quieras incluir en el ZIP.';
  for(let b of grid.querySelectorAll('[data-active-index]')){let index=selected.indexOf(state.pages[+b.dataset.activeIndex]),badge=b.querySelector('.carousel-pick');if(!badge){badge=document.createElement('span');badge.className='carousel-pick';b.prepend(badge)}badge.hidden=!choosing;badge.textContent=index<0?'○':String(index+1);b.classList.toggle('carousel-selected',choosing&&index>=0);b.setAttribute('aria-label',(choosing?'Seleccionar para carrusel: ':'Abrir tarjeta: ')+(state.pages[+b.dataset.activeIndex]?.title||'Sin título'));}
  order.replaceChildren();order.hidden=!choosing||!selected.length;for(let [i,p]of selected.entries()){let row=document.createElement('div'),label=document.createElement('span');label.textContent=(i+1)+'. '+(p.title.trim()||'Sin título');row.append(label);for(let [delta,text]of [[-1,'Subir'],[1,'Bajar']]){let b=document.createElement('button');b.type='button';b.textContent=delta<0?'↑':'↓';b.setAttribute('aria-label',text+' tarjeta '+(i+1)+' en el carrusel');b.disabled=i+delta<0||i+delta>=selected.length;b.onclick=()=>{[selected[i],selected[i+delta]]=[selected[i+delta],selected[i]];paint()};row.append(b)}order.append(row)}
 }
 grid.addEventListener('click',e=>{if(!choosing)return;let b=e.target.closest('[data-active-index]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();let p=state.pages[+b.dataset.activeIndex],index=selected.indexOf(p);if(index<0)selected.push(p);else selected.splice(index,1);paint()},true);
 $('selectCarousel').onclick=()=>{choosing=!choosing;if(!choosing)selected=[];paint()};$('selectAllCards').onclick=()=>{selected=state.pages.slice();paint()};
 $('downloadSelection').onclick=()=>{if(!selected.length)return;let indexes=selected.map(p=>state.pages.indexOf(p));dialog.close();window.owExportCards(indexes)};
 window.owOpenCarouselSelection=()=>{if(!dialog.open)$('openRecentCards').click();choosing=true;selected=[];paint()};
 new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&n.matches('.active-card'))))paint()}).observe(grid,{childList:true});dialog.addEventListener('close',()=>{choosing=false;selected=[];paint()});paint();
 // In the mobile photo dock keep only framing, crop and replacement.
 for(let id of ['quickPhotoFit','quickPhotoReset','quickPhotoEffects'])$(id).classList.add('secondary-photo-action');
 function update(){document.querySelectorAll('[data-desktop-tool=pages],[data-mobile-tool=pages]').forEach(b=>b.hidden=true);$('exportZip').hidden=true;}
 const before=render;render=function(refresh=true){before(refresh);update()};update();
 // Make the project name available without opening Design.
 let projectName=document.createElement('div');projectName.id='projectNameControl';let label=document.querySelector('label[for="project"]');projectName.append(label,$('project'));$('projectModeOptions').after(projectName);
})();
