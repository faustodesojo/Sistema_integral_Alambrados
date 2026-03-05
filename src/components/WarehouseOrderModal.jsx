import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, FileText, CheckCircle2, User, Layers, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const WarehouseOrderModal = ({ isOpen, onClose, quote, onConfirm }) => {
  const [orderType, setOrderType] = useState('complete'); // complete | partial
  const [selectedItems, setSelectedItems] = useState({});
  const [quantities, setQuantities] = useState({});

  if (!isOpen || !quote) return null;

  const items = [
    ...(quote.calculatedMaterials || quote.materials || []),
    ...(quote.manualMaterials || [])
  ].map((item, idx) => ({ ...item, uniqueId: idx })); // Ensure unique key for tracking

  // Initialize checks and quantities on first load of partial tab
  const initPartialState = () => {
    const initialSelected = {};
    const initialQty = {};
    items.forEach(item => {
      initialSelected[item.uniqueId] = true;
      initialQty[item.uniqueId] = item.quantity;
    });
    setSelectedItems(initialSelected);
    setQuantities(initialQty);
  };

  const handleTabChange = (val) => {
    setOrderType(val);
    if (val === 'partial' && Object.keys(selectedItems).length === 0) {
      initPartialState();
    }
  };

  const toggleItem = (id) => {
    setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateQuantity = (id, val) => {
    const qty = parseInt(val) || 0;
    setQuantities(prev => ({ ...prev, [id]: qty }));
  };

  const handleSelectAll = (checked) => {
    const newSelected = {};
    items.forEach(item => {
      newSelected[item.uniqueId] = checked;
    });
    setSelectedItems(newSelected);
  };

  const allSelected = items.length > 0 && items.every(item => selectedItems[item.uniqueId]);
  const someSelected = items.some(item => selectedItems[item.uniqueId]) && !allSelected;

  const handleConfirm = () => {
    let finalItems = [];

    if (orderType === 'complete') {
      finalItems = items.map(i => ({
        name: i.name,
        quantity: i.quantity,
        category: i.category
      }));
    } else {
      // Filter partial
      finalItems = items
        .filter(i => selectedItems[i.uniqueId] && quantities[i.uniqueId] > 0)
        .map(i => ({
          name: i.name,
          quantity: quantities[i.uniqueId],
          category: i.category
        }));

      if (finalItems.length === 0) {
        alert("Debe seleccionar al menos un ítem para la orden parcial.");
        return;
      }
    }

    onConfirm(finalItems, orderType);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-500" />
                Crear Orden al Depósito
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-400 text-sm">Ref. Presupuesto:</span>
                <span className="bg-slate-800 text-orange-400 px-2 py-0.5 rounded text-sm font-mono font-bold">
                  #{quote.id}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <Tabs defaultValue="complete" value={orderType} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700">
              <TabsTrigger value="complete" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Layers className="w-4 h-4 mr-2" />
                Orden Completa
              </TabsTrigger>
              <TabsTrigger value="partial" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                <ListChecks className="w-4 h-4 mr-2" />
                Orden Parcial / Modificada
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4 pr-2 bg-slate-800/30 rounded-lg border border-slate-700">
              <TabsContent value="complete" className="mt-0 p-0">
                <Table>
                  <TableHeader className="bg-slate-900 sticky top-0 z-10">
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400 w-[60%]">Ítem</TableHead>
                      <TableHead className="text-slate-400">Categoría</TableHead>
                      <TableHead className="text-right text-slate-400">Cantidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, idx) => (
                      <TableRow key={idx} className="border-slate-800 hover:bg-slate-800/30">
                        <TableCell className="text-slate-200">{item.name}</TableCell>
                        <TableCell className="text-slate-500 text-xs">{item.category}</TableCell>
                        <TableCell className="text-right font-bold text-white">{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="partial" className="mt-0 p-0">
                <div className="p-3 bg-orange-900/10 text-orange-200 text-xs border-b border-orange-900/30 mb-2">
                  Seleccione los ítems que desea incluir en esta orden y ajuste las cantidades si es necesario.
                </div>
                <Table>
                  <TableHeader className="bg-slate-900 sticky top-0 z-10">
                    <TableRow className="border-slate-700">
                      <TableHead className="w-[50px] bg-slate-900">
                        <Checkbox
                          checked={allSelected}
                          ref={input => {
                            if (input) {
                              input.indeterminate = someSelected;
                            }
                          }}
                          onCheckedChange={handleSelectAll}
                          className="border-slate-500 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                          title="Seleccionar Todo"
                        />
                      </TableHead>
                      <TableHead className="text-slate-400 w-[50%]">Ítem</TableHead>
                      <TableHead className="text-right text-slate-400">Cant. Original</TableHead>
                      <TableHead className="text-right text-slate-400 w-[120px]">Cant. Orden</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow
                        key={item.uniqueId}
                        className={`border-slate-800 transition-colors ${selectedItems[item.uniqueId] ? 'bg-slate-800/40' : 'opacity-60'}`}
                      >
                        <TableCell>
                          <Checkbox
                            checked={!!selectedItems[item.uniqueId]}
                            onCheckedChange={() => toggleItem(item.uniqueId)}
                            className="border-slate-500 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                          />
                        </TableCell>
                        <TableCell className="text-slate-200">{item.name}</TableCell>
                        <TableCell className="text-right text-slate-500">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          <input
                            type="number"
                            min="0"
                            disabled={!selectedItems[item.uniqueId]}
                            value={quantities[item.uniqueId] || 0}
                            onChange={(e) => updateQuantity(item.uniqueId, e.target.value)}
                            className="w-20 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-right text-white focus:border-orange-500 focus:outline-none disabled:opacity-50"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </div>
          </Tabs>

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
            <div className="text-xs text-slate-500">
              {orderType === 'partial'
                ? `${Object.values(selectedItems).filter(Boolean).length} ítems seleccionados`
                : `${items.length} ítems totales`
              }
            </div>
            <div className="flex gap-3">
              <Button onClick={onClose} variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300">
                Cancelar
              </Button>
              <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Generar Orden e Imprimir
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WarehouseOrderModal;