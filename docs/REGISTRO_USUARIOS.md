# Entrega: registro de usuarios con Room

Fecha: 11 de septiembre de 2026.

## Archivos a entregar

- `output/entrega/Truec-app-proyecto.zip`: proyecto completo, incluido Android, prototipo web conservado, wrapper Gradle, esquemas de Room y evidencias. Excluye todas las carpetas `build`, `.gradle`, `.kotlin`, `node_modules`, `.git`, `dist`, temporales, instaladores antiguos y configuración local del equipo.
- `output/pdf/Registro-usuarios-Room.pdf`: requisitos, capturas del código y ejecución en dispositivo físico.
- Opcional: `output/entrega/Truec-app-registro.apk`, instalador de depuración listo para Android 7/API 24 o superior.

## Correspondencia con los requisitos

Rutas Kotlin relativas a `android-app/app/src/main/java/com/truecapp/mobile/`:

| Requisito | Implementación |
|---|---|
| Modelo `User` | `data/registration/User.kt`: entidad `users`, clave `id: Long` autogenerada y cuatro campos `String` |
| Inserción y consultas | `data/registration/UserDao.kt`: `insert`, `getAll`, `getById`, `count`, todas `suspend` |
| Base local Singleton | `data/registration/AppDatabase.kt`: `RoomDatabase`, `@Database`, instancia `@Volatile`, `synchronized`, contexto de aplicación |
| Formulario con controles de texto | `res/layout/activity_main.xml`, relativo a `android-app/app/src/main/`: etiquetas, cuatro `EditText`, teclado telefónico y botón Guardar |
| Activity y corrutinas | `MainActivity.kt`: `trim`, errores individuales, interrupción por campos vacíos, `lifecycleScope.launch`, `withContext(Dispatchers.IO)` |
| Éxito después de guardar | Mensaje con el ID retornado por `insert`; limpieza de campos y actualización del contador |

La base se llama `registro_usuarios.db`, versión 1. Su esquema exportado está en `android-app/app/schemas/com.truecapp.mobile.data.registration.AppDatabase/1.json`. No se usa `allowMainThreadQueries` ni recreación destructiva. El teléfono es texto para conservar prefijos y ceros iniciales. La consigna exige campos no vacíos; no se impone una longitud ni un formato regional de teléfono.

## Ejecutar

1. Descomprimir el ZIP y abrir la carpeta `android-app` en Android Studio.
2. Usar JDK 21 (mínimo 17) y Android SDK 36. Completar Gradle Sync con conexión para descargar dependencias.
3. Seleccionar dispositivo/emulador API 24 o superior y ejecutar `app`.
4. La pantalla inicial es **Registro de usuarios**. No requiere iniciar sesión ni ejecutar la API web.
5. Dejar campos vacíos y pulsar Guardar. Después usar datos ficticios: Ana / Prueba / Calle Ejemplo 123 / 5512345678.
6. Guardar y observar el mensaje de éxito con ID. Cerrar completamente y abrir de nuevo: el contador conserva el registro.

El catálogo anterior sigue disponible desde el botón inferior. `DemoActivity` conserva Compose y utiliza otra base, `truec.db`. Registrar un usuario no crea una cuenta de acceso ni sincroniza dispositivos.

## Verificación realizada

- `:app:assembleDebug`: correcto.
- `:app:lintDebug`: 0 errores, 7 advertencias informativas sobre versiones de dependencias.
- `UserRegistrationTest`: 3 pruebas correctas en Samsung SM-A115M, Android 12/API 31. Se prueban IDs autogenerados, consultas, persistencia al reabrir, Singleton y rechazo individual de vacío/espacios en los cuatro campos sin insertar.
- Recorrido manual automatizado en el mismo teléfono: validación sin inserción; registro de ejemplo con ID 1; contador 1; reinicio en frío y contador 1.
- Las capturas del código provienen de un visor de archivos locales en el navegador; muestran el contenido real completo, numerado. Las capturas de la aplicación se obtuvieron del dispositivo mediante ADB y no son maquetas.

Comandos desde `android-app`:

```powershell
./gradlew.bat :app:assembleDebug :app:lintDebug
./gradlew.bat :app:connectedDebugAndroidTest '-Pandroid.testInstrumentationRunnerArguments.class=com.truecapp.mobile.UserRegistrationTest'
```

Ejecutar pruebas instrumentadas en un emulador o dispositivo dedicado: el proceso de Gradle puede desinstalar la app al finalizar. Para uso normal, instalar el APK de entrega después de las pruebas.

Evidencias originales: `docs/registro/evidencias`. Se incluyen el informe XML de pruebas y el informe de lint. Las imágenes `01-validacion`, `02-formulario`, `03-exito` y `04-persistencia` documentan la ejecución en orden. Los datos visibles son ficticios.
