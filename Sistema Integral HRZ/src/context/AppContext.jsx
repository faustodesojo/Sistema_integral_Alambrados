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

// Default configuration generator
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

export const AppProvider = ({ children }) => {
  const { toast } = useToast();

  // --- BASE STATES ---
  const [categories, setCategories] = useState(() => {
    try {
      const stored = localStorage.getItem('categories');
      return stored ? JSON.parse(stored) : [
        { id: 1, name: 'Estándar' },
        { id: 2, name: 'Premium' },
        { id: 3, name: 'Personalizado' },
        { id: 4, name: 'General' }
      ];
    } catch (e) {
      return [];
    }
  });

  const [products, setProducts] = useState(() => {
    const defaultProducts = [
      { id: 101, name: 'Esquineros de Hormigon Olimpico', description: 'Para postes extremos y agregados de aberturas', dimensions: 'Standard', price: 18000, type: 'accesorios', productType: 'poste_olimpico', category: 'Estándar' },
      { id: 102, name: 'Poste intermedio de Hormigon Olimpico', description: 'Poste de línea', dimensions: 'Standard', price: 15000, type: 'poste', productType: 'poste_olimpico', heights: ['2m', '1.80m'], category: 'Estándar' },
      { id: 103, name: 'Puntales P/ 2mts-1.80', description: 'Puntal de refuerzo', dimensions: 'Standard', price: 8500, type: 'accesorios', productType: 'puntal', category: 'Estándar' },
      { id: 104, name: 'Planchuelas chapa doblada x 2mts', description: 'Para altura 2m', dimensions: '2m', price: 2500, type: 'accesorios', productType: 'planchuela', category: 'Estándar' },
      { id: 105, name: 'Planchuelas galvanizadas x 1.80mts', description: 'Para altura 1.80m', dimensions: '1.80m', price: 2200, type: 'accesorios', productType: 'planchuela', category: 'Estándar' },
      { id: 106, name: 'Torniquete chico', description: 'Tensor', dimensions: 'Chico', price: 1200, type: 'accesorios', productType: 'torniquete', category: 'Estándar' },
      { id: 107, name: 'Ganchos galvanizados de 8"', description: 'Ganchos de sujeción', dimensions: '8 pulgadas', price: 150, type: 'accesorios', productType: 'gancho', category: 'Estándar' },
      { id: 108, name: 'Espárragos de 25cm', description: 'Elemento de fijación', dimensions: '25cm', price: 450, type: 'accesorios', productType: 'esparrago', category: 'Estándar' },
      { id: 109, name: 'Alambre liso x mt', description: 'Alambre de tensión', dimensions: 'Por metro', price: 200, type: 'accesorios', productType: 'alambre', category: 'Estándar' },
      { id: 110, name: 'Alambre de púa', description: 'Seguridad', dimensions: 'Por metro', price: 300, type: 'accesorios', productType: 'hilo_pua', category: 'Estándar' },
      { id: 301, name: 'Postes Esquineros de Hormigon Recto', description: 'Para altura 2m y 1.80m', dimensions: 'Standard', price: 17000, type: 'accesorios', productType: 'poste_recto', category: 'Estándar' },
      { id: 302, name: 'Postes Intermedios de Hormigon Recto', description: 'Poste recto de línea', dimensions: 'Standard', price: 14000, type: 'poste', productType: 'poste_recto', heights: ['2m', '1.80m'], category: 'Estándar' },
      { id: 308, name: 'Torniquetes', description: 'Tensor para recto', dimensions: 'Standard', price: 1100, type: 'accesorios', productType: 'torniquete', category: 'Estándar' },
    ];
    try {
      const stored = localStorage.getItem('products');
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.map(p => ({ ...p, category: p.category || 'General' })) : defaultProducts;
      }
    } catch (e) {
      console.error("Error parsing products", e);
    }
    return defaultProducts;
  });

  const [tejidoTypes, setTejidoTypes] = useState(() => {
    try {
      const stored = localStorage.getItem('tejidoTypes');
      return stored ? JSON.parse(stored) : [
        { id: 11, name: 'Tejido 14.5 - 2.5"', calibre: '14.5', pulgadas: '2.5', precio: 8500, type: 'tejido' },
        { id: 12, name: 'Tejido 12 - 2"', calibre: '12', pulgadas: '2', precio: 9500, type: 'tejido' },
        { id: 13, name: 'Tejido 10 - 3"', calibre: '10', pulgadas: '3', precio: 11000, type: 'tejido' },
        { id: 21, name: 'Tejido Romboidal Calibre 14,5 2,5" x 2 mts', calibre: '14.5', pulgadas: '2.5', height: '2m', precio: 9500, type: 'tejido' },
      ];
    } catch (e) {
      return [];
    }
  });

  // --- NEW MODULE STATES ---
  const [orders, setOrders] = useState(() => {
    try {
      const stored = localStorage.getItem('orders');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });
  
  const [warehouseOrders, setWarehouseOrders] = useState(() => {
    try {
      const stored = localStorage.getItem('warehouseOrders');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  const [returns, setReturns] = useState(() => {
    try {
      const stored = localStorage.getItem('returns');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  const [payments, setPayments] = useState(() => {
    try {
      const stored = localStorage.getItem('payments');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const stored = localStorage.getItem('auditLogs');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  const [presupuestos, setPresupuestos] = useState(() => {
    try {
      const stored = localStorage.getItem('presupuestos');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  // SEQUENTIAL ID LOGIC
  const [nextQuoteId, setNextQuoteId] = useState(() => {
    try {
      const stored = localStorage.getItem('nextQuoteId');
      if (stored) return parseInt(stored, 10);
      
      // Initialize based on existing quotes to verify sequence
      const storedQuotes = localStorage.getItem('presupuestos');
      if (storedQuotes) {
        const quotes = JSON.parse(storedQuotes);
        if (quotes.length > 0) {
          // Find max ID that is a number
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

  // --- OTHER STATES ---
  const [manualProducts, setManualProducts] = useState(() => {
    try {
      const stored = localStorage.getItem('manualProducts');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  // Editing State
  const [editingQuote, setEditingQuoteState] = useState(null);

  const [clientData, setClientData] = useState({ name: '', address: '', phone: '' });
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [materialsConfigByType, setMaterialsConfigByType] = useState(() => generateDefaultConfig());
  const [materialsConfig, setMaterialsConfig] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('materialsConfig') || '{"maxPostSpacing": 5, "reinforcementThreshold": 50}');
    } catch (e) {
      return { maxPostSpacing: 5, reinforcementThreshold: 50 };
    }
  });


  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (e) {
      return null;
    }
  });

  // --- PERSISTENCE EFFECTS ---
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
  useEffect(() => user ? localStorage.setItem('user', JSON.stringify(user)) : localStorage.removeItem('user'), [user]);

  // --- HELPER FUNCTIONS ---
  const generateQuoteId = () => {
    const id = nextQuoteId.toString();
    // Do not increment here, increment only when saving
    return id;
  };

  const incrementQuoteId = () => {
    setNextQuoteId(prev => prev + 1);
  };

  const generateOrderNumber = () => `ORD-${new Date().getFullYear()}-${(orders.length + 1).toString().padStart(4, '0')}`;
  const generateWarehouseOrderNumber = () => `WH-${new Date().getFullYear()}-${(warehouseOrders.length + 1).toString().padStart(4, '0')}`;
  const generateReturnNumber = () => `RET-${new Date().getFullYear()}-${(returns.length + 1).toString().padStart(4, '0')}`;
  
  const logAudit = (action, entity, entityId, details) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: user?.username || 'Sistema',
      action,
      entity,
      entityId,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // --- ACTIONS ---

  // Orders
  const createOrder = (quote) => {
    const newOrder = {
      id: Date.now().toString(),
      orderNumber: generateOrderNumber(),
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      client: quote.clientData || { name: 'Cliente Desconocido' },
      items: [
        ...(quote.calculatedMaterials || quote.materials || []),
        ...(quote.manualMaterials || [])
      ],
      total: quote.total || 0,
      status: 'Confirmada', // Auto-confirm for warehouse flow
      date: new Date().toISOString(),
      timeline: [{ status: 'Confirmada', date: new Date().toISOString(), user: user?.username || 'Sistema' }]
    };
    setOrders(prev => [newOrder, ...prev]);
    logAudit('Crear', 'Orden', newOrder.orderNumber, 'Orden creada desde presupuesto');
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

  // Warehouse - UPDATED FOR PARTIAL SUPPORT
  const createWarehouseOrder = (orderData) => {
    // orderData expects { orderId, quoteId, quoteNumber, clientName, items, type (complete/partial) }
    
    const newWO = {
      id: Date.now().toString(),
      number: generateWarehouseOrderNumber(),
      orderId: orderData.orderId, // Optional link to sales order
      quoteId: orderData.quoteId,
      quoteNumber: orderData.quoteNumber,
      clientName: orderData.clientName || 'Cliente Desconocido',
      type: orderData.type || 'complete', // 'complete' or 'partial'
      status: 'Pendiente', // Pendiente, En Preparación, Completada, Cancelada
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
        return { ...wo, ...updates };
      }
      return wo;
    }));
  };

  const deleteWarehouseOrder = (id) => {
    setWarehouseOrders(prev => prev.filter(wo => wo.id !== id));
    logAudit('Eliminar', 'Depósito', id, 'Orden eliminada');
  };

  // Returns
  const createReturn = (data) => {
    const newReturn = {
      id: Date.now().toString(),
      number: generateReturnNumber(),
      ...data,
      status: 'Solicitada', // Solicitada, Aprobada, Rechazada, Procesada
      date: new Date().toISOString(),
      history: [{ status: 'Solicitada', date: new Date().toISOString(), user: user?.username }]
    };
    setReturns(prev => [newReturn, ...prev]);
    logAudit('Crear', 'Devolución', newReturn.number, `Solicitud de devolución para orden ${data.orderNumber}`);
    toast({ title: "Devolución solicitada", description: `Solicitud ${newReturn.number} creada.` });
  };

  const updateReturnStatus = (id, status) => {
    setReturns(prev => prev.map(r => {
      if (r.id === id) {
        return { 
          ...r, 
          status,
          history: [...(r.history || []), { status, date: new Date().toISOString(), user: user?.username }]
        };
      }
      return r;
    }));
    logAudit('Actualizar', 'Devolución', id, `Estado cambiado a ${status}`);
  };

  // Payments
  const createPayment = (data) => {
    const newPayment = {
      id: Date.now().toString(),
      ...data,
      status: 'Pagado', // Pendiente, Pagado (Simple flow)
      date: new Date().toISOString()
    };
    setPayments(prev => [newPayment, ...prev]);
    logAudit('Crear', 'Pago', newPayment.id, `Pago de $${data.amount} para orden ${data.orderNumber}`);
    toast({ title: "Pago registrado", description: `Pago de $${data.amount} registrado.` });
  };

  // Basic CRUD...
  const addCategory = (name) => {
    if (!name || name.trim() === '') return null;
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) return categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    const newCategory = { id: Date.now(), name: name.trim() };
    setCategories([...categories, newCategory]);
    return newCategory;
  };
  const deleteCategory = (id) => setCategories(categories.filter(c => c.id !== id));
  const getCategories = () => categories;
  const addProduct = (p) => setProducts([...products, { ...p, id: Date.now(), category: p.category || 'General' }]);
  const updateProduct = (id, p) => setProducts(products.map(x => x.id === id ? { ...p, id, category: p.category || x.category || 'General' } : x));
  const deleteProduct = (id) => setProducts(products.filter(p => p.id !== id));
  const addTejido = (t) => setTejidoTypes([...tejidoTypes, { ...t, id: Date.now() }]);
  const updateTejido = (id, t) => setTejidoTypes(tejidoTypes.map(x => x.id === id ? { ...t, id } : x));
  const deleteTejido = (id) => setTejidoTypes(tejidoTypes.filter(t => t.id !== id));
  
  const addPresupuesto = (p) => {
    // SEQUENTIAL ID ASSIGNMENT
    let finalId = p.id;
    
    // Only assign new sequential ID if it looks like a temporary/UUID or if missing
    // We assume if ID is length > 10 it's a UUID/Timestamp. 
    // Sequential IDs are usually short strings "1", "100", etc.
    if (!finalId || finalId.length > 10) {
        finalId = generateQuoteId();
        incrementQuoteId();
    }

    const newP = { 
      ...p, 
      id: finalId,
      quoteNumber: finalId, // Align quoteNumber with ID
      clientData: { ...clientData, ...p.clientData }, 
      date: new Date().toISOString() 
    };
    setPresupuestos([newP, ...presupuestos]);
    return newP;
  };
  
  const updateQuote = (updatedQuote) => {
    setPresupuestos(prev => prev.map(p => p.id === updatedQuote.id ? updatedQuote : p));
  };
  
  const deletePresupuesto = (id) => setPresupuestos(presupuestos.filter(p => p.id !== id));
  
  const updateClientData = (k, v) => setClientData(prev => ({ ...prev, [k]: v }));
  
  // Auth
  const login = (u, p) => {
    if (u === 'admin' && p === 'admin123') { setUser({ username: 'admin', role: 'admin' }); return true; }
    if (u === 'deposito' && p === 'deposito123') { setUser({ username: 'deposito', role: 'warehouse' }); return true; }
    if (u === 'ventas' && p === 'ventas123') { setUser({ username: 'ventas', role: 'sales' }); return true; }
    return false;
  };
  const logout = () => setUser(null);

  // Manual Products 
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
      return [...prev, {
        productId,
        name: product.name,
        price: unitPrice,
        quantity: qty,
        category: 'Manual'
      }];
    });
  };

  const removeManualProduct = (productId) => {
    setManualProducts(prev => prev.filter(p => p.productId !== productId));
    toast({ title: "Eliminado", description: "Producto eliminado del presupuesto." });
  };

  const updateManualProductQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeManualProduct(productId);
      return;
    }
    setManualProducts(prev => prev.map(p => p.productId === productId ? { ...p, quantity: qty } : p));
  };

  const clearManualProducts = () => setManualProducts([]);

  // Edit Mode Logic
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
    setClientData({ name: '', address: '', phone: '' });
    setCurrentDrawing(null);
  };

  // Drawing
  const saveDrawing = (d) => setCurrentDrawing(d);
  const clearDrawing = () => setCurrentDrawing(null);

  const updateMaterialsConfigByType = (c) => setMaterialsConfigByType(c);
  const updateMaterialsConfig = (c) => setMaterialsConfig(c);

  const value = {
    products, categories, tejidoTypes, manualProducts, clientData, currentDrawing,
    materialsConfig, materialsConfigByType, presupuestos, user,
    orders, warehouseOrders, returns, payments, auditLogs,
    editingQuote,
    addCategory, deleteCategory, getCategories,
    addProduct, updateProduct, deleteProduct,
    addTejido, updateTejido, deleteTejido,
    addManualProduct, removeManualProduct, updateManualProductQuantity, clearManualProducts,
    updateClientData, saveDrawing, clearDrawing,
    updateMaterialsConfig, updateMaterialsConfigByType,
    addPresupuesto, deletePresupuesto, updateQuote, setEditingQuote, clearEditingQuote,
    generateQuoteId,
    login, logout,
    createOrder, updateOrderStatus,
    createWarehouseOrder, updateWarehouseOrder, deleteWarehouseOrder,
    createReturn, updateReturnStatus,
    createPayment,
    logAudit
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};