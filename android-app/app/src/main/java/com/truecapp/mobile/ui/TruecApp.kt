package com.truecapp.mobile.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.truecapp.mobile.data.local.*
import kotlinx.coroutines.delay

@Composable
fun TruecApp(vm: TruecViewModel = viewModel()) {
    val ui by vm.state.collectAsStateWithLifecycle()
    var route by rememberSaveable { mutableStateOf(Screen.Login.name) }
    var selectedId by rememberSaveable { mutableLongStateOf(0) }
    var editingId by rememberSaveable { mutableLongStateOf(0) }
    var returnRoute by rememberSaveable { mutableStateOf(Screen.Home.name) }
    var query by rememberSaveable { mutableStateOf("") }
    var category by rememberSaveable { mutableStateOf("Todos") }
    var sentTab by rememberSaveable { mutableStateOf(false) }
    val screen = Screen.valueOf(route)
    val navigate: (Screen) -> Unit = { route = it.name }
    val openProduct: (ProductoEntity) -> Unit = { returnRoute = route; selectedId = it.id; navigate(Screen.Detail) }
    val product = ui.data.productos.find { it.id == selectedId }
    LaunchedEffect(ui.notice) { ui.notice?.let { delay(5000); vm.clearNotice(it) } }
    val back: () -> Unit = {
        navigate(when (screen) {
            Screen.Detail -> Screen.valueOf(returnRoute)
            Screen.Trade -> Screen.Detail
            Screen.Editor -> Screen.Inventory
            Screen.Inventory, Screen.Favorites -> Screen.Profile
            else -> Screen.Home
        })
    }
    BackHandler(screen !in listOf(Screen.Home, Screen.Login)) { if (!ui.busy) back() }
    Column(Modifier.fillMaxSize()) {
        Box(Modifier.weight(1f)) {
            when {
                ui.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
                ui.startupError != null -> Column(Modifier.fillMaxSize().padding(28.dp), verticalArrangement = Arrangement.Center) {
                    Text(ui.startupError!!); Button(onClick = vm::load) { Text("Reintentar") }
                }
                else -> when (screen) {
                    Screen.Login -> LoginScreen { navigate(Screen.Home) }
                    Screen.Home -> HomeScreen(ui.data.productos.filter { it.activo }, query, { query = it }, category, { category = it }, openProduct, navigate) {
                        editingId = 0; navigate(Screen.Editor)
                    }
                    Screen.Detail -> if (product == null) MissingProduct(back) else DetailScreen(product, ui, vm, back, navigate,
                        trade = { navigate(Screen.Trade) }, edit = { editingId = product.id; navigate(Screen.Editor) })
                    Screen.Editor -> {
                        val editing = ui.data.productos.find { it.id == editingId }
                        if (editingId != 0L && editing == null) MissingProduct(back)
                        else EditorScreen(editing, ui.busy, navigate, back) { value ->
                            vm.act("Publicación guardada en el dispositivo.", { navigate(Screen.Inventory) }) { saveProduct(value) }
                        }
                    }
                    Screen.Trade -> if (product == null) MissingProduct(back) else TradeScreen(product, ui, vm, navigate, back) {
                        sentTab = true; navigate(Screen.Proposals)
                    }
                    Screen.Proposals -> ProposalsScreen(ui, vm, sentTab, { sentTab = it }, navigate)
                    Screen.Auction -> AuctionScreen(ui, vm, navigate)
                    Screen.Profile -> ProfileScreen(ui, vm, navigate, logout = { navigate(Screen.Login) }, reset = {
                        query = ""; category = "Todos"; selectedId = 0; editingId = 0; sentTab = false; navigate(Screen.Home)
                    })
                    Screen.Inventory, Screen.Favorites -> ProductListScreen(screen, ui, navigate, back, openProduct) {
                        editingId = 0; navigate(Screen.Editor)
                    }
                }
            }
            if (ui.busy) LinearProgressIndicator(Modifier.fillMaxWidth().align(Alignment.TopCenter))
        }
        // Reserve layout space for feedback so it never intercepts a form button.
        ui.notice?.let { notice ->
            Snackbar(modifier = Modifier.navigationBarsPadding().padding(horizontal = 8.dp),
                action = { TextButton(onClick = { vm.clearNotice(notice) }) { Text("Cerrar") } }) { Text(notice) }
        }
    }
}

@Composable
private fun MissingProduct(back: () -> Unit) {
    Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.Center) {
        Text("Este producto ya no está disponible.")
        Button(onClick = back) { Text("Volver") }
    }
}
