package com.truecapp.mobile

import android.app.Application
import android.graphics.Bitmap
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.StateRestorationTester
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.lifecycle.ViewModelStore
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import com.truecapp.mobile.data.local.*
import com.truecapp.mobile.data.repository.TruecRepository
import com.truecapp.mobile.ui.*
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.rules.TestName
import java.io.File
import java.util.UUID

@RunWith(AndroidJUnit4::class)
class DemoUiTest {
    @get:Rule val compose = createComposeRule()
    @get:Rule val testName = TestName()
    private val application = ApplicationProvider.getApplicationContext<Application>()
    private val filename = "ui-test-${UUID.randomUUID()}.db"
    private lateinit var db: TruecDatabase
    private lateinit var repository: TruecRepository
    private lateinit var vm: TruecViewModel
    private val store = ViewModelStore()
    private lateinit var restoration: StateRestorationTester

    @Before fun setup() {
        db = Room.databaseBuilder(application, TruecDatabase::class.java, filename).build()
        repository = TruecRepository(db)
        runBlocking { repository.initialize() }
        vm = TruecViewModel(application, repository)
        store.put("test", vm)
        restoration = StateRestorationTester(compose)
        restoration.setContent { TruecTheme { TruecApp(vm) } }
    }
    @After fun cleanup() {
        runCatching {
            capture("diagnostic-${testName.methodName}")
            File(outputDirectory(), "diagnostic-${testName.methodName}.txt").writeText(
                compose.onRoot().printToString() + "\nNotice: " + vm.state.value.notice)
        }
        compose.runOnIdle { store.clear() }
        db.close(); application.deleteDatabase(filename)
    }

    private fun waitTag(tag: String) = compose.waitUntil(15000) { compose.onAllNodesWithTag(tag).fetchSemanticsNodes().isNotEmpty() }
    private fun waitSaved(condition: () -> Boolean) = compose.waitUntil(15000) { !vm.state.value.busy && condition() }
    private fun clickInList(tag: String, text: String) {
        compose.onNodeWithTag(tag).performScrollToNode(hasText(text))
        compose.onNodeWithText(text).performClick()
    }
    private fun enter() {
        compose.waitUntil(15000) { compose.onAllNodesWithText("Entrar a la demo").fetchSemanticsNodes().isNotEmpty() }
        compose.onNodeWithText("Entrar a la demo").performScrollTo().performClick()
        waitTag("catalog")
    }
    private fun outputDirectory(): File = File(InstrumentationRegistry.getArguments().getString("additionalTestOutputDir")
        ?: File(application.getExternalFilesDir(null), "evidence").absolutePath).apply { mkdirs() }
    private fun capture(name: String) {
        compose.waitForIdle()
        File(outputDirectory(), "$name.png").outputStream().use {
            compose.onRoot().captureToImage().asAndroidBitmap().compress(Bitmap.CompressFormat.PNG, 100, it)
        }
    }

    @Test fun selectedProductTradeAndFavoritesReachPersistentLists() {
        compose.waitUntil(15000) { compose.onAllNodesWithText("Entrar a la demo").fetchSemanticsNodes().isNotEmpty() }
        capture("01-login")
        enter()
        capture("02-catalogo")
        compose.onNodeWithTag("search").performTextInput("iPhone 14")
        clickInList("catalog", "iPhone 14 Pro Max")
        waitTag("detail")
        compose.onNodeWithContentDescription("Guardar favorito").performClick()
        waitSaved { vm.state.value.data.favoritos.any { it.productoId == 3L } }
        capture("03-detalle")
        clickInList("detail", "Proponer trueque")
        waitTag("trade-form")
        clickInList("trade-form", "iPad Air 5")
        capture("debug-trade-selection")
        clickInList("trade-form", "Enviar propuesta")
        compose.onNodeWithText("Confirmar envío").performClick()
        waitTag("proposals")
        waitSaved { vm.state.value.data.propuestas.any { it.deseadoId == 3L && it.ofrecidoId == 8L } }
        capture("04-propuestas")
        compose.onNodeWithText("Perfil").performClick()
        compose.onNodeWithTag("profile-Favorites").performScrollTo().performClick()
        waitTag("product-list")
        compose.onNodeWithText("iPhone 14 Pro Max").assertExists()
    }

    @Test fun publicationCanBeCreatedRestoredEditedAndDeleted() {
        enter()
        compose.onNodeWithContentDescription("Publicar producto").performClick()
        compose.onNodeWithTag("product-name").performTextInput("Control de prueba")
        compose.onNodeWithTag("product-price").performTextInput("1500.50")
        compose.onNodeWithTag("product-price").performImeAction()
        compose.onNodeWithTag("save-product").performScrollTo().performClick()
        waitTag("product-list")
        waitSaved { vm.state.value.data.productos.any { it.nombre == "Control de prueba" } }
        restoration.emulateSavedInstanceStateRestore()
        waitTag("product-list")
        clickInList("product-list", "Control de prueba")
        clickInList("detail", "Editar publicación")
        compose.onNodeWithTag("product-name").performTextReplacement("Control editado")
        compose.onNodeWithTag("product-name").performImeAction()
        compose.onNodeWithTag("save-product").performScrollTo()
        capture("debug-edit-form")
        compose.onNodeWithTag("save-product").performClick()
        waitTag("product-list")
        waitSaved { vm.state.value.data.productos.any { it.nombre == "Control editado" } }
        capture("05-inventario")
        clickInList("product-list", "Control editado")
        clickInList("detail", "Retirar publicación")
        compose.onNodeWithText("Retirar").performClick()
        waitTag("product-list")
        waitSaved { vm.state.value.data.productos.none { it.nombre == "Control editado" } }
        compose.onNodeWithText("Control editado").assertDoesNotExist()
    }

    @Test fun auctionRejectsInsufficientBidClosesAndResets() {
        enter()
        compose.onNodeWithText("Subastas").performClick()
        waitTag("auction")
        compose.onNodeWithTag("bid-amount").performScrollTo().performTextReplacement("3500")
        compose.onNodeWithText("Confirmar puja").performScrollTo().performClick()
        compose.onNodeWithText("Tu oferta debe superar", substring = true).assertExists()
        assertEquals(1, vm.state.value.data.pujas.size)
        compose.onNodeWithTag("bid-amount").performScrollTo().performTextReplacement("3600.50")
        compose.onNodeWithText("Confirmar puja").performScrollTo().performClick()
        waitSaved { vm.state.value.data.pujas.size == 2 }
        compose.onNodeWithTag("auction").performScrollToIndex(0)
        capture("06-subasta")
        clickInList("auction", "Finalizar subasta de ejemplo")
        compose.onNodeWithText("Finalizar").performClick()
        waitSaved { vm.state.value.data.subastas.first().terminaEn <= System.currentTimeMillis() }
        compose.onNodeWithText("Confirmar puja").assertDoesNotExist()
        compose.onNodeWithTag("auction").performScrollToIndex(0)
        capture("07-subasta-finalizada")
        compose.onNodeWithText("Perfil").performClick()
        clickInList("profile", "Restablecer demostración")
        compose.onNodeWithText("Restablecer").performClick()
        waitTag("catalog")
        waitSaved { vm.state.value.data.pujas.size == 1 }
        assertEquals(8, vm.state.value.data.productos.size)
    }

    @Test fun acceptingReceivedProposalUpdatesProfileCount() {
        enter()
        compose.onNodeWithText("Trueques").performClick()
        waitTag("proposals")
        compose.onAllNodesWithText("Aceptar").onFirst().performScrollTo().performClick()
        compose.onNodeWithText("Confirmar").performClick()
        waitSaved { vm.state.value.data.propuestas.any { it.estado == ACCEPTED } }
        compose.onNodeWithText("Perfil").performClick()
        waitTag("profile")
        compose.onNodeWithText("1", useUnmergedTree = true).assertExists()
        capture("08-perfil")
    }
}
