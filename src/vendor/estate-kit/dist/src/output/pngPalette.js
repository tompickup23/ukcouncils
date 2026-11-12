/**
 * Palette quantised PNG with embedded XMP, for cards (UKD issue I7: ukdemographics
 * src/lib/map/cards.ts, CARD_PALETTE_COLOURS = 128). UKD quantises through sharp; the kit
 * does it here, synchronously and with no native dependency beyond resvg: a weighted median
 * cut over the image's distinct colours down to 128, each colour mapped to the box that
 * holds it (no dither, so flat fills stay flat), then an indexed PNG written by hand with
 * zlib. A card is flat fills and anti aliased text, so 128 colours keep its edges clean.
 */
import { deflateSync } from "node:zlib";
/** Palette size for card PNGs: 128 colours keeps text edges clean on the dark ground. */
export const CARD_PALETTE_COLOURS = 128;
const ch = (c, i) => (c >>> (24 - i * 8)) & 255;
/** Splits RGBA pixels into at most `max` colours: the palette and one index per pixel. */
export function quantise(rgba, max = CARD_PALETTE_COLOURS) {
    if (max < 2 || max > 256)
        throw new Error("quantise: 2 to 256 colours");
    const hist = new Map();
    const px = rgba.length / 4;
    const keys = new Uint32Array(px);
    for (let p = 0; p < px; p++) {
        const k = ((rgba[p * 4] << 24) | (rgba[p * 4 + 1] << 16) | (rgba[p * 4 + 2] << 8) | rgba[p * 4 + 3]) >>> 0;
        keys[p] = k;
        hist.set(k, (hist.get(k) ?? 0) + 1);
    }
    // Each box keeps its widest channel and a score (that range weighted by its pixel count),
    // worked out once when the box is made; the box with the highest score splits next.
    const box = (colours, counts) => {
        let total = 0;
        for (const n of counts)
            total += n;
        let score = 0, axis = 0;
        if (colours.length > 1)
            for (let c = 0; c < 4; c++) {
                let lo = 255, hi = 0;
                for (const col of colours) {
                    const v = ch(col, c);
                    if (v < lo)
                        lo = v;
                    if (v > hi)
                        hi = v;
                }
                const sc = (hi - lo) * Math.sqrt(total);
                if (sc > score) {
                    score = sc;
                    axis = c;
                }
            }
        return { colours, counts, score, axis };
    };
    const all = [...hist.keys()];
    const boxes = [box(all, all.map((c) => hist.get(c)))];
    while (boxes.length < max) {
        let best = -1, bestScore = 0;
        boxes.forEach((b, i) => { if (b.score > bestScore) {
            bestScore = b.score;
            best = i;
        } });
        if (best < 0)
            break;
        const b = boxes[best];
        const order = b.colours.map((_, i) => i).sort((x, y) => ch(b.colours[x], b.axis) - ch(b.colours[y], b.axis));
        const total = b.counts.reduce((s, n) => s + n, 0);
        let run = 0, cut = order.length - 1;
        for (let i = 0; i < order.length - 1; i++) {
            run += b.counts[order[i]];
            if (run >= total / 2) {
                cut = i + 1;
                break;
            }
        }
        const pick = (ix) => box(ix.map((i) => b.colours[i]), ix.map((i) => b.counts[i]));
        boxes.splice(best, 1, pick(order.slice(0, cut)), pick(order.slice(cut)));
    }
    const index = new Map();
    const palette = boxes.map((b, bi) => {
        const sum = [0, 0, 0, 0];
        let n = 0;
        b.colours.forEach((col, i) => { for (let c = 0; c < 4; c++)
            sum[c] += ch(col, c) * b.counts[i]; n += b.counts[i]; index.set(col, bi); });
        return sum.map((s) => Math.round(s / n));
    });
    const indices = new Uint8Array(px);
    for (let p = 0; p < px; p++)
        indices[p] = index.get(keys[p]);
    return { palette, indices };
}
const CRC = new Uint32Array(256).map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++)
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
});
function crc32(buf) {
    let c = 0xffffffff;
    for (const b of buf)
        c = CRC[(c ^ b) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
}
/** An indexed PNG from RGBA pixels, with an XMP packet in an iTXt chunk when given. */
export function palettePng(rgba, width, height, o = {}) {
    if (rgba.length !== width * height * 4)
        throw new Error("palettePng: the pixels do not match the size");
    const { palette, indices } = quantise(rgba, o.colours ?? CARD_PALETTE_COLOURS);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr.set([8, 3, 0, 0, 0], 8);
    const plte = Buffer.from(palette.flatMap((c) => c.slice(0, 3)));
    const alpha = palette.map((c) => c[3]);
    const raw = Buffer.alloc((width + 1) * height);
    for (let y = 0; y < height; y++)
        raw.set(indices.subarray(y * width, (y + 1) * width), y * (width + 1) + 1);
    const parts = [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("PLTE", plte)];
    if (alpha.some((a) => a < 255)) {
        let last = alpha.length;
        while (last > 0 && alpha[last - 1] === 255)
            last--;
        parts.push(chunk("tRNS", Buffer.from(alpha.slice(0, last))));
    }
    if (o.xmp)
        parts.push(chunk("iTXt", Buffer.concat([Buffer.from("XML:com.adobe.xmp\0\0\0\0\0", "latin1"), Buffer.from(o.xmp, "utf8")])));
    parts.push(chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0)));
    return Buffer.concat(parts);
}
