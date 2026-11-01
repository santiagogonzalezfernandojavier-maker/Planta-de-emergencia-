// v7 · Ayudas para quien no conoce el tema: bienvenida con controles, glosario y frases del menú.
(function(){
const $$=id=>document.getElementById(id);
const s=document.createElement('style');s.textContent=`
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
`;document.head.append(s);

// Glosario
const terms=[
['kV / kW / Hz','kilovolt (voltaje alto), kilowatt (potencia) y hertz (frecuencia de la corriente: 60 por segundo).'],
['MT / BT','Media tensión (13.8 kV, la de la subestación) y baja tensión (480 V, la de la fábrica y el generador).'],
['Red normal','La compañía eléctrica: la fuente que alimenta la fábrica cuando todo funciona.'],
['Grupo G-01','El generador de emergencia: un motor diésel que mueve un alternador para producir electricidad cuando falla la red.'],
['Q0','Interruptor de salida del generador (480 V).'],
['TE','Transformador elevador: sube el voltaje del generador de 480 V a 13.8 kV.'],
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
 const desc={gameEnter:'Visita guiada: te explicamos cada parte de la planta. Empieza aquí.',gameTraining:'Provoca una falla de red y mira cómo responde el generador.',gameAnatomy:'Ve la planta pieza por pieza, con cada parte explicada.'};
 const add=(b,t)=>{if(b&&!b.querySelector('.g-desc'))b.insertAdjacentHTML('beforeend','<small class="g-desc">'+t+'</small>');};
 for(const id in desc)add($$(id),desc[id]);
 [...menu.querySelectorAll('.g-entry-actions button')].forEach(b=>{if(/Mantenimiento/i.test(b.textContent))add(b,'Tareas de mantenimiento paso a paso, como en la vida real.');});
 const box=menu.querySelector('.g-entry-actions');
 if(box&&!menu.querySelector('.g-order')){box.insertAdjacentHTML('afterend','<p class="g-order">¿Primera vez? Sigue este orden: Explorar → Anatomía → Misión → Mantenimiento.</p>');}
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
const check=()=>{if(document.body.classList.contains('walking31')&&!window.gameMenuActive&&!(menu&&menu.open)){if(tourIntent&&window.Tour){tourIntent=false;seen=true;window.Tour.start();}else show();}};
new MutationObserver(check).observe(document.body,{attributes:true,attributeFilter:['class']});

// Nombres de los equipos flotando sobre la planta (tecla N o botón «Nombres»)
const tagDefs=[['Motor diésel',[-.8,1.95,.85]],['Alternador (genera la electricidad)',[1.3,1.35,.85]],['Tablero de control del grupo',[2.47,1.62,1.1]],['Tablero de transferencia (ATS)',[3.7,1.75,.5]],['Batería de arranque',[.25,1.1,.9]],['Radiador (enfriamiento)',[-2.3,.9,0]],['Filtro de aire',[-.5,2.75,.6]],['Unión a tierra (protección)',[1.2,.5,1.2]]];
let tagsOn=true;const layer=document.createElement('div');layer.id='walkTags';layer.hidden=true;document.body.append(layer);
const tagEls=tagDefs.map(([t])=>{const e=document.createElement('span');e.textContent=t;layer.append(e);return e;});
const tagPos=tagDefs.map(([,p])=>new T.Vector3(...p));const tmp=new T.Vector3();
function tagLoop(){requestAnimationFrame(tagLoop);const walking=document.body.classList.contains('walking31');let st=null;try{st=window.Walk31&&Walk31.state();}catch(e){}
 const show=walking&&tagsOn&&st&&st.active&&st.zone==='plant'&&!st.bag&&!st.journal&&!(window.WalkWelcome&&WalkWelcome.visible())&&!(window.Tour&&Tour.hideTags&&Tour.hideTags());
 layer.hidden=!show;if(!show)return;const w=innerWidth,h=innerHeight,cp=st.position;
 tagPos.forEach((p,i)=>{const e=tagEls[i],dx=p.x-cp[0],dz=p.z-cp[2],d=Math.hypot(dx,dz);tmp.copy(p).project(camera);const ok=d<7.5&&tmp.z<1&&Math.abs(tmp.x)<.97&&tmp.y>-.8&&tmp.y<.9;e.style.display=ok?'block':'none';if(ok){e.style.left=((tmp.x+1)/2*w)+'px';e.style.top=((1-tmp.y)/2*h)+'px';}});}
requestAnimationFrame(tagLoop);
function setTags(v){tagsOn=v;const b=$$('fpTags');if(b){b.setAttribute('aria-pressed',String(v));b.textContent='Nombres · N: '+(v?'sí':'no');}}
window.WalkTags={toggle:()=>setTags(!tagsOn),bind(){const b=$$('fpTags');if(b){b.onclick=()=>setTags(!tagsOn);setTags(tagsOn);}},state:()=>tagsOn};
window.addEventListener('keydown',e=>{if(e.code!=='KeyN'||e.ctrlKey||e.metaKey||e.altKey||!document.body.classList.contains('walking31')||(window.WalkWelcome&&WalkWelcome.visible()))return;const t=e.target;if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;setTags(!tagsOn);});

// ===== Recorrido guiado («Explorar instalación») =====
const stops=[
 {z:'plant',p:[1.4,1.58,4.9],t:[1.2,1.2,0],title:'Bienvenido a la planta de emergencia',text:'Cuando se va la luz de la red, esta planta produce electricidad para que la fábrica no se detenga. Vamos a conocer sus partes, una por una.'},
 {z:'plant',p:[-.8,1.58,3.1],t:[-.8,1.2,.85],title:'Motor diésel',text:'Es el corazón de la planta. Quema diésel y hace girar un eje, igual que el motor de un camión, pero aquí lo que mueve es el alternador.'},
 {z:'plant',p:[-2.0,1.58,2.4],t:[-2.3,1.3,0],title:'Radiador',text:'Enfría el motor. Si se llena de polvo, el motor se sobrecalienta y se apaga justo cuando más se necesita.'},
 {z:'plant',p:[1.3,1.58,3.1],t:[1.3,1.0,.85],title:'Alternador',text:'Recibe el giro del motor y lo convierte en electricidad (480 V). Funciona como la dínamo de una bicicleta, pero enorme.'},
 {z:'plant',p:[.4,1.58,2.8],t:[.25,.9,.9],title:'Batería de arranque',text:'Da el impulso inicial para encender el motor. Si la batería falla, el generador no arranca aunque tenga combustible.'},
 {z:'plant',p:[2.5,1.58,3.0],t:[2.47,1.3,1.1],title:'Tablero de control del grupo',text:'Es el cerebro: vigila la red, ordena el arranque cuando falta la luz y cuida la temperatura y la presión del motor.'},
 {z:'plant',p:[3.7,1.58,2.7],t:[3.7,1.5,.4],title:'Tablero de transferencia',text:'Es el selector: pasa la fábrica de la red al generador, y de regreso, sin que las dos fuentes estén conectadas al mismo tiempo.'},
 {z:'plant',p:[1.4,1.58,4.9],t:[1.2,1.2,0],title:'¿Qué pasa cuando se va la luz?',text:'1) La red falla. 2) El control lo detecta. 3) El motor arranca. 4) Al estabilizarse, la transferencia conecta la fábrica al generador. 5) Al volver la red, se regresa y el motor se enfría y se apaga.'},
 {z:'yard',p:[14,8.3,5.4],t:[16.5,9.8,-.5],title:'Subestación',text:'Aquí entra la electricidad de la red en media tensión (13.8 kV). Hay interruptores, transformadores y protecciones. Esta zona nunca se toca con el equipo energizado.'},
 {z:'ccm',title:'Centro de control de motores (CCM)',text:'Es el tablero de la fábrica: reparte la electricidad a cada motor y lo protege de sobrecargas y cortocircuitos.'}];
let tour=null,glideId=0,padPrev={};
const body=document.body;
const tc=document.createElement('div');tc.id='tourCard';tc.hidden=true;document.body.append(tc);
const cs=document.createElement('style');cs.textContent=`
body.touring header,body.touring #sceneFooter,body.touring #viewbar,body.touring #nav33{opacity:0!important;pointer-events:none!important}
body.touring #work26 .w-top,body.touring #fpNav,body.touring .fp-hud,body.touring .fp-touch,body.touring #fpTarget,body.touring #fpCross,body.touring #fixCard,body.touring #fixRing{display:none!important}
#tourCard{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:2147482000;width:min(820px,94vw);background:#0b1722f4;border:1px solid #2b5362;border-top:4px solid #efc474;border-radius:10px;padding:18px 24px;color:#edf5f5;font-family:system-ui,Segoe UI,Arial,sans-serif;box-shadow:0 14px 44px #000a}
#tourCard{transition:opacity .45s}#tourCard.out{opacity:0;pointer-events:none}
#tourFade{position:fixed;inset:0;background:#02070b;opacity:0;pointer-events:none;z-index:2147482500;transition:opacity .85s ease}#tourFade.on{opacity:1;pointer-events:all}#tourFade{display:flex;align-items:center;justify-content:center}#tourFade span{color:#9fc5cb;font:600 16px system-ui,Segoe UI,Arial,sans-serif;letter-spacing:1px;opacity:0;transition:opacity .6s .5s}#tourFade.on span{opacity:1}
#tourCard .tc-n{font:700 12px ui-monospace,Consolas,monospace;letter-spacing:2px;color:#efc474}
#tourCard h3{margin:4px 0 6px;font-size:24px;color:#fff!important;text-transform:none!important;letter-spacing:normal!important}#tourCard p{margin:0;font-size:17px;line-height:1.5;color:#d6e6e8}
#tourCard .tc-b{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;align-items:center}
#tourCard button{background:#12303d;border:1px solid #2b5362;color:#e9fffb;border-radius:6px;padding:9px 16px;font:700 14px system-ui,Segoe UI,Arial,sans-serif;cursor:pointer}
#tourCard button.pri{background:#efc474;color:#10202a;border-color:#efc474}#tourCard .tc-k{margin-left:auto;color:#7f9ca3;font-size:12px}
@media(min-width:1500px){#tourCard h3{font-size:30px}#tourCard p{font-size:21px}#tourCard button{font-size:16px}}
#fixCard{position:fixed;left:14px;top:206px;z-index:31;width:min(340px,40vw);background:#0b1722f0;border:1px solid #2b5362;border-left:4px solid #efc474;border-radius:8px;padding:11px 14px;color:#edf5f5;font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:14px;line-height:1.4}
#fixCard .fx-h{display:flex;justify-content:space-between;gap:8px;font:700 11px ui-monospace,Consolas,monospace;letter-spacing:1.5px;color:#efc474}
#fixCard .fx-h button{background:none;border:0;color:#9fc5cb;font-size:14px;cursor:pointer;padding:0 4px}
#fixCard b.fx-t{display:block;font-size:17px;margin:3px 0 6px}#fixCard .fx-r{margin-top:6px;color:#cfe2e4}#fixCard .fx-r i{font-style:normal;font-weight:700;color:#efc474}
#fixCard.ok{border-left-color:#5fd6a0}
#fixRing{position:fixed;z-index:29;width:84px;height:84px;margin:-42px 0 0 -42px;border:4px solid #efc474;border-radius:50%;pointer-events:none;box-shadow:0 0 18px #efc474aa;animation:fxp 1.2s ease-in-out infinite;display:none}
#fixRing b{position:absolute;left:50%;top:-30px;transform:translateX(-50%);background:#efc474;color:#10202a;font:800 12px system-ui,Arial,sans-serif;padding:3px 8px;border-radius:4px;white-space:nowrap}
@keyframes fxp{0%,100%{transform:scale(.88);opacity:.85}50%{transform:scale(1.12);opacity:1}}
`;document.head.append(cs);
function enterZ(z){if(z==='plant'){try{Maintenance.resume33();}catch(e){}if(WalkCam.zone()!=='plant')WalkCam.enter('plant');}else{try{Maintenance.suspend33();}catch(e){}document.querySelector('#viewbar [data-nav="'+z+'"]')?.click();WalkCam.enter(z);}body.classList.add('touring');}
function aim(p,t){const dx=t[0]-p[0],dy=t[1]-p[1],dz=t[2]-p[2];return {yaw:Math.atan2(-dx,-dz),pitch:Math.max(-1.25,Math.min(1.25,Math.atan2(dy,Math.hypot(dx,dz))))};}
function glide(p,t){cancelAnimationFrame(glideId);const s=Walk31.state(),a=aim(p,t);let dy=a.yaw-s.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));const f=s.position,t0=performance.now(),ms=1100;
 const step=now=>{const k=Math.min(1,(now-t0)/ms),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;WalkCam.set([f[0]+(p[0]-f[0])*e,p[1],f[2]+(p[2]-f[2])*e],s.yaw+dy*e,s.pitch+(a.pitch-s.pitch)*e);if(k<1)glideId=requestAnimationFrame(step);};glideId=requestAnimationFrame(step);}
function render(){const st=stops[tour.i];const last=tour.i>=stops.length;
 if(last){tc.innerHTML='<div class="tc-n">FIN DEL RECORRIDO</div><h3>Ahora veamos la planta por dentro</h3><p>Sigue el despiece: cada pieza se separa para que veas cómo está hecha por dentro.</p><div class="tc-b"><button class="pri" id="tcDesp">Ver el despiece ▶</button><button id="tcRep">Repetir recorrido</button><button id="tcMenu">Volver al menú</button></div>';
  $$('tcDesp').onclick=toDespiece;$$('tcRep').onclick=()=>goStop(0);$$('tcMenu').onclick=leaveToMenu;return;}
 tc.innerHTML='<div class="tc-n">PARADA '+(tour.i+1)+' DE '+stops.length+'</div><h3>'+st.title+'</h3><p>'+st.text+'</p><div class="tc-b"><button id="tcPrev"'+(tour.i?'':' disabled')+'>◀ Anterior</button><button class="pri" id="tcNext">Siguiente ▶</button><button id="tcExit">Salir del recorrido</button><span class="tc-k">Enter / → siguiente · ← anterior · Esc salir</span></div>';
 $$('tcPrev').onclick=()=>goStop(tour.i-1);$$('tcNext').onclick=()=>goStop(tour.i+1);$$('tcExit').onclick=leaveToMenu;}
function goStop(i){if(!tour)return;i=Math.max(0,Math.min(stops.length,i));tour.i=i;if(i<stops.length){const st=stops[i];
  if(WalkCam.zone()!==st.z){enterZ(st.z);WalkCam.clean();body.classList.add('touring');if(st.p){const a=aim(st.p,st.t);WalkCam.set(st.p,a.yaw,a.pitch);}}
  else if(st.p)glide(st.p,st.t);}
 render();}
function startTour(){if(tour)return;try{document.exitPointerLock?.();}catch(e){}tour={i:0};body.classList.add('touring');WalkCam.clean();tc.hidden=false;
 if(WalkCam.zone()!=='plant')enterZ('plant');const st=stops[0],a=aim(st.p,st.t);WalkCam.set(st.p,a.yaw,a.pitch);WalkCam.clean();render();}
function exitTour(toMaint){if(!tour)return;cancelAnimationFrame(glideId);tour=null;tc.hidden=true;if(WalkCam.zone()!=='plant')enterZ('plant');body.classList.remove('touring');}
function cleanupTour(){cancelAnimationFrame(glideId);tour=null;tc.hidden=true;tc.classList.remove('out');body.classList.remove('touring');}
function leaveToMenu(){if(!tour)return;cleanupTour();try{Maintenance.close();}catch(e){}window.GameInterface&&GameInterface.openMenu(true);}
const fade=document.createElement('div');fade.id='tourFade';fade.innerHTML='<span>Preparando el despiece…</span>';document.body.append(fade);
let busy=false;
function toDespiece(){if(!tour||busy)return;busy=true;try{document.exitPointerLock?.();}catch(e){}
 tc.classList.add('out');glide([1.4,1.58,5.3],[1.2,1.1,0]);
 setTimeout(()=>{fade.classList.add('on');},800);
 setTimeout(()=>{cleanupTour();try{Maintenance.close();}catch(e){}
  const dlg=$$('plantPresentation');dlg.style.transition='none';dlg.style.opacity='0';
  const op=$$('openPlantPresentation');if(op)op.click();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{dlg.style.transition='opacity 1.3s ease';dlg.style.opacity='1';}));
  setTimeout(()=>{dlg.style.transition='';dlg.style.opacity='';fade.classList.remove('on');busy=false;},1700);},1700);}
window.Tour={hideTags:()=>!!tour&&(tour.i===0||tour.i===7||tour.i>=stops.length),toDespiece,start:startTour,exit:()=>exitTour(false),active:()=>!!tour,goto:goStop};
window.addEventListener('keydown',e=>{if(!tour||e.ctrlKey||e.metaKey||e.altKey)return;const c=e.code;
 if(busy){}
 else if(c==='Enter'||c==='Space'||c==='ArrowRight'||c==='NumpadEnter'){if(tour.i<stops.length)goStop(tour.i+1);else toDespiece();}
 else if(c==='ArrowLeft'||c==='Backspace'){goStop(tour.i-1);}
 else if(c==='Escape'){leaveToMenu();}
 else return;e.preventDefault();e.stopImmediatePropagation();},true);
setInterval(()=>{if(!tour)return;try{const l=navigator.getGamepads?navigator.getGamepads():[];const g=[...l].find(x=>x&&x.connected);if(!g)return;const b=i=>!!(g.buttons[i]&&g.buttons[i].pressed);
 const now={n:b(0)||b(5),p:b(1)||b(4),x:b(9)};if(now.n&&!padPrev.n){if(tour.i<stops.length)goStop(tour.i+1);else toDespiece();}if(now.p&&!padPrev.p)goStop(tour.i-1);if(now.x&&!padPrev.x)leaveToMenu();padPrev=now;}catch(e){}},120);
let tourIntent=false;const ge=$$('gameEnter');if(ge)ge.addEventListener('click',e=>{if(e.isTrusted)tourIntent=true;},true);

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
})();
