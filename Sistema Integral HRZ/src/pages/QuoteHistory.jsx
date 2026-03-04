import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, AlertCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import QuoteSearchBar from '@/components/QuoteSearchBar';
import QuoteListTable from '@/components/QuoteListTable';
import { generateQuotePDF } from '@/utils/PDFGenerator';

const QuoteHistory = () => {
  const { presupuestos, deletePresupuesto, setEditingQuote } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [quoteToDelete, setQuoteToDelete] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Filter Logic
  const filteredQuotes = useMemo(() => {
    if (!searchTerm) return presupuestos;

    const term = searchTerm.toLowerCase();
    
    // Check if term is a number or like #001
    const cleanNumberTerm = term.replace(/^#/, '').replace(/^0+/, '');
    
    return presupuestos.filter(quote => {
      const clientName = quote.clientData?.name?.toLowerCase() || '';
      const quoteNum = String(quote.quoteNumber || '');
      
      // Match client name
      if (clientName.includes(term)) return true;
      
      // Match exact number or formatted number
      if (quoteNum === cleanNumberTerm) return true;
      if (quoteNum.includes(cleanNumberTerm) && cleanNumberTerm.length > 0) return true;
      
      return false;
    });
  }, [presupuestos, searchTerm]);

  // Actions
  const handleView = (quote) => {
    // Passing readonly state via route state
    navigate('/', { state: { viewQuote: quote } });
  };

  const handleEdit = (quote) => {
    // Set global editing state and navigate to dashboard
    setEditingQuote(quote);
    navigate('/');
  };

  const handleDownload = async (quote) => {
    try {
      await generateQuotePDF(quote, quote.clientData, null); 
      toast({
        title: "PDF Descargado",
        description: `Presupuesto #${String(quote.quoteNumber).padStart(3, '0')} descargado correctamente.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo generar el PDF.",
      });
    }
  };

  const confirmDelete = () => {
    if (quoteToDelete) {
      deletePresupuesto(quoteToDelete.id);
      setQuoteToDelete(null);
      toast({
        title: "Presupuesto eliminado",
        description: "El presupuesto ha sido eliminado correctamente.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <Helmet>
        <title>Historial de Presupuestos - Sistema</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-orange-500" />
              Historial de Presupuestos
            </h1>
            <p className="text-slate-400 mt-2">
              Administra, visualiza y descarga todos los presupuestos generados.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Presupuesto
          </Button>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 shadow-xl">
          <QuoteSearchBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            resultCount={filteredQuotes.length}
            totalCount={presupuestos.length}
          />

          {filteredQuotes.length > 0 ? (
            <QuoteListTable 
              quotes={filteredQuotes}
              onView={handleView}
              onEdit={handleEdit}
              onDownload={handleDownload}
              onDelete={setQuoteToDelete}
            />
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-800/20">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">
                {searchTerm ? 'No se encontraron resultados' : 'No hay presupuestos guardados'}
              </h3>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                {searchTerm 
                  ? `No encontramos ningún presupuesto que coincida con "${searchTerm}". Intenta con otro término.`
                  : 'Comienza generando un nuevo presupuesto desde el panel de ventas.'
                }
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')} className="border-slate-600">
                  Limpiar búsqueda
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      <AlertDialog open={!!quoteToDelete} onOpenChange={() => setQuoteToDelete(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white">
              <AlertCircle className="w-5 h-5 text-red-500" />
              ¿Eliminar presupuesto?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta acción no se puede deshacer. El presupuesto #{quoteToDelete?.quoteNumber ? String(quoteToDelete.quoteNumber).padStart(3, '0') : ''} de {quoteToDelete?.clientData?.name} será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white border-none">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuoteHistory;