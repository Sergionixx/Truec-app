# Truec-app: registro de usuarios con Room

## Entrega actual: formulario de usuarios

La pantalla inicial implementa la consigna de registro: `User` con `id` autoincrementable, `nombre`, `apellidos`, `direccion` y `telefono`; `UserDao` con inserción y consultas; `AppDatabase` Singleton; formulario XML con `EditText`; y validación/guardado desde `MainActivity` mediante `lifecycleScope` y `Dispatchers.IO`.

Pulsar **Guardar usuario** con campos vacíos o solo espacios muestra errores y no inserta. Completar los cuatro campos guarda el registro y muestra **Usuario registrado con éxito. ID: …**. El contador se consulta de nuevo al abrir la app. El registro no es una cuenta de autenticación y no necesita servidor.

Los archivos de entrega son `output/entrega/Truec-app-proyecto.zip` y `output/pdf/Registro-usuarios-Room.pdf`. La documentación específica y los pasos de reproducción están en [docs/REGISTRO_USUARIOS.md](docs/REGISTRO_USUARIOS.md). El ZIP contiene fuentes y evidencias, sin carpetas `build`, dependencias descargadas ni configuración local de SDK.

El botón **Abrir catálogo Truec-app** lleva a la demostración anterior, ahora en `DemoActivity`. Su base `truec.db` es independiente de `registro_usuarios.db`.

## Catálogo de demostración conservado

Aplicación académica para explorar tecnología, proponer intercambios y participar en una subasta simulada. La versión Android usa **Kotlin, Jetpack Compose y Room**; los datos se guardan en el dispositivo. Funciona sin Internet ni servidor.

## Abrir y ejecutar

1. En Android Studio, abrir la carpeta `android-app`.
2. Configurar **Gradle JDK 21** (JDK 17 también cumple el mínimo del proyecto). La compilación de esta entrega se realiza con JDK 21; evitar Java 8 y JDK 25 con este wrapper.
3. Completar Gradle Sync y tener instalado Android SDK 36.
4. Seleccionar un emulador o teléfono Android 7.0/API 24 o superior y ejecutar `app`.
5. La app abre el formulario de registro. Para acceder al catálogo, pulsar **Abrir catálogo Truec-app** y entrar con `demo@truec.app` y `demo123`; ambos campos vienen completos.

La primera compilación descarga dependencias. Después, el recorrido de la app es local. No ejecutar la API para utilizar Android. Al cerrar por completo la app puede volver a aparecer el acceso demo; productos, propuestas, favoritos y pujas se conservan.

### Compilar desde PowerShell

Desde `android-app`, con `JAVA_HOME` apuntando al JDK 21 y `ANDROID_HOME` al SDK local:

```powershell
./gradlew.bat :app:assembleDebug
```

El APK se genera en `android-app/app/build/outputs/apk/debug/app-debug.apk`. La copia de registro actual se guarda en `output/entrega/Truec-app-registro.apk`. `APK/Truec-app-Room-demo.apk` es una entrega anterior sin el nuevo formulario.

## Funciones disponibles

- Acceso con cuenta de ejemplo y mensajes para datos incorrectos.
- Catálogo con búsqueda, categorías, condición y precio en MXN.
- Detalle del producto seleccionado y perfil del vendedor con reseñas ficticias.
- Publicar y editar un artículo propio con precio decimal, descripción y representación visual según categoría.
- Retirar publicaciones: se borran si no tienen referencias; se archivan si participan en propuestas, que se cancelan cuando estén pendientes.
- Proponer un intercambio con un artículo disponible del inventario. Se rechazan propuestas duplicadas, artículos propios como destino y productos que no aceptan trueque.
- Consultar propuestas enviadas y recibidas; aceptar, rechazar o cancelar según corresponda. Aceptar archiva los dos artículos y cancela otras propuestas pendientes relacionadas.
- Subasta con cuenta regresiva, historial persistente, líder, incrementos rápidos, validación y cierre. El ejemplo dura cinco minutos desde que se inicializa la base; el reloj no se reinicia al navegar.
- Favoritos persistentes, inventario y contadores calculados con los datos guardados.
- Compra simulada con resumen y confirmación; no hay cobros, envíos ni órdenes reales.
- Cierre de sesión y restablecimiento de la demostración con confirmación.

Las cuentas, reputación y operaciones son ficticias. Los cambios de la demo sí se almacenan localmente. No hay comunicación entre usuarios o dispositivos.

## Room y relación con la guía de clase

Se aplica el patrón de `Room Database.pdf` a la app existente. El PDF usa un formulario XML de usuarios; aquí los formularios siguen en Compose y guardan los datos del catálogo y sus operaciones.

| Paso del material | Implementación |
|---|---|
| Dependencias y KSP | Archivos `android-app/build.gradle.kts` y `android-app/app/build.gradle.kts` |
| Entidades `@Entity` | `data/local/Entities.kt` |
| Acceso `@Dao`, `@Insert`, `@Query`, `@Update` | `data/local/TruecDao.kt` |
| Clase `RoomDatabase` | `data/local/TruecDatabase.kt`, base `truec.db`, versión 1 |
| Formulario y botón Guardar | `ui/CatalogScreens.kt`, pantalla `EditorScreen` |
| Corrutinas y conexión a la vista | `ui/TruecViewModel.kt` y `data/repository/TruecRepository.kt` |

Se fijaron **Room 2.7.2 y KSP 2.1.10-1.0.31** para el proyecto con Kotlin 2.1.10. Son un ajuste respecto de Room 2.6.1 del ejemplo; la combinación se valida mediante compilación y pruebas. Referencias: [versiones oficiales de Room](https://developer.android.com/jetpack/androidx/releases/room) y [versión de KSP](https://github.com/google/ksp/releases/tag/2.1.10-1.0.31).

Tablas: `usuarios`, `productos`, `propuestas`, `subastas`, `pujas`, `favoritos` y `demo_metadata`. Esta última registra la inicialización para no repetir los datos de ejemplo. El inventario usa la tabla de productos filtrada por propietario.

Los importes se guardan como enteros en centavos, las fechas como milisegundos y las relaciones usan claves foráneas. Un favorito se identifica por usuario y producto. Las operaciones de aceptación de trueques, puja y restablecimiento son transaccionales.

La instancia de Room se comparte por aplicación. El repositorio consulta una instantánea consistente después de las invalidaciones de las tablas; el ViewModel expone ese estado a Compose. Las operaciones de base de datos son asíncronas. El esquema exportado se conserva en `android-app/app/schemas`; un cambio posterior debe incluir su migración, sin borrar automáticamente datos existentes.

## Estructura Android

```text
android-app/app/src/main/java/com/truecapp/mobile/
  MainActivity.kt
  data/local/
    Entities.kt
    TruecDao.kt
    TruecDatabase.kt
  data/repository/
    TruecRepository.kt
  ui/
    TruecViewModel.kt
    TruecApp.kt
    Components.kt
    CatalogScreens.kt
    TradeScreens.kt
    AuctionProfileScreens.kt
```

## Verificación

La entrega de registro tiene **3 pruebas instrumentadas correctas** y capturas de validación, formulario completo, éxito y persistencia en Samsung SM-A115M con Android 12. Ver [docs/REGISTRO_USUARIOS.md](docs/REGISTRO_USUARIOS.md). Las **15 pruebas del catálogo** y el hash de su APK anterior corresponden al 6 de septiembre; se conservan como antecedente en [docs/VERIFICACION.md](docs/VERIFICACION.md).

Con un emulador o teléfono de pruebas conectado:

```powershell
./gradlew.bat :app:connectedDebugAndroidTest :app:lintDebug
```

`RoomWorkflowTest` usa archivos de base de datos exclusivos de prueba y comprueba persistencia tras cerrar/reabrir, operaciones de productos, relaciones, favoritos únicos, estados de trueques, observación de ediciones y pujas simultáneas o vencidas. `DemoUiTest` inyecta otra base de prueba y recorre los formularios y la navegación, incluida restauración de estado.

Los resultados instrumentados quedan en `android-app/app/build/reports/androidTests/connected/debug/`. Los tests de interfaz generan capturas en el directorio adicional de resultados que Gradle recupera del emulador (`android-app/app/build/outputs/connected_android_test_additional_output`). Las capturas revisadas para la entrega están en `docs/evidencias`, junto con su índice.

Para mostrar Room durante la exposición: abrir **App Inspection → Database Inspector** con la app ejecutándose en un emulador compatible, seleccionar `truec.db`, abrir `productos` o `propuestas` y repetir una acción en la interfaz. No confundir esta base con las bases temporales de las pruebas.

## Guion de exposición: 3 a 5 minutos

1. Explicar el problema: tecnología en desuso y necesidad de conseguir equipos con menor presupuesto.
2. Entrar en modo demo, abrir Perfil y restablecer para comenzar con los datos conocidos.
3. Publicar un producto; cerrar y abrir la app para comprobar que permanece en el inventario.
4. Buscar iPhone 14, abrir su detalle, marcar favorito y proponer un trueque con iPad Air 5.
5. Mostrar la propuesta enviada y aceptar una de las propuestas recibidas de ejemplo.
6. Entrar en Subastas, demostrar el rechazo de una oferta insuficiente y registrar una válida.
7. Finalizar la subasta con el botón de demostración y mostrar su resultado ficticio.
8. Mostrar una tabla de Room y explicar entidad, DAO, base de datos y corrutinas.

## Problema, usuarios y objetivo

Muchas personas conservan celulares, consolas y computadoras que ya no usan, mientras otras buscan tecnología a menor precio. Truec-app reúne catálogo, intercambio y subasta en un recorrido móvil sencillo.

Está dirigida como concepto a estudiantes, jugadores y personas interesadas en tecnología seminueva. El objetivo académico es demostrar navegación, validaciones y persistencia local con Room.

## Prototipo web y API anteriores

El repositorio conserva el prototipo React/Vite en `src` y el servidor local en `server`. Son material previo y no están sincronizados con Room. Para revisar esa versión por separado se usan `npm run api` y `npm run dev` desde la raíz; su catálogo e interacciones no representan el estado local de Android.

El alcance y criterios de aceptación están en [PLAN_DESARROLLO.md](PLAN_DESARROLLO.md). Las mejoras y límites están en [PROPUESTAS_MEJORA.md](PROPUESTAS_MEJORA.md).
