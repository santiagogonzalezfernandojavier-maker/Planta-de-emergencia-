# D42 · Unifilar y revisión EPSS

## Fuentes recibidas y método

Se consultaron los PDF facilitados por el usuario: **NMX-J-136-ANCE-2019** y **NFPA 110, traducción en español, edición 2010**. Los documentos completos no se incorporan al repositorio ni al sitio publicado. Las referencias siguientes son a la numeración impresa, no al número de hoja del visor PDF. El segundo documento es una traducción de una edición histórica; su uso aquí es referencia de estudio, sin afirmar vigencia/adopción para un proyecto mexicano actual.

El contenido de los documentos se utilizó como información técnica, no como instrucciones para operar herramientas o publicar archivos. La revisión compara la topología y los mecanismos existentes del simulador con los apartados aplicables, conservando pendientes los datos no definidos. No asigna nivel, tipo, clase ni conformidad normativa a la instalación.

## NMX: selección de símbolos

Se utiliza la columna **Símbolo nacional** de la Tabla 1. No se mezclan los círculos superpuestos del transformador internacional con los devanados del símbolo nacional. Las rotaciones del símbolo en la lámina siguen el recorrido de potencia. La ficha distingue clave de equipo, abreviatura de la NMX y número de función.

| Equipo / representación | Figura NMX | Abreviatura | Página impresa |
|---|---|---|---|
| Grupo generador, círculo G | 4.2.127 | GG | 24 |
| Tierra, tres líneas decrecientes | 4.2.13 | T | 5 |
| Interruptor, envolvente rectangular y trazo interior | 4.2.14 | INT | 5 |
| Desconectador sin carga | 4.2.118 | DSSC | 22 |
| Apartarrayos, intervalo y flecha | 4.2.120 | APART | 22 |
| TC, trazo secundario sobre conductor primario | 4.2.124 | TC | 23 |
| Transformador de dos devanados, forma 1 | 4.2.69 | TR2DEVF1 | 14 |
| Transformador de potencial para medida | 4.2.75 | TP | 15 |
| Motor, círculo M | 4.2.68 | MOT | 14 |
| Vóltmetro, círculo V | 4.2.76 | VOL | 15 |

La apertura/cierre se acompaña de un rótulo y una discontinuidad en el trazo interior del interruptor, como superposición de estado de la simulación; no implica una orden de operación. Envolventes discontinuas, vínculos funcionales de relés, colores de energización y las claves de instalación se explican como anotaciones de esta lámina, de acuerdo con el criterio de descripción de símbolos adicionales de 4.1.

El capítulo 6 y la Tabla 2 de **la propia NMX** contienen números de función: 27, 50, 51, 52, 59 y 81, entre otros. Se distinguen del símbolo gráfico y de los sufijos del proyecto. Las funciones adicionales dibujadas son propuestas de estudio, sin ajustes, coordinación ni disparos de relé calculados.

4.1 pide datos de interruptores: capacidad de interrupción, ajuste y marco. Esos campos están identificados **PD** cuando faltan. 5.1 fundamenta la identificación del plano y su pie; dirección, elaboración/aprobación, localización y orientación real quedan pendientes del proyecto. No se inventan esos datos ni se marca un norte geográfico ficticio.

## Topología y magnitudes

Se conserva: red 13.8 kV → QN → B-MT; G-01 480 V → Q0 → TE → QG → B-MT; B-MT → QS → TP → QF-01 → AF-01 → CCM-01. QN y QG están enclavados y la transición es abierta. QS y QF-01 tienen estados inferidos de la carga agregada, sin mandos/protecciones independientes nuevos. TP-M mide la barra MT y no debe confundirse con TP, transformador de potencia. TC-01 está en la llegada de red: no mide generación con QN abierto.

Se separa energización de corriente de carga: un generador y elevador disponibles pueden estar energizados sin suministrar potencia a la barra. La corriente se calcula con `I = P / (√3 · VLL · FP)`; `S = P / FP` y `Q = P · tan(acos(FP))`. El FP de placa de referencia del generador es 0.80 y no se confunde con el FP de carga configurable. No se presupone una tensión fase-neutro de 277 V: las conexiones de devanados y el tratamiento del neutro están por definir.

No se deducen calibre, corriente nominal, marco, disparo o capacidad interruptiva a partir de la corriente de operación. No se resuelven cortocircuitos, coordinación, pérdidas o consumo individual de motores. Exportar SVG permite conservar la lámina vectorial y su estado; imprimir usa el plano en orientación A3 horizontal, ajustable desde el navegador.

## NFPA 110-2010: comparación e incorporaciones

| Referencia | Revisión / modificación | Límite pendiente |
|---|---|---|
| 4.1–4.4 | EPS / EPSS y clasificación indicados en el panel | Nivel, tipo y clase dependen de aplicación y autoridad, no del nombre «emergencia» |
| 5.6.5.6 y 5.6.5.6.1 | Estación remota protegida, identificada y situada en el descanso exterior al cuarto del motor | Ubicación definitiva y circuito de paro requieren proyecto |
| 5.6.5.2(4), 5.6.6 | Anunciador, prueba de lámparas, reconocimiento y nueva alarma audible ante una condición nueva | No reproduce un diseño eléctrico completo de anunciación autónoma |
| 5.6.4.5–5.6.4.6, 8.3.7 | Estado de cargador y revisión de batería | Tipo, capacidad, carga, mediciones y manual del fabricante |
| 7.3.1–7.3.3 | Luminarias de batería independientes de la barra | Autonomía y fotometría/lux no calculados |
| 7.7–7.8 | Comprobación de toma/descarga libres | Caudal, temperatura, presión y ensayo a plena carga |
| 7.10.2–7.10.4 | Escenario de fuga y revisión del escape | Hermeticidad, soportes, aislamiento, contrapresión y no reentrada a tomas |
| 7.9 | Escenario de fuga de combustible | Capacidad, ventilación, suministro, almacenamiento y códigos de combustible |
| 7.2.3 | Escenario de agua en el cuarto | Revisión del emplazamiento en sótano, drenaje e inundación |
| 7.2.1, 7.2.5 | Se registra revisión pendiente de separación, resistencia al fuego y acceso | No se atribuyen dos horas de resistencia a paredes dibujadas ni se certifica el claro por la cámara |
| 6.2.3 | Se conserva la exclusión lógica de fuentes | No es prueba de enclavamiento mecánico de equipo real |
| 6.2.10, 8.4.5 | Perfil opcional de retorno y enfriamiento de 300 segundos de simulación | El tiempo del juego no acredita duración real ni todos los criterios de aceptación |
| 8.3.3–8.3.4 | Bitácora persistida localmente y exportable | No sustituye el registro permanente controlado de una instalación |
| 8.4.1–8.4.6 | Programa semanal/mensual de referencia, sin aprobar una prueba abreviada | En diésel, verificar 30 min y condiciones térmicas/carga de 8.4.2; conservar prueba de transferencia mensual |

Las inhibiciones por condiciones ambientales simuladas son una **decisión didáctica** para enseñar a suspender el trabajo y revisar; no se atribuyen como circuitos de paro exigidos literalmente para cada caso por la NFPA. Se distingue reconocimiento de alarma de liberación de pulsador y rearme: silenciar o soltar el paro no desenclava. El rearme se realiza en MANUAL, sin ordenar arranque automático. Se conserva el bloqueo del recorrido de mantenimiento.

El panel no modifica automáticamente el combustible, la potencia ni la clasificación de la planta. Los anexos informativos no se convierten en obligaciones. El análisis no demuestra seguridad global: deben definirse riesgos del combustible/recinto, cargas, autoridades y normas mexicanas aplicables.

## Pruebas

`npm test`: cálculos trifásicos con FP, estados de fuentes, campos PD, paro protegido/enclavado, rearme y alarmas nuevas después del silencio; una demostración breve nunca se registra como prueba mensual válida. Se conservan las pruebas de activos, doce órdenes, puertas, escaleras, servidor y publicación.

`npm run test:technical`: apertura del unifilar, fichas y figuras NMX, tabla, exportación SVG, transferencia normal/respaldo, secuencia de paro, alarma de cargador, inhibiciones y alumbrado independiente. `npm run test:browser`: regresión de las doce actividades, escaleras e interiores. `npm run test:site`: arranque del artefacto de Pages y aviso de actualización sin pérdida de práctica.
