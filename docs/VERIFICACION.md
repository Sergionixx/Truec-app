# Verificación de la entrega Android con Room

Fecha: 6 de septiembre de 2026.

## Resultado

- Compilación `:app:assembleDebug`: correcta.
- Pruebas instrumentadas `:app:connectedDebugAndroidTest`: **15 ejecutadas, 15 correctas, 0 omitidas**.
- Revisión `:app:lintDebug`: **0 errores**. Se conservan 6 avisos informativos sobre versiones más recientes de dependencias; no se actualizaron fuera de la combinación validada.
- Instalación del APK de entrega mediante ADB: correcta.
- Inicio en frío de `MainActivity`: correcto; se confirmó el proceso activo y la creación de `truec.db`, sin errores AndroidRuntime en la comprobación.
- Revisión visual de las capturas de los recorridos principales: realizada. Los mensajes de resultado ocupan espacio propio y no interceptan los botones de los formularios.

## Entorno comprobado

- Windows, JDK 21, Gradle 8.11.1 y Android Gradle Plugin 8.9.1.
- Kotlin 2.1.10, Room 2.7.2, KSP 2.1.10-1.0.31.
- Emulador Pixel 8, imagen Android 17 (API 37.2 beta3), pantalla 1080 × 2400.
- AndroidX Test 1.7.0 y Espresso 3.7.0, compatibles con el sistema del emulador utilizado.

No se ha probado en un teléfono físico. La compatibilidad declarada de la app empieza en API 24; esta verificación corresponde al emulador indicado.

## Qué se probó

Las 11 pruebas de Room verifican creación, edición, consulta y retirada de productos; persistencia después de cerrar y reabrir el archivo; ausencia de datos semilla duplicados; favoritos únicos; relaciones con claves foráneas; restricciones de propiedad; selección y duplicación de propuestas; aceptación y cancelación de propuestas relacionadas; publicación archivada; precios con centavos; cambios observables; ofertas insuficientes, simultáneas y vencidas; y restablecimiento de la demo.

Los 4 recorridos Compose verifican publicación/edición/borrado y restauración del estado de pantalla; selección del producto y envío de propuesta; favoritos; puja insuficiente y válida; cierre y restablecimiento de subasta; y actualización del perfil después de aceptar un intercambio.

Las pruebas usan bases independientes de `truec.db` y eliminan únicamente sus archivos de prueba. La comprobación final de instalación abrió la aplicación normal, con su base real de demostración.

## Archivos de evidencia

- `docs/evidencias/resultados-pruebas.xml`: informe de las 15 pruebas.
- `docs/evidencias/lint.txt`: resultado del análisis estático.
- `docs/evidencias/README.md`: índice de capturas.
- `android-app/app/schemas/com.truecapp.mobile.data.local.TruecDatabase/1.json`: esquema generado por Room.
- `APK/Truec-app-Room-demo.apk`: instalador Android de demostración, 17,342,132 bytes.

SHA-256 del APK:

```text
9C32F555D399786FF813136DF42CE5C6367A8BFAD9D71FF051B2ABF50ED16F32
```

## Preparación de la presentación

Instalar el APK en el dispositivo que se usará en clase, abrir la demo y ensayar el guion del README. Antes de comenzar, usar Perfil → Restablecer demostración para recuperar las dos propuestas recibidas y reiniciar la subasta de cinco minutos. El paso manual de Database Inspector queda descrito en el README para poder mostrar las tablas durante la exposición.
