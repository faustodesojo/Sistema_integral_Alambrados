import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { DollarSign, CreditCard, Banknote } from 'lucide-react';
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
      clientName: order.client.name
    });
    setFormData({ orderId: '', amount: '', method: 'Efectivo' });
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <Helmet><title>Pagos y Caja - Sistema</title></Helmet>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Register Payment Form */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <DollarSign className="text-green-500" /> Registrar Pago
          </h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-slate-300 block mb-1">Orden de Venta</label>
              <select
                value={formData.orderId}
                onChange={e => setFormData({...formData, orderId: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white"
                required
              >
                <option value="">Seleccionar Orden Pendiente</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>{o.orderNumber} - Total: ${o.total}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-300 block mb-1">Monto</label>
              <input
                type="number"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1">Método de Pago</label>
              <select
                value={formData.method}
                onChange={e => setFormData({...formData, method: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
              Confirmar Pago
            </Button>
          </form>
        </div>

        {/* Payments List */}
        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
           <div className="p-6 border-b border-slate-700">
             <h2 className="text-xl font-bold text-white">Últimos Pagos</h2>
           </div>
           <table className="w-full">
             <thead className="bg-slate-900">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Orden</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Cliente</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Método</th>
                 <th className="px-6 py-3 text-right text-xs font-medium text-slate-400">Monto</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-700">
               {payments.map(pay => (
                 <tr key={pay.id}>
                   <td className="px-6 py-4 text-slate-300">{pay.orderNumber}</td>
                   <td className="px-6 py-4 text-white font-medium">{pay.clientName}</td>
                   <td className="px-6 py-4 text-slate-300 flex items-center gap-2">
                     {pay.method === 'Efectivo' ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                     {pay.method}
                   </td>
                   <td className="px-6 py-4 text-right text-green-400 font-bold">${pay.amount?.toLocaleString()}</td>
                 </tr>
               ))}
               {payments.length === 0 && (
                 <tr>
                   <td colSpan="4" className="text-center py-8 text-slate-500">No hay pagos registrados.</td>
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