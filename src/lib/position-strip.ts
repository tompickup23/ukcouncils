export interface StripPoint { gss: string; name: string; value: number }
export interface StripGeometry {
  width: 640; height: 112;
  plot: { left: 16; right: 624 };
  axisY: 64;
  peers: (StripPoint & {x: number})[];
  current: StripPoint & {x: number; labelAnchor: "start" | "middle" | "end"};
  lowest: StripPoint; highest: StripPoint;
}
export const CLASS_PLURAL: Record<string, string> = {
  SD: "shire districts in England",
  UA: "unitary authorities in England",
  MD: "metropolitan districts in England",
  OLB: "outer London boroughs",
  ILB: "inner London boroughs, including the City of London",
};
/** Geometry changes only screen coordinates; published values remain untouched. */
export function stripGeometry(points: StripPoint[], currentGss: string): StripGeometry {
  if (points.some(p => !Number.isFinite(p.value))) throw new Error("Strip values must be finite");
  if (!points.some(p => p.gss === currentGss)) throw new Error("Current council is missing from strip points");
  const lowest = [...points].sort((a, b) => a.value - b.value || a.name.localeCompare(b.name, "en-GB"))[0];
  const highest = [...points].sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, "en-GB"))[0];
  const plot = {left: 16, right: 624} as const;
  const peers = points.map(p => ({...p, x: Number((highest.value === lowest.value ? (plot.left + plot.right) / 2 : plot.left + (p.value - lowest.value) / (highest.value - lowest.value) * (plot.right - plot.left)).toFixed(2))}));
  const current = peers.find(p => p.gss === currentGss)!;
  const labelAnchor = current.x < plot.left + 80 ? "start" : current.x > plot.right - 80 ? "end" : "middle";
  return {width: 640, height: 112, plot, axisY: 64, peers, current: {...current, labelAnchor}, lowest, highest};
}
