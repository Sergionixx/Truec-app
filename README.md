# Truec-app 1.3.0

Proyecto académico integrado: Android nativo con Jetpack Compose y Room, y una aplicación web con API local. La versión Android 1.4.0 integra la interfaz fotográfica de Victor en el marketplace nativo.

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

La aplicación abre DemoActivity, el marketplace nativo con catálogo fotográfico adaptable, búsqueda, filtros de precio/condición/trueque, favoritos, inventario, edición, propuestas y subastas persistentes. Las fotos de ejemplo proceden de Victor y se incluyen en el APK; funcionan sin conexión desde la primera apertura. Se pueden elegir fotos con el selector del sistema Android (sin permisos generales de galería), seleccionar ejemplos o usar enlaces HTTPS. El acceso a las fotos seleccionadas se conserva al reiniciar la app. Si se elimina o revoca el acceso a una foto, se muestra un marcador de imagen; los enlaces remotos requieren conexión.

Room migra `truec.db` de la versión 1 a la 2 para guardar la imagen de cada producto, conservando publicaciones, favoritos, propuestas y pujas. No borra ni restablece los datos al actualizar el APK.

Desde el login se accede a «Registro de usuarios». MainActivity conserva el formulario nombre, apellidos, dirección y teléfono. Valida campos vacíos y espacios; inserta mediante lifecycleScope y Dispatchers.IO. User, UserDao y AppDatabase implementan la entidad, las consultas y el singleton Room. Este registro académico sigue separado de la cuenta demo del marketplace.

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
