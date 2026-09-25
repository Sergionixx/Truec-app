# Revisión de la rúbrica — Truec-app

[Seguro] La rama remota más reciente revisada es `origin/Victor`, commit `0ef41f4` (24 de septiembre de 2026). Se actualizó la información con `git fetch origin` y se revisó en un worktree aislado. La copia de trabajo habitual continúa en `main`, con cambios locales de Android/Room que todavía no están incorporados a Victor.

[Seguro] Ambas versiones compilan, pero Victor contiene fallos funcionales significativos y la evidencia de entrega está incompleta. No se puede respaldar la declaración existente de «100% verificado».

## Hallazgos prioritarios

### 1. P1 — El registro convierte un rechazo real en éxito

[Seguro] En `src/services/api.ts:245`, el bloque `catch` crea una sesión local ante cualquier error, incluso cuando el servidor responde que el correo ya existe. Prueba reproducida: HTTP 409 del backend, pero `ApiService.register()` devolvió un usuario y un token exitosos. Además, una cuenta registrada sin servidor no puede volver a iniciar sesión con sus credenciales: solo se guarda la sesión, no una cuenta utilizable por el login local.

[Probable] Esto provocará usuarios que creen tener una cuenta válida y pierden el acceso al cerrar sesión. Corregir separando los errores de negocio de los de conexión y definiendo una política coherente de cuentas y persistencia offline.

### 2. P1 — La API permite modificar datos sin autenticación y acepta valores inválidos

[Seguro] `server/index.mjs:225` permite actualizar productos sin comprobar token ni propietario. Una petición PATCH sin autenticación dejó el nombre vacío y el precio en -100; respondió HTTP 200. La misma ruta ignora el campo de imagen enviado. En `server/index.mjs:269`, una propuesta para el producto inexistente 999999 respondió HTTP 201.

[Seguro] Las rutas de modificación no verifican la identidad del solicitante. Los tokens devueltos al entrar no protegen estas operaciones. Es necesario validar autorización, pertenencia, existencia de referencias y valores en el servidor; las validaciones visuales no cubren estas peticiones.

### 3. P1 — Las subastas no están integradas de forma consistente

[Seguro] `GET /api/auctions` respondió 404. El cliente intenta consultar esa ruta, pero crea y modifica subastas únicamente en almacenamiento local. En `src/services/api.ts:588`, el historial offline usa una clave compartida: al consultar la subasta 2 devolvió pujas de la subasta 1. El servidor también aceptó una puja de $1 para la subasta inexistente 987654 con HTTP 201 (`server/index.mjs:347`).

[Probable] Dos usuarios o dos dispositivos no compartirán correctamente las subastas y las pujas pueden mezclarse. Se necesita persistir las subastas, filtrar las pujas por identificador y validar existencia, precio mínimo y vigencia en el servidor.

### 4. P1 — El Android de Victor no contiene el trabajo local de Room

[Seguro] En Victor no están `data/registration/User.kt`, `UserDao.kt`, `AppDatabase.kt` ni el formulario de registro que sí existen en la copia local de main. Por tanto, entregar únicamente esa rama no entrega los requisitos anteriores de Room.

[Seguro] Su `android-app/app/src/main/java/com/truecapp/mobile/MainActivity.kt:501` configura `http://127.0.0.1:3001`, dirección del propio dispositivo; requiere una redirección explícita para acceder al servidor del ordenador. El README afirma que usa `10.0.2.2`, pero el código no lo hace. La propuesta envía siempre el producto 1 (línea 371) y muestra «guardada en modo demo» si falla la red, sin persistirla (línea 373). Comprar, Favorito, Ver perfil y otros controles tienen acciones vacías.

[Probable] Estos comportamientos impedirán una demostración nativa completa aunque el APK compile. Integrar primero las mejoras locales y probar la aplicación Android que realmente se entregará.

### 5. P1 — El archivo release llamado APK no es instalable

[Seguro] `scripts/simulate-release.mjs:69` genera texto de simulación y lo guarda con extensión `.apk`; no ejecuta Gradle ni firma un paquete Android. `release/Truec-app-v1.2.0-release.apk` tiene 193 bytes. Su checksum declarado tampoco coincide con los bytes entregados: se calcula sobre una cadena auxiliar.

[Seguro] El script genera afirmaciones de compilación, accesibilidad y publicación que no comprueba. Una simulación es válida como parte de la rúbrica, pero este archivo no constituye un APK funcional ni una firma real. Debe identificarse como material simulado y acompañarse de un artefacto Android auténtico y de evidencia real.

[Seguro] El APK local `output/entrega/Truec-app-registro.apk` es un artefacto distinto, de aproximadamente 17 MB; no debe confundirse con el supuesto release de Victor.

### 6. P2 — Hay barreras comprobadas para teclado y lector de pantalla

[Seguro] En el navegador, al abrir «Publicar», el foco permaneció en el botón de la pantalla de fondo. Escape no cerró el diálogo y Tab movió el foco al buscador detrás de él. `src/components/PublishProductModal.tsx:127` escucha Escape dentro del diálogo, pero no traslada ni contiene el foco.

[Seguro] Las tarjetas de productos son elementos `article` con `onClick`, sin enlace, botón ni acceso de teclado (`src/App.tsx:679`). El lector las expone como contenedores, no como acciones navegables.

[Seguro] El contraste calculado entre blanco y `#00897B` es aproximadamente 4.317:1, diferente del 4.6:1 declarado en la documentación. No se ha certificado conformidad WCAG. Sí existen mejoras útiles: etiquetas de campos, nombres accesibles en varios botones y notificaciones con región viva.

### 7. P2 — La demostración de publicación no es accesible desde los controles previstos

[Seguro] `DeviceToolbar.tsx:14` solo recibe efectivamente modo, cambio de modo y estado de conexión. Aunque su interfaz declara callbacks para Play Store y la guía, no renderiza botones que los invoquen. La barra del navegador confirmó que solo aparecen Teléfono, Tablet y Lienzo Figma. El guion pide pulsar un botón Play Store que no aparece.

[Seguro] No se encontró un video entregado ni un enlace a video en los archivos revisados. `GUIA_VIDEO_DEMOSTRATIVO.md` contiene un guion, que no sustituye la grabación exigida. Esto no descarta un video existente fuera del proyecto.

### 8. P2 — La documentación no reproduce fielmente el proyecto

[Seguro] El README indica `npm run server`, pero el script disponible se llama `api`. También indica el puerto 5173, mientras Vite configura 8443 por defecto. La declaración de rechazo visible para correos duplicados contradice la prueba del hallazgo 1.

[Seguro] Hay documentación técnica y capturas locales útiles, pero no están integradas en Victor. El PDF preparado para el ejercicio de registro es una evidencia de ese ejercicio, no una defensa completa del marketplace, de la accesibilidad y de la publicación solicitadas por esta nueva rúbrica.

## Evaluación por criterio

[Probable] Esta es una estimación de cumplimiento, no una calificación oficial. Las pruebas observadas no justifican asignar puntuación máxima.

| Criterio | Estado observado | Pendiente para sustentar «Altamente competente» |
|---|---|---|
| Funcionalidad e integración — 25 puntos | Parcial, con fallos significativos | Corregir registro, autorización, validaciones y subastas; integrar Room en la versión a entregar; probar persistencia y errores reales. |
| UX/UI — 20 puntos | Parcial | Completar controles Android sin acción; hacer accesible la simulación; eliminar mensajes de éxito engañosos. |
| Accesibilidad y dispositivos — 20 puntos | Parcial | Arreglar tarjetas y foco de diálogos; contrastes; verificar lector de pantalla, aumento de texto y varias resoluciones en la versión final. |
| Documentación — 20 puntos | Parcial | Unificar documentos con el código entregado, corregir instrucciones y sustituir afirmaciones automáticas por resultados reproducibles y capturas. |
| Video y publicación — 15 puntos | Evidencia incompleta | Entregar video real de navegación completa y simulación, junto con archivos correctos y un APK auténtico cuando se presente como instalable. |

## Validación realizada y límites

[Seguro] Se completaron en Victor: instalación de dependencias, `npm run build`, `npx tsc --noEmit`, `:app:assembleDebug` y `:app:lintDebug`. La compilación Android y lint también terminaron correctamente en la copia local de main. No hubo errores de compilación ni errores de lint que bloquearan estas ejecuciones; sí advertencias.

[Seguro] Las pruebas de API se ejecutaron contra una copia temporal del servidor y sus datos; no se modificaron los datos originales. Se conservan el script y sus resultados en `docs/revision-rubrica/`. El script debe ejecutarse desde la raíz de un checkout de Victor con dependencias instaladas; crea su propio servidor temporal.

[Seguro] La revisión de navegador comprobó login demo local, catálogo, controles de barra y comportamiento de teclado del diálogo. La medición de ancho a 320 px no mostró desbordamiento horizontal del documento; esto no certifica todas las pantallas ni tamaños. No se realizó una auditoría completa con TalkBack ni una nueva prueba funcional Android en el teléfono.

[Seguro] Los resultados Android conservados en main contienen 3 pruebas de registro y 15 del marketplace sin fallos, pero son evidencias históricas de septiembre, no ejecuciones de Victor realizadas en esta auditoría.

[Seguro] La revisión no cambió código de la aplicación, no fusionó ramas y no publicó commits. Los cambios locales previos se conservaron. El informe identifica correcciones pendientes; no afirma que estén resueltas.

## Orden de corrección propuesto

1. Elegir y consolidar una sola versión de entrega: integrar las mejoras Room locales con los cambios válidos de Victor.
2. Corregir los fallos de datos y autenticación; repetir los casos negativos documentados.
3. Completar las acciones Android y la navegación hacia la simulación; reparar teclado y contraste.
4. Generar el APK real y el ZIP sin compilaciones; verificar checksum del archivo definitivo.
5. Actualizar la documentación con evidencias de esa misma versión y grabar el recorrido y la simulación de publicación.
