import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, AlertTriangle, DollarSign } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

const KPI = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 p-4 opacity-10 ${color}`}>
      <Icon className="w-20 h-20" />
    </div>
    <div className="relative z-10">
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white">{value}</h3>
    </div>
  </motion.div>
);

const OrdersDashboard = () => {
  const { orders, returns, payments } = useAppContext();

  const pendingOrders = orders.filter(o => o.status === 'Pendiente').length;
  const totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pendingReturns = returns.filter(r => r.status === 'Solicitada').length;
  // Simplified logic for unpaid - assuming all orders need full payment
  const unpaidOrders = orders.length - payments.length; 

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <Helmet><title>Dashboard de Pedidos - Sistema</title></Helmet>
      
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard General</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPI title="Órdenes Pendientes" value={pendingOrders} icon={ShoppingBag} color="text-blue-500" delay={0.1} />
        <KPI title="Ingresos Totales" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} color="text-green-500" delay={0.2} />
        <KPI title="Devoluciones Pend." value={pendingReturns} icon={AlertTriangle} color="text-red-500" delay={0.3} />
        <KPI title="Ventas Totales (Cant)" value={orders.length} icon={TrendingUp} color="text-purple-500" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Órdenes Recientes</h3>
          <div className="space-y-4">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between border-b border-slate-700 pb-3 last:border-0">
                <div>
                  <p className="font-semibold text-white">{order.orderNumber}</p>
                  <p className="text-sm text-slate-400">{order.client.name}</p>
                </div>
                <div className="text-right">
                   <span className={`text-xs px-2 py-1 rounded-full ${
                     order.status === 'Confirmada' ? 'bg-green-900 text-green-300' : 'bg-slate-700 text-slate-300'
                   }`}>
                     {order.status}
                   </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Chart Placeholder (Using pure CSS/Motion) */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-xl font-bold text-white mb-6">Estado de Órdenes</h3>
          <div className="flex items-end justify-between h-48 space-x-2">
            {['Pendiente', 'Confirmada', 'En Prep.', 'Lista', 'Entregada'].map((status, i) => {
              const count = orders.filter(o => o.status.includes(status.split(' ')[0])).length; // fuzzy match for demo
              const height = orders.length ? (count / orders.length) * 100 : 0;
              return (
                <div key={i} className="flex flex-col items-center justify-end h-full w-full">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 5)}%` }}
                    className="w-full bg-orange-600/50 rounded-t-sm hover:bg-orange-500 transition-colors"
                  />
                  <span className="text-xs text-slate-400 mt-2 rotate-0 truncate w-full text-center">{status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersDashboard;