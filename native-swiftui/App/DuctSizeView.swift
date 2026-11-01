import SwiftUI

struct DuctSizeView: View {
    @EnvironmentObject private var p: Preferences
    @State private var flow: Double? = 1
    @State private var width: Double? = 0.6
    @State private var height: Double? = 0.4
    @State private var target: Double? = 5
    @State private var sizing = false

    private var calculation: Result<(Double, Double, Double, Double), Error> {
        Result {
            let q = try required(flow), w = try required(width)
            let h = try sizing ? DuctEngine.sizeHeight(flow: q, targetVelocity: required(target), width: w) : required(height)
            let area = try DuctEngine.area(width: w, height: h)
            return (q, w, h, area)
        }
    }
    var body: some View {
        Screen(title: "Duct Size") {
            HStack(spacing: 12) {
                Image("DuctLogo").resizable().scaledToFit().frame(width: 52, height: 52).accessibilityHidden(true)
                VStack(alignment: .leading) {
                    Text("Duct Checker Pro").font(.headline)
                    Text("v5.02 · " + p.units.rawValue).font(.subheadline).foregroundStyle(.secondary)
                }
            }
            Picker(p.text("Mode"), selection: $sizing) {
                Text(p.text("Check size")).tag(false)
                Text(p.text("Size by velocity")).tag(true)
            }.pickerStyle(.segmented)
            VStack(spacing: 16) {
                NumberField(title: "Airflow", value: $flow, quantity: .flow)
                NumberField(title: "Width", value: $width, quantity: .dimension)
                if sizing { NumberField(title: "Target velocity", value: $target, quantity: .velocity) }
                else { NumberField(title: "Height", value: $height, quantity: .dimension) }
            }
            switch calculation {
            case .success(let r):
                GlassPanel {
                    if sizing { Metric(title: "Required height", value: p.units.dimensionFromSI(r.2), unit: p.units.dimensionUnit, prominent: true) }
                    Metric(title: "Air velocity", value: p.units.velocityFromSI(r.0 / r.3), unit: p.units.velocityUnit, prominent: !sizing)
                    Divider()
                    Metric(title: "Cross-sectional area", value: p.units.areaFromSI(r.3), unit: p.units.areaUnit)
                    PressureMetric(result: Result { try DuctEngine.rectangularPressure(flow: r.0, width: r.1, height: r.2) })
                }
            case .failure(let error): CalculationNotice(error: error)
            }
            Text(p.text("Pressure assumptions")).font(.footnote).foregroundStyle(.secondary)
            if sizing { Text(p.text("Unrounded size note")).font(.footnote).foregroundStyle(.secondary) }
        }
    }
}
