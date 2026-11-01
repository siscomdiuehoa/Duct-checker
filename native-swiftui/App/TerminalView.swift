import SwiftUI

struct TerminalView: View {
    @EnvironmentObject private var p: Preferences
    @State private var grille = false
    @State private var flow: Double? = 0.3
    @State private var velocity: Double? = 2.5
    @State private var ratio: Double? = 0.6
    @State private var count = 4
    private var result: Result<DuctEngine.TerminalResult, Error> {
        Result { try DuctEngine.terminal(flow: required(flow), count: count,
                                        freeVelocity: required(velocity), freeAreaRatio: required(ratio)) }
    }
    var body: some View {
        Screen(title: "Diffuser / Air Grille") {
            Picker(p.text("Type"), selection: $grille) {
                Text(p.text("Diffuser")).tag(false)
                Text(p.text("Air Grille")).tag(true)
            }.pickerStyle(.segmented)
            Text(p.text(grille ? "Grille note" : "Diffuser note")).font(.callout).foregroundStyle(.secondary)
            NumberField(title: "Total airflow", value: $flow, quantity: .flow)
            Stepper(value: $count, in: 1...1000) { Text(p.text("Quantity") + ": \(count)") }.frame(minHeight: 44)
            NumberField(title: "Free-area velocity", value: $velocity, quantity: .velocity)
            NumberField(title: "Free-area ratio", value: $ratio, quantity: .ratio)
            switch result {
            case .success(let r):
                GlassPanel {
                    Metric(title: "Gross face area per outlet", value: p.units.areaFromSI(r.grossAreaPerTerminal), unit: p.units.areaUnit, prominent: true)
                    Metric(title: "Free area per outlet", value: p.units.areaFromSI(r.freeAreaPerTerminal), unit: p.units.areaUnit)
                    Metric(title: "Airflow per outlet", value: p.units.flowFromSI(r.flowPerTerminal), unit: p.units.flowUnit)
                    Metric(title: "Equivalent square side", value: p.units.dimensionFromSI(r.squareSide), unit: p.units.dimensionUnit)
                }
            case .failure(let error): CalculationNotice(error: error)
            }
            Text(p.text("Terminal limitation")).font(.footnote).foregroundStyle(.secondary)
        }
    }
}
