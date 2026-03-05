import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, MapPin, Phone, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';

const SaveQuoteModal = ({ isOpen, onClose, currentQuoteData, onConfirm, isEditing }) => {
  const { clientData, updateClientData, generateQuoteId } = useAppContext();

  const [phone, setPhone] = useState(clientData.phone || '');
  const [errors, setErrors] = useState({});
  const [previewId, setPreviewId] = useState('');

  // Sync local phone state
  useEffect(() => {
    setPhone(clientData.phone || '');
  }, [clientData.phone]);

  // Generate preview ID when modal opens if it's new
  useEffect(() => {
    if (isOpen) {
      if (isEditing && currentQuoteData?.id) {
        setPreviewId(currentQuoteData.id);
      } else {
        setPreviewId(generateQuoteId());
      }
    }
  }, [isOpen, isEditing, currentQuoteData, generateQuoteId]);

  const validate = () => {
    // Nombre, dirección y teléfono son opcionales
    setErrors({});
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    updateClientData('phone', phone);

    // Pass the generated ID back so it can be used for creation
    const finalData = {
      ...currentQuoteData,
      id: isEditing ? currentQuoteData.id : previewId
    };

    onConfirm(finalData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Save className="w-5 h-5 text-orange-500" />
              Confirmar y Guardar
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-700/50 mb-2">
                <Hash className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-slate-400 uppercase tracking-wider">ID de Referencia:</span>
                <span className="text-white font-mono text-sm ml-auto">{previewId.slice(0, 12)}...</span>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <label className="text-xs text-slate-500 block">Cliente</label>
                  <div className="text-white text-sm font-medium">{clientData.name || "Sin nombre"}</div>
                  {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <label className="text-xs text-slate-500 block">Dirección</label>
                  <div className="text-white text-sm font-medium">{clientData.address || "Sin dirección"}</div>
                  {errors.address && <p className="text-red-400 text-xs">{errors.address}</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Teléfono de Contacto <span className="text-slate-500 text-xs">(opcional)</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full bg-slate-800 border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.phone ? 'border-red-500' : 'border-slate-700'}`}
                placeholder="Ej: 221 555 5555"
                autoFocus
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div className="bg-slate-800/50 p-3 rounded text-xs text-slate-400 mt-4 border border-slate-700/50 text-center">
              <p>Total del presupuesto a guardar: <span className="text-orange-400 font-bold">${currentQuoteData?.total?.toLocaleString('es-AR')}</span></p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button type="button" onClick={onClose} variant="outline" className="flex-1 border-slate-700 hover:bg-slate-800">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                {isEditing ? 'Actualizar' : 'Guardar Presupuesto'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SaveQuoteModal;