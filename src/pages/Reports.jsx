import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BarChart3, Download, TrendingUp, Users, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444', '#eab308'];

const Reports = () => {
    const { orders, payments, clients, products } = useAppContext();

    const totalSales = orders.length;
    const totalRevenue = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    const counterSales = orders.filter(o => o.isCounterSale).length;

    // Sales by day (last 7 days)
    const salesByDay = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' });
            const dayOrders = orders.filter(o => {
                const orderDate = new Date(o.date);
                return orderDate.toDateString() === date.toDateString();
            });
            days.push({
                name: dateStr,
                ventas: dayOrders.length,
                ingresos: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
            });
        }
        return days;
    }, [orders]);

    // Payment methods distribution
    const paymentMethodData = useMemo(() => {
        const methods = {};
        payments.forEach(p => {
            const method = p.method || 'Otro';
            methods[method] = (methods[method] || 0) + (p.amount || 0);
        });
        return Object.entries(methods).map(([name, value]) => ({ name, value }));
    }, [payments]);

    // Top products
    const topProducts = useMemo(() => {
        const productCounts = {};
        orders.forEach(order => {
            (order.items || []).forEach(item => {
                const name = item.name || 'Desconocido';
                if (!productCounts[name]) productCounts[name] = { name, count: 0, revenue: 0 };
                productCounts[name].count += (item.quantity || 1);
                productCounts[name].revenue += (item.total || item.unitPrice * (item.quantity || 1) || 0);
            });
        });
        return Object.values(productCounts).sort((a, b) => b.count - a.count).slice(0, 10);
    }, [orders]);

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <Helmet><title>Reportes - Alambrados Belgrano</title></Helmet>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-orange-500" />
                            Reportes y Estadísticas
                        </h1>
                        <p className="text-slate-400 mt-1">Análisis de ventas, clientes y productos.</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-5 rounded-xl border border-orange-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <ShoppingBag className="w-5 h-5 text-orange-500" />
                            <p className="text-slate-400 text-sm">Ventas Totales</p>
                        </div>
                        <h3 className="text-3xl font-bold text-white">{totalSales}</h3>
                        <p className="text-xs text-slate-500 mt-1">{counterSales} en mostrador</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 p-5 rounded-xl border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            <p className="text-slate-400 text-sm">Ingresos Totales</p>
                        </div>
                        <h3 className="text-3xl font-bold text-white">${totalRevenue.toLocaleString('es-AR')}</h3>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-5 rounded-xl border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                            <p className="text-slate-400 text-sm">Ticket Promedio</p>
                        </div>
                        <h3 className="text-3xl font-bold text-white">${avgTicket.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</h3>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-5 rounded-xl border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-purple-500" />
                            <p className="text-slate-400 text-sm">Clientes Activos</p>
                        </div>
                        <h3 className="text-3xl font-bold text-white">{clients.length}</h3>
                    </div>
                </div>

                <Tabs defaultValue="sales" className="space-y-6">
                    <TabsList className="bg-slate-800 border border-slate-700">
                        <TabsTrigger value="sales" className="data-[state=active]:bg-orange-600">Ventas</TabsTrigger>
                        <TabsTrigger value="products" className="data-[state=active]:bg-orange-600">Productos</TabsTrigger>
                        <TabsTrigger value="clients" className="data-[state=active]:bg-orange-600">Clientes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="sales">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Sales Chart */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Ventas Últimos 7 Días</h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={salesByDay}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                            <YAxis stroke="#94a3b8" fontSize={12} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                                            <Bar dataKey="ingresos" fill="#f97316" radius={[4, 4, 0, 0]} name="Ingresos ($)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Métodos de Pago</h3>
                                {paymentMethodData.length > 0 ? (
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={paymentMethodData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                                    {paymentMethodData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} formatter={(value) => `$${value.toLocaleString('es-AR')}`} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-[300px] flex items-center justify-center text-slate-500">Sin datos de pagos</div>
                                )}
                            </div>
                        </div>

                        {/* Orders Table */}
                        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mt-6">
                            <table className="w-full">
                                <thead className="bg-slate-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-slate-400 text-xs uppercase">Fecha</th>
                                        <th className="px-4 py-3 text-left text-slate-400 text-xs uppercase">Orden</th>
                                        <th className="px-4 py-3 text-left text-slate-400 text-xs uppercase">Cliente</th>
                                        <th className="px-4 py-3 text-left text-slate-400 text-xs uppercase">Tipo</th>
                                        <th className="px-4 py-3 text-right text-slate-400 text-xs uppercase">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {orders.slice(0, 20).map(o => (
                                        <tr key={o.id} className="hover:bg-slate-700/30">
                                            <td className="px-4 py-2 text-slate-300 text-sm">{new Date(o.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-2 text-white font-medium font-mono text-sm">{o.orderNumber}</td>
                                            <td className="px-4 py-2 text-slate-300 text-sm">{o.client?.name || '-'}</td>
                                            <td className="px-4 py-2">
                                                <span className={`text-xs px-2 py-0.5 rounded ${o.isCounterSale ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {o.isCounterSale ? 'Mostrador' : 'Presupuesto'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-right text-white font-medium">${(o.total || 0).toLocaleString('es-AR')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>

                    <TabsContent value="products">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Productos Más Vendidos</h3>
                            {topProducts.length > 0 ? (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left px-4 py-2 text-slate-400 text-xs uppercase">#</th>
                                            <th className="text-left px-4 py-2 text-slate-400 text-xs uppercase">Producto</th>
                                            <th className="text-right px-4 py-2 text-slate-400 text-xs uppercase">Cantidad</th>
                                            <th className="text-right px-4 py-2 text-slate-400 text-xs uppercase">Ingresos</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {topProducts.map((product, idx) => (
                                            <tr key={idx} className="hover:bg-slate-700/30">
                                                <td className="px-4 py-2 text-slate-500 text-sm">{idx + 1}</td>
                                                <td className="px-4 py-2 text-white text-sm">{product.name}</td>
                                                <td className="px-4 py-2 text-right text-slate-300 font-medium">{product.count}</td>
                                                <td className="px-4 py-2 text-right text-green-400 font-medium">${product.revenue.toLocaleString('es-AR')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center text-slate-500 py-8">No hay datos de ventas aún.</p>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="clients">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-900">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-slate-400 text-xs uppercase">Cliente</th>
                                        <th className="px-4 py-3 text-center text-slate-400 text-xs uppercase">Actividades</th>
                                        <th className="px-4 py-3 text-left text-slate-400 text-xs uppercase">Última Actividad</th>
                                        <th className="px-4 py-3 text-left text-slate-400 text-xs uppercase">Desde</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {clients.map(client => (
                                        <tr key={client.id} className="hover:bg-slate-700/30">
                                            <td className="px-4 py-3 text-white font-medium">{client.name}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs">{client.activities?.length || 0}</span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 text-sm">{client.lastActivity ? new Date(client.lastActivity).toLocaleDateString() : '-'}</td>
                                            <td className="px-4 py-3 text-slate-400 text-sm">{client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '-'}</td>
                                        </tr>
                                    ))}
                                    {clients.length === 0 && (
                                        <tr><td colSpan="4" className="text-center py-12 text-slate-500">No hay clientes registrados.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </div>
    );
};

export default Reports;
