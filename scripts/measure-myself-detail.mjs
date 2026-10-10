/**
 * Đo chi tiết phần MYSELF (bổ sung cho measure-myself.mjs): khối lego lớn / ảnh chân dung,
 * các dòng chữ, màu chữ. In JSON gọn ra stdout hoặc ghi vào file nếu truyền đường dẫn.
 *
 *   node scripts/measure-myself-detail.mjs [out.json]
 */
import sharp from 'sharp';

const W = 1440, H = 2777, NAV = 66;
const SRC1 = 'figma-export/design-ref/myself 1.png';
const SRC2 = 'figma-export/design-ref/myself 2.png';
const BGC = [244, 241, 232], BLUE = [32, 96, 215];
const near = (r, g, b, t, tol) => Math.abs(r - t[0]) <= tol && Math.abs(g - t[1]) <= tol && Math.abs(b - t[2]) <= tol;

async function load(file, s = 1) {
  const { data, info } = await sharp(file).resize(W * s, H * s, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height, s };
}
const mk = (img, pred) => {
  const m = new Uint8Array(img.w * img.h);
  for (let i = 0, p = 0; i < m.length; i++, p += 4) if (pred(img.data[p], img.data[p + 1], img.data[p + 2], img.data[p + 3])) m[i] = 1;
  return m;
};
function bb(m, img, r = {}) {
  const x0 = r.x0 ?? 0, x1 = r.x1 ?? img.w - 1, y0 = r.y0 ?? 0, y1 = r.y1 ?? img.h - 1;
  let a = 1e9, b = 1e9, c = -1, d = -1, n = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (m[y * img.w + x]) { n++; if (x < a) a = x; if (x > c) c = x; if (y < b) b = y; if (y > d) d = y; }
  if (!n) return null;
  const k = img.s;
  return { x: +(a / k).toFixed(2), y: +(b / k).toFixed(2), x1: +(c / k).toFixed(2), y1: +(d / k).toFixed(2), w: +((c - a + 1) / k).toFixed(2), h: +((d - b + 1) / k).toFixed(2), n, topFromNav: +((b / k) - NAV).toFixed(2) };
}
function rows(m, img, r = {}, min = 1, gap = 0) {
  const x0 = r.x0 ?? 0, x1 = r.x1 ?? img.w - 1, y0 = r.y0 ?? 0, y1 = r.y1 ?? img.h - 1;
  const out = []; let cur = null, g = 0;
  for (let y = y0; y <= y1; y++) {
    let c = 0;
    for (let x = x0; x <= x1; x++) if (m[y * img.w + x]) c++;
    if (c >= min) { if (!cur) cur = { y }; cur.y1 = y; g = 0; } else if (cur) { g++; if (g > gap) { out.push(cur); cur = null; } }
  }
  if (cur) out.push(cur);
  return out.map((o) => { const k = img.s; const b = bb(m, img, { x0, x1, y0: o.y, y1: o.y1 }); return { y: +(o.y / k).toFixed(2), y1: +(o.y1 / k).toFixed(2), h: +((o.y1 - o.y + 1) / k).toFixed(2), fromNav: +(o.y / k - NAV).toFixed(2), x: b.x, x1: b.x1, w: b.w }; });
}
function mode(img, r, pred) {
  const c = new Map(); const x0 = r.x0 ?? 0, x1 = r.x1 ?? img.w - 1, y0 = r.y0 ?? 0, y1 = r.y1 ?? img.h - 1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const p = (y * img.w + x) * 4; const t = [img.data[p], img.data[p + 1], img.data[p + 2]];
    if (pred && !pred(...t)) continue;
    const key = (t[0] << 16) | (t[1] << 8) | t[2]; c.set(key, (c.get(key) ?? 0) + 1);
  }
  let best = null, bn = -1; for (const [k, v] of c) if (v > bn) { bn = v; best = k; }
  return best === null ? null : { hex: '#' + best.toString(16).padStart(6, '0'), count: bn };
}

const img1 = await load(SRC1, 4); // 4x để mép không bị trộn màu
const img2 = await load(SRC2, 4);
const k = 4;
const report = {};
const BLOCK_TOP = 1656;

// --- Khối lego lớn (ảnh 1) và ảnh chân dung (ảnh 2): bỏ 3px quanh mép khối xanh để tránh viền trộn màu ---
const notCream1 = mk(img1, (r, g, b) => !near(r, g, b, BGC, 10));
const notCream2 = mk(img2, (r, g, b) => !near(r, g, b, BGC, 10));
const notBlue1 = mk(img1, (r, g, b) => !near(r, g, b, BLUE, 26));
report.bigLegoAbove = bb(notCream1, img1, { x0: 620 * k, x1: 1439 * k, y0: 1130 * k, y1: (BLOCK_TOP - 4) * k });
report.bigLegoBelow = bb(notBlue1, img1, { x0: 620 * k, x1: 1439 * k, y0: (BLOCK_TOP + 4) * k, y1: (BLOCK_TOP + 260) * k });
report.portraitAbove = bb(notCream2, img2, { x0: 620 * k, x1: 1439 * k, y0: 1060 * k, y1: (BLOCK_TOP - 4) * k });
const notBlue2 = mk(img2, (r, g, b) => !near(r, g, b, BLUE, 26));
report.portraitBelow = bb(notBlue2, img2, { x0: 620 * k, x1: 1439 * k, y0: (BLOCK_TOP + 4) * k, y1: (BLOCK_TOP + 260) * k });
report.bigLegoColor = mode(img1, { x0: 1000 * k, x1: 1100 * k, y0: 1400 * k, y1: 1450 * k });
report.portraitDarkest = mode(img2, { x0: 660 * k, x1: 1290 * k, y0: 1080 * k, y1: 1700 * k }, (r, g, b) => r + g + b < 260);

// --- Chữ hồng tên 4 mục + chữ/đường kẻ sáng màu ---
const pink = mk(img1, (r, g, b) => near(r, g, b, [255, 65, 122], 90));
report.pinkSample = mode(img1, { x0: 265 * k, x1: 290 * k, y0: 1990 * k, y1: 2015 * k });
report.pinkRows = rows(pink, img1, { x0: 200 * k, x1: 1400 * k, y0: (BLOCK_TOP + 250) * k, y1: 2776 * k }, 3 * k, 2 * k);
const light = mk(img1, (r, g, b) => r > 190 && g > 195 && b > 195);
report.lightRows = rows(light, img1, { x0: 200 * k, x1: 1400 * k, y0: (BLOCK_TOP + 250) * k, y1: 2776 * k }, 3 * k, 2 * k);
report.descColor = mode(img1, { x0: 300 * k, x1: 530 * k, y0: 2038 * k, y1: 2050 * k }, (r, g, b) => r > 200 && g > 200);
report.yellowColor = mode(img1, { x0: 300 * k, x1: 700 * k, y0: 1760 * k, y1: 1795 * k }, (r, g, b) => near(r, g, b, [255, 229, 150], 60));
report.titleYellowRows = rows(mk(img1, (r, g, b) => near(r, g, b, [255, 229, 150], 46)), img1, { x0: 200 * k, x1: 900 * k, y0: (BLOCK_TOP + 40) * k, y1: (BLOCK_TOP + 260) * k }, 3 * k, 6 * k);

// --- Chữ trên nền kem: tiêu đề (đen + xanh) và các dòng nội dung ---
const dark = mk(img1, (r, g, b) => near(r, g, b, [25, 25, 25], 90));
const bodyBlue = mk(img1, (r, g, b) => near(r, g, b, BLUE, 70) && !near(r, g, b, BGC, 8));
report.titleDark = rows(dark, img1, { x0: 0, x1: 1439 * k, y0: 780 * k, y1: 910 * k }, 3, 4);
report.titleBlue = rows(bodyBlue, img1, { x0: 450 * k, x1: 1439 * k, y0: 780 * k, y1: 910 * k }, 3, 4);
report.textLines = rows(bodyBlue, img1, { x0: 0, x1: 1000 * k, y0: 1000 * k, y1: (BLOCK_TOP - 5) * k }, 3, 1);
report.bodyColor = mode(img1, { x0: 200 * k, x1: 900 * k, y0: 1061 * k, y1: 1079 * k }, (r, g, b) => near(r, g, b, BLUE, 70));
report.boldColor = mode(img1, { x0: 86 * k, x1: 180 * k, y0: 1038 * k, y1: 1055 * k }, (r, g, b) => near(r, g, b, BLUE, 70));

// --- Khối lego tím góc trên trái khối xanh ---
const notBlueBrick = mk(img1, (r, g, b) => !near(r, g, b, BLUE, 30));
report.topLeftBrick = bb(notBlueBrick, img1, { x0: 10 * k, x1: 256 * k, y0: (BLOCK_TOP + 20) * k, y1: (BLOCK_TOP + 300) * k });
report.brickColor = mode(img1, { x0: 80 * k, x1: 200 * k, y0: 1760 * k, y1: 1800 * k });

const json = JSON.stringify(report, null, 1);
if (process.argv[2]) { (await import('node:fs')).writeFileSync(process.argv[2], json, 'utf8'); console.log('đã ghi ' + process.argv[2]); } else console.log(json);
