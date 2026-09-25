package com.truecapp.mobile.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.SwapHoriz
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.truecapp.mobile.data.local.*

@Composable
internal fun TradeScreen(wanted: ProductoEntity, ui: TruecUiState, vm: TruecViewModel,
    navigate: (Screen) -> Unit, back: () -> Unit, sent: () -> Unit) {
    val inventory = ui.data.productos.filter { it.propietarioId == DEMO_USER_ID && it.activo && it.aceptaTrueque }
    var selectedId by rememberSaveable(wanted.id) { mutableLongStateOf(0) }
    var note by rememberSaveable(wanted.id) { mutableStateOf("") }
    var confirm by rememberSaveable { mutableStateOf(false) }
    val offered = inventory.find { it.id == selectedId }
    val eligible = wanted.activo && wanted.aceptaTrueque && wanted.propietarioId != DEMO_USER_ID
    Page("Proponer trueque", Screen.Proposals, navigate, back) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding).imePadding().testTag("trade-form"), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            item { Text("1. El artículo que recibirás", fontWeight = FontWeight.Bold)
                Card(Modifier.fillMaxWidth().padding(top = 10.dp), colors = CardDefaults.cardColors(containerColor = TealSoft)) {
                    Column(Modifier.padding(16.dp)) { Text("${emoji(wanted.categoria)} ${wanted.nombre}", fontWeight = FontWeight.Bold); Text(money(wanted.precioCentavos), color = TealDark) }
                }
            }
            if (!eligible) item { Text("Este artículo no está disponible para recibir propuestas.", color = MaterialTheme.colorScheme.error) }
            item { Text("2. Elige un artículo de tu inventario", fontWeight = FontWeight.Bold) }
            items(inventory, key = { it.id }) { item ->
                OutlinedCard(Modifier.fillMaxWidth().clickable { selectedId = item.id },
                    colors = CardDefaults.outlinedCardColors(containerColor = if (selectedId == item.id) TealSoft else MaterialTheme.colorScheme.surface)) {
                    Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text(emoji(item.categoria), fontSize = 28.sp)
                        Column(Modifier.weight(1f).padding(start = 12.dp)) { Text(item.nombre, fontWeight = FontWeight.Bold); Text(money(item.precioCentavos), color = Muted) }
                        RadioButton(selectedId == item.id, { selectedId = item.id })
                    }
                }
            }
            if (inventory.isEmpty()) item {
                EmptyState("No tienes artículos disponibles", "Publica un producto que acepte trueque para enviar una propuesta.")
                Button(onClick = { navigate(Screen.Inventory) }) { Text("Ir a mi inventario") }
            }
            item {
                Text("3. Agrega un mensaje (opcional)", fontWeight = FontWeight.Bold)
                OutlinedTextField(note, { note = it.take(600) }, label = { Text("Condiciones del intercambio") }, minLines = 3, modifier = Modifier.fillMaxWidth().padding(top = 10.dp))
            }
            item { Button(onClick = { confirm = true }, enabled = offered != null && eligible && !ui.busy,
                modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp)) { Text("Enviar propuesta") } }
        }
    }
    if (confirm && offered != null) ConfirmDialog("Confirmar propuesta", "Ofreces ${offered.nombre} por ${wanted.nombre}. Podrás verla en Mis propuestas.", "Confirmar envío", { confirm = false }) {
        confirm = false
        vm.act("Propuesta guardada correctamente.", sent) { propose(wanted.id, offered.id, note) }
    }
}

@Composable
internal fun ProposalsScreen(ui: TruecUiState, vm: TruecViewModel, sent: Boolean, setSent: (Boolean) -> Unit, navigate: (Screen) -> Unit) {
    var resolvingId by rememberSaveable { mutableLongStateOf(0) }
    var resolvingStatus by rememberSaveable { mutableStateOf("") }
    val proposals = ui.data.propuestas.filter { if (sent) it.emisorId == DEMO_USER_ID else it.receptorId == DEMO_USER_ID }
    Page("Mis propuestas", Screen.Proposals, navigate) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding).testTag("proposals"), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            item { Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                FilterChip(!sent, { setSent(false) }, { Text("Recibidas") }); FilterChip(sent, { setSent(true) }, { Text("Enviadas") })
            } }
            item { Text(if (sent) "Tus solicitudes de intercambio" else "Propuestas de usuarios de ejemplo", color = Muted) }
            items(proposals, key = { it.id }) { proposal ->
                val wanted = ui.data.productos.find { it.id == proposal.deseadoId }
                val offered = ui.data.productos.find { it.id == proposal.ofrecidoId }
                val user = ui.data.usuarios.find { it.id == if (sent) proposal.receptorId else proposal.emisorId }
                ElevatedCard(shape = RoundedCornerShape(20.dp), modifier = Modifier.testTag("proposal-${proposal.id}")) {
                    Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { Text(user?.nombre ?: "Usuario demo", fontWeight = FontWeight.Bold); Badge(proposal.estado) }
                        Text("Recibes: ${if (sent) wanted?.nombre else offered?.nombre}", fontWeight = FontWeight.SemiBold)
                        Icon(Icons.Outlined.SwapHoriz, null, tint = Teal)
                        Text("Ofreces: ${if (sent) offered?.nombre else wanted?.nombre}")
                        if (proposal.mensaje.isNotBlank()) Text(proposal.mensaje, color = Muted)
                        Text(dateText(proposal.fecha), color = Muted, fontSize = 11.sp)
                        if (proposal.estado == PENDING) Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            if (sent) OutlinedButton(enabled = !ui.busy, onClick = { resolvingId = proposal.id; resolvingStatus = CANCELLED }) { Text("Cancelar propuesta") }
                            else {
                                Button(enabled = !ui.busy, onClick = { resolvingId = proposal.id; resolvingStatus = ACCEPTED }) { Text("Aceptar") }
                                OutlinedButton(enabled = !ui.busy, onClick = { resolvingId = proposal.id; resolvingStatus = REJECTED }) { Text("Rechazar") }
                            }
                        }
                    }
                }
            }
            if (proposals.isEmpty()) item { EmptyState("Sin propuestas ${if (sent) "enviadas" else "recibidas"}", "Para iniciar un trueque, abre un producto del catálogo.") }
        }
    }
    if (resolvingId != 0L) ConfirmDialog("Actualizar propuesta", if (resolvingStatus == ACCEPTED)
        "Se marcará como aceptada. Ambos artículos se archivarán y sus otras propuestas pendientes se cancelarán. El intercambio es simulado."
        else "La propuesta pasará a estado ${resolvingStatus.lowercase()}.", "Confirmar", { resolvingId = 0 }) {
        val id = resolvingId; val status = resolvingStatus; resolvingId = 0
        vm.act("Propuesta ${status.lowercase()}.") { resolve(id, status) }
    }
}
