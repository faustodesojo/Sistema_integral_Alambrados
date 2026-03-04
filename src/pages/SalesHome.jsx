import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText, Store, ShoppingCart, Wallet, Package, RotateCcw, DollarSign,
    TrendingUp, Clock, Receipt, ArrowRight
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

const StatCard = ({ icon: Icon, label, value, color, sublabel }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-all"
    >
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
                {sublabel && <p className="text-[10px] text-slate-500">{sublabel}</p>}
            </div>
        </div>
    </motion.div>
);

const QuickLink = ({ to, icon: Icon, title, description, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
    >
        <Link
            to={to}
            className="group block bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-xl p-5 hover:border-orange-500/50 hover:bg-slate-800/70 transition-all duration-300"
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-orange-400 transition-colors">{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
        </Link>
    </motion.div>
);

const SalesHome = () => {
    const { orders, presupuestos, cashRegister, user, payments } = useAppContext();

    // Today calculations
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.date?.startsWith(today));
    const todayQuotes = presupuestos.filter(p => p.date?.startsWith(today));
    const todayPayments = payments.filter(p => p.date?.startsWith(today));
    const todayRevenue = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingOrders = orders.filter(o => o.status === 'Confirmada' || o.status === 'En Preparación');

    // Last 5 operations
    const recentOps = [
        ...todayOrders.map(o => ({ type: 'Venta', id: o.orderNumber, total: o.total, date: o.date })),
        ...todayQuotes.map(p => ({ type: 'Presup.', id: `#${String(p.quoteNumber || p.id).padStart(3, '0')}`, total: p.total, date: p.date })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    return (
        <>
            <Helmet>
                <title>Panel de Ventas - Alambrados Belgrano</title>
                <meta name="description" content="Dashboard del vendedor con resumen del día" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
                    <div className="absolute inset-0 opacity-5">
                        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent" />
                    </div>
                    <div className="relative container mx-auto px-4 py-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <p className="text-sm text-orange-500 font-medium mb-1">
                                Bienvenido, {user?.username || 'Vendedor'}
                            </p>
                            <h1 className="text-3xl font-bold text-white mb-1">
                                Panel de Ventas
                            </h1>
                            <p className="text-slate-400 text-sm">
                                Resumen del día — {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                        </motion.div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-6 space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={TrendingUp}
                            label="Facturado hoy"
                            value={`$${todayRevenue.toLocaleString('es-AR')}`}
                            color="bg-green-600"
                        />
                        <StatCard
                            icon={Receipt}
                            label="Ventas del día"
                            value={todayOrders.length}
                            color="bg-orange-600"
                        />
                        <StatCard
                            icon={FileText}
                            label="Presupuestos hoy"
                            value={todayQuotes.length}
                            color="bg-blue-600"
                        />
                        <StatCard
                            icon={Clock}
                            label="Órdenes pendientes"
                            value={pendingOrders.length}
                            color="bg-yellow-600"
                        />
                    </div>

                    {/* Caja Status Banner */}
                    {cashRegister?.isOpen ? (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm text-green-400 font-medium">Caja Abierta</span>
                                <span className="text-xs text-slate-500">
                                    — Saldo inicial: ${cashRegister.openingBalance?.toLocaleString('es-AR')}
                                </span>
                            </div>
                            <Link to="/cash-register" className="text-xs text-green-400 hover:text-green-300 underline underline-offset-4">
                                Ver caja →
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                <span className="text-sm text-yellow-400 font-medium">Caja Cerrada</span>
                            </div>
                            <Link to="/cash-register" className="text-xs text-yellow-400 hover:text-yellow-300 underline underline-offset-4">
                                Abrir caja →
                            </Link>
                        </div>
                    )}

                    {/* Quick Access Grid */}
                    <div>
                        <h2 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Accesos Rápidos</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <QuickLink
                                to="/"
                                icon={FileText}
                                title="Cotizador"
                                description="Armar presupuesto con cálculo de materiales"
                                color="bg-gradient-to-br from-orange-500 to-orange-700"
                                delay={0}
                            />
                            <QuickLink
                                to="/counter-sale"
                                icon={Store}
                                title="Venta Mostrador"
                                description="Venta directa sin presupuesto previo"
                                color="bg-gradient-to-br from-green-500 to-green-700"
                                delay={0.05}
                            />
                            <QuickLink
                                to="/quote-history"
                                icon={Receipt}
                                title="Presupuestos"
                                description="Historial y seguimiento de cotizaciones"
                                color="bg-gradient-to-br from-blue-500 to-blue-700"
                                delay={0.1}
                            />
                            <QuickLink
                                to="/cash-register"
                                icon={Wallet}
                                title="Caja Diaria"
                                description="Apertura, movimientos y cierre de caja"
                                color="bg-gradient-to-br from-purple-500 to-purple-700"
                                delay={0.15}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Operations */}
                        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700 rounded-xl p-4">
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-500" />
                                Últimas Operaciones de Hoy
                            </h3>
                            {recentOps.length > 0 ? (
                                <div className="space-y-2">
                                    {recentOps.map((op, idx) => (
                                        <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${op.type === 'Venta' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {op.type}
                                                </span>
                                                <span className="text-sm text-white font-medium">{op.id}</span>
                                            </div>
                                            <span className="text-sm text-slate-300 font-mono">
                                                ${(op.total || 0).toLocaleString('es-AR')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    No hay operaciones hoy. ¡Hora de vender! 🚀
                                </div>
                            )}
                        </div>

                        {/* More Quick Links */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Más Acciones</h3>
                            <Link to="/sales-orders" className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700 rounded-lg hover:border-slate-600 transition-all group">
                                <ShoppingCart className="w-4 h-4 text-orange-500" />
                                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Órdenes de Venta</span>
                            </Link>
                            <Link to="/warehouse-orders" className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700 rounded-lg hover:border-slate-600 transition-all group">
                                <Package className="w-4 h-4 text-orange-500" />
                                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Depósito</span>
                            </Link>
                            <Link to="/returns" className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700 rounded-lg hover:border-slate-600 transition-all group">
                                <RotateCcw className="w-4 h-4 text-orange-500" />
                                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Devoluciones</span>
                            </Link>
                            <Link to="/payments" className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-700 rounded-lg hover:border-slate-600 transition-all group">
                                <DollarSign className="w-4 h-4 text-orange-500" />
                                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Pagos</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SalesHome;
