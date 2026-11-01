# Estado de entrega para continuar en Codex

## Objetivo del usuario

Un simulador educativo 3D de generación de emergencia que se sienta como un videojuego de mantenimiento, con realismo industrial y referencias mexicanas. La instalación incluye planta en sótano, subestación a nivel de terreno y fábrica alimentada mediante conexión aérea, con CCM dentro de su sótano.

## Base D34

- Recorrido a pie en planta, subestación y CCM; otras vistas de fábrica/general todavía usan cámara de inspección.
- WASD, giro por arrastre/teclas/botones, agacharse con C o botón, inspección Z.
- Bolsa física de herramientas en el piso. Las manos no son un objeto del inventario.
- Doce actividades de mantenimiento, secuenciadas, con guiado/evaluación, resultados y bitácora. Prueba final enlazada al arranque y transferencia del simulador.
- Cuatro operarios procedentes de Blender, con fuentes artísticas incluidas. No son personajes de primera persona riggeados; no hay un sistema anatómico animado de manos del jugador.
- CCM de doce secciones: principal, siete secciones con tres unidades cada una y cuatro reservas. 26 puertas con pivotes; contactores, relevadores, canaletas, borneras, PE, rieles y un variador ilustrativo. Principal con barras protegidas.
- Tres apartarrayos, cuatro mástiles de captación con hilo de guarda y bajantes a la malla. Las funciones están representadas visualmente; no hay estudio de cobertura o coordinación de aislamiento.
- Navegación de seis destinos y retorno a la posición de mantenimiento. Optimización de geometría estática, marcadores y luces. Modo Fluido/Detalle.

## Preferencias que se deben preservar

La planta es el tema principal. El usuario pide anatomía, acabados y proporciones realistas; canalizaciones completas, ordenadas y conectadas; terreno, paisaje y modelos unidos; escenarios nocturno/diurno; fábrica y CCM funcionales; texto discreto que no tape la escena. No eliminar paisaje o características existentes al rediseñar la interfaz.

## Aspectos que requieren más trabajo o comprobación

- El usuario ha reportado repetidamente problemas para girar/agacharse. Aunque las pruebas de navegador pasan, hay que comprobar el flujo real con su navegador, foco del teclado, capturas del ratón y escala de pantalla. No considerar el problema aceptado por el usuario solo porque una prueba automática pase.
- La cámara de fábrica/general es distinta del recorrido de tres zonas; unificar la experiencia sería una mejora posterior.
- Las colisiones son volúmenes simplificados y límites por zona; no hay física completa del cuerpo ni recorrido continuo por todas las escaleras.
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

## Cambio posterior a D34: el menú de inicio se respeta

Antes, al terminar de cargar los operarios, el arranque (`src/40-protections_ccm_performance.js`, bloque final) pulsaba por su cuenta «Explorar instalación» y empezaba el recorrido guiado, así que el menú se cerraba solo. Ahora el menú permanece abierto hasta que el usuario elige.

- «Explorar instalación» y las misiones cierran el menú y después inician el recorrido (mismo orden que el arranque anterior; la misión sigue activa).
- «Anatomía» abre la presentación sin iniciar el recorrido; este empieza la siguiente vez que se salga del menú.
- Comprobado en Chrome (carga, 6 s de espera, Explorar, misión y anatomía), sin errores de JavaScript, y `node --test tests/assets.test.mjs` en verde.
- Pendiente: las pruebas históricas de `tests/browser.cjs` esperaban el arranque automático y no se han actualizado.
- `npm run verify:package` compara contra la línea base D34 y por eso informa 4 diferencias: `.gitignore`, `dist/ABRIR_SIMULADOR.html`, este documento y `src/40-protections_ccm_performance.js`. Son los cambios de esta modificación, no una corrupción.

## Cambio posterior: controles que no dependen de los cuadros por segundo

Causa medida de «los controles no responden» en equipos lentos: caminar y girar con teclado usaban un tiempo por fotograma recortado a 0.08 s, así que por debajo de ~12 fps el movimiento perdía velocidad (a 5 fps el giro llegaba al 40 %, a 2 fps al 16 %). Cambios en `src/30-maintenance_walk.js`:

- Movimiento y giro con teclas usan el tiempo real transcurrido (tope 0.5 s por fotograma; una pausa de más de 2 s se descarta) y se integran en subpasos de ≤ 0.04 s para que las colisiones sigan funcionando.
- Un control con foco (lista, deslizador, casilla) ya no bloquea el teclado del recorrido; solo se respetan los campos de texto (`window.walkInput`). Clic en la escena devuelve el foco al lienzo. En modo recorrido no se encontró ningún control enfocable, así que esto es una protección y no la causa principal.
- Comprobado en Chrome con fotogramas simulados: a 5 fps el giro pasó de 0.64 a 1.65 rad/s (teórico 1.6); a 2 fps caminando en 8 direcciones hubo 0 posiciones inválidas.
- No comprobado: el comportamiento en una GPU real, el bloqueo del puntero (tecla F / «Mirar con ratón») y pantallas táctiles.
