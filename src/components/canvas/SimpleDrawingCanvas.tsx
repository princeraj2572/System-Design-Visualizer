'use client';

import React, { useRef, useEffect, useState } from 'react';

/**
 * SimpleDrawingCanvas - Fallback drawing implementation
 * Provides basic drawing functionality while Excalidraw loads
 */
export const SimpleDrawingCanvas: React.FC<{
  onElementsChange?: (elements: any[]) => void;
}> = ({ onElementsChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      setContext(ctx);
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (context) {
      context.closePath();
    }
    setIsDrawing(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-100">
      <div className="bg-blue-600 text-white px-4 py-2 text-sm font-medium">
        🎨 Simple Drawing Canvas (Fallback)
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="flex-1 cursor-crosshair bg-white"
        style={{ display: 'block' }}
      />
      <div className="bg-gray-200 px-4 py-2 text-xs text-gray-600 border-t">
        Click and drag to draw on the canvas
      </div>
    </div>
  );
};

export default SimpleDrawingCanvas;
