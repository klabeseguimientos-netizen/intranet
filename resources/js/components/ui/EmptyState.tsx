// resources/js/components/ui/EmptyState.tsx
import React from 'react';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  title?: string;
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  hasFilters,
  onClearFilters,
  title,
  message
}) => {
  const defaultTitle = hasFilters 
    ? 'No se encontraron prospectos'
    : 'No hay prospectos disponibles';
    
  const defaultMessage = hasFilters
    ? 'No se encontraron prospectos con los filtros aplicados.'
    : 'No hay prospectos registrados en el sistema.';

  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title || defaultTitle}
      </h3>
      <p className="text-gray-600 text-sm max-w-md mx-auto">
        {message || defaultMessage}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-3 px-4 py-2 bg-sat text-white text-sm rounded hover:bg-sat-600 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
};

export default EmptyState;