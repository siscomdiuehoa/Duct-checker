import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('../',import.meta.url)));
import {mkdir,copyFile,cp,rm,readFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const name of ['index.html','app.js','engine.js','locales.js','style.css'])await copyFile('web/'+name,'dist/'+name);
await cp('web/assets','dist/assets',{recursive:true});
const html=await readFile('dist/index.html','utf8');if(!html.includes('lang="en"'))throw Error('English document default missing');
console.log('Offline web assets prepared; English default, five selectable languages.');
