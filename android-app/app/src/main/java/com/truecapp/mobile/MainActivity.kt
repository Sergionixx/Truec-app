package com.truecapp.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import android.content.Intent
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.lifecycle.lifecycleScope
import com.truecapp.mobile.data.registration.AppDatabase
import com.truecapp.mobile.data.registration.User
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : ComponentActivity() {
    private val dao by lazy { AppDatabase.getInstance(this).userDao() }
    private lateinit var fields: List<EditText>
    private lateinit var save: Button
    private lateinit var status: TextView
    private lateinit var count: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        fields = listOf(R.id.nombre, R.id.apellidos, R.id.direccion, R.id.telefono)
            .map { findViewById(it) }
        save = findViewById(R.id.guardar)
        status = findViewById(R.id.resultado)
        count = findViewById(R.id.total)
        save.setOnClickListener { saveUser() }
        findViewById<Button>(R.id.catalogo).setOnClickListener {
            startActivity(Intent(this, DemoActivity::class.java))
        }
        lifecycleScope.launch {
            try {
                count.text = getString(R.string.total_users, dao.count())
            } catch (e: CancellationException) {
                throw e
            } catch (_: Exception) {
                status.text = getString(R.string.read_error)
            }
        }
    }

    private fun saveUser() {
        if (!save.isEnabled) return
        val values = fields.map { it.text.toString().trim() }
        fields.forEachIndexed { index, field ->
            field.error = if (values[index].isEmpty()) getString(R.string.required) else null
        }
        val firstEmpty = values.indexOfFirst { it.isEmpty() }
        if (firstEmpty >= 0) {
            status.text = getString(R.string.validation_error)
            fields[firstEmpty].requestFocus()
            return
        }
        val user = User(nombre = values[0], apellidos = values[1],
            direccion = values[2], telefono = values[3])
        save.isEnabled = false
        status.text = getString(R.string.saving)
        (getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager)
            .hideSoftInputFromWindow(save.windowToken, 0)
        lifecycleScope.launch {
            try {
                val id = withContext(Dispatchers.IO) { dao.insert(user) }
                status.text = getString(R.string.saved, id)
                fields.forEach { it.text.clear() }
                // A failed refresh must not misreport a successful insertion.
                try {
                    count.text = getString(R.string.total_users, dao.count())
                } catch (e: CancellationException) {
                    throw e
                } catch (_: Exception) {
                    count.text = getString(R.string.count_error)
                }
            } catch (e: CancellationException) {
                throw e
            } catch (_: Exception) {
                status.text = getString(R.string.save_error)
            } finally {
                save.isEnabled = true
            }
        }
    }
}
