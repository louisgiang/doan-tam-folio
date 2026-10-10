import { Placeholder } from './Placeholder';
import styles from './Placeholder.module.css';

export function Myself() {
  return (
    <Placeholder label="MYSELF" clusterHeight={731} bodyHeight={1863} titleSize={97.8}>
      A LITTLE <span className={styles.blue}>ABOUT ME</span>
    </Placeholder>
  );
}
