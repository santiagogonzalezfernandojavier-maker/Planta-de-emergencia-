# Simulador de planta de emergencia — D44: protección y mantenimiento de subestación

Base funcional: D34, recuperada el 24 de octubre de 2026. Las revisiones siguientes conservan sus instalaciones y amplían el recorrido interactivo.

## D44 · protección y mantenimiento de subestación

Se completaron **nueve apartarrayos**: llegada, elevador TE y principal TP. Los **cuatro pararrayos PC-01 a PC-04** usan mástiles de celosía, puntas captoras, hilo de guarda y bajantes con uniones de prueba hasta la malla común. **Protección contra rayos** abre sus vistas de detalle. DU-01 incluye las nuevas derivaciones AP-TE y AP-TP; los parámetros de selección siguen pendientes.

**Mantenimiento de subestación** está en el menú inicial y en Zonas. Añade tres actividades: inspección de apartarrayos, bajantes de pararrayos y comparación termográfica simulada. Incluye doce puntos, conclusiones elegidas por el jugador, una unión abierta visible de PC-03, cámara térmica en las manos y bitácora JSON. Conserva por separado las doce prácticas del generador.

[Guía, equipos y alcance de D44](docs/SUBESTACION_D44.md). Prueba del recorrido: `npm run test:substation`.

## D43.1 · elección inicial y espacio de paso

La carga de personajes ya no pulsa Explorar ni inicia el mantenimiento. El menú permanece hasta elegir **Explorar instalación**, **Elegir una misión**, **Anatomía de la planta** o **Mantenimiento práctico**. Esta última abre la selección guiado/evaluación; las otras opciones conservan sus propias funciones. Esc no salta el menú inicial.

El pie de la escalera se desplazó 0.95 m hacia el interior longitudinal del recorrido, manteniendo sus 36 peldaños, huella y altura. El descanso inferior tiene 2.10 m de ancho y más de 1.50 m de profundidad de paso. El hueco de losa, barandales, descanso superior y colisiones usan las mismas dimensiones. Se conserva la ruta a pie de ida y vuelta.

## D43 · brazos y navegación revisados

Los brazos usan dos segmentos de longitud fija (30 y 27 cm) y un codo calculado; un objeto lejano no alarga las extremidades. Se revisaron el agarre de herramientas, los dedos y las mangas. Las inspecciones con linterna mantienen la herramienta cerca del cuerpo; las acciones continuas sostienen la pose en lugar de reiniciar el alcance repetidamente. Pausar, abrir el cuaderno, abrir la bolsa o cambiar de vista cancela la acción pendiente. Las manos siguen siendo un modelo procedural de primera persona, sin un cuerpo completo ni contacto físico resuelto en toda la instalación.

La entrada directa a **Subestación** lleva al pasillo peatonal de acceso, con identificación enmarcada y guía de piso. Las vistas de inspección liberan el control de la cámara de recorrido. **Volver a mi recorrido** conserva posición, orientación, postura, herramienta, inspección Z y actividad. Se restauran la perspectiva y el plano cercano al salir; Z retira las manos del encuadre para examinar la pieza. El menú de zonas se cierra al seleccionar un destino.

Se corrigió el acceso al radiador durante su mantenimiento: la colisión del tramo retirado ya no bloquea el paso. Las zonas del radiador tienen blancos más pequeños y se seleccionan por alineación al apuntar; un punto completado no redirige automáticamente la acción a un blanco vecino. El marcador, la flecha y la indicación siguen el mismo componente. El panel indica paso/herramienta, distingue errores y conserva el último resultado. El avance automático espera 4 s para permitir leer; E continúa inmediatamente.

`npm run test:player` comprueba longitudes, alcance acotado, agarre, cambio de cámara, recuperación del recorrido y entrada por acceso peatonal. Se mantienen las pruebas del unifilar, seguridad EPSS, doce actividades, gabinetes y escaleras.

## D42 · unifilar y seguridad EPSS

**Unifilar técnico**, junto a Zonas/Seguridad, abre la lámina DU-01: símbolos nacionales cotejados con NMX-J-136-ANCE-2019, figuras y abreviaturas en fichas, números de función, estados en vivo, magnitudes con FP, cuadro de alimentadores, zoom, SVG e impresión. Los datos de marco, disparo, capacidad interruptiva, conductores y transformadores se distinguen como pendientes de proyecto.

**Seguridad EPSS** añade una revisión basada en la NFPA 110-2010 compartida: paro remoto protegido en el descanso exterior, anunciador con reconocimiento, prueba de lámparas, alumbrado autónomo y condiciones simuladas de ventilación, escape, combustible, cargador y agua. Se ofrece un perfil temporal de referencia de 300 s para retorno/enfriamiento y una bitácora exportable. Nivel, tipo y clase están por definir. Una demostración abreviada no acredita el ejercicio mensual real.

Consulta [análisis y referencias por apartado](docs/UNIFILAR_Y_SEGURIDAD_D42.md). Los PDF completos del usuario no se publican con la aplicación.

## D41.1 · publicación y arranque estable

`npm run site:build` genera `dist/site` para GitHub Pages; `npm run test:site` comprueba su arranque y el aviso de actualización con Chromium. El workflow del repositorio valida y despliega automáticamente los cambios de `codex/simulador-d35` cuando Pages está configurado con Source = GitHub Actions. Consulta el README de la raíz para la activación inicial.

El supervisor de Codespaces sirve inmediatamente, sincroniza Git fuera del proceso HTTP y reinicia el servidor si este termina. No instala dependencias de pruebas al arrancar ni reinicia el puerto por cada actualización. El servidor conserva la última compilación válida ante errores de sintaxis. La suspensión de Codespaces sigue apagando ese enlace; el sitio de Pages es independiente.

## Cambios D41 · manos y resultados visibles

La linterna tiene un haz real dirigido hacia la superficie y una lente emisiva. Se apaga al cambiar de herramienta, abrir el cuaderno, pausar o salir del recorrido. Usa una sola luz sin sombras adicionales y el ciclo de animación existente.

Se ven manos enguantadas con antebrazos. En acciones puntuales alcanzan la pieza antes de ejecutar el cambio; la varilla, la tapa y los mandos interpolan su movimiento. Al inspeccionar, cepillar o girar sujetadores, mantén **E** o **clic izquierdo**; el progreso aparece en pantalla. El polvo se reduce en su propio sector mientras cepillas. Los círculos del radiador pasan de ámbar a azul al revisar y a verde al limpiar. Las zonas se sitúan en la rejilla exterior accesible, debajo del posenfriador. El modo guiado explica en cada paso **qué debes ver** y conserva el resultado visible antes de continuar.

Se retiraron el llavero, el inventario de llaves, la tecla L y el requisito de llave de todas las puertas. **E** abre/cierra gabinetes próximos y **V** retira/repone su cubierta interior. El candado personal de bloqueo de arranque sigue siendo parte de la práctica; las cubiertas se reponen antes de cerrar.

Las manos son una animación procedural de primera persona. No representan fuerza de apriete, contacto háptico ni mediciones reales. Las doce prácticas, evaluación, escaleras, puertas e interiores se conservan.

## Cambios D40 · jugar sin abrir el cuaderno en cada paso

En modo **Guiado**, acércate a la bolsa, pulsa **B** y **Tomar equipo de mantenimiento**. Lo recoges una sola vez; la herramienta se prepara al cambiar de paso. Sigue el nombre de la pieza resaltada y pulsa **E**. Para los sujetadores mantén E; para revisar varios puntos puedes mantener E mientras apuntas a cada uno. El indicador muestra cuántos faltan.

Las lecturas de aceite y batería aparecen sobre el recorrido y **E** las guarda. E inicia también la prueba final. Al terminar una actividad, la siguiente comienza automáticamente tras una pausa breve; E permite continuar inmediatamente. **Q** queda disponible para ampliar los pasos, consultar términos y revisar resultados. El menú de zonas se oculta al abrir la bolsa para no tapar su botón.

El modo **Evaluación** conserva preguntas, selección de herramientas y confirmación de condiciones. El guiado registra los datos iniciales como información del escenario, sin atribuir al jugador confirmaciones que no realizó. Las mediciones siguen siendo valores simulados. No se suprimen los desplazamientos, las acciones físicas ni las doce actividades.

## Cambios D39 · qué hacer en cada actividad

**Q** muestra ahora el paso actual con una acción concreta, la herramienta y el cambio visible que confirma que lo hiciste. Los datos del ejercicio se distinguen de las acciones del jugador. El botón **Empezar actividad** confirma la lectura inicial; **Volver al equipo y hacer este paso** cierra las instrucciones e intenta capturar el mouse. Q y Esc también cierran las instrucciones cuando una casilla o botón de opción tiene el foco.

En la revisión de batería solo se apunta con la linterna a cada terminal marcado + y − y se pulsa E. Al revisar ambos se guarda automáticamente que hay depósitos blancos y que la limpieza queda pendiente. No existe un botón adicional de diagnóstico. Las lecturas de aceite y voltaje sí requieren usar su botón de registro en Q; eso se indica en el paso correspondiente.

Se simplificaron los títulos, preguntas y resultados de las doce actividades. Los pasos completos y las explicaciones técnicas quedan en secciones desplegables. En el gabinete, el selector FUERA/AUTO y sus etiquetas están debajo de la pantalla; la pantalla ya no tiene mandos ni etiquetas encima. El punto de la primera actividad está en la pantalla, y el del bloqueo está en el selector.

## Cambios D38 · llaves e inspección de gabinetes

Acércate al llavero junto a la bolsa y pulsa **L** o **Llaves**. Recoge los juegos **G-01**, **SE-01** y **CCM-01** que necesites. No se entregan automáticamente: la recogida requiere proximidad al llavero. Las llaves son de servicio; no sustituyen el candado personal de las prácticas.

Con la llave correspondiente, apunta a una puerta y pulsa **E**. Con la puerta abierta, **V** retira o repone su cubierta interior. Repón la cubierta antes de cerrar. El botón **Instalar cubierta G-01** monta la envolvente acústica del generador; puedes abrir sus seis paneles con la llave o retirar el conjunto. Esta cubierta comienza retirada para conservar el acceso de las prácticas.

Hay puertas articuladas para control y transferencia de la planta, mandos QN/QG/QS, PR-01, DC-01, QF-01 y las 26 puertas del CCM. Los compartimentos del CCM ahora varían: arranque directo, reversa, estrella-triángulo, arrancador suave, variador, alimentador y servicios de control; las reservas siguen vacías. El principal mantiene su protección de barras. Los materiales distinguen pintura, metal, polímeros, cobre y tejido de los uniformes.

Las llaves y los controles se conservan al reconstruir la configuración del generador durante la sesión. Recargar la página inicia una partida nueva. Los interiores son representaciones educativas, sin selección de fabricante ni cableado de ingeniería validado. Los personajes mantienen poses estáticas y las texturas son procedurales. Consulta `docs/GABINETES_D38.md`.

## Cambios D37 · subir a la subestación caminando

Desde el cuarto de la planta, ve al pie de la escalera al fondo/lado izquierdo, rodea su extremo inferior y sube con WASD. La altura sigue los 36 peldaños. Al salir al descanso superior, sigue el pasillo hasta el paso peatonal de la cerca, abierto para este escenario autorizado; regresa por el mismo camino para bajar. No se requiere salto ni cambiar de zona en el menú. La orden, las herramientas y el avance se conservan.

Los descansos inferior y superior están conectados al piso, los barandales laterales y el hueco de la losa bloquean pasos indebidos y una luminaria se separó de la salida. Las colisiones siguen siendo una representación simplificada, sin física de cuerpo completo. Este cambio conecta planta y subestación; la escalera interior del CCM sigue siendo una navegación aparte.

## Cambios D36

Ahora cada una de las doce actividades tiene una orden de trabajo: ubicación, hallazgo del escenario, condiciones previas, decisión de intervención y criterio de cierre. **Q** abre la orden; la tarjeta en pantalla indica la siguiente acción y la herramienta. En guiado se conservan los marcadores. En evaluación también hay que preparar la orden y responder las preguntas previas.

El selector se pone fuera de servicio antes de colocar el candado. El radiador se inspecciona antes de limpiar. El filtro exige instalar el elemento, reponer la tapa y cerrar ambos sujetadores. Los bornes se inspeccionan y se registra una correctiva pendiente: no se cepillan mientras la batería conserva energía. La entrega exige restituir el seccionador antes de retirar el bloqueo personal. La bitácora incluye las condiciones confirmadas y la decisión de cada orden.

Los operarios conservan su anatomía y poses: se ajustan casco, cuello y botas, se eliminan las tiras sueltas de la cara y se añade cabello sobre la topología de la cabeza. Los Blender y GLB originales se conservan. No hay rig ni animación de locomoción de los personajes.

Consulta `docs/MANTENIMIENTO_D36.md` para los alcances y la validación. Son escenarios didácticos; no se representan todas las fuentes de energía ni procedimientos completos de campo.

## Cambios D35

- En mantenimiento, pulsa **Jugar / F** para capturar el mouse: WASD mueve y el mouse gira sin mantener un botón. **Esc** libera el cursor y pausa el recorrido; **F1** abre la ayuda.
- **Shift** acelera el paso, **C** alterna agacharse, **E / clic** interactúa, **B** abre la bolsa del piso, **Q** muestra el cuaderno/objetivo, **Z** inspecciona y **H** deja las manos libres. No se añadió salto: se mantienen los límites y colisiones de las zonas.
- El menú de pausa ajusta la sensibilidad. Si no se permite capturar el mouse, elige cursor libre y usa botón derecho + arrastrar o las flechas. El movimiento se detiene al perder el foco, durante la pausa y al leer el cuaderno.
- La barra inferior queda reducida; el objetivo y las zonas se abren como tarjetas centrales, sin un panel lateral permanente. Se conservan las doce actividades y los controles táctiles.
- Los cuatro operarios conservan la anatomía original: se eliminan ojos/lentes antiguos superpuestos, se ajustan casco y materiales, se apoyan las suelas en el suelo y se añaden identificación, radio y correas. Son mejoras del visor; los archivos Blender y GLB originales se conservan sin cambios. No se añadió rig ni animación corporal.

## Abrir el simulador

Sin instalar herramientas: abre `dist/ABRIR_SIMULADOR.html` con Edge o Chrome. El respaldo anterior está en `reference/D34_original.html`.

Para desarrollar, instala Node.js 20 o superior, abre esta carpeta en tu editor y ejecuta:

```bash
npm start
```

El archivo `build/app.js` se regenera al ejecutar el comando y se omite del ZIP para evitar duplicados de datos. Abre `http://127.0.0.1:4173`. El servidor solo escucha en tu equipo. No requiere clave de API, Blender ni dependencias de producción. Detén el servidor con Ctrl+C.

## Continuar con Codex

1. Extrae el ZIP completo y abre la carpeta `Proyecto_Planta_Emergencia_Codex` como proyecto local en Codex o como carpeta de trabajo de VS Code con la extensión de Codex.
2. Abre `PROMPT_PARA_CODEX.md` y úsalo como primera instrucción.
3. Pide a Codex leer `AGENTS.md` y `docs/ESTADO_DEL_PROYECTO.md` antes de modificar.

También puedes abrir una terminal en esta carpeta e iniciar `codex` si ya tienes instalada esa herramienta. No se ha creado una sesión remota ni un repositorio en una cuenta externa.

Documentación oficial consultada: [proyectos y carpetas](https://learn.chatgpt.com/docs/projects?surface=app) y [extensión para IDE](https://learn.chatgpt.com/docs/ide).

## Dónde modificar

| Ruta | Contenido |
|---|---|
| `src/index.template.html` | DOM original y puntos de inserción de estilos/scripts |
| `src/styles/app.css` | Estilos estáticos; algunos estilos de componentes aún se generan en JavaScript |
| `src/00-core_scene.js` | Simulación eléctrica, geometría procedural, fábrica, subestación, cámaras, canalizaciones y alumbrado |
| `src/10-personnel.js` | Carga de los modelos de operarios |
| `src/20-surfaces_presentation_ui.js` | Materiales procedurales, presentación/despiece e interfaz de juego |
| `src/30-maintenance_walk.js` | Prácticas, bolsa del piso, movimiento, colisiones, inventario y preguntas |
| `src/40-protections_ccm_performance.js` | Protecciones, navegación, CCM articulado, optimización e inicio |
| `src/order.json` | Orden de concatenación de las fuentes |
| `assets/personnel/scene-data.json.gz` | Datos exactos usados por D34 para representar los cuatro operarios |
| `assets/blender/` | Escena editable, cuatro GLB, base MakeHuman, texturas y script histórico |
| `assets/textures/personnel/` | Texturas extraídas de los materiales serializados para edición artística |
| `vendor/three.js` | Three.js revisión 169 incluida, con su cabecera de licencia |
| `docs/technical/` | PDF de base didáctica y unifilares de una entrega anterior, como referencia |
| `tests/` | Pruebas ejecutables y resultados históricos D34 |

Estas fuentes son fragmentos ordenados de una aplicación con ámbito global compartido; todavía **no son módulos ES independientes**. El compilador las reúne en un único script para conservar el orden de inicialización y las variables compartidas. Refactorizar esa arquitectura debe ser un trabajo separado y gradual.

La subestación, fábrica, máquinas, vehículos, herramientas y CCM se generan por código. No existe un archivo Blender original de toda la instalación. La escena `.blend` incluida corresponde a los operarios. `docs/ASSET_INVENTORY.json` describe la procedencia de los activos.

## Construir y verificar

```bash
npm run build
npm test
```

`build` produce `build/app.js`, `index.html` y el HTML autocontenido de `dist/`. Edita `src/` y los activos, no los archivos generados. La compilación vuelve a insertar el gzip de operarios; no hagas reemplazos globales sobre cadenas base64.

Para las pruebas de navegador:

```bash
npm install
npx playwright install chromium
npm run test:browser
```

La prueba inicia su propio servidor en `127.0.0.1:4175`. Permite `CHROMIUM_PATH`, `CHROMIUM_ARGS_JSON` y `TEST_PORT` para entornos de ejecución especiales. Las pruebas no generan capturas para distribuir.

## Activos y límites

Se conservan el código y los datos necesarios para ejecutar D34, más las fuentes artísticas recuperadas. No se incluyen instalaciones de Node/Blender, cachés, copias temporales, respaldos `.blend1`, vídeos o imágenes históricas que no formen parte del simulador. Las capturas internas de verificación no son activos del producto.

Los GLB y el `.blend` son auxiliares D26; el visor usa el gzip exacto extraído de D34. El script `redisenar_personajes.py` es histórico: respalda el `.blend` antes de ejecutarlo y adapta su proceso de exportación si vas a regenerar activos. Su salida de JSON no reemplaza directamente el gzip deduplicado del visor.

La representación eléctrica y el recorrido son didácticos. La selección de protecciones, cobertura contra rayos, coordinación, niveles de cortocircuito y conformidad normativa no están certificados por este modelo. Revisa `docs/Protecciones_y_Referencias.txt`.

## Verificar la descarga

Antes de editar puedes ejecutar `npm run verify:package` para comprobar los archivos distribuidos contra `MANIFEST_SHA256.json`. Las modificaciones intencionales posteriores producirán diferencias; el manifiesto describe el punto de entrega, no es una prueba que deba pasar después de cambiar código.
