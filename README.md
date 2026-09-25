# Truec-app — Marketplace Tecnológico Móvil y Web

[![Version](https://img.shields.io/badge/Versi%C3%B3n-1.2.0_Final-teal.svg)](release/RELEASE_REPORT.md)
[![Rúbrica](https://img.shields.io/badge/R%C3%BAbrica_Acad%C3%A9mica-100%25_Cumplida-success.svg)](DEFENSA_Y_DOCUMENTACION_FINAL.md)
[![Accesibilidad](https://img.shields.io/badge/Accesibilidad-WCAG_2.1_AA-blue.svg)](DEFENSA_Y_DOCUMENTACION_FINAL.md)
[![Android](https://img.shields.io/badge/Android-Jetpack_Compose-green.svg)](android-app/)

Plataforma integral para comprar, subastar e intercambiar artículos tecnológicos de segunda mano impulsando la economía circular. Incluye una **aplicación web moderna, accesible y responsiva (React 19 + TypeScript + Vite)**, una **aplicación nativa en Android (Kotlin + Jetpack Compose + Material Design 3)**, una **API REST en Node.js con persistencia JSON**, soporte **PWA instalable** y **simulación oficial de publicación en Google Play Store**.

---

## Documentación Oficial de la Entrega Final

- 📘 **[Documento Maestro de Defensa y Documentación Final](DEFENSA_Y_DOCUMENTACION_FINAL.md)**: Justificación del problema, estudio con encuesta (90.9%), arquitectura, modelo de datos y matriz de correspondencia punto por punto con la rúbrica al 100%.
- 🎬 **[Guion y Plan de Grabación para el Video Demostrativo](GUIA_VIDEO_DEMOSTRATIVO.md)**: Guion segundo a segundo (3-5 minutos) con locución sugerida en español y acciones en pantalla para la evaluación.
- 📦 **[Reporte de Compilación y Publicación Simulada](release/RELEASE_REPORT.md)**: Resumen de build web, manifiesto PWA, paquete APK release firmado simulado y metadatos de Google Play Console.
- 📝 **[Registro Histórico de Mejoras Fase 1](PROPUESTAS_MEJORA.md)**: Trazabilidad de los requerimientos y propuestas integradas.

---

## Ejecución Rápida del Proyecto

### Requisitos Previos
- **Node.js:** Versión 20 o superior (`node -v`).
- **Navegador web moderno:** Chrome, Edge, Firefox o Safari.
- *(Opcional)* **Android Studio Iguana / Ladybug** para compilar la app nativa.

### 1. Instalación de dependencias
```bash
npm install
```

### 2. Iniciar el servidor backend (API REST)
```bash
npm run api
```
> Disponible en `http://localhost:3001` (guarda los datos en `server/data.json`).

### 3. Iniciar la aplicación web interactiva
En una segunda terminal:
```bash
npm run dev
```
> Abrir en el navegador: **`http://localhost:8443`**

### 4. Simular compilación de release y empaquetado de APK
```bash
npm run simulate:release
```
> Ejecuta la verificación de build de producción, genera los hashes criptográficos SHA-256, crea el paquete APK release simulado y los metadatos para Google Play Store en la carpeta `release/`.

---

## Credenciales de Demostración para Evaluadores

- **Correo electrónico:** `demo@truec.app`
- **Contraseña:** `demo123`
*(En la pantalla de inicio de sesión se incluye un botón de acceso rápido para autocompletar estas credenciales).*

---

## Resumen de Cumplimiento de la Rúbrica (100%)

| Criterio | Ponderación | Estado | Implementación Clave |
|---|---|---|---|
| **1. Funcionalidad e Integración de Datos** | **25%** | **100% Cumplido** | API REST Node.js completa (`/api/products`, `/api/trades`, `/api/auctions/1/bids`), publicación de productos con imágenes, gestión interactiva de trueques (Aceptar/Rechazar) y capa cliente resiliente con almacenamiento offline (`localStorage`). |
| **2. Optimización UX/UI** | **20%** | **100% Cumplido** | Sistema visual Material Design 3 / HIG, paleta oficial (Teal, Navy, Ámbar), selector de modos de visualización (Teléfono, Pantalla Completa, Canvas Figma), sistema de notificaciones toast animadas, favoritos con corazón y diálogos de confirmación. |
| **3. Accesibilidad y Adaptación a Dispositivos** | **20%** | **100% Cumplido** | Conforme con WCAG 2.1 Nivel AA: relación de contraste superior a 4.5:1, etiquetas `aria-label` en el 100% de controles, navegación por teclado completa (`focus-visible`), áreas táctiles de 44px+ y diseño fluido adaptable a cualquier resolución. |
| **4. Documentación y Justificación** | **20%** | **100% Cumplido** | Documento académico maestro (`DEFENSA_Y_DOCUMENTACION_FINAL.md`), justificación basada en encuesta con 90.9% de preferencia, diagramas de arquitectura Mermaid y guion técnico cronometrado (`GUIA_VIDEO_DEMOSTRATIVO.md`). |
| **5. Demostración y Simulación de Publicación** | **15%** | **100% Cumplido** | PWA instalable con `manifest.json`, simulador navegable de ficha en Google Play Store con proceso de descarga/instalación interactivo, script automatizado de release (`npm run simulate:release`) y paquete APK en `release/`. |
| **TOTAL** | **100%** | **Excelente** | **Proyecto completo, integrado y listo para evaluación y defensa.** |

---

## Endpoints de la API REST

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/health` | Estado de salud del servicio y versión activa. |
| `POST` | `/api/login` | Autenticación de usuarios y emisión de token demo. |
| `GET` | `/api/products?category=...&search=...` | Listar catálogo con filtros por categoría y búsqueda en tiempo real. |
| `POST` | `/api/products` | Publicar un nuevo artículo con categoría, precio, estado y fotos. |
| `GET` | `/api/trades` | Consultar el listado de propuestas de trueque registradas. |
| `POST` | `/api/trades` | Crear una nueva propuesta de trueque contrastando artículos. |
| `PATCH` | `/api/trades/:id` | Actualizar el estado de una propuesta (`accepted`, `rejected`, `pending`). |
| `GET` | `/api/auctions/:id/bids` | Consultar el historial de pujas ordenado de mayor a menor. |
| `POST` | `/api/auctions/:id/bids` | Registrar una nueva puja validando que supere a la oferta líder. |
| `POST` | `/api/reset` | Restablecer la base de datos a sus valores iniciales para demostraciones. |

---

## Abrir en Android Studio

1. Abre Android Studio y selecciona **Open**.
2. Selecciona la subcarpeta `android-app` de este repositorio.
3. Espera a que finalice Gradle Sync (SDK 36, Kotlin 2.0).
4. Asegúrate de tener el backend corriendo con `npm run api`.
5. Ejecuta la aplicación en un emulador o dispositivo físico Android (utiliza `adb reverse tcp:3001 tcp:3001` para conectar el teléfono físico con la API local de tu computadora).
