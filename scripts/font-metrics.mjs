/**
 * Đọc metric font iCielBC Cubano và tính bề rộng chuỗi (để suy ra cỡ chữ từ design-ref).
 *   node scripts/font-metrics.mjs ["CHUỖI CẦN ĐO" ...]
 */
import { readFileSync } from 'node:fs';

const buf = readFileSync('figma-export/assets/fonts/ICIEL-BC-Cubano-Normal.otf');
const numTables = buf.readUInt16BE(4);
const tables = {};
for (let i = 0; i < numTables; i++) {
  const o = 12 + i * 16;
  tables[buf.toString('ascii', o, o + 4)] = { offset: buf.readUInt32BE(o + 8), length: buf.readUInt32BE(o + 12) };
}

const head = tables.head.offset;
const unitsPerEm = buf.readUInt16BE(head + 18);
const hhea = tables.hhea.offset;
const ascender = buf.readInt16BE(hhea + 4);
const descender = buf.readInt16BE(hhea + 6);
const numberOfHMetrics = buf.readUInt16BE(hhea + 34);
const os2 = tables['OS/2'].offset;
const capHeight = buf.readInt16BE(os2 + 88);

// --- cmap (format 4) ---
const cmap = tables.cmap.offset;
const nSub = buf.readUInt16BE(cmap + 2);
let sub = null;
for (let i = 0; i < nSub; i++) {
  const rec = cmap + 4 + i * 8;
  const platform = buf.readUInt16BE(rec);
  const encoding = buf.readUInt16BE(rec + 2);
  const off = buf.readUInt32BE(rec + 4);
  const format = buf.readUInt16BE(cmap + off);
  if (format === 4 && (platform === 3 || platform === 0)) sub = cmap + off;
}
if (!sub) throw new Error('không tìm thấy bảng cmap format 4');
const segCountX2 = buf.readUInt16BE(sub + 6);
const segCount = segCountX2 / 2;
const endBase = sub + 14;
const startBase = endBase + segCountX2 + 2;
const deltaBase = startBase + segCountX2;
const rangeBase = deltaBase + segCountX2;

const glyphOf = (code) => {
  for (let s = 0; s < segCount; s++) {
    const end = buf.readUInt16BE(endBase + s * 2);
    if (code > end) continue;
    const start = buf.readUInt16BE(startBase + s * 2);
    if (code < start) return 0;
    const delta = buf.readInt16BE(deltaBase + s * 2);
    const rangeOffset = buf.readUInt16BE(rangeBase + s * 2);
    if (rangeOffset === 0) return (code + delta) & 0xffff;
    const gi = rangeBase + s * 2 + rangeOffset + (code - start) * 2;
    const g = buf.readUInt16BE(gi);
    return g === 0 ? 0 : (g + delta) & 0xffff;
  }
  return 0;
};

const hmtx = tables.hmtx.offset;
const advance = (gid) => buf.readUInt16BE(hmtx + Math.min(gid, numberOfHMetrics - 1) * 4);

/** Bề rộng (theo em) của chuỗi, tính cả khoảng cách glyph. */
export function widthEm(text) {
  let sum = 0;
  for (const ch of text) sum += advance(glyphOf(ch.codePointAt(0)));
  return sum / unitsPerEm;
}

const words = process.argv.slice(2);
if (words.length) {
  for (const w of words) console.log(`${JSON.stringify(w)}\tadvance=${widthEm(w).toFixed(4)} em`);
} else {
  console.log(
    JSON.stringify(
      {
        unitsPerEm,
        hhea: { ascender, descender, lineGap: buf.readInt16BE(hhea + 8) },
        contentRatio: (ascender - descender) / unitsPerEm,
        capHeight,
        capRatio: capHeight / unitsPerEm,
        numberOfHMetrics,
      },
      null,
      1,
    ),
  );
}
