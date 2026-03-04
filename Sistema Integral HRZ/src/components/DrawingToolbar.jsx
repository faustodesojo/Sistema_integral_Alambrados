import React from 'react';
import { 
  Pencil, 
  Square, 
  Circle, 
  Type, 
  Eraser, 
  Undo, 
  Trash2, 
  Download,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const DrawingToolbar = ({ 
  tool, 
  setTool, 
  color, 
  setColor, 
  lineWidth, 
  setLineWidth, 
  onUndo, 
  onClear, 
  onDownload 
}) => {
  const tools = [
    { id: 'line', icon: Pencil, label: 'Línea' },
    { id: 'rectangle', icon: Square, label: 'Rectángulo' },
    { id: 'circle', icon: Circle, label: 'Círculo' },
    { id: 'text', icon: Type, label: 'Texto' },
    { id: 'eraser', icon: Eraser, label: 'Borrador' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-800 border-b border-slate-700 rounded-t-xl">
      {/* Tools */}
      <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
        {tools.map((t) => (
          <Button
            key={t.id}
            variant={tool === t.id ? "default" : "ghost"}
            size="icon"
            onClick={() => setTool(t.id)}
            className={`${tool === t.id ? 'bg-orange-600 hover:bg-orange-700' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            title={t.label}
          >
            <t.icon className="w-5 h-5" />
          </Button>
        ))}
      </div>

      {/* Styles */}
      <div className="flex items-center gap-4 border-r border-slate-700 pr-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-slate-400" />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
            title="Color"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-400" />
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-24 accent-orange-500 cursor-pointer"
            title="Grosor de línea"
          />
          <div className="w-4 h-4 rounded-full bg-slate-400" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          className="text-slate-400 hover:text-white hover:bg-slate-700"
          title="Deshacer"
        >
          <Undo className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="text-slate-400 hover:text-red-400 hover:bg-red-900/20"
          title="Limpiar Canvas"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDownload}
          className="text-slate-400 hover:text-green-400 hover:bg-green-900/20"
          title="Descargar Imagen"
        >
          <Download className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default DrawingToolbar;