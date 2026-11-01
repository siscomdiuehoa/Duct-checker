# Engineering model — v5.02

All engine values are SI. UI units are presentation only; editable fields retain physical
values when switching SI/US. Default SI uses m³/h, mm, m/s, m², Pa/m. US uses cfm,
in, fpm, ft², in.w.g./100 ft (249.08891 Pa per inch of water).

## Geometry and sizing

- Rectangular area A = a b; circular area A = π D² / 4.
- Mean velocity V = Q / A.
- Size by velocity: b = Q / (V_target a). No automatic catalog rounding.
- Equal-area conversion D_A = √(4ab/π). This preserves velocity, not friction.
- Equal-friction approximation D_e = 1.30 (ab)^0.625 / (a+b)^0.25.
  This is the Huebscher equivalent circular diameter, NOT hydraulic diameter.
- Reverse conversion requires fixed width. Equal area is direct; equal friction is
  solved by bracket expansion and 100 bisection steps.

Example independent of AI mockups: 1300 × 550 mm → area 0.715 m²;
equal-area round diameter **954.131162 mm**; equivalent-friction diameter
**903.840289 mm**. Neither is a manufactured size or a blanket recommendation.

## Straight-duct friction

Round: V = Q/(πD²/4), Re = ρVD/μ, Δp/L = f ρ V²/(2D).
Darcy f (not Fanning): laminar Re < 2300 uses 64/Re. Re in [2300, 4000) returns
an explicit unavailable result. Turbulent Re ≥ 4000 uses the implicit Colebrook
equation solved in x = 1/√f: x = −2 log10(ε/(3.7D) + 2.51x/Re).
Relative roughness must be in [0, 0.05]. Nonfinite and nonpositive inputs rejected.

Rectangular pressure is an **equivalent-round estimate**: use D_e to calculate
both round area/velocity and pressure. Do not mix actual rectangular velocity with
D_e in Darcy's equation. Actual rectangular velocity shown separately uses ab.
Rectangular friction model requires turbulent flow. For identical Q, D_e, air and
roughness, equal-friction conversion produces identical modeled Pa/m by construction;
this is not an independent experiment validating that empirical correlation.

Defaults: density 1.204 kg/m³, dynamic viscosity 1.81×10⁻⁵ Pa·s, absolute roughness
0.09 mm. These are fixed disclosed assumptions in this version, not measurements.
No fittings, leakage, acoustic calculation, compressibility, altitude/temperature
adjustment, total fan pressure, or special flexible-duct correction. Extreme aspect
ratios and materials need an appropriate engineering model and project review.

## Diffuser / Air Grille

For N outlets, q = Q/N; free area = q/V_free; gross face area = free area / free-area
ratio; equivalent square side = √gross area. The ratio must be in (0,1]. Each type
uses this same continuity calculation, with separate explanatory text. The entered
ratio is a design input, not an inferred manufacturer's effective-area coefficient.
The output is a preliminary face-area estimate, not neck size or a catalog selection.
Throw, pressure, NC/noise, occupied-zone comfort and product geometry require
manufacturer selection data. The initial 60% value is illustrative and editable.

## Sources and verification scope

- [ASHRAE Fundamentals, Chapter 21: Duct Design](https://handbook.ashrae.org/handbooks/F17/IP/f17_ch21/F17_ch21_ip.aspx),
  sections on friction losses and equivalent diameter. This is a model reference;
  the app does not claim ASHRAE certification.
- [NASA GFSSP v6 user manual](https://www.nasa.gov/wp-content/uploads/2024/04/gfssp-v6-usermanual.pdf),
  Colebrook/Darcy friction-factor reference.
- Exact dimensional anchors: 1 inch = 0.0254 m; 1 foot = 0.3048 m;
  1 cfm = 0.3048³/60 m³/s.

Numbers in prior AI-generated mockups are not test fixtures. The repository contains
Swift XCTest coverage of anchors, conservation, inverse conversion, model boundaries,
Colebrook residual, invalid inputs and unit preservation. Windows reference checks
do not execute Swift and are not a substitute for macOS `swift test` and Xcode build.
