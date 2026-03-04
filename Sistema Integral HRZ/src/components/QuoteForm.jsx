import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Calculator, AlertCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import AddProductModal from './AddProductModal';

// Height definitions by post type
const POST_HEIGHTS = {
  'Hormigon Olimpico': ['2m', '1.80m'],
  'Hormigón Recto': ['2m', '1.80m', '1.50m', '1m'],
  'Quebracho Colorado': ['2m', '1.80m', '1.50m', '1.20m', '1m'] 
};

const QuoteForm = ({ onCalculate }) => {
  const { products, tejidoTypes, manualProducts, removeManualProduct } = useAppContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    tipoPoste: 'Hormigon Olimpico',
    altura: '2m',
    tejidoId: '', // Store selected tejido ID
    lineas: [{ id: 1, metros: '' }],
    angulos: '0',
    aberturas: []
  });

  // Get valid heights for selected post type
  const alturaOptions = POST_HEIGHTS[formData.tipoPoste] || ['2m'];

  // Reset height when post type changes if current height is invalid
  useEffect(() => {
    if (!alturaOptions.includes(formData.altura)) {
      setFormData(prev => ({ ...prev, altura: alturaOptions[0] }));
    }
  }, [formData.tipoPoste, alturaOptions, formData.altura]);

  // Filter tejidos based on selected height
  const filteredTejidos = useMemo(() => {
    return tejidoTypes.filter(t => {
      // 1. If strict height property exists, use it
      if (t.height) {
        return t.height === formData.altura;
      }
      
      // 2. Fallback: Extract height from name (e.g., "x 2 mts")
      const name = t.name ? t.name.toLowerCase() : '';
      const height = formData.altura;

      if (height === '2m' && name.includes('x 2 mts')) return true;
      if (height === '1.80m' && name.includes('x 1,80 mts')) return true;
      if (height === '1.50m' && name.includes('x 1,50 mts')) return true;
      if (height === '1.20m' && name.includes('x 1,20 mts')) return true;
      if (height === '1m' && name.includes('x 1 mts')) return true;
      
      return false;
    });
  }, [tejidoTypes, formData.altura]);

  // Auto-select valid tejido when height changes or list updates
  useEffect(() => {
    if (filteredTejidos.length > 0) {
      // Check if current selection is valid in the filtered list
      const currentId = parseInt(formData.tejidoId);
      const isCurrentValid = filteredTejidos.some(t => t.id === currentId);
      
      if (!isCurrentValid) {
        // Default to first available option
        setFormData(prev => ({ ...prev, tejidoId: filteredTejidos[0].id }));
      }
    } else {
      // No valid options, clear selection
      if (formData.tejidoId !== '') {
        setFormData(prev => ({ ...prev, tejidoId: '' }));
      }
    }
  }, [filteredTejidos, formData.tejidoId]);

  // Helper to determine max angles based on lines
  const getMaxAngles = (lineCount) => {
    if (lineCount <= 1) return 0;
    if (lineCount === 2) return 1;
    if (lineCount === 3) return 2;
    if (lineCount === 4) return 4;
    return lineCount; // For 5+, allow closed loops (max = lines)
  };

  const maxAngles = getMaxAngles(formData.lineas.length);

  // Auto-adjust angles if lines decrease and current angles exceed max
  useEffect(() => {
    const currentAngles = parseInt(formData.angulos || '0');
    if (currentAngles > maxAngles) {
      setFormData(prev => ({ ...prev, angulos: maxAngles.toString() }));
    }
  }, [formData.lineas.length, maxAngles, formData.angulos]);

  const handleAddLinea = () => {
    setFormData({
      ...formData,
      lineas: [...formData.lineas, { id: Date.now(), metros: '' }]
    });
  };

  const handleRemoveLinea = (id) => {
    if (formData.lineas.length > 1) {
      setFormData({
        ...formData,
        lineas: formData.lineas.filter(l => l.id !== id)
      });
    }
  };

  const handleLineaChange = (id, value) => {
    setFormData({
      ...formData,
      lineas: formData.lineas.map(l => l.id === id ? { ...l, metros: value } : l)
    });
  };

  const handleAnglesChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      // Clamp value between 0 and maxAngles
      const validVal = Math.min(Math.max(0, val), maxAngles);
      setFormData({ ...formData, angulos: validVal.toString() });
    } else if (e.target.value === '') {
      setFormData({ ...formData, angulos: '' });
    }
  };

  const handleAddAbertura = () => {
    setFormData({
      ...formData,
      aberturas: [...formData.aberturas, {
        id: Date.now(),
        tipo: 'puerta',
        ubicacion: 'extremo',
        ancho: ''
      }]
    });
  };

  const handleRemoveAbertura = (id) => {
    setFormData({
      ...formData,
      aberturas: formData.aberturas.filter(a => a.id !== id)
    });
  };

  const handleAberturaChange = (id, field, value) => {
    setFormData({
      ...formData,
      aberturas: formData.aberturas.map(a =>
        a.id === id ? { ...a, [field]: value } : a
      )
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculate(formData);
  };

  const availableTypes = ['Hormigon Olimpico', 'Hormigón Recto'];
  
  const manualSubtotal = manualProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <motion.form
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-6 shadow-2xl"
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Calculator className="w-6 h-6 text-orange-500" />
        Generar Presupuesto
      </h2>

      <div className="space-y-6">
        {/* Tipo de Poste */}
        <div>
          <label htmlFor="tipoPoste" className="block text-sm font-medium text-slate-300 mb-2">
            Tipo de Poste
          </label>
          <select
            id="tipoPoste"
            value={formData.tipoPoste}
            onChange={(e) => setFormData({ ...formData, tipoPoste: e.target.value })}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          >
            {availableTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Altura */}
        <div>
          <label htmlFor="altura" className="block text-sm font-medium text-slate-300 mb-2">
            Altura del Cerco
          </label>
          <select
            id="altura"
            value={formData.altura}
            onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          >
            {alturaOptions.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        {/* Tipo de Tejido */}
        <div>
          <label htmlFor="tejido" className="block text-sm font-medium text-slate-300 mb-2">
            Tipo de Tejido
          </label>
          <select
            id="tejido"
            value={formData.tejidoId}
            onChange={(e) => setFormData({ ...formData, tejidoId: e.target.value })}
            disabled={filteredTejidos.length === 0}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {filteredTejidos.length > 0 ? (
              filteredTejidos.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name ? `${t.name} - $${t.precio}` : `Tejido Calibre ${t.calibre} - ${t.pulgadas}"${t.height ? ` (${t.height})` : ''} - $${t.precio}`}
                </option>
              ))
            ) : (
              <option value="">No hay tejidos disponibles para esta altura</option>
            )}
          </select>
          {filteredTejidos.length === 0 && (
             <p className="text-xs text-red-400 mt-2 flex items-center">
               <AlertCircle className="w-3 h-3 mr-1" />
               Configure tejidos con altura "{formData.altura}" en el panel de administración.
             </p>
          )}
        </div>

        {/* Líneas a cercar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">
              Líneas a Cercar
            </label>
            <Button
              type="button"
              onClick={handleAddLinea}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
          </div>
          <div className="space-y-2">
            {formData.lineas.map((linea, index) => (
              <div key={linea.id} className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={linea.metros}
                  onChange={(e) => handleLineaChange(linea.id, e.target.value)}
                  placeholder={`Línea ${index + 1} (metros)`}
                  className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                />
                {formData.lineas.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => handleRemoveLinea(linea.id)}
                    variant="outline"
                    size="sm"
                    className="border-slate-700 hover:bg-red-900/20 hover:border-red-700"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ángulos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="angulos" className="block text-sm font-medium text-slate-300">
              Cantidad de Ángulos
            </label>
            {maxAngles === 0 && (
               <span className="text-xs text-orange-400 flex items-center">
                 <AlertCircle className="w-3 h-3 mr-1"/>
                 Mínimo 2 líneas para ángulos
               </span>
            )}
          </div>
          <input
            id="angulos"
            type="number"
            min="0"
            max={maxAngles}
            value={formData.angulos}
            onChange={handleAnglesChange}
            disabled={maxAngles === 0}
            className={`w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${maxAngles === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            required
          />
          <div className="mt-1 flex justify-between text-xs text-slate-500">
            <span>Máximo permitido: {maxAngles}</span>
            <span>(Basado en {formData.lineas.length} líneas)</span>
          </div>
        </div>

        {/* Aberturas */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">
              Aberturas
            </label>
            <Button
              type="button"
              onClick={handleAddAbertura}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
          </div>
          <div className="space-y-3">
            {formData.aberturas.map((abertura) => (
              <div key={abertura.id} className="bg-slate-900/30 border border-slate-700 rounded-lg p-3 space-y-2">
                <div className="flex gap-2">
                  <select
                    value={abertura.tipo}
                    onChange={(e) => handleAberturaChange(abertura.id, 'tipo', e.target.value)}
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="puerta">Puerta</option>
                    <option value="portón">Portón</option>
                    <option value="espacio libre">Espacio Libre</option>
                  </select>
                  <select
                    value={abertura.ubicacion}
                    onChange={(e) => handleAberturaChange(abertura.id, 'ubicacion', e.target.value)}
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="extremo">Extremo</option>
                    <option value="desplazada">Desplazada</option>
                  </select>
                  <Button
                    type="button"
                    onClick={() => handleRemoveAbertura(abertura.id)}
                    variant="outline"
                    size="sm"
                    className="border-slate-700 hover:bg-red-900/20 hover:border-red-700"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={abertura.ancho}
                  onChange={(e) => handleAberturaChange(abertura.id, 'ancho', e.target.value)}
                  placeholder="Ancho (metros)"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Productos Adicionales Manuales */}
        <div className="border-t border-slate-700 pt-6 mt-6">
           <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" /> Productos Adicionales
            </label>
            <Button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              size="sm"
              variant="outline"
              className="border-slate-700 text-orange-500 hover:bg-orange-950 hover:text-orange-400"
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar Producto
            </Button>
          </div>
          
          {manualProducts.length > 0 ? (
            <div className="bg-slate-900/30 border border-slate-700 rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 text-slate-400">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Producto</th>
                    <th className="px-3 py-2 text-center font-medium">Cant.</th>
                    <th className="px-3 py-2 text-right font-medium">Unitario</th>
                    <th className="px-3 py-2 text-right font-medium">Subtotal</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 text-slate-300">
                  {manualProducts.map((item) => (
                    <tr key={item.productId} className="hover:bg-slate-800/20">
                      <td className="px-3 py-2">{item.name}</td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">${item.price.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-medium text-white">
                        ${(item.price * item.quantity).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeManualProduct(item.productId)}
                          className="text-slate-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2 bg-slate-800/30 border-t border-slate-700 text-right text-xs">
                 <span className="text-slate-400 mr-2">Subtotal Adicionales:</span>
                 <span className="text-orange-400 font-bold">${manualSubtotal.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic mb-4">No se han agregado productos adicionales.</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Calculator className="w-5 h-5 mr-2" />
          Calcular Presupuesto Completo
        </Button>
      </div>

      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </motion.form>
  );
};

export default QuoteForm;