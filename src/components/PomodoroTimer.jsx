import React, { useEffect, useMemo, useRef, useState } from 'react';

function format(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60).toString().padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function PomodoroTimer({ focusMinutes = 1, breakMinutes = 0.2, onFocusComplete }) {
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  const [endAt, setEndAt] = useState(() => Date.now() + focusMinutes * 60 * 1000);
  const [, force] = useState(0);
  const raf = useRef(null);

  const totalMs = useMemo(() => (mode === 'focus' ? focusMinutes : breakMinutes) * 60 * 1000, [mode, focusMinutes, breakMinutes]);

  useEffect(() => {
    const tick = () => {
      force((x) => x + 1);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const remaining = Math.max(0, endAt - Date.now());
  const progress = 1 - remaining / totalMs;

  useEffect(() => {
    if (remaining <= 0) {
      if (mode === 'focus') {
        onFocusComplete?.();
        setMode('break');
        setEndAt(Date.now() + breakMinutes * 60 * 1000);
      } else {
        setMode('focus');
        setEndAt(Date.now() + focusMinutes * 60 * 1000);
      }
    }
  }, [remaining, mode, focusMinutes, breakMinutes, onFocusComplete]);

  const circumference = 2 * Math.PI * 42;
  const dash = circumference * progress;

  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-emerald-900/10 p-4 flex items-center gap-4">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-24 h-24">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#10b981"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-emerald-900">
          {mode === 'focus' ? 'Focus' : 'Break'}
        </div>
      </div>
      <div className="flex-1">
        <div className="text-3xl font-semibold text-emerald-900">{format(remaining)}</div>
        <div className="text-sm text-emerald-700/80">Stay with it — your garden is growing.</div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            setMode('focus');
            setEndAt(Date.now() + focusMinutes * 60 * 1000);
          }}
          className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
