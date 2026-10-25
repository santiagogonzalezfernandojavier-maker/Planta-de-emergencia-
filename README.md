# Planta de emergencia · simulador D43.1

El proyecto editable está en `Proyecto_Planta_Emergencia_Codex/`. El ZIP original D34 se conserva como respaldo.

## Sitio estable y publicación automática (D41.1)

Para jugar sin depender de un Codespace encendido, usa GitHub Pages. Una vez activado, el sitio previsto es:

https://santiagogonzalezfernandojavier-maker.github.io/Planta-de-emergencia-/

**Configuración inicial, una sola vez:** abre Settings → Pages → Build and deployment → Source → GitHub Actions. En Actions abre la ejecución más reciente de **Publicar simulador estable** de la rama `codex/simulador-d35`; si ya falló porque Pages estaba desactivado, pulsa **Re-run all jobs**. El enlace funciona cuando el despliegue termina correctamente; no se considera publicado solo por existir este archivo.

El workflow se ejecuta automáticamente con cada push a `codex/simulador-d35`: construye, ejecuta las pruebas, comprueba en Chromium la página estática bajo la ruta del repositorio y publica. Si falla una comprobación, no despliega esa revisión. El sitio es independiente de Codespaces. Comprueba nuevas versiones al regresar a la pestaña y cada 30 segundos: ofrece actualizar si hay una práctica activa, conservándola hasta que el usuario decida recargar. La caché de GitHub Pages puede retrasar brevemente la disponibilidad de una publicación.

El artefacto contiene solo la aplicación ejecutable y un identificador de versión, no el ZIP, archivos Blender ni el repositorio. Se genera con `npm run site:build` en `Proyecto_Planta_Emergencia_Codex/dist/site/`.

## Inicio y actualizaciones en Codespaces

El puerto 4173 sirve para desarrollo y requiere un Codespace encendido. No puede atender peticiones cuando GitHub suspende el entorno.

El supervisor arranca el servidor inmediatamente, sin `npm ci` y sin esperar a la red. Git consulta la rama actual cada 30 segundos en un proceso separado; solo avanza un checkout limpio, conservando cambios locales y commits divergentes. Las actualizaciones de fuentes se reconstruyen sin detener el servidor. Una compilación inválida conserva la última versión válida y queda registrada. Si el proceso HTTP se cierra, el supervisor lo reinicia. También puede adoptar un `npm start` que ya ocupe el puerto, sin iniciar servidores rivales.

Para incorporar esta configuración a un Codespace anterior, actualiza la rama y ejecuta `.devcontainer/start.sh`; después **Codespaces: Rebuild Container** aplica el arranque automático de los siguientes inicios. No es necesario repetirlo después de cada cambio. Un checkout con modificaciones locales requiere revisión antes de actualizarse: no se fuerza ni se sobrescribe.

El registro queda en `Proyecto_Planta_Emergencia_Codex/.runtime/codespaces.log`; `/__dev/health` informa del proceso y estado de compilación. Pages es la opción para evitar esta dependencia del entorno de desarrollo.

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

D42 añade **Unifilar técnico** (NMX-J-136-ANCE-2019, símbolos nacionales, datos y SVG) y **Seguridad EPSS** (referencia NFPA 110-2010 aportada). Incluye paro remoto protegido, anunciación, alumbrado autónomo, escenarios de inspección y bitácora. [Alcance y referencias](Proyecto_Planta_Emergencia_Codex/docs/UNIFILAR_Y_SEGURIDAD_D42.md).

D43 corrige brazos extensibles, agarres y reinicios de animación; restaura cámara/postura/herramienta al volver de las vistas. Subestación comienza en el acceso peatonal. Se revisaron blancos e indicaciones del radiador, el paso/herramienta y la lectura de resultados.

D43.1 recupera el menú al abrir: cada modalidad empieza tras elegirla. Amplía el descanso al pie de la escalera separando el primer peldaño de la pared; los 36 peldaños y sus colisiones conservan la conexión entre niveles.
