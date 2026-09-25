package com.truecapp.mobile.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [UsuarioEntity::class, ProductoEntity::class, PropuestaEntity::class,
    SubastaEntity::class, PujaEntity::class, FavoritoEntity::class, DemoMetadata::class],
    version = 1, exportSchema = true)
abstract class TruecDatabase : RoomDatabase() {
    abstract fun dao(): TruecDao

    companion object {
        @Volatile private var instance: TruecDatabase? = null
        fun getInstance(context: Context): TruecDatabase = instance ?: synchronized(this) {
            instance ?: Room.databaseBuilder(context.applicationContext, TruecDatabase::class.java, "truec.db")
                .build().also { instance = it }
        }
    }
}
