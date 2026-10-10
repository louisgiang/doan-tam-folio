import type { ComponentType, CSSProperties } from 'react';
import type { LegoCluster } from '../data/lego';
import legoCluster from '../data/lego-section.json';
import type { SectionId } from '../data/sections';
import { useSectionNav } from '../hooks/useSectionNav';
import { Awards } from '../sections/Awards';
import { Community } from '../sections/Community';
import { HomeIntro } from '../sections/HomeIntro';
import { Lego } from '../sections/Lego';
import { Myself } from '../sections/Myself';
import { FallingLego } from './FallingLego';
import styles from './SectionRegion.module.css';

const SECTIONS: Record<SectionId, ComponentType> = {
  myself: Myself,
  lego: Lego,
  community: Community,
  awards: Awards,
};

/**
 * Khoảng từ dưới dải menu tới đầu dòng tiêu đề, theo thiết kế (px ở khổ 1440).
 * Cụm lego giống nhau ở mọi phần; chỉ vị trí tiêu đề khác nhau.
 */
const TITLE_TOP: Record<SectionId | 'home', number> = {
  home: 639.5,
  myself: 730.7,
  lego: 730.7,
  community: 751,
  awards: 750.8,
};

/**
 * Cụm lego dùng chung (rơi liên tục) + một khối nội dung bên dưới:
 * lời chào HOME, hoặc phần đang mở. Đổi phần = khối nội dung thu lại rồi thả xuống.
 */
export function SectionRegion() {
  const { current, phase, clipRef, innerRef } = useSectionNav();
  const Section = current ? SECTIONS[current] : HomeIntro;
  const key = current ?? 'home';

  return (
    <main
      className={styles.region}
      style={{ '--title-top': TITLE_TOP[key] } as CSSProperties}
    >
      <FallingLego
        cluster={legoCluster as LegoCluster}
        avoidRef={innerRef}
        measureKey={`${key}:${phase}`}
        hideFlaggedAtStart={current === null}
        className={styles.lego}
      />
      <div className={styles.spacer} />
      <div ref={clipRef} className={styles.clip}>
        <div ref={innerRef} data-phase={phase}>
          <section id={`section-${key}`} aria-label={key}>
            <Section />
          </section>
        </div>
      </div>
    </main>
  );
}
