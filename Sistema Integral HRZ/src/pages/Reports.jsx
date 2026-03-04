import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/context/AppContext';

const Reports = () => {
  const { orders, payments } = useAppContext();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Simplified Logic for Reports
  const totalSales = orders.length;
  const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <Helmet><title>Reportes - Sistema</title></Helmet>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Reportes y Estadísticas</h1>
        <Button variant="outline" className="border-slate-700 text-slate-300">
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="sales" className="data-[state=active]:bg-orange-600">Ventas</TabsTrigger>
          <TabsTrigger value="clients" className="data-[state=active]:bg-orange-600">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
               <p className="text-slate-400 text-sm">Ventas Totales</p>
               <h3 className="text-2xl font-bold text-white">{totalSales}</h3>
             </div>
             <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
               <p className="text-slate-400 text-sm">Ingresos Totales</p>
               <h3 className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</h3>
             </div>
             <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
               <p className="text-slate-400 text-sm">Ticket Promedio</p>
               <h3 className="text-2xl font-bold text-white">${avgTicket.toLocaleString()}</h3>
             </div>
           </div>

           <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
             <table className="w-full">
               <thead className="bg-slate-900">
                 <tr>
                   <th className="px-6 py-3 text-left text-slate-400 text-xs uppercase">Fecha</th>
                   <th className="px-6 py-3 text-left text-slate-400 text-xs uppercase">Orden</th>
                   <th className="px-6 py-3 text-left text-slate-400 text-xs uppercase">Cliente</th>
                   <th className="px-6 py-3 text-right text-slate-400 text-xs uppercase">Monto</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-700">
                 {orders.map(o => (
                   <tr key={o.id}>
                     <td className="px-6 py-4 text-slate-300">{new Date(o.date).toLocaleDateString()}</td>
                     <td className="px-6 py-4 text-white font-medium">{o.orderNumber}</td>
                     <td className="px-6 py-4 text-slate-300">{o.client.name}</td>
                     <td className="px-6 py-4 text-right text-white">${o.total?.toLocaleString()}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </TabsContent>

        <TabsContent value="clients">
           <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center text-slate-500">
             Funcionalidad de reporte por cliente en desarrollo.
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;