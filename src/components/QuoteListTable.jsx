import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Edit, Download, Trash2, Calendar, User, FileText, Hash, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const QuoteListTable = ({ quotes, onView, onEdit, onDownload, onDelete }) => {
  const { toast } = useToast();

  const formatQuoteId = (id) => {
    // If it's a number-like string or number, pad it
    if (!isNaN(id)) {
      return `#${String(id).padStart(3, '0')}`;
    }
    // Fallback for old UUIDs
    return '#' + String(id).substring(0, 6);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "ID copiado al portapapeles",
    });
  };

  return (
    <div className="rounded-xl border border-slate-700 overflow-hidden bg-slate-800/30">
      <Table>
        <TableHeader className="bg-slate-900/50">
          <TableRow className="border-slate-700 hover:bg-slate-900/50">
            <TableHead className="text-slate-400 font-medium w-[120px]">ID Presupuesto</TableHead>
            <TableHead className="text-slate-400 font-medium">Cliente</TableHead>
            <TableHead className="text-slate-400 font-medium">Fecha</TableHead>
            <TableHead className="text-slate-400 font-medium text-right">Monto Total</TableHead>
            <TableHead className="text-slate-400 font-medium text-center w-[100px]">Estado</TableHead>
            <TableHead className="text-slate-400 font-medium text-right w-[180px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {quotes.map((quote) => (
              <motion.tr
                key={quote.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layoutId={quote.id}
                className="group border-slate-700 hover:bg-slate-800/50 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center gap-2 group/id">
                    <span className="font-mono text-orange-400 font-bold">{formatQuoteId(quote.id)}</span>
                    <button
                      onClick={() => copyToClipboard(quote.id)}
                      className="opacity-0 group-hover/id:opacity-100 transition-opacity text-slate-400 hover:text-white"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                      <User className="w-3 h-3" />
                    </div>
                    <span className="text-slate-200 font-medium">
                      {quote.clientData?.name || 'Cliente Desconocido'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Calendar className="w-3 h-3" />
                    {new Date(quote.date).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-white font-bold bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
                    ${(quote.total || 0).toLocaleString('es-AR')}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {quote.status === 'Vendido' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      <CheckCircle className="w-3 h-3" /> Vendido
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      Vigente
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(quote)}
                      title="Ver Detalle"
                      className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(quote)}
                      title="Editar"
                      className="h-8 w-8 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10"
                      disabled={quote.status === 'Vendido'}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDownload(quote)}
                      title="Descargar PDF"
                      className="h-8 w-8 text-slate-400 hover:text-green-400 hover:bg-green-500/10"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(quote)}
                      title="Eliminar"
                      className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      disabled={quote.status === 'Vendido'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
};

export default QuoteListTable;