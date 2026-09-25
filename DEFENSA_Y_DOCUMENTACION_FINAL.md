# Documentación técnica y validación

## Arquitectura y decisiones

Android usa Kotlin, Activity/XML para el registro y Compose para el marketplace. Room proporciona entidades, DAO y consultas comprobadas durante la compilación. AppDatabase se crea como singleton con applicationContext, @Volatile y synchronized para evitar instancias duplicadas. MainActivity valida todos los campos después de trim y utiliza lifecycleScope con Dispatchers.IO; deshabilita Guardar mientras se inserta y diferencia errores de inserción de errores al actualizar el contador.

El marketplace Android usa una base Room independiente y operaciones transaccionales para publicaciones, propuestas y pujas. Conservar esta implementación evita depender de una IP local durante la exposición. El formulario de registro y el catálogo se conectan mediante un botón; son módulos académicos, no un sistema de autenticación unificado.

La web React consume una API Node local. Esta API persiste JSON mediante reemplazo de archivo y serializa cada ciclo de lectura/modificación/escritura para evitar pérdidas por concurrencia. No se afirma que JSON sea una base SQL: el requisito de base local se sustenta en Room de Android. Las dos versiones no sincronizan sus datos.

Las sesiones web son tokens aleatorios; el servidor conserva solo su hash y vencimiento. Las contraseñas se derivan con scrypt y sal individual. Los permisos se comprueban por identificador del usuario, no por el nombre mostrado. El emisor puede retirar su propuesta pendiente; el destinatario puede aceptarla o rechazarla. Una subasta con pujas no se edita ni elimina. Las ofertas deben superar el precio inicial y la puja mayor, y llegar antes del cierre persistido.

Las operaciones web rechazadas o sin conexión conservan el error: no devuelven éxito local. Las consultas pueden usar caché por usuario y por subasta; no se ofrece sincronización offline de escrituras. Las cuentas iniciales y datos son ficticios. El servidor está pensado para ejecución local de evaluación, no para exposición pública.

## UX y accesibilidad

La interfaz conserva navegación consistente, mensajes de error y éxito separados, confirmaciones para operaciones y campos con etiquetas. Las tarjetas web se pueden activar con Enter o espacio. Los diálogos trasladan y contienen el foco, deshabilitan la interacción con el fondo, cierran con Escape y restauran el foco al control que los abrió. Se añadieron controles de texto grande y alto contraste y respeto a movimiento reducido. El verde principal se oscureció a #00796B.

Se comprobó el catálogo web a 320, 390, 768 y 1280 px con texto grande y alto contraste: no hubo desbordamiento horizontal del documento. La revisión visual mostró contenido desplazable. Las pruebas Android corrieron también con el dispositivo en horizontal; se corrigió el desplazamiento de las pruebas para elementos de LazyColumn que aún no estaban compuestos. Las pantallas usan listas/ScrollView y tamaños de texto sp.

No se realizó una auditoría integral con TalkBack ni una certificación WCAG. Las capturas y estas pruebas cubren los casos indicados; no garantizan todas las combinaciones de lector, zoom, sistema operativo y dispositivo.

## Pruebas y evidencia

- TypeScript: `npm run typecheck`, sin errores.
- Web: `npm run build`, compilación completada.
- API/cliente: `npm test`, suite de integración aprobada. Incluye duplicados, permisos, importes inválidos, inexistencia de productos/subastas, subasta vencida, aislamiento de pujas, ocho escrituras simultáneas y persistencia tras reinicio. También comprueba que el cliente no transforma errores en éxitos.
- Android: assembleDebug y lintDebug completados. Lint: cero errores y siete advertencias de dependencias.
- Android: 18 pruebas instrumentadas aprobadas (4 UI, 11 repositorio y 3 registro).
- Recorrido adicional: 1 prueba aprobada con registro vacío, formulario lleno, éxito, catálogo, detalle, envío de trueque, propuestas, puja inválida/válida, perfil e inventario.
- Navegador: registro de foco, Escape, navegación con teclado y propuesta para el producto seleccionado; simulador de publicación accesible desde la barra.
- APK: firma v2 comprobada con apksigner; checksum SHA-256 calculado sobre el archivo entregado.

Los registros se conservan en `docs/validacion-final/`. Los archivos de `docs/evidencias/`, `docs/registro/evidencias/` y `docs/REVISION_RUBRICA.md` anteriores a esta integración son históricos; no describen el estado final de Victor corregido.

## Entrega y simulación

`output/entrega-final/` contiene código ZIP sin build/dist/node_modules, APK debug, PDF y video MP4. El paquete Android com.truecapp.mobile.demo permite coexistir con el anterior. El APK es instalable y firmado con clave de desarrollo; no es un release para producción.

El video combina 40.4 segundos de grabación real del dispositivo con 35 segundos de capturas del recorrido web de publicación. Muestra datos ficticios y no incluye audio. El simulador presenta ficha, privacidad, artefacto, revisión y finalización; no envía nada a Google Play. No se entrega una firma privada ni se afirma haber publicado la aplicación.

## Correspondencia con la rúbrica

| Criterio | Sustento entregado | Límite explícito |
|---|---|---|
| Funcionalidad y datos | Room, API validada, pruebas positivas y negativas, persistencia | Android y web son módulos con datos independientes; demo local |
| UX/UI | Navegación, formularios, estados y mensajes; capturas y recorrido | Compras y pagos reales fuera del alcance |
| Accesibilidad/dispositivos | Etiquetas, teclado, foco, contraste, texto grande, cuatro anchos | Sin certificación WCAG ni auditoría integral TalkBack |
| Documentación | Decisiones, código, pruebas y capturas en PDF y repositorio | Resultados limitados a los entornos descritos |
| Video/publicación | MP4 de app real y simulación; APK/ZIP/PDF/hash | Simulación académica; no publicación real |

La evidencia permite evaluar lo implementado sin asignarse una calificación automática. La puntuación corresponde al docente.
