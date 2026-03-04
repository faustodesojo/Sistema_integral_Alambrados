import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, LogOut, User, ShoppingCart, Package, DollarSign, BarChart2, Bell, FileText } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const { user, logout, warehouseOrders } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Simple Notification Badge Logic
  const pendingWarehouse = warehouseOrders.filter(w => w.status === 'Pendiente').length;
  const hasNotifications = pendingWarehouse > 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div whileHover={{ rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Building2 className="w-8 h-8 text-orange-500" />
            </motion.div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors">
                Sistema Integral
              </h1>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link to="/">
               <Button variant={isActive('/') ? "default" : "ghost"} className={isActive('/') ? "bg-slate-800 text-white" : "text-slate-300"}>
                 Ventas
               </Button>
            </Link>

            {user && (
              <>
                <Link to="/quote-history">
                   <Button variant="ghost" size="icon" title="Historial Presupuestos" className={isActive('/quote-history') ? "text-orange-500" : "text-slate-300"}>
                     <FileText className="w-5 h-5" />
                   </Button>
                </Link>
                <Link to="/sales-orders">
                   <Button variant="ghost" size="icon" title="Órdenes" className={isActive('/sales-orders') ? "text-orange-500" : "text-slate-300"}>
                     <ShoppingCart className="w-5 h-5" />
                   </Button>
                </Link>
                <Link to="/warehouse-orders" className="relative">
                   <Button variant="ghost" size="icon" title="Depósito" className={isActive('/warehouse-orders') ? "text-orange-500" : "text-slate-300"}>
                     <Package className="w-5 h-5" />
                   </Button>
                   {pendingWarehouse > 0 && (
                     <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-slate-900" />
                   )}
                </Link>
                <Link to="/payments">
                   <Button variant="ghost" size="icon" title="Pagos" className={isActive('/payments') ? "text-orange-500" : "text-slate-300"}>
                     <DollarSign className="w-5 h-5" />
                   </Button>
                </Link>
                <Link to="/reports">
                   <Button variant="ghost" size="icon" title="Reportes" className={isActive('/reports') ? "text-orange-500" : "text-slate-300"}>
                     <BarChart2 className="w-5 h-5" />
                   </Button>
                </Link>
              </>
            )}
            
            {user && user.role === 'admin' && (
              <Link to="/admin">
                <Button variant="ghost" className={isActive('/admin') ? "text-white bg-slate-800" : "text-slate-300"}>
                  Admin
                </Button>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-700">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-white font-medium hidden md:block">{user.username}</span>
                </div>
                {hasNotifications && <Bell className="w-4 h-4 text-orange-500 animate-pulse" />}
                <Button onClick={handleLogout} variant="outline" size="sm" className="border-slate-700 hover:bg-slate-800">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-orange-600 hover:bg-orange-700">
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