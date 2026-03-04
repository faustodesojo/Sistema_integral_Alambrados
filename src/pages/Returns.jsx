import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { RefreshCcw, Check, X, PackageOpen, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/components/ui/use-toast';

const Returns = () => {
    const { returns, orders, createReturn, updateReturnStatus } = useAppContext();
    const { toast } = useToast();
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ orderId: '', reason: '', notes: '' });

    const handleCreate = (e) => {
        e.preventDefault();
        const order = orders.find(o => o.id === formData.orderId);
        if (!order) {
            toast({ title: "Error", description: "Seleccione una orden válida.", variant: "destructive" });
            return;
        }

        createReturn({
            orderId: formData.orderId,
            orderNumber: order.orderNumber,
            clientName: order.client?.name || 'Consumidor Final',
            client: order.client,
            reason: formData.reason,
            notes: formData.notes,
            items: order.items || [],
            creditAmount: order.total || 0
        });
        setFormData({ orderId: '', reason: '', notes: '' });
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
                        <p className="text-slate-400 mt-1">Solicite, apruebe y gestione devoluciones y notas de crédito.</p>
                    </div>
                    <Button onClick={() => setIsCreating(!isCreating)} className="bg-orange-600 hover:bg-orange-700">
                        {isCreating ? 'Cancelar' : 'Solicitar Devolución'}
                    </Button>
                </div>

                {isCreating && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8 overflow-hidden">
                        <form onSubmit={handleCreate} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
                            <h3 className="text-lg font-semibold text-white mb-2">Nueva Solicitud de Devolución</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-300 block mb-1 text-sm">Orden de Venta</label>
                                    <select
                                        value={formData.orderId}
                                        onChange={e => setFormData({ ...formData, orderId: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                        required
                                    >
                                        <option value="">Seleccionar Orden</option>
                                        {orders.filter(o => o.status !== 'Cancelada').map(o => (
                                            <option key={o.id} value={o.id}>{o.orderNumber} - {o.client?.name || 'Sin nombre'}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-slate-300 block mb-1 text-sm">Motivo</label>
                                    <select
                                        value={formData.reason}
                                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
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
                            </div>
                            <div>
                                <label className="text-slate-300 block mb-1 text-sm">Notas adicionales</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-orange-500 outline-none min-h-[80px]"
                                    placeholder="Detalle adicional sobre la devolución..."
                                />
                            </div>
                            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">Crear Solicitud</Button>
                        </form>
                    </motion.div>
                )}

                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Número</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Orden Orig.</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Cliente</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Motivo</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Estado</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {returns.map(ret => (
                                <tr key={ret.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap text-white font-medium font-mono">{ret.number}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{ret.orderNumber}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{ret.clientName || ret.client?.name || '-'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">{ret.reason}</td>
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
                                    <td colSpan="6" className="text-center py-12 text-slate-500">No hay devoluciones registradas.</td>
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
