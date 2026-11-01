# Build status — 5.3.0

Owner-confirmed Android application ID: vn.ductchecker.pro.
Current Play version: 5.2.0 / 50200. Prepared update: 5.3.0 / 50300.
English and SI remain fresh-install defaults; existing saved preferences are preserved.

Previous release build: Android and iOS SUCCESS at b6a90070bb28b72b76c42a7465949a0f2db0056d.
https://github.com/siscomdiuehoa/Duct-checker/actions/runs/41316739469
The 5.3.0 build results will be recorded after CI completes.

Google Play App Signing enabled; replacement upload key reset pending Google approval. This build remains unsigned. No store upload is authorized now.
iOS remains unsigned until Apple Developer team/signing is configured; simulator testing can use the simulator app ZIP on macOS. Physical-device acceptance, TestFlight signing and store forms remain outstanding.

Approved UI and calculation engine are preserved: duct selection/check/velocity sizing, area or equivalent-friction conversion, outlet candidates with free-area/aspect limits, air conditions, five languages, SI/US and About. Reference-only fabric material does not provide a verified friction calculation model. The shared release UI uses Capacitor; native-swiftui is an older prototype.
