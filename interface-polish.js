// Compact action groups share the existing controls and handlers.
(function(){
 const typography=document.createElement('div');typography.id='typographyQuickRow';typography.setAttribute('role','group');typography.setAttribute('aria-label','Formato, mayúsculas y minúsculas');
 const toggles=document.querySelector('#richEditor .rich-togglebar'),cases=document.querySelector('#richEditor .case-buttons');toggles.before(typography);typography.append(toggles,cases);
 for(let label of document.querySelectorAll('#richPane-text label'))if(label.textContent.trim()==='Mayúsculas y minúsculas')label.hidden=true;
 const align=document.querySelector('#richPane-layout .rich-align'),label=document.querySelector('label[for="rich-align"]');$('richPane-layout').prepend(label,align);
 function decoratePhotos(){for(let card of document.querySelectorAll('[data-photo-index]')){let more=card.querySelector('.photo-organize');if(!more)continue;let actions=card.querySelector('.photo-actions');for(let b of [...more.querySelectorAll('button')]){let move=b.textContent==='Mover antes',text=move?'Mover antes':'Eliminar';b.title=text;b.setAttribute('aria-label',text+' foto '+(+card.dataset.photoIndex+1));b.dataset.photoAction=move?'before':'delete';b.innerHTML=(move?'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4v16m14-8H9m5-5-5 5 5 5"/></svg>':editorIcon('trash'))+'<span class="photo-action-label">'+text+'</span>';actions.append(b)}more.remove()}}
 const before=imageList;imageList=function(){before();decoratePhotos()};decoratePhotos();
})();
