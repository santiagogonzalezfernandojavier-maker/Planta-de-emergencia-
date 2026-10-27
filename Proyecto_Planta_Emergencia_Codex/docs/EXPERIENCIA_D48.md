# D48 · experiencia de aprendizaje y consulta técnica

## Entrar y jugar

El menú espera tu elección. **Conocer el equipo** abre anatomía con cubierta; **Practicar en la planta** abre guiado/evaluación y sus doce actividades; **Practicar en subestación** conserva tres actividades propias; **Explorar instalación** empieza el recorrido libre a pie. Demostración y pruebas eléctricas conservan sus sesiones independientes.

En una actividad, la tarjeta indica la pieza y su distancia, el paso/herramienta, **Haz ahora** y **Confirma el resultado**. **Mirar pieza** gira la cámara hacia la pieza o la bolsa que falta; no cambia tu posición. El otro botón permite actuar, mantener, guardar la lectura o continuar, según el paso. También puedes apuntar y pulsar E o mantener el marcador. El botón no evita alcance, obstáculos, herramienta ni linterna encendida. La barra de contacto confirma una acción mantenida. Q abre la explicación y el registro.

WASD mueve, F o clic en un espacio libre captura el mouse, E usa, L conmuta la linterna, C agacha, Z permite inspección y Esc pausa/libera el cursor. La captura del mouse necesita una acción del usuario por el navegador. Esc → **Menú principal** → **Continuar** recupera el lugar y la actividad; elegir otra modalidad inicia esa opción.

Las consultas de seguridad, unifilar, protección y placas están en **Zonas**. Se conservan fábrica, CCM, paisaje, escaleras, cubiertas, conexiones, flujo y ciclo día/noche. El tablero G01-CONTROL sigue fijo.

## Placas y letreros

**Placas de datos**, en el inicio o Zonas, permite seleccionar veinte equipos, aproxima suavemente la cámara a su placa física y muestra sus datos en texto legible. La ficha de protección contra rayos también ofrece **Ver placa de datos** para el banco seleccionado. +/−, rueda y Encuadrar ajustan la vista. En móvil la ficha pasa abajo. **Volver a mi vista** o Esc recupera la orientación, posición, herramienta, estado de linterna, postura, actividad y visibilidad anteriores.

Se usa **NEXORA**, una marca inventada, con modelos NX-* ficticios. La potencia del generador sigue su configuración; la potencia aparente se identifica como referencia calculada con FP 0.80. Tensiones y frecuencias son datos del escenario. Potencias de transformadores, Ur/MCOV de apartarrayos, corrientes y capacidades de interruptores, ajustes, clases, relaciones TC/TP y diseño contra rayos quedan **Por definir**. No son placas de fabricante, datos de compra ni certificaciones.

Las identificaciones se dibujan respetando la relación entre ancho y alto de cada rótulo, sin comprimir las letras horizontalmente. Se ajusta la fuente al texto y se mejora el muestreo en perspectiva. Los letreros de apartarrayos se ubican por debajo y separados de los rótulos de transformadores.

## Gabinetes representativos

**Ver interior del gabinete** muestra SE-QN/QG/QS y PR-01. Usa la cámara principal y la luz de inspección existente. Al cerrar la consulta se restituye cada puerta y cubierta a su estado anterior.

- Mecanismos MT: dos resortes de acumulación, motor y reductor, leva/eje, bobinas de cierre y disparo, contactos 52a/52b, bornes X1 y enlace PE. Las diagonales de soporte pasan por atrás y los lados, despejando el gabinete.
- PR-01: parte posterior del IED en puerta, protección de alimentación DC, relés auxiliares, bloque de prueba de TC con puentes, bornes seccionables de tensión, mando/alarmas, canaletas y PE. No contiene los transformadores primarios de medida dentro del gabinete.

La optimización ya no combina como visibles las superficies antiguas que habían sido retiradas. Las guardas interiores protegen borneras locales y conservan V; no son una pared que tape todos los componentes. Esta distribución es didáctica y no reproduce el diseño constructivo de un fabricante ni habilita trabajo energizado.

## Instrumento y operarios

Conectar la primera punta traslada **la misma instancia** del multímetro al apoyo, con una animación de 0.7 s. La segunda punta espera a que termine la colocación; la lectura aparece tras ambas conexiones. Registrar recupera el instrumento. Su miniatura no aparece ni se puede tomar en la bolsa mientras está colocado. La mano de apoyo acompaña el tramo alcanzable de la transferencia.

Se mantienen los cuatro operarios, posiciones y poses. Se ajustan proporciones, botas, uniforme, cuello, bolsillos, guantes y variación de piel/cabello mediante conversión explícita durante la carga. Los archivos originales se conservan. Son modelos de entrenamiento sin captura de movimiento ni contacto físico completo; las manos del jugador continúan usando el sistema procedural acotado de dos segmentos.

## Comprobación

`npm test` incluye la separación semántica entre tensiones del circuito y parámetros asignados pendientes. `test:experience` recorre las veinte placas, zoom, encuadre de escritorio/móvil, apertura y visibilidad de componentes internos, restitución de puertas, menú/continuar y recuperación de la práctica. `test:maintenance` mantiene E, clic en etiquetas y el botón principal a través de frame(), comprueba varilla, radiador, escalera, multímetro y PE. `test:browser` recorre las doce actividades y gabinetes. Se conservan `test:player`, `test:substation`, `test:technical` y la prueba del sitio publicado.

Estas verificaciones detectan regresiones conocidas; no garantizan ausencia de fallos en todos los navegadores ni sustituyen la revisión del contenido técnico por un responsable de la instalación.

Resultado local del 27 de octubre de 2026: 27 pruebas unitarias aprobadas y recorridos `test:browser`, `test:player`, `test:maintenance`, `test:experience`, `test:substation`, `test:technical` y `test:site` aprobados en Chromium, sin errores de página. Revisión visual de menú, guía, placas en escritorio/móvil, mecanismos, protección, multímetro y operario. Se corrigieron durante la revisión una superficie antigua que reaparecía al combinar geometría, una diagonal que cruzaba el mecanismo y un rótulo que tapaba la inspección de una bajante.

`verify:package` sigue comparando el manifiesto histórico D34: reporta diferencias en los archivos editados desde esa entrega. Ese resultado no valida una revisión nueva ni implica que los modelos originales estén dañados; las pruebas de activos comprueban las referencias serializadas y los formatos de las fuentes conservadas. No se reescribió el manifiesto histórico para ocultar esas diferencias.
