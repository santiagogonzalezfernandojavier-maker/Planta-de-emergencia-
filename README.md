# Planta de emergencia · simulador D41

El proyecto editable está en `Proyecto_Planta_Emergencia_Codex/`. El ZIP original D34 se conserva como respaldo.

## Inicio y actualizaciones automáticas en Codespaces

La configuración `.devcontainer` inicia el simulador al arrancar Codespaces, reenvía el puerto 4173 y solicita abrirlo en el navegador. El supervisor consulta la rama actual de GitHub cada 30 segundos y aplica únicamente avances directos con el checkout limpio. Conserva cambios locales, archivos nuevos y commits divergentes, sin resetear, guardar en stash ni cambiar de rama. En esos casos la actualización queda pendiente en el registro.

El servidor reconstruye los archivos de ejecución al detectar fuentes nuevas. Al regresar a la pestaña se recarga si no hay una práctica en curso; durante una práctica aparece un aviso con botón para actualizar. Las sesiones del simulador no se guardan al recargar. Codespaces debe estar encendido y tener acceso a GitHub.

Para activar esta función en un Codespace que ya estaba abierto, detén una vez el servidor anterior con Ctrl+C y ejecuta desde la raíz del repositorio:

```bash
git pull --ff-only origin codex/simulador-d35
bash .devcontainer/start.sh
```

Después ejecuta **Codespaces: Rebuild Container** desde la paleta de comandos de VS Code para que GitHub cargue la nueva configuración de inicio y puerto en los próximos arranques. Las actualizaciones dentro de la sesión actual ya funcionan con `start.sh`.

El registro queda en `Proyecto_Planta_Emergencia_Codex/.runtime/codespaces.log`. La carpeta está ignorada por Git. La imagen incluye Node 22; las pruebas de navegador requieren instalar Chromium aparte cuando se quieran ejecutar en ese Codespace. La publicación de un sitio web independiente es una configuración distinta.

## Ejecutar en Codespaces

Se requiere Node.js 20 o superior.

```bash
cd Proyecto_Planta_Emergencia_Codex
npm ci
npm start
```

En la pestaña **Puertos** añade el puerto **4173** y elige **Abrir en el navegador**. Deja la terminal funcionando. La compilación genera los archivos de ejecución automáticamente; no hace falta extraer el ZIP.

Pulsa **Jugar** o **F** para capturar el mouse. Usa **WASD** para moverte, **Shift** para acelerar, **C** para agacharte, **E** para interactuar, **Q** para ver el objetivo, **B** para la bolsa y **Esc** para liberar el cursor y pausar. **F1** muestra la ayuda y el ajuste de sensibilidad.

## Validar

```bash
cd Proyecto_Planta_Emergencia_Codex
npm test
npx playwright install chromium
npm run test:browser
```

Si ya existe Chromium, usa `CHROMIUM_PATH=/usr/bin/chromium npm run test:browser`.

Las mejoras de los operarios afectan a su presentación en el simulador. Se conservan los originales Blender/GLB y las doce prácticas; los personajes mantienen poses estáticas.

El manifiesto SHA256 incluido describe la entrega D34 original y no la revisión D36. Consulta el README del proyecto para los detalles y sus límites didácticos.

Las órdenes D36 explican dónde ir, qué observar, qué herramienta utilizar y qué evidencia cierra cada actividad. Consulta `Proyecto_Planta_Emergencia_Codex/docs/MANTENIMIENTO_D36.md`.

D37 permite subir y bajar caminando por la escalera entre la planta y la subestación, conservando la orden de mantenimiento. La escalera interior del CCM continúa separada de este recorrido.

D38 añade llaves de servicio (L), puertas articuladas (E), cubiertas interiores desmontables (V) y compartimentos diferenciados del CCM. Las llaves se recogen junto a la bolsa del piso.

D41 añade manos animadas, haz real de linterna, cepillado progresivo y resultados visibles. Retira las llaves de gabinetes; se mantienen E para puertas y V para cubiertas. El modo guiado conserva: recogida única de equipo, herramienta automática por paso, pieza identificada, E para actuar y guardar lecturas, avance automático entre actividades. Q amplía la explicación. Evaluación conserva sus comprobaciones.
