import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppContext } from '@/context/AppContext';

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const { categories, addCategory } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dimensions: '',
    price: '',
    type: 'accesorios',
    category: '',
    heights: []
  });

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        dimensions: product.dimensions || '',
        price: product.price || '',
        type: product.type || 'accesorios',
        category: product.category || categories[0]?.name || 'General',
        heights: product.heights || []
      });
    } else if (categories.length > 0) {
      setFormData(prev => ({
        ...prev,
        category: categories[0].name
      }));
    }
  }, [product, categories]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === '__new__') {
      setIsCreatingCategory(true);
      setNewCategoryName('');
    } else {
      setFormData({ ...formData, category: value });
    }
  };

  const handleCancelNewCategory = () => {
    setIsCreatingCategory(false);
    setNewCategoryName('');
    // Revert to first category or current if exists
    if (!formData.category && categories.length > 0) {
      setFormData(prev => ({ ...prev, category: categories[0].name }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({
        title: "Error de validación",
        description: "Por favor complete los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    let finalCategory = formData.category;

    if (isCreatingCategory) {
      if (!newCategoryName.trim()) {
        toast({
          title: "Error de categoría",
          description: "El nombre de la categoría no puede estar vacío.",
          variant: "destructive",
        });
        return;
      }
      
      // Check for duplicates
      const exists = categories.some(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase());
      if (exists) {
        toast({
          title: "Categoría existente",
          description: "Esta categoría ya existe.",
          variant: "destructive",
        });
        return;
      }

      const newCat = addCategory(newCategoryName);
      finalCategory = newCat.name;
    }

    onSubmit({
      ...formData,
      category: finalCategory,
      price: parseFloat(formData.price)
    });

    toast({
      title: product ? "Producto actualizado" : "Producto creado",
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
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
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
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Nombre *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
              Categoría
            </label>
            {!isCreatingCategory ? (
              <select
                id="category"
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
                <option value="__new__" className="text-orange-400 font-bold">+ Nueva categoría</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nombre de nueva categoría"
                  className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  autoFocus
                />
                <Button 
                  type="button" 
                  onClick={handleCancelNewCategory}
                  variant="outline"
                  size="icon"
                  className="border-slate-700 hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              rows="3"
            />
          </div>

          <div>
            <label htmlFor="dimensions" className="block text-sm font-medium text-slate-300 mb-2">
              Dimensiones
            </label>
            <input
              id="dimensions"
              type="text"
              value={formData.dimensions}
              onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-slate-300 mb-2">
              Precio *
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-slate-300 mb-2">
              Tipo de Producto (Funcional)
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="poste">Poste</option>
              <option value="tejido">Tejido</option>
              <option value="accesorios">Accesorios</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">Utilizado para el cálculo automático de materiales</p>
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
              {product ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProductForm;