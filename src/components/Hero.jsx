import React from 'react';
import Spline from '@splinetool/react-spline';

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-rose-50">
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-6 flex flex-col items-center text-center">
        <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-rose-600 text-sm font-medium mb-4">
          Focus & Flourish
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-rose-900">
          Grow your focus into a blooming garden
        </h1>
        <p className="mt-4 max-w-2xl text-rose-700">
          Set a Pomodoro, sketch a flower, and watch your creations blossom in your serene garden each time you complete a focus session.
        </p>
      </div>
      <div className="relative h-[360px] md:h-[460px] w-full">
        <Spline
          scene="https://prod.spline.design/Tu-wEVxfDuICpwJI/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-rose-50 via-rose-50/40 to-transparent" />
      </div>
    </section>
  );
}
