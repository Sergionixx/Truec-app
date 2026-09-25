package com.truecapp.mobile.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.truecapp.mobile.data.local.TruecDatabase
import com.truecapp.mobile.data.repository.DemoSnapshot
import com.truecapp.mobile.data.repository.TruecRepository
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class TruecUiState(
    val data: DemoSnapshot = DemoSnapshot(),
    val loading: Boolean = true,
    val startupError: String? = null,
    val busy: Boolean = false,
    val notice: String? = null
)

class TruecViewModel(application: Application, val repository: TruecRepository) : AndroidViewModel(application) {
    constructor(application: Application) : this(application, TruecRepository(TruecDatabase.getInstance(application)))
    private val mutableState = MutableStateFlow(TruecUiState())
    val state = mutableState.asStateFlow()
    private var observer: Job? = null
    init { load() }

    fun load() {
        observer?.cancel()
        mutableState.update { it.copy(loading = true, startupError = null) }
        observer = viewModelScope.launch {
            try {
                repository.initialize()
                repository.observe().collect { data -> mutableState.update { it.copy(data = data, loading = false) } }
            } catch (cause: CancellationException) { throw cause }
            catch (_: Exception) {
                mutableState.update { it.copy(loading = false, startupError = "No se pudo abrir la base local. Puedes volver a intentarlo.") }
            }
        }
    }

    fun clearNotice(value: String) { mutableState.update { if (it.notice == value) it.copy(notice = null) else it } }

    fun act(success: String, onSuccess: () -> Unit = {}, block: suspend TruecRepository.() -> Unit) {
        if (mutableState.value.busy) return
        mutableState.update { it.copy(busy = true, notice = null) }
        viewModelScope.launch {
            try {
                repository.block()
                val data = repository.snapshot()
                mutableState.update { it.copy(data = data, notice = success) }
                onSuccess()
            } catch (cause: CancellationException) { throw cause }
            catch (cause: Exception) {
                val message = if (cause is IllegalArgumentException) cause.message else "No se pudo guardar el cambio. Inténtalo de nuevo."
                mutableState.update { it.copy(notice = message ?: "Revisa los datos e inténtalo de nuevo.") }
            } finally { mutableState.update { it.copy(busy = false) } }
        }
    }
}
