package com.truecapp.mobile.ui

import android.content.Intent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.truecapp.mobile.data.local.*
import com.truecapp.mobile.data.repository.TruecRepository
import com.truecapp.mobile.MainActivity

@Composable
internal fun LoginScreen(login: () -> Unit) {
    val context = LocalContext.current
    var email by rememberSaveable { mutableStateOf("demo@truec.app") }
    var password by rememberSaveable { mutableStateOf("demo123") }
    var error by rememberSaveable { mutableStateOf("") }
    Column(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.White, TealSoft)))
        .safeDrawingPadding().imePadding().verticalScroll(rememberScrollState()).padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(18.dp)) {
        Spacer(Modifier.height(20.dp))
        Box(Modifier.size(88.dp).background(Brush.linearGradient(listOf(Teal, Navy)), RoundedCornerShape(28.dp)), contentAlignment = Alignment.Center) {
            Icon(Icons.Outlined.SwapHoriz, null, Modifier.size(48.dp), tint = Color.White)
        }
        Text("Truec-app", fontSize = 32.sp, fontWeight = FontWeight.ExtraBold)
        Text("Dale una segunda vida a tu tecnología", color = Muted, textAlign = TextAlign.Center)
        ElevatedCard(shape = RoundedCornerShape(24.dp)) {
            Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Text("Bienvenido", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Text("Explora, intercambia y puja", color = Muted)
                OutlinedTextField(email, { email = it; error = "" }, label = { Text("Correo electrónico") }, singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email), modifier = Modifier.fillMaxWidth())
                OutlinedTextField(password, { password = it; error = "" }, label = { Text("Contraseña") }, singleLine = true,
                    visualTransformation = PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth())
                if (error.isNotEmpty()) Text(error, color = MaterialTheme.colorScheme.error)
                Button(onClick = {
                    if (email.trim().equals("demo@truec.app", true) && password == "demo123") login()
                    else error = "Usa demo@truec.app y la contraseña demo123."
                }, modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp)) { Text("Entrar a la demo") }
            }
        }
        TextButton(onClick = { email = "demo@truec.app"; password = "demo123"; error = "" }) { Text("Completar cuenta de ejemplo") }
        TextButton(onClick = { context.startActivity(Intent(context, MainActivity::class.java)) }) { Text("Registro de usuarios") }
        Badge("Demostración académica · sin conexión")
        Text("Los datos son ficticios. Tus cambios se conservan en este dispositivo.", color = Muted, fontSize = 13.sp, textAlign = TextAlign.Center)
    }
}

@Composable
internal fun HomeScreen(products: List<ProductoEntity>, query: String, setQuery: (String) -> Unit,
    category: String, setCategory: (String) -> Unit, open: (ProductoEntity) -> Unit, navigate: (Screen) -> Unit, publish: () -> Unit) {
    var filters by rememberSaveable { mutableStateOf(false) }
    var barterOnly by rememberSaveable { mutableStateOf(false) }
    var condition by rememberSaveable { mutableStateOf("Todas") }
    var minimum by rememberSaveable { mutableStateOf("") }
    var maximum by rememberSaveable { mutableStateOf("") }
    var sort by rememberSaveable { mutableStateOf("Recientes") }
    val minCents = minimum.takeIf { it.isNotBlank() }?.let { TruecRepository.parseCents(it) }
    val maxCents = maximum.takeIf { it.isNotBlank() }?.let { TruecRepository.parseCents(it) }
    val priceError = (minimum.isNotBlank() && minCents == null) || (maximum.isNotBlank() && maxCents == null) ||
        (minCents != null && maxCents != null && minCents > maxCents)
    val matches = products.filter { (category == "Todos" || it.categoria == category) &&
        (it.nombre.contains(query.trim(), true) || it.descripcion.contains(query.trim(), true)) &&
        (!barterOnly || it.aceptaTrueque) && (condition == "Todas" || it.condicion == condition) &&
        (minCents == null || it.precioCentavos >= minCents) && (maxCents == null || it.precioCentavos <= maxCents) }
    val filtered = when (sort) {
        "Menor precio" -> matches.sortedBy { it.precioCentavos }
        "Mayor precio" -> matches.sortedByDescending { it.precioCentavos }
        else -> matches.sortedByDescending { it.id }
    }
    Page("Hola, Sergio", Screen.Home, navigate, actions = {
        IconButton(onClick = publish) { Icon(Icons.Outlined.AddCircleOutline, "Publicar producto") }
    }) { padding ->
        BoxWithConstraints(Modifier.fillMaxSize().padding(padding)) {
            val columns = if (maxWidth < 330.dp) 1 else if (maxWidth < 600.dp) 2 else 3
            LazyColumn(Modifier.fillMaxSize().testTag("catalog"), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                item { OutlinedTextField(query, setQuery, placeholder = { Text("Buscar tecnología…") },
                    leadingIcon = { Icon(Icons.Outlined.Search, null) }, singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("search"), shape = RoundedCornerShape(16.dp)) }
                item { Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("Encuentra tu próximo equipo", color = Muted, fontSize = 12.sp)
                    TextButton(onClick = { filters = !filters }) { Icon(Icons.Outlined.Tune, null); Text(" Filtros") }
                } }
                if (filters) item {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) { Text("Solo trueque", Modifier.weight(1f)); Switch(barterOnly, { barterOnly = it }) }
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) { items(listOf("Todas") + TruecRepository.CONDITIONS) { label -> FilterChip(condition == label, { condition = label }, { Text(label) }) } }
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(minimum, { minimum = it.take(12) }, label = { Text("Precio mínimo") }, singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), modifier = Modifier.weight(1f))
                            OutlinedTextField(maximum, { maximum = it.take(12) }, label = { Text("Precio máximo") }, singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), modifier = Modifier.weight(1f))
                        }
                        if (priceError) Text("Usa precios positivos y un mínimo menor o igual al máximo.", color = MaterialTheme.colorScheme.error)
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) { items(listOf("Recientes", "Menor precio", "Mayor precio")) { label -> FilterChip(sort == label, { sort = label }, { Text(label) }) } }
                        TextButton(onClick = { barterOnly = false; condition = "Todas"; minimum = ""; maximum = ""; sort = "Recientes"; setCategory("Todos"); setQuery("") }) { Text("Limpiar filtros") }
                    }
                }
                item { LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(listOf("Todos") + TruecRepository.CATEGORIES) { label -> FilterChip(category == label, { setCategory(label) }, { Text(label) }) }
                } }
                item { Card(colors = CardDefaults.cardColors(containerColor = Navy), shape = RoundedCornerShape(22.dp)) {
                    Column(Modifier.fillMaxWidth().padding(20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("Intercambia, no acumules", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                        Text("Publica lo que ya no usas y encuentra tu próximo equipo.", color = Color.White.copy(alpha = .8f))
                        FilledTonalButton(onClick = publish) { Icon(Icons.Outlined.Add, null); Text(" Publicar un producto") }
                    }
                } }
                item { Text("${filtered.size} productos disponibles", fontWeight = FontWeight.Bold) }
                items(filtered.chunked(columns), key = { row -> row.joinToString("-") { it.id.toString() } }) { row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        row.forEach { product -> Box(Modifier.weight(1f)) { ProductCard(product, tile = true) { open(product) } } }
                        repeat(columns - row.size) { Spacer(Modifier.weight(1f)) }
                    }
                }
                if (filtered.isEmpty()) item { EmptyState("Sin resultados", "Prueba otra búsqueda o categoría.") }
            }
        }
    }
}

@Composable
internal fun DetailScreen(product: ProductoEntity, ui: TruecUiState, vm: TruecViewModel, back: () -> Unit,
    navigate: (Screen) -> Unit, trade: () -> Unit, edit: () -> Unit) {
    var dialog by rememberSaveable(product.id) { mutableStateOf("") }
    val own = product.propietarioId == DEMO_USER_ID
    val seller = ui.data.usuarios.find { it.id == product.propietarioId }
    val favorite = ui.data.favoritos.any { it.productoId == product.id }
    Page("Detalle del producto", Screen.Home, navigate, back, actions = {
        IconButton(enabled = !ui.busy && (product.activo || favorite), onClick = {
            vm.act(if (favorite) "Producto retirado de favoritos." else "Producto guardado en favoritos.") { toggleFavorite(product.id) }
        }) { Icon(if (favorite) Icons.Outlined.Favorite else Icons.Outlined.FavoriteBorder, if (favorite) "Quitar favorito" else "Guardar favorito", tint = Teal) }
    }) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding).testTag("detail"), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
            item { ProductPhoto(product, Modifier.fillMaxWidth().height(260.dp)) }
            item {
                Badge(if (product.activo) product.condicion else "Publicación archivada")
                Text(product.nombre, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 12.dp))
                Text(money(product.precioCentavos), color = Navy, fontSize = 30.sp, fontWeight = FontWeight.ExtraBold)
                Text(product.categoria + " · " + if (product.aceptaTrueque) "Acepta trueque" else "Disponible para compra", color = Muted)
            }
            item { Text("Estado y descripción", fontWeight = FontWeight.Bold); Text(product.descripcion.ifBlank { "Sin descripción adicional." }, color = Muted, modifier = Modifier.padding(top = 8.dp)) }
            item { ElevatedCard {
                Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(44.dp).background(NavySoft, CircleShape), contentAlignment = Alignment.Center) { Text(seller?.nombre?.take(1) ?: "?", fontWeight = FontWeight.Bold) }
                    Column(Modifier.weight(1f).padding(start = 12.dp)) { Text(seller?.nombre ?: "Usuario demo", fontWeight = FontWeight.Bold); Text("Perfil de ejemplo · ★ 4.8", color = Muted, fontSize = 12.sp) }
                    TextButton(onClick = { dialog = "seller" }) { Text("Ver perfil") }
                }
            } }
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    if (own) {
                        Button(onClick = edit, enabled = product.activo && !ui.busy, modifier = Modifier.fillMaxWidth()) { Text("Editar publicación") }
                        OutlinedButton(onClick = { dialog = "remove" }, enabled = product.activo && !ui.busy, modifier = Modifier.fillMaxWidth()) { Text("Retirar publicación") }
                    } else {
                        Button(onClick = trade, enabled = product.activo && product.aceptaTrueque && !ui.busy, modifier = Modifier.fillMaxWidth()) { Text("Proponer trueque") }
                        OutlinedButton(onClick = { dialog = "buy" }, enabled = product.activo && !ui.busy, modifier = Modifier.fillMaxWidth()) { Text("Comprar · simulación") }
                    }
                }
            }
        }
    }
    when (dialog) {
        "seller" -> AlertDialog(onDismissRequest = { dialog = "" }, title = { Text(seller?.nombre ?: "Usuario demo") },
            text = { Text("${seller?.correo.orEmpty()}\n\nReputación ficticia: 4.8 de 5.\n\n“Equipo en el estado indicado.”\n“Buena comunicación.”\n\nReseñas de ejemplo para la tarea.") }, confirmButton = { TextButton(onClick = { dialog = "" }) { Text("Cerrar") } })
        "remove" -> ConfirmDialog("Retirar publicación", "Si el producto tiene propuestas, se archivará y se cancelarán las pendientes. Si no tiene referencias, se eliminará.", "Retirar", { dialog = "" }) {
            dialog = ""; vm.act("Publicación retirada.", { navigate(Screen.Inventory) }) { removeProduct(product.id) }
        }
        "buy" -> ConfirmDialog("Resumen de compra simulada", "${product.nombre}\n${money(product.precioCentavos)} MXN\n\nEsta acción es una demostración sin cobro ni envío.", "Confirmar simulación", { dialog = "" }) { dialog = "bought" }
        "bought" -> AlertDialog(onDismissRequest = { dialog = "" }, title = { Text("¡Simulación completada!") }, text = { Text("Has completado el recorrido de compra de ${product.nombre}.") }, confirmButton = { TextButton(onClick = { dialog = "" }) { Text("Continuar") } })
    }
}

@Composable
internal fun EditorScreen(product: ProductoEntity?, busy: Boolean, navigate: (Screen) -> Unit, back: () -> Unit, save: (ProductoEntity) -> Unit) {
    val focusManager = LocalFocusManager.current
    val context = LocalContext.current
    var name by rememberSaveable(product?.id) { mutableStateOf(product?.nombre.orEmpty()) }
    var price by rememberSaveable(product?.id) { mutableStateOf(product?.let { amountText(it.precioCentavos) }.orEmpty()) }
    var description by rememberSaveable(product?.id) { mutableStateOf(product?.descripcion.orEmpty()) }
    var category by rememberSaveable(product?.id) { mutableStateOf(product?.categoria ?: "Celulares") }
    var condition by rememberSaveable(product?.id) { mutableStateOf(product?.condicion ?: "Buen estado") }
    var barter by rememberSaveable(product?.id) { mutableStateOf(product?.aceptaTrueque ?: true) }
    var error by rememberSaveable { mutableStateOf("") }
    var photo by rememberSaveable(product?.id) { mutableStateOf(product?.imagen.orEmpty()) }
    var photoUrl by rememberSaveable(product?.id) { mutableStateOf(product?.imagen?.takeIf { it.startsWith("https://") }.orEmpty()) }
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) {
            try {
                context.contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
                photo = uri.toString(); photoUrl = ""; error = ""
            } catch (_: SecurityException) {
                error = "No se pudo conservar acceso a la foto. Selecciona otra imagen."
            }
        }
    }
    Page(if (product == null) "Publicar producto" else "Editar producto", Screen.Profile, navigate, back) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).imePadding().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Photo(photo.ifBlank { ProductPhotos.forCategory(category) }, name.ifBlank { "tu publicación" }, Modifier.fillMaxWidth().height(170.dp))
            OutlinedButton(enabled = !busy, onClick = { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }, modifier = Modifier.fillMaxWidth().testTag("pick-photo")) {
                Icon(Icons.Outlined.AddPhotoAlternate, null); Text(" Elegir foto del dispositivo")
            }
            Text("O elige una foto de ejemplo", color = Muted, fontSize = 12.sp)
            LazyRow(Modifier.testTag("photo-presets"), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(ProductPhotos.presets) { (label, source) ->
                    FilterChip(photo == source, { photo = source; photoUrl = "" }, { Text(label) })
                }
            }
            OutlinedTextField(photoUrl, { photoUrl = it.trim(); photo = photoUrl }, label = { Text("URL de foto HTTPS (opcional)") },
                singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri, imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() }), modifier = Modifier.fillMaxWidth().testTag("photo-url"))
            OutlinedTextField(name, { name = it.take(80) }, label = { Text("Nombre del producto") }, singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done), keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() }),
                modifier = Modifier.fillMaxWidth().testTag("product-name"))
            OutlinedTextField(price, { price = it.take(12) }, label = { Text("Precio en MXN") }, supportingText = { Text("Ejemplo: 1500.50") }, singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal, imeAction = ImeAction.Done), keyboardActions = KeyboardActions(onDone = { focusManager.clearFocus() }),
                modifier = Modifier.fillMaxWidth().testTag("product-price"))
            Text("Categoría", fontWeight = FontWeight.Bold)
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) { items(TruecRepository.CATEGORIES) { value -> FilterChip(category == value, { category = value }, { Text(value) }) } }
            Text("Condición", fontWeight = FontWeight.Bold)
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) { items(TruecRepository.CONDITIONS) { value -> FilterChip(condition == value, { condition = value }, { Text(value) }) } }
            OutlinedTextField(description, { description = it.take(600) }, label = { Text("Descripción") }, minLines = 3, modifier = Modifier.fillMaxWidth())
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) { Text("Acepto propuestas de trueque", Modifier.weight(1f)); Switch(barter, { barter = it }) }
            if (error.isNotEmpty()) Text(error, color = MaterialTheme.colorScheme.error)
            Button(enabled = !busy, modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp).testTag("save-product"), onClick = {
                val cents = TruecRepository.parseCents(price)
                if (name.trim().length < 2) {
                    error = "Escribe un nombre de al menos 2 caracteres."
                } else if (cents == null) {
                    error = "Escribe un precio positivo con hasta dos decimales."
                } else {
                    error = ""
                    focusManager.clearFocus()
                    save(ProductoEntity(id = product?.id ?: 0, nombre = name, categoria = category, condicion = condition,
                        precioCentavos = cents, descripcion = description, aceptaTrueque = barter,
                        imagen = photo.ifBlank { ProductPhotos.forCategory(category) }))
                }
            }) { Text(if (busy) "Guardando…" else "Guardar producto") }
        }
    }
}

@Composable
internal fun ProductListScreen(screen: Screen, ui: TruecUiState, navigate: (Screen) -> Unit, back: () -> Unit,
    open: (ProductoEntity) -> Unit, publish: () -> Unit) {
    val inventory = screen == Screen.Inventory
    val favoriteIds = ui.data.favoritos.map { it.productoId }.toSet()
    val products = ui.data.productos.filter { if (inventory) it.propietarioId == DEMO_USER_ID else it.id in favoriteIds }
    Page(if (inventory) "Mi inventario" else "Favoritos", Screen.Profile, navigate, back,
        actions = { if (inventory) IconButton(onClick = publish) { Icon(Icons.Outlined.Add, "Publicar producto") } }) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding).testTag("product-list"), contentPadding = PaddingValues(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            if (inventory) item { Button(onClick = publish, modifier = Modifier.fillMaxWidth()) { Text("Nueva publicación") } }
            items(products, key = { it.id }) { product -> ProductCard(product) { open(product) } }
            if (products.isEmpty()) item { EmptyState(if (inventory) "Tu inventario está vacío" else "Todavía no tienes favoritos", if (inventory) "Publica tu primer artículo para ofrecerlo en un trueque." else "Abre un producto y toca el corazón para guardarlo aquí.") }
        }
    }
}
