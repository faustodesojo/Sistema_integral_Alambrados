import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { RefreshCcw, Check, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';

const Returns = () => {
  const { returns, orders, createReturn, updateReturnStatus } = useAppContext();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ orderId: '', reason: '', items: '', notes: '' });

  const handleCreate = (e) => {
    e.preventDefault();
    const order = orders.find(o => o.id === formData.orderId);
    if (!order) return;
    
    createReturn({
      orderId: formData.orderId,
      orderNumber: order.orderNumber,
      client: order.client,
      reason: formData.reason,
      notes: formData.notes,
      items: formData.items // simplified text for now
    });
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <Helmet><title>Devoluciones - Sistema</title></Helmet>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Gestión de Devoluciones</h1>
        <Button onClick={() => setIsCreating(!isCreating)} className="bg-orange-600 hover:bg-orange-700">
          {isCreating ? 'Cancelar' : 'Solicitar Devolución'}
        </Button>
      </div>

      {isCreating && (
        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mb-8 overflow-hidden">
          <form onSubmit={handleCreate} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
            <div>
              <label className="text-slate-300 block mb-1">Orden de Venta</label>
              <select 
                value={formData.orderId}
                onChange={e => setFormData({...formData, orderId: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                required
              >
                <option value="">Seleccionar Orden</option>
                {orders.filter(o => o.status !== 'Cancelada').map(o => (
                  <option key={o.id} value={o.id}>{o.orderNumber} - {o.client.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-300 block mb-1">Motivo</label>
              <select
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                required
              >
                <option value="">Seleccionar Motivo</option>
                <option value="Defecto">Producto Defectuoso</option>
                <option value="Cambio">Cambio por otro producto</option>
                <option value="Error">Error en pedido</option>
              </select>
            </div>
            <Button type="submit" className="w-full bg-orange-600">Crear Solicitud</Button>
          </form>
        </motion.div>
      )}

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Número</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Orden Orig.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Motivo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {returns.map(ret => (
              <tr key={ret.id}>
                <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{ret.number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-300">{ret.orderNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-300">{ret.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    ret.status === 'Solicitada' ? 'bg-yellow-100 text-yellow-800' :
                    ret.status === 'Aprobada' ? 'bg-green-100 text-green-800' :
                    ret.status === 'Rechazada' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {ret.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {ret.status === 'Solicitada' && (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => updateReturnStatus(ret.id, 'Aprobada')} className="bg-green-600 h-8 w-8 p-0"><Check className="w-4 h-4" /></Button>
                      <Button size="sm" onClick={() => updateReturnStatus(ret.id, 'Rechazada')} className="bg-red-600 h-8 w-8 p-0"><X className="w-4 h-4" /></Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Returns;