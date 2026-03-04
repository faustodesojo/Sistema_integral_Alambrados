import React from 'react';
import { motion } from 'framer-motion';
import { History, Trash2, FileText, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/components/ui/use-toast';

const QuoteHistory = ({ onSelectQuote }) => {
  const { presupuestos, deletePresupuesto } = useAppContext();
  const { toast } = useToast();

  const handleDelete = (id) => {
    deletePresupuesto(id);
    toast({
      title: "Presupuesto eliminado",
      description: "El presupuesto se ha eliminado del historial.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-6 shadow-2xl"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-orange-500" />
        Historial de Presupuestos
      </h3>

      {presupuestos.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No hay presupuestos guardados</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {presupuestos.map((presupuesto) => (
            <motion.div
              key={presupuesto.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-orange-500/50 transition-all cursor-pointer group"
              onClick={() => onSelectQuote(presupuesto)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {/* Display Quote ID */}
                    <span className="flex items-center text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      <Hash className="w-3 h-3 mr-1" />
                      {String(presupuesto.id).length > 8 ? String(presupuesto.id).slice(0, 8).toUpperCase() : presupuesto.id}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {presupuesto.clientData?.name || "Sin Nombre"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                     <span className="text-xs text-slate-400">
                      {presupuesto.summary.tipoPoste} - {presupuesto.summary.altura}
                    </span>
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                      {presupuesto.summary.totalMetraje.toFixed(0)}m
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mb-2">
                    {new Date(presupuesto.date).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="text-lg font-bold text-orange-500">
                    ${presupuesto.total.toLocaleString('es-AR')}
                  </div>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(presupuesto.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900/20 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default QuoteHistory;