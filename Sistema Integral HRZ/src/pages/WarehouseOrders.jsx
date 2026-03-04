import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Package, Search, Filter, Eye, Download, Trash2, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppContext } from '@/context/AppContext';
import WarehouseOrderDetailsModal from '@/components/WarehouseOrderDetailsModal';
import { generateWarehousePDF } from '@/utils/WarehousePDFGenerator';
import { useToast } from '@/components/ui/use-toast';

const WarehouseOrders = () => {
  const { warehouseOrders, deleteWarehouseOrder } = useAppContext();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = warehouseOrders.filter(order => {
    const matchesSearch = 
      (order.number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (String(order.quoteId) || '').includes(searchTerm);
      
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de eliminar esta orden?")) {
      deleteWarehouseOrder(id);
      toast({ title: "Orden eliminada", description: "La orden se ha eliminado correctamente." });
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pendiente': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      'En Preparación': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      'Completada': 'bg-green-500/20 text-green-500 border-green-500/30',
      'Cancelada': 'bg-red-500/20 text-red-500 border-red-500/30'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs border font-medium ${styles[status] || 'text-slate-400'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <Helmet><title>Historial de Órdenes - Depósito</title></Helmet>

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Package className="w-8 h-8 text-orange-500" />
              Gestión de Depósito
            </h1>
            <p className="text-slate-400 mt-1">Historial completo de órdenes de preparación</p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar por Orden, Cliente o Presupuesto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             {['all', 'Pendiente', 'En Preparación', 'Completada', 'Cancelada'].map(status => (
               <Button
                 key={status}
                 variant={statusFilter === status ? "default" : "outline"}
                 onClick={() => setStatusFilter(status)}
                 size="sm"
                 className={`whitespace-nowrap ${statusFilter === status ? 'bg-orange-600 hover:bg-orange-700' : 'border-slate-700 text-slate-300'}`}
               >
                 {status === 'all' ? 'Todas' : status}
               </Button>
             ))}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
          <Table>
            <TableHeader className="bg-slate-900">
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-400 w-[140px]">Nro Orden</TableHead>
                <TableHead className="text-slate-400">Cliente</TableHead>
                <TableHead className="text-slate-400">Ref. Presup.</TableHead>
                <TableHead className="text-slate-400">Fecha</TableHead>
                <TableHead className="text-slate-400 text-center">Ítems</TableHead>
                <TableHead className="text-slate-400">Tipo</TableHead>
                <TableHead className="text-slate-400">Estado</TableHead>
                <TableHead className="text-right text-slate-400">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                    No se encontraron órdenes
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-slate-700 hover:bg-slate-700/30">
                    <TableCell className="font-mono text-white font-medium">{order.number}</TableCell>
                    <TableCell className="text-slate-300">{order.clientName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                        <FileText className="w-3 h-3" />
                        #{order.quoteId}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {new Date(order.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center text-slate-300">
                      {order.items.length}
                    </TableCell>
                    <TableCell>
                       <span className={`text-xs px-2 py-0.5 rounded ${order.type === 'partial' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-300'}`}>
                         {order.type === 'partial' ? 'Parcial' : 'Completa'}
                       </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-slate-400 hover:text-white"
                          onClick={() => setSelectedOrder(order)}
                          title="Ver Detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-slate-400 hover:text-blue-400"
                          onClick={() => generateWarehousePDF(order)}
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-slate-400 hover:text-red-400"
                          onClick={() => handleDelete(order.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <WarehouseOrderDetailsModal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        order={selectedOrder}
      />
    </div>
  );
};

export default WarehouseOrders;