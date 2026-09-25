package com.truecapp.mobile.data.registration

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "users")
data class User(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val nombre: String,
    val apellidos: String,
    val direccion: String,
    val telefono: String
)
