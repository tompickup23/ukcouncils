"""Regenerate this site's token block using the shared estate renderer."""
import argparse
import importlib.util
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--renderer', type=Path, default=root.parent / 'clawd/briefings/uk-network-design-system/shared/apply.py')
args = parser.parse_args()
spec = importlib.util.spec_from_file_location('estate_renderer', args.renderer)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
config = json.loads((root / 'scripts/brand-colours.json').read_text())
path = root / 'src/styles/global.css'
css = path.read_text()
start = css.index(module.START)
end = css.index(module.END) + len(module.END)
path.write_text(css[:start] + module.render('ukcouncils', config).strip() + css[end:])
print('Regenerated UK Councils estate tokens. Check manual theme overrides and palette.ts when changing colours.')
