import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Search, FileText, ArrowRight, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/context/AppContext';
import OrderTimeline from '@/components/OrderTimeline';
import WarehouseOrderModal from '@/components/WarehouseOrderModal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const SalesOrders = () => {
    const { presupuestos, createOrder, createWarehouseOrder, orders, updateOrderStatus } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuoteForModal, setSelectedQuoteForModal] = useState(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    const filteredQuotes = presupuestos.filter(p => {
        if (!p || !p.clientData) return false;
        const isConverted = orders.some(o => o.quoteId === p.id);
        if (isConverted) return false;
        const clientName = p.clientData.name || '';
        const total = p.total || 0;
        const term = searchTerm.toLowerCase();
        return clientName.toLowerCase().includes(term) || total.toString().includes(term);
    });

    const filteredOrders = orders.filter(o => {
        if (!o) return false;
        const clientName = o.client?.name || '';
        const orderNumber = o.orderNumber || '';
        const term = searchTerm.toLowerCase();
        return clientName.toLowerCase().includes(term) || orderNumber.toLowerCase().includes(term);
    });

    const handleCreateOrder = (quote) => {
        setSelectedQuoteForModal(quote);
    };

    const handleConfirmOrder = (itemsToOrder, type) => {
        if (!selectedQuoteForModal) return;

        // Create the main sales order tracking the sale
        const newOrder = createOrder(selectedQuoteForModal);

        // Create the warehouse order with potentially partial items
        const newWarehouseOrder = createWarehouseOrder({
            orderId: newOrder.id,
            quoteId: selectedQuoteForModal.id,
            quoteNumber: selectedQuoteForModal.quoteNumber,
            clientName: selectedQuoteForModal.clientData?.name,
            items: itemsToOrder,
            type: type
        });

        setSelectedQuoteForModal(null);

        if (newWarehouseOrder) {
            toast({
                title: "Orden Creada",
                description: `Orden de depósito #${newWarehouseOrder.number} generada exitosamente.`,
            });
            // Redirect to warehouse orders to see the newly created order
            navigate('/warehouse-orders');
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo crear la orden.",
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <Helmet><title>Órdenes de Venta - Alambrados Belgrano</title></Helmet>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-white mb-6">Órdenes de Venta</h1>

                <Tabs defaultValue="orders" className="space-y-6">
                    <TabsList className="bg-slate-800 border border-slate-700">
                        <TabsTrigger value="orders" className="data-[state=active]:bg-orange-600">Mis Órdenes</TabsTrigger>
                        <TabsTrigger value="create" className="data-[state=active]:bg-orange-600">Crear Orden (Desde Presupuesto)</TabsTrigger>
                    </TabsList>

                    <TabsContent value="orders">
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                            <div className="flex gap-4 mb-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por cliente o número..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {filteredOrders.map(order => (
                                    <motion.div
                                        key={order.id}
                                        layoutId={order.id}
                                        className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-orange-500/50 transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-white">{order.orderNumber}</h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${order.status === 'Entregada' ? 'bg-green-500/20 text-green-400' :
                                                        order.status === 'Cancelada' ? 'bg-red-500/20 text-red-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-slate-400">{order.client?.name || 'Cliente desconocido'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-white">${(order.total || 0).toLocaleString('es-AR')}</p>
                                                <p className="text-xs text-slate-500">{new Date(order.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <OrderTimeline status={order.status} />

                                        <div className="mt-4 flex gap-2 justify-end">
                                            {order.status === 'Pendiente' && (
                                                <Button size="sm" onClick={() => updateOrderStatus(order.id, 'Confirmada')} className="bg-green-600 hover:bg-green-700">Confirmar Orden</Button>
                                            )}
                                            {order.status === 'Confirmada' && (
                                                <Button size="sm" onClick={() => updateOrderStatus(order.id, 'Lista para Retirar')} className="bg-blue-600 hover:bg-blue-700">Lista para Retirar</Button>
                                            )}
                                            {order.status === 'Lista para Retirar' && (
                                                <Button size="sm" onClick={() => updateOrderStatus(order.id, 'Entregada')} className="bg-green-600 hover:bg-green-700">Marcar Entregada</Button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {filteredOrders.length === 0 && <p className="text-center text-slate-500 py-8">No hay órdenes registradas.</p>}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="create">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredQuotes.map(quote => (
                                <div key={quote.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-orange-500 transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="bg-orange-500/10 p-2 rounded-lg">
                                            <FileText className="w-6 h-6 text-orange-500" />
                                        </div>
                                        <span className="text-xs text-slate-400">{new Date(quote.date).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-white font-bold mb-1">{quote.clientData?.name || 'Sin nombre'}</h3>
                                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{quote.items?.length || 0} productos</p>
                                    <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                                        <span className="text-lg font-bold text-white">${(quote.total || 0).toLocaleString('es-AR')}</span>
                                        <Button size="sm" onClick={() => handleCreateOrder(quote)} className="bg-orange-600 hover:bg-orange-700">
                                            Convertir <ArrowRight className="w-4 h-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {filteredQuotes.length === 0 && (
                                <div className="col-span-full text-center text-slate-500 py-10">
                                    No hay presupuestos pendientes para convertir.
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </motion.div>

            <WarehouseOrderModal
                isOpen={!!selectedQuoteForModal}
                onClose={() => setSelectedQuoteForModal(null)}
                quote={selectedQuoteForModal}
                onConfirm={handleConfirmOrder}
            />
        </div>
    );
};

export default SalesOrders;
