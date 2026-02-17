// resources/js/components/ui/BadgeEstado.tsx
import React from 'react';
import { EstadoLead } from '@/types/leads';

interface BadgeEstadoProps {
  estado: EstadoLead;
}

const BadgeEstado: React.FC<BadgeEstadoProps> = ({ estado }) => {
  return (
    <span 
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
      style={{ 
        backgroundColor: `${estado.color_hex}20`, 
        color: estado.color_hex 
      }}
    >
      {estado.nombre}
    </span>
  );
};

export default BadgeEstado;