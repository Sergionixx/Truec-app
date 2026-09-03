# Truec-app

Prototipo móvil para comprar, subastar e intercambiar artículos tecnológicos. Incluye una aplicación Android nativa en Kotlin/Jetpack Compose, el prototipo web original y un backend local sencillo que guarda los datos en `server/data.json`.

## Abrir en Android Studio

1. Abre Android Studio y selecciona **Open**.
2. Elige la carpeta `android-app` de este repositorio.
3. Espera a que finalice Gradle Sync.
4. Inicia el backend desde la raíz con `npm run api`.
5. Ejecuta la configuración `app` en un emulador Android.

El emulador se conecta al backend de la computadora mediante `http://10.0.2.2:3001`. La app solicita permiso de Internet y permite HTTP local para esta etapa de desarrollo. En un teléfono físico se debe cambiar `BASE_URL` en `MainActivity.kt` por la IP local de la computadora, por ejemplo `http://192.168.1.20:3001`.

La aplicación Android incluye login, catálogo con búsqueda y filtros, detalle con estado y reputación, comparación de trueque, subasta, perfil demostrativo y navegación inferior. Cuando la API está disponible, las propuestas y pujas se envían al backend; si no lo está, la aplicación continúa en modo demo para facilitar la presentación académica.

Las mejoras implementadas y las siguientes propuestas están documentadas en [`PROPUESTAS_MEJORA.md`](PROPUESTAS_MEJORA.md).

## Ejecutar el proyecto

Requiere Node.js 20 o superior. En dos terminales:

```bash
npm run api
npm run dev
```

Para usar el prototipo web, abrir `http://localhost:8443`. Para Android solo es necesario mantener `npm run api` activo. Usuario de demostración: `demo@truec.app`; contraseña: `demo123`.

## Primera parte: problema, usuarios y objetivo

**Problema.** Muchas personas conservan celulares, consolas, computadoras y accesorios que ya no usan, mientras otras buscan tecnología a menor precio. Las opciones actuales dispersan la compra, el trueque y la subasta en servicios diferentes y dificultan comparar el estado y valor de los artículos.

**Usuarios principales.** Jóvenes y adultos de 18 a 40 años interesados en tecnología, estudiantes, jugadores y compradores con presupuesto limitado que desean vender, intercambiar o conseguir equipos seminuevos de forma clara y rápida.

**Objetivo general.** Facilitar el intercambio y la adquisición de productos tecnológicos entre particulares mediante un catálogo organizado, propuestas de trueque y subastas dentro de una experiencia móvil simple.

**Funciones de la primera versión:**

1. Inicio de sesión con validación de credenciales.
2. Consulta y filtrado de un catálogo de productos tecnológicos.
3. Visualización del detalle, precio, estado y datos del vendedor.
4. Envío y almacenamiento de propuestas de trueque.
5. Registro de pujas válidas en una subasta y actualización de la oferta más alta.

## Segunda parte: pantallas y navegación

El prototipo contiene cinco pantallas conectadas:

| Pantalla | Elementos principales |
|---|---|
| Inicio de sesión | Correo, contraseña, recuperación, botón Iniciar sesión y accesos sociales |
| Catálogo / inicio | Buscador, filtros por categoría, tarjetas de productos y barra de navegación |
| Detalle de producto | Galería, precio, estado, vendedor, Comprar y Proponer trueque |
| Propuesta de trueque | Producto deseado, selector de artículo propio, mensaje y botón Enviar |
| Subasta activa | Producto, temporizador, puja actual, historial, incrementos y campo de nueva puja |

Flujo principal:

```text
Inicio de sesión
  └─ credenciales válidas → Catálogo
       ├─ seleccionar producto → Detalle
       │    └─ Proponer trueque → Formulario → Propuesta enviada
       ├─ menú Trueques → Formulario de trueque
       └─ menú Subastas → Subasta → Confirmar puja → Historial actualizado
```

La barra inferior permite regresar a Inicio y acceder directamente a Trueques, Subastas y Perfil. Los botones de retroceso unen Detalle con Catálogo y Trueque con Detalle.

## Tercera parte: identidad visual y layouts Android

Tipografía base: **Inter**, con pesos 400, 500, 600, 700 y 800.

| Uso | Color |
|---|---|
| Primario / trueques | `#00897B` |
| Primario oscuro | `#00695C` |
| Secundario / compra | `#1E3A8A` |
| Acento / subasta | `#F59E0B` |
| Fondo | `#F8FAFC` |
| Superficie | `#FFFFFF` |
| Texto principal | `#1E293B` |
| Texto secundario | `#64748B` |
| Error | `#EF4444` |

Equivalencia recomendada para una implementación nativa en Android Studio:

| Pantalla | Layout Android |
|---|---|
| Inicio de sesión | `ConstraintLayout` con campos dentro de un `LinearLayout` vertical |
| Catálogo | `CoordinatorLayout` + `RecyclerView` y `BottomNavigationView` |
| Detalle | `CoordinatorLayout` + `NestedScrollView` y barra inferior fija |
| Propuesta de trueque | `ConstraintLayout` + `NestedScrollView`; artículos en `RecyclerView` |
| Subasta | `ConstraintLayout` con `RecyclerView` para historial y panel inferior fijo |

## API

| Método | Ruta | Función |
|---|---|---|
| `GET` | `/api/health` | Estado del servicio |
| `POST` | `/api/login` | Validar credenciales demo |
| `GET` | `/api/products?category=Consolas` | Listar o filtrar productos |
| `POST` | `/api/trades` | Crear una propuesta de trueque |
| `GET` | `/api/auctions/1/bids` | Consultar pujas |
| `POST` | `/api/auctions/1/bids` | Registrar una puja superior a la actual |

Este backend es apropiado para un prototipo académico. Para producción habría que sustituir contraseñas en texto plano y tokens demo por hash seguro, sesiones reales, una base de datos, autorización y validaciones más completas.
