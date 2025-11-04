import React, { useCallback, useMemo, useState } from 'react';
import Hero from './components/Hero';
import PomodoroTimer from './components/PomodoroTimer';
import FlowerStudio from './components/FlowerStudio';
import Garden from './components/Garden';

export default function App() {
  const [savedFlowers, setSavedFlowers] = useState([]); // array of data URLs
  const [plants, setPlants] = useState([]); // {id, src, x,y, rotation, scale, size}

  const saveFlower = useCallback((dataUrl) => {
    setSavedFlowers((prev) => [dataUrl, ...prev].slice(0, 12));
  }, []);

  const plantFlower = useCallback((dataUrl) => {
    const img = new Image();
    img.onload = () => {
      const aspect = img.width / img.height || 1;
      // random placement and size
      const size = Math.round(48 + Math.random() * 48) * (aspect > 1.2 ? 0.9 : 1);
      const newPlant = {
        id: crypto.randomUUID(),
        src: dataUrl,
        x: Math.round(10 + Math.random() * 80),
        y: Math.round(20 + Math.random() * 70),
        rotation: Math.round((Math.random() - 0.5) * 20),
        scale: 0.9 + Math.random() * 0.4,
        size,
      };
      setPlants((prev) => [...prev, newPlant].slice(-40));
    };
    img.src = dataUrl;
  }, []);

  const handleFocusComplete = useCallback(() => {
    // plant the most recent saved flower automatically on focus completion
    if (savedFlowers.length > 0) {
      plantFlower(savedFlowers[0]);
    }
  }, [savedFlowers, plantFlower]);

  const recentPalette = useMemo(() => savedFlowers.slice(0, 6), [savedFlowers]);

  return (
    <div className="min-h-screen bg-rose-50 text-rose-900 antialiased">
      <Hero />

      <main className="mx-auto max-w-6xl px-6 -mt-10 space-y-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PomodoroTimer onFocusComplete={handleFocusComplete} />
          <FlowerStudio onSaveFlower={saveFlower} onPlantFlower={plantFlower} />
        </div>

        {recentPalette.length > 0 && (
          <div className="rounded-2xl border border-rose-200 bg-white/80 backdrop-blur p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-rose-500">Your saved blooms</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {recentPalette.map((src, i) => (
                <button
                  key={i}
                  onClick={() => plantFlower(src)}
                  className="overflow-hidden rounded-xl border border-rose-200 hover:shadow transition">
                  <img src={src} alt={`saved flower ${i + 1}`} className="h-16 w-16 object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        <Garden plants={plants} />
      </main>

      <footer className="py-8 text-center text-sm text-rose-600">
        Made with calm, care, and a little bit of bloom.
      </footer>
    </div>
  );
}
