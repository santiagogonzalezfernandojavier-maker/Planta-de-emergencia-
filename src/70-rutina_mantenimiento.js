// v12 · Rutina de mantenimiento preventivo (mini juego por pasos). Reemplaza al recorrido anterior, que sigue disponible en «Más opciones».
(function(){
const $$=id=>document.getElementById(id);
const C=[2.47,1.25,1.1],B=[.25,.85,.9],OIL=[-.8,1.1,.85],RAD=[-2.3,1.3,0],AIR=[-.5,2.53,.6],GND=[1.2,.28,1.2],BAG=[.2,.1,3.05],ATS=[3.7,1.3,.5],FT=[1.0,.5,1.3],BL=[-1.6,1.3,.75];
const TOOLS=[['mano','Mano','hand'],['linterna','Linterna','light'],['pano','Paño','rag'],['llave','Llave','socket'],['cepillo','Cepillo','brush'],['multi','Multímetro','meter'],['candado','Candado y etiqueta','lock'],['repuesto','Repuesto','spare'],['cuaderno','Cuaderno','plan']];
const TL=Object.fromEntries(TOOLS.map(t=>[t[0],t[1]]));
const st=(t,p,tool,at,ok,ask)=>({t,p,tool,at,ok,ask});
const ask=(q,o,why)=>({q,o,a:0,why});
const TASKS=[
{n:'Permiso de trabajo y EPP',why:'Antes de tocar el equipo se define qué trabajo se hará y en qué estado está. El permiso deja constancia y avisa a operación.',steps:[
 st('Revisa el permiso de trabajo',C,'cuaderno','Tablero de control','Permiso firmado: red normal, grupo detenido.',ask('¿Qué debe cumplirse antes de intervenir el grupo?',['Red normal, grupo detenido y frío','Grupo en marcha para ver mejor las fugas','Basta con avisar de palabra'],'Con el grupo en marcha hay partes giratorias, gases y superficies calientes. El permiso se registra antes, no después.'))]},
{n:'Bloqueo y etiquetado',why:'En automático el grupo arranca solo si falla la red. Con el selector fuera de servicio y tu candado puesto, nadie puede arrancarlo mientras trabajas.',steps:[
 st('Gira el selector a FUERA DE SERVICIO',C,'mano','Tablero de control','Selector en fuera de servicio.'),
 st('Coloca tu candado y tu etiqueta en el selector',C,'candado','Tablero de control','Candado puesto: solo tú tienes la llave.'),
 st('Prueba de ausencia: pulsa ARRANCAR, no debe responder',C,'mano','Tablero de control','No responde. El bloqueo funciona.')]},
{n:'Aislar el arranque',why:'El motor de arranque toma una corriente muy alta de la batería. Abrir su seccionador evita arranques eléctricos y chispas cerca de los bornes.',steps:[
 st('Abre el seccionador del circuito de arranque',B,'mano','Batería','Circuito de arranque abierto.',ask('¿Qué evita abrir este seccionador al trabajar cerca de los bornes?',['Un arranque eléctrico y chispas','Que la batería se descargue','Que suba la tensión'],'La batería sigue cargada: lo que se aisló es el circuito de arranque.'))]},
{n:'Inspección visual de fugas',why:'Una fuga pequeña hoy puede ser una falla en la próxima emergencia. Se revisa con linterna, con el equipo detenido.',steps:[
 st('Revisa debajo del motor',[-.6,.45,1.0],'linterna','Bajo el motor','Seco, sin manchas.'),
 st('Revisa las mangueras de combustible',[.4,1.2,1.0],'linterna','Mangueras','Sin fugas ni grietas.'),
 st('Revisa las uniones del radiador',[-2.0,1.0,.4],'linterna','Unión del radiador','¡Gotas de refrigerante en la unión!'),
 st('Anota la fuga en la bitácora',[-2.0,1.0,.4],'cuaderno','Unión del radiador','Fuga anotada para reparación.',ask('¿Qué se hace con una fuga detectada?',['Se anota y se repara antes de dejar el equipo disponible','Se ignora si es pequeña','Se limpia y no se avisa'],'Una fuga sin atender deja al grupo sin refrigerante justo cuando hace falta.'))]},
{n:'Nivel de aceite',why:'El nivel se lee con el motor detenido. La primera extracción sale con salpicaduras; solo la segunda lectura, con la varilla limpia, es confiable.',steps:[
 st('Retira la varilla de aceite',OIL,'mano','Motor','Varilla fuera.'),
 st('Límpiala con el paño',OIL,'pano','Motor','Varilla limpia.'),
 st('Insértala completa y vuelve a retirarla',OIL,'mano','Motor','Lectura lista.',ask('¿Dónde quedó el nivel de aceite?',['Entre MIN y MAX','Debajo de MIN','Arriba de MAX'],'Poco aceite gripa el motor; demasiado hace espuma y sube la presión.'))]},
{n:'Nivel de refrigerante',why:'El refrigerante se revisa en el visor y siempre en frío. Con el motor caliente el tapón suelta vapor a presión.',steps:[
 st('Mira el nivel en el visor del radiador',RAD,'linterna','Radiador','Nivel visible en el visor.',ask('¿Cuál es el nivel correcto y en qué condición?',['Entre MIN y MAX, con el motor frío','Hasta el borde, con el motor caliente','No importa el nivel'],'Nunca abras el tapón de un motor caliente.')),
 st('Comprueba que el tapón esté firme',RAD,'mano','Radiador','Tapón firme.')]},
{n:'Combustible y agua',why:'El tanque debe estar casi lleno para tener autonomía en un corte largo. El agua se acumula en el separador y daña los inyectores.',steps:[
 st('Lee el indicador de combustible',FT,'linterna','Tanque','Tanque cerca del 90 %.',ask('¿Por qué conviene mantener el tanque casi lleno?',['Para tener autonomía en un corte largo','Para que pese más','Para enfriar el motor'],'La autonomía depende del combustible disponible.')),
 st('Abre la purga del separador para drenar el agua',FT,'llave','Separador de agua','Sale agua turbia.'),
 st('Cierra la purga',FT,'mano','Separador de agua','Purga cerrada.')]},
{n:'Bandas y mangueras',why:'Una banda floja patina y no mueve la bomba de agua ni el alternador de carga; una agrietada se rompe cuando el motor trabaja.',steps:[
 st('Presiona la banda a la mitad del tramo',BL,'mano','Banda','Cede unos 10 mm.',ask('La banda cede unos 10 mm. ¿Está bien?',['Sí, la tensión es normal','No, está muy floja','No, está muy tensa'],'Cerca de 10 mm es lo habitual; se confirma con el manual del equipo.')),
 st('Busca grietas o desgaste en la banda',BL,'linterna','Banda','Sin grietas.')]},
{n:'Filtro de aire',why:'El filtro retiene el polvo antes de que entre al motor. Uno tapado ahoga al motor; uno mal asentado deja pasar polvo que desgasta los cilindros.',steps:[
 st('Mira el indicador de restricción',AIR,'linterna','Filtro de aire','El indicador está en rojo.',ask('El indicador está en rojo. ¿Qué significa?',['El filtro está saturado y hay que cambiarlo','Todo está bien','Falta aceite'],'Rojo = restricción alta.')),
 st('Afloja los cierres de la tapa',AIR,'llave','Filtro de aire','Cierres flojos.'),
 st('Retira el filtro sucio',AIR,'mano','Filtro de aire','Filtro retirado.'),
 st('Instala el filtro nuevo',AIR,'repuesto','Filtro de aire','Filtro nuevo bien asentado.'),
 st('Aprieta los cierres',AIR,'llave','Filtro de aire','Tapa cerrada y sellada.')]},
{n:'Limpieza del radiador',why:'El aire atraviesa las aletas para sacar el calor del refrigerante. El polvo las tapa y el motor se sobrecalienta justo en una emergencia.',steps:[
 st('Cepilla las aletas de arriba',[-2.3,1.65,0],'cepillo','Radiador · arriba','Aletas de arriba limpias.'),
 st('Cepilla la parte central',[-2.3,1.3,0],'cepillo','Radiador · centro','Centro limpio.'),
 st('Cepilla la parte baja',[-2.3,.95,0],'cepillo','Radiador · abajo','Radiador limpio, sin doblar aletas.')]},
{n:'Batería y cargador',why:'Un borne sucio aumenta la resistencia y la batería no da corriente al arrancar, aunque esté cargada. Se mide con la batería en reposo.',steps:[
 st('Limpia el borne positivo',[.2,.88,.85],'cepillo','Borne +','Borne + limpio.'),
 st('Limpia el borne negativo',[.34,.88,.85],'cepillo','Borne −','Borne − limpio.'),
 st('Mide la tensión en reposo (V DC)',B,'multi','Batería','12.6 V',ask('El multímetro marca 12.6 V. ¿Qué indica?',['Batería con carga completa','Batería descargada','Batería en corto'],'12.6 V es carga completa en una batería de plomo-ácido de 12 V (valor orientativo).')),
 st('Verifica el LED del cargador: verde = flotación',[.9,1.0,.9],'linterna','Cargador','LED verde: cargador en flotación.')]},
{n:'Unión a tierra',why:'La unión de protección conecta la carcasa a tierra para que una falla haga actuar la protección y no energice la estructura.',steps:[
 st('Inspecciona terminal y conductor',GND,'linterna','Unión a tierra','Sin corrosión ni daño visible.'),
 st('Comprueba que la terminal esté firme',GND,'mano','Unión a tierra','Terminal firme.',ask('¿Para qué sirve la tierra del equipo?',['Hace actuar la protección en una falla','Aumenta la potencia','Enfría el alternador'],'Es una inspección visual: no sustituye la medición de continuidad.'))]},
{n:'Cierre del trabajo',why:'Una herramienta olvidada dentro del equipo es un riesgo al arrancar. El bloqueo lo retira quien lo puso, cuando el área está libre.',steps:[
 st('Cuenta y guarda tus herramientas en la bolsa',BAG,'mano','Bolsa de herramientas','Todas las herramientas están.',ask('¿Por qué se cuentan las herramientas al terminar?',['Una olvidada puede dañar el equipo al arrancar','Para no perderlas por costo','Es opcional'],'Un paño en el ventilador o una llave sobre los bornes puede causar una falla grave.')),
 st('Retira tu candado y tu etiqueta',C,'candado','Tablero de control','Bloqueo retirado por quien lo puso.'),
 st('Gira el selector a AUTOMÁTICO',C,'mano','Tablero de control','Grupo disponible en automático.')]},
{n:'Prueba de transferencia',why:'Tras el mantenimiento se prueba todo el sistema: el grupo detecta la falla, arranca, estabiliza y toma la carga. Así se sabe que funciona antes de la emergencia real.',steps:[
 st('Simula una falla de red en el tablero de transferencia',ATS,'mano','Tablero de transferencia','Falla de red simulada. Mira cómo responde la planta.')]}
];
let on=false,ti=0,si=0,errs=0,tscore=[],msgT=0,tool='mano',choice=null,cur=null;
const el={};
const CSS=`body.rutina-on #work26,body.rutina-on #fixCard,body.rutina-on #fixRing,body.rutina-on #walkWelcome,body.rutina-on .fp-hud,body.rutina-on #fpNav,body.rutina-on #fpTarget,body.rutina-on #walkTags,body.rutina-on #fpCross{display:none!important}
#rtPanel{position:fixed;left:14px;top:196px;z-index:40;width:min(340px,32vw);background:#0b0b0af2;border:2px solid #3a3720;border-left:8px solid #ffc400;color:#f4f1e4;font-family:Bahnschrift,"Segoe UI",Arial,sans-serif;padding:12px 14px;display:none}
#rtPanel h3{margin:0 0 2px;font:400 21px Impact,Bahnschrift,sans-serif;letter-spacing:.5px;color:#ffc400;text-transform:uppercase}
#rtPanel .rt-k{font:700 12px Bahnschrift,Arial,sans-serif;color:#b9b49a;letter-spacing:1px}
#rtPanel ol{list-style:none;margin:8px 0 6px;padding:0}#rtPanel li{display:flex;gap:8px;font-size:15px;line-height:1.3;padding:4px 0;color:#8f8b78}
#rtPanel li::before{content:"○";color:#8f8b78}#rtPanel li.done{color:#d8d4be}#rtPanel li.done::before{content:"✔";color:#ffc400}
#rtPanel li.cur{color:#fff;font-weight:700}#rtPanel li.cur::before{content:"▶";color:#ffc400}
#rtPanel .rt-w{font-size:13px;color:#b9b49a;line-height:1.4;border-top:1px solid #3a3720;padding-top:8px;margin-top:6px}
#rtPanel .rt-x{position:absolute;right:8px;bottom:8px;background:none;border:1px solid #3a3720;color:#b9b49a;font:700 11px Bahnschrift,Arial,sans-serif;padding:3px 8px;cursor:pointer}
#rtBar{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:40;display:none;gap:6px}
#rtBar button{position:relative;min-width:84px;padding:18px 8px 8px;background:#12120f;border:2px solid #3a3720;color:#f4f1e4;font:700 13px Bahnschrift,Arial,sans-serif;cursor:pointer}
#rtBar button i{position:absolute;left:5px;top:3px;font:800 11px Bahnschrift,Arial,sans-serif;font-style:normal;background:#f4f1e4;color:#000;padding:0 5px;border-radius:3px}
#rtBar button.sel{border-color:#ffc400;background:#4a4210;transform:translateY(-8px)}#rtBar button.need::after{content:"AQUÍ";position:absolute;right:4px;top:3px;font:800 10px Bahnschrift;background:#ffc400;color:#000;padding:0 4px;animation:rtp 1s infinite}
@keyframes rtp{50%{opacity:.35}}
#rtMsg{position:fixed;left:50%;bottom:104px;transform:translateX(-50%);z-index:41;display:none;max-width:min(680px,90vw);padding:10px 18px;font:700 clamp(15px,1.3vw,19px) Bahnschrift,"Segoe UI",Arial,sans-serif;text-align:center}
#rtMsg.ok{background:#ffc400;color:#000}#rtMsg.bad{background:#b3261e;color:#fff}
#rtChoice,#rtEnd,#rtIntro{position:fixed;inset:0;z-index:60;display:none;place-items:center;background:#000b;font-family:Bahnschrift,"Segoe UI",Arial,sans-serif;color:#f4f1e4}
.rt-card{width:min(640px,92vw);background:#0b0b0a;border:2px solid #ffc400;border-left:10px solid #ffc400;padding:20px 24px;max-height:90vh;overflow:auto}
.rt-card h2{margin:0 0 10px;font:400 30px Impact,Bahnschrift,sans-serif;color:#ffc400;text-transform:uppercase}
.rt-card p{margin:0 0 12px;font-size:17px;line-height:1.4}.rt-card .rt-opt{display:block;width:100%;text-align:left;margin:6px 0;padding:12px 14px;background:#17160e;border:2px solid #3a3720;color:#f4f1e4;font:600 17px Bahnschrift,Arial,sans-serif;cursor:pointer}
.rt-card .rt-opt:hover,.rt-card .rt-opt:focus-visible{border-color:#ffc400;background:#4a4210;outline:none}
.rt-card .rt-why{font-size:15px;color:#d8d4be;border-top:1px solid #3a3720;padding-top:10px}
.rt-card .rt-go{margin-top:10px;padding:12px 22px;background:#ffc400;color:#000;border:0;font:800 17px Bahnschrift,Arial,sans-serif;cursor:pointer}
.rt-card .rt-go.alt{background:#17160e;color:#f4f1e4;border:2px solid #3a3720}
.rt-card kbd{background:#f4f1e4;color:#000;border-bottom:3px solid #8d8a78;border-radius:3px;padding:1px 7px;font:800 14px Bahnschrift,Arial,sans-serif}
.rt-star{color:#ffc400;letter-spacing:2px}.rt-row{display:flex;justify-content:space-between;gap:12px;padding:4px 0;border-bottom:1px solid #2a2818;font-size:16px}
@media(max-width:900px){#rtPanel{width:min(300px,50vw)}#rtBar button{min-width:60px;font-size:11px}}`;
function ui(){
 if(el.panel)return;const s=document.createElement('style');s.textContent=CSS;document.head.append(s);
 const mk=(id,tag='div')=>{const e=document.createElement(tag);e.id=id;document.body.append(e);return e;};
 el.panel=mk('rtPanel');el.bar=mk('rtBar');el.msg=mk('rtMsg');el.choice=mk('rtChoice');el.end=mk('rtEnd');el.intro=mk('rtIntro');
 el.bar.innerHTML=TOOLS.map((t,i)=>'<button data-t="'+t[0]+'"><i>'+(i+1)+'</i>'+t[1]+'</button>').join('');
 el.bar.addEventListener('click',e=>{const b=e.target.closest('button');if(b)setTool(b.dataset.t);});
}
const step=()=>TASKS[ti]&&TASKS[ti].steps[si];
function sfx(k){try{window.HUD&&HUD.sfx(k);}catch(e){}}
function say(t,kind){el.msg.textContent=t;el.msg.className=kind||'ok';el.msg.style.display='block';clearTimeout(msgT);msgT=setTimeout(()=>{el.msg.style.display='none';},kind==='bad'?3600:2600);}
function setTool(k){if(!TL[k])return;tool=k;try{const m=TOOLS.find(t=>t[0]===k)[2];Maintenance.select&&Maintenance.select(m);}catch(e){}paintBar();}
function paintBar(){const s=step();[...el.bar.children].forEach(b=>{b.classList.toggle('sel',b.dataset.t===tool);b.classList.toggle('need',!!(s&&s.tool===b.dataset.t&&tool!==s.tool));});}
function paintPanel(){const t=TASKS[ti];if(!t)return;
 el.panel.innerHTML='<button class="rt-x" id="rtExit">Salir</button><div class="rt-k">TAREA '+(ti+1)+' DE '+TASKS.length+'</div><h3>'+t.n+'</h3><ol>'+t.steps.map((x,i)=>'<li class="'+(i<si?'done':i===si?'cur':'')+'">'+x.t+'</li>').join('')+'</ol><div class="rt-w"><b>Por qué:</b> '+t.why+'</div>';
 $$('rtExit').onclick=()=>leave(true);
 const s=step();window.__rutinaTarget=s?{pos:s.p,label:s.at,verb:'Aquí: '}:null;paintBar();}
function stars(e){return e===0?3:e<=1?2:1;}
function finishTask(){const sc=stars(errs);tscore.push(sc);try{HUD.award(20*sc,'tarea '+(ti+1));}catch(e){}errs=0;ti++;si=0;
 if(ti>=TASKS.length){showEnd();return;}paintPanel();}
function act(){if(!on||choice)return;const s=step();if(!s)return;
 const wp=new T.Vector3(s.p[0],s.p[1],s.p[2]),to=wp.clone().sub(camera.position),d=to.length(),fwd=new T.Vector3();camera.getWorldDirection(fwd);const a=to.normalize().angleTo(fwd);
 if(d>2.6){say('Acércate más: estás a '+d.toFixed(1)+' m.','bad');return;}
 if(a>.32){say('Mira hacia la señal amarilla y vuelve a pulsar.','bad');return;}
 if(tool!==s.tool){errs++;sfx('err');say('Con eso no. Aquí necesitas: '+TL[s.tool]+'.','bad');paintBar();return;}
 sfx('ok');say('✔ '+s.ok,'ok');
 const after=()=>{si++;if(si>=TASKS[ti].steps.length)finishTask();else paintPanel();};
 if(s.ask)askQ(s.ask,after);else after();}
function askQ(q,after){choice=q;el.choice.innerHTML='<div class="rt-card"><h2>Pregunta rápida</h2><p>'+q.q+'</p><div id="rtOpts"></div><div class="rt-why" id="rtWhy" hidden></div></div>';
 const opts=q.o.map((o,i)=>({o,i}));for(let i=opts.length-1;i>0;i--){const j=(i*7+3)%(i+1);[opts[i],opts[j]]=[opts[j],opts[i]];}
 const box=$$('rtOpts');opts.forEach((x,k)=>{const b=document.createElement('button');b.className='rt-opt';b.textContent=(k+1)+'. '+x.o;b.onclick=()=>{
  if(x.i===q.a){sfx('ok');box.innerHTML='';const w=$$('rtWhy');w.hidden=false;w.innerHTML='<b>Correcto.</b> '+q.why+'<br><button class="rt-go" id="rtOk">Continuar</button>';$$('rtOk').focus();$$('rtOk').onclick=()=>{choice=null;el.choice.style.display='none';after();};}
  else{errs++;sfx('err');b.disabled=true;b.style.opacity=.45;b.textContent+='  ✘ Intenta otra vez';}};box.append(b);});
 el.choice.style.display='grid';box.firstChild&&box.firstChild.focus();}
function showEnd(){window.__rutinaTarget=null;const tot=tscore.reduce((a,b)=>a+b,0),mx=TASKS.length*3;try{HUD.award(Math.round(tot/mx*100),'rutina completa');}catch(e){}
 el.end.innerHTML='<div class="rt-card"><h2>Rutina terminada</h2><p>Puntaje: <b>'+tot+' de '+mx+' estrellas</b>. Cada tarea vale hasta 3: pierdes una por cada error.</p>'+TASKS.map((t,i)=>'<div class="rt-row"><span>'+(i+1)+'. '+t.n+'</span><span class="rt-star">'+'★'.repeat(tscore[i])+'☆'.repeat(3-tscore[i])+'</span></div>').join('')+'<button class="rt-go" id="rtTest">Ver la prueba de transferencia</button> <button class="rt-go alt" id="rtAgain">Repetir la rutina</button> <button class="rt-go alt" id="rtMenu">Volver al menú</button></div>';
 el.end.style.display='grid';el.panel.style.display=el.bar.style.display='none';try{document.exitPointerLock();}catch(e){}
 $$('rtTest').onclick=()=>{el.end.style.display='none';leave(false);try{document.querySelector('#viewbar [data-nav="emergency"]').click();UnidadVII.test('transfer');}catch(e){}};
 $$('rtAgain').onclick=()=>{el.end.style.display='none';start();};
 $$('rtMenu').onclick=()=>{el.end.style.display='none';leave(true);};}
function leave(menu){on=false;choice=null;window.__rutinaTarget=null;document.body.classList.remove('rutina-on');el.panel.style.display=el.bar.style.display=el.msg.style.display=el.choice.style.display=el.intro.style.display='none';
 try{Maintenance.close();}catch(e){}if(menu){try{GameInterface.openMenu(true);}catch(e){}}}
function start(){ui();on=true;ti=0;si=0;errs=0;tscore=[];tool='mano';choice=null;document.body.classList.add('rutina-on');paintPanel();el.panel.style.display='block';el.bar.style.display='flex';setTool('mano');
 el.intro.innerHTML='<div class="rt-card"><h2>Rutina de mantenimiento</h2><p>Eres el técnico. Vas a hacer, en orden, el mantenimiento preventivo del grupo electrógeno. Sigue la señal amarilla.</p><p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> caminar · <b>Ratón</b> mirar · <kbd>1</kbd>–<kbd>9</kbd> elegir herramienta · <kbd>E</kbd> o clic para usarla · <kbd>Esc</kbd> soltar el ratón</p><p class="rt-why">Cada paso pide una herramienta distinta: la correcta se marca con «AQUÍ» en la barra de abajo. Si te equivocas pierdes estrellas, pero siempre puedes seguir.</p><button class="rt-go" id="rtGo">Empezar</button></div>';
 el.intro.style.display='grid';$$('rtGo').focus();$$('rtGo').onclick=()=>{el.intro.style.display='none';};}
// Entradas: teclado, clic y control
window.addEventListener('keydown',e=>{if(!on)return;
 if(el.intro.style.display==='grid'&&(e.code==='Enter'||e.code==='Space')){e.preventDefault();e.stopImmediatePropagation();el.intro.style.display='none';return;}
 if(choice){if(/^Digit[1-9]$/.test(e.code)){const b=$$('rtOpts')&&$$('rtOpts').children[+e.code.slice(5)-1];if(b){e.preventDefault();e.stopImmediatePropagation();b.click();}}return;}
 if(el.intro.style.display==='grid'||el.end.style.display==='grid')return;
 if(/^Digit[1-9]$/.test(e.code)){e.preventDefault();e.stopImmediatePropagation();setTool(TOOLS[+e.code.slice(5)-1][0]);}
 else if(e.code==='KeyE'&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();act();}
},true);
window.addEventListener('pointerdown',e=>{if(!on||choice||e.button!==0)return;if(document.pointerLockElement&&e.target===document.pointerLockElement){e.preventDefault();e.stopImmediatePropagation();act();}},true);
let pv={a:0,l:0,r:0};setInterval(()=>{if(!on)return;let g=null;try{const l=navigator.getGamepads?navigator.getGamepads():[];for(const x of l)if(x){g=x;break;}}catch(e){return;}if(!g)return;
 const a=g.buttons[0]&&g.buttons[0].pressed?1:0,l=g.buttons[4]&&g.buttons[4].pressed?1:0,r=g.buttons[5]&&g.buttons[5].pressed?1:0,i=TOOLS.findIndex(t=>t[0]===tool);
 if(a&&!pv.a){if(choice){const b=document.activeElement;b&&b.click&&b.click();}else act();}
 if(l&&!pv.l)setTool(TOOLS[(i+TOOLS.length-1)%TOOLS.length][0]);if(r&&!pv.r)setTool(TOOLS[(i+1)%TOOLS.length][0]);pv={a,l,r};},90);
// La rutina empieza sola cuando el recorrido en planta arranca desde el menú (a menos que se haya elegido la práctica clásica).
window.RutinaMantenimiento={start,leave,state:()=>({on,tarea:ti,paso:si,errores:errs,estrellas:tscore.slice()}),skip:()=>{if(!on)return;si=TASKS[ti].steps.length;finishTask();}};
setInterval(()=>{if(on||window.__rutinaClasica)return;let w=null,m=null;try{w=Walk31.state();m=Maintenance.state();}catch(e){}
 if(w&&w.active&&w.zone==='plant'&&m&&m.active&&!m.finished&&!document.querySelector('dialog[open]')&&!window.gameMenuActive&&!window.__rutinaDone){window.__rutinaDone=true;start();}
 if(!w||!w.active)window.__rutinaDone=false;},400);
})();
