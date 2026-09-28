# Truec-app handoff

Last updated: 2026-09-27, America/Mexico_City

## Current objective

Use the image-rich React + Vite frontend from `Victor` as the Android app's visible marketplace, including its account creation flow. Avoid launching the older Compose marketplace.

## Verified progress

- Current branch: `codex/rubrica-integrada`.
- `WebMarketplaceActivity` is the only launcher in `android-app/app/src/main/AndroidManifest.xml`.
- Android packages the Vite output through `bundleVictorFrontend` before `preBuild`; the bridge sends `/api/` requests to Room-backed `WebMarketplace`.
- `VictorFrontendUiTest` passed on the connected `SM-A115M`: React login, catalog, local product images, and native bridge.
- `VictorWebTest` passed for Room-backed registration, permissions, persistence, and bids.
- `npm run typecheck`, `npm run build`, and `npm test` passed.
- Commit `f1228cc` is on `origin/codex/rubrica-integrada`.

## Latest change

Retiré el frontend Compose anterior, sus pruebas de UI y el formulario XML de registro. `WebMarketplaceActivity` es la única pantalla funcional; `MainActivity` quedó como redirección para configuraciones antiguas de Android Studio. Se quitaron las dependencias y el plugin de Compose del módulo. Se conservan las entidades/repositorio Room antiguos solo para las pruebas de datos existentes.

Validación de esta limpieza: `npm run typecheck`, `npm run build`, `npm test`, `:app:assembleDebug`, `:app:assembleDebugAndroidTest` y `:app:lintDebug` pasaron. En `SM-A115M` pasaron las 3 pruebas `VictorWebTest`/`VictorFrontendUiTest`; al iniciar `MainActivity`, Android resolvió y dejó reanudada `WebMarketplaceActivity`.

## Next steps

- Rebuild and run the Victor frontend tests after this cleanup.
- Commit and push the cleanup and this handoff (user authorized push in the current turn).

## Constraints and limitations

- `MainActivity` is only a compatibility redirect; the React `Crear Cuenta` flow handles marketplace registration.
- The old Compose UI, XML screen, and their UI tests are deleted.
- The Android frontend is hybrid: React/WebView UI with Kotlin Room persistence.
