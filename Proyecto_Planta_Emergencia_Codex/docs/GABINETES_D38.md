# Gabinetes D38

## Acceso en el recorrido

El llavero está junto a la bolsa de herramientas de la planta. L abre el inventario y pausa el recorrido. Selecciona cada juego a una distancia máxima de 2.4 unidades de la posición del llavero; el mensaje del propio panel explica si debes acercarte. Volver al recorrido intenta recuperar el mouse. La cerradura requiere el juego adecuado y proximidad de 2.8 unidades al gabinete.

| Juego | Puertas |
|---|---|
| G-01 | Gabinete de control, transferencia y seis paneles de envolvente del generador |
| SE-01 | Mandos QN/QG/QS, protección PR-01, DC-01 y salida a fábrica QF-01 |
| CCM-01 | Principal, 21 unidades funcionales y cuatro reservas del CCM |

E abre/cierra la puerta apuntada. V retira o repone la cubierta interior del gabinete apuntado. Hay que abrir la puerta antes de retirar la cubierta y reponerla antes de cerrar. Las puertas abiertas y los cuerpos de estos gabinetes añaden obstáculos al recorrido. Los mandos externos siguen pudiendo utilizarse en las prácticas sin abrir innecesariamente la puerta. La orden de mantenimiento tiene prioridad al apuntar a su punto de actuación con la herramienta correcta.

La envolvente acústica G-01 comienza retirada para preservar las prácticas existentes. Su botón permite montarla o retirarla con la llave, sin estar dentro del volumen que va a cerrar. Sus seis hojas tienen bisagras y cerraduras; el techo incluye un paso para el escape. La presentación informativa del generador conserva su control independiente de mostrar envolvente.

## Interiores y acabados

Los gabinetes tienen respaldo y placa de montaje, sellos, herrajes, conexión de puerta y cubiertas separadas de los equipos. Los mandos de interruptor, control de transferencia, protección, cargador DC y alimentador BT muestran elementos distintos según su función. Las conexiones exteriores, etiquetas de estado y flujo de energía se conservan.

El CCM conserva 12 secciones y 26 puertas. Sus 21 unidades funcionales se distribuyen entre directo, reversible, estrella-triángulo, arrancador suave, variador, alimentador y servicios de control. El número y disposición de contactores, interbloqueos, dispositivos y frentes cambian con el tipo. Las cuatro reservas permanecen sin equipo de maniobra. No se inventan intensidades nominales, pares de apriete ni referencias comerciales. Las barreras interiores son desmontables y el principal conserva además su pantalla de barras.

La pintura y los metales usan mapas compartidos de acabado a escala; se conservan las texturas de color de los operarios y se añade relieve fino de tejido. Se trata de geometría y texturas procedurales, sin prometer fotorealismo ni animación de cuerpo completo.

## Alcance y pruebas

Una llave solo abre una cerradura: no demuestra ausencia de tensión ni habilita una intervención real. No se representa un procedimiento completo de aislamiento, verificación o puesta a tierra. Las inspecciones del juego no validan el cableado ni la conformidad normativa de una instalación.

`npm test` comprueba inventario/proximidad además de los activos, las órdenes y la escalera. La regresión de Chromium recorre las doce actividades, la escalera, las puertas y cubiertas del controlador, transferencia, CCM y seis gabinetes exteriores, y la conservación de llaves/mandos tras reconstruir el generador. Incluye el rechazo de cerrar una puerta con cubierta retirada y la invisibilidad de los volúmenes de interacción.
