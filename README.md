# Truec-app 1.3.0

Proyecto académico integrado: Android con Room y una aplicación web con API local. La rama `codex/rubrica-integrada` combina Victor con el registro y el marketplace Android que estaban pendientes en main.

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

MainActivity contiene el formulario nombre, apellidos, dirección y teléfono. Valida campos vacíos y espacios; inserta mediante lifecycleScope y Dispatchers.IO. User, UserDao y AppDatabase implementan la entidad, las consultas y el singleton Room. Desde el formulario se abre DemoActivity, con catálogo, favoritos, inventario, edición, propuestas y subastas persistentes en otra base Room local.

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

Las 18 pruebas Android y un recorrido adicional pasaron en el dispositivo conectado. La suite Node verifica permisos, validaciones, concurrencia, persistencia y errores del cliente. Ver `DEFENSA_Y_DOCUMENTACION_FINAL.md` para alcance y límites de accesibilidad.
