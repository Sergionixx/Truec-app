package com.truecapp.mobile

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.truecapp.mobile.data.web.WebDatabase
import com.truecapp.mobile.data.web.WebMarketplace
import kotlinx.coroutines.runBlocking
import org.json.JSONObject
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import java.util.UUID

@RunWith(AndroidJUnit4::class)
class VictorWebTest {
    private val context = ApplicationProvider.getApplicationContext<Context>()
    private fun seed() = context.assets.open("native-seed.json").bufferedReader().use { it.readText() }

    @Test fun bundledVictorApiPersistsRegistrationProductsAndTrades() = runBlocking {
        val name = "victor-test-${UUID.randomUUID()}.db"
        var db = Room.databaseBuilder(context, WebDatabase::class.java, name).build()
        try {
            var api = WebMarketplace(db, ::seed)
            val products = api.request("/api/products").body.getJSONArray("products")
            assertTrue(products.length() >= 5)
            assertTrue(products.getJSONObject(0).getString("img").startsWith("/web/native-photos/"))
            val registered = api.request("/api/register", "POST", JSONObject()
                .put("name", "Persona nueva").put("email", "new@example.com").put("password", "secret123"))
            assertEquals(201, registered.status)
            val token = registered.body.getString("token")
            assertEquals(409, api.request("/api/register", "POST", JSONObject()
                .put("name", "Duplicada").put("email", "new@example.com").put("password", "secret123")).status)
            val item = api.request("/api/products", "POST", JSONObject()
                .put("name", "Mi consola").put("price", 999.50).put("category", "Consolas")
                .put("condition", "Excelente").put("description", "Probada en Android")
                .put("img", "/web/native-photos/ps5.jpg").put("acceptsBarter", true), token)
            assertEquals(201, item.status)
            val id = item.body.getJSONObject("product").getLong("id")
            val unauthenticated = api.request("/api/products/$id", "PATCH", JSONObject().put("name", "No"))
            assertEquals(401, unauthenticated.status)
            assertEquals(400, api.request("/api/products/$id", "PATCH", JSONObject().put("price", -1), token).status)
            val trade = api.request("/api/trades", "POST", JSONObject().put("wantedProductId", 1)
                .put("offeredItem", "Mi consola").put("offeredValue", 999.50).put("message", "Intercambio"), token)
            assertEquals(201, trade.status)
            db.close()
            db = Room.databaseBuilder(context, WebDatabase::class.java, name).build()
            api = WebMarketplace(db, ::seed)
            assertTrue((0 until api.request("/api/products").body.getJSONArray("products").length()).any {
                api.request("/api/products").body.getJSONArray("products").getJSONObject(it).getLong("id") == id
            })
            assertEquals(1, api.request("/api/trades", token = token).body.getJSONArray("trades").length())
            assertEquals(200, api.request("/api/login", "POST", JSONObject()
                .put("email", "new@example.com").put("password", "secret123")).status)
        } finally { db.close(); context.deleteDatabase(name) }
    }

    @Test fun bidsAreScopedAndValidated() = runBlocking {
        val name = "victor-bids-${UUID.randomUUID()}.db"
        val db = Room.databaseBuilder(context, WebDatabase::class.java, name).build()
        try {
            val api = WebMarketplace(db, ::seed)
            val token = api.request("/api/login", "POST", JSONObject()
                .put("email", "demo@truec.app").put("password", "demo123")).body.getString("token")
            assertEquals(404, api.request("/api/auctions/99999/bids", "POST", JSONObject().put("amount", 5000), token).status)
            assertEquals(409, api.request("/api/auctions/1/bids", "POST", JSONObject().put("amount", 1), token).status)
            assertEquals(201, api.request("/api/auctions/1/bids", "POST", JSONObject().put("amount", 9000), token).status)
            assertEquals(409, api.request("/api/auctions/1/bids", "POST", JSONObject().put("amount", 9000), token).status)
            val first = api.request("/api/auctions/1/bids").body.getJSONArray("bids")
            val second = api.request("/api/auctions/2/bids").body.getJSONArray("bids")
            assertTrue(first.length() > second.length())
            assertFalse((0 until second.length()).any { second.getJSONObject(it).getDouble("amount") == 9000.0 })
        } finally { db.close(); context.deleteDatabase(name) }
    }
}
