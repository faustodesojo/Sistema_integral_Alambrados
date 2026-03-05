import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { RefreshCcw, Check, X, PackageOpen, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/components/ui/use-toast';

const Returns = () => {
    const { returns, presupuestos, createReturn, updateReturnStatus } = useAppContext();
    const { toast } = useToast();
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    // Track which items are selected for return and their quantities
    const [returnItems, setReturnItems] = useState({});

    // Filter presupuestos by search term (name or quote number)
    const filteredQuotes = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const term = searchTerm.toLowerCase();
        return presupuestos.filter(p => {
            const name = (p.clientData?.name || '').toLowerCase();
            const qNum = String(p.quoteNumber || p.id || '').toLowerCase();
            return name.includes(term) || qNum.includes(term);
        }).slice(0, 10);
    }, [presupuestos, searchTerm]);

    const handleSelectQuote = (quote) => {
        setSelectedQuote(quote);
        setSearchTerm('');
        // Build all items from the quote
        const allItems = [
            ...(quote.calculatedMaterials || quote.materials || []),
            ...(quote.manualMaterials || [])
        ];
        // Initialize return items: all unchecked with max quantity
        const initial = {};
        allItems.forEach((item, idx) => {
            initial[idx] = { checked: false, maxQty: item.quantity || 0, returnQty: item.quantity || 0, item };
        });
        setReturnItems(initial);
    };

    const toggleItem = (idx) => {
        setReturnItems(prev => ({
            ...prev,
            [idx]: { ...prev[idx], checked: !prev[idx].checked }
        }));
    };

    const updateReturnQty = (idx, qty) => {
        const max = returnItems[idx]?.maxQty || 0;
        const clamped = Math.max(0, Math.min(max, parseInt(qty) || 0));
        setReturnItems(prev => ({
            ...prev,
            [idx]: { ...prev[idx], returnQty: clamped }
        }));
    };

    const handleCreate = (e) => {
        e.preventDefault();
        if (!selectedQuote) {
            toast({ title: "Error", description: "Seleccione un presupuesto.", variant: "destructive" });
            return;
        }
        if (!reason) {
            toast({ title: "Error", description: "Seleccione un motivo de devolución.", variant: "destructive" });
            return;
        }

        const selectedItems = Object.values(returnItems)
            .filter(ri => ri.checked && ri.returnQty > 0)
            .map(ri => ({
                ...ri.item,
                quantity: ri.returnQty,
                subtotal: (ri.item.unitPrice || ri.item.price || 0) * ri.returnQty
            }));

        if (selectedItems.length === 0) {
            toast({ title: "Error", description: "Seleccione al menos un producto para devolver.", variant: "destructive" });
            return;
        }

        const creditAmount = selectedItems.reduce((sum, i) => sum + (i.subtotal || 0), 0);

        createReturn({
            quoteId: selectedQuote.id,
            quoteNumber: selectedQuote.quoteNumber,
            clientName: selectedQuote.clientData?.name || 'Consumidor Final',
            client: selectedQuote.clientData,
            reason,
            notes,
            items: selectedItems,
            creditAmount
        });

        // Reset form
        setSelectedQuote(null);
        setReason('');
        setNotes('');
        setReturnItems({});
        setIsCreating(false);
    };

    const handleProcess = (ret, returnToStock) => {
        updateReturnStatus(ret.id, 'Procesada', returnToStock);
        toast({
            title: "Devolución procesada",
            description: returnToStock ? "Los productos fueron reingresados al stock." : "La devolución fue procesada como scrap."
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Solicitada': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            'Procesada': 'bg-green-500/20 text-green-400 border-green-500/30',
            'Rechazada': 'bg-red-500/20 text-red-400 border-red-500/30'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs border font-medium ${styles[status] || 'bg-slate-700 text-slate-300'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <Helmet><title>Devoluciones - Alambrados Belgrano</title></Helmet>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <RefreshCcw className="w-8 h-8 text-orange-500" />
                            Gestión de Devoluciones
                        </h1>
                        <p className="text-slate-400 mt-1">Busque por nombre de cliente o número de presupuesto para gestionar devoluciones parciales o totales.</p>
                    </div>
                    <Button onClick={() => { setIsCreating(!isCreating); setSelectedQuote(null); setSearchTerm(''); }} className="bg-orange-600 hover:bg-orange-700">
                        {isCreating ? 'Cancelar' : 'Solicitar Devolución'}
                    </Button>
                </div>

                {isCreating && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8 overflow-hidden">
                        <form onSubmit={handleCreate} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
                            <h3 className="text-lg font-semibold text-white mb-2">Nueva Solicitud de Devolución</h3>

                            {/* Search by quote/client */}
                            {!selectedQuote ? (
                                <div className="relative">
                                    <label className="text-slate-300 block mb-1 text-sm">Buscar por Cliente o Nro. Presupuesto</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Nombre del cliente o número de presupuesto..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                            autoFocus
                                        />
                                    </div>
                                    {filteredQuotes.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                            {filteredQuotes.map(q => (
                                                <button
                                                    key={q.id}
                                                    type="button"
                                                    onClick={() => handleSelectQuote(q)}
                                                    className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-0"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <span className="text-white font-medium">{q.clientData?.name || 'Sin nombre'}</span>
                                                            <span className="text-slate-400 text-xs ml-2">Presup. #{String(q.quoteNumber || q.id).padStart(3, '0')}</span>
                                                        </div>
                                                        <span className="text-orange-400 font-bold">${(q.total || 0).toLocaleString('es-AR')}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-slate-900 border border-orange-500/30 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <span className="text-white font-bold text-lg">{selectedQuote.clientData?.name || 'Sin nombre'}</span>
                                            <span className="text-slate-400 text-sm ml-3">Presupuesto #{String(selectedQuote.quoteNumber || selectedQuote.id).padStart(3, '0')}</span>
                                        </div>
                                        <Button type="button" size="sm" variant="outline" onClick={() => { setSelectedQuote(null); setReturnItems({}); }} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                            Cambiar
                                        </Button>
                                    </div>

                                    {/* Material selection table */}
                                    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-slate-900">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs text-slate-400 uppercase w-8">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-slate-600"
                                                            checked={Object.values(returnItems).every(ri => ri.checked)}
                                                            onChange={(e) => {
                                                                const allChecked = e.target.checked;
                                                                setReturnItems(prev => {
                                                                    const updated = { ...prev };
                                                                    Object.keys(updated).forEach(k => { updated[k] = { ...updated[k], checked: allChecked }; });
                                                                    return updated;
                                                                });
                                                            }}
                                                        />
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs text-slate-400 uppercase">Material</th>
                                                    <th className="px-3 py-2 text-center text-xs text-slate-400 uppercase">Original</th>
                                                    <th className="px-3 py-2 text-center text-xs text-slate-400 uppercase w-28">A Devolver</th>
                                                    <th className="px-3 py-2 text-right text-xs text-slate-400 uppercase">Crédito</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700/50">
                                                {Object.entries(returnItems).map(([idx, ri]) => (
                                                    <tr key={idx} className={`transition-colors ${ri.checked ? 'bg-orange-900/10' : 'hover:bg-slate-700/30'}`}>
                                                        <td className="px-3 py-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={ri.checked}
                                                                onChange={() => toggleItem(idx)}
                                                                className="rounded border-slate-600"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-white text-sm">{ri.item.name}</td>
                                                        <td className="px-3 py-2 text-center text-slate-400 text-sm">{ri.maxQty}</td>
                                                        <td className="px-3 py-2 text-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={ri.maxQty}
                                                                value={ri.returnQty}
                                                                onChange={(e) => updateReturnQty(idx, e.target.value)}
                                                                disabled={!ri.checked}
                                                                className="w-20 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-center text-sm disabled:opacity-30 focus:ring-2 focus:ring-orange-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 text-right text-orange-400 font-medium text-sm">
                                                            {ri.checked ? `$${((ri.item.unitPrice || ri.item.price || 0) * ri.returnQty).toLocaleString('es-AR')}` : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Credit total */}
                                    <div className="flex justify-end mt-2">
                                        <span className="text-slate-400 text-sm mr-2">Total crédito:</span>
                                        <span className="text-orange-400 font-bold">
                                            ${Object.values(returnItems)
                                                .filter(ri => ri.checked && ri.returnQty > 0)
                                                .reduce((sum, ri) => sum + ((ri.item.unitPrice || ri.item.price || 0) * ri.returnQty), 0)
                                                .toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-300 block mb-1 text-sm">Motivo</label>
                                    <select
                                        value={reason}
                                        onChange={e => setReason(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                        required
                                    >
                                        <option value="">Seleccionar Motivo</option>
                                        <option value="Defecto">Producto Defectuoso</option>
                                        <option value="Cambio">Cambio por otro producto</option>
                                        <option value="Error">Error en pedido</option>
                                        <option value="Sobrante">Material sobrante</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-slate-300 block mb-1 text-sm">Notas adicionales</label>
                                    <input
                                        type="text"
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Detalle adicional..."
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={!selectedQuote}>Crear Solicitud</Button>
                        </form>
                    </motion.div>
                )}

                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Número</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Presupuesto</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Cliente</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Motivo</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Crédito</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Estado</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {returns.map(ret => (
                                <tr key={ret.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-white font-medium font-mono">{ret.number}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-slate-300 font-mono text-sm">#{String(ret.quoteNumber || ret.orderNumber || '-').padStart(3, '0')}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{ret.clientName || ret.client?.name || '-'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{ret.reason}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-orange-400 font-bold">${(ret.creditAmount || 0).toLocaleString('es-AR')}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(ret.status)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        {ret.status === 'Solicitada' && (
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" onClick={() => handleProcess(ret, true)} className="bg-green-600 hover:bg-green-700 text-xs" title="Aprobar y reingresar stock">
                                                    <RotateCcw className="w-3 h-3 mr-1" /> Reingresar
                                                </Button>
                                                <Button size="sm" onClick={() => handleProcess(ret, false)} className="bg-blue-600 hover:bg-blue-700 text-xs" title="Aprobar como scrap">
                                                    <PackageOpen className="w-3 h-3 mr-1" /> Scrap
                                                </Button>
                                                <Button size="sm" onClick={() => updateReturnStatus(ret.id, 'Rechazada')} className="bg-red-600 hover:bg-red-700 text-xs">
                                                    <X className="w-3 h-3 mr-1" /> Rechazar
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {returns.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-slate-500">No hay devoluciones registradas.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default Returns;
