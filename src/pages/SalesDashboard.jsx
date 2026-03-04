import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { User, MapPin, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import QuoteForm from '@/components/QuoteForm';
import EditableQuoteForm from '@/components/EditableQuoteForm';
import QuoteDisplay from '@/components/QuoteDisplay';
import DrawingPanel from '@/components/DrawingPanel';
import { useAppContext } from '@/context/AppContext';
import { calculateMaterials } from '@/utils/calculateMaterials';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const SalesDashboard = () => {
    const {
        products,
        tejidoTypes,
        materialsConfig,
        materialsConfigByType,
        addPresupuesto,
        updateQuote,
        clearManualProducts,
        currentDrawing,
        saveDrawing,
        clearDrawing,
        clientData,
        updateClientData,
        editingQuote,
        clearEditingQuote,
        setEditingQuote
    } = useAppContext();

    const location = useLocation();
    const navigate = useNavigate();

    const [currentQuote, setCurrentQuote] = useState(null);
    const [selectedHistoryQuote, setSelectedHistoryQuote] = useState(null);
    const [activeTab, setActiveTab] = useState("calculator");

    useEffect(() => {
        if (location.state?.viewQuote) {
            setSelectedHistoryQuote(location.state.viewQuote);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleCalculate = (formData) => {
        const quote = calculateMaterials(formData, products, tejidoTypes, materialsConfig, materialsConfigByType);
        setCurrentQuote(quote);
        setSelectedHistoryQuote(null);
    };

    const handleReset = () => {
        setCurrentQuote(null);
        clearManualProducts();
        clearDrawing();
        if (editingQuote) {
            clearEditingQuote();
        }
        setSelectedHistoryQuote(null);
    };

    const handleSaveQuote = (finalQuote) => {
        const quoteWithDrawing = {
            ...finalQuote,
            drawing: currentDrawing
        };

        if (editingQuote) {
            updateQuote(quoteWithDrawing);
            clearEditingQuote();
            navigate('/quote-history');
        } else {
            addPresupuesto(quoteWithDrawing);
        }
    };

    const handleSelectHistoryQuote = (quote) => {
        setSelectedHistoryQuote(quote);
        setCurrentQuote(null);
        saveDrawing(quote.drawing || null);
    };

    const cancelEdit = () => {
        clearEditingQuote();
        setCurrentQuote(null);
        clearManualProducts();
        clearDrawing();
    };

    return (
        <>
            <Helmet>
                <title>Cotizador - Alambrados Belgrano</title>
                <meta name="description" content="Sistema profesional de generación de presupuestos para cerramientos y alambrados" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700">
                    <div className="absolute inset-0 opacity-5">
                        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent" />
                    </div>
                    <div className="relative container mx-auto px-4 py-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="max-w-3xl"
                        >
                            <h1 className="text-5xl font-bold text-white mb-4">
                                {editingQuote ? 'Editando Presupuesto' : 'Cotizador Inteligente'}
                            </h1>
                            {editingQuote && (
                                <div className="inline-block bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold mb-4">
                                    #{String(editingQuote.quoteNumber).padStart(3, '0')}
                                </div>
                            )}
                            <p className="text-xl text-slate-300 mb-2">
                                {editingQuote ? 'Modifique los ítems y guarde los cambios.' : 'Generación profesional de cotizaciones para cerramientos'}
                            </p>
                            {!editingQuote && (
                                <p className="text-slate-400">
                                    Calcule materiales, diseñe planos y gestione costos
                                </p>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        {!editingQuote && (
                            <div className="flex justify-center">
                                <TabsList className="bg-slate-800 border border-slate-700 p-1 rounded-xl">
                                    <TabsTrigger value="calculator" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-400 rounded-lg px-6 py-2 transition-all">
                                        Calculadora y Presupuesto
                                    </TabsTrigger>
                                    <TabsTrigger value="drawing" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-400 rounded-lg px-6 py-2 transition-all">
                                        Plano de Trabajo
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        )}

                        <TabsContent value="calculator" className="space-y-6">

                            {editingQuote && (
                                <div className="flex justify-end mb-4">
                                    <Button onClick={cancelEdit} variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-800">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Cancelar Edición
                                    </Button>
                                </div>
                            )}

                            {/* Client Data Section */}
                            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6 shadow-xl mb-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-orange-500" />
                                    Datos del Cliente
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            value={clientData.name}
                                            onChange={(e) => updateClientData('name', e.target.value)}
                                            placeholder="Nombre del Cliente"
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-4 w-4 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            value={clientData.address}
                                            onChange={(e) => updateClientData('address', e.target.value)}
                                            placeholder="Dirección del Cliente / Obra"
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {!editingQuote && (
                                    <div className="lg:col-span-1">
                                        <QuoteForm onCalculate={handleCalculate} />
                                    </div>
                                )}

                                <div className={editingQuote ? "lg:col-span-3" : "lg:col-span-2"}>
                                    {selectedHistoryQuote ? (
                                        <QuoteDisplay
                                            quote={selectedHistoryQuote}
                                            onReset={() => {
                                                setSelectedHistoryQuote(null);
                                                clearDrawing();
                                            }}
                                        />
                                    ) : (
                                        <EditableQuoteForm
                                            initialQuote={editingQuote || currentQuote}
                                            onSave={handleSaveQuote}
                                            onReset={handleReset}
                                            onSwitchToDrawing={() => setActiveTab('drawing')}
                                        />
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="drawing">
                            <DrawingPanel />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
};

export default SalesDashboard;
