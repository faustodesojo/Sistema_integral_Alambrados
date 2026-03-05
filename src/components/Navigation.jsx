import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, LogOut, User, ShoppingCart, Package, DollarSign, BarChart2, FileText, Wallet, RotateCcw, Settings, Store, Home } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';

const ROLE_LABELS = {
    admin: { label: 'Admin', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    sales: { label: 'Ventas', bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    warehouse: { label: 'Depósito', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
};

const Navigation = () => {
    const { user, logout, warehouseOrders, cashRegister } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();

    const pendingWarehouse = warehouseOrders.filter(w => w.status === 'Pendiente').length;
    const role = user?.role;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const navLinkClass = (path) =>
        `text-xs px-2 py-1.5 rounded-md transition-all duration-200 flex items-center gap-1.5 ${isActive(path) ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`;

    // Define which links each role can see
    const canSee = (requiredRoles) => {
        if (!user) return false;
        if (!requiredRoles) return true;
        return requiredRoles.includes(role);
    };

    const roleStyle = ROLE_LABELS[role] || ROLE_LABELS.sales;

    return (
        <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl sticky top-0 z-50">
            <div className="container mx-auto px-4 py-2">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group shrink-0">
                        <motion.div whileHover={{ rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                            <Building2 className="w-7 h-7 text-orange-500" />
                        </motion.div>
                        <div className="hidden lg:block">
                            <h1 className="text-base font-bold text-white group-hover:text-orange-500 transition-colors leading-none">
                                Alambrados Belgrano
                            </h1>
                            <span className="text-[10px] text-slate-500 leading-none">Sistema Integral</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-1 overflow-x-auto">
                        <Link to="/" className={navLinkClass('/')}>
                            <FileText className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">Cotizador</span>
                        </Link>

                        {user && (
                            <>
                                {/* Sales Home - only for sales role */}
                                {canSee(['sales']) && (
                                    <Link to="/ventas-home" className={navLinkClass('/ventas-home')}>
                                        <Home className="w-3.5 h-3.5" />
                                        <span className="hidden md:inline">Inicio</span>
                                    </Link>
                                )}

                                {canSee(['admin', 'sales']) && (
                                    <Link to="/counter-sale" className={navLinkClass('/counter-sale')}>
                                        <Store className="w-3.5 h-3.5" />
                                        <span className="hidden md:inline">Mostrador</span>
                                    </Link>
                                )}

                                {canSee(['admin', 'sales']) && (
                                    <Link to="/quote-history" className={navLinkClass('/quote-history')}>
                                        <FileText className="w-3.5 h-3.5" />
                                        <span className="hidden lg:inline">Presupuestos</span>
                                    </Link>
                                )}



                                {canSee(['admin', 'sales', 'warehouse']) && (
                                    <Link to="/warehouse-orders" className="relative">
                                        <span className={navLinkClass('/warehouse-orders')}>
                                            <Package className="w-3.5 h-3.5" />
                                            <span className="hidden lg:inline">Depósito</span>
                                        </span>
                                        {pendingWarehouse > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center animate-pulse">
                                                {pendingWarehouse}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                {canSee(['admin', 'sales']) && (
                                    <Link to="/returns" className={navLinkClass('/returns')}>
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span className="hidden lg:inline">Devoluciones</span>
                                    </Link>
                                )}

                                {canSee(['admin', 'sales']) && (
                                    <Link to="/payments" className={navLinkClass('/payments')}>
                                        <DollarSign className="w-3.5 h-3.5" />
                                        <span className="hidden lg:inline">Pagos</span>
                                    </Link>
                                )}

                                {canSee(['admin', 'sales']) && (
                                    <Link to="/cash-register" className="relative">
                                        <span className={navLinkClass('/cash-register')}>
                                            <Wallet className="w-3.5 h-3.5" />
                                            <span className="hidden lg:inline">Caja</span>
                                        </span>
                                        {cashRegister?.isOpen && (
                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                                        )}
                                    </Link>
                                )}

                                {/* Admin-only links */}
                                {canSee(['admin']) && (
                                    <Link to="/reports" className={navLinkClass('/reports')}>
                                        <BarChart2 className="w-3.5 h-3.5" />
                                        <span className="hidden lg:inline">Reportes</span>
                                    </Link>
                                )}

                                {canSee(['admin']) && (
                                    <Link to="/admin" className={navLinkClass('/admin')}>
                                        <Settings className="w-3.5 h-3.5" />
                                        <span className="hidden md:inline">Admin</span>
                                    </Link>
                                )}
                            </>
                        )}

                        {user ? (
                            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-700 shrink-0">
                                <div className="flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-orange-500" />
                                    <span className="text-xs text-white font-medium hidden md:block">{user.username}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium hidden sm:block ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                                        {roleStyle.label}
                                    </span>
                                </div>
                                <Button onClick={handleLogout} variant="outline" size="sm" className="border-slate-700 hover:bg-slate-800 h-7 px-2">
                                    <LogOut className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        ) : (
                            <Link to="/login" className="ml-2">
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 h-7 text-xs">
                                    Ingresar
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
