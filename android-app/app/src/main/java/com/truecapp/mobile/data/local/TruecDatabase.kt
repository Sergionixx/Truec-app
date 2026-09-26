package com.truecapp.mobile.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

@Database(entities = [UsuarioEntity::class, ProductoEntity::class, PropuestaEntity::class,
    SubastaEntity::class, PujaEntity::class, FavoritoEntity::class, DemoMetadata::class],
    version = 2, exportSchema = true)
abstract class TruecDatabase : RoomDatabase() {
    abstract fun dao(): TruecDao

    companion object {
        val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE productos ADD COLUMN imagen TEXT NOT NULL DEFAULT ''")
                ProductPhotos.seedPhotos.forEach { (id, name, photo) ->
                    db.execSQL("UPDATE productos SET imagen = ? WHERE id = ? AND nombre = ?", arrayOf<Any>(photo, id, name))
                }
            }
        }
        @Volatile private var instance: TruecDatabase? = null
        fun getInstance(context: Context): TruecDatabase = instance ?: synchronized(this) {
            instance ?: Room.databaseBuilder(context.applicationContext, TruecDatabase::class.java, "truec.db")
                .addMigrations(MIGRATION_1_2)
                .build().also { instance = it }
        }
    }
}
