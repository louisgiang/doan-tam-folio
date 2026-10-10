import { Placeholder } from './Placeholder';
import styles from './Placeholder.module.css';

export function Lego() {
  return (
    <Placeholder label="LEGO" clusterHeight={731} bodyHeight={1301} titleSize={97.8}>
      SMALL BRICKS.
      <br />
      <span className={styles.pink}>BIG POSSIBILITIES.</span>
    </Placeholder>
  );
}
