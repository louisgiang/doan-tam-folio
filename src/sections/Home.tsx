import styles from './Home.module.css';

export function Home() {
  return (
    <section className={styles.home} aria-label="Home">
      <div className={styles.cluster}>Cụm lego HOME (bước 3)</div>
      <h1 className={`display ${styles.title}`}>
        HI, <span className={styles.tam}>I&apos;M TAM.</span>
        <br />
        WELCOME TO <span className={styles.world}>MY WORLD.</span>
      </h1>
      <p className={styles.desc}>
        LEGO builds, a curiosity about finance, and projects that bring people together.
        <br />
        These are a few pieces of my story.
      </p>
    </section>
  );
}
