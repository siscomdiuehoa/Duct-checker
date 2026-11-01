import XCTest
@testable import DuctCore

final class DuctCoreTests: XCTestCase {
    func testKnownAreaAndVelocity() throws {
        XCTAssertEqual(try DuctEngine.area(width: 1.3, height: 0.55), 0.715, accuracy: 1e-12)
        XCTAssertEqual(try DuctEngine.velocity(flow: 1.2, area: 0.24), 5, accuracy: 1e-12)
        XCTAssertEqual(try DuctEngine.sizeHeight(flow: 1.2, targetVelocity: 5, width: 0.6), 0.4, accuracy: 1e-12)
    }
    func testAreaDiameterIsNotMockup1050mm() throws {
        let d = try DuctEngine.equalAreaDiameter(width: 1.3, height: 0.55)
        XCTAssertEqual(d, 0.9541311620975605, accuracy: 1e-12)
        XCTAssertEqual(try DuctEngine.roundArea(diameter: d), 0.715, accuracy: 1e-12)
        XCTAssertGreaterThan(abs(d - 1.05), 0.09)
    }
    func testConversionRoundTrips() throws {
        for method in DuctEngine.Conversion.allCases {
            for width in [0.1, 0.6, 1.3, 2.0] {
                for height in [0.1, 0.4, 0.55, 1.0] {
                    let d = try DuctEngine.diameter(width: width, height: height, method: method)
                    XCTAssertEqual(try DuctEngine.height(diameter: d, width: width, method: method), height, accuracy: 1e-10)
                    XCTAssertEqual(try DuctEngine.diameter(width: height, height: width, method: method), d, accuracy: 1e-12)
                }
            }
        }
    }
    func testEqualFrictionIsDifferentFromEqualArea() throws {
        let da = try DuctEngine.equalAreaDiameter(width: 1.3, height: 0.55)
        let df = try DuctEngine.equivalentDiameter(width: 1.3, height: 0.55)
        XCTAssertEqual(df, 0.9038402891565726, accuracy: 1e-12)
        XCTAssertLessThan(df, da)
        let rect = try DuctEngine.rectangularPressure(flow: 1, width: 1.3, height: 0.55)
        let round = try DuctEngine.roundPressure(flow: 1, diameter: df)
        XCTAssertEqual(rect.pascalsPerMeter, round.pascalsPerMeter, accuracy: 1e-12)
        let equalAreaRound = try DuctEngine.roundPressure(flow: 1, diameter: da)
        XCTAssertGreaterThan(rect.pascalsPerMeter, equalAreaRound.pascalsPerMeter)
    }
    func testColebrookIndependentReferenceAndResidual() throws {
        // Standard benchmark Re=100000, epsilon/D=0.0001.
        let f = try DuctEngine.frictionFactor(reynolds: 100000, relativeRoughness: 0.0001)
        XCTAssertEqual(f, 0.01851386607747, accuracy: 1e-12)
        XCTAssertEqual(1 / sqrt(f) + 2 * log10(0.0001 / 3.7 + 2.51 / (100000 * sqrt(f))), 0, accuracy: 1e-10)
    }
    func testLaminarAndTransitionBoundaries() throws {
        XCTAssertEqual(try DuctEngine.frictionFactor(reynolds: 1000, relativeRoughness: 0), 0.064, accuracy: 1e-12)
        for re in [2300.0, 3000, 3999.999] {
            XCTAssertThrowsError(try DuctEngine.frictionFactor(reynolds: re, relativeRoughness: 0)) {
                XCTAssertEqual($0 as? CalculationError, .transitionFlow)
            }
        }
        XCTAssertNoThrow(try DuctEngine.frictionFactor(reynolds: 4000, relativeRoughness: 0))
    }
    func testPressureIncreasesWithFlow() throws {
        let p1 = try DuctEngine.roundPressure(flow: 1, diameter: 0.5)
        let p2 = try DuctEngine.roundPressure(flow: 2, diameter: 0.5)
        XCTAssertGreaterThan(p2.pascalsPerMeter, p1.pascalsPerMeter)
        XCTAssertEqual(p1.pascalsPerMeter, 1.204 * pow(4 / (.pi * 0.25), 2) * p1.darcyFactor, accuracy: 1e-10)
    }
    func testTerminalConservation() throws {
        let r = try DuctEngine.terminal(flow: 0.3, count: 4, freeVelocity: 2.5, freeAreaRatio: 0.6)
        XCTAssertEqual(r.flowPerTerminal * 4, 0.3, accuracy: 1e-12)
        XCTAssertEqual(r.freeAreaPerTerminal, 0.03, accuracy: 1e-12)
        XCTAssertEqual(r.grossAreaPerTerminal, 0.05, accuracy: 1e-12)
        XCTAssertEqual(r.squareSide * r.squareSide, 0.05, accuracy: 1e-12)
    }
    func testUnitAnchorsAndRoundTrips() {
        XCTAssertEqual(UnitSystem.us.dimensionToSI(1), 0.0254, accuracy: 1e-12)
        XCTAssertEqual(UnitSystem.us.flowToSI(1), 0.0004719474432, accuracy: 1e-15)
        XCTAssertEqual(UnitSystem.si.flowToSI(3600), 1, accuracy: 1e-12)
        XCTAssertEqual(UnitSystem.us.velocityToSI(1), 0.00508, accuracy: 1e-12)
        XCTAssertEqual(UnitSystem.us.areaFromSI(0.09290304), 1, accuracy: 1e-12)
        XCTAssertEqual(UnitSystem.us.pressureFromSI(249.08891 / 30.48), 1, accuracy: 1e-12)
        for units in UnitSystem.allCases {
            for value in [0.01, 1.0, 123.456, 10000] {
                XCTAssertEqual(units.dimensionFromSI(units.dimensionToSI(value)), value, accuracy: 1e-9)
                XCTAssertEqual(units.flowFromSI(units.flowToSI(value)), value, accuracy: 1e-9)
                XCTAssertEqual(units.velocityFromSI(units.velocityToSI(value)), value, accuracy: 1e-9)
            }
        }
    }
    func testRejectInvalidInputs() {
        for value in [0, -1, Double.nan, Double.infinity] {
            XCTAssertThrowsError(try DuctEngine.area(width: value, height: 0.5))
            XCTAssertThrowsError(try DuctEngine.roundPressure(flow: value, diameter: 0.5))
            XCTAssertThrowsError(try DuctEngine.roundArea(diameter: value))
        }
        XCTAssertThrowsError(try DuctEngine.terminal(flow: 1, count: 0, freeVelocity: 2, freeAreaRatio: 0.6))
        XCTAssertThrowsError(try DuctEngine.terminal(flow: 1, count: 1, freeVelocity: 2, freeAreaRatio: 1.1))
        XCTAssertThrowsError(try DuctEngine.roundPressure(flow: 1, diameter: 0.5, roughness: -0.1))
        XCTAssertThrowsError(try DuctEngine.rectangularPressure(flow: 0.00001, width: 1, height: 1))
    }
}
