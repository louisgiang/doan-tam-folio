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
 * Cơ chế mở/thu từng phần (BRIEF mục 4):
 * - chỉ một phần mở tại một thời điểm; phần cũ thu lại rồi phần mới thả xuống;
 * - cuộn mượt tới đầu vùng nội dung (hoặc về đầu trang khi bấm HOME);
 * - đồng bộ với #hash trên thanh địa chỉ và nút Back của trình duyệt.
 */

export type Phase = 'opening' | 'open' | 'closing';

const EXPAND_MS = 650;
const COLLAPSE_MS = 400;
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_IN = 'cubic-bezier(0.55, 0, 0.75, 0.2)';

interface NavState {
  current: SectionId | null;
  phase: Phase | null;
}

interface SectionNavValue extends NavState {
  navigate: (id: SectionId | 'home') => void;
  regionRef: RefObject<HTMLDivElement>;
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
  const [state, setState] = useState<NavState>({ current: null, phase: null });
  const regionRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const currentRef = useRef<SectionId | null>(null);
  const targetRef = useRef<SectionId | null>(null);
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

  /** Chạy lần lượt: thu phần đang mở (nếu có) rồi thả phần đích xuống. */
  const sequence = useCallback(async () => {
    try {
      while (currentRef.current !== targetRef.current) {
        if (currentRef.current !== null) {
          flushSync(() => setState((s) => ({ ...s, phase: 'closing' })));
          await collapse();
          currentRef.current = null;
          flushSync(() => setState({ current: null, phase: null }));
          clipRef.current?.getAnimations().forEach((a) => a.cancel());
          innerRef.current?.getAnimations().forEach((a) => a.cancel());
        } else {
          const next = targetRef.current;
          currentRef.current = next;
          flushSync(() => setState({ current: next, phase: 'opening' }));
          await expand();
          if (currentRef.current === targetRef.current) {
            setState({ current: next, phase: 'open' });
          }
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

  const regionTop = useCallback(() => {
    const region = regionRef.current;
    const navH = document.getElementById('site-nav')?.offsetHeight ?? 0;
    if (!region) return 0;
    return region.getBoundingClientRect().top + window.scrollY - navH;
  }, []);

  const go = useCallback(
    (next: SectionId | null) => {
      targetRef.current = next;
      stopScrollRef.current();
      const target = next === null ? () => 0 : regionTop;
      if (skipMotion()) {
        // Không animation: đổi phần xong rồi nhảy thẳng tới đích.
        void run().then(() => window.scrollTo(0, target()));
        return;
      }
      stopScrollRef.current = followScroll(target, () => runningRef.current);
      void run();
    },
    [regionTop, run],
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
    const initial = hashToTarget(window.location.hash);
    if (initial) go(initial);
    const onPop = () => go(hashToTarget(window.location.hash));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [go]);

  const value = useMemo(
    () => ({ ...state, navigate, regionRef, clipRef, innerRef }),
    [state, navigate],
  );

  return <SectionNavContext.Provider value={value}>{children}</SectionNavContext.Provider>;
}

export function useSectionNav(): SectionNavValue {
  const ctx = useContext(SectionNavContext);
  if (!ctx) throw new Error('useSectionNav must be used inside SectionNavProvider');
  return ctx;
}
