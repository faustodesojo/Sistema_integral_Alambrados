import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppContext } from '@/context/AppContext';

const MaterialsConfigForm = () => {
  const { materialsConfig, updateMaterialsConfig } = useAppContext();
  const { toast } = useToast();
  const [formData, setFormData] = useState(materialsConfig);

  const handleChange = (section, field, value) => {
    if (section === 'root') {
      setFormData(prev => ({ ...prev, [field]: parseFloat(value) }));
    } else if (section.includes('.')) {
      const [parent, child] = section.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: {
            ...prev[parent][child],
            [field]: parseFloat(value)
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: parseFloat(value)
        }
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMaterialsConfig(formData);
    toast({
      title: "Configuración guardada",
      description: "Los parámetros de cálculo han sido actualizados.",
    });
  };

  const handleReset = () => {
    setFormData(materialsConfig);
    toast({
      title: "Cambios revertidos",
      description: "Se han restaurado los valores guardados.",
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-orange-500" />
          Configuración de Cálculo
        </h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleReset} className="border-slate-700 hover:bg-slate-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Restaurar
          </Button>
          <Button type="submit" size="sm" className="bg-orange-600 hover:bg-orange-700">
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* General Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-2">General</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Postes Intermedios (máx metros)</label>
              <input
                type="number"
                value={formData.maxPostSpacing}
                onChange={(e) => handleChange('root', 'maxPostSpacing', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Umbral Refuerzo (metros)</label>
              <input
                type="number"
                value={formData.reinforcementThreshold}
                onChange={(e) => handleChange('root', 'reinforcementThreshold', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Per Line Calculation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-2">Por Línea (Accesorios)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Planchuelas</label>
              <input
                type="number"
                value={formData.perLine.planchuelas}
                onChange={(e) => handleChange('perLine', 'planchuelas', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Torniquetes</label>
              <input
                type="number"
                value={formData.perLine.torniquetes}
                onChange={(e) => handleChange('perLine', 'torniquetes', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Ganchos</label>
              <input
                type="number"
                value={formData.perLine.ganchos}
                onChange={(e) => handleChange('perLine', 'ganchos', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Espárragos (por poste)</label>
              <input
                type="number"
                value={formData.perLine.esparragosPerPost}
                onChange={(e) => handleChange('perLine', 'esparragosPerPost', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Hormigon Olimpico */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-2">Hormigón Olímpico</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Hilos de Púa</label>
              <input
                type="number"
                value={formData.hormigonOlimpico.barbedWireLayers}
                onChange={(e) => handleChange('hormigonOlimpico', 'barbedWireLayers', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Torniquetes por Línea</label>
              <input
                type="number"
                value={formData.hormigonOlimpico.torniquetesPerLine}
                onChange={(e) => handleChange('hormigonOlimpico', 'torniquetesPerLine', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Aberturas - Extremo */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-2">Abertura: Extremo</h3>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Postes de Refuerzo</label>
            <input
              type="number"
              value={formData.aberturas.extremo.posts}
              onChange={(e) => handleChange('aberturas.extremo', 'posts', e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>

        {/* Aberturas - Desplazada */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-2">Abertura: Desplazada</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Postes de Refuerzo</label>
              <input
                type="number"
                value={formData.aberturas.desplazada.posts}
                onChange={(e) => handleChange('aberturas.desplazada', 'posts', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Planchuelas</label>
              <input
                type="number"
                value={formData.aberturas.desplazada.planchuelas}
                onChange={(e) => handleChange('aberturas.desplazada', 'planchuelas', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Puntales</label>
              <input
                type="number"
                value={formData.aberturas.desplazada.puntales}
                onChange={(e) => handleChange('aberturas.desplazada', 'puntales', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Espárragos</label>
              <input
                type="number"
                value={formData.aberturas.desplazada.esparragos}
                onChange={(e) => handleChange('aberturas.desplazada', 'esparragos', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Ganchos</label>
              <input
                type="number"
                value={formData.aberturas.desplazada.ganchos}
                onChange={(e) => handleChange('aberturas.desplazada', 'ganchos', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Torniquetes</label>
              <input
                type="number"
                value={formData.aberturas.desplazada.torniquetes}
                onChange={(e) => handleChange('aberturas.desplazada', 'torniquetes', e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.form>
  );
};

export default MaterialsConfigForm;