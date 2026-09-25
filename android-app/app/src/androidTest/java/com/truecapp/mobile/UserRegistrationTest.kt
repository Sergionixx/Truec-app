package com.truecapp.mobile

import androidx.room.Room
import androidx.test.core.app.ActivityScenario
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.*
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.*
import android.content.Context
import com.truecapp.mobile.data.registration.AppDatabase
import com.truecapp.mobile.data.registration.User
import kotlinx.coroutines.runBlocking
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class UserRegistrationTest {
    private val context = ApplicationProvider.getApplicationContext<Context>()

    @Test fun generatedIdsQueriesAndPersistence() = runBlocking {
        val name = "registration-test-${System.nanoTime()}.db"
        var db = Room.databaseBuilder(context, AppDatabase::class.java, name).build()
        try {
            val sample = User(nombre = "Ana", apellidos = "Prueba",
                direccion = "Calle Ejemplo 123", telefono = "5512345678")
            val first = db.userDao().insert(sample)
            val second = db.userDao().insert(sample.copy(nombre = "Luis"))
            assertTrue(first > 0)
            assertTrue(second > first)
            assertEquals(listOf(second, first), db.userDao().getAll().map { it.id })
            assertNull(db.userDao().getById(second + 1))
            db.close()
            db = Room.databaseBuilder(context, AppDatabase::class.java, name).build()
            assertEquals(2, db.userDao().count())
            assertEquals(sample.copy(id = first), db.userDao().getById(first))
        } finally {
            db.close()
            context.deleteDatabase(name)
        }
    }

    @Test fun databaseInstanceIsShared() {
        assertSame(AppDatabase.getInstance(context), AppDatabase.getInstance(context))
    }

    @Test fun everyRequiredFieldRejectsEmptyAndWhitespace() = runBlocking {
        val dao = AppDatabase.getInstance(context).userDao()
        val before = dao.count()
        val ids = listOf(R.id.nombre, R.id.apellidos, R.id.direccion, R.id.telefono)
        ActivityScenario.launch(MainActivity::class.java).use {
            for (missing in ids) {
                for (empty in listOf("", "   ")) {
                    for (id in ids) {
                        onView(withId(id)).perform(scrollTo(), replaceText(if (id == missing) empty else "123"), closeSoftKeyboard())
                    }
                    onView(withId(R.id.guardar)).perform(scrollTo(), click())
                    onView(withId(missing)).check(matches(hasErrorText(context.getString(R.string.required))))
                    onView(withId(R.id.resultado)).check(matches(withText(R.string.validation_error)))
                }
            }
        }
        assertEquals(before, dao.count())
    }
}
