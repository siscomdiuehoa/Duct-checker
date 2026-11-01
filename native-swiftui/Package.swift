// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "DuctCore",
    platforms: [.iOS(.v17), .macOS(.v13)],
    products: [.library(name: "DuctCore", targets: ["DuctCore"])],
    targets: [
        .target(name: "DuctCore"),
        .testTarget(name: "DuctCoreTests", dependencies: ["DuctCore"])
    ]
)
