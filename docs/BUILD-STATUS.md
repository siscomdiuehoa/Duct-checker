# Build status — 5.02

Verified build commit: b6a90070bb28b72b76c42a7465949a0f2db0056d
GitHub Actions: https://github.com/siscomdiuehoa/Duct-checker/actions/runs/41316739469
Result: SUCCESS for Android and iOS. 24 engine tests passed on CI.

Android: generated installable debug APK, unsigned release APK and unsigned AAB. aapt verified applicationId vn.ductchecker.pro, versionName 5.02, provisional versionCode 50200, targetSdk36/minSdk24. apksigner verified the debug APK certificate (Android Debug). Release AAB/APK are not signed and cannot be uploaded as updates yet.

iOS: Xcode26.6 successfully archived for device and built for iOS Simulator. Downloaded and inspected both ZIPs: bundle ID vn.ductchecker.pro, version5.02/build50200, privacy manifest included, no _CodeSignature. These are not an installable iPhone IPA or a signed App Store submission.

Downloaded Android/iOS bundles were inspected: original logo matches byte-for-byte; engine source matches after line-ending normalization; English fresh-install fallback and new preference key are present. Real-device acceptance remains outstanding. Earlier macOS builds also succeeded; local Windows Gradle was blocked by a Java loopback socket issue, so CI produced the binaries.

Outstanding owner information: original Android upload key, highest Play versionCode, Apple Developer team/signing. No store upload occurred. See STORE-RELEASE.md.
