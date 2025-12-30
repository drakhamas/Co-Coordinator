
import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
  label: string;
  onSave: (dataUrl: string) => void;
  savedImage?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ label, onSave, savedImage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      onSave('');
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="relative border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
        {savedImage ? (
          <img src={savedImage} alt="Signature" className="w-full h-32 object-contain" />
        ) : (
          <canvas
            ref={canvasRef}
            width={400}
            height={128}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
            className="w-full h-32 cursor-crosshair touch-none"
          />
        )}
        {!savedImage && (
          <button 
            onClick={clear}
            className="absolute top-2 right-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 bg-white/80 px-2 py-1 rounded border border-slate-200"
          >
            CLEAR
          </button>
        )}
      </div>
    </div>
  );
};
