import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AppContext = createContext();

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
};

const generateDefaultConfig = () => {
    const config = {
        'Hormigon Olimpico': {
            '2m': {
                poste_intermedio: { productId: 102, quantity: 5, label: 'Cada X metros' },
                poste_refuerzo: { productId: 101, quantity: 1, label: 'Unidad' },
                puntal: { productId: 103, quantity: 2, label: 'Por refuerzo' },
                planchuela: { productId: 104, quantity: 2, label: 'Por línea' },
                torniquete: { productId: 106, quantity: 5, label: 'Por línea' },
                gancho: { productId: 107, quantity: 16, label: 'Por línea' },
                esparrago: { productId: 108, quantity: 2, label: 'Por línea' },
                alambre: { productId: 109, quantity: 1, label: 'Metros lineales' },
                hilo_pua: { productId: 110, quantity: 3, label: 'Líneas' },
                tejido: { productId: null, quantity: 1, label: 'Metros lineales' }
            },
            '1.80m': {
                poste_intermedio: { productId: 102, quantity: 5, label: 'Cada X metros' },
                poste_refuerzo: { productId: 101, quantity: 1, label: 'Unidad' },
                puntal: { productId: 103, quantity: 2, label: 'Por refuerzo' },
                planchuela: { productId: 105, quantity: 2, label: 'Por línea' },
                torniquete: { productId: 106, quantity: 5, label: 'Por línea' },
                gancho: { productId: 107, quantity: 16, label: 'Por línea' },
                esparrago: { productId: 108, quantity: 2, label: 'Por línea' },
                alambre: { productId: 109, quantity: 1, label: 'Metros lineales' },
                hilo_pua: { productId: 110, quantity: 3, label: 'Líneas' },
                tejido: { productId: null, quantity: 1, label: 'Metros lineales' }
            }
        },
        'Hormigón Recto': {
            '2m': {
                poste_intermedio: { productId: 302, quantity: 5, label: 'Cada X metros' },
                poste_refuerzo: { productId: 301, quantity: 1, label: 'Unidad' },
                puntal: { productId: 103, quantity: 2, label: 'Por refuerzo' },
                planchuela: { productId: 309, quantity: 2, label: 'Por línea' },
                torniquete: { productId: 308, quantity: 1, label: 'Por línea' },
                esparrago: { productId: 313, quantity: 2, label: 'Por línea' },
                alambre: { productId: 314, quantity: 1, label: 'Metros lineales' },
                gancho: { productId: 107, quantity: 16, label: 'Por línea' },
                tejido: { productId: null, quantity: 1, label: 'Metros lineales' }
            },
            '1.80m': {
                poste_intermedio: { productId: 302, quantity: 5, label: 'Cada X metros' },
                poste_refuerzo: { productId: 301, quantity: 1, label: 'Unidad' },
                puntal: { productId: 103, quantity: 2, label: 'Por refuerzo' },
                planchuela: { productId: 310, quantity: 2, label: 'Por línea' },
                torniquete: { productId: 308, quantity: 1, label: 'Por línea' },
                esparrago: { productId: 313, quantity: 2, label: 'Por línea' },
                alambre: { productId: 314, quantity: 1, label: 'Metros lineales' },
                gancho: { productId: 107, quantity: 16, label: 'Por línea' },
                tejido: { productId: null, quantity: 1, label: 'Metros lineales' }
            },
            '1.50m': {
                poste_intermedio: { productId: 304, quantity: 5, label: 'Cada X metros' },
                poste_refuerzo: { productId: 303, quantity: 1, label: 'Unidad' },
                puntal: { productId: 305, quantity: 2, label: 'Por refuerzo' },
                planchuela: { productId: 311, quantity: 2, label: 'Por línea' },
                torniquete: { productId: 308, quantity: 1, label: 'Por línea' },
                esparrago: { productId: 313, quantity: 2, label: 'Por línea' },
                alambre: { productId: 314, quantity: 1, label: 'Metros lineales' },
                gancho: { productId: 107, quantity: 16, label: 'Por línea' },
                tejido: { productId: null, quantity: 1, label: 'Metros lineales' }
            },
            '1m': {
                poste_intermedio: { productId: 307, quantity: 5, label: 'Cada X metros' },
                poste_refuerzo: { productId: 306, quantity: 1, label: 'Unidad' },
                puntal: { productId: 305, quantity: 2, label: 'Por refuerzo' },
                planchuela: { productId: 312, quantity: 2, label: 'Por línea' },
                torniquete: { productId: 308, quantity: 1, label: 'Por línea' },
                esparrago: { productId: 313, quantity: 2, label: 'Por línea' },
                alambre: { productId: 314, quantity: 1, label: 'Metros lineales' },
                gancho: { productId: 107, quantity: 16, label: 'Por línea' },
                tejido: { productId: null, quantity: 1, label: 'Metros lineales' }
            }
        }
    };
    return config;
};

const safeLoadJSON = (key, fallback) => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed !== null && parsed !== undefined ? parsed : fallback;
        }
    } catch (e) {
        console.error(`Error loading ${key}:`, e);
    }
    return fallback;
};

export const AppProvider = ({ children }) => {
    const { toast } = useToast();

    // === GLOBAL CONFIG (no magic numbers) ===
    const [globalConfig, setGlobalConfig] = useState(() => safeLoadJSON('globalConfig', {
        iva: 21,
        dolarOficial: 1050,
        margenDefault: 30,
        validezPresupuesto: 15,
        formaPago: 'Transferencia, Efectivo o Débito',
        moneda: 'ARS'
    }));

    // === CATEGORIES ===
    const [categories, setCategories] = useState(() => safeLoadJSON('categories', [
        { id: 1, name: 'Estándar' },
        { id: 2, name: 'Premium' },
        { id: 3, name: 'Personalizado' },
        { id: 4, name: 'General' }
    ]));

    // === PRODUCTS ===
    const [products, setProducts] = useState(() => {
        const defaultProducts = [
            { id: 101, name: 'Esquineros de Hormigon Olimpico', description: 'Para postes extremos y agregados de aberturas', dimensions: 'Standard', price: 18000, stock: 50, type: 'accesorios', productType: 'poste_olimpico', category: 'Estándar' },
            { id: 102, name: 'Poste intermedio de Hormigon Olimpico', description: 'Poste de línea', dimensions: 'Standard', price: 15000, stock: 100, type: 'poste', productType: 'poste_olimpico', heights: ['2m', '1.80m'], category: 'Estándar' },
            { id: 103, name: 'Puntales P/ 2mts-1.80', description: 'Puntal de refuerzo', dimensions: 'Standard', price: 8500, stock: 200, type: 'accesorios', productType: 'puntal', category: 'Estándar' },
            { id: 104, name: 'Planchuelas chapa doblada x 2mts', description: 'Para altura 2m', dimensions: '2m', price: 2500, stock: 300, type: 'accesorios', productType: 'planchuela', category: 'Estándar' },
            { id: 105, name: 'Planchuelas galvanizadas x 1.80mts', description: 'Para altura 1.80m', dimensions: '1.80m', price: 2200, stock: 300, type: 'accesorios', productType: 'planchuela', category: 'Estándar' },
            { id: 106, name: 'Torniquete chico', description: 'Tensor', dimensions: 'Chico', price: 1200, stock: 500, type: 'accesorios', productType: 'torniquete', category: 'Estándar' },
            { id: 107, name: 'Ganchos galvanizados de 8"', description: 'Ganchos de sujeción', dimensions: '8 pulgadas', price: 150, stock: 1000, type: 'accesorios', productType: 'gancho', category: 'Estándar' },
            { id: 108, name: 'Espárragos de 25cm', description: 'Elemento de fijación', dimensions: '25cm', price: 450, stock: 800, type: 'accesorios', productType: 'esparrago', category: 'Estándar' },
            { id: 109, name: 'Alambre liso x mt', description: 'Alambre de tensión', dimensions: 'Por metro', price: 200, stock: 5000, type: 'accesorios', productType: 'alambre', category: 'Estándar' },
            { id: 110, name: 'Alambre de púa', description: 'Seguridad', dimensions: 'Por metro', price: 300, stock: 3000, type: 'accesorios', productType: 'hilo_pua', category: 'Estándar' },
            { id: 301, name: 'Postes Esquineros de Hormigon Recto', description: 'Para altura 2m y 1.80m', dimensions: 'Standard', price: 17000, stock: 40, type: 'accesorios', productType: 'poste_recto', category: 'Estándar' },
            { id: 302, name: 'Postes Intermedios de Hormigon Recto', description: 'Poste recto de línea', dimensions: 'Standard', price: 14000, stock: 80, type: 'poste', productType: 'poste_recto', heights: ['2m', '1.80m'], category: 'Estándar' },
            { id: 308, name: 'Torniquetes', description: 'Tensor para recto', dimensions: 'Standard', price: 1100, stock: 400, type: 'accesorios', productType: 'torniquete', category: 'Estándar' },
        ];
        const stored = safeLoadJSON('products', null);
        if (stored && Array.isArray(stored)) {
            return stored.map(p => ({ ...p, category: p.category || 'General', stock: p.stock ?? 0 }));
        }
        return defaultProducts;
    });

    // === TEJIDO TYPES ===
    const [tejidoTypes, setTejidoTypes] = useState(() => safeLoadJSON('tejidoTypes', [
        { id: 11, name: 'Tejido 14.5 - 2.5"', calibre: '14.5', pulgadas: '2.5', precio: 8500, type: 'tejido' },
        { id: 12, name: 'Tejido 12 - 2"', calibre: '12', pulgadas: '2', precio: 9500, type: 'tejido' },
        { id: 13, name: 'Tejido 10 - 3"', calibre: '10', pulgadas: '3', precio: 11000, type: 'tejido' },
        { id: 21, name: 'Tejido Romboidal Calibre 14,5 2,5" x 2 mts', calibre: '14.5', pulgadas: '2.5', height: '2m', precio: 9500, type: 'tejido' },
    ]));

    // === ORDERS ===
    const [orders, setOrders] = useState(() => safeLoadJSON('orders', []));
    const [warehouseOrders, setWarehouseOrders] = useState(() => safeLoadJSON('warehouseOrders', []));
    const [returns, setReturns] = useState(() => safeLoadJSON('returns', []));
    const [payments, setPayments] = useState(() => safeLoadJSON('payments', []));
    const [auditLogs, setAuditLogs] = useState(() => safeLoadJSON('auditLogs', []));
    const [presupuestos, setPresupuestos] = useState(() => safeLoadJSON('presupuestos', []));

    // === CLIENTS CRM ===
    const [clients, setClients] = useState(() => safeLoadJSON('clients', []));

    // === CASH REGISTER ===
    const [cashRegister, setCashRegister] = useState(() => safeLoadJSON('cashRegister', {
        isOpen: false,
        openingBalance: 0,
        currentDate: null,
        movements: [],
        history: []
    }));

    // Auto-open cash register daily
    useEffect(() => {
        const checkAndOpenCashRegister = () => {
            const todayStr = new Date().toLocaleDateString();
            const lastCloseDateStr = cashRegister.history?.length > 0
                ? new Date(cashRegister.history[0].closeDate).toLocaleDateString()
                : null;

            // If it's closed and we haven't closed it today, open it automatically
            if (!cashRegister.isOpen && lastCloseDateStr !== todayStr) {
                const newRegister = {
                    isOpen: true,
                    openingBalance: 0,
                    currentDate: new Date().toISOString(),
                    movements: [],
                    history: cashRegister.history || []
                };
                setCashRegister(newRegister);
                // We're inside useEffect, deferring toast might be safer, but we can try logging
                console.log("Caja abierta automáticamente para el día:", todayStr);
            }
        };

        checkAndOpenCashRegister();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // === SEQUENTIAL IDs ===
    const [nextQuoteId, setNextQuoteId] = useState(() => {
        try {
            const stored = localStorage.getItem('nextQuoteId');
            if (stored) return parseInt(stored, 10);
            const storedQuotes = localStorage.getItem('presupuestos');
            if (storedQuotes) {
                const quotes = JSON.parse(storedQuotes);
                if (quotes.length > 0) {
                    const maxId = quotes.reduce((max, q) => {
                        const numId = parseInt(q.id, 10);
                        return !isNaN(numId) && numId > max ? numId : max;
                    }, 0);
                    return maxId + 1;
                }
            }
            return 1;
        } catch (e) {
            return 1;
        }
    });

    // === OTHER STATES ===
    const [manualProducts, setManualProducts] = useState(() => safeLoadJSON('manualProducts', []));
    const [editingQuote, setEditingQuoteState] = useState(null);
    const [clientData, setClientData] = useState({ name: '', address: '', phone: '', email: '' });
    const [currentDrawing, setCurrentDrawing] = useState(null);
    const [materialsConfigByType, setMaterialsConfigByType] = useState(() => {
        const stored = safeLoadJSON('materialsConfigByType', null);
        return stored || generateDefaultConfig();
    });
    const [materialsConfig, setMaterialsConfig] = useState(() => safeLoadJSON('materialsConfig', { maxPostSpacing: 5, reinforcementThreshold: 50 }));

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch (e) {
            return null;
        }
    });

    // === PERSISTENCE ===
    useEffect(() => localStorage.setItem('globalConfig', JSON.stringify(globalConfig)), [globalConfig]);
    useEffect(() => localStorage.setItem('categories', JSON.stringify(categories)), [categories]);
    useEffect(() => localStorage.setItem('products', JSON.stringify(products)), [products]);
    useEffect(() => localStorage.setItem('tejidoTypes', JSON.stringify(tejidoTypes)), [tejidoTypes]);
    useEffect(() => localStorage.setItem('manualProducts', JSON.stringify(manualProducts)), [manualProducts]);
    useEffect(() => localStorage.setItem('materialsConfigByType', JSON.stringify(materialsConfigByType)), [materialsConfigByType]);
    useEffect(() => localStorage.setItem('materialsConfig', JSON.stringify(materialsConfig)), [materialsConfig]);
    useEffect(() => localStorage.setItem('presupuestos', JSON.stringify(presupuestos)), [presupuestos]);
    useEffect(() => localStorage.setItem('orders', JSON.stringify(orders)), [orders]);
    useEffect(() => localStorage.setItem('warehouseOrders', JSON.stringify(warehouseOrders)), [warehouseOrders]);
    useEffect(() => localStorage.setItem('returns', JSON.stringify(returns)), [returns]);
    useEffect(() => localStorage.setItem('payments', JSON.stringify(payments)), [payments]);
    useEffect(() => localStorage.setItem('auditLogs', JSON.stringify(auditLogs)), [auditLogs]);
    useEffect(() => localStorage.setItem('nextQuoteId', nextQuoteId.toString()), [nextQuoteId]);
    useEffect(() => localStorage.setItem('clients', JSON.stringify(clients)), [clients]);
    useEffect(() => localStorage.setItem('cashRegister', JSON.stringify(cashRegister)), [cashRegister]);
    useEffect(() => user ? localStorage.setItem('user', JSON.stringify(user)) : localStorage.removeItem('user'), [user]);

    // === HELPERS ===
    const generateQuoteId = () => nextQuoteId.toString();
    const incrementQuoteId = () => setNextQuoteId(prev => prev + 1);
    const generateOrderNumber = () => `ORD-${new Date().getFullYear()}-${(orders.length + 1).toString().padStart(4, '0')}`;
    const generateWarehouseOrderNumber = () => `WH-${new Date().getFullYear()}-${(warehouseOrders.length + 1).toString().padStart(4, '0')}`;
    const generateReturnNumber = () => `RET-${new Date().getFullYear()}-${(returns.length + 1).toString().padStart(4, '0')}`;

    const logAudit = (action, entity, entityId, details) => {
        const newLog = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            user: user?.username || 'Sistema',
            action, entity, entityId, details
        };
        setAuditLogs(prev => [newLog, ...prev]);
    };

    // === GLOBAL CONFIG ACTIONS ===
    const updateGlobalConfig = (keyOrObj, value) => {
        if (typeof keyOrObj === 'object' && keyOrObj !== null) {
            setGlobalConfig(keyOrObj);
            toast({ title: "Configuración actualizada", description: "Configuración guardada correctamente." });
        } else {
            setGlobalConfig(prev => ({ ...prev, [keyOrObj]: value }));
            toast({ title: "Configuración actualizada", description: `${keyOrObj} actualizado correctamente.` });
        }
    };

    // === ORDER ACTIONS ===
    const createOrder = (quote) => {
        const newOrder = {
            id: Date.now().toString(),
            orderNumber: generateOrderNumber(),
            quoteId: quote.id,
            quoteNumber: quote.quoteNumber,
            client: quote.clientData || { name: 'Consumidor Final' },
            items: [
                ...(quote.calculatedMaterials || quote.materials || []),
                ...(quote.manualMaterials || [])
            ],
            total: quote.total || 0,
            paid: 0,
            status: 'Confirmada',
            date: new Date().toISOString(),
            timeline: [{ status: 'Confirmada', date: new Date().toISOString(), user: user?.username || 'Sistema' }]
        };
        setOrders(prev => [newOrder, ...prev]);

        // Update client history
        if (quote.clientData?.name) {
            addOrUpdateClient(quote.clientData.name, { type: 'order', id: newOrder.orderNumber, total: newOrder.total, date: newOrder.date });
        }

        logAudit('Crear', 'Orden', newOrder.orderNumber, 'Orden creada desde presupuesto');
        toast({ title: "Orden creada", description: `Orden ${newOrder.orderNumber} generada correctamente.` });
        return newOrder;
    };

    const createDirectOrder = (items, clientInfo, paymentMethod, total) => {
        const newOrder = {
            id: Date.now().toString(),
            orderNumber: generateOrderNumber(),
            quoteId: null,
            quoteNumber: null,
            client: clientInfo || { name: 'Consumidor Final' },
            items,
            total,
            paid: total,
            status: 'Entregada',
            paymentMethod,
            date: new Date().toISOString(),
            isCounterSale: true,
            timeline: [
                { status: 'Confirmada', date: new Date().toISOString(), user: user?.username || 'Sistema' },
                { status: 'Entregada', date: new Date().toISOString(), user: user?.username || 'Sistema' }
            ]
        };
        setOrders(prev => [newOrder, ...prev]);

        // Register payment
        createPayment({
            orderNumber: newOrder.orderNumber,
            orderId: newOrder.id,
            amount: total,
            method: paymentMethod,
            type: 'Venta Mostrador'
        });

        // Add cash movement if cash register is open
        if (cashRegister.isOpen && paymentMethod === 'Efectivo') {
            addCashMovement('ingreso', total, `Venta mostrador ${newOrder.orderNumber}`);
        }

        // Update stock
        items.forEach(item => {
            if (item.productId) {
                updateProductStock(item.productId, -(item.quantity || 0));
            }
        });

        if (clientInfo?.name) {
            addOrUpdateClient(clientInfo.name, { type: 'counter_sale', id: newOrder.orderNumber, total, date: newOrder.date });
        }

        logAudit('Crear', 'Venta Mostrador', newOrder.orderNumber, `Venta directa por $${total}`);
        toast({ title: "Venta registrada", description: `${newOrder.orderNumber} - Total: $${total.toLocaleString('es-AR')}` });
        return newOrder;
    };

    const updateOrderStatus = (id, newStatus) => {
        setOrders(prev => prev.map(o => {
            if (o.id === id) {
                return {
                    ...o,
                    status: newStatus,
                    timeline: [...(o.timeline || []), { status: newStatus, date: new Date().toISOString(), user: user?.username }]
                };
            }
            return o;
        }));
        logAudit('Actualizar', 'Orden', id, `Estado cambiado a ${newStatus}`);
    };

    // === WAREHOUSE ACTIONS ===
    const createWarehouseOrder = (orderData) => {
        const newWO = {
            id: Date.now().toString(),
            number: generateWarehouseOrderNumber(),
            orderId: orderData.orderId,
            quoteId: orderData.quoteId,
            quoteNumber: orderData.quoteNumber,
            clientName: orderData.clientName || 'Cliente Desconocido',
            type: orderData.type || 'complete',
            status: 'Pendiente',
            items: (orderData.items || []).map(i => ({ ...i, prepared: 0, completed: false })),
            assignedTo: null,
            date: new Date().toISOString(),
            history: [{ status: 'Pendiente', date: new Date().toISOString(), user: user?.username || 'Sistema' }]
        };
        setWarehouseOrders(prev => [newWO, ...prev]);
        logAudit('Crear', 'Depósito', newWO.number, `Orden ${newWO.type} para Presupuesto #${newWO.quoteId}`);
        return newWO;
    };

    const updateWarehouseOrder = (id, updates) => {
        setWarehouseOrders(prev => prev.map(wo => {
            if (wo.id === id) {
                const updated = { ...wo, ...updates };
                // If moving to "En Preparación", deduct stock
                if (updates.status === 'En Preparación' && wo.status === 'Pendiente') {
                    wo.items.forEach(item => {
                        if (item.productId) {
                            updateProductStock(item.productId, -(item.quantity || 0));
                        }
                    });
                }
                return updated;
            }
            return wo;
        }));
    };

    const deleteWarehouseOrder = (id) => {
        setWarehouseOrders(prev => prev.filter(wo => wo.id !== id));
        logAudit('Eliminar', 'Depósito', id, 'Orden eliminada');
    };

    // === RETURNS ===
    const createReturn = (data) => {
        const newReturn = {
            id: Date.now().toString(),
            number: generateReturnNumber(),
            ...data,
            status: 'Solicitada',
            date: new Date().toISOString(),
            history: [{ status: 'Solicitada', date: new Date().toISOString(), user: user?.username }]
        };
        setReturns(prev => [newReturn, ...prev]);
        logAudit('Crear', 'Devolución', newReturn.number, `Solicitud de devolución para orden ${data.orderNumber}`);
        toast({ title: "Devolución solicitada", description: `Solicitud ${newReturn.number} creada.` });
    };

    const updateReturnStatus = (id, status, returnToStock = false) => {
        setReturns(prev => prev.map(r => {
            if (r.id === id) {
                // If approved and returning to stock
                if (status === 'Procesada' && returnToStock && r.items) {
                    r.items.forEach(item => {
                        if (item.productId) {
                            updateProductStock(item.productId, item.quantity || 0);
                        }
                    });
                }
                // If generating credit, add to client balance
                if (status === 'Procesada' && r.creditAmount) {
                    addOrUpdateClient(r.clientName, {
                        type: 'credit',
                        amount: r.creditAmount,
                        returnNumber: r.number,
                        date: new Date().toISOString()
                    });
                }
                return {
                    ...r,
                    status,
                    returnToStock,
                    history: [...(r.history || []), { status, date: new Date().toISOString(), user: user?.username }]
                };
            }
            return r;
        }));
        logAudit('Actualizar', 'Devolución', id, `Estado cambiado a ${status}`);
    };

    // === PAYMENTS ===
    const createPayment = (data) => {
        const newPayment = {
            id: Date.now().toString(),
            ...data,
            status: 'Pagado',
            date: new Date().toISOString()
        };
        setPayments(prev => [newPayment, ...prev]);

        // Update order paid amount
        if (data.orderId) {
            setOrders(prev => prev.map(o => {
                if (o.id === data.orderId) {
                    return { ...o, paid: (o.paid || 0) + data.amount };
                }
                return o;
            }));
        }

        logAudit('Crear', 'Pago', newPayment.id, `Pago de $${data.amount} para orden ${data.orderNumber}`);
        toast({ title: "Pago registrado", description: `Pago de $${data.amount?.toLocaleString('es-AR')} registrado.` });
    };

    // === CASH REGISTER ===
    const openCashRegister = (openingBalance) => {
        const newRegister = {
            isOpen: true,
            openingBalance: parseFloat(openingBalance) || 0,
            currentDate: new Date().toISOString(),
            movements: [],
            history: cashRegister.history || []
        };
        setCashRegister(newRegister);
        logAudit('Abrir', 'Caja', 'daily', `Apertura con saldo inicial: $${openingBalance}`);
        toast({ title: "Caja abierta", description: `Saldo inicial: $${parseFloat(openingBalance).toLocaleString('es-AR')}` });
    };

    const addCashMovement = (type, amount, description, method = 'Efectivo') => {
        setCashRegister(prev => ({
            ...prev,
            movements: [...prev.movements, {
                id: Date.now(),
                type,
                amount: parseFloat(amount),
                description,
                method,
                timestamp: new Date().toISOString(),
                user: user?.username || 'Sistema'
            }]
        }));
    };

    const closeCashRegister = (countedCash) => {
        const totalIngresos = cashRegister.movements
            .filter(m => m.type === 'ingreso' && m.method === 'Efectivo')
            .reduce((sum, m) => sum + m.amount, 0);
        const totalEgresos = cashRegister.movements
            .filter(m => m.type === 'egreso' && m.method === 'Efectivo')
            .reduce((sum, m) => sum + m.amount, 0);
        const expectedCash = cashRegister.openingBalance + totalIngresos - totalEgresos;
        const difference = parseFloat(countedCash) - expectedCash;

        const closeSummary = {
            date: cashRegister.currentDate,
            closeDate: new Date().toISOString(),
            openingBalance: cashRegister.openingBalance,
            totalIngresos,
            totalEgresos,
            expectedCash,
            countedCash: parseFloat(countedCash),
            difference,
            movements: cashRegister.movements,
            closedBy: user?.username || 'Sistema'
        };

        setCashRegister(prev => ({
            isOpen: false,
            openingBalance: 0,
            currentDate: null,
            movements: [],
            history: [closeSummary, ...(prev.history || [])]
        }));

        logAudit('Cerrar', 'Caja', 'daily', `Cierre: Esperado $${expectedCash}, Contado $${countedCash}, Diferencia $${difference}`);
        toast({ title: "Caja cerrada", description: `Diferencia: $${difference.toLocaleString('es-AR')}` });
        return closeSummary;
    };

    // === STOCK ===
    const updateProductStock = (productId, delta) => {
        setProducts(prev => prev.map(p => {
            if (p.id === productId) {
                return { ...p, stock: Math.max(0, (p.stock || 0) + delta) };
            }
            return p;
        }));
    };

    // === CLIENTS CRM ===
    const addOrUpdateClient = (name, activity) => {
        setClients(prev => {
            const existing = prev.find(c => c.name.toLowerCase() === name.toLowerCase());
            if (existing) {
                return prev.map(c => {
                    if (c.name.toLowerCase() === name.toLowerCase()) {
                        return { ...c, activities: [activity, ...(c.activities || [])], lastActivity: new Date().toISOString() };
                    }
                    return c;
                });
            }
            return [...prev, {
                id: Date.now(),
                name,
                activities: [activity],
                credit: 0,
                createdAt: new Date().toISOString(),
                lastActivity: new Date().toISOString()
            }];
        });
    };

    // === PRODUCTS CRUD ===
    const addCategory = (name) => {
        if (!name || name.trim() === '') return null;
        if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) return categories.find(c => c.name.toLowerCase() === name.toLowerCase());
        const newCategory = { id: Date.now(), name: name.trim() };
        setCategories([...categories, newCategory]);
        return newCategory;
    };
    const deleteCategory = (id) => setCategories(categories.filter(c => c.id !== id));
    const getCategories = () => categories;
    const addProduct = (p) => setProducts([...products, { ...p, id: Date.now(), category: p.category || 'General', stock: p.stock || 0 }]);
    const updateProduct = (id, p) => setProducts(products.map(x => x.id === id ? { ...p, id, category: p.category || x.category || 'General' } : x));
    const deleteProduct = (id) => setProducts(products.filter(p => p.id !== id));
    const addTejido = (t) => setTejidoTypes([...tejidoTypes, { ...t, id: Date.now() }]);
    const updateTejido = (id, t) => setTejidoTypes(tejidoTypes.map(x => x.id === id ? { ...t, id } : x));
    const deleteTejido = (id) => setTejidoTypes(tejidoTypes.filter(t => t.id !== id));

    // Mass Price Update
    const updatePricesByPercentage = (percentage, categoryFilter = null) => {
        const multiplier = 1 + (percentage / 100);
        let count = 0;
        setProducts(prev => prev.map(p => {
            if (categoryFilter && p.category !== categoryFilter) return p;
            count++;
            return { ...p, price: Math.round(p.price * multiplier) };
        }));
        setTejidoTypes(prev => prev.map(t => {
            if (categoryFilter) return t;
            count++;
            return { ...t, precio: Math.round(t.precio * multiplier) };
        }));
        logAudit('Actualizar', 'Precios', 'masivo', `Aumento de ${percentage}% aplicado a ${count} productos`);
        toast({ title: "Precios actualizados", description: `${percentage}% aplicado a ${count} productos.` });
        return count;
    };

    // === QUOTES ===
    const addPresupuesto = (p) => {
        let finalId = p.id;
        if (!finalId || finalId.length > 10) {
            finalId = generateQuoteId();
            incrementQuoteId();
        }
        const newP = {
            ...p,
            id: finalId,
            quoteNumber: finalId,
            clientData: { ...clientData, ...p.clientData },
            date: new Date().toISOString()
        };
        setPresupuestos([newP, ...presupuestos]);

        if (newP.clientData?.name) {
            addOrUpdateClient(newP.clientData.name, { type: 'quote', id: finalId, total: newP.total, date: newP.date });
        }

        return newP;
    };
    const updateQuote = (updatedQuote) => setPresupuestos(prev => prev.map(p => p.id === updatedQuote.id ? updatedQuote : p));
    const deletePresupuesto = (id) => setPresupuestos(presupuestos.filter(p => p.id !== id));
    const updateClientData = (k, v) => setClientData(prev => ({ ...prev, [k]: v }));

    // === AUTH ===
    const login = (u, p) => {
        const users = {
            admin: { username: 'admin', role: 'admin' },
            deposito: { username: 'deposito', role: 'warehouse' },
            ventas: { username: 'ventas', role: 'sales' },
        };
        const passwords = { admin: 'admin123', deposito: 'deposito123', ventas: 'ventas123' };
        if (users[u] && passwords[u] === p) {
            setUser(users[u]);
            return users[u];
        }
        return false;
    };

    const hasRole = (...roles) => user && roles.includes(user.role);
    const logout = () => setUser(null);

    // === MANUAL PRODUCTS ===
    const addManualProduct = (productId, qty) => {
        const product = products.find(p => p.id === productId) || tejidoTypes.find(t => t.id === productId);
        if (!product) {
            toast({ title: "Error", description: "Producto no encontrado", variant: "destructive" });
            return;
        }
        setManualProducts(prev => {
            const exists = prev.find(p => p.productId === productId);
            if (exists) {
                toast({ title: "Actualizado", description: `Cantidad actualizada para ${product.name}` });
                return prev.map(p => p.productId === productId ? { ...p, quantity: p.quantity + qty } : p);
            }
            toast({ title: "Agregado", description: `${product.name} agregado al presupuesto.` });
            const unitPrice = product.price !== undefined ? product.price : product.precio;
            return [...prev, { productId, name: product.name, price: unitPrice, quantity: qty, category: 'Manual' }];
        });
    };
    const removeManualProduct = (productId) => {
        setManualProducts(prev => prev.filter(p => p.productId !== productId));
        toast({ title: "Eliminado", description: "Producto eliminado del presupuesto." });
    };
    const updateManualProductQuantity = (productId, qty) => {
        if (qty <= 0) { removeManualProduct(productId); return; }
        setManualProducts(prev => prev.map(p => p.productId === productId ? { ...p, quantity: qty } : p));
    };
    const clearManualProducts = () => setManualProducts([]);

    // === EDIT MODE ===
    const setEditingQuote = (quote) => {
        setEditingQuoteState(quote);
        if (quote.clientData) setClientData(quote.clientData);
        if (quote.manualMaterials && Array.isArray(quote.manualMaterials)) {
            const formattedManuals = quote.manualMaterials.map(m => ({
                ...m,
                productId: m.productId || m.id || Date.now(),
                price: m.unitPrice !== undefined ? m.unitPrice : m.price,
                quantity: m.quantity
            }));
            setManualProducts(formattedManuals);
        } else {
            setManualProducts([]);
        }
        if (quote.drawing) setCurrentDrawing(quote.drawing);
        else setCurrentDrawing(null);
    };
    const clearEditingQuote = () => {
        setEditingQuoteState(null);
        setManualProducts([]);
        setClientData({ name: '', address: '', phone: '', email: '' });
        setCurrentDrawing(null);
    };

    // === DRAWING ===
    const saveDrawing = (d) => setCurrentDrawing(d);
    const clearDrawing = () => setCurrentDrawing(null);

    const updateMaterialsConfigByType = (c) => setMaterialsConfigByType(c);
    const updateMaterialsConfig = (c) => setMaterialsConfig(c);

    const value = {
        // Data
        products, categories, tejidoTypes, manualProducts, clientData, currentDrawing,
        materialsConfig, materialsConfigByType, presupuestos, user,
        orders, warehouseOrders, returns, payments, auditLogs,
        editingQuote, globalConfig, clients, cashRegister,
        // Category CRUD
        addCategory, deleteCategory, getCategories,
        // Product CRUD
        addProduct, updateProduct, deleteProduct, updateProductStock,
        // Tejido CRUD
        addTejido, updateTejido, deleteTejido,
        // Manual Products
        addManualProduct, removeManualProduct, updateManualProductQuantity, clearManualProducts,
        // Client Data
        updateClientData, saveDrawing, clearDrawing,
        // Materials Config
        updateMaterialsConfig, updateMaterialsConfigByType,
        // Quotes
        addPresupuesto, deletePresupuesto, updateQuote, setEditingQuote, clearEditingQuote, generateQuoteId,
        // Auth
        login, logout, hasRole,
        // Orders
        createOrder, createDirectOrder, updateOrderStatus,
        // Warehouse
        createWarehouseOrder, updateWarehouseOrder, deleteWarehouseOrder,
        // Returns
        createReturn, updateReturnStatus,
        // Payments
        createPayment,
        // Cash Register
        openCashRegister, closeCashRegister, addCashMovement,
        // CRM
        addOrUpdateClient,
        // Global Config
        updateGlobalConfig,
        // Mass Price Update
        updatePricesByPercentage,
        // Audit
        logAudit
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
