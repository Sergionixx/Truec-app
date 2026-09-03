# Propuestas de mejora para Truec-app

Estas propuestas están pensadas para un proyecto académico y no requieren convertir Truec-app en una plataforma comercial real. Se priorizan cambios visibles, demostrables y fáciles de explicar durante una presentación.

## Mejoras incorporadas

1. **Sistema visual Material Design 3 consistente.** La interfaz usa verde teal para trueques, azul marino para confianza y ámbar para subastas, de acuerdo con el documento del proyecto.
2. **Catálogo más fácil de explorar.** Se añadieron buscador, filtros por categoría, banner de economía circular, tarjetas con estado y etiqueta de aceptación de trueque.
3. **Información para decidir.** La ficha destaca estado, precio, ubicación, descripción, reputación y verificación del vendedor.
4. **Trueque explicado por pasos.** La pantalla muestra qué se recibe, qué se ofrece, valor estimado y un mensaje de condiciones.
5. **Subasta con mejor retroalimentación.** Incluye indicador “En vivo”, cronómetro, pujas rápidas, validación de monto e historial.
6. **Perfil demostrativo.** Resume publicaciones, trueques, reseñas, inventario, propuestas y favoritos.
7. **Modo demo sin servidor.** Las credenciales demo permiten entrar y las acciones se simulan si la API no está disponible. Esto evita que una presentación falle por problemas de red.

## Siguientes mejoras recomendadas

### Prioridad alta: útiles para la evaluación

- **Pantalla para publicar un producto.** Formulario con nombre, categoría, estado, precio, descripción y fotografías simuladas. Completaría el ciclo principal del marketplace.
- **Lista de propuestas recibidas.** Mostrar estados `Pendiente`, `Aceptada` y `Rechazada`, con botones para cambiar el estado localmente.
- **Evidencia visual del flujo.** Incluir en el documento capturas de Login → Catálogo → Detalle → Trueque y Catálogo → Subasta.
- **Validaciones visibles.** Mensajes para campos vacíos, correo inválido, puja insuficiente y confirmación de acciones.
- **Accesibilidad básica.** Mantener áreas táctiles de 48 dp, textos legibles, etiquetas para iconos y contraste suficiente.

### Prioridad media: enriquecen la demostración

- **Favoritos locales.** Permitir marcar productos y consultarlos desde el perfil usando estado en memoria o `SharedPreferences`.
- **Comparador técnico.** Tabla sencilla para comparar precio, estado, antigüedad y accesorios de dos artículos.
- **Reseñas simuladas.** Dos o tres comentarios de compradores para reforzar la idea de reputación y confianza.
- **Filtros adicionales.** Precio máximo, condición y “Acepta trueque”.
- **Confirmaciones mediante diálogo.** Antes de enviar una propuesta o confirmar una puja.

### No necesario para esta entrega

- Pagos reales, mensajería real, mapas, notificaciones push o publicación en Play Store.
- Autenticación biométrica, verificación de identidad real o moderación automática.
- Infraestructura en la nube, alta disponibilidad o una base de datos comercial.

Estas funciones serían importantes para producción, pero agregarían complejidad sin mejorar de forma proporcional la demostración académica actual.

## Guion breve para presentar el proyecto

1. Explicar el problema: tecnología en desuso y poca liquidez entre estudiantes.
2. Iniciar sesión con la cuenta demo.
3. Mostrar búsqueda, categorías, estado y reputación en el catálogo.
4. Abrir un producto y explicar la transparencia de la ficha.
5. Comparar productos y enviar una propuesta de trueque.
6. Realizar una puja superior a la actual y mostrar la retroalimentación.
7. Cerrar relacionando las funciones con los resultados de la encuesta: 90.9% de interés en tecnología, 90.9% de apertura al trueque y 90.9% de importancia de la calidad.
