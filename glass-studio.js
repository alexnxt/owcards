// Keep the existing controls, history and responsive inspector in the new shell.
(function(){
 const workspace=document.querySelector('.workspace'),host=$('desktopToolHost');
 const inspector=document.createElement('section');
 inspector.id='studioInspector';
 inspector.setAttribute('aria-label','Ajustes de la tarjeta');
 workspace.append(inspector);
 document.body.classList.add('glass-studio');
 function arrange(){
  const desktop=!isMobileEditor(),create=$('newSingleCard');
  inspector.hidden=!desktop;
  if(host.parentElement!==inspector)inspector.append(host);
  const destination=desktop?$('desktopFilmstrip'):document.body;
  if(create.parentElement!==destination)destination.append(create);
 }
 window.addEventListener('resize',arrange);
 matchMedia('(max-width:850px)').addEventListener('change',arrange);
 arrange();
})();
