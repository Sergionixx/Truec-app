plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp")
    id("androidx.room")
}

android {
    namespace = "com.truecapp.mobile"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.truecapp.mobile"
        minSdk = 24
        targetSdk = 36
        versionCode = 14
        versionName = "1.4.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures { buildConfig = true }
    buildTypes {
        getByName("debug") { applicationIdSuffix = ".demo"; versionNameSuffix = "-demo" }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

room { schemaDirectory("$projectDir/schemas") }

dependencies {
    implementation("androidx.activity:activity-ktx:1.10.1")
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.room:room-runtime:2.7.2")
    implementation("androidx.room:room-ktx:2.7.2")
    ksp("androidx.room:room-compiler:2.7.2")
    androidTestImplementation("androidx.test:runner:1.7.0")
    androidTestImplementation("androidx.test.ext:junit:1.3.0")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.7.0")
}

android.sourceSets.getByName("androidTest").assets.srcDir("$projectDir/schemas")

// Android Studio Run always packages the current Vite sources.
val webProject = rootProject.projectDir.parentFile
val bundleVictorFrontend by tasks.registering(Exec::class) {
    workingDir(webProject)
    if (System.getProperty("os.name").startsWith("Windows")) {
        commandLine("cmd", "/c", "npm", "run", "build:native")
    } else {
        commandLine("npm", "run", "build:native")
    }
    inputs.dir(webProject.resolve("src"))
    inputs.dir(webProject.resolve("public"))
    inputs.files(webProject.resolve("index.html"), webProject.resolve("package.json"),
        webProject.resolve("vite.native.config.ts"), webProject.resolve("scripts/native-photos.ts"),
        webProject.resolve("scripts/package-native.mjs"), webProject.resolve("server/data.json"))
    outputs.dir(projectDir.resolve("src/main/assets/web"))
    outputs.file(projectDir.resolve("src/main/assets/native-seed.json"))
}
tasks.named("preBuild") { dependsOn(bundleVictorFrontend) }
