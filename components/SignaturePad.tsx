import React, { useRef, useEffect, useState } from 'react';

interface SignaturePadProps {
  onSignatureChange: (dataUrl: string) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      // Adjust for device pixel ratio for sharper lines on high-res displays
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(ratio, ratio);
        ctx.strokeStyle = '#292524'; // stone-800
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);
      }
    }
  }, []);

  const getCoordinates = (event: MouseEvent | TouchEvent): [number, number] | null => {
    if (!canvasRef.current) return null;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0]?.clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0]?.clientY;

    if (clientX === undefined || clientY === undefined) return null;

    return [clientX - rect.left, clientY - rect.top];
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!context) return;
    // Prevent scrolling on touch devices
    if (event.nativeEvent instanceof TouchEvent) {
      event.preventDefault();
    }
    const coords = getCoordinates(event.nativeEvent);
    if (!coords) return;
    const [x, y] = coords;
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
     if (event.nativeEvent instanceof TouchEvent) {
      event.preventDefault();
    }
    const coords = getCoordinates(event.nativeEvent);
    if (!coords) return;
    const [x, y] = coords;
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || !context || !canvasRef.current) return;
    context.closePath();
    setIsDrawing(false);
    onSignatureChange(canvasRef.current.toDataURL('image/png'));
  };

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;
    // We need to use the canvas's raw width/height, not offsetWidth/Height
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onSignatureChange('');
  };

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className="border border-stone-300 rounded-md bg-white cursor-crosshair w-full h-40"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <button
        onClick={clearCanvas}
        className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
      >
        Clear
      </button>
    </div>
  );
};