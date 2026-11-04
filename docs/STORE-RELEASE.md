# Store release checklist — 5.3.0

## Android / existing Play listing

Application ID must stay `vn.ductchecker.pro`.
Owner confirmed current Play version **5.2.0 / 50200**, next release **5.3.0 / 50300**.
Google Play App Signing is enabled. The old upload key is lost; a replacement RSA 4096-bit upload key (alias `ductchecker-upload`) has been created outside this repository and its public certificate submitted for reset. **Google approval is pending.** Do not sign/upload until the owner confirms approval and the accepted certificate is checked. Never commit the private keystore, passwords or signing secrets. Local key paths remain outside repository documentation.

Build with JDK21/SDK36 and the signing environment variables described in README. Verify the AAB signature/certificate against Play Console before upload. Upload first to an internal test track; review pre-launch report, Data safety, content rating, target audience, ads declaration and screenshots. No upload is automated here.

## iOS / first release

Use bundle ID vn.siscom.ductcheckerpro; owner reports registration under Team 7N8G738TDU. Verify app record/history before creating or uploading anything. Use Xcode26+ / iOS26 SDK or later for App Store Connect requirements. Select the owner's team and let Xcode manage signing, or supply the owner's distribution certificate/profile locally. The CI archive is intentionally unsigned. Organizer → Distribute App → App Store Connect creates the signed package/upload only after the owner authorizes distribution.

The shared UI is hosted in Capacitor, not the earlier SwiftUI prototype. Verify all calculations, keyboard, safe areas, offline startup, external links, light/dark, all languages, SI/US and VoiceOver on a real iPhone and Android device before submitting for review. Approval is determined by the stores, not by successful compilation.

## Draft listing / privacy

Name: Duct Checker Pro
Version: 5.3.0
Developer: Siscom Technical Trading Joint Stock Company
Website: https://siscom.vn
Suggested short description: Offline duct and air grille sizing for HVAC design.

The code has no analytics, ads or data-upload SDK. Inputs and preferences are processed locally. External links open manufacturer/company websites and those websites have their own policies. Store privacy answers must be confirmed against the final signed build and any future SDK changes. Host a reviewed privacy policy at an owner-controlled URL; no policy URL is invented here. Confirm support contact and required screenshots in each console.

Technical requirements checked against official sources:
- https://support.google.com/googleplay/android-developer/answer/11926878
- https://developer.apple.com/news/?id=ueeok6yw
- https://support.google.com/googleplay/android-developer/answer/9842756
- https://capacitorjs.com/docs/getting-started/environment-setup
