// NEXORA is an invented training brand. Unspecified engineering ratings remain unspecified.
const EquipmentData48=(()=>{
 const definitions=[
  ['G-01','Grupo electrógeno','NX-GEN','Planta de emergencia'],
  ['Q0','Interruptor del generador','NX-BT','Planta de emergencia'],
  ['TE','Transformador elevador','NX-TR-E','Subestación'],
  ['TP','Transformador principal','NX-TR-R','Subestación'],
  ['AP-01','Apartarrayos de llegada','NX-AP13','Subestación'],
  ['AP-TE','Apartarrayos del elevador','NX-AP13','Subestación'],
  ['AP-TP','Apartarrayos del principal','NX-AP13','Subestación'],
  ['QN','Interruptor de red normal','NX-MT','Subestación'],
  ['QG','Interruptor de respaldo','NX-MT','Subestación'],
  ['QS','Interruptor de salida','NX-MT','Subestación'],
  ['TC-01','Transformadores de corriente','NX-TC','Subestación'],
  ['TP-M','Transformadores de potencial','NX-TPM','Subestación'],
  ['PR-01','Gabinete de protección y mando','NX-IED','Subestación'],
  ['DC-01','Gabinete de servicios DC','NX-DC','Subestación'],
  ['QF-01','Interruptor de fábrica','NX-BT','Alimentación de fábrica'],
  ['CCM-01','Centro de control de motores','NX-CCM','Interior de fábrica'],
  ...[1,2,3,4].map(i=>['PC-0'+i,'Mástil de captación','NX-PC','Subestación'])
 ].map(([id,name,model,zone])=>({id,name,model,zone}));
 const pending='Por definir';
 function get(id,config){
  const base=definitions.find(e=>e.id===id);if(!base)return null;
  const c=config||{rating:50,freq:60,phase:3,fuel:'diesel'},fields=[],unknown=[];
  const field=(name,value,origin='Escenario')=>fields.push({name,value:String(value),origin});
  const missing=(...names)=>unknown.push(...names.map(name=>({name,value:pending,origin:'Pendiente de proyecto'})));
  if(id==='G-01'){
   field('Potencia activa',Number(c.rating)+' kW');field('Potencia aparente de referencia',(Number(c.rating)/.80).toFixed(1)+' kVA','Calculada · FP nominal de referencia 0.80');
   field('Tensión',Number(c.phase)===3?'480 V L-L':'277 V · modo monofásico');field('Frecuencia',c.freq+' Hz');field('Fases',c.phase);field('Combustible',{diesel:'Diésel',petrol:'Gasolina',ng:'Gas natural',lpg:'Gas LP',bi:'Bicombustible'}[c.fuel]||c.fuel);
   missing('Clase de aislamiento','Grado de protección','Datos de fabricación');
  }else if(['TE','TP'].includes(id)){
   field('Tensión primaria',id==='TE'?'0.48 kV':'13.8 kV');field('Tensión secundaria',id==='TE'?'13.8 kV':'0.48 kV');field('Fases','3');field('Frecuencia',c.freq+' Hz');
   missing('Potencia nominal (kVA)','Impedancia (%)','Grupo de conexión','Derivaciones');
  }else if(id.startsWith('AP-')){
   field('Tensión de la red','13.8 kV');field('Unidades representadas','3 · L1 / L2 / L3');field('Conexión','Fase–tierra');field('Envolvente representada','Polimérica');
   missing('Tensión asignada Ur','MCOV / Uc','Corriente de descarga In','Capacidad energética');
  }else if(['QN','QG','QS','Q0','QF-01'].includes(id)){
   field('Tensión del circuito',['Q0','QF-01'].includes(id)?'480 V':'13.8 kV');field('Polos representados','3');field('Frecuencia',c.freq+' Hz');
   if(['QN','QG','QS'].includes(id))field('Accionamiento representado','Motor · resortes · bobinas');
   missing('Corriente nominal / marco','Capacidad interruptiva','Ajuste y curva de protección','Tensión de mando');
  }else if(id==='TC-01'||id==='TP-M'){
   field('Circuito primario','13.8 kV');field('Servicio',id==='TC-01'?'Señal de corriente':'Señal de tensión');field('Frecuencia',c.freq+' Hz');
   missing('Relación nominal','Clase de precisión','Carga nominal','Nivel de aislamiento');
  }else if(id==='PR-01'){
   field('Equipo','Relé digital IED en puerta');field('Circuitos','Secundarios TC / TP');field('Borneras','Prueba TC · tensión · mando · alarmas');field('Funciones propuestas','50/51 · 50N/51N');
   missing('Alimentación auxiliar','Entradas nominales del IED','Ajustes y temporizaciones');
  }else if(id==='DC-01'){
   field('Servicio','Cargador y reserva DC');field('Destino','Mando y protección');missing('Tensión DC nominal','Capacidad de batería (Ah)','Corriente del cargador');
  }else if(id==='CCM-01'){
   field('Tensión del circuito','480 V');field('Fases representadas','3');field('Alimentación','AF-01');field('Compartimentos','Unidades activas y reservas');
   missing('Corriente nominal de barras','Soportabilidad de cortocircuito','Potencias individuales de motores');
  }else{
   field('Sistema','Punta captora y mástil de celosía');field('Conexión','Bajante a malla común');field('Identificación',id);
   missing('Clase del sistema de protección','Estudio de cobertura','Dimensionamiento de bajante');
  }
  return{...base,brand:'NEXORA',origin:'Marca y modelo ficticios para entrenamiento',fields,unknown};
 }
 return{definitions,get,pending};
})();
