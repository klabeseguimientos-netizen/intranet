// resources/js/Pages/Comercial/Cuentas/CambioRazonSocial.tsx
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

export default function CambioRazonSocial() {
    const [formData, setFormData] = useState({
        cuenta: '',
        razonSocialActual: '',
        nuevaRazonSocial: '',
        cuitActual: '',
        cuitNuevo: '',
        fechaCambio: '',
        observaciones: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Solicitud de cambio de razón social:', formData);
        // Aquí iría la lógica para enviar el formulario
    };

    return (
        <AppLayout title="Cambio de Razón Social">
            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    Cambio de Razón Social
                </h1>
                <p className="mt-1 text-gray-600 text-base">
                    Solicitud de modificación de razón social en cuentas
                </p>
            </div>
            
            {/* Formulario */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        Nueva Solicitud
                    </h2>
                    <p className="text-gray-600 text-sm">
                        Complete el formulario para solicitar cambio de razón social
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {/* Cuenta */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cuenta *
                            </label>
                            <select
                                name="cuenta"
                                value={formData.cuenta}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-sat focus:border-sat"
                                required
                            >
                                <option value="">Seleccionar cuenta</option>
                                <option value="CUENTA-001">CUENTA-001 - Transportes Rápidos S.A.</option>
                                <option value="CUENTA-002">CUENTA-002 - Logística Integral S.R.L.</option>
                                <option value="CUENTA-003">CUENTA-003 - Distribuidora Norte S.A.</option>
                            </select>
                        </div>

                        {/* Fecha de Cambio */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha de Cambio *
                            </label>
                            <input
                                type="date"
                                name="fechaCambio"
                                value={formData.fechaCambio}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-sat focus:border-sat"
                                required
                            />
                        </div>

                        {/* Razón Social Actual */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Razón Social Actual *
                            </label>
                            <input
                                type="text"
                                name="razonSocialActual"
                                value={formData.razonSocialActual}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-sat focus:border-sat"
                                placeholder="Razón social actual registrada"
                                required
                            />
                        </div>

                        {/* Nueva Razón Social */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nueva Razón Social *
                            </label>
                            <input
                                type="text"
                                name="nuevaRazonSocial"
                                value={formData.nuevaRazonSocial}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-sat focus:border-sat"
                                placeholder="Nueva razón social a registrar"
                                required
                            />
                        </div>

                        {/* CUIT Actual */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CUIT Actual *
                            </label>
                            <input
                                type="text"
                                name="cuitActual"
                                value={formData.cuitActual}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-sat focus:border-sat"
                                placeholder="XX-XXXXXXXX-X"
                                required
                            />
                        </div>

                        {/* CUIT Nuevo (si cambia) */}
                        <div className="col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nuevo CUIT
                            </label>
                            <input
                                type="text"
                                name="cuitNuevo"
                                value={formData.cuitNuevo}
                                onChange={handleChange}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-sat focus:border-sat"
                                placeholder="XX-XXXXXXXX-X (si aplica)"
                            />
                            <p className="text-xs text-gray-500 mt-1">Dejar vacío si el CUIT no cambia</p>
                        </div>

                        {/* Observaciones */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Observaciones
                            </label>
                            <textarea
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-sat focus:border-sat"
                                placeholder="Observaciones adicionales sobre el cambio..."
                            />
                        </div>
                    </div>

                    {/* Documentación requerida */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <h3 className="font-medium text-blue-800 mb-2 text-sm">Documentación requerida:</h3>
                        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                            <li>Estatuto social actualizado</li>
                            <li>Constancia de inscripción en AFIP</li>
                            <li>Acta de asamblea (si aplica)</li>
                            <li>Certificado de vigencia de personería jurídica</li>
                            <li>Constancia de CUIT actualizada</li>
                        </ul>
                    </div>

                    {/* Botones */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors order-2 sm:order-1"
                            onClick={() => setFormData({
                                cuenta: '',
                                razonSocialActual: '',
                                nuevaRazonSocial: '',
                                cuitActual: '',
                                cuitNuevo: '',
                                fechaCambio: '',
                                observaciones: ''
                            })}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm bg-local text-white rounded-md hover:bg-local-600 transition-colors order-1 sm:order-2"
                        >
                            Solicitar Cambio
                        </button>
                    </div>
                </form>
            </div>

            {/* Historial de solicitudes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Historial de Cambios
                </h2>
                
                {/* Tabla para desktop */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Solicitud ID</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Cuenta</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Cambio Realizado</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Fecha</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Estado</th>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Documentación</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50">
                                <td className="py-3 px-4">CRS-2024-001</td>
                                <td className="py-3 px-4">CUENTA-002</td>
                                <td className="py-3 px-4">
                                    <div>
                                        <div className="font-medium">De: Logística Integral S.R.L.</div>
                                        <div className="text-sm text-gray-600">A: Logística Integral S.A.</div>
                                    </div>
                                </td>
                                <td className="py-3 px-4">10/01/2024</td>
                                <td className="py-3 px-4">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                        Completado
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <button className="text-sat hover:text-sat-600 text-sm">
                                        Ver Documentos
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Cards para mobile */}
                <div className="md:hidden space-y-3">
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="font-medium text-gray-900">CRS-2024-001</div>
                                <div className="text-sm text-gray-600">CUENTA-002</div>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Completado
                            </span>
                        </div>
                        <div className="mb-3">
                            <div className="text-sm font-medium text-gray-700 mb-1">Cambio realizado:</div>
                            <div className="text-sm text-gray-600">
                                <div>De: Logística Integral S.R.L.</div>
                                <div>A: Logística Integral S.A.</div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                            <div>Fecha: 10/01/2024</div>
                        </div>
                        <button className="w-full text-center text-sat hover:text-sat-600 text-sm border border-sat rounded py-1.5 hover:bg-sat-50 transition-colors">
                            Ver Documentos
                        </button>
                    </div>
                </div>

                {/* Paginación */}
                <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="text-sm text-gray-600">
                        Mostrando 1-1 de 1 solicitud
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                            Anterior
                        </button>
                        <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}