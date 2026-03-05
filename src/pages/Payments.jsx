import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { DollarSign, CreditCard, Banknote, Wallet, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';

const Payments = () => {
    const { payments, presupuestos, createPayment } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [formData, setFormData] = useState({ amount: '', method: 'Efectivo' });

    // Filter presupuestos by search term
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
        // Pre-fill the remaining balance
        const remaining = (quote.total || 0) - (quote.paid || 0);
        setFormData(prev => ({ ...prev, amount: remaining > 0 ? remaining.toString() : '' }));
    };

    const handleRegister = (e) => {
        e.preventDefault();
        if (!selectedQuote) return;
        const amount = parseFloat(formData.amount);
        if (!amount || amount <= 0) return;

        createPayment({
            quoteId: selectedQuote.id,
            quoteNumber: selectedQuote.quoteNumber,
            amount: amount,
            method: formData.method,
            clientName: selectedQuote.clientData?.name || 'Consumidor Final'
        });

        setSelectedQuote(null);
        setFormData({ amount: '', method: 'Efectivo' });
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
                        {/* Search by quote/client */}
                        {!selectedQuote ? (
                            <div className="relative">
                                <label className="text-slate-300 block mb-1 text-sm">Buscar Presupuesto o Cliente</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Nombre del cliente o nro. de presupuesto..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                                {filteredQuotes.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                        {filteredQuotes.map(q => {
                                            const remaining = (q.total || 0) - (q.paid || 0);
                                            return (
                                                <button
                                                    key={q.id}
                                                    type="button"
                                                    onClick={() => handleSelectQuote(q)}
                                                    className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-0"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <span className="text-white font-medium">{q.clientData?.name || 'Sin nombre'}</span>
                                                            <span className="text-slate-400 text-xs ml-2">#{String(q.quoteNumber || q.id).padStart(3, '0')}</span>
                                                            {q.status === 'Vendido' && <span className="ml-2 text-green-400 text-xs font-medium">Vendido</span>}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-orange-400 font-bold text-sm">${(q.total || 0).toLocaleString('es-AR')}</div>
                                                            {remaining > 0 && <div className="text-yellow-400 text-xs">Saldo: ${remaining.toLocaleString('es-AR')}</div>}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-slate-900 border border-orange-500/30 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-white font-bold">{selectedQuote.clientData?.name || 'Sin nombre'}</span>
                                        <span className="text-slate-400 text-xs ml-2">#{String(selectedQuote.quoteNumber || selectedQuote.id).padStart(3, '0')}</span>
                                    </div>
                                    <Button type="button" size="sm" variant="outline" onClick={() => setSelectedQuote(null)} className="border-slate-600 text-slate-300 hover:bg-slate-700 h-7 text-xs">
                                        Cambiar
                                    </Button>
                                </div>
                                <div className="flex justify-between mt-2 text-sm">
                                    <span className="text-slate-400">Total: <span className="text-white font-medium">${(selectedQuote.total || 0).toLocaleString('es-AR')}</span></span>
                                    <span className="text-slate-400">Pagado: <span className="text-green-400 font-medium">${(selectedQuote.paid || 0).toLocaleString('es-AR')}</span></span>
                                    <span className="text-slate-400">Saldo: <span className="text-yellow-400 font-bold">${((selectedQuote.total || 0) - (selectedQuote.paid || 0)).toLocaleString('es-AR')}</span></span>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-slate-300 block mb-1 text-sm">Monto a Pagar</label>
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
                        <Button type="submit" disabled={!selectedQuote} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg disabled:opacity-50">
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
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Presupuesto</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Cliente</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Método</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {payments.map(pay => (
                                <tr key={pay.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-4 py-3 text-slate-400 text-sm">{new Date(pay.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-slate-300 font-mono text-sm">#{String(pay.quoteNumber || pay.orderNumber || '-').padStart(3, '0')}</td>
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
