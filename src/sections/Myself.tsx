import { useRef, useState } from 'react';
import avatarUrl from '../assets/myself/avatar.webp';
import bigLegoUrl from '../assets/myself/big-lego.webp';
import { SwayLego } from '../components/SwayLego';
import type { LegoCluster } from '../data/lego';
import legoFooter from '../data/lego-footer.json';
import legoBlue from '../data/lego-myself-blue.json';
import type { SectionId } from '../data/sections';
import { useSectionNav } from '../hooks/useSectionNav';
import styles from './Myself.module.css';

// Chữ chép nguyên văn từ design-ref (xem content/myself.md).
const SIDES: { id: SectionId; title: string; text: string }[] = [
  { id: 'myself', title: 'MYSELF', text: 'The person behind the projects.' },
  { id: 'lego', title: 'LEGO', text: 'What I enjoy building in my own time.' },
  { id: 'community', title: 'COMMUNITY', text: 'The teams and causes I contribute to.' },
  { id: 'awards', title: 'AWARDS', text: 'Research, recognition, and learning along the way.' },
];

export function Myself() {
  const { navigate } = useSectionNav();
  const [showPhoto, setShowPhoto] = useState(false);
  // Loại con trỏ của lần nhấn gần nhất (click bằng chuột thì bỏ qua vì đã đổi theo hover).
  const lastPointer = useRef('');

  return (
    <div className={styles.myself}>
      <div className={styles.about}>
        <h2 className={`display ${styles.title}`} data-lego-avoid>
          A LITTLE <span className={styles.blue}>ABOUT ME</span>
        </h2>

        <div className={styles.intro}>
          <p>
            <strong>Hi, I&apos;m Tam!</strong>
            <br />
            I&apos;m an energetic student who loves LEGO, meeting new people, and exploring
            finance. I&apos;m curious about how money and businesses work, and I enjoy turning
            ideas into something real—whether that means building a model or working with a
            team on a community project.
          </p>
          <p className={styles.facts}>
            Energetic · Curious · LEGO lover · Finance enthusiast
            <br />
            Foreign Language Specialized School
            <br />
            Specialized in English
          </p>
          <p className={styles.school}>
            September 2024–May 2027
            <br />
            <strong>
              GPA<span className={styles.gap1} />9.5/10<span className={styles.gap2} />|
              <span className={styles.gap2} />SAT<span className={styles.gap1} />1510
            </strong>
          </p>
        </div>

        {/* Khối lego xanh lớn ↔ ảnh chân dung (phóng-mờ 400ms). */}
        <button
          type="button"
          className={styles.flip}
          data-flipped={showPhoto}
          aria-pressed={showPhoto}
          aria-label={showPhoto ? 'Show the LEGO brick' : 'Show a photo of Tam'}
          // Chuột: rê vào hiện ảnh, rời ra hiện lại lego. Cảm ứng/bàn phím: bấm để đổi.
          onPointerEnter={(e) => e.pointerType === 'mouse' && setShowPhoto(true)}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setShowPhoto(false)}
          onPointerDown={(e) => (lastPointer.current = e.pointerType)}
          onClick={() => {
            const fromMouse = lastPointer.current === 'mouse';
            lastPointer.current = '';
            if (!fromMouse) setShowPhoto((v) => !v);
          }}
        >
          <img className={styles.brick} src={bigLegoUrl} alt="" draggable={false} />
          <img className={styles.photo} src={avatarUrl} alt="Portrait of Tam" draggable={false} />
        </button>
      </div>

      <div className={styles.sides}>
        <SwayLego cluster={legoBlue as LegoCluster} />
        {/* Cụm lego đáy dùng chung; ở MYSELF khung lệch (−11, 542) so với mép trên khối xanh. */}
        <SwayLego
          cluster={legoFooter as LegoCluster}
          offsetX={-11}
          offsetY={542}
          className={styles.footerLego}
        />
        <h3 className={`display ${styles.sidesTitle}`}>
          MEET FOUR SIDES
          <br />
          OF ME
        </h3>
        <ul className={styles.sideList}>
          {SIDES.map((side) => (
            <li key={side.id}>
              <a
                href={`#${side.id}`}
                className={styles.side}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(side.id);
                }}
              >
                <span className={`display ${styles.sideTitle}`}>{side.title}</span>
                <span className={styles.sideText}>{side.text}</span>
                <span className={styles.arrow} aria-hidden="true">
                  <svg viewBox="0 0 8 14" preserveAspectRatio="xMaxYMid meet">
                    <path d="M0.5 0.5 7 7 0.5 13.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
