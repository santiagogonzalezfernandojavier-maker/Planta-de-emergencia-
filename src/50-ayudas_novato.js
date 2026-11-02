// v7 · Ayudas para quien no conoce el tema: bienvenida con controles, glosario y frases del menú.
(function(){
const $$=id=>document.getElementById(id);
const sty0=document.createElement('style');sty0.textContent=`
#gameLaunch .g-entry-actions button small.g-desc{display:block;margin-top:5px;font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:12.5px;font-weight:500;letter-spacing:.2px;text-transform:none;color:#a9cdd2;line-height:1.35}
#gameLaunch .g-order{max-width:440px;margin:12px 0 0;font:600 12px/1.45 system-ui,Segoe UI,Arial,sans-serif;color:#efc474}
#gameLaunch .g-gloss-btn{margin:0 0 0 auto;background:none;border:0;border-bottom:1px dashed #6fb7c0;color:#bfe9ee;font:600 12.5px system-ui,Segoe UI,Arial,sans-serif;padding:2px 0;cursor:pointer}
#gameVersion{display:none!important}
body.walking31 #sceneFooter .gesture{display:none}
#walkWelcome{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:#050d14e6;color:#edf5f5;font-family:system-ui,Segoe UI,Arial,sans-serif;padding:16px;overflow:auto}
#walkWelcome .ww-card{width:min(860px,100%);background:#0d1d29;border:1px solid #2b5362;border-top:4px solid #efc474;border-radius:10px;padding:26px 30px;box-shadow:0 20px 60px #000a}
#walkWelcome h2{margin:0 0 4px;font-size:26px;letter-spacing:.5px}#walkWelcome p{margin:0 0 16px;color:#b9d3d8;font-size:15px;line-height:1.45}
#walkWelcome .ww-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px}
#walkWelcome .ww-it{display:flex;gap:12px;align-items:center;background:#12303d;border:1px solid #28515f;border-radius:8px;padding:10px 12px}
#walkWelcome kbd{font:700 14px ui-monospace,Consolas,monospace;background:#e9f3f3;color:#102631;border-radius:5px;padding:3px 8px;white-space:nowrap}
#walkWelcome .ww-it b{display:block;font-size:15px}#walkWelcome .ww-it small{color:#a9cdd2;font-size:12.5px}
#walkWelcome .ww-tip{margin:16px 0 0;padding:12px 14px;border-left:4px solid #efc474;background:#1a2a2f;font-size:14.5px;line-height:1.45;color:#f1e3bd}
#walkWelcome .ww-go{margin-top:18px;text-align:center;font-weight:800;letter-spacing:2px;color:#7fe7d7;font-size:14px}
#gameGlossary{border:1px solid #2b5362;border-radius:10px;background:#0d1d29;color:#edf5f5;max-width:min(760px,94vw);max-height:92vh;overflow:auto;padding:22px 26px;font-family:system-ui,Segoe UI,Arial,sans-serif}
#gameGlossary::backdrop{background:#050d14cc}#gameGlossary h2{margin:0 0 4px;font-size:22px}#gameGlossary p{margin:0 0 12px;color:#b9d3d8;font-size:14px}
#gameGlossary dl{display:grid;grid-template-columns:150px 1fr;gap:4px 14px;margin:0}#gameGlossary dt{font:700 14px ui-monospace,Consolas,monospace;color:#efc474}#gameGlossary dd{margin:0;font-size:14px;line-height:1.4}
#gameGlossary button{margin-top:16px;padding:10px 18px;background:#12303d;border:1px solid #2b5362;color:#e9fffb;border-radius:6px;font-weight:700;cursor:pointer}
#gameGlossary small{display:block;margin-top:10px;color:#6f8f97;font-size:11px}
body.walking31 #fpGloss{margin-left:2px}
#walkWelcome *{text-transform:none!important;letter-spacing:normal!important}#walkWelcome .ww-go{letter-spacing:2px!important;text-transform:uppercase!important}
#gameLaunch{overflow:auto}#gameLaunch .g-entry-actions button{padding:8px 20px!important;max-width:540px!important}
@media(max-height:820px){#gameLaunch .g-launch-intro h2{font-size:clamp(30px,5.6vh,50px)!important}#gameLaunch .g-launch-intro p{margin-top:6px!important;margin-bottom:10px!important}#gameLaunch .g-eyebrow{margin-bottom:6px!important}#gameLaunch .g-launch-note{display:none}}
#walkTags{position:fixed;inset:0;z-index:30;pointer-events:none;overflow:hidden}
#walkTags span{position:absolute;transform:translate(-50%,-100%);background:#0b1722ea;border:1px solid #efc474;color:#fff3d0;font:700 13px system-ui,Segoe UI,Arial,sans-serif;padding:3px 9px;border-radius:5px;white-space:nowrap;text-shadow:none;display:none}
#walkTags span::after{content:"";position:absolute;left:50%;top:100%;width:2px;height:14px;background:#efc474;transform:translateX(-50%)}
@media(min-width:1500px){#walkTags span{font-size:16px}}
body.walking31 #fpNav{padding:10px 14px!important;background:#0b1722f2!important;border:2px solid #efc474!important;border-radius:8px!important}
body.walking31 #fpNavText{font-size:16px!important;font-weight:700!important;color:#fff3d0!important;line-height:1.25}
body.walking31 #fpBearing{font-size:36px!important}
body.walking31 .fp-hud small{font-size:13px}
body.walking31 .fp-hud button{font-size:14px;padding:8px 12px}
body.walking31 #fpTarget{font-size:17px}
@media(min-width:1500px){body.walking31 #fpNavText{font-size:21px!important}body.walking31 .fp-hud button,body.walking31 .fp-hud small{font-size:15px}}
`;document.head.append(sty0);

// Glosario
const terms=[
['kV / kW / Hz','kilovolt (tensión alto), kilowatt (potencia) y hertz (frecuencia de la corriente: 60 por segundo).'],
['MT / BT','Media tensión (13.8 kV, la de la subestación) y baja tensión (480 V, la de la fábrica y el generador).'],
['Red normal','La compañía eléctrica: la fuente que alimenta la fábrica cuando todo funciona.'],
['Grupo G-01','El generador de emergencia: un motor diésel que mueve un alternador para producir electricidad cuando falla la red.'],
['Q0','Interruptor de salida del generador (480 V).'],
['TE','Transformador elevador: sube el tensión del generador de 480 V a 13.8 kV.'],
['QN','Interruptor de la red normal (media tensión).'],
['QG','Interruptor del respaldo: conecta el generador a la barra.'],
['Barra / QS','La barra común une las dos fuentes; QS es el interruptor de salida hacia la fábrica.'],
['TP','Transformador reductor: baja de 13.8 kV a 480 V para la fábrica.'],
['CCM','Centro de control de motores: tablero de la fábrica que arranca y protege los motores.'],
['Transferencia','Cambiar la carga de la red al generador (o al revés) sin que la fábrica se quede sin luz mucho tiempo.'],
['Bloqueo y etiquetado','Candado y etiqueta en el equipo para que nadie lo arranque mientras alguien trabaja en él.'],
['Permiso de trabajo','Documento que dice qué trabajo se hará, quién lo hace y en qué estado está el equipo.']];
const dlg=document.createElement('dialog');dlg.id='gameGlossary';dlg.setAttribute('aria-labelledby','gameGlossTitle');
dlg.innerHTML='<h2 id="gameGlossTitle">Glosario · ¿qué significa cada sigla?</h2><p>Todo lo que aparece en el simulador, en palabras simples.</p><dl>'+terms.map(([a,b])=>'<dt>'+a+'</dt><dd>'+b+'</dd>').join('')+'</dl><button id="gameGlossClose">Cerrar</button><small id="gameGlossVer"></small>';
document.body.append(dlg);
$$('gameGlossClose').onclick=()=>dlg.close();
window.openGlossary=()=>{try{document.exitPointerLock?.();}catch(e){}const v=$$('gameVersion');$$('gameGlossVer').textContent=v?v.textContent:'';if(!dlg.open)dlg.showModal();};

// Menú: frase por botón y orden sugerido
const menu=$$('gameLaunch');
if(menu){
 const desc={gameEnter:'Mira la planta pieza por pieza, con cada parte explicada. Empieza aquí.',gameTraining:'Vista general: controla el grupo, corta la red y mira cómo responde cada componente.'};
 const add=(b,t)=>{if(b&&!b.querySelector('.g-desc'))b.insertAdjacentHTML('beforeend','<small class="g-desc">'+t+'</small>');};
 for(const id in desc)add($$(id),desc[id]);
 [...menu.querySelectorAll('.g-entry-actions button')].forEach(b=>{if(/Mantenimiento/i.test(b.textContent))add(b,'Tareas de mantenimiento paso a paso, como en la vida real.');});
 {const ent=$$('gameEnter');if(ent){const tn=[...ent.childNodes].find(x=>x.nodeType===3);if(tn)tn.textContent='Despiece de la planta ';}const an=$$('gameAnatomy');if(an){an.hidden=true;an.style.display='none';}}
 const box=menu.querySelector('.g-entry-actions');
 if(box&&!menu.querySelector('.g-order')){box.insertAdjacentHTML('afterend','<p class="g-order">¿Primera vez? Sigue este orden: Despiece → Funcionamiento → Mantenimiento.</p>');}
 const top=menu.querySelector('.g-launch-top');if(top&&!$$('gameGlossBtn')){top.insertAdjacentHTML('beforeend','<button type="button" class="g-gloss-btn" id="gameGlossBtn">Glosario: ¿qué significan kV, MT, QN, CCM…?</button>');$$('gameGlossBtn').onclick=()=>window.openGlossary();}
}

// Bienvenida con controles (una vez por apertura)
let seen=false,el=null,pollId=0;
function hide(){if(!el)return;el.remove();el=null;clearInterval(pollId);window.removeEventListener('keydown',onKey,true);}
function onKey(e){if(!el)return;e.preventDefault();e.stopImmediatePropagation();hide();}
function show(){
 if(seen||el)return;seen=true;
 el=document.createElement('div');el.id='walkWelcome';el.setAttribute('role','dialog');el.setAttribute('aria-label','Cómo moverte');
 const it=(k,t,d)=>'<div class="ww-it"><kbd>'+k+'</kbd><span><b>'+t+'</b><small>'+d+'</small></span></div>';
 el.innerHTML='<div class="ww-card"><h2>Cómo moverte por la planta</h2><p>Eres un técnico de mantenimiento. Camina, mira alrededor y usa las herramientas como en la vida real.</p><div class="ww-grid">'
 +it('W A S D','Caminar','Control: palanca izquierda')+it('Ratón','Mirar','Solo muévelo. Control: palanca derecha')+it('Shift','Correr','Mantenlo pulsado')
 +it('E','Usar','Actúa sobre lo que apuntas · Control: A')+it('C','Agacharte','Para ver bajo los equipos · Control: B')+it('B','Bolsa de herramientas','Se abre junto a la bolsa del piso · Control: Y')
 +it('Q','Cuaderno','Explica cada actividad · Control: X')+it('Esc','Menú','Libera el ratón · Control: Start')+'</div>'
 +'<p class="ww-tip"><b>Tu primer paso:</b> sigue la flecha amarilla (arriba a la derecha): te dice a qué lugar ir y a cuántos metros. Para usar una herramienta, primero ve a la bolsa del piso y ábrela con B. Si no entiendes una sigla, usa el botón «Glosario».</p>'
 +'<div class="ww-go">PULSA CUALQUIER TECLA O HAZ CLIC PARA EMPEZAR</div></div>';
 el.addEventListener('pointerdown',e=>{e.preventDefault();hide();});
 document.body.append(el);
 window.addEventListener('keydown',onKey,true);
 pollId=setInterval(()=>{try{const l=navigator.getGamepads?navigator.getGamepads():[];for(const g of l)if(g&&g.buttons.some(b=>b.pressed)){hide();return;}}catch(e){clearInterval(pollId);}},150);
}
window.WalkWelcome={show,hide,visible:()=>!!el};
const check=()=>{if(document.body.classList.contains('walking31')&&!window.gameMenuActive&&!(menu&&menu.open))show();};
new MutationObserver(check).observe(document.body,{attributes:true,attributeFilter:['class']});

// Nombres de los equipos flotando sobre la planta (tecla N o botón «Nombres»)
const tagDefs=[['Motor diésel',[-.8,1.95,.85]],['Alternador (genera la electricidad)',[1.3,1.35,.85]],['Tablero de control del grupo',[2.47,1.62,1.1]],['Tablero de transferencia (ATS)',[3.7,1.75,.5]],['Batería de arranque',[.25,1.1,.9]],['Radiador (enfriamiento)',[-2.3,.9,0]],['Filtro de aire',[-.5,2.75,.6]],['Unión a tierra (protección)',[1.2,.5,1.2]]];
let tagsOn=true;const layer=document.createElement('div');layer.id='walkTags';layer.hidden=true;document.body.append(layer);
const tagEls=tagDefs.map(([t])=>{const e=document.createElement('span');e.textContent=t;layer.append(e);return e;});
const tagPos=tagDefs.map(([,p])=>new T.Vector3(...p));const tmp=new T.Vector3();
function tagLoop(){requestAnimationFrame(tagLoop);const walking=document.body.classList.contains('walking31');let st=null;try{st=window.Walk31&&Walk31.state();}catch(e){}
 const show=walking&&tagsOn&&st&&st.active&&st.zone==='plant'&&!st.bag&&!st.journal&&!(window.WalkWelcome&&WalkWelcome.visible());
 layer.hidden=!show;if(!show)return;const w=innerWidth,h=innerHeight,cp=st.position;
 tagPos.forEach((p,i)=>{const e=tagEls[i],dx=p.x-cp[0],dz=p.z-cp[2],d=Math.hypot(dx,dz);tmp.copy(p).project(camera);const ok=d<7.5&&tmp.z<1&&Math.abs(tmp.x)<.97&&tmp.y>-.8&&tmp.y<.9;e.style.display=ok?'block':'none';if(ok){e.style.left=((tmp.x+1)/2*w)+'px';e.style.top=((1-tmp.y)/2*h)+'px';}});}
requestAnimationFrame(tagLoop);
function setTags(v){tagsOn=v;const b=$$('fpTags');if(b){b.setAttribute('aria-pressed',String(v));b.textContent='Nombres · N: '+(v?'sí':'no');}}
window.WalkTags={toggle:()=>setTags(!tagsOn),bind(){const b=$$('fpTags');if(b){b.onclick=()=>setTags(!tagsOn);setTags(tagsOn);}},state:()=>tagsOn};
window.addEventListener('keydown',e=>{if(e.code!=='KeyN'||e.ctrlKey||e.metaKey||e.altKey||!document.body.classList.contains('walking31')||(window.WalkWelcome&&WalkWelcome.visible()))return;const t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;setTags(!tagsOn);});

// ===== «Explorar instalación» abre directamente el despiece, con una entrada suave =====
const tour=null;
(function(){
 const ge=$$('gameEnter'),ga=$$('gameAnatomy');if(!ge||!ga)return;
 ge.addEventListener('click',e=>{if(!e.isTrusted)return;e.stopImmediatePropagation();e.preventDefault();
  const dlg=$$('plantPresentation');dlg.style.transition='none';dlg.style.opacity='0';
  ga.click();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{dlg.style.transition='opacity 1.1s ease';dlg.style.opacity='1';}));
  setTimeout(()=>{dlg.style.transition='';dlg.style.opacity='';},1800);},true);
})();

// ===== Mantenimiento: qué se arregla ahora =====
const fx=document.createElement('div');fx.id='fixCard';fx.hidden=true;document.body.append(fx);
const ring=document.createElement('div');ring.id='fixRing';ring.innerHTML='<b>AQUÍ</b>';document.body.append(ring);
let fxKey='',fxMin=false;const rv=new T.Vector3();
function fixLoop(){requestAnimationFrame(fixLoop);let st=null,ms=null;try{st=Walk31.state();ms=Maintenance.state();}catch(e){}
 const on=document.body.classList.contains('walking31')&&!tour&&st&&st.active&&st.zone==='plant'&&ms&&ms.active&&!ms.finished&&!st.journal&&!st.bag&&!(window.WalkWelcome&&WalkWelcome.visible());
 fx.hidden=!on;if(!on){ring.style.display='none';return;}
 const info=window.MaintInfo.get(ms.index);if(!info){fx.hidden=true;return;}
 const key=ms.index+'|'+ms.done+'|'+fxMin;if(key!==fxKey){fxKey=key;fx.classList.toggle('ok',!!ms.done);
  fx.innerHTML='<div class="fx-h"><span>'+(ms.done?'✔ LISTO':'ARREGLANDO')+' · '+(ms.index+1)+'/'+info.n+'</span><button id="fxMin" title="Mostrar u ocultar">'+(fxMin?'＋':'–')+'</button></div><b class="fx-t">'+info.title+'</b>'+(fxMin?'':'<div class="fx-r"><i>Pieza:</i> '+info.place+'</div><div class="fx-r"><i>Qué hacemos:</i> '+info.what+'</div><div class="fx-r"><i>Por qué importa:</i> '+(ms.done&&info.learn?info.learn:info.why)+'</div>');
  $$('fxMin').onclick=()=>{fxMin=!fxMin;};}
 const w=innerWidth,h=innerHeight,cp=st.position;rv.set(info.pos[0],info.pos[1],info.pos[2]).project(camera);const d=Math.hypot(info.pos[0]-cp[0],info.pos[2]-cp[2]);
 const vis=!ms.done&&rv.z<1&&Math.abs(rv.x)<.95&&Math.abs(rv.y)<.9&&d<14;ring.style.display=vis?'block':'none';if(vis){ring.style.left=((rv.x+1)/2*w)+'px';ring.style.top=((1-rv.y)/2*h)+'px';}}
requestAnimationFrame(fixLoop);

// ===== Quitar el protector (ducto/difusor del radiador) que tapaba la vista =====
function removeRadiatorGuard(){
 let removedNow=0;try{
  const v=new T.Vector3();
  scene.traverse(o=>{
   if(!o.isMesh||o.name!=='Geometría estática combinada'||o.geometry.index)return;
   const g=o.geometry,pos=g.attributes.position,n=pos.count/3;o.updateWorldMatrix(true,false);
   const kill=new Uint8Array(n);let count=0,xmin=1e9;
   for(let t=0;t<n;t++){let ins=true,tx=1e9;for(let k=0;k<3;k++){v.set(pos.getX(t*3+k),pos.getY(t*3+k),pos.getZ(t*3+k)).applyMatrix4(o.matrixWorld);tx=Math.min(tx,v.x);if(v.x<-3.52||v.x>-2.28||v.y<.40||v.y>2.2||v.z<-.86||v.z>.86)ins=false;}
    if(ins){kill[t]=1;count++;xmin=Math.min(xmin,tx);}}
   if(count<100||xmin>-3.4)return;
   const keep=n-count,ng=new T.BufferGeometry();
   for(const name of Object.keys(g.attributes)){const a=g.attributes[name],sz=a.itemSize,arr=new a.array.constructor(keep*3*sz);let w=0;for(let t=0;t<n;t++){if(kill[t])continue;arr.set(a.array.subarray(t*3*sz,(t+1)*3*sz),w);w+=3*sz;}ng.setAttribute(name,new T.BufferAttribute(arr,sz,a.normalized));}
   ng.computeBoundingSphere();ng.computeBoundingBox();o.geometry=ng;g.dispose();window.__guardRemoved=(window.__guardRemoved||0)+count;removedNow+=count;
  });
  renderer.shadowMap.needsUpdate=true;
 }catch(e){console.warn('protector',e);}return removedNow;
}
let guardTries=0;const guardTimer=setInterval(()=>{removeRadiatorGuard();if(++guardTries>=60)clearInterval(guardTimer);},1500);
removeRadiatorGuard();
new MutationObserver(()=>{if(document.body.classList.contains('walking31'))removeRadiatorGuard();}).observe(document.body,{attributes:true,attributeFilter:['class']});

// ===== Narración en vivo del funcionamiento (arranque, flujo de energía y transferencia) =====
(function(){
 const st=document.createElement('style');st.textContent=`
#opNarrator{position:fixed;left:14px;top:182px;z-index:33;width:min(330px,31vw);background:#0b1722f2;border:1px solid #2b5362;border-left:4px solid #efc474;border-radius:9px;padding:12px 15px;color:#edf5f5;font-family:system-ui,Segoe UI,Arial,sans-serif;box-shadow:0 10px 32px #0009}
#opNarrator[hidden]{display:none}
#opNarrator .on-h{display:flex;justify-content:space-between;align-items:center;font:700 11px ui-monospace,Consolas,monospace;letter-spacing:1.5px;color:#efc474}
#opNarrator .on-h button{background:none;border:0;color:#9fc5cb;font-size:16px;cursor:pointer;padding:0 4px}
#opNarrator h4{margin:4px 0 4px;font-size:17px;color:#fff;text-transform:none;letter-spacing:normal}
#opNarrator p{margin:0;font-size:13.5px;line-height:1.42;color:#d6e6e8}
#opNarrator .on-m{display:flex;gap:14px;margin:8px 0 6px;font:600 12px ui-monospace,Consolas,monospace;color:#9fc5cb}
#opNarrator .on-m b{display:block;font-size:17px;color:#fff}
#opNarrator .on-f{display:grid;gap:5px;margin:8px 0 2px}
#opNarrator .on-r{display:flex;gap:4px;align-items:center;flex-wrap:wrap}
#opNarrator .on-r span{font:700 11px ui-monospace,Consolas,monospace;padding:3px 7px;border-radius:4px;background:#13242d;color:#58727a;border:1px solid #243d48}
#opNarrator .on-r span.a1{background:#16405f;color:#cfeaff;border-color:#2e86c1}
#opNarrator .on-r span.a2{background:#14503f;color:#d2fff0;border-color:#2bbf8f}
#opNarrator .on-r i{font-style:normal;color:#41606a;font-size:11px}
#opNarrator .on-b{margin-top:10px;display:flex;gap:8px}
#opNarrator .on-b button{background:#12303d;border:1px solid #2b5362;color:#e9fffb;border-radius:6px;padding:7px 12px;font:700 13px system-ui,Segoe UI,Arial,sans-serif;cursor:pointer}
#opNarrator .on-b button.pri{background:#efc474;color:#10202a;border-color:#efc474}
@media(min-width:1500px){#opNarrator{width:400px;top:190px}#opNarrator h4{font-size:21px}#opNarrator p{font-size:16px}}
`;document.head.append(st);
 const box=document.createElement('div');box.id='opNarrator';box.hidden=true;document.body.append(box);
 let off=false,key='';
 function describe(){
  const g=s.grid,stg=s.stage,src=s.source,hz=(s.rpm/30).toFixed(1);
  if(stg==='fault'||s.fault)return ['Falla','El control detectó una falla y protege al equipo. Revisa la alarma para ver cuál fue.'];
  if(s.target)return ['Transferencia en curso','Una fuente se abre antes de que la otra se cierre, para que nunca estén conectadas a la vez. Por un instante la fábrica queda sin energía.'];
  if(stg==='starting')return ['El generador arranca','La batería hace girar el motor de arranque, y este mueve el motor diésel hasta que enciende.'];
  if(stg==='crankpause')return ['Reintento de arranque','El motor no encendió. El control espera unos segundos y vuelve a intentarlo.'];
  if(stg==='warm')return ['Subiendo de velocidad','El motor ya encendió y gira a '+Math.round(s.rpm)+' rpm. El alternador empieza a dar tensión y se espera a que tensión y frecuencia se estabilicen.'];
  if(src==='gen')return ['El generador alimenta la fábrica','El motor mueve el alternador, y de ahí la energía sube por el transformador elevador, pasa por la barra y llega a la fábrica.'];
  if(stg==='cool')return ['Enfriamiento','La red regresó y la carga volvió a ella. El motor sigue encendido unos minutos sin carga para enfriarse antes de parar.'];
  if(!g&&stg==='ready')return ['Listo para tomar la carga','Tensión y frecuencia estables. El control va a abrir el interruptor de la red y cerrar el del generador.'];
  if(!g)return ['La red falló','La fábrica se quedó sin luz. El control lo detecta y manda arrancar el generador.'];
  return ['Servicio normal','La red alimenta la fábrica. El generador está detenido y listo: si la red falla, arranca solo.'];
 }
 function flow(){
  const gridOn=s.grid&&s.source!=='none',busOn=s.source!=='none',genUp=s.genV>50,genSrc=s.source==='gen';
  const c=(t,on,k)=>'<span'+(on?' class="'+k+'"':'')+'>'+t+'</span>',a='<i>▸</i>';
  return '<div class="on-r">'+c('Red 13.8 kV',s.grid,'a1')+a+c('QN',s.grid&&s.source==='grid','a1')+a+c('Barra',busOn,s.source==='gen'?'a2':'a1')+a+c('TP',busOn,s.source==='gen'?'a2':'a1')+a+c('Fábrica',busOn,s.source==='gen'?'a2':'a1')+'</div>'
   +'<div class="on-r">'+c('Generador',genUp,'a2')+a+c('Q0',genUp,'a2')+a+c('TE',genUp,'a2')+a+c('QG',genSrc,'a2')+a+c('Barra',genSrc,'a2')+'</div>';
 }
 function tick(){
  const blocked=!!(document.getElementById('gameLaunch')?.open||document.getElementById('plantPresentation')?.open||document.getElementById('gameHelp')?.open||window.plantPresentationActive||(window.Walk31&&Walk31.state().active)||(window.Maintenance&&Maintenance.state().active)||document.body.classList.contains('practice26'));
  const on=!off&&!blocked&&typeof campusNav!=='undefined'&&['basement','emergency','general'].includes(campusNav.mode);
  box.hidden=!on;if(!on)return;
  const [t,txt]=describe(),k=t+'|'+Math.round(s.rpm/50)+'|'+Math.round(s.genV/20)+'|'+s.source+'|'+s.stage+'|'+s.grid+'|'+paused;
  if(k===key)return;key=k;
  const idle=s.grid&&s.stage==='off'&&s.source==='grid';
  box.innerHTML='<div class="on-h"><span>FUNCIONAMIENTO EN VIVO'+(paused?' · EN PAUSA':'')+'</span><button id="opHide" title="Ocultar">×</button></div><h4>'+t+'</h4><p>'+txt+'</p>'
   +'<div class="on-m"><div><b>'+Math.round(s.rpm)+'</b>rpm</div><div><b>'+s.genV.toFixed(0)+'</b>voltios</div><div><b>'+(s.rpm/30).toFixed(1)+'</b>hertz</div></div>'+'<div class="on-f">'+flow()+'</div>'
   +'<div class="on-b">'+(idle?'<button class="pri" id="opGo">▶ Cortar la red y ver qué pasa</button>':'<button id="opReset">Reiniciar</button>')+'</div>';
  const h=document.getElementById('opHide');if(h)h.onclick=()=>{off=true;box.hidden=true;};
  const go=document.getElementById('opGo');if(go)go.onclick=()=>{try{UnidadVII.test('transfer');}catch(e){}key='';};
  const rs=document.getElementById('opReset');if(rs)rs.onclick=()=>{document.getElementById('reset')?.click();key='';};
 }
 setInterval(()=>{try{tick();}catch(e){if(!window.__opErr){window.__opErr=String(e);console.warn('opNarrator',e);}}},250);
 window.OpNarrator={show:()=>{off=false;key='';},describe,state:()=>!box.hidden};
 document.addEventListener('keydown',e=>{if(e.code==='KeyV'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/^(INPUT|TEXTAREA|SELECT)$/.test((e.target||{}).tagName||'')&&!document.querySelector('dialog[open]')){off=!off;key='';}});
})();
})();
