// Đo vị trí các khối lego trong một ảnh design-ref và nhận dạng loại khối.
// Dùng: node scripts/measure-lego.mjs <design-ref.png> <out.json> --region x,y,w,h
//        [--exclude x,y,w,h ...] [--bg RRGGBB]
// Toạ độ theo khổ thiết kế 1440 (design-ref là ảnh @4x).
// Cách làm: thu ảnh về 1440, tách các vùng khác màu nền (connected components),
// rồi so từng vùng với mọi loại ảnh trong figma-export/assets/lego để chọn loại khớp nhất.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname, '..');
const LEGO_DIR = path.join(ROOT, 'figma-export/assets/lego');
const SCALE = 4; // design-ref @4x

const args = process.argv.slice(2);
const [inFile, outFile] = args;
const opt = (name) => {
  const out = [];
  args.forEach((a, i) => a === `--${name}` && out.push(args[i + 1]));
  return out;
};
const rect = (s) => s.split(',').map(Number);
const [rx, ry, rw, rh] = rect(opt('region')[0]);
const excludes = opt('exclude').map(rect);
const bgHex = opt('bg')[0] ?? 'F4F1E8';
const bg = [0, 2, 4].map((i) => parseInt(bgHex.slice(i, i + 2), 16));

// 1. Ảnh thiết kế, vùng cần đo, ở khổ 1440.
const { data: img, info } = await sharp(inFile)
  .extract({ left: rx * SCALE, top: ry * SCALE, width: rw * SCALE, height: rh * SCALE })
  .resize(rw, rh, { kernel: 'lanczos3' })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;

const px = (x, y) => {
  const i = (y * W + x) * 3;
  return [img[i], img[i + 1], img[i + 2]];
};
const isExcluded = (x, y) =>
  excludes.some(([ex, ey, ew, eh]) => x + rx >= ex && x + rx < ex + ew && y + ry >= ey && y + ry < ey + eh);
const mask = new Uint8Array(W * H);
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    if (isExcluded(x, y)) continue;
    const [r, g, b] = px(x, y);
    if (Math.abs(r - bg[0]) + Math.abs(g - bg[1]) + Math.abs(b - bg[2]) > 24) mask[y * W + x] = 1;
  }

// 2. Connected components (8 hướng).
const label = new Int32Array(W * H).fill(-1);
const blobs = [];
for (let s = 0; s < W * H; s++) {
  if (!mask[s] || label[s] >= 0) continue;
  const id = blobs.length;
  const b = { x0: 1e9, y0: 1e9, x1: -1, y1: -1, n: 0 };
  const stack = [s];
  label[s] = id;
  while (stack.length) {
    const p = stack.pop();
    const x = p % W;
    const y = (p - x) / W;
    b.n++;
    b.x0 = Math.min(b.x0, x); b.x1 = Math.max(b.x1, x);
    b.y0 = Math.min(b.y0, y); b.y1 = Math.max(b.y1, y);
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const q = ny * W + nx;
        if (mask[q] && label[q] < 0) { label[q] = id; stack.push(q); }
      }
  }
  blobs.push(b);
}
const found = blobs.filter((b) => b.n > 150);

// 3. Các loại khối: bỏ file trùng (giữ số nhỏ nhất, giống optimize-images.mjs), cắt phần trong suốt.
const num = (f) => Number(f.match(/(\d+)\.png$/)[1]);
const files = fs
  .readdirSync(LEGO_DIR)
  .filter((f) => f.endsWith('.png'))
  .sort((a, b) => num(a) - num(b));
const types = [];
const seen = new Map();
for (const f of files) {
  const buf = fs.readFileSync(path.join(LEGO_DIR, f));
  const key = crypto.createHash('md5').update(buf).digest('hex');
  if (seen.has(key)) continue;
  const meta = await sharp(buf).metadata();
  const { info: t } = await sharp(buf).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  const type = {
    file: f,
    id: 'lego-' + f.match(/(\d+)\.png$/)[1],
    fullW: meta.width,
    fullH: meta.height,
    // vùng có hình trong file gốc
    cx: -t.trimOffsetLeft, cy: -t.trimOffsetTop, cw: t.width, ch: t.height,
    buf,
  };
  seen.set(key, type);
  types.push(type);
}

// 4. Với mỗi vùng: thử mọi loại, co về đúng kích thước vùng, ghép lên nền, tính sai số.
async function score(type, b) {
  const w = b.x1 - b.x0 + 1, h = b.y1 - b.y0 + 1;
  const { data } = await sharp(type.buf)
    .extract({ left: type.cx, top: type.cy, width: type.cw, height: type.ch })
    .resize(w, h, { fit: 'fill' })
    .flatten({ background: { r: bg[0], g: bg[1], b: bg[2] } })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let err = 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const [r, g, bb] = px(b.x0 + x, b.y0 + y);
      const i = (y * w + x) * 3;
      err += Math.abs(r - data[i]) + Math.abs(g - data[i + 1]) + Math.abs(bb - data[i + 2]);
    }
  return err / (w * h * 3);
}

const out = [];
for (const b of found) {
  let best = null;
  for (const t of types) {
    const s = await score(t, b);
    if (!best || s < best.s) best = { t, s };
  }
  const t = best.t;
  const k = (b.x1 - b.x0 + 1) / t.cw; // tỉ lệ ảnh gốc -> thiết kế
  out.push({
    type: t.id,
    // khung của cả ảnh (kể cả phần trong suốt), toạ độ khổ 1440
    x: +(rx + b.x0 - t.cx * k).toFixed(1),
    y: +(ry + b.y0 - t.cy * k).toFixed(1),
    w: +(t.fullW * k).toFixed(1),
    h: +(t.fullH * k).toFixed(1),
    _fit: +best.s.toFixed(1),
    _scale: +k.toFixed(4),
    _aspectErr: +((b.y1 - b.y0 + 1) / (b.x1 - b.x0 + 1) / (t.ch / t.cw) - 1).toFixed(3),
  });
}
out.sort((a, b) => a.y - b.y || a.x - b.x);
console.log(`${found.length} vùng, ${types.length} loại`);
for (const o of out) console.log(o.type.padEnd(8), o.x, o.y, o.w, o.h, 'fit', o._fit, 'k', o._scale, 'asp', o._aspectErr);

// 5. Ghi file dữ liệu: bỏ vùng không phải lego (sai số lớn), toạ độ % theo khung cụm.
// Khung bắt đầu ở mép trên của --region, cao tới đáy khối thấp nhất.
const MAX_FIT = Number(opt('max-fit')[0] ?? 10);
const good = out.filter((o) => o._fit <= MAX_FIT);
const rejected = out.filter((o) => o._fit > MAX_FIT);
if (rejected.length) console.log(`bỏ ${rejected.length} vùng sai số > ${MAX_FIT}`);
const frameH = Math.ceil(Math.max(...good.map((o) => o.y + o.h)) - ry);
const pct = (v, total) => +((v / total) * 100).toFixed(3);
const data = {
  source: path.basename(inFile),
  frame: { width: 1440, height: frameH },
  blocks: good.map((o, i) => ({
    type: o.type,
    x: pct(o.x - rx, 1440),
    y: pct(o.y - ry, frameH),
    w: pct(o.w, 1440),
    rotation: 0,
    z: i + 1,
  })),
};
fs.writeFileSync(outFile, JSON.stringify(data, null, 2) + '\n');
console.log(`ghi ${good.length} khối, khung ${data.frame.width}x${frameH} -> ${outFile}`);
