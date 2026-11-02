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

## Cambio posterior: menú de inicio blindado (v3)

Una persona reportó que, aun con el arreglo anterior, el simulador la llevaba directo al recorrido sin mostrar el menú. No se reprodujo con una prueba normal, pero se identificaron y cerraron las vías por las que el menú podía saltarse:

- `showModal()` dejaba el foco en «Explorar instalación», así que un Enter, espacio o clic accidental al abrir lo activaba. Ahora el foco queda en el propio diálogo.
- Esc cerraba el menú y, con el arreglo anterior, entraba al recorrido. Ahora Esc no cierra el menú antes de elegir; si el navegador lo cerrara (Chrome no deja cancelar el segundo Esc seguido), se reabre solo.
- «Continuar» cuenta como elección y arranca el recorrido igual que «Explorar».
- Si el menú se cierra antes de elegir y luego se elige «Explorar», se prepara la cámara de emergencia antes de iniciar el recorrido.
- Etiqueta visible «v3 · el menú espera tu elección» al pie del menú, para confirmar qué archivo se está abriendo.
- Error latente corregido en `src/00-core_scene.js`: el tiempo por fotograma podía salir negativo tras reabrir el menú (reloj adelantado unos ms) y, con el reloj de la simulación en cero, rompía el trazado de los flujos (`getPointAt(null)`). Ahora `dt >= 0`.
- Comprobado en Chrome: Enter, espacio, E, W y Esc×2 no sacan del menú; Explorar, misión y anatomía funcionan sin errores de JavaScript; el giro sigue a velocidad real con 5 fps.

## Cambio posterior: calidad automática y fluidez (v4)

Objetivo: que el simulador sea fluido en una laptop con gráficos integrados conectada a un proyector (equipo de presentación indicado por la persona usuaria).

Medición (Chrome sin GPU, solo para dimensionar; no son cuadros por segundo reales): recorrido por la planta ≈ 630 llamadas de dibujo y 650 mil triángulos; patio ≈ 700 y 860 mil; CCM ≈ 83 y 19 mil. Hay ≈ 1160 mallas con ≈ 640 materiales distintos, lo que impide unirlas en lotes sin rehacer materiales. Las sombras ya son estáticas (`shadowMap.autoUpdate=false`).

Cambios:
- El tope fijo de 30 fps (`src/00-core_scene.js`) pasa a ser configurable (`window.frameCapMs`), por defecto 60.
- Nuevo modo **Automática** (predeterminado) en el selector de calidad (`src/40-protections_ccm_performance.js`): mide los fps reales por ventanas de 1 s; si caen por debajo del 85 % del objetivo baja la resolución del visor principal (mínimo 50 %) y, si aun así no alcanza, el tope pasa a 30 fps; si sobra rendimiento sube la resolución en pasos de 10 % y puede reintentar 60 fps (máx. 2 veces). Se ignoran pausas aisladas (menú, otra pestaña).
- Tecla **F3**: contador con fps, resolución y tope, para medir en el equipo real.
- Comprobado: mecanismo de bajada y subida con un reloj simulado; menú y controles sin regresiones. No comprobado: fps reales en GPU integrada, ni en proyector.
- Los visores secundarios (inspector y presentación de anatomía) tienen su propia resolución fija y no participan del ajuste automático.
- Pendiente para más fluidez: reducir llamadas de dibujo (materiales compartidos + unión de mallas estáticas) si la medición real en el equipo de presentación lo exige.

## v5 · Controles de videojuego
- Un clic en la escena captura el ratón: moverlo gira la cámara sin arrastrar (Esc lo libera).
- Shift = correr (3.0 m/s contra 1.65 m/s caminando).
- Control de consola (mapeo estándar): palanca izquierda mover, derecha mirar, A usar, B agacharse, Y mochila, X diario, Start menú, L3/RB/RT correr.
- Verificado en Chrome headless: giro con ratón, ratio de correr ~1.7x, B alterna agachado, sin errores JS.

## v6 · Mirar sin clic y siguiente objetivo
- Al caminar, mover el ratón sin pulsar nada gira la cámara; llevarlo al borde de la pantalla sigue girando. El clic sigue capturando el ratón por completo.
- Al terminar una actividad, el mensaje y la flecha de objetivo apuntan a la siguiente («✔ Hecho · Siguiente: …» con equipo y distancia).
- v5.1: si el navegador bloquea la API de gamepad (SecurityError), se ignora el control en lugar de romper el ciclo de dibujo.

## v7 · Ayudas para principiantes (src/50-ayudas_novato.js)
- Pantalla de bienvenida con controles al empezar a caminar (una vez por apertura; se cierra con cualquier tecla, clic o botón del control).
- Nombres flotantes de equipos en la planta (tecla N o botón «Nombres»): motor, alternador, tablero de control, transferencia, batería, radiador, filtro de aire, unión a tierra.
- Glosario de siglas (botón en el menú y botón «Glosario» durante el recorrido).
- Menú: una frase por opción y orden sugerido. Etiqueta de versión oculta (se ve al final del glosario).
- Texto de objetivo y botones más grandes para proyector; se oculta el texto viejo «Arrastrar/Shift/Rueda» al caminar.
- Pendiente: nombres de equipos en subestación y fábrica; modo presentación guiado.

## v8 · Visita guiada y «qué se arregla»
- «Explorar instalación» inicia una visita guiada de 10 paradas (planta: motor, radiador, alternador, batería, tablero de control, transferencia, secuencia de falla de red; luego subestación y CCM). Avanza con Enter/→/clic/botón A; Esc o «Salir» termina. Al final: «Hacer mantenimiento», «Repetir» o «Volver al menú».
- Mantenimiento: tarjeta «ARREGLANDO n/12» (pieza, qué hacemos, por qué importa) y aro pulsante «AQUÍ» sobre el componente de la actividad. Tras terminar muestra «✔ LISTO» y lo aprendido.
- El recorrido entra a subestación/CCM por la misma ruta que el menú «Zonas» (suspend33 + vista + enterZone).
- Pendiente: probar en laptop real; modo presentación automático (apagón + transferencia narrados).

## v9 · Visita independiente y paso al despiece
- «Explorar instalación» muestra solo la visita guiada (se oculta cabecera, zonas, pie y todo el HUD de mantenimiento). Esc / «Salir» / «Volver al menú» regresan al menú y cierran el motor de mantenimiento.
- Al terminar la visita, «Ver el despiece» (Enter / → / A): la cámara se aleja, la pantalla se funde a negro («Preparando el despiece…») y el despiece aparece con desvanecimiento. Al cerrar el despiece se entra al simulador (comportamiento existente de la presentación).
- El mantenimiento queda individual: se inicia solo desde «Mantenimiento práctico».

## v9.1 · Visita solo de la planta y sin protector
- La visita guiada queda en 8 paradas, solo la planta de emergencia (se quitaron subestación y CCM); luego «Ver el despiece».
- Se quita el panel (ducto/difusor del radiador, 140 triángulos de la geometría estática combinada) que tapaba el radiador. Se reaplica cada 1.5 s durante el primer minuto y al empezar a caminar, porque la geometría combinada se reconstruye después de la carga.

## v10 · Despiece directo
- Se elimina la visita guiada. «Despiece de la planta» (antes «Explorar instalación») abre el despiece con entrada suave (desvanecimiento). El botón «Anatomía» se oculta porque hacía lo mismo.
- Orden sugerido en el menú: Despiece → Misión → Mantenimiento.

## v10.1 · Funcionamiento en vivo
- Las misiones ya no abren el recorrido de mantenimiento: van directo a la vista de la planta con la prueba en marcha.
- Cuadro «Funcionamiento en vivo» (src/50-ayudas_novato.js) en la vista de la planta: explica cada etapa (servicio normal, falla de red, arranque, subida de velocidad, listo, transferencia, generador alimentando, enfriamiento), muestra rpm, voltios y hertz, y dos filas de la ruta de energía (red y generador) que se encienden según el estado. Botón «Cortar la red y ver qué pasa»; tecla V lo oculta o muestra.
- Probado forzando cada estado del simulador; la secuencia completa en tiempo real no se alcanzó a observar en el entorno de pruebas (muy lento).

## v11 · Portada industrial, calidad alta y operarios
- Nuevo fragmento `src/60-portada_industrial.js`: estilo negro + amarillo de seguridad, portada con tres niveles numerados (Despiece, Misión, Mantenimiento), flechas/Enter y cruceta/A del control, avisos de teclas.
- Selector de calidad: nueva opción «Calidad alta» (resolución mayor y 12 luces). Por defecto sigue «Automática».
- Operarios: colisión (ya no se atraviesan, radio 0.5 m, plano y patio) y cabeza que mira alrededor con respiración suave. Los brazos y piernas siguen en pose fija (el modelo no tiene esqueleto).
- Aviso de Three.js `sigmaRadians` del despiece corregido (0.08 → 0.035).
- Pendiente: colisión general con otros objetos que el usuario sienta que atraviesa.
- v11.1: pantalla de planta más limpia (sin panel de misión derecho, sin números ni cadena repetidos en el narrador, sin título tenue, botones poco usados bajo «Más opciones», telemetría de 3 tarjetas).
- v11.2: la portada muestra un dibujo del grupo electrógeno (radiador, motor, alternador, tablero) en lugar del diagrama de rutas.
- v11.3: sonido sintetizado (motor según rpm, alarma al perder la red, arranque, relevador de transferencia, pasos). Respeta el botón ♪.
- v11.4: el panel de misión sale solo durante una misión (título, tiempo, 3 objetivos, resultado y botón Elegir misión); pantalla de planta sin ese panel el resto del tiempo.
- v11.5: señal amarilla «Ve a: …» con distancia sobre el siguiente objetivo del mantenimiento; flecha en el borde si está fuera de pantalla.
