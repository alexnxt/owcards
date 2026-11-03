// Paragraph alignment and centering the whole block have different symbols.
(function(){
 const paths={left:'M4 5h16M4 10h10M4 15h16M4 20h10',center:'M4 5h16M7 10h10M4 15h16M7 20h10',right:'M4 5h16M10 10h10M4 15h16M10 20h10'},names={left:'Alinear texto a la izquierda dentro del bloque',center:'Centrar texto dentro del bloque',right:'Alinear texto a la derecha dentro del bloque'};
 document.querySelectorAll('[data-rich-align]').forEach(button=>{let key=button.dataset.richAlign;button.title=names[key];button.setAttribute('aria-label',names[key]);button.innerHTML='<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="'+paths[key]+'"/></svg>'});
 const centering={horizontal:['centerHorizontal','Centrar bloque horizontalmente · entre izquierda y derecha'],vertical:['centerVertical','Centrar bloque verticalmente · entre arriba y abajo'],both:['centerBoth','Centrar bloque en ambos ejes']};
 document.querySelectorAll('[data-center-text]').forEach(button=>{let [icon,label]=centering[button.dataset.centerText];button.innerHTML=editorIcon(icon);button.querySelector('svg').setAttribute('width','26');button.querySelector('svg').setAttribute('height','26');button.title=label;button.setAttribute('aria-label',label)});
})();
