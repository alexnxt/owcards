// Pixel-based transforms keep preview and export consistent across canvas engines.
const photoFilterNames={original:'Original',warm:'Cálido',cool:'Frío',vivid:'Vívido',soft:'Suave',bw:'B/N',vintage:'Vintage',enhance:'Mejorar foto'};
function validFilterEntry(value){
  return !!value&&typeof value==='object'&&!Array.isArray(value)&&
    Object.hasOwn(photoFilterNames,value.preset)&&Number.isFinite(value.intensity)&&
    value.intensity>=0&&value.intensity<=100;
}
function validPhotoFilter(value){
  if(!Array.isArray(value))return value===undefined||validFilterEntry(value);
  return value.length<Object.keys(photoFilterNames).length&&
    value.every(filter=>validFilterEntry(filter)&&filter.preset!=='original')&&
    new Set(value.map(filter=>filter.preset)).size===value.length;
}
function photoFilterList(value){
  if(!validPhotoFilter(value)||!value)return [];
  return Array.isArray(value)?value:value.preset==='original'?[]:[value];
}
function applyPhotoFilterPixels(canvas,preset,intensity){if(preset==='original'||intensity<=0)return canvas;const ctx=canvas.getContext('2d'),pixels=ctx.getImageData(0,0,canvas.width,canvas.height),data=pixels.data,t=Math.max(0,Math.min(100,intensity))/100;if(preset==='enhance'){
  enhancePhotoPixels(pixels,t);
  ctx.putImageData(pixels,0,0);
  return canvas;
}
for(let i=0;i<data.length;i+=4){if(!data[i+3])continue;let r=data[i],g=data[i+1],b=data[i+2],R=r,G=g,B=b,luma=.2126*r+.7152*g+.0722*b;switch(preset){case'warm':R=r*1.1+8;G=g*1.02+2;B=b*.9-3;break;case'cool':R=r*.9-3;G=g*1.02+2;B=b*1.12+8;break;case'vivid':R=(luma+(r-luma)*1.35-128)*1.08+128;G=(luma+(g-luma)*1.35-128)*1.08+128;B=(luma+(b-luma)*1.35-128)*1.08+128;break;case'soft':R=(luma+(r-luma)*.92-128)*.88+136;G=(luma+(g-luma)*.92-128)*.88+136;B=(luma+(b-luma)*.92-128)*.88+136;break;case'bw':R=G=B=luma;break;case'vintage':R=(.393*r+.769*g+.189*b)*.9+10;G=(.349*r+.686*g+.168*b)*.9+5;B=(.272*r+.534*g+.131*b)*.9;break}data[i]=r+(Math.max(0,Math.min(255,R))-r)*t;data[i+1]=g+(Math.max(0,Math.min(255,G))-g)*t;data[i+2]=b+(Math.max(0,Math.min(255,B))-b)*t}ctx.putImageData(pixels,0,0);return canvas}
// Sharpen luminance while leaving the original alpha and color balance intact.
function enhancePhotoPixels({data,width,height},strength){
  const luminance=new Float32Array(width*height);
  for(let i=0;i<luminance.length;i++){
    const offset=i*4;
    luminance[i]=.2126*data[offset]+.7152*data[offset+1]+.0722*data[offset+2];
  }
  for(let y=0;y<height;y++){
    for(let x=0;x<width;x++){
      const i=y*width+x, offset=i*4;
      if(!data[offset+3])continue;
      const center=luminance[i];
      const left=x>0&&data[(i-1)*4+3] ? luminance[i-1] : center;
      const right=x+1<width&&data[(i+1)*4+3] ? luminance[i+1] : center;
      const top=y>0&&data[(i-width)*4+3] ? luminance[i-width] : center;
      const bottom=y+1<height&&data[(i+width)*4+3] ? luminance[i+width] : center;
      const detail=center-(left+right+top+bottom)/4;
      const adjustment=strength*(Math.max(-24,Math.min(24,detail*.6))+(center-128)*.065);
      for(let channel=0;channel<3;channel++)data[offset+channel]+=adjustment;
    }
  }
}
const photoFilterCache=new Map(),photoFilterImageIds=new WeakMap();let photoFilterNextId=1,photoFilterCacheBytes=0;
function filteredPhoto(image,filter,preview=false){const filters=photoFilterList(filter).filter(item=>item.intensity>0);if(!filters.length)return image;if(preview)image=filterPreviewSource(image);const w=image.naturalWidth||image.width,h=image.naturalHeight||image.height;if(!w||!h)return image;if(!photoFilterImageIds.has(image))photoFilterImageIds.set(image,photoFilterNextId++);const key=photoFilterImageIds.get(image)+':'+JSON.stringify(filters.map(item=>[item.preset,item.intensity]));if(photoFilterCache.has(key)){let cached=photoFilterCache.get(key);photoFilterCache.delete(key);photoFilterCache.set(key,cached);return cached.canvas}const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(image,0,0,w,h);for(const item of filters)applyPhotoFilterPixels(canvas,item.preset,item.intensity);const bytes=w*h*4;photoFilterCache.set(key,{canvas,bytes});photoFilterCacheBytes+=bytes;while(photoFilterCache.size>1&&(photoFilterCache.size>12||photoFilterCacheBytes>96*1024*1024)){let oldest=photoFilterCache.keys().next().value,entry=photoFilterCache.get(oldest);photoFilterCacheBytes-=entry.bytes;photoFilterCache.delete(oldest);entry.canvas.width=entry.canvas.height=1}return canvas}
