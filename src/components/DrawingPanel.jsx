import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/components/ui/use-toast';
import DrawingToolbar from './DrawingToolbar';
import DrawingCanvas from './DrawingCanvas';

const DrawingPanel = () => {
  const { saveDrawing, currentDrawing } = useAppContext();
  const { toast } = useToast();
  
  const [tool, setTool] = useState('line');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  
  // Triggers for canvas actions
  const [undoTrigger, setUndoTrigger] = useState(0);
  const [clearTrigger, setClearTrigger] = useState(0);
  
  const [canvasRef, setCanvasRef] = useState(null);

  // Load existing drawing if available
  useEffect(() => {
    if (currentDrawing && canvasRef) {
      const ctx = canvasRef.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = currentDrawing;
    }
  }, [canvasRef, currentDrawing]);

  const handleCanvasReady = (canvas) => {
    setCanvasRef(canvas);
  };

  const handleSave = () => {
    if (canvasRef) {
      const dataUrl = canvasRef.toDataURL('image/png');
      saveDrawing(dataUrl);
      toast({
        title: "Plano guardado",
        description: "El plano se ha guardado temporalmente. No olvide guardar el presupuesto.",
      });
    }
  };

  const handleDownload = () => {
    if (canvasRef) {
      const dataUrl = canvasRef.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `plano-trabajo-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl flex flex-col h-full"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 className="text-xl font-bold text-white">Plano de Trabajo</h3>
        <Button 
          onClick={handleSave}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>

      <div className="flex-1 flex flex-col p-4">
        <DrawingToolbar
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          lineWidth={lineWidth}
          setLineWidth={setLineWidth}
          onUndo={() => setUndoTrigger(prev => prev + 1)}
          onClear={() => setClearTrigger(prev => prev + 1)}
          onDownload={handleDownload}
        />
        
        <DrawingCanvas
          tool={tool}
          color={color}
          lineWidth={lineWidth}
          triggerUndo={undoTrigger}
          triggerClear={clearTrigger}
          onCanvasReady={handleCanvasReady}
        />
      </div>
    </motion.div>
  );
};

export default DrawingPanel;