// resources/js/components/ui/EmptyState.tsx
import React from 'react';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  title?: string;
  message?: string;
  suggestion?: string; // Agregamos suggestion como prop opcional
}

const EmptyState: React.FC<EmptyStateProps> = ({
  hasFilters,
  onClearFilters,
  title,
  message,
  suggestion
}) => {
  const defaultTitle = hasFilters 
    ? 'No se encontraron resultados'
    : 'No hay datos disponibles';
    
  const defaultMessage = hasFilters
    ? 'No se encontraron elementos con los filtros aplicados.'
    : 'No hay elementos registrados en el sistema.';

  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title || defaultTitle}
      </h3>
      <p className="text-gray-600 text-sm max-w-md mx-auto">
        {message || defaultMessage}
      </p>
      {suggestion && (
        <p className="text-gray-500 text-sm max-w-md mx-auto mt-2">
          {suggestion}
        </p>
      )}
      {hasFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-3 px-4 py-2 bg-local text-white text-sm rounded hover:bg-local-600 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
};

export default EmptyState;