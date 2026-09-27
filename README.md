# Truec-app 1.3.0

La interfaz principal es el frontend React + Vite de `Victor` (origen: `0ef41f4`). Los arreglos de validación, permisos, propuestas, subastas y accesibilidad se aplican sobre esa interfaz en la rama actual.

Android muestra el mismo frontend empaquetado en una WebView y guarda sus operaciones localmente mediante Room. Es una app híbrida: las pantallas principales son React, y no una reconstrucción visual en Compose. El botón Run de Android Studio compila Vite automáticamente antes de empaquetar el APK; se requiere Node.js y `npm ci` en la raíz del repositorio.

## Ejecutar la web

Requisitos: Node.js 22.12 o superior y npm.

```sh
npm ci
npm run api
```

En otra terminal:

```sh
npm run dev
```

Abrir http://localhost:8443. El servidor usa 127.0.0.1:3001. Se pueden configurar PORT, API_PORT, API_TARGET y DATA_FILE. `npm run preview` también redirige `/api` después de compilar.

Cuentas ficticias: `demo@truec.app` / `demo123` para enviar propuestas y pujar; `vendedor@truec.app` / `demo123` para gestionar los artículos iniciales y responder propuestas. Los vendedores iniciales representan personajes ficticios administrados por esta segunda cuenta. Las cuentas nuevas administran únicamente sus propias publicaciones.

El servidor conserva datos en `server/runtime/data.json`, fuera del control de versiones. Las contraseñas se derivan con scrypt y las sesiones expiran a las 24 horas. Las escrituras se serializan y se guardan mediante reemplazo de archivo. Es una API académica para ejecución local, no un servicio preparado para Internet. La web no sincroniza datos con Android.

Sin servidor, la web permite consultar cachés de la sesión. Registro, login y modificaciones requieren conexión; nunca se crea una cuenta ficticia para ocultar un rechazo. Favoritos se guardan en el navegador por usuario.

## Android

Abrir `android-app` en Android Studio con JDK 21 y SDK 36. Configurar ANDROID_HOME o `local.properties` con la ruta del SDK.

```sh
cd android-app
./gradlew :app:assembleDebug :app:assembleDebugAndroidTest :app:lintDebug
```

En Windows utilizar `gradlew.bat`. El APK está en `android-app/app/build/outputs/apk/debug/app-debug.apk`. La variante de demostración utiliza `com.truecapp.mobile.demo`, para coexistir con la versión anterior.

La aplicación abre `WebMarketplaceActivity` y ejecuta el frontend de Victor desde los assets del APK. Las llamadas a `/api/` se resuelven mediante un puente Android hacia Room, sin servidor externo. Las imágenes de ejemplo se empaquetan para funcionar sin conexión. La barra de demostración y el marco de teléfono no aparecen en la interfaz. Los cambios de pantallas se realizan en `src/App.tsx` y sus componentes; `npm run build:native` permite generar el paquete manualmente.

El marketplace Compose anterior se conserva en `DemoActivity` para sus pruebas y datos existentes. Su base `truec.db` y la base del frontend `victor_marketplace.db` son independientes; no se transfieren automáticamente los datos previos.

Room migra `truec.db` de la versión 1 a la 2 para guardar la imagen de cada producto, conservando publicaciones, favoritos, propuestas y pujas. No borra ni restablece los datos al actualizar el APK.

El login React permite crear cuentas del marketplace. `MainActivity` conserva el formulario académico separado con nombre, apellidos, dirección y teléfono, pero no se expone como botón de desarrollo en la interfaz principal.

Android funciona sin servidor. Las personas y operaciones del marketplace son ejemplos. No se realizan compras ni pagos reales.

## Verificar y entregar

```sh
npm run typecheck
npm test
npm run build
npm run simulate:release
```

El último comando requiere el APK compilado: copia sus bytes reales y calcula SHA-256. No inventa archivos Android ni firmas. El APK es debug firmado con clave de desarrollo, no un AAB de producción.

La entrega completa está en `output/entrega-final/`: ZIP del código sin compilaciones, APK, PDF técnico, video y SHA256SUMS.txt. `docs/validacion-final/` conserva resultados y capturas. El video combina una grabación real del dispositivo con la secuencia capturada del simulador web de publicación. No se ha publicado la app en Google Play.

La evidencia de la versión 1.3.0 conserva las 18 pruebas Android y el recorrido adicional originales. La validación de la interfaz nativa fotográfica se documenta en `docs/NATIVE_PHOTOS.md`. La suite Node verifica permisos, validaciones, concurrencia, persistencia y errores del cliente. Ver `DEFENSA_Y_DOCUMENTACION_FINAL.md` para alcance y límites de accesibilidad.
