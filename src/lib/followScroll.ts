/**
 * Cuộn mượt tới một đích có thể thay đổi trong lúc cuộn (ví dụ vùng nội dung
 * đang giãn ra). Mỗi khung hình đọc lại đích và tiến dần theo hàm mũ, nên
 * không bị giật khi trang chưa đủ dài để tới đích ngay.
 *
 * Dừng khi tới đích và `keepAliveUntil()` trả về false, hoặc khi người xem
 * tự cuộn (wheel/touch/phím). Trả về hàm huỷ.
 */
export function followScroll(
  getTarget: () => number,
  keepAlive: () => boolean = () => false,
  tau = 140,
): () => void {
  if (document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, getTarget());
    return () => {};
  }

  let raf = 0;
  const start = performance.now();
  let last = start;
  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchstart', stop);
    window.removeEventListener('keydown', stop);
  };

  const tick = (now: number) => {
    const dt = Math.min(now - last, 64);
    last = now;
    const y = window.scrollY;
    const diff = getTarget() - y;
    // Tới đích, hoặc quá 3s mà trang vẫn không đủ dài để tới (an toàn).
    if (Math.abs(diff) < 0.5 || now - start > 3000) {
      if (!keepAlive() || now - start > 3000) return stop();
    } else {
      const step = diff * (1 - Math.exp(-dt / tau));
      window.scrollTo(0, Math.abs(step) < 0.5 ? y + diff : y + step);
    }
    raf = requestAnimationFrame(tick);
  };

  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('keydown', stop);
  raf = requestAnimationFrame(tick);
  return stop;
}
