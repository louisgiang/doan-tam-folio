import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { flushSync } from 'react-dom';
import { isSectionId, type SectionId } from '../data/sections';
import { followScroll } from '../lib/followScroll';

/**
 * Cơ chế đổi nội dung (BRIEF mục 4, đã chỉnh theo chủ dự án):
 * - cụm lego trên cùng dùng chung, luôn ở đó; bên dưới là MỘT khối nội dung:
 *   mặc định là lời chào HOME ("HI, I'M TAM…"), bấm menu thì khối đang hiện thu lại
 *   và nội dung phần mới thả xuống thay vào;
 * - mỗi lần điều hướng cuộn mượt về đầu trang;
 * - đồng bộ với #hash trên thanh địa chỉ và nút Back của trình duyệt.
 */

export type Phase = 'opening' | 'open' | 'closing';

const EXPAND_MS = 650;
const COLLAPSE_MS = 400;
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_IN = 'cubic-bezier(0.55, 0, 0.75, 0.2)';

interface NavState {
  /** Nội dung đang hiện dưới cụm lego (null = lời chào HOME). */
  current: SectionId | null;
  phase: Phase;
}

interface SectionNavValue extends NavState {
  navigate: (id: SectionId | 'home') => void;
  clipRef: RefObject<HTMLDivElement>;
  innerRef: RefObject<HTMLDivElement>;
}

const SectionNavContext = createContext<SectionNavValue | null>(null);

/** Bỏ animation khi người xem tắt chuyển động, hoặc khi tab đang ẩn (trình duyệt đóng băng animation). */
const skipMotion = () =>
  document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function hashToTarget(hash: string): SectionId | null {
  const id = hash.replace(/^#/, '');
  return isSectionId(id) ? id : null;
}

export function SectionNavProvider({ children }: { children: ReactNode }) {
  // Mở link có sẵn #lego: hiện ngay phần LEGO, không cần animation.
  const [initial] = useState(() => hashToTarget(window.location.hash));
  const [state, setState] = useState<NavState>({ current: initial, phase: 'open' });
  const clipRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const currentRef = useRef<SectionId | null>(initial);
  const targetRef = useRef<SectionId | null>(initial);
  const runningRef = useRef(false);
  const stopScrollRef = useRef<() => void>(() => {});

  const expand = useCallback(async () => {
    const clip = clipRef.current;
    const inner = innerRef.current;
    if (!clip || !inner || skipMotion()) return;
    const height = inner.scrollHeight;
    clip.dataset.animating = 'true';
    await Promise.all([
      clip.animate([{ height: '0px' }, { height: `${height}px` }], {
        duration: EXPAND_MS,
        easing: EASE_OUT,
      }).finished,
      inner.animate(
        [
          { opacity: 0, transform: 'translateY(-48px)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: EXPAND_MS, easing: EASE_OUT },
      ).finished,
    ]).catch(() => {});
    delete clip.dataset.animating;
  }, []);

  const collapse = useCallback(async () => {
    const clip = clipRef.current;
    const inner = innerRef.current;
    if (!clip || !inner || skipMotion()) return;
    clip.dataset.animating = 'true';
    await Promise.all([
      clip.animate([{ height: `${clip.offsetHeight}px` }, { height: '0px' }], {
        duration: COLLAPSE_MS,
        easing: EASE_IN,
        fill: 'forwards',
      }).finished,
      inner.animate(
        [
          { opacity: 1, transform: 'none' },
          { opacity: 0, transform: 'translateY(-24px)' },
        ],
        { duration: COLLAPSE_MS, easing: EASE_IN, fill: 'forwards' },
      ).finished,
    ]).catch(() => {});
  }, []);

  /** Chạy lần lượt: thu nội dung đang hiện rồi thả nội dung đích xuống. */
  const sequence = useCallback(async () => {
    try {
      while (currentRef.current !== targetRef.current) {
        flushSync(() => setState((s) => ({ ...s, phase: 'closing' })));
        await collapse();
        const next = targetRef.current;
        currentRef.current = next;
        flushSync(() => setState({ current: next, phase: 'opening' }));
        // Bỏ trạng thái "đã thu" của lần trước; expand() bắt đầu từ chiều cao 0 ngay trong cùng khung hình.
        clipRef.current?.getAnimations().forEach((a) => a.cancel());
        innerRef.current?.getAnimations().forEach((a) => a.cancel());
        await expand();
        if (currentRef.current === targetRef.current) {
          setState({ current: next, phase: 'open' });
        }
      }
    } finally {
      runningRef.current = false;
    }
  }, [collapse, expand]);

  // Dùng chung một chuỗi chạy: bấm liên tục chỉ đổi đích, không chạy chồng.
  const runPromiseRef = useRef<Promise<void>>(Promise.resolve());
  const run = useCallback((): Promise<void> => {
    if (!runningRef.current) {
      runningRef.current = true;
      runPromiseRef.current = sequence();
    }
    return runPromiseRef.current;
  }, [sequence]);

  const go = useCallback(
    (next: SectionId | null) => {
      targetRef.current = next;
      stopScrollRef.current();
      if (skipMotion()) {
        // Không animation: đổi nội dung xong rồi nhảy thẳng lên đầu trang.
        void run().then(() => window.scrollTo(0, 0));
        return;
      }
      stopScrollRef.current = followScroll(() => 0);
      void run();
    },
    [run],
  );

  const navigate = useCallback(
    (id: SectionId | 'home') => {
      const next = id === 'home' ? null : id;
      const url = next ? `#${next}` : window.location.pathname + window.location.search;
      if (hashToTarget(window.location.hash) !== next || (next === null && window.location.hash)) {
        window.history.pushState(null, '', url);
      }
      go(next);
    },
    [go],
  );

  // Mở theo #hash khi tải trang và khi bấm Back/Forward.
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const onPop = () => go(hashToTarget(window.location.hash));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [go]);

  const value = useMemo(
    () => ({ ...state, navigate, clipRef, innerRef }),
    [state, navigate],
  );

  return <SectionNavContext.Provider value={value}>{children}</SectionNavContext.Provider>;
}

export function useSectionNav(): SectionNavValue {
  const ctx = useContext(SectionNavContext);
  if (!ctx) throw new Error('useSectionNav must be used inside SectionNavProvider');
  return ctx;
}
