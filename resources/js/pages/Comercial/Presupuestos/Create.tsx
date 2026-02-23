// resources/js/Pages/Comercial/Presupuestos/Create.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { User } from 'lucide-react';
import { usePresupuestoForm } from '@/hooks/usePresupuestoForm';
import ResponsiveCard from '@/components/ui/ResponsiveCard';
import ResponsiveGrid from '@/components/ui/responsiveGrid';
import FormField from '@/components/ui/formField';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PromocionSelector from '@/components/presupuestos/PromocionSelector';
import AbonoSelector from '@/components/presupuestos/AbonoSelector';
import AccesoriosList from '@/components/presupuestos/AccesoriosList';
import ServiciosList from '@/components/presupuestos/ServiciosList';
import CalculosPresupuesto from '@/components/presupuestos/CalculosPresupuesto';
import { PresupuestosCreateProps } from '@/types/presupuestos';

export default function PresupuestosCreate({ 
    lead,
    usuario,
    comerciales = [],
    prefijos = [],
    promociones = [],
    tasas = [],
    abonos = [],
    convenios = [],
    accesorios = [],
    servicios = [],
    metodosPago = []
}: PresupuestosCreateProps) {
    
    const {
        state,
        valores,
        subtotales,
        esComercial,
        cantidadMinimaPromo,
        productosPromocionIds,
        accesoriosConPromocion,
        serviciosConPromocion,
        accesoriosNormales,   // ← Esto debe estar aquí
        serviciosNormales,     // ← Esto debe estar aquí
        tasaPromocion,
        abonoPromocion,
        updateField,
        aplicarPromocion,
        isFieldDisabled,
        setAccesoriosAgregados,
        setServiciosAgregados,
        handleSubmit,
        getError
    } = usePresupuestoForm({
        usuario,
        lead,
        prefijos,
        tasas,
        abonos,
        convenios,
        metodosPago,
        leadId: lead.id,
        promociones
    });

    return (
        <AppLayout title="Crear Presupuesto">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                <div className="mb-4 sm:mb-6">
                    <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
                        Crear Presupuesto
                    </h1>
                    <p className="mt-1 text-sm sm:text-base text-gray-600">
                        Complete los datos para generar un nuevo presupuesto
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Información del Cliente */}
                    <ResponsiveCard title="Información del Cliente">
                        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                            <p className="font-medium text-sm sm:text-base text-blue-800 break-words">
                                Creando presupuesto para: {lead.nombre_completo}
                            </p>
                            <p className="text-xs sm:text-sm text-blue-600 mt-1 break-words">
                                {lead.email} {lead.telefono && ` | ${lead.telefono}`}
                            </p>
                            {lead.prefijo && (
                                <p className="text-xs text-blue-500 mt-1">
                                    Prefijo asignado: {lead.prefijo.codigo} - {lead.prefijo.descripcion}
                                </p>
                            )}
                        </div>
                    </ResponsiveCard>

                    {/* Comercial Asignado */}
                    <ResponsiveCard title="Comercial Asignado">
                        {esComercial ? (
                            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <h3 className="font-medium text-sm sm:text-base text-blue-900">
                                            Usted será el comercial asignado
                                        </h3>
                                        <p className="text-xs sm:text-sm text-blue-700 mt-1 truncate">
                                            {usuario.nombre_completo}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <FormField 
                                label="Comercial a asignar" 
                                required 
                                error={getError('prefijo_id')}
                                htmlFor="prefijo_id"
                            >
                                <Select
                                    value={state.prefijoId.toString()}
                                    onValueChange={(value) => updateField('prefijoId', Number(value))}
                                >
                                    <SelectTrigger id="prefijo_id" className="bg-white w-full">
                                        <SelectValue placeholder="Seleccionar comercial" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white max-h-60">
                                        {comerciales.length > 0 ? (
                                            comerciales.map(comercial => (
                                                <SelectItem 
                                                    key={comercial.prefijo_id} 
                                                    value={comercial.prefijo_id.toString()}
                                                >
                                                    <span className="truncate">
                                                        {comercial.nombre} 
                                                        {lead.prefijo_id === comercial.prefijo_id && ' (Asignado)'}
                                                    </span>
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="0" disabled>
                                                No hay comerciales disponibles
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {lead.prefijo_id && (
                                    <p className="text-xs text-green-600 mt-1">
                                        ✓ Este lead tiene un comercial asignado
                                    </p>
                                )}
                            </FormField>
                        )}
                    </ResponsiveCard>

                    {/* Selección de Promoción */}
                    {promociones.length > 0 && (
                        <ResponsiveCard title="Promoción">
                            <PromocionSelector
                                value={state.promocionId}
                                onChange={(id) => {
                                    updateField('promocionId', id);
                                    aplicarPromocion(id);
                                }}
                                promociones={promociones}
                            />
                        </ResponsiveCard>
                    )}

                    {/* Configuración General */}
                    <ResponsiveCard title="Configuración General">
                        <ResponsiveGrid cols={{ default: 1, sm: 2 }}>
                            <FormField 
                                label="Cantidad de Vehículos" 
                                error={getError('cantidad_vehiculos')}
                            >
                                <input
                                    type="number"
                                    min={cantidadMinimaPromo}
                                    value={state.cantidadVehiculos}
                                    onChange={(e) => updateField('cantidadVehiculos', Number(e.target.value))}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                                />
                                {state.promocionId && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        Mínimo requerido por la promoción: {cantidadMinimaPromo} vehículo(s)
                                    </p>
                                )}
                            </FormField>

                            <FormField 
                                label="Validez (días)" 
                                error={getError('validez')}
                            >
                                <input
                                    type="number"
                                    min="1"
                                    value={state.diasValidez}
                                    onChange={(e) => updateField('diasValidez', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                                />
                            </FormField>
                        </ResponsiveGrid>
                    </ResponsiveCard>

                    {/* Tasa de Instalación */}
                    <ResponsiveCard title="Tasa de Instalación">
                        <ResponsiveGrid cols={{ default: 1, sm: 3 }}>
                            <FormField label="Tipo de Tasa" error={getError('tasa_id')}>
                                <Select
                                    value={state.tasaId.toString()}
                                    onValueChange={(value) => updateField('tasaId', Number(value))}
                                    disabled={isFieldDisabled('tasaId')}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Seleccionar tasa" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white max-h-60">
                                        {tasas.length === 0 ? (
                                            <SelectItem value="0" disabled>
                                                No hay tasas disponibles
                                            </SelectItem>
                                        ) : (
                                            tasas.map(tasa => (
                                                <SelectItem key={tasa.id} value={tasa.id.toString()}>
                                                    {tasa.nombre} - $ {Number(tasa.precio).toFixed(2)}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            <FormField label="Bonificación (%)">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={state.tasaBonificacion}
                                    onChange={(e) => updateField('tasaBonificacion', Number(e.target.value))}
                                    disabled={isFieldDisabled('tasaBonificacion')}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </FormField>

                            <FormField label="Método de Pago">
                                <Select
                                    value={state.tasaMetodoPagoId.toString()}
                                    onValueChange={(value) => updateField('tasaMetodoPagoId', Number(value))}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Seleccionar método" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white max-h-60">
                                        {metodosPago.length === 0 ? (
                                            <SelectItem value="0" disabled>
                                                No hay métodos de pago
                                            </SelectItem>
                                        ) : (
                                            metodosPago.map(metodo => (
                                                <SelectItem key={metodo.id} value={metodo.id.toString()}>
                                                    {metodo.nombre}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </ResponsiveGrid>
                    </ResponsiveCard>

                    {/* Abono Mensual */}
                    <ResponsiveCard title="Abono Mensual">
                        <div className="space-y-4">
                            <AbonoSelector
                                value={state.abonoId}
                                onChange={(productoId, tipo) => updateField('abonoId', productoId)}
                                error={getError('abono_id')}
                                disabled={isFieldDisabled('abonoId')}
                            />
                            
                            <ResponsiveGrid cols={{ default: 1, sm: 2 }}>
                                <FormField label="Bonificación (%)">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={state.abonoBonificacion}
                                        onChange={(e) => {
                                            updateField('bonificacionManual', true);
                                            updateField('abonoBonificacion', Number(e.target.value));
                                        }}
                                        disabled={isFieldDisabled('abonoBonificacion')}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                    {!state.promocionId && state.abonoMetodoPagoId > 0 && 
                                     metodosPago.find(m => m.id === state.abonoMetodoPagoId)?.tipo === 'debito' && (
                                        <p className="text-xs text-green-600 mt-1">
                                            ✓ Se aplicó 7% de bonificación por débito automático
                                        </p>
                                    )}
                                </FormField>

                                <FormField label="Método de Pago">
                                    <Select
                                        value={state.abonoMetodoPagoId.toString()}
                                        onValueChange={(value) => updateField('abonoMetodoPagoId', Number(value))}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Seleccionar método" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white max-h-60">
                                            {metodosPago.map(metodo => (
                                                <SelectItem key={metodo.id} value={metodo.id.toString()}>
                                                    {metodo.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>
                            </ResponsiveGrid>
                        </div>
                    </ResponsiveCard>

                    {/* Servicios y Accesorios */}
                    <ResponsiveCard title="Servicios Adicionales">
                        <ServiciosList
                            servicios={servicios}
                            items={state.serviciosAgregados}
                            cantidadVehiculos={state.cantidadVehiculos}
                            onChange={setServiciosAgregados}
                        />
                    </ResponsiveCard>

                    <ResponsiveCard title="Accesorios">
                        <AccesoriosList
                            accesorios={accesorios}
                            items={state.accesoriosAgregados}
                            cantidadVehiculos={state.cantidadVehiculos}
                            onChange={setAccesoriosAgregados}
                        />
                    </ResponsiveCard>

                    {/* Cálculos */}
                    <ResponsiveCard title="Resumen">
                        <CalculosPresupuesto
                            cantidadVehiculos={state.cantidadVehiculos}
                            valorTasa={valores.valorTasa}
                            tasaBonificacion={state.tasaBonificacion}
                            valorAbono={valores.valorAbono}
                            abonoBonificacion={state.abonoBonificacion}
                            subtotalAgregados={subtotales.accesorios + subtotales.servicios}
                            tasaPromocion={tasaPromocion}
                            abonoPromocion={abonoPromocion}
                            accesoriosConPromocion={accesoriosConPromocion}
                            serviciosConPromocion={serviciosConPromocion}
                            accesoriosNormales={accesoriosNormales}
                            serviciosNormales={serviciosNormales}
                        />
                    </ResponsiveCard>

                    {/* Botones de acción */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                        <Link
                            href={`/comercial/leads/${lead.id}`}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 text-center w-full sm:w-auto"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={state.loading}
                            className="px-4 py-2 bg-local text-white text-sm rounded hover:bg-local-600 transition-colors disabled:opacity-50 w-full sm:w-auto"
                        >
                            {state.loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                    Guardando...
                                </span>
                            ) : 'Crear Presupuesto'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}