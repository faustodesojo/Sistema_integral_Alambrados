import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Plus, Minus, Trash2, CreditCard, Package, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/components/ui/use-toast';
import { generateWarehousePDF } from '@/utils/WarehousePDFGenerator';
import { generateQuotePDF } from '@/utils/PDFGenerator';

const CounterSale = () => {
    const { products, tejidoTypes, createDirectOrder } = useAppContext();
    const { toast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const [clientName, setClientName] = useState('');
    // Track quantity input per product row
    const [quantities, setQuantities] = useState({});

    const allProducts = useMemo(() => {
        const prods = products.map(p => ({ ...p, unitPrice: p.price, sourceType: 'product' }));
        const tejs = tejidoTypes.map(t => ({ ...t, unitPrice: t.precio, name: t.name || `Tejido Cal.${t.calibre} ${t.pulgadas}"`, sourceType: 'tejido' }));
        return [...prods, ...tejs];
    }, [products, tejidoTypes]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return allProducts.slice(0, 20);
        const term = searchTerm.toLowerCase();
        return allProducts.filter(p =>
            (p.name || '').toLowerCase().includes(term) ||
            String(p.id).includes(term)
        );
    }, [allProducts, searchTerm]);

    const addToCart = (product, qty = 1) => {
        const quantity = Math.max(1, parseInt(qty) || 1);
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
            }
            return [...prev, { ...product, quantity }];
        });
        // Reset quantity input for that product
        setQuantities(prev => ({ ...prev, [`${product.sourceType}-${product.id}`]: '' }));
    };

    const updateCartQty = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return newQty === 0 ? null : { ...item, quantity: newQty };
            }
            return item;
        }).filter(Boolean));
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast({ title: "Carrito vacío", description: "Agregue productos antes de registrar la venta.", variant: "destructive" });
            return;
        }

        const items = cart.map(item => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.unitPrice * item.quantity,
            category: item.category || 'General'
        }));

        const clientInfo = clientName.trim() ? { name: clientName.trim() } : { name: 'Consumidor Final' };

        createDirectOrder(items, clientInfo, paymentMethod, cartTotal);

        setCart([]);
        setClientName('');
        setSearchTerm('');
    };

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <Helmet><title>Venta en Mostrador - Alambrados Belgrano</title></Helmet>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <ShoppingCart className="w-8 h-8 text-orange-500" />
                    Venta en Mostrador
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Search */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar producto por nombre o código..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 outline-none text-lg"
                                autoFocus
                            />
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-900 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Cód.</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Producto</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase">Precio</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-400 uppercase">Stock</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-400 uppercase w-40">Cantidad</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-slate-400 uppercase">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {filteredProducts.map(product => {
                                        const key = `${product.sourceType}-${product.id}`;
                                        return (
                                            <tr key={key} className="hover:bg-slate-700/30 transition-colors">
                                                <td className="px-4 py-2 text-slate-400 font-mono text-sm">{product.id}</td>
                                                <td className="px-4 py-2 text-white text-sm">{product.name}</td>
                                                <td className="px-4 py-2 text-right text-white font-medium">${(product.unitPrice || 0).toLocaleString('es-AR')}</td>
                                                <td className="px-4 py-2 text-center">
                                                    <span className={`text-xs px-2 py-0.5 rounded ${(product.stock || 0) > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {product.stock ?? '-'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        placeholder="1"
                                                        value={quantities[key] || ''}
                                                        onChange={(e) => setQuantities(prev => ({ ...prev, [key]: e.target.value }))}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                addToCart(product, quantities[key] || 1);
                                                            }
                                                        }}
                                                        className="w-20 bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-white text-center text-sm focus:ring-2 focus:ring-orange-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    <Button
                                                        size="sm"
                                                        className="bg-orange-600 hover:bg-orange-700 h-7 px-3 text-xs"
                                                        onClick={(e) => { e.stopPropagation(); addToCart(product, quantities[key] || 1); }}
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" /> Agregar
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredProducts.length === 0 && (
                                        <tr><td colSpan="6" className="text-center py-8 text-slate-500">No se encontraron productos.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Cart */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex flex-col h-fit sticky top-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-orange-500" />
                            Carrito ({cart.length})
                        </h2>

                        {/* Client Name */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Nombre del cliente (opcional)"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>

                        {cart.length === 0 ? (
                            <div className="text-center text-slate-500 py-8">
                                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p>Carrito vacío</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto mb-4">
                                {cart.map(item => (
                                    <div key={item.id} className="bg-slate-900 rounded-lg p-3 flex justify-between items-center">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{item.name}</p>
                                            <p className="text-slate-400 text-xs">${(item.unitPrice || 0).toLocaleString('es-AR')} c/u</p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-2">
                                            <button onClick={() => updateCartQty(item.id, -1)} className="w-6 h-6 rounded bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600">
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-white font-bold text-sm w-8 text-center">{item.quantity}</span>
                                            <button onClick={() => updateCartQty(item.id, 1)} className="w-6 h-6 rounded bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600">
                                                <Plus className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => removeFromCart(item.id)} className="w-6 h-6 rounded bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40 ml-1">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Payment Method */}
                        <div className="mb-4">
                            <label className="text-slate-400 text-xs block mb-1">Método de Pago</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                            >
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Tarjeta">Tarjeta</option>
                                <option value="Cuenta Corriente">Cuenta Corriente</option>
                            </select>
                        </div>

                        {/* Total & Checkout */}
                        <div className="border-t border-slate-700 pt-4 mt-auto">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-300 font-medium">Total:</span>
                                <span className="text-3xl font-bold text-white">${cartTotal.toLocaleString('es-AR')}</span>
                            </div>
                            <div className="space-y-2">
                                <Button
                                    onClick={handleCheckout}
                                    disabled={cart.length === 0}
                                    className="w-full bg-green-600 hover:bg-green-700 h-10 text-base font-semibold disabled:opacity-50"
                                >
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Registrar Venta
                                </Button>
                                <Button
                                    onClick={async () => {
                                        if (cart.length === 0) return;
                                        const items = cart.map(item => ({
                                            ...item,
                                            quantity: item.quantity,
                                            unitPrice: item.unitPrice,
                                            subtotal: item.unitPrice * item.quantity,
                                        }));
                                        const mockQuote = {
                                            id: 'MOSTRADOR',
                                            quoteNumber: 'MOST',
                                            date: new Date().toISOString(),
                                            materials: items,
                                            manualMaterials: [],
                                            total: cartTotal,
                                            summary: { tipoPoste: 'Venta Directa', altura: '-', tejido: '-' }
                                        };
                                        const clientInfo = clientName.trim() ? { name: clientName.trim() } : { name: 'Consumidor Final' };
                                        await generateQuotePDF(mockQuote, clientInfo, null);
                                    }}
                                    disabled={cart.length === 0}
                                    variant="outline"
                                    className="w-full border-slate-600 hover:bg-slate-700 text-slate-200 h-10"
                                >
                                    <FileText className="w-5 h-5 mr-2" />
                                    Imprimir Presupuesto Cliente
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CounterSale;
