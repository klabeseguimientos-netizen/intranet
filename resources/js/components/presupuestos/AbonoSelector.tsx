// resources/js/components/presupuestos/AbonoSelector.tsx
import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { ProductoServicioDTO } from '@/types/presupuestos';

interface Props {
    value?: number;
    onChange: (productoId: number, tipo: 'abono' | 'convenio') => void;
    error?: string | null;
    disabled?: boolean;
}

export default function AbonoSelector({ value, onChange, error, disabled = false }: Props) {
    const [tipo, setTipo] = useState<'abono' | 'convenio'>('abono');
    const [productos, setProductos] = useState<ProductoServicioDTO[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProductos();
    }, [tipo]);

    const fetchProductos = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/comercial/api/presupuestos/abonos?tipo=${tipo}`);
            const data = await response.json();
            setProductos(data);
        } catch (error) {
            console.error('Error cargando productos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleValueChange = (value: string) => {
        const productoId = Number(value);
        if (productoId) {
            onChange(productoId, tipo);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="radio"
                        value="abono"
                        checked={tipo === 'abono'}
                        onChange={(e) => setTipo(e.target.value as 'abono')}
                        disabled={disabled}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                    />
                    Abono Mensual
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="radio"
                        value="convenio"
                        checked={tipo === 'convenio'}
                        onChange={(e) => setTipo(e.target.value as 'convenio')}
                        disabled={disabled}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                    />
                    Convenio
                </label>
            </div>

            <Select
                value={value?.toString() || ''}
                onValueChange={handleValueChange}
                disabled={loading || disabled}
            >
                <SelectTrigger className={`w-full bg-white ${error ? 'border-red-300' : ''}`}>
                    <SelectValue placeholder={loading ? 'Cargando...' : `Seleccionar ${tipo}`} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 shadow-lg max-h-60">
                    {loading ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                        </div>
                    ) : productos.length === 0 ? (
                        <div className="p-2 text-center text-sm text-gray-500">
                            No hay {tipo === 'abono' ? 'abonos' : 'convenios'} disponibles
                        </div>
                    ) : (
                        productos.map(producto => {
                            const precio = Number(producto.precio) || 0;
                            return (
                                <SelectItem key={producto.id} value={producto.id.toString()}>
                                    <span className="truncate">
                                        {producto.nombre} - $ {precio.toFixed(2)}
                                    </span>
                                </SelectItem>
                            );
                        })
                    )}
                </SelectContent>
            </Select>
            {error && (
                <p className="text-xs text-red-600">{error}</p>
            )}
        </div>
    );
}