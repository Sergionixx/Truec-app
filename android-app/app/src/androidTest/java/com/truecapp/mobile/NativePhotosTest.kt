package com.truecapp.mobile

import android.content.Context
import android.content.Intent
import android.database.sqlite.SQLiteDatabase
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import coil.imageLoader
import coil.request.ImageRequest
import coil.request.SuccessResult
import com.truecapp.mobile.data.local.*
import com.truecapp.mobile.data.repository.TruecRepository
import kotlinx.coroutines.runBlocking
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.util.UUID

@RunWith(AndroidJUnit4::class)
class NativePhotosTest {
    private val context = ApplicationProvider.getApplicationContext<Context>()

    @Test fun launcherOpensNativeMarketplace() {
        val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        assertNotNull(intent)
        assertEquals(DemoActivity::class.java.name, intent!!.component!!.className)
        assertTrue(intent.hasCategory(Intent.CATEGORY_LAUNCHER))
    }

    @Test fun everyBundledPhotoDecodesWithoutNetwork() = runBlocking {
        ProductPhotos.presets.forEach { (_, source) ->
            val result = context.imageLoader.execute(ImageRequest.Builder(context).data(source).build())
            assertTrue("Cannot decode bundled photo: $source", result is SuccessResult)
            assertTrue(result.drawable!!.intrinsicWidth >= 300)
        }
    }

    @Test fun photoSourcesSurviveEditsAndDatabaseReopen() = runBlocking {
        val filename = "photos-${UUID.randomUUID()}.db"
        var db = Room.databaseBuilder(context, TruecDatabase::class.java, filename).build()
        try {
            var repo = TruecRepository(db)
            repo.initialize()
            val image = "content://media/picker/example-photo"
            val id = repo.saveProduct(ProductoEntity(nombre = "Mi teléfono", categoria = "Celulares",
                condicion = "Excelente", precioCentavos = 100000, imagen = image))
            repo.saveProduct(db.dao().producto(id)!!.copy(nombre = "Teléfono editado"))
            db.close()
            db = Room.databaseBuilder(context, TruecDatabase::class.java, filename).build()
            repo = TruecRepository(db)
            repo.initialize()
            assertEquals(image, db.dao().producto(id)!!.imagen)
            assertEquals("Teléfono editado", db.dao().producto(id)!!.nombre)
            val https = "https://example.com/my-product.jpg"
            repo.saveProduct(db.dao().producto(id)!!.copy(imagen = https))
            assertEquals(https, db.dao().producto(id)!!.imagen)
            assertTrue(runCatching { repo.saveProduct(db.dao().producto(id)!!.copy(imagen = "http://example.com/photo.jpg")) }.isFailure)
        } finally { db.close(); context.deleteDatabase(filename) }
    }

    @Test fun versionOneUpgradePreservesAllWorkflowsAndAddsPhotos() = runBlocking {
        val filename = "migration-${UUID.randomUUID()}.db"
        val schemaText = InstrumentationRegistry.getInstrumentation().context.assets
            .open("com.truecapp.mobile.data.local.TruecDatabase/1.json").bufferedReader().use { it.readText() }
        val schema = JSONObject(schemaText).getJSONObject("database")
        val legacy = SQLiteDatabase.openOrCreateDatabase(context.getDatabasePath(filename), null)
        legacy.use { old ->
            val entities = schema.getJSONArray("entities")
            for (index in 0 until entities.length()) {
                val entity = entities.getJSONObject(index)
                val table = entity.getString("tableName")
                old.execSQL(entity.getString("createSql").replace("\${TABLE_NAME}", table))
                val indices = entity.optJSONArray("indices") ?: org.json.JSONArray()
                for (i in 0 until indices.length()) old.execSQL(indices.getJSONObject(i).getString("createSql").replace("\${TABLE_NAME}", table))
            }
            val setup = schema.getJSONArray("setupQueries")
            for (i in 0 until setup.length()) old.execSQL(setup.getString(i))
            old.execSQL("INSERT INTO usuarios VALUES (1, 'Sergio', 'demo@truec.app'), (2, 'Carlos', 'carlos@example.com')")
            old.execSQL("INSERT INTO productos VALUES (1, 2, 'PlayStation 5 Digital', 'Consolas', 'Excelente', 850000, 'Sample', 1, 1), (9, 1, 'Mi producto', 'Audio', 'Excelente', 100000, 'Personal', 1, 1)")
            old.execSQL("INSERT INTO propuestas VALUES (1, 1, 2, 1, 9, 'Conservar mensaje', 1000, 'Pendiente')")
            old.execSQL("INSERT INTO subastas VALUES (1, 1, 300000, 9999999999999)")
            old.execSQL("INSERT INTO pujas VALUES (1, 1, 1, 350000, 1000)")
            old.execSQL("INSERT INTO favoritos VALUES (1, 1)")
            old.execSQL("INSERT INTO demo_metadata VALUES (1, 1)")
            old.version = 1
        }
        val db = Room.databaseBuilder(context, TruecDatabase::class.java, filename)
            .addMigrations(TruecDatabase.MIGRATION_1_2).build()
        try {
            val repo = TruecRepository(db)
            repo.initialize()
            val snapshot = repo.snapshot()
            assertEquals(2, snapshot.productos.size)
            assertEquals(ProductPhotos.PS5, db.dao().producto(1)!!.imagen)
            assertEquals("", db.dao().producto(9)!!.imagen)
            assertEquals("Personal", db.dao().producto(9)!!.descripcion)
            assertEquals("Conservar mensaje", snapshot.propuestas.single().mensaje)
            assertEquals(350000L, snapshot.pujas.single().montoCentavos)
            assertEquals(1, snapshot.favoritos.size)
            assertEquals(1, snapshot.subastas.size)
        } finally { db.close(); context.deleteDatabase(filename) }
    }
}
