# Native photo interface — 1.4.0

## Problem and implementation

`origin/Victor` contains a React web interface with product photos. Its React
source was already merged into `codex/rubrica-integrada`, but the Android
marketplace rendered separate emoji placeholders. Launching Android also opened
the academic registration form before the marketplace.

Android now launches its Compose marketplace directly. Catalog cards use an
adaptive photo grid (one column on very narrow windows, two on phones, three on
larger windows). Detail, inventory, favorites, trade selection, proposals and
auctions render actual photos. Search supports product descriptions; native
filters support barter, condition, price range and price ordering.

The editor offers bundled samples, Android's photo picker and HTTPS image URLs.
Picker results use persistent URI read permission, so restarting the process does
not invalidate selected images. Cancelling selection keeps the previous image.
Unavailable images have a drawable placeholder. No general media permission is
requested. Local images are loaded with Coil in Compose; there is no WebView or
requirement to run Vite/API to use Android.

`ProductoEntity.imagen` is persisted in Room schema 2. The explicit 1→2 migration
preserves every existing table and adds sample images only to listings that
retain their original sample ID and name. Other legacy publications use a category sample until edited.
Registration remains accessible from login and retains its existing Room schema.

## Validation

Run with JDK 21 and Android SDK 36:

```powershell
cd android-app
./gradlew.bat :app:assembleDebug :app:assembleDebugAndroidTest :app:lintDebug
./gradlew.bat :app:connectedDebugAndroidTest '-Pandroid.testInstrumentationRunnerArguments.class=com.truecapp.mobile.DemoUiTest,com.truecapp.mobile.RoomWorkflowTest,com.truecapp.mobile.UserRegistrationTest,com.truecapp.mobile.NativePhotosTest'
```

The photo tests cover launcher resolution, decoding all eight bundled photos
without network, photo source persistence after editing/reopening, rejection of
insecure image URLs, and a real version-1 database migration retaining proposals,
favorites and bids. The publication UI test also covers photo selection, saved
instance restoration and keeping the selected photo through edits.

Verified on 2026-09-26 with JDK 21, SDK 36 and a Samsung SM-A115M running Android
12: debug APK and test APK built successfully; lint reported 0 errors (9 advisory
warnings); all 22 tests passed, with no skips. Results are saved in
`native-photos/android-tests.xml` and `native-photos/lint.txt`. An additional
photographic catalog → detail → trade → favorites UI run passed, and its actual
device screenshots are saved in `native-photos/01-login.png`, `02-catalogo.png`,
`03-detalle.png` and `04-propuestas.png`.

The installable debug APK is `output/native-photos/Truec-app-1.4.0-native-photos.apk`
with its SHA-256 in `output/native-photos/SHA256SUMS.txt`. Package
`com.truecapp.mobile.demo` coexists with the older `com.truecapp.mobile` app.

## Scope

This is the repository's Android demo with a native photographic interface.
The web and Android still use independent stores; Android does not authenticate
against the web API or synchronize marketplace data. The academic registration
form is separate from the demo login. Transactions remain simulations. iOS is
not a target in this repository. Earlier delivery evidence belongs to 1.3.0.
