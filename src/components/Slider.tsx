import { useRef, useState, type PointerEvent } from 'react';
import styles from './Slider.module.css';

/**
 * Slider ảnh (BRIEF mục 5, ECOWANDER): bấm chấm để chuyển, vuốt ngang trên điện thoại,
 * trượt ngang 400ms, KHÔNG tự chạy. Số chấm = số ảnh.
 */
export function Slider({
  images,
  label,
  className,
}: {
  images: { src: string; alt: string }[];
  label: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const count = images.length;
  const go = (i: number) => setIndex(Math.max(0, Math.min(count - 1, i)));

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return; // chuột: dùng chấm
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onMove = (e: PointerEvent) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    // Vuốt dọc thì để trang cuộn bình thường.
    if (Math.abs(e.clientY - s.y) > Math.abs(dx) && drag === 0) {
      start.current = null;
      return;
    }
    setDrag(dx);
  };
  const onUp = () => {
    const width = viewport.current?.offsetWidth ?? 1;
    if (Math.abs(drag) > width * 0.15) go(index + (drag < 0 ? 1 : -1));
    start.current = null;
    setDrag(0);
  };

  return (
    <div className={className} role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={viewport}
        className={styles.viewport}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div
          className={styles.track}
          data-dragging={drag !== 0}
          style={{ transform: `translateX(calc(${-index * 100}% + ${drag}px))` }}
        >
          {images.map((img, i) => (
            <img
              key={img.src}
              className={styles.slide}
              src={img.src}
              alt={img.alt}
              draggable={false}
              loading="lazy"
              aria-hidden={i !== index}
            />
          ))}
        </div>
      </div>
      {count > 1 && (
        <div className={styles.dots}>
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              className={styles.dot}
              aria-label={`Show image ${i + 1} of ${count}`}
              aria-current={i === index}
              onClick={() => go(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
