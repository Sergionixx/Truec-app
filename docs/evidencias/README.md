# Evidencias de la demostración con Room

Capturas obtenidas de la aplicación Android en el emulador Pixel 8. Corresponden a recorridos de prueba con datos ficticios y bases locales separadas; por eso el inventario o los contadores pueden variar entre capturas.

| Archivo | Qué demuestra |
|---|---|
| [01-login.png](01-login.png) | Acceso demo sin servidor |
| [02-catalogo.png](02-catalogo.png) | Catálogo, búsqueda, categorías y publicación |
| [03-detalle.png](03-detalle.png) | Detalle del artículo elegido y favorito guardado |
| [04-propuestas.png](04-propuestas.png) | Propuesta persistida: iPad Air 5 por iPhone 14 Pro Max |
| [05-inventario.png](05-inventario.png) | Publicación creada y editada, con precio decimal |
| [06-subasta.png](06-subasta.png) | Puja de Sergio guardada y cuenta regresiva |
| [07-subasta-finalizada.png](07-subasta-finalizada.png) | Cierre y conservación del historial |
| [08-perfil.png](08-perfil.png) | Contador actualizado después de aceptar un trueque |
| [09-apk-instalado.png](09-apk-instalado.png) | Inicio de la aplicación normal después de instalar el APK de entrega |

La persistencia tras cerrar y reabrir la base se comprueba en `RoomWorkflowTest`. Las capturas muestran la interfaz; no sustituyen esa prueba. Para mostrar las tablas en clase, seguir las instrucciones de Database Inspector del README principal.
