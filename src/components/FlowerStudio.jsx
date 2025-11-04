import React, { useEffect, useRef, useState } from 'react';
import { Brush, Eraser, Sparkles, Trash2, Save } from 'lucide-react';

export default function FlowerStudio({ onSaveFlower, onPlantFlower }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(6);
  const [isErasing, setIsErasing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    // soft pastel background
    ctx.fillStyle = '#fff1f2';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    setDrawing(true);
    draw(e);
  };
  const stopDrawing = () => setDrawing(false);

  const draw = (e) => {
    if (!drawing) return;
    const { x, y } = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isErasing ? '#fff1f2' : brushColor;
    ctx.globalCompositeOperation = 'source-over';

    ctx.beginPath();
    ctx.moveTo(x, y);
    // little jitter for organic feel
    const jx = x + (Math.random() - 0.5) * 0.5;
    const jy = y + (Math.random() - 0.5) * 0.5;
    ctx.lineTo(jx, jy);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#fff1f2';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const save = () => {
    const data = canvasRef.current.toDataURL('image/png');
    onSaveFlower && onSaveFlower(data);
  };

  const plant = () => {
    const data = canvasRef.current.toDataURL('image/png');
    onPlantFlower && onPlantFlower(data);
  };

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#111827'];

  return (
    <div className="w-full rounded-2xl border border-rose-200 bg-white/80 backdrop-blur p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-rose-500">Flower Studio</p>
          <h3 className="text-lg font-semibold text-rose-900">Sketch your bloom</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsErasing(false)} className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${!isErasing ? 'bg-rose-100 text-rose-700' : 'bg-white text-rose-600 border border-rose-200'}`}>
            <Brush className="h-4 w-4" /> Draw
          </button>
          <button onClick={() => setIsErasing(true)} className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${isErasing ? 'bg-rose-100 text-rose-700' : 'bg-white text-rose-600 border border-rose-200'}`}>
            <Eraser className="h-4 w-4" /> Erase
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => { setBrushColor(c); setIsErasing(false); }}
              className="h-6 w-6 rounded-full border border-rose-200"
              style={{ backgroundColor: c }}
              aria-label={`select color ${c}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-rose-600">Brush</label>
          <input
            type="range"
            min="2"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="accent-rose-600"
          />
        </div>
      </div>

      <div
        className="relative rounded-xl border border-rose-200 bg-rose-50 overflow-hidden"
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={draw}
      >
        <canvas ref={canvasRef} className="w-full h-64 md:h-72" />
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button onClick={clearCanvas} className="inline-flex items-center gap-2 rounded-full bg-white text-rose-700 px-3 py-2 text-sm font-medium border border-rose-200 hover:bg-rose-50">
            <Trash2 className="h-4 w-4" /> Clear
          </button>
          <button onClick={save} className="inline-flex items-center gap-2 rounded-full bg-rose-100 text-rose-700 px-3 py-2 text-sm font-medium hover:bg-rose-200">
            <Save className="h-4 w-4" /> Save flower
          </button>
        </div>
        <button onClick={plant} className="inline-flex items-center gap-2 rounded-full bg-rose-600 text-white px-4 py-2 text-sm font-medium hover:bg-rose-700">
          <Sparkles className="h-4 w-4" /> Grow in garden
        </button>
      </div>
    </div>
  );
}
