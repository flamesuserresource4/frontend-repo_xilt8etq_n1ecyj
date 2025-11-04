import React, { useEffect, useRef, useState } from 'react';
import { Brush, Eraser, Sparkles, Trash2, Save, Pencil, Paintbrush, Palette } from 'lucide-react';

export default function FlowerStudio({ onSaveFlower, onPlantFlower }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ef4444');
  const [brushSize, setBrushSize] = useState(6);
  const [tool, setTool] = useState('brush'); // 'brush' | 'pencil' | 'crayon' | 'paint' | 'eraser'
  const lastRef = useRef({ x: 0, y: 0 });

  const BG = '#fff1f2';

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    // soft pastel background
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches && e.touches[0];
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    if (e.touches) e.preventDefault();
    setDrawing(true);
    const p = getPos(e);
    lastRef.current = p;
  };

  const stopDrawing = (e) => {
    if (e && e.touches) e.preventDefault();
    setDrawing(false);
  };

  const drawSegment = (ctx, from, to) => {
    const color = tool === 'eraser' ? BG : brushColor;
    const baseWidth = brushSize;

    // unit perpendicular vector for offsets
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    if (tool === 'pencil') {
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, baseWidth * 0.6);
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      // subtle graphite grain
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 6; i++) {
        const ox = (Math.random() - 0.5) * 1.2;
        const oy = (Math.random() - 0.5) * 1.2;
        ctx.beginPath();
        ctx.moveTo(from.x + ox, from.y + oy);
        ctx.lineTo(to.x + ox, to.y + oy);
        ctx.stroke();
      }
    } else if (tool === 'crayon') {
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.5;
      const layers = 5;
      for (let i = -2; i <= 2; i++) {
        const off = (i / 2) * (baseWidth * 0.35) * (0.6 + Math.random() * 0.4);
        ctx.lineWidth = Math.max(1, baseWidth * 0.9 * (0.9 + Math.random() * 0.2));
        ctx.beginPath();
        ctx.moveTo(from.x + nx * off, from.y + ny * off);
        ctx.lineTo(to.x + nx * off, to.y + ny * off);
        ctx.stroke();
      }
      // speckle
      ctx.globalAlpha = 0.25;
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const off = (Math.random() - 0.5) * baseWidth * 0.8;
        ctx.beginPath();
        ctx.moveTo(from.x + nx * off, from.y + ny * off);
        ctx.lineTo(to.x + nx * off, to.y + ny * off);
        ctx.stroke();
      }
    } else if (tool === 'paint') {
      ctx.strokeStyle = color;
      ctx.lineWidth = baseWidth * 1.4;
      ctx.globalAlpha = 0.95;
      ctx.shadowColor = color;
      ctx.shadowBlur = 2;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      // soft highlight
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1, baseWidth * 0.4);
      ctx.beginPath();
      // offset highlight slightly along one side
      const off = baseWidth * 0.3;
      ctx.moveTo(from.x + nx * off, from.y + ny * off);
      ctx.lineTo(to.x + nx * off, to.y + ny * off);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.strokeStyle = BG;
      ctx.lineWidth = baseWidth * 1.4;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else {
      // default brush
      ctx.strokeStyle = color;
      ctx.lineWidth = baseWidth;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      // little organic wobble
      const midx = (from.x + to.x) / 2 + (Math.random() - 0.5) * 0.4;
      const midy = (from.y + to.y) / 2 + (Math.random() - 0.5) * 0.4;
      ctx.quadraticCurveTo(midx, midy, to.x, to.y);
      ctx.stroke();
    }

    // reset
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  };

  const draw = (e) => {
    if (!drawing) return;
    if (e.touches) e.preventDefault();
    const current = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawSegment(ctx, lastRef.current, current);
    lastRef.current = current;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = BG;
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

  const ToolButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm border ${active ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full rounded-2xl border border-rose-200 bg-white/80 backdrop-blur p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-rose-500">Flower Studio</p>
          <h3 className="text-lg font-semibold text-rose-900">Sketch your bloom</h3>
        </div>
        <div className="flex items-center gap-2">
          <ToolButton active={tool === 'pencil'} onClick={() => setTool('pencil')}>
            <Pencil className="h-4 w-4" /> Pencil
          </ToolButton>
          <ToolButton active={tool === 'crayon'} onClick={() => setTool('crayon')}>
            <Palette className="h-4 w-4" /> Crayon
          </ToolButton>
          <ToolButton active={tool === 'brush'} onClick={() => setTool('brush')}>
            <Brush className="h-4 w-4" /> Brush
          </ToolButton>
          <ToolButton active={tool === 'paint'} onClick={() => setTool('paint')}>
            <Paintbrush className="h-4 w-4" /> Paint
          </ToolButton>
          <ToolButton active={tool === 'eraser'} onClick={() => setTool('eraser')}>
            <Eraser className="h-4 w-4" /> Erase
          </ToolButton>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => { setBrushColor(c); if (tool === 'eraser') setTool('brush'); }}
              className="h-6 w-6 rounded-full border border-rose-200"
              style={{ backgroundColor: c }}
              aria-label={`select color ${c}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-xs text-rose-600">Size</label>
          <input
            type="range"
            min="2"
            max="30"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="accent-rose-600"
          />
        </div>
      </div>

      <div
        className="relative rounded-xl border border-rose-200 bg-rose-50 overflow-hidden touch-none"
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
