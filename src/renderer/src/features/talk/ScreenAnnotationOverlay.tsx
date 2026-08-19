import React, { useRef, useState, useEffect } from 'react';
import { useCallStore } from '../../stores/useCallStore';
import { IconButton } from '../../components/ui';
import { Pen, ArrowUpRight, Square, Trash2, X } from 'lucide-react';

export function ScreenAnnotationOverlay() {
  const { annotations, clearAnnotations, isAnnotationEnabled, toggleAnnotation } = useCallStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'pen' | 'arrow' | 'rect' | 'laser'>('pen');
  const [color, setColor] = useState('#ef4444');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 600;

    // Clear and redraw all annotations
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    annotations.forEach((ann) => {
      ctx.strokeStyle = ann.color;
      ctx.lineWidth = ann.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (ann.type === 'pen' && ann.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        for (let i = 1; i < ann.points.length; i++) {
          ctx.lineTo(ann.points[i].x, ann.points[i].y);
        }
        ctx.stroke();
      } else if (ann.type === 'arrow' && ann.points.length >= 2) {
        const p1 = ann.points[0];
        const p2 = ann.points[ann.points.length - 1];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        ctx.beginPath();
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p2.x - 15 * Math.cos(angle - Math.PI / 6), p2.y - 15 * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p2.x - 15 * Math.cos(angle + Math.PI / 6), p2.y - 15 * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (ann.type === 'rect' && ann.points.length >= 2) {
        const p1 = ann.points[0];
        const p2 = ann.points[ann.points.length - 1];
        ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      }
    });
  }, [annotations]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setCurrentPoints([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPoints((prev) => [...prev, { x, y }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || currentPoints.length < 2) {
      setIsDrawing(false);
      setCurrentPoints([]);
      return;
    }

    useCallStore.getState().addAnnotation({
      id: `ann_${Date.now()}`,
      type: tool,
      points: currentPoints,
      color,
      size: 3,
      author: 'Local',
      timestamp: Date.now()
    });

    setIsDrawing(false);
    setCurrentPoints([]);
  };

  if (!isAnnotationEnabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-full pointer-events-auto cursor-crosshair"
      />

      {/* Floating Annotation Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-1.5 p-1.5 rounded-full glass-panel-elevated border border-slate-200 dark:border-slate-700 shadow-2xl">
        <IconButton
          size="sm"
          variant="tonal"
          onClick={() => setTool('pen')}
          title="Pen Draw"
          icon={<Pen className="w-4 h-4" />}
        />

        <IconButton
          size="sm"
          variant="tonal"
          onClick={() => setTool('arrow')}
          title="Draw Arrow"
          icon={<ArrowUpRight className="w-4 h-4" />}
        />

        <IconButton
          size="sm"
          variant="tonal"
          onClick={() => setTool('rect')}
          title="Draw Box"
          icon={<Square className="w-4 h-4" />}
        />

        <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Colors */}
        {['#ef4444', '#10b981', '#6366f1', '#f59e0b'].map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className="w-5 h-5 rounded-full transition-transform hover:scale-110"
            style={{
              backgroundColor: c,
              border: color === c ? '2px solid white' : 'none'
            }}
          />
        ))}

        <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        <IconButton size="sm" variant="standard" onClick={clearAnnotations} title="Clear All Markup" icon={<Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-500" />} />

        <IconButton size="sm" variant="standard" onClick={toggleAnnotation} title="Close Annotation Tool" icon={<X className="w-4 h-4 text-slate-400" />} />
      </div>
    </div>
  );
}
