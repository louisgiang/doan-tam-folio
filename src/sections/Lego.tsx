import f1Url from '../assets/lego-page/f1.webp';
import { SwayLego } from '../components/SwayLego';
import { VideoSlot } from '../components/VideoSlot';
import type { LegoCluster } from '../data/lego';
import legoFooter from '../data/lego-footer.json';
import { LEGO_VIDEOS } from '../data/videos';
import styles from './Lego.module.css';

// Chữ chép nguyên văn từ design-ref (xem content/lego.md).
export function Lego() {
  return (
    <div className={styles.lego}>
      {/* Cụm lego đáy dùng chung; ở LEGO khung lệch (2, 843.3), một phần nằm sau video. */}
      <SwayLego cluster={legoFooter as LegoCluster} offsetX={2} offsetY={843.3} />

      <h2 className={`display ${styles.title}`} data-lego-avoid>
        SMALL BRICKS.
        <br />
        <span className={styles.pink}>BIG POSSIBILITIES.</span>
      </h2>

      <figure className={styles.f1}>
        <img src={f1Url} alt="LEGO model of the Mercedes-AMG PETRONAS F1 car" />
        <figcaption>Mercedes-AMG PETRONAS F1 model.</figcaption>
      </figure>

      <div className={styles.text}>
        <p className={styles.lead}>What keeps me building?</p>
        <p>
          My LEGO corner is where I enjoy a different kind of problem-solving. This F1 model
          brings together the details I like: the bodywork, wheels, wings, and small connections
          behind the finished build.
        </p>
        <p>One piece at a time.</p>
        <p>
          Building gives me practice slowing down, following a sequence, and paying attention to
          how each part fits. It reminds me that a complicated task becomes more manageable when I
          work through it step by step.
        </p>
        <p className={styles.traits}>Patience · Attention to detail · Step-by-step thinking</p>
      </div>

      <div className={styles.videos}>
        {LEGO_VIDEOS.map((v) => (
          <VideoSlot key={v.id} video={v} className={styles.video} />
        ))}
      </div>
    </div>
  );
}
