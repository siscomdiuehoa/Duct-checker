import SwiftUI

@main
struct DuctCheckerApp: App {
    @StateObject private var preferences = Preferences()
    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(preferences)
                .environment(\.locale, Locale(identifier: preferences.language))
                .tint(.blue)
        }
    }
}

final class Preferences: ObservableObject {
    @AppStorage("language") var language = "en" { willSet { objectWillChange.send() } }
    @AppStorage("units") var unitCode = "SI" { willSet { objectWillChange.send() } }
    var units: UnitSystem { UnitSystem(rawValue: unitCode) ?? .si }
    func text(_ key: String) -> String {
        guard let path = Bundle.main.path(forResource: language, ofType: "lproj"),
              let bundle = Bundle(path: path) else { return key }
        return bundle.localizedString(forKey: key, value: key, table: nil)
    }
}

struct RootView: View {
    @EnvironmentObject private var p: Preferences
    var body: some View {
        TabView {
            DuctSizeView().tabItem { Label(p.text("Duct Size"), systemImage: "slider.horizontal.3") }
            ConversionView().tabItem { Label(p.text("Convert"), systemImage: "arrow.left.arrow.right") }
            TerminalView().tabItem { Label(p.text("Air outlets"), systemImage: "square.grid.3x3") }
            SettingsView().tabItem { Label(p.text("Settings"), systemImage: "gearshape") }
        }
    }
}
