# D46 · pulsación sostenida y varilla de aceite

## Radiador

La cámara de órbita ya no escribe la posición del jugador al comenzar cada fotograma. La cámara de recorrido actualiza su posición, orientación y matrices antes de comprobar la mira, la visibilidad y el avance de una acción mantenida. Esto corrige una diferencia que las pruebas anteriores no detectaban: avanzar `Walk31.frame()` directamente podía completar la inspección, mientras que el ciclo completo `frame()` usaba una cámara temporal diferente y dejaba el contador sin avance.

Mantén **E** apuntando al círculo o mantén el clic en el círculo o su etiqueta. El indicador muestra el porcentaje y el círculo cambia de ámbar a azul al inspeccionarlo; después de cepillar pasa a verde. Los marcadores son botones que aceptan una pulsación sostenida. El área seleccionable coincide con el radio visible del círculo. Soltar detiene el progreso y completar un sector no completa automáticamente el vecino.

Se conserva el requisito de proximidad, visibilidad, herramienta correcta y linterna encendida. La reparación no convierte una pieza oculta en accesible.

## Varilla

Al extraerla, la mano derecha sostiene la argolla y deja visible el extremo de lectura. **E** inicia una pasada del paño con la mano izquierda por el extremo inferior. El aceite desaparece durante la pasada y la varilla permanece extraída. No se limpia la argolla ni se mueve la varilla hacia abajo mientras pasa el paño.

La limpieza dura 0.9 s en la demostración. Pausar cancela la acción pendiente y no limpia la varilla por transcurso de tiempo. Después de limpiarla, apunta al **tubo de la varilla en el motor** y pulsa E para reinsertarla. Una segunda extracción muestra MIN/MAX y el nivel de entrenamiento; la lectura se registra con E en guiado o desde Q en evaluación. Registrar devuelve la varilla a su tubo.

La copia sostenida pertenece a la cámara y conserva las longitudes fijas de los brazos. El modelo instalado queda oculto mientras se sostiene para evitar duplicarlo. Al pausar, salir o reinsertar se restituye la representación correspondiente. Es una animación didáctica, sin simulación de contacto o flexión física de la lámina.

## Pruebas

`npm run test:maintenance` realiza la extracción, limpieza, cancelación, reinserción y lectura. Comprueba que el paño alcance el extremo de lectura y que la argolla no baje durante la limpieza. Revisa también las ocho zonas del radiador con teclado y con pulsación sobre la etiqueta, y luego las cepilla.

La prueba conserva el ciclo completo de la aplicación, incluyendo el control de cámara. Para avanzar con tiempos deterministas solo reemplaza la rasterización, actualizando las matrices de escena y cámara; las capturas utilizan el renderer real. Se conserva `test:browser` para las doce actividades, puertas, escaleras y retorno a las vistas, además de `test:player` para brazos, anatomía y presentación.
