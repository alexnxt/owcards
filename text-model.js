const baseTextKeys=['tag','title','body','brand'];
function isFreeTextKey(key){return /^free(?:[1-9]|1[0-2])$/.test(key)}
function isTextKey(key){return baseTextKeys.includes(key)||isFreeTextKey(key)}
function cardTextKeys(p){return [...baseTextKeys,...(p.freeTextKeys||[])]}
function textHitKeys(p){return [...(p.freeTextKeys||[])].reverse().concat(['brand','body','title','tag'])}
function textName(key){return {title:'Titular',body:'Texto de apoyo',tag:'Etiqueta',brand:'Marca / usuario'}[key]||(isFreeTextKey(key)?'Texto libre '+key.slice(4):'Texto')}
function textMaxLength(key){return {title:220,body:400,tag:60,brand:80}[key]||1000}
function validFreeTexts(p){let keys=p.freeTextKeys;if(keys===undefined)return true;return Array.isArray(keys)&&keys.length<=12&&new Set(keys).size===keys.length&&keys.every(k=>typeof k==='string'&&isFreeTextKey(k)&&typeof p[k]==='string'&&p[k].length<=1000)}
function syncTextTargets(){if(!document.querySelector)return;let p=state.pages[state.current],keys=cardTextKeys(p);for(let id of ['textTarget','richTarget']){let select=$(id);if(!select)continue;let previous=select.value;for(let option of Array.from(select.options))if(isFreeTextKey(option.value)&&!keys.includes(option.value))option.remove();for(let key of keys)if(!Array.from(select.options).some(o=>o.value===key)){let option=document.createElement('option');option.value=key;option.textContent=textName(key);select.append(option)}select.value=keys.includes(previous)?previous:'title'}}
function preserveFreeTextDesign(next,original){for(let key of original.freeTextKeys||[]){for(let map of ['textStyles','textPositions']){next[map]??={};if(original[map]?.[key])next[map][key]=structuredClone(original[map][key]);else delete next[map][key]}}return next}
function deleteTextBlock(p,key){if(isFreeTextKey(key)){p.freeTextKeys=p.freeTextKeys.filter(k=>k!==key);delete p[key];for(let map of ['textStyles','textPositions','textLocks'])if(p[map])delete p[map][key]}else p[key]=''}
