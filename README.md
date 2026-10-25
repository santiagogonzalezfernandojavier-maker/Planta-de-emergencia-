# Planta de emergencia · simulador D36

El proyecto editable está en `Proyecto_Planta_Emergencia_Codex/`. El ZIP original D34 se conserva como respaldo.

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
