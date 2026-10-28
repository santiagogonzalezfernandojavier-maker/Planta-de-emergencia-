# Estado de entrega para continuar en Codex

## Objetivo del usuario

Un simulador educativo 3D de generación de emergencia que se sienta como un videojuego de mantenimiento, con realismo industrial y referencias mexicanas. La instalación incluye planta en sótano, subestación a nivel de terreno y fábrica alimentada mediante conexión aérea, con CCM dentro de su sótano.

## Actualización D49.1

- Inicio de inspección con casilla amplia, explicación permanente, habilitación visible del botón y salida explícita de pausa. Reabrir reinicia la confirmación sin conservar mensajes obsoletos.
- Se corrige `seTarget44.hidden=true` antes del retorno de actualización de 80 ms: causaba que el marcador desapareciera entre fotogramas. Ahora conserva visibilidad y ofrece dirección fuera de pantalla. La flecha de la actividad de planta se destaca.
- Carteles: fuente mayor, contraste mínimo corregido, anisotropía de hasta 16; señales vectoriales a doble resolución sin comprimir texto. Nuevo cartel integral de acceso SE-01.
- `00-control-house.js` reemplaza el bloque macizo de caseta con paredes y hueco reales, dos puertas con bisagras mediante Cabinets38, dos peldaños y un pasillo interior. Incluye SC-PR, SC-PLC y SC-DC con puertas/cubiertas, canalizaciones y banco. Colisiones compartidas en SiteWalk37; las puertas cerradas bloquean el acceso. La luminaria que atravesaba la caseta se traslada fuera del recinto con su colisión.
- `test:usability` verifica contraste, E en ambas hojas, entrada/salida y gabinete interior. `test:substation` comprueba casilla/clic/teclado/móvil, inicio desde pausa, persistencia del marcador en fotogramas consecutivos y dirección fuera de vista. El punto de observación PC-02 se sitúa en el pasillo este exterior de la caseta.
- Validación: 29 pruebas unitarias y recorridos browser, substation, experience, usability y site aprobados. Capturas revisadas del cartel SE-01, acceso al mantenimiento en escritorio/móvil y gabinete abierto dentro de la caseta. Se conserva la edición D49 de materiales; la identificación visible del parche es D49.1.

## Actualización D49

- `scripts/author-surfaces.py` genera doce familias originales de PBR: albedo, normales y AO/rugosidad empaquetadas en 72 WebP para 512/1024 px. Se guardan escala métrica, semilla, tamaño y SHA256 en `assets/textures/industrial/manifest.json`. Los archivos comprimidos suman aproximadamente 5.5 MB; no se necesita Python ni red para construir/jugar.
- `19-industrial-surfaces.js` comparte las texturas, conserva espacios de color, cambia resolución según Fluido/Detalle y actualiza los materiales reconstruidos. `20-surfaces_presentation_ui.js` conserva clasificación y UV físicas, usando esta biblioteca en vez del antiguo grano común. El galvanizado y acero responden al entorno; el recubrimiento del transformador se mantiene fino.
- `18-mechanical-detail.js`: cuatro conjuntos de abrazaderas, bridas/juntas de escape, arandelas/apoyos y juntas/fijaciones de tapas. Se montan en sus piezas originales para despiece, visibilidad y reconstrucción.
- `78-scene-look.js`: dos entornos de reflexión precalculados, selección interior/exterior y control de intensidad por día/noche y suministro. Ajusta la sombra de la luz existente alrededor de la zona del jugador. Añade apoyos transparentes suaves bajo equipos/operarios y un selector de calidad en pausa. No añade luces, renderizadores ni RAF.
- `build.mjs` incluye los recursos en el JS/HTML autónomo. `serve.mjs` detecta cambios de texturas/manifiesto junto con las fuentes. Se conserva el funcionamiento sin CDN, las actividades, cámaras, gabinetes, fábrica, paisaje, flujo y anatomía.
- `test:visual` comprueba decodificación, cambio de calidad/caché, recuperación de materiales tras reconstrucción, luz de reflexión durante apagón y ausencia de errores de shader. Pruebas de integridad y vigilancia de recursos ampliadas. Ver docs/REALISMO_D49.md.

## Actualización D48

- Inicio con seis tarjetas de modalidad y consulta de placas, unifilar y ayuda. Explorar entra a pie por elección expresa. Esc → Menú principal → Continuar conserva la pose y actividad. Seguridad/unifilar/protección se reúnen en Zonas.
- Guía con acción inmediata, herramienta y resultado observable. Botones Mirar pieza y Usar/Mantener/Guardar/Continuar. Orientar no teletransporta; se conserva alcance, visibilidad, herramientas y pulsación mantenida. Avisos duplicados se retiran del pie durante el guiado.
- `00-equipment-labels.js`: lienzos de texto con proporciones físicas, ajuste de fuente, sRGB y anisotropía; no se estira un lienzo fijo. Identificación AP elevada/separada de los rótulos de transformadores.
- `68-equipment-data.js` y `69-equipment-inspector.js`: veinte placas NEXORA ficticias, datos del escenario y pendientes de proyecto, zoom sobre placa física, selección, consulta de interiores y restauración de cámara/puertas/herramienta. Utiliza CCM34.frame y su luz existente; no añade un RAF o renderer.
- `00-cabinet-interiors.js`: mecanismos con resortes/motor/reductor/levas/bobinas/contactos y PR-01 con IED en puerta, auxiliares DC, relés, borneras TC de prueba, bornes de tensión, alarmas y PE. Las cubiertas son guardas locales transparentes. La estructura del interruptor despeja el gabinete frontal. `batchStaticGeometry` excluye piezas invisibles retiradas; antes las volvía a combinar como visibles.
- Multímetro: misma instancia en mano/apoyo, transición de 0.7 s, sin miniatura seleccionable en bolsa durante el uso, puntas al terminar la colocación y bloqueo de la segunda conexión mientras se está apoyando. Operarios: ajuste explícito de geometría/material, sin tocar originales Blender/GLB/gzip.
- Pruebas nuevas de semántica de placas y `test:experience`, incluida en publicación. Se conservan las doce actividades, tres prácticas de subestación, anatomía, demostración, fábrica, CCM, flujo y día/noche. Ver docs/EXPERIENCIA_D48.md.

## Actualización D47

- `29-service-ladder.js`: escalera portátil con plataforma, tres peldaños, barandales, pies antideslizantes y un único juego de dimensiones para malla y recorrido. E coloca/retira; WASD sube y baja. Se impide entrar por los lados, abandonar la plataforma lateralmente y retirar la escalera ocupada. La orden del filtro requiere terminar el acceso y la retirada.
- El multímetro usa el mismo grupo 3D en la mano y en el soporte. El cambio de padre conserva la pose y anima la colocación/recogida; las dos puntas habilitan la lectura. No se conserva un clon simultáneo del instrumento en uso.
- Unión PE expuesta al frente del bastidor, cable verde/amarillo y barra de cobre. Tres pasos con nombres y observaciones concretas; no se permite afirmar firmeza, continuidad o resistencia por inspección visual.
- Se retiran 23 reglas antiguas del aviso, incluido padding-left de 118 px y topes con scroll. `walkFooter47` organiza aviso y controles en flujo normal; se evita repetir la instrucción en el aviso de gabinetes. El guiado vuelve a preparar una herramienta ya recogida al actuar.
- Pruebas ampliadas `test:maintenance` y recorrido de doce órdenes en `test:browser`; ver docs/MANTENIMIENTO_D47.md.

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
