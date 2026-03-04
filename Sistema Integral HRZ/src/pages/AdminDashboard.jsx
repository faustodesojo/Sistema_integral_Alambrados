import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Package, Grid3x3, Calculator, Filter, Tags, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/components/ui/use-toast';
import ProductForm from '@/components/ProductForm';
import TejidoForm from '@/components/TejidoForm';
import MaterialsConfigByType from '@/components/MaterialsConfigByType';

const AdminDashboard = () => {
  const { 
    products, deleteProduct, addProduct, updateProduct, 
    tejidoTypes, deleteTejido, addTejido, updateTejido,
    categories, addCategory, deleteCategory 
  } = useAppContext();
  
  const { toast } = useToast();
  const [showProductForm, setShowProductForm] = useState(false);
  const [showTejidoForm, setShowTejidoForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingTejido, setEditingTejido] = useState(null);
  
  // Category Management State
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Filtering State
  const [productFilter, setProductFilter] = useState('Todos');
  const [categoryFilter, setCategoryFilter] = useState('Todas');

  const handleDeleteProduct = (id, name) => {
    if (window.confirm(`¿Está seguro de eliminar el producto "${name}"?`)) {
      deleteProduct(id);
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado correctamente.",
      });
    }
  };

  const handleDeleteTejido = (id, calibre) => {
    if (window.confirm(`¿Está seguro de eliminar el tejido calibre ${calibre}?`)) {
      deleteTejido(id);
      toast({
        title: "Tejido eliminado",
        description: "El tejido se ha eliminado correctamente.",
      });
    }
  };
  
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    const result = addCategory(newCategoryName);
    if (result) {
      setNewCategoryName('');
      toast({
        title: "Categoría creada",
        description: `Se ha creado la categoría "${result.name}".`
      });
    } else {
       toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear la categoría o ya existe."
      });
    }
  };
  
  const handleDeleteCategory = (id, name) => {
    // Check if used
    const count = products.filter(p => p.category === name).length;
    if (count > 0) {
      toast({
        variant: "destructive",
        title: "No se puede eliminar",
        description: `La categoría "${name}" tiene ${count} productos asignados.`
      });
      return;
    }
    
    if (window.confirm(`¿Eliminar la categoría "${name}"?`)) {
      deleteCategory(id);
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada correctamente."
      });
    }
  };

  const handleProductSubmit = (data) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct(data);
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleTejidoSubmit = (data) => {
    if (editingTejido) {
      updateTejido(editingTejido.id, data);
    } else {
      addTejido(data);
    }
    setShowTejidoForm(false);
    setEditingTejido(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleEditTejido = (tejido) => {
    setEditingTejido(tejido);
    setShowTejidoForm(true);
  };

  // Filter Logic
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by Functional Type
    if (productFilter !== 'Todos') {
      filtered = filtered.filter(product => {
        if (productFilter === 'Olímpico') {
          return product.productType === 'poste_olimpico' || product.name.includes('Olimpico');
        }
        if (productFilter === 'Hormigón Recto') {
          return product.productType === 'poste_recto' || product.name.includes('Recto');
        }
        if (productFilter === 'Quebracho Colorado') {
          return product.productType === 'poste_quebracho' || product.name.includes('Quebracho');
        }
        if (productFilter === 'Accesorios') {
          return product.type === 'accesorios';
        }
        return true;
      });
    }
    
    // Filter by Custom Category
    if (categoryFilter !== 'Todas') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    return filtered;
  }, [products, productFilter, categoryFilter]);

  const typeFilterOptions = ["Todos", "Olímpico", "Hormigón Recto", "Quebracho Colorado", "Accesorios"];

  return (
    <>
      <Helmet>
        <title>Panel de Administración - Sistema de Presupuestos</title>
        <meta name="description" content="Panel de administración para gestionar productos y tipos de tejido" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-8">Panel de Administración</h1>

            <Tabs defaultValue="productos" className="space-y-6">
              <TabsList className="bg-slate-800 border border-slate-700">
                <TabsTrigger value="productos" className="data-[state=active]:bg-orange-600">
                  <Package className="w-4 h-4 mr-2" />
                  Productos
                </TabsTrigger>
                <TabsTrigger value="categorias" className="data-[state=active]:bg-orange-600">
                  <Tags className="w-4 h-4 mr-2" />
                  Categorías
                </TabsTrigger>
                <TabsTrigger value="tejidos" className="data-[state=active]:bg-orange-600">
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  Tipos de Tejido
                </TabsTrigger>
                <TabsTrigger value="configuracion" className="data-[state=active]:bg-orange-600">
                  <Calculator className="w-4 h-4 mr-2" />
                  Cálculo de Materiales
                </TabsTrigger>
              </TabsList>

              <TabsContent value="productos">
                <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-6 shadow-2xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-white">Gestión de Productos</h2>
                    
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Functional Type Filter */}
                      <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                          value={productFilter}
                          onChange={(e) => setProductFilter(e.target.value)}
                          className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                        >
                          {typeFilterOptions.map(opt => (
                            <option key={opt} value={opt} className="bg-slate-800">{opt}</option>
                          ))}
                        </select>
                      </div>

                       {/* Category Filter */}
                       <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700">
                        <Tags className="w-4 h-4 text-slate-400" />
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                        >
                          <option value="Todas" className="bg-slate-800">Todas las Categorías</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name} className="bg-slate-800">{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <span className="text-xs text-slate-500 border-l border-slate-700 pl-2">
                        {filteredProducts.length} items
                      </span>

                      <Button
                        onClick={() => {
                          setEditingProduct(null);
                          setShowProductForm(true);
                        }}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Producto
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Nombre</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Descripción</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Dimensiones</th>
                          <th className="text-right px-4 py-3 text-sm font-semibold text-slate-300">Precio</th>
                          <th className="text-center px-4 py-3 text-sm font-semibold text-slate-300">Categoría</th>
                          <th className="text-center px-4 py-3 text-sm font-semibold text-slate-300">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-8 text-slate-500 italic">
                              No se encontraron productos para el filtro seleccionado.
                            </td>
                          </tr>
                        ) : (
                          filteredProducts.map((product) => (
                            <tr key={product.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                              <td className="px-4 py-3 text-white font-medium">{product.name}</td>
                              <td className="px-4 py-3 text-slate-300 text-sm">{product.description}</td>
                              <td className="px-4 py-3 text-slate-300 text-sm">{product.dimensions}</td>
                              <td className="px-4 py-3 text-right text-white">${product.price.toLocaleString('es-AR')}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                                  {product.category || 'General'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    onClick={() => handleEditProduct(product)}
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-slate-700"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteProduct(product.id, product.name)}
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-red-900/20 hover:text-red-500"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="categorias">
                <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-6 shadow-2xl">
                   <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Gestión de Categorías</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Add Category Panel */}
                    <div className="md:col-span-1 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Nueva Categoría</h3>
                      <form onSubmit={handleAddCategory} className="space-y-4">
                        <input 
                          type="text" 
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Nombre de categoría"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Crear Categoría
                        </Button>
                      </form>
                      <div className="mt-6 p-3 bg-blue-900/20 border border-blue-900/50 rounded-lg text-xs text-blue-200">
                        <div className="flex items-center mb-1 font-semibold">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Nota
                        </div>
                        Las categorías se utilizan para agrupar visualmente los productos en el inventario.
                      </div>
                    </div>

                    {/* Category List */}
                    <div className="md:col-span-2 overflow-x-auto">
                       <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Nombre</th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-slate-300">Productos Asignados</th>
                            <th className="text-center px-4 py-3 text-sm font-semibold text-slate-300">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((cat) => {
                            const count = products.filter(p => p.category === cat.name).length;
                            return (
                              <tr key={cat.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                                <td className="px-4 py-3 text-white font-medium">{cat.name}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className="px-2 py-1 bg-slate-700 rounded-full text-xs text-white">
                                    {count} productos
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Button
                                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                    variant="ghost"
                                    size="sm"
                                    disabled={count > 0}
                                    className={`hover:bg-red-900/20 hover:text-red-500 ${count > 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    title={count > 0 ? "No se puede eliminar: tiene productos asignados" : "Eliminar categoría"}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tejidos">
                <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Gestión de Tipos de Tejido</h2>
                    <Button
                      onClick={() => {
                        setEditingTejido(null);
                        setShowTejidoForm(true);
                      }}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Tejido
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Nombre / Calibre</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Pulgadas</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Altura</th>
                          <th className="text-right px-4 py-3 text-sm font-semibold text-slate-300">Precio</th>
                          <th className="text-center px-4 py-3 text-sm font-semibold text-slate-300">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tejidoTypes.map((tejido) => (
                          <tr key={tejido.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-white font-medium">
                              {tejido.name || `Calibre ${tejido.calibre}`}
                            </td>
                            <td className="px-4 py-3 text-white">{tejido.pulgadas}"</td>
                            <td className="px-4 py-3 text-slate-300 text-sm">
                              {tejido.height || '-'}
                            </td>
                            <td className="px-4 py-3 text-right text-white">${tejido.precio.toLocaleString('es-AR')}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  onClick={() => handleEditTejido(tejido)}
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-slate-700"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteTejido(tejido.id, tejido.calibre)}
                                  variant="ghost"
                                  size="sm"
                                  className="hover:bg-red-900/20 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="configuracion">
                <MaterialsConfigByType />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleProductSubmit}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {showTejidoForm && (
        <TejidoForm
          tejido={editingTejido}
          onSubmit={handleTejidoSubmit}
          onCancel={() => {
            setShowTejidoForm(false);
            setEditingTejido(null);
          }}
        />
      )}
    </>
  );
};

export default AdminDashboard;