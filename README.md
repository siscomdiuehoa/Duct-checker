# Duct Checker Pro · 5.02

Siscom Technical Trading Joint Stock Company — https://siscom.vn

Android application ID: **vn.ductchecker.pro** (existing Google Play app).
iOS bundle identifier: **vn.ductchecker.pro** (new app; confirm availability in Apple Developer).

The current release candidate shares the approved Neumorphic UI and calculation engine through Capacitor 8.6.0. **English is the first-launch default**; Vietnamese, Chinese, Japanese and Thai remain selectable. SI is the default unit system. Calculations run offline. Changing a preference is retained on the device.

## Source layout

- `web/`: canonical UI, logos, translations, calculation engine and 24 tests. Make product updates here.
- `android/`: native Android host (API 36 target, Android 7+ minimum).
- `ios/`: native iOS host using Swift Package Manager (iOS 15+).
- `native-swiftui/`: preserved earlier SwiftUI prototype. It predates the current UI/engine updates and is **not the release target**.
- `scripts/`: deterministic web build, original-logo icon resizing, iOS build.
- `.github/workflows/build.yml`: builds review artifacts; never publishes to a store.

## Local development

Node 22+ (24 recommended). `npm ci`, `npm test`, `npm start`.
Open http://127.0.0.1:5020. To sync native projects: `npm run sync`.
Android: JDK 21, SDK 36; `cd android && ./gradlew assembleDebug bundleRelease`.
iOS: macOS with Xcode 26+; open `ios/App/App.xcodeproj` and select scheme `App`.

## Download build packages

Open the repository Actions tab → latest successful **Build mobile review packages** run → Artifacts.
- Android debug APK: installable for testing; cannot replace the Play-installed app if signatures differ.
- Release AAB/APK: **unsigned** unless the original upload-key environment variables are configured.
- iOS unsigned archive and Simulator app: generated on macOS CI; not installable on a physical iPhone until signed.

## Store update gates

Default Android versionCode **50200 is provisional**. Before an update, use a code larger than every previously uploaded code, e.g. `./gradlew bundleRelease -PreleaseVersionCode=YOUR_NEXT_CODE`.
Sign with the existing upload key using `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`. Never commit keys or passwords. If the old upload key is lost, request an upload-key reset in Play Console (when enrolled in Play App Signing).

For iOS, set the owner's Apple Developer team, register the bundle ID, archive with signing in Xcode, then distribute to App Store Connect/TestFlight. No Apple team/certificates are embedded. Account/store forms and real-device acceptance remain owner tasks. See `docs/STORE-RELEASE.md`.

## Engineering scope

Huebscher equivalent-friction diameter; Colebrook/Darcy–Weisbach straight-duct losses; configurable air properties and roughness; preliminary outlet face-area sizing with free-area ratio and aspect limits. This is not a complete duct-network, noise or throw solver. Calculations and supported input limits are documented in the app About screen.

Original user-supplied app/company logos are preserved. Derived native icons are generated without redrawing. No original third-party executable, reverse-engineered binary dump, local toolchain, private key or account credential is included.
