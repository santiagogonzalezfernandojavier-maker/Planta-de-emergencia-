// Reference: user's Spanish NFPA 110, edition 2010. Educational safeguards, not a conformity assessment.
const SafetyRules42=(()=>{
 const conditions=[
  {id:'vent',label:'Entrada y descarga de aire despejadas',ref:'7.7.1–7.7.4',critical:true},
  {id:'exhaust',label:'Escape íntegro, sin fuga hacia el cuarto',ref:'7.10.2–7.10.4',critical:true},
  {id:'fuel',label:'Sin fuga de combustible',ref:'7.9',critical:true},
  {id:'dry',label:'Cuarto sin agua ni riesgo inmediato de inundación',ref:'7.2.3',critical:true},
  {id:'charger',label:'Cargador automático disponible',ref:'5.6.4.6',critical:false},
  {id:'lighting',label:'Alumbrado autónomo de emergencia disponible',ref:'7.3.1–7.3.3',critical:false}
 ];
 function create(){return{checks:Object.fromEntries(conditions.map(c=>[c.id,true])),guard:false,pressed:false,latched:false,acknowledged:[],records:[]};}
 function blockers(state){return[...(state.latched?['Paro remoto enclavado']:[]),...conditions.filter(c=>c.critical&&!state.checks[c.id]).map(c=>c.label)];}
 function alarms(state,engine,mode){return[...(state.latched?[{id:'remote',label:'PARO REMOTO ENCLAVADO',severity:'trip',ref:'5.6.5.6'}]:[]),...conditions.filter(c=>!state.checks[c.id]).map(c=>({id:c.id,label:c.label+' · REVISAR',severity:c.critical?'inhibit':'warning',ref:c.ref})),...(mode!=='auto'?[{id:'not-auto',label:'Selector fuera de AUTO',severity:'notice',ref:'5.6.5.2 / Tabla 5.6.5.2'}]:[]),...(engine.fault?[{id:'engine',label:engine.fault,severity:'trip',ref:'5.6.5.2(3)'}]:[]),...(engine.alarms||[]).map((label,i)=>({id:'engine-'+i,label,severity:'warning',ref:'Tabla 5.6.5.2'}))];}
 function updateAck(state,list){const active=new Set(list.map(a=>a.id));state.acknowledged=state.acknowledged.filter(id=>active.has(id));return list.filter(a=>!state.acknowledged.includes(a.id));}
 function press(state){if(!state.guard)return false;state.pressed=true;state.latched=true;return true;}
 function rearm(state){if(state.pressed||conditions.some(c=>c.critical&&!state.checks[c.id]))return false;state.latched=false;return true;}
 function monthlyEvidence({fuel,seconds,loadPct,operatingTemp,manufacturerExhaustTemp}){if(seconds<1800)return{accepted:false,reason:'Demostración inferior a 30 minutos; no equivale al ejercicio mensual.'};if(fuel==='diesel'&&!(operatingTemp&&loadPct>=30)&&!manufacturerExhaustTemp)return{accepted:false,reason:'Faltan condiciones térmicas y carga, o criterio de escape del fabricante (8.4.2).'};return{accepted:false,reason:'Duración simulada registrada; la evaluación de campo y el registro formal siguen pendientes.'};}
 return{conditions,create,blockers,alarms,updateAck,press,rearm,monthlyEvidence,edition:'NFPA 110 · 2010 · traducción aportada',classification:'Nivel, tipo y clase por definir por proyecto y autoridad competente'};
})();
