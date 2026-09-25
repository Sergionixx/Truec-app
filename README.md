# 📱 Truec-app — Marketplace de Tecnología

> **¿Qué es Truec?**  
> Una aplicación donde puedes **comprar, vender, intercambiar y subastar** gadgets y dispositivos tecnológicos de segunda mano. Pensada para promover la economía circular: darle una segunda vida a la tecnología.

---

## 🗂️ ¿Qué hay en este proyecto?

El proyecto tiene **tres partes** que trabajan juntas:

```
Truec-app/
├── 📂 src/              → La aplicación web (lo que ve el usuario en el navegador)
├── 📂 server/           → El servidor (el "cerebro" que guarda y entrega los datos)
└── 📂 android-app/      → La app para Android (abre con Android Studio)
```

---

## 🌐 Aplicación Web

Hecha con **React** y **TypeScript**. React es una librería muy popular para construir interfaces de usuario; TypeScript es como JavaScript pero con reglas más estrictas para evitar errores.

### Pantallas principales

| Pantalla | ¿Qué hace? |
|----------|------------|
| **Inicio de sesión / Registro** | Permite entrar a la app o crear una cuenta nueva. Valida que el correo tenga `@` y que la contraseña cumpla requisitos mínimos |
| **Inicio (Home)** | Muestra todos los productos disponibles con búsqueda y filtros |
| **Detalle del producto** | Información completa del artículo, opción de hacer oferta de intercambio o puja |
| **Publicar producto** | Formulario para vender o intercambiar tu propio dispositivo |
| **Mis intercambios** | Gestiona las propuestas de trueque que has enviado o recibido |

### Funcionalidades destacadas

- 🔍 **Buscador en tiempo real** — escribe y los resultados se filtran al instante
- 🏷️ **Filtros avanzados** — por categoría (celulares, laptops, consolas…), condición, precio máximo, solo-trueque
- 📲 **Diseño responsivo** — se adapta a cualquier tamaño de pantalla (celular, tablet, computadora)
- ♿ **Accesibilidad** — sigue estándares para que personas con lectores de pantalla puedan usarla
- 💾 **Modo sin conexión** — si el servidor no responde, la app sigue funcionando con datos guardados localmente

---

## 🖥️ Servidor (Backend)

Es un servidor hecho con **Node.js** (JavaScript del lado del servidor). Expone una **API REST**, que es básicamente una serie de "rutas" a las que la app web y la app Android le preguntan cosas o le mandan datos.

### ¿Qué puede hacer el servidor?

| Operación | ¿Qué significa? |
|-----------|-----------------|
| **POST /api/login** | Verificar usuario y contraseña |
| **POST /api/register** | Crear cuenta nueva |
| **GET /api/products** | Obtener la lista de productos |
| **POST /api/products** | Publicar un producto nuevo |
| **PATCH /api/products/:id** | Editar un producto existente |
| **DELETE /api/products/:id** | Eliminar un producto |
| **GET/POST /api/trades** | Ver o crear propuestas de intercambio |
| **PATCH /api/trades/:id** | Aceptar o rechazar un intercambio |
| **DELETE /api/trades/:id** | Eliminar una propuesta |

> **CRUD** = Create, Read, Update, Delete (Crear, Leer, Actualizar, Eliminar). Es el conjunto mínimo de operaciones que toda app de datos debe tener. ✅ Truec las implementa todas.

Los datos se guardan en `server/data.json` — un archivo de texto con formato JSON (una forma estructurada de guardar información).

---

## 📱 App Android

La app de Android está hecha con **Kotlin** y **Jetpack Compose**. Kotlin es el lenguaje oficial de Android; Jetpack Compose es la forma moderna de construir interfaces sin tanto código repetitivo.

Se conecta al mismo servidor de Node.js que la web. Si corres la app en el emulador, usa la dirección `10.0.2.2:3001` para comunicarse con el servidor local de tu computadora.

---

## 🚀 ¿Cómo correr el proyecto?

### Requisitos previos
- Tener instalado [Node.js](https://nodejs.org) (v18 o mayor)
- Tener instalado [Android Studio](https://developer.android.com/studio) (para la app Android)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Sergionixx/Truec-app.git
cd Truec-app

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor (en una terminal)
npm run server

# 4. Iniciar la app web (en otra terminal)
npm run dev
```

Luego abre tu navegador en `http://localhost:5173`

### Usuario de prueba
```
Correo:     demo@truec.app
Contraseña: demo123
```

---

## 🔒 Seguridad y validaciones

La app valida los datos **antes** de enviarlos al servidor y también **dentro** del servidor. Algunos ejemplos:

- El correo electrónico debe contener `@` y tener formato válido (ej: `usuario@dominio.com`)
- La contraseña debe tener al menos 6 caracteres
- Si el correo ya existe al registrarse, se muestra un mensaje claro de error
- Si el correo o contraseña son incorrectos al iniciar sesión, el mensaje no revela cuál de los dos falló (por seguridad)

---

## ♿ Accesibilidad

- Todos los botones tienen etiquetas descriptivas para lectores de pantalla
- Los colores tienen suficiente contraste (estándar WCAG AA)
- Las notificaciones ("toasts") usan `aria-live` para anunciarse automáticamente
- La app funciona con teclado (sin necesidad de ratón)

---

## 📦 Simulación de publicación en Google Play

Dentro de la carpeta `release/` encontrarás:

| Archivo | ¿Qué es? |
|---------|----------|
| `Truec-app-v1.2.0-release.apk` | El instalador simulado de la app Android |
| `Truec-app-v1.2.0-release.apk.sha256` | Firma de seguridad del archivo (para verificar que no fue alterado) |
| `google-play-metadata.json` | Metadatos que se subirían a Google Play (nombre, descripción, categoría…) |
| `RELEASE_REPORT.md` | Reporte del proceso de empaquetado |

Para simular el proceso completo ejecuta:
```bash
npm run simulate:release
```

---

## 📄 Documentación académica

| Archivo | Contenido |
|---------|-----------|
| `DEFENSA_Y_DOCUMENTACION_FINAL.md` | Documento completo de defensa: arquitectura, decisiones de diseño, pruebas, rúbrica |
| `GUIA_VIDEO_DEMOSTRATIVO.md` | Script cronometrado para grabar el video demostrativo |

---

## 🧱 Tecnologías usadas

| Tecnología | ¿Para qué? |
|------------|------------|
| React 19 | Construcción de la interfaz web |
| TypeScript | Tipado estático (menos errores en tiempo de desarrollo) |
| Vite | Servidor de desarrollo rápido y empaquetado |
| Node.js | Servidor backend / API REST |
| Kotlin + Jetpack Compose | App nativa Android |
| localStorage | Almacenamiento local para modo offline |
| PWA (manifest.json) | Permite instalar la web como si fuera una app |

---

## 👥 Equipo

Proyecto académico desarrollado como entrega final.  
Repositorio: [github.com/Sergionixx/Truec-app](https://github.com/Sergionixx/Truec-app) — rama `Victor`
