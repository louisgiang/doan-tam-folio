import { Placeholder } from './Placeholder';
import styles from './Placeholder.module.css';

export function Awards() {
  return (
    <Placeholder label="AWARDS" clusterHeight={751} bodyHeight={3842} titleSize={52} gutter={62}>
      BEYOND THE MEDAL.
      <br />
      <span className={styles.green}>
        THE QUESTIONS, CONTRIBUTIONS,
        <br />
        AND EXPERIENCES BEHIND MY RESEARCH AWARDS.
      </span>
    </Placeholder>
  );
}
