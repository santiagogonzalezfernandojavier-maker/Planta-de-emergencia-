# Instrucciones para trabajar en este proyecto

Este es el simulador de planta de emergencia, subestación y fábrica. No es el simulador del Metro ni una presentación escolar. La base es D34.

- Primero lee README.md, docs/ESTADO_DEL_PROYECTO.md y docs/ASSET_INVENTORY.json.
- Trabaja sobre src/ y assets/. `index.html`, `build/app.js` y `dist/ABRIR_SIMULADOR.html` se generan con `npm run build`.
- Los archivos de src/order.json se concatenan en ese orden y comparten variables globales. Evita convertir un fragmento en módulo ES sin resolver sus dependencias.
- Preserva paisaje, fábrica, CCM interior, conexiones aéreas, flujo de energía, día/noche, transformadores, TC/TP, interruptores, protecciones, presentación/despiece, bolsa del piso y las doce prácticas. El usuario ha reportado pérdida de características en rediseños previos.
- Los operarios se cargan desde assets/personnel/scene-data.json.gz. No reemplaces cadenas base64 globalmente. Para cambiar el activo usa una conversión explícita y verifica sus referencias de geometría/material.
- Mantén una sola animación principal de escena; hay animaciones separadas ya existentes para la presentación. Evita añadir RAF, luces o recorridos de todos los objetos innecesarios.
- No agrupar puertas, ejes, ventilador, pistones, selectores, puntos interactivos o geometría de prácticas como piezas inmóviles. El CCM usa userData.noCompact y puertas con pivotes.
- Mantén controles y mensajes en español, discretos y legibles. No cambies las asignaciones de teclas de forma silenciosa; actualiza ayuda y pruebas.
- No atribuyas certificación normativa al simulador. La apertura del CCM es una inspección didáctica, no una verificación real de ausencia de tensión.
- Para cambios de código ejecuta npm test. Para cambios de cámara, interacción o geometría ejecuta también npm run test:browser cuando el navegador esté instalado y revisa el resultado visual. No copies rutas absolutas de la sesión original a código nuevo.
- Antes de grandes cambios conserva un punto de retorno en Git. Entrega qué cambió, pruebas y límites pendientes. No publiques o subas a cuentas externas sin autorización del usuario.
