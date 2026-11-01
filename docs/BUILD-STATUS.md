# Build status — 5.3.0

Owner-confirmed Android application ID: vn.ductchecker.pro.
Current Play version: 5.2.0 / 50200. Prepared update: 5.3.0 / 50300.
English and SI remain fresh-install defaults; existing saved preferences are preserved.

Verified build commit: 4fcb88c044402382cc1cdb476a90278e6ab8726c.
Android and iOS: **SUCCESS**. All 26 numerical/unit regression tests passed on CI.
https://github.com/siscomdiuehoa/Duct-checker/actions/runs/41318120276

Artifacts: Android debug APK, unsigned release APK/AAB; iOS unsigned device archive and Simulator app ZIP. iOS archive metadata verified: vn.ductchecker.pro, 5.3.0 / 50300, original logo and matching engine, English/SI defaults, privacy manifest included, no code signature. This is not an installable physical-iPhone IPA.

Downloaded Android artifacts verified: original logo/engine match source, English/SI defaults, release artifacts unsigned. aapt verified the companion release APK metadata: applicationId vn.ductchecker.pro, versionName 5.3.0, versionCode 50300, minSdk24/targetSdk36. Local artifact SHA-256 records are supplied alongside the downloaded packages.

Google Play App Signing enabled; replacement upload key reset pending Google approval. This build remains unsigned. No store upload is authorized now.
iOS remains unsigned until Apple Developer team/signing is configured; simulator testing can use the simulator app ZIP on macOS. Physical-device acceptance, TestFlight signing and store forms remain outstanding.

Approved UI and calculation engine are preserved: duct selection/check/velocity sizing, area or equivalent-friction conversion, outlet candidates with free-area/aspect limits, air conditions, five languages, SI/US and About. Fabric material entries have been removed at the owner’s request. The shared release UI uses Capacitor; native-swiftui is an older prototype.
