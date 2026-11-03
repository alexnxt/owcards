// Polygon geometry is shared by rendering, previews, and photo hit testing.
function diagonalRegions(n,w,h,gap=0){
 if(n===1)return [{polygon:[[0,0],[w,0],[w,h],[0,h]],box:[0,0,w,h]}];
 const slant=Math.min(.13,.32/n)*w,offset=gap/2*Math.hypot(1,2*slant/h);
 return Array.from({length:n},(_,i)=>{
  let left=i===0?[0,0]:[i*w/n+slant+offset,i*w/n-slant+offset],right=i===n-1?[w,w]:[(i+1)*w/n+slant-offset,(i+1)*w/n-slant-offset];
  let polygon=[[left[0],0],[right[0],0],[right[1],h],[left[1],h]],x=Math.min(...polygon.map(v=>v[0])),end=Math.max(...polygon.map(v=>v[0]));
  return {polygon,box:[x,0,end-x,h]};
 });
}
function drawDiagonalCollage(c,src,p,w,h){
 let m=p.margin;diagonalRegions(src.length,w-2*m,h-2*m,p.gap).forEach(({polygon,box},i)=>{
  c.save();c.translate(m,m);c.beginPath();polygon.forEach(([x,y],j)=>j?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
  let im=picture(src[i]);if(im)cover(c,im,...box,p.crops[i],p.imageFit,p.edgeFade,p.fadeEdges,p.fillMode==='custom'?p.fillColor:null);applyGrain(c,[box],p.grain);c.restore();
 });
}
function usesCollage(p){return sources(p).length>1}
function photoIndexAt(p,pt,w,h){
 let n=sources(p).length;if(!n)return -1;
 if(usesCollage(p)&&p.collageStyle==='diagonal'){
  let x=pt.x-p.margin,y=pt.y-p.margin,H=h-2*p.margin;if(y<0||y>H)return -1;
  return diagonalRegions(n,w-2*p.margin,H,p.gap).findIndex(({polygon:a})=>{let t=y/H,left=a[0][0]*(1-t)+a[3][0]*t,right=a[1][0]*(1-t)+a[2][0]*t;return x>=left&&x<=right});
 }
 let rects=usesCollage(p)?cells(n,w-2*p.margin,h-2*p.margin,p.collageStyle,p.gap).map(([x,y,a,b])=>[x+p.margin,y+p.margin,a,b]):[[0,0,w,h]];
 return rects.findIndex(([x,y,a,b])=>pt.x>=x&&pt.x<=x+a&&pt.y>=y&&pt.y<=y+b);
}
const lateralBlurCache=new WeakMap(),lateralImageIds=new WeakMap();let lateralMask,lateralNextId=1;
function drawLateralBackdrop(c,p,w,h){
 const right=p.layout==='textRight',blur=p.sideBlur,im=picture(sources(p)[0]);
 if(blur&&im){
  let imageIds=sources(p).map(src=>{let image=picture(src);if(!image)return 0;if(!lateralImageIds.has(image))lateralImageIds.set(image,lateralNextId++);return lateralImageIds.get(image)});
  let key=JSON.stringify([w,h,p.bg,imageIds,p.crops,p.collageStyle,p.gap,p.margin,p.imageFit,p.fillMode,p.fillColor,p.edgeFade,p.fadeEdges,p.grain,blur]),cached=lateralBlurCache.get(im),scale=Math.min(1,640/Math.max(w,h)),W=Math.ceil(w*scale),H=Math.ceil(h*scale);
  if(!cached||cached.key!==key){
   let layer=document.createElement('canvas');layer.width=W;layer.height=H;let ctx=layer.getContext('2d'),bleed=blur*scale*3;
   ctx.filter='blur('+blur*scale+'px)';ctx.drawImage(c.canvas,-bleed,-bleed,W+2*bleed,H+2*bleed);cached={key,layer};lateralBlurCache.set(im,cached);
  }
  lateralMask??=document.createElement('canvas');lateralMask.width=W;lateralMask.height=H;let mc=lateralMask.getContext('2d');mc.drawImage(cached.layer,0,0);mc.globalCompositeOperation='destination-in';let mask=mc.createLinearGradient(right?W:0,0,right?0:W,0);mask.addColorStop(0,'#000');mask.addColorStop(.38,'#000');mask.addColorStop(.66,'transparent');mc.fillStyle=mask;mc.fillRect(0,0,W,H);mc.globalCompositeOperation='source-over';c.drawImage(lateralMask,0,0,w,h);
 }
 let tint=c.createLinearGradient(right?w:0,0,right?0:w,0),a=p.overlay/100;tint.addColorStop(0,'rgba(0,0,0,'+a+')');tint.addColorStop(.38,'rgba(0,0,0,'+a+')');tint.addColorStop(.72,'rgba(0,0,0,0)');c.fillStyle=tint;c.fillRect(0,0,w,h);
}

