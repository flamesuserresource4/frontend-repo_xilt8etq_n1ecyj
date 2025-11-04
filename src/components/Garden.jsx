import React from 'react';

export default function Garden({ plants }) {
  return (
    <div className="w-full rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50 to-rose-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-rose-500">Garden</p>
          <h3 className="text-lg font-semibold text-rose-900">Watch your flowers bloom</h3>
        </div>
      </div>
      <div className="relative h-72 md:h-80 w-full overflow-hidden rounded-xl bg-white/60">
        <div className="absolute inset-0">
          {/* simple field lines */}
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffe4e6" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute inset-0">
          {plants.map((p) => (
            <img
              key={p.id}
              src={p.src}
              alt="flower"
              className="absolute transition-all duration-700 ease-out drop-shadow"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: `translate(-50%, -50%) rotate(${p.rotation}deg) scale(${p.scale})`,
                opacity: 1,
                width: `${p.size}px`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
