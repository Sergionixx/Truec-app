package com.truecapp.mobile.data.local

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

const val DEMO_USER_ID = 1L
const val PENDING = "Pendiente"
const val ACCEPTED = "Aceptada"
const val REJECTED = "Rechazada"
const val CANCELLED = "Cancelada"

@Entity(tableName = "usuarios")
data class UsuarioEntity(@PrimaryKey val id: Long, val nombre: String, val correo: String)

@Entity(tableName = "productos", foreignKeys = [
    ForeignKey(entity = UsuarioEntity::class, parentColumns = ["id"], childColumns = ["propietarioId"])
], indices = [Index("propietarioId")])
data class ProductoEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val propietarioId: Long = DEMO_USER_ID,
    val nombre: String,
    val categoria: String,
    val condicion: String,
    val precioCentavos: Long,
    val descripcion: String = "Equipo cuidado y funcional. Incluye accesorios originales.",
    val aceptaTrueque: Boolean = true,
    val activo: Boolean = true
)

@Entity(tableName = "propuestas", foreignKeys = [
    ForeignKey(entity = UsuarioEntity::class, parentColumns = ["id"], childColumns = ["emisorId"]),
    ForeignKey(entity = UsuarioEntity::class, parentColumns = ["id"], childColumns = ["receptorId"]),
    ForeignKey(entity = ProductoEntity::class, parentColumns = ["id"], childColumns = ["deseadoId"]),
    ForeignKey(entity = ProductoEntity::class, parentColumns = ["id"], childColumns = ["ofrecidoId"])
], indices = [Index("emisorId"), Index("receptorId"), Index("deseadoId"), Index("ofrecidoId")])
data class PropuestaEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val emisorId: Long,
    val receptorId: Long,
    val deseadoId: Long,
    val ofrecidoId: Long,
    val mensaje: String,
    val fecha: Long,
    val estado: String = PENDING
)

@Entity(tableName = "subastas", foreignKeys = [
    ForeignKey(entity = ProductoEntity::class, parentColumns = ["id"], childColumns = ["productoId"])
], indices = [Index("productoId")])
data class SubastaEntity(@PrimaryKey val id: Long, val productoId: Long, val inicialCentavos: Long, val terminaEn: Long)

@Entity(tableName = "pujas", foreignKeys = [
    ForeignKey(entity = SubastaEntity::class, parentColumns = ["id"], childColumns = ["subastaId"]),
    ForeignKey(entity = UsuarioEntity::class, parentColumns = ["id"], childColumns = ["usuarioId"])
], indices = [Index(value = ["subastaId", "montoCentavos"]), Index("usuarioId")])
data class PujaEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val subastaId: Long,
    val usuarioId: Long,
    val montoCentavos: Long,
    val fecha: Long
)

@Entity(tableName = "favoritos", primaryKeys = ["usuarioId", "productoId"], foreignKeys = [
    ForeignKey(entity = UsuarioEntity::class, parentColumns = ["id"], childColumns = ["usuarioId"]),
    ForeignKey(entity = ProductoEntity::class, parentColumns = ["id"], childColumns = ["productoId"], onDelete = ForeignKey.CASCADE)
], indices = [Index("productoId")])
data class FavoritoEntity(val usuarioId: Long = DEMO_USER_ID, val productoId: Long)

// Persisted marker: an empty catalog must not cause seed data to reappear.
@Entity(tableName = "demo_metadata")
data class DemoMetadata(@PrimaryKey val id: Int = 1, val seedVersion: Int = 1)
