import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { Toaster } from '@/components/ui/toaster';
import Navigation from '@/components/Navigation';
import SalesDashboard from '@/pages/SalesDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import LoginPage from '@/pages/LoginPage';
import SalesOrders from '@/pages/SalesOrders';
import WarehouseOrders from '@/pages/WarehouseOrders';
import Returns from '@/pages/Returns';
import Payments from '@/pages/Payments';
import CounterSale from '@/pages/CounterSale';
import CashRegister from '@/pages/CashRegister';
import Reports from '@/pages/Reports';
import QuoteHistory from '@/pages/QuoteHistory';
import SalesHome from '@/pages/SalesHome';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
    return (
        <AppProvider>
            <Router>
                <div className="min-h-screen bg-slate-900">
                    <Navigation />
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<SalesDashboard />} />
                        <Route path="/login" element={<LoginPage />} />

                        {/* Sales-specific home */}
                        <Route path="/ventas-home" element={
                            <ProtectedRoute allowedRoles={['sales']}>
                                <SalesHome />
                            </ProtectedRoute>
                        } />

                        {/* Shared: Admin + Sales */}
                        <Route path="/counter-sale" element={
                            <ProtectedRoute allowedRoles={['admin', 'sales']}>
                                <CounterSale />
                            </ProtectedRoute>
                        } />
                        <Route path="/quote-history" element={
                            <ProtectedRoute allowedRoles={['admin', 'sales']}>
                                <QuoteHistory />
                            </ProtectedRoute>
                        } />
                        <Route path="/sales-orders" element={
                            <ProtectedRoute allowedRoles={['admin', 'sales']}>
                                <SalesOrders />
                            </ProtectedRoute>
                        } />
                        <Route path="/returns" element={
                            <ProtectedRoute allowedRoles={['admin', 'sales']}>
                                <Returns />
                            </ProtectedRoute>
                        } />
                        <Route path="/payments" element={
                            <ProtectedRoute allowedRoles={['admin', 'sales']}>
                                <Payments />
                            </ProtectedRoute>
                        } />
                        <Route path="/cash-register" element={
                            <ProtectedRoute allowedRoles={['admin', 'sales']}>
                                <CashRegister />
                            </ProtectedRoute>
                        } />

                        {/* Shared: Admin + Sales + Warehouse */}
                        <Route path="/warehouse-orders" element={
                            <ProtectedRoute allowedRoles={['admin', 'sales', 'warehouse']}>
                                <WarehouseOrders />
                            </ProtectedRoute>
                        } />

                        {/* Admin-only */}
                        <Route path="/reports" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Reports />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                    </Routes>
                    <Toaster />
                </div>
            </Router>
        </AppProvider>
    );
}

export default App;
