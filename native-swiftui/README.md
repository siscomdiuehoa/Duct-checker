# Duct Checker Pro iOS — v5.02

SwiftUI source project for Siscom Technical Trading Joint Stock Company —
[siscom.vn](https://siscom.vn). Offline, no external SDKs, no deployment performed.

## Open and run on a Mac

Requires Xcode 15+ (iOS 17+ target).

1. Open `DuctCheckerPro.xcodeproj`.
2. Select the shared **DuctCheckerPro** scheme and an iPhone Simulator, then Run.
3. For a physical device, select your own signing team in Xcode. None is embedded.

From this directory:

```sh
swift test
xcodebuild -project DuctCheckerPro.xcodeproj -scheme DuctCheckerPro \
  -configuration Debug -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
```

Engine tests are a separate Swift Package; run them with `swift test` (the app scheme
does not host those tests). A macOS GitHub Actions workflow is included but has not
been uploaded or run. Nothing in the workflow deploys the app.

## Included

- Duct Size: check width/height or solve height from flow, width and target velocity.
- Convert in both directions: equal area vs equivalent friction, with area, velocity
  and straight-duct friction comparisons. Fixed width resolves reverse conversion.
- Diffuser / Air Grille: quantity and free-area-based preliminary sizing.
- Settings: English default; Vietnamese, Simplified Chinese, Japanese and Thai;
  SI default / US, persisted preferences, physical input values preserved.
- About: original SISCOM logo, full company name and clickable website.
- Glass materials with Reduce Transparency fallback, system SF Pro font,
  Dynamic Type, light/dark system colors, accessible labels, keyboard dismissal.
- Original `ductlogo.png` and `your soid PNG.png` copied byte-for-byte into assets.
  Logo hashes and original paths are in `Docs/Logo-provenance.json`.

## Structure

```text
App/                       SwiftUI screens, components, preferences
App/Assets.xcassets/        Original app and company logos
App/Resources/             Five complete Localizable.strings tables
Sources/DuctCore/          Foundation-only calculation engine and units
Tests/DuctCoreTests/       XCTest engine tests
DuctCheckerPro.xcodeproj/  Native iOS app and shared scheme
Docs/                     Model, design and verification records
scripts/                  Independent Windows-compatible reference checks
```

The engine files are compiled directly into the app and also exposed through
SwiftPM for independent testing; there is a single copy of each calculation.

## Current validation and remaining platform work

Created on Windows without a Swift compiler or Xcode. Independent numerical checks,
resource completeness, project references and original-logo hashes were checked
locally; see `Docs/Verification.md` for actual results. Swift tests and simulator
build/rendering remain **unverified until run on macOS**. Do not treat source review
or Python checks as a passing iOS build.

The full-resolution original logo is included in the UI. A distribution AppIcon
catalog is intentionally not supplied yet: its original is 800×800, whereas the
store requires a suitable 1024×1024 icon. Prepare that derivative from the original
without redrawing the brand before distribution. No production packaging/signing
or App Store submission is part of this work.

Manual device acceptance: small iPhone and iPad, light/dark, largest Dynamic Type,
VoiceOver, Reduce Transparency, all five languages, comma-decimal input in Vietnamese,
invalid/empty inputs, SI→US→SI, both conversion directions, and settings persistence.
Translations are included but should receive native-speaker terminology review.

For formulas, assumptions and model limits, read `Docs/Engineering.md`.
