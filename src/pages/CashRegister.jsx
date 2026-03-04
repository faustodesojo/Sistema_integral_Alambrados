import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Lock, Unlock, Clock, DollarSign, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/components/ui/use-toast';

const CashRegister = () => {
    const { cashRegister, openCashRegister, closeCashRegister, addCashMovement } = useAppContext();
    const { toast } = useToast();

    const [openingAmount, setOpeningAmount] = useState('');
    const [closingAmount, setClosingAmount] = useState('');
    const [movementForm, setMovementForm] = useState({ type: 'ingreso', amount: '', description: '', method: 'Efectivo' });

    const handleOpen = () => {
        if (!openingAmount || parseFloat(openingAmount) < 0) {
            toast({ title: "Error", description: "Ingrese un monto de apertura válido.", variant: "destructive" });
            return;
        }
        openCashRegister(openingAmount);
        setOpeningAmount('');
    };

    const handleClose = () => {
        if (!closingAmount || parseFloat(closingAmount) < 0) {
            toast({ title: "Error", description: "Ingrese el efectivo contado.", variant: "destructive" });
            return;
        }
        closeCashRegister(closingAmount);
        setClosingAmount('');
    };

    const handleAddMovement = (e) => {
        e.preventDefault();
        if (!movementForm.amount || parseFloat(movementForm.amount) <= 0) {
            toast({ title: "Error", description: "Ingrese un monto válido.", variant: "destructive" });
            return;
        }
        addCashMovement(movementForm.type, movementForm.amount, movementForm.description, movementForm.method);
        toast({ title: "Movimiento registrado", description: `${movementForm.type === 'ingreso' ? 'Ingreso' : 'Egreso'} de $${parseFloat(movementForm.amount).toLocaleString('es-AR')}` });
        setMovementForm({ type: 'ingreso', amount: '', description: '', method: 'Efectivo' });
    };

    // Calculate totals
    const totalIngresos = cashRegister.movements?.filter(m => m.type === 'ingreso').reduce((sum, m) => sum + m.amount, 0) || 0;
    const totalEgresos = cashRegister.movements?.filter(m => m.type === 'egreso').reduce((sum, m) => sum + m.amount, 0) || 0;
    const cashIngresos = cashRegister.movements?.filter(m => m.type === 'ingreso' && m.method === 'Efectivo').reduce((sum, m) => sum + m.amount, 0) || 0;
    const cashEgresos = cashRegister.movements?.filter(m => m.type === 'egreso' && m.method === 'Efectivo').reduce((sum, m) => sum + m.amount, 0) || 0;
    const expectedCash = (cashRegister.openingBalance || 0) + cashIngresos - cashEgresos;

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <Helmet><title>Caja Diaria - Alambrados Belgrano</title></Helmet>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-orange-500" />
                        Caja Diaria
                    </h1>
                    {cashRegister.isOpen && (
                        <Button
                            onClick={() => window.print()}
                            className="bg-slate-700 hover:bg-slate-600 text-white print:hidden"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimir Caja
                        </Button>
                    )}
                </div>

                {!cashRegister.isOpen ? (
                    /* CLOSED STATE - Show opening form + history */
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 max-w-md mx-auto text-center">
                            <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">Caja Cerrada</h2>
                            <p className="text-slate-400 mb-6">Ingrese el saldo inicial para abrir la caja del día.</p>
                            <div className="space-y-4">
                                <input
                                    type="number"
                                    value={openingAmount}
                                    onChange={(e) => setOpeningAmount(e.target.value)}
                                    placeholder="Saldo inicial en efectivo"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-center text-xl focus:ring-2 focus:ring-orange-500 outline-none"
                                    min="0"
                                    step="0.01"
                                />
                                <Button onClick={handleOpen} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                                    <Unlock className="w-5 h-5 mr-2" /> Abrir Caja
                                </Button>
                            </div>
                        </div>

                        {/* History */}
                        {cashRegister.history?.length > 0 && (
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-orange-500" />
                                    Historial de Cajas
                                </h3>
                                <div className="space-y-3">
                                    {cashRegister.history.map((entry, idx) => (
                                        <div key={idx} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-white font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                                                    <p className="text-slate-400 text-xs">Cerrada por: {entry.closedBy}</p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${entry.difference === 0 ? 'bg-green-500/20 text-green-400' : entry.difference > 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    Dif: ${(entry.difference || 0).toLocaleString('es-AR')}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-sm">
                                                <div><span className="text-slate-400">Apertura:</span> <span className="text-white">${(entry.openingBalance || 0).toLocaleString('es-AR')}</span></div>
                                                <div><span className="text-green-400">+Ingresos:</span> <span className="text-white">${(entry.totalIngresos || 0).toLocaleString('es-AR')}</span></div>
                                                <div><span className="text-red-400">−Egresos:</span> <span className="text-white">${(entry.totalEgresos || 0).toLocaleString('es-AR')}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* OPEN STATE */
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                                <p className="text-slate-400 text-sm">Saldo Inicial</p>
                                <h3 className="text-2xl font-bold text-white">${(cashRegister.openingBalance || 0).toLocaleString('es-AR')}</h3>
                            </div>
                            <div className="bg-slate-800 p-5 rounded-xl border border-green-500/30">
                                <p className="text-slate-400 text-sm">Ingresos</p>
                                <h3 className="text-2xl font-bold text-green-400">${totalIngresos.toLocaleString('es-AR')}</h3>
                            </div>
                            <div className="bg-slate-800 p-5 rounded-xl border border-red-500/30">
                                <p className="text-slate-400 text-sm">Egresos</p>
                                <h3 className="text-2xl font-bold text-red-400">${totalEgresos.toLocaleString('es-AR')}</h3>
                            </div>
                            <div className="bg-slate-800 p-5 rounded-xl border border-orange-500/30">
                                <p className="text-slate-400 text-sm">Efectivo Esperado</p>
                                <h3 className="text-2xl font-bold text-orange-400">${expectedCash.toLocaleString('es-AR')}</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Add Movement Form */}
                            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 print:hidden">
                                <h3 className="text-lg font-bold text-white mb-4">Registrar Movimiento</h3>
                                <form onSubmit={handleAddMovement} className="space-y-4">
                                    <div className="flex gap-2">
                                        <Button type="button" onClick={() => setMovementForm(f => ({ ...f, type: 'ingreso' }))}
                                            className={`flex-1 ${movementForm.type === 'ingreso' ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                            <ArrowUpCircle className="w-4 h-4 mr-1" /> Ingreso
                                        </Button>
                                        <Button type="button" onClick={() => setMovementForm(f => ({ ...f, type: 'egreso' }))}
                                            className={`flex-1 ${movementForm.type === 'egreso' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-600'}`}>
                                            <ArrowDownCircle className="w-4 h-4 mr-1" /> Egreso
                                        </Button>
                                    </div>
                                    <input type="number" value={movementForm.amount} onChange={e => setMovementForm(f => ({ ...f, amount: e.target.value }))}
                                        placeholder="Monto" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none" min="0" step="0.01" required />
                                    <input type="text" value={movementForm.description} onChange={e => setMovementForm(f => ({ ...f, description: e.target.value }))}
                                        placeholder="Descripción" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none" required />
                                    <select value={movementForm.method} onChange={e => setMovementForm(f => ({ ...f, method: e.target.value }))}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none">
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Transferencia">Transferencia</option>
                                        <option value="Tarjeta">Tarjeta</option>
                                    </select>
                                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">Registrar Movimiento</Button>
                                </form>
                            </div>

                            {/* Movement List */}
                            <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden print:w-full print:border-0 print:shadow-none print:col-span-3">
                                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-white">Movimientos del Día</h3>
                                    <span className="text-slate-400 text-sm">{cashRegister.movements?.length || 0} movimientos</span>
                                </div>
                                <div className="max-h-[500px] overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-900 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Hora</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Tipo</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Descripción</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Método</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/50">
                                            {(cashRegister.movements || []).slice().reverse().map(mov => (
                                                <tr key={mov.id} className="hover:bg-slate-700/30">
                                                    <td className="px-4 py-2 text-slate-400 text-sm">{new Date(mov.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${mov.type === 'ingreso' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                            {mov.type === 'ingreso' ? 'Ingreso' : 'Egreso'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-white text-sm">{mov.description}</td>
                                                    <td className="px-4 py-2 text-slate-400 text-sm">{mov.method}</td>
                                                    <td className={`px-4 py-2 text-right font-bold text-sm ${mov.type === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                                                        {mov.type === 'ingreso' ? '+' : '−'}${mov.amount.toLocaleString('es-AR')}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!cashRegister.movements || cashRegister.movements.length === 0) && (
                                                <tr><td colSpan="5" className="text-center py-8 text-slate-500">No hay movimientos registrados.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Close Cash Register */}
                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 print:hidden">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-red-400" />
                                Cierre de Caja
                            </h3>
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="text-slate-300 block mb-1 text-sm">Efectivo contado en caja</label>
                                    <input
                                        type="number"
                                        value={closingAmount}
                                        onChange={(e) => setClosingAmount(e.target.value)}
                                        placeholder="Monto contado..."
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-red-500 outline-none"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <Button onClick={handleClose} className="bg-red-600 hover:bg-red-700 h-12 px-6">
                                    <Lock className="w-4 h-4 mr-2" /> Cerrar Caja
                                </Button>
                            </div>
                            <p className="text-slate-500 text-xs mt-2">Efectivo esperado: ${expectedCash.toLocaleString('es-AR')}</p>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default CashRegister;
