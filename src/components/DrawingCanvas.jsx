import React, { useRef, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

const DrawingCanvas = ({ 
  tool, 
  color, 
  lineWidth, 
  onCanvasReady,
  triggerSave, // Prop to trigger external save
  triggerUndo, // Prop to trigger undo
  triggerClear // Prop to trigger clear
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState(null);
  const [history, setHistory] = useState([]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Set canvas size to match container
    canvas.width = container.offsetWidth;
    canvas.height = 600; // Fixed height for consistency
    
    const ctx = canvas.getContext('2d');
    
    // Fill with white background initially
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save initial state to history
    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialData]);

    if (onCanvasReady) onCanvasReady(canvas);
  }, []); // Run once on mount

  // Handle Undo Trigger
  useEffect(() => {
    if (triggerUndo > 0) { // Only run if counter increments
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (history.length > 1) {
        const newHistory = [...history];
        newHistory.pop(); // Remove current state
        const previousState = newHistory[newHistory.length - 1];
        
        ctx.putImageData(previousState, 0, 0);
        setHistory(newHistory);
      }
    }
  }, [triggerUndo]);

  // Handle Clear Trigger
  useEffect(() => {
    if (triggerClear > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const newData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory(prev => [...prev, newData]);
    }
  }, [triggerClear]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const { x, y } = getMousePos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (tool === 'text') {
      const text = prompt('Ingrese el texto:');
      if (text) {
        ctx.font = `${lineWidth * 2 + 10}px Arial`;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        saveToHistory();
      }
      return;
    }

    setIsDrawing(true);
    setStartPos({ x, y });
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getMousePos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (tool === 'line' || tool === 'rectangle' || tool === 'circle') {
      ctx.putImageData(snapshot, 0, 0); // Restore to start of stroke
    }

    ctx.beginPath();

    if (tool === 'line') {
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'rectangle') {
      const w = x - startPos.x;
      const h = y - startPos.y;
      ctx.strokeRect(startPos.x, startPos.y, w, h);
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (tool === 'eraser' || tool === 'pencil' || tool === 'line') { 
      // Fallback for free drawing if we had a pencil tool, but here we only have specific tools.
      // Wait, 'line' is straight line. I should add a 'freehand' or handle eraser as freehand.
    } 
    
    // Eraser logic (continuous)
    if (tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveToHistory();
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const newData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev, newData]);
    
    // Notify parent to save current state to context if needed
    if (onCanvasReady) onCanvasReady(canvas);
  };

  return (
    <div ref={containerRef} className="w-full bg-slate-900 border-x border-b border-slate-700 rounded-b-xl overflow-hidden touch-none">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="cursor-crosshair w-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

export default DrawingCanvas;