// Show the lateral adjustment beside the image effects only when relevant.
(function(){
 let label=document.createElement('label'),select=document.createElement('select');label.htmlFor='collageTextLayout';label.textContent='Texto sobre el collage';select.id='collageTextLayout';
 for(let [value,text] of [['collage','Libre'],['photo','Abajo'],['center','Centrado'],['textLeft','Izquierda · difuminado'],['textRight','Derecha · difuminado']]){let option=document.createElement('option');option.value=value;option.textContent=text;select.append(option)}
 $('collageChoices').after(label,select);
 select.onchange=()=>{$('layout').value=select.value;$('layout').dispatchEvent(new Event('input',{bubbles:true}));sync()};
 const nodes=toolNodes;toolNodes=function(name){let result=nodes(name);if(name==='collage'||name==='photos'&&photoToolMode==='collage')return [label,select,...result];return result};
 function update(){let p=state.pages[state.current],side=['textLeft','textRight'].includes(p.layout),input=$('sideBlur'),wrapper=input.closest('.safe-range')||input;select.value=['photo','center','textLeft','textRight'].includes(p.layout)?p.layout:'collage';document.querySelector('label[for="sideBlur"]').hidden=!side;wrapper.hidden=!side;document.querySelector('label[for="overlay"]').textContent=side?'Oscurecer lado del texto':'Oscurecer imagen'}
 const before=render;render=function(refresh=true){before(refresh);update()};update();
})();
