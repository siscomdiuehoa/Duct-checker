# App Review response — Duct Checker Pro 5.2.0 (50300)

Status: draft for owner review. Do not submit until the physical-device screen recording has been captured and the exact submitted build has been checked on the iPhone.

## Build identity

- App Store Connect version: 5.2.0
- Build: 50300
- Bundle identifier: `vn.siscom.ductcheckerpro`
- Developer: Siscom Technical Trading Joint Stock Company
- Platform: iOS
- Minimum iOS deployment target in the Xcode project: iOS 15.0

The iOS Xcode project sets `MARKETING_VERSION = 5.2.0` and `CURRENT_PROJECT_VERSION = 50300`. Do not confuse this iOS submission with the Android 5.3.0 / 50300 work described in the general README and store checklist.

## Draft text for App Store Connect — App Review Information > Notes

### 1. Physical-device screen recording

A screen recording captured on a physical iPhone must be attached/provided with this submission. It must start immediately before launching Duct Checker Pro and show a normal user journey through the primary features. The recording must be made on the actual submitted build and a currently supported iOS version.

**Owner action required:** capture the recording on the iPhone and attach it using the submission workflow / App Review communication. Do not state that a recording is attached until it has actually been attached.

### 2. App purpose and target audience

Duct Checker Pro is an HVAC engineering utility for HVAC engineers, mechanical designers, contractors, and air-conditioning technicians. It provides on-device tools for preliminary duct sizing, rectangular/round duct conversion, straight-duct pressure-loss estimation, and air outlet/grille sizing. It helps practitioners perform common preliminary calculations consistently while designing or working on HVAC systems.

The app is a calculation aid. Its results do not replace project-specific engineering review, applicable codes, or professional judgment.

### 3. Instructions for accessing the main features

No account registration or login is required. No demo username, password, or sample file is required.

After launching the app, users can open the available calculation tools directly:
- **Duct Size:** enter airflow and design inputs to calculate preliminary duct dimensions.
- **Convert:** convert rectangular and round duct dimensions using the available conversion methods.
- **Outlet Sizing:** estimate preliminary outlet/grille face dimensions.
- **Settings:** select language, SI/US units, and appearance preferences.
- **About:** view app information and developer details.

The exact labels and flow should be confirmed against the submitted build during the iPhone recording.

### 4. External services, tools, and platforms

The calculation logic runs locally in the app. The reviewed source configuration does not identify a required external calculation API, account/authentication service, payment processor, advertising SDK, analytics SDK, or AI service for the core functions.

The app provides links to the SISCOM/company website and/or other informational websites where shown in the interface. Those links open external websites; they are not required for the core calculations. Confirm the final link list against the submitted build before sending this note.

### 5. Regional differences

The core calculation functionality is intended to operate consistently across regions. The app offers multiple interface languages and SI/US unit preferences. No region-specific calculation or feature restriction is intended. Confirm availability settings and the actual submitted build before making this statement final.

### 6. Regulated industry and third-party material

Duct Checker Pro is an HVAC engineering calculation utility. It does not provide medical, financial, legal, or other regulated professional services. It is not intended to certify a design or replace review by a qualified engineer.

The repository documentation states that SISCOM/company branding assets were supplied by the owner. No third-party executable or reverse-engineered binary is part of the release source. Confirm that all artwork, fonts, icons, and any material visible in the submitted build are owned, licensed, or otherwise authorized by SISCOM before making the final representation to App Review.

## iPhone recording checklist

1. Install/open the exact 5.2.0 (50300) build under review on the physical iPhone.
2. Enable iOS Screen Recording from Control Center.
3. Start recording before launching the app.
4. Launch the app and show the first screen.
5. Demonstrate one representative calculation in Duct Size.
6. Demonstrate rectangular/round conversion.
7. Demonstrate Outlet Sizing.
8. Open Settings and show language/unit preferences (avoid changing settings in a way that disrupts the demo).
9. Open About and show SISCOM developer information.
10. If feasible, enable Airplane Mode and demonstrate that a calculation still works; restore connectivity afterward.
11. Stop recording and review the video for legibility, accidental personal notifications, and uninterrupted capture.
12. Attach the recording to the App Review response/submission. Do not claim it was attached until verified.

## Submission gate

- [ ] Owner has tested the exact build 5.2.0 (50300) on a physical iPhone.
- [ ] Screen recording captured and attached.
- [ ] All feature names and steps checked against the submitted build.
- [ ] External links and third-party asset rights confirmed.
- [ ] Regional availability and language/unit behavior confirmed.
- [ ] Owner has reviewed and approved the final English text.
- [ ] Only then resubmit the existing version to App Review.

No App Store Connect fields are changed by this document. No build is created, uploaded, or submitted by this documentation change.
