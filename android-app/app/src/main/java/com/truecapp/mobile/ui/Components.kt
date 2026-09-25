package com.truecapp.mobile.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.truecapp.mobile.data.local.ProductoEntity
import java.math.BigDecimal
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

internal val Teal = Color(0xFF00897B)
internal val TealDark = Color(0xFF00695C)
internal val TealSoft = Color(0xFFE0F2F1)
internal val Navy = Color(0xFF1E3A8A)
internal val NavySoft = Color(0xFFEFF6FF)
internal val Amber = Color(0xFFF59E0B)
internal val Canvas = Color(0xFFF8FAFC)
internal val Ink = Color(0xFF1E293B)
internal val Muted = Color(0xFF64748B)
internal enum class Screen { Login, Home, Detail, Trade, Proposals, Auction, Profile, Inventory, Favorites, Editor }

@Composable
fun TruecTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = lightColorScheme(primary = Teal, onPrimary = Color.White,
        secondary = Navy, tertiary = Amber, background = Canvas, surface = Color.White, onSurface = Ink), content = content)
}

@Composable
internal fun BottomBar(active: Screen, navigate: (Screen) -> Unit) {
    NavigationBar(containerColor = Color.White) {
        listOf(Triple(Screen.Home, "Inicio", Icons.Outlined.Home),
            Triple(Screen.Proposals, "Trueques", Icons.Outlined.SwapHoriz),
            Triple(Screen.Auction, "Subastas", Icons.Outlined.Gavel),
            Triple(Screen.Profile, "Perfil", Icons.Outlined.Person)).forEach { (screen, label, icon) ->
            NavigationBarItem(selected = active == screen, onClick = { navigate(screen) },
                icon = { Icon(icon, null) }, label = { Text(label) },
                colors = NavigationBarItemDefaults.colors(indicatorColor = TealSoft))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun Page(title: String, active: Screen, navigate: (Screen) -> Unit, back: (() -> Unit)? = null,
                  actions: @Composable RowScope.() -> Unit = {}, content: @Composable (PaddingValues) -> Unit) {
    Scaffold(containerColor = Canvas,
        topBar = { TopAppBar(title = { Column { Text(title, fontWeight = FontWeight.Bold); Text("Modo demo · sin conexión", fontSize = 11.sp, color = TealDark) } },
            navigationIcon = { if (back != null) IconButton(onClick = back) { Icon(Icons.AutoMirrored.Outlined.ArrowBack, "Volver") } }, actions = actions) },
        bottomBar = { BottomBar(active, navigate) }, content = content)
}

internal fun emoji(category: String) = when (category) {
    "Celulares" -> "📱"; "Laptops" -> "💻"; "Consolas" -> "🎮"; "Audio" -> "🎧"; "Tablets" -> "📲"; else -> "🕹️"
}
internal fun productColor(category: String) = when (category) {
    "Celulares" -> Color(0xFFD1FAE5); "Laptops" -> Color(0xFFEDE9FE); "Audio" -> Color(0xFFFEF3C7); else -> Color(0xFFDBEAFE)
}
internal fun money(cents: Long): String = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("es-MX")).format(BigDecimal.valueOf(cents, 2))
internal fun amountText(cents: Long): String = BigDecimal.valueOf(cents, 2).toPlainString()
internal fun dateText(millis: Long): String = SimpleDateFormat("dd MMM · HH:mm", Locale.forLanguageTag("es-MX")).format(Date(millis))

@Composable
internal fun Badge(text: String) {
    Surface(color = TealSoft, shape = RoundedCornerShape(8.dp)) { Text(text, Modifier.padding(horizontal = 8.dp, vertical = 4.dp), color = TealDark, fontSize = 11.sp) }
}

@Composable
internal fun ProductCard(product: ProductoEntity, open: () -> Unit) {
    ElevatedCard(Modifier.fillMaxWidth().clickable(onClick = open), shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = Color.White)) {
        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(78.dp).background(productColor(product.categoria), RoundedCornerShape(16.dp)), contentAlignment = Alignment.Center) { Text(emoji(product.categoria), fontSize = 36.sp) }
            Column(Modifier.weight(1f).padding(start = 14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(product.categoria.uppercase(), fontSize = 10.sp, color = Muted)
                Text(product.nombre, fontWeight = FontWeight.Bold, maxLines = 2, overflow = TextOverflow.Ellipsis)
                Text(money(product.precioCentavos), color = Navy, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
                Text(if (!product.activo) "Archivado" else product.condicion + if (product.aceptaTrueque) " · Trueque" else " · Compra", fontSize = 11.sp, color = TealDark)
            }
            Icon(Icons.Outlined.ChevronRight, null, tint = Muted)
        }
    }
}

@Composable
internal fun EmptyState(title: String, text: String) {
    Column(Modifier.fillMaxWidth().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Icon(Icons.Outlined.Inventory2, null, Modifier.size(40.dp), tint = Muted)
        Text(title, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
        Text(text, color = Muted, textAlign = TextAlign.Center)
    }
}

@Composable
internal fun ConfirmDialog(title: String, text: String, confirmLabel: String, dismiss: () -> Unit, confirm: () -> Unit) {
    AlertDialog(onDismissRequest = dismiss, title = { Text(title) }, text = { Text(text) },
        confirmButton = { TextButton(onClick = confirm) { Text(confirmLabel) } },
        dismissButton = { TextButton(onClick = dismiss) { Text("Volver") } })
}
