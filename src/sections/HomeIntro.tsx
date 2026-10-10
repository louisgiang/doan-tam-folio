import styles from './HomeIntro.module.css';

/** Lời chào HOME: nội dung mặc định dưới cụm lego. */
export function HomeIntro() {
  return (
    <div className={styles.intro}>
      <h1 className={`display ${styles.title}`} data-lego-avoid>
        HI, <span className={styles.tam}>I&apos;M TAM.</span>
        <br />
        WELCOME TO <span className={styles.world}>MY WORLD.</span>
      </h1>
      <p className={styles.desc}>
        LEGO builds, a curiosity about finance, and projects that bring people together.
        <br />
        These are a few pieces of my story.
      </p>
    </div>
  );
}
