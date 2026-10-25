// Electrical data behind DU-01. Symbol conventions and ANSI function numbers are separate references.
const Unifilar42=(()=>{
 const pending='PD · pendiente de ingeniería';
 const equipment=[
  ['RED','Acometida del suministrador','13.8 kV','Fuente normal; potencia y cortocircuito del suministrador por obtener.'],
  ['DS-01','Seccionador de llegada','13.8 kV','Separación visible. Permanece cerrado en el escenario; no se representa como interruptor de carga.'],
  ['AP-01','Apartarrayos de llegada','13.8 kV','Derivación fase-tierra para sobretensiones. Selección de tensión/MCOV y coordinación pendientes.'],
  ['TC-01','Transformadores de corriente de llegada','13.8 kV','Primario en la llegada de red. No mide la corriente del generador cuando QN está abierto. Relación, clase y carga: PD.'],
  ['QN','Interruptor de entrada normal · 52-N','13.8 kV','Enclavado con QG. Abre antes de conectar el respaldo; corriente nominal y capacidad interruptiva: PD.'],
  ['G-01','Generador síncrono','480 V L-L','Tres fases equilibradas. Potencia activa configurable; potencia aparente nominal calculada con FP nominal de referencia 0.80.'],
  ['Q0','Interruptor de generador · 52-G0','480 V','El modelo lo considera cerrado cuando el grupo queda disponible. Su capacidad interruptiva y curva no están dimensionadas.'],
  ['TE','Transformador elevador','0.48 / 13.8 kV','Transformador ideal del modelo. kVA, impedancia, derivaciones y conexión de devanados: PD. No se infiere neutro.'],
  ['QG','Interruptor de entrada de respaldo · 52-G','13.8 kV','Enclavado con QN; no se permite paralelo red-generador.'],
  ['B-MT','Barra colectora de media tensión','13.8 kV','Nodo común de fuentes. Capacidad de corriente, soportabilidad de cortocircuito y aislamiento: PD.'],
  ['TP-M','Transformadores de potencial para medida','13.8 kV','Derivados de la barra MT. Se distinguen de TP, transformador de potencia reductor. Relación, conexión y clase: PD.'],
  ['QS','Interruptor de salida · 52-S','13.8 kV','Alimenta TP. En el modelo cierra con barra disponible; no es un mando de campo independiente.'],
  ['TP','Transformador principal reductor','13.8 / 0.48 kV','Transformación ideal de la barra MT a las cargas BT. Potencia, Z%, grupo y tratamiento de neutro: PD.'],
  ['QF-01','Interruptor de alimentador de fábrica','480 V','Gabinete representado en 3D. No tiene una maniobra ni una protección independiente resuelta por el modelo.'],
  ['AF-01','Alimentador aéreo a fábrica','480 V','3F + PE, mensajero y bajadas protegidas del modelo. Calibre, aislamiento, longitud eléctrica y caída de tensión: PD.'],
  ['CCM-01','Centro de control de motores','480 V','Unidades activas y reservas del modelo 3D. La potencia del simulador es agregada; no se distribuye como potencias medidas de cada motor.'],
  ['PE','Conductor de protección y malla común','Sin tensión de servicio asignada','Unión de masas de generador, transformadores y gabinetes. No es conductor de carga. No se añade unión N-PE en el CCM.'],
  ['RP-01','Funciones de protección propuestas','50/51 · 50N/51N','Números de función de uso ANSI/IEEE C37.2. No equivalen a símbolos NMX ni a ajustes o disparos calculados.'],
  ['RG-01','Supervisión propuesta del generador','27/59 · 81U/81O','Sub/sobretensión y sub/sobrefrecuencia. Umbrales, temporizaciones y coordinación: PD.']
 ].map(([id,name,voltage,description])=>({id,name,voltage,description,nominal:pending,interrupting:pending}));
 const symbolRefs={'G-01':['4.2.127','GG','24'], 'DS-01':['4.2.118','DSSC','22'], 'AP-01':['4.2.120','APART','22'], 'TC-01':['4.2.124','TC','23'], 'QN':['4.2.14','INT','5'], 'QG':['4.2.14','INT','5'], 'Q0':['4.2.14','INT','5'], 'QS':['4.2.14','INT','5'], 'QF-01':['4.2.14','INT','5'], 'TE':['4.2.69','TR2DEVF1','14'], 'TP':['4.2.69','TR2DEVF1','14'], 'TP-M':['4.2.75','TP','15'], 'PE':['4.2.13','T','5']};
 for(const e of equipment){e.symbol=symbolRefs[e.id]||null;e.frame=pending;e.trip=pending;}
 const feeders=[['A-01','Red → DS-01 → TC-01 → QN',13800,'normal','Acometida trifásica del modelo'],['F-01','G-01 → Q0 → TE',480,'generator','3F + PE · canalización sótano/patio'],['F-02','TE → QG → B-MT',13800,'generator','Conexiones exteriores de MT'],['F-03','B-MT → QS → TP',13800,'load','Barra y salida MT'],['AF-01','TP → QF-01 → CCM-01',480,'load','3F + PE · tendido aéreo y bajadas']].map(([id,route,voltage,branch,installation])=>({id,route,voltage,branch,installation}));
 function values(cfg,q,grid){const pf=Number(cfg.pf),p=Number(q.kw);if(!(pf>0&&pf<=1)||!Number.isFinite(p)||p<0)throw Error('Potencia o FP fuera de dominio');
  const current=(v,on)=>on?p*1000/(Math.sqrt(3)*v*pf):0;
  return{p:p,s:p/pf,q:p*Math.tan(Math.acos(pf)),pf,frequency:Number(cfg.freq),ratedKW:Number(cfg.rating),ratedKVA:Number(cfg.rating)/.8,ratedCurrent:Number(cfg.rating)*1000/(Math.sqrt(3)*480*.8),
   currents:{normal:current(13800,q.qn),generator:current(480,q.qg),generatorMT:current(13800,q.qg),loadMT:current(13800,q.bus),load:current(480,q.bus)},
   contacts:{Q0:!!q.q0,QN:!!q.qn,QG:!!q.qg,QS:!!q.bus},live:{grid:!!grid,generator:!!q.ready,bus:!!q.bus},parallel:!!(q.qn&&q.qg),source:q.qg?'Respaldo':q.qn?'Red':'Sin suministro'};
 }
 return{equipment,feeders,pending,values,symbolRefs,reference:{symbol:'NMX-J-136-ANCE-2019',edition:'Ejemplar facilitado por el usuario · columna Símbolo nacional de Tabla 1',functions:'NMX-J-136-ANCE-2019 · capítulo 6 / Tabla 2; números de función de uso ANSI',installation:'NOM-001-SEDE-2012 · criterios de instalación, no catálogo de símbolos'}};
})();
