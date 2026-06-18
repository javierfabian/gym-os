// =====================================================
//  GYM OS v2.1 — Lógica principal
//  Archivo: app.js
//  Conectar en index.html con:
//    <script src="config.js"></script>  ← primero
//    <script src="app.js"></script>     ← después
// =====================================================

// ═══════════════════════════════════
//  GYM OS v2.1 — Script
// ═══════════════════════════════════

// DB
const DK='gymos_data', LK='gymos_license';
let DB=loadDB(), LOG=DB.log||[];
function loadDB(){ try{return JSON.parse(localStorage.getItem(DK))||freshDB();}catch{return freshDB();} }
function freshDB(){ return{gymName:'GYM OS',logo:null,clients:[],mems:[],progs:[],nutris:[],avances:[],clases:[],pagos:[],gastos:[],log:[]}; }
function save(){ DB.log=LOG; localStorage.setItem(DK,JSON.stringify(DB)); }

// HELPERS
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const fmt=n=>'$'+Number(n||0).toLocaleString('es-AR');
const hoy=()=>new Date().toISOString().slice(0,10);
const addD=(s,d)=>{ const dt=new Date(s); dt.setDate(dt.getDate()+d); return dt.toISOString().slice(0,10); };
const diffD=(a,b)=>Math.ceil((new Date(b)-new Date(a))/864e5);
const e=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const pill=(t,c)=>`<span class="pill ${c}">${t}</span>`;
function estadoM(v){ if(!v) return pill('Sin membresía','pgr'); const d=diffD(hoy(),v); if(d<0) return pill('Vencido','pr'); if(d<=7) return pill(`Vence ${d}d`,'po'); return pill('Activo','pg'); }
function log(msg){ LOG.unshift({msg,date:new Date().toLocaleString('es-AR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}); if(LOG.length>30) LOG.pop(); }

// LOGO
document.getElementById('logoDrop').addEventListener('click',()=>document.getElementById('logoInput').click());
document.getElementById('logoInput').addEventListener('change',e=>{ const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=ev=>{setLogo(ev.target.result);DB.logo=ev.target.result;save();}; r.readAsDataURL(f); });
function setLogo(s){ document.getElementById('logoImg').src=s; document.getElementById('logoImg').style.display='block'; document.getElementById('logoPH').style.display='none'; }
if(DB.logo) setLogo(DB.logo);
function editGymName(){ const n=prompt('Nombre del gimnasio:',DB.gymName); if(n){DB.gymName=n.trim()||'GYM OS';document.getElementById('gymName').textContent=DB.gymName;save();} }
document.getElementById('gymName').textContent=DB.gymName||'GYM OS';
document.getElementById('topDate').textContent=new Date().toLocaleDateString('es-AR',{weekday:'short',day:'numeric',month:'short'});

// NAV
let curPage='dashboard';
function goPage(p){
  document.querySelectorAll('.nav-item').forEach(i=>i.classList.toggle('active',i.dataset.page===p));
  document.querySelectorAll('.bn-item').forEach(i=>i.classList.toggle('active',i.dataset.page===p));
  document.querySelectorAll('.page').forEach(pg=>pg.classList.remove('active'));
  const pg=document.getElementById('page-'+p); if(pg) pg.classList.add('active');
  const sp=document.querySelector(`.nav-item[data-page="${p}"] span`);
  document.getElementById('pageTitle').textContent=sp?sp.textContent:p;
  curPage=p; renderPage(p); closeSB();
}
document.querySelectorAll('.nav-item').forEach(i=>i.addEventListener('click',()=>goPage(i.dataset.page)));
document.querySelectorAll('.bn-item').forEach(i=>i.addEventListener('click',()=>goPage(i.dataset.page)));
const renders={dashboard:renderDash,clientes:renderClients,membresias:renderMems,programas:renderProgs,nutricion:renderNutri,avances:renderAvPage,agenda:renderAgenda,pagos:renderPagos,finanzas:renderFin,gastos:renderGastos};
function renderPage(p){ if(renders[p]) renders[p](); }

// MODAL
function openModal(id,pre){
  // populate selects
  const sm=document.getElementById('cf_mem'); if(sm) sm.innerHTML='<option value="">Sin membresía</option>'+DB.mems.map(m=>`<option value="${m.id}">${e(m.tipo)} — ${fmt(m.precio)}</option>`).join('');
  const sp=document.getElementById('cf_prog'); if(sp) sp.innerHTML='<option value="">Ninguno</option>'+DB.progs.map(p=>`<option value="${p.id}">${e(p.nombre)}</option>`).join('');
  const sn=document.getElementById('cf_nutri'); if(sn) sn.innerHTML='<option value="">Ninguno</option>'+DB.nutris.map(n=>`<option value="${n.id}">${e(n.nombre)}</option>`).join('');
  const sac=document.getElementById('av_c'); if(sac) sac.innerHTML='<option value="">Seleccionar...</option>'+DB.clients.map(c=>`<option value="${c.id}">${e(c.nombre)}</option>`).join('');
  const spc=document.getElementById('pg_c'); if(spc) spc.innerHTML='<option value="">Seleccionar...</option>'+DB.clients.map(c=>`<option value="${c.id}">${e(c.nombre)}</option>`).join('');
  // default dates
  ['av_fecha','pg_fecha','gf_fecha','cl_fecha','cf_inicio'].forEach(i=>{const el=document.getElementById(i);if(el&&!el.value)el.value=hoy();});
  document.getElementById(id).classList.add('open');
  if(pre) setTimeout(pre,10);
}
function closeModal(id){
  document.getElementById(id).classList.remove('open');
  ['cf_id','pf_id','nf_id'].forEach(i=>{const el=document.getElementById(i);if(el)el.value='';});
}
document.querySelectorAll('.modal-overlay').forEach(m=>m.addEventListener('click',ev=>{if(ev.target===m)m.classList.remove('open');}));

// AVATAR
let avData=null;
const avDrop=document.getElementById('avDrop'), avInput=document.getElementById('avInput'), avImg=document.getElementById('avImg'), avPH=document.getElementById('avPH');
avDrop.addEventListener('click',()=>avInput.click());
avInput.addEventListener('change',ev=>{const f=ev.target.files[0];if(!f)return;const r=new FileReader();r.onload=x=>{avImg.src=x.target.result;avImg.style.display='block';avPH.style.display='none';avData=x.target.result;};r.readAsDataURL(f);});
function resetAv(){avImg.style.display='none';avPH.style.display='flex';avData=null;avInput.value='';}

// ═══ SAVE FUNCTIONS ═══

function abrirNuevoSocio(){ document.getElementById('mSocioTitle').textContent='Nuevo Socio'; resetAv(); openModal('mSocio'); }

function saveSocio(){
  const id=document.getElementById('cf_id').value;
  const nombre=document.getElementById('cf_nombre').value.trim(); if(!nombre){alert('Nombre requerido.');return;}
  const memId=document.getElementById('cf_mem').value;
  const mem=DB.mems.find(m=>m.id===memId);
  const inicio=document.getElementById('cf_inicio').value||hoy();
  const data={
    nombre, dni:document.getElementById('cf_dni').value, email:document.getElementById('cf_email').value,
    tel:document.getElementById('cf_tel').value, nac:document.getElementById('cf_nac').value,
    sexo:document.getElementById('cf_sexo').value, memId, memNombre:mem?.tipo||'',
    inicio, vence:mem?addD(inicio,mem.dias):null,
    obj:document.getElementById('cf_obj').value, niv:document.getElementById('cf_niv').value,
    peso:document.getElementById('cf_peso').value, altura:document.getElementById('cf_altura').value,
    prog:document.getElementById('cf_prog').value, nutri:document.getElementById('cf_nutri').value,
    salud:document.getElementById('cf_salud').value, emerg:document.getElementById('cf_emerg').value,
    notas:document.getElementById('cf_notas').value
  };
  if(avData) data.av=avData;
  if(id){
    const idx=DB.clients.findIndex(c=>c.id===id);
    if(idx>-1){if(!data.av) data.av=DB.clients[idx].av; DB.clients[idx]={...DB.clients[idx],...data}; log(`Editado: ${nombre}`);}
  } else {
    const c={id:uid(),creado:hoy(),...data}; DB.clients.push(c);
    if(c.peso) DB.avances.push({id:uid(),cId:c.id,fecha:hoy(),peso:c.peso,grasa:'',musc:'',imc:'',cin:'',cad:'',pecho:'',hom:'',bic:'',muslo:'',pant:'',pres:'',obs:'Medición inicial'});
    log(`Nuevo socio: ${nombre}`);
  }
  save(); resetAv();
  ['cf_id','cf_nombre','cf_dni','cf_email','cf_tel','cf_nac','cf_peso','cf_altura','cf_salud','cf_emerg','cf_notas'].forEach(i=>{const el=document.getElementById(i);if(el)el.value='';});
  closeModal('mSocio'); renderPage(curPage);
}

function editSocio(id){
  const c=DB.clients.find(x=>x.id===id); if(!c) return;
  openModal('mSocio',()=>{
    document.getElementById('mSocioTitle').textContent='Editar Socio';
    document.getElementById('cf_id').value=c.id;
    ['nombre','dni','email','tel','nac','sexo','inicio','salud','emerg','notas','peso','altura'].forEach(k=>{const el=document.getElementById('cf_'+k);if(el)el.value=c[k]||'';});
    document.getElementById('cf_obj').value=c.obj||'Bajar peso';
    document.getElementById('cf_niv').value=c.niv||'Principiante';
    document.getElementById('cf_mem').value=c.memId||'';
    document.getElementById('cf_prog').value=c.prog||'';
    document.getElementById('cf_nutri').value=c.nutri||'';
    if(c.av){avImg.src=c.av;avImg.style.display='block';avPH.style.display='none';avData=c.av;}
  });
}

function saveMembresia(){
  const id=document.getElementById('mf_id').value;
  const tipo=document.getElementById('mf_tipo').value.trim(); if(!tipo){alert('Nombre requerido.');return;}
  const data={tipo,precio:parseFloat(document.getElementById('mf_precio').value)||0,dias:parseInt(document.getElementById('mf_dias').value)||30,desc:document.getElementById('mf_desc').value};
  if(id){const idx=DB.mems.findIndex(m=>m.id===id);if(idx>-1){DB.mems[idx]={...DB.mems[idx],...data};log(`Membresía editada: ${tipo}`);}}
  else{DB.mems.push({id:uid(),...data});log(`Nueva membresía: ${tipo}`);}
  save(); cancelMem(); renderMems();
}
function editMem(id){
  const m=DB.mems.find(x=>x.id===id); if(!m) return;
  document.getElementById('mf_id').value=m.id;
  document.getElementById('mf_tipo').value=m.tipo;
  document.getElementById('mf_precio').value=m.precio;
  document.getElementById('mf_dias').value=m.dias;
  document.getElementById('mf_desc').value=m.desc||'';
  document.getElementById('memFormTitle').textContent='Editar plan';
  document.getElementById('mf_cancel').style.display='';
}
function cancelMem(){
  document.getElementById('mf_id').value='';
  ['mf_tipo','mf_precio','mf_dias','mf_desc'].forEach(i=>document.getElementById(i).value='');
  document.getElementById('memFormTitle').textContent='Nuevo plan';
  document.getElementById('mf_cancel').style.display='none';
}
function delMem(id){ if(!confirm('¿Eliminar plan?'))return; DB.mems=DB.mems.filter(m=>m.id!==id); save(); renderMems(); }

function savePrograma(){
  const id=document.getElementById('pf_id').value;
  const nombre=document.getElementById('pf_nombre').value.trim(); if(!nombre)return;
  const data={nombre,nivel:document.getElementById('pf_nivel').value,dias:document.getElementById('pf_dias').value,dur:document.getElementById('pf_duracion').value,obj:document.getElementById('pf_obj').value,mod:document.getElementById('pf_mod').value,desc:document.getElementById('pf_desc').value};
  if(id){const idx=DB.progs.findIndex(p=>p.id===id);if(idx>-1){DB.progs[idx]={...DB.progs[idx],...data};log(`Programa editado: ${nombre}`);}}
  else{DB.progs.push({id:uid(),...data});log(`Nuevo programa: ${nombre}`);}
  save(); closeModal('mPrograma'); renderProgs();
}
function editProg(id){
  const p=DB.progs.find(x=>x.id===id); if(!p) return;
  openModal('mPrograma',()=>{
    document.getElementById('mProgTitle').textContent='Editar Programa';
    document.getElementById('pf_id').value=p.id;
    document.getElementById('pf_nombre').value=p.nombre||'';
    document.getElementById('pf_nivel').value=p.nivel||'Principiante';
    document.getElementById('pf_dias').value=p.dias||3;
    document.getElementById('pf_duracion').value=p.dur||60;
    document.getElementById('pf_obj').value=p.obj||'Bajar peso';
    document.getElementById('pf_mod').value=p.mod||'Pesas / Sala';
    document.getElementById('pf_desc').value=p.desc||'';
  });
}
function delProg(id){ if(!confirm('¿Eliminar programa?'))return; DB.progs=DB.progs.filter(p=>p.id!==id); save(); renderProgs(); }

function saveNutri(){
  const id=document.getElementById('nf_id').value;
  const nombre=document.getElementById('nf_nombre').value.trim(); if(!nombre)return;
  const data={nombre,obj:document.getElementById('nf_obj').value,cal:document.getElementById('nf_cal').value,prot:document.getElementById('nf_prot').value,carb:document.getElementById('nf_carb').value,gras:document.getElementById('nf_gras').value,com:document.getElementById('nf_com').value,rest:document.getElementById('nf_rest').value,desc:document.getElementById('nf_desc').value};
  if(id){const idx=DB.nutris.findIndex(n=>n.id===id);if(idx>-1){DB.nutris[idx]={...DB.nutris[idx],...data};log(`Nutri editado: ${nombre}`);}}
  else{DB.nutris.push({id:uid(),...data});log(`Nuevo plan nutri: ${nombre}`);}
  save(); closeModal('mNutri'); renderNutri();
}
function editNutri(id){
  const n=DB.nutris.find(x=>x.id===id); if(!n) return;
  openModal('mNutri',()=>{
    document.getElementById('mNutriTitle').textContent='Editar Plan';
    document.getElementById('nf_id').value=n.id;
    ['nombre','cal','prot','carb','gras','com','rest','desc'].forEach(k=>{const el=document.getElementById('nf_'+k);if(el)el.value=n[k]||'';});
    document.getElementById('nf_obj').value=n.obj||'Bajar peso';
  });
}
function delNutri(id){ if(!confirm('¿Eliminar plan?'))return; DB.nutris=DB.nutris.filter(n=>n.id!==id); save(); renderNutri(); }

function saveAvance(){
  const cId=document.getElementById('av_c').value; if(!cId){alert('Seleccioná un socio.');return;}
  const a={id:uid(),cId,fecha:document.getElementById('av_fecha').value||hoy(),peso:document.getElementById('av_peso').value,grasa:document.getElementById('av_grasa').value,musc:document.getElementById('av_musc').value,imc:document.getElementById('av_imc').value,cin:document.getElementById('av_cin').value,cad:document.getElementById('av_cad').value,pecho:document.getElementById('av_pecho').value,hom:document.getElementById('av_hom').value,bic:document.getElementById('av_bic').value,muslo:document.getElementById('av_muslo').value,pant:document.getElementById('av_pant').value,pres:document.getElementById('av_pres').value,obs:document.getElementById('av_obs').value};
  DB.avances.push(a);
  log(`Medición: ${DB.clients.find(x=>x.id===cId)?.nombre||''}`);
  save(); closeModal('mAvance');
  document.getElementById('avSel').value=cId; loadAvances();
}
function delAv(id){ if(!confirm('¿Eliminar medición?'))return; DB.avances=DB.avances.filter(a=>a.id!==id); save(); loadAvances(); }

function saveClase(){
  const nombre=document.getElementById('cl_nombre').value.trim(); if(!nombre)return;
  const fecha=document.getElementById('cl_fecha').value; if(!fecha)return;
  DB.clases.push({id:uid(),nombre,inst:document.getElementById('cl_inst').value,fecha,hora:document.getElementById('cl_hora').value,dur:document.getElementById('cl_dur').value,cap:document.getElementById('cl_cap').value,sala:document.getElementById('cl_sala').value,tipo:document.getElementById('cl_tipo').value,mod:document.getElementById('cl_mod').value,niv:document.getElementById('cl_niv').value,ins:0});
  save(); closeModal('mClase'); renderAgenda();
}
function delClase(id){ DB.clases=DB.clases.filter(c=>c.id!==id); save(); if(selDay) renderSlots(selDay); renderAgenda(); }

function savePago(){
  const cId=document.getElementById('pg_c').value; if(!cId){alert('Seleccioná un socio.');return;}
  const monto=parseFloat(document.getElementById('pg_monto').value)||0; if(!monto){alert('Ingresá un monto.');return;}
  DB.pagos.push({id:uid(),cId,fecha:document.getElementById('pg_fecha').value||hoy(),con:document.getElementById('pg_con').value,monto,met:document.getElementById('pg_met').value,est:document.getElementById('pg_est').value,obs:document.getElementById('pg_obs').value});
  log(`Pago: ${DB.clients.find(x=>x.id===cId)?.nombre||''} — ${fmt(monto)}`);
  save(); closeModal('mPago'); renderPage(curPage);
}
function delPago(id){ if(!confirm('¿Eliminar pago?'))return; DB.pagos=DB.pagos.filter(p=>p.id!==id); save(); renderPagos(); }

function saveGasto(){
  const monto=parseFloat(document.getElementById('gf_monto').value)||0; if(!monto){alert('Ingresá un monto.');return;}
  DB.gastos.push({id:uid(),fecha:document.getElementById('gf_fecha').value||hoy(),cat:document.getElementById('gf_cat').value,desc:document.getElementById('gf_desc').value,monto,prov:document.getElementById('gf_prov').value,comp:document.getElementById('gf_comp').value});
  log(`Gasto: ${document.getElementById('gf_cat').value} — ${fmt(monto)}`);
  save(); closeModal('mGasto'); renderPage(curPage);
}
function delGasto(id){ if(!confirm('¿Eliminar gasto?'))return; DB.gastos=DB.gastos.filter(g=>g.id!==id); save(); renderGastos(); }

// ═══ RENDERS ═══

function renderDash(){
  const mes=hoy().slice(0,7);
  document.getElementById('kpiSocios').textContent=DB.clients.filter(c=>c.vence&&diffD(hoy(),c.vence)>=0).length;
  const ingM=DB.pagos.filter(p=>p.fecha.slice(0,7)===mes&&p.est==='Pagado').reduce((a,p)=>a+p.monto,0);
  const gasM=DB.gastos.filter(g=>g.fecha.slice(0,7)===mes).reduce((a,g)=>a+g.monto,0);
  document.getElementById('kpiIngresos').textContent=fmt(ingM);
  document.getElementById('kpiGastos').textContent=fmt(gasM);
  document.getElementById('kpiGanancia').textContent=fmt(ingM-gasM);
  document.getElementById('kpiVencen').textContent=DB.clients.filter(c=>{if(!c.vence)return false;const d=diffD(hoy(),c.vence);return d>=0&&d<=7;}).length;
  document.getElementById('kpiClases').textContent=DB.clases.filter(c=>c.fecha===hoy()).length;
  // bar chart semanas
  const weeks=[];
  for(let i=5;i>=0;i--){const s=new Date();s.setDate(s.getDate()-i*7);const e=new Date(s);e.setDate(e.getDate()+6);const vs=s.toISOString().slice(0,10),ve=e.toISOString().slice(0,10);weeks.push({l:`S${6-i}`,v:DB.pagos.filter(p=>p.fecha>=vs&&p.fecha<=ve&&p.est==='Pagado').reduce((a,p)=>a+p.monto,0)});}
  const mx=Math.max(...weeks.map(w=>w.v),1);
  document.getElementById('barChart').innerHTML=weeks.map(w=>`<div class="bar-col"><div class="bar" style="height:${Math.max(6,Math.round(w.v/mx*100))}%"></div></div>`).join('');
  document.getElementById('barLabels').innerHTML=weeks.map(w=>`<div style="flex:1;text-align:center;font-size:9px;color:var(--muted)">${w.l}<br><span style="color:var(--text);font-size:10px">${fmt(w.v)}</span></div>`).join('');
  // membresías pie
  const mp={}; DB.clients.forEach(c=>{if(c.memNombre)mp[c.memNombre]=(mp[c.memNombre]||0)+1;});
  const tot=Object.values(mp).reduce((a,b)=>a+b,0)||1;
  document.getElementById('memPie').innerHTML=Object.entries(mp).length?Object.entries(mp).map(([k,v])=>`<div style="display:flex;align-items:center;gap:8px;font-size:13px"><span style="width:9px;height:9px;border-radius:50%;background:var(--accent);flex-shrink:0"></span><span style="flex:1">${e(k)}</span><span style="font-weight:600">${v}</span><div class="pbar" style="width:76px"><div class="pfill" style="width:${Math.round(v/tot*100)}%"></div></div></div>`).join(''):'<div style="color:var(--muted);font-size:13px">Sin membresías configuradas.</div>';
  // activity
  const items=LOG.length?LOG:[{msg:'Bienvenido a GYM OS',date:'Empezá cargando socios'}];
  document.getElementById('actFeed').innerHTML=items.slice(0,10).map(a=>`<div class="tl-item"><div class="tl-dot"><svg viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><circle cx="12" cy="12" r="5"/></svg></div><div><div class="tl-title">${e(a.msg)}</div><div class="tl-date">${a.date}</div></div></div>`).join('');
}

function renderClients(){
  // update mem filter dinamically
  const fm=document.getElementById('filterMem'); const fc=fm.value;
  fm.innerHTML='<option value="">Todas las membresías</option>'+[...new Set(DB.clients.map(c=>c.memNombre).filter(Boolean))].map(t=>`<option value="${e(t)}">${e(t)}</option>`).join('');
  if(fc) fm.value=fc;
  const q=(document.getElementById('searchClient').value||'').toLowerCase();
  const fme=fm.value, fes=document.getElementById('filterEst').value;
  const list=DB.clients.filter(c=>{
    if(q&&!c.nombre.toLowerCase().includes(q)&&!(c.dni||'').includes(q)) return false;
    if(fme&&c.memNombre!==fme) return false;
    if(fes){
      if(fes==='Sin membresía') return !c.vence;
      if(!c.vence) return false;
      const d=diffD(hoy(),c.vence);
      if(fes==='Activo'&&d<0) return false;
      if(fes==='Vencido'&&d>=0) return false;
    }
    return true;
  });
  const nMap={}; DB.nutris.forEach(n=>nMap[n.id]=n);
  document.getElementById('clientsTable').innerHTML=list.length?list.map(c=>`<tr>
    <td><div style="width:36px;height:36px;border-radius:50%;overflow:hidden;background:var(--border);display:flex;align-items:center;justify-content:center">${c.av?`<img src="${c.av}" style="width:100%;height:100%;object-fit:cover">`:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>'}</div></td>
    <td><div style="font-weight:600">${e(c.nombre)}</div><div style="font-size:11px;color:var(--muted)">${e(c.email||'')}</div></td>
    <td style="font-size:12px;color:var(--muted)">${e(c.dni||'—')}</td>
    <td>${c.memNombre?pill(e(c.memNombre),'pb'):'—'}</td>
    <td style="font-size:12px;color:var(--muted)">${c.vence||'—'}</td>
    <td>${estadoM(c.vence)}</td>
    <td style="font-size:12px">${e(c.obj||'—')}</td>
    <td><div style="display:flex;gap:4px"><button class="btn btn-ghost" style="padding:3px 8px;font-size:11px" onclick="viewSocio('${c.id}')">Ver</button><button class="btn btn-blue" style="padding:3px 8px;font-size:11px" onclick="editSocio('${c.id}')">✎</button><button class="btn btn-danger" style="padding:3px 8px;font-size:11px" onclick="delSocio('${c.id}')">✕</button></div></td>
  </tr>`).join(''):'<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--muted)">Sin socios. ¡Agregá el primero!</td></tr>';
}
function delSocio(id){ if(!confirm('¿Eliminar socio y sus datos?'))return; const c=DB.clients.find(x=>x.id===id); DB.clients=DB.clients.filter(x=>x.id!==id); DB.avances=DB.avances.filter(a=>a.cId!==id); DB.pagos=DB.pagos.filter(p=>p.cId!==id); log(`Eliminado: ${c?.nombre||''}`); save(); renderClients(); }

function viewSocio(id){
  const c=DB.clients.find(x=>x.id===id); if(!c) return;
  const avs=DB.avances.filter(a=>a.cId===id).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const last=avs[0];
  const pags=DB.pagos.filter(p=>p.cId===id).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const prog=DB.progs.find(p=>p.id===c.prog);
  const nutri=DB.nutris.find(n=>n.id===c.nutri);
  const total=pags.filter(p=>p.est==='Pagado').reduce((a,p)=>a+p.monto,0);
  const isPrem=getLic()==='premium';
  document.getElementById('mDetalleTitle').textContent=e(c.nombre);
  document.getElementById('detalleContent').innerHTML=`
    <div style="display:flex;gap:18px;align-items:flex-start;flex-wrap:wrap">
      <div style="width:88px;height:88px;border-radius:50%;overflow:hidden;border:3px solid var(--accent);flex-shrink:0">${c.av?`<img src="${c.av}" style="width:100%;height:100%;object-fit:cover">`:'<div style="width:100%;height:100%;background:var(--border);display:flex;align-items:center;justify-content:center"><svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>'}</div>
      <div style="flex:1">
        <div style="font-family:var(--fd);font-size:24px;font-weight:800">${e(c.nombre)}</div>
        <div style="color:var(--muted);font-size:12px">${c.dni?'DNI: '+c.dni+' ·':''} ${e(c.email||'')} ${c.tel?'· '+c.tel:''}</div>
        <div style="color:var(--muted);font-size:12px">${c.nac?'Nac: '+c.nac:''} ${c.sexo?'· '+c.sexo:''} ${c.salud?'· ⚠ '+e(c.salud):''}</div>
        <div style="margin-top:7px;display:flex;gap:5px;flex-wrap:wrap">${c.memNombre?pill(e(c.memNombre),'pb'):''}${estadoM(c.vence)}${c.obj?pill(e(c.obj),'pgr'):''}${c.niv?pill(e(c.niv),'pg'):''}</div>
      </div>
      <div style="text-align:right"><div style="font-size:10px;color:var(--muted)">Total pagado</div><div style="font-family:var(--fd);font-size:28px;font-weight:800;color:var(--accent)">${fmt(total)}</div>${c.vence?`<div style="font-size:11px;color:var(--muted)">Vence: ${c.vence}</div>`:''}</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:9px;margin-top:14px">
      <div class="stat-box"><div class="sv">${last?.peso||c.peso||'—'}<span style="font-size:12px">kg</span></div><div class="sl">Peso</div></div>
      <div class="stat-box"><div class="sv">${c.altura||'—'}<span style="font-size:12px">cm</span></div><div class="sl">Altura</div></div>
      <div class="stat-box"><div class="sv">${last?.grasa||'—'}<span style="font-size:12px">%</span></div><div class="sl">Grasa</div></div>
      <div class="stat-box"><div class="sv">${last?.musc||'—'}<span style="font-size:12px">%</span></div><div class="sl">Músculo</div></div>
      <div class="stat-box"><div class="sv">${last?.cin||'—'}</div><div class="sl">Cintura</div></div>
      <div class="stat-box"><div class="sv">${avs.length}</div><div class="sl">Mediciones</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px"><div style="font-size:9px;text-transform:uppercase;color:var(--muted);margin-bottom:5px">Programa de entrenamiento</div>${prog?`<div style="font-weight:600">${e(prog.nombre)}</div><div style="font-size:12px;color:var(--muted)">${prog.nivel} · ${prog.dias}d/sem · ${prog.dur||60}min · ${prog.obj}</div>`:'<div style="color:var(--muted);font-size:13px">Sin programa</div>'}</div>
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px"><div style="font-size:9px;text-transform:uppercase;color:var(--muted);margin-bottom:5px">Plan de nutrición</div>${nutri?`<div style="font-weight:600">${e(nutri.nombre)}</div><div style="font-size:12px;color:var(--muted)">${nutri.cal} kcal · P:${nutri.prot}g C:${nutri.carb}g G:${nutri.gras}g</div>`:'<div style="color:var(--muted);font-size:13px">Sin plan</div>'}</div>
    </div>
    ${avs.length>1?`<div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px;margin-top:10px"><div style="font-size:9px;text-transform:uppercase;color:var(--muted);margin-bottom:7px">Evolución de peso</div><div style="display:flex;align-items:flex-end;gap:4px;height:55px">${avs.slice(0,8).reverse().map(a=>{const mx=Math.max(...avs.map(x=>parseFloat(x.peso)||0),1);const h=Math.max(8,Math.round((parseFloat(a.peso)||0)/mx*100));return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px"><div style="width:100%;height:${h}%;background:var(--accent);border-radius:3px 3px 0 0;min-height:4px"></div><div style="font-size:8px;color:var(--muted)">${a.peso}</div></div>`;}).join('')}</div></div>`:''}
    ${c.notas||c.emerg?`<div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px;margin-top:10px">${c.notas?`<div style="font-size:9px;text-transform:uppercase;color:var(--muted);margin-bottom:3px">Notas</div><div style="font-size:13px;margin-bottom:8px">${e(c.notas)}</div>`:''}${c.emerg?`<div style="font-size:9px;text-transform:uppercase;color:var(--muted);margin-bottom:3px">Emergencia</div><div style="font-size:13px">${e(c.emerg)}</div>`:''}</div>`:''}
    ${pags.length?`<div style="margin-top:10px"><div style="font-size:9px;text-transform:uppercase;color:var(--muted);margin-bottom:6px">Últimos pagos</div><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>${['Fecha','Concepto','Monto','Estado'].map(h=>`<th style="text-align:left;padding:5px;color:var(--muted);border-bottom:1px solid var(--border)">${h}</th>`).join('')}</tr></thead><tbody>${pags.slice(0,6).map(p=>`<tr><td style="padding:5px">${p.fecha}</td><td style="padding:5px">${e(p.con)}</td><td style="padding:5px;font-weight:700;color:var(--accent)">${fmt(p.monto)}</td><td style="padding:5px">${p.est==='Pagado'?pill('Pagado','pg'):pill(p.est,'po')}</td></tr>`).join('')}</tbody></table></div>`:''}
    <div style="display:flex;gap:7px;margin-top:14px;flex-wrap:wrap">
      <button class="btn btn-blue" onclick="editSocio('${c.id}');closeModal('mDetalle')">✎ Editar</button>
      <button class="btn btn-accent" onclick="openModal('mAvance');setTimeout(()=>document.getElementById('av_c').value='${c.id}',20)">+ Medición</button>
      <button class="btn btn-accent" onclick="openModal('mPago');setTimeout(()=>document.getElementById('pg_c').value='${c.id}',20)">+ Pago</button>
      ${isPrem?`<button class="btn btn-ghost" onclick="genPDF('${c.id}')">⬇ PDF</button>`:`<span style="font-size:11px;color:var(--muted);align-self:center">★ PDF solo en Premium</span>`}
    </div>
  `;
  openModal('mDetalle');
}

function renderMems(){
  const g=document.getElementById('memGrid');
  g.innerHTML=DB.mems.length?DB.mems.map(m=>{
    const cnt=DB.clients.filter(c=>c.memId===m.id).length;
    return `<div class="card" style="border-top:3px solid var(--accent);position:relative">
      <div style="font-family:var(--fd);font-size:20px;font-weight:800">${e(m.tipo)}</div>
      <div style="font-family:var(--fd);font-size:32px;font-weight:800;color:var(--accent)">${fmt(m.precio)}</div>
      <div style="font-size:12px;color:var(--muted)">${m.dias} días${m.desc?' · '+e(m.desc):''}</div>
      <div style="margin-top:7px;font-size:12px">${cnt} socio${cnt!==1?'s':''} activos</div>
      <div style="position:absolute;top:10px;right:10px;display:flex;gap:4px">
        <button class="btn btn-blue" style="padding:2px 7px;font-size:10px" onclick="editMem('${m.id}')">✎</button>
        <button class="btn btn-danger" style="padding:2px 7px;font-size:10px" onclick="delMem('${m.id}')">✕</button>
      </div>
    </div>`;
  }).join(''):'<div style="color:var(--muted);font-size:13px;padding:10px">Sin planes. Creá uno abajo.</div>';
}

function renderProgs(){
  const nP={'Principiante':'pg','Intermedio':'po','Avanzado':'pr'};
  document.getElementById('progsTable').innerHTML=DB.progs.length?DB.progs.map(p=>{
    const cnt=DB.clients.filter(c=>c.prog===p.id).length;
    return `<tr><td><div style="font-weight:600">${e(p.nombre)}</div>${p.desc?`<div style="font-size:11px;color:var(--muted)">${e(p.desc.slice(0,55))}</div>`:''}</td><td>${pill(p.nivel,nP[p.nivel]||'pgr')}</td><td>${p.dias}x/sem<br><span style="font-size:10px;color:var(--muted)">${p.dur||60}min</span></td><td>${e(p.obj)}</td><td>${e(p.mod||'')}</td><td>${cnt}</td><td><div style="display:flex;gap:4px"><button class="btn btn-blue" style="padding:3px 7px;font-size:11px" onclick="editProg('${p.id}')">✎</button><button class="btn btn-danger" style="padding:3px 7px;font-size:11px" onclick="delProg('${p.id}')">✕</button></div></td></tr>`;
  }).join(''):'<tr><td colspan="7" style="text-align:center;padding:28px;color:var(--muted)">Sin programas.</td></tr>';
}

function renderNutri(){
  document.getElementById('nutriTable').innerHTML=DB.nutris.length?DB.nutris.map(n=>{
    const cnt=DB.clients.filter(c=>c.nutri===n.id).length;
    return `<tr><td><div style="font-weight:600">${e(n.nombre)}</div>${n.rest?`<div style="font-size:10px;color:var(--accent3)">⚠ ${e(n.rest)}</div>`:''}</td><td>${e(n.obj)}</td><td>${n.cal?n.cal+' kcal':'—'}</td><td>${n.prot?n.prot+'g':'—'}</td><td>${n.carb?n.carb+'g':'—'}</td><td>${n.gras?n.gras+'g':'—'}</td><td>${cnt}</td><td><div style="display:flex;gap:4px"><button class="btn btn-blue" style="padding:3px 7px;font-size:11px" onclick="editNutri('${n.id}')">✎</button><button class="btn btn-danger" style="padding:3px 7px;font-size:11px" onclick="delNutri('${n.id}')">✕</button></div></td></tr>`;
  }).join(''):'<tr><td colspan="8" style="text-align:center;padding:28px;color:var(--muted)">Sin planes.</td></tr>';
}

function renderAvPage(){
  const sel=document.getElementById('avSel'), cur=sel.value;
  sel.innerHTML='<option value="">Seleccionar socio...</option>'+DB.clients.map(c=>`<option value="${c.id}">${e(c.nombre)}</option>`).join('');
  if(cur){sel.value=cur;loadAvances();}
}
function loadAvances(){
  const cId=document.getElementById('avSel').value;
  const ac=document.getElementById('avContent');
  if(!cId){ac.innerHTML='<div class="card" style="text-align:center;color:var(--muted);padding:36px">Seleccioná un socio.</div>';return;}
  const c=DB.clients.find(x=>x.id===cId);
  const avs=DB.avances.filter(a=>a.cId===cId).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const flds=[['peso','Peso (kg)'],['grasa','% Grasa'],['musc','% Músculo'],['imc','IMC'],['cin','Cintura'],['cad','Cadera'],['pecho','Pecho'],['hom','Hombros'],['bic','Bícep'],['muslo','Muslo'],['pant','Pantorrilla']];
  ac.innerHTML=`<div class="card"><div class="card-title">Medidas — ${e(c.nombre)}</div>
    ${avs.length?`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:9px;margin-bottom:18px">
      ${flds.map(([k,lb])=>{const last=avs.find(a=>a[k]);const prev=avs.slice(1).find(a=>a[k]);const df=last&&prev?(parseFloat(last[k])-parseFloat(prev[k])).toFixed(1):null;return `<div class="stat-box"><div class="sv">${last?.[k]||'—'}</div><div class="sl">${lb}</div>${df!==null?`<div style="font-size:10px;margin-top:2px;color:${parseFloat(df)<0?'var(--accent)':'var(--accent3)'}">${parseFloat(df)>0?'+':''}${df}</div>`:''}</div>`;}).join('')}
    </div>
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr>${['Fecha','Peso','%Gr','%Mus','Cintura','Cadera','Pecho','Hombros','Bícep','Muslo','Pantorr.','Obs.',''].map(h=>`<th style="text-align:left;padding:6px;color:var(--muted);border-bottom:1px solid var(--border);white-space:nowrap">${h}</th>`).join('')}</tr></thead>
    <tbody>${avs.map(a=>`<tr style="border-bottom:1px solid rgba(255,255,255,.04)"><td style="padding:5px;white-space:nowrap">${a.fecha}</td><td style="padding:5px;font-weight:600">${a.peso||'—'}</td><td style="padding:5px">${a.grasa||'—'}</td><td style="padding:5px">${a.musc||'—'}</td><td style="padding:5px">${a.cin||'—'}</td><td style="padding:5px">${a.cad||'—'}</td><td style="padding:5px">${a.pecho||'—'}</td><td style="padding:5px">${a.hom||'—'}</td><td style="padding:5px">${a.bic||'—'}</td><td style="padding:5px">${a.muslo||'—'}</td><td style="padding:5px">${a.pant||'—'}</td><td style="padding:5px;color:var(--muted)">${e((a.obs||'').slice(0,35))}</td><td style="padding:5px"><button class="btn btn-danger" style="padding:2px 6px;font-size:10px" onclick="delAv('${a.id}')">✕</button></td></tr>`).join('')}</tbody></table></div>`
    :'<div style="color:var(--muted);text-align:center;padding:28px">Sin mediciones aún.</div>'}
  </div>`;
}

// AGENDA
let calY=new Date().getFullYear(), calM=new Date().getMonth(), selDay=null;
function renderAgenda(){
  const meses=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  document.getElementById('calLabel').textContent=`${meses[calM]} ${calY}`;
  document.getElementById('calHead').innerHTML=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d=>`<div class="cal-head">${d}</div>`).join('');
  const first=new Date(calY,calM,1).getDay(), last=new Date(calY,calM+1,0).getDate(), tod=hoy();
  const cd=new Set(DB.clases.map(c=>c.fecha));
  let cells='';
  for(let i=0;i<first;i++) cells+=`<div class="cal-day empty"></div>`;
  for(let d=1;d<=last;d++){const ds=`${calY}-${String(calM+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;cells+=`<div class="cal-day${ds===tod?' today':''}${cd.has(ds)?' has-event':''}" onclick="selDay='${ds}';renderSlots('${ds}');document.getElementById('agendaTitle').textContent='Clases: '+new Date('${ds}T12:00').toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})">${d}</div>`;}
  document.getElementById('calBody').innerHTML=cells;
  if(selDay) renderSlots(selDay);
}
function calPrev(){calM--;if(calM<0){calM=11;calY--;}renderAgenda();}
function calNext(){calM++;if(calM>11){calM=0;calY++;}renderAgenda();}
function renderSlots(date){
  const clases=DB.clases.filter(c=>c.fecha===date).sort((a,b)=>a.hora.localeCompare(b.hora));
  document.getElementById('agendaSlots').innerHTML=clases.length?clases.map(c=>`<div class="slot"><div class="slot-time">${c.hora}</div><div class="slot-info"><div class="slot-name">${e(c.nombre)}</div><div class="slot-sub">${c.inst?'Prof. '+e(c.inst):''} ${c.sala?'· '+e(c.sala):''} · ${c.dur}min · ${pill(c.tipo,'pb')} ${c.niv?'· '+c.niv:''}</div></div><div style="font-size:11px;color:var(--muted);text-align:right">${c.ins||0}/${c.cap} inscriptos</div><button class="btn btn-danger" style="padding:3px 7px;font-size:11px" onclick="delClase('${c.id}')">✕</button></div>`).join(''):'<div style="color:var(--muted);font-size:13px">Sin clases. Usá "+ Agregar clase".</div>';
}

function fillMesFilter(selId, src){
  const sel=document.getElementById(selId); if(!sel)return;
  const cur=sel.value;
  const ms=new Set([hoy().slice(0,7)]); src.forEach(x=>ms.add(x.fecha.slice(0,7)));
  const lb={'01':'Ene','02':'Feb','03':'Mar','04':'Abr','05':'May','06':'Jun','07':'Jul','08':'Ago','09':'Sep','10':'Oct','11':'Nov','12':'Dic'};
  sel.innerHTML='<option value="">Todos los meses</option>'+[...ms].sort().reverse().map(m=>{const[y,mo]=m.split('-');return`<option value="${m}">${lb[mo]} ${y}</option>`;}).join('');
  if(cur) sel.value=cur;
}

function renderPagos(){
  fillMesFilter('pgMes',DB.pagos);
  const mes=hoy().slice(0,7);
  const cobM=DB.pagos.filter(p=>p.fecha.slice(0,7)===mes&&p.est==='Pagado').reduce((a,p)=>a+p.monto,0);
  const pend=DB.pagos.filter(p=>p.est==='Pendiente').reduce((a,p)=>a+p.monto,0);
  const cntM=DB.pagos.filter(p=>p.fecha.slice(0,7)===mes).length;
  document.getElementById('pgTotal').textContent=fmt(cobM);
  document.getElementById('pgPend').textContent=fmt(pend);
  document.getElementById('pgCount').textContent=cntM;
  const fm=document.getElementById('pgMes').value, fe=document.getElementById('pgEst').value;
  const list=DB.pagos.filter(p=>{if(fm&&p.fecha.slice(0,7)!==fm)return false;if(fe&&p.est!==fe)return false;return true;}).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  document.getElementById('pagosTable').innerHTML=list.length?list.map(p=>{
    const c=DB.clients.find(x=>x.id===p.cId);
    const ep=p.est==='Pagado'?pill('Pagado','pg'):p.est==='Devuelto'?pill('Devuelto','pr'):p.est==='Pendiente'?pill('Pendiente','po'):pill('Parcial','pb');
    return `<tr><td style="font-size:12px">${p.fecha}</td><td style="font-weight:500">${e(c?.nombre||'—')}</td><td style="font-size:12px">${e(p.con)}</td><td style="font-weight:700;font-family:var(--fd);font-size:17px;color:var(--accent)">${fmt(p.monto)}</td><td style="font-size:12px">${e(p.met||'')}</td><td>${ep}</td><td><button class="btn btn-danger" style="padding:3px 7px;font-size:11px" onclick="delPago('${p.id}')">✕</button></td></tr>`;
  }).join(''):'<tr><td colspan="7" style="text-align:center;padding:28px;color:var(--muted)">Sin pagos.</td></tr>';
}

function renderFin(){
  const meses=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const yr=new Date().getFullYear(); let tI=0,tG=0;
  const rows=meses.map((m,i)=>{
    const ms=`${yr}-${String(i+1).padStart(2,'0')}`;
    const ing=DB.pagos.filter(p=>p.fecha.slice(0,7)===ms&&p.est==='Pagado').reduce((a,p)=>a+p.monto,0);
    const gas=DB.gastos.filter(g=>g.fecha.slice(0,7)===ms).reduce((a,g)=>a+g.monto,0);
    tI+=ing;tG+=gas;return{m,ing,gas,gan:ing-gas};
  });
  document.getElementById('finIng').textContent=fmt(tI);
  document.getElementById('finGas').textContent=fmt(tG);
  document.getElementById('finNet').textContent=fmt(tI-tG);
  document.getElementById('finMar').textContent=tI?Math.round((tI-tG)/tI*100)+'%':'0%';
  const mx=Math.max(...rows.map(r=>Math.max(r.ing,r.gas)),1);
  document.getElementById('finChart').innerHTML=rows.map(r=>`<div class="bar-col" style="gap:2px"><div class="bar" style="height:${Math.max(4,Math.round(r.ing/mx*100))}%"></div><div class="bar blue" style="height:${Math.max(4,Math.round(r.gas/mx*100))}%"></div></div>`).join('');
  document.getElementById('finLabels').innerHTML=rows.map(r=>`<div style="flex:1;text-align:center;font-size:9px;color:var(--muted)">${r.m}</div>`).join('');
  const cur=hoy().slice(0,7);
  document.getElementById('finTable').innerHTML=rows.map((r,i)=>{
    const ms=`${yr}-${String(i+1).padStart(2,'0')}`;
    return `<tr style="${ms===cur?'background:rgba(200,241,53,.05)':''}"><td style="padding:8px 10px;font-weight:${ms===cur?700:400}">${r.m} ${yr}${ms===cur?' ◀':''}</td><td style="padding:8px 10px;color:var(--accent);font-weight:600">${fmt(r.ing)}</td><td style="padding:8px 10px;color:var(--accent3)">${fmt(r.gas)}</td><td style="padding:8px 10px;font-family:var(--fd);font-size:17px;font-weight:800;color:${r.gan>=0?'var(--accent)':'var(--accent3)'}">${fmt(r.gan)}</td><td style="padding:8px 10px;color:var(--muted)">${r.ing?Math.round(r.gan/r.ing*100)+'%':'—'}</td></tr>`;
  }).join('');
}

function renderGastos(){
  fillMesFilter('gsMes',DB.gastos);
  const mes=hoy().slice(0,7), yr=new Date().getFullYear()+'';
  document.getElementById('gsMesTot').textContent=fmt(DB.gastos.filter(g=>g.fecha.slice(0,7)===mes).reduce((a,g)=>a+g.monto,0));
  document.getElementById('gsAnioTot').textContent=fmt(DB.gastos.filter(g=>g.fecha.startsWith(yr)).reduce((a,g)=>a+g.monto,0));
  const fm=document.getElementById('gsMes').value, fc=document.getElementById('gsCat').value;
  const list=DB.gastos.filter(g=>{if(fm&&g.fecha.slice(0,7)!==fm)return false;if(fc&&g.cat!==fc)return false;return true;}).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  document.getElementById('gastosTable').innerHTML=list.length?list.map(g=>`<tr><td style="font-size:12px">${g.fecha}</td><td>${pill(e(g.cat),'pb')}</td><td><div>${e(g.desc||'—')}</div>${g.prov?`<div style="font-size:10px;color:var(--muted)">${e(g.prov)}</div>`:''}</td><td style="font-weight:700;font-family:var(--fd);font-size:17px;color:var(--accent3)">${fmt(g.monto)}</td><td><button class="btn btn-danger" style="padding:3px 7px;font-size:11px" onclick="delGasto('${g.id}')">✕</button></td></tr>`).join(''):'<tr><td colspan="5" style="text-align:center;padding:28px;color:var(--muted)">Sin gastos.</td></tr>';
}

// PDF (Premium)
function genPDF(id){
  if(getLic()!=='premium'){alert('El PDF está disponible en el Plan Premium.');return;}
  const c=DB.clients.find(x=>x.id===id); if(!c)return;
  const avs=DB.avances.filter(a=>a.cId===id).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const last=avs[0], pags=DB.pagos.filter(p=>p.cId===id).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  const prog=DB.progs.find(p=>p.id===c.prog), nutri=DB.nutris.find(n=>n.id===c.nutri);
  const total=pags.filter(p=>p.est==='Pagado').reduce((a,p)=>a+p.monto,0);
  const gym=DB.gymName||'GYM OS';
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Informe — ${c.nombre}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;color:#111;padding:28px;font-size:13px;}
  h1{font-size:26px;font-weight:900;margin-bottom:3px;}h2{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#666;border-bottom:2px solid #c8f135;padding-bottom:3px;margin:18px 0 9px;}
  .header{display:flex;justify-content:space-between;margin-bottom:20px;padding-bottom:14px;border-bottom:3px solid #111;}
  .gym{text-align:right;font-size:11px;color:#666;}.gym strong{font-size:17px;font-weight:900;color:#111;display:block;}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:10px;}
  .box{background:#f5f5f5;border-radius:6px;padding:10px;}.box .v{font-size:20px;font-weight:800;}.box .l{font-size:9px;text-transform:uppercase;letter-spacing:.7px;color:#666;}
  table{width:100%;border-collapse:collapse;margin-top:7px;}th{background:#111;color:#c8f135;padding:6px 9px;text-align:left;font-size:10px;text-transform:uppercase;}td{padding:6px 9px;border-bottom:1px solid #eee;}
  .pg{background:#e8fde0;color:#1a7a00;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;}
  .po{background:#fff3e0;color:#b35a00;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;}
  .foot{margin-top:26px;font-size:10px;color:#999;text-align:center;border-top:1px solid #eee;padding-top:8px;}
  @media print{body{padding:15px;}}</style></head><body>
  <div class="header"><div><h1>${c.nombre}</h1><div style="color:#444;margin-top:3px">${c.dni?'DNI: '+c.dni+' · ':''} ${c.email||''} ${c.tel?'· '+c.tel:''}</div><div style="color:#444">${c.nac?'Nac: '+c.nac:''} ${c.sexo?'· '+c.sexo:''}</div>${c.salud?`<div style="color:#c00;margin-top:3px">⚠ ${c.salud}</div>`:''}<div style="margin-top:7px"><strong>Objetivo:</strong> ${c.obj||'—'} &nbsp; <strong>Nivel:</strong> ${c.niv||'—'}</div></div><div class="gym"><strong>${gym}</strong>Informe: ${new Date().toLocaleDateString('es-AR')}<br>Socio desde: ${c.creado||c.inicio||'—'}</div></div>
  <h2>Membresía</h2><div class="grid"><div class="box"><div class="v">${c.memNombre||'—'}</div><div class="l">Plan</div></div><div class="box"><div class="v">${c.inicio||'—'}</div><div class="l">Inicio</div></div><div class="box"><div class="v">${c.vence||'—'}</div><div class="l">Vencimiento</div></div></div>
  <h2>Medidas corporales actuales</h2><div class="grid"><div class="box"><div class="v">${last?.peso||c.peso||'—'} kg</div><div class="l">Peso</div></div><div class="box"><div class="v">${c.altura||'—'} cm</div><div class="l">Altura</div></div><div class="box"><div class="v">${last?.grasa||'—'} %</div><div class="l">% Grasa</div></div><div class="box"><div class="v">${last?.musc||'—'} %</div><div class="l">% Músculo</div></div><div class="box"><div class="v">${last?.imc||'—'}</div><div class="l">IMC</div></div><div class="box"><div class="v">${last?.cin||'—'} cm</div><div class="l">Cintura</div></div><div class="box"><div class="v">${last?.cad||'—'} cm</div><div class="l">Cadera</div></div><div class="box"><div class="v">${last?.pecho||'—'} cm</div><div class="l">Pecho</div></div><div class="box"><div class="v">${last?.bic||'—'} cm</div><div class="l">Bícep</div></div></div>
  ${prog?`<h2>Programa de entrenamiento</h2><div style="background:#f5f5f5;border-radius:6px;padding:12px"><strong>${prog.nombre}</strong> — ${prog.nivel} · ${prog.dias} días/sem · ${prog.dur||60}min · ${prog.obj}${prog.mod?' · '+prog.mod:''}<br>${prog.desc?`<div style="margin-top:5px;color:#444">${prog.desc}</div>`:''}</div>`:''}
  ${nutri?`<h2>Plan de nutrición</h2><div style="background:#f5f5f5;border-radius:6px;padding:12px"><strong>${nutri.nombre}</strong> — ${nutri.obj}<br><div style="margin-top:5px">Calorías: ${nutri.cal} kcal | Proteínas: ${nutri.prot}g | Carbos: ${nutri.carb}g | Grasas: ${nutri.gras}g${nutri.com?' | '+nutri.com+' comidas/día':''}</div>${nutri.rest?`<div style="color:#c00;margin-top:3px">⚠ ${nutri.rest}</div>`:''}${nutri.desc?`<div style="margin-top:5px;color:#444">${nutri.desc}</div>`:''}</div>`:''}
  ${avs.length>1?`<h2>Historial de mediciones</h2><table><thead><tr><th>Fecha</th><th>Peso</th><th>%Grasa</th><th>%Músculo</th><th>IMC</th><th>Cintura</th><th>Cadera</th><th>Pecho</th><th>Bícep</th><th>Observaciones</th></tr></thead><tbody>${avs.map(a=>`<tr><td>${a.fecha}</td><td>${a.peso||'—'}</td><td>${a.grasa||'—'}</td><td>${a.musc||'—'}</td><td>${a.imc||'—'}</td><td>${a.cin||'—'}</td><td>${a.cad||'—'}</td><td>${a.pecho||'—'}</td><td>${a.bic||'—'}</td><td>${a.obs||'—'}</td></tr>`).join('')}</tbody></table>`:''}
  ${pags.length?`<h2>Pagos — Total cobrado: ${fmt(total)}</h2><table><thead><tr><th>Fecha</th><th>Concepto</th><th>Monto</th><th>Método</th><th>Estado</th></tr></thead><tbody>${pags.map(p=>`<tr><td>${p.fecha}</td><td>${p.con}</td><td><strong>${fmt(p.monto)}</strong></td><td>${p.met||'—'}</td><td><span class="${p.est==='Pagado'?'pg':'po'}">${p.est}</span></td></tr>`).join('')}</tbody></table>`:''}
  ${c.notas?`<h2>Notas del entrenador</h2><div style="background:#f5f5f5;border-radius:6px;padding:10px">${c.notas}</div>`:''}
  ${c.emerg?`<h2>Contacto de emergencia</h2><div>${c.emerg}</div>`:''}
  <div class="foot">GYM OS v2.1 · ${gym} · ${new Date().toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
  </body></html>`;
  const link=document.createElement('a');
  link.href='data:text/html;charset=utf-8,'+encodeURIComponent(html);
  link.download=`informe_${c.nombre.replace(/\s+/g,'_')}_${hoy()}.html`;
  link.click();
}

// ═══ LICENSE ═══
// ─── VALID_KEYS se carga desde config.js (generado desde .env) ───
// En producción/Node: usar proceso server-side para no exponer keys en cliente.
// Para uso local con VS Code Live Server: config.js exporta VALID_KEYS.
const VALID_KEYS = (typeof GYMOS_CONFIG !== 'undefined' && GYMOS_CONFIG.VALID_KEYS)
  ? GYMOS_CONFIG.VALID_KEYS
  : {
      // Fallback si config.js no está cargado (desarrollo sin servidor)
      'GYMO-BSIC-2025-DEV1': 'basic',
      'GYMO-PREM-2025-DEV1': 'premium'
    };
let LIC=null; try{LIC=JSON.parse(localStorage.getItem(LK));}catch{}
function getLic(){ if(!LIC)return 'none'; if(LIC.plan==='basic'||LIC.plan==='premium')return LIC.plan; if(LIC.plan==='trial') return (Date.now()-LIC.startedAt)<7*864e5?'trial':'expired'; return 'none'; }
function daysLeft(){ if(!LIC||LIC.plan!=='trial')return 0; return Math.max(0,Math.ceil((7*864e5-(Date.now()-LIC.startedAt))/864e5)); }
function saveLic(l){ LIC=l; localStorage.setItem(LK,JSON.stringify(l)); }
function startTrial(){ if(!LIC||LIC.plan!=='trial') saveLic({plan:'trial',startedAt:Date.now()}); document.getElementById('licenseWall').classList.add('hidden'); applyLic(); }
function openLicWall(){ document.getElementById('licenseWall').classList.remove('hidden'); showKeyEntry('basic'); }
let pendPlan='basic';
function showKeyEntry(plan){ pendPlan=plan; document.getElementById('keyEntryArea').style.display='block'; document.getElementById('keyEntryLabel').textContent=plan==='premium'?'🔑 Clave Premium:':'🔑 Clave Básica:'; document.getElementById('licKeyInput').value=''; document.getElementById('keyMsg').textContent=''; setTimeout(()=>document.getElementById('licKeyInput').focus(),100); }
function formatKey(inp){ let v=inp.value.replace(/[^A-Za-z0-9]/g,'').toUpperCase(); let p=[]; for(let i=0;i<v.length&&i<16;i+=4)p.push(v.slice(i,i+4)); inp.value=p.join('-'); }
function activateKey(){
  const key=document.getElementById('licKeyInput').value.trim().toUpperCase();
  const msg=document.getElementById('keyMsg');
  if(!key){msg.textContent='Ingresá una clave.';msg.className='lw-key-msg err';return;}
  const plan=VALID_KEYS[key];
  if(!plan){msg.textContent='❌ Clave inválida.';msg.className='lw-key-msg err';return;}
  saveLic({plan,key,activatedAt:new Date().toISOString(),startedAt:Date.now()});
  msg.textContent=plan==='premium'?'✅ ¡Plan Premium activado!':'✅ ¡Plan Básico activado!';
  msg.className='lw-key-msg ok';
  setTimeout(()=>{document.getElementById('licenseWall').classList.add('hidden');applyLic();},1100);
}
let premAdded=false;
function applyLic(){
  const st=getLic(), ban=document.getElementById('trialBanner'), badge=document.getElementById('licBadge');
  if(st==='none'||st==='expired'){document.getElementById('licenseWall').classList.remove('hidden');return;}
  if(st==='trial'){
    const d=daysLeft(); ban.classList.remove('hidden'); ban.classList.toggle('warn',d<=2);
    document.getElementById('trialText').textContent=d<=1?'⚠️ Prueba vence HOY — Activá tu licencia':`⏱ Prueba: ${d} día${d!==1?'s':''} restante${d!==1?'s':''}`;
    document.getElementById('mainArea').style.paddingTop='38px';
    badge.className='lic-badge trial'; document.getElementById('licIcon').textContent='⏱'; document.getElementById('licText').textContent=`Trial · ${d}d`;
    badge.onclick=openLicWall;
  } else if(st==='basic'){
    ban.classList.add('hidden'); badge.className='lic-badge basic'; document.getElementById('licIcon').textContent='✓'; document.getElementById('licText').textContent='Plan Básico'; badge.onclick=null;
  } else if(st==='premium'){
    ban.classList.add('hidden'); badge.className='lic-badge premium'; document.getElementById('licIcon').textContent='★'; document.getElementById('licText').textContent='Plan Premium'; badge.onclick=null;
    if(!premAdded){document.querySelector('.topbar-right').insertAdjacentHTML('afterbegin','<span class="prem-badge">★ PREMIUM</span>');premAdded=true;}
  }
}
function closeBanner(){ document.getElementById('trialBanner').classList.add('hidden'); document.getElementById('mainArea').style.paddingTop='0'; }
(()=>{ const st=getLic(); if(st==='none'||st==='expired') document.getElementById('licenseWall').classList.remove('hidden'); else applyLic(); })();

// ═══ PDF REPORTES ═══

function pdfPagos(){
  const fm=document.getElementById('pgMes').value;
  const fe=document.getElementById('pgEst').value;
  const list=DB.pagos.filter(p=>{
    if(fm&&p.fecha.slice(0,7)!==fm)return false;
    if(fe&&p.est!==fe)return false;
    return true;
  }).sort((a,b)=>b.fecha.localeCompare(a.fecha));

  const total=list.filter(p=>p.est==='Pagado').reduce((a,p)=>a+p.monto,0);
  const pend=list.filter(p=>p.est==='Pendiente').reduce((a,p)=>a+p.monto,0);
  const gym=DB.gymName||'GYM OS';
  const lb={'01':'Enero','02':'Febrero','03':'Marzo','04':'Abril','05':'Mayo','06':'Junio','07':'Julio','08':'Agosto','09':'Septiembre','10':'Octubre','11':'Noviembre','12':'Diciembre'};
  const titulo=fm?`${lb[fm.split('-')[1]]} ${fm.split('-')[0]}`:'Todos los períodos';
  const filtroEst=fe?` · Estado: ${fe}`:'';

  const filas=list.map(p=>{
    const c=DB.clients.find(x=>x.id===p.cId);
    const color=p.est==='Pagado'?'#1a7a00':p.est==='Devuelto'?'#c00':'#b35a00';
    return `<tr>
      <td>${p.fecha}</td>
      <td>${e(c?.nombre||'—')}</td>
      <td>${e(p.con)}</td>
      <td style="font-weight:700">${fmt(p.monto)}</td>
      <td>${e(p.met||'—')}</td>
      <td><span style="background:${color}22;color:${color};padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600">${p.est}</span></td>
    </tr>`;
  }).join('');

  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Pagos — ${gym}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:Arial,sans-serif;color:#111;padding:28px;font-size:13px;}
    .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #111;padding-bottom:14px;margin-bottom:20px;}
    .gym-name{font-size:22px;font-weight:900;}
    .report-title{font-size:14px;color:#555;margin-top:3px;}
    .meta{text-align:right;font-size:11px;color:#666;}
    .kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;}
    .kpi{background:#f5f5f5;border-radius:8px;padding:12px;border-top:3px solid #c8f135;}
    .kpi.r{border-top-color:#ff5c5c;}
    .kpi.b{border-top-color:#5c6aff;}
    .kv{font-size:22px;font-weight:900;}
    .kl{font-size:9px;text-transform:uppercase;letter-spacing:.8px;color:#666;margin-bottom:3px;}
    table{width:100%;border-collapse:collapse;}
    th{background:#111;color:#c8f135;padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.5px;}
    td{padding:7px 10px;border-bottom:1px solid #eee;font-size:12px;}
    tr:last-child td{border-bottom:none;}
    .foot{margin-top:22px;font-size:10px;color:#999;text-align:center;border-top:1px solid #eee;padding-top:8px;}
    @media print{body{padding:15px;}}
  </style></head><body>
  <div class="header">
    <div>
      <div class="gym-name">${e(gym)}</div>
      <div class="report-title">Reporte de Pagos · ${titulo}${filtroEst}</div>
    </div>
    <div class="meta">Generado: ${new Date().toLocaleDateString('es-AR',{day:'numeric',month:'long',year:'numeric'})}<br>${list.length} registro${list.length!==1?'s':''}</div>
  </div>
  <div class="kpis">
    <div class="kpi"><div class="kl">Total cobrado</div><div class="kv">${fmt(total)}</div></div>
    <div class="kpi r"><div class="kl">Pendiente</div><div class="kv">${fmt(pend)}</div></div>
    <div class="kpi b"><div class="kl">Registros</div><div class="kv">${list.length}</div></div>
  </div>
  <table>
    <thead><tr><th>Fecha</th><th>Socio</th><th>Concepto</th><th>Monto</th><th>Método</th><th>Estado</th></tr></thead>
    <tbody>${filas||'<tr><td colspan="6" style="text-align:center;padding:20px;color:#999">Sin pagos en este período.</td></tr>'}</tbody>
  </table>
  <div class="foot">GYM OS v2.1 · ${e(gym)} · ${new Date().toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
  </body></html>`;
  const link=document.createElement('a');
  link.href='data:text/html;charset=utf-8,'+encodeURIComponent(html);
  link.download=`pagos_${titulo.replace(/\s+/g,'_')}_${hoy()}.html`;
  link.click();
}

function pdfFinanzas(){
  const meses=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const yr=new Date().getFullYear();
  const gym=DB.gymName||'GYM OS';
  let tI=0,tG=0;

  const rows=meses.map((m,i)=>{
    const ms=`${yr}-${String(i+1).padStart(2,'0')}`;
    const ing=DB.pagos.filter(p=>p.fecha.slice(0,7)===ms&&p.est==='Pagado').reduce((a,p)=>a+p.monto,0);
    const gas=DB.gastos.filter(g=>g.fecha.slice(0,7)===ms).reduce((a,g)=>a+g.monto,0);
    tI+=ing; tG+=gas;
    const gan=ing-gas;
    const mar=ing?Math.round(gan/ing*100):null;
    const cur=hoy().slice(0,7)===ms;
    return `<tr style="${cur?'background:#f9ffe8':''}">
      <td style="font-weight:${cur?700:400}">${m}${cur?' ◀':''}</td>
      <td style="color:#1a7a00;font-weight:600">${fmt(ing)}</td>
      <td style="color:#c00">${fmt(gas)}</td>
      <td style="font-weight:800;color:${gan>=0?'#1a7a00':'#c00'}">${fmt(gan)}</td>
      <td style="color:#666">${mar!==null?mar+'%':'—'}</td>
    </tr>`;
  }).join('');

  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Finanzas ${yr} — ${gym}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:Arial,sans-serif;color:#111;padding:28px;font-size:13px;}
    .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #111;padding-bottom:14px;margin-bottom:20px;}
    .gym-name{font-size:22px;font-weight:900;}
    .report-title{font-size:14px;color:#555;margin-top:3px;}
    .meta{text-align:right;font-size:11px;color:#666;}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;}
    .kpi{background:#f5f5f5;border-radius:8px;padding:12px;border-top:3px solid #c8f135;}
    .kpi.r{border-top-color:#ff5c5c;} .kpi.b{border-top-color:#5c6aff;} .kpi.g{border-top-color:#999;}
    .kv{font-size:20px;font-weight:900;} .kl{font-size:9px;text-transform:uppercase;letter-spacing:.8px;color:#666;margin-bottom:3px;}
    table{width:100%;border-collapse:collapse;}
    th{background:#111;color:#c8f135;padding:7px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.5px;}
    td{padding:7px 10px;border-bottom:1px solid #eee;font-size:12px;}
    tfoot td{font-weight:900;background:#f5f5f5;border-top:2px solid #111;}
    .foot{margin-top:22px;font-size:10px;color:#999;text-align:center;border-top:1px solid #eee;padding-top:8px;}
    @media print{body{padding:15px;}.kpis{grid-template-columns:repeat(4,1fr);}}
  </style></head><body>
  <div class="header">
    <div>
      <div class="gym-name">${e(gym)}</div>
      <div class="report-title">Reporte Financiero Anual · ${yr}</div>
    </div>
    <div class="meta">Generado: ${new Date().toLocaleDateString('es-AR',{day:'numeric',month:'long',year:'numeric'})}</div>
  </div>
  <div class="kpis">
    <div class="kpi b"><div class="kl">Ingresos año</div><div class="kv">${fmt(tI)}</div></div>
    <div class="kpi r"><div class="kl">Gastos año</div><div class="kv">${fmt(tG)}</div></div>
    <div class="kpi"><div class="kl">Ganancia neta</div><div class="kv" style="color:${tI-tG>=0?'#1a7a00':'#c00'}">${fmt(tI-tG)}</div></div>
    <div class="kpi g"><div class="kl">Margen %</div><div class="kv">${tI?Math.round((tI-tG)/tI*100)+'%':'—'}</div></div>
  </div>
  <table>
    <thead><tr><th>Mes</th><th>Ingresos</th><th>Gastos</th><th>Ganancia</th><th>Margen</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr>
      <td>TOTAL ${yr}</td>
      <td style="color:#1a7a00">${fmt(tI)}</td>
      <td style="color:#c00">${fmt(tG)}</td>
      <td style="color:${tI-tG>=0?'#1a7a00':'#c00'}">${fmt(tI-tG)}</td>
      <td>${tI?Math.round((tI-tG)/tI*100)+'%':'—'}</td>
    </tr></tfoot>
  </table>
  <div class="foot">GYM OS v2.1 · ${e(gym)} · ${new Date().toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
  </body></html>`;

  const link=document.createElement('a');
  link.href='data:text/html;charset=utf-8,'+encodeURIComponent(html);
  link.download=`finanzas_${yr}_${hoy()}.html`;
  link.click();
}

// ═══ MOBILE ═══
function toggleSB(){ document.querySelector('.sidebar').classList.toggle('open'); document.getElementById('sidebarOv').classList.toggle('open'); }
function closeSB(){ document.querySelector('.sidebar').classList.remove('open'); document.getElementById('sidebarOv').classList.remove('open'); }
document.getElementById('hamburgerBtn').addEventListener('click',toggleSB);
document.getElementById('sidebarOv').addEventListener('click',closeSB);

// ═══ INIT ═══
function abrirNuevoSocio(){ document.getElementById('mSocioTitle').textContent='Nuevo Socio'; resetAv(); openModal('mSocio'); }
renderDash();
renderAgenda();
document.getElementById('btnNuevoCliente').addEventListener('click', abrirNuevoSocio);
document.getElementById('ctaBtn').addEventListener('click',()=>{
  const map={dashboard:'mSocio',clientes:'mSocio',membresias:null,programas:'mPrograma',nutricion:'mNutri',avances:'mAvance',agenda:'mClase',pagos:'mPago',finanzas:'mPago',gastos:'mGasto'};
  if(curPage==='clientes'||curPage==='dashboard'){document.getElementById('mSocioTitle').textContent='Nuevo Socio';resetAv();}
  if(curPage==='programas') document.getElementById('mProgTitle').textContent='Nuevo Programa';
  if(curPage==='nutricion') document.getElementById('mNutriTitle').textContent='Plan de Nutrición';
  const m=map[curPage]; if(m) openModal(m);
});
