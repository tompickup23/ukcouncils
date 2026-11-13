"""Independent dry run for the Nearby and alike section.

Run from the repository root:
  uv run --with shapely python scripts/nearby-dry-run.py

Neighbours here come from Shapely (GEOS) line intersection on the pinned
boundary file, a different implementation from src/lib/council-neighbours.ts,
which uses its own integer segment test. The unit tests require the two to
agree for every council. Coordinates are scaled to whole units of 0.00001
degrees first, as the site does, so both work on the same exact integers.
"""
import hashlib
import json
from pathlib import Path

from shapely.geometry import LineString, MultiLineString
from shapely.strtree import STRtree

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "data/geography/lad26-england.geojson"
OUTPUT = ROOT / "docs/NEARBY-AND-ALIKE-DRY-RUN-2026-11-13.json"

raw = SOURCE.read_bytes()
features = json.loads(raw)["features"]
previous = json.loads(OUTPUT.read_text())


def outline(geometry):
    polygons = [geometry["coordinates"]] if geometry["type"] == "Polygon" else geometry["coordinates"]
    return MultiLineString([
        LineString([(round(x * 1e5), round(y * 1e5)) for x, y in ring])
        for polygon in polygons for ring in polygon
    ])


codes = [feature["properties"]["LAD26CD"] for feature in features]
lines = [outline(feature["geometry"]) for feature in features]
tree = STRtree(lines)
touching = {code: set() for code in codes}
for i, line in enumerate(lines):
    for j in tree.query(line, predicate="intersects"):
        if i != j:
            touching[codes[i]].add(codes[int(j)])

councils = []
for row in previous["councils"]:
    neighbours = sorted(touching[row["gss"]])
    councils.append({**row, "boundaryCount": len(neighbours), "boundaryGss": neighbours})

OUTPUT.write_text(json.dumps({
    "sourceSha256": hashlib.sha256(raw).hexdigest(),
    "method": "Outlines that touch or cross in the pinned coastline-clipped England file, "
              "tested on coordinates scaled to whole units of 0.00001 degrees. "
              "County joins use registry parentGss for shire districts.",
    "councils": councils,
}, indent=2) + "\n")
pairs = sum(len(v) for v in touching.values())
print(f"{len(councils)} councils; {pairs} directed links; {pairs // 2} pairs; "
      f"neighbours per council {min(map(len, touching.values()))} to {max(map(len, touching.values()))}")
