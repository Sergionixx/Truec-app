package com.truecapp.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.truecapp.mobile.ui.TruecApp
import com.truecapp.mobile.ui.TruecTheme

class DemoActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { TruecTheme { TruecApp() } }
    }
}
