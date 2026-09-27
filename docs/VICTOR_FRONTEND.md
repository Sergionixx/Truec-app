# Frontend de Victor en la rama actual

La interfaz React proviene de `origin/Victor`, commit `0ef41f4`. Se conservan sus pantallas de login/registro, catálogo, detalle, trueque, subastas y perfil. Sobre ellas se mantienen los arreglos de permisos, validaciones, selección del producto al proponer trueque, cierre de subastas y foco de los diálogos.

El APK abre `WebMarketplaceActivity`. Esta actividad carga el resultado de Vite desde los assets locales; no reemplaza el frontend por pantallas Compose. Los cambios visuales se realizan en `src/App.tsx`, `src/components` y `src/index.css`.

Android Studio ejecuta `bundleVictorFrontend` antes de `preBuild`, por lo que Run incluye el frontend actual. Requiere Node.js disponible y dependencias instaladas con `npm ci` en la raíz. La compilación manual del frontend Android es `npm run build:native`.

El puente `src/native/bridge.ts` envía las solicitudes `/api/` a `WebMarketplace`, que valida las operaciones y las conserva con Room en `victor_marketplace.db`. La implementación web sigue usando la API Node mediante el mismo frontend. Las fotos de ejemplo se incluyen en el APK. La barra de demostración y el marco de dispositivo no se renderizan.

Esta entrega Android es híbrida (React en WebView y Room en Kotlin). El marketplace Compose anterior y su base `truec.db` se conservan, pero no son la pantalla inicial ni comparten automáticamente sus datos con el nuevo frontend.

Pruebas relevantes:

- `VictorWebTest`: registro, duplicados, permisos, importes, persistencia y pujas.
- `VictorFrontendUiTest`: carga del frontend React, login real mediante el puente, catálogo y fotos locales.
- `npm test`: API web y reglas de autorización existentes.
