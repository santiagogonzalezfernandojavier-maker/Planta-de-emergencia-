// D36: scenario-specific work orders. No manufacturer intervals or torque values are invented.
const WorkOrders36=(()=>{
 const orders=[
 {
  "title": "Recibir la orden de trabajo",
  "location": "Gabinete de control G-01",
  "finding": "Revisión preventiva programada. La red alimenta la instalación; G-01 está detenido y frío. No hay una emergencia activa.",
  "checks": [
   "Identifiqué el equipo G-01 y el alcance de la orden",
   "Revisé el estado detenido/frío indicado en la orden",
   "Coordiné la indisponibilidad temporal con operación"
  ],
  "question": "¿Cómo inicias esta intervención?",
  "options": [
   "Avisar a operación y registrar la orden antes de intervenir",
   "Arrancar el motor y empezar con la inspección mecánica"
  ],
  "answer": 0,
  "criterion": "Orden registrada y alcance acordado; todavía no autoriza tocar partes energizadas."
 },
 {
  "title": "Impedir el arranque automático",
  "location": "Selector del gabinete de control",
  "finding": "G-01 puede recibir una orden automática de arranque. El selector aún no está fuera de servicio.",
  "checks": [
   "Revisé el punto de control indicado por la orden"
  ],
  "question": "¿Qué secuencia corresponde a este punto de bloqueo?",
  "options": [
   "Poner fuera de servicio, después colocar candado y etiqueta personales",
   "Colocar una etiqueta dejando el selector en automático"
  ],
  "answer": 0,
  "criterion": "Selector fuera de servicio y bloqueo personal visible. Este punto no aísla todas las fuentes de energía."
 },
 {
  "title": "Separar el circuito de arranque",
  "location": "Seccionador junto a la batería",
  "finding": "El control está bloqueado. La batería conserva energía; el seccionador representado solo separa el circuito de arranque.",
  "checks": [
   "Identifiqué el seccionador del circuito de arranque"
  ],
  "question": "¿Qué sigue energizado al abrir este seccionador?",
  "options": [
   "Nada: todos los bornes quedan sin tensión",
   "La batería y sus bornes; no se autoriza desmontar conexiones"
  ],
  "answer": 1,
  "criterion": "Seccionador abierto y energía almacenada reconocida. El resto de las fuentes requiere su procedimiento específico."
 },
 {
  "title": "Inspeccionar el nivel de aceite",
  "location": "Argolla amarilla en el costado del motor",
  "finding": "Motor frío y detenido. La varilla muestra un nivel estable entre MIN y MAX después de limpiarla y reinsertarla.",
  "checks": [
   "El motor está detenido y el aceite asentado",
   "Tengo un paño limpio y sin pelusa"
  ],
  "question": "¿Qué harás si el nivel queda entre las marcas?",
  "options": [
   "Agregar aceite de todas formas",
   "Registrar el nivel sin rellenar innecesariamente"
  ],
  "answer": 1,
  "criterion": "Segunda extracción leída, nivel registrado y varilla reinstalada."
 },
 {
  "title": "Inspeccionar y limpiar la entrada de aire",
  "location": "Cara del radiador, extremo izquierdo del grupo",
  "finding": "Hay polvo seco superficial en la cara de entrada del radiador. No se representan fugas ni aletas dobladas.",
  "checks": [
   "Equipo detenido, frío y sin ventilador en movimiento",
   "Acceso al radiador habilitado en este escenario"
  ],
  "question": "¿Qué intervención corresponde al hallazgo?",
  "options": [
   "Usar agua a presión cerca de las conexiones",
   "Inspeccionar y retirar el polvo con cepillo suave, sin doblar las aletas"
  ],
  "answer": 1,
  "criterion": "Ocho sectores inspeccionados y después limpiados; no se usa presión ni se modela apertura de un circuito caliente."
 },
 {
  "title": "Cambiar el elemento de admisión",
  "location": "Carcasa cilíndrica sobre el motor",
  "finding": "La orden de este escenario prescribe sustituir el elemento por saturación registrada. El repuesto asignado corresponde al alojamiento del equipo.",
  "checks": [
   "Comparé la referencia del repuesto con la orden",
   "Comprobé que el elemento y su sello están íntegros"
  ],
  "question": "¿Cómo cierras el trabajo después de instalarlo?",
  "options": [
   "Colocar la tapa, cerrar ambos sujetadores y verificar el asiento",
   "Dejar la tapa abierta para mejorar la entrada de aire"
  ],
  "answer": 0,
  "criterion": "Elemento asentado, tapa restituida y ambos sujetadores cerrados; el simulador no verifica un par de apriete real."
 },
 {
  "title": "Diagnosticar el estado de los bornes",
  "location": "Batería de arranque, costado del bastidor",
  "finding": "Se observan depósitos blancos en ambos bornes. La batería sigue cargada aunque el arranque esté seccionado.",
  "checks": [
   "Reconocí que los bornes siguen energizados",
   "La orden actual permite inspección visual, sin desmontar conexiones"
  ],
  "question": "¿Qué alcance eliges para este hallazgo?",
  "options": [
   "Cepillar los bornes energizados inmediatamente",
   "Inspeccionar con linterna y generar una correctiva para tratamiento específico"
  ],
  "answer": 1,
  "criterion": "Ambos bornes inspeccionados y correctiva registrada. La corrosión queda visible: no se declara reparada."
 },
 {
  "title": "Registrar tensión de batería en reposo",
  "location": "Bornes positivo (+) y negativo (−)",
  "finding": "Batería de plomo-ácido de 12 V en reposo en este escenario. Se autoriza únicamente la medición didáctica de tensión; no una prueba de capacidad.",
  "checks": [
   "Inspeccioné el instrumento y las puntas",
   "Seleccioné V DC; negro en COM y rojo en V, nunca en A"
  ],
  "question": "¿Cómo interpretarás una lectura de 12.6 V en este caso?",
  "options": [
   "Carga aproximada alta; falta una prueba específica para evaluar capacidad de arranque",
   "Garantía de batería sana bajo cualquier carga"
  ],
  "answer": 0,
  "criterion": "Puntas colocadas, tensión registrada y limitación de la medición anotada."
 },
 {
  "title": "Inspeccionar el enlace de protección",
  "location": "Conductor de protección al frente de la bancada",
  "finding": "Se representan conductor, unión a la bancada y terminal. Esta actividad es visual y no proporciona valores de continuidad.",
  "checks": [
   "Identifiqué conductor y terminales sin desmontarlos"
  ],
  "question": "¿Qué conclusión permite esta inspección?",
  "options": [
   "La instalación completa ya cumple una norma",
   "Solo el estado visual observado; la continuidad se verifica mediante otra prueba"
  ],
  "answer": 1,
  "criterion": "Tres puntos examinados y alcance visual registrado, sin certificar continuidad ni resistencia de tierra."
 },
 {
  "title": "Cerrar el área de intervención",
  "location": "Piso frente al generador y bolsa de herramientas",
  "finding": "El inventario de cierre detectó dos objetos fuera de la bolsa: un paño y una llave de vaso.",
  "checks": [
   "Revisé que las tapas intervenidas estén restituidas",
   "Confirmé que nadie permanece dentro del área de partes móviles"
  ],
  "question": "¿Qué cuenta debe coincidir antes de restituir?",
  "options": [
   "Los dos objetos detectados deben regresar al inventario",
   "Basta con recoger la llave, el paño puede quedarse"
  ],
  "answer": 0,
  "criterion": "Paño y llave retirados físicamente del piso; área revisada."
 },
 {
  "title": "Entregar el equipo a operación",
  "location": "Seccionador de arranque y gabinete de control",
  "finding": "La intervención mecánica terminó, las herramientas están contadas y la correctiva de bornes quedó registrada para seguimiento. La orden didáctica permite una prueba supervisada, no certifica disponibilidad real.",
  "checks": [
   "Área despejada y personal informado",
   "Reconozco el bloqueo como personal y la correctiva pendiente",
   "Operación autorizó la restitución del escenario de entrenamiento"
  ],
  "question": "¿Qué secuencia usarás en esta representación?",
  "options": [
   "Cerrar el seccionador y después retirar mi bloqueo para entregar el control",
   "Retirar cualquier candado sin identificar a su responsable"
  ],
  "answer": 0,
  "criterion": "Seccionador restituido y bloqueo propio retirado; hallazgos pendientes entregados a operación."
 },
 {
  "title": "Observar la prueba funcional",
  "location": "Cuaderno de trabajo · prueba de transferencia",
  "finding": "Operación autorizó la prueba del escenario. La red fallará de forma simulada y el sistema deberá arrancar, estabilizarse y transferir la carga.",
  "checks": [
   "Avisé a operación y delimitamos la prueba",
   "La prueba es simulada; no voy a provocar una falla en una instalación real"
  ],
  "question": "¿Qué se debe observar antes de aceptar la transferencia?",
  "options": [
   "Solo que el motor haga ruido",
   "Arranque, tensión/frecuencia estables y transferencia sin disparos"
  ],
  "answer": 1,
  "criterion": "Resultado automático de la secuencia y hallazgos incluidos en la bitácora; sin inventar mediciones reales."
 }
];
 function validate(index,checks,choice){const order=orders[index];if(!order)return{ok:false,message:'Orden inexistente.'};if(!Array.isArray(checks)||order.checks.some((_,i)=>checks[i]!==true))return{ok:false,message:'Confirma las condiciones previas de esta orden.'};if(choice!==order.answer)return{ok:false,message:'La decisión no corresponde al hallazgo. Revisa el alcance y vuelve a elegir.'};return{ok:true,message:'Orden preparada. Continúa con la acción indicada en pantalla.'};}
 return{orders,validate};
})();
