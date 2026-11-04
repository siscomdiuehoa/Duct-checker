import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('../',import.meta.url)));
import {mkdir,copyFile,cp,rm,readFile,writeFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const name of ['index.html','app.js','engine.js','locales.js','style.css'])await copyFile('web/'+name,'dist/'+name);
await cp('web/assets','dist/assets',{recursive:true});
const html=await readFile('dist/index.html','utf8');if(!html.includes('lang="en"'))throw Error('English document default missing');
console.log('Offline web assets prepared; English default, five selectable languages.');

// The iOS release uses the approved 5.2.0 store version; Android remains 5.3.0.
if(process.env.DUCT_IOS_RELEASE==='1')for(const name of ['index.html','app.js']){const path='dist/'+name;const content=await readFile(path,'utf8');await writeFile(path,content.replaceAll('5.3.0','5.2.0'));}
