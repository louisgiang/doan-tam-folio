/**
 * Toán học của cụm lego rơi (BRIEF 6A), tách khỏi React để kiểm thử được
 * (scripts/simulate-fall.ts).
 *
 * Vị trí mỗi khối là một hàm của thời gian, không tích luỹ trạng thái.
 * Mọi khối dùng CHUNG một chu kỳ P: mỗi khối rơi với tốc độ riêng, rơi hết vùng
 * thì chờ (ẩn, phía trên khung) tới lượt kế tiếp. Vì vậy sau mỗi chu kỳ bố cục
 * thiết kế lặp lại đúng như cũ — mật độ không bao giờ trôi dần thành chỗ thưa
 * chỗ dồn cục như khi mỗi khối có chu kỳ riêng.
 * Đơn vị: px ở khổ thiết kế, toạ độ theo khung cụm lego.
 */
import { mulberry32 } from './random';

export interface FallConfig {
  speed: number;
  speedJitter: number;
  smallBlockSpeed: number;
  accelTime: number;
  spin: number;
  fadeStart: number;
  fadeEnd: number;
  textMargin: number;
  fadeIn: number;
  respawnGap: number;
}

export interface FallBlockInput {
  x: number; // % chiều rộng khung
  y: number; // % chiều cao khung
  w: number; // % chiều rộng khung
  aspect: number; // cao / rộng của ảnh
}

export interface FallBlock {
  x: number;
  w: number;
  h: number;
  /** Tâm ban đầu (đúng thiết kế). */
  c0: number;
  /** Hệ số tốc độ riêng (kích thước + ngẫu nhiên), quanh 1. */
  variety: number;
  /** Vận tốc (px/giây) — tính trong finalizeSpeeds() sau khi biết quãng rơi. */
  speed: number;
  spin: number;
  /** Tâm khi vừa xuất hiện lại (khối nằm trọn phía trên khung). */
  spawn: number;
  /** Tâm khi mờ hẳn. */
  fadeEnd: number;
}

export interface TextLine {
  left: number;
  right: number;
  top: number;
}

export function prepareBlocks(
  inputs: FallBlockInput[],
  frame: { width: number; height: number },
  cfg: FallConfig,
): FallBlock[] {
  const widths = inputs.map((b) => (b.w / 100) * frame.width);
  const wMin = Math.min(...widths);
  const wMax = Math.max(...widths);
  return inputs.map((b, i) => {
    const rand = mulberry32(1000 + i * 7919);
    const w = widths[i];
    const h = w * b.aspect;
    const sizeNorm = wMax > wMin ? (w - wMin) / (wMax - wMin) : 1;
    const variety =
      (cfg.smallBlockSpeed + (1 - cfg.smallBlockSpeed) * sizeNorm) *
      (1 + cfg.speedJitter * (rand() * 2 - 1));
    const spin = cfg.spin * (0.4 + 0.6 * rand()) * (rand() < 0.5 ? -1 : 1);
    const c0 = (b.y / 100) * frame.height + h / 2;
    return {
      x: (b.x / 100) * frame.width,
      w,
      h,
      c0,
      variety,
      speed: cfg.speed * variety,
      spin,
      spawn: -h / 2 - cfg.respawnGap,
      fadeEnd: Math.max(frame.height * cfg.fadeEnd, c0 + 1),
    };
  });
}

/** Khối nằm thẳng trên một dòng chữ phải mờ hẳn trước mép trên dòng đó. */
export function applyTextLines(
  blocks: FallBlock[],
  lines: TextLine[],
  frameHeight: number,
  cfg: FallConfig,
): void {
  for (const b of blocks) {
    let end = frameHeight * cfg.fadeEnd;
    for (const l of lines) {
      // Mờ hẳn khi mép dưới phần có hình của khối (ảnh có viền trong suốt ~10% mỗi bên,
      // nên hình chiếm ~80% khung ảnh) còn cách dòng chữ textMargin.
      if (l.right > b.x + b.w * 0.1 && l.left < b.x + b.w * 0.9)
        end = Math.min(end, l.top - cfg.textMargin - b.h * 0.4);
    }
    // Không bao giờ để khối đang nằm đúng thiết kế biến mất ngay từ đầu.
    b.fadeEnd = Math.max(end, b.c0 + 1);
  }
}

/**
 * Tính vận tốc từng khối và trả về chu kỳ chung P (giây, theo thời gian đã tính gia tốc).
 * Vận tốc tỉ lệ với quãng rơi của khối (khối phải mờ sớm trên tiêu đề rơi chậm hơn)
 * nhân hệ số riêng; nhờ vậy khối nhanh nhất chỉ phải chờ ẩn một phần nhỏ chu kỳ.
 */
export function finalizeSpeeds(blocks: FallBlock[], cfg: FallConfig): number {
  const lengths = blocks.map((b) => b.fadeEnd - b.spawn);
  const lMax = Math.max(...lengths);
  blocks.forEach((b, i) => (b.speed = cfg.speed * (lengths[i] / lMax) * b.variety));
  return Math.max(...blocks.map((b, i) => lengths[i] / b.speed));
}

const smooth = (v: number) => {
  const t = Math.min(1, Math.max(0, v));
  return t * t * (3 - 2 * t);
};

export interface BlockState {
  /** Độ dời so với vị trí thiết kế (px thiết kế). */
  dy: number;
  rotate: number;
  opacity: number;
  /** Tâm hiện tại. */
  c: number;
  pass: number;
}

/** Trạng thái một khối ở thời điểm t giây (t ≤ 0: đứng yên đúng thiết kế). */
export function blockState(
  b: FallBlock,
  t: number,
  period: number,
  frameHeight: number,
  cfg: FallConfig,
): BlockState {
  if (t <= 0) return { dy: 0, rotate: 0, opacity: 1, c: b.c0, pass: 0 };
  const tau = cfg.accelTime;
  // Thời gian "đã tính gia tốc": quãng rơi = v·(t − τ(1 − e^(−t/τ))),
  // tức nhanh dần lúc đầu rồi giữ vận tốc giới hạn.
  const time = t - tau * (1 - Math.exp(-t / tau));
  const cycle = b.fadeEnd - b.spawn;
  // Thời gian kể từ đầu lượt 0 (lúc t=0 khối đã đi được c0 − spawn).
  const local = time + (b.c0 - b.spawn) / b.speed;
  const pass = Math.floor(local / period);
  const along = b.speed * (local - pass * period);
  // Xoay chậm trong từng lượt rơi; góc đặt lại lúc khối đang ẩn nên không bị giật.
  const rotate = b.spin * (pass === 0 ? time : local - pass * period);
  // Đã rơi hết vùng: chờ ẩn phía trên khung tới lượt sau.
  if (along >= cycle) return { dy: b.spawn - b.c0, rotate, opacity: 0, c: b.spawn, pass };
  const c = b.spawn + along;
  const fadeStartY = frameHeight * cfg.fadeStart;

  let opacity: number;
  if (pass === 0) {
    // Lượt đầu: khối bắt đầu rõ nét ở đúng chỗ thiết kế, mờ dần từ đó.
    const start = Math.min(Math.max(fadeStartY, b.c0), b.fadeEnd - 1);
    opacity = 1 - smooth((c - start) / (b.fadeEnd - start));
  } else {
    const start = Math.min(fadeStartY, b.fadeEnd - frameHeight * 0.2);
    const fadeIn = smooth((c - b.spawn) / (frameHeight * cfg.fadeIn + b.h / 2));
    const fadeOut = 1 - smooth((c - start) / (b.fadeEnd - start));
    opacity = fadeIn * fadeOut;
  }
  return { dy: c - b.c0, rotate, opacity, c, pass };
}
