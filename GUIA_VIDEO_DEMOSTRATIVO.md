# Guion y Plan de Grabación para el Video Demostrativo

Este documento contiene el guion paso a paso con minutaje exacto, locución sugerida en español y acciones en pantalla para grabar el **video demostrativo de Truec-app** requerido para la entrega académica.

**Duración recomendada:** Entre 3:30 y 4:30 minutos.  
**Herramientas sugeridas de grabación:** OBS Studio, Windows Game Bar (Win + G), Loom o Clipchamp.  
**Resolución recomendada:** 1080p (1920×1080 px).  

---

## Estructura Cronometrada del Video

| Minuto | Escena / Pantalla | Acción en Pantalla | Locución Sugerida (Voz en off) |
|---|---|---|---|
| **00:00 - 00:35** | **Presentación del Problema**<br>(Inicio de sesión en vista móvil) | Mostrar la pantalla de Login con el logo de Truec-app.<br>Hacer clic en el botón de autocompletado *"Rellenar cuenta demo"*. | *"Hola a todos. Hoy presentamos Truec-app, una plataforma diseñada para resolver la acumulación de tecnología en desuso y la falta de liquidez en estudiantes y jóvenes. Nuestra investigación arrojó que más del 90% está interesado en tecnología reacondicionada y abierto al trueque. Iniciamos sesión con nuestra cuenta de demostración."* |
| **00:35 - 01:25** | **Catálogo y Exploración**<br>(Pantalla Catálogo / Home) | Escribir en el buscador *"PlayStation"* o *"MacBook"*.<br>Navegar por los chips de categorías (*Consolas*, *Celulares*, *Laptops*).<br>Hacer clic en el corazón para guardar en favoritos.<br>Abrir el PS5 Digital Edition. | *"Al entrar encontramos el catálogo interactivo. Contamos con filtros por categoría, búsqueda reactiva en tiempo real y etiquetas visuales que indican si el equipo acepta trueque. Marcamos artículos como favoritos y seleccionamos la consola PlayStation 5 para ver su ficha técnica."* |
| **01:25 - 02:15** | **Ficha de Detalle y Propuesta de Trueque**<br>(Detalle y Formulario de Trueque) | Desplazar por la galería y especificaciones técnicas.<br>Destacar la reputación del vendedor (4.8 ★, 48 ventas).<br>Pulsar el botón *"Proponer Trueque"*.<br>Seleccionar del inventario el iPhone 12 Pro.<br>Escribir un mensaje breve y confirmar el envío. | *"La ficha destaca la transparencia: estado del equipo, especificaciones de hardware y reputación verificada del vendedor. Como acepta trueque, pulsamos 'Proponer Trueque'. La interfaz nos permite contrastar qué recibimos y qué ofrecemos de nuestro inventario. Ajustamos el mensaje, confirmamos y la propuesta queda registrada en el backend."* |
| **02:15 - 03:00** | **Gestión de Trueques y Publicación**<br>(Modales de Trueques y Publicar) | Abrir la barra superior y pulsar *"⇄ Trueques"*.<br>Mostrar la propuesta enviada y cambiar a *"Aceptada"*.<br>Abrir el botón *"➕ Publicar"*.<br>Llenar un artículo (ej. iPad 9na Gen), seleccionar foto de tableta y hacer clic en *"Publicar Ahora"*. | *"Desde la gestión de trueques, tanto comprador como vendedor pueden revisar el historial y aceptar o rechazar propuestas con retroalimentación inmediata. Además, cualquier usuario puede publicar tecnología en segundos mediante un formulario accesible con validaciones visibles y selector de fotografías."* |
| **03:00 - 03:45** | **Subasta en Vivo**<br>(Pantalla Subasta Activa) | Ir a la pestaña *"Subastas"*.<br>Mostrar el cronómetro en cuenta regresiva.<br>Usar el botón rápido *"+$100 MXN"*.<br>Hacer clic en *"Pujar"* y confirmar en el diálogo emergente.<br>Verificar que el usuario pasa a liderar la subasta. | *"El tercer pilar es la subasta en vivo. Aquí los usuarios compiten con ofertas dinámicas. Tenemos un cronómetro en cuenta regresiva, incrementos rápidos y validación en el servidor para asegurar que toda puja supere a la líder. Realizamos una puja y el historial se actualiza al instante."* |
| **03:45 - 04:20** | **Simulación de Publicación Google Play y Cierre**<br>(Modal Google Play Store y Conmutador de Modos) | Abrir el botón *"▶ Play Store"* en la barra superior.<br>Mostrar la ficha oficial (4.8 ★, 10K+ descargas, 24.6 MB).<br>Hacer clic en *"Instalar en el dispositivo"* para ver la barra de progreso.<br>Conmutar entre *"Teléfono"* y *"Fluida / Tablet"* en la barra superior. | *"Finalmente, simulamos el proceso de publicación en Google Play Store con metadatos reales, paquete APK release firmado y proceso de instalación interactivo, además de soporte como aplicación web progresiva PWA. Con esto demostramos una solución 100% accesible, responsiva e integrada. ¡Muchas gracias!"* |

---

## Consejos Técnicos para la Grabación

1. **Antes de empezar:**
   - Inicia el servidor backend en una terminal: `npm run api`.
   - Inicia el servidor de desarrollo en otra terminal: `npm run dev`.
   - Abre `http://localhost:8443` en Google Chrome o Microsoft Edge y presiona `F11` para pantalla completa.
2. **Si necesitas reiniciar los datos antes de grabar:**
   - Haz clic en el botón superior **"★ Guía / Rúbrica"** y luego en la pestaña **"Accesos Rápidos y Reset"** -> **"Restablecer Datos de Demostración"**.
3. **Audio:**
   - Asegúrate de hablar con un ritmo pausado y claro.
   - Si no deseas grabar tu voz, puedes añadir subtítulos o una pista de audio explicativa siguiendo las líneas del cuadro anterior.
