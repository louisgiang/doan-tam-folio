// Mô phỏng cụm lego rơi để kiểm tra yêu cầu BRIEF 6A mà không cần trình duyệt.
// Chạy: npx esbuild scripts/simulate-fall.ts --bundle --platform=node --log-level=warning | node - <cluster.json> [lines.json]
//   lines.json: các dòng chữ cần tránh [{left,right,top,bottom}] theo toạ độ khung (px 1440).
//   --shrink k: mô phỏng khung bị co còn k lần chiều cao (khối co theo, như FallingLego).
import fs from 'node:fs';
import { FALL } from '../src/data/lego-motion';
import { applyTextLines, blockState, finalizeSpeeds, prepareBlocks, type TextLine } from '../src/lib/legoFall';
import legoTypes from '../src/data/lego-types.json';

const argv = process.argv.slice(2);
const kIdx = argv.indexOf('--shrink');
const k = kIdx >= 0 ? Number(argv.splice(kIdx, 2)[1]) : 1;
const [clusterFile, linesFile] = argv;
const cluster = JSON.parse(fs.readFileSync(clusterFile, 'utf8'));
const lines: (TextLine & { bottom: number })[] = linesFile ? JSON.parse(fs.readFileSync(linesFile, 'utf8')) : [];
const FW = cluster.frame.width;
const FH = cluster.frame.height * k;
const cfg = { ...FALL, speed: FALL.speed * k };
const types = legoTypes as Record<string, { aspect: number }>;

const blocks = prepareBlocks(
  cluster.blocks.map((b: { type: string; x: number; w: number }) => ({
    ...b,
    x: b.x + (b.w * (1 - k)) / 2,
    w: b.w * k,
    aspect: types[b.type].aspect,
  })),
  { width: FW, height: FH },
  cfg,
);
applyTextLines(blocks, lines, FH, cfg);
const period = finalizeSpeeds(blocks, cfg);

const DT = 1 / 60;
const T_END = 180;
let maxJump = 0;
let worstText = { opacity: 0, t: 0, i: -1 };
const thirds: number[][] = [[], [], []];
const cols: number[][] = [[], [], [], []];
const totals: number[] = [];
const prev = blocks.map(() => 1);
const timeline: string[] = [];

for (let step = 0; step * DT <= T_END; step++) {
  const t = step * DT;
  const third = [0, 0, 0];
  const col = [0, 0, 0, 0];
  let total = 0;
  blocks.forEach((b, i) => {
    const s = blockState(b, t, period, FH, cfg);
    maxJump = Math.max(maxJump, Math.abs(s.opacity - prev[i]));
    prev[i] = s.opacity;
    // Phần có hình của khối ~ 80% khung ảnh (ảnh có viền trong suốt).
    const bottom = s.c + b.h * 0.4;
    for (const l of lines) {
      const overlapX = l.right > b.x + b.w * 0.1 && l.left < b.x + b.w * 0.9;
      if (overlapX && bottom > l.top && s.c - b.h * 0.4 < l.bottom && s.opacity > worstText.opacity)
        worstText = { opacity: s.opacity, t, i };
    }
    if (s.opacity > 0.3 && s.c > 0 && s.c < FH) {
      total++;
      third[Math.min(2, Math.floor((s.c / FH) * 3))]++;
      col[Math.min(3, Math.floor(((b.x + b.w / 2) / FW) * 4))]++;
    }
  });
  if (t > 15) {
    third.forEach((n, k) => thirds[k].push(n));
    col.forEach((n, k) => cols[k].push(n));
    totals.push(total);
  }
  if (step % (60 * 5) === 0) timeline.push(`t=${t.toFixed(0)}s: ${total} khối rõ (trên/giữa/dưới ${third.join('/')})`);
}

const range = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  const p = (q: number) => s[Math.floor(q * (s.length - 1))];
  return `${s[0]}–${s[s.length - 1]}, 90% thời gian ${p(0.05)}–${p(0.95)} (tb ${(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1)})`;
};
console.log(`Cụm: ${cluster.source}, ${blocks.length} khối, khung ${FW}x${FH.toFixed(0)} (co ${k}), chu kỳ ${period.toFixed(1)}s`);
console.log(timeline.slice(0, 8).join('\n'));
console.log('--- sau 15s, đếm khối có opacity > 0.3 ---');
console.log('tổng      ', range(totals));
console.log('1/3 trên  ', range(thirds[0]));
console.log('1/3 giữa  ', range(thirds[1]));
console.log('1/3 dưới  ', range(thirds[2]));
cols.forEach((c, k) => console.log(`cột ${k + 1}/4   `, range(c)));
console.log('bước nhảy opacity lớn nhất mỗi khung hình (60Hz):', maxJump.toFixed(3));
console.log('opacity lớn nhất khi khối chạm vùng chữ:', worstText.opacity.toFixed(3), worstText.i >= 0 ? `(khối ${worstText.i}, t=${worstText.t.toFixed(1)}s)` : '');
