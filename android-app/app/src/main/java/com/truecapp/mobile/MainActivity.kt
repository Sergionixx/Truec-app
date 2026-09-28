package com.truecapp.mobile

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity

/** Compatibility entry point for stale Android Studio run configurations. */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        startActivity(Intent(this, WebMarketplaceActivity::class.java))
        finish()
    }
}
