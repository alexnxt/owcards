// Keep authoring files separate; ship one stylesheet in their established cascade order.
const fs=require('fs'),path=require('path');
const directory=__dirname;
const normalize=value=>value.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
const files=JSON.parse(fs.readFileSync(path.join(__dirname,'style-sources.json'),'utf8'));
const output=files.map(file=>{
 if(path.basename(file)!==file||!file.endsWith('.css'))throw Error('Invalid stylesheet '+file);
 return '/* '+file+' */\n'+normalize(fs.readFileSync(path.join(directory,file),'utf8'));
}).join('\n');
const target=path.join(directory,'ui.bundle.css');
if(process.argv.includes('--check')){
 if(!fs.existsSync(target)||normalize(fs.readFileSync(target,'utf8'))!==output)throw Error('Styles changed: run node build-styles.cjs before publishing.');
}else fs.writeFileSync(target,output);
console.log('Styles ready: '+files.length+' sources, one stylesheet.');
