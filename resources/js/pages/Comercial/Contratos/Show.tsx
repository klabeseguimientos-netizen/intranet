// resources/js/Pages/Comercial/Contratos/Show.tsx

import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, FileText, Calendar, User, Building, Truck, CreditCard, Download } from 'lucide-react';
import { DataCard } from '@/components/ui/DataCard';
import { InfoRow } from '@/components/ui/InfoRow';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Amount } from '@/components/ui/Amount';
import { SensitiveData } from '@/components/ui/SensitiveData';
import { formatDate } from '@/utils/formatters';

interface Props {
    contrato: any;
}

export default function ContratoShow({ contrato }: Props) {
    const getEstadoColor = (estadoId?: number) => {
        switch(estadoId) {
            case 1: return 'green'; // activo
            case 2: return 'yellow'; // vencido
            case 3: return 'blue'; // aprobado
            case 4: return 'red'; // rechazado
            case 5: return 'orange'; // pendiente
            case 6: return 'purple'; // instalado
            default: return 'gray';
        }
    };

    const handleDescargarPDF = () => {
        window.open(`/comercial/contratos/${contrato.id}/pdf?download=1`, '_blank');
    };

    const handleVerPDF = () => {
        window.open(`/comercial/contratos/${contrato.id}/pdf`, '_blank');
    };

    return (
        <AppLayout title={`Contrato #${contrato.numero_contrato}`}>
            <Head title={`Contrato #${contrato.numero_contrato}`} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.visit('/comercial/contratos')}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Contrato #{contrato.numero_contrato}
                            </h1>
                            <StatusBadge 
                                status={contrato.estado?.nombre || 'Sin estado'} 
                                color={getEstadoColor(contrato.estado_id)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            onClick={handleVerPDF}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                        >
                            <FileText className="h-4 w-4" />
                            Ver PDF
                        </button>
                        <button
                            onClick={handleDescargarPDF}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Descargar PDF
                        </button>
                    </div>
                </div>

                {/* Información General */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <DataCard title="Información del Contrato" icon={<FileText className="h-5 w-5" />}>
                        <div className="space-y-3">
                            <InfoRow label="Fecha emisión" value={formatDate(contrato.fecha_emision)} />
                            <InfoRow label="Referencia" value={contrato.presupuesto_referencia} />
                            <InfoRow label="Vehículos" value={`${contrato.presupuesto_cantidad_vehiculos} unidad(es)`} />
                            <InfoRow label="Vendedor" value={contrato.vendedor_nombre || 'No asignado'} />
                        </div>
                    </DataCard>

                    <DataCard title="Cliente" icon={<User className="h-5 w-5" />}>
                        <div className="space-y-3">
                            <InfoRow label="Nombre" value={contrato.cliente_nombre_completo} />
                            <InfoRow label="Email" value={contrato.cliente_email || '-'} />
                            <InfoRow label="Teléfono" value={contrato.cliente_telefono || '-'} />
                            <InfoRow label="Localidad" value={`${contrato.cliente_localidad || ''} ${contrato.cliente_provincia ? `, ${contrato.cliente_provincia}` : ''}`} />
                        </div>
                    </DataCard>

                    <DataCard title="Empresa" icon={<Building className="h-5 w-5" />}>
                        <div className="space-y-3">
                            <InfoRow label="Razón social" value={contrato.empresa_razon_social} />
                            <InfoRow label="CUIT" value={contrato.empresa_cuit} />
                            <InfoRow label="Actividad" value={contrato.empresa_actividad || '-'} />
                            <InfoRow label="Flota" value={contrato.empresa_nombre_flota || '-'} />
                        </div>
                    </DataCard>
                </div>

                {/* Totales */}
                <DataCard title="Resumen Económico" className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-600 mb-1">Inversión Inicial</p>
                            <Amount value={contrato.presupuesto_total_inversion} className="text-xl font-bold text-blue-700" />
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-sm text-green-600 mb-1">Costo Mensual</p>
                            <Amount value={contrato.presupuesto_total_mensual} className="text-xl font-bold text-green-700" />
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <p className="text-sm text-orange-600 mb-1">Total Primer Mes</p>
                            <Amount value={Number(contrato.presupuesto_total_inversion) + Number(contrato.presupuesto_total_mensual)} className="text-xl font-bold text-orange-700" />
                        </div>
                    </div>
                </DataCard>

                {/* Responsables */}
                {(contrato.responsable_flota_nombre || contrato.responsable_pagos_nombre) && (
                    <DataCard title="Responsables" className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {contrato.responsable_flota_nombre && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">🚛 Responsable de Flota</h4>
                                    <p className="text-sm">{contrato.responsable_flota_nombre}</p>
                                    {contrato.responsable_flota_telefono && (
                                        <p className="text-sm text-gray-600 mt-1">📞 {contrato.responsable_flota_telefono}</p>
                                    )}
                                    {contrato.responsable_flota_email && (
                                        <p className="text-sm text-gray-600">✉️ {contrato.responsable_flota_email}</p>
                                    )}
                                </div>
                            )}
                            {contrato.responsable_pagos_nombre && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">💰 Responsable de Pagos</h4>
                                    <p className="text-sm">{contrato.responsable_pagos_nombre}</p>
                                    {contrato.responsable_pagos_telefono && (
                                        <p className="text-sm text-gray-600 mt-1">📞 {contrato.responsable_pagos_telefono}</p>
                                    )}
                                    {contrato.responsable_pagos_email && (
                                        <p className="text-sm text-gray-600">✉️ {contrato.responsable_pagos_email}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </DataCard>
                )}

                {/* Método de Pago - CON SENSITIVE DATA */}
                {contrato.debito_cbu && (
                    <DataCard title="Débito por CBU" icon={<CreditCard className="h-5 w-5" />} className="mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <InfoRow label="Banco" value={contrato.debito_cbu.nombre_banco} />
                            <InfoRow label="Tipo cuenta" value={contrato.debito_cbu.tipo_cuenta === 'caja_ahorro' ? 'Caja de ahorro' : 'Cuenta corriente'} />
                            <InfoRow 
                                label="CBU" 
                                value={
                                    <SensitiveData 
                                        value={contrato.debito_cbu.cbu} 
                                        maskLength={22}
                                        contratoId={contrato.id}
                                        tipoDato="cbu"  // ← Asegurate que sea exactamente "cbu"
                                    />
                                } 
                            />
                            <InfoRow label="Alias" value={contrato.debito_cbu.alias_cbu || '-'} />
                            <InfoRow label="Titular" value={contrato.debito_cbu.titular_cuenta} />
                        </div>
                    </DataCard>
                )}

                {contrato.debito_tarjeta && (
                    <DataCard title="Débito por Tarjeta" icon={<CreditCard className="h-5 w-5" />} className="mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <InfoRow label="Banco" value={contrato.debito_tarjeta.tarjeta_banco} />
                            <InfoRow label="Emisor" value={contrato.debito_tarjeta.tarjeta_emisor} />
                            <InfoRow label="Tipo" value={contrato.debito_tarjeta.tipo_tarjeta === 'debito' ? 'Débito' : 'Crédito'} />
                            <InfoRow 
                                label="Número" 
                                value={
                                    <SensitiveData 
                                        value={contrato.debito_tarjeta.tarjeta_numero} 
                                        maskLength={16}
                                        contratoId={contrato.id}
                                        tipoDato="tarjeta_numero"
                                    />
                                } 
                            />
                            <InfoRow 
                                label="Vencimiento" 
                                value={
                                    <SensitiveData 
                                        value={contrato.debito_tarjeta.tarjeta_expiracion} 
                                        maskLength={5}
                                        contratoId={contrato.id}
                                        tipoDato="tarjeta_vencimiento"
                                    />
                                } 
                            />

                            <InfoRow 
                                label="CVV" 
                                value={
                                    <SensitiveData 
                                        value={contrato.debito_tarjeta.tarjeta_codigo} 
                                        maskLength={3}
                                        contratoId={contrato.id}
                                        tipoDato="tarjeta_codigo"
                                    />
                                } 
                            />
                            <InfoRow label="Titular" value={contrato.debito_tarjeta.titular_tarjeta} />
                        </div>
                    </DataCard>
                )}

                {/* Vehículos */}
                {contrato.vehiculos?.length > 0 && (
                    <DataCard title="Vehículos" icon={<Truck className="h-5 w-5" />}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patente</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Año</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identificador</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {contrato.vehiculos.map((vehiculo: any) => (
                                        <tr key={vehiculo.id}>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{vehiculo.patente}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{vehiculo.marca || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{vehiculo.modelo || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{vehiculo.anio || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{vehiculo.color || '-'}</td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{vehiculo.identificador || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </DataCard>
                )}
            </div>
        </AppLayout>
    );
}