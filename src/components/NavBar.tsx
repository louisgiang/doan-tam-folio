import { useEffect, useState, type CSSProperties } from 'react';
import { NAV_ITEMS } from '../data/sections';
import { useSectionNav } from '../hooks/useSectionNav';
import styles from './NavBar.module.css';

export function NavBar() {
  const { current, navigate } = useSectionNav();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeId = current ?? 'home';

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <header id="site-nav" className={styles.nav}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={menuOpen}
        aria-controls="site-menu"
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span className="visually-hidden">Menu</span>
        <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
      </button>
      <nav aria-label="Main">
        <ul id="site-menu" className={styles.list} data-open={menuOpen}>
          {NAV_ITEMS.map((item) => {
            const active = item.id === activeId;
            return (
              <li key={item.id}>
                <a
                  href={item.id === 'home' ? '#' : `#${item.id}`}
                  className={styles.link}
                  style={{ '--item-color': item.color } as CSSProperties}
                  aria-current={active ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    navigate(item.id);
                  }}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
