# Estado de entrega para continuar en Codex

## Objetivo del usuario

Un simulador educativo 3D de generación de emergencia que se sienta como un videojuego de mantenimiento, con realismo industrial y referencias mexicanas. La instalación incluye planta en sótano, subestación a nivel de terreno y fábrica alimentada mediante conexión aérea, con CCM dentro de su sótano.

## Actualización D46

- La cámara de órbita cede el control durante el recorrido. El jugador actualiza su cámara antes de seleccionar y ejecutar una acción mantenida. Se corrige el fallo reproducido en `frame()` que no aparecía al probar únicamente `Walk31.frame()`.
- Los marcadores son botones que aceptan mantener clic en círculo o etiqueta. Se conserva la selección de un sector, visibilidad, alcance y herramienta.
- Varilla sostenida por la derecha, paño en la izquierda sobre el extremo, desaparición progresiva del aceite y reinserción explícita en el tubo. Pausar cancela la pasada pendiente.
- Nueva prueba `test:maintenance`, incluida en publicación, sobre el ciclo compuesto. Ver docs/MANTENIMIENTO_D46.md.

## Actualización D45

- Anatomía abre con cubierta; botón directo Retirar/Colocar en el visor, copia del gabinete de servicio y controles de despiece conservados.
- G01-CONTROL tiene `openable: false`: puerta fija, sin interceptar E/V. El selector y las prácticas permanecen montados en su frente.
- Linterna L/botón, haz dirigido a la superficie central, lente coherente y menor saturación. No se registran inspecciones con la linterna apagada.
- `70-guided-presentation.js` presenta nueve etapas, con navegación manual y reproducción, utilizando los ciclos existentes. Suspende las prácticas y recupera sesión/bitácoras al salir.
- Ver docs/PRESENTACION_D45.md. `test:player` añade cubierta, móvil, haz, giro del mouse y presentación; `test:browser` conserva las doce actividades y comprueba el tablero fijo tras reconstrucción.

## Actualización D44

- Nueve apartarrayos en llegada/TE/TP y cuatro mástiles de captación PC-01 a PC-04. PR-01 sigue identificando el gabinete de protección. Bajantes y uniones de prueba a la malla común; AP-TE/AP-TP también figuran en DU-01.
- Recorrido propio de tres actividades de subestación, doce observaciones, conclusiones, unión abierta de entrenamiento, termografía simulada, cámara en las manos y bitácora JSON. No sustituye reparaciones, mediciones ni estudios.
- Fuentes nuevas: 00-protection-layout, 38-substation-protection, 62-substation-orders, 65-substation-maintenance y 66-protection-inspector. Se conserva una animación principal; la interfaz se actualiza desde CCM34.frame.
- `npm run test:substation` comprueba el recorrido y el regreso a la práctica de planta. Ver docs/SUBESTACION_D44.md.

## Actualización D43.1

- El menú inicial espera una selección; desaparece el arranque forzado. Explorar, misiones eléctricas, anatomía y mantenimiento tienen entradas independientes.
- La escalera conserva 36 peldaños con el pie desplazado 0.95 m: descanso inferior de 2.10 m de ancho y al menos 1.50 m de profundidad. Hueco, barandales y superficies transitables comparten dimensiones.

## Actualización D43

- Brazos de primera persona con dos segmentos de longitud fija, límites de alcance y herramientas ancladas al agarre. Las acciones continuas mantienen la postura; no reinician el alcance en cada sector. La inspección Z oculta las manos para liberar la vista.
- Cambiar a una vista de inspección suspende el recorrido; «Volver a mi recorrido» restaura posición, orientación, agachado, herramienta y actividad. La llegada rápida a la subestación usa el pasillo peatonal junto al acceso SE-01.
- El guiado muestra paso, herramienta, pieza y resultado esperado. El resultado permanece cuatro segundos; E permite continuar. El radiador tiene acceso de servicio y selección de sectores sin completar accidentalmente el adyacente.
- Pruebas: `npm test`, `npm run test:player`, `npm run test:browser`, `npm run test:technical` y `npm run test:site` (esta última después de `npm run site:build`). Se conservan las limitaciones de geometría procedural y colisiones simplificadas.

## Base D34

- Recorrido a pie en planta, subestación y CCM; otras vistas de fábrica/general todavía usan cámara de inspección.
- WASD, giro por arrastre/teclas/botones, agacharse con C o botón, inspección Z.
- Bolsa física de herramientas en el piso. Las manos no son un objeto del inventario.
- Doce actividades de mantenimiento, secuenciadas, con guiado/evaluación, resultados y bitácora. Prueba final enlazada al arranque y transferencia del simulador.
- Cuatro operarios procedentes de Blender, con fuentes artísticas incluidas. No son personajes de primera persona riggeados; no hay un sistema anatómico animado de manos del jugador.
- CCM de doce secciones: principal, siete secciones con tres unidades cada una y cuatro reservas. 26 puertas con pivotes; contactores, relevadores, canaletas, borneras, PE, rieles y un variador ilustrativo. Principal con barras protegidas.
- Base original: tres apartarrayos, cuatro mástiles de captación con hilo de guarda y bajantes a la malla. Las funciones están representadas visualmente; no hay estudio de cobertura o coordinación de aislamiento.
- Navegación de seis destinos y retorno a la posición de mantenimiento. Optimización de geometría estática, marcadores y luces. Modo Fluido/Detalle.

## Preferencias que se deben preservar

La planta es el tema principal. El usuario pide anatomía, acabados y proporciones realistas; canalizaciones completas, ordenadas y conectadas; terreno, paisaje y modelos unidos; escenarios nocturno/diurno; fábrica y CCM funcionales; texto discreto que no tape la escena. No eliminar paisaje o características existentes al rediseñar la interfaz.

## Aspectos que requieren más trabajo o comprobación

- El usuario ha reportado repetidamente problemas para girar/agacharse. Aunque las pruebas de navegador pasan, hay que comprobar el flujo real con su navegador, foco del teclado, capturas del ratón y escala de pantalla. No considerar el problema aceptado por el usuario solo porque una prueba automática pase.
- La cámara de fábrica/general es distinta del recorrido de tres zonas; unificar la experiencia sería una mejora posterior.
- D37 conecta físicamente la planta y la subestación por la escalera de 36 peldaños. Las colisiones y alturas siguen siendo simplificadas, sin física completa del cuerpo. La escalera interior del CCM aún no forma parte del recorrido continuo.
- El detalle visual todavía es procedural. No existe una escena fotogramétrica o un .blend completo de la instalación. Evitar prometer fotorealismo o validación de ingeniería.
- Las puertas del CCM representan inspección didáctica sin tensión. El texto de interfaz no equivale a una medición simulada completa de ausencia de tensión o a un procedimiento de bloqueo verificado.
- La arquitectura conserva envoltorios sucesivos sobre funciones globales. Debe refactorizarse por responsabilidades y con regresiones, sin sustituir todo el modelo por un prototipo básico.
- El script artístico histórico no convierte automáticamente su JSON al formato comprimido/deduplicado que usa el visor. Esa conversión debe implementarse si se reexportan personajes.
- El usuario quiere controles cómodos y habituales de videojuegos. La siguiente tarea puede consolidar el gestor de entrada, documentar asignaciones y resolver conflictos de eventos/foco antes de añadir más teclas.

## Lo realizado para esta migración

Se mantuvo D34 como referencia intacta; se separaron HTML/CSS, motor Three vendorizado, datos de personajes y cinco áreas de código. El runtime vuelve a concatenarse en un único script clásico para conservar su alcance léxico y el orden. No se implementó una nueva versión de funcionalidad durante el traslado.

Las verificaciones D34 incluidas en tests/baseline_* son resultados históricos previos. Las pruebas ejecutables de assets y navegador verifican la entrega de migración. No confundir los dos tipos de evidencia.

## Referencias de código

Busca por nombre de función con rg: frame, build, createSubstation, SurfaceRealism, PlantPresentation, Maintenance, Walk31, CCM34, Protection33, Performance33, suspend33 y resume33. Los sufijos históricos permanecen para reducir riesgo de cambios durante la migración.
