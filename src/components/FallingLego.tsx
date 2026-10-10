import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
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
  avoidRef,
  measureKey,
  hideFlaggedAtStart = false,
  className,
}: {
  cluster: LegoCluster;
  /**
   * Vùng chứa chữ mà lego phải mờ hẳn trước khi chạm tới: dùng phần tử có
   * [data-lego-avoid] bên trong (thường là tiêu đề), không có thì dùng chính vùng đó.
   */
  avoidRef?: RefObject<HTMLElement>;
  /** Đổi giá trị này khi chữ bên dưới thay đổi để đo lại (không khởi động lại chuyển động). */
  measureKey?: string;
  /** Ẩn các khối sectionOnly trong lượt rơi đầu (dùng khi trang mở ở HOME). */
  hideFlaggedAtStart?: boolean;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLImageElement | null)[]>([]);
  const measureRef = useRef<() => void>(() => {});
  // Chỉ xét lúc mới mở trang.
  const [hideFlagged] = useState(hideFlaggedAtStart);
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
    if (!frame) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const inputs = cluster.blocks.map((b) => ({
      ...b,
      aspect: legoAspect(b.type),
      hiddenFirstPass: hideFlagged && !!b.sectionOnly,
    }));
    let blocks: FallBlock[] = [];
    // Mọi phép tính dùng đơn vị "px thiết kế theo chiều rộng"; khung co thì frameH = FH·k.
    let scale = 1;
    let frameH = FH;
    let period = 1;
    let offscreen: boolean[] = [];

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
      const area = avoidRef?.current;
      const avoid = area?.querySelector<HTMLElement>('[data-lego-avoid]') ?? area;
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

      // Khối nằm ngoài chiều ngang màn hình (vd. điện thoại: khung 720px bị cắt hai bên)
      // thì ẩn hẳn và không tính chuyển động.
      const viewW = document.documentElement.clientWidth;
      offscreen = blocks.map((b) => {
        const left = fr.left + b.x * scale;
        return left + b.w * scale < 0 || left > viewW;
      });
      offscreen.forEach((off, i) => {
        const el = blockRefs.current[i];
        if (el) el.style.visibility = off ? 'hidden' : '';
      });
    };
    measure();
    measureRef.current = measure;

    const render = (t: number) => {
      blocks.forEach((b, i) => {
        const el = blockRefs.current[i];
        if (!el || offscreen[i]) return;
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
  }, [cluster, FW, FH, avoidRef, hideFlagged]);

  // Chữ bên dưới đổi (chuyển phần): đo lại vị trí dòng chữ cần tránh.
  useEffect(() => {
    measureRef.current();
  }, [measureKey]);

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
              opacity: hideFlagged && b.sectionOnly ? 0 : undefined,
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
