"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./Timer.module.css";

/** Durations (seconds) */
const WORK = 25 * 60;
const SHORT = 5 * 60;
const LONG = 30 * 60;

type Mode = "work" | "short" | "long";

/** Pretty mm:ss */
function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Timer() {
  const [mode, setMode] = useState<"work" | "short" | "long">("work");
  const [secondsLeft, setSecondsLeft] = useState<number>(WORK);
  const [running, setRunning] = useState<boolean>(false);
  const [workStreak, setWorkStreak] = useState<number>(0); // 0..3 then long break
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // keep interval tidy
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((t) => {
        if (t <= 1) {
          // auto-stop at 0
          clearInterval(intervalRef.current as NodeJS.Timeout);
          intervalRef.current = null;
          setRunning(false);

          // auto-save work session when it ends
          if (mode === "work") {
            const durationMin = Math.max(1, Math.round(WORK / 60));
            // fire & forget; ignore errors for now
            fetch("/api/sessions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ durationMin }),
            }).catch(() => {});
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running, mode]);

  /** Start/Pause/Reset current phase */
  function start() {
    if (secondsLeft === 0) return; // wait for user to click "Start next"
    setRunning(true);
  }
  function pause() {
    setRunning(false);
  }
  function resetPhase() {
    setRunning(false);
    setSecondsLeft(mode === "work" ? WORK : mode === "short" ? SHORT : LONG);
  }

  /** Decide and enter the next phase (user clicks when ready) */
  function startNextPhase() {
    if (mode === "work") {
      // finished a work session → increment streak
      const nextStreak = (workStreak + 1) % 4;
      const nextMode: Mode = nextStreak === 0 ? "long" : "short";
      setWorkStreak(nextStreak);
      setMode(nextMode);
      setSecondsLeft(nextMode === "long" ? LONG : SHORT);
      setRunning(true); // auto-start the break; change to false if you prefer manual start
    } else {
      // finished a break → back to work
      setMode("work");
      setSecondsLeft(WORK);
      setRunning(true); // auto-start work; set to false if you want manual start
    }
  }

  /** If user changes mode manually (optional helpers) */
  function setManual(m: Mode) {
    setRunning(false);
    setMode(m);
    setSecondsLeft(m === "work" ? WORK : m === "short" ? SHORT : LONG);
  }

  const atZero = secondsLeft === 0;
  const nextLabel =
    mode === "work"
      ? (workStreak + 1) % 4 === 0
        ? "Start Long Break (30:00)"
        : "Start Short Break (5:00)"
      : "Start Work (25:00)";

  const themeClass =
        mode === "work" ? styles.workTheme :
        mode === "short" ? styles.shortTheme :
        styles.longTheme;

  return (
    <div className={`${styles.wrapper} ${themeClass}`}>
      <div className={styles.badges}>
        <Badge>{mode === "work" ? "Focus" : mode === "short" ? "Short break" : "Long break"}</Badge>
        <Badge>Streak: {workStreak}/4</Badge>
      </div>

      <h2 className={styles.time}>{formatTime(secondsLeft)}</h2>

      <div className={styles.controls}>
        {!running ? (
          <button onClick={start} disabled={atZero} className={`${styles.btn}`}>
            Start
          </button>
        ) : (
          <button onClick={pause} className={`${styles.btn}`}>
            Pause
          </button>
        )}

        <button onClick={resetPhase} className={`${styles.btn} ${styles.secondary}`}>
          Reset
        </button>

        {/* This one changes color by theme */}
        <button
          onClick={startNextPhase}
          disabled={!atZero}
          className={`${styles.btn} ${styles.accent}`}
        >
          {nextLabel}
        </button>
      </div>

      <div className={styles.quick}>
        <button onClick={() => setManual("work")}  className={`${styles.btn} ${styles.ghost}`}>Work</button>
        <button onClick={() => setManual("short")} className={`${styles.btn} ${styles.ghost}`}>Short</button>
        <button onClick={() => setManual("long")}  className={`${styles.btn} ${styles.ghost}`}>Long</button>
      </div>
    </div>
  );
}

// keep your Badge component as-is
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 12,
        padding: "4px 8px",
        borderRadius: 999,
        background: "#222",
        border: "1px solid #333",
        color: "#ddd",
      }}
    >
      {children}
    </span>
  );
}