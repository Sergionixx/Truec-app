package com.truecapp.mobile

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.truecapp.mobile.data.local.*
import com.truecapp.mobile.data.repository.TruecRepository
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import java.util.UUID

@RunWith(AndroidJUnit4::class)
class RoomWorkflowTest {
    private val context = ApplicationProvider.getApplicationContext<Context>()
    private val filename = "room-test-${UUID.randomUUID()}.db"
    private lateinit var db: TruecDatabase
    private lateinit var repository: TruecRepository
    private var now = 1_800_000_000_000L

    private fun open() {
        db = Room.databaseBuilder(context, TruecDatabase::class.java, filename).build()
        repository = TruecRepository(db) { now }
    }
    @Before fun setup() = runBlocking { open(); repository.initialize() }
    @After fun cleanup() { db.close(); context.deleteDatabase(filename) }

    @Test fun productCrudPersistsAcrossReopenAndDoesNotReseed() = runBlocking {
        val id = repository.saveProduct(ProductoEntity(nombre = "Control de prueba", categoria = "Consolas", condicion = "Excelente", precioCentavos = 150050))
        repository.saveProduct(db.dao().producto(id)!!.copy(nombre = "Control editado", precioCentavos = 120000))
        db.close(); open(); repository.initialize()
        assertEquals("Control editado", db.dao().producto(id)?.nombre)
        assertEquals(120000L, db.dao().producto(id)?.precioCentavos)
        assertEquals(9, repository.snapshot().productos.size)
        assertFalse(repository.removeProduct(id))
        assertNull(db.dao().producto(id))
        db.close(); open(); repository.initialize()
        assertEquals(8, repository.snapshot().productos.size)
        assertEquals(2, repository.snapshot().propuestas.size)
    }

    @Test fun favoritesAreUniqueAndCascadeWhenOwnProductIsDeleted() = runBlocking {
        val id = repository.saveProduct(ProductoEntity(nombre = "Audífonos de prueba", categoria = "Audio", condicion = "Excelente", precioCentavos = 20000))
        db.dao().insertarFavorito(FavoritoEntity(productoId = id))
        assertEquals(-1L, db.dao().insertarFavorito(FavoritoEntity(productoId = id)))
        assertEquals(1, repository.snapshot().favoritos.size)
        repository.removeProduct(id)
        assertTrue(repository.snapshot().favoritos.isEmpty())
    }

    @Test fun proposalUsesSelectedProductAndRejectsDuplicateAndIneligibleProducts() = runBlocking {
        val id = repository.propose(3, 8, "Incluye cargador")
        assertEquals(3L, db.dao().propuesta(id)?.deseadoId)
        assertEquals(8L, db.dao().propuesta(id)?.ofrecidoId)
        assertTrue(runCatching { repository.propose(3, 8, "Duplicada") }.isFailure)
        assertTrue(runCatching { repository.propose(2, 6, "No acepta trueque") }.isFailure)
        assertTrue(runCatching { repository.propose(7, 6, "Producto propio") }.isFailure)
        assertTrue(runCatching { repository.propose(3, 4, "Inventario ajeno") }.isFailure)
        db.close(); open(); repository.initialize()
        assertEquals("Incluye cargador", db.dao().propuesta(id)?.mensaje)
    }

    @Test fun acceptingProposalArchivesProductsAndCancelsCompetingProposalsAtomically() = runBlocking {
        val received = repository.snapshot().propuestas.first { it.deseadoId == 6L }
        val competing = repository.propose(4, 6, "Propuesta inversa")
        repository.resolve(received.id, ACCEPTED)
        assertEquals(ACCEPTED, db.dao().propuesta(received.id)?.estado)
        assertEquals(CANCELLED, db.dao().propuesta(competing)?.estado)
        assertEquals(false, db.dao().producto(6)?.activo)
        assertEquals(false, db.dao().producto(4)?.activo)
        assertTrue(runCatching { repository.resolve(received.id, REJECTED) }.isFailure)
        assertTrue(runCatching { repository.propose(3, 6, "Archivado") }.isFailure)
        assertEquals(ACCEPTED, db.dao().propuesta(received.id)?.estado)
    }

    @Test fun permissionsAndForeignKeysRejectInvalidChanges() = runBlocking {
        val received = repository.snapshot().propuestas.first()
        assertTrue(runCatching { repository.resolve(received.id, CANCELLED) }.isFailure)
        assertTrue(runCatching { repository.removeProduct(3) }.isFailure)
        assertTrue(runCatching { repository.saveProduct(db.dao().producto(3)!!.copy(nombre = "Ajeno")) }.isFailure)
        assertTrue(runCatching { db.dao().insertarPropuesta(PropuestaEntity(emisorId = 1, receptorId = 2, deseadoId = 99999, ofrecidoId = 6, mensaje = "", fecha = now)) }.isFailure)
        assertEquals(PENDING, db.dao().propuesta(received.id)?.estado)
    }

    @Test fun referencedProductIsArchivedAndPendingProposalsCancelled() = runBlocking {
        val received = repository.snapshot().propuestas.first { it.deseadoId == 7L }
        assertTrue(repository.removeProduct(7))
        assertEquals(false, db.dao().producto(7)?.activo)
        assertEquals(CANCELLED, db.dao().propuesta(received.id)?.estado)
    }

    @Test fun bidsPersistAndRejectInsufficientDuplicateAndExpiredOffers() = runBlocking {
        assertTrue(runCatching { repository.bid(1, 350000) }.isFailure)
        repository.bid(1, 360050)
        assertTrue(runCatching { repository.bid(1, 360050) }.isFailure)
        db.close(); open(); repository.initialize()
        assertEquals(360050L, db.dao().mayorPuja(1))
        assertEquals(DEMO_USER_ID, repository.snapshot().pujas.first().usuarioId)
        now = db.dao().subasta(1)!!.terminaEn
        assertTrue(runCatching { repository.bid(1, 400000) }.isFailure)
        assertEquals(2, repository.snapshot().pujas.size)
    }

    @Test fun competingEqualBidsCannotBothSucceed() = runBlocking {
        val results = List(2) { async(Dispatchers.IO) { runCatching { repository.bid(1, 400000) }.isSuccess } }.awaitAll()
        assertEquals(1, results.count { it })
        assertEquals(2, repository.snapshot().pujas.size)
    }

    @Test fun observableDataReflectsEditsNotOnlyRowCounts() = runBlocking {
        val emission = async(start = CoroutineStart.UNDISPATCHED) {
            withTimeout(10000) { repository.observe().first { data -> data.productos.any { it.nombre == "Nombre actualizado" } } }
        }
        repository.saveProduct(db.dao().producto(8)!!.copy(nombre = "Nombre actualizado"))
        assertEquals("Nombre actualizado", emission.await().productos.first { it.id == 8L }.nombre)
    }

    @Test fun explicitResetRecreatesDemoAndRestartsAuction() = runBlocking {
        repository.bid(1, 400000); repository.toggleFavorite(3); repository.finishAuction(1)
        assertTrue(runCatching { repository.bid(1, 500000) }.isFailure)
        now += 10000
        repository.reset(); repository.initialize()
        assertEquals(1, repository.snapshot().pujas.size)
        assertEquals(2, repository.snapshot().propuestas.size)
        assertEquals(8, repository.snapshot().productos.size)
        assertTrue(repository.snapshot().favoritos.isEmpty())
        assertEquals(now + 300000, db.dao().subasta(1)?.terminaEn)
    }

    @Test fun pricesKeepCentsAndRejectInvalidInputs() {
        assertEquals(150050L, TruecRepository.parseCents("1500.50"))
        assertEquals(1050L, TruecRepository.parseCents("10,50"))
        listOf("", "0", "-1", "NaN", "1.001", "1000001", "1e4", "1,000.50").forEach { assertNull(it, TruecRepository.parseCents(it)) }
    }
}
