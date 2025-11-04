import React from 'react';
import Spline from '@splinetool/react-spline';

export default function Hero() {
  return (
    <section className="relative h-[42vh] w-full overflow-hidden rounded-b-3xl bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-700">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/9m5zqXq7O1b0D5Qe/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight">
            Focus, Sketch, and Grow a Tiny 3D Garden
          </h1>
          <p className="mt-3 text-emerald-100/80 max-w-2xl mx-auto">
            Finish a focus session and watch your sketch bloom on a floating rock fully carpeted with soft grass.
          </p>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-900/50 via-transparent to-transparent" />
    </section>
  );
}
