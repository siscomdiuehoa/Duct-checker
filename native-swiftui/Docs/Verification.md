# Verification record — 2026-10-28 (Asia/Saigon)

## Executed locally on Windows

`python scripts/verify_reference.py`: **9 checks passed**.

1. Geometry anchors: 0.715 m², 954.131162 mm equal area, 903.840289 mm equivalent friction.
2. Colebrook benchmark: independent bisection reference f = 0.01851386607747.
3. Pressure reference: positive result and Colebrook equation residual.
4. Terminal flow conservation and free/gross-area anchors.
5. Unit definitions from exact foot/metre conversion.
6. Five localization tables have matching keys, nonempty values and static UI-key coverage.
7. Both included logo files match original source bytes and SHA-256 hashes.
8. Xcode object references, source-file inclusion and shared-scheme XML consistency.
9. Asset JSON and referenced image existence.

These checks validate independent reference math and resource consistency. They do
**not** execute the Swift implementation or validate the Xcode project with Xcode.

## Authored, not executed

10 Swift XCTest test methods in `Tests/DuctCoreTests/DuctCoreTests.swift`:
geometry/velocity/sizing; corrected mockup diameter; both conversion round trips;
equal-friction behavior; Colebrook reference and residual; laminar/transition
boundaries; pressure trend; terminal conservation; unit anchors and round trips;
invalid/nonfinite inputs and model restrictions.

No Swift compiler or Xcode was available in this Windows environment. The installed
Docker command could not connect to its daemon; no service was started or toolchain
installed. iOS compilation, runtime interactions, rendering, accessibility and
localization layout remain pending macOS/iOS verification.

## Next platform verification

Run `swift test`, then the unsigned simulator build command in README. Run the app
on an iPhone and iPad simulator. Test English/SI defaults on fresh install, settings
persistence, all five languages, SI/US preservation, invalid values, comma decimals,
both conversion directions, target-velocity sizing, diffuser/grille inputs, About
link, Dynamic Type, VoiceOver and Reduce Transparency.

No production deployment, signing identity, remote repository, network analytics,
App Store upload or external API integration was created.
