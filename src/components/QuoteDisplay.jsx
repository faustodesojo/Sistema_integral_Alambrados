import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Printer, RefreshCw, Image as ImageIcon, Download, Hash, Package, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppContext } from '@/context/AppContext';
import { generateQuotePDF } from '@/utils/PDFGenerator';
import { generateWarehousePDF } from '@/utils/WarehousePDFGenerator';
import WarehouseOrderModal from '@/components/WarehouseOrderModal';
import { useNavigate } from 'react-router-dom';

const QuoteDisplay = ({ quote, onReset }) => {
  const { toast } = useToast();
  const { createOrder, createWarehouseOrder, warehouseOrders, registerQuoteSale, presupuestos } = useAppContext();
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [salePaymentMethod, setSalePaymentMethod] = useState('Efectivo');
  const [showSaleConfirm, setShowSaleConfirm] = useState(false);
  const navigate = useNavigate();

  if (!quote) return null;

  // Get live quote data (for status updates)
  const liveQuote = presupuestos.find(p => p.id === quote.id) || quote;
  const isSold = liveQuote.status === 'Vendido';
  const isSaved = !!(quote.quoteNumber || quote.id);

  const calculatedItems = quote.calculatedMaterials || quote.materials || [];
  const manualItems = quote.manualMaterials || [];
  const hasManualItems = manualItems.length > 0;
  const drawingData = quote.drawing;

  // Check linked orders
  const linkedOrders = warehouseOrders.filter(wo => wo.quoteId === quote.id);
  const hasOrders = linkedOrders.length > 0;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      await generateQuotePDF(quote, quote.clientData || {}, drawingData);
      toast({
        title: "PDF Generado",
        description: "El presupuesto se ha descargado correctamente.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo generar el PDF.",
      });
    }
  };

  const handleDownloadDrawing = () => {
    if (drawingData) {
      const link = document.createElement('a');
      link.download = `plano-presupuesto-${quote.id}.png`;
      link.href = drawingData;
      link.click();
    }
  };

  const handleCreateWarehouseOrder = (itemsToOrder, type) => {
    const quoteId = quote.id || quote.quoteNumber;
    if (!quoteId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debe guardar el presupuesto antes de generar una orden de depósito.",
      });
      return;
    }

    // Create Sales Order (legacy support)
    const newOrder = createOrder(quote);

    // Create Warehouse Order (ya se crea como Completada y descuenta stock)
    const newWarehouseOrder = createWarehouseOrder({
      orderId: newOrder.id,
      quoteId: quoteId,
      quoteNumber: quote.quoteNumber || quote.id,
      clientName: quote.clientData?.name,
      items: itemsToOrder,
      type: type
    });

    setIsWarehouseModalOpen(false);

    if (newWarehouseOrder) {
      // Generar e imprimir PDF automáticamente
      generateWarehousePDF(newWarehouseOrder);
      toast({
        title: "Orden Generada",
        description: `Orden #${newWarehouseOrder.number} creada, stock descontado y PDF descargado.`,
      });
      navigate('/warehouse-orders');
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la orden.",
      });
    }
  };

  const handleRegisterSale = () => {
    const success = registerQuoteSale(quote.id, salePaymentMethod);
    if (success) {
      setShowSaleConfirm(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-orange-500" />
              Presupuesto
              {(quote.quoteNumber || quote.id) && (
                <span className="text-orange-400 font-mono">#{String(quote.quoteNumber || quote.id).padStart(3, '0')}</span>
              )}
            </h2>
            <div className="flex items-center gap-2 mt-1">

              {isSold && (
                <span className="flex items-center gap-1 bg-green-900/30 text-green-400 px-2 py-0.5 rounded border border-green-500/30 text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Vendido
                </span>
              )}

              {hasOrders && (
                <div
                  onClick={() => navigate('/warehouse-orders')}
                  className="flex items-center gap-1 bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 text-xs font-medium cursor-pointer hover:bg-blue-900/50 transition-colors"
                >
                  <Package className="w-3 h-3" />
                  {linkedOrders.length} Orden(es)
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Registrar Venta - solo si está guardado */}
            {isSaved && (
              !isSold ? (
                <Button
                  onClick={() => setShowSaleConfirm(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Registrar Venta
                </Button>
              ) : (
                <span className="flex items-center gap-1 text-green-400 text-sm font-medium bg-green-900/20 px-3 py-1.5 rounded border border-green-500/20">
                  <CheckCircle className="w-4 h-4" />
                  Venta Registrada
                </span>
              )
            )}
            {isSaved && (
              <Button
                onClick={() => setIsWarehouseModalOpen(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Package className="w-4 h-4 mr-2" />
                Realizar Orden
              </Button>
            )}
            {isSaved && (
              <>
                <Button
                  onClick={handlePrint}
                  size="sm"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-700"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  size="sm"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </>
            )}
            {onReset && (
              <Button
                onClick={onReset}
                size="sm"
                variant="outline"
                className="border-slate-700 hover:bg-slate-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Cerrar
              </Button>
            )}
          </div>
        </div>

        {/* Sale Confirmation Panel */}
        {showSaleConfirm && !isSold && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 overflow-hidden"
          >
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Confirmar Venta — ${(quote.total || 0).toLocaleString('es-AR')}
            </h3>
            <div className="flex items-center gap-4">
              <div>
                <label className="text-slate-300 text-xs block mb-1">Método de Pago</label>
                <select
                  value={salePaymentMethod}
                  onChange={(e) => setSalePaymentMethod(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-2 focus:ring-green-500 outline-none min-w-[180px]"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Cuenta Corriente">Cuenta Corriente</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleRegisterSale} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
                <Button onClick={() => setShowSaleConfirm(false)} variant="outline" className="border-slate-600 hover:bg-slate-700 text-slate-300">
                  Cancelar
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Client Info Section */}
        {quote.clientData && (
          <div className="bg-slate-900/30 border border-slate-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Información del Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-500 text-xs block">Nombre</span>
                <span className="text-white font-medium">{quote.clientData.name || "---"}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Dirección</span>
                <span className="text-white font-medium">{quote.clientData.address || "---"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Resumen Técnico</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-400">Tipo de Poste:</span>
              <span className="text-white ml-2 font-medium">{quote.summary?.tipoPoste || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400">Altura:</span>
              <span className="text-white ml-2 font-medium">{quote.summary?.altura || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400">Metraje Total:</span>
              <span className="text-white ml-2 font-medium">{quote.summary?.totalMetraje?.toFixed(2) || '0'}m</span>
            </div>
            <div>
              <span className="text-slate-400">Ángulos:</span>
              <span className="text-white ml-2 font-medium">{quote.summary?.angulos || '0'}</span>
            </div>
          </div>
        </div>

        {/* Drawing Preview Section */}
        {drawingData && (
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-800 text-sm font-semibold text-slate-300 border-b border-slate-700 flex justify-between items-center">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                Plano Adjunto
              </span>
              <Button
                onClick={handleDownloadDrawing}
                size="sm"
                variant="ghost"
                className="h-6 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
              >
                <Download className="w-3 h-3 mr-1" />
                Descargar
              </Button>
            </div>
            <div className="p-4 bg-white flex justify-center">
              <img
                src={drawingData}
                alt="Plano de trabajo"
                className="max-h-[300px] object-contain border border-slate-200 shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Materials Table - Calculated */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-800 text-sm font-semibold text-slate-300 border-b border-slate-700">
              Productos Calculados
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/30">
                    <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400">Material</th>
                    <th className="text-center px-4 py-2 text-xs font-semibold text-slate-400">Cant.</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-slate-400">Precio</th>
                    <th className="text-right px-4 py-2 text-xs font-semibold text-slate-400">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedItems.map((material, index) => (
                    <tr key={index} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-800/30">
                      <td className="px-4 py-2 text-white">
                        <div className="text-sm">{material.name}</div>
                        <div className="text-xs text-slate-500">{material.category}</div>
                      </td>
                      <td className="px-4 py-2 text-center text-white text-sm">{material.quantity}</td>
                      <td className="px-4 py-2 text-right text-white text-sm">
                        ${(material.unitPrice || material.price || 0).toLocaleString('es-AR')}
                      </td>
                      <td className="px-4 py-2 text-right text-white font-medium text-sm">
                        ${(material.subtotal || 0).toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Materials Table - Manual */}
          {hasManualItems && (
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-slate-800 text-sm font-semibold text-green-400 border-b border-slate-700">
                Productos Adicionales
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-800/30">
                      <th className="text-left px-4 py-2 text-xs font-semibold text-slate-400">Material</th>
                      <th className="text-center px-4 py-2 text-xs font-semibold text-slate-400">Cant.</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-slate-400">Precio</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-slate-400">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualItems.map((material, index) => (
                      <tr key={index} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-800/30">
                        <td className="px-4 py-2 text-white text-sm">{material.name}</td>
                        <td className="px-4 py-2 text-center text-white text-sm">{material.quantity}</td>
                        <td className="px-4 py-2 text-right text-white text-sm">
                          ${(material.unitPrice || material.price || 0).toLocaleString('es-AR')}
                        </td>
                        <td className="px-4 py-2 text-right text-white font-medium text-sm">
                          ${(material.subtotal || 0).toLocaleString('es-AR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="bg-orange-600/10 border border-orange-500 rounded-lg p-4 flex justify-between items-center">
            <span className="text-lg font-bold text-white">TOTAL:</span>
            <span className="text-2xl font-bold text-orange-500">
              ${(quote.total || 0).toLocaleString('es-AR')}
            </span>
          </div>
        </div>
      </motion.div>

      <WarehouseOrderModal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        quote={quote}
        onConfirm={handleCreateWarehouseOrder}
      />
    </>
  );
};

export default QuoteDisplay;