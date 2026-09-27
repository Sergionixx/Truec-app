package com.truecapp.mobile

import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicReference

@RunWith(AndroidJUnit4::class)
class VictorFrontendUiTest {
    private fun evaluate(scenario: ActivityScenario<WebMarketplaceActivity>, script: String): String {
        val result = AtomicReference<String>()
        val done = CountDownLatch(1)
        scenario.onActivity { activity ->
            activity.webView.evaluateJavascript(script) { value -> result.set(value); done.countDown() }
        }
        assertTrue("WebView did not answer", done.await(5, TimeUnit.SECONDS))
        return result.get()
    }

    private fun await(scenario: ActivityScenario<WebMarketplaceActivity>, script: String) {
        val deadline = System.currentTimeMillis() + 90000
        while (System.currentTimeMillis() < deadline) {
            if (evaluate(scenario, script) == "true") return
            Thread.sleep(200)
        }
        assertEquals("Victor frontend did not reach the expected screen: " + evaluate(scenario, "document.body.innerText"), "true", evaluate(scenario, script))
    }

    @Test fun victorLoginAndCatalogUseTheBundledReactFrontend() {
        ActivityScenario.launch(WebMarketplaceActivity::class.java).use { scenario ->
            await(scenario, "!!document.querySelector('form') && !!window.TruecNative")
            assertEquals("true", evaluate(scenario,
                "!document.body.innerText.includes('Simular publicación') && !document.body.innerText.includes('Registro Room')"))
            evaluate(scenario, "document.querySelector('form button[type=submit]').click(); true")
            await(scenario, "!!document.querySelector('article[role=button]')")
            await(scenario, "Array.from(document.querySelectorAll('article img')).some(img => img.complete && img.naturalWidth > 0)")
        }
    }
}
