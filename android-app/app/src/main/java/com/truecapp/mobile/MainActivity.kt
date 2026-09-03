package com.truecapp.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.text.NumberFormat
import java.util.Locale

private val Teal = Color(0xFF00897B)
private val TealDark = Color(0xFF00695C)
private val TealSoft = Color(0xFFE0F2F1)
private val Navy = Color(0xFF1E3A8A)
private val NavySoft = Color(0xFFEFF6FF)
private val Amber = Color(0xFFF59E0B)
private val AmberSoft = Color(0xFFFFF7E0)
private val Canvas = Color(0xFFF8FAFC)
private val Ink = Color(0xFF1E293B)
private val Muted = Color(0xFF64748B)
private val Line = Color(0xFFE2E8F0)

private enum class Screen { Login, Home, Detail, Trade, Auction, Profile }
private data class Product(
    val id: Int,
    val name: String,
    val price: Int,
    val condition: String,
    val category: String,
    val emoji: String,
    val barter: Boolean,
    val color: Color
)

private val products = listOf(
    Product(1, "PlayStation 5 Digital", 8500, "Excelente", "Consolas", "🎮", true, Color(0xFFDBEAFE)),
    Product(2, "MacBook Air M2", 19900, "Como nuevo", "Laptops", "💻", false, Color(0xFFEDE9FE)),
    Product(3, "iPhone 14 Pro Max", 14200, "Seminuevo", "Celulares", "📱", true, Color(0xFFD1FAE5)),
    Product(4, "Nintendo Switch OLED", 5800, "Buen estado", "Consolas", "🕹️", true, Color(0xFFFCE7F3)),
    Product(5, "Audífonos Sony XM5", 4900, "Excelente", "Audio", "🎧", false, Color(0xFFFEF3C7))
)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { TruecTheme { TruecApp() } }
    }
}

@Composable
private fun TruecTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = Teal,
            onPrimary = Color.White,
            secondary = Navy,
            tertiary = Amber,
            background = Canvas,
            surface = Color.White,
            onSurface = Ink,
            outline = Line
        ),
        typography = Typography(
            headlineLarge = MaterialTheme.typography.headlineLarge.copy(fontWeight = FontWeight.ExtraBold),
            headlineSmall = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
            titleLarge = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
            titleMedium = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
            bodyMedium = MaterialTheme.typography.bodyMedium.copy(lineHeight = 21.sp)
        ),
        content = content
    )
}

@Composable
private fun TruecApp() {
    var screen by remember { mutableStateOf(Screen.Login) }
    var selectedProduct by remember { mutableStateOf(products.first()) }
    Surface(Modifier.fillMaxSize(), color = Canvas) {
        when (screen) {
            Screen.Login -> LoginScreen { screen = Screen.Home }
            Screen.Home -> HomeScreen(
                onProduct = { selectedProduct = it; screen = Screen.Detail },
                onNavigate = { screen = it }
            )
            Screen.Detail -> DetailScreen(selectedProduct, { screen = Screen.Home }, { screen = Screen.Trade }, { screen = it })
            Screen.Trade -> TradeScreen({ screen = Screen.Detail }, { screen = it })
            Screen.Auction -> AuctionScreen { screen = it }
            Screen.Profile -> ProfileScreen { screen = it }
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

    Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.White, TealSoft)))) {
        Column(
            Modifier.fillMaxSize().padding(horizontal = 28.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                Modifier.size(88.dp).background(Brush.linearGradient(listOf(Teal, Navy)), RoundedCornerShape(28.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Outlined.SwapHoriz, null, tint = Color.White, modifier = Modifier.size(48.dp))
            }
            Spacer(Modifier.height(20.dp))
            Text("Truec-app", style = MaterialTheme.typography.headlineLarge)
            Text("Dale una segunda vida a tu tecnología", color = Muted, textAlign = TextAlign.Center)
            Spacer(Modifier.height(34.dp))
            ElevatedCard(Modifier.fillMaxWidth(), shape = RoundedCornerShape(24.dp)) {
                Column(Modifier.padding(20.dp)) {
                    Text("Bienvenido", style = MaterialTheme.typography.titleLarge)
                    Text("Ingresa para explorar, intercambiar y pujar", color = Muted, fontSize = 13.sp)
                    Spacer(Modifier.height(18.dp))
                    OutlinedTextField(
                        email, { email = it }, label = { Text("Correo electrónico") },
                        leadingIcon = { Icon(Icons.Outlined.Email, null) },
                        modifier = Modifier.fillMaxWidth(), singleLine = true, shape = RoundedCornerShape(14.dp)
                    )
                    Spacer(Modifier.height(12.dp))
                    OutlinedTextField(
                        password, { password = it }, label = { Text("Contraseña") },
                        leadingIcon = { Icon(Icons.Outlined.Lock, null) },
                        modifier = Modifier.fillMaxWidth(), singleLine = true,
                        visualTransformation = PasswordVisualTransformation(), shape = RoundedCornerShape(14.dp)
                    )
                    TextButton(onClick = {}, modifier = Modifier.align(Alignment.End)) { Text("¿Olvidaste tu contraseña?") }
                    Button(
                        onClick = {
                            loading = true; message = ""
                            scope.launch {
                                runCatching { Api.post("/api/login", JSONObject().put("email", email).put("password", password)) }
                                    .onSuccess { onSuccess() }
                                    .onFailure {
                                        if (email == "demo@truec.app" && password == "demo123") onSuccess()
                                        else message = "Revisa tus datos o usa la cuenta demo"
                                    }
                                loading = false
                            }
                        },
                        enabled = !loading,
                        modifier = Modifier.fillMaxWidth().height(52.dp), shape = RoundedCornerShape(14.dp)
                    ) {
                        if (loading) CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                        else Text("Iniciar sesión", fontWeight = FontWeight.Bold)
                    }
                    if (message.isNotBlank()) Text(message, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 10.dp), fontSize = 13.sp)
                }
            }
            Spacer(Modifier.height(18.dp))
            SuggestionChip(onClick = { email = "demo@truec.app"; password = "demo123" }, label = { Text("Usar cuenta de demostración") }, icon = { Icon(Icons.Outlined.AutoAwesome, null, Modifier.size(18.dp)) })
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun HomeScreen(onProduct: (Product) -> Unit, onNavigate: (Screen) -> Unit) {
    var query by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("Todos") }
    val categories = listOf("Todos", "Celulares", "Laptops", "Consolas", "Audio")
    val filtered = products.filter { (category == "Todos" || it.category == category) && (query.isBlank() || it.name.contains(query, true)) }

    Scaffold(bottomBar = { AppBottomBar(Screen.Home, onNavigate) }, containerColor = Canvas) { padding ->
        LazyColumn(
            Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(bottom = 20.dp)
        ) {
            item {
                Row(Modifier.fillMaxWidth().padding(20.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(46.dp).background(TealSoft, CircleShape), contentAlignment = Alignment.Center) {
                        Text("S", color = TealDark, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    }
                    Column(Modifier.weight(1f).padding(start = 12.dp)) {
                        Text("Hola, Sergio", fontWeight = FontWeight.Bold, fontSize = 20.sp)
                        Text("Encuentra tu próximo equipo", color = Muted, fontSize = 13.sp)
                    }
                    FilledIconButton(onClick = {}, colors = IconButtonDefaults.filledIconButtonColors(containerColor = Color.White)) {
                        Icon(Icons.Outlined.Notifications, "Notificaciones", tint = Navy)
                    }
                }
            }
            item {
                OutlinedTextField(
                    query, { query = it }, placeholder = { Text("Buscar celulares, laptops, consolas…") },
                    leadingIcon = { Icon(Icons.Outlined.Search, null) },
                    trailingIcon = { Icon(Icons.Outlined.Tune, null, tint = Teal) },
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp), singleLine = true,
                    shape = RoundedCornerShape(16.dp), colors = OutlinedTextFieldDefaults.colors(unfocusedContainerColor = Color.White, focusedContainerColor = Color.White)
                )
            }
            item {
                LazyRow(contentPadding = PaddingValues(horizontal = 20.dp, vertical = 14.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(categories) { item ->
                        FilterChip(selected = category == item, onClick = { category = item }, label = { Text(item) }, leadingIcon = if (category == item) ({ Icon(Icons.Outlined.Check, null, Modifier.size(16.dp)) }) else null)
                    }
                }
            }
            item {
                Card(
                    Modifier.fillMaxWidth().padding(horizontal = 20.dp),
                    colors = CardDefaults.cardColors(containerColor = Navy), shape = RoundedCornerShape(22.dp)
                ) {
                    Row(Modifier.padding(20.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("Intercambia, no acumules", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                            Text("Publica lo que ya no usas y encuentra algo mejor.", color = Color.White.copy(alpha = .78f), fontSize = 13.sp)
                            Spacer(Modifier.height(10.dp))
                            AssistChip(onClick = { onNavigate(Screen.Trade) }, label = { Text("Crear trueque") }, leadingIcon = { Icon(Icons.Outlined.SwapHoriz, null, Modifier.size(18.dp)) })
                        }
                        Text("♻️", fontSize = 52.sp)
                    }
                }
            }
            item {
                Row(Modifier.fillMaxWidth().padding(start = 20.dp, end = 20.dp, top = 22.dp, bottom = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text("Recomendados", style = MaterialTheme.typography.titleLarge, modifier = Modifier.weight(1f))
                    Text("${filtered.size} productos", color = Muted, fontSize = 12.sp)
                }
            }
            items(filtered) { product -> ProductCard(product) { onProduct(product) } }
            if (filtered.isEmpty()) item { EmptyState("No encontramos productos", "Prueba con otra búsqueda o categoría.") }
        }
    }
}

@Composable
private fun ProductCard(product: Product, onClick: () -> Unit) {
    ElevatedCard(
        Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 6.dp).clickable(onClick = onClick),
        shape = RoundedCornerShape(20.dp), colors = CardDefaults.elevatedCardColors(containerColor = Color.White)
    ) {
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(94.dp).background(product.color, RoundedCornerShape(16.dp)), contentAlignment = Alignment.Center) { Text(product.emoji, fontSize = 42.sp) }
            Column(Modifier.weight(1f).padding(start = 14.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(product.category.uppercase(), color = Muted, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                    Icon(Icons.Outlined.FavoriteBorder, "Favorito", tint = Muted, modifier = Modifier.size(20.dp))
                }
                Text(product.name, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    ConditionBadge(product.condition)
                    if (product.barter) Text("  ·  Acepta trueque", color = TealDark, fontSize = 11.sp)
                }
                Text(formatPrice(product.price), color = Navy, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(top = 6.dp))
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DetailScreen(product: Product, onBack: () -> Unit, onTrade: () -> Unit, onNavigate: (Screen) -> Unit) {
    Scaffold(
        topBar = { TopAppBar(title = { Text("Detalle del producto") }, navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Outlined.ArrowBack, "Volver") } }, actions = { IconButton(onClick = {}) { Icon(Icons.Outlined.FavoriteBorder, "Favorito") } }) },
        bottomBar = {
            Surface(shadowElevation = 12.dp) {
                Row(Modifier.fillMaxWidth().navigationBarsPadding().padding(14.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedButton(onClick = {}, modifier = Modifier.weight(1f).height(52.dp), shape = RoundedCornerShape(14.dp)) { Icon(Icons.Outlined.ShoppingBag, null); Spacer(Modifier.width(6.dp)); Text("Comprar") }
                    Button(onClick = onTrade, modifier = Modifier.weight(1.25f).height(52.dp), shape = RoundedCornerShape(14.dp)) { Icon(Icons.Outlined.SwapHoriz, null); Spacer(Modifier.width(6.dp)); Text("Proponer trueque") }
                }
            }
        }, containerColor = Canvas
    ) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(bottom = 20.dp)) {
            item {
                Box(Modifier.fillMaxWidth().height(260.dp).padding(horizontal = 20.dp).background(product.color, RoundedCornerShape(24.dp)), contentAlignment = Alignment.Center) {
                    Text(product.emoji, fontSize = 104.sp)
                    Surface(Modifier.align(Alignment.TopStart).padding(14.dp), color = Color.White.copy(alpha = .9f), shape = RoundedCornerShape(10.dp)) { Text("1 / 4", Modifier.padding(horizontal = 10.dp, vertical = 5.dp), fontSize = 12.sp) }
                }
            }
            item {
                Column(Modifier.padding(20.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) { ConditionBadge(product.condition); if (product.barter) StatusBadge("Acepta trueque", TealSoft, TealDark) }
                    Text(product.name, style = MaterialTheme.typography.headlineSmall, modifier = Modifier.padding(top = 12.dp))
                    Text(formatPrice(product.price), color = Navy, fontSize = 30.sp, fontWeight = FontWeight.ExtraBold)
                    Text("Publicado hoy · Guadalajara, Jal.", color = Muted, fontSize = 13.sp)
                    HorizontalDivider(Modifier.padding(vertical = 18.dp))
                    Text("Estado y descripción", style = MaterialTheme.typography.titleMedium)
                    Text("Equipo cuidado y completamente funcional. Incluye accesorios originales, caja y cables. Se puede revisar antes de concretar el trato.", color = Muted, modifier = Modifier.padding(top = 8.dp))
                }
            }
            item {
                ElevatedCard(Modifier.fillMaxWidth().padding(horizontal = 20.dp), shape = RoundedCornerShape(18.dp)) {
                    Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(48.dp).background(NavySoft, CircleShape), contentAlignment = Alignment.Center) { Text("CM", color = Navy, fontWeight = FontWeight.Bold) }
                        Column(Modifier.weight(1f).padding(start = 12.dp)) { Row(verticalAlignment = Alignment.CenterVertically) { Text("Carlos M.", fontWeight = FontWeight.Bold); Icon(Icons.Outlined.Verified, null, tint = Teal, modifier = Modifier.size(17.dp).padding(start = 3.dp)) }; Text("★ 4.8 · 23 ventas", color = Muted, fontSize = 12.sp) }
                        TextButton(onClick = {}) { Text("Ver perfil") }
                    }
                }
            }
            item { Spacer(Modifier.height(12.dp)); InfoCard(Icons.Outlined.Security, "Compra con confianza", "Para este prototipo, la reputación y el estado visible ayudan a comparar antes de decidir.") }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun TradeScreen(onBack: () -> Unit, onNavigate: (Screen) -> Unit) {
    val inventory = listOf("iPhone 12 Pro" to 7200, "AirPods Pro 2" to 3500, "iPad Air 5" to 9800)
    var selected by remember { mutableIntStateOf(0) }
    var note by remember { mutableStateOf("") }
    var status by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    Scaffold(topBar = { TopAppBar(title = { Text("Proponer trueque") }, navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Outlined.ArrowBack, "Volver") } }) }, bottomBar = { AppBottomBar(Screen.Trade, onNavigate) }, containerColor = Canvas) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(horizontal = 20.dp, vertical = 14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item { StepHeader(1, "Compara los productos", "Elige qué artículo de tu inventario quieres ofrecer.") }
            item {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    MiniProduct("🎮", "Recibes", "PlayStation 5", "$8,500", Color(0xFFDBEAFE), Modifier.weight(1f))
                    Box(Modifier.size(38.dp).background(Teal, CircleShape), contentAlignment = Alignment.Center) { Icon(Icons.Outlined.SwapHoriz, null, tint = Color.White) }
                    MiniProduct("📱", "Ofreces", inventory[selected].first, formatPrice(inventory[selected].second), TealSoft, Modifier.weight(1f))
                }
            }
            item { StepHeader(2, "Selecciona tu artículo", "Puedes cambiar tu elección antes de enviar.") }
            items(inventory.indices.toList()) { index ->
                OutlinedCard(
                    Modifier.fillMaxWidth().clickable { selected = index },
                    colors = CardDefaults.outlinedCardColors(containerColor = if (selected == index) TealSoft else Color.White),
                    border = CardDefaults.outlinedCardBorder().copy(width = if (selected == index) 2.dp else 1.dp)
                ) {
                    Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(50.dp).background(if (selected == index) Color.White else NavySoft, RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) { Text(listOf("📱", "🎧", "💻")[index], fontSize = 24.sp) }
                        Column(Modifier.weight(1f).padding(start = 12.dp)) { Text(inventory[index].first, fontWeight = FontWeight.Bold); Text(formatPrice(inventory[index].second), color = Muted, fontSize = 13.sp) }
                        RadioButton(selected == index, { selected = index })
                    }
                }
            }
            item {
                StepHeader(3, "Agrega un mensaje", "Describe el estado o condiciones de tu propuesta.")
                OutlinedTextField(note, { note = it }, placeholder = { Text("Ej. Incluye caja y cargador original…") }, minLines = 3, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(14.dp))
                Button(
                    onClick = {
                        scope.launch {
                            status = "Enviando…"
                            runCatching { Api.post("/api/trades", JSONObject().put("wantedProductId", 1).put("offeredItem", inventory[selected].first).put("message", note)) }
                                .onSuccess { status = "¡Propuesta enviada correctamente!" }
                                .onFailure { status = "¡Propuesta guardada en modo demo!" }
                        }
                    }, modifier = Modifier.fillMaxWidth().height(52.dp).padding(top = 8.dp), shape = RoundedCornerShape(14.dp)
                ) { Icon(Icons.Outlined.Send, null); Spacer(Modifier.width(8.dp)); Text("Enviar propuesta") }
                if (status.isNotBlank()) Surface(Modifier.fillMaxWidth().padding(top = 10.dp), color = TealSoft, shape = RoundedCornerShape(12.dp)) { Text(status, Modifier.padding(12.dp), color = TealDark, textAlign = TextAlign.Center, fontWeight = FontWeight.SemiBold) }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AuctionScreen(onNavigate: (Screen) -> Unit) {
    var amount by remember { mutableStateOf("3600") }
    var top by remember { mutableIntStateOf(3500) }
    var status by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    val bids = listOf("carlos_mx" to top, "techfan99" to 3300, "gamer_pro" to 3100)
    Scaffold(topBar = { TopAppBar(title = { Column { Text("Subasta activa"); Text("23 participantes", color = Teal, fontSize = 11.sp) } }, actions = { StatusBadge("EN VIVO", Color(0xFFFEE2E2), Color(0xFFDC2626)) }) }, bottomBar = { AppBottomBar(Screen.Auction, onNavigate) }, containerColor = Canvas) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(horizontal = 20.dp, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                Card(colors = CardDefaults.cardColors(containerColor = Navy), shape = RoundedCornerShape(24.dp)) {
                    Row(Modifier.padding(20.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text("🎮", fontSize = 54.sp)
                        Column(Modifier.weight(1f).padding(start = 12.dp)) { Text("PlayStation 5 Digital", color = Color.White, fontWeight = FontWeight.Bold); Text("Puja más alta", color = Color.White.copy(alpha = .7f), fontSize = 12.sp); Text(formatPrice(top), color = Color.White, fontSize = 27.sp, fontWeight = FontWeight.ExtraBold) }
                    }
                    Surface(Modifier.fillMaxWidth(), color = Amber) { Row(Modifier.padding(14.dp), horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Outlined.Timer, null); Spacer(Modifier.width(8.dp)); Text("Termina en  01 : 25 : 40", fontWeight = FontWeight.ExtraBold, fontSize = 17.sp) } }
                }
            }
            item { Text("Puja rápida", style = MaterialTheme.typography.titleMedium); Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) { listOf(50, 100, 200).forEach { increment -> FilterChip(false, { amount = (top + increment).toString() }, { Text("+$${increment}") }, modifier = Modifier.weight(1f)) } } }
            item {
                OutlinedTextField(amount, { amount = it.filter(Char::isDigit) }, label = { Text("Tu oferta") }, prefix = { Text("$") }, suffix = { Text("MXN") }, leadingIcon = { Icon(Icons.Outlined.Gavel, null) }, modifier = Modifier.fillMaxWidth(), singleLine = true, shape = RoundedCornerShape(14.dp))
                Button(onClick = {
                    val bid = amount.toIntOrNull() ?: 0
                    if (bid <= top) { status = "Tu oferta debe superar ${formatPrice(top)}"; return@Button }
                    scope.launch {
                        status = "Enviando…"
                        runCatching { Api.post("/api/auctions/1/bids", JSONObject().put("amount", bid)) }
                            .onSuccess { top = bid; amount = (bid + 100).toString(); status = "¡Ahora lideras la subasta!" }
                            .onFailure { top = bid; amount = (bid + 100).toString(); status = "Puja simulada en modo demo" }
                    }
                }, Modifier.fillMaxWidth().height(52.dp).padding(top = 8.dp), shape = RoundedCornerShape(14.dp), colors = ButtonDefaults.buttonColors(containerColor = Teal)) { Text("Confirmar puja", fontWeight = FontWeight.Bold) }
                if (status.isNotBlank()) Text(status, color = if (status.contains("superar")) MaterialTheme.colorScheme.error else TealDark, modifier = Modifier.fillMaxWidth().padding(top = 8.dp), textAlign = TextAlign.Center)
            }
            item { Text("Historial de pujas", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 4.dp)) }
            items(bids) { bid ->
                Surface(shape = RoundedCornerShape(14.dp), color = Color.White) {
                    Row(Modifier.fillMaxWidth().padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(40.dp).background(NavySoft, CircleShape), contentAlignment = Alignment.Center) { Text(bid.first.take(2).uppercase(), color = Navy, fontWeight = FontWeight.Bold, fontSize = 12.sp) }
                        Column(Modifier.weight(1f).padding(start = 10.dp)) { Text(bid.first, fontWeight = FontWeight.SemiBold); Text(if (bid.second == top) "Ahora" else "Hace unos minutos", color = Muted, fontSize = 11.sp) }
                        Text(formatPrice(bid.second), color = if (bid.second == top) TealDark else Ink, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
private fun ProfileScreen(onNavigate: (Screen) -> Unit) {
    Scaffold(bottomBar = { AppBottomBar(Screen.Profile, onNavigate) }, containerColor = Canvas) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text("Mi perfil", style = MaterialTheme.typography.headlineSmall, modifier = Modifier.align(Alignment.Start))
            Spacer(Modifier.height(26.dp))
            Box(Modifier.size(90.dp).background(Brush.linearGradient(listOf(Teal, Navy)), CircleShape), contentAlignment = Alignment.Center) { Text("S", color = Color.White, fontSize = 36.sp, fontWeight = FontWeight.Bold) }
            Text("Sergio", style = MaterialTheme.typography.titleLarge, modifier = Modifier.padding(top = 12.dp))
            Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Outlined.Verified, null, tint = Teal, modifier = Modifier.size(18.dp)); Text(" Perfil verificado · ★ 4.9", color = Muted) }
            Spacer(Modifier.height(24.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) { StatCard("3", "Publicaciones", Modifier.weight(1f)); StatCard("7", "Trueques", Modifier.weight(1f)); StatCard("12", "Reseñas", Modifier.weight(1f)) }
            Spacer(Modifier.height(20.dp))
            listOf(Icons.Outlined.Inventory2 to "Mi inventario", Icons.Outlined.SwapHoriz to "Mis propuestas", Icons.Outlined.FavoriteBorder to "Favoritos", Icons.Outlined.Settings to "Configuración").forEach { (icon, label) ->
                Surface(Modifier.fillMaxWidth().padding(vertical = 4.dp), color = Color.White, shape = RoundedCornerShape(14.dp)) { Row(Modifier.padding(15.dp), verticalAlignment = Alignment.CenterVertically) { Icon(icon, null, tint = Navy); Text(label, Modifier.weight(1f).padding(start = 12.dp), fontWeight = FontWeight.SemiBold); Icon(Icons.Outlined.ChevronRight, null, tint = Muted) } }
            }
        }
    }
}

@Composable
private fun AppBottomBar(active: Screen, navigate: (Screen) -> Unit) {
    NavigationBar(containerColor = Color.White, tonalElevation = 8.dp) {
        listOf(
            Triple(Screen.Home, "Inicio", Icons.Outlined.Home),
            Triple(Screen.Trade, "Trueques", Icons.Outlined.SwapHoriz),
            Triple(Screen.Auction, "Subastas", Icons.Outlined.Gavel),
            Triple(Screen.Profile, "Perfil", Icons.Outlined.Person)
        ).forEach { (screen, label, icon) ->
            NavigationBarItem(selected = active == screen, onClick = { navigate(screen) }, icon = { Icon(icon, label) }, label = { Text(label, fontSize = 10.sp) }, colors = NavigationBarItemDefaults.colors(indicatorColor = TealSoft))
        }
    }
}

@Composable
private fun ConditionBadge(text: String) = StatusBadge(text, TealSoft, TealDark)

@Composable
private fun StatusBadge(text: String, background: Color, foreground: Color) {
    Surface(color = background, shape = RoundedCornerShape(8.dp), modifier = Modifier.padding(end = 6.dp)) { Text(text, Modifier.padding(horizontal = 8.dp, vertical = 4.dp), color = foreground, fontSize = 10.sp, fontWeight = FontWeight.Bold) }
}

@Composable
private fun InfoCard(icon: ImageVector, title: String, text: String) {
    Surface(Modifier.fillMaxWidth().padding(horizontal = 20.dp), color = NavySoft, shape = RoundedCornerShape(16.dp)) { Row(Modifier.padding(15.dp)) { Icon(icon, null, tint = Navy); Column(Modifier.padding(start = 12.dp)) { Text(title, fontWeight = FontWeight.Bold); Text(text, color = Muted, fontSize = 12.sp) } } }
}

@Composable
private fun StepHeader(number: Int, title: String, subtitle: String) {
    Row(verticalAlignment = Alignment.CenterVertically) { Box(Modifier.size(30.dp).background(Teal, CircleShape), contentAlignment = Alignment.Center) { Text(number.toString(), color = Color.White, fontWeight = FontWeight.Bold) }; Column(Modifier.padding(start = 10.dp)) { Text(title, fontWeight = FontWeight.Bold); Text(subtitle, color = Muted, fontSize = 12.sp) } }
}

@Composable
private fun MiniProduct(emoji: String, label: String, name: String, price: String, color: Color, modifier: Modifier) {
    Card(modifier, colors = CardDefaults.cardColors(containerColor = Color.White), shape = RoundedCornerShape(18.dp)) { Column(Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) { Box(Modifier.fillMaxWidth().height(72.dp).background(color, RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) { Text(emoji, fontSize = 34.sp) }; Text(label.uppercase(), color = Muted, fontSize = 9.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 8.dp)); Text(name, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis); Text(price, color = TealDark, fontSize = 12.sp) } }
}

@Composable
private fun EmptyState(title: String, subtitle: String) {
    Column(Modifier.fillMaxWidth().padding(40.dp), horizontalAlignment = Alignment.CenterHorizontally) { Icon(Icons.Outlined.SearchOff, null, tint = Muted, modifier = Modifier.size(48.dp)); Text(title, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 12.dp)); Text(subtitle, color = Muted, textAlign = TextAlign.Center, fontSize = 13.sp) }
}

@Composable
private fun StatCard(value: String, label: String, modifier: Modifier) {
    Surface(modifier, color = Color.White, shape = RoundedCornerShape(14.dp)) { Column(Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) { Text(value, color = Navy, fontSize = 22.sp, fontWeight = FontWeight.ExtraBold); Text(label, color = Muted, fontSize = 10.sp, textAlign = TextAlign.Center) } }
}

private fun formatPrice(value: Int): String = NumberFormat.getCurrencyInstance(Locale("es", "MX")).format(value).replace(".00", "")

private object Api {
    // Con adb reverse tcp:3001 tcp:3001 funciona en un teléfono físico por USB.
    private const val BASE_URL = "http://127.0.0.1:3001"

    suspend fun post(path: String, body: JSONObject): JSONObject = withContext(Dispatchers.IO) {
        val connection = URL(BASE_URL + path).openConnection() as HttpURLConnection
        try {
            connection.connectTimeout = 2500
            connection.readTimeout = 2500
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
