package com.truecapp.mobile.data.registration

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query

@Dao
interface UserDao {
    @Insert
    suspend fun insert(user: User): Long

    @Query("SELECT * FROM users ORDER BY id DESC")
    suspend fun getAll(): List<User>

    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun getById(id: Long): User?

    @Query("SELECT COUNT(*) FROM users")
    suspend fun count(): Int
}
