// resources/js/components/leads/LeadStatsCards.tsx
import React from 'react';
import { MessageSquare, Bell, AlertCircle } from 'lucide-react';

interface LeadStatsCardsProps {
  estadisticas: {
    total_notas: number;
    total_comentarios: number;
    total_notificaciones: number;
    notificaciones_no_leidas: number;
  };
}

const LeadStatsCards: React.FC<LeadStatsCardsProps> = ({ estadisticas }) => {
  const stats = [
    {
      id: 'notas',
      label: 'Notas',
      value: estadisticas.total_notas,
      icon: MessageSquare,
      color: 'text-blue-500',
    },
    {
      id: 'comentarios',
      label: 'Comentarios',
      value: estadisticas.total_comentarios,
      icon: MessageSquare,
      color: 'text-purple-500',
    },
    {
      id: 'notificaciones',
      label: 'Notificaciones',
      value: estadisticas.total_notificaciones,
      icon: Bell,
      color: 'text-orange-500',
    },
    {
      id: 'no_leidas',
      label: 'No leídas',
      value: estadisticas.notificaciones_no_leidas,
      icon: AlertCircle,
      color: 'text-red-500',
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-2 w-full">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="bg-white rounded-lg border border-gray-200 p-2 w-full"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-xs text-gray-500 truncate">{stat.label}</p>
                <p className="text-base sm:text-lg font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${stat.color} flex-shrink-0`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeadStatsCards;