package com.truecapp.mobile.data.local

/** Photos from the Victor web interface, bundled so the native catalog works offline. */
object ProductPhotos {
    private fun asset(name: String) = "file:///android_asset/products/$name.jpg"
    val PS5 = asset("ps5")
    val LAPTOP = asset("laptop")
    val PHONE = asset("phone")
    val SWITCH = asset("switch")
    val HEADPHONES = asset("headphones")
    val AIRPODS = asset("airpods")
    val TABLET = asset("tablet")
    val GAMING = asset("gaming")

    fun forCategory(category: String): String = when (category) {
        "Celulares" -> PHONE
        "Laptops" -> LAPTOP
        "Consolas" -> PS5
        "Audio" -> HEADPHONES
        "Tablets" -> TABLET
        else -> GAMING
    }

    val presets = listOf("Celular" to PHONE, "Laptop" to LAPTOP, "Consola" to PS5,
        "Switch" to SWITCH, "Audífonos" to HEADPHONES, "AirPods" to AIRPODS,
        "Tablet" to TABLET, "Videojuegos" to GAMING)

    // The migration only updates the original sample listings, never user publications.
    val seedPhotos = listOf(
        Triple(1L, "PlayStation 5 Digital", PS5), Triple(2L, "MacBook Air M2", LAPTOP),
        Triple(3L, "iPhone 14 Pro Max", PHONE), Triple(4L, "Nintendo Switch OLED", SWITCH),
        Triple(5L, "Audífonos Sony XM5", HEADPHONES), Triple(6L, "iPhone 12 Pro", PHONE),
        Triple(7L, "AirPods Pro 2", AIRPODS), Triple(8L, "iPad Air 5", TABLET))
}
