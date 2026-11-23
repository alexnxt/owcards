function fragmentColors(page,key){
 const entry=page.textFragmentColors?.[key];
 return entry?.text===page[key]?entry.colors:[];
}

function saveFragmentColors(page,key,text,colors){
 if(colors.some(Boolean)){
  page.textFragmentColors??={};
  page.textFragmentColors[key]={text,colors:Array.from(colors,value=>value||null)};
 }else if(page.textFragmentColors)delete page.textFragmentColors[key];
}

function validFragmentColors(page){
 const map=page.textFragmentColors;
 return map===undefined||!!map&&typeof map==='object'&&!Array.isArray(map)&&Object.entries(map).every(([key,entry])=>
  isTextKey(key)&&entry&&typeof entry.text==='string'&&entry.text.length<=1000&&
  Array.isArray(entry.colors)&&entry.colors.length===entry.text.length&&
  entry.colors.every(color=>color===null||typeof color==='string'&&/^#[a-f\d]{6}$/i.test(color)));
}

function fragmentColorLines(page,key,mode,lines){
 const colors=fragmentColors(page,key);
 if(!colors.length)return null;
 const source=page[key],display=richCase(source,mode),mapped=[];
 let start=0,cursor=0;
 for(const grapheme of richChars(source)){
  const end=start+grapheme.length;
  const length=mode==='original'?end:richCase(source.slice(0,end),mode).length;
  const color=colors.slice(start,end).find(Boolean)||null;
  while(cursor<length)mapped[cursor++]=color;
  start=end;
 }
 cursor=0;
 return lines.map(line=>richChars(line).map(char=>{
  if(/\s/u.test(char)){
   while(cursor<display.length&&/\s/u.test(display[cursor]))cursor++;
   return {char,color:null};
  }
  while(cursor<display.length&&/\s/u.test(display[cursor]))cursor++;
  const color=mapped[cursor];
  cursor+=char.length;
  return {char,color};
 }));
}

function paintFragmentLine(c,parts,x,y,style){
 let prefix='',run='',previous;
 let position=x;
 const paint=(text,color,at)=>{
  const ink=color||style.color;
  c.fillStyle=ink;
  richPaint(c,text,at,y,color?{...style,color:ink}:style);
 };
 for(const {char,color} of parts){
  if(style.letterSpacing){
   paint(char,color,position);
   position+=c.measureText(char).width+style.letterSpacing;
   continue;
  }
  if(run&&previous!==color){
   paint(run,previous,x+c.measureText(prefix).width);
   prefix+=run;
   run='';
  }
  run+=char;
  previous=color;
 }
 if(run)paint(run,previous,x+c.measureText(prefix).width);
 c.fillStyle=style.color;
}

document.addEventListener('DOMContentLoaded',()=>{
 const input=$('richContent'),target=$('richTarget');
 input.addEventListener('input',()=>{
  const page=state.pages[state.current],key=target.value,old=page[key],next=input.value,colors=fragmentColors(page,key);
  if(!colors.length||old===next)return;
  let start=0,end=0;
  while(start<old.length&&start<next.length&&old[start]===next[start])start++;
  while(end<old.length-start&&end<next.length-start&&old[old.length-end-1]===next[next.length-end-1])end++;
  const nextColors=Array.from({length:next.length},(_,i)=>i<start?colors[i]:i>=next.length-end?colors[i+old.length-next.length]:null);
  saveFragmentColors(page,key,next,nextColors);
 },true);
});
