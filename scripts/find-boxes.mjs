// Tìm các vùng lớn khác màu nền trong một ảnh design-ref (ảnh, khung, khối màu).
// Dùng: node scripts/find-boxes.mjs <design-ref.png> x,y,w,h [bgHex] [minArea]
// Toạ độ khổ 1440 (ảnh @4x).
import sharp from 'sharp';
const [file, region, bgHex = 'F4F1E8', minArea = '4000'] = process.argv.slice(2);
const [rx, ry, rw, rh] = region.split(',').map(Number);
const { data, info } = await sharp(file)
  .extract({ left: rx * 4, top: ry * 4, width: rw * 4, height: rh * 4 })
  .resize(rw * 2, rh * 2)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const bg = [0, 2, 4].map((i) => parseInt(bgHex.slice(i, i + 2), 16));
const mask = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) {
  const d = Math.abs(data[i * 3] - bg[0]) + Math.abs(data[i * 3 + 1] - bg[1]) + Math.abs(data[i * 3 + 2] - bg[2]);
  if (d > 30) mask[i] = 1;
}
const label = new Int32Array(W * H).fill(-1);
const boxes = [];
for (let s = 0; s < W * H; s++) {
  if (!mask[s] || label[s] >= 0) continue;
  const b = { x0: 1e9, y0: 1e9, x1: -1, y1: -1, n: 0 };
  const st = [s]; label[s] = boxes.length;
  while (st.length) {
    const p = st.pop(); const x = p % W, y = (p - x) / W; b.n++;
    if (x < b.x0) b.x0 = x; if (x > b.x1) b.x1 = x; if (y < b.y0) b.y0 = y; if (y > b.y1) b.y1 = y;
    for (const q of [p - 1, p + 1, p - W, p + W]) {
      if (q < 0 || q >= W * H || (q % W === 0 && p % W === W - 1) || (p % W === 0 && q % W === W - 1)) continue;
      if (mask[q] && label[q] < 0) { label[q] = label[s]; st.push(q); }
    }
  }
  boxes.push(b);
}
for (const b of boxes.filter((b) => b.n / 4 >= Number(minArea)).sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0))
  console.log(`x ${(rx + b.x0 / 2).toFixed(1)}–${(rx + (b.x1 + 1) / 2).toFixed(1)}  y ${(ry + b.y0 / 2).toFixed(1)}–${(ry + (b.y1 + 1) / 2).toFixed(1)}  (${((b.x1 - b.x0 + 1) / 2).toFixed(1)}×${((b.y1 - b.y0 + 1) / 2).toFixed(1)}) fill ${(b.n / ((b.x1 - b.x0 + 1) * (b.y1 - b.y0 + 1))).toFixed(2)}`);
