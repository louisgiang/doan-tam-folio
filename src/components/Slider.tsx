import { useEffect, useRef, useState, type PointerEvent } from 'react';
import styles from './Slider.module.css';

/**
 * Slider ảnh ECOWANDER (đã đổi theo chủ dự án): tự chuyển ảnh sau mỗi `interval` ms,
 * trượt ngang 400ms, chạy vòng liền mạch (ảnh cuối trượt tiếp sang ảnh đầu), không có chấm.
 * Tạm dừng khi rê chuột lên ảnh, khi ra khỏi màn hình hoặc chuyển tab. Cảm ứng: vuốt ngang.
 * prefers-reduced-motion: vẫn đổi ảnh nhưng không trượt.
 */
export function Slider({
  images,
  label,
  interval = 2000,
  className,
}: {
  images: { src: string; alt: string }[];
  label: string;
  interval?: number;
  className?: string;
}) {
  const count = images.length;
  // Thêm bản sao ảnh đầu ở cuối để trượt vòng liền mạch.
  const slides = count > 1 ? [...images, images[0]] : images;
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [drag, setDrag] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const viewport = useRef<HTMLDivElement>(null);

  // Chỉ chạy khi nhìn thấy được.
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    const onVis = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // Tự chuyển ảnh.
  useEffect(() => {
    if (count < 2 || !visible || tabHidden || hovered || drag !== 0) return;
    const timer = window.setTimeout(() => {
      setAnimate(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      setIndex((i) => i + 1);
    }, interval);
    return () => window.clearTimeout(timer);
  }, [count, visible, tabHidden, hovered, drag, index, interval]);

  // Tới bản sao ảnh đầu: nhảy về ảnh đầu thật, không trượt (người xem không thấy khác biệt).
  useEffect(() => {
    if (index < count) return;
    const reset = () => {
      setAnimate(false);
      setIndex(0);
    };
    if (!animate) return reset();
    const t = window.setTimeout(reset, 420);
    return () => window.clearTimeout(t);
  }, [index, count, animate]);

  // Sau khi nhảy về (không trượt), bật lại hiệu ứng trượt cho lần sau.
  useEffect(() => {
    if (animate) return;
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  const go = (i: number) => {
    setAnimate(true);
    setIndex(((i % count) + count) % count);
  };

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return;
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

  const current = index % count;
  return (
    <div className={className} role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        ref={viewport}
        className={styles.viewport}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div
          className={styles.track}
          data-animate={animate && drag === 0}
          style={{ transform: `translateX(calc(${-index * 100}% + ${drag}px))` }}
        >
          {slides.map((img, i) => (
            <img
              key={i}
              className={styles.slide}
              src={img.src}
              alt={i === current ? img.alt : ''}
              draggable={false}
              // Ảnh đầu tải theo trang; các ảnh sau tải sẵn khi slider vào màn hình (tránh trống khi trượt tới).
              loading={i === 0 || visible ? 'eager' : 'lazy'}
              aria-hidden={i !== index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
