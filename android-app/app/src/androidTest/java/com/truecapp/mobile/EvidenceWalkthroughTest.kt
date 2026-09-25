package com.truecapp.mobile

import android.content.pm.ActivityInfo
import android.graphics.Bitmap
import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.*
import androidx.test.espresso.matcher.ViewMatchers.*
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.platform.app.InstrumentationRegistry
import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createEmptyComposeRule
import org.junit.Rule
import org.junit.Test
import java.io.File

/** Reproducible recording against the separate .demo package, with fictitious data. */
class EvidenceWalkthroughTest {
    @get:Rule val compose = createEmptyComposeRule()
    private fun capture(name: String) {
        Thread.sleep(1800)
        val instrumentation = InstrumentationRegistry.getInstrumentation()
        val folder = File(instrumentation.targetContext.getExternalFilesDir(null), "walkthrough").apply { mkdirs() }
        File(folder, "$name.png").outputStream().use { instrumentation.uiAutomation.takeScreenshot().compress(Bitmap.CompressFormat.PNG, 100, it) }
    }
    private fun waitTag(tag: String) = compose.waitUntil(15000) { compose.onAllNodesWithTag(tag).fetchSemanticsNodes().isNotEmpty() }
    private fun clickList(tag: String, text: String) {
        compose.onNodeWithTag(tag).performScrollToNode(hasText(text))
        compose.onNodeWithText(text).performClick()
    }
    @Test fun registrationAndMarketplace() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            scenario.onActivity { it.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT }
            capture("01-registro")
            onView(withId(R.id.guardar)).perform(scrollTo(), click())
            onView(withId(R.id.resultado)).check(matches(withText(R.string.validation_error)))
            capture("02-validacion")
            listOf(R.id.nombre to "Ana", R.id.apellidos to "Prueba", R.id.direccion to "Calle Ejemplo 123", R.id.telefono to "5512345678").forEach { (id, value) ->
                onView(withId(id)).perform(scrollTo(), replaceText(value), closeSoftKeyboard())
            }
            capture("03-formulario")
            onView(withId(R.id.guardar)).perform(scrollTo(), click())
            capture("04-exito")
            onView(withId(R.id.catalogo)).perform(scrollTo(), click())
            compose.waitUntil(15000) { compose.onAllNodesWithText("Entrar a la demo").fetchSemanticsNodes().isNotEmpty() }
            capture("05-login")
            compose.onNodeWithText("Entrar a la demo").performScrollTo().performClick()
            waitTag("catalog"); capture("06-catalogo")
            compose.onNodeWithTag("search").performTextInput("iPhone 14")
            clickList("catalog", "iPhone 14 Pro Max"); waitTag("detail"); capture("07-detalle")
            clickList("detail", "Proponer trueque"); waitTag("trade-form")
            clickList("trade-form", "iPad Air 5"); capture("08-propuesta")
            clickList("trade-form", "Enviar propuesta")
            compose.onNodeWithText("Confirmar envío").performClick()
            waitTag("proposals"); capture("09-propuestas")
            compose.onNodeWithText("Subastas").performClick(); waitTag("auction")
            compose.onNodeWithTag("auction").performScrollToNode(hasTestTag("bid-amount"))
            compose.onNodeWithTag("bid-amount").performTextReplacement("1")
            compose.onNodeWithText("Confirmar puja").performScrollTo().performClick(); capture("10-puja-invalida")
            compose.onNodeWithTag("auction").performScrollToNode(hasTestTag("bid-amount"))
            compose.onNodeWithTag("bid-amount").performTextReplacement("4500")
            compose.onNodeWithText("Confirmar puja").performScrollTo().performClick()
            compose.onNodeWithTag("auction").performScrollToIndex(0); capture("11-subasta")
            compose.onNodeWithText("Perfil").performClick(); waitTag("profile"); capture("12-perfil")
            compose.onNodeWithTag("profile").performScrollToNode(hasTestTag("profile-Inventory"))
            compose.onNodeWithTag("profile-Inventory").performClick(); waitTag("product-list"); capture("13-inventario")
        }
    }
}
