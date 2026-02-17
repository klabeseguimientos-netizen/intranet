// resources/js/Pages/Comercial/Leads/Show.tsx
import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import LeadHeader from '@/components/leads/LeadHeader';
import LeadStatsCards from '@/components/leads/LeadStatsCards';
import LeadTabs, { Tab } from '@/components/leads/LeadTabs'; // Importamos Tab
import InfoTab from '@/components/leads/tabs/InfoTab';
import NotasTab from '@/components/leads/tabs/NotasTab';
import ComentariosTab from '@/components/leads/tabs/ComentariosTab';
import TiemposTab from '@/components/leads/tabs/TiemposTab';
import NotificacionesTab from '@/components/leads/tabs/NotificacionesTab';
import PresupuestosLegacyTab from '@/components/leads/tabs/PresupuestosLegacyTab';
import NuevoComentarioModal from '@/components/Modals/NuevoComentarioModal';
import EditarLeadModal from '@/components/Modals/EditarLeadModal';
import { useLeadModals } from '@/hooks/useLeadModal';
import { User, MessageSquare, Bell, TrendingUp, FileText } from 'lucide-react';
import {
  Lead,
  Origen,
  EstadoLead,
  TipoComentario,
  Rubro,
  Provincia,
  Comercial
} from '@/types/leads';

interface PageProps {
  auth: {
    user: {
      ve_todas_cuentas: boolean;
      rol_id: number;
      personal_id: number;
      nombre_completo?: string;
    };
  };
  lead: Lead;
  notas: Array<any>;
  comentarios: Array<any>;
  notificaciones: Array<any>;
  presupuestos_legacy?: Array<any>;
  estadisticas: {
    total_notas: number;
    total_comentarios: number;
    total_notificaciones: number;
    total_presupuestos_legacy: number;
    notificaciones_no_leidas: number;
  };
  origenes?: Origen[];
  estadosLead?: EstadoLead[];
  tiposComentario?: TipoComentario[];
  rubros?: Rubro[];
  provincias?: Provincia[];
  comerciales?: Comercial[];
}

export default function Show({ 
  lead, 
  notas, 
  comentarios, 
  notificaciones,
  presupuestos_legacy = [],
  estadisticas,
  auth,
  origenes = [],
  estadosLead = [],
  tiposComentario = [],
  rubros = [],
  provincias = [],
  comerciales = []
}: PageProps) {
  const [activeTab, setActiveTab] = useState('informacion');
  const { modals, abrirModal, cerrarModales } = useLeadModals();

  const puedeVerTiempos = auth.user.ve_todas_cuentas === true || auth.user.rol_id !== 5;

  // Construir tabs condicionalmente - TIPADO EXPLÍCITO
  const tabs: Tab[] = [
    { id: 'informacion', label: 'Información', icon: <User className="h-4 w-4" /> },
  ];

  // Solo agregar tab de notas si hay notas
  if (estadisticas.total_notas > 0) {
    tabs.push({ 
      id: 'notas', 
      label: 'Notas', 
      icon: <MessageSquare className="h-4 w-4" />, 
      count: estadisticas.total_notas 
    });
  }

  // Comentarios siempre visible
  tabs.push({ 
    id: 'comentarios', 
    label: 'Comentarios', 
    icon: <MessageSquare className="h-4 w-4" />, 
    count: estadisticas.total_comentarios 
  });

  // Tiempos condicional por permisos
  if (puedeVerTiempos) {
    tabs.push({ 
      id: 'tiempos', 
      label: 'Tiempos', 
      icon: <TrendingUp className="h-4 w-4" /> 
    });
  }

  // Notificaciones solo si hay
  if (estadisticas.total_notificaciones > 0) {
    tabs.push({ 
      id: 'notificaciones', 
      label: 'Notificaciones', 
      icon: <Bell className="h-4 w-4" />, 
      count: estadisticas.total_notificaciones 
    });
  }

  // Presupuestos legacy solo si hay
  if (estadisticas.total_presupuestos_legacy > 0) {
    tabs.push({ 
      id: 'presupuestos-legacy', 
      label: 'Presupuestos Anteriores', 
      icon: <FileText className="h-4 w-4" />, 
      count: estadisticas.total_presupuestos_legacy 
    });
  }

  // Asegurar que el activeTab sea válido
  useEffect(() => {
    const tabExists = tabs.some(tab => tab.id === activeTab);
    if (!tabExists && tabs.length > 0) {
      setActiveTab(tabs[0].id);
    }
  }, [activeTab, tabs]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'informacion':
        return <InfoTab lead={lead} />;
      case 'notas':
        return <NotasTab notas={notas} onNuevoComentario={() => abrirModal('nuevoComentario', lead)} />;
      case 'comentarios':
        return (
          <ComentariosTab 
            comentarios={comentarios} 
            onNuevoComentario={() => abrirModal('nuevoComentario', lead)}
            total={estadisticas.total_comentarios}
          />
        );
      case 'tiempos':
        return <TiemposTab leadId={lead.id} puedeVer={puedeVerTiempos} />;
      case 'notificaciones':
        return <NotificacionesTab notificaciones={notificaciones} />;
      case 'presupuestos-legacy':
        return <PresupuestosLegacyTab presupuestos={presupuestos_legacy} />;
      default:
        return null;
    }
  };

  return (
    <AppLayout title={`Lead #${lead.id} - ${lead.nombre_completo}`}>
      <Head title={`Lead #${lead.id} - ${lead.nombre_completo}`} />
      
      <div className="w-full px-2 sm:px-4 py-3 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <LeadHeader
            lead={lead}
            onEditar={() => abrirModal('editar', lead)}
            onNuevoComentario={() => abrirModal('nuevoComentario', lead)}
          />
        </div>

        {/* Stats Cards - solo si hay alguna estadística relevante */}
        {(estadisticas.total_notas > 0 || 
          estadisticas.total_comentarios > 0 || 
          estadisticas.total_notificaciones > 0 || 
          estadisticas.total_presupuestos_legacy > 0) && (
          <div className="mb-4 sm:mb-6 w-full">
            <LeadStatsCards estadisticas={estadisticas} />
          </div>
        )}

        {/* Solo mostrar tabs si hay más de 1 (información + algo más) */}
        {tabs.length > 1 && (
          <div className="mb-4 sm:mb-6 w-full">
            <LeadTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={tabs}
            />
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden w-full">
          {renderTabContent()}
        </div>
      </div>

      <NuevoComentarioModal
        isOpen={modals.nuevoComentario}
        onClose={cerrarModales}
        lead={lead}
        tiposComentario={tiposComentario}
        estadosLead={estadosLead}
        comentariosExistentes={comentarios.length}
        onSuccess={() => {
          router.reload({ only: ['lead', 'comentarios', 'estadisticas'] });
        }}
      />
      
      <EditarLeadModal
        isOpen={modals.editar}
        onClose={cerrarModales}
        lead={lead}
        origenes={origenes}
        rubros={rubros}
        comerciales={comerciales}
        provincias={provincias}
        usuario={auth.user}
        onSuccess={() => {
          router.reload();
        }}
      />
    </AppLayout>
  );
}