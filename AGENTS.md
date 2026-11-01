# Working on Duct Checker Pro

- Canonical release UI and calculation engine are in web/. Android and iOS use the same bundled assets through Capacitor.
- Preserve the Android application ID vn.ductchecker.pro. Do not invent a replacement upload key or guess a production versionCode.
- Keep English as the fresh-install default. Preserve the five languages and physical values during SI/US changes.
- Use only original app/company logos. Preserve user-approved Neumorphic styling, blue #2563EB and fixed mode order.
- Never add FabricAir calculation coefficients without verified product-specific engineering data. Existing reference-only entries do not establish a supported friction model.
- Keep computation in web/engine.js, separate from UI. Changes to formulas require meaningful numerical/constraint tests. UI-only changes need targeted browser checks, not broad test repetition.
- Run npm run build and npx cap sync after shared UI changes before native builds. Never edit generated copies in native public asset folders.
- native-swiftui/ is a preserved earlier prototype, not the current release target. Do not present it as synchronized with current features.
- No store upload, production deployment or signing-key change without explicit authorization. Build artifacts and source preparation are allowed within a requested release task.
- Keep credentials, keystores, provisioning profiles, local SDK paths, binaries from third-party apps and reverse-engineering toolchains out of Git.
