import { NavBar } from './components/NavBar';
import { SectionRegion } from './components/SectionRegion';
import { SectionNavProvider } from './hooks/useSectionNav';
import styles from './App.module.css';

export function App() {
  return (
    <SectionNavProvider>
      <NavBar />
      <div className={styles.page}>
        <SectionRegion />
      </div>
    </SectionNavProvider>
  );
}
