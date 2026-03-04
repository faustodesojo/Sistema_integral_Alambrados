import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Settings, Plus, Trash2, Edit2, Save, Package, Tag, Layers, Wrench, Globe, DollarSign, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/components/ui/use-toast';

// ─── Products Tab ───
const ProductsTab = () => {
    const { products, categories, addProduct, updateProduct, deleteProduct } = useAppContext();
    const { toast } = useToast();
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', price: '', unit: 'Unidad', category: '', id: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editId !== null) {
            updateProduct(editId, { ...form, price: parseFloat(form.price) });
            toast({ title: "Producto actualizado" });
            setEditId(null);
        } else {
            addProduct({ ...form, price: parseFloat(form.price), id: parseInt(form.id) || Date.now() });
            toast({ title: "Producto agregado" });
        }
        setForm({ name: '', price: '', unit: 'Unidad', category: '', id: '' });
    };

    const handleEdit = (prod) => {
        setEditId(prod.id);
        setForm({ name: prod.name, price: String(prod.price), unit: prod.unit || 'Unidad', category: prod.category || '', id: String(prod.id) });
    };

    const filtered = products.filter(p => {
        const term = searchTerm.toLowerCase();
        return (p.name || '').toLowerCase().includes(term) || String(p.id).includes(term);
    });

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                <div>
                    <label className="text-slate-400 text-xs block mb-1">Código</label>
                    <input value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} placeholder="ID"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-orange-500 focus:ring-2 outline-none" disabled={editId !== null} />
                </div>
                <div className="md:col-span-2">
                    <label className="text-slate-400 text-xs block mb-1">Nombre</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre del producto"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-orange-500 focus:ring-2 outline-none" required />
                </div>
                <div>
                    <label className="text-slate-400 text-xs block mb-1">Precio</label>
                    <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-orange-500 focus:ring-2 outline-none" required min="0" step="0.01" />
                </div>
                <div>
                    <label className="text-slate-400 text-xs block mb-1">Categoría</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-orange-500 focus:ring-2 outline-none">
                        <option value="">Sin categoría</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 h-10">
                    {editId !== null ? <><Save className="w-4 h-4 mr-1" /> Guardar</> : <><Plus className="w-4 h-4 mr-1" /> Agregar</>}
                </Button>
            </form>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar productos..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:ring-orange-500 focus:ring-2 outline-none" />
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-auto max-h-[500px]">
                <table className="w-full text-sm">
                    <thead className="bg-slate-900 sticky top-0">
                        <tr>
                            <th className="px-3 py-2 text-left text-slate-400 text-xs uppercase">Cód.</th>
                            <th className="px-3 py-2 text-left text-slate-400 text-xs uppercase">Producto</th>
                            <th className="px-3 py-2 text-left text-slate-400 text-xs uppercase">Categoría</th>
                            <th className="px-3 py-2 text-right text-slate-400 text-xs uppercase">Precio</th>
                            <th className="px-3 py-2 text-center text-slate-400 text-xs uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {filtered.map(p => (
                            <tr key={p.id} className="hover:bg-slate-700/30">
                                <td className="px-3 py-1.5 text-slate-400 font-mono">{p.id}</td>
                                <td className="px-3 py-1.5 text-white">{p.name}</td>
                                <td className="px-3 py-1.5 text-slate-400">{p.category || '-'}</td>
                                <td className="px-3 py-1.5 text-right text-white">${(p.price || 0).toLocaleString('es-AR')}</td>
                                <td className="px-3 py-1.5 text-center">
                                    <div className="flex justify-center gap-1">
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-blue-400" onClick={() => handleEdit(p)}><Edit2 className="w-3 h-3" /></Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-red-400" onClick={() => { deleteProduct(p.id); toast({ title: "Producto eliminado" }); }}><Trash2 className="w-3 h-3" /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ─── Categories Tab ───
const CategoriesTab = () => {
    const { categories, addCategory, deleteCategory } = useAppContext();
    const { toast } = useToast();
    const [newCat, setNewCat] = useState('');

    return (
        <div className="space-y-4 max-w-xl">
            <div className="flex gap-3">
                <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Nueva categoría..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-orange-500 focus:ring-2 outline-none"
                    onKeyDown={e => { if (e.key === 'Enter' && newCat.trim()) { addCategory(newCat.trim()); setNewCat(''); toast({ title: "Categoría agregada" }); } }} />
                <Button onClick={() => { if (newCat.trim()) { addCategory(newCat.trim()); setNewCat(''); toast({ title: "Categoría agregada" }); } }} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-1" /> Agregar
                </Button>
            </div>
            <div className="space-y-2">
                {categories.map(cat => (
                    <div key={cat.id} className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 flex justify-between items-center">
                        <span className="text-white">{cat.name}</span>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-400" onClick={() => { deleteCategory(cat.id); toast({ title: "Categoría eliminada" }); }}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
                {categories.length === 0 && <p className="text-slate-500 text-center py-6">No hay categorías.</p>}
            </div>
        </div>
    );
};

// ─── Tejidos Tab ───
const TejidosTab = () => {
    const { tejidoTypes, addTejido, updateTejido, deleteTejido } = useAppContext();
    const { toast } = useToast();
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', calibre: '', pulgadas: '', precio: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = { ...form, calibre: parseFloat(form.calibre), pulgadas: parseFloat(form.pulgadas), precio: parseFloat(form.precio) };
        if (editId) {
            updateTejido(editId, data);
            toast({ title: "Tejido actualizado" });
            setEditId(null);
        } else {
            addTejido(data);
            toast({ title: "Tejido agregado" });
        }
        setForm({ name: '', calibre: '', pulgadas: '', precio: '' });
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div>
                    <label className="text-slate-400 text-xs block mb-1">Nombre</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Tejido romboidal..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-orange-500 focus:ring-2 outline-none" required />
                </div>
                <div>
                    <label className="text-slate-400 text-xs block mb-1">Calibre</label>
                    <input type="number" value={form.calibre} onChange={e => setForm(f => ({ ...f, calibre: e.target.value }))} placeholder="14"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-orange-500 focus:ring-2 outline-none" required step="0.1" />
                </div>
                <div>
                    <label className="text-slate-400 text-xs block mb-1">Pulgadas</label>
                    <input type="number" value={form.pulgadas} onChange={e => setForm(f => ({ ...f, pulgadas: e.target.value }))} placeholder="2"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-orange-500 focus:ring-2 outline-none" required step="0.25" />
                </div>
                <div>
                    <label className="text-slate-400 text-xs block mb-1">Precio ($/ml)</label>
                    <input type="number" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} placeholder="0.00"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-orange-500 focus:ring-2 outline-none" required min="0" step="0.01" />
                </div>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 h-10">
                    {editId ? <><Save className="w-4 h-4 mr-1" /> Guardar</> : <><Plus className="w-4 h-4 mr-1" /> Agregar</>}
                </Button>
            </form>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-900">
                        <tr>
                            <th className="px-3 py-2 text-left text-slate-400 text-xs uppercase">Nombre</th>
                            <th className="px-3 py-2 text-center text-slate-400 text-xs uppercase">Calibre</th>
                            <th className="px-3 py-2 text-center text-slate-400 text-xs uppercase">Pulgadas</th>
                            <th className="px-3 py-2 text-right text-slate-400 text-xs uppercase">Precio/ml</th>
                            <th className="px-3 py-2 text-center text-slate-400 text-xs uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {tejidoTypes.map(t => (
                            <tr key={t.id} className="hover:bg-slate-700/30">
                                <td className="px-3 py-1.5 text-white">{t.name || `Tejido Cal.${t.calibre}`}</td>
                                <td className="px-3 py-1.5 text-center text-slate-300">{t.calibre}</td>
                                <td className="px-3 py-1.5 text-center text-slate-300">{t.pulgadas}"</td>
                                <td className="px-3 py-1.5 text-right text-white">${(t.precio || 0).toLocaleString('es-AR')}</td>
                                <td className="px-3 py-1.5 text-center">
                                    <div className="flex justify-center gap-1">
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-blue-400" onClick={() => { setEditId(t.id); setForm({ name: t.name || '', calibre: String(t.calibre), pulgadas: String(t.pulgadas), precio: String(t.precio) }); }}><Edit2 className="w-3 h-3" /></Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-red-400" onClick={() => { deleteTejido(t.id); toast({ title: "Tejido eliminado" }); }}><Trash2 className="w-3 h-3" /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {tejidoTypes.length === 0 && <tr><td colSpan="5" className="text-center py-6 text-slate-500">No hay tejidos configurados.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ─── Global Config Tab ───
const GlobalConfigTab = () => {
    const { globalConfig, updateGlobalConfig } = useAppContext();
    const { toast } = useToast();
    const [config, setConfig] = useState(globalConfig);

    const handleSave = () => {
        updateGlobalConfig(config);
        toast({ title: "Configuración guardada", description: "Los cambios han sido aplicados correctamente." });
    };

    const fields = [
        { key: 'iva', label: 'IVA (%)', type: 'number', step: '0.01', description: 'Porcentaje de IVA aplicado a los presupuestos.' },
        { key: 'dolarOficial', label: 'Cotización Dólar Oficial ($)', type: 'number', step: '1', description: 'Tipo de cambio para normalización de moneda USD → ARS.' },
        { key: 'margenDefault', label: 'Margen por Defecto (%)', type: 'number', step: '0.01', description: 'Margen de ganancia aplicado por defecto.' },
        { key: 'validezPresupuesto', label: 'Validez Presupuesto (días)', type: 'number', step: '1', description: 'Días de validez del presupuesto impreso.' },
        { key: 'moneda', label: 'Moneda', type: 'select', options: ['ARS', 'USD'], description: 'Moneda principal del sistema.' },
    ];

    return (
        <div className="max-w-2xl space-y-6">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                <p className="text-yellow-400 text-sm">⚠ Estos valores son globales y afectan a toda la aplicación. Modifique con cuidado.</p>
            </div>

            <div className="space-y-4">
                {fields.map(field => (
                    <div key={field.key} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                        <label className="text-white font-medium block mb-1">{field.label}</label>
                        <p className="text-slate-400 text-xs mb-2">{field.description}</p>
                        {field.type === 'select' ? (
                            <select value={config[field.key] || ''} onChange={e => setConfig(c => ({ ...c, [field.key]: e.target.value }))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none">
                                {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        ) : (
                            <input type={field.type} value={config[field.key] ?? ''} onChange={e => setConfig(c => ({ ...c, [field.key]: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none" step={field.step} />
                        )}
                    </div>
                ))}
            </div>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 w-full h-12 text-lg">
                <Save className="w-5 h-5 mr-2" /> Guardar Configuración
            </Button>
        </div>
    );
};

// ─── Mass Price Update Tab ───
const MassPriceTab = () => {
    const { categories, updatePricesByPercentage } = useAppContext();
    const { toast } = useToast();
    const [percentage, setPercentage] = useState('');
    const [category, setCategory] = useState('all');
    const [preview, setPreview] = useState(false);

    const handleApply = () => {
        const pct = parseFloat(percentage);
        if (isNaN(pct) || pct === 0) {
            toast({ title: "Error", description: "Ingrese un porcentaje válido.", variant: "destructive" });
            return;
        }
        if (!window.confirm(`¿Está seguro de ${pct > 0 ? 'aumentar' : 'reducir'} un ${Math.abs(pct)}% los precios ${category !== 'all' ? `de la categoría "${category}"` : 'de todos los productos'}?`)) return;

        updatePricesByPercentage(pct, category === 'all' ? null : category);
        toast({ title: "Precios actualizados", description: `Se aplicó un ${pct > 0 ? '+' : ''}${pct}% ${category !== 'all' ? `a '${category}'` : 'a todos los productos'}.` });
        setPercentage('');
    };

    return (
        <div className="max-w-lg space-y-6">
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Actualización Masiva de Precios</h3>
                <p className="text-slate-400 text-sm">Aplique un porcentaje de aumento o descuento a todos los productos o a una categoría específica.</p>

                <div>
                    <label className="text-slate-300 text-sm block mb-1">Porcentaje (%)</label>
                    <input type="number" value={percentage} onChange={e => setPercentage(e.target.value)} placeholder="Ej: 15 para +15%, -10 para -10%"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-2xl text-center focus:ring-2 focus:ring-orange-500 outline-none" step="0.1" />
                </div>
                <div>
                    <label className="text-slate-300 text-sm block mb-1">Categoría (opcional)</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none">
                        <option value="all">Todos los productos</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                <Button onClick={handleApply} className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg" disabled={!percentage}>
                    <DollarSign className="w-5 h-5 mr-2" /> Aplicar Cambio de Precios
                </Button>
            </div>
        </div>
    );
};

// ─── Clients CRM Tab ───
const ClientsCRMTab = () => {
    const { clients, addOrUpdateClient } = useAppContext();
    const { toast } = useToast();
    const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        addOrUpdateClient({ ...form });
        toast({ title: "Cliente guardado" });
        setForm({ name: '', phone: '', email: '', notes: '' });
    };

    const filtered = clients.filter(c => {
        const term = searchTerm.toLowerCase();
        return (c.name || '').toLowerCase().includes(term) || (c.phone || '').includes(term) || (c.email || '').toLowerCase().includes(term);
    });

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div>
                    <label className="text-slate-400 text-xs block mb-1">Nombre *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre completo"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-orange-500 focus:ring-2 outline-none" required />
                </div>
                <div>
                    <label className="text-slate-400 text-xs block mb-1">Teléfono</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="011 XXXX-XXXX"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-orange-500 focus:ring-2 outline-none" />
                </div>
                <div>
                    <label className="text-slate-400 text-xs block mb-1">Email</label>
                    <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="correo@email.com" type="email"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-orange-500 focus:ring-2 outline-none" />
                </div>
                <div>
                    <label className="text-slate-400 text-xs block mb-1">Notas</label>
                    <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notas..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm focus:ring-orange-500 focus:ring-2 outline-none" />
                </div>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 h-10">
                    <Plus className="w-4 h-4 mr-1" /> Agregar
                </Button>
            </form>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar clientes..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:ring-orange-500 focus:ring-2 outline-none" />
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-auto max-h-[450px]">
                <table className="w-full text-sm">
                    <thead className="bg-slate-900 sticky top-0">
                        <tr>
                            <th className="px-3 py-2 text-left text-slate-400 text-xs uppercase">Nombre</th>
                            <th className="px-3 py-2 text-left text-slate-400 text-xs uppercase">Teléfono</th>
                            <th className="px-3 py-2 text-left text-slate-400 text-xs uppercase">Email</th>
                            <th className="px-3 py-2 text-center text-slate-400 text-xs uppercase">Actividades</th>
                            <th className="px-3 py-2 text-right text-slate-400 text-xs uppercase">Saldo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {filtered.map(client => (
                            <tr key={client.id} className="hover:bg-slate-700/30">
                                <td className="px-3 py-2 text-white font-medium">{client.name}</td>
                                <td className="px-3 py-2 text-slate-300">{client.phone || '-'}</td>
                                <td className="px-3 py-2 text-slate-300">{client.email || '-'}</td>
                                <td className="px-3 py-2 text-center">
                                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs">{client.activities?.length || 0}</span>
                                </td>
                                <td className="px-3 py-2 text-right text-green-400 font-medium">${(client.balance || 0).toLocaleString('es-AR')}</td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan="5" className="text-center py-6 text-slate-500">No hay clientes.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ─── Main AdminDashboard ───
const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <Helmet>
                <title>Administración - Alambrados Belgrano</title>
            </Helmet>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <Settings className="w-8 h-8 text-orange-500" />
                    Panel de Administración
                </h1>

                <Tabs defaultValue="products" className="space-y-6">
                    <TabsList className="bg-slate-800 border border-slate-700 flex-wrap h-auto gap-1 p-1">
                        <TabsTrigger value="products" className="data-[state=active]:bg-orange-600 text-xs sm:text-sm">
                            <Package className="w-4 h-4 mr-1" /> Productos
                        </TabsTrigger>
                        <TabsTrigger value="categories" className="data-[state=active]:bg-orange-600 text-xs sm:text-sm">
                            <Tag className="w-4 h-4 mr-1" /> Categorías
                        </TabsTrigger>
                        <TabsTrigger value="tejidos" className="data-[state=active]:bg-orange-600 text-xs sm:text-sm">
                            <Layers className="w-4 h-4 mr-1" /> Tejidos
                        </TabsTrigger>
                        <TabsTrigger value="config" className="data-[state=active]:bg-orange-600 text-xs sm:text-sm">
                            <Globe className="w-4 h-4 mr-1" /> Config Global
                        </TabsTrigger>
                        <TabsTrigger value="prices" className="data-[state=active]:bg-orange-600 text-xs sm:text-sm">
                            <DollarSign className="w-4 h-4 mr-1" /> Precios Masivos
                        </TabsTrigger>
                        <TabsTrigger value="clients" className="data-[state=active]:bg-orange-600 text-xs sm:text-sm">
                            <Users className="w-4 h-4 mr-1" /> CRM
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="products"><ProductsTab /></TabsContent>
                    <TabsContent value="categories"><CategoriesTab /></TabsContent>
                    <TabsContent value="tejidos"><TejidosTab /></TabsContent>
                    <TabsContent value="config"><GlobalConfigTab /></TabsContent>
                    <TabsContent value="prices"><MassPriceTab /></TabsContent>
                    <TabsContent value="clients"><ClientsCRMTab /></TabsContent>
                </Tabs>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
