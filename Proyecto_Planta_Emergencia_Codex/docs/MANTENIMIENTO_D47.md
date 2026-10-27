# D47 · acceso, instrumentos y observaciones comprensibles

## Cambio de filtro con escalera

La escalera amarilla espera plegada junto al frente izquierdo del grupo. En la sexta actividad, acércate y pulsa **E** para colocarla en su posición de servicio. La cubierta acústica debe estar retirada y el lugar de colocación despejado. Entra por el peldaño más bajo y sube con **WASD**; la altura de la cámara sigue tres peldaños de 25 cm y la plataforma de trabajo. El mouse conserva su control habitual.

Desde la plataforma libera los dos sujetadores manteniendo E, retira la tapa, instala el elemento, repón la tapa y cierra ambos sujetadores. La herramienta del paso se prepara en el guiado si la recogiste. Para terminar, desciende por los peldaños, vuelve al piso y pulsa E sobre la escalera para retirarla. No se acepta trabajar el filtro desde el piso ni retirar la escalera mientras está ocupada. Los límites laterales impiden salir de la plataforma por los costados. Cambiar de vista conserva la elevación y la escalera colocada al regresar.

## Un solo multímetro

El instrumento en uso es un único grupo de escena. Conectar la primera punta lo mueve desde las manos a su apoyo junto a la batería; no genera otro instrumento. La pantalla permanece sin lectura hasta conectar las dos puntas. E registra en guiado; Q conserva el registro en evaluación. Al registrar se retiran las puntas y se recupera el mismo instrumento. Las miniaturas de la bolsa son parte de su selector de inventario.

## Reconocer el enlace de protección a tierra

La novena actividad enseña tres elementos visibles, delante del bastidor:

1. **Unión PE al chasis:** iluminar tornillo y terminal para observar corrosión o separación visible.
2. **Aislamiento verde/amarillo:** seguir el tramo para observar cortes o cobre expuesto fuera de sus terminales.
3. **Terminal en barra PE:** observar corrosión o piezas separadas en la conexión de cobre.

La linterna encendida y una pulsación mantenida de E registran cada observación. El siguiente elemento se señala al terminar el anterior. Si dejaste las manos libres, el guiado prepara la linterna que ya habías recogido; una herramienta no recogida dirige la flecha y el marcador a la bolsa, que se abre con B o clic en su marcador.

PE es el conductor de protección que enlaza las partes metálicas con el sistema de tierra y participa en la trayectoria de una falla para facilitar la actuación de las protecciones. Mirarlo no verifica firmeza, continuidad, resistencia ni cumplimiento normativo.

## Avisos y espacio de trabajo

Se eliminó el margen reservado para una etiqueta oculta, se retiró la altura limitada con desplazamiento y se abreviaron los avisos de alcance. El aviso crece según su texto encima de los controles, sin superponerse con ellos. En móvil, movimiento y herramientas comparten una fila. La instrucción próxima al cursor deja de repetirse en el aviso de gabinetes.

## Validación

`npm test` comprueba construcción, datos, órdenes y rutas existentes. `test:maintenance` reproduce el ciclo completo de cámara/input: varilla, radiador, colocación, subida y bajada de la escalera, cierre del filtro, identidad del multímetro, recuperación de herramienta y las tres observaciones PE visibles. `test:browser` recorre las doce actividades y conserva el recorrido de escaleras entre planta y subestación, gabinetes y prueba de transferencia.

La revisión visual y de medidas del aviso cubre ratón y pantalla táctil, tamaños 1366×768, 1024×600, 390×844 y 844×390. No hay barra de desplazamiento, texto recortado ni superposición del aviso con la barra de controles. Se mantienen las pruebas de cámara, presentación, anatomía, subestación, unifilar y seguridad.

La escalera y las manos siguen siendo geometría y colisiones educativas: no simulan balance, carga admisible, contacto físico completo ni un procedimiento certificado. La comprobación del cable es visual y la lectura eléctrica pertenece al escenario de entrenamiento.
