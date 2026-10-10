import honor2026 from '../assets/awards/2026-honor-award.webp';
import creativity2025 from '../assets/awards/2025-creativity-and-innovation-award.webp';
import scholarship2025 from '../assets/awards/2025-full-ride-scholarship.webp';
import national2025 from '../assets/awards/2025-national-honor-award.webp';
import aigcUrl from '../assets/awards/gold-award-aigc-2025.webp';
import icanUrl from '../assets/awards/gold-medal-ican-2025.webp';
import icpcUrl from '../assets/awards/gold-award-icpc-2026.webp';
import { SwayLego } from '../components/SwayLego';
import type { LegoCluster } from '../data/lego';
import legoFooter from '../data/lego-footer.json';
import styles from './Awards.module.css';

const HONORS = [
  { year: '2026', img: honor2026, title: 'Honor Award', text: 'Cambridge Economics and Finance Competition' },
  { year: '2025', img: national2025, title: 'National Honor Award', text: 'International Economics Olympiad' },
  {
    year: '2025',
    img: creativity2025,
    title: 'Creativity and Innovation Award',
    text: 'ISAGE Global — Vietnam National Round',
  },
  { year: '2025', img: scholarship2025, title: 'Full-ride Scholarship', text: 'LEAP Week Summer Program' },
];

// Chữ chép nguyên văn từ design-ref (xem content/awards.md).
export function Awards() {
  return (
    <div className={styles.awards}>
      <h2 className={`display ${styles.title}`} data-lego-avoid>
        BEYOND THE MEDAL.
        <br />
        <span className={styles.green}>
          THE QUESTIONS, CONTRIBUTIONS,
          <br />
          AND EXPERIENCES BEHIND MY RESEARCH AWARDS.
        </span>
      </h2>

      {/* ---------- Hai giải vàng ---------- */}
      <article className={`${styles.award} ${styles.ican}`}>
        <h3 className={`display ${styles.awardHead}`}>{'GOLD MEDAL  /  ICAN 2025'}</h3>
        <p className={styles.tagline}>Following the story in the data.</p>
        <p className={styles.org}>International Invention Innovation Competition in Canada</p>
        <div className={styles.icanFrame}>
          <img src={icanUrl} alt="ICAN 2025 gold medal certificate" loading="lazy" />
        </div>
        <div className={styles.awardBody}>
          <p className={styles.strong}>
            The Relationship Between Past and Current Inflation in Vietnam: A View from
            Quantitative Analysis
          </p>
          <p>How is current inflation in Vietnam related to its past?</p>
          <p>
            As part of a student team supervised by Dr. Nguyen Thi Van Anh, I co-authored a
            quantitative study using CPI data from 2012–2024. My contribution included literature
            review, data processing, and helping develop recommendations for monetary–fiscal
            coordination.
          </p>
          <p>
            From analysis to explanation: Working with the data strengthened my analytical skills.
            Presenting the research gave me practice explaining findings clearly and connecting an
            economic question with practical recommendations.
          </p>
        </div>
      </article>

      <article className={`${styles.award} ${styles.icpc}`}>
        <h3 className={`display ${styles.awardHead}`}>{'GOLD AWARD  /  ICPC 2026'}</h3>
        <p className={styles.tagline}>A wider view of economic growth.</p>
        <p className={styles.org}>International Creative Papers Conference &amp; Olympic</p>
        <img className={styles.icpcImg} src={icpcUrl} alt="ICPC 2026 gold award certificate" loading="lazy" />
        <div className={styles.awardBody}>
          <p className={styles.strong}>Green Economy and Vietnam’s Economic Growth</p>
          <p>
            Our team examined economic growth and environmental pressures through Vietnam’s real
            GDP and carbon-emissions data from 1995–2024. I co-authored the study and took part in
            presenting it through a research poster and presentation.
          </p>
          <p>
            The study’s approach: An Environmental Kuznets Curve framework and a quadratic model
            estimated in EViews.
          </p>
          <p>
            Preparing the presentation gave me practice selecting the question, method, and
            findings an audience needs most. The project also connected my interest in economic
            growth with environmental questions.
          </p>
        </div>
      </article>

      {/* ---------- Khối xanh: INNOVATION AND RECOGNITION ---------- */}
      <section className={styles.blue}>
        <h3 className={`display ${styles.blueHead}`}>INNOVATION AND RECOGNITION.</h3>
        <p className={`display ${styles.blueSub}`}>{'GOLD AWARD  /  AIGC 2025'}</p>
        <p className={styles.blueIntro}>
          <strong>Keeping a research team moving.</strong>
          <br />
          Advanced Innovation Global Competition
        </p>
        <img className={styles.aigcImg} src={aigcUrl} alt="AIGC 2025 gold award certificate and medals" loading="lazy" />
        <div className={styles.blueBody}>
          <p className={styles.strong}>
            Trends of applying ChatGPT in learning and research of Vietnamese students
          </p>
          <p>
            The topic focused on students’ use of ChatGPT, while my responsibilities centered on
            the work that kept the research organized. Under Dr. Nguyen Thi Van Anh’s supervision,
            I helped manage schedules, communicate with participants, and support the student
            research team.
          </p>
          <p className={styles.strong}>
            MY CONTRIBUTION
            <br />
            {'Project organization  ·  Scheduling  ·  Participant communication'}
          </p>
          <p>
            This experience showed me the importance of consistent coordination alongside the
            research itself. It strengthened my ability to organize tasks and communicate within a
            team, while broadening my interest in students’ use of technology.
          </p>
        </div>
      </section>

      {/* ---------- OTHER HONORS & A SCHOLARSHIP ---------- */}
      <h3 className={`display ${styles.honorsHead}`}>OTHER HONORS &amp; A SCHOLARSHIP</h3>
      <p className={styles.honorsSub}>ECONOMICS &amp; FINANCE</p>
      <ul className={styles.honors}>
        {HONORS.map((h, i) => (
          <li key={h.title} className={styles[`honor${i + 1}`]}>
            <img className={styles.honorImg} src={h.img} alt={`${h.title} certificate`} loading="lazy" />
            <span className={styles.honorBar} />
            <span className={`display ${styles.year}`}>{h.year}</span>
            <div className={styles.honorBox}>
              <p className={styles.strong}>{h.title}</p>
              <p>{h.text}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* ---------- Khối hồng: ADDITIONAL STUDIES ---------- */}
      <section className={styles.pinkBlock}>
        {/* Cụm lego đáy dùng chung; ở AWARDS khung lệch (0, 462) so với mép trên khối hồng. */}
        <SwayLego cluster={legoFooter as LegoCluster} offsetX={0} offsetY={462} />
        <h3 className={`display ${styles.addlHead}`}>ADDITIONAL STUDIES</h3>
        <div className={`${styles.study} ${styles.studyLeft}`}>
          <p className={styles.strongUp}>
            {'CO-AUTHOR  |  MAR–SEP 2025'}
            <br />
            Project:{' '}
            <span className={styles.underline}>
              Factors influencing consumers’ purchase decisions for official fashion: A case study
              in Hanoi
            </span>
            <br />
            Supervisors: Assoc. Prof. Hoang Thanh Tung and Dr. Nguyen Thi Van Anh
            <br />
            What shapes consumers’ fashion-purchasing decisions in Hanoi?
          </p>
          <p>
            I co-designed and analyzed a survey of 275 consumers using SmartPLS (PLS-SEM),
            assessing the survey measures and the relationships among purchase drivers. The study
            identified perceived behavioral control and subjective norms as its strongest
            predictors.
          </p>
        </div>
        <span className={styles.divider} />
        <div className={`${styles.study} ${styles.studyRight}`}>
          <p className={styles.strongUp}>
            {'CO-AUTHOR  |  DEC 2024 - AUG 2025'}
            <br />
            Project:{' '}
            <span className={styles.underline}>
              {
                'The impact of environment, social and governance (ESG) factors on firm financial performance of companies ranked  in the corporate sustainbility index (CSI)'
              }
            </span>
            <br />
            Supervisor: Dr. Dinh The Hung, National Economics University
          </p>
          <p>
            I co-authored research examining ESG factors and financial performance among companies
            ranked in the Corporate Sustainability Index. The topic brought my interest in finance
            into a study of corporate sustainability. Exploring this subject encouraged me to
            consider sustainability alongside financial performance. It broadened the questions I
            bring to studying companies without treating either perspective in isolation.
          </p>
        </div>
      </section>
    </div>
  );
}
