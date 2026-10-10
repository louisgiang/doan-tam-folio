import ariaUrl from '../assets/community/aria-project-a-concert-with-a-purpose.webp';
import greenUrl from '../assets/community/green-school-club.webp';
import lotusUrl from '../assets/community/lotusmed-2025.webp';
import { Slider } from '../components/Slider';
import styles from './Community.module.css';

// Ảnh slider ECOWANDER: mọi file "ecowander…" trong thư mục, theo thứ tự tên → số chấm tự khớp.
const ecoFiles = import.meta.glob<string>('../assets/community/ecowander-*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});
const ECO_IMAGES = Object.keys(ecoFiles)
  .sort()
  .map((k, i) => ({ src: ecoFiles[k], alt: `EcoWander project photo ${i + 1}` }));

// Chữ chép nguyên văn từ design-ref (xem content/community.md).
export function Community() {
  return (
    <div className={styles.community}>
      <h2 className={`display ${styles.title}`} data-lego-avoid>
        FINANCE IN ACTION.
        <br />
        <span className={styles.green}>
          FUNDRAISING, CLEAR COMMUNICATION,
          <br />
          AND PRACTICAL WORK WITH A TEAM.
        </span>
      </h2>

      <div className={styles.mint}>
        <article className={`${styles.card} ${styles.aria}`}>
          <img className={styles.photo} src={ariaUrl} alt="ARIA Project concert" loading="lazy" />
          <h3 className={`display ${styles.head} ${styles.headLight}`}>
            ARIA PROJECT
            <br />A CONCERT WITH A PURPOSE.
          </h3>
          <div className={styles.body}>
            <p className={styles.meta}>{'HEAD OF FINANCE  |  APRIL–SEPTEMBER 2025'}</p>
            <p className={styles.meta}>{'Nearly 200 attendees  ·  VND 60 million raised by the team'}</p>
            <p>
              I co-organized “Thanh Sac Viet — A Symphony of Five Continents,” a free concert at
              Hanoi College of Art. Our team donated the funds raised to the Cerebral Palsy Family
              Association Vietnam’s “Superhero Family Shelter,” supporting accommodation for
              families during their children’s treatment in Hanoi.
            </p>
            <p>
              <strong>
                Beyond the fundraising total, I gained experience connecting event planning with a
                specific community need. Working alongside the team strengthened my coordination
                and financial responsibility.
              </strong>
            </p>
          </div>
        </article>

        <article className={`${styles.card} ${styles.lotus}`}>
          <img className={styles.photo} src={lotusUrl} alt="LotusMed 2025 team" loading="lazy" />
          <h3 className={`display ${styles.head} ${styles.headLight}`}>LOTUSMED 2025</h3>
          <div className={styles.body}>
            <p className={styles.meta}>{'FINANCE TEAM  |  JANUARY–AUGUST 2025'}</p>
            <p className={styles.meta}>{'Nearly 200 attendees  ·  VND 60 million raised by the team'}</p>
            <p>
              With TTH Vinh General Hospital and the LotusMed team, I helped coordinate health
              screenings for 50 girls from SOS Children’s Village Vinh. I monitored the
              fundraising budget as our team raised approximately US$2,000 for food and
              nutritional support.
            </p>
            <p>
              <strong>The practical lesson:</strong> Tracking resources against program needs gave
              me experience with budget oversight. Coordinating with the hospital and project team
              strengthened my planning and communication.
            </p>
          </div>
        </article>
      </div>

      <div className={styles.afterMint}>
      <article className={`${styles.card} ${styles.greenClub}`}>
        <img className={styles.photo2} src={greenUrl} alt="Green School Club members" loading="lazy" />
        <h3 className={`display ${styles.head}`}>GREEN SCHOOL CLUB</h3>
        <div className={`${styles.body} ${styles.italic}`}>
          <p className={styles.meta}>FINANCE MEMBER</p>
          <p>
            Sponsor outreach meant explaining why a partnership mattered, not simply asking for
            support. I contacted potential sponsors, communicated partnership benefits, and helped
            coordinate recognition and follow-up. The experience gave me practice presenting a
            proposal clearly and maintaining relationships beyond the first conversation.
          </p>
        </div>
      </article>

      <article className={`${styles.card} ${styles.eco}`}>
        <Slider images={ECO_IMAGES} label="EcoWander photos" className={styles.photo2} />
        <h3 className={`display ${styles.head}`}>
          ECOWANDER
          <br />
          ONE PROJECT, TWO WAYS TO ACT.
        </h3>
        <div className={`${styles.body} ${styles.italic}`}>
          <p className={styles.meta}>{'CO-ORGANIZER  |  MARCH 2025–JULY 2026'}</p>
          <p className={styles.tight}>
            <strong>In the field:</strong> Our project team planted 8,000 acacia seedlings across
            two hectares in Bac Kan.
            <br />
            <strong>Through creativity:</strong> I helped organize a recycled-glass workshop and
            the “Vietnam: A Tapestry of Colors” exhibition.
            <br />
            Moving between field activities and creative workshops gave me practice adapting to
            different team tasks and turning an environmental idea into practical, shared work.
          </p>
        </div>
      </article>

      <article className={`${styles.card} ${styles.daily}`}>
        <h3 className={`display ${styles.head}`}>
          DAILYECONS
          <br />
          MAKING ECONOMICS ACCESSIBLE.
        </h3>
        <div className={`${styles.body} ${styles.italic}`}>
          <p className={styles.meta}>{'AUTHOR  |  SINCE SEPTEMBER 2025'}</p>
          <p>
            Through articles and educational website content, I explore economics and everyday
            financial issues for students and a wider audience. Writing for non-specialist readers
            gives me practice organizing ideas, choosing accessible language, and connecting
            economic topics with familiar questions.
          </p>
        </div>
      </article>
      </div>
    </div>
  );
}
