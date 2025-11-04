import React, { useCallback, useMemo, useState } from 'react';
import Hero from './components/Hero.jsx';
import FlowerStudio from './components/FlowerStudio.jsx';
import PomodoroTimer from './components/PomodoroTimer.jsx';
import Garden, { pickRockSurfaceSpot } from './components/Garden.jsx';

export default function App() {
  const [sketches, setSketches] = useState([]);
  const [flowers, setFlowers] = useState([]);

  const addSketch = useCallback((url) => setSketches((s) => [url, ...s].slice(0, 12)), []);

  const plantFromSketch = useCallback((src) => {
    if (!src) return;
    const { position, normal } = pickRockSurfaceSpot(1.2, 0.02);
    setFlowers((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        src,
        position,
        normal,
        size: 0.42,
      },
    ]);
  }, []);

  const onFocusComplete = useCallback(() => {
    if (sketches.length > 0) plantFromSketch(sketches[0]);
  }, [sketches, plantFromSketch]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-emerald-100 to-emerald-200">
      <Hero />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Garden flowers={flowers} />
          </div>
          <div className="space-y-4 order-1 lg:order-2">
            <PomodoroTimer focusMinutes={0.1} breakMinutes={0.05} onFocusComplete={onFocusComplete} />
            <FlowerStudio onSave={addSketch} />
            <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-emerald-900/10 p-4">
              <div className="text-sm font-medium text-emerald-900 mb-2">Recent Sketches</div>
              <div className="grid grid-cols-4 gap-2">
                {sketches.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => plantFromSketch(s)}
                    className="aspect-square rounded-lg overflow-hidden border border-emerald-900/10 hover:ring-2 hover:ring-emerald-500"
                    title="Plant on rock"
                  >
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <img src={s} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-emerald-900/70 text-sm">
          Tip: Save a sketch, then click it to plant immediately, or let the timer do it for you at the end of a focus session.
        </div>
      </main>
    </div>
  );
}
