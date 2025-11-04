import React, { useEffect, useRef, useState } from 'react';

export default function FlowerStudio({ onSave }) {
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#ef4444');
  const [size, setSize] = useState(8);

  useEffect(() => {
    const canvas = canvasRef.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    // soft paper background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#fff8f1');
    grad.addColorStop(1, '#ffe4e6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let last = null;

    const start = (x, y) => {
      drawing = true;
      last = { x, y };
    };
    const move = (x, y) => {
      if (!drawing || !last) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      last = { x, y };
    };
    const end = () => (drawing = false);

    const onMouseDown = (e) => start(e.offsetX, e.offsetY);
    const onMouseMove = (e) => move(e.offsetX, e.offsetY);
    const onMouseUp = end;

    const onTouchStart = (e) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      start(t.clientX - rect.left, t.clientY - rect.top);
    };
    const onTouchMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      move(t.clientX - rect.left, t.clientY - rect.top);
    };
    const onTouchEnd = end;

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [color, size]);

  const save = () => {
    const url = canvasRef.current.toDataURL('image/png');
    onSave?.(url);
  };

  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-emerald-900/10 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-9 rounded overflow-hidden" />
          <input type="range" min={2} max={24} value={size} onChange={(e) => setSize(Number(e.target.value))} />
          <span className="text-sm text-emerald-900">Brush: {size}px</span>
        </div>
        <button onClick={save} className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Save Sketch</button>
      </div>
      <div className="w-full h-64 rounded-xl overflow-hidden border border-emerald-900/10 bg-white">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}
