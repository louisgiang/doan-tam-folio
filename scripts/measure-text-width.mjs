/**
 * Đo bề rộng chuỗi theo font thật trên máy (để đối chiếu chữ chép từ design-ref).
 *   node scripts/measure-text-width.mjs
 */
import { readFileSync } from 'node:fs';

function readFont(file) {
  const buf = readFileSync(file);
  const numTables = buf.readUInt16BE(4);
  const tables = {};
  for (let i = 0; i < numTables; i++) {
    const o = 12 + i * 16;
    tables[buf.toString('ascii', o, o + 4)] = { offset: buf.readUInt32BE(o + 8) };
  }
  const unitsPerEm = buf.readUInt16BE(tables.head.offset + 18);
  const hhea = tables.hhea.offset;
  const numberOfHMetrics = buf.readUInt16BE(hhea + 34);
  const cmap = tables.cmap.offset;
  const nSub = buf.readUInt16BE(cmap + 2);
  let sub = null;
  for (let i = 0; i < nSub; i++) {
    const rec = cmap + 4 + i * 8;
    const platform = buf.readUInt16BE(rec);
    const off = buf.readUInt32BE(rec + 4);
    if (buf.readUInt16BE(cmap + off) === 4 && (platform === 3 || platform === 0)) sub = cmap + off;
  }
  const segCountX2 = buf.readUInt16BE(sub + 6);
  const endBase = sub + 14;
  const startBase = endBase + segCountX2 + 2;
  const deltaBase = startBase + segCountX2;
  const rangeBase = deltaBase + segCountX2;
  const hmtx = tables.hmtx.offset;
  const glyphOf = (code) => {
    for (let s = 0; s < segCountX2 / 2; s++) {
      const end = buf.readUInt16BE(endBase + s * 2);
      if (code > end) continue;
      const start = buf.readUInt16BE(startBase + s * 2);
      if (code < start) return 0;
      const delta = buf.readInt16BE(deltaBase + s * 2);
      const rangeOffset = buf.readUInt16BE(rangeBase + s * 2);
      if (rangeOffset === 0) return (code + delta) & 0xffff;
      const g = buf.readUInt16BE(rangeBase + s * 2 + rangeOffset + (code - start) * 2);
      return g === 0 ? 0 : (g + delta) & 0xffff;
    }
    return 0;
  };
  return {
    unitsPerEm,
    widthEm(text) {
      let sum = 0;
      for (const ch of text) sum += buf.readUInt16BE(hmtx + Math.min(glyphOf(ch.codePointAt(0)), numberOfHMetrics - 1) * 4);
      return sum / unitsPerEm;
    },
  };
}

const regular = readFont('C:/Windows/Fonts/Roboto-Regular.ttf');
const bold = readFont('C:/Windows/Fonts/Roboto-Bold.ttf');
const F = 20;

const cases = [
  ['giới thiệu dòng 3 (en dash)', regular, 'about how money and businesses work, and I enjoy turning ideas into something real\u2013whether'],
  ['giới thiệu dòng 3 (em dash)', regular, 'about how money and businesses work, and I enjoy turning ideas into something real\u2014whether'],
  ['giới thiệu dòng 2', regular, "I'm an energetic student who loves LEGO, meeting new people, and exploring finance. I'm curious"],
  ['giới thiệu dòng 4', regular, 'that means building a model or working with a team on a community project.'],
  ['head đậm', bold, "Hi, I'm Tam!"],
  ['September (en dash)', regular, 'September 2024\u2013May 2027'],
  ['GPA 1 dấu cách', bold, 'GPA 9.5/10 | SAT 1510'],
  ['GPA 2-3-3-2', bold, 'GPA  9.5/10   |   SAT  1510'],
  ['GPA 2-4-4-2', bold, 'GPA  9.5/10    |    SAT  1510'],
  ['bullets', regular, 'Energetic \u00b7 Curious \u00b7 LEGO lover \u00b7 Finance enthusiast'],
  ['desc MYSELF', regular, 'The person behind the projects.'],
  ['desc AWARDS', regular, 'Research, recognition, and learning along the way.'],
  ['token GPA', bold, 'GPA'],
  ['token 9.5/10', bold, '9.5/10'],
  ['token |', bold, '|'],
  ['token SAT', bold, 'SAT'],
  ['token 1510', bold, '1510'],
  ['1 dấu cách đậm', bold, ' '],
  ['1 dấu cách thường', regular, ' '],
  ['token a', regular, 'a'],
  ['token r', regular, 'r'],
  ['token I', regular, 'I'],
  ['token s', regular, 's'],
  ['token 2024–', regular, '2024\u2013'],
  ['token 2024—', regular, '2024\u2014'],
];

for (const [name, font, text] of cases) {
  console.log(Math.round(font.widthEm(text) * F * 100) / 100 + '\t' + name + '\t' + JSON.stringify(text));
}
