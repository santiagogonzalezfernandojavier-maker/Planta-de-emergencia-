# Mantenimiento D36

## Cómo jugar

La tarjeta de siguiente acción permanece visible durante el recorrido. Pulsa Q para revisar la orden, confirma las condiciones previas y elige la intervención adecuada al hallazgo. Pulsa Preparar esta orden. Cierra Q, toma de la bolsa la herramienta indicada y actúa con E sobre el componente. Cuando termina una actividad, Q muestra el resultado y permite continuar.

Las condiciones de la orden son datos del escenario y confirmaciones del jugador, no sensores de una instalación real. Una acción fuera de alcance, con herramienta incorrecta o sin preparar la orden se rechaza.

## Las doce órdenes

| Orden | Interacción y evidencia |
|---|---|
| 1. Recibir orden | Identificar G-01, alcance y aviso a operación; registrar con carpeta en el control. |
| 2. Impedir arranque | Poner selector fuera de servicio con la mano y después aplicar candado y etiqueta. |
| 3. Separar arranque | Abrir seccionador; reconocer que los bornes conservan tensión. |
| 4. Aceite | Extraer, limpiar, reinsertar y extraer varilla; registrar nivel y restituirla. |
| 5. Radiador | Inspeccionar ocho sectores con linterna antes de retirar polvo seco con cepillo suave. |
| 6. Admisión | Verificar repuesto; liberar sujetadores, retirar tapa, instalar, reponer tapa y cerrar ambos sujetadores. |
| 7. Bornes | Observar ambos con linterna; documentar depósitos y correctiva pendiente. La corrosión permanece visible. |
| 8. Batería | Preparar medición en V DC, colocar puntas y registrar 12.6 V del escenario; no prueba capacidad de arranque. |
| 9. Protección | Revisar tres puntos visualmente; no se registra continuidad ni resistencia de tierra. |
| 10. Área | Recoger físicamente paño y llave y confirmar cierre de tapas y área despejada. |
| 11. Entrega | Restituir seccionador y después retirar el candado propio; entregar hallazgos a operación. |
| 12. Prueba | Confirmar autorización; observar la secuencia automática de arranque, estabilización y transferencia y registrar el resultado. |

## Límites del escenario

Se trata de una representación educativa, sin aprobación normativa ni aptitud para autorizar trabajos reales. El selector y seccionador representados no constituyen un procedimiento completo de bloqueo ni verifican ausencia de tensión de todas las fuentes. No se introducen intervalos, pares de apriete o valores de aceptación de un fabricante desconocido. La limpieza de radiador es superficial en equipo frío y detenido; no se abre el circuito de refrigerante. La corrosión de batería se reporta para intervención específica, no se declara reparada. La orden final autoriza una prueba virtual supervisada con ese hallazgo registrado y no certifica disponibilidad del equipo real.

## Verificación

`npm test` comprueba activos y validación de las doce órdenes. `npm run test:browser` comprueba controles, navegación, CCM y un recorrido completo de las doce órdenes con herramientas, desplazamiento, condiciones previas, cierres y bitácora. Comprueba también que el filtro no se acepte con tapa o sujetador abiertos y que se rechace cepillar los bornes energizados. Las confirmaciones visuales y pruebas automáticas no sustituyen la revisión de los procedimientos por un responsable técnico.
