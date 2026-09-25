# Mejoras de Truec-app para la entrega académica

## Implementadas en Android

1. **Persistencia con Room.** Entidades, DAO, base de datos y corrutinas siguiendo la guía de clase. Productos, favoritos, propuestas y pujas se conservan en el dispositivo.
2. **Publicaciones completas.** Alta, consulta, edición y retirada de artículos propios, con validación del precio y datos obligatorios.
3. **Trueques conectados al producto elegido.** Se eliminó el destino fijo de PlayStation; la propuesta guarda los identificadores del artículo deseado y ofrecido.
4. **Estados de propuestas.** Listas enviadas y recibidas, aceptación, rechazo y cancelación. Se evitan duplicados y se resuelven propuestas relacionadas al aceptar un intercambio.
5. **Subasta funcional para demostración.** Reloj basado en una fecha persistida, pujas guardadas con su autor, historial y bloqueo después del cierre.
6. **Perfil y favoritos.** Accesos funcionales a inventario, propuestas y favoritos, con contadores derivados de los datos.
7. **Interfaz coherente.** Se mantienen teal, azul marino y ámbar, tarjetas, categorías y navegación inferior. Los botones secundarios tienen una respuesta o fueron retirados del recorrido.
8. **Demostración sin servidor.** Cuenta ficticia explícita, compra simulada y restablecimiento confirmado. Las confirmaciones de guardado se muestran después de escribir en Room.
9. **Verificación.** Pruebas instrumentadas de persistencia, relaciones y recorridos de Compose sobre bases separadas de la demostración.

## Mejoras opcionales

- Elegir fotografías del dispositivo; actualmente se muestra una representación de ejemplo por categoría.
- Filtros por precio máximo o condición y comparador técnico.
- Nuevas reseñas y más subastas de ejemplo.
- Edición más detallada del perfil demo.

## Fuera del alcance

Pagos, cuentas reales, recuperación por correo, chat, notificaciones push, nube, sincronización entre dispositivos y publicación en Play Store. Las estadísticas de reputación y los participantes son ficticios; cualquier encuesta citada en el trabajo escrito debe acompañarse de su evidencia original.

## Evidencia de evaluación

El README incluye instrucciones y guion. El código permite identificar los seis pasos del material de Room; los esquemas exportados muestran las tablas y relaciones. La prueba más directa es guardar un producto desde el formulario, cerrar y reabrir la app y comprobar el registro en el inventario y en Database Inspector.
