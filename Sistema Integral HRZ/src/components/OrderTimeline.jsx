import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Package, Truck, DollarSign, FileText } from 'lucide-react';

const OrderTimeline = ({ status }) => {
  const stages = [
    { id: 'Pendiente', icon: FileText, label: 'Orden Creada' },
    { id: 'Confirmada', icon: DollarSign, label: 'Confirmada' },
    { id: 'En Preparación', icon: Package, label: 'En Preparación' },
    { id: 'Lista para Retirar', icon: Check, label: 'Lista' },
    { id: 'Entregada', icon: Truck, label: 'Entregada' }
  ];

  const getCurrentStageIndex = () => {
    if (status === 'Cancelada') return -1;
    return stages.findIndex(s => s.id === status);
  };

  const currentIndex = getCurrentStageIndex();

  return (
    <div className="w-full py-4">
      {status === 'Cancelada' ? (
        <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 text-center">
          <span className="text-red-400 font-bold">Orden Cancelada</span>
        </div>
      ) : (
        <div className="relative flex items-center justify-between">
          {/* Connecting Line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-700 z-0" />
          <motion.div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-orange-600 z-0"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />

          {stages.map((stage, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const Icon = stage.icon;

            return (
              <div key={stage.id} className="relative z-10 flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isCompleted ? '#ea580c' : '#1e293b',
                    borderColor: isCompleted ? '#c2410c' : '#334155',
                    scale: isCurrent ? 1.2 : 1
                  }}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors duration-300`}
                >
                  <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-slate-500'}`} />
                </motion.div>
                <span className={`mt-2 text-xs font-medium ${isCompleted ? 'text-orange-500' : 'text-slate-500'}`}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;