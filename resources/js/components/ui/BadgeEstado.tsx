// components/ui/BadgeEstado.tsx
import React from 'react';

interface BadgeEstadoProps {
  estado: {
    nombre: string;
    tipo?: string;
    color_hex?: string; // ← Añadir color_hex
  };
  className?: string;
}

const BadgeEstado: React.FC<BadgeEstadoProps> = ({ estado, className = '' }) => {
  // Si tiene color_hex, usarlo para estilo inline
  if (estado.color_hex) {
    // Convertir hex a rgba para fondo suave (20% de opacidad)
    const hexToRgba = (hex: string, opacity: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    return (
      <span 
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
        style={{
          backgroundColor: hexToRgba(estado.color_hex, 0.15),
          color: estado.color_hex,
          border: `1px solid ${hexToRgba(estado.color_hex, 0.3)}`
        }}
      >
        {estado.nombre}
      </span>
    );
  }

  // Fallback por tipo si no hay color_hex
  const getFallbackColor = (tipo?: string) => {
    switch(tipo) {
      case 'nuevo': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'activo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'final_positivo': return 'bg-green-100 text-green-800 border-green-200';
      case 'final_negativo': return 'bg-red-100 text-red-800 border-red-200';
      case 'recontacto': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFallbackColor(estado.tipo)} ${className}`}>
      {estado.nombre}
    </span>
  );
};

export default BadgeEstado;