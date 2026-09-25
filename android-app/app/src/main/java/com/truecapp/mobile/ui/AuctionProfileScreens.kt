package com.truecapp.mobile.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.truecapp.mobile.data.local.*
import com.truecapp.mobile.data.repository.TruecRepository
import kotlinx.coroutines.delay

@Composable
internal fun AuctionScreen(ui: TruecUiState, vm: TruecViewModel, navigate: (Screen) -> Unit) {
    val auction = ui.data.subastas.firstOrNull()
    if (auction == null) { Page("Subastas", Screen.Auction, navigate) { padding -> Box(Modifier.padding(padding)) { EmptyState("No hay subastas", "Restablece la demostración desde Perfil para cargar el ejemplo.") } }; return }
    val product = ui.data.productos.find { it.id == auction.productoId }
    val bids = ui.data.pujas.filter { it.subastaId == auction.id }
    val top = bids.firstOrNull()?.montoCentavos ?: auction.inicialCentavos
    val leader = ui.data.usuarios.find { it.id == bids.firstOrNull()?.usuarioId }
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(auction.terminaEn) { while (true) { now = System.currentTimeMillis(); if (now >= auction.terminaEn) break; delay(1000) } }
    val remaining = ((auction.terminaEn - now + 999) / 1000).coerceAtLeast(0)
    val closed = now >= auction.terminaEn || product?.activo != true
    var amount by rememberSaveable(top) { mutableStateOf(amountText((top + 10000).coerceAtMost(TruecRepository.MAX_CENTS))) }
    var error by rememberSaveable { mutableStateOf("") }
    var finish by rememberSaveable { mutableStateOf(false) }
    Page(if (closed) "Subasta finalizada" else "Subasta activa", Screen.Auction, navigate) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding).imePadding().testTag("auction"), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            item { Card(colors = CardDefaults.cardColors(containerColor = Navy), shape = RoundedCornerShape(24.dp)) {
                Column(Modifier.fillMaxWidth().padding(20.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("${emoji(product?.categoria.orEmpty())} ${product?.nombre ?: "Artículo demo"}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                    Text("Puja más alta", color = Color.White.copy(alpha = .75f))
                    Text(money(top), color = Color.White, fontSize = 32.sp, fontWeight = FontWeight.ExtraBold)
                    Text("${if (closed) "Ganador demo" else "Líder"}: ${leader?.nombre ?: "Sin pujas"}", color = Color.White)
                    Text("${bids.map { it.usuarioId }.distinct().size} participantes de ejemplo", color = Color.White.copy(alpha = .75f), fontSize = 12.sp)
                }
                Surface(color = Amber, modifier = Modifier.fillMaxWidth()) {
                    Text(if (closed) "La subasta ya no recibe ofertas" else "Termina en %02d:%02d:%02d".format(remaining / 3600, remaining / 60 % 60, remaining % 60), Modifier.padding(16.dp), fontWeight = FontWeight.Bold)
                }
            } }
            if (!closed) {
                item { Text("Puja rápida", fontWeight = FontWeight.Bold)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { listOf(50L, 100L, 200L).forEach { increment ->
                        FilterChip(false, { amount = amountText(top + increment * 100); error = "" }, { Text("+$increment") }, enabled = !ui.busy && top + increment * 100 <= TruecRepository.MAX_CENTS)
                    } }
                }
                item {
                    OutlinedTextField(amount, { amount = it.take(12); error = "" }, label = { Text("Tu oferta en MXN") }, singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), modifier = Modifier.fillMaxWidth().testTag("bid-amount"))
                    if (error.isNotEmpty()) Text(error, color = MaterialTheme.colorScheme.error)
                    Button(enabled = !ui.busy, modifier = Modifier.fillMaxWidth().padding(top = 10.dp).heightIn(min = 52.dp), onClick = {
                        val cents = TruecRepository.parseCents(amount)
                        if (cents == null || cents <= top) error = "Tu oferta debe superar ${money(top)} y no exceder $1,000,000."
                        else { error = ""; vm.act("Puja guardada. Ahora lideras la subasta.") { bid(auction.id, cents) } }
                    }) { Text("Confirmar puja") }
                }
                item { TextButton(enabled = !ui.busy, onClick = { finish = true }) { Text("Finalizar subasta de ejemplo") } }
            } else item { Text("Resultado simulado. Puedes iniciar otra demostración desde Perfil → Restablecer demostración.", color = Muted) }
            item { Text("Historial de pujas", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold) }
            items(bids, key = { it.id }) { bid ->
                val user = ui.data.usuarios.find { it.id == bid.usuarioId }
                Surface(shape = RoundedCornerShape(14.dp), modifier = Modifier.fillMaxWidth()) {
                    Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) { Text(user?.nombre ?: "Usuario demo", fontWeight = FontWeight.Bold); Text(dateText(bid.fecha), color = Muted, fontSize = 11.sp) }
                        Text(money(bid.montoCentavos), color = TealDark, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
    if (finish) ConfirmDialog("Finalizar subasta demo", "Se cerrará ahora y se mostrará al ganador ficticio. Podrás reiniciarla restableciendo la demostración.", "Finalizar", { finish = false }) {
        finish = false; vm.act("Subasta de ejemplo finalizada.") { finishAuction(auction.id) }
    }
}

@Composable
internal fun ProfileScreen(ui: TruecUiState, vm: TruecViewModel, navigate: (Screen) -> Unit, logout: () -> Unit, reset: () -> Unit) {
    var confirmReset by rememberSaveable { mutableStateOf(false) }
    val user = ui.data.usuarios.find { it.id == DEMO_USER_ID }
    val inventory = ui.data.productos.count { it.propietarioId == DEMO_USER_ID && it.activo }
    val accepted = ui.data.propuestas.count { it.estado == ACCEPTED && (it.emisorId == DEMO_USER_ID || it.receptorId == DEMO_USER_ID) }
    Page("Mi perfil", Screen.Profile, navigate) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding).testTag("profile"), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            item {
                Box(Modifier.size(86.dp).background(Brush.linearGradient(listOf(Teal, Navy)), CircleShape), contentAlignment = Alignment.Center) { Text("S", color = Color.White, fontSize = 36.sp, fontWeight = FontWeight.Bold) }
                Text(user?.nombre ?: "Sergio", fontSize = 26.sp, fontWeight = FontWeight.Bold)
                Text(user?.correo ?: "demo@truec.app", color = Muted)
            }
            item { Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                listOf(inventory to "Artículos", accepted to "Trueques", ui.data.favoritos.size to "Favoritos").forEach { (count, label) ->
                    Surface(Modifier.weight(1f), shape = RoundedCornerShape(14.dp)) { Column(Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) { Text("$count", color = Navy, fontSize = 24.sp, fontWeight = FontWeight.Bold); Text(label, fontSize = 12.sp) } }
                }
            } }
            items(listOf(Triple(Screen.Inventory, "Mi inventario", Icons.Outlined.Inventory2),
                Triple(Screen.Proposals, "Mis propuestas", Icons.Outlined.SwapHoriz), Triple(Screen.Favorites, "Favoritos", Icons.Outlined.FavoriteBorder))) { (screen, label, icon) ->
                Surface(Modifier.fillMaxWidth().testTag("profile-${screen.name}").clickable { navigate(screen) }, shape = RoundedCornerShape(14.dp)) {
                    Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically) { Icon(icon, null, tint = Navy); Text(label, Modifier.weight(1f).padding(start = 12.dp)); Icon(Icons.Outlined.ChevronRight, null) }
                }
            }
            item { Text("Tus cambios se guardan en este dispositivo. Las personas y operaciones son ficticias.", color = Muted, fontSize = 13.sp) }
            item { OutlinedButton(enabled = !ui.busy, onClick = logout, modifier = Modifier.fillMaxWidth()) { Text("Cerrar sesión") } }
            item { TextButton(enabled = !ui.busy, onClick = { confirmReset = true }, modifier = Modifier.fillMaxWidth()) { Text("Restablecer demostración") } }
        }
    }
    if (confirmReset) ConfirmDialog("Restablecer demostración", "Se eliminarán los cambios locales de esta demo y se cargarán los productos, propuestas y la subasta de ejemplo. Esta acción no se puede deshacer.", "Restablecer", { confirmReset = false }) {
        confirmReset = false; vm.act("Demostración restablecida.", reset) { this.reset() }
    }
}
