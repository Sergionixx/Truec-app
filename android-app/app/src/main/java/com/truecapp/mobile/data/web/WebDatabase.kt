package com.truecapp.mobile.data.web

import android.content.Context
import androidx.room.*

@Entity(tableName = "marketplace_state")
data class WebState(@PrimaryKey val id: Int = 1, val document: String)

@Dao
interface WebStateDao {
    @Query("SELECT document FROM marketplace_state WHERE id = 1")
    suspend fun read(): String?
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun write(state: WebState)
}

@Database(entities = [WebState::class], version = 1, exportSchema = true)
abstract class WebDatabase : RoomDatabase() {
    abstract fun state(): WebStateDao
    companion object {
        @Volatile private var instance: WebDatabase? = null
        fun getInstance(context: Context): WebDatabase = instance ?: synchronized(this) {
            instance ?: Room.databaseBuilder(context.applicationContext, WebDatabase::class.java,
                "victor_marketplace.db").build().also { instance = it }
        }
    }
}
