import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var p: Preferences
    var body: some View {
        Screen(title: "Settings") {
            GlassPanel {
                Picker(p.text("Language"), selection: $p.language) {
                    Text("English").tag("en")
                    Text("Tiếng Việt").tag("vi")
                    Text("中文").tag("zh-Hans")
                    Text("日本語").tag("ja")
                    Text("ไทย").tag("th")
                }
                Picker(p.text("Units"), selection: $p.unitCode) {
                    Text("SI").tag("SI")
                    Text("US").tag("US")
                }.pickerStyle(.segmented)
                Text(p.text("Unit preservation")).font(.footnote).foregroundStyle(.secondary)
            }
            NavigationLink { AboutView() } label: {
                Label(p.text("About"), systemImage: "info.circle").frame(minHeight: 44)
            }
        }
    }
}

struct AboutView: View {
    @EnvironmentObject private var p: Preferences
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Image("DuctLogo").resizable().scaledToFit().frame(width: 88, height: 88)
                    .accessibilityLabel("Duct Checker Pro")
                Text("Duct Checker Pro").font(.title.bold())
                Text("v5.02").foregroundStyle(.secondary)
                GlassPanel {
                    Text(p.text("Developer")).font(.headline)
                    Image("SiscomLogo").resizable().scaledToFit().frame(maxWidth: 320)
                        .accessibilityLabel("SISCOM")
                    Text("Siscom Technical Trading Joint Stock Company")
                    Link("siscom.vn", destination: URL(string: "https://siscom.vn")!)
                        .frame(minHeight: 44)
                }
                Text(p.text("About calculation")).font(.callout).foregroundStyle(.secondary)
            }.padding(20).frame(maxWidth: 640)
        }.navigationTitle(p.text("About"))
    }
}
