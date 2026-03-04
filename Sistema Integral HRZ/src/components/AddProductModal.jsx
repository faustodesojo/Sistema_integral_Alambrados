import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertCircle, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/components/ui/use-toast';

const AddProductModal = ({ isOpen, onClose }) => {
  const { products, tejidoTypes, manualProducts, addManualProduct } = useAppContext();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Combine products and tejidos for the search list
  const allItems = useMemo(() => [
    ...products.map(p => ({ id: p.id, name: p.name, type: 'Producto', price: p.price })),
    ...tejidoTypes.map(t => ({ id: t.id, name: t.name || `Tejido ${t.calibre} - ${t.pulgadas}"`, type: 'Tejido', price: t.precio }))
  ], [products, tejidoTypes]);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return [];
    const lowerTerm = searchTerm.toLowerCase();
    return allItems.filter(item => 
      item.name.toLowerCase().includes(lowerTerm)
    ).slice(0, 5); // Limit to top 5 results
  }, [allItems, searchTerm]);

  const handleSelect = (item) => {
    setSelectedId(item.id);
    setSearchTerm(item.name);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedId) {
      setError('Por favor busque y seleccione un producto');
      toast({
        title: "Error de validación",
        description: "Debe seleccionar un producto de la lista.",
        variant: "destructive"
      });
      return;
    }

    if (quantity <= 0) {
       setError('La cantidad debe ser mayor a 0');
       toast({
        title: "Error de validación",
        description: "La cantidad debe ser un número positivo.",
        variant: "destructive"
      });
      return;
    }

    // Delegate logic to context (checks duplicates internally)
    addManualProduct(parseInt(selectedId), parseInt(quantity));
    
    // Clear and close
    handleClose();
  };

  const handleClose = () => {
    setSelectedId('');
    setSearchTerm('');
    setQuantity(1);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6 shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              Agregar Producto
            </h3>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Search Section */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Buscar Producto
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (selectedId && e.target.value !== allItems.find(i => i.id === selectedId)?.name) {
                      setSelectedId('');
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Escriba para buscar..."
                  autoFocus
                />
              </div>

              {/* Search Results Dropdown */}
              {searchTerm && !selectedId && (
                <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                  {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-0"
                      >
                        <div className="text-sm font-medium text-white">{item.name}</div>
                        <div className="text-xs text-slate-400 flex justify-between">
                          <span>{item.type}</span>
                          <span className="text-orange-400">${item.price?.toLocaleString()}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500 italic text-center">
                      No se encontraron productos
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quantity Section */}
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cantidad a agregar
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                >
                  <span className="text-xl font-bold px-2">-</span>
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-center text-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-lg"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                >
                  <span className="text-xl font-bold px-2">+</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-slate-700 hover:bg-slate-800"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!selectedId}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Confirmar
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddProductModal;