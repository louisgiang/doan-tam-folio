/**
 * Xác định khung của khối lego xanh lớn và ảnh chân dung trong design-ref (bỏ viền chống răng cưa).
 *   node scripts/measure-myself-frames.mjs
 */
import sharp from 'sharp';

const W = 1440, H = 2777, K = 4, NAV = 66;
const BGC = [244, 241, 232], BLUE = [32, 96, 215];
const near = (r, g, b, t, tol) => Math.abs(r - t[0]) <= tol && Math.abs(g - t[1]) <= tol && Math.abs(b - t[2]) <= tol;

/** Khoảng cách từ điểm tới đoạn thẳng nối màu nền kem và màu nền xanh (để loại viền chống răng cưa của chữ). */
function distToBlend(r, g, b) {
  const ax = BGC[0], ay = BGC[1], az = BGC[2];
  const vx = BLUE[0] - ax, vy = BLUE[1] - ay, vz = BLUE[2] - az;
  const wx = r - ax, wy = g - ay, wz = b - az;
  const t = Math.max(0, Math.min(1, (wx * vx + wy * vy + wz * vz) / (vx * vx + vy * vy + vz * vz)));
  const dx = wx - t * vx, dy = wy - t * vy, dz = wz - t * vz;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

const objectMask = (im) => {
  const m = new Uint8Array(im.w * im.h);
  for (let i = 0, q = 0; i < m.length; i++, q += 4) {
    const r = im.data[q], g = im.data[q + 1], b = im.data[q + 2];
    if (near(r, g, b, BGC, 10) || distToBlend(r, g, b) < 34) continue;
    m[i] = 1;
  }
  return m;
};

function firstRow(m, im, x0, x1, yStart, yEnd) {
  for (let y = Math.round(yStart * K); y <= Math.round(yEnd * K); y++) {
    for (let x = Math.round(x0 * K); x <= Math.round(x1 * K); x++) if (m[y * im.w + x]) return +(y / K).toFixed(2);
  }
  return null;
}
function lastRow(m, im, x0, x1, yStart, yEnd) {
  for (let y = Math.round(yEnd * K); y >= Math.round(yStart * K); y--) {
    for (let x = Math.round(x0 * K); x <= Math.round(x1 * K); x++) if (m[y * im.w + x]) return +(y / K).toFixed(2);
  }
  return null;
}
function firstCol(m, im, y0, y1, xStart, xEnd) {
  for (let x = Math.round(xStart * K); x <= Math.round(xEnd * K); x++) {
    for (let y = Math.round(y0 * K); y <= Math.round(y1 * K); y++) if (m[y * im.w + x]) return +(x / K).toFixed(2);
  }
  return null;
}
function lastCol(m, im, y0, y1, xStart, xEnd) {
  for (let x = Math.round(xEnd * K); x >= Math.round(xStart * K); x--) {
    for (let y = Math.round(y0 * K); y <= Math.round(y1 * K); y++) if (m[y * im.w + x]) return +(x / K).toFixed(2);
  }
  return null;
}

const load = async (f) => {
  const { data, info } = await sharp(f).resize(W * K, H * K, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
};

const i1 = await load('figma-export/design-ref/myself 1.png');
const i2 = await load('figma-export/design-ref/myself 2.png');
const m1 = objectMask(i1);
const m2 = objectMask(i2);

const out = {};
// Vùng x 800–1280 không có chữ, nên đo được đỉnh thật của khối lego / ảnh.
out.lego = {
  top: firstRow(m1, i1, 800, 1280, 1050, 1700),
  left: firstCol(m1, i1, 1140, 1650, 600, 1439),
  right: lastCol(m1, i1, 1140, 1650, 600, 1439),
  bottomOnBlock: lastRow(m1, i1, 780, 1439, 1657, 1900),
};
out.portrait = {
  top: firstRow(m2, i2, 800, 1280, 1050, 1700),
  left: firstCol(m2, i2, 1140, 1650, 600, 1439),
  right: lastCol(m2, i2, 1140, 1650, 600, 1439),
  bottomOnBlock: lastRow(m2, i2, 780, 1439, 1657, 1900),
};
out.legoFromNav = { top: out.lego.top - NAV, bottom: out.lego.bottomOnBlock - NAV };
out.portraitFromNav = { top: out.portrait.top - NAV, bottom: out.portrait.bottomOnBlock - NAV };
console.log(JSON.stringify(out, null, 1));
