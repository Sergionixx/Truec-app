package com.truecapp.mobile.data.local

import androidx.room.*

@Dao
interface TruecDao {
    @Query("SELECT * FROM usuarios ORDER BY id") suspend fun usuarios(): List<UsuarioEntity>
    @Query("SELECT * FROM productos ORDER BY id DESC") suspend fun productos(): List<ProductoEntity>
    @Query("SELECT * FROM propuestas ORDER BY fecha DESC, id DESC") suspend fun propuestas(): List<PropuestaEntity>
    @Query("SELECT * FROM subastas ORDER BY id") suspend fun subastas(): List<SubastaEntity>
    @Query("SELECT * FROM pujas ORDER BY montoCentavos DESC, id DESC") suspend fun pujas(): List<PujaEntity>
    @Query("SELECT * FROM favoritos WHERE usuarioId = :usuarioId") suspend fun favoritos(usuarioId: Long = DEMO_USER_ID): List<FavoritoEntity>
    @Query("SELECT * FROM productos WHERE id = :id") suspend fun producto(id: Long): ProductoEntity?
    @Query("SELECT * FROM propuestas WHERE id = :id") suspend fun propuesta(id: Long): PropuestaEntity?
    @Query("SELECT * FROM subastas WHERE id = :id") suspend fun subasta(id: Long): SubastaEntity?
    @Query("SELECT MAX(montoCentavos) FROM pujas WHERE subastaId = :id") suspend fun mayorPuja(id: Long): Long?
    @Query("SELECT COUNT(*) FROM demo_metadata WHERE id = 1") suspend fun inicializado(): Int

    @Insert suspend fun insertarUsuarios(values: List<UsuarioEntity>)
    @Insert suspend fun insertarProducto(value: ProductoEntity): Long
    @Insert suspend fun insertarPropuesta(value: PropuestaEntity): Long
    @Insert suspend fun insertarSubasta(value: SubastaEntity)
    @Insert suspend fun insertarPuja(value: PujaEntity): Long
    @Insert(onConflict = OnConflictStrategy.IGNORE) suspend fun insertarFavorito(value: FavoritoEntity): Long
    @Insert suspend fun insertarMetadata(value: DemoMetadata)
    @Update suspend fun actualizarProducto(value: ProductoEntity): Int
    @Query("DELETE FROM productos WHERE id = :id") suspend fun eliminarProducto(id: Long)
    @Query("UPDATE productos SET activo = 0 WHERE id = :id") suspend fun archivarProducto(id: Long)
    @Query("DELETE FROM favoritos WHERE usuarioId = :usuarioId AND productoId = :productoId")
    suspend fun quitarFavorito(productoId: Long, usuarioId: Long = DEMO_USER_ID)
    @Query("SELECT COUNT(*) FROM favoritos WHERE usuarioId = :usuarioId AND productoId = :productoId")
    suspend fun esFavorito(productoId: Long, usuarioId: Long = DEMO_USER_ID): Int
    @Query("SELECT (SELECT COUNT(*) FROM propuestas WHERE deseadoId = :id OR ofrecidoId = :id) + (SELECT COUNT(*) FROM subastas WHERE productoId = :id)")
    suspend fun referenciasProducto(id: Long): Int
    @Query("SELECT COUNT(*) FROM propuestas WHERE deseadoId = :deseado AND ofrecidoId = :ofrecido AND emisorId = :usuario AND estado = 'Pendiente'")
    suspend fun propuestaDuplicada(deseado: Long, ofrecido: Long, usuario: Long = DEMO_USER_ID): Int
    @Query("UPDATE propuestas SET estado = :estado WHERE id = :id AND estado = 'Pendiente'")
    suspend fun cambiarEstado(id: Long, estado: String): Int
    @Query("UPDATE propuestas SET estado = 'Cancelada' WHERE estado = 'Pendiente' AND (deseadoId IN (:ids) OR ofrecidoId IN (:ids))")
    suspend fun cancelarRelacionadas(ids: List<Long>)
    @Query("UPDATE subastas SET terminaEn = :fecha WHERE id = :id") suspend fun terminarSubasta(id: Long, fecha: Long)
    @Query("DELETE FROM favoritos") suspend fun borrarFavoritos()
    @Query("DELETE FROM pujas") suspend fun borrarPujas()
    @Query("DELETE FROM propuestas") suspend fun borrarPropuestas()
    @Query("DELETE FROM subastas") suspend fun borrarSubastas()
    @Query("DELETE FROM productos") suspend fun borrarProductos()
    @Query("DELETE FROM usuarios") suspend fun borrarUsuarios()
    @Query("DELETE FROM demo_metadata") suspend fun borrarMetadata()
}
