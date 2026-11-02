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
 const s=step();window.__rutinaTarget=s?{pos:s.p,label:s.at,verb:'Aquí: '}:null;paintBar();}
function stars(e){return e===0?3:e<=1?2:1;}
function finishTask(){stepErrs=0;const sc=stars(errs);tscore.push(sc);try{HUD.award(20*sc,'tarea '+(ti+1));}catch(e){}errs=0;ti++;si=0;
 if(ti>=TASKS.length){showEnd();return;}paintPanel();}
const DUR={mano:.45,linterna:.9,pano:1.1,llave:1.4,cepillo:1.7,multi:1.1,candado:.8,repuesto:1.0,cuaderno:.8};
function aimInfo(s){const wp=new T.Vector3(s.p[0],s.p[1],s.p[2]),to=wp.clone().sub(camera.position),d=to.length(),fwd=new T.Vector3();camera.getWorldDirection(fwd);return{d,a:to.normalize().angleTo(fwd)};}
function wrong(msg){errs++;stepErrs++;streak=0;sfx('err');say(msg,'bad');kick.err=1;paintBar();paintPanel();}
function begin(){if(!on||choice||hold)return;const s=step();if(!s)return;const {d,a}=aimInfo(s);
 if(d>2.6){say('Acércate más: estás a '+d.toFixed(1)+' m.','bad');return;}
 if(a>.32){say('Mira hacia la señal amarilla y vuelve a pulsar.','bad');return;}
 if(tool!==s.tool){wrong('Con eso no. Aquí necesitas: '+TL[s.tool]+'.');return;}
 hold={s,t:0,dur:DUR[tool]||.6,tick:0};el.ring.style.display='block';el.cross.style.display='none';}
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
function leave(menu){on=false;hold=null;if(hands)hands.visible=false;choice=null;window.__rutinaTarget=null;document.body.classList.remove('rutina-on');el.panel.style.display=el.bar.style.display=el.msg.style.display=el.choice.style.display=el.intro.style.display='none';
 try{Maintenance.close();}catch(e){}if(menu){try{GameInterface.openMenu(true);}catch(e){}}}
function start(){ui();on=true;ti=0;si=0;errs=0;stepErrs=0;streak=0;hold=null;tscore=[];tool='mano';choice=null;document.body.classList.add('rutina-on');paintPanel();el.panel.style.display='block';el.bar.style.display='flex';setTool('mano');
 el.intro.innerHTML='<div class="rt-card"><h2>Rutina de mantenimiento</h2><p>Eres el técnico. Vas a hacer, en orden, el mantenimiento preventivo del grupo electrógeno. Sigue la señal amarilla.</p><p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> caminar · <b>Ratón</b> mirar · <kbd>Q</kbd> mantenida: ver tu cinturón · <kbd>1</kbd>–<kbd>9</kbd> sacar herramienta · <kbd>E</kbd> o clic para usarla · <kbd>Esc</kbd> soltar el ratón</p><p class="rt-why">Cada paso pide una herramienta distinta: las herramientas están en tu cinturón, abajo; si te equivocas dos veces, se marca la correcta. Si te equivocas pierdes estrellas, pero siempre puedes seguir.</p><button class="rt-go" id="rtGo">Empezar</button></div>';
 el.intro.style.display='grid';$$('rtGo').focus();$$('rtGo').onclick=()=>{el.intro.style.display='none';};}

// ---- Manos en primera persona (guantes naranja) que sostienen la herramienta elegida ----
let hands=null,HR=null,HL=null,heldG=null,heldBase=null,phase=0,tt=0,lastP=null;
function glove(side){const g=new T.Group(),m=c=>{const x=new T.MeshStandardMaterial({color:c,roughness:.85,metalness:0,depthTest:false});return x;};
 const gm=m('#e8791a'),cm=m('#1b1b1b'),sm=m('#23405f'),tag=(o)=>{o.renderOrder=1000;o.frustumCulled=false;o.castShadow=false;o.receiveShadow=false;return o;};
 const palm=tag(new T.Mesh(new T.BoxGeometry(.085,.032,.10),gm));g.add(palm);
 const fingers=[];for(let i=0;i<4;i++){const j=new T.Group();j.position.set(-.032+i*.021,0,-.05);const a=tag(new T.Mesh(new T.CapsuleGeometry(.0105,.034,3,8),gm));a.rotation.x=Math.PI/2;a.position.z=-.02;j.add(a);const j2=new T.Group();j2.position.z=-.04;const b=tag(new T.Mesh(new T.CapsuleGeometry(.0095,.03,3,8),gm));b.rotation.x=Math.PI/2;b.position.z=-.016;j2.add(b);j.add(j2);g.add(j);fingers.push([j,j2]);}
 const th=new T.Group();th.position.set(side*.047,0,-.01);const t1=tag(new T.Mesh(new T.CapsuleGeometry(.012,.034,3,8),gm));t1.rotation.x=Math.PI/2;t1.position.z=-.022;th.add(t1);th.rotation.y=-side*.5;g.add(th);
 const cuff=tag(new T.Mesh(new T.BoxGeometry(.092,.040,.03),cm));cuff.position.z=.063;g.add(cuff);
 const sl=tag(new T.Mesh(new T.CapsuleGeometry(.026,.26,4,10),sm)),dir=new T.Vector3(side*.45,-.65,.6).normalize();sl.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir);sl.position.set(0,0,.07).addScaledVector(dir,.17);g.add(sl);
 g.userData={fingers,th};return g;}
function pose(g,curl){g.userData.fingers.forEach(([a,b],i)=>{a.rotation.x=curl*(.9+i*.03);b.rotation.x=curl*1.1;});g.userData.th.rotation.x=curl*.35;}

function prop(k){const g=new T.Group(),m=(c,r=.6,me=.1)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:me,depthTest:false}),
 add=(geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.renderOrder=1001;o.frustumCulled=false;g.add(o);return o;};
 const steel=m('#9aa3a8',.35,.8),dark=m('#26292c'),red=m('#b3261e'),yel=m('#ffc400'),wood=m('#8b5a2b');
 if(k==='cepillo'){add(new T.BoxGeometry(.035,.03,.13),wood,0,0,-.04);add(new T.BoxGeometry(.05,.012,.11),dark,0,-.022,-.045);for(let i=0;i<5;i++)add(new T.CylinderGeometry(.004,.004,.03,6),m('#d8c27a'),-.02+i*.01,-.04,-.045);}
 else if(k==='llave'){add(new T.CylinderGeometry(.009,.009,.2,8),steel,0,0,-.08,Math.PI/2);add(new T.TorusGeometry(.022,.008,6,12),steel,0,0,-.19);}
 else if(k==='linterna'){add(new T.CylinderGeometry(.017,.017,.13,10),dark,0,0,-.04,Math.PI/2);add(new T.CylinderGeometry(.03,.02,.05,10),yel,0,0,-.13,Math.PI/2);add(new T.CircleGeometry(.026,10),m('#fff6c0'),0,0,-.157);}
 else if(k==='pano'){add(new T.BoxGeometry(.11,.008,.12),m('#d94a2b',.95),0,-.01,-.06);}
 else if(k==='multi'){add(new T.BoxGeometry(.075,.03,.13),yel,0,-.01,-.05);add(new T.BoxGeometry(.05,.004,.04),m('#2c3a2c'),0,.01,-.08);add(new T.CylinderGeometry(.012,.012,.006,10),dark,0,.012,-.03);}
 else if(k==='candado'){add(new T.BoxGeometry(.05,.05,.025),red,0,-.01,-.06);add(new T.TorusGeometry(.017,.004,6,12,Math.PI),steel,0,.025,-.06);}
 else if(k==='repuesto'){add(new T.BoxGeometry(.08,.09,.06),m('#e8e2c8',.9),0,0,-.06);for(let i=-2;i<=2;i++)add(new T.BoxGeometry(.004,.088,.062),m('#8e8a74'),i*.014,0,-.06);}
 else if(k==='cuaderno'){add(new T.BoxGeometry(.085,.012,.115),m('#f6f1dc',.95),0,-.015,-.06);add(new T.BoxGeometry(.088,.008,.118),m('#1b3d6b'),0,-.024,-.06);}
 return g;}
let propG=null,propK='';
function setProp(k){if(!HR||k===propK)return;propK=k;if(propG){HR.remove(propG);propG=null;}if(k==='mano')return;propG=prop(k);propG.position.set(0,-.005,-.06);HR.add(propG);}

// ---- Cinturón de herramientas en 3D (abajo en tu vista). Mantén Q para levantarlo y ver los nombres; 1-9 sacan la herramienta. ----
let beltG=null,beltOpen=0,beltWant=0;const POUCH=[];
function buildBelt(){if(beltG||!hands)return;beltG=new T.Group();beltG.name='Cinturón de herramientas';camera.add(beltG);
 const mat=(c,r=.8,me=0)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:me,depthTest:false});
 const put=(geo,m,x,y,z,ord)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.renderOrder=ord;o.frustumCulled=false;beltG.add(o);return o;};
 put(new T.BoxGeometry(1.0,.03,.05),mat('#6b4423'),0,0,0,996);put(new T.BoxGeometry(1.0,.004,.052),mat('#d1a468'),0,.018,0,997);
 put(new T.BoxGeometry(.05,.04,.055),mat('#d9b44a',.4,.8),0,0,.005,997);
 TOOLS.forEach((t,i)=>{const x=-.40+i*.1;const g=new T.Group();g.position.set(x,-.02,0);beltG.add(g);
  const pr=prop(t[0]);pr.rotation.x=Math.PI/2;pr.scale.setScalar(.6);pr.position.set(0,.045,.02);pr.traverse(o=>{if(o.isMesh)o.renderOrder=998;});g.add(pr);
  const po=new T.Mesh(new T.BoxGeometry(.075,.06,.045),mat('#7a5a34'));po.position.set(0,.0,.02);po.renderOrder=999;po.frustumCulled=false;g.add(po);
  const fl=new T.Mesh(new T.BoxGeometry(.078,.016,.048),mat('#8c6a3e'));fl.position.set(0,.03,.02);fl.renderOrder=999;fl.frustumCulled=false;g.add(fl);
  POUCH.push({k:t[0],g,pr});});
 beltG.rotation.x=-.45;}
function updateBelt(dt,show){if(!beltG)return;beltG.visible=show;if(!show)return;
 beltOpen+=(beltWant-beltOpen)*Math.min(1,dt*10);
 beltG.position.set(0,-.37+beltOpen*.22,-.52-beltOpen*.0);beltG.rotation.x=-.45-beltOpen*.35;
 POUCH.forEach(po=>{po.pr.visible=po.k!==tool;});
 // nombres sobre cada bolsillo cuando está levantado (o la pista tras dos errores)
 const s=step(),hint=!!(s&&stepErrs>=2&&tool!==s.tool);const showTags=beltOpen>.55||hint;el.tags.style.display=showTags?'block':'none';
 if(showTags){const v=new T.Vector3(),W=innerWidth,H=innerHeight;POUCH.forEach((po,i)=>{const b=el.tags.children[i];po.g.getWorldPosition(v);v.y+=0;v.project(camera);const on=beltOpen>.55||(hint&&po.k===s.tool);b.style.display=on?'block':'none';if(on){b.style.left=((v.x+1)/2*W)+'px';b.style.top=((1-v.y)/2*H-26)+'px';b.classList.toggle('sel',po.k===tool);b.classList.toggle('need',hint&&po.k===s.tool);}});}}
function buildHands(){if(hands)return;hands=new T.Group();hands.name='Manos del técnico';HR=glove(1);HL=glove(-1);hands.add(HR,HL);camera.add(hands);
 heldG=camera.children.find(c=>c.name==='Herramienta del jugador');if(heldG){heldBase={p:new T.Vector3(.29,-.08,-.62),r:heldG.rotation.clone()};heldG.scale.setScalar(.0001);}}
const HPR=new T.Vector3(.25,-.07,-.55),HPL=new T.Vector3(-.25,-.09,-.55);
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.05,(now-tt)/1000||0);tt=now;
 if(!on){if(hands)hands.visible=false;el.cross&&(el.cross.style.display='none');return;}
 if(!hands){buildHands();buildBelt();}if(!beltG)buildBelt();let w=null;try{w=Walk31.state();}catch(e){}
 const showUI=!(choice||el.intro.style.display==='grid'||el.end.style.display==='grid')&&w&&w.active;
 hands.visible=!!showUI;el.cross.style.display=showUI&&!hold?'block':'none';updateBelt(dt,!!showUI);if(!showUI){el.tags.style.display='none';return;}
 holdTick(dt);if(window.__noanim)return;
 let sp=0;if(w&&lastP){sp=Math.min(1,Math.hypot(w.position[0]-lastP[0],w.position[2]-lastP[2])/Math.max(dt,.016)/3);}lastP=w?w.position.slice():null;
 phase+=dt*(5+sp*7);const bob=Math.sin(phase)*.012*sp,sway=Math.cos(phase*.5)*.01*sp,idle=Math.sin(now/900)*.003;
 kick.ok=Math.max(0,kick.ok-dt*3.2);kick.err=Math.max(0,kick.err-dt*3);kick.draw=Math.max(0,kick.draw-dt*3.2);
 const push=Math.sin(kick.ok*Math.PI)*.07,dip=Math.sin(kick.draw*Math.PI)*.22,shake=Math.sin(kick.err*32)*.02*kick.err;
 let hx=0,hy=0,hz=0,hr=0;if(hold){const k=now/1000;if(tool==='cepillo'){hx=Math.sin(k*24)*.04;hz=Math.sin(k*24)*.012;}else if(tool==='pano'){hx=Math.sin(k*18)*.05;hy=Math.sin(k*9)*.01;}else if(tool==='llave'){hr=Math.sin(k*13)*.4;hz=-.03;}else if(tool==='linterna'){hx=Math.sin(k*3)*.03;hz=-.03;}else{hz=-.05+Math.sin(k*10)*.01;}}
 const hasModel=tool!=='mano';
 HR.position.set(HPR.x+sway+hx+shake,HPR.y+bob+idle-dip+hy,HPR.z+hz-push);HR.rotation.set(-.12,.1,hr);
 HL.position.set(HPL.x-sway,HPL.y+bob*.8-idle-dip*.7,HPL.z);HL.rotation.set(-.12,-.1,0);
 pose(HR,hasModel?1:.25+(hold?.35:0)+(kick.ok?.3:0));pose(HL,.25+(tool==='cuaderno'?.3:0));
 if(heldG&&heldBase){heldG.scale.setScalar(.0001);}
 setProp(tool);
 if(false&&heldG&&heldBase){heldG.position.set(heldBase.p.x+sway+hx+shake,heldBase.p.y+bob+idle-dip+hy,heldBase.p.z+hz-push);heldG.rotation.set(heldBase.r.x,heldBase.r.y,heldBase.r.z+hr);}
}
requestAnimationFrame(animate);
// Entradas: teclado, clic y control
window.addEventListener('keydown',e=>{if(!on)return;
 if(el.intro.style.display==='grid'&&(e.code==='Enter'||e.code==='Space')){e.preventDefault();e.stopImmediatePropagation();el.intro.style.display='none';return;}
 if(choice){if(/^Digit[1-9]$/.test(e.code)){const b=$$('rtOpts')&&$$('rtOpts').children[+e.code.slice(5)-1];if(b){e.preventDefault();e.stopImmediatePropagation();b.click();}}return;}
 if(el.intro.style.display==='grid'||el.end.style.display==='grid')return;
 if(/^Digit[1-9]$/.test(e.code)){e.preventDefault();e.stopImmediatePropagation();setTool(TOOLS[+e.code.slice(5)-1][0]);}
 else if(e.code==='KeyQ'){e.preventDefault();e.stopImmediatePropagation();beltWant=1;}
 else if(e.code==='KeyE'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)begin();}
},true);
window.addEventListener('keyup',e=>{if(on&&e.code==='KeyQ'){e.stopImmediatePropagation();beltWant=0;}if(on&&e.code==='KeyE'){e.stopImmediatePropagation();if(hold)cancel();}},true);
window.addEventListener('pointerup',()=>{if(on&&hold&&!choice)cancel();},true);
window.addEventListener('pointerdown',e=>{if(!on||choice||e.button!==0)return;if(document.pointerLockElement&&e.target===document.pointerLockElement){e.preventDefault();e.stopImmediatePropagation();begin();}},true);
let pv={a:0,l:0,r:0};setInterval(()=>{if(!on)return;let g=null;try{const l=navigator.getGamepads?navigator.getGamepads():[];for(const x of l)if(x){g=x;break;}}catch(e){return;}if(!g)return;
 const a=g.buttons[0]&&g.buttons[0].pressed?1:0,l=g.buttons[4]&&g.buttons[4].pressed?1:0,r=g.buttons[5]&&g.buttons[5].pressed?1:0,i=TOOLS.findIndex(t=>t[0]===tool);
 if(a&&!pv.a){if(choice){const b=document.activeElement;b&&b.click&&b.click();}else begin();}if(!a&&pv.a&&hold)cancel();
 if(l&&!pv.l)setTool(TOOLS[(i+TOOLS.length-1)%TOOLS.length][0]);if(r&&!pv.r)setTool(TOOLS[(i+1)%TOOLS.length][0]);pv={a,l,r};},90);
// La rutina empieza sola cuando el recorrido en planta arranca desde el menú (a menos que se haya elegido la práctica clásica).
window.RutinaMantenimiento={start,leave,begin,state:()=>({on,tarea:ti,paso:si,errores:errs,estrellas:tscore.slice()}),skip:()=>{if(!on)return;si=TASKS[ti].steps.length;finishTask();}};
setInterval(()=>{if(on||window.__rutinaClasica)return;let w=null,m=null;try{w=Walk31.state();m=Maintenance.state();}catch(e){}
 if(w&&w.active&&w.zone==='plant'&&m&&m.active&&!m.finished&&!document.querySelector('dialog[open]')&&!window.gameMenuActive&&!window.__rutinaDone){window.__rutinaDone=true;start();}
 if(!w||!w.active)window.__rutinaDone=false;},400);
})();
