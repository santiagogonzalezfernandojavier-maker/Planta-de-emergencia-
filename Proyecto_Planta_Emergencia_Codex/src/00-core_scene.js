
const $=id=>document.getElementById(id),T=THREE;
const TYPES={diesel:['Diésel','La inyección introduce combustible en aire comprimido caliente; se representa encendido por compresión.'],petrol:['Gasolina','La mezcla aire-combustible se enciende mediante una bujía.'],ng:['Gas natural','Una línea de gas y un regulador alimentan el mezclador; el encendido usa bujías.'],lpg:['Gas LP','El depósito suministra gas a través de regulación; el motor usa encendido por chispa.'],bi:['Bicombustible','Selecciona gasolina o LP antes de iniciar. Se representa alimentación alternativa, no mezcla simultánea.']};
const PARTS={engine:['Motor térmico','Convierte energía química en giro del cigüeñal. El movimiento de pistones se muestra ralentizado.'],alternator:['Alternador','El rotor gira dentro del estator; su campo variable induce tensión alterna. La excitación y el AVR se identifican en el despiece; su recuperación se aproxima en Supervisión.'],fuel:['Alimentación de combustible','Suministra combustible al motor. La configuración cambia entre tanque de líquido, depósito LP y acometida de gas natural.'],cooling:['Refrigeración','La bomba mueve refrigerante entre motor y radiador; el ventilador favorece la disipación de calor.'],exhaust:['Escape y silenciador','Conducen los gases de combustión hacia el exterior y reducen el ruido.'],battery:['Batería y arranque','La batería alimenta el motor de arranque; no mantiene la carga del edificio durante la falla de red.'],control:['Controlador','Vigila la red, gobierna el arranque y permite estabilizar el grupo antes de transferir.'],ats:['Mando de transferencia','El tablero del sótano ordena la transferencia. Los interruptores QN y QG del exterior realizan la conmutación de potencia a 13.8 kV.'],enclosure:['Carcasa y bancada','Estructura de soporte y cubierta metálica sin marcas. Los apoyos representan aislamiento de vibraciones.']};
let eduConfig={tankL:400,fullFuelRate:13.5,tdes:2,tden:3,tdec:4},eduTest=null,eduHistory=[];
let cfg={pf:.85,fuel:'diesel',bi:'petrol',mode:'auto',phase:3,freq:60,rating:50},s,events=[],paused=false,guide='outage',selection='engine',subSelection='',isolated=false,angle=-.65,elevation=.5,distance=11,spinning=false,phaseMotion=0;let panOffset=new T.Vector3(0,0,0);
// Educational supervision: reduced-order dynamics, not a protection-setting or sizing tool.
function unidadTelemetry(dt){
 const nominal=cfg.freq*30,running=['warm','ready','cool'].includes(s.stage),p=s.source==='gen'?cfg.rating*s.load/100:0;
 s.hours+=running?dt/3600:0;const genLoad=s.source==='gen'?s.load:0;s.lastLoad??=genLoad;s.vSag=Math.max(0,(s.vSag||0)+Math.max(0,genLoad-s.lastLoad)/100*.12);s.speedSag=Math.max(0,(s.speedSag||0)+Math.max(0,genLoad-s.lastLoad)/100*.04);s.lastLoad=genLoad;s.vSag*=Math.exp(-dt/1.3);s.speedSag*=Math.exp(-dt/2.2);
 if(s.stage==='ready'||s.stage==='cool')s.rpm=nominal*(s.failure==='overspeed'?1.18:1-s.speedSag);
 const baseV=cfg.phase===3?480:277;s.genV=running?baseV*Math.min(1,s.rpm/nominal)*(1-s.vSag)*(s.failure==='avr'?.70:1):0;
 const goal=running?(s.failure==='cooling'?125:84+Math.min(120,s.load)*.085):s.grid?32:22;s.coolant+=(goal-s.coolant)*(1-Math.exp(-dt/60));if(s.failure==='cooling'&&running)s.coolant=Math.max(s.coolant,108);
 s.oilBar=running?Math.max(.4,3.7*Math.min(1,s.rpm/nominal))*(s.failure==='oil'?.10:1):s.stage==='starting'?.3:0;
 s.batteryV=s.stage==='starting'?(s.failure==='starter'?8.8:10.6):s.grid&&s.failure!=='charger'?13.5:12.6;
 s.fuelRate=running&&['diesel','petrol'].includes(activeFuel())?eduConfig.fullFuelRate*(.1+.9*Math.min(1.2,p/cfg.rating)):0;
 if(s.fuelRate)s.reserve=Math.max(0,s.reserve-s.fuelRate*dt/3600/eduConfig.tankL*100);
 s.autonomy=s.fuelRate>0?eduConfig.tankL*s.reserve/100/s.fuelRate:null;
 s.generatorOK=s.stage==='ready'&&s.genV>=baseV*.9&&s.genV<=baseV*1.1&&Math.abs(s.rpm/30-cfg.freq)<cfg.freq*.05;
 const alarms=[];if(s.reserve<=15&&activeFuel()!=='ng')alarms.push('Bajo nivel de combustible');if(s.failure==='charger')alarms.push('Falla del cargador de batería');if(s.failure==='flood')alarms.push('Agua en sótano: revisar achique y acceso');if(s.failure==='leak')alarms.push('Fuga de combustible: revisar contención y aislar suministro');if(s.batteryV<9.5)alarms.push('Baja tensión de arranque');if(running&&s.load<30&&activeFuel()==='diesel')alarms.push('Carga baja: revisar duración de operación');if(s.coolant>100)alarms.push('Alta temperatura de refrigerante');if(running&&s.oilBar<1)alarms.push('Baja presión de aceite');if(s.failure==='avr'&&running)alarms.push('Subtensión: revisar AVR y excitación');s.alarms=alarms;
 if(s.stage==='ready'){const fault=s.failure==='overspeed'?'Sobrevelocidad':s.oilBar<1?'Baja presión de aceite':s.coolant>=108?'Alta temperatura de refrigerante':s.genV<baseV*.8?'Subtensión del generador':'';s.guardTime=fault?(s.guardTime||0)+dt:0;if(fault&&(fault==='Sobrevelocidad'||s.guardTime>=2))trip(fault);}else s.guardTime=0;
 if(running&&s.reserve<=0&&activeFuel()!=='ng')trip('Sin combustible o suministro');
 if(s.source==='gen'&&!s.generatorOK&&s.stage==='ready'&&s.genV<baseV*.8){s.source='none';log('Carga desconectada','Subtensión: se abre la salida de emergencia. Se conserva el diagnóstico antes del paro temporizado.');}
 unidadTests(dt);
}
function unidadTests(dt){if(!eduTest||eduTest.done)return;const e=s.t-eduTest.start;if(s.stage==='starting'&&eduTest.crank==null)eduTest.crank=e;if(s.stage==='ready'&&eduTest.ready==null)eduTest.ready=e;if(s.source==='gen'&&eduTest.transfer==null){eduTest.transfer=e;log('Medición de respuesta',e.toFixed(1)+' s de simulación desde falla de red hasta alimentación de carga.');}
 if(eduTest.kind==='transfer'&&eduTest.transfer!=null){eduTest.done=true;eduTest.result='Transferencia completada. Arranque '+eduTest.crank.toFixed(1)+' s; disponibilidad '+eduTest.ready.toFixed(1)+' s; carga '+eduTest.transfer.toFixed(1)+' s. Tiempos didácticos, sin dictamen normativo.';}
 if(eduTest.kind==='starter'&&s.stage==='fault'){eduTest.done=true;eduTest.result='Bloqueo verificado tras '+s.attempts+' intentos. Alarma: '+s.fault;}
 if(eduTest.kind==='load'&&s.source==='gen'){eduTest.loadStart??=s.t;const step=Math.min(3,Math.floor((s.t-eduTest.loadStart)/8));if(step!==eduTest.step){eduTest.step=step;s.load=[25,50,75,100][step];$('load').value=s.load;log('Prueba con carga',s.load+'%: se observan tensión, frecuencia y recuperación.');}eduTest.minV=Math.min(eduTest.minV,s.genV);eduTest.minF=Math.min(eduTest.minF,s.rpm/30);if(s.t-eduTest.loadStart>=36){eduTest.done=true;eduTest.result='Escalones 25/50/75/100% completados. Mínimos observados: '+eduTest.minV.toFixed(1)+' V y '+eduTest.minF.toFixed(2)+' Hz. Ensayo virtual abreviado.';}}
 if(eduTest.done){eduHistory.unshift({title:eduTest.kind,result:eduTest.result,time:s.t});eduHistory=eduHistory.slice(0,50);log('Resultado de prueba',eduTest.result);}
}
function startUnidadTest(kind){reset();cfg.mode='auto';$('mode').value='auto';eduTest={kind,start:s.t,done:false,minV:Infinity,minF:Infinity};if(kind==='starter')s.failure='starter';gridToggle();log('Prueba guiada',{transfer:'Falla de red y cronometraje hasta carga.',load:'Transferencia seguida de cuatro escalones de carga.',starter:'Batería insuficiente: comprobar intentos y bloqueo.'}[kind]);renderUI();}
function renderUnidad(){const d=$('unidadSupervision');if(!d?.open)return;const p=s.source==='none'?0:cfg.rating*s.load/100,kva=p/cfg.pf,kvar=p*Math.tan(Math.acos(cfg.pf));const liquid=['diesel','petrol'].includes(activeFuel());const vals={urating:cfg.rating.toFixed(0)+' kW / '+(cfg.rating/.8).toFixed(1)+' kVA',upower:p.toFixed(1)+' kW / '+kva.toFixed(1)+' kVA',ureactive:kvar.toFixed(1)+' kvar · FP '+cfg.pf.toFixed(2),uvoltage:s.genV.toFixed(1)+' V / '+(s.rpm/30).toFixed(2)+' Hz',uoil:s.oilBar.toFixed(2)+' bar',utemp:s.coolant.toFixed(1)+' °C',ubattery:s.batteryV.toFixed(1)+' V',ufuel:liquid?(eduConfig.tankL*s.reserve/100).toFixed(1)+' L / '+s.fuelRate.toFixed(1)+' L/h':'Suministro '+TYPES[activeFuel()][0],uautonomy:liquid?(s.autonomy==null?'Motor detenido':s.autonomy.toFixed(1)+' h estimadas'):'Depende del suministro',uhours:s.hours.toFixed(3)+' h / '+s.attempts+' intentos'};for(const [id,v]of Object.entries(vals))$(id).textContent=v;$('uAlarms').textContent=s.fault?'PARO · '+s.fault:s.alarms.length?'ALARMA · '+s.alarms.join(' · '):'Disponible: sin alarmas activas';$('uAlarms').dataset.state=s.fault?'fault':s.alarms.length?'alarm':'ok';$('uTestResult').textContent=eduTest?eduTest.result||'Prueba en curso · '+(s.t-eduTest.start).toFixed(1)+' s de simulación':'Selecciona una prueba. Los ensayos usan tiempos abreviados.';$('uReports').replaceChildren(...eduHistory.slice(0,10).map(entry=>{const li=document.createElement('li');li.textContent=entry.result;return li;}));}
function initUnidadUI(){
 const d=document.createElement('dialog');d.id='unidadSupervision';d.setAttribute('aria-labelledby','uTitle');d.innerHTML=`<div class="u-head"><div><span class="u-kicker">UNIDAD VII · OPERACIÓN</span><h2 id="uTitle">Supervisión de la planta</h2></div><button id="uClose">Cerrar</button></div><div class="u-body"><p>Grupo individual para respaldo de procesos industriales. Transición abierta; conmutación de potencia exterior. Las mediciones y fallas usan modelos didácticos de primer orden.</p><div id="uAlarms" role="status"></div><div class="u-meters">${[['Capacidad nominal (FP 0.8)','urating'],['Potencia activa / aparente','upower'],['Reactiva / factor de potencia','ureactive'],['Salida del generador','uvoltage'],['Presión de aceite','uoil'],['Refrigerante','utemp'],['Batería de arranque','ubattery'],['Combustible / consumo','ufuel'],['Autonomía','uautonomy'],['Horas / intentos','uhours']].map(([label,id])=>'<div><span>'+label+'</span><strong id="'+id+'">—</strong></div>').join('')}</div><details open><summary>Parámetros de operación</summary><div class="u-settings"><label>Factor de potencia<input id="uPF" type="number" min="0.5" max="1" step=".01" value="${cfg.pf}"></label><label>Tanque útil (L)<input id="uTank" type="number" min="10" max="10000" value="${eduConfig.tankL}"></label><label>Consumo a plena carga (L/h)<input id="uRate" type="number" min=".1" max="2000" step=".1" value="${eduConfig.fullFuelRate}"></label><label>Retardo de arranque (s)<input id="uTDES" type="number" min="0" max="300" value="${eduConfig.tdes}"></label><label>Retorno a red (s)<input id="uTDEN" type="number" min="0" max="1800" value="${eduConfig.tden}"></label><label>Enfriamiento (s)<input id="uTDEC" type="number" min="0" max="1800" value="${eduConfig.tdec}"></label></div><button id="uApply">Aplicar parámetros</button><p id="uSettingsNote">El consumo inicial es un supuesto editable; sustituye por la curva del fabricante. La autonomía no incluye una reserva adicional. Los retardos están expresados en segundos de simulación.</p></details><details open><summary>Pruebas de puesta en servicio</summary><div class="buttons"><button data-u-test="transfer">Falla y transferencia</button><button data-u-test="load">Carga escalonada</button><button data-u-test="starter">Falla de arranque</button><button id="uPause">Pausar / continuar</button></div><p id="uTestResult" role="status"></p><ol id="uReports" class="u-reports"></ol></details><details><summary>Diagnóstico de protecciones</summary><div class="u-settings"><label>Condición a introducir<select id="uFailure"><option value="oil">Baja presión de aceite</option><option value="cooling">Falla de refrigeración</option><option value="avr">Falla de AVR / subtensión</option><option value="overspeed">Sobrevelocidad</option><option value="charger">Falla del cargador</option><option value="flood">Agua en sótano / achique</option><option value="leak">Detección de fuga de combustible</option></select></label></div><div class="buttons"><button id="uInject">Introducir condición</button><button id="uReset">Restablecer escenario</button></div><p>Combustible bajo y fallo del cargador generan alarma. Aceite, temperatura, sobrevelocidad y subtensión tienen acciones didácticas de paro/desconexión. Los umbrales no son ajustes para un equipo real ni una especificación de seguridad de vida.</p></details><details><summary>Inspección y mantenimiento</summary>${['Nivel de aceite y refrigerante','Combustible y drenaje del separador','Batería, bornes y cargador','Ventilación, escape, detección y achique','Puesta a tierra y estado de conexiones','Prueba con carga y transferencia'].map((x,i)=>'<label class="u-check"><input type="checkbox" data-u-check="'+i+'">'+x+'</label>').join('')}<button id="uRecord">Registrar inspección</button><p id="uRecordNote">Registro de práctica en la bitácora del simulador. Para intervenir físicamente se requiere aislamiento de ambas fuentes y procedimiento de mantenimiento.</p></details><p class="u-source">Base didáctica: Unidad VII, apartados 7.2, 7.4, 7.5 y 7.6. Las protecciones, régimen ESP/PRP y dimensionamiento definitivo deben corresponder al equipo seleccionado. Este módulo no calcula cortocircuitos, coordinación, armónicos ni cumplimiento normativo.</p></div>`;document.body.append(d);
 const btn=document.createElement('button');btn.id='openUnidadSupervision';btn.textContent='Supervisión';$('viewbar').lastElementChild.prepend(btn);btn.onclick=()=>{d.showModal();renderUnidad();};$('uClose').onclick=()=>d.close();$('uPause').onclick=()=>{$('pause').click();renderUnidad();};
 $('uApply').onclick=()=>{const fields=[['uPF',.5,1],['uTank',10,10000],['uRate',.1,2000],['uTDES',0,300],['uTDEN',0,1800],['uTDEC',0,1800]],values=fields.map(([id,min,max])=>{const v=Number($(id).value);return $(id).value!==''&&Number.isFinite(v)&&v>=min&&v<=max?v:null;});if(values.includes(null)){$('uSettingsNote').textContent='Revisa los valores: deben estar dentro del intervalo indicado en cada campo.';return;}[cfg.pf,eduConfig.tankL,eduConfig.fullFuelRate,eduConfig.tdes,eduConfig.tden,eduConfig.tdec]=values;log('Parámetros de supervisión','FP '+cfg.pf+', tanque útil '+eduConfig.tankL+' L y caudal a plena carga '+eduConfig.fullFuelRate+' L/h.');$('uSettingsNote').textContent='Parámetros aplicados. El consumo es un supuesto editable; autonomía con volumen útil, sin reserva adicional.';renderUI();};
 d.querySelectorAll('[data-u-test]').forEach(b=>b.onclick=()=>startUnidadTest(b.dataset.uTest));$('uInject').onclick=()=>{s.failure=$('uFailure').value;log('Condición de diagnóstico','Se introduce '+$('uFailure').selectedOptions[0].textContent+'.');renderUI();};$('uReset').onclick=()=>{reset();renderUI();};$('uRecord').onclick=()=>{const done=d.querySelectorAll('[data-u-check]:checked').length;const result=done+' de 6 puntos revisados. Horómetro '+s.hours.toFixed(3)+' h.';log('Inspección registrada',result);eduHistory.unshift({title:'Inspección',result,time:s.t});renderUnidad();$('uRecordNote').textContent=done+' de 6 puntos registrados en Historial explicativo; revisar pendientes antes de aceptar el equipo.';};
 window.UnidadVII={state:()=>({genV:s.genV,frequency:s.rpm/30,oil:s.oilBar,coolant:s.coolant,battery:s.batteryV,alarms:s.alarms.slice(),failure:s.failure,reserve:s.reserve,autonomy:s.autonomy,attempts:s.attempts,source:s.source,stage:s.stage,fault:s.fault,test:eduTest?{...eduTest}:null}),test:startUnidadTest,settings:eduConfig};
}

// Unidad VII: functional auxiliary components shared by the campus and inspection views.
const EDU_PARTS=[
 ['alternator','Excitatriz y rectificador rotatorio','La excitatriz produce CA; seis diodos giratorios rectifican esa energía para alimentar el campo del rotor principal. El modelo es brushless y no incluye PMG en su configuración base.',[.6,.5,.6]],
 ['alternator','AVR y circuito de sensado','El AVR compara la tensión medida con la referencia y modifica la excitación. Su fallo reduce la tensión y bloquea o interrumpe la transferencia en la simulación.',[.6,.8,.5]],
 ['engine','Regulador electrónico y actuador','El regulador de velocidad ajusta el aporte de combustible. La frecuencia cae brevemente ante un escalón de carga y se recupera mediante un modelo de primer orden.',[-.2,.5,.8]],
 ['engine','Bomba de aceite y galerías','Bomba de engranajes, aspiración con colador, enfriador y galerías: cárter → bomba → filtro/enfriador → cojinetes → retorno. La supervisión calcula una presión representativa.',[-.2,.1,.8]],
 ['cooling','Termostato y calentador de camisa','El termostato regula el circuito; el calentador mantiene tibio el refrigerante con la red disponible y el motor detenido. La temperatura se aproxima mediante un balance simplificado.',[-.7,.4,.6]],
 ['fuel','Bomba de alimentación y medición de nivel','Bomba de baja presión y sensor de nivel para combustible líquido. El consumo y la autonomía se estiman con el volumen y el caudal configurados; no se calcula la inyección de alta presión.',[-.4,.3,.7]],
 ['control','Anunciador de alarmas y señales','Indicadores de disponibilidad, bajo combustible y fallas de motor, tensión y cargador. Las alarmas se distinguen de los paros y quedan registradas en Supervisión.',[.4,.8,1]],
 ['engine','Posenfriador e indicador de restricción','Intercambiador aire-aire representativo para la configuración diésel turbocargada e indicador de restricción del filtro. No representa un equipo universal para todas las tecnologías.',[-.5,.7,.6]]
];
function eduRing(g,ro,ri,d,pos,m,axis='x'){const sh=new T.Shape();sh.absarc(0,0,ro,0,Math.PI*2,false);const h=new T.Path();h.absarc(0,0,ri,0,Math.PI*2,true);sh.holes.push(h);const obj=mesh(g,new T.ExtrudeGeometry(sh,{depth:d,bevelEnabled:true,bevelThickness:.001,bevelSize:.001,bevelSegments:2,curveSegments:40}),m,pos);if(axis==='x'){obj.rotation.y=Math.PI/2;obj.position.x-=d/2;}else if(axis==='y'){obj.rotation.x=-Math.PI/2;obj.position.y-=d/2;}else obj.position.z-=d/2;return obj;}
function eduBolt(g,pos,axis='z',r=.010){const b=mesh(g,new T.CylinderGeometry(r,r,.015,6),mat('#a0a8aa',.85),pos);if(axis==='x')b.rotation.z=Math.PI/2;if(axis==='z')b.rotation.x=Math.PI/2;return b;}
// D16: mounting and service ports use one coordinate set in the campus and inspection.
const ASSEMBLY_PORTS={filterOut:[.13,2.53,.60],turboIn:[-.08,2.17,-.82],turboOut:[-.23,2.36,-.82],intercoolerIn:[-2.54,2.02,.35],intercoolerOut:[-2.54,1.51,-.35],manifoldIn:[.20,1.95,.55],fuelPumpIn:[-1.43,1.29,.50],fuelPumpOut:[-1.27,1.29,.50],injectionIn:[.62,1.78,.63],fineFilterOut:[-1.8,1.193,.50],oilFilterIn:[-1.15,1.3,.72],oilFilterOut:[-.72,1.3,.72]};
function coherentAlternatorMount(g){const cast=mat('#465154',.66),metal=mat('#abb2b4',.88),ins=mat('#20272a');for(const x of [.9,2])for(const z of [-.5,.5]){box(g,[.27,.11,.24],[x,.65,z],cast);box(g,[.31,.025,.28],[x,.595,z],metal);for(const dx of [-.095,.095])eduBolt(g,[x+dx,.724,z],'y',.012);}
 // Hollow terminal enclosure; the AVR and power terminals sit inside, not in a solid block.
 const cx=1.55,cy=1.99;box(g,[.88,.020,.74],[cx,1.7,0],cast);for(const x of [cx-.43,cx+.43])box(g,[.02,.59,.74],[x,cy,0],cast);for(const z of [-.36,.36])box(g,[.86,.59,.02],[cx,cy,z],cast);box(g,[.93,.025,.78],[cx,2.303,0],cast);for(const x of [1.19,1.91])for(const z of [-.29,.29])eduBolt(g,[x,2.326,z],'y',.009);
 eduRing(g,.373,.348,.59,[2.55,1.05,0],cast);
 const sh=new T.Shape();sh.absarc(0,0,.373,0,Math.PI*2,false);for(const y of [-.255,-.204,-.153,-.102,.102,.153,.204,.255]){const width=Math.sqrt(.34*.34-y*y)*1.8,h=new T.Path();h.moveTo(-width/2,y-.010);h.lineTo(-width/2,y+.010);h.lineTo(width/2,y+.010);h.lineTo(width/2,y-.010);h.closePath();sh.holes.push(h);}const cap=mesh(g,new T.ExtrudeGeometry(sh,{depth:.015,bevelEnabled:true,bevelSize:.001,bevelThickness:.001,bevelSegments:2,curveSegments:64}),cast,[2.848,1.05,0]);cap.rotation.y=Math.PI/2;for(let j=0;j<8;j++){const a=j*Math.PI/4;eduBolt(g,[2.871,1.05+Math.cos(a)*.347,Math.sin(a)*.347],'x',.010);}for(let j=0;j<24;j++){const a=j*Math.PI/12;const rib=box(g,[.52,.012,.023],[2.55,1.05+Math.cos(a)*.38,Math.sin(a)*.38],cast);rib.rotation.x=a;}tube(g,[[1.82,1.99,.38],[2.02,1.71,.67],[2.16,1.15,.72],[2.45,.70,.74]],.038,ins);}
function coherentTurbo(g){const cast=mat('#465154',.65),metal=mat('#abb2b4',.85);for(const [x,m]of [[-.55,cast],[-.23,metal]]){const volute=mesh(g,new T.TorusGeometry(.152,.060,20,72),m,[x,2.17,-.82]);volute.rotation.y=Math.PI/2;eduRing(g,.094,.064,.062,[x+.082,2.17,-.82],metal);for(let j=0;j<8;j++){const a=j*Math.PI/4;eduBolt(g,[x+.043,2.17+Math.cos(a)*.135,-.82+Math.sin(a)*.135],'x',.008);}}cyl(g,.054,.22,[-.39,2.17,-.82],cast,'x');eduRing(g,.078,.057,.023,ASSEMBLY_PORTS.turboIn,metal);proPipe(g,[[-.55,2.33,-.82],[-.55,2.43,-.82],[0,2.43,-.8]],.07,cast,.08);for(const x of [-.55,-.23]){box(g,[.048,.18,.055],[x,2.00,-.82],cast);eduBolt(g,[x,1.92,-.78],'z');}}
function coherentExcitation(g){const cast=mat('#465154',.65),metal=mat('#abb2b4',.85),copper=mat('#a76532',.55),ins=mat('#3c3027');eduRing(g,.217,.116,.13,[2.49,1.05,0],cast);eduRing(g,.109,.055,.108,[2.49,1.05,0],cast);for(let j=0;j<12;j++){const a=j*Math.PI/6,pg=new T.Group();pg.position.set(2.49,1.05,0);pg.rotation.x=a;g.add(pg);box(pg,[.134,.042,.027],[0,.159,0],ins);for(let k=0;k<9;k++){const loop=mesh(pg,new T.TorusGeometry(.024,.0022,6,24),copper,[-.047+k*.011,.165,0]);loop.scale.z=.58;loop.rotation.y=Math.PI/2;}box(pg,[.12,.020,.018],[0,.095,0],copper);}
 eduRing(g,.193,.070,.020,[2.662,1.05,0],ins);for(const sign of [-1,1]){const sector=new T.Shape();sector.absarc(0,0,.188,sign<0?Math.PI+.12:.12,sign<0?Math.PI*2-.12:Math.PI-.12,false);sector.absarc(0,0,.117,sign<0?Math.PI*2-.12:Math.PI-.12,sign<0?Math.PI+.12:.12,true);sector.closePath();const sink=mesh(g,new T.ExtrudeGeometry(sector,{depth:.018,bevelEnabled:true,bevelSize:.001,bevelThickness:.001,bevelSegments:2,curveSegments:48}),metal,[2.68,1.05,0]);sink.rotation.y=Math.PI/2;}for(let j=0;j<6;j++){const a=j*Math.PI/3+.2,y=1.05+Math.cos(a)*.151,z=Math.sin(a)*.151;cyl(g,.016,.028,[2.708,y,z],metal,'x');eduBolt(g,[2.731,y,z],'x',.010);tube(g,[[2.724,y,z],[2.745,y,z],[2.745,1.05+Math.cos(a)*.093,Math.sin(a)*.093],[2.56,1.05+Math.cos(a)*.093,Math.sin(a)*.093]],.004,copper);}cyl(g,.053,.34,[2.61,1.05,0],metal,'x');}
function coherentOil(g){const metal=mat('#abb2b4',.85),cast=mat('#465154',.65),rubber=mat('#192428');const sh=new T.Shape();sh.moveTo(-.15,-.065);sh.quadraticCurveTo(-.15,-.09,-.125,-.09);sh.lineTo(.125,-.09);sh.quadraticCurveTo(.15,-.09,.15,-.065);sh.lineTo(.15,.065);sh.quadraticCurveTo(.15,.09,.125,.09);sh.lineTo(-.125,.09);sh.quadraticCurveTo(-.15,.09,-.15,.065);sh.closePath();const hole=new T.Path();hole.moveTo(-.117,-.060);hole.lineTo(-.117,.060);hole.lineTo(.117,.060);hole.lineTo(.117,-.060);hole.closePath();sh.holes.push(hole);mesh(g,new T.ExtrudeGeometry(sh,{depth:.065,bevelEnabled:true,bevelThickness:.0015,bevelSize:.0015,bevelSegments:3}),cast,[-1.075,.60,.23]);for(const [index,x]of [-1.13,-1.02].entries()){cyl(g,.044,.049,[x,.60,.266],metal,'z');for(let j=0;j<12;j++){const a=j*Math.PI/6+index*Math.PI/12;const tooth=box(g,[.013,.009,.049],[x+Math.cos(a)*.050,.60+Math.sin(a)*.050,.266],metal);tooth.rotation.z=a;}cyl(g,.017,.071,[x,.60,.266],metal,'z');}for(const x of [-1.20,-.95])for(const y of [.53,.67])eduBolt(g,[x,y,.303],'z',.007);
 const colander=mesh(g,new T.SphereGeometry(.084,32,16),metal,[-1.2,.40,.20]);colander.scale.y=.34;for(let j=0;j<9;j++)box(g,[.123,.002,.002],[-1.2,.426,.15+j*.013],rubber);proPipe(g,[[-1.2,.425,.20],[-1.2,.51,.20],[-1.13,.60,.23]],.020,metal,.025);proPipe(g,[[-1.02,.60,.28],[-.88,.60,.28],[-.88,1.30,.72],ASSEMBLY_PORTS.oilFilterIn],.018,metal,.06);
 box(g,[.37,.16,.10],[-.72,1.31,.92],cast);for(let j=0;j<12;j++)box(g,[.33,.006,.11],[-.72,1.245+j*.012,.92],metal);proPipe(g,[ASSEMBLY_PORTS.oilFilterOut,[-.72,1.31,.92]],.015,metal,.04);proPipe(g,[[-.55,1.31,.92],[-.55,1.47,.92],[-1.4,1.47,.48],[.1,1.47,.48]],.016,metal,.06);for(let j=0;j<4;j++)proPipe(g,[[-1.4+j*.52,1.47,.48],[-1.4+j*.52,1.10,.38]],.012,metal,.04);}
function coherentFuelPump(g){const cast=mat('#465154',.65),metal=mat('#abb2b4',.85),rubber=mat('#192428');cyl(g,.052,.16,[-1.35,1.29,.5],cast,'x');for(const x of [-1.43,-1.27])eduRing(g,.058,.032,.012,[x,1.29,.5],metal);box(g,[.20,.035,.095],[-1.35,1.22,.5],metal);for(const x of [-1.41,-1.29])eduBolt(g,[x,1.24,.48],'y',.009);proPipe(g,[ASSEMBLY_PORTS.fuelPumpOut,[-1.15,1.29,.50],[-1.15,1.29,1.00],[.62,1.29,1.00],[.62,1.78,1.00],ASSEMBLY_PORTS.injectionIn],.018,metal,.075);eduRing(g,.057,.014,.012,[-.77,.72,-.4],metal,'y');cyl(g,.009,.31,[-.77,.56,-.4],metal);const float=mesh(g,new T.SphereGeometry(.036,24,16),rubber,[-.77,.45,-.4]);float.scale.y=.55;proPipe(g,[[-.77,.73,-.4],[-.77,.80,-.4],[2.4,1.05,.78]],.005,rubber,.08);}
function coherentIntercooler(g){const cast=mat('#465154',.65),metal=mat('#abb2b4',.85),rubber=mat('#192428');box(g,[.13,.53,.74],[-2.54,1.76,0],cast);for(let j=0;j<55;j++)box(g,[.138,.005,.69],[-2.54,1.515+j*.009,0],metal);for(const y of [1.51,2.02])cyl(g,.040,.72,[-2.54,y,0],cast,'z');for(const y of [1.51,2.02])for(const z of [-.31,.31]){box(g,[.24,.027,.068],[-2.44,y,z],metal);eduBolt(g,[-2.51,y+.025,z],'y',.008);}proPipe(g,[ASSEMBLY_PORTS.turboOut,[-.23,2.60,-.82],[-2.54,2.60,-.82],[-2.54,2.60,.35],ASSEMBLY_PORTS.intercoolerIn],.05,rubber,.11);proPipe(g,[ASSEMBLY_PORTS.intercoolerOut,[-2.54,1.35,-.35],[-1.98,1.35,-.35],[-1.98,1.35,1.05],[.20,1.35,1.05],[.20,1.95,1.05],ASSEMBLY_PORTS.manifoldIn],.05,rubber,.1);for(const pos of [ASSEMBLY_PORTS.intercoolerIn,ASSEMBLY_PORTS.intercoolerOut])eduRing(g,.055,.047,.014,pos,metal,'z');cyl(g,.023,.065,[-.3,2.75,.6],mat('#ad964b',.15),'y');cyl(g,.016,.03,[-.3,2.71,.6],metal,'y');}

function eduBuild(name,g){const metal=mat('#a1a9aa',.83),casting=mat('#424e51',.65),wire=mat('#a76532',.55),rubber=mat('#192428'),board=mat('#225c45',.12),paint=mat('#ad964b',.15);
 if(name===EDU_PARTS[0][1]){coherentExcitation(g);} else if(name===EDU_PARTS[1][1]){const mount=new T.Group();g.add(mount);mount.position.z=-.14;g=mount;box(g,[.28,.19,.012],[1.55,2.02,.353],board);for(const x of [1.44,1.66])for(const y of [1.95,2.09])eduBolt(g,[x,y,.368],'z',.005);box(g,[.095,.07,.025],[1.52,2.04,.372],rubber);for(let j=0;j<7;j++)box(g,[.10,.005,.038],[1.52,2.01+j*.010,.39],metal);for(const x of [1.45,1.64]){cyl(g,.020,.038,[x,2.00,.382],rubber,'z');cyl(g,.018,.002,[x,2.00,.402],metal,'z');}for(let j=0;j<8;j++){box(g,[.023,.027,.028],[1.45+j*.028,1.948,.374],board);eduBolt(g,[1.45+j*.028,1.949,.392],'z',.004);}for(let j=0;j<3;j++)tube(g,[[1.45+j*.045,1.935,.365],[1.45+j*.045,1.88,.39],[1.55,1.87,.4],[2.49,1.19,.26+j*.02]],.004,j%2?rubber:wire);}
 else if(name===EDU_PARTS[2][1]){box(g,[.29,.21,.075],[-.72,1.64,.67],casting);box(g,[.25,.17,.012],[-.72,1.64,.715],metal);for(const x of [-.82,-.62])for(const y of [1.58,1.70])eduBolt(g,[x,y,.728]);cyl(g,.045,.18,[-.41,1.65,.68],casting,'x');cyl(g,.017,.18,[-.30,1.65,.68],metal,'x');for(const x of [-.46,-.36])eduRing(g,.046,.039,.009,[x,1.65,.68],metal);tube(g,[[-.28,1.65,.68],[.50,1.65,.68],[.62,1.94,.68]],.009,metal);tube(g,[[-.60,1.61,.71],[-.49,1.61,.73],[-.49,1.65,.73]],.008,rubber);}
 else if(name===EDU_PARTS[3][1]){coherentOil(g);}
 else if(name===EDU_PARTS[4][1]){eduRing(g,.103,.057,.05,[-1.50,1.88,.48],casting,'y');cyl(g,.053,.06,[-1.50,1.88,.48],metal);const pts=[];for(let i=0;i<=80;i++){const a=i/80*Math.PI*10;pts.push(new T.Vector3(-1.50+Math.cos(a)*.032,1.88+i/80*.12,.48+Math.sin(a)*.032));}mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(pts),80,.004,6,false),metal);cyl(g,.038,.28,[-1.53,.85,-.70],metal,'x');for(const x of [-1.67,-1.39])eduRing(g,.048,.031,.02,[x,.85,-.70],casting);box(g,[.13,.12,.08],[-1.52,.95,-.70],rubber);tube(g,[[-1.67,.85,-.70],[-1.82,.85,-.70],[-1.82,1.10,-.50]],.024,rubber);tube(g,[[-1.39,.85,-.70],[-1.28,.85,-.70],[-1.28,1.1,-.5]],.024,rubber);tube(g,[[-1.52,1.01,-.70],[-1.52,1.10,-.78],[2.45,1.10,-.78]],.008,rubber);}
 else if(name===EDU_PARTS[5][1]){coherentFuelPump(g);}
 else if(name===EDU_PARTS[6][1]){box(g,[.33,.22,.05],[2.47,1.44,.97],casting);for(let i=0;i<6;i++){const color=i===0?'#4cbd8e':i===1?'#c9ae54':'#853c32';cyl(g,.014,.010,[2.375+i%3*.093,1.49-Math.floor(i/3)*.072,1.002],mat(color),'z');box(g,[.058,.005,.002],[2.375+i%3*.093,1.467-Math.floor(i/3)*.072,1.004],metal);}for(const x of [2.33,2.61])eduBolt(g,[x,1.44,1.007],'z',.006);}
 else if(name===EDU_PARTS[7][1]){coherentIntercooler(g);}
}
function detailPlantUnidadVII(){for(const [key,name,explain,offset]of EDU_PARTS){if(name===EDU_PARTS[5][1]&&!['diesel','petrol'].includes(activeFuel()))continue;if(name===EDU_PARTS[7][1]&&activeFuel()!=='diesel')continue;piece(key,name,explain,offset,g=>eduBuild(name,g));}}

function snapshot(){return {...s,cfg:{...cfg}}}function log(title,why){events.unshift({title,why,state:snapshot()});events=events.slice(0,100);$('timeline').replaceChildren();events.forEach((e,i)=>{const b=document.createElement('button');b.className='event';b.textContent=`${e.state.t.toFixed(1)} s · ${e.title}`;b.onclick=()=>{$('review').textContent=`${e.title}\n${e.why}\n\nConfiguración: ${TYPES[e.state.cfg.fuel][0]} · ${e.state.cfg.mode==='auto'?'automática':'manual'}\nMotor: ${Math.round(e.state.rpm)} rpm\nRed: ${e.state.grid?'presente':'ausente'}\nCarga conectada a: ${e.state.source}\nDemanda: ${e.state.load}% · Reserva: ${e.state.reserve.toFixed(1)}%`};$('timeline').append(b)})}
function reset(){eduTest=null;s={genV:0,oilBar:0,coolant:32,batteryV:13.5,hours:0,attempts:0,failure:'',alarms:[],fuelRate:0,autonomy:null,generatorOK:false,t:0,grid:true,stage:'off',timer:0,rpm:0,source:'grid',target:null,transfer:0,load:50,reserve:80,fault:'',over:0,returnTime:0};paused=false;$('pause').textContent='Pausar';$('load').value=50;$('reserve').value=80;events=[];log('Preparado','La red alimenta la carga; la planta está detenida y disponible.');renderUI()}
function transition(stage,why){s.stage=stage;s.timer=0;log({starting:'Arranque',crankpause:'Pausa de arranque',warm:'Estabilización',ready:'Planta disponible',cool:'Enfriamiento',off:'Motor detenido',fault:'Protección activada'}[stage],why)}
function start(){if(s.fault){log('Arranque bloqueado','Reinicia después de revisar la protección simulada.');return}if(s.reserve<=0){trip('Sin combustible o suministro');return}if(['off','cool'].includes(s.stage)){s.attempts=0;transition('starting','El motor de arranque hace girar el cigüeñal para iniciar la combustión.')}}
function transfer(target){if(s.target)return;if(target==='gen'&&(s.stage!=='ready'||!s.generatorOK)){log('Transferencia bloqueada','La planta debe alcanzar velocidad y tensión estables antes de tomar la carga.');return}if(target==='grid'&&!s.grid){log('Transferencia bloqueada','La red está ausente.');return}if(s.source===target)return;s.source='none';s.target=target;s.transfer=.8;log('Intervalo de transferencia','Ambas fuentes están desconectadas durante la transición abierta. No hay paralelismo.')}
function trip(reason){s.fault=reason;s.rpm=0;s.target=null;if(s.source==='gen')s.source='none';transition('fault',reason+'; se interrumpe la generación para proteger el sistema.');if(s.grid)transfer('grid')}
function gridToggle(){s.grid=!s.grid;s.returnTime=0;if(!s.grid&&s.stage==='off')s.timer=0;if(!s.grid&&s.source==='grid')s.source='none';log(s.grid?'Red restaurada':'Falla de red',s.grid?'El controlador confirma el retorno antes de reconectar la carga.':'La carga pierde alimentación hasta que una fuente disponible sea conectada.');renderUI()}
function stop(){if(['off','fault'].includes(s.stage)){log('Motor ya detenido','No es necesario iniciar un enfriamiento.');return}if(['starting','crankpause','warm'].includes(s.stage)){s.rpm=0;s.target=null;transition('off','El operador canceló el arranque.');return}if(s.source==='gen')s.source='none';s.target=null;transition('cool','La carga se desconecta y el motor funciona brevemente sin carga antes de parar.')}
function tick(dt){if(paused)return;s.t+=dt;s.timer+=dt;if(s.grid)s.returnTime+=dt;else s.returnTime=0;
if(cfg.mode==='auto'&&!s.grid&&!s.fault&&s.stage==='off'&&s.timer>eduConfig.tdes)start();
const nominal=cfg.freq*30;if(s.stage==='starting'){s.rpm=Math.min(320,s.timer*120);if(s.timer>=3){s.attempts++;if(s.failure==='starter'){if(s.attempts>=3)trip('Falla de arranque: tres intentos sin encendido');else transition('crankpause','Se pausa el arrancador antes de un nuevo intento.');}else transition('warm','La combustión sostiene el giro; se eleva la velocidad hacia el régimen nominal.')}}else if(s.stage==='crankpause'){s.rpm=0;if(s.timer>=2)transition('starting','Nuevo intento de arranque.');}else if(s.stage==='warm'){s.rpm=320+(nominal-320)*Math.min(1,s.timer/4);if(s.timer>=4)transition('ready','Se alcanzaron velocidad y tensión nominales; el grupo puede alimentar la carga.')}else if(['ready','cool'].includes(s.stage))s.rpm=nominal;else s.rpm=0;
if(cfg.mode==='auto'&&!s.grid&&s.stage==='ready'&&s.generatorOK&&s.source!=='gen'&&!s.target)transfer('gen');
if(cfg.mode==='auto'&&s.grid&&s.returnTime>eduConfig.tden&&s.source!=='grid'&&!s.target)transfer('grid');
if(s.target){s.transfer-=dt;if(s.transfer<=0){const target=s.target;s.target=null;if((target==='grid'&&s.grid)||(target==='gen'&&s.stage==='ready')){s.source=target;log('Fuente conectada',target==='grid'?'La red vuelve a alimentar la carga.':'El alternador entrega energía a la carga.')}else{s.source='none';log('Conexión cancelada','La fuente dejó de estar disponible durante la transición.')}}}
if(cfg.mode==='auto'&&s.grid&&s.source==='grid'&&s.stage==='ready')transition('cool','La red sostiene la carga. El motor disipa calor antes de detenerse.');if(s.stage==='cool'&&s.timer>eduConfig.tdec)transition('off','Terminó el enfriamiento; el motor queda disponible.');
if(['warm','ready','cool'].includes(s.stage)&&activeFuel()==='lpg'){s.reserve=Math.max(0,s.reserve-dt*(.04+(s.source==='gen'?s.load*.001:0)));if(s.reserve<=0)trip('Sin combustible o suministro')}
if(s.source==='gen'&&(s.load>100||s.load*.8/cfg.pf>100)){s.over+=dt;if(s.over>3)trip('Sobrecarga sostenida en kW o kVA')}else s.over=0;
unidadTelemetry(dt);phaseMotion+=dt*(s.rpm>0?2.7:0);}
function activeFuel(){return cfg.fuel==='bi'?cfg.bi:cfg.fuel}
function apply(){const previousRating=cfg.rating;for(const k of ['fuel','mode'])cfg[k]=$(k).value;cfg.bi=$('biFuel').value;for(const k of ['phase','freq','rating'])cfg[k]=+$(k).value;if(cfg.rating!==previousRating){eduConfig.fullFuelRate=cfg.rating*.27;if($('uRate'))$('uRate').value=eduConfig.fullFuelRate;}reset();build();selectPart('engine')}
function scenario(name){guide=name;reset();if(name==='outage')gridToggle();if(name==='recovery'){s.grid=false;s.stage='ready';s.rpm=cfg.freq*30;s.source='gen';gridToggle()}if(name==='overload'){s.grid=false;s.stage='ready';s.rpm=cfg.freq*30;s.source='gen';s.load=120;$('load').value=120;log('Carga elevada','La demanda supera la potencia nominal; la protección actuará si persiste.')}if(name==='fuel'){s.grid=false;s.stage='ready';s.rpm=cfg.freq*30;s.source='gen';s.reserve=0;$('reserve').value=0;log('Suministro agotado','Sin combustible no puede mantenerse la combustión.')}renderUI()}
const scene=new T.Scene();scene.background=new T.Color('#111b21');const camera=new T.PerspectiveCamera(36,1,.1,100);const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;$('stage').append(renderer.domElement);
scene.add(new T.HemisphereLight(0xf6faff,0x6e777d,2.0));const light=new T.DirectionalLight(0xfff7ed,2.4);light.position.set(-6,29,18);light.target.position.set(9,3,-1);scene.add(light.target);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-32,right:32,top:32,bottom:-32});scene.add(light);const rim=new T.DirectionalLight(0xdde9ff,1.2);rim.position.set(6,3,-5);scene.add(rim);const floor=new T.Mesh(new T.PlaneGeometry(60,60),new T.MeshStandardMaterial({color:'#888e8b',roughness:.92}));floor.rotation.x=-Math.PI/2;floor.position.y=-.08;floor.receiveShadow=true;scene.add(floor);
const materials={};function mat(c,metal=.0){const key=c+metal;if(!materials[key])materials[key]=new T.MeshStandardMaterial({color:c,metalness:metal,roughness:metal?.48:.78});return materials[key]}const steel=mat('#97a6ad',.8),dark=mat('#242a30'),copper=mat('#b8773f',.7),green=mat('#376879',.28),red=mat('#9d3e35'),black=mat('#171d21');
scene.fog=new T.Fog('#111b21',42,205);scene.background.set('#111b21');camera.far=220;camera.updateProjectionMatrix();
const rWall=mat('#a9a495',.03),rSkirt=mat('#54534a',.06),rYellow=mat('#e0ac1c',.12),rPanel=mat('#2c3736',.4),rPipe=mat('#8a9aa0',.6);
let utilityLampMat,loadPanelLampMat,atsGridLampMat=null,atsGenLampMat=null;
function pilotLamp(){return new T.MeshStandardMaterial({color:'#611a1a',emissive:'#2a0b0b',emissiveIntensity:.5})}

let root=new T.Group(),groups={},pieces=[],pistons=[],shaft,rotor,fan,paths=[],particles=[];scene.add(root);
function mesh(parent,geo,m,pos=[0,0,0]){const o=new T.Mesh(geo,m);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function box(g,size,pos,m){
 const [w,h,d]=size;let geo;
 if(Math.min(w,h,d)>.20&&Math.max(w,h,d)<3.5&&m?.metalness>.05){
 const b=Math.min(.018,Math.min(w,h,d)*.035),sh=new T.Shape();sh.moveTo(-w/2+b,-h/2+b);sh.lineTo(w/2-b,-h/2+b);sh.lineTo(w/2-b,h/2-b);sh.lineTo(-w/2+b,h/2-b);sh.closePath();geo=new T.ExtrudeGeometry(sh,{depth:d-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,steps:1});geo.translate(0,0,-d/2+b);
 }else geo=new T.BoxGeometry(...size);return mesh(g,geo,m,pos)}function cyl(g,r,h,pos,m,axis='y'){const o=mesh(g,new T.CylinderGeometry(r,r,h,36),m,pos);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o}function tube(g,points,r,m){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return mesh(g,new T.TubeGeometry(curve,40,r,8,false),m)}
function piece(key,name,explain,offset,create){const p=new T.Group();p.userData={key,name,explain,offset};groups[key].add(p);create(p);p.traverse(o=>{if(o.isMesh){o.userData.part=key;o.userData.piece=name;o.userData.original=o.material}});pieces.push(p);return p}
function route(points,color,kind){if(['electric','grid','loadfeed','cool','fuel','exhaust'].includes(kind))return;const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const line=mesh(root,new T.TubeGeometry(curve,50,.019,6,false),mat(color));paths.push({curve,line,kind});for(let i=0;i<9;i++){const dot=mesh(root,new T.SphereGeometry(.046,8,8),new T.MeshBasicMaterial({color}));particles.push({dot,curve,kind,offset:i/9})}}
// D24: cabinets built from folded panels, separate doors and service hardware.
function cabinetSkin20(g,w,h,d,p,m,r=.025){const sh=new T.Shape(),x=-w/2,y=-h/2;r=Math.min(r,w*.15,h*.15);sh.moveTo(x+r,y);sh.lineTo(x+w-r,y);sh.quadraticCurveTo(x+w,y,x+w,y+r);sh.lineTo(x+w,y+h-r);sh.quadraticCurveTo(x+w,y+h,x+w-r,y+h);sh.lineTo(x+r,y+h);sh.quadraticCurveTo(x,y+h,x,y+h-r);sh.lineTo(x,y+r);sh.quadraticCurveTo(x,y,x+r,y);const geo=new T.ExtrudeGeometry(sh,{depth:Math.max(.002,d-.004),bevelEnabled:true,bevelThickness:.002,bevelSize:.002,bevelSegments:2,curveSegments:8});return mesh(g,geo,m,[p[0],p[1],p[2]-d/2+.002]);}
function cabinetLabel20(g,text,pos,w,h,color='#c7d7d8',background='#20333b'){const c=document.createElement('canvas');c.width=512;c.height=128;const cx=c.getContext('2d');cx.fillStyle=background;cx.fillRect(0,0,512,128);cx.strokeStyle='#799094';cx.lineWidth=3;cx.strokeRect(4,4,504,120);cx.fillStyle=color;cx.font='500 35px Arial';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(text,256,65);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return mesh(g,new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t}),pos);}
function cabinetFastener20(g,p){const metal=mat('#aeb8b9',.85);const b=mesh(g,new T.CylinderGeometry(.010,.010,.008,6),metal,p);b.rotation.x=Math.PI/2;box(g,[.012,.002,.003],[p[0],p[1],p[2]+.006],mat('#3c4447',.6));}
function buildTransferCabinet20(g,live=false){const coat=mat('#819095',.32),door=mat('#a6b0ae',.25),seal=mat('#20292c'),metal=mat('#b9c1be',.8);const x=3.65,y=.9;
 for(const side of [-1,1]){box(g,[.018,1.30,.55],[x+side*.416,y,0],coat);box(g,[.85,.018,.55],[x,y+side*.641,0],coat);}box(g,[.82,1.26,.018],[x,y,-.266],coat);
 box(g,[.82,1.255,.018],[x,y,.269],seal);cabinetSkin20(g,.797,1.232,.024,[x,y,.289],door,.026);box(g,[.80,.12,.51],[x,.225,0],mat('#48575b',.55));for(const z of [-.19,.19])for(const xx of [x-.30,x+.30]){box(g,[.09,.035,.11],[xx,.148,z],metal);cyl(g,.015,.022,[xx,.179,z],metal);}
 for(const yy of [.48,1.30]){cabinetSkin20(g,.035,.108,.022,[x-.384,yy,.306],metal,.009);cyl(g,.013,.13,[x-.390,yy,.301],metal,'y');}
 cabinetSkin20(g,.037,.15,.035,[x+.315,.82,.327],seal,.014);cyl(g,.016,.017,[x+.315,.87,.35],metal,'z');
 cabinetLabel20(g,'CONTROL DE TRANSFERENCIA',[x,1.424,.308],.60,.065);cabinetLabel20(g,'QN / RED',[x-.19,1.27,.31],.27,.045);cabinetLabel20(g,'QG / PLANTA',[x+.19,1.27,.31],.27,.045);
 for(const [j,xx]of [x-.19,x+.19].entries()){cabinetSkin20(g,.22,.31,.025,[xx,1.055,.324],seal,.025);cyl(g,.068,.022,[xx,1.065,.353],seal,'z');cabinetSkin20(g,.026,.091,.025,[xx,1.065,.375],mat('#b65847',.13),.008);const pilot=pilotLamp();cyl(g,.019,.016,[xx,1.187,.355],pilot,'z');if(live){if(j===0)atsGridLampMat=pilot;else atsGenLampMat=pilot;}}
 cabinetLabel20(g,'AUTO  /  0  /  MAN',[x,.73,.316],.44,.052);cyl(g,.031,.02,[x,.63,.33],seal,'z');box(g,[.012,.062,.025],[x,.65,.354],metal);
 for(let j=0;j<9;j++)cabinetSkin20(g,.42,.008,.009,[x,.39+j*.019,.310],seal,.003);
 for(const xx of [x-.35,x+.35])for(const yy of [.33,1.47])cabinetFastener20(g,[xx,yy,.311]);
 for(let j=0;j<3;j++){cyl(g,.027,.039,[x-.18+j*.18,.229,.08],seal,'y');cyl(g,.017,.024,[x-.18+j*.18,.202,.08],mat('#5e6c6b',.5),'y');}
}
function buildControlCabinet20(g){const coat=mat('#c5c9bc',.18),metal=mat('#aeb9b8',.8),seal=mat('#273238');const x=2.47,y=1.02,z=.91;
 for(const side of [-1,1]){box(g,[.017,1.13,.35],[x+side*.301,y,z],coat);box(g,[.62,.017,.35],[x,y+side*.556,z],coat);}box(g,[.59,1.10,.017],[x,y,z-.166],coat);box(g,[.598,1.105,.016],[x,y,1.085],seal);cabinetSkin20(g,.579,1.083,.023,[x,y,1.106],coat,.036);
 for(const yy of [.64,1.40]){cabinetSkin20(g,.028,.075,.020,[2.187,yy,1.121],metal,.007);cyl(g,.011,.09,[2.186,yy,1.118],metal,'y');}
 cabinetSkin20(g,.345,.248,.025,[2.43,1.30,1.135],seal,.03);cabinetLabel20(g,'G-01  |  CONTROL',[2.43,1.332,1.154],.282,.055,'#9bd5bc','#112927');cabinetLabel20(g,'AUTO  -  SUPERVISION',[2.43,1.261,1.154],.282,.045,'#9bd5bc','#112927');const glass=new T.MeshPhysicalMaterial({color:'#a2b9b7',metalness:.05,roughness:.12,clearcoat:1,transparent:true,opacity:.14,depthWrite:false});glass.userData.glass20=true;mesh(g,new T.PlaneGeometry(.303,.211),glass,[2.43,1.30,1.157]);
 cyl(g,.070,.021,[2.62,1.02,1.137],mat('#c5a844',.14),'z');cyl(g,.048,.042,[2.62,1.02,1.165],mat('#a84438',.14),'z');cyl(g,.052,.010,[2.62,1.02,1.188],mat('#b95144',.12),'z');
 for(const xx of [2.29,2.43]){cyl(g,.027,.015,[xx,1.06,1.139],metal,'z');cyl(g,.020,.025,[xx,1.06,1.156],seal,'z');}
 cabinetLabel20(g,'MANDO',[2.36,.98,1.125],.22,.035);cabinetLabel20(g,'PARO',[2.62,.914,1.125],.14,.032,'#d5c8b0');
 for(let j=0;j<7;j++)cabinetSkin20(g,.28,.008,.009,[x,.61+j*.022,1.124],seal,.003);
 for(const xx of [2.22,2.72])for(const yy of [.52,1.52])cabinetFastener20(g,[xx,yy,1.126]);
 for(const xx of [2.30,2.62]){box(g,[.06,.04,.20],[xx,.433,.91],metal);cyl(g,.018,.028,[xx,.473,.91],metal);}
}

function build(){root.traverse(o=>{if(o.isMesh)o.geometry.dispose()});scene.remove(root);root=new T.Group();scene.add(root);groups={};pieces=[];pistons=[];paths=[];particles=[];for(const key in PARTS){groups[key]=new T.Group();root.add(groups[key])}
piece('enclosure','Bancada y soportes','La bancada soporta el conjunto; los apoyos reducen la transmisión de vibraciones.',[0,-.35,0],g=>{box(g,[6,.2,2.6],[0,.2,0],dark);for(const x of [-2.5,2.5])for(const z of [-.9,.9])cyl(g,.14,.25,[x,.1,z],black)});
piece('enclosure','Cubierta sin marcas','Chapa exterior con paneles y ventilación. Se transparenta mediante X-ray.',[0,1.6,0],g=>{for(const z of [-1.32,1.32])box(g,[6.1,2.65,.04],[0,1.62,z],mat('#52666a',.65));box(g,[6.1,.06,2.68],[0,2.95,0],mat('#52666a',.65));for(let i=0;i<14;i++)box(g,[.025,.7,.05],[-2.65+i*.065,1.7,1.35],black);g.userData.shell=true});
piece('engine','Bloque y cárter','Aloja cilindros y conductos. El aceite lubrica las superficies móviles.',[-.3,0,-.6],g=>{box(g,[2.25,.8,1.15],[-.6,.98,0],green);box(g,[2.35,.35,1.25],[-.6,.55,0],dark);box(g,[2.25,.66,1.15],[-.6,1.65,0],green);for(let i=0;i<4;i++){box(g,[.035,.60,.025],[-1.45+i*.52,1.64,.59],dark);box(g,[.035,.60,.025],[-1.45+i*.52,1.64,-.59],dark)}g.userData.shell=true});
piece('engine','Pistones y bielas','Los pistones alternan su movimiento; las bielas lo transmiten al cigüeñal.',[0,.65,.3],g=>{for(let i=0;i<4;i++){const a=new T.Group();a.position.set(-1.4+i*.52,1.5,0);g.add(a);cyl(a,.235,.28,[0,0,0],steel);for(const y of [-.06,0,.06]){const ring=mesh(a,new T.TorusGeometry(.236,.009,6,30),dark,[0,y,0]);ring.rotation.x=Math.PI/2}box(a,[.08,.6,.09],[0,-.38,0],steel);pistons.push(a)}});
piece('engine','Cigüeñal y volante','El eje gira y entrega par al alternador. Su velocidad real es mayor que la animación.',[0,.1,.6],g=>{shaft=new T.Group();shaft.position.set(-.6,1.05,0);g.add(shaft);cyl(shaft,.10,2.8,[0,0,0],steel,'x');for(let i=0;i<4;i++)cyl(shaft,.21,.10,[-.8+i*.52,.07,0],steel,'x');cyl(shaft,.52,.17,[1.3,0,0],dark,'x')});
piece('engine',activeFuel()==='diesel'?'Inyectores y culata':'Bujías y culata',activeFuel()==='diesel'?'La inyección introduce combustible a presión; el modelo no calcula presión ni pulverización.':'Las bujías producen la chispa de encendido. No se representan como inyectores diésel.',[0,1,0],g=>{box(g,[2.3,.16,1.2],[-.6,1.99,0],green);for(let i=0;i<4;i++){cyl(g,.045,.24,[-1.4+i*.52,2.15,0],activeFuel()==='diesel'?steel:mat('#e7dfcc'));tube(g,[[-1.4+i*.52,2.28,0],[-1.4+i*.52,2.35,.25],[.7,2.15,.55]],.018,activeFuel()==='diesel'?steel:black)}});
piece('alternator','Estator y carcasa','Las bobinas fijas del estator producen la salida AC.',[.5,.3,-.5],g=>{cyl(g,.66,1.55,[1.45,1.05,0],steel,'x');for(let i=0;i<16;i++){let a=i/16*Math.PI*2;box(g,[1.7,.045,.08],[1.45,1.05+Math.sin(a)*.67,Math.cos(a)*.67],dark).rotation.x=-a}g.userData.shell=true});
piece('alternator','Rotor y bobinado','El rotor de cuatro polos da 60 Hz a 1800 rpm o 50 Hz a 1500 rpm.',[.5,.6,.4],g=>{rotor=new T.Group();rotor.position.set(1.45,1.05,0);g.add(rotor);cyl(rotor,.27,1.4,[0,0,0],steel,'x');for(let i=0;i<4;i++){const a=i*Math.PI/2;for(let j=0;j<12;j++){let tor=mesh(rotor,new T.TorusGeometry(.16,.017,6,24),copper,[-.55+j*.10,Math.sin(a)*.28,Math.cos(a)*.28]);tor.rotation.y=Math.PI/2}}});
piece('fuel',activeFuel()==='ng'?'Regulador y acometida':activeFuel()==='lpg'?'Depósito de gas LP':'Tanque y filtro',PARTS.fuel[1],[0,.2,1.1],g=>{if(activeFuel()==='ng'){tube(g,[[-3.7,.4,.75],[-2,.4,.75],[-2,1.8,.75]],.07,mat('#dab658'));cyl(g,.22,.17,[-2,1,.75],steel)}else if(activeFuel()==='lpg'){cyl(g,.35,1.15,[-2.3,1,.75],mat('#ccd1cf'));cyl(g,.10,.22,[-2.3,1.7,.75],gold())}else{box(g,[1.35,.36,1.65],[-1,.48,0],mat('#444c4c'));cyl(g,.10,.08,[-1,.70,.5],steel)}cyl(g,.10,.32,[-1.8,1,.5],mat('#cec5a8'));tube(g,[[-2,.8,.75],[-1.8,1.2,.6],[-.7,2,.4]],.025,black)});
piece('cooling','Radiador y mangueras','El refrigerante transporta calor del bloque hacia el radiador.',[-.8,.2,0],g=>{box(g,[.16,1.6,1.5],[-2.2,1.3,0],dark);for(let i=0;i<27;i++)box(g,[.19,.022,1.3],[-2.2,.60+i*.05,0],steel);tube(g,[[-2.2,2,.4],[-1.7,2.05,.5],[-1.5,1.65,.5]],.07,black);tube(g,[[-2.2,.65,-.4],[-1.6,.65,-.5],[-1.5,.9,-.5]],.07,black)});
piece('cooling','Ventilador','Mueve aire a través del radiador mientras el motor está en marcha.',[-1,.3,.2],g=>{fan=new T.Group();fan.position.set(-2.03,1.3,0);g.add(fan);cyl(fan,.13,.1,[0,0,0],dark,'x');for(let i=0;i<7;i++){const a=new T.Group();a.rotation.x=i*2*Math.PI/7;fan.add(a);const b=box(a,[.04,.52,.15],[0,.32,0],black);b.rotation.y=.3}});
piece('exhaust','Colector y silenciador','Los gases calientes salen por el colector, atraviesan el silenciador y se descargan al exterior.',[0,.9,-.7],g=>{for(let i=0;i<4;i++)tube(g,[[-1.4+i*.52,1.9,-.5],[-1.4+i*.52,2.3,-.8],[.0,2.4,-.8]],.07,steel);cyl(g,.19,1.4,[.65,2.4,-.8],dark,'x');tube(g,[[1.35,2.4,-.8],[1.65,2.4,-.8],[1.65,3.2,-.8]],.08,steel)});
piece('battery','Batería de arranque','Entrega corriente al arrancador. Es distinta del sistema de energía de un UPS.',[0,0,1],g=>{box(g,[.65,.48,.43],[.25,.6,.85],black);for(const x of [0,.5])cyl(g,.04,.08,[x,.88,.85],x===0?red:steel);tube(g,[[0,.9,.85],[-.1,1,.9],[-.2,.9,.5]],.025,red)});
piece('battery','Motor de arranque','Engrana temporalmente para iniciar el giro del motor térmico.',[0,.2,.6],g=>{cyl(g,.13,.45,[.1,.85,.56],steel,'x');cyl(g,.07,.28,[.1,1.03,.56],dark,'x')});

piece('ats','Mando de transferencia','Mando remoto de los interruptores QN y QG ubicados en el exterior; no conduce potencia de media tensión dentro del sótano.',[.5,.5,1.3],g=>{buildTransferCabinet20(g,true)});
detailPlant();detailPlantV18();detailPlantTechnical();detailGeneratorReference();detailPlantUnidadVII();route([[1.5,1.1,.8],[2.5,.7,.8],[3.6,.7,.4],[4.4,.7,.4]],'#51e2a4','electric');route([[-2,.7,.8],[-1.7,1.2,.7],[-.6,2.2,.4]],'#f2bd58','fuel');route([[-1.2,1.4,-.6],[-2.2,2,-.4],[-2.2,.7,-.4],[-1.2,.8,-.6]],'#50bfff','cool');route([[0,2.4,-.8],[1.6,2.4,-.8],[1.65,3.5,-.8]],'#f59077','exhaust');route([[10,.14,-14],[7,.3,-9],[4.6,.7,-2],[3.43,1,.34]],'#51e2a4','grid');route([[3.65,.77,.42],[0,.5,2],[-6,.6,-4],[-10,1,-14],[-10,2.1,-24.6]],'#51e2a4','loadfeed');updateView()}
function detailPlant(){
const paint=mat('#376879',.28),cast=mat('#293235',.42),beige=mat('#c8bca0',.18),silv=mat('#adb5b6',.72);
function bolt(g,pos,r=.034){const b=mesh(g,new T.CylinderGeometry(r,r,.025,6),silv,pos);b.rotation.x=Math.PI/2;return b}
function ring(g,r,t,pos,material,axis='x'){const m=mesh(g,new T.TorusGeometry(r,t,10,48),material,pos);if(axis==='x')m.rotation.y=Math.PI/2;if(axis==='y')m.rotation.x=Math.PI/2;return m}
function roundBox(g,w,h,d,pos,m,r=.04){const sh=new T.Shape(),x=-w/2,y=-h/2;r=Math.min(r,w*.2,h*.2);sh.moveTo(x+r,y);sh.lineTo(x+w-r,y);sh.quadraticCurveTo(x+w,y,x+w,y+r);sh.lineTo(x+w,y+h-r);sh.quadraticCurveTo(x+w,y+h,x+w-r,y+h);sh.lineTo(x+r,y+h);sh.quadraticCurveTo(x,y+h,x,y+h-r);sh.lineTo(x,y+r);sh.quadraticCurveTo(x,y,x+r,y);const o=mesh(g,new T.ExtrudeGeometry(sh,{depth:d,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2,curveSegments:5}),m,pos);o.position.z-=d/2;return o}
// Bancada de perfiles, travesaños y soportes antivibratorios.
piece('enclosure','Perfiles, travesaños y apoyos','Bancada representativa con largueros, travesaños y apoyos elásticos; la forma se inspira en las plantas abiertas de las referencias.',[0,-.15,0],g=>{for(const z of [-1.12,1.12]){box(g,[6.2,.34,.12],[0,.23,z],dark);for(const y of [.07,.4])box(g,[6.2,.06,.30],[0,y,z],dark)}for(const x of [-2.5,-1,.6,2.5])box(g,[.15,.25,2.3],[x,.24,0],dark);for(const x of [-1.6,.3,.9,2.0])for(const z of [-.5,.5]){cyl(g,.105,.12,[x,.5,z],black);box(g,[.30,.05,.28],[x,.57,z],silv);cyl(g,.027,.1,[x,.62,z],silv)}for(const x of [-2.7,2.7])for(const z of [-1.1,1.1]){box(g,[.32,.04,.4],[x,.035,z],dark);cyl(g,.045,.01,[x,.06,z],black)}});
piece('engine','Tapas de válvulas y fundición','Tapas superiores, juntas y nervaduras exteriores. Se representan como detalles mecánicos, no como piezas de un fabricante específico.',[-.2,.7,0],g=>{for(let j=0;j<2;j++){roundBox(g,1.05,.26,1.02,[-1.17+j*1.12,2.12,0],paint,.09);for(const x of [-1.57+j*1.12,-.77+j*1.12])for(const z of [-.39,.39]){cyl(g,.026,.023,[x,2.27,z],silv, 'y')}for(let k=0;k<5;k++)box(g,[.84,.018,.013],[-1.17+j*1.12,2.265,-.24+k*.12],cast)}cyl(g,.075,.05,[-1.4,2.29,.1],black);for(let j=0;j<8;j++){box(g,[.05,.48,.04],[-1.55+j*.25,1.12,.595],paint);bolt(g,[-1.55+j*.25,1.44,.64])}for(let j=0;j<4;j++)roundBox(g,.35,.30,.05,[-1.4+j*.52,1.08,.64],paint,.03);g.userData.shell=true});
piece('engine','Admisión y filtro de aire','La admisión lleva aire filtrado al motor. El elemento filtrante y las abrazaderas son representaciones constructivas.',[0,.75,.6],g=>{cyl(g,.20,.70,[-.25,2.53,.60],black,'x');for(const x of [-.6,.1])ring(g,.205,.016,[x,2.53,.60],silv);for(let j=0;j<10;j++)ring(g,.197,.008,[-.54+j*.06,2.53,.60],cast);tube(g,[[.12,2.53,.60],[.37,2.45,.55],[.45,2.12,.48],[-.2,1.91,.54]],.09,black);for(const pos of [[.38,2.35,.54],[.45,2.15,.49]])ring(g,.094,.012,pos,silv,'y');tube(g,[[-1.65,1.79,.60],[-1.2,1.8,.70],[-.25,1.8,.70],[.2,1.95,.55]],.095,paint)});
piece('engine','Filtros de aceite y conductos','Los filtros retienen impurezas. Las tuberías y abrazaderas permiten reconocer la distribución de auxiliares del motor.',[-.1,.15,.8],g=>{box(g,[.8,.13,.18],[-.9,1.3,.72],cast);for(const x of [-1.15,-.72]){cyl(g,.115,.42,[x,1.04,.8],mat('#dddcd1'));ring(g,.117,.012,[x,1.25,.8],silv,'y');cyl(g,.12,.045,[x,1.28,.8],cast);for(let j=0;j<5;j++)box(g,[.09,.006,.003],[x,1.12-j*.032,.918],mat('#878e86'))}tube(g,[[-1.15,1.28,.8],[-1.5,1.38,.74],[-1.68,.86,.56]],.024,steel);tube(g,[[-.72,1.28,.8],[-.38,1.37,.73],[-.1,.94,.6]],.021,steel);for(let j=0;j<4;j++)tube(g,[[-1.45+j*.52,1.85,.42],[-1.42+j*.52,1.68,.71],[-1.36+j*.52,1.47,.72]],.012,activeFuel()==='diesel'?silv:black)});
piece('cooling','Marco, depósitos y rejilla del radiador','El bastidor sostiene el núcleo de aletas. Las rejillas permiten paso de aire y protegen el ventilador.',[-.55,0,0],g=>{for(const z of [-.82,.82])box(g,[.24,1.9,.12],[-2.25,1.3,z],black);for(const y of [.36,2.24])box(g,[.26,.14,1.76],[-2.25,y,0],black);roundBox(g,.27,.17,1.50,[-2.25,2.10,0],cast);cyl(g,.06,.05,[-2.25,2.22,.35],silv);for(let j=0;j<33;j++)box(g,[.02,.016,1.45],[-2.40,.51+j*.045,0],steel);for(let j=0;j<17;j++)box(g,[.015,1.5,.007],[-2.42,1.25,-.70+j*.087],black);for(const z of [-.73,.73])for(const y of [.45,2.15]){const b=bolt(g,[-2.42,y,z]);b.rotation.z=Math.PI/2}tube(g,[[-2.15,.5,-.65],[-1.80,.35,-.6],[-1.68,.6,-.4]],.024,black)});
piece('alternator','Bridas, apoyos y caja de bornes','La carcasa del alternador se apoya en la bancada. La caja superior concentra las conexiones de salida.',[.45,.15,0],g=>{coherentAlternatorMount(g);g.userData.shell=true});
piece('control','Gabinete y botonera','Gabinete de mando sin marca, con pantalla, pulsadores y parada de emergencia visible.',[.4,.15,1.0],g=>{buildControlCabinet20(g)});

piece('engine','Campana de acoplamiento y tapas laterales','Alinea el eje del motor con el alternador y protege el acoplamiento. Las tapas permiten servicio sin dejar expuesto el mecanismo.',[0,.1,.2],g=>{
 cyl(g,.58,.32,[.65,1.05,0],cast,'x');for(let j=0;j<12;j++){const a=j*Math.PI/6;cyl(g,.028,.04,[.83,1.05+Math.sin(a)*.50,Math.cos(a)*.50],silv,'x');}
 for(const z of [-.62,.62]){roundBox(g,2.18,.67,.06,[-.62,1.45,z],paint,.04);for(let j=0;j<9;j++)cyl(g,.022,.025,[-1.57+j*.24,1.72,z+Math.sign(z)*.05],silv,'z');}
 const tab=roundBox(g,.46,.16,.016,[-.92,1.38,.668],silv,.012);for(let j=0;j<3;j++)box(g,[.34,.008,.005],[-.92,1.42-j*.034,.68],dark);g.userData.shell=true;
});
piece('cooling','Protección del ventilador y transición de descarga','Rejilla y marco del ventilador. La boca del radiador se conecta con el conducto de extracción del cuarto.',[-.5,0,0],g=>{
 for(let j=0;j<16;j++)box(g,[.025,1.45,.016],[-1.88,1.28,-.7+j*.094],black);
 for(const y of [.56,2])box(g,[.075,.06,1.52],[-1.88,y,0],cast);
 for(const z of [-.76,.76])box(g,[.08,1.5,.055],[-1.88,1.28,z],cast);
});
piece('control','Soporte y mazo del controlador','Gabinete apoyado en bancada; mazo protegido hacia la caja de bornes y señales del motor.',[.3,.1,.8],g=>{
 for(const z of [.76,1.02])box(g,[.075,.28,.07],[2.47,.34,z],cast);
 tube(g,[[2.47,.60,.73],[2.33,.58,.69],[2.08,.72,.68],[2.0,1.9,.43]],.055,black);
 for(const y of [.82,1.2,1.6]){box(g,[.19,.045,.06],[2.04,y,.65],silv);}
 tube(g,[[2.35,.6,.82],[1.8,.43,.82],[-.2,.43,.82],[-.2,1.2,.69]],.037,black);
});
piece('battery','Retorno de arranque y terminales protegidos','Dos conductores enlazan batería y arrancador. Terminales con cubiertas aislantes y sujeción sobre bancada.',[0,0,.7],g=>{
 tube(g,[[.50,.9,.85],[.6,.95,.9],[.65,.55,.91],[.05,.55,.66],[.05,.85,.56]],.024,black);
 for(const x of [0,.5])box(g,[.12,.07,.11],[x,.91,.85],x===0?red:black);
});
// Replaces the earlier sheet box with service doors and hardware, all unbranded.
const old=pieces.find(p=>p.userData.name==='Cubierta sin marcas');if(old){old.traverse(o=>{if(o.isMesh)o.geometry.dispose()});old.clear();old.parent.remove(old);pieces.splice(pieces.indexOf(old),1);}
piece('enclosure','Gabinete acústico con puertas','Paneles de acceso, juntas, bisagras y cerraduras sin logotipos. La presentación abierta retira este gabinete.',[0,1.4,0],g=>{for(const z of [-1.34,1.34]){for(let i=0;i<3;i++){const x=-2.0+i*2.0;roundBox(g,1.96,2.60,.04,[x,1.62,z],beige,.025);for(const y of [.62,2.54]){roundBox(g,.20,.10,.045,[x-.90,y,z+Math.sign(z)*.04],dark,.03);bolt(g,[x-.94,y,z+Math.sign(z)*.068],.018)}roundBox(g,.19,.30,.035,[x+.62,1.58,z+Math.sign(z)*.045],black,.025);box(g,[.032,.17,.07],[x+.64,1.6,z+Math.sign(z)*.085],cast);for(const y of [.37,2.89])bolt(g,[x,y,z+Math.sign(z)*.035],.020)}}box(g,[6.10,.065,2.76],[0,2.98,0],beige);for(const x of [-3.02,3.02]){box(g,[.05,2.65,2.72],[x,1.63,0],beige);for(let j=0;j<19;j++)box(g,[.015,.038,1.95],[x+Math.sign(x)*.033,.78+j*.08,0],black)}for(const x of [-2.2,2.2]){const r=ring(g,.10,.020,[x,3.03,0],silv,'z');}g.userData.shell=true;g.userData.canopy=true});
}

function gold(){return mat('#ba914f',.7)}
function selectPart(key){selection=key;subSelection='';$('part').value=key;$('partTitle').textContent=PARTS[key][0];$('partText').textContent=PARTS[key][1]+(key==='engine'?' '+TYPES[cfg.fuel][1]:'');$('subText').textContent='Selecciona una subpieza para conocer su función.';$('subparts').replaceChildren();pieces.filter(p=>p.userData.key===key).forEach(p=>{const b=document.createElement('button');b.textContent=p.userData.name;b.onclick=()=>{subSelection=p.userData.name;$('subText').textContent=p.userData.explain;for(const c of $('subparts').children)c.classList.toggle('active',c===b);updateView()};$('subparts').append(b)});updateView();openInspector(key)}
function updateView(){if(!s)return;const x=+$('xray').value/100,e=+$('explode').value/100;$('xval').textContent=Math.round(x*100)+'%';for(const p of pieces){p.visible=(!isolated||p.userData.key===selection)&&(!p.userData.canopy||$('housing').value==='canopy');p.position.set(...p.userData.offset.map(v=>v*e));p.traverse(o=>{if(!o.isMesh)return;if(!o.userData.local){o.userData.local=o.material.clone();o.material=o.userData.local}o.material.transparent=!!(o.material.userData.glass20||p.userData.shell&&x>0);o.material.opacity=o.material.userData.glass20?.14:p.userData.shell?Math.max(.035,1-x):1;o.material.depthWrite=!o.material.transparent;o.material.emissive?.set(p.userData.name===subSelection?'#3e2a08':'#000000')})}for(const p of paths)p.line.visible=$('flows').checked&&!isolated&&e<.1;}
const ray=new T.Raycaster(),mouse=new T.Vector2();let drag=null;
renderer.domElement.onpointerdown=e=>{campusNav.tour=false;$('tourRoute').textContent='Continuar recorrido';camera.updateMatrixWorld();drag={x:e.clientX,y:e.clientY,a:angle,b:elevation,moved:false,pan:e.shiftKey||e.button===2?panOffset.clone():null,right:new T.Vector3().setFromMatrixColumn(camera.matrixWorld,0).normalize(),up:new T.Vector3().setFromMatrixColumn(camera.matrixWorld,1).normalize()};renderer.domElement.setPointerCapture(e.pointerId);$('stage').classList.add('dragging')};renderer.domElement.onpointermove=e=>{if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved=drag.moved||Math.hypot(dx,dy)>5;if(drag.pan){const k=distance*.0016;panOffset.copy(drag.pan).addScaledVector(drag.right,-dx*k).addScaledVector(drag.up,dy*k)}else{angle=drag.a-dx*.0055;elevation=Math.max(-.35,Math.min(1.55,drag.b+dy*.0055))}return}const hit=pick(e);$('tip').textContent=hit&&!document.body.classList.contains('eduoff')?PARTS[hit.userData.part][0]+' · '+hit.userData.piece:''};renderer.domElement.onpointerleave=()=>{$('tip').textContent='';$('stage').classList.remove('dragging')};renderer.domElement.onpointerup=e=>{if(drag&&!drag.moved){const hit=pick(e);if(hit){selectPart(hit.userData.part);subSelection=hit.userData.piece;const p=pieces.find(p=>p.userData.name===subSelection);$('subText').textContent=p?.userData.explain||'';updateView()}}drag=null;$('stage').classList.remove('dragging')};renderer.domElement.onpointercancel=()=>{drag=null;$('stage').classList.remove('dragging')};renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();distance=Math.max(1.2,Math.min(120,distance+e.deltaY*.022))},{passive:false});function visibleTree(o){while(o){if(!o.visible)return false;o=o.parent}return true}function pick(e){const r=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,camera);return ray.intersectObjects(pieces,true).find(h=>visibleTree(h.object)&&h.object.material.opacity>.3)?.object}
function renderUI(){const running=s.rpm>0,genReady=['ready','cool'].includes(s.stage),v=genReady?s.genV:0,power=s.source==='none'?0:cfg.rating*s.load/100,current=power*1000/((cfg.phase===3?Math.sqrt(3)*480:277)*cfg.pf);$('source').textContent={grid:'Red',gen:'Planta',none:'Sin energía'}[s.source];$('rpm').textContent=Math.round(s.rpm)+' rpm';$('volts').textContent=v+' V';$('hz').textContent=(running?(s.rpm/30).toFixed(1):'0')+' Hz';$('kw').textContent=power.toFixed(1)+' kW';$('loadLabel').textContent=s.load+'%';$('reserveLabel').textContent=s.reserve.toFixed(1)+'%';$('grid').textContent=s.grid?'Cortar red':'Restaurar red';$('configLabel').textContent=`${TYPES[cfg.fuel][0]}${cfg.fuel==='bi'?' / '+TYPES[cfg.bi][0]:''} · ${cfg.rating} kW · ${cfg.phase}Φ · ${cfg.freq} Hz`;
const titles={off:'En espera',crankpause:'Pausa entre intentos',starting:'Arranque eléctrico',warm:'Estabilizando velocidad',ready:'Generación disponible',cool:'Enfriamiento sin carga',fault:'Grupo detenido por protección'};$('stateTitle').textContent=titles[s.stage];$('badge').textContent=titles[s.stage]+' · '+(paused?'PAUSA':'SIMULACIÓN');$('narration').textContent=s.fault?s.fault:({off:s.grid?'La red sostiene la carga; la planta espera una falla.':'La red está ausente. '+(cfg.mode==='auto'?'Tras detectar la falla se ordenará el arranque.':'Pulsa Arrancar, espera la estabilización y selecciona A planta.'),crankpause:'El controlador espera antes del siguiente intento de arranque.',starting:'La batería impulsa el motor de arranque. La carga todavía puede permanecer sin energía.',warm:'El motor aumenta sus revoluciones. Se espera a que la generación sea estable antes de conectar.',ready:s.source==='gen'?'El combustible se transforma en movimiento y el alternador alimenta la carga.':'El grupo está disponible, pero todavía no alimenta la carga.',cool:'El motor sigue girando sin carga para completar el enfriamiento didáctico.'}[s.stage]);$('controlNote').textContent=cfg.mode==='auto'?'Automático: el controlador decide arranque y transferencia. Para operar los contactos usa el modo manual.':'Manual: tú ordenas el arranque y la transferencia; se conservan los bloqueos de seguridad lógica.';$('toGen').disabled=$('toGrid').disabled=cfg.mode==='auto';$('electrical').textContent=`Carga: ${power.toFixed(1)} kW / ${(power/cfg.pf).toFixed(1)} kVA · FP ${cfg.pf.toFixed(2)} · I ${current.toFixed(1)} A · ${cfg.phase===3?'480 V entre líneas, tres fases equilibradas':'277 V monofásicos'} · alternador 4 polos. ${s.target?'Transferencia: ambos contactos abiertos.':''}`;
for(const [id,on] of [['nGrid',s.grid&&s.source==='grid'],['nGen',s.source==='gen'],['nATS',s.source!=='none'],['nLoad',s.source!=='none']])$(id).classList.toggle('active',on);
function setLamp(m,on,onColor){if(!m)return;m.color.set(on?onColor:'#611a1a');m.emissive.set(on?onColor:'#2a0b0b');m.emissiveIntensity=on?2.2:.5}
setLamp(utilityLampMat,s.grid,'#3fd67a');
setLamp(loadPanelLampMat,s.source!=='none','#3fd67a');
setLamp(atsGridLampMat,s.source==='grid','#3fd67a');
setLamp(atsGenLampMat,s.source==='gen','#e8b23a');
drawScope();if(substation)updateStation();renderUnidad()}
function drawScope(){const c=$('scope'),ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.strokeStyle='#345153';ctx.beginPath();ctx.moveTo(0,h/2);ctx.lineTo(w,h/2);ctx.stroke();const colors=['#6fe2ad','#efc578','#6cbef7'];for(let i=0;i<(cfg.phase===3?3:1);i++){ctx.strokeStyle=colors[i];ctx.lineWidth=2;ctx.beginPath();for(let x=0;x<w;x++){const y=h/2-(s.source==='none'?0:48*Math.sin(x/w*Math.PI*4-s.t*3+i*Math.PI*2/3));if(!x)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke()}}
for(const key in PARTS){const o=document.createElement('option');o.value=key;o.textContent=PARTS[key][0];$('part').append(o)}$('part').onchange=()=>selectPart($('part').value);$('fuel').onchange=()=>$('biRow').hidden=$('fuel').value!=='bi';$('apply').onclick=apply;$('grid').onclick=gridToggle;$('start').onclick=start;$('stop').onclick=stop;$('toGen').onclick=()=>transfer('gen');$('toGrid').onclick=()=>transfer('grid');$('emergency').onclick=()=>trip('Parada de emergencia');$('reset').onclick=reset;$('pause').onclick=()=>{paused=!paused;$('pause').textContent=paused?'Continuar':'Pausar';renderUI()};$('load').oninput=()=>{s.load=+$('load').value;renderUI()};$('load').onchange=()=>log('Cambio de carga','La demanda pasó a '+s.load+'% de la potencia nominal.');$('reserve').oninput=()=>{s.reserve=+$('reserve').value;renderUI()};$('reserve').onchange=()=>log('Reserva ajustada','Se ajusta el nivel inicial del depósito o la disponibilidad del suministro.');$('housing').onchange=()=>{$('xray').value=0;updateView()};$('xray').oninput=$('explode').oninput=$('flows').onchange=updateView;$('isolate').onclick=()=>{isolated=!isolated;$('isolate').textContent=isolated?'Ver planta completa':'Aislar conjunto';updateView()};$('spin').onclick=()=>{spinning=!spinning;$('spin').textContent=spinning?'Detener giro':'Giro automático'};$('wide').onclick=()=>{$('viewer').classList.toggle('wide');$('wide').textContent=$('viewer').classList.contains('wide')?'Cerrar visor ampliado':'Ampliar visor'};document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('viewer').classList.remove('wide');$('wide').textContent='Ampliar visor'}});$('resetCamera').onclick=()=>{siteView=false;angle=-.65;elevation=.5;distance=11};$('edu').onclick=()=>{document.body.classList.toggle('eduoff');$('edu').textContent=document.body.classList.contains('eduoff')?'Modo educativo OFF':'Modo educativo ON'};document.querySelectorAll('[data-guide]').forEach(b=>b.onclick=()=>scenario(b.dataset.guide));$('repeat').onclick=()=>scenario(guide);
let last=performance.now(),uiTime=0,mainRenderLast=0;function frame(now){requestAnimationFrame(frame);if(document.hidden||window.plantPresentationActive||window.gameMenuActive){last=now;return;}if(now-mainRenderLast<1000/30)return;mainRenderLast=now;const dt=Math.min(.08,(now-last)/1000);last=now;tick(dt);if(spinning)angle+=dt*.15;const target=(isolated?new T.Vector3(selection==='ats'?3.6:0,1.25,0):campusNav.target).clone().add(panOffset);camera.position.set(target.x+Math.sin(angle)*Math.cos(elevation)*distance,target.y+Math.sin(elevation)*distance,target.z+Math.cos(angle)*Math.cos(elevation)*distance);camera.lookAt(target);const w=$('stage').clientWidth,h=$('stage').clientHeight;if(renderer.domElement.width!==Math.round(w*renderer.getPixelRatio())||renderer.domElement.height!==Math.round(h*renderer.getPixelRatio())){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}pistons.forEach((p,i)=>p.position.y=1.5+(s.rpm>0?.12*Math.cos(phaseMotion+(i%2)*Math.PI):0));if(shaft)shaft.rotation.x=phaseMotion;if(rotor)rotor.rotation.x=phaseMotion;if(fan)fan.rotation.x=phaseMotion*1.4;
for(const p of particles){const active=p.kind==='electric'?s.source==='gen':p.kind==='grid'?s.source==='grid':p.kind==='loadfeed'?s.source!=='none':s.rpm>350;p.dot.visible=active&&$('flows').checked&&!isolated&&+$('explode').value<10;if(p.dot.visible)p.dot.position.copy(p.curve.getPointAt((s.t*.22+p.offset)%1))}substation?.update();substation?.tourCamera(paused?0:dt);updateProScene(dt);updateLandscapeBackground();window.Walk31?.frame(dt);window.CCM34?.frame(dt);window.Performance33?.frame();renderer.render(scene,camera);uiTime+=dt;if(uiTime>.15){renderUI();uiTime=0}}
let inspector=null;
function openInspector(key){if(!inspector)inspector=makeInspector();inspector.load(key)}
function makeInspector(){const host=$('inspectStage'),r=new T.WebGLRenderer({antialias:true});r.setPixelRatio(Math.min(devicePixelRatio,1.5));r.setClearColor('#202e3a');r.toneMapping=T.ACESFilmicToneMapping;host.append(r.domElement);const sc=new T.Scene(),cam=new T.PerspectiveCamera(38,1,.01,100);sc.add(new T.HemisphereLight(0xe5f0ff,0x5d5849,2.5));const light=new T.DirectionalLight(0xffefd9,3.6);light.position.set(-4,6,5);sc.add(light);const rim=new T.DirectionalLight(0xabcfff,2);rim.position.set(5,3,-3);sc.add(rim);const assembly=new T.Group();sc.add(assembly);let items=[],key='',selected=0,spread=0,yaw=-.6,tilt=.4,zoom=1,play=false,dir=1,solo=false,cut=false,drag=null;const ray=new T.Raycaster(),pointer=new T.Vector2();
function add(name,why,obj){obj.position.set(0,0,0);obj.visible=true;const index=items.length;obj.traverse(o=>{o.visible=true;if(o.isMesh){o.material=o.material.clone();o.material.opacity=1;o.material.transparent=false;o.material.depthWrite=true;o.material.emissive?.set('#000');o.userData.inspect=index}});assembly.add(obj);items.push({name,why,obj,offset:new T.Vector3((index%3-1)*.7,index*.30,(index%2?1:-1)*.45)})}
function extra(name,why,fn){const g=new T.Group();fn(g);g.userData.synthetic=true;add(name,why,g)}
function load(k){key=k;play=false;$('inspectAnimate').textContent='Animar separación';items.forEach(i=>i.obj.traverse(o=>{if(o.isMesh){o.material.dispose();if(i.obj.userData.synthetic)o.geometry.dispose()}}));assembly.clear();items=[];spread=0;solo=false;cut=false;zoom=1;$('inspectSolo').checked=false;$('inspectCut').checked=false;$('inspectSpread').value=0;$('inspectZoom').value=100;
for(const p of pieces.filter(p=>p.userData.key===k)){const clone=p.clone(true);clone.position.set(0,0,0);add(p.userData.name,p.userData.explain,clone)}
if(k==='battery'){
extra('Placas y separadores de batería','Corte conceptual: placas alternadas y material separador. Se exageran espesores para observar la construcción.',g=>{for(let j=0;j<12;j++)box(g,[.026,.30,.28],[.05+j*.033,.63,.85],j%2?mat('#adafa3'):mat('#735849'));});
extra('Inducido y eje del arrancador','El motor de arranque convierte energía eléctrica de la batería en movimiento.',g=>{cyl(g,.07,.40,[.1,.85,.56],steel,'x');for(let j=0;j<8;j++){const a=j*Math.PI/4;cyl(g,.016,.32,[.1,.85+Math.cos(a)*.07,.56+Math.sin(a)*.07],copper,'x')}});
}
if(k==='ats'){
extra('Contactos de red y generador','Dos juegos de contactos independientes seleccionan la fuente. Es una representación de transición abierta.',g=>{for(const x of [3.43,3.87])for(let j=0;j<3;j++){box(g,[.06,.24,.035],[x-.07+j*.07,1,.36],copper);cyl(g,.029,.018,[x-.07+j*.07,1.10,.39],steel,'z')}});
extra('Enclavamiento mecánico','Impide representar ambas fuentes conectadas simultáneamente; la lógica también exige una fuente válida.',g=>{box(g,[.61,.065,.08],[3.65,.9,.42],steel);for(const x of [3.43,3.87])cyl(g,.04,.07,[x,.9,.47],steel,'z')});
extra('Accionamiento','Transmite la orden de apertura o cierre. No reproduce el mecanismo de un fabricante.',g=>{for(const x of [3.43,3.87]){cyl(g,.075,.18,[x,.76,.1],black);for(let j=0;j<9;j++){const tor=mesh(g,new T.TorusGeometry(.077,.009,6,22),copper,[x,.69+j*.017,.1]);tor.rotation.x=Math.PI/2}}});
}
if(k==='control'){
extra('Placa electrónica y procesador','Interpreta señales de red y del motor y ejecuta la secuencia. La distribución electrónica es ilustrativa.',g=>{box(g,[.50,.32,.025],[1.8,1.7,1.08],mat('#21664b'));box(g,[.13,.13,.025],[1.8,1.7,1.105],black);for(let j=0;j<8;j++)for(const side of [-1,1])box(g,[.008,.035,.010],[1.745+j*.016,1.7+side*.08,1.12],steel);for(let j=0;j<5;j++)box(g,[.03,.018,.014],[1.61+j*.07,1.82,1.12],mat('#c8b08b'))});
extra('Conectores de entradas y salidas','Conectan sensores, órdenes de arranque y transferencia al controlador.',g=>{box(g,[.4,.045,.045],[1.8,1.56,1.10],mat('#327d60'));for(let j=0;j<9;j++)cyl(g,.01,.06,[1.63+j*.042,1.55,1.13],steel,'z')});
}
if(k==='fuel'){
extra(activeFuel()==='ng'||activeFuel()==='lpg'?'Diafragma y válvula de regulación':'Elemento filtrante',activeFuel()==='ng'||activeFuel()==='lpg'?'Corte conceptual de regulación: una membrana y una válvula modulan el suministro. No se calculan presiones.':'El elemento poroso retiene partículas antes de que el combustible llegue al motor.',g=>{if(['ng','lpg'].includes(activeFuel())){cyl(g,.17,.035,[-2,1,.75],mat('#baaa83'));cyl(g,.027,.25,[-2,1.08,.75],steel)}else for(let j=0;j<20;j++){let a=j*Math.PI/10;box(g,[.012,.25,.035],[-1.8+Math.cos(a)*.075,1,.5+Math.sin(a)*.075],mat('#d5cba6'))}});
}
if(k==='exhaust')extra('Cámaras y tubo perforado','Las cámaras y perforaciones representan el recorrido interno del silenciador; la acústica no se calcula.',g=>{cyl(g,.08,1.35,[.65,2.4,-.8],steel,'x');for(let j=0;j<4;j++)cyl(g,.175,.016,[.15+j*.33,2.4,-.8],steel,'x');for(let j=0;j<16;j++)cyl(g,.009,.012,[.04+j*.08,2.485,-.8],black)});
$('inspectSelect').value=k;$('inspectTitle').textContent=PARTS[k][0];$('inspectList').replaceChildren();items.forEach((it,i)=>{const b=document.createElement('button');b.textContent=`${i+1}. ${it.name}`;b.onclick=()=>choose(i);$('inspectList').append(b)});choose(0);$('inspectBody').hidden=false;$('inspectFold').textContent='Contraer';}
function choose(i){selected=i;$('inspectName').textContent=items[i].name;$('inspectExplain').textContent=items[i].why;[...$('inspectList').children].forEach((b,j)=>{b.classList.toggle('primary',i===j);b.setAttribute('aria-pressed',String(i===j))});draw()}
function draw(){if(!items.length||$('inspectBody').hidden)return;items.forEach((it,i)=>{it.obj.visible=!solo||i===selected;it.obj.position.copy(it.offset).multiplyScalar(spread*2.5);it.obj.traverse(o=>{if(!o.isMesh)return;o.material.emissive?.set(i===selected?'#21170b':'#000');o.material.transparent=cut&&i!==selected;o.material.opacity=cut&&i!==selected?.13:1;o.material.depthWrite=!o.material.transparent})});assembly.updateMatrixWorld(true);const bounds=new T.Box3();items.filter(it=>it.obj.visible).forEach(it=>bounds.union(new T.Box3().setFromObject(it.obj)));const center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();const dist=Math.max(.7,size.length()*1.7)*Math.max(1,1/cam.aspect)/zoom;cam.position.set(center.x+Math.sin(yaw)*Math.cos(tilt)*dist,center.y+Math.sin(tilt)*dist,center.z+Math.cos(yaw)*Math.cos(tilt)*dist);cam.lookAt(center);cam.updateMatrixWorld();r.render(sc,cam);$('inspectValue').textContent=Math.round(spread*100)+'%';}
$('openInspector').onclick=()=>{$('inspectBody').hidden=false;$('inspectFold').textContent='Contraer';draw();$('inspector').scrollIntoView({behavior:'smooth',block:'start'})};$('inspectSelect').onchange=()=>{selectPart($('inspectSelect').value)};$('inspectSpread').oninput=()=>{spread=+$('inspectSpread').value/100;play=false;$('inspectAnimate').textContent='Animar separación';draw()};$('inspectZoom').oninput=()=>{zoom=+$('inspectZoom').value/100;draw()};$('inspectSolo').onchange=()=>{solo=$('inspectSolo').checked;draw()};$('inspectCut').onchange=()=>{cut=$('inspectCut').checked;draw()};$('inspectAssemble').onclick=()=>{spread=0;play=false;$('inspectSpread').value=0;$('inspectAnimate').textContent='Animar separación';draw()};$('inspectExplode').onclick=()=>{spread=.8;play=false;$('inspectSpread').value=80;$('inspectAnimate').textContent='Animar separación';draw()};$('inspectAnimate').onclick=()=>{play=!play;$('inspectAnimate').textContent=play?'Pausar separación':'Animar separación'};$('inspectFold').onclick=()=>{$('inspectBody').hidden=!$('inspectBody').hidden;$('inspectFold').textContent=$('inspectBody').hidden?'Desplegar':'Contraer';if($('inspectBody').hidden){play=false;$('inspectAnimate').textContent='Animar separación'}else draw()};$('inspectReset').onclick=()=>{yaw=-.6;tilt=.4;zoom=1;$('inspectZoom').value=100;draw()};
r.domElement.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,yaw,tilt,moved:false};r.domElement.setPointerCapture(e.pointerId);host.classList.add('dragging')};r.domElement.onpointermove=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved=drag.moved||Math.hypot(dx,dy)>4;yaw=drag.yaw-dx*.0055;tilt=Math.max(-1.5,Math.min(1.5,drag.tilt+dy*.0055));draw()};r.domElement.onpointerup=e=>{if(drag&&!drag.moved){const rect=r.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,cam);const hit=ray.intersectObject(assembly,true).find(h=>visibleTree(h.object)&&h.object.material.opacity>.3);if(hit)choose(hit.object.userData.inspect)}drag=null;host.classList.remove('dragging')};r.domElement.onpointercancel=()=>{drag=null;host.classList.remove('dragging')};r.domElement.addEventListener('wheel',e=>{e.preventDefault();cancelAnimationFrame(rotationId);rotationId=0;setRotation(false);zoom=Math.max(.6,Math.min(2.5,zoom-e.deltaY*.001));$('inspectZoom').value=zoom*100;draw()},{passive:false});new ResizeObserver(draw).observe(host);let previous=performance.now();setInterval(()=>{const now=performance.now(),dt=Math.min(.1,(now-previous)/1000);previous=now;if(!play||document.hidden)return;spread+=dir*dt*.17;if(spread>=1){spread=1;dir=-1}if(spread<=0){spread=0;dir=1}$('inspectSpread').value=spread*100;draw()},50);return {load,draw,count:()=>items.length};}

for(const k in PARTS){const o=document.createElement('option');o.value=k;o.textContent=PARTS[k][0];$('inspectSelect').append(o)}
let substation=null,siteView=false;
const campusNav={mode:'basement',target:new T.Vector3(0,1.5,0),tour:false,u:0};
const LEVEL=6.5;
function circuitState(){const ready=['ready','cool'].includes(s.stage)&&!s.fault;const q0=ready,qn=s.source==='grid'&&s.grid,qg=s.source==='gen'&&ready;return {ready,q0,qn,qg,bus:qn||qg,kw:(qn||qg)?cfg.rating*s.load/100:0}}
function createSubstation(){const site=new T.Group();scene.add(site);const basementFloor=new T.Group();site.add(basementFloor);const walls=new T.Group(),decks=new T.Group(),covers=new T.Group(),outdoor=new T.Group(),subParts={};site.add(walls,decks,covers,outdoor);const flowItems=[],lights=[],fans=[],breakerHandles={};
const sceneLabels=[];function label(text,pos,w=2,color='#1c4141'){const cv=document.createElement('canvas');cv.width=1024;cv.height=192;const c=cv.getContext('2d');c.fillStyle=color;c.fillRect(0,0,1024,192);c.fillStyle='#f1f4ee';c.font='bold 45px Arial';c.textAlign='center';c.fillText(text,512,112);const tx=new T.CanvasTexture(cv);tx.colorSpace=T.SRGBColorSpace;const m=mesh(site,new T.PlaneGeometry(w,w*.1875),new T.MeshBasicMaterial({map:tx,side:T.DoubleSide,transparent:true}),pos);m.userData.labelText=text;sceneLabels.push(m);return m}
function curve(points){const c=new T.CurvePath();for(let j=1;j<points.length;j++)c.add(new T.LineCurve3(new T.Vector3(...points[j-1]),new T.Vector3(...points[j])));return c}
function line(g,points,r,m){return mesh(g,new T.TubeGeometry(curve(points),Math.max(30,Math.min(480,points.length*4)),r,8,false),m)}
function texture(){const cv=document.createElement('canvas');cv.width=cv.height=256;const cx=cv.getContext('2d');cx.fillStyle='#9c9c91';cx.fillRect(0,0,256,256);let seed=7;for(let i=0;i<15000;i++){seed=(seed*1664525+1013904223)>>>0;const x=(seed>>>16)%256;seed=(seed*1664525+1013904223)>>>0;const y=(seed>>>16)%256;cx.fillStyle=i%2?'#ffffff10':'#20202012';cx.fillRect(x,y,2,2)}const tx=new T.CanvasTexture(cv);tx.wrapS=tx.wrapT=T.RepeatWrapping;tx.repeat.set(5,4);tx.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({map:tx,roughness:.93,bumpMap:tx,bumpScale:.015})}
const concrete=texture(),sheet=mat('#789090',.4),ductMetal=mat('#a5b4b8',.6),yellow=mat('#dbc255'),earth=mat('#498559');
// Sótano: cota visual 0; el exterior está a +6.5 unidades representativas.
floor.visible=false;box(basementFloor,[17,.22,12],[.5,-.2,0],concrete);box(walls,[17,6.35,.25],[.5,3,-6],concrete);box(walls,[.25,6.35,12],[-8,3,0],concrete);box(walls,[.25,6.35,12],[9,3,0],concrete);

const civilBase=new T.Group();site.add(civilBase);
box(civilBase,[36.6,.48,15.5],[9.5,-.56,-1.3],mat('#505b60',.08));
box(civilBase,[36.6,.10,15.5],[9.5,-.27,-1.3],mat('#a4adb0',.12));
box(decks,[35.9,.35,15.1],[9.55,6.27,-1.3],concrete);
const yardCore=new T.Group();outdoor.add(yardCore);
box(yardCore,[18.4,6.24,15.1],[18.2,2.9,-1.3],mat('#8b7965'));
// Backfill behind the basement, physically joined to the same foundation.
box(yardCore,[17.8,6.24,2.6],[.1,2.9,-7.55],mat('#8b7965'));

for(const x of [-6.9,7.8])for(const z of [-4.8,4.8]){box(site,[.48,6.1,.48],[x,3,z],concrete);for(let j=0;j<6;j++)box(site,[.50,.12,.50],[x,.15+j*.19,z],j%2?yellow:black)}
box(site,[8,.10,4.4],[0,.0,0],mat('#555f5b'));for(const z of [-2.35,2.35])box(site,[8.4,.015,.08],[0,.067,z],yellow);for(const x of [-4.2,4.2])box(site,[.08,.015,4.7],[x,.067,0],yellow);label('ESPACIO DE MANTENIMIENTO · ILUSTRATIVO',[0,.08,2.63],3.2).rotation.x=-Math.PI/2;
for(const x of [-5.3,5.1]){box(site,[.22,.015,9],[x,-.072,0],black);for(let j=0;j<60;j++)box(site,[.22,.018,.025],[x,-.057,-4.5+j*.15],steel)}
// Gabinetes: Q0 de generación y tablero de mando, separados de los conductores.
box(site,[.7,1.5,.55],[4.7,.97,.9],sheet);box(site,[.20,.34,.06],[4.7,1.14,1.20],black);breakerHandles.q0=box(site,[.06,.19,.05],[4.7,1.14,1.25],red);label('Q0 · GENERADOR 480 V',[4.7,5.85,1.23],1.5);label('MANDO REMOTO DE TRANSFERENCIA',[3.4,5.85,.42],2.4);
for(let j=0;j<2;j++){box(site,[.7,1.9,.3],[-4.9+j*.85,1.1,-5.65],sheet);box(site,[.12,.32,.04],[-4.7+j*.85,1.1,-5.47],dark)}label('AUXILIARES / CONTROL',[-4.45,5.85,-5.43],2.3);
// Banco de arranque, aislamiento y bandeja; adicional a la batería incorporada.
box(site,[1.5,.10,.70],[2,.32,-3.5],steel);for(let j=0;j<2;j++){box(site,[.61,.46,.5],[1.64+j*.72,.62,-3.5],black);for(const side of [-1,1])cyl(site,.035,.07,[1.64+j*.72+side*.20,.89,-3.5],side<0?red:steel)}conduit([[1.44,.93,-3.5],[1.44,.95,-3.0],[.25,.93,-3.0],[.25,.86,.85]],.06);line(site,roundedRoute([[1.44,.93,-3.5],[1.44,.95,-3.0],[.25,.93,-3.0],[.25,.86,.85]]),.020,red);label('BANCO DE ARRANQUE · DC',[2,5.85,-3.23],1.85);
const fuelGroup=new T.Group();site.add(fuelGroup);box(fuelGroup,[1.6,.12,1.4],[-4.8,.12,-3.1],dark);box(fuelGroup,[1.28,.95,1.0],[-4.8,.68,-3.1],mat('#6d796b'));cyl(fuelGroup,.075,.09,[-4.8,1.21,-3.1],steel);line(fuelGroup,[[-4.2,.5,-3.1],[-3.8,.3,-3.1],[-3.8,.3,.7],[-2,.8,.75]],.026,black);label('SUMINISTRO / RESERVA DE COMBUSTIBLE',[-4.8,5.85,-2.53],2.5);
// Unidad VII: tank containment and basement detectors remain fixed to civil supports.
for(const x of [-5.54,-4.06])box(fuelGroup,[.10,.24,1.44],[x,.22,-3.1],mat('#838c86'));
for(const z of [-3.78,-2.42])box(fuelGroup,[1.58,.24,.10],[-4.8,.22,z],mat('#838c86'));
proPipe(fuelGroup,[[-4.8,1.25,-3.1],[-4.8,1.44,-3.1],[-4.8,1.44,-5.3],[-4.8,7.7,-5.3]],.035,steel,.12);
cyl(fuelGroup,.052,.06,[-4.8,7.74,-5.3],dark);
box(fuelGroup,[.10,.045,.10],[-4.4,.195,-3.58],yellow);
proPipe(fuelGroup,[[-4.4,.22,-3.58],[-4.4,.38,-3.58],[-4.4,.38,-5.45],[-4.45,1.05,-5.45]],.009,black,.06);
const detection=new T.Group();site.add(detection);detection.name='Detección y drenaje del sótano';
box(detection,[.15,.14,.06],[7.56,5.40,-4.80],sheet);box(detection,[.26,.045,.16],[7.66,5.35,-4.80],steel);
cyl(detection,.080,.055,[7.58,5.305,-4.80],mat('#cbcfc9'));cyl(detection,.012,.007,[7.58,5.275,-4.80],red);
for(let j=0;j<8;j++){const a=j*Math.PI/4;box(detection,[.008,.017,.002],[7.58+Math.cos(a)*.079,5.3,-4.8+Math.sin(a)*.079],dark);}
proPipe(detection,[[7.63,5.39,-4.77],[7.79,5.39,-4.77],[7.79,1.5,-4.77],[7.7,1.5,-5.4]],.014,steel,.06);
box(detection,[.58,.04,.58],[7.4,.01,-5.7],dark);for(let j=0;j<11;j++)box(detection,[.53,.020,.012],[7.4,.039,-5.96+j*.052],steel);
box(detection,[.08,.16,.08],[7.75,.10,-5.75],yellow);cyl(detection,.022,.11,[7.75,.235,-5.75],steel);
proPipe(detection,[[7.8,.20,-5.7],[7.8,.32,-5.7],[7.8,7.35,-5.7],[8.65,7.35,-5.7]],.030,steel,.10);
box(detection,[.21,.31,.09],[7.76,1.49,-5.46],sheet);cyl(detection,.019,.022,[7.76,1.56,-5.39],mat('#d4b05b'),'z');
// Entrada de aire y extracción del radiador independientes del shaft eléctrico.
function grille(pos,w,h){box(site,[w,h,.08],pos,dark);for(let i=0;i<12;i++)box(site,[w*.9,.027,.12],[pos[0],pos[1]-h*.43+i*h*.078,pos[2]+.06],steel)}
box(site,[1.2,1.3,.8],[5.8,1.6,-5.5],ductMetal);box(site,[1.2,6,.9],[5.8,4.2,-5.5],ductMetal);grille([5.8,1.7,-5.0],1.1,1.0);grille([5.8,7.0,-4.99],1.3,.7);label('ENTRADA DE AIRE EXTERIOR',[5.8,7.8,-4.97],2.4);
box(site,[1.1,1.7,1.65],[-2.9,1.3,0],ductMetal);box(site,[.7,1.1,3.7],[-3.2,1.7,-1.9],ductMetal);box(site,[1,6.1,1],[-3.2,4.4,-3.7],ductMetal);grille([-3.2,7.2,-3.14],1,.8);label('EXTRACCIÓN DEL RADIADOR',[-3.2,7.98,-3.1],2.5);
// Escape separado, aislado y elevado por encima de la descarga de aire.
const exhaustPts=[[1.65,3.2,-.8],[1.65,3.75,-.8],[1.65,3.75,-4.3],[.8,3.75,-4.3],[.8,9.6,-4.3]];line(site,exhaustPts,.105,mat('#aaa99d',.7));for(let y=4;y<9.2;y+=.8){const collar=mesh(site,new T.TorusGeometry(.12,.018,8,24),steel,[.8,y,-4.3]);collar.rotation.x=Math.PI/2}cyl(site,.18,.045,[.8,9.77,-4.3],dark);label('ESCAPE A EXTERIOR · ALTURA ILUSTRATIVA',[.8,10.25,-4.1],3.3);
// Señales, extintores y paro. No se presenta una aprobación de instalación.
for(const x of [-6,6.7]){cyl(site,.12,.63,[x,.72,-5.5],red);cyl(site,.055,.12,[x,1.08,-5.5],black);line(site,[[x+.07,1.1,-5.5],[x+.22,.85,-5.5],[x+.18,.48,-5.5]],.017,black);label('EXTINTOR',[x,5.85,-5.3],.85,'#8a3433')}
box(site,[.22,.32,.07],[-6.8,1.45,-5.78],yellow);cyl(site,.066,.05,[-6.8,1.48,-5.7],red,'z');label('PARO DE EMERGENCIA',[-6.5,6.05,-5.67],1.7,'#8a3433');label('SALIDA',[-6.2,6.25,-5.7],1.4);
for(const x of [-3,1,5]){box(site,[1.9,.12,.4],[x,5.3,1],dark);const lm=new T.MeshStandardMaterial({color:'#fff9db',emissive:'#fff0b0',emissiveIntensity:1});mesh(site,new T.BoxGeometry(1.8,.03,.32),lm,[x,5.22,1]);const pl=new T.PointLight(0xffefd9,4,12);pl.position.set(x,5.05,1);site.add(pl);lights.push({lm,pl})}
// Barra PE y enlaces metálicos, sin flujo de potencia simulado por la tierra.
box(site,[2,.10,.035],[3,.45,-5.7],copper);for(const p of [[0,.2,0],[3.65,.2,.25],[4.7,.2,.9],[2,.25,-3.5]]){const pts=roundedRoute([p,[p[0],.15,-4.8],[3,.15,-4.8],[3,.45,-5.7]],.12);line(site,pts,.022,earth);line(covers,pts,.06,ductMetal);}label('BARRA EQUIPOTENCIAL PE',[3,5.85,-5.65],2);
// Shaft eléctrico entre sótano y exterior, con potencia, PE, control y comunicaciones separados visualmente.
const shaftX=7,shaftZ=2.7;box(covers,[1.5,7.5,.08],[shaftX,3.55,shaftZ-.68],concrete);box(covers,[.08,7.5,1.4],[shaftX-.72,3.55,shaftZ],concrete);box(covers,[.08,7.5,1.4],[shaftX+.72,3.55,shaftZ],concrete);box(covers,[1.5,7.5,.045],[shaftX,3.55,shaftZ+.70],sheet);for(let y=.4;y<7.1;y+=.35)box(site,[1.18,.035,.04],[shaftX,y,shaftZ-.4],steel);for(const x of [6.43,7.57])box(site,[.04,7.0,.12],[x,3.5,shaftZ-.4],steel);label('SHAFT ELÉCTRICO',[7,8.15,3.35],2.2);

// Recorridos con esquinas redondeadas y canalizaciones continuas.
function roundedRoute(nodes,r=.30){const out=[nodes[0]];for(let i=1;i<nodes.length-1;i++){const a=new T.Vector3(...nodes[i-1]),b=new T.Vector3(...nodes[i]),c=new T.Vector3(...nodes[i+1]);const d=Math.min(r,a.distanceTo(b)*.35,b.distanceTo(c)*.35);const u=a.clone().sub(b).normalize(),v=c.clone().sub(b).normalize();const p=b.clone().addScaledVector(u,d),q=b.clone().addScaledVector(v,d);out.push(p.toArray());for(let k=1;k<=10;k++){const t=k/10;out.push(p.clone().multiplyScalar((1-t)*(1-t)).addScaledVector(b,2*(1-t)*t).addScaledVector(q,t*t).toArray())}}out.push(nodes[nodes.length-1]);return out}
const raceMetal=mat('#a7b5bf',.7), jacket=mat('#262c33'),signalMat=mat('#508db9'),bondMat=mat('#31a775');
function conduit(nodes,r=.12,color=ductMetal){const pts=roundedRoute(nodes);line(covers,pts,r,color);return pts}
function pullBox(p,size=.46){box(site,[size,size,size],p,raceMetal);box(covers,[size*.91,size*.91,.035],[p[0],p[1],p[2]+size/2+.02],sheet);for(const dx of [-1,1])for(const dy of [-1,1])cyl(covers,.018,.035,[p[0]+dx*size*.35,p[1]+dy*size*.35,p[2]+size/2+.05],steel,'z')}
const powerRoute=roundedRoute([[1.55,2.1,.38],[2.5,2.1,.38],[2.5,2.1,.9],[4.7,2.1,.9],[4.7,1.3,.9],[4.7,1.0,.9],[4.7,1,1.5],[4.7,3.55,1.5],[4.7,3.55,2.7],[7,3.55,2.7],[7,5.85,2.7],[10.55,5.85,2.7],[10.55,5.85,4.85],[10.55,7,4.85]],.24);
// L1/L2/L3 + PE reunidos dentro de la misma envolvente; no fases en tubos ferrosos separados.
const powerAxis=curve(powerRoute),powerSamples=powerAxis.getSpacedPoints(200),powerFrames=powerAxis.computeFrenetFrames(200,false);for(const [dx,dz,col] of [[-.044,-.044,'#815c39'],[.044,-.044,'#24282d'],[-.044,.044,'#8b9195'],[.044,.044,'#32aa67']])line(site,powerSamples.map((p,i)=>p.clone().addScaledVector(powerFrames.normals[i],dx).addScaledVector(powerFrames.binormals[i],dz).toArray()),.024,mat(col));
line(covers,powerRoute,.14,raceMetal);const powerCurve=curve(powerRoute);
// Conexión flexible corta desacopla vibraciones del grupo.
const flexPts=roundedRoute([[1.55,2.1,.38],[2.5,2.1,.38],[2.5,2.1,.9]],.2);line(covers,flexPts,.15,mat('#4c5963',.5));
for(const p of [[4.7,3.55,1.5],[7,3.55,2.7],[7,5.85,2.7]])pullBox(p);
// Charola portacables de control independiente: largueros, peldaños, tapas y suspensión.
for(const z of [3.32,3.88])box(site,[3.5,.16,.045],[5.25,3.55,z],raceMetal);
for(let x=3.5;x<=7;x+=.24)box(site,[.045,.04,.58],[x,3.47,3.6],raceMetal);
box(covers,[3.5,.025,.62],[5.25,3.66,3.6],raceMetal);
for(const x of [3.65,4.9,6.3]){box(site,[.045,2.5,.045],[x,4.82,3.26],raceMetal);box(site,[.045,2.5,.045],[x,4.82,3.94],raceMetal);box(site,[.08,.08,.86],[x,3.43,3.6],raceMetal);for(const z of [3.26,3.94])box(site,[.19,.07,.19],[x,6.04,z],raceMetal)}
for(const [off,col] of [[-.11,'#bf994c'],[.11,'#508db9']]){const pts=roundedRoute([[3.65,1.55,.22],[3.65,2.7,.22],[3.65,2.7,3.6+off],[3.65,3.56,3.6+off],[6.65,3.56,3.6+off],[6.65,3.56,2.7+off],[6.65,5.85,2.7+off],[17,5.85,2.7+off],[17,5.85,-.7+off],[17,7,-.7+off]],.22);line(site,pts,.033,mat(col));line(covers,pts,.062,raceMetal)}
// Soportes de la potencia y abrazaderas al shaft, independientes de otras instalaciones.
for(const x of [4.95,5.95,6.8]){box(site,[.065,2.38,.065],[x,4.82,2.45],raceMetal);box(site,[.13,.08,.62],[x,3.48,2.69],raceMetal);const clamp=mesh(site,new T.TorusGeometry(.155,.018,8,16),raceMetal,[x,3.55,2.7]);clamp.rotation.y=Math.PI/2;}
for(let y=1.9;y<6;y+=1.1){box(site,[1.15,.075,.08],[7,y,2.33],raceMetal);for(const x of [6.65,7]){box(site,[.06,.06,.37],[x,y,2.52],raceMetal);mesh(site,new T.TorusGeometry(x===7?.155:.085,.016,8,16),raceMetal,[x,y,2.7]).rotation.x=Math.PI/2;}}
// Unión equipotencial de soportes metálicos hacia barra PE, con terminales visibles.
const bondPts=roundedRoute([[6.3,3.47,3.9],[6.3,3.1,3.9],[6.3,3.1,-4.8],[3,3.1,-4.8],[3,.45,-5.7]],.22);line(site,bondPts,.018,bondMat);line(covers,bondPts,.045,raceMetal);
for(const x of [4.9,6.3])line(site,[[x-.16,3.55,3.89],[x-.08,3.44,3.99],[x+.16,3.55,3.89]],.015,bondMat);
for(let i=0;i<8;i++){cyl(site,.025,.055,[2.2+i*.22,.45,-5.66],steel,'z');}
// Sellos de penetración representativos: sistema ensayado por especificar en proyecto.
for(const z of [2.59,2.7,2.81]){box(site,[.12,.40,.20],[8.98,5.85,z],mat('#b65b48'));}label('PASO SELLADO HACIA PATIO',[8.3,6.45,3.25],2.0);
label('P-01 · 480 V · L1/L2/L3 + PE',[5.65,4.04,2.76],2.4);
label('C-01 / DATOS · RUTA INDEPENDIENTE',[5.1,3.96,3.95],2.6,'#284963');
label('CAJAS ACCESIBLES / CURVAS AMPLIAS',[7,4.3,3.2],2.5);
// Reserva frontal de operación del Q0: no almacenar ni cruzar con servicios.
for(const x of [4.12,5.28])box(site,[.045,.012,1.5],[x,-.06,2.02],yellow);
for(const z of [1.3,2.77])box(site,[1.2,.012,.045],[4.7,-.06,z],yellow);
label('Q0 · ÁREA LIBRE',[4.7,-.045,2.5],1.1).rotation.x=-Math.PI/2;
for(const x of [10,14]){box(site,[1.1,.70,1.1],[x,5.89,2.7],concrete);box(covers,[1.15,.10,1.15],[x,6.29,2.7],dark);label('REGISTRO',[x,6.68,3.3],1.1)}label('BANCO DE DUCTOS SUBTERRÁNEO',[11.7,6.72,3.4],3.3);

// Junctions and fittings follow the actual cable routes; no decorative dead-end runs.
function gland(p,axis='y',r=.16){cyl(site,r,.11,p,raceMetal,axis);cyl(site,r*.79,.14,p,black,axis);}
gland([1.55,2.1,.40],'z',.16);gland([4.7,1.70,.9],'y',.15);gland([4.7,1,1.19],'z',.15);
for(const p of [[3.65,1.55,.22],[3.65,2.7,3.49],[3.65,2.7,3.71]])gland(p,'y',.08);
for(const z of [3.49,3.71]){pullBox([6.65,3.56,z],.18);for(const x of [3.9,4.9,5.9]){box(site,[.08,.08,.10],[x,3.56,z],raceMetal);}}
// Radiator to extract-air duct: flexible collar and flanged connector.
for(const x of [-2.43,-2.38]){box(site,[.055,1.72,.07],[x,1.3,.78],ductMetal);box(site,[.055,1.72,.07],[x,1.3,-.78],ductMetal);for(const y of [.44,2.16])box(site,[.055,.065,1.63],[x,y,0],ductMetal);}
for(let i=0;i<7;i++){const x=-2.45-i*.025;box(site,[.016,1.66,.035],[x,1.3,.755],black);box(site,[.016,1.66,.035],[x,1.3,-.755],black);}
// Local output circuit support between terminal box and Q0.
for(const x of [2.7,3.65,4.35]){box(site,[.07,.22,.34],[x,2.0,.9],raceMetal);box(site,[.07,3.85,.07],[x,4.1,1.03],raceMetal);box(site,[.24,.06,.24],[x,6.03,1.03],raceMetal);}
// Motor cooling-water pipes, exhaust and electrical routes remain physically distinct.
for(const p of [[1.65,3.2,-.8],[1.65,3.75,-.8],[.8,6.05,-4.3]]){gland(p,'y',.135);}
// Connect external DC bank with a paired return, in a protected common route.
const returnDC=roundedRoute([[1.84,.93,-3.5],[1.84,.96,-3.0],[.50,.96,-3.0],[.50,.9,.85]],.18);line(site,returnDC,.02,black);line(covers,returnDC,.06,ductMetal);
for(let z=-2.8;z<.8;z+=.7)box(site,[.16,.08,.08],[.5,.96,z],raceMetal);
// Patio exterior cercado y equipos de potencia.
const fenceSteel=new T.Group();outdoor.add(fenceSteel);
for(const x of [9,27.2])for(const z of [-8.6,6])cyl(fenceSteel,.045,2.4,[x,7.75,z],steel);for(const y of [6.8,7.4,8,8.7])line(fenceSteel,[[9,y,-8.6],[27.2,y,-8.6],[27.2,y,6]],.018,steel);for(let x=9;x<27.2;x+=.45)line(fenceSteel,[[x,6.7,-8.6],[x,8.7,-8.6]],.009,steel);
function transformer(name,x,z,ratio){const g=new T.Group();outdoor.add(g);subParts[name]=g;box(g,[2.1,.3,2],[x,6.73,z],concrete);box(g,[1.65,1.4,1.25],[x,7.54,z],mat('#617d79',.45));for(const side of [-1,1])for(let j=0;j<12;j++)box(g,[.055,1.14,.27],[x-.77+j*.14,7.50,z+side*.70],steel);box(g,[1.87,.10,1.5],[x,8.31,z],steel);for(let j=0;j<3;j++){const px=x-.53+j*.53;cyl(g,.085,.48,[px,8.60,z-.3],mat('#9f8159'));for(let k=0;k<5;k++)cyl(g,.12,.025,[px,8.40+k*.08,z-.3],mat('#b7a080'))}label(name+' · '+ratio,[x,9.95,z+.35],2.0);return g}
transformer('TE',11.6,3.9,'480 V / 13.8 kV');transformer('TP',24.4,-.5,'13.8 kV / 480 V');
function breaker(name,x,z){const g=new T.Group();outdoor.add(g);subParts[name]=g;box(g,[1.15,2.3,.85],[x,7.81,z],sheet);box(g,[1.05,2.18,.04],[x,7.81,z+.45],mat('#a4b0a9',.3));for(let j=0;j<3;j++){cyl(g,.07,.43,[x-.32+j*.32,9.18,z],mat('#a68e69'));box(g,[.027,1.7,.04],[x-.32+j*.32,7.8,z-.25],copper)}box(g,[.3,.35,.05],[x,7.78,z+.50],dark);breakerHandles[name]=box(g,[.065,.20,.05],[x,7.78,z+.55],red);label(name+' · 13.8 kV',[x,9.85,z+.3],1.5)}
breaker('QG',18.4,1.3);breaker('QN',17.9,-1.6);breaker('QS',20.8,-.9);

const busAlum=new T.MeshStandardMaterial({color:'#c1c9ce',metalness:.68,roughness:.43});
const mainBusZ=[-1.62,-1.00,-.38];
const busGroup=new T.Group();outdoor.add(busGroup);subParts.BARRAS=busGroup;
for(let j=0;j<3;j++){
 const z=mainBusZ[j],y=9.75+j*.22,xN=17.58+j*.32,xG=18.08+j*.32,xS=20.48+j*.32;
 line(busGroup,[[17.15,y,z],[21.1,y,z]],.044,busAlum);
 line(busGroup,[[xN,9.0,-1.1],[xN,y,-1.1],[xN,y,z]],.026,copper);
 line(busGroup,[[xG,9.0,.8],[xG,y,.8],[xG,y,z]],.026,copper);
 line(busGroup,[[xS,y,z],[xS,y,-1.4],[xS,9.0,-1.4]],.026,copper);
 for(const x of [17.2,21.05]){
   box(busGroup,[.11,y-7.25,.11],[x,(y+6.45)/2,z],steel);
   box(busGroup,[.34,.10,.34],[x,6.75,z],mat('#a4aaab'));
   cyl(busGroup,.065,.55,[x,y-.32,z],mat('#744e39'));
   for(let k=0;k<7;k++)cyl(busGroup,.115,.032,[x,y-.55+k*.067,z],mat('#744e39'));
   box(busGroup,[.20,.055,.16],[x,y-.04,z],steel);
   const ring=mesh(busGroup,new T.TorusGeometry(.048,.014,8,24),steel,[x,y,z]);ring.rotation.y=Math.PI/2;
   for(const dz of [-.064,.064])cyl(busGroup,.020,.07,[x,y-.01,z+dz],steel);
 }
 // Expansion joint, bolted connection plates, visible cylindrical cross section.
 cyl(busGroup,.056,.15,[19.65,y,z],busAlum,'x');
 for(const xx of [19.58,19.72]){const r=mesh(busGroup,new T.TorusGeometry(.057,.01,8,20),steel,[xx,y,z]);r.rotation.y=Math.PI/2;}
 box(busGroup,[.24,.035,.16],[xS,y-.045,z],copper);
 for(const dx of [-.08,.08])for(const dz of [-.045,.045])cyl(busGroup,.017,.055,[xS+dx,y-.02,z+dz],steel);
}
label('BARRAS MT · L1 / L2 / L3',[19.2,10.6,-.3],2.4);

for(let i=0;i<3;i++){box(outdoor,[.70,1.65,.5],[23.6+i*.8,7.47,2.9],sheet);label(['ALUMBRADO','AUXILIARES','VENTILACIÓN'][i],[23.6+i*.8,8.7,3.20],.8)}

// Acabados constructivos: materiales y detalles visibles desde las cámaras de estudio.
const zinc=new T.MeshStandardMaterial({color:0x9ba4a6,metalness:.72,roughness:.48});
const porcelain=new T.MeshStandardMaterial({color:0x6c4027,roughness:.24,metalness:.06});
const paint=new T.MeshStandardMaterial({color:0x48605b,roughness:.48,metalness:.28});
function bolt(g,x,y,z){cyl(g,.028,.038,[x,y,z],zinc);}
function contactShadow(g,x,y,z,rx,rz){const sh=mesh(g,new T.CircleGeometry(1,28),new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.30,depthWrite:false}),[x,y,z]);sh.rotation.x=-Math.PI/2;sh.scale.set(rx,rz,1);sh.castShadow=false;sh.receiveShadow=false;sh.renderOrder=1;return sh}
// Losetas de concreto con juntas, zócalo y juntas de colado en muros.
for(let x=-7;x<9;x+=2)box(basementFloor,[.014,.008,11.7],[x,-.081,0],mat('#666963'));
for(let z=-5;z<6;z+=2)box(basementFloor,[16.7,.008,.014],[.5,-.081,z],mat('#666963'));
box(walls,[16.8,.22,.06],[.5,.07,-5.84],mat('#566465'));
for(let y=1.5;y<6;y+=1.5)box(walls,[16.8,.012,.013],[.5,y,-5.866],mat('#777a74'));
for(let x=-7.5;x<9;x+=2.4){box(walls,[.012,6.1,.014],[x,3,-5.863],mat('#777a74'));for(let y=.6;y<6;y+=1.5){const tie=cyl(walls,.029,.013,[x+.32,y,-5.857],mat('#676d68'),'z');}}
// Auxiliares: canalizaciones adosadas con bajadas a tableros y luminarias.
for(const x of [-4.9,-4.05]){const pts=conduit([[x,2,-5.65],[x,4.65,-5.65],[1,4.65,-5.65],[1,4.65,1],[1,5.3,1]],.055);line(site,pts,.023,jacket);pullBox([x,4.65,-5.65],.26);for(const y of [2.3,3.3,4.3])box(site,[.18,.08,.12],[x,y,-5.74],raceMetal);}
for(const x of [-3,5]){const pts=conduit([[1,5.3,1],[x,5.3,1]],.055);line(site,pts,.023,jacket);}
for(const [x,z,w] of [[5.8,-5.5,1.23],[-3.2,-3.7,1.03]])for(let y=1;y<7;y+=.8){box(site,[w,.04,1.04],[x,y,z],zinc);for(const dx of [-.4,.4])bolt(site,x+dx,y+.035,z+.49)}
// Patio: cama de grava, bordillos, andadores y canaleta con rejilla.
const gravelCanvas=document.createElement('canvas');gravelCanvas.width=gravelCanvas.height=512;const gc=gravelCanvas.getContext('2d');gc.fillStyle='#696b63';gc.fillRect(0,0,512,512);let randSeed=83;function rnd(){randSeed=(Math.imul(randSeed,1664525)+1013904223)>>>0;return randSeed/4294967296}
for(let i=0;i<18000;i++){const v=90+Math.floor(rnd()*75);gc.fillStyle=`rgb(${v},${v},${v-7})`;gc.beginPath();gc.ellipse(rnd()*512,rnd()*512,1+rnd()*3,1+rnd()*2,rnd()*6.28,0,6.28);gc.fill()}
const gravelTx=new T.CanvasTexture(gravelCanvas);gravelTx.wrapS=gravelTx.wrapT=T.RepeatWrapping;gravelTx.repeat.set(7,5);gravelTx.colorSpace=T.SRGBColorSpace;
// Terreno del patio en tres capas: grava superficial, subbase compactada y suelo natural. Se agrupan para poder ocultarlas y revelar la malla de tierra enterrada.
const subbaseMat=mat('#8a8368'),soilMat=mat('#6b4a30'),rodMat=mat('#c9b48a',.85);
const terrain=new T.Group();outdoor.add(terrain);
box(terrain,[18.2,.08,14.6],[18.1,6.61,-1.3],new T.MeshStandardMaterial({map:gravelTx,bumpMap:gravelTx,bumpScale:.055,roughness:1}));
box(terrain,[18,.30,14.4],[18.1,6.42,-1.3],subbaseMat);
box(terrain,[17.8,.56,14.2],[18.1,5.99,-1.3],soilMat);

const earthMass=new T.Group(),yardEarth=new T.Group(),basementEarth=new T.Group();
outdoor.add(earthMass);earthMass.add(yardEarth,basementEarth);
box(yardEarth,[.18,6.3,15.1],[27.42,2.9,-1.3],concrete);
box(yardEarth,[18.45,6.3,.18],[18.2,2.9,6.25],concrete);
box(basementEarth,[.35,6.3,12.5],[-8.38,2.9,.1],concrete);
box(basementEarth,[.35,6.3,12.5],[8.88,2.9,.1],concrete);
// Front remains open as an architectural section, with continuous sill and lintel.
box(basementEarth,[17.6,.30,.35],[.25,-.04,6.22],concrete);
box(basementEarth,[17.6,.42,.35],[.25,6.10,6.22],concrete);

for(const z of [-5.86,3.86])box(outdoor,[14,.22,.18],[18.4,6.68,z],concrete);
for(const x of [11.5,25.3])box(outdoor,[.18,.22,9.85],[x,6.68,-1],concrete);
box(outdoor,[13.5,.10,1.0],[18.4,6.69,2.2],concrete);
for(let x=12;x<25;x+=1.1)box(outdoor,[.015,.012,1],[x,6.75,2.2],dark);
box(outdoor,[13.3,.07,.25],[18.4,6.69,3.35],dark);
for(let x=11.8;x<25;x+=.13)box(outdoor,[.025,.02,.25],[x,6.735,3.35],zinc);
// Registros: marco metálico, tapa segmentada y asas empotradas.
for(const x of [10,14]){for(const z of [2.13,3.27])box(covers,[1.18,.08,.05],[x,6.35,z],zinc);for(const dx of [-.57,.57])box(covers,[.05,.08,1.18],[x+dx,6.35,2.7],zinc);for(let i=0;i<7;i++)box(covers,[1.05,.014,.012],[x,6.351,2.23+i*.15],zinc);for(const dx of [-.3,.3])box(covers,[.16,.024,.06],[x+dx,6.365,2.7],black)}

// Complete, non-overlapping transformer assemblies; electrical terminal positions retained.
function roundedTank(g,w,h,d,p,m){const sh=new T.Shape(),r=.12;sh.moveTo(-w/2+r,-h/2);sh.lineTo(w/2-r,-h/2);sh.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);sh.lineTo(w/2,h/2-r);sh.quadraticCurveTo(w/2,h/2,w/2-r,h/2);sh.lineTo(-w/2+r,h/2);sh.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);sh.lineTo(-w/2,-h/2+r);sh.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const geo=new T.ExtrudeGeometry(sh,{depth:d,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1,curveSegments:6});geo.translate(0,0,-d/2);return mesh(g,geo,m,p)}
for(const [name,x,z] of [['TE',11.6,3.9],['TP',24.4,-.5]]){
 const g=subParts[name];g.clear();const enamel=mat('#59636d',.48),edge=mat('#8a969e',.65),fin=mat('#48535d',.52),ins=mat('#684833',.10);
 box(g,[3.15,.22,2.8],[x,6.75,z],concrete);
 for(const dx of [-.72,.72]){box(g,[.14,.15,2],[x+dx,6.91,z],dark);for(const dz of [-.74,.74]){cyl(g,.10,.14,[x+dx,6.88,z+dz],steel,'x');cyl(g,.028,.12,[x+dx,6.93,z+dz],steel);}}
 const tankStart=g.children.length;
 roundedTank(g,1.96,1.26,1.46,[x,7.61,z],enamel);
 box(g,[2.12,.075,1.62],[x,8.27,z],black);roundedTank(g,2.20,.09,1.72,[x,8.34,z],edge);
 for(const dx of [-.96,-.64,-.32,0,.32,.64,.96])for(const dz of [-.77,.77])cyl(g,.025,.045,[x+dx,8.41,z+dz],steel);
 // Two distinct radiator banks, outside the tank, connected by top/bottom headers.
 for(const side of [-1,1]){const rx=x+side*1.20;
  for(let j=0;j<19;j++){roundedTank(g,.52,1.12,.030,[rx,7.61,z-.68+j*.076],fin);for(const dx of [-.16,0,.16])box(g,[.018,.91,.038],[rx+dx,7.61,z-.68+j*.076],edge);}
  for(const y of [7.12,8.10]){line(g,[[rx,y,z-.72],[rx,y,z+.72]],.065,enamel);for(const dz of [-.55,.55])line(g,[[x+side*.94,y,z+dz],[rx,y,z+dz]],.049,enamel);}
 }
 const tankShell=new T.Group();tankShell.name='Tanque y radiadores';const tankParts=g.children.slice(tankStart);g.add(tankShell);for(const m of tankParts)tankShell.add(m);g.userData.tankShell=tankShell;
 const core=new T.Group();core.name='Núcleo y devanados';g.add(core);g.userData.core=core;core.visible=false;
 for(const yy of [7.13,8.09]){box(core,[1.68,.17,.79],[x,yy,z],dark);for(let n=0;n<16;n++)box(core,[1.69,.007,.80],[x,yy-.075+n*.01,z],steel);}
 for(const dx of [-.55,0,.55]){box(core,[.22,.89,.38],[x+dx,7.61,z],dark);cyl(core,.21,.78,[x+dx,7.61,z],mat('#ba7a3e',.6));for(let n=0;n<27;n++){const winding=mesh(core,new T.TorusGeometry(.214,.009,6,24),copper,[x+dx,7.25+n*.027,z]);winding.rotation.x=Math.PI/2;}line(core,[[x+dx,8.0,z],[x+dx,8.28,z],[x+dx,8.4,z-.3]],.021,copper);}
 // HV bushings, porcelain sheds, terminal pads: no clash with conservator.
 for(let j=0;j<3;j++){const bx=x-.53+j*.53;cyl(g,.13,.055,[bx,8.42,z-.3],edge);cyl(g,.066,.42,[bx,8.64,z-.3],ins);for(let k=0;k<6;k++){cyl(g,.13-k*.006,.037,[bx,8.47+k*.066,z-.3],ins);}cyl(g,.037,.06,[bx,8.87,z-.3],copper);box(g,[.11,.025,.09],[bx,8.9,z-.3],copper);
  if(name==='TE')line(g,[[bx,8.9,z-.3],[bx,9.12+j*.18,z-.3],[bx,9.12+j*.18,z-.3+j*.13],[x+1.2,9.12+j*.18,z-.3+j*.13]],.022,copper);
 }
 // Oil conservator behind HV terminals, with its own supports and pipe.
 cyl(g,.25,1.48,[x,8.96,z-.99],enamel,'x');for(const dx of [-.47,.47]){box(g,[.065,.5,.08],[x+dx,8.61,z-.93],edge);const ring=mesh(g,new T.TorusGeometry(.253,.017,8,24),edge,[x+dx,8.96,z-.99]);ring.rotation.y=Math.PI/2;}
 line(g,[[x+.64,8.96,z-.99],[x+.82,8.96,z-.99],[x+.82,8.38,z-.62]],.033,enamel);cyl(g,.065,.14,[x+.82,8.62,z-.81],edge);cyl(g,.07,.20,[x-.83,8.12,z-.91],mat('#b59961'));line(g,[[x-.64,8.96,z-.99],[x-.83,8.96,z-.99],[x-.83,8.24,z-.91]],.018,steel);
 for(const side of [-1,1]){cyl(g,.257,.04,[x+side*.75,8.96,z-.99],edge,'x');for(let k=0;k<10;k++){const a=k*Math.PI/5;cyl(g,.015,.025,[x+side*.78,8.96+Math.sin(a)*.218,z-.99+Math.cos(a)*.218],steel,'x');}}
 box(g,[.022,.28,.065],[x+.777,8.96,z-.99],black);box(g,[.025,.17,.025],[x+.791,8.925,z-.99],mat('#d5b155'));
 cyl(g,.045,.075,[x,9.24,z-.99],edge);
 // LV chamber tied to the actual duct endpoint; three insulated phase connectors.
 roundedTank(g,.48,.50,.44,[x-1.05,7.02,z+.95],enamel);line(g,[[x-1.05,7.18,z+.95],[x-.65,7.18,z+.95],[x-.65,7.18,z+.70]],.12,enamel);
 for(let j=0;j<3;j++){const bx=x-1.19+j*.14;line(g,[[bx,6.78,z+.95],[bx,6.57,z+.95]],.035,black);cyl(g,.047,.075,[bx,6.79,z+.95],edge);}
 // Service face: dial, data plate, pressure fitting and drain.
 cyl(g,.095,.05,[x+.38,7.97,z+.77],edge,'z');cyl(g,.078,.055,[x+.38,7.97,z+.79],mat('#f5f1dc'),'z');line(g,[[x+.38,7.97,z+.821],[x+.41,8.015,z+.821]],.007,black);
 box(g,[.35,.25,.022],[x-.23,7.68,z+.751],edge);for(let j=0;j<6;j++)box(g,[.28,.007,.004],[x-.23,7.77-j*.032,z+.765],dark);
 line(g,[[x+.60,7.12,z+.70],[x+.60,7.12,z+.92]],.036,edge);cyl(g,.045,.07,[x+.60,7.17,z+.86],edge);box(g,[.18,.02,.04],[x+.6,7.22,z+.86],red);
 for(const dx of [-.76,.76]){const eye=mesh(g,new T.TorusGeometry(.07,.02,8,20),edge,[x+dx,8.43,z+.45]);}
 line(g,[[x-.72,7.04,z+.73],[x-.72,6.86,z+.97],[x-1.05,6.67,z+1.2]],.022,earth);
 label(name==='TE'?'TE · ELEVADOR 0.48 / 13.8 kV':'TP · PRINCIPAL 13.8 / 0.48 kV',[x,9.7,z+.98],2.7);
}
// Circuit-breaker assemblies inspired by the supplied photographs, with distinct input/output terminals.
for(const [name,x,z] of [['QG',18.4,1.3],['QN',17.9,-1.6],['QS',20.8,-.9]]){
 const g=subParts[name];g.clear();g.name='Interruptor de potencia '+name;
 const alloy=mat('#9aa8ad',.7),paint=mat('#647276',.45),ins=new T.MeshStandardMaterial({color:name==='QS'?'#624738':'#384847',roughness:.32,metalness:.03}),cab=mat('#a1a99c',.25);
 box(g,[1.65,.18,1.5],[x,6.75,z],concrete);
 // Bolted channel-steel frame and diagonal bracing.
 for(const dx of [-.66,.66])for(const dz of [-.49,.49]){
  box(g,[.25,.06,.25],[x+dx,6.88,z+dz],alloy);box(g,[.075,.88,.075],[x+dx,7.35,z+dz],alloy);
  for(const a of [-.08,.08])cyl(g,.019,.05,[x+dx+a,6.93,z+dz],steel);
 }
 for(const dz of [-.49,.49]){box(g,[1.5,.13,.12],[x,7.79,z+dz],alloy);line(g,[[x-.63,6.95,z+dz],[x+.63,7.70,z+dz]],.024,alloy);}
 for(const dx of [-.64,.64])box(g,[.12,.13,1.1],[x+dx,7.79,z],alloy);
 // Local mechanism cabinet mounted beneath the pole frame.
 box(g,[.61,.63,.33],[x,7.36,z+.60],cab);box(g,[.55,.56,.026],[x,7.36,z+.78],paint);
 for(const yy of [7.16,7.56])box(g,[.035,.095,.04],[x-.265,yy,z+.805],alloy);
 box(g,[.025,.16,.04],[x+.24,7.32,z+.805],black);
 proPlate(g,name+' / MANDO',[x,7.59,z+.80],.46,'#304650',.065);
 const closedLabel=proPlate(g,'I · CERRADO',[x,7.43,z+.806],.30,'#276850',.075);
 const openLabel=proPlate(g,'O · ABIERTO',[x,7.43,z+.808],.30,'#7e3834',.075);
 closedLabel.visible=false;g.userData.closedLabel=closedLabel;g.userData.openLabel=openLabel;
 breakerHandles[name]=box(g,[.055,.20,.035],[x-.15,7.23,z+.808],red);
 for(const dx of [.02,.12])cyl(g,.025,.023,[x+dx,7.24,z+.815],dx<.1?green:red,'z');
 proPlate(g,'MECANISMO',[x,7.09,z+.806],.40,'#415056',.055);
 proSign(g,'warning','RIESGO',[x+.02,7.82,z+.79],.18);
 // Cabinet detailing: gasket, folded rain hood, louvers and connection glands.
 for(const dx of [-.281,.281])box(g,[.012,.585,.012],[x+dx,7.36,z+.795],black);
 for(const yy of [7.068,7.652])box(g,[.57,.012,.012],[x,yy,z+.795],black);
 box(g,[.70,.04,.43],[x,7.70,z+.60],alloy);box(g,[.70,.055,.02],[x,7.675,z+.815],alloy);
 for(let k=0;k<6;k++)box(g,[.115,.012,.018],[x+.19,7.12+k*.024,z+.809],dark);
 for(const dx of [-.15,.15]){cyl(g,.032,.055,[x+dx,7.015,z+.60],alloy);line(g,[[x+dx,6.99,z+.6],[x+dx,6.88,z+.6],[x,6.88,z]],.018,black);}
 proPlate(g,'SE-01 / '+name,[x,7.55,z+.808],.27,'#7b8584',.033);
 for(const dx of [-.66,.66])for(const dz of [-.49,.49]){
  for(const xx of [-.045,.045])box(g,[.022,.85,.115],[x+dx+xx,7.35,z+dz],alloy);
  box(g,[.18,.18,.024],[x+dx,7.67,z+dz+.067],paint);
  for(const yy of [7.61,7.73])cyl(g,.016,.028,[x+dx,yy,z+dz+.091],steel,'z');
 }
 // One mechanical drive shaft actuates all three poles.
 line(g,[[x-.59,7.91,z],[x+.59,7.91,z]],.027,alloy);
 line(g,[[x,7.65,z+.60],[x,7.88,z+.60],[x,7.91,z]],.025,alloy);
 function bushing(px,base,tip){const a=new T.Vector3(...base),b=new T.Vector3(...tip),v=b.clone().sub(a),h=v.length(),pole=new T.Group();pole.position.copy(a);pole.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());g.add(pole);
  // Flanged foot, tapering insulator and smoothly profiled weather sheds.
  cyl(pole,.121,.14,[0,.07,0],alloy);cyl(pole,.134,.025,[0,.012,0],alloy);
  for(let k=0;k<8;k++){const t=k*Math.PI/4;mesh(pole,new T.CylinderGeometry(.012,.012,.028,6),steel,[Math.cos(t)*.112,.158,Math.sin(t)*.112]);}
  const pts=[new T.Vector2(.062,.14)],count=23,span=h-.25;
  for(let n=0;n<count;n++){const yy=.15+n*span/count,rr=(n%2?.097:.111)*(1-.13*n/count);pts.push(new T.Vector2(.058,yy),new T.Vector2(rr*.82,yy+.005),new T.Vector2(rr,yy+.012),new T.Vector2(rr,yy+.018),new T.Vector2(.058,yy+.029));}
  pts.push(new T.Vector2(.053,h-.07));mesh(pole,new T.LatheGeometry(pts,40),ins);
  cyl(pole,.077,.064,[0,h-.053,0],alloy);cyl(pole,.027,.06,[0,h-.018,0],copper);
  box(pole,[.16,.027,.12],[0,h,0],alloy);for(const xx of [-.052,.052]){cyl(pole,.021,.011,[xx,h+.018,0],alloy);mesh(pole,new T.CylinderGeometry(.014,.014,.035,6),steel,[xx,h+.036,0]);}

 }
 for(let j=0;j<3;j++){
  const px=x-.46+j*.46,terminalX=x-.32+j*.32;
  if(name!=='QS'){
   // Horizontal pole vessel with two outward-inclined terminal bushings.
   cyl(g,.158,.57,[px,8.05,z],paint,'z');
   for(const zz of [-.16,.16]){const band=mesh(g,new T.TorusGeometry(.160,.012,8,32),alloy,[px,8.05,z+zz]);}
   for(const side of [-1,1]){const cap=mesh(g,new T.SphereGeometry(.149,28,16),paint,[px,8.05,z+side*.29]);cap.scale.z=.27;}

   for(const side of [-1,1]){cyl(g,.167,.042,[px,8.05,z+side*.303],alloy,'z');for(let k=0;k<8;k++){const a=k*Math.PI/4;cyl(g,.012,.028,[px+Math.cos(a)*.140,8.05+Math.sin(a)*.140,z+side*.329],steel,'z');}bushing(px,[px,8.14,z+side*.18],[px,9,z+side*.50]);}
   for(const dz of [-.18,.18])box(g,[.13,.14,.09],[px,7.88,z+dz],paint);
  }else{
   // Vertical three-pole configuration, with a lower and upper connection.
   cyl(g,.104,.055,[px,7.88,z],alloy);bushing(px,[px,7.91,z],[px,9,z]);
   cyl(g,.113,.12,[px,8.47,z],alloy);
   line(g,[[px,9,z],[px,9,z+.5]],.024,copper);
   line(g,[[px,8.47,z],[px,8.47,z-.5],[px,9,z-.5]],.024,copper);
  }
  // The new phase spacing connects back to the actual circuit terminals.
  for(const side of [-1,1]){line(g,[[px,9,z+side*.5],[terminalX,9,z+side*.5]],.024,copper);box(g,[.13,.036,.10],[terminalX,9,z+side*.5],alloy);}
  proPlate(g,['L1','L2','L3'][j],[px,7.80,z+.567],.15,'#41545d',.055);
  line(g,[[px,7.91,z],[px,8.02,z]],.021,alloy);
 }
 line(g,[[x-.63,7.1,z+.49],[x-.63,6.78,z+.49],[x,6.70,z]],.018,earth);
 line(g,[[x,7.05,z+.60],[x,6.8,z+.60],[x,6.8,z]],.033,black);
 g.userData.breakerType=name==='QS'?'Tres polos verticales':'Tres cámaras · boquillas y bridas detalladas';
}

for(let j=0;j<3;j++){
 const y=9.46+j*.20,xG=18.08+j*.32,xS=20.48+j*.32,tx=23.87+j*.53;
 line(outdoor,[[12.8,9.12+j*.18,3.6+j*.13],[12.8,y,3.6+j*.13],[xG,y,3.6+j*.13],[xG,y,1.8],[xG,9.0,1.8]],.026,copper);
 line(outdoor,[[xS,9.0,-.4],[xS,9.4+j*.20,-.4],[tx,9.4+j*.20,-.9],[tx,9.4+j*.20,-.8],[tx,8.9,-.8]],.026,copper);
}

// Pórticos metálicos que soportan las barras, con zapatas y cartelas.
for(const z of [-4.6,.15]){for(const x of [18.4,20.8]){box(outdoor,[.55,.23,.55],[x,6.77,z],concrete);contactShadow(outdoor,x,6.656,z,.5,.5);box(outdoor,[.37,.045,.37],[x,6.92,z],zinc);box(outdoor,[.13,2.46,.16],[x,8.14,z],zinc);for(const dx of [-.13,.13])for(const dz of [-.13,.13])bolt(outdoor,x+dx,6.97,z+dz)}box(outdoor,[2.65,.14,.20],[19.6,9.32,z],zinc);line(outdoor,[[18.4,8.6,z],[19.05,9.32,z]],.032,zinc);line(outdoor,[[20.8,8.6,z],[20.15,9.32,z]],.032,zinc)}
// Cerramiento de malla romboidal, postes y puerta frontal.
const netCanvas=document.createElement('canvas');netCanvas.width=netCanvas.height=64;const nc=netCanvas.getContext('2d');nc.strokeStyle='#a4afb0';nc.lineWidth=2;nc.beginPath();nc.moveTo(32,0);nc.lineTo(64,32);nc.lineTo(32,64);nc.lineTo(0,32);nc.closePath();nc.stroke();const netTx=new T.CanvasTexture(netCanvas);netTx.wrapS=netTx.wrapT=T.RepeatWrapping;netTx.repeat.set(42,7);const netMat=new T.MeshStandardMaterial({map:netTx,transparent:true,alphaTest:.2,side:T.DoubleSide,metalness:.5,roughness:.6});
const fenceNet=new T.Group();outdoor.add(fenceNet);
mesh(fenceNet,new T.PlaneGeometry(18.2,2.15),netMat,[18.1,7.8,-8.6]);const sideNet=mesh(fenceNet,new T.PlaneGeometry(14.6,2.15),netMat,[27.2,7.8,-1.3]);sideNet.rotation.y=Math.PI/2;
for(let x=12;x<=25;x+=2.6){cyl(fenceSteel,.048,2.5,[x,7.78,-6],zinc);box(fenceSteel,[.3,.18,.3],[x,6.78,-6],concrete)}
for(const x of [21.7,24.5]){cyl(fenceSteel,.055,2.35,[x,7.8,4],zinc);box(fenceSteel,[.3,.18,.3],[x,6.77,4],concrete)}
for(const y of [6.8,8.8])line(fenceSteel,[[21.7,y,4],[24.5,y,4]],.035,zinc);line(fenceSteel,[[21.7,6.8,4],[24.5,8.8,4]],.024,zinc);const gate=mesh(fenceNet,new T.PlaneGeometry(2.8,2),netMat,[23.1,7.8,4]);label('ACCESO RESTRINGIDO · 13.8 kV',[23.1,8.2,4.04],2.2,'#896c16');
// Cierre del perímetro: paños frontal e izquierdo que faltaban (dejaban el TP y la esquina sin cercar) y paneles laterales del vano de acceso.
mesh(fenceNet,new T.PlaneGeometry(12.7,2.15),netMat,[15.35,7.8,6]);
mesh(fenceNet,new T.PlaneGeometry(2.7,2.15),netMat,[25.85,7.8,6]);
// Pedestrian maintenance access aligned with the stair route; gate is parked open in this scenario.
for(const [length,z]of [[.95,-8.125],[11.75,.125]]){const panel=mesh(fenceNet,new T.PlaneGeometry(length,2.15),netMat,[9,7.8,z]);panel.rotation.y=Math.PI/2;}
for(const z of [-7.65,-5.75])cyl(fenceSteel,.048,2.5,[9,7.8,z],zinc);
const maintenanceGate=new T.Group();fenceNet.add(maintenanceGate);maintenanceGate.name='Acceso peatonal de mantenimiento · abierto';maintenanceGate.position.set(9,0,-7.65);
mesh(maintenanceGate,new T.PlaneGeometry(1.90,2.15),netMat,[.95,7.8,0]);for(const y of [6.75,8.85])line(maintenanceGate,[[0,y,0],[1.90,y,0]],.025,zinc);for(const x of [0,1.90])line(maintenanceGate,[[x,6.75,0],[x,8.85,0]],.025,zinc);
const accessSign=label('PASO DE MANTENIMIENTO · ACCESO AUTORIZADO',[8.96,9.12,-6.70],2.3,'#315a52');accessSign.rotation.y=-Math.PI/2;

const gateSideA=mesh(fenceNet,new T.PlaneGeometry(2,2.15),netMat,[21.7,7.8,5]);gateSideA.rotation.y=Math.PI/2;
const gateSideB=mesh(fenceNet,new T.PlaneGeometry(2,2.15),netMat,[24.5,7.8,5]);gateSideB.rotation.y=Math.PI/2;
// Cerrojo y candado visibles en el poste derecho de la puerta de acceso (control de acceso NOM-001-SEDE/NOM-029-STPS).
box(fenceNet,[.16,.32,.05],[24.38,7.55,4.06],zinc);
box(fenceNet,[.15,.11,.06],[24.38,7.42,4.09],dark);
mesh(fenceNet,new T.TorusGeometry(.05,.015,8,20),zinc,[24.38,7.51,4.10]);
label('CIERRE CON CANDADO',[23.55,7.26,4.18],1.6,'#3b4f49');
for(const y of [6.8,7.4,8,8.7]){line(fenceSteel,[[9,y,6],[21.7,y,6]],.018,steel);line(fenceSteel,[[24.5,y,6],[27.2,y,6]],.018,steel);line(fenceSteel,[[9,y,-8.6],[9,y,-7.65]],.018,steel);line(fenceSteel,[[9,y,-5.75],[9,y,6]],.018,steel)}
for(let x=9;x<21.7;x+=.45)line(fenceSteel,[[x,6.7,6],[x,8.7,6]],.009,steel);
for(let x=24.5;x<27.2;x+=.45)line(fenceSteel,[[x,6.7,6],[x,8.7,6]],.009,steel);
for(let z=-8.6;z<6;z+=.45)if(z<=-7.65||z>=-5.75)line(fenceSteel,[[9,6.7,z],[9,8.7,z]],.009,steel);


// Bahía exterior de llegada, inspirada en la referencia del usuario.
const referenceParts={};
function assembly(key){const g=new T.Group();outdoor.add(g);referenceParts[key]=g;return g}
function stand(g,x,z,h=1.7,w=1.7){box(g,[w+.35,.22,1.05],[x,6.79,z],concrete);for(const dx of [-w/2,w/2]){box(g,[.12,h,.13],[x+dx,6.91+h/2,z],zinc);box(g,[.3,.045,.3],[x+dx,6.93,z],zinc);for(const dz of [-.10,.10])bolt(g,x+dx,6.97,z+dz)}box(g,[w+.2,.12,.55],[x,6.94+h,z],zinc);line(g,[[x-w/2,7.1,z],[x+w/2,6.94+h,z]],.027,zinc);line(g,[[x+w/2,7.1,z],[x-w/2,6.94+h,z]],.027,zinc)}
function insulator(g,x,y,z,h=.75){cyl(g,.075,h,[x,y+h/2,z],porcelain);for(let k=0;k<8;k++)cyl(g,.13,.037,[x,y+.055+k*h/8,z],porcelain);cyl(g,.085,.05,[x,y+h+.025,z],zinc)}
const gantry=assembly('gantry');
for(const x of [12.2,16.1]){box(gantry,[.8,.3,.8],[x,6.85,-4.85],concrete);for(const dx of [-.19,.19])for(const dz of [-.19,.19]){box(gantry,[.055,4.6,.055],[x+dx,9.28,-4.85+dz],zinc);bolt(gantry,x+dx,7.04,-4.85+dz)}for(let y=7.05;y<11.2;y+=.55){line(gantry,[[x-.19,y,-4.66],[x+.19,y+.55,-4.66]],.018,zinc);line(gantry,[[x+.19,y,-5.04],[x-.19,y+.55,-5.04]],.018,zinc);box(gantry,[.45,.035,.45],[x,y,-4.85],zinc)}}
box(gantry,[4.5,.18,.28],[14.15,11.58,-4.85],zinc);
for(let j=0;j<3;j++){
  const x=13.1+j*.95;
  insulator(gantry,x,10.7,-4.85,.7);
  const c=new T.CatmullRomCurve3([new T.Vector3(x,10.72,-4.85),new T.Vector3(x,10.4,-6.8),new T.Vector3(x,10.8,-8)]);
  mesh(gantry,new T.TubeGeometry(c,24,.022,8,false),dark);
  // Bajante posterior más limpia desde el pórtico hacia la barra/seccionador.
  line(gantry,[[x,10.7,-4.85],[x,10.15,-4.85],[x,10.15,-3.6],[x,9.55,-3.6]],.022,copper)
}
label('01 · PÓRTICO DE LLEGADA',[14.15,12.05,-4.6],2.8);
const disconnect=assembly('disconnect');stand(disconnect,14.05,-3.5,1.65,2.5);
for(let j=0;j<3;j++){
  const x=13.1+j*.95;
  for(const z of [-3.7,-3.15])insulator(disconnect,x,8.67,z,.66);
  // Hoja del seccionador y barra corta posterior alineadas.
  line(disconnect,[[x,9.38,-3.7],[x,9.38,-3.15]],.036,copper);
  line(disconnect,[[x,9.55,-3.6],[x,9.38,-3.6]],.024,copper)
}
line(disconnect,[[12.7,7.25,-3.5],[12.7,8.55,-3.5],[15.15,8.55,-3.5]],.027,zinc);box(disconnect,[.12,.30,.10],[12.7,7.5,-3.45],dark);label('02 · SECCIONADOR',[14.75,9.95,1.3],2.2);
const surge=assembly('surge');stand(surge,11.65,-2.35,1.05,1.2);
for(let j=0;j<3;j++){
  const x=10.85+j*.78;
  insulator(surge,x,7.85,-2.35,.88);
  box(surge,[.13,.06,.13],[x,8.74,-2.35],zinc);
  // Derivación superior del apartarrayos desde la llegada MT, claramente conectada y separada.
  line(surge,[[13.1+j*.95,9.38,-3.60],[13.1+j*.95,9.02,-3.60],[x,9.02,-3.60],[x,9.02,-2.35],[x,8.75,-2.35]],.018,copper);
  // Bajante de puesta a tierra individual para cada apartarrayos.
  line(surge,[[x,7.84,-2.35],[x,6.95,-2.35],[x,6.95,-2.95],[11.6,6.70,-2.95]],.014,earth)
}
label('03 · APARTARRAYOS',[10.9,9.22,-1.15],1.8);
// Instrument transformers: shaped insulation, bolted flanges and accessible secondary boxes.
const instrumentPorcelain=new T.MeshStandardMaterial({color:'#4b2830',roughness:.24,metalness:.02});
const instrumentResin=new T.MeshStandardMaterial({color:'#714b35',roughness:.32,metalness:.02});
const instrumentMetal=new T.MeshStandardMaterial({color:'#b4bec3',metalness:.70,roughness:.36});
function instrumentHousing(g,w,h,d,p,m){const r=Math.min(.045,w*.15,h*.15),sh=new T.Shape();sh.moveTo(-w/2+r,-h/2);sh.lineTo(w/2-r,-h/2);sh.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);sh.lineTo(w/2,h/2-r);sh.quadraticCurveTo(w/2,h/2,w/2-r,h/2);sh.lineTo(-w/2+r,h/2);sh.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);sh.lineTo(-w/2,-h/2+r);sh.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const geo=new T.ExtrudeGeometry(sh,{depth:d,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:3,curveSegments:8});geo.translate(0,0,-d/2);return mesh(g,geo,m,p);}
function instrumentColumn(g,x,y,z,h,r=.09){const pts=[new T.Vector2(r*.59,0)];const count=16;for(let n=0;n<count;n++){const yy=.035+n*(h-.07)/count,rr=r*(n%2?.90:1.06);pts.push(new T.Vector2(r*.59,yy),new T.Vector2(rr*.85,yy+.006),new T.Vector2(rr,yy+.012),new T.Vector2(rr,yy+.019),new T.Vector2(r*.59,yy+.029));}pts.push(new T.Vector2(r*.57,h));mesh(g,new T.LatheGeometry(pts,40),instrumentPorcelain,[x,y,z]);}
function instrumentFlange(g,x,y,z,r){cyl(g,r,.035,[x,y,z],instrumentMetal);for(let k=0;k<8;k++){const a=k*Math.PI/4;mesh(g,new T.CylinderGeometry(.009,.009,.022,6),steel,[x+Math.cos(a)*r*.8,y+.025,z+Math.sin(a)*r*.8]);}}
function secondaryBox(g,x,y,z,code){instrumentHousing(g,.22,.24,.12,[x,y,z],instrumentMetal);box(g,[.197,.214,.012],[x,y,z+.069],mat('#d1d5cf',.3));for(const dx of [-.078,.078])for(const dy of [-.085,.085])cyl(g,.009,.012,[x+dx,y+dy,z+.079],steel,'z');proPlate(g,code,[x,y+.037,z+.086],.155,'#344a54',.047);proPlate(g,'SECUNDARIO',[x,y-.035,z+.086],.169,'#485963',.028);for(const dx of [-.044,.044]){cyl(g,.020,.042,[x+dx,y-.14,z],steel);line(g,[[x+dx,y-.162,z],[x+dx,y-.21,z],[x,y-.25,z]],.011,black);}return [x,y-.25,z];}
const ct=assembly('ct');stand(ct,18.3,-4.65,1.0,1.8);
for(let j=0;j<3;j++){
  const x=17.65+j*.65;
  const zz=-4.65;
  box(ct,[.36,.06,.34],[x,7.99,zz],instrumentMetal);
  for(const dx of [-.13,.13])for(const dz of [-.12,.12])cyl(ct,.014,.034,[x+dx,8.038,zz+dz],steel);
  cyl(ct,.088,.095,[x,8.07,zz],instrumentMetal);instrumentFlange(ct,x,8.105,zz,.117);
  instrumentColumn(ct,x,8.13,zz,.39,.105);instrumentFlange(ct,x,8.55,zz,.115);
  instrumentHousing(ct,.29,.30,.29,[x,8.73,zz],instrumentResin);
  for(const dx of [-.115,.115])for(let n=0;n<3;n++)instrumentHousing(ct,.023,.27,.30,[x+dx+(n-1)*.020,8.73,zz],instrumentResin);
  for(const side of [-1,1]){box(ct,[.105,.045,.12],[x+side*.17,8.73,zz],instrumentMetal);for(const dz of [-.036,.036]){cyl(ct,.012,.047,[x+side*.18,8.763,zz+dz],steel);}}
  proPlate(ct,'P1',[x-.091,8.75,zz+.164],.059,'#503b31',.031);proPlate(ct,'P2',[x+.091,8.75,zz+.164],.059,'#503b31',.031);
  proPlate(ct,'TC-'+(j+1),[x,8.66,zz+.164],.14,'#c0c5bf',.035);
  secondaryBox(ct,x,8.05,zz+.26,'S1 / S2');
  line(ct,[[x,7.80,zz+.26],[x,7.80,zz],[x,6.8,zz]],.027,instrumentMetal);
  line(ct,[[x+.13,8.02,zz],[x+.13,6.77,zz],[x,6.77,zz]],.014,earth);

  // Ruta posterior corregida: llega recta desde seccionador, cruza el TC y luego avanza limpia hacia QN.
  line(ct,[[13.1+j*.95,9.38,-3.15],[13.1+j*.95,9.68+j*.23,-3.15],[x-.18,9.68+j*.23,-3.15],[x-.18,9.68+j*.23,-4.65],[x-.18,8.73,-4.65],[x+.18,8.73,-4.65],[x+.18,9.5+j*.23,-4.65],[x+.18,9.5+j*.23,-2.7],[17.58+j*.32,9.5+j*.23,-2.7],[17.58+j*.32,9.5+j*.23,-2.1],[17.58+j*.32,9,-2.1]],.020,copper);
  line(ct,[[x,8.05,-4.65],[x,6.8,-4.65],[20.9,6.8,-4.65]],.012,mat('#ba974f'))
}label('04 · TC · CORRIENTE',[18.8,9.5,-7.1],2.0);
const vt=assembly('vt');stand(vt,19.95,-3.75,.70,1.5);
const vtTapZ=-3.52,vtTapY=9.02;
for(let j=0;j<3;j++){
  const x=19.45+j*.5;
  const zz=-3.75;
  box(vt,[.39,.055,.38],[x,7.705,zz],instrumentMetal);
  for(const dx of [-.15,.15])for(const dz of [-.14,.14])cyl(vt,.012,.036,[x+dx,7.75,zz+dz],steel);
  instrumentHousing(vt,.26,.16,.26,[x,7.81,zz],instrumentMetal);
  mesh(vt,new T.CylinderGeometry(.083,.125,.11,32),instrumentMetal,[x,7.925,zz]);
  instrumentFlange(vt,x,7.98,zz,.116);instrumentColumn(vt,x,8.01,zz,.40,.113);
  instrumentFlange(vt,x,8.445,zz,.12);
  cyl(vt,.116,.18,[x,8.55,zz],mat('#8d3d42',.35));
  cyl(vt,.124,.027,[x,8.647,zz],instrumentMetal);cyl(vt,.022,.045,[x,8.682,zz],copper);
  box(vt,[.12,.025,.075],[x,8.705,zz],instrumentMetal);for(const dx of [-.04,.04])cyl(vt,.011,.025,[x+dx,8.729,zz],steel);
  proPlate(vt,'TP-M'+(j+1),[x,8.555,zz+.119],.13,'#9b4546',.040);
  secondaryBox(vt,x,7.80,zz+.23,'a / n');
  line(vt,[[x,7.55,zz+.23],[x,7.5,zz+.23],[x,7.5,zz],[x,6.8,zz]],.025,instrumentMetal);
  line(vt,[[x+.14,7.74,zz],[x+.14,6.77,zz],[x,6.77,zz]],.014,earth);

  // Derivación de tensión refinada: ruta ortogonal y bajada centrada sobre cada TP.
  line(vt,[[19.55+j*.18,9.75+j*.22,mainBusZ[j]],[19.55+j*.18,9.75+j*.22,vtTapZ],[x,9.75+j*.22,vtTapZ],[x,vtTapY,vtTapZ],[x,8.7,-3.75]],.018,copper);
  line(vt,[[x,7.78,-3.75],[x,6.8,-3.75],[20.9,6.8,-4.65]],.012,mat('#ba974f'))
}label('05 · TP MEDIDA · TENSIÓN',[20.25,9.55,-4.22],1.8);

const measureTrunk=new T.Group();outdoor.add(measureTrunk);
line(measureTrunk,roundedRoute([[20.9,6.8,-4.65],[22.7,6.8,-4.65],[22.7,6.8,-5.4],[22.7,7.20,-5.4],[22.78,7.20,-5.4]],.12),.045,instrumentMetal);
box(measureTrunk,[.20,.26,.18],[20.9,6.92,-4.65],instrumentMetal);
for(const xx of [21.2,21.8,22.4])box(measureTrunk,[.06,.12,.12],[xx,6.77,-4.65],steel);
// Caseta posterior dentro del patio; mantiene libre el acceso frontal a los equipos.
const house=assembly('house');box(house,[3.5,.25,1.75],[22.8,6.85,-4.65],concrete);box(house,[3.3,2.45,1.6],[22.8,8.18,-4.65],mat('#8b9490'));box(house,[3.55,.17,1.85],[22.8,9.48,-4.65],concrete);house.position.x+=1.6;house.position.z+=-0.75;
for(const x of [22.32,23.22]){box(house,[.86,2.03,.05],[x,7.96,-3.83],sheet);box(house,[.025,.22,.05],[x+.28,7.96,-3.78],black);for(const y of [7.25,8.6])box(house,[.065,.14,.07],[x-.35,y,-3.78],zinc)}
for(let j=0;j<12;j++)box(house,[.4,.027,.06],[21.46,8.23+j*.065,-3.81],dark);label('06 · CASETA DE CONTROL',[24.4,9.88,-4.53],2.6);label('RIESGO ELÉCTRICO',[22.8,8.59,-3.765],1.1,'#896c16');
// D24: panel de protección con puerta sellada, herrajes y anclajes.
const relay=assembly('relay');
const relayPaint=new T.MeshPhysicalMaterial({color:'#35464a',metalness:.12,roughness:.45,clearcoat:.28,clearcoatRoughness:.32});relayPaint.userData.hdFinish='paint';
const relayShell=new T.MeshPhysicalMaterial({color:'#b6c0bd',metalness:.18,roughness:.42,clearcoat:.22});relayShell.userData.hdFinish='paint';
const relaySeal=mat('#171e20'),relaySteel=mat('#9aa9ac',.9);
box(relay,[.84,.20,.69],[20.45,6.8,.6],concrete);
box(relay,[.67,.055,.47],[20.45,6.93,.6],relaySteel);
// Envolvente plegada: lados, respaldo y vierteaguas superior.
for(const dx of [-.311,.311])box(relay,[.022,1.36,.43],[20.45+dx,7.64,.6],relayShell);
box(relay,[.62,1.36,.02],[20.45,7.64,.395],relayShell);
box(relay,[.68,.035,.49],[20.45,8.337,.615],relayShell);
box(relay,[.65,.026,.045],[20.45,8.312,.85],relayShell);
cabinetSkin20(relay,.595,1.315,.023,[20.45,7.64,.814],relaySeal,.012);
cabinetSkin20(relay,.571,1.287,.025,[20.45,7.64,.834],relayPaint,.012);
for(const yy of [7.17,7.64,8.11]){box(relay,[.026,.10,.032],[20.151,yy,.85],relaySteel);cyl(relay,.009,.108,[20.151,yy,.85],relaySteel);}
// Pantalla empotrada con bisel, rotulación y tornillos.
cabinetSkin20(relay,.365,.277,.017,[20.45,7.99,.858],relaySeal,.015);
cabinetSkin20(relay,.332,.244,.012,[20.45,7.99,.871],mat('#6b7d81',.65),.009);
cabinetSkin20(relay,.286,.177,.008,[20.45,8.005,.88],mat('#092b32',.12),.004);
cabinetLabel20(relay,'RELÉ · PROTECCIÓN',[20.45,8.17,.857],.32,.043);
cabinetLabel20(relay,'MEDICIÓN / MANDO',[20.45,7.875,.886],.24,.034,'#aabebc','#1b2b30');
for(const dx of [-.151,.151])for(const yy of [7.894,8.086])cabinetFastener20(relay,[20.45+dx,yy,.885]);
for(let i=0;i<3;i++)for(let j=0;j<2;j++){const p=[20.31+i*.14,7.65-j*.14,.861];cyl(relay,.034,.014,p,relaySteel,'z');cyl(relay,.028,.022,[p[0],p[1],.877],relaySeal,'z');cyl(relay,.021,.01,[p[0],p[1],.892],i===0?red:dark,'z');}
for(let i=0;i<3;i++)cabinetLabel20(relay,['PARO','MODO','MANDO'][i],[20.31+i*.14,7.705,.854],.108,.031);
// Cerradura y manija; rejilla lateral protegida bajo el pliegue.
cyl(relay,.023,.013,[20.674,7.29,.86],relaySteel,'z');box(relay,[.012,.095,.022],[20.674,7.24,.88],relaySteel);
for(let k=0;k<7;k++)box(relay,[.024,.012,.18],[20.774,7.23+k*.032,.58],relaySeal);
for(const xx of [20.10,20.80])for(const zz of [.35,.85]){cyl(relay,.027,.006,[xx,6.906,zz],relaySteel);cyl(relay,.014,.023,[xx,6.919,zz],relaySteel);}
cabinetLabel20(relay,'PR-01 / PROTECCIÓN MT',[20.45,7.105,.855],.38,.052);
label('07 · PROTECCIÓN Y MANDO',[21.1,8.95,2.19],2.1);relay.position.x+=0.65;relay.position.z+=1.3;
line(relay,[[20.45,7.0,.6],[20.45,6.83,.6],[20.45,6.83,-1.4],[20.9,6.83,-3.35],[20.9,6.83,-3.8],[20.9,7.4,-3.8]],.02,black);
// Sistema de puesta a tierra: retícula de cobre enterrada en el suelo natural (bajo la subbase y la grava), con varillas, registros y bajantes propias por equipo.
const groundSystem=assembly('ground');
// Vertical scale: 1 scene unit = 1 m. Reference: top of finished gravel.
const groundSurfaceY=6.61+.08/2,groundCover=.75,groundHalfThickness=.025;
const gridY=groundSurfaceY-groundCover-groundHalfThickness;
groundSystem.userData.depth={surfaceY:groundSurfaceY,cover:groundCover,axisY:gridY,topY:gridY+groundHalfThickness,units:'m'};
const gridXs=[9,12.6,16.2,19.8,23.4,27],gridZs=[-8.4,-4.8,-1.2,2.4,6];
for(const x of gridXs)line(groundSystem,[[x,gridY,gridZs[0]],[x,gridY,gridZs[gridZs.length-1]]],.022,copper);
for(const z of gridZs)line(groundSystem,[[gridXs[0],gridY,z],[gridXs[gridXs.length-1],gridY,z]],.022,copper);
for(const x of gridXs)for(const z of gridZs)box(groundSystem,[.09,.05,.09],[x,gridY,z],dark);
for(const x of [gridXs[0],gridXs[gridXs.length-1]])for(const z of [gridZs[0],gridZs[gridZs.length-1]])cyl(groundSystem,.028,.55,[x,gridY-.27,z],rodMat);
for(const [x,z] of [[9.3,5.7],[26.7,5.7],[9.3,-8.1],[26.7,-8.1]]){box(groundSystem,[.32,.12,.32],[x,6.7,z],concrete);cyl(groundSystem,.04,6.7-gridY,[x,(6.7+gridY)/2,z],copper);line(groundSystem,[[x,gridY,z],[x<18?9:27,gridY,z]],.022,copper);box(groundSystem,[.23,.025,.23],[x,6.77,z],dark)}
label('08 · MALLA DE TIERRA',[12.4,7.28,3.6],2.2);
function groundBond(x,z,fromY=6.72){line(groundSystem,[[x,fromY,z],[x,gridY,z],[gridXs.reduce((a,b)=>Math.abs(b-x)<Math.abs(a-x)?b:a),gridY,z]],.020,earth);box(groundSystem,[.07,.03,.07],[x,gridY+.01,z],dark)}
groundBond(11.6,3.9);groundBond(24.4,-.5);groundBond(18.4,1.3);groundBond(17.9,-1.6);groundBond(20.8,-.9);groundBond(11.65,-2.35);groundBond(18.3,-4.65);groundBond(19.95,-3.75);groundBond(21.1,1.9);groundBond(24.4,-5.4);groundBond(12.2,-4.85);groundBond(16.1,-4.85);
for(const x of [12,14.6,17.2,19.8,22.4,25])groundBond(x,-6,6.78);
for(const x of [21.7,24.5])groundBond(x,4,6.77);
// Zonificación de la subestación: rótulos flotantes sobre cada zona funcional.
label('ZONA A · LLEGADA',[12.6,13,-.5],2.6,'#2c4a46');
label('ZONA B · PROTECCIÓN Y MANIOBRA',[18.1,10.8,0],3.4,'#2c4a46');
label('ZONA C · BARRAS 13.8 kV',[19.5,11,-1],2.7,'#2c4a46');
label('ZONA D · TRANSFORMACIÓN',[11.6,9.6,3.9],2.9,'#2c4a46');
label('ZONA D · TRANSFORMACIÓN',[24.4,9.35,-.5],2.9,'#2c4a46');
label('ZONA E · SALIDAS / ALIMENTADORES',[24.2,9.5,.6],3.3,'#2c4a46');
label('ZONA F · CONTROL Y MEDICIÓN',[21.1,10.2,2.2],3.1,'#2c4a46');
// Complementos constructivos y de señalización normalizada para reforzar el realismo de la subestación.
const civilAdd=new T.Group(),safetyAdd=new T.Group();outdoor.add(civilAdd,safetyAdd);
// Cubetos de contención y franjas de mantenimiento alrededor de transformadores.
for(const [x,z] of [[11.6,3.9],[24.4,-.5]]){
  const curb=mat('#9ca3a6',.12),hazY=mat('#d4be41'),hazK=mat('#232323');
  box(civilAdd,[3.55,.18,.12],[x,6.85,z-1.78],curb);box(civilAdd,[3.55,.18,.12],[x,6.85,z+1.78],curb);
  box(civilAdd,[.12,.18,3.55],[x-1.78,6.85,z],curb);box(civilAdd,[.12,.18,3.55],[x+1.78,6.85,z],curb);
  for(let i=0;i<16;i++){const xx=x-1.52+i*.2;box(civilAdd,[.10,.016,.12],[xx,6.705,z-2.03],i%2?hazY:hazK);box(civilAdd,[.10,.016,.12],[xx,6.705,z+2.03],i%2?hazY:hazK)}
  for(let i=0;i<16;i++){const zz=z-1.52+i*.2;box(civilAdd,[.12,.016,.10],[x-2.03,6.705,zz],i%2?hazY:hazK);box(civilAdd,[.12,.016,.10],[x+2.03,6.705,zz],i%2?hazY:hazK)}
  label('CUBETO DE CONTENCIÓN',[x,7.22,z+2.18],1.9,'#4f585a');
}
// Pasillo peatonal técnico más definido y flechas direccionales.
box(civilAdd,[8.2,.02,.70],[17.3,6.70,4.72],mat('#d8ddd9'));
for(const x of [13.6,16.6,19.6])label('→',[x,6.81,4.72],.55,'#3b4f49').rotation.x=-Math.PI/2;
label('ACCESO TÉCNICO',[17.3,6.82,5.22],2.1,'#3b4f49').rotation.x=-Math.PI/2;
// Pórticos y arriostres adicionales para completar la imagen estructural.
for(const x of [15.9,22.9]){for(const z of [-2.1,1.25]){box(civilAdd,[.16,2.2,.16],[x,8.05,z],zinc);box(civilAdd,[.46,.06,.46],[x,6.86,z],concrete);for(const dx of [-.11,.11])for(const dz of [-.11,.11])bolt(civilAdd,x+dx,6.98,z+dz)}box(civilAdd,[.18,.18,3.55],[x,9.06,-.42],zinc);line(civilAdd,[[x,8.2,-2.1],[x,9.06,-1.2]],.03,zinc);line(civilAdd,[[x,8.2,1.25],[x,9.06,.35]],.03,zinc)}
// Mástiles de iluminación / apantallamiento para dar escala industrial.
for(const [x,z] of [[10.9,-7.55],[26.2,5.25]]){box(civilAdd,[.42,.20,.42],[x,6.77,z],concrete);cyl(civilAdd,.075,4.1,[x,8.95,z],zinc);for(const dx of [-.22,.22])for(const dz of [-.22,.22])bolt(civilAdd,x+dx,6.88,z+dz);box(civilAdd,[.55,.12,.12],[x,10.95,z],zinc);for(const side of [-1,1]){box(civilAdd,[.18,.12,.18],[x+side*.22,10.95,z],mat('#e7ecdc'));const beam=line(civilAdd,[[x,10.95,z],[x+side*.22,10.95,z]],.018,dark)}}
// Señalización normalizada sobre la cerca y en equipos críticos.
label('PELIGRO · ALTA TENSIÓN 13.8 kV',[15.1,8.9,-8.38],2.2,'#896c16');
label('USO OBLIGATORIO DE EPP',[19.2,8.9,-8.38],2.2,'#2f5b91');
label('PROHIBIDO EL PASO',[23.5,8.9,-8.38],2.0,'#9a2323');
label('DESCARGA A TIERRA',[10.4,7.45,-1.1],1.45,'#4b6b2b');
label('APARTARRAYOS',[10.4,9.45,-1.1],1.35,'#896c16');
label('CELDAS MT',[18.9,9.88,1.05],1.5,'#896c16');
label('TRANSFORMADOR ELEVADOR',[11.6,10.15,6.1],2.4,'#896c16');
label('TRANSFORMADOR PRINCIPAL',[24.4,9.95,2.0],2.4,'#896c16');
label('MALLA DE TIERRA ENTERRADA',[18.1,7.35,6.0],2.7,'#4b6b2b');
// Demarcación rojo/blanco de punto de emergencia junto al acceso.
for(let i=0;i<8;i++)box(safetyAdd,[.22,.02,.22],[23.1-0.77+i*.22,6.705,4.95],i%2?mat('#ffffff') : red);
label('PUNTO DE EMERGENCIA',[23.1,6.80,5.42],1.8,'#9a2323').rotation.x=-Math.PI/2;
// Señalización de parada de emergencia y ruta de salida en el sótano técnico.
label('PARO DE EMERGENCIA',[5.15,2.2,5.78],1.65,'#9a2323');
label('SALIDA / RUTA DE EVACUACIÓN →',[-3.8,2.15,5.78],2.35,'#2f7c52');
for(let i=0;i<10;i++)box(site,[.20,.012,.10],[-5.1+i*.24,.02,5.15],i%2?mat('#ffffff'):mat('#2f7c52'));
// Señalización normalizada 3D: tableros con colores y pictogramas estándar (amarillo/negro riesgo eléctrico, azul EPP, rojo/blanco prohibición, verde tierra), montados en poste — no solo texto flotante.
function signTexture(kind){const cv=document.createElement('canvas');cv.width=cv.height=256;const cx=cv.getContext('2d');
  if(kind==='voltage'){cx.fillStyle='#f4c518';cx.beginPath();cx.moveTo(128,16);cx.lineTo(246,232);cx.lineTo(10,232);cx.closePath();cx.fill();cx.lineWidth=16;cx.strokeStyle='#111';cx.stroke();cx.fillStyle='#111';cx.beginPath();cx.moveTo(150,66);cx.lineTo(96,152);cx.lineTo(128,152);cx.lineTo(102,204);cx.lineTo(166,124);cx.lineTo(132,124);cx.closePath();cx.fill();}
  else if(kind==='ppe'){cx.fillStyle='#1c5fa8';cx.beginPath();cx.arc(128,128,116,0,6.2832);cx.fill();cx.strokeStyle='#fff';cx.lineWidth=8;cx.stroke();cx.fillStyle='#fff';cx.font='bold 92px system-ui';cx.textAlign='center';cx.textBaseline='middle';cx.fillText('EPP',128,136);}
  else if(kind==='noentry'){cx.fillStyle='#fff';cx.fillRect(0,0,256,256);cx.strokeStyle='#a11';cx.lineWidth=20;cx.beginPath();cx.arc(128,128,102,0,6.2832);cx.stroke();cx.beginPath();cx.moveTo(64,64);cx.lineTo(192,192);cx.stroke();}
  else if(kind==='ground'){cx.fillStyle='#2f7c3a';cx.fillRect(0,0,256,256);cx.strokeStyle='#fff';cx.lineWidth=11;cx.beginPath();cx.moveTo(128,42);cx.lineTo(128,140);cx.moveTo(68,140);cx.lineTo(188,140);cx.moveTo(86,176);cx.lineTo(170,176);cx.moveTo(102,208);cx.lineTo(154,208);cx.stroke();}
  const tx=new T.CanvasTexture(cv);tx.colorSpace=T.SRGBColorSpace;return tx}
function safetySign(parent,x,z,kind,rotY=0,h=1.85){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotY;parent.add(g);mesh(g,new T.CylinderGeometry(.035,.035,h,10),zinc,[0,6.72+h/2,0]);const arm=mesh(g,new T.BoxGeometry(.11,.03,.09),zinc,[0,6.72+h-.05,.05]);const backing=mesh(g,new T.BoxGeometry(.56,.56,.014),black,[0,6.72+h-.05,.10]);const board=mesh(g,new T.BoxGeometry(.5,.5,.02),new T.MeshStandardMaterial({map:signTexture(kind),roughness:.5,metalness:.05}),[0,6.72+h-.048,.112]);return board}
// Señales espaciadas solo en zonas despejadas (cerca perimetral y pasillo técnico); se evita colocarlas junto a celdas, transformadores o barras para no amontonar el detalle constructivo.
safetySign(safetyAdd,15.1,-8.15,'voltage',0);



// Señales junto a cada transformador, ancladas en la esquina libre fuera del cubeto de contención y la franja de peligro, sin invadir el equipo.
safetySign(safetyAdd,13.5,6.15,'voltage',0,1.6);
safetySign(safetyAdd,26.3,1.7,'voltage',Math.PI,1.6);

function updateFloatingLabels(showDetailed=false){
  const mainMatchers=['TRANSFORMADOR ELEVADOR','TRANSFORMADOR PRINCIPAL','BARRA EXTERIOR 13.8 kV','02 · SECCIONADOR','03 · APARTARRAYOS','04 · TC · CORRIENTE','05 · TP MEDIDA · TENSIÓN','CELDAS MT','06 · CASETA DE CONTROL'];
  for(const m of sceneLabels){
    const t=m.userData.labelText||'';
    const keepMain=mainMatchers.some(k=>t.includes(k));
    m.visible=showDetailed;
  }
}
const refFocus={gantry:[[14.1,9.5,-4.6],12,'Pórtico de llegada','Sostiene los aisladores y los conductores de la acometida. Las tres líneas representan las fases de la red de 13.8 kV.'],disconnect:[[14.05,8.5,-3.5],8,'Seccionador de aislamiento','Permite reconocer una separación visible del circuito. En este modelo permanece cerrado; no se ofrece como interruptor de carga. La transferencia la ejecutan QN y QG.'],surge:[[11.65,8,-2.35],6,'Apartarrayos','Conectados entre fase y tierra, limitan sobretensiones. No transportan normalmente la potencia de la carga. El modelo muestra sus conexiones; no calcula impulsos de descarga.'],ct:[[18.3,8.6,-4.65],7,'Transformadores de corriente (TC)','Entregan una señal reducida de corriente a medición y protección. Aquí están en la llegada de red; no representan la corriente del generador cuando QN está abierto. Sus secundarios se muestran como cables de señal.'],vt:[[19.95,8.2,-3.75],7,'Transformadores de potencial para medida','Toman una muestra de la tensión de la barra. No son el transformador principal TP que alimenta las cargas: cumplen una función de medida. No se han definido relaciones de medida ni clases de precisión.'],house:[[24.4,8.2,-5.4],9,'Caseta de control','Aloja equipos de mando y supervisión, separados del patio de potencia. Se representa su envolvente; el interior no tiene despiece en esta versión.'],relay:[[21.1,7.8,1.9],5,'Gabinete de protección y mando','Los relés reciben señales de corriente y tensión y pueden ordenar una apertura. Las fallas existentes mantienen el modelo simplificado del simulador; no se calcula coordinación de protecciones.'],ground:[[18.1,6.9,-1.3],20,'Sistema de puesta a tierra de la subestación','Función: une eléctricamente las partes metálicas normalmente sin tensión (estructuras, tanques, gabinetes, cerca) a una referencia común de tierra, para que una falla no eleve su potencial y para dar una vía de baja impedancia a la corriente de falla. Materiales representados: conductor de cobre desnudo en retícula, uniones/soldaduras en los cruces, varillas o electrodos verticales y registros de inspección de concreto. Trayectoria: una malla rectangular bajo todo el patio, con varillas en las cuatro esquinas y bajantes individuales desde cada transformador, seccionador, apartarrayos, TC, TP, interruptor, caseta, gabinete de protección y la cerca perimetral. Profundidad configurada: 75 cm mínimos desde la cara superior del suelo terminado (grava) hasta la parte superior de la malla y sus uniones. El eje queda 77.5 cm bajo esa superficie para conservar el recubrimiento. Las bajantes y registros llegan a esa misma cota. Equipos conectados: se listan arriba; cada uno tiene su propio bajante hasta la malla, visible en la vista subterránea. Propósito de seguridad: busca reducir las tensiones de paso y de contacto durante una falla, igualando el potencial del suelo que pisa una persona con el de los equipos que podría tocar. Se instala enterrada bajo el patio —y no expuesta— para no estorbar la operación, protegerse de daño mecánico y de la intemperie, y mantener uniforme el potencial de toda el área. Este modelo no calcula resistencia de tierra, corrientes de falla ni tensiones de paso/contacto: es una representación educativa de la disposición típica, no un diseño de malla de tierra.']};
function focusReference(key){const a=refFocus[key];if(!a)return;cameraPreset('outside');$('hideTerrain').checked=key==='ground';campusNav.target.set(...a[0]);distance=a[1];angle=-.55;elevation=key==='ground'?.85:.37;$('referenceInfo').innerHTML='<h3>'+a[2]+'</h3><p>'+a[3]+'</p>';for(const [k,g]of Object.entries(referenceParts))g.traverse(m=>{if(m.isMesh){if(!m.userData.baseMaterial)m.userData.baseMaterial=m.material;if(k===key){if(!m.userData.focusMaterial){m.userData.focusMaterial=m.material.clone();if(m.userData.focusMaterial.emissive)m.userData.focusMaterial.emissive.set('#153b36')}m.material=m.userData.focusMaterial}else m.material=m.userData.baseMaterial}})}

// Tres rutas eléctricas y flujos auxiliares: animación independiente del recorrido de cámara.

function flow(points,kind,color){
 const c=curve(points),conduit=mesh(site,new T.TubeGeometry(c,Math.max(40,points.length*8),.035,8,false),new T.MeshBasicMaterial({color,transparent:true,opacity:.40}));
 const electrical=!['air','exhaust'].includes(kind);conduit.material.depthTest=!electrical;conduit.material.depthWrite=false;conduit.renderOrder=electrical?40:0;const dots=[];const geo=new T.ConeGeometry(electrical?.085:.065,electrical?.26:.20,10);const material=new T.MeshBasicMaterial({color,depthTest:!electrical,depthWrite:false,transparent:true,opacity:.95});
 for(let i=0;i<Math.max(3,Math.min(22,Math.ceil(c.getLength()/1.8)));i++){const d=mesh(site,geo,material);d.castShadow=false;d.receiveShadow=false;d.renderOrder=electrical?41:0;dots.push(d);}
 flowItems.push({c,kind,dots,halos:[],conduit});
}
flow(powerRoute,'lv','#45d3ab');flow([[10.55,7,4.85],[10.95,7.18,4.85],[11.6,7.6,3.9],[11.6,8.9,3.6]],'lv','#45d3ab');
flow([[13.1+.95,10.8,-8],[14.05,10.7,-4.85],[14.05,10.15,-4.85],[14.05,10.15,-3.6],[14.05,9.38,-3.6],[14.05,9.38,-3.15],[14.05,9.91,-3.15],[18.12,9.91,-3.15],[18.12,9.91,-4.65],[18.12,8.73,-4.65],[18.48,8.73,-4.65],[18.48,9.73,-4.65],[18.48,9.73,-2.7],[17.9,9.73,-2.7],[17.9,9.73,-2.1],[17.9,9,-2.1],[17.9,8.05,-1.6],[17.9,9,-1.1],[17.9,9.97,-1.1],[17.9,9.97,-1],[19.1,9.97,-1]],'utility','#248ade');
flow([[19.1,9.97,-1],[20.8,9.97,-1],[20.8,9.97,-1.4],[20.8,9,-1.4],[20.8,8.47,-1.4],[20.8,8.47,-.9],[20.8,9,-.9],[20.8,9,-.4]],'normal','#248ade');
flow([[11.6,8.9,3.6],[11.6,9.30,3.6],[11.6,9.30,3.73],[12.8,9.30,3.73],[12.8,9.66,3.73],[18.4,9.66,3.73],[18.4,9.66,1.8],[18.4,9,1.8],[18.4,8.05,1.3],[18.4,9,.8],[18.4,9.97,.8],[18.4,9.97,-1],[19.1,9.97,-1]],'emergency','#12b58b');
flow([[20.8,9,-.4],[20.8,9.6,-.4],[24.4,9.6,-.9],[24.4,9.6,-.8],[24.4,8.9,-.8],[24.4,7.4,-.3],[23.35,7.02,.45],[23.35,6.38,.45],[23.35,6.38,2.9],[24.4,6.38,2.9],[24.4,7.2,2.9]],'load','#d28628');
flow(exhaustPts,'exhaust','#b8997e');
flow([[5.8,7.2,-5.5],[5.8,1.7,-5.5],[1,1.7,-5.5],[1,1.7,0]],'air','#81aabd');
flow([[-2.2,1.3,0],[-3.2,1.7,0],[-3.2,1.7,-3.7],[-3.2,7.4,-3.7]],'air','#81aabd');

const tourPoints=[[0,1.8,0],[4.7,1.4,.9],[7,3.55,2.7],[7,4.8,2.7],[10,6,2.7],[14,6,2.7],[11.6,8,3.9],[18.1,8,0],[19.5,9,-1],[24.4,8,-.5],[24,7.5,.6]];const tourCurve=curve(tourPoints);
const tourStops=['Generador / interruptor Q0','Tablero y charolas','Shaft eléctrico','Registros subterráneos','Transformador elevador TE','Transferencia exterior QN / QG','Barra de 13.8 kV','Transformador principal TP / cargas'];
const tourLookTargets=[[4.7,1.25,1.0],[5.3,3.55,3.1],[7,4.2,2.9],[12,6.25,2.9],[11.6,7.9,3.9],[18.15,7.85,-.15],[19.5,9.0,-1],[24.4,7.9,-.5]].map(p=>new T.Vector3(...p));
const tourBaseOffset=new T.Vector3(-2.6,2.2,4.2),tourYardOffset=new T.Vector3(-5.3,4.1,7.7);
const tourLookVec=new T.Vector3(0,1.8,0),tourOffsetVec=tourBaseOffset.clone();
function energized(kind){const q=circuitState();return kind==='lv'||kind==='gmv'?q.q0:kind==='utility'?s.grid:kind==='normal'?q.bus:kind==='emergency'?q.qg:kind==='load'?q.bus:s.rpm>350}
function update(){site.visible=!isolated;walls.visible=!$('hideWalls').checked;basementFloor.visible=!$('hideBasementFloor').checked;decks.visible=!$('hideFloors').checked;covers.visible=!$('hideCovers').checked;const hideTerrain=$('hideTerrain').checked,hideBasementEarth=$('hideBasementEarth')&&$('hideBasementEarth').checked;terrain.visible=!hideTerrain;earthMass.visible=!hideTerrain;yardCore.visible=!hideTerrain;yardEarth.visible=!hideTerrain;basementEarth.visible=!hideTerrain&&!hideBasementEarth;fenceNet.visible=fenceSteel.visible=!$('hideFence').checked;const q=circuitState();for(const [key,m] of Object.entries(breakerHandles)){const closed=key==='q0'?q.q0:key==='QN'?q.qn:key==='QG'?q.qg:q.bus;m.material=closed?mat('#4baf7f'):red;m.rotation.z=closed?0:.55;const bg=subParts[key];if(bg?.userData.closedLabel){bg.userData.closedLabel.visible=closed;bg.userData.openLabel.visible=!closed;}}const loadIntensity=Math.min(1,Math.max(.22,(q.kw||0)/Math.max(1,cfg.rating)));for(const it of flowItems){const power=it.kind==='air'||it.kind==='exhaust'?energized(it.kind):it.kind==='utility'?q.qn&&s.load>0:energized(it.kind)&&s.load>0&&(it.kind!=='lv'&&it.kind!=='gmv'||q.qg);it.conduit.visible=$('flows').checked&&power;if(!it.conduit.visible){for(const d of it.dots)d.visible=false;if(it.halos)for(const h of it.halos)h.visible=false;continue;}if(it.kind==='normal'){it.conduit.material.color.set(q.qg?'#12b58b':'#248ade');it.dots[0].material.color.copy(it.conduit.material.color);}const speed=(1.3+loadIntensity*2.5)/Math.max(.1,it.c.getLength());it.dots.forEach((d,i)=>{const on=power&&$('flows').checked;d.visible=on;const p=it.c.getPointAt((s.t*speed+i/it.dots.length)%1);d.position.copy(p);d.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),it.c.getTangentAt((s.t*speed+i/it.dots.length)%1).normalize());const pulse=1+.08*Math.sin(s.t*4+i*1.3);d.scale.setScalar(on?(.65+loadIntensity*.7)*pulse:1);if(it.halos?.length){const h=it.halos[i];h.visible=on;h.position.copy(p);h.scale.setScalar(d.scale.x*1.7)}})}for(const l of lights){l.lm.emissiveIntensity=q.bus?1.2:.08;l.pl.intensity=q.bus?4:.25}fuelGroup.visible=['diesel','petrol'].includes(activeFuel());}
function tourCamera(dt){if(!campusNav.tour)return;const inYard=campusNav.u>=.5;const rate=inYard?.5/54:.5/16;campusNav.u=Math.min(1,campusNav.u+dt*rate);const point=tourCurve.getPointAt(campusNav.u);const zone=Math.min(7,Math.floor(campusNav.u*8));const ease=dt<=0?1:Math.min(1,dt*2.2);tourLookVec.lerp(tourLookTargets[zone],ease);tourOffsetVec.lerp(inYard?tourYardOffset:tourBaseOffset,ease);camera.position.copy(point).add(tourOffsetVec);camera.lookAt(tourLookVec);$('routeProgress').value=Math.round(campusNav.u*100);$('routeStep').textContent=tourStops[zone];if(campusNav.u>=1){campusNav.tour=false;$('tourRoute').textContent='Repetir recorrido';}}
return {update,enabled:energized,tourCamera,tourCurve,site,subParts,referenceParts,sceneLabels,flowItems,terrain,earthMass,yardCore,basementFloor,walls,decks,covers,fenceNet,focusReference,updateFloatingLabels};}
function cameraPreset(mode){campusNav.tour=false;panOffset.set(0,0,0);$('tourRoute').textContent='Recorrido eléctrico sótano-subestación';campusNav.mode=mode;isolated=false;$('isolate').textContent='Aislar conjunto';updateView();if(mode==='basement'){campusNav.target.set(0,1.6,0);distance=15;angle=-.5;elevation=.37;$('hideFloors').checked=true;$('hideWalls').checked=false;$('hideBasementFloor').checked=false}else if(mode==='outside'){campusNav.target.set(19,7.7,-1);distance=18;angle=-.48;elevation=.48;$('hideWalls').checked=false;$('hideFloors').checked=false;$('hideBasementFloor').checked=false}else{campusNav.target.set(9,4.0,0);distance=39;angle=-.45;elevation=.36;$('hideWalls').checked=false;$('hideFloors').checked=false;$('hideBasementFloor').checked=false;$('hideCovers').checked=false}}

function updateNomDiagram(q){
 const curr=(v,on)=>((on?q.kw:0)*1000/(Math.sqrt(3)*v*cfg.pf)).toFixed(2)+' A';
 for(const [id,on] of [['QN',q.qn],['QG',q.qg],['Q0',q.q0],['QS',q.bus]]){const c=$('contact'+id);if(!c)continue;const x=id==='QN'?210:id==='QS'?540:820,y=id==='Q0'?250:id==='QS'?674:494;c.setAttribute('fill',on?'#137d61':'white');c.setAttribute('stroke',on?'#137d61':'#7d4d3a');c.setAttribute('aria-label',id+' '+(on?'cerrado':'abierto'));$('state'+id).textContent=on?'CERRADO':'ABIERTO';}
 for(const [id,on] of [['normalSupply',s.grid],['normalIn',s.grid],['genSupply',q.ready]]){$(id).setAttribute('stroke',on?'#137d61':'#8a9ba4');}
 $('nomGenRating').textContent=cfg.rating+' kW · '+cfg.freq+' Hz';$('nomGenCurrent').textContent='I nominal (FP 0.8): '+(cfg.rating*1000/(Math.sqrt(3)*480*.8)).toFixed(2)+' A';
 $('nomLoad').textContent=q.kw.toFixed(1)+' kW · '+curr(480,q.bus);
 $('nomIN').textContent=curr(13800,q.qn);$('nomIG').textContent=curr(480,q.qg);$('nomIMT').textContent='Desde G: '+curr(13800,q.qg)+' / a TP: '+curr(13800,q.bus);$('nomIBT').textContent=curr(480,q.bus);
 $('nomGData').textContent=cfg.rating+' kW · 480 V · 3Φ · '+cfg.freq+' Hz (configuración didáctica)';
}

function updateStation(){const q=circuitState(),P=q.kw;updateNomDiagram(q);for(const [id,on] of [['mfLV',q.q0],['mfTE',q.q0],['mfG',q.qg],['mfN',q.qn],['mfOUT',q.bus]]){const e=$(id);e.classList.toggle('live',on);e.classList.toggle('halt',paused||!P||((id==='mfLV'||id==='mfTE')&&!q.qg))}$('stationStatus').textContent=s.target?'Transferencia abierta: QN y QG abiertos':q.qg?'Respaldo: G → Q0 → TE → QG → barra 13.8 kV → TP → cargas':q.qn?'Servicio normal: red → QN → barra 13.8 kV → TP → cargas':'Barra de media tensión sin alimentación';$('stationContacts').textContent=`Q0 (480 V): ${q.q0?'CERRADO':'ABIERTO'} · QN (red): ${q.qn?'CERRADO':'ABIERTO'} · QG (respaldo): ${q.qg?'CERRADO':'ABIERTO'} · QS (alimentador): ${q.bus?'CERRADO':'ABIERTO'}`;$('stationMV').textContent=q.bus?'13.8 kV':'0 kV';$('stationBus').textContent=q.bus?'480 V L-L':'0 V';$('stationI').textContent=(P*1000/(Math.sqrt(3)*480)).toFixed(1)+' A';$('stationPMT').textContent=(P*1000/(Math.sqrt(3)*13800)).toFixed(2)+' A';$('stationGenI').textContent=(q.qg?P*1000/(Math.sqrt(3)*480):0).toFixed(1)+' A';$('stationTE').textContent=q.q0?'13.8 kV':'0 kV';}
const STATION_HELP={};
function initStation(){document.querySelectorAll('[data-reference]').forEach(b=>b.onclick=()=>substation.focusReference(b.dataset.reference));for(const [id,p,d] of [['focusTE',[11.6,7.95,3.9],9.0],['focusTP',[24.4,7.95,-.5],9.0],['focusCells',[19,8.2,-1],13.6]])$(id).onclick=()=>{cameraPreset('outside');campusNav.target.set(...p);distance=d;angle=-.55;elevation=.36;$('hideFence').checked=true;$('viewName').textContent=id==='focusTE'?'TE · transformador elevador':id==='focusTP'?'TP · transformador principal':'Celdas de media tensión';$('viewCode').textContent='INSPECCIÓN / EQUIPO';};cfg.phase=3;$('phase').value='3';$('phase').disabled=true;$('siteView').onclick=()=>cameraPreset('outside');$('basementView').onclick=()=>cameraPreset('basement');$('overallView').onclick=()=>cameraPreset('overall');$('frontView').onclick=()=>{cameraPreset('overall');campusNav.target.set(9,4,-1);distance=38;angle=0;elevation=.15};$('yardView').onclick=()=>{cameraPreset('outside');$('hideTerrain').checked=false;campusNav.target.set(18.1,6.85,-1.3);distance=22;angle=-.5;elevation=.82};$('groundCutView').onclick=()=>{cameraPreset('outside');$('hideTerrain').checked=false;$('hideTerrain').checked=true;campusNav.target.set(18.1,6.1,-1.3);distance=21;angle=-.6;elevation=.32};$('undergroundView').onclick=()=>{cameraPreset('outside');$('hideTerrain').checked=true;campusNav.target.set(18.1,6.2,-1.3);distance=24;angle=-.4;elevation=1.0};$('groundSystemView').onclick=()=>substation.focusReference('ground');$('resetCamera').onclick=()=>cameraPreset('basement');$('stationOutage').onclick=()=>scenario('outage');$('stationReturn').onclick=()=>{if(!s.grid)gridToggle()};$('tourRoute').onclick=()=>{if(campusNav.tour){campusNav.tour=false;$('tourRoute').textContent='Continuar recorrido';return}if(campusNav.u>=1)campusNav.u=0;campusNav.tour=true;isolated=false;updateView();$('hideWalls').checked=true;$('hideFloors').checked=true;$('hideCovers').checked=true;$('tourRoute').textContent='Pausar recorrido';};$('routeProgress').oninput=()=>{campusNav.u=+$('routeProgress').value/100;campusNav.tour=true;substation.tourCamera(0);campusNav.tour=false;$('tourRoute').textContent='Continuar recorrido'};}


// v18: presentation and equipment layers; the original simulation state machine is retained.
let proReady=false,proShadowTime=0,proLastRunning=false;
const proAssets={};

function detailPlantV18(){
 const paint=mat('#346f73',.30),alloy=mat('#aeb9bd',.58),rubber=mat('#27343a'),orange=mat('#c59442',.3);
 piece('cooling','Bomba, vaso de expansión y abrazaderas','Bomba y circuito de refrigeración representativos. La supervisión aproxima la temperatura del refrigerante mediante un modelo de primer orden.',[-.45,.15,.4],g=>{
  cyl(g,.15,.22,[-1.72,1.0,.52],paint,'z');cyl(g,.11,.06,[-1.72,1,.66],alloy,'z');
  box(g,[.32,.42,.26],[-1.75,2.35,-.5],mat('#c4d1c8'));cyl(g,.065,.055,[-1.75,2.59,-.5],rubber);
  tube(g,[[-1.75,2.4,-.5],[-2.05,2.4,-.5],[-2.05,2.1,-.4]],.025,rubber);
  for(const p of [[-1.5,1.67,.5],[-2.18,2,.4],[-1.5,.9,-.5]]){const r=mesh(g,new T.TorusGeometry(.076,.014,8,24),alloy,p);r.rotation.x=Math.PI/2;}
 });
 piece('engine','Sensores y tapa de inspección','Sensores de presión de aceite y temperatura; conexiones de señal separadas de los cables de potencia.',[-.1,.2,.55],g=>{
  for(let i=0;i<6;i++){box(g,[.15,.24,.07],[-1.55+i*.31,.76,.66],paint);cyl(g,.022,.035,[-1.55+i*.31,.83,.71],alloy,'z');}
  for(const p of [[-.9,1.4,.69],[.05,1.84,.6]]){cyl(g,.043,.16,p,alloy,'z');box(g,[.1,.085,.09],[p[0],p[1],p[2]+.1],rubber);}
  tube(g,[[-.9,1.4,.85],[-.9,1.55,.85],[1.7,1.55,.85],[1.7,1.7,1.1]],.014,rubber);
 });
 piece('battery','Cargador DC y protección de arranque','Cargador auxiliar, fusible y bornes de la batería de arranque. Representación visual, sin cálculo de carga electroquímica.',[.2,.3,.7],g=>{
  box(g,[.44,.42,.22],[.75,.68,.94],alloy);for(let j=0;j<8;j++)box(g,[.32,.014,.02],[.75,.56+j*.04,1.055],rubber);
  box(g,[.20,.12,.09],[.35,.94,.94],orange);tube(g,[[.5,.9,.85],[.5,.95,.94],[.75,.95,.94],[.75,.82,.94]],.018,red);
 });
 piece('fuel','Retorno, válvula de corte y separador','Canalización de alimentación y retorno para combustible líquido. En tecnología de gas se ocultan estas líneas.',[-.2,0,.7],g=>{
  g.userData.liquidOnly=true;
  cyl(g,.105,.32,[-1.9,1.3,.73],alloy);cyl(g,.07,.13,[-1.9,1.07,.73],mat('#c8b883',.1));
  tube(g,[[-1.9,1.46,.73],[-1.9,1.65,.73],[-.2,1.65,.73],[-.2,1.95,.5]],.018,alloy);
  tube(g,[[-.2,1.95,.55],[-.3,1.55,.8],[-1.6,1.55,.8],[-1.6,.73,.8],[-1,.7,.5]],.018,rubber);
  cyl(g,.05,.16,[-1.9,.88,.73],orange,'y');box(g,[.2,.035,.06],[-1.9,.98,.73],red);
 });
}

// Routed mechanical tubes with straight segments and radius-controlled 90-degree elbows.
function proPipe(parent,points,r,material,bend=.15){
 const p=points.map(a=>new T.Vector3(...a)),curve=new T.CurvePath();let start=p[0];
 for(let i=1;i<p.length-1;i++){
  const a=p[i-1],b=p[i],c=p[i+1],d=Math.min(bend,a.distanceTo(b)*.3,b.distanceTo(c)*.3);
  const before=b.clone().addScaledVector(a.clone().sub(b).normalize(),d),after=b.clone().addScaledVector(c.clone().sub(b).normalize(),d);
  curve.add(new T.LineCurve3(start,before));curve.add(new T.QuadraticBezierCurve3(before,b,after));start=after;
 }
 curve.add(new T.LineCurve3(start,p.at(-1)));return mesh(parent,new T.TubeGeometry(curve,points.length*14,r,10,false),material);
}

function proPlate(parent,text,pos,w=1.2,color='#214657',height=.26){
 const cv=document.createElement('canvas');cv.width=1024;cv.height=Math.round(1024*height/w);const c=cv.getContext('2d');
 c.fillStyle=color;c.fillRect(0,0,cv.width,cv.height);c.fillStyle='#f5f8f9';c.textAlign='center';c.textBaseline='middle';c.font=`600 ${Math.min(cv.height*.50,80)}px Arial`;c.fillText(text,512,cv.height/2,970);
 const tx=new T.CanvasTexture(cv);tx.colorSpace=T.SRGBColorSpace;
 box(parent,[w+.06,height+.06,.055],[pos[0],pos[1],pos[2]-.04],mat('#596c73',.4));
 return mesh(parent,new T.PlaneGeometry(w,height),new T.MeshBasicMaterial({map:tx}),pos);
}

function proSign(parent,kind,text,pos,w=.7){
 const cv=document.createElement('canvas');cv.width=512;cv.height=620;const c=cv.getContext('2d');c.fillStyle='#fcfcf6';c.fillRect(0,0,512,620);
 c.lineWidth=22;c.lineJoin='round';c.lineCap='round';c.strokeStyle='#111c23';
 if(kind==='warning'){
  c.fillStyle='#f9ca26';c.beginPath();c.moveTo(256,35);c.lineTo(474,436);c.lineTo(38,436);c.closePath();c.fill();c.stroke();
  c.fillStyle='#141b20';c.beginPath();c.moveTo(292,121);c.lineTo(193,271);c.lineTo(248,271);c.lineTo(217,372);c.lineTo(325,223);c.lineTo(271,223);c.closePath();c.fill();
 }else if(kind==='ppe'){
  c.fillStyle='#165ca5';c.beginPath();c.arc(256,239,210,0,Math.PI*2);c.fill();c.fillStyle='white';c.beginPath();c.arc(256,256,121,Math.PI,0);c.fill();c.fillRect(122,256,268,35);c.fillRect(240,119,32,143);
 }else if(kind==='fire'){
  c.fillStyle='#bc2637';c.fillRect(40,35,432,415);c.fillStyle='white';c.fillRect(193,164,112,230);c.fillRect(216,122,66,48);c.fillRect(262,106,72,20);c.strokeStyle='white';c.lineWidth=20;c.beginPath();c.moveTo(320,122);c.quadraticCurveTo(390,148,374,309);c.stroke();
 }else if(kind==='exit'){
  c.fillStyle='#16774e';c.fillRect(40,35,432,415);c.strokeStyle='white';c.lineWidth=25;c.beginPath();c.moveTo(182,98);c.lineTo(101,98);c.lineTo(101,375);c.lineTo(180,375);c.stroke();c.beginPath();c.moveTo(365,235);c.lineTo(214,235);c.moveTo(259,193);c.lineTo(210,235);c.lineTo(259,277);c.stroke();
 }else{
  c.fillStyle='#17242e';c.beginPath();c.arc(256,156,42,0,7);c.fill();c.fillRect(215,207,82,146);c.strokeStyle='#c22436';c.lineWidth=36;c.beginPath();c.arc(256,240,201,0,7);c.stroke();c.beginPath();c.moveTo(112,96);c.lineTo(400,384);c.stroke();
 }
 c.fillStyle='#142e3b';c.font='bold 33px Arial';c.textAlign='center';text.split('|').forEach((t,i)=>c.fillText(t,256,513+i*42,478));
 const tx=new T.CanvasTexture(cv);tx.colorSpace=T.SRGBColorSpace;
 box(parent,[w+.05,w*620/512+.05,.045],[pos[0],pos[1],pos[2]-.027],mat('#4a5c63',.35));
 const m=mesh(parent,new T.PlaneGeometry(w,w*620/512),new T.MeshBasicMaterial({map:tx}),pos);m.userData.safety=true;return m;
}

function refineTechnicalModel(){
 const g=new T.Group();g.name='Integración técnica SE-01';substation.site.add(g);
 const concrete=mat('#b3b9bc'),steelM=mat('#89969f',.7),darkM=mat('#343f49',.35),paint=mat('#65737d',.45),white=mat('#e9e9df'),yellow=mat('#efc22d');
 // Replace the slab with a continuous solid slab and a real stair opening.
 substation.decks.clear();const slab=new T.Shape();slab.moveTo(-8.4,-8.85);slab.lineTo(27.5,-8.85);slab.lineTo(27.5,6.25);slab.lineTo(-8.4,6.25);slab.closePath();
 const opening=new T.Path();opening.moveTo(-6.65,-5.25);opening.lineTo(-6.65,5.3);opening.lineTo(-4.65,5.3);opening.lineTo(-4.65,-5.25);opening.closePath();slab.holes.push(opening);
 const slabGeo=new T.ExtrudeGeometry(slab,{depth:.35,bevelEnabled:false});slabGeo.rotateX(Math.PI/2);mesh(substation.decks,slabGeo,concrete,[0,6.5,0]);
 // The opening is longitudinal; extrusion maps shape y to world z.
 box(g,[36.6,.28,.35],[9.5,-.05,6.23],concrete);
 box(g,[36.1,.36,.30],[9.55,6.30,6.30],concrete);
 for(const x of [-8.25,8.9])box(g,[.32,6.15,.40],[x,3.02,6.21],concrete);
 // Stable rear skin for the entire civil block, with consistent plinth.
 box(g,[36.2,6.3,.18],[9.5,2.9,-8.91],concrete);
 for(let x=10;x<27;x+=2.9)box(g,[.017,5.8,.012],[x,2.87,6.351],mat('#919a9f'));
 for(const y of [1.65,3.65])box(g,[18.35,.012,.014],[18.2,y,6.355],mat('#919a9f'));
 const frontClosure=new T.Group();substation.site.add(frontClosure);substation.frontClosure=frontClosure;
 box(frontClosure,[17.3,5.8,.22],[.4,3.04,6.13],concrete);
 proPlate(frontClosure,'CUARTO DE MÁQUINAS / BAJO NIVEL DE PISO',[.4,3.8,6.25],5,'#384b58',.28);
 // Stair from basement to exterior, supported treads and guard rails around the opening.
 const stair=new T.Group();g.add(stair);stair.name='Acceso constructivo al sótano';
 for(let i=0;i<SiteWalk37.stairs.count;i++){const y=(i+1)*SiteWalk37.stairs.rise,z=SiteWalk37.stairs.startZ-i*SiteWalk37.stairs.tread;box(stair,[1.66,.14,.29],[-5.65,y-.07,z],concrete);box(stair,[1.66,.022,.055],[-5.65,y+.012,z+.105],darkM);}
 for(const x of [-6.43,-4.87]){proPipe(stair,[[x,.03,5.18],[x,6.38,-4.98]],.08,steelM);proPipe(stair,[[x,1.13,5.18],[x,7.5,-4.98]],.034,steelM);for(let i=0;i<36;i+=3){const z=5.02-i*.28,y=(i+1)*(6.5/36);cyl(stair,.024,1.06,[x,y+.53,z],steelM);}}
 for(const x of [-6.70,-4.60]){for(let z=-5;z<5.4;z+=1.4)cyl(stair,.032,1.08,[x,7.04,z],steelM);for(const y of [7.04,7.58])proPipe(stair,[[x,y,-5.24],[x,y,5.3]],.028,steelM);}
 // Full-width top and bottom landings join the actual treads to both walking levels.
 box(stair,[1.66,.18,.98],[-5.65,6.41,-5.27],concrete);
 box(stair,[1.66,.14,.60],[-5.65,-.14,5.47],concrete);
 proSign(g,'exit','SALIDA',[-6.35,7.88,-5.8],.66);box(g,[.06,1.65,.06],[-6.35,7.4,-5.85],steelM);
 box(g,[.04,1.30,.04],[-6.80,.58,5.70],steelM);
 proPlate(g,'SUBESTACIÓN · SUBIR',[-6.80,1.20,5.72],1.45,'#315a52',.12);
 box(g,[.04,1.00,.04],[-6.80,7.00,-5.62],steelM);
 proPlate(g,'PLANTA · BAJAR',[-6.80,7.35,-5.60],1.45,'#315a52',.12);

 proPlate(g,'NIVEL DE PISO ±0.00',[5.5,6.31,6.47],2.5,'#546571',.20);
 proPlate(g,'SÓTANO −6.50 m',[.1,-.015,6.43],2.7,'#546571',.15);
 // Support the physical emergency button at the access, and put pictograms on the column.
 box(g,[.24,.36,.10],[-6.92,1.35,5.05],yellow);cyl(g,.068,.09,[-6.92,1.38,5.14],red,'z');proSign(g,'fire','EXTINTOR',[6.7,1.8,-5.36],.58);
 // Egress marks at floor level; no floating signage.
 for(let z=2.9;z<5.4;z+=.8){const ar=new T.Shape();ar.moveTo(-.13,-.14);ar.lineTo(.13,-.14);ar.lineTo(.13,.03);ar.lineTo(.25,.03);ar.lineTo(0,.28);ar.lineTo(-.25,.03);ar.lineTo(-.13,.03);ar.closePath();const m=mesh(g,new T.ShapeGeometry(ar),mat('#23835c'),[-4.9,-.072,z]);m.rotation.x=-Math.PI/2;}
 // Permanent suppression assembly shown as representative, not a dimensioned system.
 for(const [key,x,z] of [['TE',11.6,3.9],['TP',24.4,-.5]]){
  const p=substation.subParts[key],access=new T.Group();p.add(access);access.name='Accesorios y protección del transformador';
  const fx=x+.78,fz=z+.99;
  box(access,[.36,.07,.39],[fx,6.99,fz],steelM);cyl(access,.125,.68,[fx,7.39,fz],red);mesh(access,new T.SphereGeometry(.125,16,8),red,[fx,7.73,fz]);cyl(access,.04,.11,[fx,7.85,fz],copper);cyl(access,.056,.035,[fx,7.84,fz+.047],white,'z');
  for(const y of [7.13,7.6]){const ring=mesh(access,new T.TorusGeometry(.129,.014,8,24),steelM,[fx,y,fz]);ring.rotation.x=Math.PI/2;box(access,[.26,.044,.18],[fx,y,fz-.17],steelM);}
  proPipe(access,[[fx,7.88,fz],[fx,8.15,fz],[x+.48,8.15,fz],[x+.48,8.15,z+.77]],.022,steelM);
  box(access,[.51,.53,.20],[x-.30,7.50,z+.87],paint);box(access,[.44,.45,.025],[x-.30,7.50,z+.985],steelM);box(access,[.25,.09,.025],[x-.30,7.60,z+1.005],black);box(access,[.03,.14,.035],[x-.13,7.46,z+1.012],black);
  proPipe(access,[[x-.30,7.23,z+.87],[x-.30,7.05,z+.87],[x-.65,7.05,z+.87],[x-.65,8.26,z+.63]],.022,black);
  // Inspection flanges, tap changer handle and bolted flange patterns.
  for(const dx of [-.55,0,.55]){cyl(access,.16,.025,[x+dx,8.409,z+.34],paint);for(let k=0;k<8;k++){const a=k*Math.PI/4;cyl(access,.012,.023,[x+dx+Math.cos(a)*.135,8.435,z+.34+Math.sin(a)*.135],steelM);}}
  cyl(access,.09,.09,[x+.78,8.44,z+.36],steelM);box(access,[.23,.025,.05],[x+.78,8.495,z+.36],darkM);
  proPlate(access,'CONTROL',[x-.30,7.39,z+1.008],.31,'#334653',.065);proPlate(access,'EXTINCIÓN*',[fx,7.42,fz+.128],.20,'#8c2733',.07);
  proSign(access,'warning','RIESGO|ELÉCTRICO',[x-.74,7.75,z+.756],.22);
 }
 // Main transformer low-voltage outlet: connected busway to the relocated distribution board.
 const bt=new T.Group();substation.site.add(bt);bt.name='Salida BT y tableros';
 proPipe(bt,[[23.35,7.02,.45],[23.35,6.38,.45],[23.35,6.38,2.9],[25.2,6.38,2.9]],.10,paint);
 for(let i=0;i<3;i++){const x=23.6+i*.8;box(bt,[.76,.15,.70],[x,6.7,2.9],concrete);proPipe(bt,[[x,6.38,2.9],[x,6.9,2.9]],.073,paint);box(bt,[.61,1.5,.026],[x,7.47,3.162],steelM);box(bt,[.19,.21,.027],[x,7.7,3.185],darkM);box(bt,[.035,.14,.04],[x+.20,7.45,3.193],black);proSign(bt,'warning','480 V',[x,7.16,3.19],.20);proPlate(bt,['ALUMBRADO','AUXILIARES','VENTILACIÓN'][i],[x,8.12,3.20],.58,'#384c59',.08);}
 // Substation bus clamps, end caps, flexible expansion laminations and phase tags.
 const buses=substation.subParts.BARRAS;
 for(let j=0;j<3;j++){const z=[-1.62,-1,-.38][j],y=9.75+j*.22;
  for(const x of [17.15,21.1])cyl(buses,.045,.025,[x,y,z],steelM,'x');
  for(const x of [17.58+j*.32,18.08+j*.32,20.48+j*.32]){box(buses,[.20,.055,.15],[x,y,z],steelM);for(const dx of [-.067,.067])cyl(buses,.015,.084,[x+dx,y+.03,z],steelM);}
  for(let k=0;k<5;k++)proPipe(buses,[[19.58,y+.018+k*.013,z],[19.65,y+.053+k*.013,z],[19.72,y+.018+k*.013,z]],.007,copper);
  proPlate(buses,'L'+(j+1),[21.05,y-.2,z+.14],.24,'#344b59',.10);
 }
 // Transformer cubet floors and service grates close the formerly hollow base.
 for(const [x,z] of [[11.6,3.9],[24.4,-.5]]){box(g,[3.45,.055,3.45],[x,6.70,z],mat('#676f74'));for(let i=0;i<13;i++)box(g,[3.15,.025,.025],[x,6.945,z-1.60+i*.06],steelM);}
 // Bond the accessible metalwork and finish Q0 enclosure hardware.
 for(const p of [[-5.82,.3,5],[7,.2,2.7],[4.7,.2,.9]])proPipe(g,[p,[p[0],.1,-4.8],[3,.1,-4.8],[3,.45,-5.7]],.018,mat('#398269'));
 for(const y of [.43,1.49])box(g,[.04,.13,.05],[4.4,y,1.195],steelM);
 box(g,[.03,.27,.05],[4.94,.92,1.208],black);proSign(g,'warning','480 V',[4.7,.67,1.207],.26);
 // Mechanical additions are part of the generator build, so configuration changes retain them.
 proPlate(g,'P-01 / 480 V',[5.25,3.57,2.88],.9,'#344d61',.12);
 proPlate(g,'C-01 / CONTROL',[5.2,3.56,3.93],1.02,'#344d61',.12);
 // Supported, continuous cable identification markers, not duplicate hanging conduits.
 for(const x of [5,6,7]){const collar=mesh(g,new T.TorusGeometry(.147,.012,8,24),steelM,[x,3.55,2.7]);collar.rotation.y=Math.PI/2;}
 proSign(g,'ppe','USO DE CASCO',[19.2,8.3,-8.52],.66);proSign(g,'noentry','ACCESO|RESTRINGIDO',[23.5,8.3,-8.52],.66);
 PRO_INVENTORY.push(['Inspección de transformadores','Corte de tanque y radiadores para ver núcleo laminado y devanados; cilindro de extinción representativo (*)','Accesorio opcional; agente, detección y descarga requieren proyecto especializado']);
}

function detailGeneratorReference(){
 const yellow=mat('#d5a72f',.35), iron=mat('#303538',.55), alloy=mat('#b3b8ba',.75), bronze=mat('#ad7447',.55);
 const ring=(g,r,t,p,axis='x')=>{const o=mesh(g,new T.TorusGeometry(r,t,8,40),alloy,p);if(axis==='x')o.rotation.y=Math.PI/2;else if(axis==='y')o.rotation.x=Math.PI/2;return o;};
 // Keep every equipment group and all external electrical/mechanical interfaces.
 for(const p of pieces){
  if(p.userData.key==='engine')p.traverse(o=>{if(o.isMesh&&o.material.color){const c=o.material.color.getHexString();if(['376879','346f73'].includes(c))o.material=yellow;}});
  if(p.userData.name==='Gabinete y botonera')p.userData.shell=true;
 }
 piece('engine','Distribución: árbol de levas, balancines y válvulas','Mecanismo interno esquemático de cuatro cilindros. Visible con transparencia o en despiece; no es un plano de fabricación.',[0,.8,-.35],g=>{
  cyl(g,.055,2.18,[-.62,1.18,-.32],alloy,'x');
  for(let i=0;i<4;i++){const x=-1.4+i*.52;
   cyl(g,.115,.075,[x,1.20,-.32],iron,'x');
   for(const z of [-.24,.24]){cyl(g,.022,.48,[x,1.94,z],alloy);cyl(g,.088,.026,[x,1.71,z],iron);
    for(let j=0;j<7;j++)ring(g,.047,.008,[x,1.97+j*.023,z],'y');
    box(g,[.22,.055,.08],[x+.025,2.16,z],alloy);cyl(g,.018,.75,[x+.13,1.75,z],bronze);
   }
  }
 });
 piece('alternator','Núcleo laminado y cabezas de bobina','Estator anular, ranuras y bobinados independientes del rotor. La carcasa puede transparentarse para observar el conjunto.',[.8,.3,0],g=>{
  const sh=new T.Shape();sh.absarc(0,0,.54,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,.35,0,Math.PI*2,true);sh.holes.push(hole);
  const geo=new T.ExtrudeGeometry(sh,{depth:1.1,bevelEnabled:false,curveSegments:40});const m=mesh(g,geo,iron,[.9,1.05,0]);m.rotation.y=Math.PI/2;
  for(let i=0;i<24;i++){const a=i*Math.PI/12,y=1.05+Math.cos(a)*.45,z=Math.sin(a)*.45;
   cyl(g,.022,1.2,[1.45,y,z],copper,'x');
   for(const x of [.86,2.04]){const coil=mesh(g,new T.TorusGeometry(.075,.019,6,16),copper,[x,y,z]);coil.rotation.y=Math.PI/2;}
  }
  for(const x of [.76,2.15]){ring(g,.16,.035,[x,1.05,0]);cyl(g,.08,.18,[x,1.05,0],alloy,'x');}
 });
 if(activeFuel()==='diesel')piece('engine','Turbocompresor y conexión de admisión','Carcasas de turbina y compresor con conexiones al filtro de aire y al posenfriador.',[0,.35,-.8],g=>coherentTurbo(g));
 piece('exhaust','Bridas, escudos térmicos y soportes del silenciador','Silenciador sujeto a un pórtico sobre la bancada. Bridas y protección térmica sin alterar la salida hacia el conducto del sótano.',[0,.55,-.6],g=>{
  for(const x of [.04,1.26]){ring(g,.21,.023,[x,2.4,-.8]);for(let i=0;i<6;i++){let a=i*Math.PI/3;cyl(g,.018,.06,[x,2.4+Math.cos(a)*.22,-.8+Math.sin(a)*.22],alloy,'x');}}
  for(const x of [.2,1.08]){ring(g,.218,.018,[x,2.4,-.8]);box(g,[.055,1.84,.055],[x,1.47,-1.12],iron);box(g,[.08,.055,.52],[x,2.40,-1.0],iron);box(g,[.22,.04,.20],[x,.57,-1.12],alloy);}
  for(let i=0;i<18;i++)box(g,[.95,.018,.028],[.65,2.4+Math.cos(i*Math.PI/9)*.225,-.8+Math.sin(i*Math.PI/9)*.225],alloy);
 });
 piece('control','Interior del gabinete: riel DIN, protecciones y borneras','Componentes de control montados en placa posterior, visibles al transparentar el gabinete. Cableado representativo separado de potencia.',[.6,.2,.9],g=>{
  box(g,[.52,.91,.025],[2.47,1.03,.81],alloy);
  for(const y of [.73,1.08])box(g,[.47,.033,.025],[2.47,y,.85],alloy);
  for(let i=0;i<7;i++){box(g,[.047,.10,.07],[2.29+i*.057,.73,.90],mat('#89999e'));cyl(g,.01,.02,[2.29+i*.057,.75,.945],alloy,'z');}
  for(let i=0;i<3;i++){box(g,[.10,.19,.10],[2.32+i*.14,1.11,.91],mat('#dedccd'));box(g,[.045,.05,.02],[2.32+i*.14,1.10,.97],iron);}
  box(g,[.40,.15,.025],[2.47,1.35,.91],mat('#267151'));
  for(let i=0;i<5;i++)proPipe(g,[[2.30+i*.07,1.34,.94],[2.30+i*.07,1.24,.94],[2.68,1.24,.94],[2.68,.85,.94],[2.30+i*.07,.85,.94],[2.30+i*.07,.78,.94]],.004,mat(i%2?'#317194':'#bca765'),.012);
 });
 piece('enclosure','Herrajes de montaje y anclajes de servicio','Orejas de izaje, pernos de bancada y soportes del grupo motor-alternador.',[0,-.15,0],g=>{
  for(const x of [-1.65,.25,1.92])for(const z of [-.52,.52]){box(g,[.3,.055,.24],[x,.60,z],iron);for(const dx of [-.09,.09])cyl(g,.025,.045,[x+dx,.64,z],alloy);}
  for(const x of [-1.45,.15])ring(g,.065,.022,[x,2.27,-.5]);
  proPlate(g,'G-01 · GRUPO ELECTRÓGENO',[.1,.26,1.235],1.65,'#30383b',.12);
 });
}

function detailPlantTechnical(){
 const cast=mat('#33434d',.45),metal=mat('#9aa8b0',.65);
 piece('alternator','Terminales, aisladores y puente de tierra','Bornes trifásicos bajo la caja de salida y conexión PE al bastidor; visibles al transparentar las envolventes.',[.4,.3,.3],g=>{
  for(let i=0;i<3;i++){const x=1.29+i*.25;cyl(g,.045,.16,[x,2.06,.06],mat('#704c37'));box(g,[.10,.025,.20],[x,2.155,.09],copper);cyl(g,.019,.055,[x,2.18,.12],metal);tube(g,[[x,1.55,0],[x,1.84,0],[x,2,.06]],.023,black);}
  box(g,[.22,.04,.08],[2.0,.43,.65],copper);cyl(g,.027,.05,[2,.47,.65],metal);tube(g,[[2.03,.76,.59],[2.1,.6,.65],[2,.46,.65]],.023,mat('#398269'));
 });
 piece('engine','Fijaciones y puntos de servicio','Placas de acceso atornilladas y puntos de inspección del motor integrados en la carcasa.',[-.15,.1,.5],g=>{
  for(const x of [-1.6,-1.08,-.56,-.04])for(const y of [.77,1.20])cyl(g,.023,.033,[x,y,.645],metal,'z');
  tube(g,[[-.1,.73,.63],[-.04,1.22,.7],[.07,1.38,.7]],.013,metal);const loop=mesh(g,new T.TorusGeometry(.05,.012,8,20),mat('#dfb44a'),[.09,1.43,.7]);
  proPlate(g,'MOTOR / 4 TIEMPOS',[-.76,1.56,.678],.73,'#284755',.105);
 });
 piece('control','Identificación y pantalla del grupo','Pantalla y placas identifican el controlador local y la salida del alternador.',[.3,.1,.8],g=>{
  proPlate(g,'G-01',[2.43,1.30,1.151],.20,'#397b75',.08);
  proPlate(g,'CONTROL',[2.45,1.47,1.115],.40,'#394c58',.067);
  proPlate(g,'480 V / 3Φ',[1.55,2.08,.376],.62,'#354c58',.14);
 });
}

function enhanceProfessionalPresentation(){
 const site=substation.site,g=new T.Group();g.name='Equipamiento_constructivo_v18';site.add(g);proAssets.structure=g;
 const concrete=mat('#c3c9c8'),zinc=mat('#a4b2b9',.6),paint=mat('#d0dadb',.25),darkM=mat('#344954'),yellow=mat('#efbf33');
 scene.background.set('#e6edf2');scene.fog=null;floor.visible=false;camera.far=250;camera.updateProjectionMatrix();
 light.shadow.bias=-.00025;light.shadow.normalBias=.025;light.shadow.camera.far=90;light.shadow.camera.updateProjectionMatrix();renderer.toneMappingExposure=1;
 // Structural beams tie existing columns to the roof slab. Front is a deliberate architectural cut.
 for(const z of [-4.8,4.8])box(g,[15.2,.48,.38],[.45,5.84,z],concrete);
 for(const x of [-6.9,7.8])box(g,[.38,.48,10],[x,5.84,0],concrete);
 for(const x of [-3,1,5])for(const dx of [-.7,.7])cyl(g,.012,.88,[x+dx,5.8,1],zinc);
 for(const x of [-6.9,7.8])for(const z of [-4.8,4.8]){
  box(g,[.90,.18,.9],[x,-.04,z],concrete);
  for(const dx of [-.32,.32])for(const dz of [-.32,.32])cyl(g,.027,.11,[x+dx,.08,z+dz],zinc);
 }
 // Permanent signs mounted on equipment or a structural support, not educational floating labels.
 
 proSign(g,'fire','EXTINTOR',[-6,1.8,-5.36],.58);
 proSign(g,'exit','SALIDA',[-6.85,2.75,4.99],.6);
 proSign(g,'ppe','USO DE CASCO',[-6.85,3.8,4.99],.58);
 proSign(g,'warning','PELIGRO|13.8 kV',[21.7,8.05,6.03],.85);
 proSign(g,'noentry','SOLO PERSONAL|AUTORIZADO',[24.5,8.05,6.03],.85);
 proPlate(g,'01  /  PLANTA DE EMERGENCIA',[.4,5.98,6.43],5.0,'#254b5c',.32);
 proPlate(g,'02  /  SUBESTACIÓN 13.8 kV',[18.2,5.98,6.39],5.0,'#254b5c',.32);
 proPlate(g,'CIMENTACIÓN CONTINUA',[9.5,-.48,6.49],3.8,'#435964',.18);
 proPlate(g,'Q0  /  GENERADOR',[4.7,1.59,1.21],.62,'#214657',.12);
 proPlate(g,'TRANSFERENCIA',[3.65,1.48,.31],.74,'#214657',.12);
 // Day tank instrumentation, bund, fuel return and independent vent, technology-aware.
 const fuel=new T.Group();g.add(fuel);proAssets.fuel=fuel;
 for(const x of [-5.63,-3.97])box(fuel,[.10,.17,1.52],[x,.21,-3.1],concrete);
 for(const z of [-3.81,-2.39])box(fuel,[1.76,.17,.10],[-4.8,.21,z],concrete);
 proPipe(fuel,[[-4.55,1.19,-3.1],[-4.55,2.6,-3.1],[-4.55,2.6,-5.3],[-4.55,7.2,-5.3]],.028,zinc);
 proPipe(fuel,[[-1.1,.73,.50],[-3.6,.73,.50],[-3.6,.32,.50],[-3.6,.32,-3.1],[-4.2,.32,-3.1],[-4.2,1.1,-3.1]],.019,zinc);
 cyl(fuel,.045,.17,[-4.1,.47,-3.1],mat('#bd954c',.5),'x');box(fuel,[.15,.025,.05],[-4.1,.56,-3.1],red);
 proPlate(fuel,'COMBUSTIBLE / RETORNO',[-4.8,.93,-2.584],1.08,'#6c5224',.18);
 for(let j=0;j<8;j++)box(fuel,[.08,.008,.02],[-5.22,.44+j*.067,-2.584],darkM);
 // Parallel control and power trays, with regular rungs, covers and supported risers.
 function tray(a,b,width){
  const A=new T.Vector3(...a),B=new T.Vector3(...b),len=A.distanceTo(B),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(1,0,0),B.clone().sub(A).normalize());
  const t=new T.Group();g.add(t);t.position.copy(A.clone().add(B).multiplyScalar(.5));t.quaternion.copy(q);
  for(const z of [-width/2,width/2])box(t,[len,.09,.035],[0,0,z],zinc);
  for(let x=-len/2;x<=len/2;x+=.28)box(t,[.025,.025,width],[x,-.025,0],zinc);
 }
 // Removed obsolete floor tray; power route is overhead.
 // Removed unused control tray; control is carried at +3.55.
 for(let y=.65;y<5.8;y+=.8){box(g,[1.35,.05,.20],[7,y,2.29],zinc);box(g,[.14,.25,.18],[7.7,y,2.29],zinc);}
 // Roof penetrations and insulation collars for independent air, exhaust and cable systems.
 for(const [x,z,w,d] of [[.8,-4.3,.55,.55],[-4.55,-5.3,.3,.3],[5.8,-5.5,1.5,1.15],[-3.2,-3.7,1.35,1.35]]){
  for(const dx of [-w/2,w/2])box(g,[.10,.17,d+.1],[x+dx,6.51,z],zinc);
  for(const dz of [-d/2,d/2])box(g,[w,.17,.10],[x,6.51,z+dz],zinc);
 }
 // Service cabinet DC battery / charger for control and protection.
 const ctrl=new T.Group();g.add(ctrl);
 box(ctrl,[.65,.1,.6],[25.85,6.72,-4.2],concrete);box(ctrl,[.58,1.25,.48],[25.85,7.4,-4.2],paint);
 proPlate(ctrl,'DC / CONTROL',[25.85,7.80,-3.953],.49,'#254b5c',.10);
 for(let k=0;k<8;k++)box(ctrl,[.35,.017,.021],[25.85,6.95+k*.048,-3.947],darkM);
 proPipe(ctrl,[[25.85,6.84,-4.2],[25.85,6.5,-4.2],[24.4,6.5,-4.2],[24.4,6.9,-4.65]],.022,black);
 // Transformer mechanical details: pressure relief, silica-gel breather, inspection flanges and grounding studs.
 for(const [key,x,z] of [['TE',11.6,3.9],['TP',24.4,-.5]]){
  const p=substation.subParts[key];
  cyl(p,.075,.12,[x-.8,8.46,z-.45],zinc);cyl(p,.10,.035,[x-.8,8.53,z-.45],darkM);
  for(const side of [-1,1]){box(p,[.13,.08,.08],[x+side*.94,7.03,z+.9],copper);cyl(p,.024,.06,[x+side*.94,7.09,z+.9],zinc);}
  proPlate(p,key==='TE'?'TE / ELEVADOR':'TP / PRINCIPAL',[x,8.02,z+.946],1.18,'#294752',.19);
 }
 // Readable copper PE bar: bolts and individual lug terminations.
 for(let j=0;j<8;j++){cyl(g,.025,.038,[2.15+j*.23,.46,-5.661],zinc,'z');box(g,[.075,.035,.04],[2.15+j*.23,.41,-5.65],copper);}
 const dimension=new T.Group();site.add(dimension);proAssets.groundDimension=dimension;
 const depthInfo=substation.referenceParts.ground.userData.depth;
 const xx=26.6,zz=6.05;
 proPipe(dimension,[[xx,depthInfo.topY,zz],[xx,depthInfo.surfaceY,zz]],.014,mat('#146c73'));
 for(const yy of [depthInfo.topY,depthInfo.surfaceY])box(dimension,[.45,.025,.04],[xx,yy,zz],mat('#146c73'));
 proPlate(dimension,'75 cm',[25.8,(depthInfo.topY+depthInfo.surfaceY)/2,zz+.025],.90,'#146c73',.24);
 proPlate(dimension,'SUELO TERMINADO / 0.00',[24.95,depthInfo.surfaceY+.18,zz],2.6,'#435964',.21);
 dimension.visible=false;
 refineTechnicalModel();setupProUI();proReady=true;setProView('front');
 // Cache all static civil meshes by material inside their original visibility group.
 // Interactive breakers, labels and animated flow arrows keep their identities.
 batchStaticGeometry(substation.site);
 renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
 window.PlantaLabV18={version:18,setView:setProView,inventory:()=>PRO_INVENTORY,flowState:()=>({source:s.source,paths:substation.flowItems.map(x=>({kind:x.kind,visible:x.dots.some(d=>d.visible)}))})};
}

function batchStaticGeometry(parent){
 const interactive=new Set(substation.flowItems.flatMap(x=>[x.conduit,...x.dots]));
 // Keep meshes with runtime material changes or interactive metadata unmerged.
 for(const g of [...parent.children])if(g.isGroup)batchStaticGeometry(g);
 const buckets=new Map();
 for(const m of parent.children){
  if(!m.isMesh||Array.isArray(m.material)||m.material.transparent||m.userData.labelText||m.userData.safety||interactive.has(m)||m.geometry.type==='PlaneGeometry'||m.geometry.type==='ConeGeometry')continue;
  if(m.geometry.type==='BoxGeometry'&&m.geometry.parameters.width<.09&&m.geometry.parameters.height===.20)continue;
  if(m.material.emissiveIntensity>0&&m.material.emissive?.getHex()!==0)continue;
  // Breaker handles change material dynamically; recognize their narrow geometry.
  if(m.geometry.type==='BoxGeometry'&&m.geometry.parameters.width<=.065&&m.geometry.parameters.height>=.18&&m.geometry.parameters.height<=.22)continue;
  const k=m.material.uuid+':'+m.castShadow+':'+m.receiveShadow;
  if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(m);
 }
 for(const list of buckets.values()){
  if(list.length<5)continue;
  const pos=[],normal=[],uv=[];
  for(const m of list){m.updateMatrix();const geo=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();geo.applyMatrix4(m.matrix);
   for(const value of geo.attributes.position.array)pos.push(value);for(const value of geo.attributes.normal.array)normal.push(value);for(const value of geo.attributes.uv.array)uv.push(value);geo.dispose();
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normal,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeBoundingSphere();
  const merged=new T.Mesh(geo,list[0].material);merged.castShadow=list[0].castShadow;merged.receiveShadow=list[0].receiveShadow;merged.name='Geometría estática combinada';
  for(const m of list)parent.remove(m);parent.add(merged);
 }
}

function setProView(mode){
 if($('sectionGround')&&$('sectionGround').checked&&mode!=='plant'&&mode!=='front'){$('sectionGround').checked=false;substation.frontClosure.visible=true;cutGeneralButton.textContent='Corte general';cutGeneralButton.setAttribute('aria-pressed','false');try{updateLandscapeBackground();}catch(e){}}
 if($('sectionGround')&&mode==='plant'){$('sectionGround').checked=true;substation.frontClosure.visible=false;cutGeneralButton.textContent='Cerrar corte';cutGeneralButton.setAttribute('aria-pressed','true');}
 cameraPreset(mode==='plant'?'basement':mode==='yard'||mode==='bus'||mode==='ground'?'outside':'overall');
 $('hideTerrain').checked=mode==='ground';$('hideBasementEarth').checked=false;$('hideFence').checked=['yard','bus','ground'].includes(mode);
 const views={front:{p:[9.5,5.0,-1.1],d:1,a:0,e:.16,title:'Conjunto integrado · corte frontal'},iso:{p:[9.5,4.5,-1.1],d:1.12,a:-.40,e:.40,title:'Arquitectura y conexiones'},plant:{p:[0,2.1,0],d:.35,a:.20,e:.15,title:'Planta de emergencia'},yard:{p:[18.2,8.0,-1.2],d:.58,a:-.37,e:.42,title:'Patio de media tensión'},bus:{p:[19.1,9.2,-.7],d:.25,a:-.5,e:.38,title:'Barras colectoras · conexiones'},ground:{p:[18.1,5.875,-1.3],d:.6,a:-.4,e:.95,title:'Malla de tierra · 75 cm bajo suelo terminado'}};
 const v=views[mode]||views.front;campusNav.target.set(...v.p);angle=v.a;elevation=v.e;
 const aspect=Math.max(.45,$('stage').clientWidth/Math.max(1,$('stage').clientHeight));
 distance=Math.max(35,37.5/(2*Math.tan(camera.fov*Math.PI/360)*aspect))*v.d*1.35;
 if(mode==='plant')distance=Math.max(19,19/aspect);if(mode==='bus')distance=Math.max(10,11/aspect);if(mode==='yard'||mode==='ground')distance=Math.max(26,25/aspect);
 $('viewName').textContent=v.title;$('viewCode').textContent=mode==='front'?'VISTA 01 / FRONTAL':mode==='plant'?'VISTA 03 / GRUPO ELECTRÓGENO':'EXPLORACIÓN / '+mode.toUpperCase();
 document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===mode);b.setAttribute('aria-pressed',String(b.dataset.view===mode));});
 $('hideFloors').checked=mode==='ground';$('hideWalls').checked=false;$('hideCovers').checked=false;
 if(mode==='front'&&$('sectionGround')&&!$('sectionGround').checked){campusNav.target.y=6.7;$('viewName').textContent='Instalación exterior · frente';}
 $('proGround').checked=mode!=='ground';$('proFence').checked=!$('hideFence').checked;
 renderer.shadowMap.needsUpdate=true;
}

const PRO_INVENTORY=[
 ['Obra civil','Base continua, losa, muros, columnas, vigas, acceso por escalera, puertas, zapatas y pasos sellados','Integración / ampliación'],
 ['Transformadores TE / TP','Tanques, radiadores corrugados, conservador, núcleo y bobinados, boquillas, válvulas, control, cilindro de extinción representativo y ruedas','Rediseño según imágenes'],
 ['Media tensión','Pórtico, seccionador, apartarrayos; TC y TP-M con cuerpos, aisladores perfilados, terminales, bridas y cajas secundarias','Transformadores de medida rediseñados según referencias'],
 ['Barras colectoras','Tres fases, soportes aislantes, abrazaderas, placas y juntas','Geometría reemplazada'],
 ['Interruptores / mando','QN y QG: cámaras con boquillas inclinadas; QS: polos verticales. Bastidor, mando, terminales independientes, puesta a tierra e indicador I/O. Q0 conservado.','Rediseño según referencias; estados enlazados a la transferencia'],
 ['Motor / alternador','Pistones, cigüeñal, estator, rotor, bornes, control y bancada','Detalles ampliados'],
 ['Auxiliares de planta','Bomba, vaso, filtros, sensores, batería y cargador DC','Ampliación visual'],
 ['Combustible y escape','Depósito, cubeto, válvula, retorno, venteo y salida de escape','Ampliación / trazado ordenado'],
 ['Canalizaciones','Potencia, control, comunicaciones, PE, charolas y registros','Recorridos separados'],
 ['Tierra y protección','Malla a 75 cm mínimos bajo suelo terminado; varillas, registros y bajantes ajustados','Profundidad corregida'],
 ['Seguridad','Riesgo eléctrico, acceso restringido, casco, extintor y salida','Pictogramas físicos / NOM-026'],
 ['Visualización','Frontal, corte, detalle de planta, barras, tierra, despiece y unifilar','Interfaz reconstruida']
];

function setupProUI(){
 const aside=document.querySelector('aside'),original=[...aside.children];
 aside.innerHTML='<div class="rail-head"><span>CENTRO DE CONTROL</span><b>v18</b></div><div class="rail-tabs" role="tablist" aria-label="Panel lateral"><button role="tab" aria-selected="true" data-tab="operate">Operación</button><button role="tab" aria-selected="false" data-tab="explore">Explorar</button><button role="tab" aria-selected="false" data-tab="record">Registro</button></div><div class="rail-panel" id="operate"></div><div class="rail-panel" id="explore" hidden></div><div class="rail-panel" id="record" hidden></div>';
 $('operate').append(original[1]);const config=document.createElement('details');config.innerHTML='<summary>Configuración del grupo</summary>';config.append(original[0]);$('operate').append(config);
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(t=>{t.setAttribute('aria-selected',String(t===b));$(t.dataset.tab).hidden=t!==b});});
 $('explore').innerHTML='<section class="card"><h2>Equipos de la instalación</h2><div id="equipmentFocus" class="buttons"></div></section><section class="card" id="viewOptions"><h2>Capas y visualización</h2><label><input id="proFlows" type="checkbox" checked> Flujo de energía</label><label><input id="proLabels" type="checkbox"> Etiquetas educativas</label><label><input id="proGround" type="checkbox" checked> Terreno continuo</label><label><input id="proFence" type="checkbox" checked> Malla perimetral</label></section><section class="card" id="plantParts"><h2>Despiece de la planta</h2></section><button id="openInventory" style="width:100%">Inventario y alcance técnico</button>';
 for(const [id,title,fn] of [['plant','Grupo electrógeno',()=>setProView('plant')],['focusTE','Elevador TE',()=>$('focusTE').click()],['focusTP','Principal TP',()=>$('focusTP').click()],['b','Barras MT',()=>setProView('bus')],['relay','Protección',()=>substation.focusReference('relay')],['g','Puesta a tierra',()=>setProView('ground')]]){
  const b=document.createElement('button');b.textContent=title;b.onclick=fn;$('equipmentFocus').append(b);
 }
 for(const id of ['part','housing','xray','explode']){
  const labels={part:'Componente',housing:'Envolvente',xray:'Transparencia del grupo',explode:'Separación de las piezas'};
  const l=document.createElement('label');l.htmlFor=id;l.textContent=labels[id];$('plantParts').append(l,$(id));
 }
 const inspectButton=document.createElement('button');inspectButton.textContent='Abrir despiece 3D';inspectButton.className='primary';inspectButton.style='width:100%;margin-top:12px';inspectButton.onclick=()=>{showDialog('Despiece de la planta',$('inspector'));openInspector(selection)};$('plantParts').append(inspectButton);
 const partActions=document.createElement('div');partActions.className='buttons';partActions.append($('isolate'),$('spin'));$('plantParts').append(partActions);
 const partInfo=document.createElement('details');partInfo.innerHTML='<summary>Información de la pieza</summary>';for(const id of ['partTitle','partText','subparts','subText'])partInfo.append($(id));$('plantParts').append(partInfo);
 $('record').innerHTML='<section class="card"><h2>Secuencia de operación</h2><div id="logHolder"></div></section><section class="card"><h2>Pruebas guiadas</h2><div class="buttons"><button data-test="outage">Falla de red</button><button data-test="recovery">Retorno de red</button><button data-test="overload">Sobrecarga</button><button data-test="fuel">Sin combustible</button></div></section>';
 $('logHolder').append($('timeline'),$('review'));document.querySelectorAll('[data-test]').forEach(b=>b.onclick=()=>scenario(b.dataset.test));
 const bar=document.createElement('div');bar.id='viewbar';bar.innerHTML='<div><button data-view="front">Frente</button><button data-view="iso">Perspectiva</button><button data-view="plant">Planta</button><button data-view="yard">Subestación</button></div><div><button id="showSingle">Unifilar</button><button id="toggleRail" aria-expanded="true" aria-label="Mostrar u ocultar menú">Menú</button><button id="proFull">Ampliar</button></div>';$('viewer').append(bar);
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>setProView(b.dataset.view));
 const title=document.createElement('div');title.className='view-title';title.innerHTML='<span id="viewCode"></span><strong id="viewName"></strong>';$('viewer').append(title);
 const footer=document.createElement('div');footer.id='sceneFooter';footer.innerHTML='<div class="legend"><span><i class="key blue"></i>Red</span><span><i class="key green"></i>Respaldo</span><span><i class="key amber"></i>Carga</span></div><strong id="proState" aria-live="polite"></strong><span class="gesture">Arrastrar: desplazar · Shift: girar · Rueda: zoom</span>';$('viewer').append(footer);
 const meter=document.createElement('div');meter.id='currentReadout';meter.innerHTML='CORRIENTE DE CARGA<br><b id="proAmps">0 A</b><br><span id="proMT"></span>';$('viewer').append(meter);
 $('showSingle').onclick=()=>showDialog('Unifilar · criterios NOM-001-SEDE-2012',$('station'));
 $('toggleRail').onclick=()=>{document.body.classList.toggle('menu-collapsed');$('toggleRail').setAttribute('aria-expanded',String(!document.body.classList.contains('menu-collapsed')))};
 $('proFull').onclick=()=>{$('viewer').classList.toggle('wide');$('proFull').textContent=$('viewer').classList.contains('wide')?'Cerrar':'Ampliar'};
 $('proFlows').onchange=()=>{$('flows').checked=$('proFlows').checked;updateView()};
 $('proLabels').onchange=()=>{document.body.classList.toggle('eduoff',!$('proLabels').checked);$('edu').textContent=$('proLabels').checked?'Etiquetas ON':'Etiquetas OFF';substation.updateFloatingLabels($('proLabels').checked)};
 $('edu').onclick=()=>{$('proLabels').checked=!$('proLabels').checked;$('proLabels').onchange()};
 $('proGround').onchange=()=>{$('hideTerrain').checked=!$('proGround').checked;renderer.shadowMap.needsUpdate=true};
 $('proFence').onchange=()=>{$('hideFence').checked=!$('proFence').checked;renderer.shadowMap.needsUpdate=true};
 document.body.classList.add('eduoff');$('edu').textContent='Etiquetas OFF';substation.updateFloatingLabels(false);
 const dialog=document.createElement('dialog');dialog.id='techDialog';dialog.innerHTML='<div class="dialog-head"><h2 id="dialogTitle"></h2><button id="closeDialog">Cerrar</button></div><div id="dialogContent"></div>';document.body.append(dialog);$('closeDialog').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog&&e.clientX<dialog.getBoundingClientRect().left)dialog.close()});
 $('openInventory').onclick=()=>{
  const n=document.createElement('section');n.innerHTML='<p>Modelo didáctico de media tensión (13.8 kV), grupo de 480 V y transferencia abierta. Geometría representativa; incluye transferencia abierta, vistas de inspección y corte constructivo.</p><table><thead><tr><th>Sistema</th><th>Componentes representados</th><th>Intervención</th></tr></thead><tbody>'+PRO_INVENTORY.map(r=>'<tr>'+r.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table><h3>Señalización</h3><p>Referencia: <a href="https://sidof.segob.gob.mx/notas/docFuente/5070081" target="_blank" rel="noopener">NOM-026-STPS-2008, apartados 7 y 8</a>. Amarillo/negro: advertencia; rojo/blanco: prohibición y equipos de emergencia; azul/blanco: obligación; verde/blanco: condición segura y salida. Las flechas de energía son una leyenda didáctica independiente de los colores de seguridad.</p><h3>Alcance del modelo</h3><p>Las flechas muestran dirección de transferencia de energía activa, no el movimiento instantáneo de electrones en CA. Magnitudes calculadas con carga trifásica equilibrada, factor de potencia configurable y transformadores ideales. El tamaño y velocidad de las flechas son ilustrativos. No se calculan cortocircuitos, selectividad, distancias de aislamiento, ventilación, resistencia de puesta a tierra ni coordinación de protecciones.</p><p>Se revisó el archivo adjunto ABRIR_SIMULADOR.html y las tres imágenes de transformadores. El archivo de referencia Simulador_Planta_y_Subestación_3D.html no estuvo disponible para comparación. El inventario documenta lo implementado; no certifica la integridad de un proyecto constructivo real.</p>';
  showDialog('Inventario de la instalación',n);
 };
 // Expose existing hidden tour without adding objects outside the model.
 const tour=document.createElement('button');tour.textContent='Recorrido de la energía';tour.style='width:100%;margin-top:10px';tour.onclick=()=>{$('tourRoute').click();tour.textContent=campusNav.tour?'Pausar recorrido':'Recorrido de la energía'};$('viewOptions').append(tour);
 const routeLabel=document.createElement('label');routeLabel.htmlFor='routeProgress';routeLabel.textContent='Posición del recorrido';$('viewOptions').append(routeLabel,$('routeProgress'),$('routeStep'));
 $('frontView').onclick=()=>setProView('front');$('overallView').onclick=()=>setProView('iso');$('basementView').onclick=()=>setProView('plant');$('siteView').onclick=()=>setProView('yard');
 if(window.innerWidth<700)document.body.classList.add('menu-collapsed');
}

function showDialog(title,content){
 const host=$('dialogContent');
 // Keep existing sections in DOM when switching dialogues, preserving all bound controls.
 for(const c of [...host.children]){if(['inspector','station'].includes(c.id)){c.style.display='none';document.querySelector('.layout>div').append(c)}else c.remove();}
 content.style.display='block';host.append(content);$('dialogTitle').textContent=title;
 if(!$('techDialog').open)$('techDialog').showModal();
}

function updateProScene(dt){
 if(!proReady)return;
 updateHMI();
 const q=circuitState();
 proAssets.groundDimension.visible=$('hideTerrain').checked&&!isolated;
 $('proState').textContent=paused?'SIMULACIÓN EN PAUSA':s.fault?'PROTECCIÓN / '+s.fault:s.target?'TRANSFERENCIA ABIERTA':q.qg?'RESPALDO ACTIVO':q.qn?'RED DISPONIBLE':'CARGA SIN SUMINISTRO';
 $('proAmps').textContent=(q.kw*1000/(Math.sqrt(3)*480)).toFixed(1)+' A';$('proMT').textContent=(q.kw*1000/(Math.sqrt(3)*13800)).toFixed(2)+' A en 13.8 kV · FP 1';
 $('currentReadout').style.borderColor=q.qg?'#12b58b':q.qn?'#248ade':'#ba4d45';
 proAssets.fuel.visible=['diesel','petrol'].includes(activeFuel())&&!isolated;
 pieces.filter(p=>p.userData.liquidOnly).forEach(p=>p.visible=['diesel','petrol'].includes(activeFuel())&&(!isolated||selection==='fuel'));
 proShadowTime+=dt;
 const running=s.rpm>0;if(proShadowTime>.35&&(running||proLastRunning!==running)){renderer.shadowMap.needsUpdate=true;proShadowTime=0;}proLastRunning=running;
}

reset();build();selectPart('engine');initStation();substation=createSubstation();enhanceProfessionalPresentation();updateStation();requestAnimationFrame(frame);
const basementPanel=document.createElement('div');basementPanel.style='margin-top:12px;display:grid;gap:8px';
const routeBtn=document.createElement('button');routeBtn.textContent='Sótano · canalizaciones';routeBtn.onclick=()=>{setProView('plant');campusNav.target.set(4.2,3.1,1.3);distance=12;angle=-.35;elevation=.35;$('hideWalls').checked=true;$('hideCovers').checked=true;$('viewName').textContent='Canalizaciones · potencia y control';};basementPanel.append(routeBtn);
const coversBtn=document.createElement('button');coversBtn.textContent='Abrir / cerrar canalizaciones';coversBtn.onclick=()=>{$('hideCovers').checked=!$('hideCovers').checked;};basementPanel.append(coversBtn);
const normBtn=document.createElement('button');normBtn.textContent='Criterios normativos del sótano';normBtn.onclick=()=>{const n=document.createElement('section');n.innerHTML=`<h3>Organización del cableado · referencia mexicana</h3><p>Potencia P-01: generador → conexión flexible → Q0 → canalización elevada → cajas de paso → shaft → TE. Las tres fases y PE comparten envolvente. Control y comunicaciones disponen de rutas independientes. Las tapas se pueden retirar para estudiar el interior.</p><table><tr><th>Detalle</th><th>Referencia NOM-001-SEDE-2012</th></tr><tr><td>Agrupación de conductores y protección mecánica</td><td>300-3(b), 300-4 y 300-20</td></tr><tr><td>Soportes propios y continuidad de canalización</td><td>300-11 y 300-12</td></tr><tr><td>Sellado de pasos entre pisos</td><td>300-21; sistema cortafuego ensayado por seleccionar</td></tr><tr><td>Charolas accesibles, soporte, ocupación y unión</td><td>392-18, 392-22, 392-30 y 392-60</td></tr><tr><td>Unión de partes metálicas</td><td>250-96; PE no conduce potencia en operación normal</td></tr><tr><td>Acceso a cajas y espacio de trabajo</td><td>314-29 y 110-26</td></tr></table><p>La separación dibujada es una decisión de distribución, no una distancia mínima universal. El tipo de circuito de control determina la aplicación del artículo 725. La clasificación del respaldo determina si aplican 700, 701 o 702.</p><p><b>Alcance:</b> geometría didáctica, no certificación de cumplimiento. Faltan cálculo de ampacidad y correcciones, ocupación, calibres y PE, radios según cable y canalización elegidos, esfuerzos de cortocircuito, soportes, dimensiones de cajas, espacio de trabajo y clasificación de áreas por combustible. Los colores de fases identifican este modelo; no se presentan como código obligatorio.</p><p>Fuentes: <a href="https://dof.gob.mx/nota_detalle_popup.php?codigo=5280609" target="_blank" rel="noopener">DOF · canalizaciones</a> · <a href="https://dof.gob.mx/nota_detalle_popup.php?codigo=5280611" target="_blank" rel="noopener">DOF · charolas</a>.</p>`;showDialog('Sótano · criterios de instalación',n);};basementPanel.append(normBtn);$('viewOptions').append(basementPanel);

function setupHMI(){
 document.querySelector('header small').textContent='SISTEMA DE SUPERVISIÓN / SE-01';
 document.querySelector('header h1').textContent='Subestación y generación de respaldo';
 const meta=document.createElement('div');meta.className='hmi-meta';meta.innerHTML='<span class="sim-tag">SIMULACIÓN LOCAL</span><span class="hmi-config">GRUPO G-01<b id="hmiConfig"></b></span><span>TIEMPO SIMULADO<b id="hmiClock">00:00:00</b></span>';document.querySelector('header').insertBefore(meta,$('edu'));
 document.querySelector('.rail-head span').textContent='PUESTO DE OPERACIÓN';document.querySelector('.rail-head b').textContent='HMI / 01';
 $('operate').querySelector('h2').textContent='MANDO DEL GRUPO';
 const annunciator=document.createElement('div');annunciator.id='hmiAlarm';annunciator.className='hmi-annunciator';annunciator.setAttribute('role','status');annunciator.innerHTML='<div><small>ESTADO DE SERVICIO</small><b id="hmiAlarmText"></b></div>';$('operate').prepend(annunciator);
 for(const id of ['load','reserve']){const bar=document.createElement('div');bar.className='hmi-bar';bar.innerHTML='<i id="hmiBar'+id+'"></i>';$(id).after(bar);}
 const caption=document.createElement('div');caption.className='hmi-caption';caption.textContent='Mediciones del modelo · trifásico equilibrado · FP 1';$('operate').append(caption);
 const strip=document.createElement('div');strip.className='hmi-breakers';strip.setAttribute('aria-label','Estado de interruptores');strip.innerHTML=[['q0','Q0','Grupo BT'],['qn','QN','Red MT'],['qg','QG','Respaldo MT'],['bus','QS','Salida MT']].map(([key,id,label])=>'<div class="hmi-breaker" id="hmiB'+key+'" title="'+label+'"><i aria-hidden="true"></i><div><b>'+id+' · '+label+'</b><span></span></div></div>').join('');$('viewer').append(strip);
 const quick=document.createElement('button');quick.textContent='Sótano';quick.title='Detalle de canalizaciones del sótano';quick.onclick=()=>routeBtn.click();$('viewbar').firstElementChild.append(quick);
 $('start').textContent='▶ Arranque';$('stop').textContent='■ Paro normal';$('toGen').textContent='Transferir a G';$('toGrid').textContent='Transferir a red';
 setProView('iso');updateHMI();
}
function updateHMI(){
 if(!$('hmiClock')||!s)return;
 const q=circuitState(),sec=Math.floor(s.t);
 if($('energyPath')){$('energyPath').textContent=q.qg?'G → Q0 → TE → QG → BARRA → TP → CARGAS':q.qn?'RED → QN → BARRA → TP → CARGAS':'SIN SUMINISTRO · CONTACTOS ABIERTOS';$('energyPower').textContent=q.kw.toFixed(1)+' kW';$('energyLevel').style.width=Math.min(100,s.load/130*100)+'%';$('energyLevel').style.background=q.qg?'#12966e':q.qn?'#2689c8':'#b35b45';$('energyLevel').style.opacity=q.bus?'1':'.15';}
 $('hmiClock').textContent=[Math.floor(sec/3600),Math.floor(sec/60)%60,sec%60].map(v=>String(v).padStart(2,'0')).join(':');
 $('hmiConfig').textContent=cfg.rating+' kW / '+cfg.freq+' Hz';
 let message=q.qn?'Red alimentando la carga':q.qg?'Generador alimentando la carga':'Carga sin suministro',level=q.bus?'normal':'warning';
 if(s.fault){message='Protección: '+s.fault;level='alarm'}else if(s.target){message='Transferencia · contactos abiertos';level='warning'}else if(s.stage==='starting'){message='Secuencia de arranque';level='warning'}else if(s.stage==='crankpause'){s.rpm=0;if(s.timer>=2)transition('starting','Nuevo intento de arranque.');}else if(s.stage==='warm'){message='Estabilizando generación';level='warning'}else if(s.stage==='cool'){message='Enfriamiento del generador';}if(paused)message+=' · PAUSA';
 $('hmiAlarmText').textContent=message;$('hmiAlarm').dataset.level=level;
 for(const key of ['q0','qn','qg','bus']){const el=$('hmiB'+key);el.dataset.closed=String(!!q[key]);el.querySelector('span').textContent=q[key]?'CERRADO':'ABIERTO';}
 $('hmiBarload').style.width=Math.min(100,s.load/130*100)+'%';$('hmiBarload').style.background=s.load>100?'#eb9d66':'#60bfaa';$('hmiBarreserve').style.width=Math.max(0,s.reserve)+'%';
 $('start').disabled=!!s.fault||s.reserve<=0||['starting','warm','ready'].includes(s.stage);$('stop').disabled=['off','fault'].includes(s.stage);$('toGen').disabled=cfg.mode==='auto'||s.stage!=='ready'||s.source==='gen'||!!s.target;$('toGrid').disabled=cfg.mode==='auto'||!s.grid||s.source==='grid'||!!s.target;
}
setupHMI();



let landscapeTexture=null,landscapeEnabled=true;
const landscapeWorld=new T.Group();landscapeWorld.name='Entorno_3D_fijo_al_terreno';scene.add(landscapeWorld);
camera.far=700;camera.updateProjectionMatrix();scene.background=new T.Color('#b9d5e7');
// All scenery is world-space geometry, never a camera-locked background.
const sky=new T.Mesh(new T.SphereGeometry(2400,40,20),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{top:{value:new T.Color('#6ea8d4')},bottom:{value:new T.Color('#dbe7e9')}},vertexShader:'varying vec3 wp;void main(){wp=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform vec3 top;uniform vec3 bottom;varying vec3 wp;void main(){float h=clamp((wp.y+5.0)/240.0,0.0,1.0);gl_FragColor=vec4(mix(bottom,top,pow(h,0.55)),1.0);}' }));sky.position.set(9,0,0);landscapeWorld.add(sky);
// D29: se retiró la imagen de paisaje incrustada (estaba dañada); el terreno y el horizonte son ahora procedurales.
let terrainSeed=8271;function worldRandom(){terrainSeed=(Math.imul(terrainSeed,1664525)+1013904223)>>>0;return terrainSeed/4294967296}
const grassCanvas=document.createElement('canvas');grassCanvas.width=grassCanvas.height=512;const gcw=grassCanvas.getContext('2d');gcw.fillStyle='#8d8961';gcw.fillRect(0,0,512,512);for(let i=0;i<47000;i++){const x=worldRandom()*512,y=worldRandom()*512,v=worldRandom();gcw.strokeStyle=['#787956','#99936a','#aaa07a','#63764f','#b3a57e'][Math.floor(v*5)];gcw.lineWidth=.5+worldRandom();gcw.beginPath();gcw.moveTo(x,y);gcw.lineTo(x-2+worldRandom()*4,y-1-worldRandom()*5);gcw.stroke()}
const grassTexture=new T.CanvasTexture(grassCanvas);grassTexture.colorSpace=T.SRGBColorSpace;grassTexture.wrapS=grassTexture.wrapT=T.RepeatWrapping;grassTexture.repeat.set(65,65);grassTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());

// Finished grade is +6.5 in model coordinates; basement floor remains at 0.
const gradeY=6.5,sectionWorld=new T.Group();landscapeWorld.add(sectionWorld);
function groundSurface(section){
 const xs=[-1600,-220,-80,-35,-11,-8.9,9,28,30,60,97.45,102.85,120,220,1600],zs=[-1600,-600,-220,-100,-35,-9.1,6.6,9.1,12.7,16,25,70,140,220,600,1600],verts=[],uv=[];
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){
  const xa=xs[i],xb=xs[i+1],za=zs[j],zb=zs[j+1],cx=(xa+xb)/2,cz=(za+zb)/2;
  if(cx>-8.9&&cx<28&&cz>-9.1&&cz<6.6)continue;
  if(cx>97.45&&cx<102.85&&cz>9.1&&cz<12.7)continue;
  if(section&&cz>=6.6)continue;
  for(const [x,z] of [[xa,za],[xa,zb],[xb,za],[xb,za],[xa,zb],[xb,zb]]){verts.push(x,gradeY,z);uv.push((x+220)/440,(220-z)/440)}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
const groundMat=new T.MeshStandardMaterial({map:grassTexture,roughness:1,color:'#dad4b7',bumpMap:grassTexture,bumpScale:.04});
const terrainMesh=new T.Mesh(groundSurface(true),groundMat),completeTerrain=new T.Mesh(groundSurface(false),groundMat);terrainMesh.receiveShadow=completeTerrain.receiveShadow=true;landscapeWorld.add(terrainMesh,completeTerrain);completeTerrain.visible=false;const normalLandscapeColor=new T.Color('#b9d5e7'),sectionBackgroundColor=new T.Color('#dfe8ed');
// D29: terreno y horizonte procedurales. La imagen de paisaje incrustada en la versión anterior estaba dañada (solo se decodificaba la franja de cielo).
{
 let sd=1234567;const rnd=()=>{sd=(Math.imul(sd,1664525)+1013904223)>>>0;return sd/4294967296;};
 const S=1024,cv=document.createElement('canvas');cv.width=cv.height=S;const g=cv.getContext('2d');
 g.fillStyle='#6f8b4b';g.fillRect(0,0,S,S);
 const pal=['#5f7d43','#7a9654','#8d9b5b','#566f3c','#7f8a50','#9b9560','#68844a'];
 for(let i=0;i<170;i++){const x=rnd()*S,y=rnd()*S,r=50+rnd()*150,c=pal[Math.floor(rnd()*pal.length)];for(const dx of [-S,0,S])for(const dy of [-S,0,S]){const X=x+dx,Y=y+dy;if(X+r<0||X-r>S||Y+r<0||Y-r>S)continue;const gr=g.createRadialGradient(X,Y,0,X,Y,r);gr.addColorStop(0,c+'d0');gr.addColorStop(1,c+'00');g.fillStyle=gr;g.fillRect(X-r,Y-r,2*r,2*r);}}
 const blade=['#4f6b35','#6c8a47','#83a057','#a4ad6b','#95a05f','#5d7a3e'];
 for(let i=0;i<110000;i++){const x=rnd()*S,y=rnd()*S;g.strokeStyle=blade[Math.floor(rnd()*blade.length)];g.globalAlpha=.35+rnd()*.5;g.lineWidth=.6+rnd()*.9;g.beginPath();g.moveTo(x,y);g.lineTo(x+(rnd()-.5)*4,y-2-rnd()*6);g.stroke();}
 g.globalAlpha=1;
 for(let i=0;i<260;i++){g.fillStyle='rgba(120,100,70,'+(.05+rnd()*.12)+')';g.beginPath();g.ellipse(rnd()*S,rnd()*S,2+rnd()*9,1+rnd()*5,rnd()*3,0,6.283);g.fill();}
 const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(65,65);tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 groundMat.map=tex;groundMat.bumpMap=tex;groundMat.bumpScale=.05;groundMat.color.set('#ffffff');groundMat.emissive.set('#ffffff');groundMat.emissiveMap=tex;groundMat.emissiveIntensity=0;groundMat.needsUpdate=true;
 // Horizonte: montañas lejanas, colinas y línea de árboles, en un cilindro fijo al terreno.
 const W=4096,H=1024,hc=document.createElement('canvas');hc.width=W;hc.height=H;const h=hc.getContext('2d');
 const yh=Math.round((1-(gradeY+900)/1200)*H);
 const layer=(amp,color,freqs)=>{h.fillStyle=color;h.beginPath();h.moveTo(0,H);for(let x=0;x<=W;x+=4){let y=yh;for(const [k,a,p] of freqs)y-=amp*a*(.5+.5*Math.sin(2*Math.PI*k*x/W+p));h.lineTo(x,y);}h.lineTo(W,H);h.closePath();h.fill();};
 layer(95,'#9db2c6',[[3,1,.5],[7,.5,2],[13,.25,4],[29,.1,1]]);
 layer(58,'#7f9aa0',[[4,1,1.3],[9,.5,.2],[17,.25,3],[41,.1,2]]);
 layer(30,'#5f7f66',[[6,1,2],[15,.5,1],[29,.3,5],[67,.1,3]]);
 h.fillStyle='#3f5e3a';for(let x=0;x<W;x+=6){const r=4+rnd()*9;h.beginPath();h.arc(x,yh-r*.35,r,0,6.283);h.fill();}
 h.fillStyle='#4f7a3c';h.fillRect(0,yh,W,H-yh);
 const hz=h.createLinearGradient(0,yh-130,0,yh+6);hz.addColorStop(0,'rgba(220,232,238,0)');hz.addColorStop(1,'rgba(220,232,238,.5)');h.fillStyle=hz;h.fillRect(0,yh-130,W,136);
 const hTex=new T.CanvasTexture(hc);hTex.colorSpace=T.SRGBColorSpace;hTex.wrapS=T.RepeatWrapping;hTex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const horizon=new T.Mesh(new T.CylinderGeometry(1400,1400,1200,160,1,true),new T.MeshBasicMaterial({map:hTex,side:T.BackSide,transparent:true,depthWrite:false,fog:false,toneMapped:false}));
 horizon.position.set(9,-300,0);horizon.rotation.y=.45;horizon.renderOrder=-1;landscapeWorld.add(horizon);window.horizonMat=horizon.material;
}
function updateLandscapeBackground(){const cut=($('sectionGround')?$('sectionGround').checked:false)||($('hideTerrain')&&$('hideTerrain').checked);landscapeWorld.visible=landscapeEnabled&&!isolated&&!cut;terrainMesh.visible=false;completeTerrain.visible=true;sectionWorld.visible=false;scene.background=cut||!landscapeEnabled?sectionBackgroundColor:normalLandscapeColor;}
const landscapeOption=document.createElement('label');landscapeOption.innerHTML='<input type="checkbox" id="landscapeToggle" checked> Entorno 3D integrado';$('viewOptions').append(landscapeOption);$('landscapeToggle').onchange=()=>{landscapeEnabled=$('landscapeToggle').checked;scene.background=new T.Color(landscapeEnabled?'#b9d5e7':'#dfe8ed');updateLandscapeBackground()};

const sectionOption=document.createElement('label');sectionOption.innerHTML='<input id="sectionGround" type="checkbox"> Corte general del sótano';$('viewOptions').append(sectionOption);
const cutGeneralButton=document.createElement('button');cutGeneralButton.id='cutGeneralButton';$('viewbar').firstElementChild.append(cutGeneralButton);
function setGeneralCut(enabled){
 $('sectionGround').checked=enabled;substation.frontClosure.visible=!enabled;
 cutGeneralButton.textContent=enabled?'Cerrar corte':'Corte general';cutGeneralButton.setAttribute('aria-pressed',String(enabled));
 updateLandscapeBackground();
 if(enabled){setProView('front');}else{setProView('iso');campusNav.target.set(9.5,6.7,-1.1);elevation=.23;distance*=.92;$('viewName').textContent='Instalación exterior · paisaje integrado';}
 renderer.shadowMap.needsUpdate=true;
}
const landscapeButton=document.createElement('button');landscapeButton.id='landscapeViewButton';landscapeButton.textContent='Exterior';landscapeButton.onclick=()=>{landscapeEnabled=true;$('landscapeToggle').checked=true;setGeneralCut(false);};$('viewbar').firstElementChild.append(landscapeButton);
cutGeneralButton.onclick=()=>setGeneralCut(!$('sectionGround').checked);$('sectionGround').onchange=()=>setGeneralCut($('sectionGround').checked);
routeBtn.onclick=()=>{setGeneralCut(true);setProView('plant');campusNav.target.set(3.5,2.8,.8);distance=15;angle=.12;elevation=.10;$('viewName').textContent='Canalizaciones · potencia, control y PE';};
const coversBtnAction=coversBtn.onclick;
const plantDetailButton=document.createElement('button');plantDetailButton.id='plantDetailButton';plantDetailButton.textContent='Motor y alternador';plantDetailButton.onclick=()=>{setGeneralCut(true);setProView('plant');campusNav.target.set(.3,1.55,.3);distance=10;angle=.38;elevation=.24;$('viewName').textContent='Grupo electrógeno · detalle mecánico';};$('equipmentFocus').prepend(plantDetailButton);
const transformerCut=document.createElement('label');transformerCut.innerHTML='<input id="transformerCut" type="checkbox"> Interior de transformadores';$('viewOptions').append(transformerCut);
$('transformerCut').onchange=()=>{for(const key of ['TE','TP']){const g=substation.subParts[key];g.userData.tankShell.visible=!$('transformerCut').checked;g.userData.core.visible=$('transformerCut').checked;}renderer.shadowMap.needsUpdate=true;};
const overlayOption=document.createElement('label');overlayOption.innerHTML='<input id="flowOverlay" type="checkbox" checked> Ver flujo a través de canalizaciones';$('viewOptions').append(overlayOption);
$('flowOverlay').onchange=()=>{for(const f of substation.flowItems)if(!['air','exhaust'].includes(f.kind)){for(const m of [f.conduit,...f.dots]){m.material.depthTest=!$('flowOverlay').checked;m.material.needsUpdate=true;}}};
const hint=document.createElement('p');hint.className='mini-note';hint.textContent='Las flechas indican transferencia de energía activa. Su animación y colores son didácticos; el PE no conduce potencia en operación normal.';$('viewOptions').append(hint);
const energyStrip=document.createElement('div');energyStrip.id='energyStrip';energyStrip.innerHTML='<span class="energy-label">RUTA ACTIVA</span><b id="energyPath"></b><span id="energyPower"></span><div class="energy-track"><i id="energyLevel"></i></div>';$('viewer').append(energyStrip);
const viewShortcuts=document.createElement('div');viewShortcuts.id='detailShortcuts';viewShortcuts.innerHTML='<span>INSPECCIONAR</span><button id="quickTE">TE</button><button id="quickTP">TP</button><button id="quickBus">Barras</button><button id="quickPlant">Motor</button>';$('viewer').append(viewShortcuts);
$('quickTE').onclick=()=>$('focusTE').click();$('quickTP').onclick=()=>$('focusTP').click();$('quickBus').onclick=()=>setProView('bus');$('quickPlant').onclick=()=>plantDetailButton.click();
$('proGround').parentElement.lastChild.textContent=' Masa de terreno y cimentación';
$('proFence').parentElement.lastChild.textContent=' Cerramiento perimetral';
document.querySelector('.rail-head b').textContent='SE / 01';document.querySelector('header h1').textContent='Subestación y generación de respaldo';document.querySelector('header small').textContent='SISTEMA DE SUPERVISIÓN / SE-01';
$('explode').value=0;$('xray').value=0;$('housing').value='open';updateView();
setGeneralCut(false);
const breakerFocus=document.createElement('section');breakerFocus.className='card';breakerFocus.innerHTML='<h2>Interruptores de potencia</h2><div class="buttons" id="breakerFocusButtons"></div><p class="mini-note">Configuraciones visuales inspiradas en las referencias. La escala y tecnología son representativas; los datos nominales y el medio de interrupción requieren selección de equipo.</p>';$('explore').prepend(breakerFocus);
for(const [key,x,z] of [['QN',17.9,-1.6],['QG',18.4,1.3],['QS',20.8,-.9]]){const b=document.createElement('button');b.id='inspect'+key;b.textContent=key+' · '+({QN:'Red',QG:'Respaldo',QS:'Salida'})[key];b.onclick=()=>{cameraPreset('outside');campusNav.target.set(x,7.95,z);distance=key==='QS'?5.9:6.3;angle=key==='QS'?-.28:.70;elevation=.25;$('hideFence').checked=true;$('viewName').textContent=key+' · '+substation.subParts[key].userData.breakerType;$('viewCode').textContent='INSPECCIÓN / INTERRUPTOR';};$('breakerFocusButtons').append(b);}
const quickBreaker=document.createElement('button');quickBreaker.textContent='Interruptores';quickBreaker.onclick=()=>$('inspectQG').click();$('detailShortcuts').append(quickBreaker);
const instrumentPanel=document.createElement('section');instrumentPanel.className='card';instrumentPanel.innerHTML='<h2>Transformadores de medida</h2><div class="buttons"><button id="inspectTC">TC · Corriente</button><button id="inspectVTM">TP · Potencial</button></div><p class="mini-note">TC: dos terminales primarios P1/P2 y secundarios S1/S2. TP-M: derivación de tensión y caja secundaria. Relación, clase y carga nominal pendientes de selección.</p>';$('explore').prepend(instrumentPanel);
function inspectInstrument(kind){cameraPreset('outside');const ctView=kind==='ct';campusNav.target.set(ctView?18.3:19.95,8.20,ctView?-4.65:-3.75);distance=ctView?5.1:4.3;angle=ctView?2.88:3.08;elevation=.20;$('hideFence').checked=true;$('viewName').textContent=ctView?'TC · transformadores de corriente':'TP-M · transformadores de potencial';$('viewCode').textContent='INSPECCIÓN / MEDICIÓN';}
$('inspectTC').onclick=()=>inspectInstrument('ct');$('inspectVTM').onclick=()=>inspectInstrument('vt');
for(const [id,txt] of [['inspectTC','TC'],['inspectVTM','TP-M']]){const btn=document.createElement('button');btn.textContent=txt;btn.onclick=()=>$(id).click();$('detailShortcuts').append(btn);}
window.PlantaLab={getState:()=>snapshot(),tick,apply,scenario,start,transfer,stop,gridToggle,reset,parts:()=>pieces.length};

// Physically shaded industrial finishes. Generated locally: no network textures.
function applyIndustrialRealism(){
 const tex=(kind)=>{const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),im=ctx.createImageData(256,256);let seed=71429;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4;let v=kind==='metal'?176+(rnd()-.5)*20+Math.sin(y*.8)*7:168+(rnd()-.5)*42;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255;}ctx.putImageData(im,0,0);
 const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(kind==='metal'?3:5,kind==='metal'?3:5);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;};
 const metalTex=tex('metal'),grain=tex('grain');
 // A broad sky and ground environment gives metals a reflected horizon and soft highlights.
 const env=document.createElement('canvas');env.width=1024;env.height=512;const ec=env.getContext('2d');const grad=ec.createLinearGradient(0,0,0,512);grad.addColorStop(0,'#b4c9df');grad.addColorStop(.38,'#dce5ec');grad.addColorStop(.51,'#9ca5aa');grad.addColorStop(.57,'#77766c');grad.addColorStop(1,'#454944');ec.fillStyle=grad;ec.fillRect(0,0,1024,512);
 const glow=ec.createRadialGradient(260,150,2,260,150,170);glow.addColorStop(0,'rgba(255,249,226,.9)');glow.addColorStop(1,'rgba(255,249,226,0)');ec.fillStyle=glow;ec.fillRect(0,0,1024,512);
 const et=new T.CanvasTexture(env);et.colorSpace=T.SRGBColorSpace;et.mapping=T.EquirectangularReflectionMapping;const pm=new T.PMREMGenerator(renderer);const rt=pm.fromEquirectangular(et);scene.environment=rt.texture;scene.environmentIntensity=.48;et.dispose();pm.dispose();
 const finish=m=>{if(!m?.isMeshStandardMaterial||m.userData.industrialFinish)return;m.userData.industrialFinish=true;
 if(m.emissive?.getHex()>0||m.transparent)return;
 if(m.metalness>.45){m.roughness=Math.max(.27,Math.min(.48,m.roughness));m.roughnessMap=metalTex;m.bumpMap=metalTex;m.bumpScale=.0025;m.envMapIntensity=.8;}
 else if(!m.map){m.bumpMap=grain;m.bumpScale=m.metalness>.05?.003:.008;m.roughness=m.metalness>.05?.55:.88;m.envMapIntensity=.3;}
 else {m.envMapIntensity=.25;}m.needsUpdate=true;};
 scene.traverse(o=>{if(o.isMesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(finish);});
 // Keep texture treatment after the user reapplies a generator configuration.
 const previousBuild=build;build=function(){previousBuild();root.traverse(o=>{if(o.isMesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(finish);});renderer.shadowMap.needsUpdate=true;};
 for(const l of scene.children)if(l.isHemisphereLight){l.intensity=1.05;l.color.set('#e4ecf4');l.groundColor.set('#65665e');}
 light.intensity=3.0;light.color.set('#fff1dc');rim.intensity=.55;renderer.toneMappingExposure=1.05;
 light.shadow.mapSize.set(2048,2048);if(light.shadow.map){light.shadow.map.dispose();light.shadow.map=null;}light.shadow.bias=-.00008;light.shadow.normalBias=.016;
 // Fill the basement with broad practical ceiling lighting, without point-light glare.
 const fill=new T.PointLight('#edf3f3',24,17,2);fill.position.set(.5,4.9,2.5);scene.add(fill);
 renderer.shadowMap.needsUpdate=true;
}
applyIndustrialRealism();

function refineIndustrialSurfaces(){
 let seed=8173;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const maps={};
 function surface(kind){if(maps[kind])return maps[kind];const cv=document.createElement('canvas');cv.width=cv.height=512;const ctx=cv.getContext('2d'),im=ctx.createImageData(512,512);
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){let noise=(rnd()-.5),cloud=Math.sin(x*.045)*Math.sin(y*.031)+Math.sin(x*.013+y*.02);let v=kind==='concrete'?218+noise*22:kind==='zinc'?238+noise*12:246+noise*5;let i=(y*512+x)*4;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255;}ctx.putImageData(im,0,0);
 if(kind==='concrete'){for(let i=0;i<1600;i++){ctx.fillStyle='rgba(70,66,58,'+(rnd()*.15)+')';ctx.beginPath();ctx.arc(rnd()*512,rnd()*512,.25+rnd()*1.4,0,Math.PI*2);ctx.fill();}}
 const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(kind==='paint'?2:3,kind==='paint'?2:3);t.anisotropy=8;maps[kind]=t;return t;}
 function finish(m){if(!m?.isMeshStandardMaterial||m.userData.refined||m.transparent||m.emissive?.getHex()>0)return;m.userData.refined=true;const hsl={};m.color.getHSL(hsl);
 if(!m.map){
 const ceramic=hsl.h>.02&&hsl.h<.095&&hsl.s>.22&&m.metalness<.45;
 if(ceramic){m.roughness=.24;m.metalness=.03;m.bumpScale=.0004;m.envMapIntensity=.7;}
 else if(m.metalness>.5){m.map=surface('zinc');m.roughness=.47;m.roughnessMap=null;m.bumpScale=.0008;m.envMapIntensity=.6;}
 else if(hsl.s<.14&&m.metalness<.05&&hsl.l>.22){m.map=surface('concrete');m.roughness=.94;m.bumpMap=surface('concrete');m.bumpScale=.012;}
 else {m.map=surface('paint');m.roughness=m.metalness>.05?.54:.8;m.roughnessMap=null;m.bumpScale=.0015;}
 }
 m.needsUpdate=true;}
 scene.traverse(o=>{if(o.isMesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(finish)});
 const old=build;build=function(){old();root.traverse(o=>{if(o.isMesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(finish)});};
 // Small construction joints and fasteners attached to the existing basement structure.
 const detailing=new T.Group();detailing.name='Juntas_y_fijaciones_constructivas';substation.site.add(detailing);
 const joint=mat('#555957'),bolt=mat('#a0a3a2',.7);
 for(const x of [-6,-3,0,3,6])box(detailing,[.012,.004,9.3],[x,.012,0],joint);
 for(const z of [-3,0,3])box(detailing,[14.2,.004,.012],[.3,.014,z],joint);
 for(const x of [-6.9,7.8])for(const z of [-4.8,4.8]){for(const dx of [-.30,.30])for(const dz of [-.30,.30]){cyl(detailing,.045,.012,[x+dx,.176,z+dz],bolt);cyl(detailing,.027,.048,[x+dx,.201,z+dz],bolt);}}
 renderer.shadowMap.needsUpdate=true;
}
refineIndustrialSurfaces();

// Preliminary factory layout: coordinates are illustrative metres, not an approved site plan.
const factory=new T.Group();factory.name='Fabrica_metalmecanica_preliminar';scene.add(factory);
const factoryRoof=new T.Group(),factoryFront=new T.Group();factory.add(factoryRoof,factoryFront);
const fc=mat('#a5a59a'),fs=mat('#63757c',.65),panel=mat('#c5cbc8',.25),basepaint=mat('#42545b',.25),glass=mat('#435e68',.35),road=mat('#494b49'),safety=mat('#dcc15b');
box(factory,[46,.28,36],[64,6.52,0],fc);box(factory,[40,.20,28],[64,6.77,0],mat('#929991'));
// 16 m conceptual separation from the existing east edge x=28 to the nave x=44.
const asphaltCanvas=document.createElement('canvas');asphaltCanvas.width=asphaltCanvas.height=128;const asphaltContext=asphaltCanvas.getContext('2d');let asphaltSeed=714;
for(let y=0;y<128;y++)for(let x=0;x<128;x++){asphaltSeed=(Math.imul(asphaltSeed,1664525)+1013904223)>>>0;const v=95+(asphaltSeed%46);asphaltContext.fillStyle='rgb('+v+','+v+','+v+')';asphaltContext.fillRect(x,y,1,1);}
const asphaltTexture=new T.CanvasTexture(asphaltCanvas);asphaltTexture.wrapS=asphaltTexture.wrapT=T.RepeatWrapping;asphaltTexture.repeat.set(4,240);road.map=asphaltTexture;road.roughness=.96;road.color.set('#737779');road.needsUpdate=true;
box(factory,[8,.12,1200],[35,6.55,0],road);
for(let z=-597;z<599;z+=5)box(factory,[.12,.012,2.2],[35,6.619,z],mat('#e0ddc8'));
// Sidewalks and kerbs leave an opening at the factory driveway.
for(const [z,len] of [[-292,616],[317.5,565]]){
 box(factory,[.22,.22,len],[39.12,6.64,z],fc);box(factory,[1.5,.20,len],[39.98,6.63,z],fc);
}
box(factory,[.22,.22,1200],[30.88,6.64,0],fc);box(factory,[1.5,.20,1200],[30.02,6.63,0],fc);
for(const x of [31.3,38.7])box(factory,[.10,.008,1199],[x,6.618,0],mat('#d9d7c9'));
box(factory,[7,.10,18],[42.5,6.58,25],road);
for(const x of [28.8,41.2])box(factory,[.85,.035,1200],[x,6.525,0],mat('#7f8075'));

for(let z=-598;z<600;z+=4){box(factory,[1.5,.006,.018],[30.02,6.735,z],mat('#7b807a'));if(z<16||z>34)box(factory,[1.5,.006,.018],[39.98,6.735,z],mat('#7b807a'));}
for(const z of [-168,-128,-88,-48,-8,44,84,124,164]){box(factory,[.45,.025,.7],[38.65,6.635,z],mat('#303638',.5));for(let j=0;j<6;j++)box(factory,[.34,.014,.025],[38.65,6.655,z-.26+j*.1],fs);}

box(factory,[40,.3,12],[64,6.52,23],fc);
for(let x=47;x<83;x+=3){box(factory,[.09,.015,5],[x,6.69,24],mat('#eee9d7'));}
for(const x of [44,52,60,68,76,84])for(const z of [-14,14]){
 box(factory,[.85,.18,.85],[x,6.94,z],fs);box(factory,[.24,7.0,.32],[x,10.48,z],fs);
 for(const dx of [-.27,.27])for(const dz of [-.27,.27])cyl(factory,.032,.09,[x+dx,7.08,z+dz],steel);
}
for(const x of [44,52,60,68,76,84]){
 proPipe(factoryRoof,[[x,13.98,-14],[x,15.4,0],[x,13.98,14]],.14,fs,.04);
 for(const z of [-10,-5,0,5,10])box(factoryRoof,[.15,.17,28],[x,13.5,z*0],fs).visible=z===0;
}
for(const side of [-1,1]){const roof=box(factoryRoof,[40.8,.12,14.5],[64,14.7,side*7],panel);roof.rotation.x=side*.101;
 for(let x=44;x<=84;x+=1) {const rib=box(factoryRoof,[.045,.055,14.5],[x,14.79,side*7],fs);rib.rotation.x=side*.101;}}
box(factory,[40,6.5,.15],[64,10.12,-14],panel);box(factory,[.15,6.5,28],[84,10.12,0],panel);box(factory,[.15,6.5,28],[44,10.12,0],panel);
for(let x=44.5;x<84;x+=.8)box(factory,[.045,6.5,.045],[x,10.12,-13.89],fs);
for(const x of [47,56,65,74,82])box(factoryFront,[x===82?4:6,6.5,.15],[x,10.12,14],panel);
for(const x of [51.5,60.5,69.5,78.5]){box(factoryFront,[2.8,3.5,.18],[x,8.65,14],basepaint);for(let y=7;y<10.4;y+=.22)box(factoryFront,[2.72,.025,.045],[x,y,14.12],fs);}
proPlate(factoryFront,'MECANIZADO · ENSAMBLE · CONTROL DE CALIDAD',[64,12.1,14.16],21,'#354b52',.65);
// Attached administration at east, glazed frontage and entrance.
// Administration uses separate walls; its former solid body intersected the CCM stair shaft.
const administrationWalls=new T.Group();administrationWalls.name='Administracion_muros_independientes';factory.add(administrationWalls);
const adminFinish=mat('#d1d0c3');
for(const xx of [74.5,79.7])box(administrationWalls,[.16,3.30,9],[xx,8.53,8.8],adminFinish);
box(administrationWalls,[5.2,3.30,.16],[77.1,8.53,4.3],adminFinish);
// Front wall has two glazed openings.
box(administrationWalls,[5.2,.85,.16],[77.1,7.305,13.3],adminFinish);
box(administrationWalls,[5.2,.80,.16],[77.1,9.78,13.3],adminFinish);
for(const xx of [75.75,78.05])box(administrationWalls,[1.50,1.65,.04],[xx,8.55,13.30],glass);
for(const [xa,xb]of [[74.5,75.0],[76.5,77.3],[78.8,79.7]])box(administrationWalls,[xb-xa,1.65,.16],[(xa+xb)/2,8.55,13.3],adminFinish);
box(factoryRoof,[5.6,.16,9.4],[77.1,10.26,8.8],panel);proPlate(administrationWalls,'ADMINISTRACIÓN',[77.1,9.83,13.42],4.6,'#354b52',.30);
// Internal manufacturing cells; no assumed electrical rating assigned to the generic machines.
const latheCells=[];
function cnc(x,z,index){
 const g=new T.Group();g.name='Torno_CNC_'+index;factory.add(g);g.position.set(x,6.89,z);latheCells.push(g);
 const graphite=mat('#363d40',.3),ivory=mat('#d9dbd3',.2),green=mat('#52a833',.25),machined=mat('#a9b3b5',.8),blackTrim=mat('#182125'),windowGlass=new T.MeshStandardMaterial({color:'#73918c',metalness:.12,roughness:.18,transparent:true,opacity:.34,depthWrite:false});
 // One continuous machine base, supported on levelling pads.
 box(g,[4.9,.34,2.30],[0,.28,0],graphite);
 for(const dx of [-1.95,0,1.95])for(const dz of [-.78,.78]){cyl(g,.13,.12,[dx,.06,dz],blackTrim);cyl(g,.05,.18,[dx,.16,dz],machined);}
 box(g,[4.72,.48,2.14],[0,.63,0],graphite);box(g,[4.7,.10,2.36],[0,.88,0],blackTrim);
 box(g,[4.9,1.48,.15],[0,1.63,-1.08],ivory);box(g,[4.9,.10,2.2],[0,2.39,0],ivory);
 box(g,[.20,1.58,2.18],[-2.36,1.62,0],ivory);box(g,[.20,1.58,2.18],[2.36,1.62,0],green);
 // Left spindle housing, side service enclosure and ventilated cooling cabinet.
 box(g,[1.24,1.47,2.10],[-1.60,1.64,0],graphite);
 box(g,[.48,1.28,1.76],[-2.08,1.61,.05],green);
 box(g,[.54,.68,.85],[-2.10,1.20,1.03],green);
 for(let yy=.97;yy<1.5;yy+=.08)for(const xx of [-2.25,-2.08,-1.91])box(g,[.12,.025,.012],[xx,yy,1.463],blackTrim);
 for(let yy=.39;yy<.81;yy+=.07)for(let xx=-2.24;xx<-1.38;xx+=.16)box(g,[.10,.02,.012],[xx,yy,1.077],blackTrim);
 // Bed, lead screw and rack remain visible below the carriage.
 for(const dz of [-.35,.35])box(g,[3.38,.11,.12],[.40,1.06,dz],machined);
 cyl(g,.045,3.68,[.18,.76,1.17],machined,'x');cyl(g,.036,3.68,[.18,.57,1.17],machined,'x');
 for(let xx=-1.54;xx<2.0;xx+=.09)box(g,[.025,.07,.10],[xx,.41,1.15],machined);
 // Actual turning axis runs horizontally along the bed.
 cyl(g,.28,.17,[-.90,1.57,0],machined,'x');cyl(g,.19,.08,[-.77,1.57,0],graphite,'x');
 for(let j=0;j<3;j++){const a=j*2*Math.PI/3;box(g,[.13,.095,.10],[-.70,1.57+Math.cos(a)*.18,Math.sin(a)*.18],machined).rotation.x=a;}
 cyl(g,.11,1.35,[-.02,1.57,0],machined,'x');
 box(g,[.70,.16,.74],[.32,1.18,.16],graphite);box(g,[.45,.13,.40],[.32,1.32,.16],machined);cyl(g,.19,.13,[.32,1.48,.28],graphite,'z');
 for(let j=0;j<6;j++){const a=j*Math.PI/3;box(g,[.11,.09,.19],[.32+Math.cos(a)*.16,1.48+Math.sin(a)*.16,.40],machined);}
 box(g,[.45,.35,.45],[1.48,1.40,0],ivory);cyl(g,.11,.37,[1.21,1.57,0],machined,'x');mesh(g,new T.ConeGeometry(.09,.20,20),machined,[.98,1.57,0]).rotation.z=Math.PI/2;
 // Sliding front door frames a transparent inspection window.
 box(g,[1.85,.43,.10],[.20,1.20,1.12],ivory);box(g,[1.85,.29,.10],[.20,2.24,1.12],ivory);
 for(const dx of [-.68,1.08])box(g,[.11,.78,.10],[dx,1.81,1.12],ivory);
 box(g,[1.63,.65,.025],[.20,1.82,1.13],windowGlass);box(g,[1.65,.035,.045],[.20,2.16,1.15],blackTrim);box(g,[1.65,.035,.045],[.20,1.48,1.15],blackTrim);
 proPipe(g,[[-.31,1.36,1.24],[.14,1.36,1.24]],.032,mat('#bb3230'),.02);
 // Right control console: display, keypad, selectors and red emergency stop.
 box(g,[.93,1.38,.12],[1.62,1.65,1.12],ivory);box(g,[.62,.78,.10],[1.60,2.0,1.24],blackTrim);
 box(g,[.43,.33,.015],[1.53,2.17,1.30],mat('#25404a'));proPlate(g,'X 0.000  Z 0.000',[1.53,2.17,1.32],.37,'#21343c',.042);
 for(let row=0;row<5;row++)for(let col=0;col<6;col++)box(g,[.037,.037,.015],[1.37+col*.07,1.95-row*.06,1.302],mat('#c1c7c2'));
 cyl(g,.055,.026,[1.40,1.59,1.31],mat('#d4b63b'),'z');cyl(g,.035,.045,[1.40,1.59,1.34],mat('#b52f2e'),'z');for(const xx of [1.57,1.71])cyl(g,.025,.032,[xx,1.59,1.32],mat(xx===1.57?'#4f8c62':'#39484c'),'z');
 box(g,[.88,.40,.16],[.86,.98,1.26],graphite);
 for(const xx of [.61,1.11]){cyl(g,.12,.06,[xx,1.01,1.39],blackTrim,'z');cyl(g,.085,.075,[xx,1.01,1.40],machined,'z');cyl(g,.025,.07,[xx+.07,1.08,1.47],blackTrim,'z');}
 for(const xx of [-2.32,-1.03,1.21,2.30])for(const yy of [.34,.78,2.32])cyl(g,.018,.02,[xx,yy,1.12],machined,'z');
 box(g,[1.05,.55,.20],[1.70,1.28,-1.20],graphite);cyl(g,.055,.08,[1.34,.86,1.02],blackTrim,'z');
 // Industrial status stack and restrained identification.
 cyl(g,.023,.22,[-1.61,2.55,-.72],machined);for(const [yy,color]of [[2.68,'#b6483f'],[2.78,'#c2a34c'],[2.88,'#458058']])cyl(g,.055,.085,[-1.61,yy,-.72],mat(color));
 // Main inverter-fed spindle motor is mounted behind the lower service cover.
 box(g,[.72,.62,.56],[-.78,1.12,-1.27],dark);for(let j=0;j<10;j++)box(g,[.040,.56,.035],[-1.12+j*.075,1.12,-1.57],steel);
 cyl(g,.22,.10,[-.78,1.12,-1.57],dark,'z');cyl(g,.055,.22,[-.78,1.12,-1.67],steel,'z');box(g,[.23,.16,.22],[-.58,1.49,-1.25],basepaint);
 proPipe(g,[[-.58,1.55,-1.25],[-.35,1.60,-1.22],[-.35,1.60,-1.05]],.025,black,.06);
 proPlate(g,'M-SP-'+String(index).padStart(2,'0'),[-.78,1.12,-.975],.46,'#324144',.085);
 proPlate(g,'TORNO CNC-'+String(index).padStart(2,'0'),[-1.40,2.12,1.09],.95,'#324144',.105);
 proPlate(g,'ATENCIÓN',[-2.08,1.98,1.00],.26,'#ad9639',.055);
}

const millingCells=[];
function millingMachine(x,z,index){
 const g=new T.Group();g.name='Fresadora_vertical_'+index;factory.add(g);g.position.set(x,6.89,z);millingCells.push(g);
 const enamel=mat('#688f94',.22),cast=mat('#52787e',.25),steelMill=mat('#acb6b5',.82),darkMill=mat('#20292a'),rubberMill=mat('#232a2a'),brassMill=mat('#bca15d',.55);
 // Cast pedestal, column and knee: an open conventional vertical mill.
 box(g,[1.05,.17,1.53],[0,.085,-.12],cast);for(const xx of [-.39,.39])for(const zz of [-.67,.43]){cyl(g,.05,.05,[xx,.19,zz],steelMill);}
 box(g,[.64,.77,.75],[0,.51,-.16],enamel);box(g,[.48,1.08,.48],[0,1.35,-.46],enamel);cyl(g,.28,.30,[0,1.98,-.46],cast);
 box(g,[.59,.59,.84],[0,.68,.20],enamel);box(g,[.49,.06,.76],[0,1.0,.24],steelMill);box(g,[.60,.13,.48],[0,1.08,.37],cast);
 // Elevating screw and dovetail ways below the sliding saddle.
 cyl(g,.055,.67,[0,.54,.60],steelMill);for(const xx of [-.25,.25])box(g,[.055,.55,.045],[xx,.73,.63],steelMill);
 box(g,[.36,.37,.12],[0,.52,.72],enamel);box(g,[.34,.14,.56],[0,1.17,.43],steelMill);
 // Long X table, raised edges and recessed T-slot strips.
 box(g,[2.36,.16,.52],[0,1.24,.53],steelMill);for(const zz of [.36,.50,.64]){box(g,[2.25,.009,.026],[0,1.326,zz],darkMill);box(g,[2.25,.008,.011],[0,1.33,zz+.024],steelMill);}
 cyl(g,.032,2.52,[0,1.17,.78],steelMill,'x');for(const xx of [-1.20,1.20])box(g,[.10,.23,.58],[xx,1.22,.53],enamel);
 // Real handwheels with hubs, spokes, rims and crank grips.
 function wheel(cx,cy,cz,r,axis='z'){
  const w=new T.Group();g.add(w);w.position.set(cx,cy,cz);if(axis==='x')w.rotation.y=Math.PI/2;
  mesh(w,new T.TorusGeometry(r,.018,8,28),darkMill);cyl(w,.052,.075,[0,0,0],steelMill,'z');
  for(let j=0;j<3;j++){const a=j*2*Math.PI/3;const sp=box(w,[.022,r,.025],[Math.sin(a)*r*.5,Math.cos(a)*r*.5,0],steelMill);sp.rotation.z=-a;}
  cyl(w,.023,.13,[r*.78,0,.095],rubberMill,'z');
 }
 wheel(-1.36,1.22,.53,.14,'x');wheel(1.36,1.22,.53,.14,'x');wheel(.33,.96,.86,.17);wheel(0,.68,.91,.12);
 cyl(g,.048,.19,[-.27,.77,.83],steelMill,'z');cyl(g,.019,.15,[-.22,.84,.96],rubberMill,'z');
 // Swivelling ram supports the head rather than floating over the table.
 box(g,[.38,.22,.95],[0,2.12,-.13],enamel);cyl(g,.20,.13,[0,2.05,.25],cast,'z');
 box(g,[.49,.46,.53],[0,2.19,.32],enamel);cyl(g,.16,.40,[0,1.83,.38],enamel);cyl(g,.075,.19,[0,1.55,.38],steelMill);cyl(g,.046,.11,[0,1.41,.38],darkMill);
 // Finned vertical spindle drive and cooling fan sit on the milling head.
 cyl(g,.17,.37,[0,2.60,.32],darkMill);mesh(g,new T.SphereGeometry(.17,20,10),cast,[0,2.79,.32]).scale.y=.45;
 box(g,[.22,.35,.30],[-.36,2.46,-.37],darkMill);for(let j=0;j<6;j++)box(g,[.20,.025,.32],[-.36,2.34+j*.045,-.37],steelMill);cyl(g,.12,.08,[-.36,2.70,-.37],steelMill,'y');
 proPipe(g,[[-.36,2.30,-.37],[-.44,2.10,-.38],[-.28,1.93,-.20]],.018,rubberMill,.05);
 proPlate(g,'M-FR-'+String(index).padStart(2,'0'),[-.36,2.52,-.205],.38,'#46666a',.062);
 for(let j=0;j<12;j++){const a=j*Math.PI/6;box(g,[.020,.30,.020],[Math.sin(a)*.172,2.60,.32+Math.cos(a)*.172],cast);}
 // Quill feed levers and dial on the side of the head.
 cyl(g,.065,.06,[.27,1.90,.39],steelMill,'x');for(let j=0;j<3;j++){const a=j*2*Math.PI/3;proPipe(g,[[.31,1.90,.39],[.31,1.90+Math.cos(a)*.23,.39+Math.sin(a)*.23]],.012,steelMill,.01);mesh(g,new T.SphereGeometry(.031,12,8),rubberMill,[.31,1.90+Math.cos(a)*.23,.39+Math.sin(a)*.23]);}
 cyl(g,.072,.017,[0,2.18,.60],ivoryMill(),'z');
 // Vise and workpiece on the table, clear of its travel controls.
 box(g,[.48,.06,.30],[.25,1.36,.53],cast);for(const xx of [.06,.40])box(g,[.055,.11,.28],[xx,1.44,.53],steelMill);box(g,[.27,.085,.18],[.23,1.44,.53],brassMill);cyl(g,.018,.14,[.52,1.42,.53],steelMill,'x');
 // Digital readout on a rigid bracket, flexible conduit and local controls.
 proPipe(g,[[.22,1.98,-.40],[.72,1.98,-.40],[.72,2.05,.02]],.025,cast,.08);box(g,[.57,.30,.10],[.72,2.07,.09],darkMill);
 proPlate(g,'X  0.000   Y  0.000   Z  0.000',[.72,2.08,.15],.50,'#263b3a',.040);
 for(const xx of [.82,.89,.96])for(const yy of [2.00,2.07,2.14])box(g,[.04,.035,.01],[xx,yy,.148],enamel);
 box(g,[.22,.20,.07],[-.30,1.86,.61],enamel);for(const [xx,col]of [[-.35,'#b03f35'],[-.25,'#43815c']])box(g,[.06,.07,.025],[xx,1.86,.66],mat(col));
 proPipe(g,[[.69,1.90,.03],[.83,1.40,-.29],[.43,.46,-.37]],.017,rubberMill,.12);
 proPipe(g,[[.26,.31,-.45],[.42,.61,-.46],[.30,1.71,-.48],[0,2.36,-.02]],.024,rubberMill,.09);
 box(g,[.20,.24,.14],[.43,.43,-.40],cast);cyl(g,.05,.08,[.43,.60,-.40],darkMill);proPipe(g,[[1.34,.86,1],[1.60,.86,1],[1.60,.25,1],[1.60,.25,-.40],[.43,.25,-.40],[.43,.43,-.40]],.026,rubberMill,.10);
 for(const xx of [-.23,.23])for(const yy of [.40,.71])cyl(g,.017,.025,[xx,yy,.65],steelMill,'z');
 proPlate(g,'FRESADORA-'+String(index).padStart(2,'0'),[0,1.68,-.205],.40,'#46666a',.065);
 function ivoryMill(){return mat('#d1d7cf');}
}
let ni=1,mi=1;for(const x of [49,55,61,67])for(const z of [-8,-1]){if(z===-1){millingMachine(x,z,mi++);ni++;}else cnc(x,z,ni++);}

for(const x of [48,54,60,66]){box(factory,[3,.13,1.2],[x,7.9,8],fs);for(const dx of [-1.2,1.2])box(factory,[.09,1,.9],[x+dx,7.35,8],fs);}
for(const x of [75,81]){for(const z of [-10,-5]){for(const dx of [-1.4,1.4])box(factory,[.09,3,.09],[x+dx,8.3,z],basepaint);for(const y of [7.2,8.4,9.6]){box(factory,[3,.09,1.3],[x,y,z],fs);box(factory,[1.9,.6,1],[x,y+.35,z],mat('#997c52'));}}}
// Walkways and overhead trays remain aligned with the structure.
for(const z of [-11,3.0,5.0])box(factory,[28,.014,.09],[58,6.885,z],safety);
for(const z of [-4,5]){for(const dz of [-.24,.24])box(factory,[29,.12,.035],[59,11.3,z+dz],fs);for(let x=45;x<74;x+=.7)box(factory,[.035,.04,.48],[x,11.26,z],fs);for(const x of [48,56,64,72]){cyl(factory,.012,2.6,[x,12.6,z],fs);box(factory,[1.8,.08,.3],[x,12.0,z+1.1],mat('#e4e6dc'));}}
box(factory,[1.5,2.1,.55],[45,7.95,5],basepaint);proPlate(factory,'TGBT · CAPACIDAD POR DEFINIR',[45,8.5,5.29],1.3,'#354b52',.20);
cyl(factory,.045,2.2,[40.8,7.75,14],fs);proPlate(factory,'ACCESO DE SERVICIO →',[40.8,8.6,14],3.1,'#354b52',.28);
// Future electrical corridor is a route reservation, not an energised feeder.


const factoryPanel=document.createElement('div');factoryPanel.className='card';factoryPanel.innerHTML='<h3>Fábrica metalmecánica</h3><p class="mini-note">Implantación preliminar: nave 40 × 28 m, ocho celdas CNC, ensamble, almacén y oficinas. Separación conceptual de 16 m entre nave y borde este de la subestación; no equivale a una distancia normativa validada. Alimentadores y demanda pendientes de cálculo.</p><div class="buttons"><button id="factoryView">Ver fábrica</button><button id="factoryCampus">Ver conjunto</button><button id="factoryCut">Abrir nave</button></div>';$('explore').prepend(factoryPanel);
function focusFactory(wide=false){setGeneralCut(false);cameraPreset('overall');campusNav.target.set(wide?45:80,9,0);distance=wide?165:85;angle=-.20;elevation=.53;camera.far=650;camera.updateProjectionMatrix();$('viewName').textContent=wide?'Fábrica y subestación · implantación preliminar':'Fábrica metalmecánica · producción y servicios';$('viewCode').textContent='AMPLIACIÓN / INDUSTRIA';}
$('factoryView').onclick=()=>focusFactory();$('factoryCampus').onclick=()=>focusFactory(true);$('factoryCut').onclick=()=>{factoryRoof.visible=!factoryRoof.visible;factoryFront.visible=factoryRoof.visible;$('factoryCut').textContent=factoryRoof.visible?'Abrir nave':'Cerrar nave';renderer.shadowMap.needsUpdate=true;focusFactory();};
const fb=document.createElement('button');fb.textContent='Fábrica';fb.onclick=()=>focusFactory();$('viewbar').firstElementChild.append(fb);
renderer.shadowMap.needsUpdate=true;

// Factory revision: physical routing and construction detail; engineering values remain pending.
const factoryServices=new T.Group();factory.add(factoryServices);
const fz=mat('#9ba5a7',.62),fpaint=mat('#aeb7b6',.25),frubber=mat('#292e30');
// Close the facade openings above doors and add masonry plinths, flashings and gutters.
box(factoryFront,[40,3.1,.20],[64,11.95,14],panel);
for(const x of [47,56,65,74,82])box(factoryFront,[x===82?4:6,.65,.27],[x,7.16,14.03],mat('#858982'));
for(const z of [-14.2,14.2]){box(factoryRoof,[41,.23,.22],[64,14.05,z],fz);for(const x of [44.3,83.7])proPipe(factoryFront,[[x,14.1,z],[x,13.8,z+.22],[x,7,z+.22]],.065,fz,.12);}
for(const x of [51.5,60.5,69.5,78.5]){box(factoryFront,[3.15,.17,.35],[x,10.5,14.16],fz);for(const dx of [-1.52,1.52])box(factoryFront,[.11,3.6,.24],[x+dx,8.7,14.15],fz);}
for(const x of [44,52,60,68,76,84])for(const z of [-14,14]){box(factory,[.5,.38,.08],[x,13.6,z+.19],fz);for(const dx of [-.15,.15])cyl(factory,.026,.045,[x+dx,13.65,z+.25],steel,'z');}
for(const z of [-10,-5,0,5,10])box(factoryRoof,[40,.14,.10],[64,15.36-Math.abs(z)*.101,z],fs);
for(const x of [48,64,80]){box(factoryRoof,[2.4,.12,3.2],[x,15.1,-3],glass);}
// Dedicated pedestrian access, kept independent from roller shutters.
box(factoryFront,[1.15,2.3,.22],[45.8,8.02,14.23],mat('#52756a',.18));box(factoryFront,[.85,.055,.09],[45.8,7.95,14.4],fz);
proSign(factoryFront,'exit','SALIDA',[45.8,9.8,14.4],.55);
proSign(factoryFront,'ppe','USO DE EPP',[48.2,8.7,14.25],.55);
// Panel dead-front detail and reserved clear working area (dimensions are design assumptions).
box(factoryServices,[1.33,1.94,.06],[45,7.95,5.31],fpaint);box(factoryServices,[.09,.32,.07],[45.5,8.0,5.37],frubber);
proSign(factoryServices,'warning','RIESGO ELÉCTRICO',[45,8.4,5.4],.45);
for(const x of [44.12,45.88])box(factoryServices,[.06,.016,1.65],[x,6.89,6.15],safety);
box(factoryServices,[1.82,.016,.06],[45,6.89,6.95],safety);
proPlate(factoryServices,'MANTENER LIBRE',[45,7.08,6.98],1.7,'#705e22',.17);
// Rigid feeder riser to the tray; branch drops and local disconnects at each CNC.
proPipe(factoryServices,[[45,9.0,5],[45,11.3,5],[45,11.3,-4]],.07,fz,.20);
let fidx=1;
for(const x of [49,55,61,67])for(const z of [-8,-1]){
 const trayZ=z===-8?-4:5;const dx=x+1.65;
 proPipe(factoryServices,[[dx,11.3,trayZ],[dx,11.3,z+1],[dx,8.7,z+1]],.038,fz,.16);
 box(factoryServices,[.42,.58,.22],[dx,8.40,z+1],fpaint);box(factoryServices,[.06,.19,.045],[dx+.1,8.4,z+1.14],frubber);
 proPlate(factoryServices,'DS-'+String(fidx++).padStart(2,'0'),[dx,8.59,z+1.13],.30,'#354b52',.075);
 proPipe(factoryServices,[[dx,8.1,z+1],[dx,7.75,z+1],[x+1.34,7.75,z+1]],.033,frubber,.14);
 for(const y of [9.15,10.15]){box(factoryServices,[.14,.045,.10],[dx,y,z+1],fz);}
 for(const zz of [z+1.6,z-1.6])box(factoryServices,[3.3,.012,.04],[x,6.89,zz],safety);
}
// Tray bonding jumpers and cable bundles. Cable sizes shown are illustrative.
for(const z of [-4,5]){for(const dz of [-.13,0,.13])proPipe(factoryServices,[[45,11.32,z+dz],[73.5,11.32,z+dz]],.026,frubber,.1);
 for(const x of [48,56,64,72])proPipe(factoryServices,[[x-.18,11.36,z+.25],[x,11.42,z+.29],[x+.18,11.36,z+.25]],.012,mat('#338052'),.04);}
// Service extinguishers and marked approach. Selection/quantity subject to fire-risk study.
for(const x of [46.6,72.3]){cyl(factoryServices,.13,.62,[x,7.65,13.6],mat('#b3372d'));cyl(factoryServices,.045,.12,[x,8.03,13.6],fz);proSign(factoryServices,'fire','EXTINTOR',[x,8.75,13.65],.48);}
// Floor slab joints, kerbs, bollards and ventilation louvers add real construction scale.
for(let x=46;x<84;x+=4)box(factory,[.008,.006,27.4],[x,6.879,0],mat('#68716c'));
for(const z of [-10,-6,-2,2,6,10])box(factory,[39.5,.006,.008],[64,6.881,z],mat('#68716c'));
for(const x of [50,53,59,62,68,71,77,80]){cyl(factoryFront,.085,.85,[x,7.15,15.1],safety);cyl(factoryFront,.089,.17,[x,7.4,15.1],frubber);}
for(const x of [47,57,67,77]){box(factoryFront,[1.5,.65,.12],[x,12.8,14.2],basepaint);for(let j=0;j<7;j++)box(factoryFront,[1.4,.035,.15],[x,12.54+j*.08,14.3],fz);}
const basis=document.createElement('details');basis.className='card';basis.innerHTML='<summary>Base normativa de la fábrica</summary><p>Referencia: NOM-001-SEDE-2012, artículos 110 (espacios y acceso), 250 (puesta a tierra y unión), 300 y 392 (canalizaciones y charolas), 430 y 670 (motores y maquinaria). NOM-026-STPS-2008: colores y señales de seguridad. NOM-029-STPS-2011: mantenimiento, unifilar y cuadro de cargas.</p><p>Modelado: tableros, desconectadores locales, bajadas protegidas, soportes y uniones de charolas, espacio libre y señalización. Pendiente: cuadro de cargas, calibres, ocupación, cortocircuito, coordinación, caída de tensión, malla de tierra y evaluación contra incendios. El modelo no acredita cumplimiento. La separación de 16 m es preliminar.</p><p>Las lecturas de potencia aún corresponden al circuito didáctico original.</p>';$('explore').append(basis);
renderer.shadowMap.needsUpdate=true;

// Direct interior inspection, keeping the original factory and campus views.
const insideFactoryButton=document.createElement('button');insideFactoryButton.id='factoryInterior';insideFactoryButton.textContent='Interior de fábrica';$('viewbar').firstElementChild.append(insideFactoryButton);
const factoryInteriorNav=document.createElement('div');factoryInteriorNav.id='factoryInteriorNav';factoryInteriorNav.className='buttons';factoryInteriorNav.style.cssText='position:absolute;bottom:130px;left:20px;z-index:12;background:#203640;padding:8px;border:1px solid #64818a;border-radius:6px;display:none;flex-wrap:wrap;max-width:calc(100% - 40px)';factoryInteriorNav.innerHTML='<button data-fzone="general">Interior general</button><button data-fzone="cnc">Máquinas CNC</button><button data-fzone="assembly">Ensamble</button><button data-fzone="storage">Almacén</button><button id="factoryInteriorExit">Volver al exterior</button>';$('viewer').append(factoryInteriorNav);
function inspectFactoryInterior(zone='general'){
 focusFactory();factoryRoof.visible=false;factoryFront.visible=false;$('factoryCut').textContent='Cerrar nave';
 const v={general:{p:[62,8.3,0],d:48,a:-.18,e:.38},cnc:{p:[55,8.3,-4],d:23,a:.28,e:.25},assembly:{p:[56,7.8,8],d:22,a:.08,e:.28},storage:{p:[78,8.2,-7],d:21,a:-.3,e:.28}}[zone];
 campusNav.target.set(v.p[0]+16,v.p[1],v.p[2]);distance=v.d;angle=v.a;elevation=v.e;factoryInteriorNav.style.display='flex';insideFactoryButton.setAttribute('aria-pressed','true');$('viewName').textContent='Interior de fábrica · '+({general:'vista general',cnc:'maquinado CNC',assembly:'ensamble',storage:'almacén'}[zone]);$('viewCode').textContent='INSPECCIÓN / INTERIOR';renderer.shadowMap.needsUpdate=true;
}
insideFactoryButton.onclick=()=>inspectFactoryInterior();factoryInteriorNav.querySelectorAll('[data-fzone]').forEach(b=>b.onclick=()=>inspectFactoryInterior(b.dataset.fzone));
$('factoryInteriorExit').onclick=()=>{factoryRoof.visible=true;factoryFront.visible=true;$('factoryCut').textContent='Abrir nave';factoryInteriorNav.style.display='none';insideFactoryButton.setAttribute('aria-pressed','false');focusFactory();renderer.shadowMap.needsUpdate=true;};
const insideExplore=document.createElement('button');insideExplore.textContent='Entrar al interior';insideExplore.onclick=()=>inspectFactoryInterior();$('factoryView').parentElement.append(insideExplore);

// Continuous feeder from the existing LV load outlet to factory TGBT.
const factoryFeeder=new T.Group();scene.add(factoryFeeder);
const factoryFeederPoints=[[26.72,7.45,2.9],[26.72,5.8,2.9],[29,5.8,2.9],[58,5.8,2.9],[58,5.8,5],[61,5.8,5],[61,7.15,5]];
const factoryFeederCurve=new T.CurvePath();for(let i=1;i<factoryFeederPoints.length;i++)factoryFeederCurve.add(new T.LineCurve3(new T.Vector3(...factoryFeederPoints[i-1]),new T.Vector3(...factoryFeederPoints[i])));
const factoryDuct=proPipe(factoryFeeder,factoryFeederPoints,.14,mat('#65747a',.45),.22);
for(const x of [29,58]){box(factoryFeeder,[1.3,.14,1.3],[x,6.53,2.9],mat('#737b7a',.3));for(let j=0;j<7;j++)box(factoryFeeder,[1.1,.015,.025],[x,6.61,2.45+j*.15],mat('#343b3c'));}
proPlate(factoryFeeder,'AF-01 · ALIMENTADOR A FÁBRICA',[29,6.99,3.0],4.8,'#364e5a',.26);
proPlate(factoryServices,'AF-01 / ENTRADA TGBT',[45,7.25,5.4],1.35,'#364e5a',.15);
const factoryArrows=[],factoryLine=mesh(factoryFeeder,new T.TubeGeometry(factoryFeederCurve,180,.055,8,false),new T.MeshBasicMaterial({color:'#d28628',transparent:true,opacity:.6,depthTest:false,depthWrite:false}));factoryLine.renderOrder=40;
const factoryArrowMaterial=new T.MeshBasicMaterial({color:'#d28628',depthTest:false,depthWrite:false});
for(let i=0;i<28;i++){const a=mesh(factoryFeeder,new T.ConeGeometry(.13,.40,10),factoryArrowMaterial);a.castShadow=false;a.renderOrder=41;factoryArrows.push(a);}
substation.flowItems.push({c:factoryFeederCurve,kind:'load',dots:factoryArrows,halos:[],conduit:factoryLine});
// Bonding conductor follows the same corridor; it is never animated as load current.
proPipe(factoryFeeder,factoryFeederPoints.map(p=>[p[0],p[1]-.03,p[2]+.07]),.022,mat('#338052'),.20);
const connectionPanel=document.createElement('div');connectionPanel.className='card';connectionPanel.innerHTML='<h3>AF-01 · Subestación → fábrica</h3><p id="factorySupplyStatus"></p><button id="factoryFeederView">Ver conexión eléctrica</button><p class="mini-note">TP / salida BT → alimentador subterráneo AF-01 → TGBT de fábrica. Las flechas permiten seguir el recorrido enterrado. La fábrica representa ahora la carga agregada del escenario: su potencia se ajusta con Carga solicitada. No se han dimensionado aún las ocho máquinas ni se ha calculado el alimentador. El respaldo de toda esta carga es una simplificación del escenario existente.</p>';$('explore').prepend(connectionPanel);
$('factoryFeederView').onclick=()=>{focusFactory(true);$('flows').checked=true;campusNav.target.set(43,6.5,3);distance=108;angle=-.3;elevation=.7;$('viewName').textContent='AF-01 · conexión subestación–TGBT';};
const priorFactoryUpdate=substation.update;substation.update=function(...args){priorFactoryUpdate(...args);const q=circuitState();$('factorySupplyStatus').textContent=q.bus?'Fábrica alimentada por '+(q.qg?'planta de emergencia':'red')+' · '+q.kw.toFixed(1)+' kW (carga agregada)':'Fábrica sin suministro';};
// Supersede preliminary no-connection notes in the factory section.
for(const p of factoryPanel.querySelectorAll('p'))p.textContent=p.textContent.replace('Alimentadores y demanda pendientes de cálculo.','AF-01 conectado al TGBT; capacidad y demanda de maquinaria pendientes de cálculo.');
for(const p of basis.querySelectorAll('p'))p.textContent=p.textContent.replace('Las lecturas de potencia aún corresponden al circuito didáctico original.','La fábrica es la carga agregada del circuito didáctico; las máquinas todavía no tienen demandas individuales.');
substation.update();renderer.shadowMap.needsUpdate=true;

// Correct origin: dedicated feeder breaker, not the auxiliaries board.
factory.position.x=16;
const qfFactory=new T.Group();substation.site.add(qfFactory);qfFactory.name='QF_AF01_Salida_Fabrica';
box(qfFactory,[1.1,.18,.9],[26.5,6.72,2.9],mat('#929b98'));
box(qfFactory,[.9,1.8,.68],[26.5,7.7,2.9],mat('#899a9c',.35));
box(qfFactory,[.8,1.65,.045],[26.5,7.7,3.26],mat('#a2adad',.35));
box(qfFactory,[.10,.30,.07],[26.75,7.75,3.31],black);
proPlate(qfFactory,'QF-01 · FÁBRICA',[26.5,8.35,3.30],.78,'#354b52',.13);
proSign(qfFactory,'warning','RIESGO ELÉCTRICO',[26.5,7.35,3.31],.32);
const sourceFactoryPoints=[[23.35,7.02,.45],[23.35,6.38,.45],[23.35,6.38,2.65],[26.28,6.38,2.65],[26.28,7.45,2.65],[26.28,7.7,2.65],[26.72,7.7,2.9],[26.72,7.45,2.9]];
const sourceFactoryDuct=proPipe(qfFactory,sourceFactoryPoints,.10,mat('#65747a',.45),.16);
const sourceFactoryCurve=new T.CurvePath();for(let i=1;i<sourceFactoryPoints.length;i++)sourceFactoryCurve.add(new T.LineCurve3(new T.Vector3(...sourceFactoryPoints[i-1]),new T.Vector3(...sourceFactoryPoints[i])));
const sourceFactoryLine=mesh(qfFactory,new T.TubeGeometry(sourceFactoryCurve,70,.04,8,false),factoryLine.material.clone());sourceFactoryLine.renderOrder=40;
const sourceFactoryDots=[];for(let i=0;i<7;i++){const a=mesh(qfFactory,new T.ConeGeometry(.10,.30,10),factoryArrowMaterial);a.renderOrder=41;a.castShadow=false;sourceFactoryDots.push(a);}
substation.flowItems.push({c:sourceFactoryCurve,kind:'load',dots:sourceFactoryDots,halos:[],conduit:sourceFactoryLine});
// Expose the buried route on demand without cutting away the existing landscape.
const ductInspect=document.createElement('button');ductInspect.textContent='Inspeccionar ducto enterrado';let ductInspectOn=false;
ductInspect.onclick=()=>{ductInspectOn=!ductInspectOn;factoryDuct.material=factoryDuct.material.clone();factoryDuct.material.depthTest=!ductInspectOn;factoryDuct.material.transparent=ductInspectOn;factoryDuct.material.opacity=ductInspectOn?.65:1;factoryDuct.renderOrder=ductInspectOn?39:0;ductInspect.textContent=ductInspectOn?'Ocultar vista del ducto':'Inspeccionar ducto enterrado';$('factoryFeederView').click();};connectionPanel.append(ductInspect);
for(const node of [...factoryPanel.querySelectorAll('p'),...basis.querySelectorAll('p')])node.textContent=node.textContent.replaceAll('16 m','32 m');
connectionPanel.querySelector('.mini-note').textContent='TP / salida BT → QF-01 dedicado → AF-01 subterráneo → entrada inferior del TGBT. Separación preliminar ampliada a 32 m. Registros alineados al recorrido; cruce bajo vialidad. Calibre, protección y profundidad definitiva pendientes de cálculo. Fábrica representada como carga agregada del escenario.';
renderer.shadowMap.needsUpdate=true;

// Match animation to the exact elbow geometry, and hide buried conductors in ordinary views.
const afFlow=substation.flowItems.find(it=>it.conduit===factoryLine),afSourceFlow=substation.flowItems.find(it=>it.conduit===sourceFactoryLine);
afFlow.c=factoryDuct.geometry.parameters.path;afSourceFlow.c=sourceFactoryDuct.geometry.parameters.path;
for(const [item,duct] of [[afFlow,factoryDuct],[afSourceFlow,sourceFactoryDuct]]){
 item.conduit.geometry.dispose();item.conduit.geometry=new T.TubeGeometry(item.c,180,.035,8,false);
 for(const m of [item.conduit,...item.dots]){m.material.depthTest=true;m.material.needsUpdate=true;}
 for(const d of item.dots){d.geometry=new T.ConeGeometry(.055,.16,8);}
}
// Visible glands at the equipment bases; no exposed conductors across floors or road.
for(const [x,z] of [[26.28,2.65],[26.72,2.9]]){cyl(qfFactory,.15,.10,[x,6.89,z],steel);cyl(qfFactory,.125,.15,[x,6.98,z],dark);}
box(factoryServices,[1.65,.20,.80],[45,6.94,5],mat('#8e9692'));
cyl(factoryServices,.18,.11,[45,7.05,5],steel);
const feederInspectButton=ductInspect;
feederInspectButton.onclick=()=>{ductInspectOn=!ductInspectOn;
 for(const [item,duct] of [[afFlow,factoryDuct],[afSourceFlow,sourceFactoryDuct]]){
  if(!duct.userData.inspectionMaterial){duct.material=duct.material.clone();duct.userData.inspectionMaterial=true;}
  duct.material.depthTest=!ductInspectOn;duct.material.transparent=ductInspectOn;duct.material.opacity=ductInspectOn?.42:1;duct.material.depthWrite=!ductInspectOn;duct.renderOrder=ductInspectOn?39:0;
  for(const m of [item.conduit,...item.dots]){m.material.depthTest=!ductInspectOn;m.material.needsUpdate=true;}
 }
 feederInspectButton.textContent=ductInspectOn?'Cerrar inspección subterránea':'Inspeccionar ducto enterrado';$('factoryFeederView').click();
 $('viewName').textContent=ductInspectOn?'AF-01 · transparencia técnica del recorrido enterrado':'AF-01 · vista exterior del alimentador';
};
const sourceClose=document.createElement('button');sourceClose.textContent='Detalle salida QF-01';sourceClose.onclick=()=>{$('factoryFeederView').click();$('hideFence').checked=true;campusNav.target.set(26.3,7.3,2.8);distance=7;angle=.35;elevation=.32;};connectionPanel.append(sourceClose);
const destClose=document.createElement('button');destClose.textContent='Detalle entrada TGBT';destClose.onclick=()=>{inspectFactoryInterior();campusNav.target.set(61,7.8,5);distance=9;angle=.35;elevation=.32;};connectionPanel.append(destClose);
renderer.shadowMap.needsUpdate=true;

// AF-01 aerial revision. Heights and conductor sizes are preliminary visual assumptions.
factoryFeeder.visible=false;
const overheadFactory=new T.Group();scene.add(overheadFactory);overheadFactory.name='AF01_Aereo';
const aerialPoles=[[29,2.9],[43,2.9],[58,2.9]],poleMat=mat('#89908a'),wireMat=mat('#24292b'),aerialMetal=mat('#9aa4a8',.65);
for(const [x,z] of aerialPoles){cyl(overheadFactory,.17,9,[x,11,z],poleMat);box(overheadFactory,[.18,.18,1.5],[x,15.25,z],aerialMetal);for(const dz of [-.55,0,.55]){cyl(overheadFactory,.065,.26,[x,15.48,z+dz],mat('#73513e'));for(let j=0;j<4;j++)cyl(overheadFactory,.10,.025,[x,15.39+j*.05,z+dz],mat('#73513e'));}}
const aerialRoute=new T.CurvePath();function aerialSegment(a,b){aerialRoute.add(new T.LineCurve3(new T.Vector3(...a),new T.Vector3(...b)));}
aerialSegment([26.72,7.45,2.9],[26.72,8.9,2.9]);aerialSegment([26.72,8.9,2.9],[29,8.9,2.9]);aerialSegment([29,8.9,2.9],[29,15.65,2.9]);
for(const [a,b] of [[29,43],[43,58]])aerialRoute.add(new T.QuadraticBezierCurve3(new T.Vector3(a,15.65,2.9),new T.Vector3((a+b)/2,14.15,2.9),new T.Vector3(b,15.65,2.9)));
aerialSegment([58,15.65,2.9],[58,10.5,2.9]);aerialSegment([58,10.5,2.9],[60.2,10.5,2.9]);aerialSegment([60.2,10.5,2.9],[60.2,10.5,5]);aerialSegment([60.2,10.5,5],[60.2,9.4,5]);aerialSegment([60.2,9.4,5],[61,9.4,5]);aerialSegment([61,9.4,5],[61,8.7,5]);
// Bundled insulated aerial service on messenger, not bare low-voltage phase bars.
const originalAerialCable=mesh(overheadFactory,new T.TubeGeometry(aerialRoute,240,.072,10,false),wireMat);
for(const [a,b] of [[29,43],[43,58]]){const c=new T.QuadraticBezierCurve3(new T.Vector3(a,15.82,2.9),new T.Vector3((a+b)/2,14.32,2.9),new T.Vector3(b,15.82,2.9));mesh(overheadFactory,new T.TubeGeometry(c,50,.018,8,false),aerialMetal);for(let j=0;j<=12;j++){const p=c.getPoint(j/12);cyl(overheadFactory,.045,.16,[p.x,p.y-.08,p.z],aerialMetal);}}
proPipe(overheadFactory,[[26.72,7.45,2.9],[26.72,8.9,2.9],[29,8.9,2.9],[29,14.7,2.9]],.13,aerialMetal,.18);
proPipe(overheadFactory,[[58,14.7,2.9],[58,10.5,2.9],[60.2,10.5,2.9],[60.2,10.5,5],[60.2,9.4,5],[61,9.4,5],[61,8.7,5]],.13,aerialMetal,.18);
for(const x of [29,58])for(const y of [9.2,11.5,13.8])box(overheadFactory,[.45,.065,.24],[x,y,2.9],aerialMetal);
// Remove the replaced buried route and move the existing animated feeder to the aerial curve.
afFlow.c=aerialRoute;overheadFactory.add(factoryLine);factoryLine.geometry.dispose();factoryLine.geometry=new T.TubeGeometry(aerialRoute,240,.032,8,false);factoryLine.material.depthTest=true;
for(const a of factoryArrows){overheadFactory.add(a);a.material.depthTest=true;}
factoryDuct.visible=false;ductInspect.style.display='none';
// Source still comes through QF-01; only its load-side outgoing gland is now on top.
for(const o of qfFactory.children){if(o.isMesh&&Math.abs(o.position.x-26.72)<.01&&o.position.y<7.1)o.visible=false;}
proPlate(overheadFactory,'AF-01 · ALIMENTACIÓN AÉREA',[43,12.9,3.12],5,'#354b52',.30);
connectionPanel.querySelector('h3').textContent='AF-01 · Alimentación aérea';connectionPanel.querySelector('.mini-note').textContent='Salida BT → QF-01 → subida protegida → cable aéreo aislado con mensajero → bajada protegida → TGBT. Trazado preliminar: alturas, flecha, apoyos, esfuerzos mecánicos, calibres y protección pendientes de cálculo. Se conserva la separación de 32 m y la carga agregada del escenario.';
$('factoryFeederView').onclick=()=>{focusFactory(true);$('flows').checked=true;campusNav.target.set(43,10,3);distance=100;angle=-.3;elevation=.38;$('viewName').textContent='AF-01 · alimentación aérea de fábrica';};
renderer.shadowMap.needsUpdate=true;

// Detailed bundled service cable and load-bearing hardware, illustrative construction.
originalAerialCable.visible=false;
const aerialDetail=new T.Group();overheadFactory.add(aerialDetail);
const galv=mat('#a3abae',.72),rubberA=mat('#24282a'),concreteA=mat('#96988d'),clampA=mat('#454c50',.55);
// Replace generic triple porcelain crossarms with brackets for the bundled service.
for(const m of [...overheadFactory.children]){
 if(!m.isMesh)continue;
 if(m.position.y>15.1&&m.position.y<15.7)m.visible=false;
 if(m.geometry.type==='CylinderGeometry'&&m.geometry.parameters.height===9){m.geometry.dispose();m.geometry=new T.CylinderGeometry(.12,.23,9,20);m.material=concreteA;}
}
for(const [a,b] of [[29,43],[43,58]]){
 for(let k=0;k<4;k++){
 const pts=[];for(let j=0;j<=180;j++){const u=j/180,x=a+(b-a)*u,y=15.65-3*u*(1-u),theta=u*(b-a)*Math.PI*2/1.4+k*Math.PI/2;pts.push(new T.Vector3(x,y+.047*Math.cos(theta),2.9+.047*Math.sin(theta)));}
 mesh(aerialDetail,new T.TubeGeometry(new T.CatmullRomCurve3(pts),220,.023,7,false),rubberA);
 }
}
// Use a jacketed cable for protected transitions; terminate at the same support coordinates.
for(const points of [[[26.72,7.45,2.9],[26.72,8.9,2.9],[29,8.9,2.9],[29,15.65,2.9]],[[58,15.65,2.9],[58,10.5,2.9],[60.2,10.5,2.9],[60.2,10.5,5],[60.2,9.4,5],[61,9.4,5],[61,8.7,5]]])proPipe(aerialDetail,points,.062,rubberA,.18);
for(const [x,z] of aerialPoles){
 // Pole bands, bolted bracket and cable saddle.
 for(const y of [15.05,15.36]){const r=mesh(aerialDetail,new T.TorusGeometry(.155,.025,8,28),galv,[x,y,z]);r.rotation.x=Math.PI/2;box(aerialDetail,[.13,.16,.08],[x,y,z+.18],galv);cyl(aerialDetail,.025,.05,[x,y,z+.25],galv,'z');}
 box(aerialDetail,[.5,.09,.24],[x,15.51,z],galv);box(aerialDetail,[.32,.15,.16],[x,15.62,z],clampA);
 for(const dx of [-.12,.12]){cyl(aerialDetail,.026,.22,[x+dx,15.63,z],galv);cyl(aerialDetail,.04,.026,[x+dx,15.76,z],galv);}
 for(const y of [7.4,8.0,8.6]){box(aerialDetail,[.08,.045,.045],[x+.18,y,z],galv);}
 proPlate(aerialDetail,'AF-01 / P-'+(x===29?'01':x===43?'02':'03'),[x,8.8,z+.24],.52,'#34464d',.12);
 cyl(aerialDetail,.32,.10,[x,6.56,z],mat('#72776f'));
}
// Dead-end assemblies and weatherhead loops at the end poles.
for(const [x,sign] of [[29,1],[58,-1]]){
 box(aerialDetail,[.38,.11,.18],[x+sign*.32,15.70,2.9],clampA);
 proPipe(aerialDetail,[[x,15.6,2.9],[x-sign*.30,15.38,2.9],[x-sign*.33,14.95,2.9],[x,14.68,2.9]],.065,rubberA,.12);
 cyl(aerialDetail,.19,.12,[x,14.73,2.9],galv);const cap=mesh(aerialDetail,new T.SphereGeometry(.18,20,10,0,Math.PI*2,0,Math.PI/2),galv,[x,14.81,2.9]);
 for(const y of [9.3,10.8,12.3,13.8]){const band=mesh(aerialDetail,new T.TorusGeometry(.22,.02,6,24),galv,[x,y,2.9]);band.rotation.x=Math.PI/2;}
}
// Wall anchorage for the final protected run; gland at the board roof.
for(const z of [3.2,4.4]){box(aerialDetail,[.25,.32,.10],[60.2,10.5,z],galv);cyl(aerialDetail,.025,.10,[60.2,10.6,z+.07],galv,'z');}
cyl(aerialDetail,.17,.12,[61,9.06,5],galv);
const aerialClose=document.createElement('button');aerialClose.textContent='Detalle del tendido aéreo';aerialClose.onclick=()=>{$('factoryFeederView').click();campusNav.target.set(43,14.6,2.9);distance=35;angle=.18;elevation=.18;$('viewName').textContent='AF-01 · conductores, mensajero y herrajes';};connectionPanel.append(aerialClose);
renderer.shadowMap.needsUpdate=true;

// Factory energy paths follow the existing riser, trays and local CNC drops.
const factoryEnergy=new T.Group();scene.add(factoryEnergy);const factoryEnergyItems=[];
function factoryEnergyPath(points){const c=new T.CurvePath();for(let i=1;i<points.length;i++)c.add(new T.LineCurve3(new T.Vector3(...points[i-1]),new T.Vector3(...points[i])));
 const m=new T.MeshBasicMaterial({color:'#e4ad42',transparent:true,opacity:.7,depthTest:false,depthWrite:false});const line=mesh(factoryEnergy,new T.TubeGeometry(c,Math.max(40,points.length*12),.027,8,false),m);line.renderOrder=42;line.castShadow=false;
 const dots=[],dm=new T.MeshBasicMaterial({color:'#ffe09a',depthTest:false,depthWrite:false});for(let i=0;i<Math.max(3,Math.ceil(c.getLength()/2));i++){const a=mesh(factoryEnergy,new T.ConeGeometry(.07,.24,10),dm);a.renderOrder=43;a.castShadow=false;dots.push(a);}
 const it={c,kind:'load',dots,halos:[],conduit:line};substation.flowItems.push(it);factoryEnergyItems.push(it);}
factoryEnergyPath([[61,8.7,5],[61,9,5],[61,11.3,5],[61,11.3,-4]]);
for(const z of [-4,5])factoryEnergyPath([[61,11.3,z],[89.5,11.3,z]]);
for(const x of [49,55,61,67])for(const z of [-8,-1]){const dx=x+1.65+16,tz=z===-8?-4:5;factoryEnergyPath([[dx,11.3,tz],[dx,11.3,z+1],[dx,8.4,z+1],[dx,7.75,z+1],[x+17.34,7.75,z+1]]);}
// Keep the incoming flow above the visible cable jacket; previous arrows were occluded by it.
for(const m of [factoryLine,...factoryArrows]){m.material.depthTest=false;m.material.depthWrite=false;m.renderOrder=42;}
const factoryFlowOption=document.createElement('label');factoryFlowOption.innerHTML='<input id="factoryFlowVisible" type="checkbox" checked> Flujo de energía hacia la fábrica';connectionPanel.append(factoryFlowOption);
const factoryEnergyNote=document.createElement('p');factoryEnergyNote.className='mini-note';factoryEnergyNote.textContent='Las flechas recorren AF-01, el TGBT, las charolas y las bajadas a CNC. Representan la carga agregada del escenario; no calculan consumo individual por máquina.';connectionPanel.append(factoryEnergyNote);
const beforeFactoryEnergyUpdate=substation.update;substation.update=function(...args){beforeFactoryEnergyUpdate(...args);const enabled=$('factoryFlowVisible').checked&&!window.Walk31?.state().active;factoryEnergy.visible=enabled&&!isolated;const q=circuitState(),color=q.qg?'#31dfb0':'#ffc461';for(const it of factoryEnergyItems){it.conduit.material.color.set(color);it.dots[0].material.color.set(color);}if(!enabled){factoryLine.visible=false;factoryArrows.forEach(d=>d.visible=false);}else{factoryLine.material.color.set(color);factoryArrowMaterial.color.set(color);}};
const factoryEnergyButton=document.createElement('button');factoryEnergyButton.textContent='Seguir energía dentro de fábrica';factoryEnergyButton.onclick=()=>{inspectFactoryInterior();$('flows').checked=true;$('factoryFlowVisible').checked=true;substation.update();};connectionPanel.append(factoryEnergyButton);
substation.update();

// CCM inspired by the supplied main switchgear photograph. Ratings are not selected.
// Remove the small freestanding TGBT cabinet, its old plaque and pedestal.
factory.traverse(o=>{if(!o.isMesh)return;const p=o.position;if(p.x>=44.05&&p.x<=45.9&&p.y>=6.9&&p.y<=9.1&&p.z>=4.55&&p.z<=5.6&&o.geometry.type!=='TubeGeometry')o.visible=false;});
const ccm=new T.Group();factory.add(ccm);ccm.name='CCM01_Principal_y_arrancadores';
const ccmPaint=mat('#a7aaa7',.38),ccmTrim=mat('#565e60',.55),ccmBlack=mat('#232a2d'),ccmMetal=mat('#b3b9ba',.75);
box(ccm,[5.5,.22,1.3],[46.95,6.99,5],mat('#868b82'));
box(ccm,[5.25,.15,1.05],[46.95,7.17,5],ccmTrim);
for(let n=0;n<4;n++){const x=45+n*1.3;
 box(ccm,[1.27,2.42,.98],[x,8.45,5],ccmPaint);
 box(ccm,[1.29,.065,1.02],[x,9.69,5],ccmTrim);
 for(const dx of [-.56,.56]){box(ccm,[.045,2.38,.025],[x+dx,8.45,5.51],ccmTrim);for(const y of [7.37,8.40,9.53])cyl(ccm,.016,.022,[x+dx,y,5.54],ccmMetal,'z');}
 for(const y of [7.35,9.52])for(let j=0;j<13;j++)box(ccm,[.040,.08,.020],[x-.45+j*.074,y,5.51],ccmBlack);
 proPlate(ccm,n===0?'CCM-01 / PRINCIPAL':['MOTORES / A','MOTORES / B','SERVICIOS'][n-1],[x,9.28,5.53],1.08,'#334b54',.105);
 for(const dx of [-.43,.43])for(const z of [4.64,5.36]){cyl(ccm,.035,.035,[x+dx,7.115,z],ccmMetal);}
 if(n===0){
  // Large main breaker, metering compartment, lower cable compartment: reference silhouette.
  box(ccm,[1.11,.93,.045],[x,8.76,5.51],ccmPaint);
  box(ccm,[.48,.66,.11],[x+.15,8.78,5.59],ccmBlack);
  box(ccm,[.30,.18,.025],[x+.15,8.98,5.655],mat('#51676a'));
  box(ccm,[.105,.22,.055],[x+.16,8.7,5.67],ccmTrim);
  proPlate(ccm,'I / O',[x+.15,8.53,5.66],.19,'#263236',.07);
  box(ccm,[.22,.19,.05],[x-.36,8.95,5.565],ccmBlack);proPlate(ccm,'MEDICIÓN',[x-.36,8.77,5.60],.23,'#263236',.055);
  box(ccm,[1.11,.83,.055],[x,7.90,5.51],ccmPaint);
  box(ccm,[.035,.21,.045],[x+.43,7.95,5.56],ccmBlack);
  proSign(ccm,'warning','RIESGO ELÉCTRICO',[x,7.95,5.57],.29);
 }else{
  for(let j=0;j<3;j++){const y=7.80+j*.43;
   box(ccm,[1.10,.39,.045],[x,y,5.52],ccmPaint);box(ccm,[.10,.19,.06],[x+.39,y,5.59],ccmBlack);
   proPlate(ccm,'U'+n+j,[x-.30,y+.09,5.56],.22,'#34464e',.06);
   for(const [dx,col] of [[-.28,'#418c68'],[-.1,'#943e35']])cyl(ccm,.035,.035,[x+dx,y-.045,5.58],mat(col),'z');
   cyl(ccm,.04,.05,[x+.11,y-.04,5.59],ccmBlack,'z');
  }
 }
}
// Roof cable compartment and protected entry preserve the existing incoming endpoint.
box(ccm,[1.05,.20,.8],[45,9.83,5],ccmPaint);
proPipe(ccm,[[45,8.7,5],[45,9.95,5],[45,11.3,5]],.095,ccmMetal,.15);
// Separate outgoing risers from CCM sections up to the existing distribution tray.
for(const x of [46.3,47.6,48.9])proPipe(ccm,[[x,9.69,5],[x,10.20,5],[x,11.3,5]],.065,ccmMetal,.15);
// Reserved front working strip, free from storage. Final width/depth require electrical design.
for(const x of [44.2,49.65])box(ccm,[.05,.012,1.8],[x,6.89,6.62],safety);
for(const z of [5.72,7.52])box(ccm,[5.50,.012,.05],[46.95,6.89,z],safety);
proPlate(ccm,'CCM-01 · NO OBSTRUIR',[46.95,7.05,7.54],3.3,'#65572a',.18);
// Extend the didactic motor flow through CCM outgoing compartments to the trays.
for(const x of [46.3,47.6,48.9])factoryEnergyPath([[61,8.7,5],[x+16,8.7,5],[x+16,9.69,5],[x+16,11.3,5]]);
const ccmButton=document.createElement('button');ccmButton.textContent='CCM · tablero principal';ccmButton.onclick=()=>{inspectFactoryInterior();campusNav.target.set(63,8.5,5);distance=13;angle=.25;elevation=.18;$('viewName').textContent='CCM-01 · principal y unidades de motores';};connectionPanel.append(ccmButton);
const ccmNote=document.createElement('p');ccmNote.className='mini-note';ccmNote.textContent='CCM basado visualmente en la referencia: interruptor principal, medición, compartimiento de cables y unidades para motores. Capacidades, arranques, protecciones y asignación de cargas pendientes de ingeniería. Las CNC mantienen sus controles propios; no toda máquina se trata como un motor directo.';connectionPanel.append(ccmNote);
renderer.shadowMap.needsUpdate=true;

// Relocate the first assembly bench out of the CCM approach.
for(const o of factory.children){if(o.isMesh&&Math.abs(o.position.z-8)<.01&&o.position.x>=46.7&&o.position.x<=49.3&&o.position.y<8.1)o.position.x+=24;}
factoryServices.traverse(o=>{if(o.isMesh&&o.position.x>44&&o.position.x<46&&o.position.z>6.9&&o.position.z<7.1)o.visible=false;});
renderer.shadowMap.needsUpdate=true;

// CCM layout correction: west wall alignment, front towards production, rear access retained.
for(const o of ccm.children)if(o.isMesh&&o.geometry.type==='TubeGeometry')o.visible=false;
ccm.rotation.y=Math.PI/2;ccm.position.set(40.8,0,51.95);
// Map old (46.95,5) to new (45.8,5): front faces east, rear aisle ~1.2 m.
// Remove superseded riser from the old small-board location.
factoryServices.traverse(o=>{if(o.isMesh&&o.geometry.type==='TubeGeometry'){const pts=o.geometry.parameters.path?.getPoints(12);if(pts&&pts.every(p=>p.x<45.15)&&pts.some(p=>p.y>10))o.visible=false;}});
const ccmAccess=new T.Group();factory.add(ccmAccess);
// Floor-level demarcation, no freestanding sign obstructing the work strip.
ccm.traverse(o=>{if(o.isMesh&&o.position.z>7.4&&o.position.y>6.95)o.visible=false;});
for(const x of [46.5,48.3])box(ccmAccess,[.045,.012,6.5],[x,6.89,5],safety);
for(const z of [1.75,8.25])box(ccmAccess,[1.85,.012,.045],[47.4,6.89,z],safety);
// Dedicated lighting above access, supported from the structure.
box(ccmAccess,[.28,.08,4.8],[47.2,10.4,5],mat('#e2e5da'));
for(const z of [3,7])cyl(ccmAccess,.012,3.5,[47.2,12.2,z],steel);
// Protected supply is routed behind the lineup and enters the main roof compartment.
proPipe(ccmAccess,[[45,8.7,5],[45,10.15,5],[45,10.15,6.95],[45.8,10.15,6.95],[45.8,9.85,6.95]],.10,ccmMetal,.16);
for(const z of [5.65,4.35,3.05])proPipe(ccmAccess,[[45.8,9.69,z],[45.8,11.3,z],[45,11.3,z]],.065,ccmMetal,.16);
proPipe(ccmAccess,[[45,11.3,6.95],[45,11.3,-4]],.09,ccmMetal,.16);
// Clear all earlier overlapping energy traces, then rebuild from actual cabinet coordinates.
for(const it of factoryEnergyItems){const idx=substation.flowItems.indexOf(it);if(idx>=0)substation.flowItems.splice(idx,1);it.conduit.parent?.remove(it.conduit);for(const a of it.dots)a.parent?.remove(a);}factoryEnergyItems.length=0;
factoryEnergyPath([[61,8.7,5],[61,10.15,5],[61,10.15,6.95],[61.8,10.15,6.95],[61.8,8.7,6.95]]);
factoryEnergyPath([[61.8,8.7,6.95],[61.8,8.7,3.05]]);
for(const z of [5.65,4.35,3.05])factoryEnergyPath([[61.8,8.7,z],[61.8,11.3,z],[61,11.3,z]]);
factoryEnergyPath([[61,11.3,5.65],[61,11.3,-4]]);
for(const z of [-4,5])factoryEnergyPath([[61,11.3,z],[89.5,11.3,z]]);
for(const x of [49,55,61,67])for(const z of [-8,-1]){const dx=x+17.65,tz=z===-8?-4:5;factoryEnergyPath([[dx,11.3,tz],[dx,11.3,z+1],[dx,8.4,z+1],[dx,7.75,z+1],[x+17.34,7.75,z+1]]);}
ccmButton.onclick=()=>{inspectFactoryInterior();campusNav.target.set(62,8.4,5);distance=14;angle=1.05;elevation=.28;$('viewName').textContent='CCM-01 · acceso frontal y montaje';};
ccmNote.textContent='Implantación revisada con referencia a NOM-001-SEDE-2012, 110-26: frente hacia nave, franja frontal de diseño de 1.8 m y acceso posterior aproximado de 1.2 m, libres de mobiliario; entradas eléctricas superiores protegidas y base anclada. Dimensiones preliminares del modelo, sujetas al gabinete seleccionado y sus instrucciones. No se afirma que la NOM exija adosar el CCM al muro. Selección, cálculo, apertura de puertas y evaluación integral pendientes.';
renderer.shadowMap.needsUpdate=true;

// Dedicated electrical area: partition beyond the reserved front working strip.
const ccmRoom=new T.Group();factory.add(ccmRoom);const ccmRoomWall=new T.Group();ccmRoom.add(ccmRoomWall);
const roomConcrete=mat('#b3b5ae'),earthCopper=mat('#a97542',.75),peInsulation=mat('#338450');
box(ccmRoomWall,[.16,3.65,6.0],[49,8.71,5],roomConcrete);
// End partitions with 1.2 m clear openings at both ends of the aisle.
for(const z of [1.8,8.2]){box(ccmRoomWall,[2.0,3.65,.16],[45.0,8.71,z],roomConcrete);box(ccmRoomWall,[1.6,3.65,.16],[48.2,8.71,z],roomConcrete);box(ccmRoomWall,[1.4,1.35,.16],[46.7,9.86,z],roomConcrete);}
for(const z of [1.8,8.2]){proSign(ccmRoomWall,'warning','ACCESO RESTRINGIDO',[48.2,8.9,z+.1],.55);proSign(ccmRoomWall,'exit','SALIDA',[46.7,9.5,z+.1],.4);}
// No automatic N-PE bond at this downstream motor-control centre.
const ccmEarthing=new T.Group();factory.add(ccmEarthing);ccmEarthing.name='PE_CCM01';
box(ccmEarthing,[.06,.12,1.2],[44.35,7.45,5],earthCopper);
for(let j=0;j<6;j++)cyl(ccmEarthing,.025,.07,[44.40,7.45,4.55+j*.18],steel,'x');
proPlate(ccmEarthing,'BARRA PE · CCM-01',[44.38,7.73,5.04],1.1,'#285e47',.13);
for(const z of [6.95,5.65,4.35,3.05]){proPipe(ccmEarthing,[[44.35,7.45,5],[44.35,7.45,z],[45.45,7.45,z],[45.8,7.4,z]],.018,peInsulation,.12);cyl(ccmEarthing,.035,.06,[45.8,7.4,z],earthCopper,'x');}
proPipe(ccmEarthing,[[44.35,7.45,5],[44.35,10.9,5],[45,10.9,5],[45,11.3,5]],.018,peInsulation,.16);
// PE route runs with AF-01 and joins the station bonding system; not a separate isolated earth.
const peAerialPts=[];for(let j=0;j<=180;j++){const p=aerialRoute.getPoint(j/180);p.z+=.11;peAerialPts.push(p);}
const peAerial=mesh(overheadFactory,new T.TubeGeometry(new T.CatmullRomCurve3(peAerialPts),220,.016,7,false),peInsulation);
proPipe(ccmEarthing,[[45,8.7,5.11],[44.35,8.7,5.11],[44.35,7.45,5]],.018,peInsulation,.14);
const factoryGroundExternal=new T.Group();scene.add(factoryGroundExternal);
proPipe(factoryGroundExternal,[[26.72,7.45,3.01],[26.72,6,3.01],[26.72,5.75,3.01],[25.0,5.75,3.01],[27,5.875,4.0]],.018,earthCopper,.12);
// Bonding electrode and accessible inspection pit at the factory west wall.
proPipe(ccmEarthing,[[44.35,7.45,5],[44.35,6.0,5],[43.3,6.0,5]],.018,earthCopper,.12);
cyl(ccmEarthing,.022,2.44,[43.3,4.78,5],earthCopper);
box(ccmEarthing,[.65,.12,.65],[43.3,6.53,5],mat('#7d8782'));proPlate(ccmEarthing,'REGISTRO PE',[43.3,6.87,5.35],.65,'#285e47',.12);
const roomToggle=document.createElement('button');roomToggle.textContent='Ocultar muro del CCM';roomToggle.onclick=()=>{ccmRoomWall.visible=!ccmRoomWall.visible;roomToggle.textContent=ccmRoomWall.visible?'Ocultar muro del CCM':'Mostrar muro del CCM';renderer.shadowMap.needsUpdate=true;};connectionPanel.append(roomToggle);
const peToggle=document.createElement('button');peToggle.textContent='Inspeccionar puesta a tierra';let peInspection=false;peToggle.onclick=()=>{peInspection=!peInspection;for(const g of [ccmEarthing,factoryGroundExternal])g.traverse(o=>{if(o.isMesh){if(!o.userData.peClone){o.material=o.material.clone();o.userData.peClone=true;}o.material.depthTest=!peInspection;o.renderOrder=peInspection?45:0;}});ccmRoomWall.visible=!peInspection;roomToggle.textContent=ccmRoomWall.visible?'Ocultar muro del CCM':'Mostrar muro del CCM';ccmButton.click();peToggle.textContent=peInspection?'Cerrar inspección de tierras':'Inspeccionar puesta a tierra';};connectionPanel.append(peToggle);
const roomViewAction=ccmButton.onclick;ccmButton.onclick=()=>{roomViewAction();ccmRoomWall.visible=false;roomToggle.textContent='Mostrar muro del CCM';};
const groundingNote=document.createElement('p');groundingNote.className='mini-note';groundingNote.textContent='Área eléctrica separada por muro, con accesos en ambos extremos. PE une secciones del CCM, charola y electrodo local al sistema general mediante conductor asociado a AF-01. No se añade unión N-PE en el CCM. Esquema preliminar: faltan calibres, uniones verificadas, resistividad y estudio de fallas. El muro no tiene clasificación de resistencia al fuego asignada.';connectionPanel.append(groundingNote);
renderer.shadowMap.needsUpdate=true;

// Architectural proportion revision: extend the nave, never scale electrical equipment.
for(const o of factory.children){if(o.isMesh&&o.geometry.type==='BoxGeometry'&&Math.abs(o.position.x-84)<.01&&Math.abs(o.position.z)<.01&&o.geometry.parameters.height===6.5)o.visible=false;}
const factoryExtension=new T.Group();factory.add(factoryExtension);
box(factoryExtension,[20,.20,28],[94,6.77,0],mat('#929991'));
box(factoryExtension,[20,.28,36],[97,6.52,0],fc);
box(factoryExtension,[20,.3,12],[94,6.52,23],fc);
box(factoryExtension,[20,6.5,.15],[94,10.12,-14],panel);box(factoryExtension,[.15,6.5,28],[104,10.12,0],panel);
for(const x of [94,104])for(const z of [-14,14]){box(factoryExtension,[.85,.18,.85],[x,6.94,z],fs);box(factoryExtension,[.24,7,.32],[x,10.48,z],fs);for(const dx of [-.27,.27])for(const dz of [-.27,.27])cyl(factoryExtension,.032,.09,[x+dx,7.08,z+dz],steel);}
for(const side of [-1,1]){const r=box(factoryRoof,[20,.12,14.5],[94,14.7,side*7],panel);r.rotation.x=side*.101;for(let x=85;x<=104;x++){const rib=box(factoryRoof,[.045,.055,14.5],[x,14.79,side*7],fs);rib.rotation.x=side*.101;}}
for(const x of [94,104])proPipe(factoryRoof,[[x,13.98,-14],[x,15.4,0],[x,13.98,14]],.14,fs,.04);
for(const z of [-10,-5,0,5,10])box(factoryRoof,[20,.14,.10],[94,15.36-Math.abs(z)*.101,z],fs);
for(const x of [86,92,98,104])box(factoryFront,[x===104?1:2,6.5,.15],[x,10.12,14],panel);
box(factoryFront,[20,2.9,.15],[94,11.92,14],panel);
for(const x of [89,95,101]){box(factoryFront,[3.8,3.6,.18],[x,8.67,14],basepaint);for(let y=7;y<10.4;y+=.22)box(factoryFront,[3.7,.025,.045],[x,y,14.12],fs);}
proPlate(factoryFront,'RECEPCIÓN · ALMACÉN · EMBARQUES',[94,12.3,14.2],15,'#354b52',.5);
for(const x of [89,95,101])for(const z of [-10,-5]){for(const dx of [-1.5,1.5])box(factoryExtension,[.09,3,.09],[x+dx,8.3,z],basepaint);for(const y of [7.2,8.4,9.6]){box(factoryExtension,[3.2,.09,1.3],[x,y,z],fs);box(factoryExtension,[2,.6,1],[x,y+.35,z],mat('#997c52'));}}
for(const x of [88,94,100]){box(factoryExtension,[3.4,.13,1.3],[x,7.9,6],fs);for(const dx of [-1.4,1.4])box(factoryExtension,[.1,1,.95],[x+dx,7.35,6],fs);}
for(let x=86;x<104;x+=4)box(factoryExtension,[.008,.008,28],[x,6.879,0],mat('#68716c'));
for(const z of [-10,-6,-2,2,6,10])box(factoryExtension,[20,.008,.008],[94,6.881,z],mat('#68716c'));
for(const z of [0,2])box(factoryExtension,[19,.014,.06],[94,6.89,z],safety);
// Dimension overlay in the common world coordinate system, optional in ordinary views.
const dimensionSite=new T.Group();scene.add(dimensionSite);dimensionSite.visible=false;
function siteDimension(a,b,text,pos,w){proPipe(dimensionSite,[a,b],.045,mat('#267890'),.01);for(const p of [a,b])box(dimensionSite,[.08,.07,1.4],p,mat('#267890'));proPlate(dimensionSite,text,pos,w,'#235467',.55);}
siteDimension([60,6.85,32],[120,6.85,32],'NAVE 60 × 28 m · 1,680 m²',[90,7.5,32],21);
siteDimension([-8.4,6.85,11],[27.5,6.85,11],'PLATAFORMA 35.9 × 15.1 m',[9.5,7.5,11],23);
siteDimension([28,6.85,19],[60,6.85,19],'SEPARACIÓN 32 m',[44,7.5,19],16);
const scaleButton=document.createElement('button');scaleButton.textContent='Comparar dimensiones';scaleButton.onclick=()=>{focusFactory(true);campusNav.target.set(55,7,5);distance=215;angle=0;elevation=1.12;dimensionSite.visible=!dimensionSite.visible;$('viewName').textContent='Comparación dimensional · distribución preliminar';};// Dimension comparison button removed from menu at user request.
const originalFactoryFocus=focusFactory;focusFactory=function(wide=false){originalFactoryFocus(wide);if(wide){campusNav.target.set(55,9,0);distance=190;}else{campusNav.target.set(90,9,0);distance=110;}dimensionSite.visible=false;};
factoryPanel.querySelector('p').textContent='Nave ampliada a 60 × 28 m (1,680 m²): maquinado, ensamble, administración y área de recepción/almacén/embarques. Equipos eléctricos conservan su tamaño; separación de 32 m. Revisión arquitectónica preliminar, no dimensionamiento eléctrico validado.';
const scaleNote=document.createElement('p');scaleNote.className='mini-note';scaleNote.textContent='La plataforma eléctrica ocupa aproximadamente 32% del área de la nave; el patio eléctrico, 17%. Se amplió la arquitectura de fábrica sin escalar máquinas, CCM ni transformadores. El sótano conserva su geometría previa: su profundidad y las capacidades eléctricas requieren revisión de ingeniería.';factoryPanel.append(scaleNote);
renderer.shadowMap.needsUpdate=true;

// Night operation: normal lighting follows the existing bus, with battery safety markers separate.
let isNight=true;
const nightLighting=new T.Group();scene.add(nightLighting);const nightFixtures=[],nightLamps=[];
const oldSiteLights=[];scene.traverse(o=>{if(o.isPointLight)oldSiteLights.push(o);});
for(const o of scene.children)if(o.isHemisphereLight)o.intensity=.14;
light.intensity=.22;light.color.set('#8ba6d0');rim.intensity=.08;scene.environmentIntensity=.06;renderer.toneMappingExposure=1.05;
sky.material.uniforms.top.value.set('#020713');sky.material.uniforms.bottom.value.set('#101e35');normalLandscapeColor.set('#07111f');sectionBackgroundColor.set('#101923');
// Small soft light pools are visual aids; they are not an illuminance calculation.
const poolCanvas=document.createElement('canvas');poolCanvas.width=poolCanvas.height=128;const pc=poolCanvas.getContext('2d'),pg=pc.createRadialGradient(64,64,0,64,64,64);pg.addColorStop(0,'rgba(210,227,255,.30)');pg.addColorStop(.45,'rgba(166,202,245,.16)');pg.addColorStop(1,'rgba(166,202,245,0)');pc.fillStyle=pg;pc.fillRect(0,0,128,128);const poolTex=new T.CanvasTexture(poolCanvas);
function nightFixture(x,y,z,ground,size=7){box(nightLighting,[.75,.14,.42],[x,y,z],mat('#363d46',.5));const lm=new T.MeshStandardMaterial({color:'#dce6ed',emissive:'#d4e6ff',emissiveIntensity:3});mesh(nightLighting,new T.BoxGeometry(.66,.025,.33),lm,[x,y-.08,z]);nightFixtures.push(lm);const pool=mesh(nightLighting,new T.PlaneGeometry(size,size),new T.MeshBasicMaterial({map:poolTex,transparent:true,depthWrite:false,blending:T.AdditiveBlending}),[x,ground+.015,z]);pool.rotation.x=-Math.PI/2;pool.castShadow=false;nightLamps.push(pool);}
// The basement access fixture belongs on the solid slab, never inside the stair opening.
const siteLuminaireMounts=[];
for(const nominalX of [-6,2,11,18,25])for(const z of [-6,4]){
 const x=nominalX===-6?-7.45:nominalX,grade=x<9?6.50:6.65,baseTop=grade+.24,poleBottom=baseTop+.025;
 const mount=new T.Group();mount.name='Base_luminaria_'+x+'_'+z;nightLighting.add(mount);
 box(mount,[.46,.24,.46],[x,grade+.12,z],fc);box(mount,[.31,.025,.31],[x,baseTop+.0125,z],steel);
 for(const dx of [-.105,.105])for(const dz of [-.105,.105]){cyl(mount,.013,.055,[x+dx,baseTop+.0375,z+dz],steel);cyl(mount,.022,.018,[x+dx,baseTop+.036,z+dz],steel);}
 cyl(mount,.065,11.60-poleBottom,[x,(11.60+poleBottom)/2,z],steel);
 nightFixture(x,11.60,z,grade,8);siteLuminaireMounts.push({x,z,grade,baseTop,poleBottom,poleTop:11.60});
}
for(const x of [65,77,89,101,113])for(const z of [-8,5]){cyl(nightLighting,.01,1.3,[x,13.3,z],steel);nightFixture(x,12.6,z,6.88,12);}
for(const x of [64,82,100,118]){const grade=6.67,top=grade+.22+.025;box(nightLighting,[.48,.22,.48],[x,grade+.11,25],fc);box(nightLighting,[.34,.025,.34],[x,grade+.22+.0125,25],steel);for(const dx of [-.12,.12])for(const dz of [-.12,.12])cyl(nightLighting,.02,.035,[x+dx,top+.0175,25+dz],steel);cyl(nightLighting,.08,12.8-top,[x,(12.8+top)/2,25],steel);nightFixture(x,12.8,25,grade,11);}
// Uniform roadside columns, 4 m behind the west carriageway edge; driveway kept clear.
const roadLightColumns=[];
for(let z=-580;z<=580;z+=40){if(z>0&&z<40)continue;const pole=new T.Group();nightLighting.add(pole);cyl(pole,.09,8,[43,10.7,z],steel);box(pole,[.48,.12,.48],[43,6.7,z],fc);proPipe(pole,[[43,14.7,z],[43,15,z],[46.5,15,z]],.06,steel,.2);nightFixture(46.5,14.96,z,6.62,16);roadLightColumns.push({x:43,z,setback:4});}

const poweredNightLights=[];for(const [x,y,z,pow,dist] of [[-5,10.8,0,160,18],[3,10.8,0,180,18],[18,11,0,220,27],[72,11,0,260,25],[90,11,0,260,25],[110,11,0,260,25],[73,12,24,180,26],[105,12,24,180,26],[48,12,-150,180,65],[48,12,-90,180,65],[48,12,-30,180,65],[48,12,30,180,65],[48,12,90,180,65],[48,12,150,180,65],[63,9,5,70,10]]){const l=new T.PointLight('#d9e8ff',pow,dist,2);l.position.set(x,y,z);nightLighting.add(l);poweredNightLights.push({l,pow});}
// Distinct battery-backed guidance remains visible during transfer, without lighting production.
for(const [x,y,z] of [[61.8,9.4,14.45],[62.7,9.4,8.3],[62.7,9.4,1.7]]){box(nightLighting,[.40,.16,.06],[x,y,z],new T.MeshStandardMaterial({color:'#d1e8d8',emissive:'#27ce76',emissiveIntensity:1.8}));}
const nightStatus=document.createElement('p');nightStatus.className='mini-note';connectionPanel.append(nightStatus);
const beforeNightUpdate=substation.update;substation.update=function(...args){beforeNightUpdate(...args);const on=circuitState().bus, exteriorOn=on&&isNight;for(const m of nightFixtures){m.emissiveIntensity=exteriorOn?3:0;m.color.set(exteriorOn?'#dce6ed':'#454a50');}for(const o of nightLamps)o.visible=exteriorOn;for(const {l,pow}of poweredNightLights)l.intensity=on?(isNight?pow:(l.position.x>60&&l.position.z<15?pow*.6:0)):0;for(const l of oldSiteLights)l.intensity=on?(l.position.y<6?18:4):0;
 if(landscapeWorld.userData.night33!==isNight){landscapeWorld.userData.night33=isNight;landscapeWorld.traverse(o=>{if(o.isMesh&&o.material?.isMeshBasicMaterial&&o.material.map)o.material.color.set(isNight?'#17283d':'#ffffff');});}
 nightStatus.textContent=on?(isNight?'Modo nocturno':'Modo diurno')+' · suministro con '+(circuitState().qg?'planta de respaldo':'red'):'APAGÓN · alumbrado normal sin suministro; señalización autónoma activa';};
const nightView=document.createElement('button');nightView.textContent='Vista nocturna';nightView.onclick=()=>{focusFactory(true);$('viewName').textContent='Operación nocturna · fábrica y subestación';};connectionPanel.append(nightView);
// One persistent action toggles the environment without moving the camera.
const dayNightButton=document.createElement('button');dayNightButton.id='dayNightToggle';
nightView.parentNode.insertBefore(dayNightButton,nightView);dayNightButton.style.borderColor='#55bdb7';
function applyTimeOfDay(){
 for(const o of scene.children)if(o.isHemisphereLight)o.intensity=isNight?.19:1.05;
 light.intensity=isNight?.28:3;light.color.set(isNight?'#8ba6d0':'#fff1dc');rim.intensity=isNight?.10:.55;
 scene.environmentIntensity=isNight?.06:1;
 sky.material.uniforms.top.value.set(isNight?'#020713':'#6ea8d4');sky.material.uniforms.bottom.value.set(isNight?'#101e35':'#dbe7e9');
 normalLandscapeColor.set(isNight?'#07111f':'#b9d5e7');if(window.horizonMat)horizonMat.color.set(isNight?'#2a3b55':'#ffffff');groundMat.emissiveIntensity=isNight?.3:0;sectionBackgroundColor.set(isNight?'#101923':'#dfe8ed');
 dayNightButton.textContent=isNight?'Cambiar a día':'Cambiar a noche';dayNightButton.setAttribute('aria-label',dayNightButton.textContent);
 nightView.textContent='Vista general del conjunto';substation.update();renderer.shadowMap.needsUpdate=true;
}
dayNightButton.onclick=()=>{isNight=!isNight;applyTimeOfDay();};
nightView.onclick=()=>{focusFactory(true);$('viewName').textContent=(isNight?'Operación nocturna':'Operación diurna')+' · fábrica y subestación';};
applyTimeOfDay();
const lightingNote=document.createElement('p');lightingNote.className='mini-note';lightingNote.textContent='Alumbrado normal ligado a la carga agregada existente. No se han añadido potencias calculadas ni autonomía de baterías. Los halos son ilustrativos; no sustituyen un estudio de iluminación.';connectionPanel.append(lightingNote);
camera.far=3000;camera.updateProjectionMatrix();
substation.update();renderer.shadowMap.needsUpdate=true;

// Continuous paved forecourt, adjoining the original parking edge at z=29.
const parkingUpgrade=new T.Group();factory.add(parkingUpgrade);
const forecourtConcrete=mat('#929792'),parkingPaint=mat('#e3e0cd');
// Fill the roadside-to-parking gap visible in the user's capture.
box(parkingUpgrade,[4.9,.30,39],[41.55,6.52,35.5],forecourtConcrete);

box(parkingUpgrade,[60,.30,26],[74,6.52,42],forecourtConcrete);
for(const x of [44,104])box(parkingUpgrade,[.18,.16,26],[x,6.75,42],fc);
box(parkingUpgrade,[60,.16,.18],[74,6.75,55],fc);
for(let x=44;x<=104;x+=5)box(parkingUpgrade,[.018,.008,26],[x,6.677,42],mat('#727971'));
for(const z of [34,39,44,49,54])box(parkingUpgrade,[60,.008,.018],[74,6.677,z],mat('#727971'));
// Second parking row; the centre remains a clear circulation area.
for(let x=47;x<=101;x+=3)box(parkingUpgrade,[.09,.012,5],[x,6.686,51],parkingPaint);
for(const z of [35,45])box(parkingUpgrade,[58,.012,.10],[74,6.686,z],parkingPaint);
// Shared realistic vehicle materials; all textures are generated locally.
const tyreCanvas=document.createElement('canvas');tyreCanvas.width=tyreCanvas.height=128;const tyreCtx=tyreCanvas.getContext('2d');tyreCtx.fillStyle='#666';tyreCtx.fillRect(0,0,128,128);tyreCtx.strokeStyle='#303030';tyreCtx.lineWidth=3;
for(let y=0;y<128;y+=16){tyreCtx.beginPath();tyreCtx.moveTo(0,y);tyreCtx.lineTo(52,y+8);tyreCtx.moveTo(76,y+8);tyreCtx.lineTo(128,y);tyreCtx.stroke();}for(const xx of [54,74]){tyreCtx.fillStyle='#202020';tyreCtx.fillRect(xx,0,3,128);}
const tyreMap=new T.CanvasTexture(tyreCanvas);tyreMap.wrapS=tyreMap.wrapT=T.RepeatWrapping;tyreMap.repeat.set(1,6);
const vehicleRubber=new T.MeshStandardMaterial({color:'#202224',roughness:.94,bumpMap:tyreMap,bumpScale:.004}),vehicleTrim=mat('#24292d'),vehicleAlloy=new T.MeshStandardMaterial({color:'#b3b8bb',metalness:.9,roughness:.24}),vehicleGlass=new T.MeshPhysicalMaterial({color:'#233e48',metalness:.22,roughness:.12,clearcoat:1,clearcoatRoughness:.08});
const vehicleShadowCanvas=document.createElement('canvas');vehicleShadowCanvas.width=vehicleShadowCanvas.height=128;const vsc=vehicleShadowCanvas.getContext('2d'),vsg=vsc.createRadialGradient(64,64,8,64,64,63);vsg.addColorStop(0,'rgba(0,0,0,.55)');vsg.addColorStop(.55,'rgba(0,0,0,.30)');vsg.addColorStop(1,'rgba(0,0,0,0)');vsc.fillStyle=vsg;vsc.fillRect(0,0,128,128);const vehicleShadowMap=new T.CanvasTexture(vehicleShadowCanvas);
const vehicleShadowMaterial=new T.MeshBasicMaterial({map:vehicleShadowMap,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
const parkedVehicles=[];
function vehicleLoft(parent,stations,profile,material){
 const vertices=[],indices=[],rings=stations.map(profile),n=rings[0].length;
 for(let i=0;i<stations.length;i++)for(const [xx,yy]of rings[i])vertices.push(xx,yy,stations[i][0]);
 for(let i=0;i<stations.length-1;i++)for(let j=0;j<n;j++){const k=(j+1)%n,a=i*n+j,b=i*n+k,c=(i+1)*n+j,d=(i+1)*n+k;indices.push(a,b,c,b,d,c);}
 for(const i of [0,stations.length-1])for(let j=1;j<n-1;j++)if(i===0)indices.push(i*n,i*n+j+1,i*n+j);else indices.push(i*n,i*n+j,i*n+j+1);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();return mesh(parent,geo,material);
}
function parkedVehicle(x,z,color,type='sedan'){
 const car=new T.Group();car.name='Vehiculo_'+type+'_'+parkedVehicles.length;parkingUpgrade.add(car);car.position.set(x,6.67,z);parkedVehicles.push(car);
 if(type==='hatchback')car.scale.set(1,1.02,.92);if(type==='suv')car.scale.set(1.025,1.07,1.025);
 const paint=new T.MeshPhysicalMaterial({color,metalness:.62,roughness:.29,clearcoat:1,clearcoatRoughness:.16});
 const contact=mesh(car,new T.PlaneGeometry(2.2,4.40),vehicleShadowMaterial,[0,.006,0]);contact.rotation.x=-Math.PI/2;contact.castShadow=false;contact.receiveShadow=false;
 for(const sx of [-.855,.855])for(const sz of [-1.38,1.38]){const patch=mesh(car,new T.PlaneGeometry(.44,.62),vehicleShadowMaterial,[sx,.008,sz]);patch.rotation.x=-Math.PI/2;patch.castShadow=false;patch.receiveShadow=false;}
 const stations=[[-2.28,.66,.67,.43],[-2.12,.81,.85,.52],[-1.80,.875,.93,.79],[-1.42,.89,.98,.80],[-.90,.88,.99,.80],[.65,.88,.97,.80],[1.38,.89,.91,.79],[1.80,.86,.85,.77],[2.12,.80,.77,.50],[2.28,.65,.66,.43]];
 const body=vehicleLoft(car,stations,([zz,w,top,low])=>Array.from({length:24},(_,j)=>{const a=j*Math.PI/12,c=Math.cos(a),q=Math.sin(a);return [w*Math.sign(c)*Math.pow(Math.abs(c),.55),(top+low)/2+(top-low)/2*Math.sign(q)*Math.pow(Math.abs(q),.65)];}),paint);body.name='Carroceria_loft_curva';
 // Side skins contain genuine arch recesses instead of a box covering the wheels.
 const side=new T.Shape();side.moveTo(-2.22,.43);side.quadraticCurveTo(-2.16,.78,-1.75,.89);side.lineTo(-.92,.955);side.lineTo(.86,.935);side.quadraticCurveTo(1.80,.91,2.22,.60);side.lineTo(2.22,.39);side.lineTo(1.78,.31);side.lineTo(1.78,.36);side.bezierCurveTo(1.78,.91,.98,.91,.98,.36);side.lineTo(.98,.31);side.lineTo(-.98,.31);side.lineTo(-.98,.36);side.bezierCurveTo(-.98,.91,-1.78,.91,-1.78,.36);side.lineTo(-1.78,.31);side.lineTo(-2.22,.36);side.closePath();
 const sg=new T.ExtrudeGeometry(side,{depth:.045,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,curveSegments:24});sg.translate(0,0,-.0225);sg.rotateY(-Math.PI/2);
 for(const sign of [-1,1]){const skin=sg.clone(),ps=skin.attributes.position;for(let j=0;j<ps.count;j++){const az=Math.abs(ps.getZ(j)),inset=az>1.80?Math.min(.20,(az-1.80)*.45):0;ps.setX(j,ps.getX(j)-sign*inset);}skin.computeVertexNormals();mesh(car,skin,paint,[sign*.856,0,0]);}
 box(car,[1.34,.12,3.60],[0,.28,0],vehicleTrim);
 const roofH=type==='suv'?1.64:1.50,roofEnd=type==='sedan'?.70:1.02;
 const cabinStations=[[-1.12,.80,.985],[-.90,.75,1.22],[-.58,.667,roofH-.035],[-.30,.66,roofH],[.40,.66,roofH-.005],[roofEnd,.67,roofH-.06],[roofEnd+.27,.75,1.20],[roofEnd+.60,.81,.975]];
 const glassBody=vehicleLoft(car,cabinStations,([zz,w,top])=>[[.82,.94],[.825,1.00],[w+.035,top-.045],[w,top],[0,top+.010],[-w,top],[-w-.035,top-.045],[-.825,1.00],[-.82,.94]],vehicleGlass);glassBody.name='Cristales_inclinados';
 const roofStations=cabinStations.slice(2,6);vehicleLoft(car,roofStations,([zz,w,top])=>Array.from({length:14},(_,j)=>{const a=j*Math.PI/7;return [w*Math.cos(a),top+.012+.024*Math.sin(a)];}),paint);
 for(const sign of [-1,1]){
  proPipe(car,[[sign*.82,.985,-1.12],[sign*.70,1.31,-.80],[sign*.67,roofH-.035,-.58]],.025,paint,.08);
  proPipe(car,[[sign*.826,.96,.02],[sign*.71,1.27,.02],[sign*.668,roofH,.02]],.025,vehicleTrim,.04);
  proPipe(car,[[sign*.819,.98,roofEnd+.60],[sign*.75,1.23,roofEnd+.26],[sign*.67,roofH-.06,roofEnd]],.038,paint,.06);
  proPipe(car,[[sign*.84,.972,-1.10],[sign*.86,.96,.85],[sign*.82,.97,roofEnd+.57]],.012,vehicleTrim,.08);
  for(const [za,zb]of [[-.98,.02],[.04,1.03]])proPipe(car,[[sign*.886,.93,za],[sign*.887,.43,za+.04],[sign*.887,.39,zb-.05],[sign*.886,.92,zb]],.004,vehicleTrim,.04);
  for(const hz of [-.16,.93]){const h=mesh(car,new T.SphereGeometry(1,16,8),vehicleAlloy,[sign*.887,.835,hz]);h.scale.set(.014,.022,.092);}
  proPipe(car,[[sign*.80,1.01,-.76],[sign*.97,1.02,-.79]],.028,vehicleTrim,.04);const mirror=mesh(car,new T.SphereGeometry(1,20,10),paint,[sign*1.02,1.025,-.82]);mirror.scale.set(.125,.073,.18);
  const mirrorLens=mesh(car,new T.SphereGeometry(1,16,8),vehicleAlloy,[sign*1.027,1.028,-.684]);mirrorLens.scale.set(.097,.052,.015);
  // Molded tyre shoulders, recessed brake disc, rim lip, spokes and hub bolts.
  for(const wz of [-1.38,1.38]){
   const wheel=new T.Group();car.add(wheel);wheel.position.set(sign*.855,.354,wz);wheel.name='Rueda_con_paso_y_neumatico';
   const prof=[[.235,-.12],[.295,-.125],[.336,-.10],[.354,-.052],[.354,.052],[.336,.10],[.295,.125],[.235,.12],[.235,-.12]].map(p=>new T.Vector2(...p));
   const tyre=mesh(wheel,new T.LatheGeometry(prof,48),vehicleRubber);tyre.rotation.z=Math.PI/2;
   cyl(wheel,.215,.025,[sign*.089,0,0],mat('#545d63',.7),'x');cyl(wheel,.105,.09,[sign*.125,0,0],vehicleAlloy,'x');
   const lip=mesh(wheel,new T.TorusGeometry(.232,.016,10,48),vehicleAlloy,[sign*.122,0,0]);lip.rotation.y=Math.PI/2;
   for(let k=0;k<10;k++){const a=k*Math.PI/5;const spoke=box(wheel,[.028,.21,.024],[sign*.124,Math.cos(a)*.13,Math.sin(a)*.13],vehicleAlloy);spoke.rotation.x=a;}
   for(let k=0;k<5;k++){const a=k*Math.PI*2/5;cyl(wheel,.009,.014,[sign*.178,Math.cos(a)*.065,Math.sin(a)*.065],vehicleTrim,'x');}
   box(wheel,[.04,.12,.06],[sign*.093,.12,.12],mat('#645653',.4));
   // A dark wheel-well lip follows the arch, without crossing the tyre face.
   const arc=[];for(let k=0;k<=24;k++){const a=k*Math.PI/24;arc.push([sign*.889,.36+Math.sin(a)*.409,wz+Math.cos(a)*.40]);}proPipe(car,arc,.012,vehicleTrim,.005);
  }
 }
 // Curved lamp lenses, narrow LED strips, grille, bumper openings and licence plates.
 const lightFront=new T.MeshPhysicalMaterial({color:'#d7e5e6',metalness:.3,roughness:.15,clearcoat:1}),lightRear=new T.MeshPhysicalMaterial({color:'#932d2b',metalness:.2,roughness:.22,clearcoat:1});
 for(const sign of [-1,1]){
  const f=mesh(car,new T.SphereGeometry(1,24,12),lightFront,[sign*.58,.737,-2.115]);f.scale.set(.275,.080,.097);
  proPipe(car,[[sign*.36,.739,-2.195],[sign*.62,.762,-2.190],[sign*.78,.750,-2.148]],.012,lightFront,.06);
  const ts=new T.Shape();ts.moveTo(-.235,-.055);ts.quadraticCurveTo(-.265,.04,-.205,.06);ts.lineTo(.20,.055);ts.quadraticCurveTo(.26,.035,.235,-.045);ts.quadraticCurveTo(.05,-.073,-.235,-.055);ts.closePath();
  const tg=new T.ExtrudeGeometry(ts,{depth:.04,bevelEnabled:true,bevelThickness:.005,bevelSize:.005,bevelSegments:2,curveSegments:16}),tp=tg.attributes.position;
  for(let j=0;j<tp.count;j++){const gx=sign*.56+tp.getX(j);tp.setZ(j,tp.getZ(j)-Math.max(0,Math.abs(gx)-.56)*.62);}tg.computeVertexNormals();
  mesh(car,tg,lightRear,[sign*.56,.645,2.300]);
 }
 const grille=mesh(car,new T.SphereGeometry(1,24,12),vehicleTrim,[0,.49,-2.23]);grille.scale.set(.50,.115,.045);
 for(let j=0;j<4;j++)proPipe(car,[[-.40,.43+j*.037,-2.273],[0,.435+j*.037,-2.276],[.40,.43+j*.037,-2.273]],.006,vehicleAlloy,.06);
 for(const zz of [-2.285,2.285]){box(car,[.36,.11,.018],[0,.455,zz],mat('#d5d7d0'));for(const dx of [-.145,.145])cyl(car,.008,.014,[dx,.455,zz+(zz>0?.012:-.012)],vehicleTrim,'z');}
 // Hood and trunk seams follow the shoulder, with windshield wipers at the cowl.
 for(const sign of [-1,1])proPipe(car,[[sign*.70,.851,-2.05],[sign*.74,.957,-1.45],[sign*.72,.981,-1.10]],.004,vehicleTrim,.10);
 for(const dx of [-.30,.30])proPipe(car,[[dx,.989,-1.095],[dx+.17,1.002,-1.06]],.009,vehicleTrim,.02);
 return car;
}
for(const [x,color,type] of [[51.5,'#c6cbcc','sedan'],[57.5,'#364f68','hatchback'],[63.5,'#822f35','sedan'],[72.5,'#e1dfd4','suv'],[78.5,'#3c454d','sedan'],[90.5,'#61746d','hatchback'],[96.5,'#a9afb2','sedan']])parkedVehicle(x,24,color,type);
for(const [x,color,type]of [[54.5,'#566771','suv'],[69.5,'#d1d0c5','sedan'],[87.5,'#31383f','hatchback']])parkedVehicle(x,51,color,type);
const parkingViewButton=document.createElement('button');parkingViewButton.id='parkingView';parkingViewButton.textContent='Ver estacionamiento y vehículos';parkingViewButton.onclick=()=>{focusFactory(true);campusNav.target.set(88,7.5,35);distance=92;angle=.25;elevation=.95;$('viewName').textContent='Estacionamiento · carrocerías curvas y vehículos detallados · C05';};connectionPanel.prepend(parkingViewButton);
const vehicleDetailButton=document.createElement('button');vehicleDetailButton.textContent='Detalle de vehículos';vehicleDetailButton.onclick=()=>{focusFactory();campusNav.target.set(73.5,7.55,24);distance=7;angle=-.60;elevation=.34;camera.fov=43;camera.updateProjectionMatrix();$('viewName').textContent='C05 · carrocería curva, pasos de rueda y llantas';};connectionPanel.prepend(vehicleDetailButton);
const luminaireDetailButton=document.createElement('button');luminaireDetailButton.textContent='Luminaria del acceso al sótano';luminaireDetailButton.onclick=()=>{focusFactory(true);campusNav.target.set(-6.1,7.8,3);distance=12;angle=-.82;elevation=.55;camera.fov=43;camera.updateProjectionMatrix();$('viewName').textContent='C05 · luminaria fuera del hueco y con base anclada';};connectionPanel.prepend(luminaireDetailButton);

const parkingRevision=document.createElement('p');parkingRevision.className='mini-note';parkingRevision.textContent='Revisión C05 · 10 vehículos con carrocería curva, pasos de rueda, llantas y cristales detallados; pavimento continuo hasta la carretera.';connectionPanel.prepend(parkingRevision);
const latheView=document.createElement('button');latheView.textContent='Detalle de tornos CNC';latheView.onclick=()=>{inspectFactoryInterior();campusNav.target.set(65,8.3,-8);distance=12;angle=.15;elevation=.42;$('viewName').textContent='Torno CNC · carenado, guías y controles · T01';};connectionPanel.prepend(latheView);
const millView=document.createElement('button');millView.textContent='Detalle de fresadoras';millView.onclick=()=>{inspectFactoryInterior();campusNav.target.set(65,8.25,-1);distance=8;angle=.35;elevation=.40;$('viewName').textContent='Fresadora vertical · mesa, torreta y controles · M01';};connectionPanel.prepend(millView);
renderer.shadowMap.needsUpdate=true;

// Laser cutting cell in the extended workshop; replace only the central assembly bench.
for(const o of factoryExtension.children){if(o.isMesh&&((Math.abs(o.position.x-94)<.01&&Math.abs(o.position.z-6)<.01)||(Math.abs(o.position.z-6)<.01&&Math.abs(Math.abs(o.position.x-94)-1.4)<.01)))o.visible=false;}
const laserCell=new T.Group();laserCell.name='Cortadora_laser_industrial';factory.add(laserCell);laserCell.position.set(94,6.89,5);
const laserPaint=mat('#d2d8d5',.22),laserDark=mat('#29373a',.4),laserSteel=mat('#899797',.8),laserTeal=mat('#397f87',.3),laserRubber=mat('#172224');
// Welded frame, feet, support slats and removable front service panels.
box(laserCell,[6.2,.26,3.3],[0,.34,0],laserDark);
for(const xx of [-2.75,0,2.75])for(const zz of [-1.42,1.42]){box(laserCell,[.18,.25,.18],[xx,.125,zz],laserDark);box(laserCell,[.31,.055,.31],[xx,.0275,zz],laserSteel);}
for(const zz of [-1.43,1.43])box(laserCell,[6.1,.63,.18],[0,.76,zz],laserPaint);
for(const xx of [-3,3])box(laserCell,[.18,.63,2.88],[xx,.76,0],laserPaint);
box(laserCell,[5.75,.07,2.8],[0,.56,0],laserDark);
for(let xx=-2.75;xx<=2.76;xx+=.18){
 const sh=new T.Shape();sh.moveTo(-1.32,0);for(let zz=-1.32;zz<1.3;zz+=.22){sh.lineTo(zz+.10,.13);sh.lineTo(zz+.21,0);}sh.lineTo(1.32,-.15);sh.lineTo(-1.32,-.15);sh.closePath();
 const geo=new T.ExtrudeGeometry(sh,{depth:.02,bevelEnabled:false});geo.rotateY(Math.PI/2);mesh(laserCell,geo,laserDark,[xx,.98,0]);
}
for(const zz of [-1.60,1.60])box(laserCell,[6.15,.11,.12],[0,1.05,zz],laserDark);
for(let xx=-2.7;xx<2.8;xx+=.9){box(laserCell,[.73,.40,.035],[xx,.77,1.535],laserPaint);box(laserCell,[.025,.09,.055],[xx+.22,.81,1.56],laserSteel);for(let j=0;j<4;j++)box(laserCell,[.11,.02,.018],[xx-.22+j*.13,.65,1.558],laserDark);}
// Longitudinal rails and moving portal supported on both sides of the bed.
for(const zz of [-1.48,1.48]){box(laserCell,[5.78,.085,.07],[0,1.14,zz],laserSteel);box(laserCell,[.44,.12,.24],[-.45,1.22,zz],laserTeal);box(laserCell,[.27,.55,.32],[-.45,1.48,zz],laserPaint);}
box(laserCell,[.38,.39,3.20],[-.45,1.82,0],laserDark);box(laserCell,[.075,.045,2.9],[-.22,1.87,0],laserSteel);
for(const xx of [-2.65,2.56]){box(laserCell,[.28,.26,.30],[xx,1.27,-1.48],laserDark);cyl(laserCell,.07,.10,[xx,1.27,-1.66],laserSteel,'z');proPlate(laserCell,xx<0?'M-X-01':'M-Y-01',[xx,1.28,-1.30],.27,'#294849',.046);}
box(laserCell,[.26,.72,.35],[-.13,1.84,.30],laserTeal);box(laserCell,[.075,.64,.35],[.025,1.84,.30],laserPaint);
cyl(laserCell,.055,.22,[-.13,1.38,.30],laserSteel);mesh(laserCell,new T.ConeGeometry(.045,.10,20),laserSteel,[-.13,1.22,.30]).rotation.z=Math.PI;
// Linked cable carriers follow rail and head with a continuous curved return.
const chainPath=new T.CatmullRomCurve3([new T.Vector3(-2.6,1.22,-1.72),new T.Vector3(.1,1.22,-1.72),new T.Vector3(.34,1.52,-1.72),new T.Vector3(-.45,1.61,-1.72)]);
for(let j=0;j<=48;j++){const u=j/48,pt=chainPath.getPoint(u),ln=box(laserCell,[.075,.09,.13],pt.toArray(),laserRubber);ln.quaternion.setFromUnitVectors(new T.Vector3(1,0,0),chainPath.getTangent(u));}
proPipe(laserCell,[[-.45,1.94,-.9],[-.45,2.45,-.9],[-.13,2.45,.3],[-.13,2.18,.3]],.035,laserRubber,.2);
// Rotary chuck and outboard tube support, integrated into the machine base.
box(laserCell,[.55,.38,.65],[-3.27,.81,.92],laserDark);cyl(laserCell,.24,.13,[-3.52,1.04,.92],laserSteel,'x');
for(let j=0;j<3;j++){const a=j*2*Math.PI/3;box(laserCell,[.08,.075,.08],[-3.61,1.04+Math.cos(a)*.17,.92+Math.sin(a)*.17],laserDark).rotation.x=a;}
// Auxiliary chiller and extraction connect behind the cutting bed.
box(laserCell,[.65,.92,.66],[-2.25,.49,2.55],laserPaint);for(let j=0;j<7;j++)box(laserCell,[.49,.025,.018],[-2.25,.30+j*.06,2.89],laserDark);
box(laserCell,[.36,.40,.38],[-2.25,1.18,2.55],laserDark);for(let j=0;j<5;j++)box(laserCell,[.035,.34,.40],[-2.39+j*.07,1.18,2.55],laserSteel);cyl(laserCell,.12,.08,[-2.25,1.18,2.34],laserSteel,'z');proPlate(laserCell,'M-CH-01',[-2.25,1.18,2.30],.31,'#294849',.052);
proPipe(laserCell,[[-2.25,.65,2.24],[-2.25,.65,1.75],[-2.7,.72,1.75],[-2.7,.88,1.48]],.024,laserTeal,.10);
box(laserCell,[.70,1.15,.65],[2.4,.58,-2.5],laserPaint);box(laserCell,[.43,.40,.42],[2.4,1.38,-2.5],laserDark);for(let j=0;j<5;j++)box(laserCell,[.38,.025,.38],[2.4,1.22+j*.07,-2.5],laserSteel);cyl(laserCell,.10,.08,[2.4,1.38,-2.75],laserSteel,'z');proPlate(laserCell,'M-EX-01',[2.4,1.38,-2.80],.31,'#294849',.052);proPipe(laserCell,[[2.4,.40,-2.17],[2.4,.40,-1.9],[1.6,.40,-1.9],[1.6,.63,-1.48]],.13,laserDark,.15);
// Floor-mounted operator console with local stop and keypad.
box(laserCell,[.45,.08,.44],[3.75,.04,2.65],laserDark);box(laserCell,[.13,1.02,.14],[3.75,.59,2.65],laserSteel);box(laserCell,[.65,.53,.13],[3.75,1.32,2.65],laserPaint);
box(laserCell,[.49,.28,.025],[3.75,1.40,2.73],laserDark);proPlate(laserCell,'LASER-01 · LISTO',[3.75,1.41,2.76],.44,'#294849',.049);
for(let j=0;j<6;j++)box(laserCell,[.047,.04,.018],[3.57+j*.07,1.17,2.75],laserSteel);
cyl(laserCell,.044,.02,[4.00,1.13,2.75],mat('#c7aa3b'),'z');cyl(laserCell,.030,.04,[4.00,1.13,2.78],mat('#b23c34'),'z');
proPipe(laserCell,[[3.75,.9,2.61],[3.75,.12,2.4],[3.3,.12,2.0],[2.8,.30,1.4]],.024,laserRubber,.15);
proPlate(laserCell,'CORTE LÁSER · LASER-01',[0,.80,1.56],1.75,'#39747c',.14);
proSign(laserCell,'warning','RADIACIÓN LÁSER',[2.05,1.0,1.56],.33);
// Maintain a visible operator perimeter rather than filling the aisle with equipment.
for(const zz of [-3.15,3.4])box(laserCell,[8.25,.013,.055],[.10,.012,zz],safety);
for(const xx of [-4.0,4.25])box(laserCell,[.055,.013,6.55],[xx,.012,.125],safety);
// Extend the existing overhead distribution to the new cell without crossing the floor aisle.
for(const zz of [-4.24,-3.76])box(factoryServices,[24.1,.12,.035],[85.55,11.3,zz],fz);
for(let xx=74;xx<98;xx+=.7)box(factoryServices,[.035,.04,.48],[xx,11.26,-4],fz);
for(const xx of [80,88,96])cyl(factoryServices,.012,2.5,[xx,12.55,-4],fz);
proPipe(factoryServices,[[73.5,11.32,-4],[97.6,11.32,-4],[97.6,11.32,2.5],[97.6,8.30,2.5]],.045,fz,.18);
box(laserCell,[.38,.40,.20],[3.60,1.20,-2.5],laserPaint);proPlate(laserCell,'DS-L01',[3.60,1.28,-2.39],.29,'#354b52',.055);
proPipe(laserCell,[[3.60,1.0,-2.5],[3.60,.3,-2.5],[2.8,.30,-2.5],[2.8,.45,-1.4]],.028,laserRubber,.12);
factoryEnergyPath([[89.5,11.32,-4],[113.6,11.32,-4],[113.6,11.32,2.5],[113.6,8.30,2.5],[113.6,7.19,2.5],[112.8,7.19,2.5],[112.8,7.34,3.6]]);
const laserView=document.createElement('button');laserView.textContent='Detalle de cortadora láser';laserView.onclick=()=>{inspectFactoryInterior();campusNav.target.set(110,8.1,5);distance=16;angle=.36;elevation=.62;$('viewName').textContent='Cortadora láser · pórtico, mesa y auxiliares · L01';};connectionPanel.prepend(laserView);
renderer.shadowMap.needsUpdate=true;

// Saw cell replaces the rear storage row, keeping the central warehouse aisle clear.
for(const o of factoryExtension.children)if(o.isMesh&&Math.abs(o.position.z+10)<.01&&o.position.x>=87&&o.position.x<=103)o.visible=false;
const sawCell=new T.Group();sawCell.name='Sierra_cinta_doble_columna';factory.add(sawCell);sawCell.position.set(99,6.89,-10);
const sawTeal=mat('#278b91',.3),sawSilver=mat('#b3bcba',.75),sawFrame=mat('#3b4444',.5),sawBlack=mat('#1d282a'),sawPanel=mat('#acb6b1',.25);
// Heavy cast base, twin linear columns and common upper cross-member.
box(sawCell,[2.95,.18,1.80],[.22,.16,0],sawFrame);for(const xx of [-1.05,1.48])for(const zz of [-.66,.66])box(sawCell,[.18,.14,.18],[xx,.07,zz],sawBlack);
box(sawCell,[2.55,.53,1.52],[.22,.51,0],sawPanel);box(sawCell,[2.75,.13,1.65],[.22,.84,0],sawSilver);
for(const xx of [-1.03,1.47]){cyl(sawCell,.065,1.76,[xx,1.63,-.43],sawSilver);box(sawCell,[.21,.24,.25],[xx,1.25,-.43],sawTeal);box(sawCell,[.24,.19,.25],[xx,2.5,-.43],sawPanel);}
box(sawCell,[2.84,.15,.55],[.22,2.57,-.43],sawSilver);
// Cutting bow with two wheel covers, visible lower band and adjustable guides.
box(sawCell,[2.95,.16,.48],[.22,2.12,.01],sawTeal);
box(sawCell,[.38,.38,.34],[.22,1.77,-.38],sawFrame);for(let j=0;j<5;j++)box(sawCell,[.34,.025,.30],[.22,1.64+j*.055,-.38],sawSilver);cyl(sawCell,.095,.10,[.22,1.77,-.57],sawSilver,'z');proPlate(sawCell,'M-SC-01',[.22,1.77,-.19],.35,'#286d74',.052);
for(const xx of [-.95,1.39]){box(sawCell,[.66,.71,.48],[xx,1.80,.02],sawTeal);cyl(sawCell,.23,.09,[xx,1.80,.30],sawFrame,'z');cyl(sawCell,.075,.12,[xx,1.80,.31],sawSilver,'z');}
box(sawCell,[1.70,.025,.014],[.22,1.50,.08],sawSilver);
for(let xx=-.57;xx<1.07;xx+=.035)box(sawCell,[.013,.013,.017],[xx,1.484,.08],sawSilver);
for(const xx of [-.37,.82]){box(sawCell,[.14,.32,.14],[xx,1.67,.08],sawFrame);cyl(sawCell,.034,.07,[xx,1.53,.15],sawSilver,'z');box(sawCell,[.18,.09,.12],[xx,1.56,.08],sawTeal);}
cyl(sawCell,.15,.34,[1.40,2.40,-.14],sawFrame);for(let j=0;j<10;j++){const a=j*Math.PI/5;box(sawCell,[.017,.27,.017],[1.4+Math.sin(a)*.15,2.4,-.14+Math.cos(a)*.15],sawBlack);}
// Fixed and sliding jaws with screw and clamping hydraulic cylinder.
for(const xx of [-.15,.65])box(sawCell,[.15,.40,.67],[xx,1.11,.05],sawSilver);
box(sawCell,[.67,.14,.73],[.60,.94,.05],sawFrame);cyl(sawCell,.055,.69,[.91,1.05,.05],sawSilver,'x');cyl(sawCell,.12,.38,[1.48,1.05,.05],sawTeal,'x');
box(sawCell,[.48,.31,.32],[.24,1.07,.06],sawFrame);
// Feed conveyor: parallel frame rails, bearing blocks and transverse rollers.
for(const zz of [-.45,.55])box(sawCell,[4.75,.12,.10],[-3.45,.86,zz],sawFrame);
for(let xx=-5.68;xx<-1.2;xx+=.27){cyl(sawCell,.055,1.03,[xx,.98,.05],sawSilver,'z');for(const zz of [-.52,.62])box(sawCell,[.12,.12,.10],[xx,.96,zz],sawFrame);}
for(const xx of [-5.55,-3.70,-1.85])for(const zz of [-.45,.55]){box(sawCell,[.09,.76,.09],[xx,.44,zz],sawFrame);box(sawCell,[.22,.06,.22],[xx,.03,zz],sawSilver);}
box(sawCell,[3.50,.16,.18],[-3.20,1.11,.05],sawSilver);
// Inclined loading magazine behind the rollers, with stops and stock supports.
for(const xx of [-5.5,-3.4]){box(sawCell,[.12,.85,.12],[xx,.49,-1.15],sawPanel);const rail=box(sawCell,[.10,.09,1.18],[xx,1.09,-.89],sawSilver);rail.rotation.x=-.14;}
for(const zz of [-1.28,-.85])box(sawCell,[2.3,.09,.09],[-4.45,1.08,zz],sawSilver);
// Hydraulic power pack, extraction tray and restrained flexible hose routing.
box(sawCell,[.45,.55,.49],[1.16,.36,-1.11],sawTeal);
box(sawCell,[.38,.42,.42],[1.16,.94,-1.11],sawFrame);for(let j=0;j<6;j++)box(sawCell,[.34,.025,.36],[1.16,.82+j*.055,-1.11],sawSilver);cyl(sawCell,.12,.08,[1.16,.94,-1.34],sawSilver,'z');cyl(sawCell,.085,.26,[1.16,.94,-1.53],sawFrame,'z');proPlate(sawCell,'M-HID-01',[1.16,.94,-.88],.34,'#286d74',.055);
proPipe(sawCell,[[1.16,.66,-1.0],[1.55,.70,-.9],[1.55,1.1,-.43],[1.47,1.55,-.43]],.018,sawBlack,.10);
proPipe(sawCell,[[1.47,2.06,.0],[1.20,2.16,.0],[.82,1.75,.1],[.82,1.56,.1]],.017,sawBlack,.10);
box(sawCell,[2.3,.06,.62],[.22,.28,.72],sawFrame);
// Independent pedestal operator station.
box(sawCell,[.45,.075,.45],[2.08,.04,1.18],sawFrame);box(sawCell,[.10,.98,.10],[2.08,.55,1.18],sawFrame);
const consoleTop=box(sawCell,[.52,.12,.37],[2.08,1.08,1.18],sawBlack);consoleTop.rotation.x=.16;
box(sawCell,[.25,.01,.14],[2.02,1.15,1.13],mat('#5a8784'));for(const [xx,col]of [[1.92,'#488958'],[2.04,'#baab47'],[2.18,'#b74438']])cyl(sawCell,.027,.03,[xx,1.16,1.29],mat(col));
proPipe(sawCell,[[2.08,.9,1.18],[2.08,.16,1.18],[1.75,.16,.82],[1.50,.42,.7]],.020,sawBlack,.10);
proPlate(sawCell,'SIERRA CINTA · SC-01',[.20,.58,.785],1.32,'#286d74',.12);
proSign(sawCell,'warning','RIESGO DE CORTE',[-.95,1.87,.275],.27);
for(const zz of [-1.70,1.83])box(sawCell,[8.7,.012,.055],[-1.77,.012,zz],safety);
for(const xx of [-6.12,2.58])box(sawCell,[.055,.012,3.53],[xx,.012,.065],safety);
// Protected drop from the distribution extended for the laser cell.
proPipe(factoryServices,[[97.6,11.32,-4],[101.1,11.32,-4],[101.1,11.32,-10.9],[101.1,8.20,-10.9]],.038,fz,.16);
box(sawCell,[.28,.37,.18],[2.10,1.14,-.9],sawPanel);proPlate(sawCell,'DS-SC01',[2.10,1.18,-.79],.22,'#354b52',.049);
proPipe(sawCell,[[2.10,.95,-.90],[2.10,.27,-.90],[1.16,.27,-.9],[1.16,.36,-1.11]],.024,sawBlack,.1);
factoryEnergyPath([[113.6,11.32,-4],[117.1,11.32,-4],[117.1,11.32,-10.9],[117.1,8.20,-10.9],[117.1,7.16,-10.9],[116.16,7.16,-10.9],[116.16,7.25,-11.11]]);
const sawView=document.createElement('button');sawView.textContent='Detalle de sierra cinta';sawView.onclick=()=>{inspectFactoryInterior();campusNav.target.set(113,8.1,-10);distance=17;angle=.22;elevation=.55;$('viewName').textContent='Sierra cinta · doble columna y alimentador · S01';};connectionPanel.prepend(sawView);
const motorPanel=document.createElement('div');motorPanel.className='card';motorPanel.innerHTML='<h3>Accionamientos eléctricos de proceso</h3><p class="mini-note">Los motores principales van acoplados a sus máquinas, protegidos en el carenado o montados sobre el cabezal y las unidades auxiliares. Sus ramales se representan desde el CCM por charola y bajada a cada equipo.</p><p class="mini-note">Tornos: motor de husillo con variador y servomotores de ejes. Fresadoras: motor de husillo vertical y avances de mesa. Cortadora láser: servomotores de pórtico, bomba de chiller y extractor. Sierra cinta: motor de hoja M-SC-01, motor de unidad hidráulica M-HID-01 y rodillos de alimentación.</p><p class="mini-note">En la vista de detalle se identifican M-SP, M-FR, M-CH, M-EX y M-HID. Corrientes, potencias, arrancadores, conductores y protecciones por motor quedan pendientes de selección y cálculo; el flujo mostrado sigue siendo agregado.</p><button id="motorLocationButton">Ubicar motores en la fábrica</button>';$('explore').prepend(motorPanel);
$('motorLocationButton').onclick=()=>{inspectFactoryInterior();$('flows').checked=true;$('factoryFlowVisible').checked=true;campusNav.target.set(79,8.3,-4);distance=76;angle=.30;elevation=.38;substation.update();$('viewName').textContent='Motores integrados y cargas auxiliares → CCM-01';};
renderer.shadowMap.needsUpdate=true;

// CCM relocation: an electrical room below the west/front portion of the factory.
ccm.visible=false;ccmRoom.visible=false;ccmAccess.visible=false;ccmEarthing.visible=false;
for(const o of factoryServices.children)if(o.isMesh&&o.geometry.type!=='TubeGeometry'&&o.position.x>=44&&o.position.x<=46.1&&o.position.z>=4.8&&o.position.z<=7.2&&o.position.y>=6.85&&o.position.y<=9.3)o.visible=false;
const basementElectrical=new T.Group();basementElectrical.name='Cuarto_CCM_Sotano_18x12';factory.add(basementElectrical);basementElectrical.position.set(35,0,-2);
const basementShell=new T.Group();basementElectrical.add(basementShell);
const bConcrete=mat('#a7ada6'),bSteel=mat('#667579',.6),bFloor=mat('#717c79'),bCabinet=mat('#c4cecb',.28),bDark=mat('#263438'),bCable=mat('#465b60',.4),bReserve=mat('#869492',.2);
// 18 × 12 m room; finished floor at 2.47, below exterior grade 6.65.
box(basementShell,[18,.30,12],[54,2.32,10],bConcrete);
box(basementShell,[18,.03,12],[54,2.485,10],bFloor);
// Slab opening belongs entirely to the internal stair shaft (coordinates before room offset).
for(const [xa,xb,za,zb]of [[45,46.45,4,16],[51.85,63,4,16],[46.45,51.85,4,11.1],[46.45,51.85,14.7,16]])box(basementShell,[xb-xa,.26,zb-za],[(xa+xb)/2,6.52,(za+zb)/2],bConcrete);
for(const xx of [45,63])box(basementShell,[.25,3.92,12],[xx,4.44,10],bConcrete);
box(basementShell,[18,3.92,.25],[54,4.44,4],bConcrete);
// Continuous perimeter wall: no door or access from the parking area.
box(basementShell,[18,3.92,.25],[54,4.44,16],bConcrete);
for(const xx of [45.35,62.65])for(const zz of [4.35,15.65])box(basementShell,[.30,3.90,.30],[xx,4.45,zz],bConcrete);
for(const zz of [7,11,15]){if(zz!==11)box(basementShell,[17.5,.25,.25],[54,6.29,zz],bConcrete);else for(const [xa,xb]of [[45.25,46.25],[52.05,62.75]])box(basementShell,[xb-xa,.25,.25],[(xa+xb)/2,6.29,zz],bConcrete);}
const basementCCM=new T.Group();basementCCM.name='CCM01_8_activas_4_reserva';basementElectrical.add(basementCCM);const basementPilotLights=[];
for(let j=0;j<12;j++){
 const xx=47+j,spare=j>=8;box(basementCCM,[.97,.10,1.10],[xx,2.58,6.3],bSteel);box(basementCCM,[.94,2.50,1.05],[xx,3.89,6.3],spare?bReserve:bCabinet);
 box(basementCCM,[.90,.19,1.0],[xx,5.22,6.3],bCabinet);
 for(const dx of [-.35,.35])for(const dz of [-.36,.36])cyl(basementCCM,.025,.045,[xx+dx,2.66,6.3+dz],bSteel);
 if(spare){box(basementCCM,[.89,2.20,.055],[xx,3.91,6.86],bReserve);proPlate(basementCCM,'RESERVA '+(j-7),[xx,4.1,6.905],.68,'#5d7272',.12);}
 else if(j===0){box(basementCCM,[.86,.89,.05],[xx,4.55,6.86],bCabinet);box(basementCCM,[.47,.55,.08],[xx+.09,4.58,6.92],bDark);box(basementCCM,[.28,.16,.025],[xx+.09,4.73,6.975],mat('#456568'));box(basementCCM,[.095,.16,.04],[xx+.09,4.46,6.98],bSteel);proPlate(basementCCM,'PRINCIPAL',[xx,3.8,6.90],.59,'#334d55',.095);}
 else {for(let k=0;k<3;k++){const yy=2.95+k*.66;box(basementCCM,[.85,.57,.045],[xx,yy,6.86],bCabinet);box(basementCCM,[.065,.15,.035],[xx+.31,yy,6.91],bDark);proPlate(basementCCM,'U-'+j+'-'+(k+1),[xx-.18,yy+.10,6.91],.30,'#344b50',.068);const lm=new T.MeshStandardMaterial({color:'#4d8b68',emissive:'#36a46c',emissiveIntensity:.3});cyl(basementCCM,.022,.025,[xx-.19,yy-.09,6.93],lm,'z');basementPilotLights.push(lm);cyl(basementCCM,.022,.025,[xx-.06,yy-.09,6.93],mat('#913c37'),'z');}}
 if(!spare)proSign(basementCCM,'warning','RIESGO ELÉCTRICO',[xx,4.96,6.91],.20);
}
// Working strip, rear access and independent physical future expansion allowance.
for(const zz of [7.02,9.22])box(basementElectrical,[12.6,.012,.055],[52.5,2.514,zz],safety);
for(const xx of [46.2,58.8])box(basementElectrical,[.055,.012,2.20],[xx,2.514,8.12],safety);
proPlate(basementElectrical,'CCM-01 · PASILLO LIBRE 2.2 m',[52.5,2.74,9.25],4.8,'#635b39',.17);
for(const xx of [59.7,62.4])box(basementElectrical,[.055,.012,8.8],[xx,2.514,9.8],mat('#48807b'));
for(const zz of [5.4,14.2])box(basementElectrical,[2.7,.012,.055],[61.05,2.514,zz],mat('#48807b'));
proPlate(basementElectrical,'ÁREA RESERVADA · CRECIMIENTO',[61,3.1,14.0],2.4,'#346b68',.16);
// Incoming feeder stays in closed conduit under the nave, away from the pedestrian entrance.
proPipe(factoryServices,[[45,8.7,5],[45,6.08,5],[81,6.08,5],[81,6.08,4.3],[81,5.02,4.3]],.10,bCable,.16);
for(const xx of [48,51,54])proPipe(basementElectrical,[[xx,5.35,6.3],[xx,6.08,6.3],[59,6.08,6.3]],.065,bCable,.12);
proPipe(factoryServices,[[94,6.08,4.3],[94,11.3,4.3],[94,11.3,5],[45,11.3,5]],.11,bCable,.16);
proPipe(factoryServices,[[94,11.3,5],[94,11.3,-4],[45,11.3,-4]],.095,bCable,.16);
// Remove only the superseded CCM traces, preserving all machine and auxiliary branches.
for(let k=factoryEnergyItems.length-1;k>=0;k--){const it=factoryEnergyItems[k],pts=it.c.getPoints(20);if(pts.some(p=>p.x<63&&p.y<10)||pts.every(p=>p.x<=62)){const idx=substation.flowItems.indexOf(it);if(idx>=0)substation.flowItems.splice(idx,1);it.conduit.parent?.remove(it.conduit);for(const a of it.dots)a.parent?.remove(a);factoryEnergyItems.splice(k,1);}}
const enclosedFlowStart=factoryEnergyItems.length;
factoryEnergyPath([[61,8.7,5],[61,6.08,5],[97,6.08,5],[97,6.08,4.3],[97,4.3,4.3],[98,4.3,4.3]]);
factoryEnergyPath([[98,4.3,4.3],[105,4.3,4.3]]);
for(const xx of [99,102,105])factoryEnergyPath([[xx,4.3,4.3],[xx,6.08,4.3],[110,6.08,4.3]]);
factoryEnergyPath([[110,6.08,4.3],[110,11.3,4.3],[110,11.3,5],[61,11.3,5]]);
factoryEnergyPath([[110,11.3,5],[110,11.3,-4],[61,11.3,-4]]);
// Occlude diagnostic particles behind opaque cabinet doors and closed conduits.
for(const it of factoryEnergyItems.slice(enclosedFlowStart))for(const o of [it.conduit,...it.dots]){o.material=o.material.clone();o.material.depthTest=true;o.renderOrder=0;}
for(const o of [factoryLine,...factoryArrows]){o.material=o.material.clone();o.material.depthTest=true;o.renderOrder=0;}
// PE remains bonded to the site system, separate from neutral.
const basementPE=new T.Group();basementElectrical.add(basementPE);box(basementPE,[.06,.15,1.55],[46,3.35,5.45],earthCopper);proPlate(basementPE,'BARRA PE',[46,3.68,5.53],.72,'#285e47',.13);
proPipe(factoryServices,[[45,8.7,5.11],[45,6.02,5.11],[81,6.02,5.11],[81,3.35,5.11],[81,3.35,3.45]],.019,peInsulation,.12);
for(let j=0;j<12;j++){const xx=47+j;proPipe(basementPE,[[46,3.35,5.45],[46,2.72,5.45],[xx,2.72,5.45],[xx,2.72,5.85]],.018,peInsulation,.10);}
for(const xx of [45.35,62.65])proPipe(basementPE,[[46,3.35,5.45],[xx,3.35,5.45],[xx,3.35,4.35]],.018,peInsulation,.1);
proPipe(basementPE,[[46,3.35,5.45],[44,3.35,5.45],[44,2.9,15.5]],.018,earthCopper,.12);cyl(basementPE,.022,2.44,[44,1.55,15.5],earthCopper);
// Stair coordinates are shared by the floor cut, treads and full-width landings.
const basementStair=new T.Group();factory.add(basementStair);basementStair.name='Escalera_CCM_continua_B04';
const stairBottom=2.50,stairTop=6.88,stairRise=(stairTop-stairBottom)/26,stairMid=stairBottom+13*stairRise;
const stairTread=.30,stairStartX=81.60,stairEndX=85.20,stairLowZ=11.85,stairHighZ=9.95;
const stairSteps=[],stairLandings=[];
for(let flight=0;flight<2;flight++){
 const zz=flight?stairHighZ:stairLowZ,start=flight?stairEndX:stairStartX,dir=flight?-1:1;
 const outline=new T.Shape();
 for(let j=0;j<13;j++){
  const xx=start+dir*j*stairTread,yy=stairBottom+(j+1+flight*13)*stairRise;
  const step=box(basementStair,[stairTread,stairRise,1.50],[xx,yy-stairRise/2,zz],bConcrete);
  step.userData.stairStep={flight,index:j,top:yy};stairSteps.push(step);
  box(basementStair,[.035,.012,1.44],[xx+dir*.128,yy+.006,zz],bSteel);
 }
 // Two deep stringers join the base of every riser continuously.
 for(const side of [-.59,.59]){
  const y0=stairBottom+(1+flight*13)*stairRise-.14,y1=stairBottom+(13+flight*13)*stairRise-.14;
  const run=stairEndX-stairStartX,len=Math.hypot(run,y1-y0);
  const stringer=box(basementStair,[len+.31,.14,.085],[(stairStartX+stairEndX)/2,(y0+y1)/2,zz+side],bSteel);
  stringer.rotation.z=dir*Math.atan2(y1-y0,run);
 }
 for(const side of [-.78,.78]){
  const x0=start,x1=start+dir*12*stairTread,y0=stairBottom+(1+flight*13)*stairRise,y1=stairBottom+(13+flight*13)*stairRise;
  proPipe(basementStair,[[x0,y0+.95,zz+side],[x1,y1+.95,zz+side]],.026,bSteel,.01);
  for(let j=0;j<=4;j++)cyl(basementStair,.023,.95,[x0+(x1-x0)*j/4,y0+(y1-y0)*j/4+.475,zz+side],bSteel);
 }
}
// A 1.50 m deep shared landing meets the edges of both flights at exactly the same level.
const midLanding=box(basementStair,[1.50,.20,3.40],[86.10,stairMid-.10,10.90],bConcrete);stairLandings.push(midLanding);
const upperLanding=box(basementStair,[1.50,.20,1.50],[80.70,stairTop-.10,stairHighZ],bConcrete);stairLandings.push(upperLanding);
// Bottom landing is flush with the finished basement floor; it never sits above the first tread.
const lowLanding=box(basementStair,[1.50,.16,1.50],[80.70,stairBottom-.08,stairLowZ],bConcrete);stairLandings.push(lowLanding);
// Continuous edge rails, a clear turning area on the shared landing and no bars across the route.
proPipe(basementStair,[[86.85,stairMid+.95,9.20],[86.85,stairMid+.95,12.60]],.026,bSteel,.01);
for(const zz of [9.20,12.60])proPipe(basementStair,[[85.35,stairMid+.95,zz],[86.85,stairMid+.95,zz]],.026,bSteel,.01);
for(const zz of [9.2,10.05,10.9,11.75,12.6])cyl(basementStair,.023,.95,[86.85,stairMid+.475,zz],bSteel);
for(const zz of [9.1,12.7]){proPipe(basementStair,[[81.45,7.98,zz],[86.85,7.98,zz]],.027,bSteel,.01);proPipe(basementStair,[[81.45,7.43,zz],[86.85,7.43,zz]],.023,bSteel,.01);for(let xx=81.45;xx<=86.85;xx+=.60)cyl(basementStair,.024,1.10,[xx,7.43,zz],bSteel);}
proPipe(basementStair,[[86.85,7.98,9.1],[86.85,7.98,12.7]],.027,bSteel,.01);
for(const zz of [9.1,10.0,10.9,11.8,12.7])cyl(basementStair,.024,1.10,[86.85,7.43,zz],bSteel);
// Cover the lower flight at floor level but keep the upper flight opening unobstructed.
proPipe(basementStair,[[81.45,7.98,11.1],[81.45,7.98,12.7]],.027,bSteel,.01);
for(const zz of [11.1,11.9,12.7])cyl(basementStair,.024,1.10,[81.45,7.43,zz],bSteel);
// Restricted gate is on the north side of the upper landing, reachable from the internal aisle.
for(const xx of [79.95,81.45])cyl(basementStair,.026,1.10,[xx,7.43,9.20],bSteel);
for(const yy of [6.96,7.96])box(basementStair,[1.42,.035,.05],[80.70,yy,9.20],bSteel);
for(let xx=80.02;xx<=81.4;xx+=.12)box(basementStair,[.018,.96,.03],[xx,7.46,9.20],bSteel);
box(basementStair,[.045,.15,.07],[81.30,7.50,9.16],bDark);
const stairWarning=proSign(basementStair,'warning','ACCESO RESTRINGIDO',[80.70,7.60,9.14],.30);if(stairWarning)stairWarning.rotation.y=Math.PI;
const stairLabel=proPlate(basementStair,'CCM-01 · SÓTANO',[80.70,8.14,9.14],1.50,'#3d6668',.13);if(stairLabel)stairLabel.rotation.y=Math.PI;
// There is no electrical cabinet in the common area. AF-01 continues through closed metal conduit.
const protectedIntake=new T.Group();protectedIntake.name='AF01_bajada_sin_tablero_en_area_comun';factoryServices.add(protectedIntake);
proPipe(protectedIntake,[[45,8.7,5],[45,6.08,5]],.145,bSteel,.01);
for(const yy of [6.35,7.25,8.15])box(protectedIntake,[.42,.065,.36],[45,yy,5],bSteel);
const basementIntake=new T.Group();basementElectrical.add(basementIntake);basementIntake.name='AF01_entrada_en_cuarto_electrico';
box(basementIntake,[.65,1.35,.55],[46,4.30,6.3],bCabinet);
box(basementIntake,[.59,1.23,.035],[46,4.30,6.60],bCabinet);
box(basementIntake,[.04,.18,.06],[46.22,4.30,6.64],bDark);
proSign(basementIntake,'warning','ENTRADA AF-01',[46,4.58,6.64],.27);cyl(basementIntake,.12,.12,[46,4.995,6.3],bSteel);
for(const xx of [47,48,51,54])cyl(basementElectrical,.105,.12,[xx,5.33,6.3],bSteel);
proPipe(basementIntake,[[46,5.02,6.3],[46,6.08,6.3],[47,6.08,6.3],[47,5.35,6.3]],.10,bCable,.12);
// Ventilation bypasses the lineup; sump is at the opposite corner of the room.
proPipe(basementElectrical,[[62,5.9,12],[62,6.08,12],[62,6.08,15.0],[62,7.45,15.0]],.16,bSteel,.20);
box(basementElectrical,[.65,.65,.55],[62,7.6,15.0],bConcrete);for(let j=0;j<7;j++)box(basementElectrical,[.52,.03,.06],[62,7.35+j*.075,15.31],bDark);
box(basementElectrical,[.85,.065,.85],[61.9,2.54,14.6],bDark);for(let j=0;j<7;j++)box(basementElectrical,[.72,.02,.025],[61.9,2.58,14.29+j*.1],bSteel);proPlate(basementElectrical,'SUMIDERO',[61.9,2.83,15.02],.76,'#4c6060',.10);
const basementLights=[],basementLenses=[];
for(const lightX of [49,58])for(const zz of [8,13]){const xx=lightX===49&&zz===13?54:lightX;box(basementElectrical,[1.3,.07,.18],[xx,6.19,zz],bSteel);const lm=new T.MeshStandardMaterial({color:'#dce8e5',emissive:'#ddeeff',emissiveIntensity:2});box(basementElectrical,[1.2,.02,.13],[xx,6.14,zz],lm);basementLenses.push(lm);const pl=new T.PointLight('#d9e7ed',45,12,2);pl.position.set(xx,5.9,zz);basementElectrical.add(pl);basementLights.push(pl);}
proSign(basementElectrical,'exit','SALIDA',[47,4.90,15.82],.42);proSign(basementElectrical,'ppe','SOLO PERSONAL AUTORIZADO',[61,4.2,15.84],.52);
const beforeBasementUpdate=substation.update;substation.update=function(...args){beforeBasementUpdate(...args);ccm.visible=ccmRoom.visible=ccmAccess.visible=ccmEarthing.visible=false;const on=circuitState().bus;for(const pl of basementLights)pl.intensity=on?45:0;for(const lm of basementLenses)lm.emissiveIntensity=on?2:0;for(const lm of basementPilotLights)lm.emissiveIntensity=on?.65:0;};
const beforeCCMCameraPreset=cameraPreset;cameraPreset=function(...args){camera.fov=36;camera.updateProjectionMatrix();return beforeCCMCameraPreset(...args);};
function inspectBasementCCM(){focusFactory();camera.fov=90;camera.updateProjectionMatrix();campusNav.target.set(103.5,4.10,4.9);distance=4.8;angle=0;elevation=.04;factoryInteriorNav.style.display='none';$('viewName').textContent='CCM-01 · sótano eléctrico · 8 secciones + 4 reservas';$('viewCode').textContent='SERVICIOS / SÓTANO';renderer.shadowMap.needsUpdate=true;}
ccmButton.textContent='CCM · sótano del área de servicios';ccmButton.onclick=inspectBasementCCM;
const stairInspectButton=document.createElement('button');stairInspectButton.textContent='Acceso interior al CCM';stairInspectButton.onclick=()=>{inspectFactoryInterior();campusNav.target.set(100,5.65,10.9);distance=12;angle=.55;elevation=.85;camera.fov=50;camera.updateProjectionMatrix();factoryInteriorNav.style.display='none';$('viewName').textContent='CCM-01 · escalera continua y acceso restringido';};connectionPanel.append(stairInspectButton);
destClose.textContent='Llegada al CCM en sótano';destClose.onclick=inspectBasementCCM;
roomToggle.remove();
peToggle.onclick=()=>{inspectBasementCCM();peInspection=!peInspection;basementPE.traverse(o=>{if(o.isMesh){if(!o.userData.peClone){o.material=o.material.clone();o.userData.peClone=true;}o.material.depthTest=!peInspection;o.renderOrder=peInspection?45:0;}});peToggle.textContent=peInspection?'Cerrar inspección de tierras':'Inspeccionar puesta a tierra';};
ccmNote.textContent='CCM trasladado a cuarto eléctrico de 18 × 12 m completamente dentro de la huella de la fábrica, en el área de servicios de la ampliación, con escalera interior de dos tramos continuos, descansos de 1.5 m, barandales y puerta de acceso restringido: 8 secciones activas y 4 de reserva, pasillo frontal de diseño de 2.2 m y acceso posterior. Capacidad eléctrica, protecciones, cortocircuito, ventilación, impermeabilización, drenaje, accesibilidad y detalles constructivos pendientes de proyecto. La reserva física no aumenta la capacidad disponible del alimentador.';
groundingNote.textContent='PE del cuarto une gabinetes y estructura al sistema general mediante el conductor asociado a AF-01; sin unión N-PE añadida. Calibres, electrodos, resistividad y estudio de fallas pendientes.';
connectionPanel.querySelector('.mini-note').textContent='AF-01 aéreo desciende por canalización metálica cerrada; su gabinete de entrada queda en el cuarto eléctrico del sótano, fuera del área común. Los motores se alimentan por montantes, charolas y desconectadores locales. Capacidades y demanda pendientes de cálculo.';
factoryEnergyNote.textContent='Ruta: AF-01 aéreo → bajada cerrada → gabinete de entrada y CCM en sótano → montante → charolas y máquinas. Las reservas permanecen sin uso. Consumo individual y capacidad futura pendientes de cálculo.';
// Cut rectangular stair openings from concrete slabs that overlap the service access.
function openingInSlabs(parent){for(const o of [...parent.children]){if(!o.isMesh||o.geometry.type!=='BoxGeometry')continue;const gp=o.geometry.parameters;if(gp.height>.35||o.position.y<6.4||o.position.y>6.90)continue;const xa=o.position.x-gp.width/2,xb=o.position.x+gp.width/2,za=o.position.z-gp.depth/2,zb=o.position.z+gp.depth/2;const ia=Math.max(xa,81.45),ib=Math.min(xb,86.85),ja=Math.max(za,9.1),jb=Math.min(zb,12.7);if(ib<=ia||jb<=ja)continue;o.visible=false;for(const [x0,x1,z0,z1]of [[xa,ia,za,zb],[ib,xb,za,zb],[ia,ib,za,ja],[ia,ib,jb,zb]])if(x1>x0&&z1>z0)box(parent,[x1-x0,gp.height,z1-z0],[(x0+x1)/2,o.position.y,(z0+z1)/2],o.material);}}
openingInSlabs(factory);openingInSlabs(parkingUpgrade);openingInSlabs(factoryExtension);

// D06 — essential destinations and permanent access to the CCM.
(function simplifyNavigation(){
 const ribbon=$('viewbar'), destinations=ribbon.firstElementChild, tools=ribbon.lastElementChild;
 const previous=[...destinations.children];
 const more=document.createElement('details');more.id='secondaryViews';
 more.innerHTML='<summary title="Cámara, cortes e interior">Más vistas</summary><div class="view-options-menu"></div>';
 const options=more.lastElementChild;
 for(const button of previous){
  const mode=button.dataset.view;
  if(mode==='front'||mode==='iso'||button===cutGeneralButton||button===insideFactoryButton){options.append(button);}
  else button.remove();
 }
 previous.find(b=>b.dataset.view==='iso').textContent='Perspectiva de subestación';
 previous.find(b=>b.dataset.view==='front').textContent='Frente de subestación';
 destinations.setAttribute('role','navigation');destinations.setAttribute('aria-label','Destinos del simulador');
 function selectDestination(key){destinations.querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b.dataset.nav===key);if(b.dataset.nav===key)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});more.open=false;}
 const entries=[['general','General',()=>focusFactory(true)],['yard','Subestación',()=>{setGeneralCut(false);setProView('yard');}],['emergency','Emergencia',()=>{setGeneralCut(true);setProView('plant');}],['factory','Exterior fábrica',()=>$('factoryInteriorExit').click()],['interior','Interior fábrica',()=>inspectFactoryInterior()],['ccm','CCM',inspectBasementCCM]];
 for(const [key,label,action] of entries){const button=key==='ccm'?ccmButton:key==='interior'?insideFactoryButton:document.createElement('button');button.textContent=label;button.dataset.nav=key;button.title=key==='ccm'?'Ir directamente al CCM del sótano de la fábrica':key==='emergency'?'Ver la planta de emergencia en el sótano':label;button.onclick=()=>{camera.fov=50;camera.updateProjectionMatrix();factoryInteriorNav.style.display='none';action();selectDestination(key);};if(key==='ccm')button.id='directCCM';destinations.append(button);}
 tools.classList.add('nav-tools');tools.prepend(more);
 for(const button of options.querySelectorAll('button')){const action=button.onclick;button.onclick=event=>{action.call(button,event);more.open=false;destinations.querySelectorAll('button').forEach(b=>{b.classList.remove('active');b.removeAttribute('aria-current');});};}
 document.addEventListener('pointerdown',event=>{if(!more.contains(event.target))more.open=false;});
 more.addEventListener('keydown',event=>{if(event.key==='Escape'){more.open=false;more.querySelector('summary').focus();}});
 // Equipment inspection already exists in the Explore menu; retain the unique bus view there.
 const bus=document.createElement('button');bus.textContent='Barras colectoras';bus.onclick=()=>setProView('bus');$('equipmentFocus').append(bus);viewShortcuts.remove();
 const zones=document.createElement('details');zones.innerHTML='<summary>Recorridos del interior</summary>';zones.append(factoryInteriorNav);factoryPanel.append(zones);
 destClose.remove();
 // Duplicate overview buttons are replaced by the permanent destination ribbon.
 $('factoryView').remove();$('factoryCampus').remove();
 selectDestination('general');
 if(matchMedia('(max-width:760px)').matches){document.body.classList.add('menu-collapsed');$('toggleRail').setAttribute('aria-expanded','false');}
})();


// D08 — annotated introduction to the emergency generator, built from the existing 3D model.
initUnidadUI();
// D24 — operarios a escala humana, sin modificar los equipos ni su lógica.
// D25: mallas exportadas desde Blender; geometrías y texturas compartidas.
