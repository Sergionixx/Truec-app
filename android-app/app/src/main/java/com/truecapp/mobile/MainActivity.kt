package com.truecapp.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

private val Teal = Color(0xFF00897B)
private val Navy = Color(0xFF1E3A8A)
private val Amber = Color(0xFFF59E0B)
private val Background = Color(0xFFF8FAFC)
private val Muted = Color(0xFF64748B)

private enum class Screen { Login, Home, Detail, Trade, Auction }
private data class Product(val id: Int, val name: String, val price: Int, val condition: String, val category: String)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { TruecTheme { TruecApp() } }
    }
}

@Composable
private fun TruecTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = lightColorScheme(primary = Teal, secondary = Navy, tertiary = Amber, background = Background), content = content)
}

@Composable
private fun TruecApp() {
    var screen by remember { mutableStateOf(Screen.Login) }
    Surface(modifier = Modifier.fillMaxSize(), color = Background) {
        when (screen) {
            Screen.Login -> LoginScreen { screen = Screen.Home }
            Screen.Home -> HomeScreen(onProduct = { screen = Screen.Detail }, onNavigate = { screen = it })
            Screen.Detail -> DetailScreen(onBack = { screen = Screen.Home }, onTrade = { screen = Screen.Trade }, onNavigate = { screen = it })
            Screen.Trade -> TradeScreen(onBack = { screen = Screen.Detail }, onNavigate = { screen = it })
            Screen.Auction -> AuctionScreen(onNavigate = { screen = it })
        }
    }
}

@Composable
private fun LoginScreen(onSuccess: () -> Unit) {
    var email by remember { mutableStateOf("demo@truec.app") }
    var password by remember { mutableStateOf("demo123") }
    var message by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    Column(Modifier.fillMaxSize().padding(28.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Box(Modifier.size(84.dp).background(Teal, RoundedCornerShape(42.dp)), contentAlignment = Alignment.Center) {
            Text("T", color = Color.White, fontSize = 36.sp, fontWeight = FontWeight.Bold)
        }
        Spacer(Modifier.height(16.dp))
        Text("Truec-app", fontSize = 30.sp, fontWeight = FontWeight.ExtraBold)
        Text("Compra, subasta e intercambia tecnología", color = Muted)
        Spacer(Modifier.height(32.dp))
        OutlinedTextField(email, { email = it }, label = { Text("Correo electrónico") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(password, { password = it }, label = { Text("Contraseña") }, modifier = Modifier.fillMaxWidth(), singleLine = true, visualTransformation = PasswordVisualTransformation())
        Spacer(Modifier.height(18.dp))
        Button(onClick = {
            loading = true; message = ""
            scope.launch {
                runCatching { Api.post("/api/login", JSONObject().put("email", email).put("password", password)) }
                    .onSuccess { onSuccess() }.onFailure { message = it.message ?: "Error de conexión" }
                loading = false
            }
        }, enabled = !loading, modifier = Modifier.fillMaxWidth().height(52.dp)) { Text(if (loading) "Conectando…" else "Iniciar sesión") }
        if (message.isNotBlank()) Text(message, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 12.dp))
        Spacer(Modifier.height(12.dp))
        Text("Demo: demo@truec.app / demo123", color = Muted, fontSize = 12.sp)
    }
}

@Composable
private fun HomeScreen(onProduct: () -> Unit, onNavigate: (Screen) -> Unit) {
    val products = listOf(
        Product(1, "PlayStation 5 Digital", 8500, "Excelente estado", "Consolas"),
        Product(2, "MacBook Air M2", 19900, "Como nuevo", "Laptops"),
        Product(3, "iPhone 14 Pro Max", 14200, "Seminuevo", "Celulares"),
        Product(4, "Nintendo Switch OLED", 5800, "Buen estado", "Consolas")
    )
    var query by remember { mutableStateOf("") }
    Scaffold(bottomBar = { BottomNavigation(Screen.Home, onNavigate) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = 16.dp)) {
            Text("Explora tecnología", fontSize = 24.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 18.dp, bottom = 12.dp))
            OutlinedTextField(query, { query = it }, label = { Text("Buscar productos") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            LazyColumn(contentPadding = PaddingValues(vertical = 14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(products.filter { it.name.contains(query, true) || it.category.contains(query, true) }) { product ->
                    Card(Modifier.fillMaxWidth().clickable { onProduct() }) {
                        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                            Box(Modifier.size(72.dp).background(Color(0xFFE0F2F1), RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) { Text(product.category.take(1), color = Teal, fontSize = 28.sp, fontWeight = FontWeight.Bold) }
                            Column(Modifier.padding(start = 14.dp)) {
                                Text(product.name, fontWeight = FontWeight.Bold)
                                Text(product.condition, color = Muted, fontSize = 13.sp)
                                Text("$${product.price} MXN", color = Teal, fontSize = 19.sp, fontWeight = FontWeight.ExtraBold)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun DetailScreen(onBack: () -> Unit, onTrade: () -> Unit, onNavigate: (Screen) -> Unit) {
    Scaffold(bottomBar = { BottomNavigation(Screen.Home, onNavigate) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(18.dp)) {
            TextButton(onClick = onBack) { Text("← Volver al catálogo") }
            Box(Modifier.fillMaxWidth().height(220.dp).background(Color(0xFFE0F2F1), RoundedCornerShape(20.dp)), contentAlignment = Alignment.Center) { Text("PS5", color = Teal, fontSize = 58.sp, fontWeight = FontWeight.ExtraBold) }
            Spacer(Modifier.height(20.dp))
            Text("PlayStation 5 Digital", fontSize = 25.sp, fontWeight = FontWeight.Bold)
            Text("$8,500 MXN", fontSize = 30.sp, color = Teal, fontWeight = FontWeight.ExtraBold)
            Text("Excelente estado · Acepta trueque", color = Muted)
            HorizontalDivider(Modifier.padding(vertical = 18.dp))
            Text("Publicado por Carlos M. ★ 4.8", fontWeight = FontWeight.SemiBold)
            Text("Consola cuidada, control original y todos sus cables. Entrega en punto acordado.", modifier = Modifier.padding(top = 10.dp), lineHeight = 22.sp)
            Spacer(Modifier.weight(1f))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(onClick = {}, colors = ButtonDefaults.buttonColors(containerColor = Navy), modifier = Modifier.weight(1f)) { Text("Comprar") }
                Button(onClick = onTrade, modifier = Modifier.weight(1f)) { Text("Proponer trueque") }
            }
        }
    }
}

@Composable
private fun TradeScreen(onBack: () -> Unit, onNavigate: (Screen) -> Unit) {
    val items = listOf("iPhone 12 Pro", "AirPods Pro 2", "iPad Air 5")
    var selected by remember { mutableIntStateOf(0) }
    var note by remember { mutableStateOf("") }
    var status by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    Scaffold(bottomBar = { BottomNavigation(Screen.Trade, onNavigate) }) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding).padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            item { TextButton(onClick = onBack) { Text("← Volver") }; Text("Proponer intercambio", fontSize = 24.sp, fontWeight = FontWeight.Bold) }
            item { InfoCard("Quieres recibir", "PlayStation 5 Digital · $8,500 MXN") }
            item { Text("Elige un producto de tu inventario", fontWeight = FontWeight.SemiBold) }
            items(items.indices.toList()) { index ->
                OutlinedCard(Modifier.fillMaxWidth().clickable { selected = index }, colors = CardDefaults.outlinedCardColors(containerColor = if (selected == index) Color(0xFFE0F2F1) else Color.White)) {
                    Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) { RadioButton(selected == index, { selected = index }); Text(items[index], fontWeight = FontWeight.SemiBold) }
                }
            }
            item {
                OutlinedTextField(note, { note = it }, label = { Text("Mensaje o condiciones") }, minLines = 3, modifier = Modifier.fillMaxWidth())
                Button(onClick = {
                    scope.launch {
                        status = "Enviando…"
                        runCatching { Api.post("/api/trades", JSONObject().put("wantedProductId", 1).put("offeredItem", items[selected]).put("message", note)) }
                            .onSuccess { status = "¡Propuesta enviada!" }.onFailure { status = it.message ?: "Error" }
                    }
                }, modifier = Modifier.fillMaxWidth().padding(top = 12.dp)) { Text("Enviar propuesta") }
                Text(status, color = if (status.startsWith("¡")) Teal else Muted, modifier = Modifier.padding(vertical = 12.dp))
            }
        }
    }
}

@Composable
private fun AuctionScreen(onNavigate: (Screen) -> Unit) {
    var amount by remember { mutableStateOf("3600") }
    var top by remember { mutableIntStateOf(3500) }
    var status by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    Scaffold(bottomBar = { BottomNavigation(Screen.Auction, onNavigate) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(18.dp)) {
            Text("Subasta activa", fontSize = 25.sp, fontWeight = FontWeight.Bold)
            Text("PlayStation 5 Digital Edition", color = Teal)
            Box(Modifier.fillMaxWidth().height(160.dp).padding(vertical = 14.dp).background(Navy, RoundedCornerShape(18.dp)), contentAlignment = Alignment.Center) { Text("01:25:40", color = Color.White, fontSize = 38.sp, fontWeight = FontWeight.Bold) }
            Text("Puja actual más alta", color = Muted)
            Text("$$top MXN", fontSize = 34.sp, fontWeight = FontWeight.ExtraBold)
            InfoCard("Historial de pujas", "carlos_mx · $$top MXN")
            Spacer(Modifier.weight(1f))
            OutlinedTextField(amount, { amount = it.filter(Char::isDigit) }, label = { Text("Tu puja en MXN") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Button(onClick = {
                val bid = amount.toIntOrNull() ?: 0
                scope.launch {
                    status = "Enviando…"
                    runCatching { Api.post("/api/auctions/1/bids", JSONObject().put("amount", bid)) }
                        .onSuccess { top = bid; amount = (bid + 100).toString(); status = "Puja registrada" }
                        .onFailure { status = it.message ?: "Error" }
                }
            }, modifier = Modifier.fillMaxWidth().padding(top = 10.dp)) { Text("Confirmar puja") }
            Text(status, color = Teal, modifier = Modifier.padding(top = 8.dp))
        }
    }
}

@Composable
private fun InfoCard(title: String, text: String) {
    Card(Modifier.fillMaxWidth()) { Column(Modifier.padding(16.dp)) { Text(title, color = Muted, fontSize = 12.sp); Text(text, fontWeight = FontWeight.Bold) } }
}

@Composable
private fun BottomNavigation(active: Screen, navigate: (Screen) -> Unit) {
    NavigationBar {
        listOf(Screen.Home to "Inicio", Screen.Trade to "Trueques", Screen.Auction to "Subastas", Screen.Login to "Perfil").forEach { (screen, label) ->
            NavigationBarItem(selected = active == screen, onClick = { navigate(screen) }, icon = { Text(label.take(1), fontWeight = FontWeight.Bold) }, label = { Text(label) })
        }
    }
}

private object Api {
    private const val BASE_URL = "http://10.0.2.2:3001"

    suspend fun post(path: String, body: JSONObject): JSONObject = withContext(Dispatchers.IO) {
        val connection = URL(BASE_URL + path).openConnection() as HttpURLConnection
        try {
            connection.requestMethod = "POST"
            connection.setRequestProperty("Content-Type", "application/json; charset=utf-8")
            connection.doOutput = true
            connection.outputStream.use { it.write(body.toString().toByteArray()) }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val result = JSONObject(stream.bufferedReader().use { it.readText() })
            if (code !in 200..299) throw IllegalStateException(result.optString("error", "Error $code"))
            result
        } finally { connection.disconnect() }
    }
}
