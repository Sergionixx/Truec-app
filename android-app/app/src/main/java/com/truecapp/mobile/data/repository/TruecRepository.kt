package com.truecapp.mobile.data.repository

import androidx.room.withTransaction
import com.truecapp.mobile.data.local.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.math.BigDecimal
import java.math.RoundingMode

data class DemoSnapshot(
    val usuarios: List<UsuarioEntity> = emptyList(),
    val productos: List<ProductoEntity> = emptyList(),
    val propuestas: List<PropuestaEntity> = emptyList(),
    val subastas: List<SubastaEntity> = emptyList(),
    val pujas: List<PujaEntity> = emptyList(),
    val favoritos: List<FavoritoEntity> = emptyList()
)

/** All mutation rules also live here, so UI and tests use the same local workflow. */
class TruecRepository(private val db: TruecDatabase, private val clock: () -> Long = System::currentTimeMillis) {
    private val dao = db.dao()

    // Read a consistent snapshot after any relevant table changes, including edits and deletes.
    fun observe(): Flow<DemoSnapshot> = db.invalidationTracker.createFlow(
        "usuarios", "productos", "propuestas", "subastas", "pujas", "favoritos", "demo_metadata"
    ).map { snapshot() }

    suspend fun snapshot(): DemoSnapshot = db.withTransaction {
        DemoSnapshot(dao.usuarios(), dao.productos(), dao.propuestas(), dao.subastas(), dao.pujas(), dao.favoritos())
    }

    suspend fun initialize() = db.withTransaction { if (dao.inicializado() == 0) seed() }

    private suspend fun seed() {
        val now = clock()
        dao.insertarUsuarios(listOf(UsuarioEntity(1, "Sergio", "demo@truec.app"),
            UsuarioEntity(2, "Carlos M.", "carlos@example.com"), UsuarioEntity(3, "Ana R.", "ana@example.com")))
        listOf(
            ProductoEntity(1, 2, "PlayStation 5 Digital", "Consolas", "Excelente", 850000),
            ProductoEntity(2, 2, "MacBook Air M2", "Laptops", "Como nuevo", 1990000, aceptaTrueque = false),
            ProductoEntity(3, 3, "iPhone 14 Pro Max", "Celulares", "Seminuevo", 1420000),
            ProductoEntity(4, 2, "Nintendo Switch OLED", "Consolas", "Buen estado", 580000),
            ProductoEntity(5, 3, "Audífonos Sony XM5", "Audio", "Excelente", 490000),
            ProductoEntity(6, 1, "iPhone 12 Pro", "Celulares", "Excelente", 720000),
            ProductoEntity(7, 1, "AirPods Pro 2", "Audio", "Como nuevo", 350000),
            ProductoEntity(8, 1, "iPad Air 5", "Tablets", "Buen estado", 980000)
        ).forEach { dao.insertarProducto(it) }
        dao.insertarSubasta(SubastaEntity(1, 1, 300000, now + 300_000))
        dao.insertarPuja(PujaEntity(subastaId = 1, usuarioId = 3, montoCentavos = 350000, fecha = now))
        dao.insertarPropuesta(PropuestaEntity(emisorId = 2, receptorId = 1, deseadoId = 6, ofrecidoId = 4,
            mensaje = "¿Intercambiamos? Mi consola incluye caja y controles originales.", fecha = now))
        dao.insertarPropuesta(PropuestaEntity(emisorId = 3, receptorId = 1, deseadoId = 7, ofrecidoId = 5,
            mensaje = "Me interesan tus AirPods. Puedes revisar los audífonos antes del trato.", fecha = now - 60000))
        dao.insertarMetadata(DemoMetadata())
    }

    suspend fun reset() = db.withTransaction {
        dao.borrarFavoritos(); dao.borrarPujas(); dao.borrarPropuestas(); dao.borrarSubastas()
        dao.borrarProductos(); dao.borrarUsuarios(); dao.borrarMetadata()
        seed()
    }

    suspend fun saveProduct(value: ProductoEntity): Long = db.withTransaction {
        require(value.nombre.trim().length in 2..80) { "Escribe un nombre de 2 a 80 caracteres." }
        require(value.categoria in CATEGORIES && value.condicion in CONDITIONS) { "Selecciona categoría y condición válidas." }
        require(value.precioCentavos in 1..MAX_CENTS) { "El precio debe ser mayor que cero y no superar $1,000,000." }
        require(value.descripcion.length <= 600) { "La descripción admite hasta 600 caracteres." }
        require(value.propietarioId == DEMO_USER_ID) { "Solo puedes editar tus publicaciones." }
        val clean = value.copy(nombre = value.nombre.trim(), descripcion = value.descripcion.trim())
        if (value.id == 0L) dao.insertarProducto(clean) else {
            val saved = requireNotNull(dao.producto(value.id)) { "La publicación ya no existe." }
            require(saved.propietarioId == DEMO_USER_ID && saved.activo) { "Esta publicación no se puede editar." }
            dao.actualizarProducto(clean.copy(activo = saved.activo)); value.id
        }
    }

    suspend fun removeProduct(id: Long): Boolean = db.withTransaction {
        val product = requireNotNull(dao.producto(id)) { "La publicación ya no existe." }
        require(product.propietarioId == DEMO_USER_ID) { "Solo puedes retirar tus publicaciones." }
        val archived = dao.referenciasProducto(id) > 0
        if (archived) { dao.archivarProducto(id); dao.cancelarRelacionadas(listOf(id)) } else dao.eliminarProducto(id)
        archived
    }

    suspend fun toggleFavorite(id: Long) = db.withTransaction {
        if (dao.esFavorito(id) > 0) dao.quitarFavorito(id) else {
            require(dao.producto(id)?.activo == true) { "El producto ya no está disponible." }
            dao.insertarFavorito(FavoritoEntity(productoId = id))
        }
    }

    suspend fun propose(wantedId: Long, offeredId: Long, message: String): Long = db.withTransaction {
        val wanted = requireNotNull(dao.producto(wantedId)) { "El producto deseado ya no existe." }
        val offered = requireNotNull(dao.producto(offeredId)) { "Selecciona un artículo de tu inventario." }
        require(wanted.activo && offered.activo && wanted.aceptaTrueque && offered.aceptaTrueque) { "Ambos artículos deben estar disponibles para trueque." }
        require(wanted.propietarioId != DEMO_USER_ID && offered.propietarioId == DEMO_USER_ID) { "Selecciona un producto de otra persona y uno de tu inventario." }
        require(message.length <= 600) { "El mensaje admite hasta 600 caracteres." }
        require(dao.propuestaDuplicada(wantedId, offeredId) == 0) { "Ya tienes una propuesta pendiente con estos artículos." }
        dao.insertarPropuesta(PropuestaEntity(emisorId = DEMO_USER_ID, receptorId = wanted.propietarioId,
            deseadoId = wantedId, ofrecidoId = offeredId, mensaje = message.trim(), fecha = clock()))
    }

    suspend fun resolve(id: Long, status: String) = db.withTransaction {
        val trade = requireNotNull(dao.propuesta(id)) { "La propuesta ya no existe." }
        require(trade.estado == PENDING) { "Esta propuesta ya fue resuelta." }
        require((status == CANCELLED && trade.emisorId == DEMO_USER_ID) ||
            (status in listOf(ACCEPTED, REJECTED) && trade.receptorId == DEMO_USER_ID)) { "No puedes realizar esta acción." }
        if (status == ACCEPTED) {
            val wanted = requireNotNull(dao.producto(trade.deseadoId))
            val offered = requireNotNull(dao.producto(trade.ofrecidoId))
            require(wanted.activo && offered.activo && wanted.aceptaTrueque && offered.aceptaTrueque) { "Uno de los productos ya no está disponible para trueque." }
            require(wanted.propietarioId == trade.receptorId && offered.propietarioId == trade.emisorId) { "Los propietarios de los artículos cambiaron." }
            dao.cambiarEstado(id, status)
            dao.archivarProducto(wanted.id); dao.archivarProducto(offered.id)
            dao.cancelarRelacionadas(listOf(wanted.id, offered.id))
        } else dao.cambiarEstado(id, status)
    }

    suspend fun bid(auctionId: Long, cents: Long): Long = db.withTransaction {
        val auction = requireNotNull(dao.subasta(auctionId)) { "La subasta ya no existe." }
        require(clock() < auction.terminaEn) { "La subasta ha terminado." }
        val product = requireNotNull(dao.producto(auction.productoId))
        require(product.activo && product.propietarioId != DEMO_USER_ID) { "No puedes pujar por este artículo." }
        val top = dao.mayorPuja(auctionId) ?: auction.inicialCentavos
        require(cents in 1..MAX_CENTS && cents > top) { "La oferta debe superar la puja actual y no exceder $1,000,000." }
        dao.insertarPuja(PujaEntity(subastaId = auctionId, usuarioId = DEMO_USER_ID, montoCentavos = cents, fecha = clock()))
    }

    suspend fun finishAuction(id: Long) = db.withTransaction {
        val auction = requireNotNull(dao.subasta(id)) { "La subasta ya no existe." }
        dao.terminarSubasta(id, minOf(clock(), auction.terminaEn))
    }

    companion object {
        const val MAX_CENTS = 100_000_000L
        val CATEGORIES = listOf("Celulares", "Laptops", "Consolas", "Audio", "Tablets", "Videojuegos")
        val CONDITIONS = listOf("Como nuevo", "Excelente", "Seminuevo", "Buen estado")
        fun parseCents(text: String): Long? = try {
            if (!Regex("\\d{1,7}([.,]\\d{1,2})?").matches(text.trim())) null
            else BigDecimal(text.trim().replace(',', '.')).movePointRight(2).setScale(0, RoundingMode.UNNECESSARY)
                .longValueExact().takeIf { it in 1..MAX_CENTS }
        } catch (_: ArithmeticException) { null }
    }
}
