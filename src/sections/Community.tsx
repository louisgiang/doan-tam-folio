import { Placeholder } from './Placeholder';
import styles from './Placeholder.module.css';

export function Community() {
  return (
    <Placeholder label="COMMUNITY" bodyHeight={2341} titleSize={64}>
      FINANCE IN ACTION.
      <br />
      <span className={styles.green}>
        FUNDRAISING, CLEAR COMMUNICATION,
        <br />
        AND PRACTICAL WORK WITH A TEAM.
      </span>
    </Placeholder>
  );
}
