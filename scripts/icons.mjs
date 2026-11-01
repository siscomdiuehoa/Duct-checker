import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
const src='web/assets/ductlogo.png';
const icon=async(dest,size)=>{await mkdir(dest.substring(0,dest.lastIndexOf('/')),{recursive:true});await sharp(src).resize(size,size,{fit:'contain',background:'#e6edf1'}).flatten({background:'#e6edf1'}).png().toFile(dest);};
for(const [density,size] of Object.entries({mdpi:48,hdpi:72,xhdpi:96,xxhdpi:144,xxxhdpi:192})){
 for(const name of ['ic_launcher','ic_launcher_round'])await icon(`android/app/src/main/res/mipmap-${density}/${name}.png`,size);
 await icon(`android/app/src/main/res/mipmap-${density}/ic_launcher_foreground.png`,Math.round(size*108/48));
}
await icon('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',1024);
await writeFile('ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json',JSON.stringify({images:[{filename:'AppIcon-512@2x.png',idiom:'universal',platform:'ios',size:'1024x1024'}],info:{author:'xcode',version:1}},null,2));
console.log('Native icons resized from original logo; no redraw.');
