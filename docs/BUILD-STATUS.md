# Build status

- Shared web engine: 24 tests passed locally before packaging; rerun with npm test.
- English default: document lang=en; fresh app preference key defaults to en; earlier SwiftUI Preferences also defaults to en.
- Android/iOS native host projects generated using pinned Capacitor8.6.0, package lock committed.
- Android compilation on Windows was blocked by Java NIO loopback socket setup, reproduced with two JDKs and IPv4/Windows selector settings. GitHub Actions is the alternate build environment; check actual CI result before calling an artifact built.
- iOS cannot compile on this Windows host; the macOS Actions job builds unsigned archive + Simulator app.
- Store signing: Android original upload key and highest versionCode not supplied; Apple Developer team/certificate not supplied. No store publication occurred.
