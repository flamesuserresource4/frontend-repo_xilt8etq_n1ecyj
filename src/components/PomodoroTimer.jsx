import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

export default function PomodoroTimer({ onFocusComplete }) {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  // Update seconds when duration changes while idle
  useEffect(() => {
    if (!running && mode === 'focus') setSecondsLeft(focusMinutes * 60);
  }, [focusMinutes, running, mode]);
  useEffect(() => {
    if (!running && mode === 'break') setSecondsLeft(breakMinutes * 60);
  }, [breakMinutes, running, mode]);

  const percent = useMemo(() => {
    const total = (mode === 'focus' ? focusMinutes : breakMinutes) * 60;
    return 100 - Math.round((secondsLeft / total) * 100);
  }, [secondsLeft, focusMinutes, breakMinutes, mode]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (secondsLeft >= 0) return;
    // Time's up
    clearInterval(intervalRef.current);
    setRunning(false);

    if (mode === 'focus') {
      try {
        onFocusComplete && onFocusComplete();
      } catch {}
      setMode('break');
      setSecondsLeft(breakMinutes * 60);
    } else {
      setMode('focus');
      setSecondsLeft(focusMinutes * 60);
    }
  }, [secondsLeft, mode, focusMinutes, breakMinutes, onFocusComplete]);

  const toggle = () => setRunning((r) => !r);
  const reset = () => {
    setRunning(false);
    setMode('focus');
    setSecondsLeft(focusMinutes * 60);
  };

  return (
    <div className="w-full rounded-2xl border border-rose-200 bg-white/80 backdrop-blur p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-rose-500">Pomodoro</p>
          <h3 className="text-lg font-semibold text-rose-900">
            {mode === 'focus' ? 'Focus' : 'Break'} time
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 text-white px-4 py-2 text-sm font-medium hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            {running ? (
              <><Pause className="h-4 w-4" /> Pause</>
            ) : (
              <><Play className="h-4 w-4" /> Start</>
            )}
          </button>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-rose-100 text-rose-700 px-3 py-2 text-sm font-medium hover:bg-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>

      <div className="relative mx-auto my-6 grid place-items-center">
        <div className="relative h-40 w-40 rounded-full bg-rose-50 grid place-items-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" stroke="#ffe4e6" strokeWidth="8" fill="none" />
            <circle
              cx="50"
              cy="50"
              r="46"
              stroke="#fb7185"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${Math.PI * 2 * 46}`}
              strokeDashoffset={`${((100 - percent) / 100) * Math.PI * 2 * 46}`}
            />
          </svg>
          <div className="text-3xl font-bold text-rose-900">{formatTime(Math.max(0, secondsLeft))}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-xs text-rose-600 mb-1">Focus (min)</label>
          <input
            type="range"
            min="10"
            max="60"
            step="5"
            value={focusMinutes}
            onChange={(e) => setFocusMinutes(parseInt(e.target.value))}
            className="w-full accent-rose-600"
          />
          <div className="text-sm text-rose-900">{focusMinutes} min</div>
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-rose-600 mb-1">Break (min)</label>
          <input
            type="range"
            min="3"
            max="20"
            step="1"
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(parseInt(e.target.value))}
            className="w-full accent-rose-600"
          />
          <div className="text-sm text-rose-900">{breakMinutes} min</div>
        </div>
      </div>
    </div>
  );
}
