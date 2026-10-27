// D36: scenario-specific work orders. No manufacturer intervals or torque values are invented.
const WorkOrders36=(()=>{
 const orders=[
 {
  "title": "Comenzar el trabajo en G-01",
  "location": "Gabinete de control G-01",
  "finding": "G-01 es el generador. En este ejercicio está detenido y frío, y la red alimenta la instalación. Vas a dejar anotado el inicio del trabajo.",
  "checks": [
   "Leí que G-01 está detenido y frío en este ejercicio",
   "Entiendo que se avisa a operación antes de trabajar"
  ],
  "question": "¿Cómo empezarás este trabajo?",
  "options": [
   "Anotar el inicio con la carpeta antes de tocar el equipo",
   "Comenzar con el motor en marcha"
  ],
  "answer": 0,
  "criterion": "Termina al pulsar E en la pantalla con la carpeta. El juego guarda el inicio automáticamente.",
  "steps": [
   {
    "tool": "Carpeta",
    "action": "Apunta a la pantalla del gabinete G-01 y pulsa E.",
    "result": "El juego guarda que comenzaste el trabajo."
   }
  ],
  "completed": "Se guardó el inicio del trabajo en G-01."
 },
 {
  "title": "Poner el control en FUERA y colocar tu candado",
  "location": "Selector del gabinete de control",
  "finding": "El selector es el mando pequeño debajo de la pantalla. Primero lo pondrás en FUERA y después colocarás tu candado para impedir que se cambie por error.",
  "checks": [
   "Identifiqué el selector pequeño debajo de la pantalla"
  ],
  "question": "¿Qué harás primero en el selector?",
  "options": [
   "Primero ponerlo en FUERA y después colocar mi candado",
   "Dejarlo en AUTO y poner solo una etiqueta"
  ],
  "answer": 0,
  "criterion": "Termina cuando el selector esté en FUERA y aparezca tu candado con su etiqueta.",
  "steps": [
   {
    "tool": "Manos libres · H",
    "action": "Apunta al selector pequeño debajo de la pantalla y pulsa E.",
    "result": "El selector gira a FUERA."
   },
   {
    "tool": "Candado",
    "action": "En el mismo selector, pulsa E con el candado en la mano.",
    "result": "Aparecen el candado y la etiqueta."
   }
  ],
  "completed": "Pusiste el selector en FUERA y colocaste tu candado con etiqueta."
 },
 {
  "title": "Abrir el interruptor de arranque",
  "location": "Seccionador junto a la batería",
  "finding": "Este interruptor está al lado de la batería. Abrirlo corta el paso hacia el motor de arranque; no descarga la batería.",
  "checks": [
   "Entiendo que abrir este interruptor no descarga la batería"
  ],
  "question": "¿Qué pasa después de abrir el interruptor de arranque?",
  "options": [
   "La batería se descarga por completo",
   "La batería y sus terminales siguen teniendo energía"
  ],
  "answer": 1,
  "criterion": "Termina cuando abras el interruptor. Los terminales de la batería siguen con tensión.",
  "steps": [
   {
    "tool": "Manos libres · H",
    "action": "Apunta al interruptor pequeño que está junto a la batería y pulsa E.",
    "result": "El interruptor queda abierto. La batería sigue teniendo energía."
   }
  ],
  "completed": "Abriste el interruptor del arranque. La batería sigue teniendo energía."
 },
 {
  "title": "Revisar el nivel de aceite",
  "location": "Argolla amarilla en el costado del motor",
  "finding": "La varilla tiene una argolla amarilla. Para leerla debes sacarla, limpiarla, meterla completamente y sacarla otra vez.",
  "checks": [
   "Leí que el motor está detenido y el aceite ya se asentó",
   "Voy a usar un paño limpio"
  ],
  "question": "¿Qué harás si el aceite queda entre MIN y MAX?",
  "options": [
   "Agregar aceite aunque el nivel ya esté entre las marcas",
   "Guardar la lectura sin agregar aceite innecesariamente"
  ],
  "answer": 1,
  "criterion": "Termina al registrar la lectura después de la segunda extracción. La varilla vuelve a su tubo.",
  "steps": [
   {
    "tool": "Manos libres · H",
    "action": "Apunta a la argolla amarilla del motor y pulsa E para sacar la varilla.",
    "result": "La mano derecha sostiene la varilla fuera del tubo."
   },
   {
    "tool": "Paño",
    "action": "Con la varilla en la mano, pulsa E para pasar el paño por el extremo de lectura. La mano izquierda limpia esa zona.",
    "result": "El paño retira el aceite del extremo inferior; la varilla sigue sostenida, fuera del motor."
   },
   {
    "tool": "Manos libres · H",
    "action": "Apunta al tubo de la varilla en el motor y pulsa E para reinsertarla hasta el fondo.",
    "result": "La varilla vuelve a su tubo."
   },
   {
    "tool": "Manos libres · H",
    "action": "Pulsa E otra vez para sacarla y leerla.",
    "result": "Ya puedes comparar el nivel con las marcas."
   },
   {
    "tool": "Cuaderno · Q",
    "action": "Compara con MIN y MAX y registra la lectura: E en modo guiado, o Registrar nivel leído en Q en evaluación.",
    "result": "El juego guarda la lectura y vuelve a colocar la varilla."
   }
  ],
  "completed": null
 },
 {
  "title": "Revisar y limpiar las manchas del radiador",
  "location": "Cara del radiador, extremo izquierdo del grupo",
  "finding": "Las manchas marrones representan polvo seco en la cara del radiador. Primero las revisarás con la linterna y después las quitarás con el cepillo.",
  "checks": [
   "El ventilador está detenido en este ejercicio",
   "Voy a revisar antes de limpiar"
  ],
  "question": "¿Cómo quitarás el polvo del radiador?",
  "options": [
   "Mojarlo con agua a presión",
   "Revisar con linterna y quitar el polvo con un cepillo suave"
  ],
  "answer": 1,
  "criterion": "Termina cuando el contador marque ocho zonas revisadas y ocho limpiadas.",
  "steps": [
   {
    "tool": "Linterna",
    "action": "Apunta a cada una de las ocho manchas del radiador y pulsa E.",
    "result": "El contador debe llegar a 8/8 revisadas."
   },
   {
    "tool": "Cepillo",
    "action": "Pulsa E sobre cada mancha que siga marcada.",
    "result": "Las manchas desaparecen. Terminas al limpiar las ocho."
   }
  ],
  "completed": "Revisaste las ocho zonas del radiador y retiraste el polvo con el cepillo."
 },
 {
  "title": "Cambiar el filtro de aire",
  "location": "Tapa redonda arriba del motor: sujetador superior e inferior",
  "finding": "La orden de este ejercicio pide cambiar el filtro de aire por uno nuevo. Está dentro de la carcasa redonda de la parte alta del motor.",
  "checks": [
   "El repuesto de este ejercicio corresponde al filtro",
   "Usaré la escalera de plataforma, apoyada en piso firme; no subiré al motor",
   "Revisaré que la tapa quede colocada al terminar"
  ],
  "question": "¿Qué falta después de poner el filtro nuevo?",
  "options": [
   "Volver a colocar la tapa y cerrar los dos sujetadores",
   "Dejar la tapa abierta"
  ],
  "answer": 0,
  "criterion": "Termina con filtro nuevo, tapa colocada, ambos sujetadores al 100% y la escalera retirada después de bajar al piso.",
  "steps": [
   {
    "tool": "Llave de vaso",
    "action": "Pulsa E en la escalera amarilla para colocarla. Entra por el peldaño inferior y sube con W. Desde la plataforma, mantén E en ambos sujetadores hasta 100%.",
    "result": "Los dos sujetadores quedan sueltos."
   },
   {
    "tool": "Manos libres · H",
    "action": "Apunta a la tapa redonda y pulsa E para retirarla.",
    "result": "La tapa se separa del filtro."
   },
   {
    "tool": "Filtro nuevo",
    "action": "Apunta al filtro abierto y pulsa E con el repuesto.",
    "result": "El filtro nuevo queda colocado."
   },
   {
    "tool": "Manos libres · H",
    "action": "Pulsa E en la tapa para volver a colocarla.",
    "result": "La tapa vuelve a su sitio; todavía faltan los sujetadores."
   },
   {
    "tool": "Llave de vaso",
    "action": "Mantén E en cada sujetador hasta que ambos lleguen a 100%.",
    "result": "La tapa queda cerrada. Falta bajar y retirar la escalera; no se comprueba una fuerza de apriete real."
   },
   {
    "tool": "Manos libres · H",
    "action": "Desciende por los peldaños mirando hacia ellos. En el piso, apunta a la escalera y pulsa E para retirarla.",
    "result": "La escalera vuelve a su lugar y el paso queda despejado."
   }
  ],
  "completed": "Filtro nuevo, tapa y sujetadores cerrados. Bajaste y retiraste la escalera; paso despejado. No se midió un par de apriete real."
 },
 {
  "title": "Revisar los dos terminales de la batería",
  "location": "Batería de arranque, costado del bastidor",
  "finding": "Los terminales, también llamados bornes, son los dos puntos de la batería donde se conectan los cables. Están marcados + y − y tienen depósitos blancos. Solo vas a observarlos, no a limpiarlos.",
  "checks": [
   "Solo voy a mirar los terminales con la linterna",
   "Entiendo que no debo cepillarlos ni desconectarlos aquí"
  ],
  "question": "¿Qué harás con los depósitos blancos de la batería?",
  "options": [
   "Cepillarlos ahora aunque la batería conserve energía",
   "Inspeccionar con la linterna; el juego guarda que la limpieza queda pendiente"
  ],
  "answer": 1,
  "criterion": "Termina al revisar los dos terminales con la linterna. El juego guarda la nota automáticamente; la corrosión queda visible porque no la limpiaste.",
  "steps": [
   {
    "tool": "Linterna",
    "action": "Apunta al terminal + de la batería y pulsa E. Después haz lo mismo con el terminal −.",
    "result": "Al llegar a 2/2 el juego guarda una nota: hay suciedad blanca y la limpieza queda pendiente. Se guarda sola; no tienes que buscar otro menú."
   }
  ],
  "completed": "Revisaste los dos terminales. Se guardó una nota: depósitos blancos; limpieza pendiente. No realizaste limpieza en este ejercicio."
 },
 {
  "title": "Leer el voltaje de la batería",
  "location": "Bornes positivo (+) y negativo (−)",
  "finding": "El multímetro es el instrumento para leer el voltaje. La pantalla mostrará 12.6 V (voltios) en este ejercicio. La batería es de 12 V.",
  "checks": [
   "Usaré la función V DC: voltaje de corriente continua",
   "La punta negra va en COM y la roja en V, nunca en A"
  ],
  "question": "¿Qué te dice esta lectura de 12.6 V?",
  "options": [
   "Que el voltaje está registrado; todavía no se probó si la batería puede arrancar el motor",
   "Que la batería funcionará siempre, sin hacer ninguna otra prueba"
  ],
  "answer": 0,
  "criterion": "Termina al pulsar Registrar lectura en Q. Limitación: el voltaje en reposo no prueba la capacidad de arranque.",
  "steps": [
   {
    "tool": "Multímetro",
    "action": "Apunta al terminal + y pulsa E: apoyas tu multímetro y conectas la punta roja. Pulsa E en − para conectar la negra.",
    "result": "Aparece una lectura de 12.6 V en este ejercicio."
   },
   {
    "tool": "Cuaderno · Q",
    "action": "Lee los 12.6 V. E guarda la lectura en guiado; en evaluación abre Q y pulsa Registrar lectura. Retiras las puntas y recuperas el mismo instrumento.",
    "result": "Se guardan los 12.6 voltios. Esta lectura no demuestra que la batería pueda arrancar el motor."
   }
  ],
  "completed": "Se guardó la lectura de 12.6 voltios del ejercicio. Todavía no se comprobó si la batería puede arrancar el motor."
 },
 {
  "title": "Reconocer la conexión de protección a tierra",
  "location": "Frente del generador: placa PE, cable verde/amarillo y barra de cobre",
  "finding": "PE significa conductor de protección. Une el chasis metálico a la barra de tierra y participa en la trayectoria de una falla para que actúen las protecciones. Primero observarás la terminal al chasis; después, el aislamiento verde/amarillo; al final, la terminal en la barra PE.",
  "checks": [
   "Solo voy a revisar el aspecto visible del cable y sus uniones"
  ],
  "question": "¿Qué puedes comprobar mirando el cable con la linterna?",
  "options": [
   "Que toda la instalación ya cumple una norma",
   "Solo si hay daño visible; comprobar el paso eléctrico requiere otra medición"
  ],
  "answer": 1,
  "criterion": "Termina al revisar los tres puntos con la linterna. El juego anota la revisión visual automáticamente.",
  "steps": [
   {
    "tool": "Linterna",
    "action": "Ilumina la placa PE al frente del bastidor. Mantén E sobre el tornillo y la terminal: busca corrosión o separación visible. C permite agacharte.",
    "result": "Se guarda la observación del enlace al chasis y se resalta el cable."
   },
   {
    "tool": "Linterna",
    "action": "Sigue el tramo verde/amarillo. Mantén E sobre él y busca cortes o cobre expuesto fuera de las terminales.",
    "result": "Se guarda el estado visual del aislamiento y se resalta la barra PE."
   },
   {
    "tool": "Linterna",
    "action": "Ilumina la terminal en la barra de cobre PE y mantén E. Busca corrosión o piezas separadas.",
    "result": "Se guardan las tres observaciones. La linterna no verifica firmeza, continuidad ni resistencia."
   }
  ],
  "completed": "Revisaste los tres puntos del cable de protección. Se guardó la revisión visual; no hiciste una medición eléctrica."
 },
 {
  "title": "Recoger el paño y la llave de vaso",
  "location": "Piso frente al generador y bolsa de herramientas",
  "finding": "Hay un paño y una llave de vaso en el piso, frente al generador. Debes recoger los dos antes de volver a conectar el arranque.",
  "checks": [
   "Voy a recoger los dos objetos, no solo uno"
  ],
  "question": "¿Qué objetos recogerás antes de continuar?",
  "options": [
   "El paño y la llave de vaso",
   "Solo la llave de vaso"
  ],
  "answer": 0,
  "criterion": "Termina cuando ya no veas el paño ni la llave en el piso.",
  "steps": [
   {
    "tool": "Manos libres · H",
    "action": "Apunta al paño que está en el piso y pulsa E. Después haz lo mismo con la llave de vaso.",
    "result": "Los dos objetos desaparecen del piso porque se guardaron."
   }
  ],
  "completed": "Recogiste el paño y la llave de vaso. Ya no están en el piso."
 },
 {
  "title": "Reconectar el arranque y retirar tu candado",
  "location": "Seccionador de arranque y gabinete de control",
  "finding": "La revisión terminó y recogiste las herramientas. Primero cerrarás el interruptor junto a la batería y después retirarás tu propio candado del gabinete. La limpieza pendiente de la batería seguirá anotada; esta prueba virtual no declara reparado un equipo real.",
  "checks": [
   "El área del ejercicio está libre de herramientas",
   "Solo voy a retirar mi propio candado",
   "La suciedad blanca de la batería seguirá anotada como pendiente"
  ],
  "question": "¿Cómo terminarás la revisión?",
  "options": [
   "Cerrar el interruptor de arranque y después retirar mi propio candado",
   "Retirar un candado sin saber de quién es"
  ],
  "answer": 0,
  "criterion": "Termina cuando el interruptor esté cerrado y hayas retirado tu candado del control.",
  "steps": [
   {
    "tool": "Manos libres · H",
    "action": "Ve al interruptor junto a la batería y pulsa E para cerrarlo.",
    "result": "El circuito de arranque vuelve a quedar conectado en el ejercicio."
   },
   {
    "tool": "Candado",
    "action": "Vuelve al selector del gabinete G-01 y pulsa E con el candado.",
    "result": "Se retiran tu candado y tu etiqueta. Se conserva la nota de limpieza pendiente de la batería."
   }
  ],
  "completed": "Cerraste el interruptor de arranque y retiraste tu candado. La nota de limpieza pendiente de la batería sigue guardada."
 },
 {
  "title": "Probar el arranque y el cambio de alimentación",
  "location": "Cuaderno de trabajo · prueba de transferencia",
  "finding": "La transferencia es el cambio de alimentación de la red al generador. Aquí se prueba de forma simulada; no cortas la energía de un lugar real.",
  "checks": [
   "Esta es una prueba virtual autorizada en el ejercicio",
   "Voy a esperar a que termine antes de leer el resultado"
  ],
  "question": "¿Qué esperarás durante la prueba virtual?",
  "options": [
   "Solo que el motor haga ruido",
   "Que el motor arranque, el generador quede listo y cambie la alimentación"
  ],
  "answer": 1,
  "criterion": "Termina cuando el juego muestre y guarde el resultado de la prueba.",
  "steps": [
   {
    "tool": "Cuaderno · Q",
    "action": "Abre Q y pulsa Iniciar prueba simulada. Espera a que termine la secuencia.",
    "result": "El juego hace fallar la red, arranca el generador y cambia la alimentación. El resultado se guarda automáticamente."
   }
  ],
  "completed": "La prueba terminó: el motor arrancó, el generador quedó listo y pasó a alimentar la instalación. El resultado se guardó."
 }
];
 function validate(index,checks,choice){const order=orders[index];if(!order)return{ok:false,message:'Orden inexistente.'};if(!Array.isArray(checks)||order.checks.some((_,i)=>checks[i]!==true))return{ok:false,message:'Confirma que leíste los datos: marca las casillas de esta actividad.'};if(choice!==order.answer)return{ok:false,message:'Esa opción no corresponde a lo descrito arriba. Lee la pregunta y vuelve a elegir.'};return{ok:true,message:'Actividad lista. Pulsa Volver al equipo y haz el paso indicado.'};}
 return{orders,validate};
})();
