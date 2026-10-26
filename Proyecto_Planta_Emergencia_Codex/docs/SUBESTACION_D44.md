# Subestación D44 · protección e inspección

La revisión completa tres bancos de apartarrayos (nueve unidades) y cuatro mástiles de captación. Las doce prácticas de la planta se conservan; la subestación incorpora otras tres actividades con bitácora propia.

## Equipos representados

- **AP-01:** tres apartarrayos conectados en derivación desde las fases de la llegada MT.
- **AP-TE:** tres apartarrayos junto a las boquillas MT del transformador elevador.
- **AP-TP:** tres apartarrayos junto a las boquillas MT del transformador principal.
- **PC-01 a PC-04:** puntas captoras sobre mástiles de celosía, con hilo de guarda perimetral, bajantes de cobre y uniones de prueba. PC identifica los elementos de captación; PR-01 sigue siendo el gabinete de protección existente.

Cada apartarrayos tiene cuerpo con faldas, bridas, pernos, borne de fase, soporte y bajante. Las derivaciones de tierra terminan en la retícula común a cota 5.875 m. Las bases de los mástiles tienen colisión; no se atraviesan al caminar. Las dos nuevas derivaciones MT figuran también en DU-01 y usan la referencia gráfica de apartarrayos NMX-J-136-ANCE-2019, figura 4.2.120.

**Protección contra rayos**, a la izquierda del visor, permite acercarse a cada banco o ver el conjunto de captación. La vista de detalle retira temporalmente la cerca para ver el equipo. El recorrido a pie vuelve a mostrarla.

## Recorrido de mantenimiento

En el menú inicial elige **Mantenimiento de subestación**. También está en **Zonas** y en la ficha de protección contra rayos. Lee y confirma el alcance antes de comenzar. El equipo se prepara al pasar de actividad; no exige recoger llaves ni repetir viajes a una bolsa.

1. **Apartarrayos:** observa cuerpos, bornes y bajantes de los tres bancos, seis puntos en total. Apunta al marcador y pulsa E o haz clic. Lee las observaciones y selecciona una conclusión.
2. **Pararrayos y bajantes:** inspecciona las cuatro uniones de prueba. Durante el ejercicio, la pletina de PC-03 queda apartada y deja una separación visible. Debes identificar el hallazgo y solicitar una correctiva; el jugador no la repara en servicio.
3. **Comparación termográfica:** sigue la indicación hasta una posición de observación y apunta a las boquillas de TE y TP. La cámara aparece en las manos y su pantalla muestra la lectura máxima. Datos del ejercicio: TE 31/32/32 °C; TP 34/67/35 °C. Reconoce la diferencia de TP/L2 y registra que requiere ampliar el diagnóstico.

El contador registra cada punto una sola vez. Una conclusión no avanza hasta observar todos los puntos y elegir una respuesta coherente. La flecha, el nombre del equipo y la distancia guían el recorrido. Q abre la guía; Esc cierra el diálogo o pausa el recorrido. WASD, mouse, F, C y Shift mantienen sus asignaciones.

Al terminar puedes descargar **Bitacora_Subestacion_SE01_D44.json**, con observaciones, conclusiones, fechas y errores. Cambiar de vista conserva el avance. Al salir se restituye la representación normal de PC-03; si había una práctica de planta suspendida, regresas a su posición y actividad.

## Alcance técnico

Es inspección exterior didáctica, sin apertura de gabinetes, maniobras, reparación ni medición real de continuidad o resistencia de tierra. Una unión visualmente cerrada no demuestra continuidad. La termografía muestra datos simulados; no calcula temperatura, emisividad, carga, viento ni causa del calentamiento.

Ur/MCOV, capacidad y coordinación de los apartarrayos requieren selección de ingeniería. La cobertura de captación, las distancias eléctricas, la resistividad y las tensiones de paso/contacto no se calculan ni se certifican con esta geometría.

## Validación ejecutable

`npm test` comprueba conexiones, cantidad de equipos y reglas de cierre. `npm run test:substation` recorre los puntos con WASD, usa E, verifica conclusiones, descarga la bitácora y comprueba la recuperación del mantenimiento de planta. `test:player`, `test:browser`, `test:technical` y `test:site` conservan sus comprobaciones de cámara, brazos, doce prácticas, escaleras, unifilar y publicación estática.
