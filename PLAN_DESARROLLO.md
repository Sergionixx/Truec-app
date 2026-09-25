# Plan de desarrollo de Truec-app con Room para entrega académica

Fecha: 6 de septiembre de 2026.

## Estado de ejecución

Implementadas las etapas funcionales de Android: Room, catálogo y publicaciones, propuestas, subasta, perfil y favoritos. Se configuraron Room 2.7.2 y KSP 2.1.10-1.0.31, se exportó el esquema versión 1 y se eliminó la dependencia del servidor en el recorrido Android.

Las pruebas instrumentadas cubren persistencia, relaciones, operaciones inválidas y los recorridos principales de Compose. Las capturas revisadas están en `docs/evidencias`; el README contiene instrucciones y guion de presentación. La tabla de punto de partida que sigue describe el estado anterior a estos cambios y las estimaciones se conservan como referencia del plan original.

Resultado final: 15 pruebas correctas, lint sin errores y APK instalado e iniciado en el emulador. Informe: `docs/VERIFICACION.md`. Instalador: `APK/Truec-app-Room-demo.apk`.

La verificación se realiza en un emulador Pixel 8. Queda como preparación personal de la exposición instalar el APK en el teléfono elegido, si se usará uno físico, y ensayar el guion con el tiempo disponible.

## Objetivo y alcance

Terminar un prototipo que permita demostrar de principio a fin la búsqueda de tecnología, una propuesta de trueque y una subasta, con datos ficticios y resultados visibles. La entrega debe ser fácil de ejecutar, explicar y reiniciar.

El repositorio contiene una versión Android, un prototipo web y una API local. A partir de la solicitud de utilizar la guía **Room Database.pdf**, el plan se centra en **Android con Kotlin, Jetpack Compose y una base de datos local Room**. La estimación cubre esta versión; el prototipo web sirve como referencia visual.

Supuesto: la evaluación acepta datos ficticios. El guardado será funcional en el dispositivo mediante Room; los intercambios, compras y participantes serán simulados. No se requiere servidor para completar el recorrido.

## Cómo se aplica la guía del PDF

La guía presenta seis pasos: dependencias Room y KSP, entidad, DAO, clase de base de datos, formulario y conexión mediante corrutinas. Su ejemplo guarda usuarios con nombre y edad usando XML. En Truec-app se aplicará ese patrón a los datos de la aplicación y a las pantallas Compose existentes. Se interpreta la petición como uso de Room, sin asumir que haya que reproducir literalmente el formulario de ejemplo.

| Elemento de la guía | Aplicación en Truec-app |
|---|---|
| Room y plugin KSP | Configurar el plugin y las dependencias en los archivos Gradle del proyecto Android |
| `@Entity` y `@PrimaryKey` | Definir las tablas de usuarios, productos, propuestas, subastas, pujas y favoritos |
| `@Dao`, `@Insert` y `@Query` | Insertar y consultar datos; añadir actualización y borrado donde la app los necesita |
| `AppDatabase : RoomDatabase` | Crear una única instancia de `TruecDatabase` sobre el archivo local `truec.db` |
| Formulario con botón Guardar | Publicar/editar un producto desde Compose y comprobar que aparece en el catálogo |
| Corrutinas | Usar métodos DAO `suspend` para operaciones puntuales y `Flow` para observar listas |

El PDF muestra Room 2.6.1; el proyecto usa Kotlin 2.1.10 y Android Gradle Plugin 8.9.1. La primera etapa verificará una combinación compatible de Room y KSP, fijará las versiones y documentará cualquier ajuste al ejemplo. No se presupone que copiar esas dependencias sin comprobarlas sea suficiente.

La estructura de entidades, DAO y base de datos está descrita en la [documentación oficial de Room](https://developer.android.com/training/data-storage/room?hl=es-419). Las operaciones con `suspend` y consultas observables con `Flow` se apoyan en la [guía de consultas asíncronas](https://developer.android.com/training/data-storage/room/async-queries?hl=es-419). El propio material enlaza el [curso de Room con Compose](https://developer.android.com/courses/pathways/android-basics-compose-unit-6-pathway-2?hl=es-419).

## Datos y organización previstos

| Entidad | Datos mínimos y uso |
|---|---|
| `UsuarioEntity` | ID, nombre y correo ficticio; usuario demo y autores de propuestas/pujas |
| `ProductoEntity` | ID, propietario, nombre, categoría, condición, precio en centavos, descripción, imagen local de ejemplo, acepta trueque y activo; incluye el inventario propio |
| `PropuestaEntity` | ID, emisor, receptor, producto deseado, producto ofrecido, mensaje, fecha y estado |
| `SubastaEntity` | ID, producto, oferta inicial y fecha/hora de finalización; el cierre se determina a partir de esa fecha |
| `PujaEntity` | ID, subasta, usuario, monto en centavos y fecha; el líder se obtiene de la mayor puja |
| `FavoritoEntity` | Clave compuesta de usuario y producto para evitar duplicados |

Crear claves foráneas e índices para las relaciones consultadas. Usar fechas numéricas y convertir importes a MXN solo para mostrarlos. Mantener colores y otros objetos de Compose fuera de las entidades. Los productos referenciados por una propuesta o subasta se archivan en lugar de eliminarlos; los borrados de demostración usan registros propios sin referencias.

Organización sencilla: pantallas Compose → ViewModel → repositorio local → DAO → Room. Crear archivos pequeños bajo `data/local`, `data/repository` y `ui`, sin añadir una arquitectura de múltiples módulos. La base de datos es la fuente de los datos persistentes; el ViewModel conserva el estado de la interfaz y expone las consultas a las pantallas.

Inicializar el catálogo y las cuentas ficticias una sola vez. Guardar la marca de inicialización de forma persistente para no repoblar datos borrados al abrir la app. La función «Restablecer demostración» limpiará y reinsertará los datos de ejemplo en una transacción, solo después de una confirmación explícita.

## Punto de partida comprobado antes del desarrollo

| Área | Lo que existe | Pendiente principal |
|---|---|---|
| Android | Login demo, catálogo con búsqueda y categorías, detalle según selección y navegación inferior | Conectar las acciones pendientes y conservar los cambios al navegar y reiniciar |
| Persistencia Android | No hay dependencias Room ni entidades/DAO en la implementación revisada | Configurar la base de datos e integrar cada flujo con ella |
| Trueques | Selector de inventario, mensaje y envío a la API | El destino siempre es el producto 1; el mensaje de guardado demo no guarda una propuesta |
| Subasta Android | Campo de oferta, incrementos y validación local básica | El reloj es texto fijo; el historial no agrega cada puja ni cambia correctamente el nombre del líder |
| Perfil Android | Diseño, estadísticas y opciones de menú | Inventario, propuestas, favoritos y configuración no abren vistas funcionales |
| API local | Login, catálogo, creación de trueques y consulta/creación de pujas sobre JSON | Los catálogos difieren entre versiones; faltan consulta de propuestas y cierre de subasta si se usa la API |
| Web | Cinco pantallas, categorías, galería y llamadas a la API | Muestra todas las pantallas en fila; buscador visual, detalle fijo y Perfil dirige al login |
| Documentación | README y propuestas de mejora | Ajustar las afirmaciones a lo que realmente funcione y documentar una ejecución reproducible |

Este diagnóstico inicial fue estático. La implementación posterior se comprueba con compilación, lint y pruebas en emulador, como se indica en el estado de ejecución.

## Decisiones para mantener el proyecto pequeño

- Mantener el diseño y las tecnologías existentes.
- Usar una cuenta de demostración y un modo demo explícito que funcione sin servidor.
- Guardar productos, propuestas, favoritos y pujas en Room. Mostrar éxito únicamente después de terminar la escritura; mostrar un error recuperable si falla.
- Sustituir las llamadas a la API del recorrido Android por el repositorio Room. El servidor existente queda como material previo; sincronización y comunicación entre dispositivos quedan fuera de esta entrega.
- Limitar la subasta a un artículo y los trueques a un usuario con inventario precargado y algunas propuestas recibidas ficticias.
- Resolver los botones visibles con una acción útil, una explicación de simulación o retirándolos del alcance visible.
- No incluir pagos, cuentas sociales, chat, notificaciones, nube ni publicación en tiendas. La compra se representa con un resumen y una confirmación ficticia.

## Etapas, en orden de ejecución

### 1. Configurar Room y una base estable — 4 a 6 horas

- Comprobar que Android compila y abre en el dispositivo de entrega.
- Configurar Room y KSP compatibles con el proyecto y comprobar la generación de código.
- Crear entidades, DAO y `TruecDatabase` versión 1 con esquema exportado.
- Crear una instancia de base de datos con contexto de aplicación y un repositorio local sencillo.
- Preparar inserción y lectura asíncronas; observar listas con `Flow` desde el ViewModel y Compose.
- Centralizar e insertar una sola vez productos, inventario, usuarios y subasta de ejemplo.
- Implementar «Restablecer demostración» con confirmación. No borrar la base automáticamente ante un cambio de versión; si el esquema cambia después de guardar datos, añadir y comprobar una migración.
- Mostrar «Modo demostración» y permitir entrar sin esperar una conexión fallida.

**Terminado cuando:** Android compila con Room, una inserción se puede consultar tras cerrar y reabrir la app, y los datos iniciales no se duplican.

### 2. Conectar catálogo, publicaciones y navegación — 3 a 4 horas

- Consultar el catálogo desde Room y conservar el ID del producto seleccionado al abrir el detalle y proponer un intercambio.
- Añadir un formulario de producto propio: nombre, categoría, condición, precio, descripción, acepta trueque e imagen de ejemplo. Validar nombre obligatorio y precio positivo.
- Demostrar alta, consulta, edición y eliminación de una publicación propia sin referencias. Archivar las que ya tengan propuestas o subastas.
- Mostrar sus datos de forma consistente: nombre, precio, condición y aceptación de trueque.
- Impedir propuestas para artículos que no aceptan trueque.
- Mantener búsqueda y categoría al volver al catálogo.
- Revisar retroceso del sistema Android, barra inferior y resultados vacíos.
- Hacer que la pestaña Trueques abra la lista de propuestas; iniciar una nueva desde un producto elegible.

**Terminado cuando:** se puede crear, consultar, editar y borrar un producto de prueba usando Room; al seleccionar un iPhone, el detalle y el trueque muestran ese iPhone.

### 3. Completar el ciclo de trueques — 3 a 4 horas

- Guardar cada propuesta en Room con sus productos y usuarios vinculados, mensaje, fecha y estado.
- Añadir «Mis propuestas» con enviadas y recibidas; precargar dos propuestas recibidas para la exposición.
- Permitir aceptar o rechazar las recibidas y cancelar las enviadas pendientes mediante una actualización condicionada al estado pendiente.
- Mostrar confirmación y evitar envíos duplicados mientras se procesa una acción.
- Validar que ambos productos existan y que haya un artículo ofrecido seleccionado; el mensaje puede ser opcional.
- Conservar los estados al salir y volver a abrir la app.

**Terminado cuando:** una propuesta enviada aparece en la lista tras reiniciar, y aceptar una recibida actualiza su estado y el resumen del perfil.

### 4. Completar la subasta demo — 3 a 4 horas

- Sustituir el reloj fijo por una cuenta regresiva basada en una hora de finalización guardada.
- Insertar cada puja en Room con usuario, importe y hora; consultar el historial ordenado y mostrar correctamente al líder.
- Validar monto vacío, inválido, igual o inferior a la oferta actual.
- Bloquear nuevas pujas al terminar y mostrar el resultado ficticio.
- Comprobar monto máximo y fecha de cierre dentro de la misma transacción que inserta la puja, para que dos pulsaciones seguidas no registren ofertas incoherentes.
- Añadir una opción de demostración para finalizar pronto la subasta sin esperar más de una hora.

**Terminado cuando:** una oferta válida entra al historial con el usuario demo, una oferta insuficiente se rechaza y el reloj no se reinicia al cambiar de pantalla.

### 5. Cerrar perfil y acciones visibles — 2 a 3 horas

- Conectar inventario, propuestas y favoritos desde Perfil.
- Hacer que el corazón guarde o quite favoritos y que la lista refleje el cambio.
- Calcular los contadores de actividad mediante consultas Room; identificar como ficticias las reseñas precargadas.
- Añadir cierre de sesión y acceso a restablecer la demostración.
- Resolver «Comprar» mediante resumen y confirmación simulada, sin datos de pago.
- Mostrar un perfil de vendedor sencillo con datos de ejemplo.
- Retirar o explicar recuperación de contraseña y otras opciones que no formen parte de la tarea.

**Terminado cuando:** cada control visible tiene una respuesta coherente y las listas vacías explican cómo empezar.

### 6. Revisar y preparar la entrega — 3 a 4 horas

- Recorrer los casos de aceptación de este documento en el dispositivo elegido.
- Probar los DAO con casos que comprueben persistencia y relaciones: un favorito duplicado, una propuesta cuyo producto no existe y el cambio de estado de una propuesta ya resuelta.
- Probar inserción y rechazo de pujas en subasta abierta/cerrada, además del recorrido manual tras reiniciar la app.
- Usar Database Inspector en un emulador compatible para comprobar que los botones generan filas y cambios reales en `truec.db` y obtener capturas de evidencia.
- Revisar teclado, desplazamiento, textos, contraste, etiquetas de iconos y botones accesibles.
- Comprobar conservación del estado al navegar, rotar y volver a abrir la app.
- Compilar el APK de demostración y probar su instalación si se entrega Android.
- Actualizar las instrucciones Android para que la entrega con Room no requiera `npm run api`, cambios de IP ni `adb reverse`.
- Actualizar README y PROPUESTAS_MEJORA para distinguir funciones implementadas, simulaciones y trabajo opcional.
- Preparar capturas y un guion de exposición de 3 a 5 minutos.

**Terminado cuando:** otra persona puede seguir el README, abrir la app y completar el recorrido sin instrucciones adicionales.

## Estimación y prioridades

**Estimación orientativa: 18 a 25 horas de trabajo para Android con Room**, suponiendo que el entorno ya compila. Reservar 2 a 4 horas adicionales para compatibilidad de dependencias, problemas de dispositivo o ajustes pedidos por la rúbrica. Distribuir las etapas en seis sesiones: Room; catálogo y publicaciones; trueques; subasta; perfil; verificación y entrega.

Prioridad obligatoria: etapas 1 a 4, cierre de acciones visibles y etapa 6. Si falta tiempo, reducir pantallas secundarias del perfil y retirar opciones no implementadas antes de recortar la verificación.

Mejoras opcionales después de completar el recorrido: fotografías elegidas del dispositivo, filtros avanzados, comparador técnico y reseñas adicionales. El formulario básico de publicaciones queda dentro del plan para demostrar las operaciones de base de datos.

## Lista de aceptación de la entrega

- [x] La app abre y permite usar una cuenta demo sin servidor.
- [x] Room y KSP están configurados y las entidades, DAO y base de datos son identificables en el código.
- [x] Crear, consultar, editar y borrar una publicación propia de prueba modifica la base de datos.
- [x] Los datos se conservan después de cerrar y reabrir la app, sin duplicar los registros de ejemplo.
- [x] Buscar y filtrar devuelve resultados coherentes o un estado vacío.
- [x] Catálogo, detalle y trueque mantienen el mismo producto.
- [x] Solo se propone trueque con productos que lo aceptan.
- [x] Enviar una propuesta la añade a «Mis propuestas» y la conserva tras reiniciar.
- [x] Aceptar, rechazar o cancelar cambia únicamente una propuesta pendiente válida.
- [x] Una puja válida actualiza líder e historial; una inválida muestra el motivo.
- [x] La subasta termina y deja de aceptar ofertas.
- [x] Los favoritos y contadores reflejan las acciones realizadas.
- [x] Los botones visibles responden y el retroceso funciona.
- [x] El emulador de verificación muestra los recorridos principales sin controles tapados.
- [x] Restablecer devuelve la app a un punto de partida conocido.
- [x] El artefacto final compila y se abre en el entorno de presentación.
- [x] README, capturas y guion describen el comportamiento comprobado.
- [ ] Ensayar personalmente la exposición y mostrar el registro en Database Inspector.

## Entregables y recorrido para la exposición

Entregar código fuente Android, APK demo, instrucciones de ejecución sin servidor, datos de ejemplo, esquema exportado de Room, capturas principales y guion breve. Incluir una tabla que relacione las clases del proyecto con los seis pasos de la guía.

Recorrido: entrar en modo demo → crear un producto → cerrar y reabrir para mostrar persistencia → buscar un producto de otro usuario → revisar su detalle → enviar una propuesta → verla en Mis propuestas → resolver una propuesta recibida → realizar una puja → mostrar su rechazo si es insuficiente → terminar la subasta → revisar Perfil.

Explicar qué problema resuelve Truec-app, qué funciones se implementaron y cuáles son simuladas. Usar estadísticas de encuesta únicamente si se dispone de su evidencia en la entrega.
