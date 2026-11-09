/** Render the committed Apple touch icon from this site's own SVG mark. */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const svg = readFileSync(resolve(process.cwd(), "public/favicon.svg"), "utf8");
const png = new Resvg(svg, { fitTo: { mode: "width", value: 180 } }).render().asPng();
writeFileSync(resolve(process.cwd(), "public/apple-touch-icon.png"), png);
