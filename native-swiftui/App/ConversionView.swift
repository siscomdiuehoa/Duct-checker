import SwiftUI

struct ConversionView: View {
    @EnvironmentObject private var p: Preferences
    @State private var reverse = false
    @State private var method = DuctEngine.Conversion.equalArea
    @State private var width: Double? = 1.3
    @State private var height: Double? = 0.55
    @State private var diameter: Double? = 0.95
    @State private var flow: Double? = 1
    private var result: Result<(Double, Double, Double, Double), Error> {
        Result {
            let w = try required(width), q = try required(flow)
            if reverse {
                let d = try required(diameter)
                return (w, try DuctEngine.height(diameter: d, width: w, method: method), d, q)
            }
            let h = try required(height)
            return (w, h, try DuctEngine.diameter(width: w, height: h, method: method), q)
        }
    }
    var body: some View {
        Screen(title: "Convert") {
            Picker(p.text("Direction"), selection: $reverse) {
                Text(p.text("Rectangle to round")).tag(false)
                Text(p.text("Round to rectangle")).tag(true)
            }
            Picker(p.text("Method"), selection: $method) {
                Text(p.text("Equal area")).tag(DuctEngine.Conversion.equalArea)
                Text(p.text("Equal friction")).tag(DuctEngine.Conversion.equalFriction)
            }.pickerStyle(.segmented)
            Text(p.text(method == .equalArea ? "Area explanation" : "Friction explanation"))
                .font(.callout).foregroundStyle(.secondary)
            NumberField(title: "Airflow", value: $flow, quantity: .flow)
            NumberField(title: reverse ? "Fixed width" : "Width", value: $width, quantity: .dimension)
            if reverse { NumberField(title: "Diameter", value: $diameter, quantity: .dimension) }
            else { NumberField(title: "Height", value: $height, quantity: .dimension) }
            switch result {
            case .success(let r):
                GlassPanel {
                    Metric(title: reverse ? "Required height" : "Round diameter",
                           value: p.units.dimensionFromSI(reverse ? r.1 : r.2), unit: p.units.dimensionUnit, prominent: true)
                    Divider()
                    Text(p.text("Rectangular duct")).font(.headline)
                    Metric(title: "Cross-sectional area", value: p.units.areaFromSI(r.0 * r.1), unit: p.units.areaUnit)
                    Metric(title: "Air velocity", value: p.units.velocityFromSI(r.3 / (r.0 * r.1)), unit: p.units.velocityUnit)
                    PressureMetric(result: Result { try DuctEngine.rectangularPressure(flow: r.3, width: r.0, height: r.1) })
                    Divider()
                    Text(p.text("Round duct")).font(.headline)
                    Metric(title: "Cross-sectional area", value: p.units.areaFromSI(.pi * r.2 * r.2 / 4), unit: p.units.areaUnit)
                    Metric(title: "Air velocity", value: p.units.velocityFromSI(4 * r.3 / (.pi * r.2 * r.2)), unit: p.units.velocityUnit)
                    PressureMetric(result: Result { try DuctEngine.roundPressure(flow: r.3, diameter: r.2) })
                }
            case .failure(let error): CalculationNotice(error: error)
            }
            Text(p.text("Pressure assumptions")).font(.footnote).foregroundStyle(.secondary)
        }
    }
}
