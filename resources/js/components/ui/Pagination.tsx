// resources/js/components/ui/Pagination.tsx
import React from 'react';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;  // ← Callback para cambio de página
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange  // ← Usar esta prop en lugar de router directamente
}) => {
  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, total);
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
      <div className="text-sm text-gray-700">
        Mostrando <span className="font-medium">{startItem}</span> a{' '}
        <span className="font-medium">{endItem}</span>{' '}
        de <span className="font-medium">{total}</span> totales
      </div>
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}  // ← Usar callback
          disabled={currentPage === 1}
          className={`px-3 py-1 border rounded text-sm ${
            currentPage === 1 
              ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
              : 'text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          ← Anterior
        </button>
        <span className="px-3 py-1 text-sm text-gray-700 hidden sm:inline">
          Página {currentPage} de {lastPage}
        </span>
        <div className="flex items-center space-x-1 sm:hidden">
          <span className="text-sm text-gray-700">{currentPage}</span>
          <span className="text-sm text-gray-400">/</span>
          <span className="text-sm text-gray-700">{lastPage}</span>
        </div>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}  // ← Usar callback
          disabled={currentPage === lastPage}
          className={`px-3 py-1 border rounded text-sm ${
            currentPage === lastPage 
              ? 'text-gray-400 border-gray-300 cursor-not-allowed' 
              : 'text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
};

export default Pagination;