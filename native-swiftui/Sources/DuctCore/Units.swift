import Foundation

public enum UnitSystem: String, CaseIterable, Sendable {
    case si = "SI", us = "US"
    public var dimensionUnit: String { self == .si ? "mm" : "in" }
    public var flowUnit: String { self == .si ? "m³/h" : "cfm" }
    public var velocityUnit: String { self == .si ? "m/s" : "fpm" }
    public var areaUnit: String { self == .si ? "m²" : "ft²" }
    public var pressureUnit: String { self == .si ? "Pa/m" : "in.w.g./100 ft" }
    public func dimensionToSI(_ value: Double) -> Double { value * (self == .si ? 0.001 : 0.0254) }
    public func dimensionFromSI(_ value: Double) -> Double { value / (self == .si ? 0.001 : 0.0254) }
    public func flowToSI(_ value: Double) -> Double { value * (self == .si ? 1 / 3600.0 : 0.0004719474432) }
    public func flowFromSI(_ value: Double) -> Double { value / (self == .si ? 1 / 3600.0 : 0.0004719474432) }
    public func velocityToSI(_ value: Double) -> Double { value * (self == .si ? 1 : 0.00508) }
    public func velocityFromSI(_ value: Double) -> Double { value / (self == .si ? 1 : 0.00508) }
    public func areaFromSI(_ value: Double) -> Double { value / (self == .si ? 1 : 0.09290304) }
    public func pressureFromSI(_ value: Double) -> Double { value * (self == .si ? 1 : 30.48 / 249.08891) }
}
