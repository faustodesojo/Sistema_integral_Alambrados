import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, ChevronDown, ChevronRight, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppContext } from '@/context/AppContext';

const MaterialsConfigByType = () => {
  const { materialsConfigByType, updateMaterialsConfigByType, products, tejidoTypes } = useAppContext();
  const { toast } = useToast();
  const [localConfig, setLocalConfig] = useState(materialsConfigByType);
  const [expandedType, setExpandedType] = useState('Quebracho Colorado');
  const [expandedHeight, setExpandedHeight] = useState(null);

  const handleToggleType = (type) => {
    setExpandedType(expandedType === type ? null : type);
    setExpandedHeight(null);
  };

  const handleToggleHeight = (height) => {
    setExpandedHeight(expandedHeight === height ? null : height);
  };

  const handleConfigChange = (type, height, role, field, value) => {
    setLocalConfig(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [height]: {
          ...prev[type][height],
          [role]: {
            ...prev[type][height][role],
            [field]: field === 'productId' ? parseInt(value) : parseFloat(value)
          }
        }
      }
    }));
  };

  const handleSave = () => {
    updateMaterialsConfigByType(localConfig);
    toast({
      title: "Configuración guardada",
      description: "Los materiales por tipo han sido actualizados.",
      className: "bg-green-600 border-green-700 text-white",
    });
  };

  const roles = [
    { key: 'poste_intermedio', label: 'Postes Intermedios', desc: 'Poste principal cada X metros' },
    { key: 'poste_refuerzo', label: 'Postes Extremos/Refuerzo', desc: 'Para esquinas y refuerzos' },
    { key: 'puntal', label: 'Puntales', desc: 'Apoyo para refuerzos' },
    { key: 'planchuela', label: 'Planchuelas', desc: 'Planchuelas de sujeción' },
    { key: 'torniquete', label: 'Torniquetes', desc: 'Tensores' },
    { key: 'gancho', label: 'Ganchos', desc: 'Ganchos de fijación' },
    { key: 'esparrago', label: 'Espárragos', desc: 'Elementos de anclaje' },
    { key: 'alambre', label: 'Alambre Liso', desc: 'Alambre de tensión' },
    { key: 'hilo_pua', label: 'Hilos Púa', desc: 'Seguridad superior (si aplica)' },
    { key: 'tejido', label: 'Tejido', desc: 'Malla metálica o cerco' },
  ];

  // Combine products and tejidos for the dropdown, since 'tejido' role might need to select a Tejido Type
  const allSelectableItems = [
    ...products.map(p => ({ ...p, label: `${p.name} - $${p.price}` })),
    ...tejidoTypes.map(t => ({ ...t, label: t.name ? `${t.name} - $${t.precio}` : `Tejido Calibre ${t.calibre} - $${t.precio}` }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-500" />
            Configuración de Materiales por Tipo
          </h2>
          <p className="text-sm text-slate-400">Define qué productos usar para cada rol según el tipo de poste y altura.</p>
        </div>
        <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-white">
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>

      <div className="space-y-4">
        {Object.keys(localConfig).map((type) => (
          <div key={type} className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900/30">
            <button
              onClick={() => handleToggleType(type)}
              className="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-750 transition-colors"
            >
              <span className="font-semibold text-white text-lg">{type}</span>
              {expandedType === type ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
            </button>

            <AnimatePresence>
              {expandedType === type && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    {Object.keys(localConfig[type]).map((height) => (
                      <div key={height} className="border border-slate-700/50 rounded-lg bg-slate-800/20">
                        <button
                          onClick={() => handleToggleHeight(height)}
                          className="w-full flex items-center justify-between p-3 hover:bg-slate-700/30 transition-colors rounded-t-lg"
                        >
                          <span className="font-medium text-slate-200">Altura: {height}</span>
                          {expandedHeight === height ? <ChevronDown className="w-4 h-4 text-orange-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                        </button>

                        <AnimatePresence>
                          {expandedHeight === height && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="p-4 border-t border-slate-700/50 bg-slate-900/40"
                            >
                              <div className="grid gap-6">
                                {roles.map((role) => {
                                  const config = localConfig[type][height][role.key];
                                  if (!config) return null; // Skip if role not configured for this type

                                  return (
                                    <div key={role.key} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-b border-slate-800 pb-4 last:border-0">
                                      <div className="md:col-span-4">
                                        <label className="text-sm font-medium text-orange-400 block mb-1">{role.label}</label>
                                        <p className="text-xs text-slate-500">{role.desc}</p>
                                      </div>
                                      
                                      <div className="md:col-span-5">
                                        <label className="text-xs text-slate-400 block mb-1">Producto Asignado</label>
                                        <select
                                          value={config.productId || ''}
                                          onChange={(e) => handleConfigChange(type, height, role.key, 'productId', e.target.value)}
                                          className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-orange-500 outline-none"
                                        >
                                          <option value="">Seleccionar producto...</option>
                                          {allSelectableItems.map(p => (
                                            <option key={p.id} value={p.id}>
                                              {p.label}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      <div className="md:col-span-3">
                                        <label className="text-xs text-slate-400 block mb-1">Cantidad ({config.label || 'Unidad'})</label>
                                        <input
                                          type="number"
                                          step="0.1"
                                          value={config.quantity}
                                          onChange={(e) => handleConfigChange(type, height, role.key, 'quantity', e.target.value)}
                                          className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-orange-500 outline-none"
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialsConfigByType;