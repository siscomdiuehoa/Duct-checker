import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../engine.js';
import {translations} from '../locales.js';
const near=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
test('area and equal-area independent anchor',()=>{near(E.area(1.3,.55),.715);near(E.diameter(1.3,.55),.9541311620975605);});
test('Huebscher independent anchor',()=>near(E.diameter(1.3,.55,'friction'),.9038402891565726));
test('both inverse methods and symmetry',()=>{for(const method of ['area','friction'])for(const w of [.1,.6,1.3,2])for(const h of [.1,.4,.55,1]){const d=E.diameter(w,h,method);near(E.height(d,w,method),h);near(E.diameter(h,w,method),d);}});
test('velocity sizing preserves flow',()=>{near(E.sizeHeight(1.2,5,.6),.4);});
test('Colebrook benchmark and residual',()=>{const f=E.frictionFactor(1e5,.0001);near(f,.01851386607747,1e-12);near(1/Math.sqrt(f)+2*Math.log10(.0001/3.7+2.51/(1e5*Math.sqrt(f))),0);});
test('laminar and transitional boundaries',()=>{near(E.frictionFactor(1000,0),.064);for(const r of [2300,3000,3999])assert.throws(()=>E.frictionFactor(r,0),/Transition/);assert.ok(E.frictionFactor(4000,0)>0);});
test('friction model matches equivalent round but not equal area',()=>{const d=E.diameter(1.3,.55,'friction');near(E.pressure(1,d,true).loss,E.pressure(1,d).loss);assert.ok(E.pressure(1,d).loss>E.pressure(1,E.diameter(1.3,.55)).loss);});
test('pressure rises with flow',()=>assert.ok(E.pressure(2,.5).loss>E.pressure(1,.5).loss));
test('terminal conservation',()=>{const r=E.terminal(.3,4,2.5,.6);near(r.per*4,.3);near(r.free,.03);near(r.gross,.05);near(r.side**2,.05);});
test('nonfinite and zero dimensions rejected',()=>{for(const x of [0,-1,NaN,Infinity]){assert.throws(()=>E.area(x,.5));assert.throws(()=>E.roundArea(x));assert.throws(()=>E.pressure(x,.5));}});
test('terminal count and free area ratio rejected',()=>{for(const n of [0,-1,1.2,NaN])assert.throws(()=>E.terminal(1,n,2,.6));for(const r of [0,-1,1.1,NaN])assert.throws(()=>E.terminal(1,2,2,r));});
test('input parser accepts decimals and rejects partial junk',()=>{near(E.parseInput('2,5'),2.5);near(E.parseInput(' 2.5 '),2.5);for(const s of ['', '1e5','5abc','1,2,3','-5','0','Infinity'])assert.ok(Number.isNaN(E.parseInput(s)));});
test('unit definitions and round trips',()=>{near(E.units.US.flow[1],.3048**3/60,1e-16);for(const k of ['flow','dimension','velocity','area','pressure']){const s=E.units.SI[k][1],u=E.units.US[k][1];near(((123.45*s)/u)*u/s,123.45);}});
test('all five translations have equal keys',()=>{const keys=Object.keys(translations.en).sort();for(const lang of ['vi','zh-Hans','ja','th'])assert.deepEqual(Object.keys(translations[lang]).sort(),keys);});
test('material roughness changes turbulent pressure',()=>assert.ok(E.pressure(1,.5,false,.003).loss>E.pressure(1,.5,false,.00003).loss));
test('candidate sizes meet all constraints and sort by area',()=>{const rows=E.candidates(1,5,1,4,.00018);assert.ok(rows.length>0);rows.forEach((r,i)=>{assert.ok(r.v<=5&&r.loss<=1&&r.w/r.h<=4);near(r.v*r.w*r.h,1);if(i)assert.ok(r.a>=rows[i-1].a);});assert.deepEqual(E.candidates(1000,1,.01,1),[]);assert.throws(()=>E.candidates(1,5,1,.5));});
test('selection provides round and multiple rectangular choices within limits',()=>{const rows=E.selectionOptions(6000/3600,10,1,4);assert.equal(rows.filter(r=>r.shape==='round').length,3);assert.ok(rows.filter(r=>r.shape==='rect').length>8);assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);for(const r of rows){assert.ok(r.v<=10&&r.loss<=1&&r.aspect<=4);near(r.v*r.a,6000/3600);near(r.loss,E.pressure(6000/3600,r.de,r.shape==='rect',.00018).loss);}assert.deepEqual(E.selectionOptions(1000,1,.01,1),[]);assert.throws(()=>E.selectionOptions(1,5,1,.5));});
test('8000 m3/h reference image sizing sequence and explicit square exceedance',()=>{const r=E.designSelection(8000/3600,10,1,4);assert.equal(Math.round(r[0].w*1000),603);near(r[1].w,.625);assert.deepEqual(r.filter(x=>x.shape==='rect').map(x=>[Math.round(x.w*1000),Math.round(x.h*1000)]),[[550,550],[600,550],[650,500],[700,450],[750,450],[800,400],[850,400],[900,400],[950,350],[1000,350],[1050,350],[1100,350],[1150,300],[1200,300]]);assert.equal(r[2].pass,false);near(r[2].v,8000/3600/.3025);assert.ok(r[2].loss>1);});
test('nominal series and design limits affect the solution',()=>{near(E.designSelection(8000/3600,10,1,4,.00015,'en1506')[1].w,.630);const a=E.designSelection(6000/3600,10,1,4),b=E.designSelection(8000/3600,5,1,4);assert.ok(a[0].w<.603);assert.ok(b[0].w>.603);for(const r of b.filter(r=>r.kind!=='Square option'))assert.ok(r.v<=5.00000001&&r.loss<=1.00000001);assert.deepEqual(E.designSelection(1000,1,.01,4),[]);assert.throws(()=>E.designSelection(1,10,1,.5));});
test('outlet options match 2000 m3/h VHS example and conserve flow',()=>{const r=E.outletOptions(2000/3600,1,2.5,.75);near(r.required.gross,.2962962962962963);assert.deepEqual(r.options.slice(0,5).map(x=>[Math.round(x.w*1000),Math.round(x.h*1000)]),[[650,650],[550,550],[600,500],[650,500],[700,450]]);assert.ok(r.options.some(x=>Math.round(x.w*1000)===2000&&Math.round(x.h*1000)===150));for(const x of r.options){assert.ok(x.velocity<=2.5+1e-9);near(x.velocity*x.free,2000/3600);near(x.free,x.gross*.75);}});
test('outlet quantity, grid boundaries and invalid values',()=>{const single=E.outletOptions(1,1,2,.5),multi=E.outletOptions(1,4,2,.5);near(multi.required.gross,single.required.gross/4);assert.equal(single.step,.1);assert.equal(multi.step,.05);assert.equal(E.outletOptions(100,1,1,.5).options.length,0);for(const n of [0,1.5,NaN])assert.throws(()=>E.outletOptions(1,n,2,.75));assert.throws(()=>E.outletOptions(1,1,2,1.1));});
test('configured air matches recovered dry density and viscosity anchors',()=>{const a=E.airProperties(101.325,20,0);near(a.rho,353.18295/293.15);near(a.mu,.0000182876);near(E.airProperties(50.6625,20,0).rho,a.rho/2);assert.ok(E.airProperties(101.325,20,100).rho<a.rho);assert.ok(E.airProperties(101.325,-20,0).rho>a.rho);for(const args of [[0,20,0],[101.325,-41,0],[101.325,101,0],[101.325,20,101],[.01,100,100]])assert.throws(()=>E.airProperties(...args));});
test('air settings propagate into pressure and diameter selection',()=>{const cold=E.airProperties(101.325,0,0),hot=E.airProperties(101.325,60,0);assert.ok(E.pressure(1,.5,false,.00018,cold).loss>E.pressure(1,.5,false,.00018,hot).loss);assert.ok(E.designSelection(2,10,1,4,.00018,'legacy',cold)[0].w>E.designSelection(2,10,1,4,.00018,'legacy',hot)[0].w);});
test('outlet aspect constraint filters all rectangular candidates',()=>{const r=E.outletOptions(2000/3600,1,2.5,.75,4);assert.ok(r.options.length>2);for(const x of r.options.filter(x=>x.shape==='rect'))assert.ok(x.w/x.h<=4+1e-9);assert.ok(E.outletOptions(2000/3600,1,2.5,.75,10).options.length>r.options.length);assert.throws(()=>E.outletOptions(1,1,2,.75,.9));});

test('SI/US independent engineering conversion anchors',()=>{
 near(12*E.units.US.dimension[1],.3048);
 near(1000*E.units.US.flow[1],.4719474432);
 near(1000*E.units.US.velocity[1],5.08);
 near(10*E.units.US.area[1],.9290304);
 near(E.units.US.pressure[1],8.172208333333334,1e-10);
 for(const k of Object.keys(E.units.SI))for(const n of [.001,1,123.45,8000]){
  const physical=n*E.units.SI[k][1];
  near((physical/E.units.US[k][1])*E.units.US[k][1],physical,1e-8);
 }
});
test('same physical duct and outlet inputs yield identical SI/US engineering results',()=>{
 const roundtrip=(n,k)=>(n/E.units.US[k][1])*E.units.US[k][1];
 const q=8000/3600,w=.6,h=.4;
 const de=E.diameter(w,h,'friction');
 const usDe=E.diameter(roundtrip(w,'dimension'),roundtrip(h,'dimension'),'friction');
 near(usDe,de);near(roundtrip(q,'flow')/(roundtrip(w,'dimension')*roundtrip(h,'dimension')),q/(w*h));
 near(E.pressure(roundtrip(q,'flow'),usDe,true).loss,E.pressure(q,de,true).loss);
 const si=E.outletOptions(2000/3600,2,2.5,.75,4);
 const us=E.outletOptions(roundtrip(2000/3600,'flow'),2,roundtrip(2.5,'velocity'),.75,4);
 near(us.required.gross,si.required.gross);assert.deepEqual(us.options.map(x=>[x.shape,x.w,x.h]),si.options.map(x=>[x.shape,x.w,x.h]));
});

