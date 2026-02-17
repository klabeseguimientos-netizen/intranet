// components/leads/PipelineStatistics.tsx
import React from 'react';

interface PipelineStatisticsProps {
  estadisticas: {
    total: number;
    nuevo: number;
    contactado: number;
    calificado: number;
    propuesta: number;
    negociacion: number;
  };
}

const PipelineStatistics: React.FC<PipelineStatisticsProps> = ({ estadisticas }) => {
  const stages = [
    { key: 'nuevo', label: 'Nuevo', value: estadisticas.nuevo, color: 'gray' },
    { key: 'contactado', label: 'Contactado', value: estadisticas.contactado, color: 'blue' },
    { key: 'calificado', label: 'Calificado', value: estadisticas.calificado, color: 'yellow' },
    { key: 'propuesta', label: 'Propuesta', value: estadisticas.propuesta, color: 'purple' },
    { key: 'negociacion', label: 'Negociación', value: estadisticas.negociacion, color: 'orange' },
  ];

  const getColorClasses = (color: string) => {
    const classes = {
      gray: 'bg-gray-50 border-gray-200 text-gray-900',
      blue: 'bg-blue-50 border-blue-200 text-blue-600',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
      purple: 'bg-purple-50 border-purple-200 text-purple-600',
      orange: 'bg-orange-50 border-orange-200 text-orange-600',
    };
    return classes[color as keyof typeof classes] || classes.gray;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
      {stages.map((stage) => (
        <div 
          key={stage.key}
          className={`p-3 rounded-lg border text-center hover:opacity-90 transition-opacity cursor-pointer ${getColorClasses(stage.color)}`}
          onClick={() => {
            // Podrías navegar a una vista filtrada por este estado
            console.log(`Filtrar por ${stage.label}`);
          }}
        >
          <h3 className="font-medium text-xs md:text-sm mb-1">{stage.label}</h3>
          <p className="text-xl md:text-2xl font-bold">{stage.value}</p>
        </div>
      ))}
    </div>
  );
};

export default PipelineStatistics;