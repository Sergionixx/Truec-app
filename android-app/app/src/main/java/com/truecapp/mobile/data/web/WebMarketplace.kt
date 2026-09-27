package com.truecapp.mobile.data.web

import android.os.Build
import androidx.room.withTransaction
import org.json.JSONArray
import org.json.JSONObject
import java.math.BigDecimal
import java.math.RoundingMode
import java.security.MessageDigest
import java.security.SecureRandom
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

data class WebResponse(val status: Int, val body: JSONObject)
private class ApiFailure(val status: Int, override val message: String) : IllegalArgumentException(message)

/** The same API contract used by Victor's HTML; durable, transactional and local to Android. */
class WebMarketplace(private val db: WebDatabase, private val seed: () -> String,
    private val clock: () -> Long = System::currentTimeMillis) {
    private fun fail(status: Int, message: String): Nothing = throw ApiFailure(status, message)
    private fun objects(array: JSONArray) = (0 until array.length()).map { array.getJSONObject(it) }
    private fun list(data: JSONObject, name: String) = objects(data.getJSONArray(name))
    private fun putList(data: JSONObject, name: String, values: List<JSONObject>) { data.put(name, JSONArray(values)) }
    private fun text(value: Any?, name: String, max: Int = 2000): String =
        (value as? String)?.trim()?.takeIf { it.isNotEmpty() && it.length <= max }
            ?: fail(400, "$name es obligatorio y debe tener como máximo $max caracteres.")
    private fun money(value: Any?, zero: Boolean = false): Double {
        if (value !is Number) fail(400, "Importe inválido.")
        val amount = runCatching { BigDecimal(value.toString()).setScale(2, RoundingMode.HALF_UP) }
            .getOrNull() ?: fail(400, "Importe inválido.")
        if (amount < BigDecimal(if (zero) "0" else "0.01") || amount > BigDecimal("10000000")) fail(400, "Importe inválido.")
        return amount.toDouble()
    }
    private fun bytes(length: Int) = ByteArray(length).also { SecureRandom().nextBytes(it) }
    private fun hex(bytes: ByteArray) = bytes.joinToString("") { "%02x".format(it.toInt() and 255) }
    private fun digest(token: String) = hex(MessageDigest.getInstance("SHA-256").digest(token.toByteArray(Charsets.UTF_8)))
    private fun passwordHash(password: String, encoded: String? = null): String {
        val parts = encoded?.split(":")
        val algorithm = parts?.get(0) ?: if (Build.VERSION.SDK_INT >= 26) "PBKDF2WithHmacSHA256" else "PBKDF2WithHmacSHA1"
        val salt = parts?.get(1) ?: hex(bytes(16))
        val spec = PBEKeySpec(password.toCharArray(), salt.toByteArray(Charsets.UTF_8), 210000, 256)
        val result = try { SecretKeyFactory.getInstance(algorithm).generateSecret(spec).encoded } finally { spec.clearPassword() }
        return "$algorithm:$salt:${hex(result)}"
    }
    private fun safeUser(user: JSONObject) = JSONObject(user.toString()).apply { remove("password"); remove("passwordHash") }
    private fun date(value: Long = clock()): String = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        .apply { timeZone = TimeZone.getTimeZone("UTC") }.format(Date(value))
    private fun parseDate(value: String): Long? = runCatching {
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply { isLenient = false; timeZone = TimeZone.getTimeZone("UTC") }.parse(value)?.time
    }.getOrNull()
    private fun next(values: List<JSONObject>) = maxOf(clock(), (values.maxOfOrNull { it.getLong("id") } ?: 0) + 1)
    private fun result(status: Int = 200, vararg fields: Pair<String, Any>) = WebResponse(status,
        JSONObject().apply { fields.forEach { (name, value) -> put(name, value) } })
    private fun owner(item: JSONObject, user: JSONObject) {
        if (item.getLong("sellerId") != user.getLong("id")) fail(403, "Solo el propietario puede modificar este artículo.")
    }
    private fun image(value: Any?): String {
        val source = text(value, "Imagen", 2048)
        if (!source.startsWith("/web/native-photos/") && !source.startsWith("https://")) fail(400, "Usa una imagen de ejemplo o un enlace HTTPS.")
        return source
    }
    private fun productFields(input: JSONObject, previous: JSONObject? = null): JSONObject {
        val merged = JSONObject(previous?.toString() ?: "{}")
        input.keys().forEach { merged.put(it, input.get(it)) }
        return JSONObject().put("name", text(merged.opt("name"), "Nombre", 80))
            .put("price", money(merged.opt("price"))).put("category", text(merged.opt("category"), "Categoría", 80))
            .put("condition", text(merged.opt("condition"), "Condición", 80))
            .put("description", text(merged.opt("description"), "Descripción"))
            .put("img", image(merged.opt("img"))).put("acceptsBarter", merged.optBoolean("acceptsBarter"))
            .put("specs", merged.optJSONArray("specs") ?: JSONArray())
    }
    private fun auctionFields(input: JSONObject, previous: JSONObject? = null): JSONObject {
        val merged = JSONObject(previous?.toString() ?: "{}")
        input.keys().forEach { merged.put(it, input.get(it)) }
        val endsAt = merged.optString("endsAt").ifBlank { date(clock() + 86400000) }
        if ((parseDate(endsAt) ?: 0) <= clock()) fail(400, "La fecha de cierre debe ser futura.")
        return JSONObject().put("name", text(merged.opt("name"), "Nombre", 80))
            .put("startingPrice", money(merged.opt("startingPrice")))
            .put("description", text(merged.opt("description"), "Descripción"))
            .put("img", image(merged.opt("img"))).put("endsAt", endsAt)
    }
    private fun merge(target: JSONObject, fields: JSONObject) { fields.keys().forEach { target.put(it, fields.get(it)) } }
    private fun initial(): JSONObject {
        val data = JSONObject(seed())
        val users = list(data, "users").toMutableList()
        if (users.none { it.getLong("id") == 2L }) users.add(JSONObject()
            .put("id", 2).put("name", "Vendedor de ejemplo").put("email", "vendedor@truec.app")
            .put("password", "demo123").put("rating", 0).put("reviews", 0).put("trades", 0).put("publications", 0))
        users.forEach { user -> user.put("passwordHash", passwordHash(user.getString("password"))); user.remove("password") }
        putList(data, "users", users)
        list(data, "products").forEach { it.put("sellerId", 2) }
        list(data, "trades").forEach { it.put("senderId", 1).put("sellerId", 2) }
        data.put("sessions", JSONArray())
        data.put("auctions", JSONArray(list(data, "products").take(2).mapIndexed { index, product ->
            JSONObject().put("id", index + 1).put("name", product.getString("name"))
                .put("startingPrice", if (index == 0) 3500 else 9500).put("img", product.getString("img"))
                .put("description", product.getString("description")).put("seller", product.getJSONObject("seller").getString("name"))
                .put("sellerId", 2).put("endsAt", date(clock() + 86400000))
        }))
        return data
    }
    suspend fun request(path: String, method: String = "GET", body: JSONObject = JSONObject(), token: String = ""): WebResponse {
        return try {
            db.withTransaction {
                val stored = db.state().read()
                val data = stored?.let(::JSONObject) ?: initial().also { db.state().write(WebState(document = it.toString())) }
                val response = handle(data, path.substringBefore('?'), method, body, token)
                if (method != "GET") db.state().write(WebState(document = data.toString()))
                response
            }
        } catch (failure: ApiFailure) { result(failure.status, "error" to failure.message) }
    }
    private fun handle(data: JSONObject, path: String, method: String, body: JSONObject, token: String): WebResponse {
        if (path == "/api/health" && method == "GET") return result(200, "ok" to true, "service" to "truec-room")
        if (method == "POST" && path in listOf("/api/login", "/api/register")) {
            val email = text(body.opt("email"), "Correo", 254).lowercase(Locale.ROOT)
            val password = text(body.opt("password"), "Contraseña", 256)
            if (!Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$").matches(email)) fail(400, "Correo inválido.")
            val users = list(data, "users").toMutableList()
            var user = users.find { it.getString("email").equals(email, true) }
            if (path == "/api/register") {
                if (user != null) fail(409, "Este correo ya está registrado.")
                if (password.length < 6) fail(400, "La contraseña debe tener al menos 6 caracteres.")
                user = JSONObject().put("id", next(users)).put("name", text(body.opt("name"), "Nombre", 80))
                    .put("email", email).put("passwordHash", passwordHash(password)).put("rating", 0)
                    .put("reviews", 0).put("trades", 0).put("publications", 0)
                users.add(user); putList(data, "users", users)
            } else {
                if (user == null) fail(401, "Correo o contraseña incorrectos.")
                val encoded = user.getString("passwordHash")
                if (!MessageDigest.isEqual(encoded.toByteArray(), passwordHash(password, encoded).toByteArray())) fail(401, "Correo o contraseña incorrectos.")
            }
            val sessionToken = hex(bytes(32))
            putList(data, "sessions", list(data, "sessions").filter { it.getLong("expires") > clock() } +
                JSONObject().put("hash", digest(sessionToken)).put("userId", user!!.getLong("id")).put("expires", clock() + 86400000))
            return result(if (path == "/api/register") 201 else 200, "user" to safeUser(user), "token" to sessionToken)
        }
        if (path == "/api/products" && method == "GET") return result(200, "products" to data.getJSONArray("products"))
        if (path == "/api/auctions" && method == "GET") return result(200, "auctions" to data.getJSONArray("auctions"))
        val bidMatch = Regex("^/api/auctions/(\\d+)/bids$").matchEntire(path)
        val auctionId = bidMatch?.groupValues?.get(1)?.toLong()
        if (bidMatch != null && method == "GET") {
            if (list(data, "auctions").none { it.getLong("id") == auctionId }) fail(404, "Subasta no encontrada.")
            return result(200, "bids" to JSONArray(list(data, "bids").filter { it.getLong("auctionId") == auctionId }.sortedByDescending { it.getDouble("amount") }))
        }
        val session = list(data, "sessions").find { it.getString("hash") == digest(token) && it.getLong("expires") > clock() }
        val user = list(data, "users").find { it.getLong("id") == session?.getLong("userId") } ?: fail(401, "Inicia sesión para continuar.")
        val userId = user.getLong("id")
        if (path == "/api/me" && method == "GET") return result(200, "user" to safeUser(user))
        if (path == "/api/logout" && method == "POST") {
            putList(data, "sessions", list(data, "sessions").filter { it.getString("hash") != digest(token) })
            return result(200, "ok" to true)
        }
        if (path == "/api/products" && method == "POST") {
            val product = productFields(body).put("id", next(list(data, "products"))).put("sellerId", userId)
                .put("seller", JSONObject().put("name", user.getString("name")).put("verified", false).put("rating", user.optDouble("rating", 0.0)).put("sales", 0)).put("createdAt", date())
            putList(data, "products", listOf(product) + list(data, "products"))
            return result(201, "product" to product)
        }
        val productId = Regex("^/api/products/(\\d+)$").matchEntire(path)?.groupValues?.get(1)?.toLong()
        if (productId != null) {
            val product = list(data, "products").find { it.getLong("id") == productId } ?: fail(404, "Producto no encontrado.")
            owner(product, user)
            if (method in listOf("PATCH", "PUT")) { merge(product, productFields(body, product)); return result(200, "product" to product) }
            if (method == "DELETE") {
                if (list(data, "trades").any { it.getLong("wantedProductId") == productId && it.getString("status") == "pending" }) fail(409, "Hay propuestas pendientes para este producto.")
                putList(data, "products", list(data, "products").filter { it.getLong("id") != productId }); return result(200, "ok" to true)
            }
        }
        if (path == "/api/trades" && method == "GET") return result(200, "trades" to JSONArray(list(data, "trades").filter { it.getLong("senderId") == userId || it.getLong("sellerId") == userId }))
        if (path == "/api/trades" && method == "POST") {
            val product = list(data, "products").find { it.getLong("id") == body.optLong("wantedProductId") } ?: fail(404, "Producto no encontrado.")
            if (!product.getBoolean("acceptsBarter") || product.getLong("sellerId") == userId) fail(400, "Este producto no admite esa propuesta.")
            val trade = JSONObject().put("id", next(list(data, "trades"))).put("wantedProductId", product.getLong("id"))
                .put("wantedProductName", product.getString("name")).put("offeredItem", text(body.opt("offeredItem"), "Artículo ofrecido", 80))
                .put("offeredValue", money(body.opt("offeredValue") ?: 0, true)).put("message", body.optString("message").take(2000))
                .put("senderId", userId).put("sellerId", product.getLong("sellerId")).put("senderName", user.getString("name"))
                .put("sellerName", product.getJSONObject("seller").getString("name")).put("status", "pending").put("createdAt", date())
            putList(data, "trades", listOf(trade) + list(data, "trades")); return result(201, "trade" to trade)
        }
        val tradeId = Regex("^/api/trades/(\\d+)$").matchEntire(path)?.groupValues?.get(1)?.toLong()
        if (tradeId != null) {
            val trade = list(data, "trades").find { it.getLong("id") == tradeId } ?: fail(404, "Propuesta no encontrada.")
            if (method == "PATCH") {
                if (trade.getLong("sellerId") != userId) fail(403, "Solo el destinatario puede responder.")
                if (trade.getString("status") != "pending") fail(409, "La propuesta ya fue respondida.")
                val status = body.optString("status")
                if (status !in listOf("accepted", "rejected")) fail(400, "Estado inválido.")
                trade.put("status", status).put("updatedAt", date()); return result(200, "trade" to trade)
            }
            if (method == "DELETE") {
                if (trade.getLong("senderId") != userId || trade.getString("status") != "pending") fail(403, "Solo puedes retirar tus propuestas pendientes.")
                putList(data, "trades", list(data, "trades").filter { it.getLong("id") != tradeId }); return result(200, "ok" to true)
            }
        }
        if (path == "/api/auctions" && method == "POST") {
            val auction = auctionFields(body).put("id", next(list(data, "auctions"))).put("seller", user.getString("name")).put("sellerId", userId).put("createdAt", date())
            putList(data, "auctions", listOf(auction) + list(data, "auctions")); return result(201, "auction" to auction)
        }
        val editAuctionId = Regex("^/api/auctions/(\\d+)$").matchEntire(path)?.groupValues?.get(1)?.toLong()
        if (editAuctionId != null) {
            val auction = list(data, "auctions").find { it.getLong("id") == editAuctionId } ?: fail(404, "Subasta no encontrada.")
            owner(auction, user)
            if (list(data, "bids").any { it.getLong("auctionId") == editAuctionId }) fail(409, "Una subasta con pujas no puede modificarse ni eliminarse.")
            if (method == "PATCH") { merge(auction, auctionFields(body, auction)); return result(200, "auction" to auction) }
            if (method == "DELETE") { putList(data, "auctions", list(data, "auctions").filter { it.getLong("id") != editAuctionId }); return result(200, "ok" to true) }
        }
        if (bidMatch != null && method == "POST") {
            val auction = list(data, "auctions").find { it.getLong("id") == auctionId } ?: fail(404, "Subasta no encontrada.")
            if (auction.getLong("sellerId") == userId) fail(403, "No puedes pujar en tu propia subasta.")
            if ((parseDate(auction.getString("endsAt")) ?: 0) <= clock()) fail(409, "La subasta ha terminado.")
            val amount = money(body.opt("amount"))
            val top = maxOf(auction.getDouble("startingPrice"), list(data, "bids").filter { it.getLong("auctionId") == auctionId }.maxOfOrNull { it.getDouble("amount") } ?: 0.0)
            if (amount <= top) fail(409, "La puja debe superar $$top.")
            val bid = JSONObject().put("id", next(list(data, "bids"))).put("auctionId", auctionId).put("userId", userId)
                .put("user", user.getString("name")).put("amount", amount).put("time", "Ahora mismo")
                .put("avatar", user.getString("name").take(2).uppercase(Locale.ROOT)).put("createdAt", date())
            putList(data, "bids", listOf(bid) + list(data, "bids")); return result(201, "bid" to bid)
        }
        fail(404, "Ruta no encontrada.")
    }
}
