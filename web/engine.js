export function positive(...values){if(values.some(v=>!Number.isFinite(v)||v<=0))throw Error('Check all inputs');}
export function area(w,h){positive(w,h);const a=w*h;positive(a);return a;}
export function roundArea(d){positive(d);const a=Math.PI*(d/2)**2;positive(a);return a;}
export function diameter(w,h,method='area'){const a=area(w,h);const d=method==='area'?2*Math.sqrt(a/Math.PI):1.3*a**.625/(w+h)**.25;positive(d);return d;}
export function height(d,w,method='area'){
 positive(d,w);if(method==='area'){const h=roundArea(d)/w;positive(h);return h;}
 let lo=0,hi=Math.max(d,w);
 for(let i=0;i<100&&diameter(w,hi,'friction')<d;i++)hi*=2;
 if(diameter(w,hi,'friction')<d)throw Error('Outside the calculation model');
 for(let i=0;i<100;i++){const mid=(lo+hi)/2;if(diameter(w,mid,'friction')<d)lo=mid;else hi=mid;}
 return (lo+hi)/2;
}
export function sizeHeight(q,v,w){positive(q,v,w);const h=q/v/w;positive(h);return h;}
export function frictionFactor(re,rr){
 positive(re);if(!Number.isFinite(rr)||rr<0||rr>.05)throw Error('Outside the calculation model');
 if(re<2300)return 64/re;if(re<4000)throw Error('Transition flow: pressure unavailable');
 let x=7;for(let i=0;i<100;i++){const n=-2*Math.log10(rr/3.7+2.51*x/re);if(Math.abs(n-x)<1e-12)return 1/n**2;x=n;}
 throw Error('Outside the calculation model');
}
export function pressure(q,d,rectangular=false,roughness=.00009,air={rho:1.204,mu:.0000181}){
 positive(q,d,air.rho,air.mu);const v=q/roundArea(d),re=air.rho*v*d/air.mu,f=frictionFactor(re,roughness/d);
 if(rectangular&&re<4000)throw Error('Outside the calculation model');
 const loss=f*air.rho*v*v/(2*d);positive(loss);return {loss,re,f};
}
export function terminal(q,count,v,ratio){
 positive(q,count,v,ratio);if(!Number.isInteger(count)||ratio>1)throw Error('Check all inputs');
 const per=q/count,free=per/v,gross=free/ratio;positive(per,free,gross);return{per,free,gross,side:Math.sqrt(gross)};
}
export const units={
 SI:{dimension:['mm',.001],flow:['m³/h',1/3600],velocity:['m/s',1],area:['m²',1],pressure:['Pa/m',1],ratio:['%',.01],count:['',1]},
 US:{dimension:['in',.0254],flow:['cfm',.0004719474432],velocity:['fpm',.00508],area:['ft²',.09290304],pressure:['in.w.g./100 ft',249.08891/30.48],ratio:['%',.01],count:['',1]}
};
export function parseInput(raw){const clean=raw.trim().replace(',','.');if(!/^(\d+(\.\d*)?|\.\d+)$/.test(clean))return NaN;const n=Number(clean);return Number.isFinite(n)&&n>0?n:NaN;}

// Independent candidate sizing, not a reproduction of the legacy solver.
export function candidates(q,vmax,maxLoss,aspect,roughness=.00009,fixedWidth=null){
 positive(q,vmax,maxLoss,aspect);if(aspect<1||!Number.isFinite(roughness)||roughness<0)throw Error('Check all inputs');
 const result=[];
 for(let w=100;w<=2000;w+=50)for(let h=100;h<=w;h+=50){
  if(fixedWidth!==null&&Math.abs(w/1000-fixedWidth)>1e-8)continue;
  if(w/h>aspect)continue;const a=w*h/1e6,v=q/a;if(v>vmax)continue;
  try{const loss=pressure(q,diameter(w/1000,h/1000,'friction'),true,roughness).loss;
   if(loss<=maxLoss)result.push({w:w/1000,h:h/1000,v,loss,a});}catch{}
 }
 return result.sort((a,b)=>a.a-b.a||a.w/a.h-b.w/b.h).slice(0,8);
}

export function selectionOptions(q,vmax,maxLoss,aspect,roughness=.00018){
 positive(q,vmax,maxLoss,aspect);if(aspect<1||!Number.isFinite(roughness)||roughness<0)throw Error('Check all inputs');
 const rows=[];
 function option(w,h,shape){const a=shape==='round'?roundArea(w):area(w,h),v=q/a,de=shape==='round'?w:diameter(w,h,'friction');
  if(v>vmax)return null;try{const loss=pressure(q,de,shape!=='round',roughness).loss;
   if(loss>maxLoss)return null;return {id:shape+':'+w+':'+h,shape,w,h,a,v,de,loss,aspect:shape==='round'?1:w/h};}catch{return null;}}
 for(let mm=100;mm<=2000;mm+=50){const r=option(mm/1000,mm/1000,'round');if(r){rows.push(r);if(rows.length===3)break;}}
 for(let mm=100;mm<=2000;mm+=50){for(let hh=100;hh<=mm;hh+=50){if(mm/hh>aspect)continue;const r=option(mm/1000,hh/1000,'rect');if(r){rows.push(r);break;}}}
 return rows;
}

// Lindab EN1506 dimensional table, nominal and intermediate sizes (not a pressure standard).
export const en1506=[63,80,100,112,125,140,150,160,180,200,224,250,280,300,315,355,400,450,500,560,600,630,710,800,900,1000,1120,1250,1400,1500,1600];
export function designSelection(q,vmax,maxLoss,aspect,roughness=.00015,series='legacy',air={rho:1.204,mu:.0000181}){
 positive(q,vmax,maxLoss,aspect);if(aspect<1||!Number.isFinite(roughness)||roughness<0)throw Error('Check all inputs');
 const props=(w,h,shape,kind)=>{const a=shape==='round'?roundArea(w):area(w,h),v=q/a,de=shape==='round'?w:diameter(w,h,'friction'),loss=pressure(q,de,shape==='rect',roughness,air).loss;
 return {id:kind+':'+w+':'+h,kind,shape,w,h,a,v,de,loss,aspect:shape==='round'?1:w/h,pass:v<=vmax*(1+1e-9)&&loss<=maxLoss*(1+1e-9)};};
 // Solve continuous round diameter against both independent limits.
 let lo=.01,hi=2;
 const meets=d=>{try{return q/roundArea(d)<=vmax&&pressure(q,d,false,roughness,air).loss<=maxLoss;}catch{return false;}};
 if(!meets(hi))return [];
 for(let i=0;i<80;i++){const mid=(lo+hi)/2;if(meets(mid))hi=mid;else lo=mid;}
 const required=hi,rows=[props(required,required,'round','Calculated diameter')];
 const nominal=series==='en1506'?en1506.find(mm=>mm/1000>=required)/1000:Math.ceil(required/.025)*.025;
 if(Number.isFinite(nominal)&&nominal<=2)rows.push(props(nominal,nominal,'round','Nominal diameter'));
 const square=Math.ceil(.9*required/.05)*.05;
 if(square<=2)rows.push(props(square,square,'rect','Square option'));
 for(let wm=Math.round(square*1000)+50;wm<=2000;wm+=50){
  for(let hm=100;hm<=wm;hm+=50){if(wm/hm>aspect)continue;
   try{const r=props(wm/1000,hm/1000,'rect','Rectangular duct');if(r.pass){rows.push(r);break;}}catch{}}
  // Stop at aspect-ratio boundary after reaching the minimum feasible height.
  const last=rows.at(-1);if(last.shape==='rect'&&last.w===wm/1000&&last.aspect>=aspect-1e-9)break;
 }
 return rows;
}

// Face-area sizing only; catalogue neck/frame sizes are not inferred.
export function outletOptions(q,count,v,ratio,maxAspect=Infinity){
 if(!(maxAspect>=1))throw Error('Check all inputs');
 const required=terminal(q,count,v,ratio),step=required.side>=1?.1:.05,max=2;
 const snap=x=>Math.ceil(x/step-1e-10)*step,options=[];
 function add(w,h,shape){if(shape!=='round'&&w/h>maxAspect+1e-10)return;const gross=shape==='round'?roundArea(w):area(w,h),free=gross*ratio;
  options.push({id:shape+':'+Math.round(w*1000)+':'+Math.round(h*1000),shape,w,h,gross,free,per:required.per,velocity:required.per/free,capacity:free*v});}
 const d=snap(2*Math.sqrt(required.gross/Math.PI)),side=snap(required.side);
 if(d<=max+1e-9)add(d,d,'round');if(side<=max+1e-9)add(side,side,'rect');
 for(let wm=Math.round((side+step)*1000);wm<=2000;wm+=Math.round(step*1000)){
  const w=wm/1000,h=snap(required.gross/w);if(h>=step&&h<=w&&h<=max)add(w,h,'rect');
 }
 return {required,step,options};
}

// CalDensity constants recovered from legacy binary; limited to -40..100 °C.
export function airProperties(p=101.325,t=20,rh=0){
 if(!Number.isFinite(p)||p<=0||!Number.isFinite(t)||t< -40||t>100||!Number.isFinite(rh)||rh<0||rh>100)throw Error('Invalid air conditions');
 const T=t+273.15,P=p*10;
 const ps=.01*Math.exp(-6098.9385/T+21.2409642-.02711193*T+.00001673952*T*T+2.433502*Math.log(T));
 const pv=ps*rh/100;if(pv>=P)throw Error('Invalid air conditions');
 const rho=(353.18295/T)*(P/1013.25)*(1-.378*pv/P),mu=.00001859+.0000000432*(t-27);
 positive(rho,mu);return {rho,mu};
}
for(const system of Object.values(units))Object.assign(system,{roughness:['mm',.001],atmos:['kPa',1],temperature:['°C',1]});
