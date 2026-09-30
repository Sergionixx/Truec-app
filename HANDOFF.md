# Truec-app handoff

Last updated: 2026-09-30 14:50, America/Mexico_City

## Current objective

Keep the Victor image-rich React/Vite marketplace as the only Android frontend, and make product deletion work in the app opened by Android Studio.

## Verified state

- Branch: `codex/rubrica-integrada`; Android Studio opens `C:\Users\sergi\AndroidStudioProjects\Truec-app\android-app`. The Codex checkout is `C:\Users\sergi\Documents\ChatGPT\Truec-app`.
- `WebMarketplaceActivity` is the launcher. It packages the Victor frontend in an Android WebView and routes `/api/` calls to Room through `WebMarketplace`.
- Product deletion was blocked because `src/App.tsx` requires `window.confirm`, while `WebMarketplaceActivity` had no `WebChromeClient`; Android WebView then returned false without showing the dialog.
- `WebMarketplaceActivity` now sets `WebChromeClient()`. The `VictorFrontendUiTest` confirmation test passed on the connected Samsung SM-A115M: the dialog appeared and accepting it returned true to JavaScript.
- `VictorWebTest` passed on the Samsung: deleting an owned product returned 200 and the next catalog GET omitted it.
- `:app:connectedDebugAndroidTest` succeeded for each targeted test. The debug APK was built in the Android Studio checkout, reinstalled on the Samsung, and `WebMarketplaceActivity` launched cold with `Status: ok`.

## Constraints and separate issues

- Android remains a React/WebView UI with Kotlin Room persistence; old Compose and XML frontends have been removed.
- Deleting an owned product with a pending trade proposal returns 409 by design; resolve that proposal first.
- Android Studio's device mirroring had a separate Samsung VP8 encoder error. The app itself installed and launched previously; screen mirroring is not part of this product deletion fix.
- The Android Studio checkout also has unrelated local changes in `android-app/build.gradle.kts`, `android-app/gradle/wrapper/gradle-wrapper.properties`, and staged `android-app/app/src/main/res/xml/network_security_config.xml`. Preserve these when committing.

## Next steps

- Commit and push only the deletion fix, focused tests, and this handoff on the current branch.
- Keep the unrelated Android Studio checkout changes out of the deletion commit.
