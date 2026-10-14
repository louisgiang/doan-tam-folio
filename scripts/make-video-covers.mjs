// Ảnh bìa 2 video phần LEGO từ thumbnail YouTube (chủ dự án yêu cầu thay ảnh bìa Figma bị mờ).
// Chạy: node scripts/make-video-covers.mjs  (SAU optimize-images.mjs, vì script đó ghi đè video-cover-*.webp)
// - Ảnh gốc tải từ i.ytimg.com, lưu ở figma-export/assets/lego-page/youtube/.
// - Cắt dải đen (letterbox), cắt 2 bên về tỉ lệ khung thiết kế 2644×1616 như object-fit: cover.
// - Vẽ lại nút play đo từ ảnh bìa Figma (khung 174×170, bo ~24px, nền #1A1A1B, tam giác #E2E2E2 38×48).
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'figma-export/assets/lego-page/youtube');
const OUT = path.join(ROOT, 'src/assets/lego-page');

const COVERS = [
  { id: 'EKTRENAABPA', thumb: 'sddefault', out: 'video-cover-1.webp' }, // trái 5:35 — YouTube chỉ có 640×480
  { id: 'NsNCkdZvX58', thumb: 'maxresdefault', out: 'video-cover-2.webp' }, // phải 0:34 — 1280×720
];

// Khung thiết kế và kích thước xuất (giữ như ảnh bìa cũ).
const DW = 2644;
const DH = 1616;
const OW = 1800;
const OH = 1100;

const playSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OW}" height="${OH}" viewBox="0 0 ${DW} ${DH}">
  <rect x="1245" y="720" width="174" height="170" rx="24" fill="#1A1A1B"/>
  <path d="M1318 781 L1356 805 L1318 829 Z" fill="#E2E2E2"/>
</svg>`);

/** Tìm vùng có hình (bỏ dải đen trên/dưới). */
async function contentRows(file) {
  const { data, info } = await sharp(file).greyscale().raw().toBuffer({ resolveWithObject: true });
  const rowIsBlack = (y) => {
    let sum = 0;
    for (let x = 0; x < info.width; x++) sum += data[y * info.width + x];
    return sum / info.width < 12;
  };
  let top = 0;
  let bottom = info.height - 1;
  while (top < bottom && rowIsBlack(top)) top++;
  while (bottom > top && rowIsBlack(bottom)) bottom--;
  // Bỏ thêm 2px mép để không dính viền nén JPEG.
  if (top > 0) top += 2;
  if (bottom < info.height - 1) bottom -= 2;
  return { width: info.width, top, height: bottom - top + 1 };
}

await fs.mkdir(SRC, { recursive: true });
for (const c of COVERS) {
  const file = path.join(SRC, `${c.id}-${c.thumb}.jpg`);
  try {
    await fs.access(file);
  } catch {
    const res = await fetch(`https://i.ytimg.com/vi/${c.id}/${c.thumb}.jpg`);
    if (!res.ok) throw new Error(`Không tải được thumbnail ${c.id}: ${res.status}`);
    await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
  }

  const { width, top, height } = await contentRows(file);
  const cropW = Math.round(height * (DW / DH));
  const left = Math.round((width - cropW) / 2);
  const upscale = OW / cropW;

  const info = await sharp(file)
    .extract({ left, top, width: cropW, height })
    .resize(OW, OH, { kernel: 'lanczos3' })
    // Phóng nhiều (ảnh trái ~3×) thì làm nét nhẹ để đỡ bệt; ảnh phải gần kích thước gốc thì gần như không.
    .sharpen({ sigma: upscale > 2 ? 1.0 : 0.6, m1: 0.5, m2: 1.5 })
    .composite([{ input: playSvg }])
    .webp({ quality: 88, effort: 6 })
    .toFile(path.join(OUT, c.out));
  console.log(`${c.out}: nguồn ${width}×? → cắt ${cropW}×${height} (từ y=${top}) → ${info.width}×${info.height}, ${(info.size / 1024).toFixed(0)}KB`);
}
