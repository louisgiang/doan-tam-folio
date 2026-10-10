import type { ComponentType } from 'react';
import type { SectionId } from '../data/sections';
import { useSectionNav } from '../hooks/useSectionNav';
import { Awards } from '../sections/Awards';
import { Community } from '../sections/Community';
import { Lego } from '../sections/Lego';
import { Myself } from '../sections/Myself';
import styles from './SectionRegion.module.css';

const SECTIONS: Record<SectionId, ComponentType> = {
  myself: Myself,
  lego: Lego,
  community: Community,
  awards: Awards,
};

/** Vùng nội dung bên dưới HOME, nơi các phần được thả xuống. */
export function SectionRegion() {
  const { current, phase, regionRef, clipRef, innerRef } = useSectionNav();
  const Section = current ? SECTIONS[current] : null;

  return (
    <main ref={regionRef} className={styles.region}>
      <div ref={clipRef} className={styles.clip}>
        <div ref={innerRef} data-phase={phase ?? undefined}>
          {Section && current && (
            <section id={`section-${current}`} aria-label={current}>
              <Section />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
