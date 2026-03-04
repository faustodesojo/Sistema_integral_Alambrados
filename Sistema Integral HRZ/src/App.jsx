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
import OrdersDashboard from '@/pages/OrdersDashboard';
import Reports from '@/pages/Reports';
import QuoteHistory from '@/pages/QuoteHistory';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-slate-900">
          <Navigation />
          <Routes>
            <Route path="/" element={<SalesDashboard />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* New Routes Protected by Auth */}
            <Route path="/quote-history" element={<ProtectedRoute><QuoteHistory /></ProtectedRoute>} />
            <Route path="/sales-orders" element={<ProtectedRoute><SalesOrders /></ProtectedRoute>} />
            <Route path="/warehouse-orders" element={<ProtectedRoute><WarehouseOrders /></ProtectedRoute>} />
            <Route path="/returns" element={<ProtectedRoute><Returns /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/orders-dashboard" element={<ProtectedRoute><OrdersDashboard /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;