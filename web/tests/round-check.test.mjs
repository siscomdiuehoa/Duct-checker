import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as E from '../engine.js';
const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const update=source.slice(source.indexOf('function update(){'),source.indexOf('function renderSelection(){'));
function check(values){
 const result={innerHTML:''},captured={};
 const ctx={E,state:{page:'duct',mode:'check',checkshape:'round',material:0,values},materials:[['steel',.00018]],document:{querySelectorAll:()=>[]},$:s=>s==='#result'?result:null,validField:(k,x)=>Number.isFinite(x)&&(k==='rh'||k==='rough'?x>=0:x>0),airModel:()=>E.airProperties(101.325,20,0),t:x=>x,escape:x=>x,num:x=>x,display:(n,k)=>{captured[k]=n;return String(n)},row:(k,v)=>k+':'+v,pressureDisplay:(q,d,rect)=>{captured.rect=rect;captured.loss=E.pressure(q,d,rect,values.rough,E.airProperties(101.325,20,0)).loss;return captured.loss},output:(label,n)=>{captured.velocity=n;return 'valid';}};
 vm.runInNewContext(update+';update()',ctx);return {result,captured};
}
const base={q:1,d:.5,w:NaN,h:NaN,rough:.00018,atmos:101.325,temp:20,rh:0,v:10,limit:1,aspect:4};
test('round check uses diameter, ignores rectangular dimensions, and uses round pressure model',()=>{
 const {captured:c,result}=check(base);assert.equal(result.innerHTML,'valid');assert.equal(c.rect,false);
 assert.ok(Math.abs(c.velocity-5.092958178940651)<1e-12);assert.ok(Math.abs(c.area-Math.PI*.25**2)<1e-12);
 assert.equal(c.loss,E.pressure(1,.5,false,.00018,E.airProperties(101.325,20,0)).loss);
});
test('round check rejects missing/zero diameter and flow',()=>{for(const values of [{d:0},{d:NaN},{q:0}])assert.match(check({...base,...values}).result.innerHTML,/error/);});
