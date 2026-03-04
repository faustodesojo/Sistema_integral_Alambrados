import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const TejidoForm = ({ tejido, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    calibre: '',
    pulgadas: '',
    height: '',
    precio: ''
  });

  useEffect(() => {
    if (tejido) {
      setFormData({
        calibre: tejido.calibre || '',
        pulgadas: tejido.pulgadas || '',
        height: tejido.height || '',
        precio: tejido.precio || ''
      });
    }
  }, [tejido]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.calibre || !formData.pulgadas || !formData.height || !formData.precio) {
      toast({
        title: "Error de validación",
        description: "Por favor complete todos los campos, incluyendo la altura.",
        variant: "destructive",
      });
      return;
    }

    // Helper to format height for consistent storage (e.g. "2m" instead of "2")
    let formattedHeight = formData.height.trim();
    if (!isNaN(formattedHeight)) {
      formattedHeight += 'm'; // Append 'm' if user just typed a number
    } else if (formattedHeight.endsWith('mts')) {
       formattedHeight = formattedHeight.replace('mts', 'm');
    }

    onSubmit({
      ...formData,
      height: formattedHeight,
      precio: parseFloat(formData.precio)
    });

    toast({
      title: tejido ? "Tejido actualizado" : "Tejido creado",
      description: "Los cambios se han guardado correctamente.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {tejido ? 'Editar Tejido' : 'Nuevo Tejido'}
          </h3>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="calibre" className="block text-sm font-medium text-slate-300 mb-2">
              Calibre *
            </label>
            <input
              id="calibre"
              type="text"
              value={formData.calibre}
              onChange={(e) => setFormData({ ...formData, calibre: e.target.value })}
              placeholder="Ej: 14.5"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label htmlFor="pulgadas" className="block text-sm font-medium text-slate-300 mb-2">
              Pulgadas *
            </label>
            <input
              id="pulgadas"
              type="text"
              value={formData.pulgadas}
              onChange={(e) => setFormData({ ...formData, pulgadas: e.target.value })}
              placeholder="Ej: 2.5"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label htmlFor="height" className="block text-sm font-medium text-slate-300 mb-2">
              Altura (m) *
            </label>
            <input
              id="height"
              type="text"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              placeholder="Ej: 2m, 1.80m, 1.50m"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Especifique la altura (ej: 2m, 1.80m)</p>
          </div>

          <div>
            <label htmlFor="precio" className="block text-sm font-medium text-slate-300 mb-2">
              Precio *
            </label>
            <input
              id="precio"
              type="number"
              step="0.01"
              min="0"
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-slate-700 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {tejido ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default TejidoForm;