import Foundation

public enum CalculationError: Error, Equatable {
    case invalidInput, transitionFlow, outsideModel
}

/// All engine inputs and outputs use SI (m, m³/s, Pa, kg/m³, Pa·s).
public enum DuctEngine {
    public static func positive(_ values: Double...) throws {
        guard values.allSatisfy({ $0.isFinite && $0 > 0 }) else {
            throw CalculationError.invalidInput
        }
    }

    public static func area(width: Double, height: Double) throws -> Double {
        try positive(width, height)
        let value = width * height
        try positive(value)
        return value
    }

    public static func roundArea(diameter: Double) throws -> Double {
        try positive(diameter)
        let value = Double.pi * pow(diameter / 2, 2)
        try positive(value)
        return value
    }

    public static func velocity(flow: Double, area: Double) throws -> Double {
        try positive(flow, area)
        let value = flow / area
        try positive(value)
        return value
    }

    public static func equalAreaDiameter(width: Double, height: Double) throws -> Double {
        let d = sqrt((try area(width: width, height: height)) / .pi) * 2
        try positive(d)
        return d
    }

    /// Huebscher equivalent circular diameter: equal flow and friction per length.
    /// Empirical turbulent HVAC sizing approximation, not hydraulic diameter.
    public static func equivalentDiameter(width: Double, height: Double) throws -> Double {
        let a = try area(width: width, height: height)
        let d = 1.30 * pow(a, 0.625) / pow(width + height, 0.25)
        try positive(d)
        return d
    }

    public enum Conversion: String, CaseIterable, Sendable { case equalArea, equalFriction }

    public static func diameter(width: Double, height: Double, method: Conversion) throws -> Double {
        switch method {
        case .equalArea: return try equalAreaDiameter(width: width, height: height)
        case .equalFriction: return try equivalentDiameter(width: width, height: height)
        }
    }

    /// Fixed width makes the reverse conversion unique; bisection for Huebscher.
    public static func height(diameter: Double, width: Double, method: Conversion) throws -> Double {
        try positive(diameter, width)
        if method == .equalArea {
            let h = try roundArea(diameter: diameter) / width
            try positive(h)
            return h
        }
        var low = 0.0
        var high = max(width, diameter)
        for _ in 0..<100 {
            if try equivalentDiameter(width: width, height: high) >= diameter { break }
            high *= 2
        }
        guard try equivalentDiameter(width: width, height: high) >= diameter else {
            throw CalculationError.outsideModel
        }
        for _ in 0..<100 {
            let middle = (low + high) / 2
            if try equivalentDiameter(width: width, height: middle) < diameter { low = middle }
            else { high = middle }
        }
        return (low + high) / 2
    }

    public static func sizeHeight(flow: Double, targetVelocity: Double, width: Double) throws -> Double {
        try positive(flow, targetVelocity, width)
        let result = flow / targetVelocity / width
        try positive(result)
        return result
    }

    /// Darcy (not Fanning) friction factor. Transition region deliberately rejected.
    public static func frictionFactor(reynolds: Double, relativeRoughness: Double) throws -> Double {
        try positive(reynolds)
        guard relativeRoughness.isFinite, (0...0.05).contains(relativeRoughness) else {
            throw CalculationError.outsideModel
        }
        if reynolds < 2300 { return 64 / reynolds }
        guard reynolds >= 4000 else { throw CalculationError.transitionFlow }
        var inverseRoot = 7.0
        for _ in 0..<100 {
            let next = -2 * log10(relativeRoughness / 3.7 + 2.51 * inverseRoot / reynolds)
            if abs(next - inverseRoot) < 1e-12 { return 1 / (next * next) }
            inverseRoot = next
        }
        throw CalculationError.outsideModel
    }

    public struct PressureResult: Sendable {
        public let pascalsPerMeter: Double
        public let reynolds: Double
        public let darcyFactor: Double
    }

    public static func roundPressure(flow: Double, diameter: Double,
                                     roughness: Double = 0.00009,
                                     density: Double = 1.204,
                                     viscosity: Double = 0.0000181) throws -> PressureResult {
        try positive(flow, diameter, density, viscosity)
        guard roughness.isFinite, roughness >= 0 else { throw CalculationError.invalidInput }
        let v = try velocity(flow: flow, area: roundArea(diameter: diameter))
        let re = density * v * diameter / viscosity
        let f = try frictionFactor(reynolds: re, relativeRoughness: roughness / diameter)
        let pressure = f * density * v * v / (2 * diameter)
        try positive(pressure)
        return PressureResult(pascalsPerMeter: pressure, reynolds: re, darcyFactor: f)
    }

    /// Uses equivalent ROUND area and velocity for pressure, actual area for displayed velocity.
    /// Restrict this rectangular approximation to turbulent flow.
    public static func rectangularPressure(flow: Double, width: Double, height: Double) throws -> PressureResult {
        let result = try roundPressure(flow: flow, diameter: equivalentDiameter(width: width, height: height))
        guard result.reynolds >= 4000 else { throw CalculationError.outsideModel }
        return result
    }

    public struct TerminalResult: Sendable {
        public let flowPerTerminal: Double
        public let freeAreaPerTerminal: Double
        public let grossAreaPerTerminal: Double
        public let squareSide: Double
    }

    /// Preliminary free-area sizing, NOT manufacturer throw/noise/pressure selection.
    public static func terminal(flow: Double, count: Int, freeVelocity: Double,
                                freeAreaRatio: Double) throws -> TerminalResult {
        try positive(flow, freeVelocity, freeAreaRatio)
        guard count > 0, freeAreaRatio <= 1 else { throw CalculationError.invalidInput }
        let q = flow / Double(count)
        let free = q / freeVelocity
        let gross = free / freeAreaRatio
        try positive(q, free, gross)
        return TerminalResult(flowPerTerminal: q, freeAreaPerTerminal: free,
                              grossAreaPerTerminal: gross, squareSide: sqrt(gross))
    }
}
