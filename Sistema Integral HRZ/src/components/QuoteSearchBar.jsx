import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const QuoteSearchBar = ({ searchTerm, onSearchChange, resultCount, totalCount }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar por cliente o número de presupuesto (#001)..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-orange-500"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between md:justify-end gap-4 min-w-[200px]">
        <div className="text-sm text-slate-400">
          Mostrando <span className="font-bold text-white">{resultCount}</span> de <span className="font-bold text-white">{totalCount}</span>
        </div>
      </div>
    </div>
  );
};

export default QuoteSearchBar;