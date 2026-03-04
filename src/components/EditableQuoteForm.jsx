import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Save, Printer, RefreshCw, Plus, Minus, Trash2, Package, Download, Hash, Info, ChevronDown, ChevronUp, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAppContext } from '@/context/AppContext';
import AddProductModal from './AddProductModal';
import SaveQuoteModal from './SaveQuoteModal';
import WarehouseOrderModal from './WarehouseOrderModal';
import { generateQuotePDF } from '@/utils/PDFGenerator';
import { useNavigate } from 'react-router-dom';

const EditableQuoteForm = ({ initialQuote, onSave, onReset, onSwitchToDrawing }) => {
  const { manualProducts, removeManualProduct, updateManualProductQuantity, currentDrawing, clientData, editingQuote } = useAppContext();
  const { toast } = useToast();

  // Local state for calculated products overrides
  const [calculatedOverrides, setCalculatedOverrides] = useState({});
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [showExtrasBreakdown, setShowExtrasBreakdown] = useState(true);
  const navigate = useNavigate();
  const { createOrder, createWarehouseOrder } = useAppContext();

  // Reset overrides when initialQuote changes significantly
  useEffect(() => {
    setCalculatedOverrides({});
  }, [initialQuote?.id]);

  if (!initialQuote) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-8 shadow-2xl flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">
            Complete el formulario para generar un presupuesto
          </p>
        </div>
      </div>
    );
  }

  // Helper to get effective quantity
  const getQuantity = (item) => {
    return calculatedOverrides[item.name] !== undefined
      ? calculatedOverrides[item.name]
      : item.quantity;
  };

  const handleQuantityChange = (itemName, newQty) => {
    if (newQty < 0) return;
    setCalculatedOverrides(prev => ({
      ...prev,
      [itemName]: newQty
    }));
  };

  // Identify source of products
  // If editingQuote is present, initialQuote IS editingQuote.
  // The calculated items are stored in 'calculatedMaterials' (or 'materials' if fresh calc)
  const itemsToRender = initialQuote.calculatedMaterials || initialQuote.materials || [];

  // Calculate totals
  const calculatedSubtotal = itemsToRender.reduce((sum, item) => {
    const qty = getQuantity(item);
    // If unitPrice missing (some old data?), fallback
    const price = item.unitPrice || item.price || 0;
    return sum + (qty * price);
  }, 0);

  const manualSubtotal = manualProducts.reduce((sum, item) => {
    return sum + (item.quantity * item.price);
  }, 0);

  const grandTotal = calculatedSubtotal + manualSubtotal;

  const getFinalQuoteObject = () => {
    return {
      ...initialQuote,
      clientData: { ...clientData }, // Merge current client context
      calculatedMaterials: itemsToRender.map(item => ({
        ...item,
        quantity: getQuantity(item),
        subtotal: getQuantity(item) * (item.unitPrice || item.price || 0)
      })),
      manualMaterials: manualProducts.map(item => ({
        ...item,
        unitPrice: item.price,
        subtotal: item.quantity * item.price,
        category: 'Manual'
      })),
      total: grandTotal,
      // Ensure existing properties are preserved
      summary: initialQuote.summary || {},
      lineDetails: initialQuote.lineDetails || []
    };
  };

  const handleSaveClick = () => {
    if (editingQuote) {
      // Direct save/update without modal if editing? 
      // Or show modal to confirm totals?
      // Let's use simple confirmation via the same modal or direct.
      // Reuse modal for consistency but change title in modal if possible
      setIsSaveModalOpen(true);
    } else {
      setIsSaveModalOpen(true);
    }
  };

  const confirmSave = () => {
    const finalQuote = getFinalQuoteObject();
    onSave(finalQuote);
    setIsSaveModalOpen(false);
    toast({
      title: editingQuote ? "Presupuesto actualizado" : "Presupuesto guardado",
      description: editingQuote ? "Los cambios se han guardado exitosamente." : "El presupuesto se ha guardado en el historial.",
    });
  };

  const handleDownloadPDF = async () => {
    const currentQuoteState = getFinalQuoteObject();
    currentQuoteState.id = initialQuote.id || 'BORRADOR';
    // Maintain original date if editing, else new date
    currentQuoteState.date = initialQuote.date || new Date().toISOString();

    try {
      await generateQuotePDF(currentQuoteState, clientData, currentDrawing);
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

  const handleCreateWarehouseOrder = (itemsToOrder, type) => {
    const finalQuote = getFinalQuoteObject();
    const newOrder = createOrder(finalQuote);
    const newWarehouseOrder = createWarehouseOrder({
      orderId: newOrder.id,
      quoteId: finalQuote.id || finalQuote.quoteNumber,
      quoteNumber: finalQuote.quoteNumber,
      clientName: finalQuote.clientData?.name,
      items: itemsToOrder,
      type: type
    });

    setIsWarehouseModalOpen(false);

    if (newWarehouseOrder) {
      toast({
        title: "Orden Creada",
        description: `Orden de depósito #${newWarehouseOrder.number} (${type === 'partial' ? 'Parcial' : 'Completa'}) generada.`,
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

  // Check if there are any line details with additional sets
  const hasExtraMaterials = initialQuote.lineDetails && initialQuote.lineDetails.some(l => l.additionalSets > 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-6 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-500" />
            {editingQuote ? 'Editando Presupuesto' : 'Presupuesto'}
          </h2>
          {initialQuote.id && (
            <div className="flex items-center gap-1 mt-1 text-slate-400 text-sm">
              <Hash className="w-3 h-3" />
              <span className="font-mono">{initialQuote.quoteNumber ? `#${String(initialQuote.quoteNumber).padStart(3, '0')}` : String(initialQuote.id).slice(0, 8).toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSaveClick}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {editingQuote ? 'Guardar Cambios' : 'Guardar'}
          </Button>
          {!editingQuote && onSwitchToDrawing && (
            <Button
              onClick={onSwitchToDrawing}
              size="sm"
              className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white"
            >
              <Map className="w-4 h-4 mr-2" />
              Plano
            </Button>
          )}
          <Button
            onClick={() => setIsWarehouseModalOpen(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Package className="w-4 h-4 mr-2" />
            Generar Orden
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
          <Button
            onClick={() => {
              setCalculatedOverrides({});
              onReset();
            }}
            size="sm"
            variant="outline"
            className="border-slate-700 hover:bg-slate-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {editingQuote ? 'Cancelar' : 'Nuevo'}
          </Button>
        </div>
      </div>

      {/* Summary Section */}
      {initialQuote.summary && (
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Resumen</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-400 block">Tipo de Poste</span>
              <span className="text-white font-medium">{initialQuote.summary.tipoPoste}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Altura</span>
              <span className="text-white font-medium">{initialQuote.summary.altura}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Tejido</span>
              <span className="text-white font-medium">{initialQuote.summary.tejido || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Metraje Total</span>
              <span className="text-white font-medium">{initialQuote.summary.totalMetraje?.toFixed(2)}m</span>
            </div>
          </div>
        </div>
      )}

      {/* Additional Materials Breakdown */}
      {hasExtraMaterials && (
        <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg overflow-hidden mb-6">
          <button
            onClick={() => setShowExtrasBreakdown(!showExtrasBreakdown)}
            className="w-full px-4 py-3 bg-orange-900/30 flex justify-between items-center text-left"
          >
            <h3 className="font-semibold text-orange-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-orange-400" />
              Refuerzos automáticos por extensión ({'>'}50m)
            </h3>
            {showExtrasBreakdown ? <ChevronUp className="w-4 h-4 text-orange-400" /> : <ChevronDown className="w-4 h-4 text-orange-400" />}
          </button>

          <AnimatePresence>
            {showExtrasBreakdown && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  <p className="text-sm text-orange-200/80 mb-2">
                    Se han agregado refuerzos adicionales para líneas que superan los 50m. Estos materiales ya están incluidos en la lista principal.
                  </p>

                  {initialQuote.lineDetails.filter(l => l.additionalSets > 0).map((line) => (
                    <div key={line.lineIndex} className="bg-orange-950/30 rounded p-3 border border-orange-900/30">
                      <div className="font-medium text-orange-100 mb-2">
                        Línea {line.lineIndex} ({line.length}m): <span className="text-orange-400">+{line.additionalSets} sets de refuerzo</span>
                      </div>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm text-orange-200/70">
                        {line.materials.map((mat, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>• {mat.name}</span>
                            <span>x{mat.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="space-y-6">
        {/* Calculated Products */}
        <div className="bg-slate-900/30 border border-slate-700 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-400" />
              Productos Calculados
            </h3>
            <span className="text-sm text-slate-400">
              Subtotal: <span className="text-white font-medium">${calculatedSubtotal.toLocaleString('es-AR')}</span>
            </span>
          </div>
          <div className="divide-y divide-slate-700/50">
            {itemsToRender.map((item, index) => {
              const qty = getQuantity(item);
              const price = item.unitPrice || item.price || 0;
              return (
                <div key={index} className={`p-3 flex items-center gap-4 transition-colors ${qty === 0 ? 'bg-red-900/10 opacity-60' : 'hover:bg-slate-800/30'}`}>
                  <div className="flex-1">
                    <div className="text-white font-medium">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.category}</div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-1">
                    <button
                      onClick={() => handleQuantityChange(item.name, qty - 1)}
                      className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => handleQuantityChange(item.name, parseInt(e.target.value) || 0)}
                      className="w-12 text-center bg-transparent text-white text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => handleQuantityChange(item.name, qty + 1)}
                      className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="w-24 text-right">
                    <div className="text-white font-medium">${(qty * price).toLocaleString('es-AR')}</div>
                    <div className="text-xs text-slate-500">${price}/u</div>
                  </div>
                  <button
                    onClick={() => handleQuantityChange(item.name, 0)}
                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                    title="Quitar ítem (cantidad 0)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manual Products */}
        <div className="bg-slate-900/30 border border-slate-700 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-400" />
              Productos Agregados Manualmente
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsProductModalOpen(true)}
              className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 h-8"
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar Producto
            </Button>
          </div>

          <div className="divide-y divide-slate-700/50">
            {manualProducts.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-sm italic">
                No hay productos manuales agregados
              </div>
            ) : (
              manualProducts.map((item) => (
                <div key={item.productId} className="p-3 flex items-center gap-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex-1">
                    <div className="text-white font-medium">{item.name}</div>
                    <div className="text-xs text-slate-400">Agregado manual</div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg p-1">
                    <button
                      onClick={() => updateManualProductQuantity(item.productId, item.quantity - 1)}
                      className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateManualProductQuantity(item.productId, parseInt(e.target.value) || 0)}
                      className="w-12 text-center bg-transparent text-white text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => updateManualProductQuantity(item.productId, item.quantity + 1)}
                      className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="w-24 text-right">
                    <div className="text-white font-medium">${(item.quantity * item.price).toLocaleString('es-AR')}</div>
                    <div className="text-xs text-slate-500">${item.price}/u</div>
                  </div>
                  <button
                    onClick={() => removeManualProduct(item.productId)}
                    className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          {manualProducts.length > 0 && (
            <div className="px-4 py-2 bg-slate-800/30 border-t border-slate-700 text-right text-sm">
              <span className="text-slate-400 mr-2">Subtotal Manual:</span>
              <span className="text-white font-medium">${manualSubtotal.toLocaleString('es-AR')}</span>
            </div>
          )}
        </div>

        {/* Grand Total */}
        <div className="bg-orange-600/10 border border-orange-500/50 rounded-lg p-4 flex justify-between items-center">
          <span className="text-lg font-bold text-white">TOTAL FINAL</span>
          <span className="text-3xl font-bold text-orange-500">${grandTotal.toLocaleString('es-AR')}</span>
        </div>
      </div>

      <AddProductModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} />

      <SaveQuoteModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentQuoteData={getFinalQuoteObject()}
        onConfirm={confirmSave}
        isEditing={!!editingQuote}
      />

      <WarehouseOrderModal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        quote={getFinalQuoteObject()}
        onConfirm={handleCreateWarehouseOrder}
      />
    </motion.div>
  );
};

export default EditableQuoteForm;