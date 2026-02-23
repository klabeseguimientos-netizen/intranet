// resources/js/components/presupuestos/AccesoriosList.tsx
import React, { useCallback, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductoServicioDTO, PresupuestoAgregadoDTO } from '@/types/presupuestos';

interface Props {
    accesorios: ProductoServicioDTO[];
    items: PresupuestoAgregadoDTO[];
    cantidadVehiculos: number;
    onChange: (items: PresupuestoAgregadoDTO[]) => void;
}

export default function AccesoriosList({ accesorios, items, cantidadVehiculos, onChange }: Props) {
    const agregarAccesorio = useCallback(() => {
        const nuevoItem: PresupuestoAgregadoDTO = {
            prd_servicio_id: 0,
            cantidad: 1,
            aplica_a_todos_vehiculos: false,
            valor: 0,
            bonificacion: 0,
            subtotal: 0
        };
        onChange([...items, nuevoItem]);
    }, [items, onChange]);

    const actualizarItem = useCallback((index: number, campo: keyof PresupuestoAgregadoDTO, valor: any) => {
        const nuevosItems = [...items];
        const item = { ...nuevosItems[index], [campo]: valor };
        
        // Si se cambia el checkbox "aplica_a_todos_vehiculos"
        if (campo === 'aplica_a_todos_vehiculos') {
            if (valor === true) {
                // Si se marca "para todos", la cantidad pasa a ser la cantidad de vehículos
                item.cantidad = cantidadVehiculos;
            } else {
                // Si se desmarca, resetear a 1
                item.cantidad = 1;
            }
        }
        
        if (campo === 'prd_servicio_id') {
            const producto = accesorios.find(a => a.id === valor);
            if (producto) {
                item.valor = Number(producto.precio) || 0;
            }
        }
        
        // Calcular subtotal
        const cantidad = item.aplica_a_todos_vehiculos ? cantidadVehiculos : item.cantidad;
        const subtotal = Number(item.valor) * cantidad;
        item.subtotal = item.bonificacion > 0 
            ? subtotal * (1 - item.bonificacion / 100)
            : subtotal;
        
        nuevosItems[index] = item;
        onChange(nuevosItems);
    }, [items, accesorios, cantidadVehiculos, onChange]);

    // Efecto para actualizar cantidades cuando cambia cantidadVehiculos y el item tiene "para todos"
    useEffect(() => {
        let necesitaActualizar = false;
        const nuevosItems = items.map(item => {
            if (item.aplica_a_todos_vehiculos && item.cantidad !== cantidadVehiculos) {
                necesitaActualizar = true;
                return { ...item, cantidad: cantidadVehiculos };
            }
            return item;
        });
        
        if (necesitaActualizar) {
            onChange(nuevosItems);
        }
    }, [cantidadVehiculos, items, onChange]);

    const eliminarItem = useCallback((index: number) => {
        onChange(items.filter((_, i) => i !== index));
    }, [items, onChange]);

    const formatPrecio = (precio: any): string => {
        const num = Number(precio) || 0;
        return num.toFixed(2);
    };

    if (accesorios.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No hay accesorios disponibles</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="text-base sm:text-lg font-medium">Accesorios Adicionales</h3>
                <button
                    type="button"
                    onClick={agregarAccesorio}
                    className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 w-full sm:w-auto"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Accesorio
                </button>
            </div>

            {items.length === 0 ? (
                <p className="text-center text-gray-500 py-4 text-sm">
                    No hay accesorios agregados
                </p>
            ) : (
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                            {/* Versión móvil */}
                            <div className="block sm:hidden space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Accesorio
                                    </label>
                                    <Select
                                        value={item.prd_servicio_id?.toString() || ''}
                                        onValueChange={(value) => actualizarItem(index, 'prd_servicio_id', Number(value))}
                                    >
                                        <SelectTrigger className="bg-white w-full">
                                            <SelectValue placeholder="Seleccionar accesorio" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {accesorios.map(accesorio => (
                                                <SelectItem key={accesorio.id} value={accesorio.id.toString()}>
                                                    {accesorio.nombre} - $ {Number(accesorio.precio).toFixed(2)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Cantidad
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.cantidad}
                                            onChange={(e) => actualizarItem(index, 'cantidad', Number(e.target.value))}
                                            disabled={item.aplica_a_todos_vehiculos}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Bonif. %
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={item.bonificacion}
                                            onChange={(e) => actualizarItem(index, 'bonificacion', Number(e.target.value))}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={item.aplica_a_todos_vehiculos}
                                            onChange={(e) => actualizarItem(index, 'aplica_a_todos_vehiculos', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-xs text-gray-600">
                                            Para todos ({cantidadVehiculos})
                                        </span>
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium">
                                            $ {(item.subtotal || 0).toFixed(2)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => eliminarItem(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Versión desktop */}
                            <div className="hidden sm:grid sm:grid-cols-12 gap-4 items-center">
                                <div className="col-span-4">
                                    <Select
                                        value={item.prd_servicio_id?.toString() || ''}
                                        onValueChange={(value) => actualizarItem(index, 'prd_servicio_id', Number(value))}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Seleccionar accesorio" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {accesorios.map(accesorio => (
                                                <SelectItem key={accesorio.id} value={accesorio.id.toString()}>
                                                    {accesorio.nombre} - $ {Number(accesorio.precio).toFixed(2)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.cantidad}
                                        onChange={(e) => actualizarItem(index, 'cantidad', Number(e.target.value))}
                                        disabled={item.aplica_a_todos_vehiculos}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={item.aplica_a_todos_vehiculos}
                                            onChange={(e) => actualizarItem(index, 'aplica_a_todos_vehiculos', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-600 whitespace-nowrap">
                                            Todos ({cantidadVehiculos})
                                        </span>
                                    </label>
                                </div>

                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={item.bonificacion}
                                        onChange={(e) => actualizarItem(index, 'bonificacion', Number(e.target.value))}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                                    />
                                </div>

                                <div className="col-span-1 flex items-center justify-end gap-2">
                                    <span className="text-sm font-medium whitespace-nowrap">
                                        $ {(item.subtotal || 0).toFixed(2)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => eliminarItem(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}