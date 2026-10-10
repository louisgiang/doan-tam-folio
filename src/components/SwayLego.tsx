import { useEffect, useRef, type CSSProperties } from 'react';
import { legoUrl, type LegoCluster } from '../data/lego';
import { SWAY } from '../data/lego-motion';
import { mulberry32 } from '../lib/random';
import styles from './SwayLego.module.css';

/**
 * Lego đứng yên đúng vị trí thiết kế, chỉ đung đưa rất nhẹ (BRIEF 6B).
 * Dùng CSS animation (chỉ transform); mỗi khối lệch pha và lệch chu kỳ;
 * tạm dừng khi ra khỏi màn hình; prefers-reduced-motion thì đứng yên (xem CSS).
 */
export function SwayLego({ cluster, className }: { cluster: LegoCluster; className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const io = new IntersectionObserver(([entry]) => {
      frame.dataset.paused = String(!entry.isIntersecting);
    });
    io.observe(frame);
    return () => io.disconnect();
  }, []);

  const { width: FW, height: FH } = cluster.frame;
  return (
    <div
      ref={frameRef}
      className={`${styles.frame} ${className ?? ''}`}
      style={{ '--frame-aspect': `${FW} / ${FH}` } as CSSProperties}
      data-paused="true"
      aria-hidden="true"
    >
      {cluster.blocks.map((b, i) => {
        const rand = mulberry32(5000 + i * 104729);
        const period = SWAY.periodMin + (SWAY.periodMax - SWAY.periodMin) * rand();
        const rotate = SWAY.rotate * (0.7 + 0.3 * rand()) * (rand() < 0.5 ? -1 : 1);
        return (
          <img
            key={i}
            className={styles.block}
            src={legoUrl(b.type)}
            alt=""
            draggable={false}
            decoding="async"
            loading="lazy"
            style={
              {
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.w}%`,
                zIndex: b.z,
                rotate: b.rotation ? `${b.rotation}deg` : undefined,
                '--sway-rotate': `${rotate.toFixed(2)}deg`,
                '--sway-bob': `${SWAY.bob}`,
                animationDuration: `${period.toFixed(2)}s`,
                // Bắt đầu ở một pha ngẫu nhiên để các khối không chuyển động đồng loạt.
                animationDelay: `${(-period * rand()).toFixed(2)}s`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
