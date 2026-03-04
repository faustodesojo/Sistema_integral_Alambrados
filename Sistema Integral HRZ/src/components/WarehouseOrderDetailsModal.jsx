import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, FileText, Download, Calendar, CheckSquare, Clock, Truck, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { generateWarehousePDF } from '@/utils/WarehousePDFGenerator';
import { useAppContext } from '@/context/AppContext';

const WarehouseOrderDetailsModal = ({ isOpen, onClose, order }) => {
  const { updateWarehouseOrder } = useAppContext();

  if (!isOpen || !order) return null;

  const handleDownloadPDF = () => {
    generateWarehousePDF(order);
  };

  const handleStatusChange = (newStatus) => {
    updateWarehouseOrder(order.id, { status: newStatus });
    // Force simple update of local order object for UI reactivity if parent doesn't auto-update
    order.status = newStatus; 
  };

  const getStatusColor = (s) => {
    switch(s) {
      case 'Pendiente': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'En Preparación': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Completada': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Cancelada': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-500';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl p-0 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 bg-slate-900 flex justify-between items-start">
            <div className="flex gap-4">
               <div className="p-3 bg-slate-800 rounded-lg h-fit">
                 <Package className="w-8 h-8 text-orange-500" />
               </div>
               <div>
                 <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                   Orden #{order.number}
                   <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(order.status)}`}>
                     {order.status.toUpperCase()}
                   </span>
                 </h2>
                 <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                   <span className="flex items-center gap-1">
                     <FileText className="w-3 h-3" /> Ref. Presupuesto #{order.quoteId}
                   </span>
                   <span className="flex items-center gap-1">
                     <Calendar className="w-3 h-3" /> {new Date(order.date).toLocaleDateString()}
                   </span>
                 </div>
               </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Timeline */}
            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg border border-slate-700">
               {['Pendiente', 'En Preparación', 'Completada'].map((step, idx) => {
                 const isActive = step === order.status;
                 const isPast = ['Pendiente', 'En Preparación', 'Completada'].indexOf(order.status) >= idx;
                 return (
                   <div key={step} className="flex flex-col items-center gap-2 flex-1 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-slate-900 ${
                        isPast ? 'border-green-500 text-green-500' : 'border-slate-600 text-slate-600'
                      }`}>
                        {idx === 0 && <Clock className="w-4 h-4" />}
                        {idx === 1 && <Truck className="w-4 h-4" />}
                        {idx === 2 && <CheckSquare className="w-4 h-4" />}
                      </div>
                      <span className={`text-xs font-medium ${isPast ? 'text-green-500' : 'text-slate-600'}`}>{step}</span>
                      
                      {idx < 2 && (
                        <div className={`absolute top-4 left-[50%] w-full h-0.5 ${
                          ['Pendiente', 'En Preparación', 'Completada'].indexOf(order.status) > idx ? 'bg-green-500' : 'bg-slate-700'
                        }`} />
                      )}
                   </div>
                 );
               })}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 space-y-4">
                  <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-700 font-semibold text-white flex justify-between">
                      <span>Lista de Materiales</span>
                      <span className="text-xs text-slate-400 font-normal px-2 py-0.5 bg-slate-800 rounded">
                        {order.type === 'partial' ? 'Orden Parcial' : 'Orden Completa'}
                      </span>
                    </div>
                    <Table>
                      <TableHeader className="bg-slate-900/30">
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-400">Ítem</TableHead>
                          <TableHead className="text-right text-slate-400 w-[100px]">Cant.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items.map((item, idx) => (
                          <TableRow key={idx} className="border-slate-700 hover:bg-slate-700/30">
                            <TableCell className="text-slate-300">
                              {item.name}
                              <div className="text-xs text-slate-500">{item.category}</div>
                            </TableCell>
                            <TableCell className="text-right font-medium text-white text-lg">
                              {item.quantity}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
                    <h3 className="font-semibold text-white border-b border-slate-700 pb-2">Cliente</h3>
                    <div>
                      <span className="text-xs text-slate-500 block">Nombre</span>
                      <span className="text-slate-200">{order.clientName || '---'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Orden ID</span>
                      <span className="font-mono text-slate-200 text-sm">{order.id}</span>
                    </div>
                  </div>

                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
                    <h3 className="font-semibold text-white border-b border-slate-700 pb-2">Acciones</h3>
                    <Button onClick={handleDownloadPDF} variant="outline" className="w-full border-slate-600 hover:bg-slate-700 text-slate-200 justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar PDF
                    </Button>
                    
                    <div className="h-px bg-slate-700 my-2" />
                    
                    {order.status === 'Pendiente' && (
                      <Button onClick={() => handleStatusChange('En Preparación')} className="w-full bg-blue-600 hover:bg-blue-700 justify-start">
                        <Truck className="w-4 h-4 mr-2" />
                        Comenzar Preparación
                      </Button>
                    )}
                    
                    {order.status === 'En Preparación' && (
                      <Button onClick={() => handleStatusChange('Completada')} className="w-full bg-green-600 hover:bg-green-700 justify-start">
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Marcar Completada
                      </Button>
                    )}

                     {order.status !== 'Cancelada' && order.status !== 'Completada' && (
                      <Button onClick={() => handleStatusChange('Cancelada')} variant="ghost" className="w-full text-red-400 hover:bg-red-500/10 justify-start">
                        <Ban className="w-4 h-4 mr-2" />
                        Cancelar Orden
                      </Button>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WarehouseOrderDetailsModal;