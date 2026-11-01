import * as E from './engine.js';
import {translations} from './locales.js';
const $=s=>document.querySelector(s);
const isNative=!!window.Capacitor?.isNativePlatform?.();
document.body.classList.toggle('native-app',isNative);
const icons={duct:'<path d="M4 7h16M4 17h16M8 4v6M16 14v6"/>',convert:'<path d="M4 8h15l-4-4M20 16H5l4 4"/>',outlets:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 8h8M8 12h8M8 16h8"/>',settings:'<path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',about:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',check:'<path d="m5 12 4 4L19 6"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>'};
const icon=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[n]}</svg>`;
const keys={duct:'Duct Size',convert:'Convert',outlets:'Outlet sizing',settings:'Settings',about:'About'};
let stored={};try{stored=JSON.parse(localStorage.getItem('duct-checker-v502-preferences')||'{}')}catch{}
const state={page:'duct',lang:translations[stored.lang]?stored.lang:'en',unit:stored.unit==='US'?'US':'SI',dark:!!stored.dark,material:0,series:'legacy',preset:'standard',terminalPreset:0,selectedOutlet:null,selectedDuct:null,mode:'select',method:'area',direction:'forward',type:'diffuser',values:{q:1,w:.6,h:.4,d:.95,v:10,tq:.3,tv:2.5,count:4,ratio:.6,limit:1,aspect:4,rough:.00018,atmos:101.325,temp:20,rh:0,outletAspect:10}};
const kinds={q:'flow',w:'dimension',h:'dimension',d:'dimension',v:'velocity',tq:'flow',tv:'velocity',count:'count',ratio:'ratio',limit:'pressure',aspect:'count',rough:'roughness',atmos:'atmos',temp:'temperature',rh:'ratio',outletAspect:'count'};
const materials=[['Galvanized steel',.00018],['Concrete',.003],['Fiberglass',.0009],['Seamless pipe',.00003],['PVC',.00003],['Stainless steel',.00009],['Reference roughness 0.15 mm',.00015],['FabricAir Combi Eco 80',null]];
const terminals=[['Custom',.6,2.5],['VHS',.75,2.5],['HS',.75,2],['OAG',.35,2],['EAG',.35,2.5],['RAG',.5,2],['SEG',.35,7],['Smoke',.8,9],['Door',.6,1]];
const t=key=>translations[state.lang]?.[key]||translations.en[key]||key;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(n,d=3)=>new Intl.NumberFormat(state.lang,{maximumFractionDigits:d}).format(n);
const unit=k=>E.units[state.unit][k][0];
const val=(n,k)=>n/E.units[state.unit][k][1];
const display=(n,k,d=3)=>`${num(val(n,k),d)} <small>${unit(k)}</small>`;
function save(){try{localStorage.setItem('duct-checker-v502-preferences',JSON.stringify({lang:state.lang,unit:state.unit,dark:state.dark}))}catch{}}
function segment(name,options,selected){return `<div class="segment" role="group" aria-label="${escape(t(name))}">${options.map(([v,key])=>`<button data-${name}="${v}" class="${selected===v?'selected':''}" aria-pressed="${selected===v}">${escape(t(key))}</button>`).join('')}</div>`;}
function field(key,label){const kind=kinds[key],v=val(state.values[key],kind);return `<div class="field"><label for="${key}">${escape(t(label))}</label><div class="input-wrap"><input id="${key}" data-field="${key}" inputmode="${key==='count'?'numeric':'decimal'}" type="text" autocomplete="off" value="${Number.isFinite(v)?new Intl.NumberFormat(state.lang,{maximumFractionDigits:6,useGrouping:false}).format(v):''}" aria-describedby="${key}-error ${key}-unit"><span id="${key}-unit">${unit(kind)}</span></div><span class="field-error" id="${key}-error"></span></div>`;}
function note(key){return `<div class="helper">${icon('about')}<p>${escape(t(key))}</p></div>`;}
function resultShell(){return '<section class="result" id="result" aria-live="polite" aria-atomic="true"></section>';}
function formTop(){return `<div class="form-top"><h2>${t('Inputs')}</h2><button id="reset">${t('Reset example')}</button></div>`;}
function calculateButton(){return `<button class="primary" id="calculate">${t('Calculate')}</button>`;}
const airModel=()=>E.airProperties(state.values.atmos,state.values.temp,state.values.rh*100);
function pressureDisplay(q,d,rect=false){if(materials[state.material][1]===null)return '—';try{return display(E.pressure(q,d,rect,state.values.rough,airModel()).loss,'pressure')}catch(e){return `<span title="${escape(t(e.message))}">—</span>`;}}
function row(label,value){return `<div><dt>${escape(t(label))}</dt><dd>${value}</dd></div>`;}
function output(title,value,kind,caption,rows){return `<div class="result-label">${escape(t(title))}${icon('check')}</div><div class="big-result">${display(value,kind)}</div><div class="result-caption">${escape(t(caption))}</div><dl>${rows}</dl>`;}
function ductControls(){return `<details class="design-controls"><summary>${t('Design preset')} · ${state.preset==='standard'?'10 m/s · 1 Pa/m':t('Custom')}</summary><div class="sizing-profile"><label for="design-preset">${t('Design preset')}</label><select id="design-preset"><option value="standard" ${state.preset==='standard'?'selected':''}>${t('Standard low velocity')}</option><option value="high" ${state.preset==='high'?'selected':''}>${t('High velocity')}</option><option value="custom" ${state.preset==='custom'?'selected':''}>${t('Custom')}</option></select><label for="diameter-series">${t('Diameter series')}</label><select id="diameter-series"><option value="legacy" ${state.series==='legacy'?'selected':''}>Bước đường kính 25 mm</option><option value="en1506" ${state.series==='en1506'?'selected':''}>EN 1506 · Lindab</option></select></div><div class="fields">${field('v','Target velocity')}${field('limit','Maximum friction')}${field('aspect','Maximum aspect ratio')}${field('rough','Absolute roughness')}${field('atmos','Atmospheric pressure')}${field('temp','Air temperature')}${field('rh','Relative humidity')}</div><div class="material-picker"><label for="material">${t('Material')}</label><select id="material">${materials.map(([n],i)=>`<option value="${i}" ${state.material===i?'selected':''}>${t(n)}</option>`).join('')}</select></div><p class="details">${t('Air conditions range')}</p></details>`;}
function selectionPage(){return `<p class="intro">${t('Check your duct. Find the right size.')}</p>${segment('mode',[['select','Select sizes'],['check','Check size'],['size','Size by velocity']],state.mode)}<div class="flow-selection-grid"><section class="flow-options">${formTop()}${field('q','Airflow')}<div id="candidates"></div></section><div class="selected-properties">${resultShell()}</div></div><details class="details"><summary>${t('Calculation assumptions')}</summary><p>${t('Configured air model')}</p><p>${t('Design selection guidance')}</p></details>${ductControls()}`;}
function render(){
 document.documentElement.lang=state.lang;document.body.classList.toggle('dark',state.dark);
 $('#nav').innerHTML=Object.entries(keys).map(([id,key])=>`<button data-page="${id}" class="${state.page===id?'active':''}" ${state.page===id?'aria-current="page"':''}>${icon(id)}<span>${escape(t(key))}</span></button>`).join('');
 $('#page-title').textContent=t(keys[state.page]);
 $('#context').textContent=t('Air distribution tools');$('#review-label').textContent=t('Interactive preview');
 $('#unit-toggle').innerHTML=`${state.unit} <span>⇄</span> ${state.unit==='SI'?'US':'SI'}`;
 $('#unit-toggle').setAttribute('aria-label',t('Units')+': '+state.unit);
 $('#settings-shortcut').innerHTML=icon('settings');$('#settings-shortcut').setAttribute('aria-label',t('Settings'));
 $('#footer-note').textContent=t('Local calculation · No data uploaded');
 $('#outside-note').textContent=isNative?'':t('Web review version. iOS build and device testing are separate.');
 const page=$('#page');
 if(state.page==='duct'){
  page.innerHTML=state.mode==='select'?selectionPage():`<p class="intro">${t('Check your duct. Find the right size.')}</p>${segment('mode',[['select','Select sizes'],['check','Check size'],['size','Size by velocity']],state.mode)}${state.mode==='select'?`<div class="sizing-profile"><label for="design-preset">${t('Design preset')}</label><select id="design-preset"><option value="standard" ${state.preset==='standard'?'selected':''}>${t('Standard low velocity')}</option><option value="high" ${state.preset==='high'?'selected':''}>${t('High velocity')}</option><option value="custom" ${state.preset==='custom'?'selected':''}>${t('Custom')}</option></select><label for="diameter-series">${t('Diameter series')}</label><select id="diameter-series"><option value="legacy" ${state.series==='legacy'?'selected':''}>Bước đường kính 25 mm</option><option value="en1506" ${state.series==='en1506'?'selected':''}>EN 1506 · Lindab</option></select></div>`:''}<div class="calc-grid ${state.page==='duct'&&state.mode==='select'?'selection-layout':''}"><section>${formTop()}<div class="fields">${field('q','Airflow')}${state.mode==='select'?'':field('w','Width')}${field(state.mode==='check'?'h':'v',state.mode==='check'?'Height':'Target velocity')}${state.mode==='select'?field('limit','Maximum friction')+field('aspect','Maximum aspect ratio'):''}</div>${calculateButton()}</section><div>${state.mode==='select'?'<div id="candidates"></div>':''}${resultShell()}</div></div>${note(state.mode==='size'?'Unrounded size note':'Duct note')}<details class="details"><summary>${t('Calculation assumptions')}</summary><p>${t('Configured air model')}</p><p class="equation">A = a × b &nbsp; · &nbsp; v = Q / A</p></details>`;
 }else if(state.page==='convert'){
  page.innerHTML=`<p class="intro">${t('Two methods. Two different engineering purposes.')}</p>${segment('method',[['area','Equal area'],['friction','Equal friction']],state.method)}<div class="select-wrap"><label for="direction">${t('Direction')}</label><select id="direction"><option value="forward" ${state.direction==='forward'?'selected':''}>${t('Rectangle to round')}</option><option value="reverse" ${state.direction==='reverse'?'selected':''}>${t('Round to rectangle')}</option></select></div><div class="calc-grid"><section>${formTop()}<div class="fields">${field('q','Airflow')}${field('w',state.direction==='reverse'?'Fixed width':'Width')}${state.direction==='forward'?field('h','Height'):field('d','Diameter')}</div>${calculateButton()}</section>${resultShell()}</div>${note(state.method==='area'?'Area explanation':'Friction explanation')}<div id="comparison" class="table-scroll"></div><details class="details"><summary>${t('Calculation assumptions')}</summary><p>${t('Configured air model')}</p><p class="equation">${state.method==='area'?'D = √(4ab / π)':'Dₑ = 1.30 (ab)⁰·⁶²⁵ / (a + b)⁰·²⁵'}</p></details>`;
 }else if(state.page==='outlets'){
  page.innerHTML=`<p class="intro">${t('A starting point for air outlet selection.')}</p><div class="select-wrap"><label for="terminal-preset">${t('Outlet preset')}</label><select id="terminal-preset">${terminals.map(([n],i)=>`<option value="${i}" ${state.terminalPreset===i?'selected':''}>${t(n)}</option>`).join('')}</select></div><details class="design-controls"><summary>${t('Outlet settings')}</summary><div class="fields">${field('count','Quantity')}${field('tv','Free-area velocity')}${field('ratio','Free-area ratio')}${field('outletAspect','Maximum aspect ratio')}</div></details><div class="flow-selection-grid"><section class="flow-options">${formTop()}${field('tq','Total airflow')}<div id="candidates"></div></section><div class="selected-properties">${resultShell()}</div></div>${note('Terminal limitation')}<details class="details"><summary>${t('Calculation assumptions')}</summary><p class="equation">A = Q / (N × v × φ)</p><p>${t('Outlet grid note')}</p></details>`;
 }else if(state.page==='settings'){
  page.innerHTML=`<p class="intro">${t('Make it work your way.')}</p><div class="setting-group"><div class="setting-row"><div><h3>${t('Language')}</h3><p>${t('Choose the interface language')}</p></div><select id="language" aria-label="${t('Language')}">${[['en','English'],['vi','Tiếng Việt'],['zh-Hans','中文'],['ja','日本語'],['th','ไทย']].map(([id,label])=>`<option value="${id}" ${state.lang===id?'selected':''}>${label}</option>`).join('')}</select></div><div class="setting-row"><div><h3>${t('Units')}</h3><p>${t('Unit preservation')}</p></div>${segment('units',[['SI','SI'],['US','US']],state.unit)}</div><div class="setting-row"><div><h3>${t('Appearance')}</h3><p>${t('Soft surfaces, clear results.')}</p></div>${segment('appearance',[['light','Light'],['dark','Dark']],state.dark?'dark':'light')}</div></div>${note('Settings note')}`;
 }else{
  page.innerHTML=`<div class="about"><img class="about-logo" src="assets/ductlogo.png" alt="Duct Checker Pro"><h2>Duct Checker Pro</h2><p>Version 5.3.0</p><div class="setting-group"><div class="setting-row"><div><p>${t('Developer')}</p><img class="company-logo" src="assets/siscom.png" alt="SISCOM"><h3>Siscom Technical Trading Joint Stock Company</h3><a href="https://siscom.vn" target="_blank" rel="noopener noreferrer">siscom.vn</a></div></div></div><section class="engineering-basis"><h3>${t('Engineering basis title')}</h3>${t('Engineering basis text').split('\n\n').map(p=>`<p>${escape(p)}</p>`).join('')}</section></div>`;
 }
 if(state.page==='duct'&&state.mode!=='select')page.insertAdjacentHTML('beforeend',ductControls());
 bind();update();
}
function parseSetting(raw){const clean=raw.trim().replace(',','.');return /^-?(\d+(\.\d*)?|\.\d+)$/.test(clean)?Number(clean):NaN;}
function validField(key,x){if(!Number.isFinite(x))return false;if(key==='temp')return x>=-40&&x<=100;if(key==='rh')return x>=0&&x<=1;if(key==='rough')return x>=0;if(['aspect','outletAspect'].includes(key))return x>=1;return x>0&&(key!=='count'||Number.isInteger(x))&&(key!=='ratio'||x<=1);}
function update(){
 if(!$('#result'))return;
 if(state.page==='duct'&&materials[state.material][1]===null){
  if($('#candidates'))$('#candidates').innerHTML='';
  $('#result').innerHTML=`<h2>FabricAir Combi Eco 80</h2><p>${t('Fabric material data')}</p><dl>${row('Fabric type','Polyester')+row('Fabric weight','275 ±7% g/m²')+row('Fabric thickness','0.45 mm')+row('Fabric permeability','40 ±5% m³/m²/h · 120 Pa')}</dl><p class="details">${t('Fabric calculation pending')}</p><a href="https://www.fabricair.com/wp-content/uploads/downloads/fabric/combi-eco-80-en.pdf" target="_blank" rel="noopener noreferrer">${t('Manufacturer datasheet')}</a>`;
  return;
 }

 const s=state.values;
 document.querySelectorAll('[data-field]').forEach(el=>{const key=el.dataset.field;const valid=validField(key,s[key]);el.setAttribute('aria-invalid',String(!valid));$('#'+key+'-error').textContent=valid?'':t(['rough','atmos','temp','rh','aspect','outletAspect'].includes(key)?'Invalid setting':key==='ratio'?'Ratio must be between 0 and 100%':key==='count'?'Enter a whole number':'Enter a positive number');});
 try{
 if(state.page==='duct'){
  if(!['rough','atmos','temp','rh','v','limit','aspect'].every(k=>validField(k,s[k])))throw Error('Check all inputs');airModel();
  if(state.mode==='select'){renderSelection();return;}
  E.positive(s.q,s.w);const h=state.mode!=='check'?E.sizeHeight(s.q,s.v,s.w):s.h,a=E.area(s.w,h),v=s.q/a,d=E.diameter(s.w,h,'friction');E.positive(v);
  $('#result').innerHTML=output(state.mode==='size'?'Required height':'Air velocity',state.mode==='size'?h:v,state.mode==='size'?'dimension':'velocity',state.mode==='size'?'Unrounded result':'Calculated from your inputs',
   (state.mode==='size'?row('Air velocity',display(v,'velocity')):'')+row('Cross-sectional area',display(a,'area'))+row('Dynamic pressure',`${num(.5*airModel().rho*v*v)} <small>Pa</small>`)+row('Friction loss',pressureDisplay(s.q,d,true))+row('Equal-friction diameter',display(d,'dimension')));


  try{E.pressure(s.q,d,true,s.rough,airModel())}catch(e){$('#result').innerHTML+=`<p class="error">${t(e.message)}</p>`;}
 }else if(state.page==='convert'){
  E.positive(s.q,s.w);let h,d;if(state.direction==='forward'){h=s.h;d=E.diameter(s.w,h,state.method);}else{d=s.d;h=E.height(d,s.w,state.method);}
  const ar=E.area(s.w,h),ac=E.roundArea(d),de=E.diameter(s.w,h,'friction');
  $('#result').innerHTML=output(state.direction==='forward'?'Round diameter':'Required height',state.direction==='forward'?d:h,'dimension',state.method==='area'?'Equal area':'Equal friction',row('Cross-sectional area',display(state.direction==='forward'?ac:ar,'area'))+row('Air velocity',display(s.q/(state.direction==='forward'?ac:ar),'velocity')));
  $('#comparison').innerHTML=`<table class="comparison"><caption>${t('Compare both ducts')}</caption><thead><tr><th>${t('Property')}</th><th>${t('Rectangular duct')}</th><th>${t('Round duct')}</th></tr></thead><tbody><tr><td>${t('Cross-sectional area')}</td><td>${display(ar,'area')}</td><td>${display(ac,'area')}</td></tr><tr><td>${t('Air velocity')}</td><td>${display(s.q/ar,'velocity')}</td><td>${display(s.q/ac,'velocity')}</td></tr><tr><td>${t('Friction loss')}</td><td>${pressureDisplay(s.q,de,true)}</td><td>${pressureDisplay(s.q,d)}</td></tr></tbody></table>`;
  const errors=new Set();for(const [d0,rect] of [[de,true],[d,false]]){try{E.pressure(s.q,d0,rect,s.rough,airModel())}catch(e){errors.add(e.message);}}
  for(const err of errors)$('#comparison').innerHTML+=`<p class="details">${t(err)}</p>`;
 }else{
  renderOutletSelection();
 }
 }catch(e){$('#result').innerHTML=`<div class="result-label">${t('Results')}</div><p class="error">${escape(t(e.message))}</p><p class="result-caption">${t('Enter valid values to calculate.')}</p>`;if($('#comparison'))$('#comparison').innerHTML='';if($('#candidates'))$('#candidates').innerHTML='';}
}
function renderSelection(){
 const s=state.values,options=E.designSelection(s.q,s.v,s.limit,s.aspect,s.rough,state.series,airModel());
 const selected=options.find(r=>r.id===state.selectedDuct)||options.find(r=>r.kind==='Nominal diameter')||options[0];state.selectedDuct=selected?.id||null;
 const label=r=>r.shape==='round'?`Ø ${display(r.w,'dimension')}`:`${num(val(r.w,'dimension'))} × ${display(r.h,'dimension')}`;
 $('#candidates').innerHTML=`<div class="candidate-heading"><h2>${t('Suggested sizes')}</h2><span>${options.length}</span></div><div class="candidate-columns"><span>${t('Size / type')}</span><span>${t('Air velocity')}</span><span>${t('Friction loss')}</span></div><div class="candidate-list" role="group" aria-label="${t('Suggested sizes')}">${options.map(r=>`<button class="candidate ${r.id===state.selectedDuct?'chosen':''}" aria-pressed="${r.id===state.selectedDuct}" data-option="${r.id}"><span>${label(r)}<small class="option-kind">${t(r.kind)}${!r.pass?' · '+t('Exceeds limit'):''}</small></span><span>${display(r.v,'velocity')}</span><span>${display(r.loss,'pressure')}</span></button>`).join('')}</div><p class="details">${t(options.length?'Design selection guidance':'No sizes found')}</p>`;
 if(!selected){$('#result').innerHTML=`<p>${t('No sizes found')}</p>`;return;}
 function showOption(selected){
 state.selectedDuct=selected.id;
 document.querySelectorAll('[data-option]').forEach(b=>{const active=b.dataset.option===selected.id;b.classList.toggle('chosen',active);b.setAttribute('aria-pressed',String(active));});
 $('#result').innerHTML=`<div class="result-label">${t('Selected duct')}</div><h2 class="selected-size">${label(selected)}</h2><p class="${selected.pass?'pass-note':'error'}">${t(selected.pass?'Within entered limits':'Exceeds limit')}</p><dl>${row('Air velocity',display(selected.v,'velocity'))+row('Friction loss',display(selected.loss,'pressure'))+row('Cross-sectional area',display(selected.a,'area'))+row('Aspect ratio',num(selected.aspect,2))+row('Air density',`${num(airModel().rho,4)} <small>kg/m³</small>`)+row('Dynamic pressure',`${num(.5*airModel().rho*selected.v**2)} <small>Pa</small>`)+row('Equal-friction diameter',display(selected.de,'dimension'))+row('Equivalent velocity',display(s.q/E.roundArea(selected.de),'velocity'))}</dl>`;
 }
 showOption(selected);
 document.querySelectorAll('[data-option]').forEach(b=>{const show=()=>showOption(options.find(r=>r.id===b.dataset.option));b.onmouseenter=show;b.onfocus=show;b.onclick=show;});
}
function renderOutletSelection(){
 const s=state.values,{required,step,options}=E.outletOptions(s.tq,s.count,s.tv,s.ratio,s.outletAspect);
 const label=r=>r.shape==='round'?`Ø ${display(r.w,'dimension')}`:`${num(val(r.w,'dimension'))} × ${display(r.h,'dimension')}`;
 $('#candidates').innerHTML=`<div class="candidate-heading"><h2>${t('Suggested sizes')}</h2><span>${options.length}</span></div><div class="candidate-list" role="group" aria-label="${t('Suggested sizes')}">${options.map(r=>`<button class="candidate" data-outlet="${r.id}" aria-pressed="false"><span>${label(r)}<small class="option-kind">${t(r.shape==='round'?'Round outlet':'Rectangular outlet')}</small></span></button>`).join('')}</div>`;
 if(!options.length){state.selectedOutlet=null;$('#result').innerHTML=`<p>${t('No sizes found')}</p>`;return;}
 function show(r){state.selectedOutlet=r.id;document.querySelectorAll('[data-outlet]').forEach(b=>{const active=b.dataset.outlet===r.id;b.classList.toggle('chosen',active);b.setAttribute('aria-pressed',String(active));});
 $('#result').innerHTML=`<div class="result-label">${t('Selected outlet')}</div><h2 class="selected-size">${label(r)}</h2><p class="result-caption">${t('Per outlet')}</p><dl>${row('Airflow per outlet',display(r.per,'flow'))+row('Free-area ratio',display(s.ratio,'ratio'))+row('Actual free-area velocity',display(r.velocity,'velocity'))+row('Selected face area',display(r.gross,'area'))+row('Free area per outlet',display(r.free,'area'))+row('Required face area',display(required.gross,'area'))+row('Capacity at target velocity',display(r.capacity,'flow'))}</dl>`;
 }
 show(options.find(r=>r.id===state.selectedOutlet)||options[0]);
 document.querySelectorAll('[data-outlet]').forEach(b=>{const showRow=()=>show(options.find(r=>r.id===b.dataset.outlet));b.onmouseenter=showRow;b.onfocus=showRow;b.onclick=showRow;});
}
function bind(){
 if($('#design-preset'))$('#design-preset').onchange=e=>{state.preset=e.target.value;if(state.preset!=='custom'){state.values.v=state.preset==='high'?15:10;state.values.limit=state.preset==='high'?3:1;state.values.aspect=4;state.material=0;state.values.rough=materials[0][1];}state.selectedDuct=null;render();};
 if($('#diameter-series'))$('#diameter-series').onchange=e=>{state.series=e.target.value;state.selectedDuct=null;update();};
 if($('#material'))$('#material').onchange=e=>{state.material=Number(e.target.value);if(materials[state.material][1]!==null){state.values.rough=materials[state.material][1];if($('#rough'))$('#rough').value=String(state.values.rough*1000);}state.preset='custom';if($('#design-preset'))$('#design-preset').value='custom';update();};
 if($('#terminal-preset'))$('#terminal-preset').onchange=e=>{state.terminalPreset=Number(e.target.value);const p=terminals[state.terminalPreset];state.values.ratio=p[1];state.values.tv=p[2];state.values.outletAspect=10;render();};
 document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{state.page=b.dataset.page;render();});
 document.querySelectorAll('[data-field]').forEach(el=>{el.oninput=()=>{if(['v','limit','aspect','rough','atmos','temp','rh'].includes(el.dataset.field)&&$('#design-preset')){state.preset='custom';$('#design-preset').value='custom';}if(state.page==='outlets'&&['tv','ratio'].includes(el.dataset.field)){state.terminalPreset=0;$('#terminal-preset').value='0';}state.values[el.dataset.field]=(['rough','temp','rh'].includes(el.dataset.field)?parseSetting(el.value):E.parseInput(el.value))*E.units[state.unit][kinds[el.dataset.field]][1];update();};el.onkeydown=e=>{if(e.key==='Enter'){$('#calculate')?.click();el.blur();}};});
 for(const name of ['mode','method','type'])document.querySelectorAll(`[data-${name}]`).forEach(b=>b.onclick=()=>{state[name]=b.dataset[name];render();});
 document.querySelectorAll('[data-units]').forEach(b=>b.onclick=()=>{state.unit=b.dataset.units;save();render();});
 document.querySelectorAll('[data-appearance]').forEach(b=>b.onclick=()=>{state.dark=b.dataset.appearance==='dark';save();render();});
 if($('#direction'))$('#direction').onchange=e=>{state.direction=e.target.value;render();};
 if($('#language'))$('#language').onchange=e=>{state.lang=e.target.value;save();render();};
 if($('#reset'))$('#reset').onclick=()=>{if(state.page==='outlets'){state.terminalPreset=1;state.selectedOutlet=null;}if(state.page==='duct'){state.preset='standard';state.material=0;state.selectedDuct=null;}Object.assign(state.values,state.page==='outlets'?{tq:2000/3600,tv:2.5,count:1,ratio:.75,outletAspect:10}:state.page==='convert'?{q:1,w:1.3,h:.55,d:.9541311620975605}:{q:8000/3600,w:.6,h:.4,v:10,limit:1,aspect:4,rough:.00018,atmos:101.325,temp:20,rh:0});render();};
 if($('#calculate'))$('#calculate').onclick=()=>{update();const invalid=document.querySelector('[aria-invalid="true"]');if(invalid)invalid.focus();else{$('#calculate').innerHTML=t('Calculated')+icon('check');}};
}
$('#unit-toggle').onclick=()=>{state.unit=state.unit==='SI'?'US':'SI';save();render();};
$('#settings-shortcut').onclick=()=>{state.page='settings';render();};
$('#theme').onclick=()=>{state.dark=!state.dark;save();render();};
render();
