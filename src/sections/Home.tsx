import { useRef } from 'react';
import { FallingLego } from '../components/FallingLego';
import type { LegoCluster } from '../data/lego';
import legoHome from '../data/lego-home.json';
import styles from './Home.module.css';

export function Home() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  return (
    <section className={styles.home} aria-label="Home">
      <FallingLego
        cluster={legoHome as LegoCluster}
        active
        avoidRef={titleRef}
        className={styles.lego}
      />
      <h1 ref={titleRef} className={`display ${styles.title}`}>
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
