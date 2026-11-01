"""Independent reference math/resource checks, NOT Swift execution or an iOS build."""
from pathlib import Path
import math, re, json, hashlib, unittest, xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]

def colebrook_bisection(reynolds, roughness):
    # Independent root method in f, unlike the Swift fixed-point solve in 1/sqrt(f).
    def residual(f):
        return 1/math.sqrt(f) + 2*math.log10(roughness/3.7+2.51/(reynolds*math.sqrt(f)))
    low, high = 0.001, 0.2
    for _ in range(150):
        middle = (low+high)/2
        if residual(middle) > 0: low = middle
        else: high = middle
    return (low+high)/2

class ReferenceChecks(unittest.TestCase):
    def test_geometry_anchor(self):
        area = 1.3 * 0.55
        diameter = math.sqrt(4*area/math.pi)
        self.assertAlmostEqual(area, 0.715, places=12)
        self.assertAlmostEqual(diameter, 0.9541311620975605, places=12)
        self.assertAlmostEqual(math.pi*diameter**2/4, area, places=12)
        self.assertAlmostEqual(1.30*area**0.625/1.85**0.25, 0.9038402891565726, places=12)

    def test_colebrook_anchor(self):
        self.assertAlmostEqual(colebrook_bisection(100000, 0.0001), 0.01851386607747, places=12)

    def test_pressure_reference(self):
        d, q, rho, mu, rough = 0.5, 1, 1.204, 1.81e-5, 0.00009
        v=q/(math.pi*d*d/4)
        reynolds=rho*v*d/mu
        f=colebrook_bisection(reynolds, rough/d)
        pressure=f/d*rho*v*v/2
        self.assertGreater(pressure, 0)
        self.assertAlmostEqual(1/math.sqrt(f)+2*math.log10(rough/(3.7*d)+2.51/(reynolds*math.sqrt(f))),0,places=10)

    def test_terminal_conservation(self):
        q=0.3/4
        free=q/2.5
        face=free/0.6
        self.assertAlmostEqual(q*4,0.3)
        self.assertAlmostEqual(free,0.03)
        self.assertAlmostEqual(face,0.05)

    def test_unit_definitions(self):
        self.assertAlmostEqual(0.3048**3/60,0.0004719474432,places=16)
        self.assertAlmostEqual(0.3048/60,0.00508,places=15)
        self.assertAlmostEqual(0.3048**2,0.09290304,places=15)

    def test_localization_coverage(self):
        tables={}
        for lang in ['en','vi','zh-Hans','ja','th']:
            content=(ROOT/f'App/Resources/{lang}.lproj/Localizable.strings').read_text(encoding='utf-8')
            entries=re.findall(r'^"([^"\n]+)" = "(.+)";$',content,re.M)
            tables[lang]=dict(entries)
            self.assertEqual(len(entries),len(tables[lang]))
        keys=set(tables['en'])
        for lang, table in tables.items():
            self.assertEqual(set(table),keys,lang)
            self.assertTrue(all(table.values()))
        source='\n'.join(p.read_text(encoding='utf-8') for p in (ROOT/'App').glob('*.swift'))
        required=set(re.findall(r'(?:p\.text\(|title: )"([^"]+)"',source))
        self.assertTrue(required <= keys,required-keys)

    def test_logos_byte_identical(self):
        manifest=json.loads((ROOT/'Docs/Logo-provenance.json').read_text(encoding='utf-8'))
        for item, asset in zip(manifest,['DuctLogo','SiscomLogo']):
            path=next((ROOT/f'App/Assets.xcassets/{asset}.imageset').glob('*.png'))
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(),item['sha256'])
            original=Path(item['source'])
            if original.exists(): self.assertEqual(path.read_bytes(),original.read_bytes())

    def test_xcode_references_and_scheme(self):
        project=(ROOT/'DuctCheckerPro.xcodeproj/project.pbxproj').read_text(encoding='utf-8')
        ids=re.findall(r'^([A-F0-9]{24}) = ',project,re.M)
        self.assertEqual(len(ids),len(set(ids)))
        references=set(re.findall(r'\b[A-F0-9]{24}\b',project))
        self.assertEqual(set(ids),references)
        for path in list((ROOT/'App').glob('*.swift'))+list((ROOT/'Sources/DuctCore').glob('*.swift')):
            self.assertIn(path.relative_to(ROOT).as_posix(),project)
        scheme=ET.parse(ROOT/'DuctCheckerPro.xcodeproj/xcshareddata/xcschemes/DuctCheckerPro.xcscheme')
        self.assertTrue(scheme.findall('.//BuildableReference'))
        for ref in scheme.findall('.//BuildableReference'):
            self.assertIn(ref.attrib['BlueprintIdentifier'],ids)

    def test_asset_json(self):
        for path in (ROOT/'App/Assets.xcassets').rglob('Contents.json'):
            data=json.loads(path.read_text())
            for img in data.get('images',[]): self.assertTrue((path.parent/img['filename']).is_file())

if __name__=='__main__': unittest.main(verbosity=2)
