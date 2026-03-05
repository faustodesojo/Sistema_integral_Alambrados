import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, FileText, Download, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { generateWarehousePDF } from '@/utils/WarehousePDFGenerator';

const WarehouseOrderDetailsModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const handleDownloadPDF = () => {
    generateWarehousePDF(order);
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
                  <span className="text-xs px-2 py-1 rounded border text-green-500 bg-green-500/10 border-green-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    COMPLETADA
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
                </div>

                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
                  <h3 className="font-semibold text-white border-b border-slate-700 pb-2">Acciones</h3>
                  <Button onClick={handleDownloadPDF} variant="outline" className="w-full border-slate-600 hover:bg-slate-700 text-slate-200 justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </Button>
                </div>

                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Stock descontado automáticamente
                  </div>
                  <p className="text-green-400/70 text-xs mt-1">
                    El stock fue descontado al momento de generar esta orden.
                  </p>
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