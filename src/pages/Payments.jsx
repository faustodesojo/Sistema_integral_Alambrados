import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { DollarSign, CreditCard, Banknote, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';

const Payments = () => {
    const { payments, orders, createPayment } = useAppContext();
    const [formData, setFormData] = useState({ orderId: '', amount: '', method: 'Efectivo' });

    const handleRegister = (e) => {
        e.preventDefault();
        const order = orders.find(o => o.id === formData.orderId);
        if (!order) return;

        createPayment({
            orderId: formData.orderId,
            orderNumber: order.orderNumber,
            amount: parseFloat(formData.amount),
            method: formData.method,
            clientName: order.client?.name || 'Consumidor Final'
        });
        setFormData({ orderId: '', amount: '', method: 'Efectivo' });
    };

    const totalPaid = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const cashPayments = payments.filter(p => p.method === 'Efectivo').reduce((acc, p) => acc + (p.amount || 0), 0);
    const transferPayments = payments.filter(p => p.method === 'Transferencia').reduce((acc, p) => acc + (p.amount || 0), 0);

    const getMethodIcon = (method) => {
        switch (method) {
            case 'Efectivo': return <Banknote className="w-4 h-4 text-green-400" />;
            case 'Tarjeta': return <CreditCard className="w-4 h-4 text-blue-400" />;
            case 'Transferencia': return <Wallet className="w-4 h-4 text-purple-400" />;
            default: return <DollarSign className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <Helmet><title>Pagos y Cobranzas - Alambrados Belgrano</title></Helmet>

            <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-500" />
                Pagos y Cobranzas
            </h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-sm">Total Cobrado</p>
                    <h3 className="text-2xl font-bold text-white">${totalPaid.toLocaleString('es-AR')}</h3>
                </div>
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-sm">Efectivo</p>
                    <h3 className="text-2xl font-bold text-green-400">${cashPayments.toLocaleString('es-AR')}</h3>
                </div>
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-sm">Transferencias</p>
                    <h3 className="text-2xl font-bold text-purple-400">${transferPayments.toLocaleString('es-AR')}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Register Payment Form */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <DollarSign className="text-green-500" /> Registrar Pago
                    </h2>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="text-slate-300 block mb-1 text-sm">Orden de Venta</label>
                            <select
                                value={formData.orderId}
                                onChange={e => setFormData({ ...formData, orderId: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                required
                            >
                                <option value="">Seleccionar Orden Pendiente</option>
                                {orders.map(o => (
                                    <option key={o.id} value={o.id}>
                                        {o.orderNumber} - {o.client?.name || 'Sin nombre'} (Saldo: ${((o.total || 0) - (o.paid || 0)).toLocaleString('es-AR')})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-slate-300 block mb-1 text-sm">Monto</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-slate-300 block mb-1 text-sm">Método de Pago</label>
                            <select
                                value={formData.method}
                                onChange={e => setFormData({ ...formData, method: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"
                            >
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Tarjeta">Tarjeta</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Cuenta Corriente">Cuenta Corriente</option>
                            </select>
                        </div>
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                            Confirmar Pago
                        </Button>
                    </form>
                </div>

                {/* Payments List */}
                <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-700">
                        <h2 className="text-xl font-bold text-white">Últimos Pagos</h2>
                    </div>
                    <table className="w-full">
                        <thead className="bg-slate-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Fecha</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Orden</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Cliente</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Método</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {payments.map(pay => (
                                <tr key={pay.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-4 py-3 text-slate-400 text-sm">{new Date(pay.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-slate-300 font-mono text-sm">{pay.orderNumber}</td>
                                    <td className="px-4 py-3 text-white font-medium">{pay.clientName || '-'}</td>
                                    <td className="px-4 py-3 text-slate-300 flex items-center gap-2">
                                        {getMethodIcon(pay.method)}
                                        {pay.method}
                                    </td>
                                    <td className="px-4 py-3 text-right text-green-400 font-bold">${(pay.amount || 0).toLocaleString('es-AR')}</td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-slate-500">No hay pagos registrados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Payments;
