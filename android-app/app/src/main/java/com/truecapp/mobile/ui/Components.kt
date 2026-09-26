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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.truecapp.mobile.data.local.ProductoEntity
import com.truecapp.mobile.data.local.ProductPhotos
import com.truecapp.mobile.R
import coil.compose.AsyncImage
import coil.request.ImageRequest
import java.math.BigDecimal
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

internal val Teal = Color(0xFF00796B)
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

internal fun money(cents: Long): String = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("es-MX")).format(BigDecimal.valueOf(cents, 2))
internal fun amountText(cents: Long): String = BigDecimal.valueOf(cents, 2).toPlainString()
internal fun dateText(millis: Long): String = SimpleDateFormat("dd MMM · HH:mm", Locale.forLanguageTag("es-MX")).format(Date(millis))

@Composable
internal fun Badge(text: String) {
    Surface(color = TealSoft, shape = RoundedCornerShape(8.dp)) { Text(text, Modifier.padding(horizontal = 8.dp, vertical = 4.dp), color = TealDark, fontSize = 11.sp) }
}

@Composable
internal fun ProductPhoto(product: ProductoEntity, modifier: Modifier = Modifier) {
    Photo(product.imagen.ifBlank { ProductPhotos.forCategory(product.categoria) }, product.nombre, modifier)
}

@Composable
internal fun Photo(source: String, description: String, modifier: Modifier = Modifier) {
    AsyncImage(model = ImageRequest.Builder(LocalContext.current).data(source).crossfade(true).build(),
        contentDescription = "Foto de $description", contentScale = ContentScale.Crop,
        placeholder = painterResource(R.drawable.ic_photo_placeholder),
        error = painterResource(R.drawable.ic_photo_placeholder),
        modifier = modifier.clip(RoundedCornerShape(16.dp)).background(Canvas).testTag("product-photo"))
}

@Composable
internal fun ProductCard(product: ProductoEntity, tile: Boolean = false, open: () -> Unit) {
    ElevatedCard(Modifier.fillMaxWidth().clickable(onClick = open), shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = Color.White)) {
        if (tile) {
            Column {
                ProductPhoto(product, Modifier.fillMaxWidth().aspectRatio(1.1f))
                Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                    Text(product.categoria.uppercase(), fontSize = 10.sp, color = Muted)
                    Text(product.nombre, fontWeight = FontWeight.Bold, maxLines = 2, minLines = 2, overflow = TextOverflow.Ellipsis, fontSize = 14.sp)
                    Text(money(product.precioCentavos), color = Navy, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
                    Text(product.condicion, fontSize = 11.sp, color = Muted)
                    Badge(if (product.aceptaTrueque) "Acepta trueque" else "Compra")
                }
            }
        } else Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            ProductPhoto(product, Modifier.size(78.dp))
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
