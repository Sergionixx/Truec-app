package com.truecapp.mobile

import android.content.Intent
import android.os.Bundle
import android.webkit.*
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.lifecycle.lifecycleScope
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature
import com.truecapp.mobile.data.web.WebDatabase
import com.truecapp.mobile.data.web.WebMarketplace
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

/** Runs Victor's actual HTML/CSS/React bundle, not a Compose reimplementation. */
class WebMarketplaceActivity : ComponentActivity() {
    lateinit var webView: WebView
        private set
    private val origin = "https://appassets.androidplatform.net"
    private val api by lazy { WebMarketplace(WebDatabase.getInstance(this), {
        assets.open("native-seed.json").bufferedReader().use { it.readText() }
    }) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            setContentView(TextView(this).apply { text = "Actualiza Android System WebView para abrir Truec Victor." })
            return
        }
        webView = WebView(this)
        setContentView(webView)
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowContentAccess = false
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            setSupportMultipleWindows(false)
        }
        val assetsLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/", WebViewAssetLoader.AssetsPathHandler(this)).build()
        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
                assetsLoader.shouldInterceptRequest(request.url)
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean =
                request.url.scheme != "https" || request.url.host != "appassets.androidplatform.net"
        }
        // Only the bundled main frame can call Room or open the academic registration activity.
        WebViewCompat.addWebMessageListener(webView, "TruecNative", setOf(origin)) { _, message, source, mainFrame, reply ->
            if (!mainFrame || source.toString() != origin) return@addWebMessageListener
            val raw = message.data ?: return@addWebMessageListener
            if (raw.length > 65536) return@addWebMessageListener
            val request = runCatching { JSONObject(raw) }.getOrNull() ?: return@addWebMessageListener
            val id = request.optLong("id", -1)
            if (id < 0) return@addWebMessageListener
            lifecycleScope.launch {
                try {
                    val path = request.getString("path")
                    val response = if (path == "/native/registration") {
                        startActivity(Intent(this@WebMarketplaceActivity, MainActivity::class.java))
                        JSONObject().put("id", id).put("status", 200).put("body", JSONObject().put("ok", true))
                    } else withContext(Dispatchers.IO) {
                        val result = api.request(path, request.optString("method", "GET"),
                            request.optJSONObject("body") ?: JSONObject(), request.optString("token"))
                        JSONObject().put("id", id).put("status", result.status).put("body", result.body)
                    }
                    reply.postMessage(response.toString())
                } catch (cancelled: CancellationException) { throw cancelled }
                catch (_: Exception) {
                    reply.postMessage(JSONObject().put("id", id).put("status", 500)
                        .put("body", JSONObject().put("error", "No se pudo guardar la operación. Intenta de nuevo.")).toString())
                }
            }
        }
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                webView.evaluateJavascript("window.__truecBack ? window.__truecBack() : false") { handled ->
                    if (handled != "true") { isEnabled = false; onBackPressedDispatcher.onBackPressed() }
                }
            }
        })
        webView.loadUrl("$origin/web/index.html")
    }

    override fun onDestroy() {
        if (::webView.isInitialized) { webView.stopLoading(); webView.destroy() }
        super.onDestroy()
    }
}
