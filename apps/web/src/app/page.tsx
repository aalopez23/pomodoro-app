import Timer from "./Timer";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.page}>
      <section className={styles.main}>
        <h1 className={styles.title}>⏱️ Pomodoro App — Sprint 1</h1>
        <p className={styles.subtitle}>
          Focus for 25 minutes, then take a 5-minute break. After 4 cycles, enjoy a 30-minute long break.
        </p>

        <div className={`${styles.timerWrapper}`}>
          <Timer />
        </div>
        
      </section>
    </main>
  );
}
