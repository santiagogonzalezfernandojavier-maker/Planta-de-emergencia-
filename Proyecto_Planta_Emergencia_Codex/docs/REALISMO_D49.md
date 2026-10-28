# D49 · materiales y detalle industrial

## Qué cambia en la escena

La planta, subestación, fábrica y CCM conservan sus modelos y funciones. Se revisa el acabado de sus superficies para distinguir pintura, hierro fundido, acero cepillado, galvanizado, cobre, concreto, piso cementicio, grava, asfalto, tierra, caucho y cerámica. El mismo patrón de grano deja de representar todos esos materiales.

Cada familia combina color sin luces pintadas, normales de relieve y un mapa con oclusión/rugosidad. Se conservan colores de identificación y la escala de cada repetición en metros. La pintura de los transformadores usa un acabado fino; las pequeñas irregularidades de fundición no se aplican a sus chapas pintadas. No se añaden manchas de aceite, fallas o corrosión que puedan confundirse con hallazgos de mantenimiento.

El generador incorpora cuatro conjuntos de detalle: abrazaderas de refrigeración, bridas/juntas/soldaduras del escape, arandelas y apoyos elastoméricos, juntas y fijaciones de tapas. Se unen a las piezas originales; se conservan al cambiar combustible/configuración y acompañan el despiece en Anatomía. No reemplazan las piezas móviles ni los blancos de interacción.

## Luz y apoyo en el piso

Dos entornos precalculados dan reflejos distintos a interiores y exteriores. El interior refleja luminarias y superficies del cuarto; el exterior, cielo y horizonte. Su intensidad sigue día/noche y suministro, reduciéndose en un apagón. La revisión de contraste mantiene detalle en las superficies claras.

La luz direccional existente concentra su mapa de sombras alrededor de la zona del jugador o equipo inspeccionado. Los apoyos suaves bajo equipos, máquinas y operarios reducen la apariencia de que flotan. Estos apoyos son aproximaciones gráficas transparentes: no simulan una iluminación calculada ni cambian las colisiones. Se mantienen los presupuestos de luces y los ciclos de animación existentes.

## Calidad gráfica

En el recorrido pulsa **Esc → Calidad visual**. **Fluido** usa texturas de 512 px; **Detalle**, 1024 px y la resolución de pantalla del perfil de detalle existente. El selector de Zonas sigue disponible y ambos se sincronizan. Cambiar calidad no reinicia una actividad ni desplaza al jugador. Las dos resoluciones se almacenan en caché y se comparten entre materiales; alternar repetidamente no crea otro juego de texturas cada vez.

Detalle consume más memoria gráfica. La fluidez depende del dispositivo y del tamaño de pantalla; no se promete una tasa de fotogramas universal. Las manos y operarios conservan su geometría de entrenamiento; esta revisión no los convierte en personajes capturados por fotogrametría ni introduce física de contacto completa.

## Recursos y reproducción

Los materiales fueron creados para este proyecto con un generador determinista. `assets/textures/industrial/manifest.json` identifica sus canales, escala, semilla, tamaños y SHA256. Los 72 WebP comprimidos suman aproximadamente 5.5 MB. Se pueden regenerar con `python3 scripts/author-surfaces.py`, usando Pillow, NumPy y SciPy. Las dependencias de autoría son opcionales: los recursos terminados están incluidos en Git.

`npm run build` los empaqueta en `build/app.js` y en el HTML autónomo. No se consulta una CDN ni un proveedor de texturas durante el juego. El servidor de desarrollo vigila imágenes y manifiesto para anunciar sus cambios; una revisión inválida conserva la última compilación válida. Los originales Blender/GLB y los personajes serializados permanecen intactos.

## Comprobación

`npm test` comprueba archivos/canales, sumas, presupuesto de tamaño y reconstrucción al cambiar un recurso. `npm run test:visual` verifica las dos resoluciones en Chromium, caché, conservación de pose, reflexión durante apagón, reconstrucción de detalles/materiales y compilación de shaders. Genera capturas de planta diurna/nocturna, subestación, grava y CCM para revisión visual.

Las regresiones de actividades, cámaras, anatomía, linterna, subestación, unifilar y seguridad se comprueban con las suites existentes. La publicación automática incluye la comprobación visual nueva.

Validación local D49: 28 pruebas unitarias aprobadas y suites `test:browser`, `test:player`, `test:maintenance`, `test:experience`, `test:visual`, `test:substation`, `test:technical` y `test:site` aprobadas en Chromium. Se revisaron las capturas de planta diurna/nocturna, subestación, pintura del transformador, grava y CCM. Los registros no contienen errores de página; la prueba visual tampoco detectó errores de shader. El manifiesto histórico D34 sigue describiendo su entrega original; la integridad de los materiales nuevos se comprueba con su manifiesto propio.
