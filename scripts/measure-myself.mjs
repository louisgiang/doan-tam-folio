/**
 * Đo bố cục phần MYSELF từ figma-export/design-ref (xuất @4x → khổ thiết kế 1440).
 * Chỉ đọc ảnh và in JSON ra stdout, không ghi file.
 *
 *   node scripts/measure-myself.mjs
 */
import sharp from 'sharp';

const W = 1440;
const H = 2777;
const NAV = 66;
const SRC1 = 'figma-export/design-ref/myself 1.png'; // khối lego xanh lớn
const SRC2 = 'figma-export/design-ref/myself 2.png'; // ảnh chân dung
const HOME = 'figma-export/design-ref/Home.png'; // hiệu chuẩn cỡ chữ tiêu đề 97.8px

const BGC = [244, 241, 232];
const BLUE = [32, 96, 215];
const near = (r, g, b, t, tol) => Math.abs(r - t[0]) <= tol && Math.abs(g - t[1]) <= tol && Math.abs(b - t[2]) <= tol;
const onBlock = (r, g, b) => near(r, g, b, BLUE, 30);

async function load1x(file, h = H) {
  const { data, info } = await sharp(file).resize(W, h, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

function makeMask(img, pred) {
  const m = new Uint8Array(img.w * img.h);
  for (let i = 0, p = 0; i < m.length; i++, p += 4) if (pred(img.data[p], img.data[p + 1], img.data[p + 2])) m[i] = 1;
  return m;
}

function bbox(m, img, region = {}) {
  const x0 = region.x0 ?? 0, x1 = region.x1 ?? img.w - 1, y0 = region.y0 ?? 0, y1 = region.y1 ?? img.h - 1;
  let bx0 = 1e9, by0 = 1e9, bx1 = -1, by1 = -1, n = 0;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (m[y * img.w + x]) {
        n++;
        if (x < bx0) bx0 = x;
        if (x > bx1) bx1 = x;
        if (y < by0) by0 = y;
        if (y > by1) by1 = y;
      }
    }
  }
  return n ? { x: bx0, y: by0, x1: bx1, y1: by1, w: bx1 - bx0 + 1, h: by1 - by0 + 1, n, topFromNav: by0 - NAV } : null;
}

function rowRanges(m, img, region = {}, minCount = 1, maxGap = 0) {
  const x0 = region.x0 ?? 0, x1 = region.x1 ?? img.w - 1, y0 = region.y0 ?? 0, y1 = region.y1 ?? img.h - 1;
  const out = [];
  let cur = null, gap = 0;
  for (let y = y0; y <= y1; y++) {
    let c = 0;
    for (let x = x0; x <= x1; x++) if (m[y * img.w + x]) c++;
    if (c >= minCount) {
      if (!cur) cur = { y, count: c };
      cur.y1 = y;
      cur.count = Math.max(cur.count, c);
      gap = 0;
    } else if (cur) {
      gap++;
      if (gap > maxGap) { out.push(cur); cur = null; }
    }
  }
  if (cur) out.push(cur);
  return out.map((r) => {
    const b = bbox(m, img, { x0, x1, y0: r.y, y1: r.y1 });
    return { y: r.y, y1: r.y1, h: r.y1 - r.y + 1, x: b.x, x1: b.x1, w: b.w, topFromNav: r.y - NAV, maxRow: r.count };
  });
}

function colRanges(m, img, region, maxGap = 0) {
  const x0 = region.x0 ?? 0, x1 = region.x1 ?? img.w - 1, y0 = region.y0 ?? 0, y1 = region.y1 ?? img.h - 1;
  const out = [];
  let cur = null, gap = 0;
  for (let x = x0; x <= x1; x++) {
    let c = 0;
    for (let y = y0; y <= y1; y++) if (m[y * img.w + x]) c++;
    if (c >= 1) {
      if (!cur) cur = { x };
      cur.x1 = x;
      gap = 0;
    } else if (cur) {
      gap++;
      if (gap > maxGap) { out.push(cur); cur = null; }
    }
  }
  if (cur) out.push(cur);
  return out.map((c) => {
    const b = bbox(m, img, { x0: c.x, x1: c.x1, y0, y1 });
    return { x: c.x, x1: c.x1, w: c.x1 - c.x + 1, y: b.y, y1: b.y1, h: b.h };
  });
}

function components(m, img, region = {}, minArea = 300) {
  const x0 = region.x0 ?? 0, x1 = region.x1 ?? img.w - 1, y0 = region.y0 ?? 0, y1 = region.y1 ?? img.h - 1;
  const seen = new Uint8Array(img.w * img.h);
  const comps = [], stack = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const idx = y * img.w + x;
      if (!m[idx] || seen[idx]) continue;
      seen[idx] = 1;
      stack.length = 0;
      stack.push(idx);
      let n = 0, bx0 = x, bx1 = x, by0 = y, by1 = y;
      while (stack.length) {
        const cur = stack.pop();
        const cy = (cur / img.w) | 0, cx = cur - cy * img.w;
        n++;
        if (cx < bx0) bx0 = cx;
        if (cx > bx1) bx1 = cx;
        if (cy < by0) by0 = cy;
        if (cy > by1) by1 = cy;
        const nb = [cur - 1, cur + 1, cur - img.w, cur + img.w];
        const nbx = [cx - 1, cx + 1, cx, cx], nby = [cy, cy, cy - 1, cy + 1];
        for (let k = 0; k < 4; k++) {
          if (nbx[k] < x0 || nbx[k] > x1 || nby[k] < y0 || nby[k] > y1) continue;
          const ni = nb[k];
          if (m[ni] && !seen[ni]) { seen[ni] = 1; stack.push(ni); }
        }
      }
      if (n >= minArea) comps.push({ x: bx0, y: by0, x1: bx1, y1: by1, w: bx1 - bx0 + 1, h: by1 - by0 + 1, n, topFromNav: by0 - NAV });
    }
  }
  comps.sort((a, b) => b.n - a.n);
  return comps;
}

function modeColor(img, region, pred) {
  const counts = new Map();
  const x0 = region.x0 ?? 0, x1 = region.x1 ?? img.w - 1, y0 = region.y0 ?? 0, y1 = region.y1 ?? img.h - 1;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const p = (y * img.w + x) * 4;
      const c = [img.data[p], img.data[p + 1], img.data[p + 2]];
      if (pred && !pred(c[0], c[1], c[2])) continue;
      const key = (c[0] << 16) | (c[1] << 8) | c[2];
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  let best = null, bestN = -1;
  for (const [k, v] of counts) if (v > bestN) { bestN = v; best = k; }
  return best === null ? null : { hex: '#' + best.toString(16).padStart(6, '0'), count: bestN };
}

async function alphaBBox(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  return { size: `${info.width}x${info.height}`, content: { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }, contentAt1x: { x: +(x0 / 4).toFixed(1), y: +(y0 / 4).toFixed(1), w: +((x1 - x0 + 1) / 4).toFixed(1), h: +((y1 - y0 + 1) / 4).toFixed(1) } };
}

const img1 = await load1x(SRC1);
const img2 = await load1x(SRC2);
const report = {};

// --- Khối xanh: tìm dải hàng liên tục có nền xanh (ngưỡng thấp vì chữ/lego phủ lên) ---
const blueBlock = makeMask(img1, (r, g, b) => onBlock(r, g, b));
const blueRows = rowRanges(blueBlock, img1, {}, 420, 3);
const block = blueRows.find((r) => r.h > 500) ?? blueRows[0];
report.blueBlockRows = blueRows;
report.blueBlock = block;
const blockY0 = block.y, blockY1 = block.y1;

const inBlock = { y0: blockY0 + 2, y1: blockY1 - 2 };
const yellow = makeMask(img1, (r, g, b) => near(r, g, b, [255, 229, 150], 46));
const pink = makeMask(img1, (r, g, b) => near(r, g, b, [255, 65, 122], 46));
const lightOnBlue = makeMask(img1, (r, g, b) => r > 170 && g > 180 && b > 190);
const notBlue = makeMask(img1, (r, g, b) => !onBlock(r, g, b));

report.blueBlockColor = modeColor(img1, { x0: 900, x1: 960, y0: blockY0 + 200, y1: blockY0 + 260 });
report.titleYellowColor = modeColor(img1, { x0: 263, x1: 758, y0: 1755, y1: 1885 }, (r, g, b) => near(r, g, b, [255, 229, 150], 60));
report.titleLines = rowRanges(yellow, img1, { x0: 200, y0: inBlock.y0, y1: inBlock.y1 }, 3, 8);
report.titleCols = report.titleLines.map((l) => colRanges(yellow, img1, { y0: l.y, y1: l.y1 }, 60));
report.titleColor2 = modeColor(img1, { x0: 260, x1: 760, y0: 1750, y1: 1760 });

// Khối lego tím nhạt phía trên trái khối xanh + chữ tiêu đề vàng
report.topLeftBrick = bbox(notBlue, img1, { x0: 20, x1: 330, y0: blockY0 + 40, y1: blockY0 + 280 });

// Chữ hồng (tên 4 mục) và chữ/đường kẻ sáng màu trên nền xanh
report.pinkComponents = components(pink, img1, { x0: 200, y0: blockY0 + 250, y1: blockY1 }, 200);
report.lightRowsAll = rowRanges(lightOnBlue, img1, { x0: 200, y0: blockY0 + 250, y1: blockY1 }, 3, 2);
report.lightComponents = components(lightOnBlue, img1, { x0: 200, y0: blockY0 + 250, y1: blockY1 }, 120).slice(0, 40);
report.descColor = modeColor(img1, { x0: 260, x1: 530, y0: 2040, y1: 2055 }, (r, g, b) => r > 200 && g > 200);

// Cụm lego đáy khối xanh
report.bottomLegoParts = components(notBlue, img1, { x0: 20, x1: 1435, y0: blockY0 + 290, y1: blockY1 }, 400);
report.bottomLegoBBox = bbox(notBlue, img1, { x0: 20, x1: 1435, y0: blockY0 + 290, y1: blockY1 });

// --- Chữ trên nền kem phía trên khối xanh ---
const dark = makeMask(img1, (r, g, b) => near(r, g, b, [25, 25, 25], 90));
const blueText = makeMask(img1, (r, g, b) => near(r, g, b, BLUE, 70) && !near(r, g, b, BGC, 8));
report.darkLines = rowRanges(dark, img1, { x0: 0, y0: 700, y1: blockY0 - 1 }, 3, 5);
report.blueTextLines = rowRanges(blueText, img1, { x0: 0, y0: 900, y1: blockY0 - 1 }, 3, 3);
report.introColor = modeColor(img1, { x0: 90, x1: 900, y0: 1061, y1: 1079 }, (r, g, b) => near(r, g, b, BLUE, 70));

// --- Khối lego xanh lớn (ảnh 1) và ảnh chân dung (ảnh 2) ---
const legoLight = makeMask(img1, (r, g, b) => !near(r, g, b, BGC, 8) && r > 110 && b > 150);
const notCream2 = makeMask(img2, (r, g, b) => !near(r, g, b, BGC, 10));
report.bigLegoBBox = bbox(legoLight, img1, { x0: 600, x1: 1439, y0: 1000, y1: blockY0 - 1 });
report.bigLegoOnBlock = bbox(legoLight, img1, { x0: 600, x1: 1439, y0: blockY0, y1: blockY0 + 220 });
report.bigLegoParts = components(legoLight, img1, { x0: 600, x1: 1439, y0: 1000, y1: blockY0 + 220 }, 500).slice(0, 4);
report.portraitBBox = bbox(notCream2, img2, { x0: 600, x1: 1439, y0: 1000, y1: blockY0 - 1 });
report.portraitOnBlock = bbox(notCream2, img2, { x0: 600, x1: 1439, y0: blockY0, y1: blockY0 + 220 });
report.portraitOnBlockLight = bbox(legoLight, img2, { x0: 600, x1: 1439, y0: blockY0, y1: blockY0 + 260 });

// --- Hiệu chuẩn cỡ chữ bằng tiêu đề HOME (97.8px đã biết) ---
const home = await load1x(HOME, 1028);
const homeDark = makeMask(home, (r, g, b) => near(r, g, b, [25, 25, 25], 90));
report.homeTitleLines = rowRanges(homeDark, home, { x0: 0, y0: 660, y1: 1027 }, 3, 6);
report.assets = {
  'big-lego.png': await alphaBBox('figma-export/assets/myself/big-lego.png'),
  'avatar.png': await alphaBBox('figma-export/assets/myself/avatar.png'),
};

const json = JSON.stringify(report, null, 1);
if (process.argv[2]) {
  const { writeFileSync } = await import('node:fs');
  writeFileSync(process.argv[2], json, 'utf8');
  console.log(`đã ghi ${process.argv[2]}`);
} else {
  console.log(json);
}
