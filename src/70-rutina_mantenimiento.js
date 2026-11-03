// v12 · Rutina de mantenimiento preventivo (mini juego por pasos). Reemplaza al recorrido anterior, que sigue disponible en «Más opciones».
(function(){
const $$=id=>document.getElementById(id);
const C=[2.47,1.25,1.1],B=[.25,.85,.9],OIL=[-.8,1.1,.85],RAD=[-2.3,1.3,0],AIR=[-.5,2.53,.6],GND=[1.2,.28,1.2],BAG=[.2,.1,3.05],ATS=[3.7,1.3,.5],FT=[1.0,.5,1.3],BL=[-1.6,1.3,.75];
const TOOLS=[['mano','Mano','hand'],['linterna','Linterna','light'],['pano','Paño','rag'],['llave','Llave','socket'],['cepillo','Cepillo','brush'],['multi','Multímetro','meter'],['candado','Candado y etiqueta','lock'],['repuesto','Repuesto','spare'],['cuaderno','Cuaderno','plan']];
const ICON={mano:'<path d="M12 33V21M17 33V12M22 33V9M27 33V14M12 21q0-4 3-4M27 33q5-2 5-10l-2-5"/>',linterna:'<rect x="6" y="16" width="18" height="9" rx="2"/><path d="M24 13l9-4v22l-9-4z"/><path d="M35 15l3-2M35 20h3M35 25l3 2"/>',pano:'<path d="M7 11h26v18q-6.5 5-13 0t-13 0z"/><path d="M12 17h16"/>',llave:'<circle cx="12" cy="12" r="6"/><path d="M16.5 16.5L33 33M9 7l3 4"/>',cepillo:'<rect x="6" y="23" width="28" height="8" rx="2"/><path d="M10 23v-8M16 23v-8M22 23v-8M28 23v-8"/>',multi:'<rect x="10" y="5" width="20" height="30" rx="3"/><rect x="14" y="9" width="12" height="8"/><circle cx="20" cy="27" r="4"/>',candado:'<rect x="9" y="18" width="22" height="15" rx="2"/><path d="M13 18v-5a7 7 0 0 1 14 0v5"/><circle cx="20" cy="25" r="2"/>',repuesto:'<rect x="9" y="7" width="22" height="26" rx="2"/><path d="M14 7v26M20 7v26M26 7v26"/>',cuaderno:'<rect x="11" y="5" width="19" height="30" rx="2"/><path d="M15 12h11M15 18h11M15 24h8"/>'};
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
const kick={ok:0,err:0,draw:0};let on=false,ti=0,si=0,errs=0,stepErrs=0,streak=0,hold=null,tscore=[],msgT=0,tool='mano',choice=null,cur=null;
const el={};
const CSS=`body.rutina-on #work26,body.rutina-on #fixCard,body.rutina-on #fixRing,body.rutina-on #walkWelcome,body.rutina-on .fp-hud,body.rutina-on #fpNav,body.rutina-on #fpTarget,body.rutina-on #walkTags,body.rutina-on #fpCross{display:none!important}
#rtPanel{position:fixed;left:14px;top:150px;z-index:40;width:min(310px,30vw);display:none;background:#4a331c;border-radius:8px;padding:26px 10px 10px;box-shadow:0 10px 24px #000a,inset 0 0 0 2px #2c1d0e;font-family:"Segoe Print","Bradley Hand ITC","Marker Felt","Comic Sans MS",cursive}
#rtPanel::before{content:"";position:absolute;left:50%;top:-6px;width:92px;height:26px;transform:translateX(-50%);background:linear-gradient(#d7dcdf,#8b959b);border-radius:6px 6px 3px 3px;box-shadow:0 2px 4px #0008}
#rtPanel::after{content:"";position:absolute;left:50%;top:6px;width:44px;height:7px;transform:translateX(-50%);background:#4a331c;border-radius:4px}
#rtPanel .cb-p{background:repeating-linear-gradient(#f6f1dc 0 25px,#d9d3b8 25px 26px);color:#2b2a24;padding:10px 12px 12px;border-radius:2px;position:relative}
#rtPanel .rt-k{font:700 11px Bahnschrift,Arial,sans-serif;color:#7a7357;letter-spacing:1px;display:flex;justify-content:space-between}
#rtPanel h3{margin:2px 0 6px;font:700 18px/1.15 "Segoe Print","Bradley Hand ITC","Marker Felt","Comic Sans MS",cursive;color:#1b3d6b}
#rtPanel ol{list-style:none;margin:6px 0;padding:0}#rtPanel li{display:flex;gap:8px;font-size:14px;line-height:1.35;padding:3px 0;color:#7a7357}
#rtPanel li::before{content:"☐";color:#7a7357;font-size:16px}#rtPanel li.done{color:#2f6b3f;text-decoration:line-through;text-decoration-color:#2f6b3f88}
#rtPanel li.done::before{content:"☑";color:#1d7a3a;text-decoration:none}
#rtPanel li.cur{color:#1b1a14;font-weight:700;background:linear-gradient(transparent 55%,#ffe14d 55%)}#rtPanel li.cur::before{content:"✎";color:#b3261e}
#rtPanel .rt-w{margin-top:8px;font:13px/1.35 "Segoe Print","Bradley Hand ITC","Comic Sans MS",cursive;background:#ffe27a;color:#3b3200;padding:8px 10px;transform:rotate(-1.2deg);box-shadow:0 3px 6px #0004}
#rtPanel .cb-dots{display:flex;gap:4px;margin-top:8px;flex-wrap:wrap}#rtPanel .cb-dots i{width:12px;height:12px;border-radius:50%;background:#d1ccb0;display:block}#rtPanel .cb-dots i.on{background:#ffc400}#rtPanel .cb-dots i.cur{box-shadow:0 0 0 2px #1b3d6b}
#rtPanel .rt-x{position:absolute;right:16px;bottom:16px;background:#fffbe8;border:1px solid #a9a37f;color:#5a543c;font:700 11px Bahnschrift,Arial,sans-serif;padding:3px 8px;cursor:pointer}
#rtBar{display:none!important;position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:40;display:none;gap:5px;padding:12px 14px 8px;background:linear-gradient(#5b3b1e,#3a2410);border-radius:12px 12px 6px 6px;border:2px solid #20130a;box-shadow:inset 0 2px 0 #8b5e33,0 8px 18px #000a}
#rtBar::before{content:"";position:absolute;left:6px;right:6px;top:5px;height:0;border-top:2px dashed #c79a5b}
#rtBar button{position:relative;width:78px;height:86px;padding:8px 2px 4px;background:linear-gradient(#2c1a0b,#1a0f06);border:2px solid #120a04;border-radius:5px 5px 16px 16px;color:#e9d9bf;font:700 11px Bahnschrift,Arial,sans-serif;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:2px;transition:transform .12s}
#rtBar button svg{width:38px;height:38px;stroke:#f4f1e4;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;transition:transform .15s;margin-bottom:auto}
#rtBar button i{position:absolute;left:4px;top:3px;font:800 10px Bahnschrift,Arial,sans-serif;font-style:normal;background:#f4f1e4;color:#000;padding:0 4px;border-radius:3px}
#rtBar button:hover{transform:translateY(-3px)}
#rtBar button.sel{transform:translateY(-12px);border-color:#ffc400;background:linear-gradient(#5a4a10,#2b2208);box-shadow:0 0 14px #ffc40088}#rtBar button.sel svg{transform:translateY(-10px) scale(1.3);stroke:#ffc400}
#rtBar button.need svg{animation:rtp 1s infinite;stroke:#ffc400}
@keyframes rtp{50%{opacity:.4}}
#rtTags{position:fixed;inset:0;z-index:40;pointer-events:none;display:none}
#rtTags b{position:absolute;transform:translate(-50%,-100%);background:#0b0b0af0;color:#f4f1e4;border:2px solid #3a3720;padding:2px 8px;font:700 13px Bahnschrift,Arial,sans-serif;white-space:nowrap}
#rtTags b i{font-style:normal;background:#ffc400;color:#000;padding:0 5px;margin-right:6px;border-radius:3px}
#rtTags b.sel{border-color:#ffc400;color:#ffc400}#rtTags b.need{animation:rtp 1s infinite;border-color:#ffc400}
#rtRing{position:fixed;left:50%;top:50%;width:84px;height:84px;margin:-42px 0 0 -42px;border-radius:50%;z-index:42;display:none;background:conic-gradient(#ffc400 calc(var(--p,0)*1%),#0008 0);-webkit-mask:radial-gradient(circle,transparent 30px,#000 31px);mask:radial-gradient(circle,transparent 30px,#000 31px)}
#rtCross{position:fixed;left:50%;top:50%;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:#fff;box-shadow:0 0 0 2px #000a;z-index:41;display:none}
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
 el.bar.innerHTML=TOOLS.map((t,i)=>'<button data-t="'+t[0]+'"><i>'+(i+1)+'</i><svg viewBox="0 0 40 40">'+ICON[t[0]]+'</svg>'+t[1]+'</button>').join('');
 el.tags=mk('rtTags');el.tags.innerHTML=TOOLS.map((t,i)=>'<b data-t="'+t[0]+'"><i>'+(i+1)+'</i>'+t[1]+'</b>').join('');el.ring=mk('rtRing');el.cross=mk('rtCross');
 el.bar.addEventListener('click',e=>{const b=e.target.closest('button');if(b)setTool(b.dataset.t);});
}
const step=()=>TASKS[ti]&&TASKS[ti].steps[si];
function sfx(k){try{window.HUD&&HUD.sfx(k);}catch(e){}}
function say(t,kind){el.msg.textContent=t;el.msg.className=kind||'ok';el.msg.style.display='block';clearTimeout(msgT);msgT=setTimeout(()=>{el.msg.style.display='none';},kind==='bad'?3600:2600);}
function setTool(k){if(!TL[k])return;if(k!==tool){kick.draw=1;try{if(on&&el.msg)say('En mano: '+TL[k],'ok');}catch(e){}}tool=k;try{const m=TOOLS.find(t=>t[0]===k)[2];Maintenance.select&&Maintenance.select(m);}catch(e){}paintBar();}
function paintBar(){const s=step();[...el.bar.children].forEach(b=>{b.classList.toggle('sel',b.dataset.t===tool);b.classList.toggle('need',!!(s&&stepErrs>=2&&s.tool===b.dataset.t&&tool!==s.tool));});}
function paintPanel(){const t=TASKS[ti];if(!t)return;
 el.panel.innerHTML='<div class="cb-p"><div class="rt-k"><span>TAREA '+(ti+1)+' DE '+TASKS.length+'</span><span>'+(streak>=2?'🔥 racha ×'+streak:'')+'</span></div><h3>'+t.n+'</h3><ol>'+t.steps.map((x,i)=>'<li class="'+(i<si?'done':i===si?'cur':'')+'">'+x.t+'</li>').join('')+'</ol><div class="rt-w">'+t.why+'</div><div class="cb-dots">'+TASKS.map((_,i)=>'<i class="'+(i<ti?'on':'')+(i===ti?' cur':'')+'"></i>').join('')+'</div><button class="rt-x" id="rtExit">Salir</button></div>';
 $$('rtExit').onclick=()=>leave(true);
 const s=step();window.__rutinaTarget=s?({pos:s.p,label:s.at,verb:'Aquí: '}):null;paintBar();}
function stars(e){return e===0?3:e<=1?2:1;}
function finishTask(){stepErrs=0;const sc=stars(errs);tscore.push(sc);try{HUD.award(20*sc,'tarea '+(ti+1));}catch(e){}errs=0;ti++;si=0;
 if(ti>=TASKS.length){showEnd();return;}paintPanel();}
const DUR={mano:.45,linterna:.9,pano:1.1,llave:1.4,cepillo:1.7,multi:1.1,candado:.8,repuesto:1.0,cuaderno:.8};
function stepNear(){const s=step();if(!s)return false;const {d,a}=aimInfo(s);return d<2.6&&a<Math.max(.45,aimTol(d)+.1);}
// la señal flota sobre el objetivo, así que se acepta apuntar al punto o a la marca; y de cerca el margen es mayor (un objeto a 1 m queda lejos del centro con un giro pequeño)
function aimTol(d){return Math.min(.9,Math.max(.34,Math.atan2(.7,Math.max(.4,d))));}
function aimInfo(s){const wp=new T.Vector3(s.p[0],s.p[1],s.p[2]),mk=wp.clone();mk.y+=.3;const fwd=new T.Vector3();camera.getWorldDirection(fwd);
 const t1=wp.clone().sub(camera.position),t2=mk.sub(camera.position),d=t1.length();t1.normalize();t2.normalize();
 const a1=t1.angleTo(fwd),a2=t2.angleTo(fwd);return{d,a:Math.min(a1,a2),dy:t1.y-fwd.y};}
function wrong(msg){errs++;stepErrs++;streak=0;sfx('err');say(msg,'bad');kick.err=1;paintBar();paintPanel();}
function begin(){if(!on||choice||hold||beltWant)return;const s=step();if(!s)return;const {d,a,dy}=aimInfo(s);
 if(d>2.6){say('Acércate más: estás a '+d.toFixed(1)+' m.','bad');return;}
 if(a>aimTol(d)){say(dy<-.12?'Baja la mirada hacia la señal amarilla y vuelve a pulsar.':dy>.12?'Sube la mirada hacia la señal amarilla y vuelve a pulsar.':'Gira hacia la señal amarilla y vuelve a pulsar.','bad');return;}
 if(tool!==s.tool){wrong(s.tool==='mano'?'Aquí necesitas las manos libres: pulsa Q para guardar lo que llevas.':'Con eso no. Aquí necesitas: '+TL[s.tool]+'. Mantén Q para sacarla de tu porta herramientas.');return;}
 hold={s,t:0,dur:DUR[tool]||.6,tick:0};if(tool==='cuaderno')lastLines=0;el.ring.style.display='block';el.cross.style.display='none';}
function cancel(msg){if(!hold)return;hold=null;el.ring.style.display='none';if(msg)say(msg,'bad');}
function complete(s){hold=null;el.ring.style.display='none';streak++;stepErrs=0;sfx('ok');say('✔ '+s.ok,'ok');kick.ok=1;
 try{if(streak>=3)HUD.float('🔥 Racha ×'+streak);else HUD.float('+5');}catch(e){}
 const after=()=>{si++;if(si>=TASKS[ti].steps.length)finishTask();else paintPanel();};
 if(s.ask)askQ(s.ask,after);else after();}
function holdTick(dt){if(!hold)return;const {d,a}=aimInfo(hold.s);if(d>2.8||a>.5){cancel('Te moviste: vuelve a intentarlo.');return;}
 hold.t+=dt;hold.tick+=dt;if(hold.tick>(tool==='cepillo'?.13:.28)){hold.tick=0;sfx('click');}
 el.ring.style.setProperty('--p',Math.min(100,hold.t/hold.dur*100));if(hold.t>=hold.dur)complete(hold.s);}
function askQ(q,after){choice=q;el.choice.innerHTML='<div class="rt-card"><h2>Pregunta rápida</h2><p>'+q.q+'</p><div id="rtOpts"></div><div class="rt-why" id="rtWhy" hidden></div></div>';
 const opts=q.o.map((o,i)=>({o,i}));for(let i=opts.length-1;i>0;i--){const j=(i*7+3)%(i+1);[opts[i],opts[j]]=[opts[j],opts[i]];}
 const box=$$('rtOpts');opts.forEach((x,k)=>{const b=document.createElement('button');b.className='rt-opt';b.textContent=(k+1)+'. '+x.o;b.onclick=()=>{
  if(x.i===q.a){sfx('ok');box.innerHTML='';const w=$$('rtWhy');w.hidden=false;w.innerHTML='<b>Correcto.</b> '+q.why+'<br><button class="rt-go" id="rtOk">Continuar</button>';$$('rtOk').focus();$$('rtOk').onclick=()=>{choice=null;el.choice.style.display='none';after();};}
  else{errs++;stepErrs++;streak=0;sfx('err');b.disabled=true;b.style.opacity=.45;b.textContent+='  ✘ Intenta otra vez';}};box.append(b);});
 el.choice.style.display='grid';box.firstChild&&box.firstChild.focus();}
function showEnd(){window.__rutinaTarget=null;const tot=tscore.reduce((a,b)=>a+b,0),mx=TASKS.length*3;try{HUD.award(Math.round(tot/mx*100),'rutina completa');}catch(e){}
 el.end.innerHTML='<div class="rt-card"><h2>Rutina terminada</h2><p>Puntaje: <b>'+tot+' de '+mx+' estrellas</b>. Cada tarea vale hasta 3: pierdes una por cada error.</p>'+TASKS.map((t,i)=>'<div class="rt-row"><span>'+(i+1)+'. '+t.n+'</span><span class="rt-star">'+'★'.repeat(tscore[i])+'☆'.repeat(3-tscore[i])+'</span></div>').join('')+'<button class="rt-go" id="rtTest">Ver la prueba de transferencia</button> <button class="rt-go alt" id="rtAgain">Repetir la rutina</button> <button class="rt-go alt" id="rtMenu">Volver al menú</button></div>';
 el.end.style.display='grid';el.panel.style.display=el.bar.style.display='none';try{document.exitPointerLock();}catch(e){}
 $$('rtTest').onclick=()=>{el.end.style.display='none';leave(false);try{document.querySelector('#viewbar [data-nav="emergency"]').click();UnidadVII.test('transfer');}catch(e){}};
 $$('rtAgain').onclick=()=>{el.end.style.display='none';start();};
 $$('rtMenu').onclick=()=>{el.end.style.display='none';leave(true);};}
function leave(menu){on=false;try{window.__bag32&&(window.__bag32.visible=true);}catch(e){}hold=null;if(hands)hands.visible=false;choice=null;window.__rutinaTarget=null;document.body.classList.remove('rutina-on');el.panel.style.display=el.bar.style.display=el.msg.style.display=el.choice.style.display=el.intro.style.display='none';
 try{Maintenance.close();}catch(e){}if(menu){try{GameInterface.openMenu(true);}catch(e){}}}
function start(){ui();on=true;try{window.__bag32&&(window.__bag32.visible=false);}catch(e){}ti=0;si=0;errs=0;stepErrs=0;streak=0;hold=null;tscore=[];tool='mano';choice=null;document.body.classList.add('rutina-on');paintPanel();el.panel.style.display='block';el.bar.style.display='flex';setTool('mano');
 el.intro.innerHTML='<div class="rt-card"><h2>Rutina de mantenimiento</h2><p>Eres el técnico. Vas a hacer, en orden, el mantenimiento preventivo del grupo electrógeno. Sigue la señal amarilla.</p><p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> caminar · <b>Ratón</b> mirar · <kbd>E</kbd> o clic: usar lo que llevas en la mano · <kbd>Q</kbd> mantenida: tu porta herramientas (rueda o flechas para cambiar, suelta para sacarla) · <kbd>G</kbd> guardar · <kbd>Esc</kbd> soltar el ratón</p><p class="rt-why">Cada paso pide una herramienta distinta: las herramientas están en tu porta herramientas, en la cadera. Empiezas con las manos vacías. Si te equivocas dos veces, se marca la correcta. Si te equivocas pierdes estrellas, pero siempre puedes seguir.</p><button class="rt-go" id="rtGo">Empezar</button></div>';
 el.intro.style.display='grid';$$('rtGo').focus();$$('rtGo').onclick=()=>{el.intro.style.display='none';};}

// ---- Manos en primera persona (guantes naranja) que sostienen la herramienta elegida ----
let hands=null,HR=null,HL=null,heldG=null,heldBase=null,phase=0,tt=0,lastP=null;
// Mano realista: malla con esqueleto (generic-hand, 1360 vértices) pintada como guante de trabajo. La cinemática de los dedos se resuelve aquí.
let HDATA=null;
function handData(){if(HDATA)return HDATA;const bin=atob(window.__HAND_GLB),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
 const dv=new DataView(u.buffer),jl=dv.getUint32(12,true),json=JSON.parse(new TextDecoder().decode(u.subarray(20,20+jl))),B=u.buffer.slice(20+jl+8);
 const acc=i=>{const a=json.accessors[i],v=json.bufferViews[a.bufferView],n={VEC3:3,VEC2:2,VEC4:4,SCALAR:1,MAT4:16}[a.type],C={5126:Float32Array,5121:Uint8Array,5123:Uint16Array}[a.componentType],o=v.byteOffset||0;return new C(B.slice(o,o+a.count*n*C.BYTES_PER_ELEMENT));};
 const P=acc(0),N=acc(1),Jn=acc(3),Wt=acc(4),Ix=acc(5),IB=acc(6),nv=P.length/3;
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(P,3));geo.setAttribute('normal',new T.BufferAttribute(N,3));
 geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(Uint16Array.from(Jn),4));geo.setAttribute('skinWeight',new T.BufferAttribute(Wt,4));geo.setIndex(new T.BufferAttribute(Ix,1));
 const col=new Float32Array(nv*3),o=new T.Color('#f0a41e'),dk=new T.Color('#8a5410'),tc=new T.Color();
 for(let i=0;i<nv;i++){const nx=N[i*3];const k=Math.max(0,Math.min(1,(-nx-.1)/.45));tc.copy(o).lerp(dk,k);col[i*3]=tc.r;col[i*3+1]=tc.g;col[i*3+2]=tc.b;}
 geo.setAttribute('color',new T.BufferAttribute(col,3));
 const nodes=json.nodes.slice(0,25),Wb=nodes.map(n=>new T.Matrix4().compose(new T.Vector3(...n.translation),new T.Quaternion(...n.rotation),new T.Vector3(...(n.scale||[1,1,1]))));
 const chains=[[1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]];
 const rel=Wb.map((m,i)=>m.clone());chains.forEach(ch=>{for(let k=1;k<ch.length;k++)rel[ch[k]]=Wb[ch[k-1]].clone().invert().multiply(Wb[ch[k]]);});
 return HDATA={geo,IB,nodes,Wb,rel,chains};}
function glove(side){const D=handData(),g=new T.Group(),
 tag=o=>{o.renderOrder=1000;o.frustumCulled=false;o.castShadow=false;o.receiveShadow=false;return o;},
 mm=(c,r=.8,me=0)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:me,depthTest:false,side:T.DoubleSide}),
 vcm=new T.MeshStandardMaterial({vertexColors:true,roughness:.68,metalness:0,depthTest:false});
 const bones=D.nodes.map((n,i)=>{const b=new T.Bone();D.Wb[i].decompose(b.position,b.quaternion,b.scale);return b;}),arm=new T.Group();
 const inv=[];for(let i=0;i<25;i++)inv.push(new T.Matrix4().fromArray(D.IB,i*16));
 const mesh=tag(new T.SkinnedMesh(D.geo,vcm));arm.add(mesh);bones.forEach(b=>arm.add(b));mesh.bind(new T.Skeleton(bones,inv),new T.Matrix4());
 const hw=new T.Group();hw.matrixAutoUpdate=false;hw.matrix.makeBasis(new T.Vector3(0,1,0),new T.Vector3(0,0,1),new T.Vector3(1,0,0));
 arm.position.set(-.0331,-.0267,-.0057);hw.add(arm);const outer=new T.Group();outer.add(hw);outer.scale.x=side;g.add(outer);
 // antebrazo (puño del guante + manga con franja): cuelga de «hands», no de la mano, para que siempre salga natural desde abajo
 const arm2=new T.Group(),up=(geo,len)=>{geo.translate(0,len/2,0);return geo;};
 const AM=(geo,mat)=>{const m=new T.Mesh(geo,mat);m.renderOrder=999;m.frustumCulled=false;m.castShadow=false;arm2.add(m);return m;};
 {const cf=AM(up(new T.CylinderGeometry(.033,.035,.065,24,1,true),.065),mm('#e39a1a',.8));cf.position.y=-.028;cf.renderOrder=1000.5;}
 AM(up(new T.CylinderGeometry(.0585,.038,1.1,20,1,true),1.1),mm('#2f5886',.9)).position.y=.03;
 AM(up(new T.CylinderGeometry(.0465,.0465,.016,20,1,true),.016),mm('#d6dcdf',.3,.5)).position.y=.2;
 g.userData.arm=arm2;g.userData.side=side;
 // cinemática: cada dedo es una cadena; al curvar se recalcula la pose de cada hueso.
 // mul = cuánto se curva cada dedo (pulgar, índice, medio, anular, meñique); cierre = cuánto se juntan los dedos entre sí
 const ang=(c,mu)=>[[.18,.4,.55,0],[0,.9,1.1,.75,0],[0,.95,1.15,.8,0],[0,.95,1.12,.78,0],[0,.9,1.05,.72,0]].map((a,f)=>a.map(x=>x*c*mu[f]));
 const R=new T.Matrix4(),R2=new T.Matrix4(),ax=new T.Vector3(),Wp=[],PN=new T.Vector3(-1,0,0),QI=new T.Quaternion();
 // eje de «juntar dedos» de cada nudillo: la normal de la palma vista desde el hueso, con el signo que acerca el dedo al medio
 const sepAx=[];for(let f=1;f<5;f++){const i=D.chains[f][1],n=PN.clone().applyQuaternion(QI.setFromRotationMatrix(new T.Matrix4().extractRotation(D.Wb[i])).invert());
  const pos=j=>new T.Vector3().setFromMatrixPosition(D.Wb[j]),d=pos(D.chains[f][2]).sub(pos(i)).normalize(),to=pos(D.chains[2][1]).sub(pos(i));
  sepAx[f]={a:n,s:f===2?0:Math.sign(new T.Vector3().crossVectors(PN,d).dot(to))||1};}
 let last='';
 g.userData.setCurl=(c,mu=[1,1,1,1,1],cl=0)=>{const key=c.toFixed(3)+mu.join()+cl.toFixed(3);if(key===last)return;last=key;const A=ang(c,mu);
  D.chains.forEach((ch,f)=>{for(let k=0;k<ch.length;k++){const i=ch[k];let M=k===0?D.Wb[i].clone():Wp[ch[k-1]].clone().multiply(D.rel[i]);
   if(f>0&&k===1&&cl){const sa=sepAx[f];R2.makeRotationAxis(sa.a,sa.s*cl*(f===4?1.3:1));M.multiply(R2);}
   const a=window.__HAND_AX[i],th=A[f][k]||0;if(th){ax.set(a[0],a[1],a[2]);R.makeRotationAxis(ax,th);M.multiply(R);}Wp[i]=M;M.decompose(bones[i].position,bones[i].quaternion,bones[i].scale);}});};
 // posición de un hueso en el marco de la mano (el mismo en que se colocan las herramientas)
 g.userData.bone=(i,out)=>{const e=Wp[i].elements;return out.set(side*(e[14]-.0057),e[12]-.0331,e[13]-.0267);};
 g.userData.setCurl(.3);g.scale.setScalar(1.25);g.userData.fingers=[];g.userData.th=new T.Group();return g;}
function pose(g,curl,mu,cl){if(g.userData.setCurl)g.userData.setCurl(Math.max(0,Math.min(1.1,curl)),mu,cl||0);}

function prop(k){const g=new T.Group(),m=(c,r=.55,me=.1)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:me,depthTest:false}),
 add=(geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.renderOrder=1001;o.frustumCulled=false;g.add(o);return o;},
 cz=(r1,r2,len,seg=14)=>{const q=new T.CylinderGeometry(r1,r2,len,seg);q.rotateX(Math.PI/2);return q;};
 const steel=m('#c3cbd0',.22,.9),dark=m('#1f2225',.6,.2),red=m('#b3261e',.6,.1),yel=m('#ffc400',.55,.05),wood=m('#9a6a35',.75,0),brass=m('#c9a43a',.3,.85),rubber=m('#2b2b2b',.9,0);
 if(k==='cepillo'){add(cz(.014,.017,.14,12),wood,0,0,-.03);add(cz(.0175,.0175,.03,12),steel,0,0,-.115);add(new T.BoxGeometry(.055,.02,.09),wood,0,-.005,-.17);
  const bm=m('#e2cf8a',.9,0);for(let i=0;i<6;i++)for(let j=0;j<8;j++)add(cz(.0035,.0035,.03,5),bm,-.022+i*.0088,-.022,-.13-j*.0092);}
 else if(k==='llave'){add(new T.BoxGeometry(.024,.008,.19),steel,0,0,-.1);add(new T.TorusGeometry(.024,.0075,8,18),steel,0,0,-.225);add(new T.CylinderGeometry(.015,.015,.009,6).rotateX(Math.PI/2),steel,0,0,-.225);
  add(new T.TorusGeometry(.019,.0065,8,14,Math.PI*1.6),steel,0,0,.0,0,0,Math.PI*.7+Math.PI/2);add(new T.BoxGeometry(.045,.009,.006),dark,0,0,-.045);}
 else if(k==='linterna'){add(cz(.019,.019,.15,16),dark,0,0,-.04);for(let i=0;i<4;i++)add(new T.TorusGeometry(.0195,.0014,5,16),m('#3a3d40',.7),0,0,.01-i*.025);
  add(cz(.02,.034,.055,18),yel,0,0,-.14);add(cz(.036,.036,.01,18),dark,0,0,-.172);add(new T.CircleGeometry(.029,18),m('#fff6c8',.1,0),0,0,-.178);
  add(new T.BoxGeometry(.012,.008,.02),yel,0,.021,-.03);add(cz(.017,.019,.014,14),yel,0,0,.04);}
 else if(k==='pano'){const cols=['#d94a2b','#cf4326','#e0562f'];for(let i=0;i<4;i++){const o=add(new T.BoxGeometry(.105-i*.006,.007,.115-i*.005),m(cols[i%3],.97,0),0,-.005+i*.006,-.07,0,i*.12-.2,i*.03-.04);}
  add(new T.BoxGeometry(.03,.006,.05),m('#bf3a1f',.97,0),.045,.013,-.14,.1,.4,.1);add(new T.BoxGeometry(.105,.0015,.004),m('#f3d6a8',.9,0),0,.019,-.05);}
 else if(k==='multi'){add(new T.BoxGeometry(.078,.034,.14),yel,0,-.01,-.06);add(new T.BoxGeometry(.084,.026,.03),rubber,0,-.012,-.12);add(new T.BoxGeometry(.084,.026,.03),rubber,0,-.012,-.0);
  add(new T.BoxGeometry(.056,.003,.04),m('#8fbf8a',.2,0),0,.009,-.095);add(new T.BoxGeometry(.04,.0016,.016),m('#17321a',.2,0),0,.0105,-.095);
  add(cz(.017,.017,.008,18).rotateX(0),dark,0,.01,-.05);add(new T.BoxGeometry(.004,.003,.014),m('#fff',.5,0),0,.0145,-.056);
  for(let i=0;i<3;i++)add(cz(.005,.005,.004,8),m(i?'#ddd':'#b3261e',.5,0),-.02+i*.02,.009,-.13);
  add(new T.CylinderGeometry(.0025,.0025,.12,6),red,.02,-.02,.04,Math.PI/2.3,0,.3);add(new T.CylinderGeometry(.0025,.0025,.12,6),dark,-.02,-.02,.04,Math.PI/2.3,0,-.3);}
 else if(k==='candado'){add(new T.BoxGeometry(.054,.05,.026),red,0,-.012,-.06);add(new T.BoxGeometry(.048,.012,.027),m('#8f1c15'),0,-.034,-.06);
  add(new T.TorusGeometry(.018,.0045,8,16,Math.PI),steel,0,.013,-.06);add(cz(.0035,.0035,.008,8),dark,0,-.012,-.0465);
  add(new T.BoxGeometry(.04,.055,.002),m('#f3eee0',.9,0),.0,-.07,-.06,0,0,.1);add(new T.BoxGeometry(.04,.012,.0025),m('#d4241a',.8,0),0,-.047,-.06,0,0,.1);}
 else if(k==='repuesto'){add(cz(.04,.04,.1,24),m('#d9d2b6',.85,0),0,0,-.07);add(cz(.042,.042,.012,24),dark,0,0,-.014);add(cz(.042,.042,.012,24),dark,0,0,-.126);
  for(let i=0;i<5;i++)add(new T.TorusGeometry(.0405,.0013,4,24),m('#8e8a74',.9,0),0,0,-.04-i*.017);add(cz(.014,.014,.014,12),steel,0,0,-.134);}
 else if(k==='cuaderno'){add(new T.BoxGeometry(.088,.016,.12),m('#1b3d6b',.8,0),0,-.02,-.06);add(new T.BoxGeometry(.081,.011,.113),m('#f6f1dc',.95,0),.002,-.017,-.06);
  add(new T.BoxGeometry(.006,.018,.12),dark,.032,-.02,-.06);add(new T.BoxGeometry(.088,.0015,.004),yel,0,-.0115,-.09);add(cz(.0025,.0025,.12,5),m('#b3261e',.8,0),-.025,-.0105,-.06);g.userData.lines=[];for(let i=0;i<6;i++){const ln=add(new T.BoxGeometry(.062,.0007,.0032),m('#10233f',.6,0),.003,-.0109,-.02-i*.0155);ln.visible=false;g.userData.lines.push(ln);}}
 else if(k==='lapiz'){add(cz(.0055,.0055,.13,10),yel,0,0,-.05);add(cz(.0055,.0012,.022,10),m('#c9a27a',.8,0),0,0,-.126);add(cz(.0062,.0062,.014,10),m('#d98a96',.8,0),0,0,.02);}
 else if(k==='sonda'){add(cz(.0075,.0075,.11,10),dark,0,0,-.04);add(cz(.0075,.0018,.045,10),steel,0,0,-.118);add(cz(.0018,.0018,.14,6),red,0,0,.09);}
 return g;}
let propG=null,propK='';
// Cómo se agarra cada herramienta: el mango queda atravesado en la palma, bajo los dedos curvados, y la parte útil apunta hacia delante y hacia dentro.
const GRIP={lapiz:{s:1,rx:.35,ry:.8,p:[.004,-.03,-.012]},sonda:{s:.9,rx:.3,ry:.75,p:[.004,-.03,-.012]},def:{s:.62,rx:.35,ry:1.0,p:[.006,-.03,-.012]},cepillo:{s:.62,rx:.3,ry:.95,p:[.006,-.03,-.01]},llave:{s:.7,rx:.3,ry:1.05,p:[.006,-.03,.0]},linterna:{s:.7,rx:.2,ry:1.05,p:[.006,-.03,.0]},multi:{s:.65,rx:.1,ry:.6,p:[.0,-.036,-.02]},cuaderno:{s:.7,rx:-.2,ry:.3,rz:0,p:[.0,-.04,-.03]},pano:{s:.7,rx:0,ry:.4,p:[.0,-.034,-.03]},candado:{s:.7,rx:.2,ry:.8,p:[.0,-.034,-.02]},repuesto:{s:.62,rx:.2,ry:1.2,p:[.0,-.04,-.02]}};
const SM={x:0,y:0,z:0},SL={x:0,y:0,z:0};let LP=null,LPK='',lastLines=0;
function setLeft(k){if(k===LPK||!hands)return;LPK=k;if(LP){hands.remove(LP);LP=null;}if(!k)return;LP=prop(k);const c=k==='cuaderno';LP.scale.setScalar(c?1.7:1.5);LP.rotation.set(c?1.2:1.1,c?.22:.2,c?.04:0);hands.add(LP);lastLines=0;}
function setProp(k){if(!HR||k===propK)return;propK=k;if(propG){HR.remove(propG);propG=null;}if(k==='mano')return;propG=prop(k);const gp=GRIP[k]||GRIP.def;propG.scale.setScalar(gp.s);propG.rotation.set(gp.rx,gp.ry,gp.rz||0);propG.position.set(gp.p[0],gp.p[1],gp.p[2]);HR.add(propG);}

// ---- Porta herramientas puesto en la cadera. Mantén Q: sube a la vista; rueda del ratón, flechas o LB/RB cambian; al soltar Q sacas la herramienta marcada. ----
let beltG=null,beltOpen=0,beltWant=0,hsel=0,hselT=0;const POUCH=[];
function buildBelt(){if(beltG||!hands)return;beltG=new T.Group();beltG.name='Porta herramientas';camera.add(beltG);
 const mat=(c,r=.85,me=0)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:me,depthTest:false});
 const put=(geo,m,x,y,z,ord,p)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.renderOrder=ord;o.frustumCulled=false;(p||beltG).add(o);return o;};
 const nylon=mat('#2e3338',.95),nyl2=mat('#3a4147',.95),strap=mat('#1c1f22',.9),yel=mat('#ffc400',.6),metal=mat('#aeb6bb',.3,.9);
 put(new T.BoxGeometry(1.06,.05,.012),strap,0,.0,.0,990);put(new T.BoxGeometry(1.06,.006,.014),yel,0,.022,.0,991);put(new T.BoxGeometry(1.06,.006,.014),yel,0,-.022,.0,991);
 put(new T.BoxGeometry(.06,.05,.02),metal,0,0,.006,992);
 const list=TOOLS.filter(t=>t[0]!=='mano'),n=list.length;
 list.forEach((t,i)=>{const x=-.46+i*(.92/(n-1));const g=new T.Group();g.position.set(x,-.012,.004);beltG.add(g);
  const bk=put(new T.BoxGeometry(.088,.11,.012),nyl2,0,-.02,0,993,g);
  const fr=put(new T.BoxGeometry(.088,.082,.03),nylon,0,-.035,.016,995,g);
  put(new T.BoxGeometry(.09,.012,.032),strap,0,.004,.016,996,g);put(new T.BoxGeometry(.088,.004,.032),yel,0,-.07,.016,996,g);
  const pr=prop(t[0]);pr.rotation.x=Math.PI/2;pr.scale.setScalar(.9);pr.position.set(0,.0,.0);pr.traverse(o=>{if(o.isMesh)o.renderOrder=994;});g.add(pr);
  POUCH.push({k:t[0],g,pr,base:pr.position.y});});
 beltG.rotation.x=-.5;}
function selIndex(k){const i=POUCH.findIndex(p=>p.k===k);return i<0?0:i;}
function beltStep(d){if(!beltG||!beltWant)return;hsel=(hsel+d+POUCH.length)%POUCH.length;}
function updateBelt(dt,show){if(!beltG)return;beltG.visible=show;if(!show){el.tags.style.display='none';return;}
 beltOpen+=(beltWant-beltOpen)*Math.min(1,dt*9);
 beltG.position.set(0,-.60+beltOpen*.31,-.52);beltG.rotation.x=-.5-beltOpen*.3;
 POUCH.forEach((po,i)=>{po.pr.visible=po.k!==tool;const sel=beltWant&&i===hsel;po.pr.position.y+=((sel?.045:0)-po.pr.position.y)*Math.min(1,dt*14);po.g.position.z+=((sel?.03:.004)-po.g.position.z)*Math.min(1,dt*14);});
 const s=step(),hint=!!(s&&stepErrs>=2&&tool!==s.tool&&s.tool!=='mano');const b=el.tags.children[0];
 const open=beltOpen>.5&&beltWant,kids=el.tags.children;for(let j=0;j<kids.length;j++)kids[j].style.display='none';const v=new T.Vector3();
 if(open){POUCH.forEach((po,i)=>{const b=kids[TOOLS.findIndex(t=>t[0]===po.k)];po.g.getWorldPosition(v);const q=v.clone().project(camera);b.style.display='block';b.style.left=((q.x+1)/2*innerWidth)+'px';b.style.top=((1-q.y)/2*innerHeight-34-(i%2?28:0))+'px';b.className=i===hsel?'sel':'';});el.tags.style.display='block';}
 else if(hint){const i=POUCH.findIndex(p=>p.k===s.tool),b=kids[TOOLS.findIndex(t=>t[0]===s.tool)];if(i>=0&&b){POUCH[i].g.getWorldPosition(v);v.project(camera);b.style.display='block';b.style.left=((v.x+1)/2*innerWidth)+'px';b.style.top=((1-v.y)/2*innerHeight-34)+'px';b.className='need';el.tags.style.display='block';}}
 else el.tags.style.display='none';}
function beltOpenNow(){if(beltWant)return;beltWant=1;try{say('Elige con 2–9, la rueda o las flechas · E confirma · Q cierra','ok');}catch(e){}hsel=selIndex(tool==='mano'?POUCH[0]&&POUCH[0].k:tool);}
function beltRelease(){if(!beltWant)return;beltWant=0;const k=POUCH[hsel]&&POUCH[hsel].k;if(k&&k!==tool)setTool(k);}
// ---- Tapete de herramientas junto a la bolsa del piso: te agachas y tomas con la mira la que necesitas ----
const MAT=[.15,3.98],PK_POS=[.15,1.0,4.55];let matG=null,pk=null,pkAim=-1,pkPrev=null;const PKI=[];
function buildMat(){if(matG)return;matG=new T.Group();matG.name='Tapete de herramientas';
 const mm=new T.Mesh(new T.BoxGeometry(1.6,.012,.5),new T.MeshStandardMaterial({color:'#1f2a33',roughness:.9}));mm.position.set(MAT[0],.006,MAT[1]);matG.add(mm);
 const ed=new T.Mesh(new T.BoxGeometry(1.6,.013,.02),new T.MeshStandardMaterial({color:'#ffc400',roughness:.7}));ed.position.set(MAT[0],.007,MAT[1]+.24);matG.add(ed);
 TOOLS.forEach((t,i)=>{if(t[0]==='mano')return;const o=prop(t[0]);o.traverse(m=>{if(m.isMesh){m.renderOrder=0;m.material=m.material.clone();m.material.depthTest=true;m.castShadow=false;}});
  const n=TOOLS.length-1,j=PKI.length;o.scale.setScalar(1.9);o.rotation.set(-Math.PI/2*0,0,0);o.position.set(MAT[0]-.67+j*(1.34/(n-1)),.05,MAT[1]+.02);o.rotation.y=Math.PI/2*0;matG.add(o);PKI.push({k:t[0],o});});
 scene.add(matG);matG.visible=false;}
function matWorld(i){const v=new T.Vector3();PKI[i].o.getWorldPosition(v);return v;}
function nearMat(w){return false&&w&&Math.hypot(w.position[0]-MAT[0],w.position[2]-MAT[1])<1.9;}
function openPick(){if(pk||!on||choice||hold)return;let w=null;try{w=Walk31.state();}catch(e){}if(!nearMat(w)){say('Acércate al tapete de herramientas junto a la bolsa del piso.','bad');return;}
 buildMat();pkPrev={p:w.position.slice(),yaw:w.yaw,pitch:w.pitch};pk={};matG.visible=true;try{Walk31.setCrouch(true);WalkCam.set([MAT[0],PK_POS[1],PK_POS[2]],0,-.68);}catch(e){}
 say('Mira la herramienta que necesitas y pulsa E o clic','ok');sfx('ok');}
function closePick(take){if(!pk)return;pk=null;matG.visible=false;try{Walk31.setCrouch(false);}catch(e){}el.tags.style.display='none';
 if(pkPrev){try{WalkCam.set([pkPrev.p[0],1.65-.07,pkPrev.p[2]],pkPrev.yaw,0);}catch(e){}}
 if(take&&take!==tool){setTool(take);}}
function pickTick(){if(!pk)return;let w=null;try{w=Walk31.state();}catch(e){}if(w){if(Math.hypot(w.position[0]-MAT[0],w.position[2]-PK_POS[2])>.05){try{WalkCam.set([MAT[0],PK_POS[1],PK_POS[2]],w.yaw,w.pitch);}catch(e){}}}
 const fwd=new T.Vector3();camera.getWorldDirection(fwd);let best=-1,ba=.2;PKI.forEach((it,i)=>{const to=matWorld(i).sub(camera.position).normalize(),a=to.angleTo(fwd);if(a<ba){ba=a;best=i;}});
 if(pk.kb!=null){best=pk.kb;}pkAim=best;PKI.forEach((it,i)=>{const sc=i===best?2.5:1.9;it.o.scale.setScalar(it.o.scale.x+(sc-it.o.scale.x)*.3);it.o.position.y=.05+(i===best?.05:0);});
 const b=el.tags.children[0];if(best>=0){const v=matWorld(best);v.y+=.12;v.project(camera);const tb=TOOLS.find(t=>t[0]===PKI[best].k);b.innerHTML='<i>E</i>'+tb[1];b.style.display='block';b.style.left=((v.x+1)/2*innerWidth)+'px';b.style.top=((1-v.y)/2*innerHeight-8)+'px';b.className='sel';el.tags.style.display='block';for(let j=1;j<el.tags.children.length;j++)el.tags.children[j].style.display='none';}
 else{el.tags.style.display='none';}}
function pickTake(){if(!pk)return;if(pkAim<0){say('Apunta a una herramienta.','bad');return;}const k=PKI[pkAim].k;closePick(k);}
function pickStep(d){if(!pk)return;const n=PKI.length;pk.kb=pk.kb==null?(pkAim>=0?pkAim:0):pk.kb;pk.kb=(pk.kb+d+n)%n;}
const AUP=new T.Vector3(0,1,0),AWP=new T.Vector3(),ADIR=new T.Vector3();
function placeArm(h){const a=h.userData.arm;if(!a)return;h.updateMatrix();AWP.set(h.userData.side*.003,.006,.04).applyMatrix4(h.matrix);a.position.copy(AWP);
 // el antebrazo continúa el eje de la muñeca (con un leve quiebre hacia abajo y afuera), así nunca queda un escalón entre guante y manga
 ADIR.set(0,0,1).applyQuaternion(h.quaternion);ADIR.x+=h.userData.side*.1;ADIR.y-=.2;ADIR.normalize();a.quaternion.setFromUnitVectors(AUP,ADIR);}
// agarre de lápiz/sonda: se apoya en el hueco entre pulgar e índice y se sostiene con las yemas de ambos
const FP_P=new T.Vector3(),FP_Q=new T.Vector3(),FP_W=new T.Vector3(),FP_U=new T.Vector3(),FP_Z=new T.Vector3(0,0,-1);
function fitPen(g,pg,hold,tipOff){const bn=g.userData.bone;if(!bn||!pg)return;bn(4,FP_P);bn(9,FP_Q);FP_P.add(FP_Q).multiplyScalar(.5);bn(2,FP_Q);bn(6,FP_W);FP_W.add(FP_Q).multiplyScalar(.5);
 FP_U.copy(FP_P).sub(FP_W).normalize();pg.quaternion.setFromUnitVectors(FP_Z,FP_U);pg.position.copy(FP_P).addScaledVector(FP_U,-hold*pg.scale.x).add(tipOff);}
function buildHands(){if(hands)return;hands=new T.Group();hands.name='Manos del técnico';HR=glove(1);HL=glove(-1);hands.add(HR,HL,HR.userData.arm,HL.userData.arm);camera.add(hands);
 heldG=camera.children.find(c=>c.name==='Herramienta del jugador');if(heldG){heldBase={p:new T.Vector3(.29,-.08,-.62),r:heldG.rotation.clone()};heldG.scale.setScalar(.0001);}}
const MU_REL=[.7,.8,1,1.12,1.25],MU_ALL=[1,1,1,1,1],MU_PEN=[.8,.55,.9,1.1,1.15],PEN_OFF=new T.Vector3(0,0,0);
const HPR=new T.Vector3(.24,-.17,-.5),HPL=new T.Vector3(-.24,-.18,-.5);
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.05,(now-tt)/1000||0);tt=now;
 if(on&&window.__bag32)window.__bag32.visible=false;
 if(!on){if(hands)hands.visible=false;el.cross&&(el.cross.style.display='none');return;}
 if(!hands){buildHands();buildBelt();}if(!beltG)buildBelt();let w=null;try{w=Walk31.state();}catch(e){}
 const showUI=!(choice||el.intro.style.display==='grid'||el.end.style.display==='grid')&&w&&w.active;
 hands.visible=!!showUI&&!pk;el.cross.style.display=showUI&&!hold?'block':'none';updateBelt(dt,!!showUI);if(!showUI){el.tags.style.display='none';return;}
 holdTick(dt);pickTick();if(window.__noanim)return;
 let sp=0;if(w&&lastP){sp=Math.min(1,Math.hypot(w.position[0]-lastP[0],w.position[2]-lastP[2])/Math.max(dt,.016)/3);}lastP=w?w.position.slice():null;
 phase+=dt*(5+sp*7);const bob=Math.sin(phase)*.012*sp,sway=Math.cos(phase*.5)*.01*sp,idle=Math.sin(now/900)*.003;
 kick.ok=Math.max(0,kick.ok-dt*3.2);kick.err=Math.max(0,kick.err-dt*3);kick.draw=Math.max(0,kick.draw-dt*3.2);
 const push=Math.sin(kick.ok*Math.PI)*.07,dip=Math.sin(kick.draw*Math.PI)*.22,shake=Math.sin(kick.err*32)*.02*kick.err;
 const k=now/1000,pg=hold?Math.min(1,hold.t/hold.dur):0;let tx=0,ty=0,tz=0,tr=0,ox=0,oy=0,oz=0,orr=0;
 if(hold){
  if(tool==='cepillo'){ox=Math.sin(k*24)*.04;oz=Math.sin(k*24)*.012;}
  else if(tool==='pano'){ox=Math.sin(k*18)*.05;oy=Math.sin(k*9)*.01;}
  else if(tool==='llave'){orr=Math.sin(k*13)*.4;tz=-.03;}
  else if(tool==='linterna'){ox=Math.sin(k*3)*.03;tz=-.03;}
  else if(tool==='cuaderno'){tx=-.27;ty=-.02;tz=-.03;ox=Math.sin(k*15)*.014;oy=Math.cos(k*9.5)*.008;oz=Math.sin(k*3)*.004;orr=Math.sin(k*15)*.08;}
  else if(tool==='multi'){tx=-.1;tz=-.1;ox=Math.sin(k*25)*.003;oy=Math.sin(k*17)*.003;}
  else if(tool==='candado'){tz=-.06;orr=Math.sin(k*7)*.18;oz=Math.sin(k*14)*.01;}
  else if(tool==='repuesto'){tz=-.05;orr=Math.sin(k*5)*.6;}
  else if(tool==='mano'){const tw=hold.s&&/Gira|Retira|Insert|Abre/i.test(hold.s.t);if(tw){orr=Math.sin(k*6)*.6;tz=-.06;}else{tz=-.09+Math.sin(k*10)*.015;}}
  else{tz=-.05+Math.sin(k*10)*.01;}
 }
 const sm=Math.min(1,dt*10);SM.x+=(tx-SM.x)*sm;SM.y+=(ty-SM.y)*sm;SM.z+=(tz-SM.z)*sm;
 const hx=SM.x+ox,hy=SM.y+oy,hz=SM.z+oz,hr=orr;
 const hasModel=tool!=='mano',leftK=(tool==='cuaderno'||tool==='multi')?tool:'',rightK=tool==='cuaderno'?'lapiz':tool==='multi'?'sonda':tool;
 const sl=Math.min(1,dt*8);SL.x+=((leftK?.1:0)-SL.x)*sl;SL.y+=((leftK?.12:0)-SL.y)*sl;SL.z+=((leftK?.05:0)-SL.z)*sl;
 HR.position.set(HPR.x+sway+hx+shake,HPR.y+bob+idle-dip+hy+(hasModel?.08:0),HPR.z+hz-push);HR.rotation.set(.55,-.14,-1.0+hr);
 HL.position.set(HPL.x-sway+SL.x,HPL.y+bob*.8-idle-dip*.7+SL.y,HPL.z+SL.z);HL.rotation.set(.55+(leftK?.5:0),.14+(leftK?.2:0),leftK?.45:1.0);
 if(!hasModel)pose(HR,.32+(hold?.35:0)+(kick.ok?.3:0),MU_REL,.05);else if(rightK==='lapiz'||rightK==='sonda')pose(HR,1,MU_PEN,.12);else pose(HR,tool==='pano'?.6:1.0,MU_ALL,.04);
 pose(HL,leftK?.75:.32,leftK?MU_ALL:MU_REL,leftK?.04:.05);
 setProp(rightK);setLeft(leftK);if(propG&&(rightK==='lapiz'||rightK==='sonda'))fitPen(HR,propG,rightK==='lapiz'?.092:.07,PEN_OFF);placeArm(HR);placeArm(HL);
 if(LP){LP.position.set(HL.position.x+(LPK==='cuaderno'?.012:.0),HL.position.y+(LPK==='cuaderno'?.06:.05),HL.position.z-.01);const ln=LP.userData.lines;if(ln){if(hold&&tool==='cuaderno'){lastLines=Math.max(lastLines,pg);}const n=lastLines*6;ln.forEach((l,i)=>{const f=Math.max(0,Math.min(1,n-i));l.visible=f>0;l.scale.x=Math.max(.02,f);l.position.x=.003-.031*(1-f);});}}
 if(heldG&&heldBase){heldG.scale.setScalar(.0001);}
 if(false&&heldG&&heldBase){heldG.position.set(heldBase.p.x+sway+hx+shake,heldBase.p.y+bob+idle-dip+hy,heldBase.p.z+hz-push);heldG.rotation.set(heldBase.r.x,heldBase.r.y,heldBase.r.z+hr);}
}
requestAnimationFrame(animate);
// Entradas: teclado, clic y control
window.addEventListener('keydown',e=>{if(!on)return;
 if(el.intro.style.display==='grid'&&(e.code==='Enter'||e.code==='Space')){e.preventDefault();e.stopImmediatePropagation();el.intro.style.display='none';return;}
 if(choice){if(/^Digit[1-9]$/.test(e.code)){const b=$$('rtOpts')&&$$('rtOpts').children[+e.code.slice(5)-1];if(b){e.preventDefault();e.stopImmediatePropagation();b.click();}}return;}
 if(el.intro.style.display==='grid'||el.end.style.display==='grid')return;
 if(pk){if(/^(KeyW|KeyA|KeyS|KeyD|ArrowUp|ArrowDown|Space|ShiftLeft)$/.test(e.code)){e.preventDefault();e.stopImmediatePropagation();}if(e.code==='ArrowLeft'){e.preventDefault();e.stopImmediatePropagation();pickStep(-1);}else if(e.code==='ArrowRight'){e.preventDefault();e.stopImmediatePropagation();pickStep(1);}else if(e.code==='KeyE'||e.code==='Enter'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)pickTake();}else if(e.code==='Escape'||e.code==='KeyQ'){e.preventDefault();e.stopImmediatePropagation();closePick();}return;}
 if(/^Digit[1-9]$/.test(e.code)){e.preventDefault();e.stopImmediatePropagation();const tt=TOOLS[+e.code.slice(5)-1];if(tt){setTool(tt[0]);beltWant=0;}}
 else if(e.code==='KeyQ'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat){if(beltWant)beltRelease();else beltOpenNow();}}
 else if(beltWant&&(e.code==='KeyE'||e.code==='Enter'||e.code==='Space')){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)beltRelease();}
 else if(beltWant&&e.code==='Escape'){beltWant=0;}
 else if(beltWant&&(e.code==='ArrowLeft'||e.code==='ArrowRight')){e.preventDefault();e.stopImmediatePropagation();beltStep(e.code==='ArrowLeft'?-1:1);}
 else if(e.code==='KeyG'){e.preventDefault();e.stopImmediatePropagation();if(tool!=='mano'){setTool('mano');say('Guardaste la herramienta: manos libres.','ok');}}
 else if(e.code==='KeyE'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat){let w=null;try{w=Walk31.state();}catch(x){}if(nearMat(w)&&!(stepNear()))openPick();else begin();}}
},true);
window.addEventListener('keyup',e=>{if(on&&e.code==='KeyE'){e.stopImmediatePropagation();if(hold)cancel();}},true);
window.addEventListener('wheel',e=>{if(on&&beltWant){e.preventDefault();e.stopImmediatePropagation();beltStep(e.deltaY>0?1:-1);}},{capture:true,passive:false});
window.addEventListener('pointerup',()=>{if(on&&hold&&!choice)cancel();},true);
window.addEventListener('pointerdown',e=>{if(!on||choice||e.button!==0)return;if(document.pointerLockElement&&e.target===document.pointerLockElement){e.preventDefault();e.stopImmediatePropagation();if(beltWant)beltRelease();else if(pk)pickTake();else{let w=null;try{w=Walk31.state();}catch(x){}if(nearMat(w)&&!stepNear())openPick();else begin();}}},true);
let pv={a:0,l:0,r:0};setInterval(()=>{if(!on)return;let g=null;try{const l=navigator.getGamepads?navigator.getGamepads():[];for(const x of l)if(x){g=x;break;}}catch(e){return;}if(!g)return;
 const a=g.buttons[0]&&g.buttons[0].pressed?1:0,l=g.buttons[4]&&g.buttons[4].pressed?1:0,r=g.buttons[5]&&g.buttons[5].pressed?1:0,i=TOOLS.findIndex(t=>t[0]===tool);
 if(a&&!pv.a&&beltWant){beltRelease();}else if(a&&!pv.a&&pk){pickTake();}else if(a&&!pv.a){if(choice){const b=document.activeElement;b&&b.click&&b.click();}else begin();}if(!a&&pv.a&&hold)cancel();
 if(l&&!pv.l){if(beltWant)beltRelease();else beltOpenNow();}if(beltWant&&r&&!pv.r)beltStep(1);pv={a,l,r};},90);
// La rutina empieza sola cuando el recorrido en planta arranca desde el menú (a menos que se haya elegido la práctica clásica).
window.__manos={get HR(){return HR},get HL(){return HL},get hands(){return hands},PEN_OFF,MU_PEN,MU_REL,MU_ALL,pose,fitPen,get propG(){return propG}};
window.RutinaMantenimiento={start,leave,begin,state:()=>({on,tarea:ti,paso:si,errores:errs,estrellas:tscore.slice()}),skip:()=>{if(!on)return;si=TASKS[ti].steps.length;finishTask();}};
setInterval(()=>{if(on||window.__rutinaClasica)return;let w=null,m=null;try{w=Walk31.state();m=Maintenance.state();}catch(e){}
 if(w&&w.active&&w.zone==='plant'&&m&&m.active&&!m.finished&&!document.querySelector('dialog[open]')&&!window.gameMenuActive&&!window.__rutinaDone){window.__rutinaDone=true;start();}
 if(!w||!w.active)window.__rutinaDone=false;},400);
})();

// ---- v12.5 · Segunda opción del menú: «Funcionamiento de la planta» (vista general con control y estado de los componentes) ----
(function(){
const $$=id=>document.getElementById(id);
function css(){if($$('funcCss'))return;const st=document.createElement('style');st.id='funcCss';st.textContent=`
#funcPanel{position:fixed;right:14px;top:132px;z-index:35;width:min(300px,42vw);background:#0b0b0af2;border:2px solid #ffc400;border-left-width:8px;color:#f4f1e4;font:600 13px Bahnschrift,'Segoe UI',Arial,sans-serif;display:none;padding:10px 12px}
body.func-mode #funcPanel{display:block}
#funcPanel h3{margin:0 0 6px;font:800 15px Bahnschrift,Arial,sans-serif;color:#ffc400;letter-spacing:.03em}
#funcPanel .fr{display:flex;justify-content:space-between;gap:8px;padding:3px 0;border-top:1px solid #ffffff1c}
#funcPanel .fr b{font-weight:700;color:#fff}#funcPanel .fr span{color:#b7b49f}
#funcPanel .on{color:#7ee081!important}#funcPanel .off{color:#ff8a7a!important}
#funcPanel .fb{display:flex;gap:6px;margin-top:8px}#funcPanel button{flex:1;background:#ffc400;color:#000;border:0;font:800 12px Bahnschrift,Arial,sans-serif;padding:7px 4px;cursor:pointer}
#funcPanel button.ghost{background:#2a2a24;color:#f4f1e4;border:1px solid #5a5638}
body.func-mode #gameTelemetry{display:none!important}
`;document.head.appendChild(st);}
function panel(){css();let p=$$('funcPanel');if(p)return p;p=document.createElement('section');p.id='funcPanel';p.setAttribute('aria-label','Funcionamiento de la planta');
 p.innerHTML='<h3>FUNCIONAMIENTO DE LA PLANTA</h3><div id="fRows"></div><div class="fb"><button id="fTests">Pruebas guiadas</button><button class="ghost" id="fExit">Salir</button></div>';document.body.appendChild(p);
 $$('fTests').onclick=()=>{try{$$('gameChooseMission').click();}catch(e){}};
 $$('fExit').onclick=()=>{document.body.classList.remove('func-mode');try{GameInterface.openMenu(true);}catch(e){try{$$('gameMenuButton').click();}catch(x){}}};return p;}
const STG={0:'Reposo',1:'Arranque',2:'En marcha',3:'Transferido'};
function rows(){let r=[];try{const sv=window.__simState&&window.__simState();if(sv){return sv;}}catch(e){}
 return r;}
function tick(){if(!document.body.classList.contains('func-mode'))return;const q=n=>{const e=$$(n);return e?e.textContent.trim():'—';};
 // lee los valores que la interfaz ya muestra (telemetría y estado de la fuente)
 const live=q('gameLive'),route=q('gameRouteState');
 const rowsEl=$$('fRows');if(!rowsEl)return;
 const t=[...document.querySelectorAll('#gameTelemetry .metric')].map(m=>{const l=m.querySelector('small,span,label'),v=m.querySelector('strong,b,output');return [ (l?l.textContent:'').trim(), (v?v.textContent:m.textContent).trim()];});
 const html=['<div class="fr"><span>Simulación</span><b class="'+(/PAUSA/.test(live)?'off':'on')+'">'+live+'</b></div>','<div class="fr"><span>Estado</span><b>'+route+'</b></div>'].concat(t.filter(x=>x[0]).map(x=>'<div class="fr"><span>'+x[0]+'</span><b>'+x[1]+'</b></div>')).join('');
 if(rowsEl.dataset.h!==html){rowsEl.dataset.h=html;rowsEl.innerHTML=html;}}
setInterval(tick,400);
function enter(){panel();try{window.__menuChoiceMade&&window.__menuChoiceMade();}catch(e){}const dlg=$$('gameLaunch');try{if(dlg&&dlg.open)dlg.close();}catch(e){}
 document.body.classList.add('func-mode');document.body.classList.remove('mission-on');
 const nav=document.querySelector('#viewbar [data-nav="emergency"]');if(nav)nav.click();
 setTimeout(()=>{const pb=document.querySelector('#gameDock [data-act="pause"]');const live=$$('gameLive');if(live&&/PAUSA/.test(live.textContent)&&pb)pb.click();},350);
}
function wire(){const b=$$('gameTraining');if(!b||b.dataset.func)return;b.dataset.func='1';
 const txt=[...b.childNodes].find(n=>n.nodeType===3);if(txt)txt.nodeValue='Funcionamiento de la planta';
 const d=b.querySelector('.g-desc');if(d)d.textContent='Vista general: controla el grupo, corta la red y mira cómo responde cada componente.';
 b.onclick=e=>{e.preventDefault();enter();};}
setInterval(wire,500);
window.FuncionamientoPlanta={enter};
})();
