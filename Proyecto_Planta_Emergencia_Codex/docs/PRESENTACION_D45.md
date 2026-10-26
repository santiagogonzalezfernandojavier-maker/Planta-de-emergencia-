# D45 · anatomía, linterna y presentación guiada

## Anatomía con cubierta

**Anatomía de la planta** abre el equipo cubierto. El botón verde **Retirar cubierta**, junto a Restablecer vista y Rotación, descubre el conjunto. **Colocar cubierta** lo vuelve a cerrar. No hace falta desplazarse hasta el final del panel lateral. La cubierta usa el modelo de servicio con techo, ventilaciones, juntas, rótulos, bisagras y paso del escape; la copia de presentación tiene sus paneles cerrados y no mueve los del recorrido.

Girar y acercarse mantienen sus controles. Las nueve etiquetas abren los sistemas y sus subpiezas; el botón de cubierta también permite regresar desde un despiece al equipo cubierto. El control se adapta al visor móvil.

## Tablero G-01 / Control

El tablero señalado por el usuario permanece fijo. E ya no abre esa puerta y V no retira su cubierta interior. No aparece el aviso de apertura al apuntar al tablero. Se conservan pantalla, selector, candado personal y mandos requeridos por las doce actividades. Transferencia, CCM y gabinetes exteriores conservan sus propias puertas y cubiertas. La regla se mantiene al reconstruir la configuración del equipo.

## Linterna y cámara

Con la linterna en la mano aparece **Encender / Apagar linterna [L]**. La lente y el haz responden al mismo estado. Pausar, abrir el cuaderno o cambiar de herramienta suspende la iluminación. Una inspección con linterna apagada no registra avance.

El objetivo del haz usa la primera superficie opaca sobre el rayo central de la cámara, omitiendo manos, marcadores y proxies de interacción. La linterna física se orienta hacia ese punto. Se conserva una sola luz de inspección sin sombras nuevas; la consulta se reutiliza mientras la cámara no cambia y se actualiza con un intervalo máximo de 100 ms. La intensidad se limita según la distancia para conservar detalle en superficies próximas; no representa un cálculo fotométrico.

Para completar una revisión, acércate al círculo, enciende la linterna y mantén E o clic hasta completar el progreso. El haz por sí solo no guarda una inspección. El texto de la tarea muestra si falta encenderla.

En el patio, F o un clic sobre un espacio libre captura el mouse y permite girar sin mantener un botón. Esc libera el cursor. Las piezas interactivas conservan su clic. Si el navegador rechaza la captura, siguen disponibles botón derecho + arrastrar y flechas; no se puede capturar el mouse sin un gesto autorizado por el navegador.

## Recorrido de presentación

**Recorrido de presentación** está en el menú inicial y en **Zonas**. Tiene nueve etapas:

1. Instalación completa y dos fuentes.
2. Cubierta, anatomía y despieces.
3. Falla de red, arranque y transferencia reales dentro del modelo.
4. Unifilar técnico y ficha de QG.
5. Manos, linterna y una observación de muestra.
6. Recorrido a pie por la subestación y captura del mouse.
7. Apartarrayos, pararrayos y actividades de subestación.
8. CCM y consulta de Seguridad EPSS.
9. Acceso a las prácticas.

**Anterior**, **Siguiente** y la acción principal permiten presentar a ritmo propio. **Reproducir** ejecuta las demostraciones y cambia de etapa; la transferencia espera a que el modelo conecte el respaldo o declare una alarma. La captura del mouse requiere pulsar su botón y no se fuerza en reproducción automática. La rotación y el acercamiento siguen disponibles.

La presentación conserva el estado de la sesión al entrar y lo recupera al terminar. Suspende las prácticas; la observación de muestra no completa actividades, no otorga XP ni escribe en sus bitácoras. El acceso visual al radiador de la muestra se retira temporalmente y se restituye al salir. Reutiliza el ciclo principal y el ciclo ya existente del visor de anatomía. No añade un ciclo de animación de escena.

## Verificación y alcance

`npm test`, `npm run test:player` y `npm run test:browser` verifican la aplicación, cubierta, móvil, flujo de presentación, haz central, encendido, mouse, estado recuperado y doce actividades. `test:substation`, `test:technical` y `test:site` cubren los recorridos y vistas relacionados. Los controles y las demostraciones son didácticos; no sustituyen procedimientos de campo ni cálculos de iluminación o ingeniería.
