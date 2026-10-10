// Chuyển ảnh trong figma-export/assets sang WebP đã tối ưu, đặt vào src/assets.
// Chạy lại được bất cứ lúc nào: node scripts/optimize-images.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'figma-export/assets');
const OUT = path.join(ROOT, 'src/assets');

const report = [];
async function toWebp(from, to, { maxWidth, quality = 82, alphaQuality = 90 } = {}) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  let img = sharp(from);
  if (maxWidth) img = img.resize({ width: maxWidth, withoutEnlargement: true });
  const info = await img.webp({ quality, alphaQuality, effort: 6 }).toFile(to);
  report.push([path.relative(ROOT, to), fs.statSync(from).size, info.size, info.width, info.height]);
  return info;
}

// Lego: mỗi ảnh khác nhau một file (bỏ file trùng nội dung), đặt tên theo số nhỏ nhất.
const legoDir = path.join(SRC, 'lego');
const byHash = new Map();
for (const f of fs.readdirSync(legoDir).filter((f) => f.endsWith('.png'))) {
  const n = Number(f.match(/(\d+)\.png$/)[1]);
  const hash = crypto.createHash('md5').update(fs.readFileSync(path.join(legoDir, f))).digest('hex');
  const prev = byHash.get(hash);
  if (!prev || n < prev.n) byHash.set(hash, { n, f });
}
const legoTypes = {};
for (const { n, f } of [...byHash.values()].sort((a, b) => a.n - b.n)) {
  const info = await toWebp(path.join(legoDir, f), path.join(OUT, `lego/lego-${n}.webp`));
  legoTypes[`lego-${n}`] = { aspect: +(info.height / info.width).toFixed(4) };
}
fs.writeFileSync(path.join(ROOT, 'src/data/lego-types.json'), JSON.stringify(legoTypes, null, 2) + '\n');

// MYSELF: khối lego xanh lớn + ảnh chân dung (hiển thị ~620px ở 1440 → ~1650px ở 1920 @2x).
// Chất lượng cao vì mảng xanh chuyển màu mượt của khối lego dễ bị dải màu/nhoè khi nén mạnh.
await toWebp(path.join(SRC, 'myself/big-lego.png'), path.join(OUT, 'myself/big-lego.webp'), {
  maxWidth: 2000,
  quality: 95,
  alphaQuality: 100,
});
await toWebp(path.join(SRC, 'myself/avatar.png'), path.join(OUT, 'myself/avatar.webp'), {
  maxWidth: 2000,
  quality: 88,
  alphaQuality: 100,
});

for (const [file, before, after, w, h] of report)
  console.log(file.padEnd(40), `${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`, `${w}x${h}`);
