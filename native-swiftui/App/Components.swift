import SwiftUI

enum Quantity { case dimension, flow, velocity, ratio }

struct NumberField: View {
    @EnvironmentObject private var p: Preferences
    let title: String
    @Binding var value: Double?
    let quantity: Quantity
    @State private var raw = ""
    @State private var rendered: String? = nil
    @FocusState private var focused: Bool

    private var unit: String {
        switch quantity {
        case .dimension: return p.units.dimensionUnit
        case .flow: return p.units.flowUnit
        case .velocity: return p.units.velocityUnit
        case .ratio: return "%"
        }
    }
    private func toSI(_ v: Double) -> Double {
        switch quantity {
        case .dimension: return p.units.dimensionToSI(v)
        case .flow: return p.units.flowToSI(v)
        case .velocity: return p.units.velocityToSI(v)
        case .ratio: return v / 100
        }
    }
    private func fromSI(_ v: Double) -> Double {
        switch quantity {
        case .dimension: return p.units.dimensionFromSI(v)
        case .flow: return p.units.flowFromSI(v)
        case .velocity: return p.units.velocityFromSI(v)
        case .ratio: return v * 100
        }
    }
    private func refresh() {
        let display = value.map {
            fromSI($0).formatted(.number.locale(Locale(identifier: p.language))
                .grouping(.never).precision(.fractionLength(0...6)))
        } ?? ""
        rendered = display
        raw = display
    }
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(p.text(title)).font(.subheadline).foregroundStyle(.secondary)
            HStack {
                TextField(p.text(title), text: $raw)
                    .keyboardType(.decimalPad).focused($focused)
                    .accessibilityLabel(p.text(title) + ", " + unit)
                    .onChange(of: raw) { _, new in
                        guard focused, new != rendered else { return }
                        rendered = nil
                        let separator = Locale(identifier: p.language).decimalSeparator ?? "."
                        let cleaned = new.trimmingCharacters(in: .whitespaces)
                            .replacingOccurrences(of: separator, with: ".")
                        if let n = Double(cleaned), n.isFinite, n > 0 { value = toSI(n) }
                        else { value = nil }
                    }
                Text(unit).font(.subheadline).foregroundStyle(.secondary)
            }.padding(12).background(Color(.tertiarySystemFill), in: RoundedRectangle(cornerRadius: 8))
            if value == nil { Text(p.text("Enter a positive number")).font(.caption).foregroundStyle(.red) }
        }
        .onAppear { refresh() }
        .onChange(of: p.unitCode) { _, _ in refresh() }
        .onChange(of: p.language) { _, _ in refresh() }
        .onChange(of: focused) { _, isFocused in if !isFocused { refresh() } }
    }
}

struct GlassPanel<Content: View>: View {
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    @ViewBuilder let content: Content
    var body: some View {
        VStack(alignment: .leading, spacing: 16) { content }
            .frame(maxWidth: .infinity, alignment: .leading).padding(20)
            .background {
                if reduceTransparency {
                    RoundedRectangle(cornerRadius: 24).fill(Color(.secondarySystemBackground))
                } else {
                    RoundedRectangle(cornerRadius: 24).fill(.regularMaterial)
                }
            }
            .overlay(RoundedRectangle(cornerRadius: 24).stroke(.primary.opacity(0.08), lineWidth: 1))
    }
}

struct Screen<Content: View>: View {
    @EnvironmentObject private var p: Preferences
    let title: String
    @ViewBuilder let content: Content
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) { content }
                    .frame(maxWidth: 640).padding(20).frame(maxWidth: .infinity)
            }
            .background {
                LinearGradient(colors: [Color.blue.opacity(0.10), Color(.systemBackground), Color.cyan.opacity(0.06)],
                               startPoint: .topLeading, endPoint: .bottomTrailing).ignoresSafeArea()
            }
            .navigationTitle(p.text(title))
            .scrollDismissesKeyboard(.interactively)
            .toolbar {
                ToolbarItemGroup(placement: .keyboard) {
                    Spacer()
                    Button(p.text("Done")) {
                        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                    }
                }
            }
        }
    }
}

struct Metric: View {
    @EnvironmentObject private var p: Preferences
    let title: String
    let value: Double
    let unit: String
    var prominent = false
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(p.text(title)).font(.subheadline).foregroundStyle(.secondary)
            Text(value.formatted(.number.precision(.fractionLength(0...3))) + " " + unit)
                .font(prominent ? .largeTitle.weight(.semibold) : .title3.weight(.medium))
                .monospacedDigit().foregroundStyle(prominent ? Color.accentColor : .primary)
                .textSelection(.enabled)
        }.accessibilityElement(children: .combine)
    }
}

func required(_ value: Double?) throws -> Double {
    guard let value else { throw CalculationError.invalidInput }
    try DuctEngine.positive(value)
    return value
}

struct CalculationNotice: View {
    @EnvironmentObject private var p: Preferences
    let error: Error
    var body: some View {
        let key = (error as? CalculationError) == .transitionFlow ? "Transition flow: pressure unavailable" :
            (error as? CalculationError) == .outsideModel ? "Outside the calculation model" : "Check all inputs"
        Label(p.text(key), systemImage: "exclamationmark.circle")
            .font(.callout).foregroundStyle(.secondary).accessibilityAddTraits(.updatesFrequently)
    }
}

struct PressureMetric: View {
    @EnvironmentObject private var p: Preferences
    let result: Result<DuctEngine.PressureResult, Error>
    var body: some View {
        switch result {
        case .success(let r):
            Metric(title: "Friction loss", value: p.units.pressureFromSI(r.pascalsPerMeter), unit: p.units.pressureUnit)
        case .failure(let error): CalculationNotice(error: error)
        }
    }
}
