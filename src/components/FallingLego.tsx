import { useEffect, useLayoutEffect, useRef, type CSSProperties, type RefObject } from 'react';
import { legoAspect, legoUrl, type LegoCluster } from '../data/lego';
import { FALL } from '../data/lego-motion';
import {
  applyTextLines,
  blockState,
  finalizeSpeeds,
  prepareBlocks,
  type FallBlock,
  type TextLine,
} from '../lib/legoFall';
import styles from './FallingLego.module.css';

/**
 * Cụm lego đầu phần (BRIEF 6A): lúc đầu nằm đúng như thiết kế, sau đó rơi vô tận,
 * mờ dần khi xuống thấp, khối mờ hẳn xuất hiện lại phía trên (giữ cột và loại khối).
 * Phần tính toán nằm ở lib/legoFall.ts; ở đây chỉ lo vòng lặp, tạm dừng và DOM.
 */
export function FallingLego({
  cluster,
  active,
  avoidRef,
  className,
}: {
  cluster: LegoCluster;
  /** Cho phép rơi (ví dụ phần đã thả xuống xong). */
  active: boolean;
  /** Phần tử chữ mà lego phải mờ hẳn trước khi chạm tới (thường là tiêu đề). */
  avoidRef?: RefObject<HTMLElement>;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLImageElement | null)[]>([]);
  const { width: FW, height: FH } = cluster.frame;

  // Khung bị co chiều cao (vd. HOME co theo màn hình): co cả khối theo cùng tỉ lệ k,
  // giữ tâm ngang, để quan hệ trên–dưới giữa lego và chữ giống hệt thiết kế.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const update = () => frame.style.setProperty('--k', String(shrinkOf(frame, FW, FH)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(frame);
    return () => ro.disconnect();
  }, [FW, FH]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const inputs = cluster.blocks.map((b) => ({ ...b, aspect: legoAspect(b.type) }));
    let blocks: FallBlock[] = [];
    // Mọi phép tính dùng đơn vị "px thiết kế theo chiều rộng"; khung co thì frameH = FH·k.
    let scale = 1;
    let frameH = FH;
    let period = 1;

    // Lego phải mờ hẳn trước dòng chữ nằm ngay bên dưới cột của nó.
    const measure = () => {
      const fr = frame.getBoundingClientRect();
      scale = fr.width / FW || 1;
      frameH = fr.height / scale || FH;
      const k = shrinkOf(frame, FW, FH);
      blocks = prepareBlocks(
        inputs.map((b) => ({ ...b, x: b.x + (b.w * (1 - k)) / 2, w: b.w * k })),
        { width: FW, height: frameH },
        cfg(k),
      );
      const lines: TextLine[] = [];
      const avoid = avoidRef?.current;
      if (avoid) {
        const range = document.createRange();
        range.selectNodeContents(avoid);
        for (const r of range.getClientRects()) {
          if (r.width < 1) continue;
          lines.push({
            left: (r.left - fr.left) / scale,
            right: (r.right - fr.left) / scale,
            top: (r.top - fr.top) / scale,
          });
        }
      }
      applyTextLines(blocks, lines, frameH, FALL);
      period = finalizeSpeeds(blocks, cfg(k));
    };
    measure();

    const render = (t: number) => {
      blocks.forEach((b, i) => {
        const el = blockRefs.current[i];
        if (!el) return;
        const s = blockState(b, t, period, frameH, FALL);
        el.style.transform = `translate3d(0, ${(s.dy * scale).toFixed(2)}px, 0) rotate(${s.rotate.toFixed(2)}deg)`;
        el.style.opacity = s.opacity.toFixed(3);
      });
    };

    // Một vòng requestAnimationFrame cho cả cụm; thời gian chỉ chạy khi nhìn thấy được,
    // tính theo đồng hồ thật nên tốc độ không phụ thuộc tần số màn hình.
    let raf = 0;
    let last = 0;
    let elapsed = -FALL.startDelay / 1000;
    let inView = false;
    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      elapsed += dt;
      if (elapsed > 0) render(elapsed);
      raf = requestAnimationFrame(tick);
    };
    const update = () => {
      const run = inView && !document.hidden;
      if (run && !raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    io.observe(frame);
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    if (avoidRef?.current) ro.observe(avoidRef.current);
    document.addEventListener('visibilitychange', update);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, [active, cluster, FW, FH, avoidRef]);

  return (
    <div
      ref={frameRef}
      className={`${styles.frame} ${className ?? ''}`}
      style={{ '--frame-aspect': `${FW} / ${FH}` } as CSSProperties}
      aria-hidden="true"
    >
      {cluster.blocks.map((b, i) => (
        <img
          key={i}
          ref={(el) => {
            blockRefs.current[i] = el;
          }}
          className={styles.block}
          src={legoUrl(b.type)}
          alt=""
          draggable={false}
          decoding="async"
          style={
            {
              left: `calc(${b.x}% + ${b.w}% * (1 - var(--k, 1)) / 2)`,
              top: `${b.y}%`,
              width: `calc(${b.w}% * var(--k, 1))`,
              zIndex: b.z,
              rotate: b.rotation ? `${b.rotation}deg` : undefined,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Tỉ lệ co của khung so với thiết kế (1 = đúng tỉ lệ thiết kế). */
function shrinkOf(frame: HTMLElement, fw: number, fh: number): number {
  const { width, height } = frame.getBoundingClientRect();
  if (!width || !height) return 1;
  return Math.min(1, height / ((width / fw) * fh));
}

/** Khung co thì quãng rơi ngắn lại: giảm vận tốc theo cùng tỉ lệ để nhịp rơi như thiết kế. */
function cfg(k: number) {
  return { ...FALL, speed: FALL.speed * k };
}
