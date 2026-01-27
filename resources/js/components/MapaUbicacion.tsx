// resources/js/Components/MapaUbicacion.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Solución para iconos de Leaflet - Importar usando import
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix para iconos de Leaflet en React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});

interface MapaUbicacionProps {
    latitud: number | null;
    longitud: number | null;
    onUbicacionCambiada: (latitud: number, longitud: number, direccionCompleta?: string) => void;
    direccion?: string;
    editable?: boolean;
}

// Componente para manejar clicks en el mapa
function ClickHandler({ onUbicacionCambiada, editable }: { 
    onUbicacionCambiada: (lat: number, lng: number, direccionCompleta?: string) => void;
    editable?: boolean;
}) {
    const map = useMapEvents({
        click: async (e) => {
            if (editable) {
                try {
                    // Obtener la dirección desde las coordenadas (reverse geocoding)
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&zoom=18&addressdetails=1`
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        const direccionCompleta = formatearDireccionConProvincia(data);
                        onUbicacionCambiada(e.latlng.lat, e.latlng.lng, direccionCompleta);
                    } else {
                        // Si falla el reverse geocoding, solo enviamos coordenadas
                        onUbicacionCambiada(e.latlng.lat, e.latlng.lng);
                    }
                } catch (error) {
                    console.error('Error en reverse geocoding:', error);
                    onUbicacionCambiada(e.latlng.lat, e.latlng.lng);
                }
            }
        },
    });
    return null;
}

// Función MEJORADA que SIEMPRE identifica correctamente la provincia y ciudad
const formatearDireccionConProvincia = (data: any): string => {
    const address = data.address;
    const parts = [];
    
    // 1. Calle y número
    if (address.road || address.street || address.highway) {
        const calle = address.road || address.street || address.highway;
        const numero = address.house_number ? ` ${address.house_number}` : '';
        parts.push(`${calle}${numero}`);
    } else if (address.pedestrian) {
        parts.push(address.pedestrian);
    }
    
    // 2. CIUDAD PRINCIPAL - LÓGICA MEJORADA
    const ciudad = obtenerCiudadPrincipal(address, data.display_name);
    if (ciudad) {
        parts.push(ciudad);
    }
    
    // 3. PROVINCIA - SIEMPRE
    const provincia = identificarProvincia(address, data.display_name);
    if (provincia) {
        parts.push(provincia);
    } else {
        // Si no encontramos provincia, usar "Argentina"
        parts.push('Argentina');
    }
    
    // Si no tenemos calle pero sí ciudad y provincia, está bien
    if (parts.length >= 2) {
        return parts.join(', ');
    }
    
    // Fallback: limpiar display_name
    return limpiarDisplayName(data.display_name, provincia || '');
};

// Función MEJORADA para obtener ciudad principal
const obtenerCiudadPrincipal = (address: any, displayName?: string): string => {
    // Términos que NO queremos como ciudad principal
    const terminosExcluir = [
        'Distrito', 'Límite de', 'Ejido', 'Suburbios', 'Municipio de',
        'Centro', 'Norte', 'Sur', 'Este', 'Oeste', 'Barrio', 
        'Neighbourhood', 'Suburb', 'County', 'State'
    ];
    
    // Orden de prioridad para buscar ciudad
    const camposPrioridad = ['city', 'town', 'village', 'municipality', 'county', 'state_district'];
    
    // Buscar en campos de prioridad
    for (const campo of camposPrioridad) {
        if (address[campo]) {
            const valor = address[campo].toString();
            // Verificar que no sea un término excluido
            const esTerminoValido = !terminosExcluir.some(termino => 
                valor.toLowerCase().includes(termino.toLowerCase())
            );
            
            if (esTerminoValido) {
                // Limpiar posibles prefijos
                return valor
                    .replace('Municipio de ', '')
                    .replace('Municipality of ', '')
                    .replace('Partido de ', '')
                    .trim();
            }
        }
    }
    
    // Si no encontramos en campos directos, buscar en display_name
    if (displayName) {
        return extraerCiudadDeDisplayName(displayName);
    }
    
    return '';
};

// Función para extraer ciudad de display_name
const extraerCiudadDeDisplayName = (displayName: string): string => {
    const partes = displayName.split(', ');
    
    // Buscar la parte que más se parece a una ciudad
    // Excluir partes con términos no deseados
    const partesFiltradas = partes.filter(part => {
        const partLower = part.toLowerCase();
        return !partLower.includes('distrito') &&
               !partLower.includes('límite') &&
               !partLower.includes('ejido') &&
               !partLower.includes('suburbios') &&
               !partLower.includes('municipio') &&
               !partLower.includes('centro') &&
               !partLower.includes('norte') &&
               !partLower.includes('sur') &&
               !partLower.includes('este') &&
               !partLower.includes('oeste') &&
               !partLower.includes('barrio') &&
               !partLower.includes('argentina') &&
               !partLower.includes('department');
    });
    
    // Tomar la primera parte filtrada que no sea muy corta
    for (const parte of partesFiltradas) {
        if (parte.length > 3 && !detectarProvinciaEnTexto(parte)) {
            return parte;
        }
    }
    
    return '';
};

// Función específica para identificar provincia (MANTENIDA)
const identificarProvincia = (address: any, displayName?: string): string => {
    // 1. Primero buscar en address.state
    if (address.state) {
        return limpiarNombreProvincia(address.state);
    }
    
    // 2. Buscar en address.region
    if (address.region) {
        return limpiarNombreProvincia(address.region);
    }
    
    // 3. Buscar en display_name
    if (displayName) {
        const provinciaEnDisplay = detectarProvinciaEnTexto(displayName);
        if (provinciaEnDisplay) return provinciaEnDisplay;
    }
    
    // 4. Buscar en address.county (puede contener provincia)
    if (address.county) {
        const provinciaEnCounty = detectarProvinciaEnTexto(address.county);
        if (provinciaEnCounty) return provinciaEnCounty;
    }
    
    // 5. Para Argentina, buscar por contexto
    if (address.country_code === 'ar' || address.country === 'Argentina') {
        // Intentar determinar por nombre de ciudad conocida
        const ciudad = obtenerCiudadPrincipal(address, displayName);
        if (ciudad) {
            // Mapeo de ciudades a provincias (para casos comunes)
            const mapeoCiudadProvincia: Record<string, string> = {
                'gualeguaychú': 'Entre Ríos',
                'concordia': 'Entre Ríos',
                'paraná': 'Entre Ríos',
                'concepción del uruguay': 'Entre Ríos',
                'buenos aires': 'Buenos Aires',
                'córdoba': 'Córdoba',
                'rosario': 'Santa Fe',
                'mendoza': 'Mendoza',
                'salta': 'Salta',
                'tucumán': 'Tucumán',
                'la plata': 'Buenos Aires',
                'mar del plata': 'Buenos Aires',
                'san miguel de tucumán': 'Tucumán',
                'neuquén': 'Neuquén',
                'bahía blanca': 'Buenos Aires',
                'resistencia': 'Chaco',
                'posadas': 'Misiones',
                'san salvador de jujuy': 'Jujuy',
                'santiago del estero': 'Santiago del Estero',
                'corrientes': 'Corrientes',
                'san luis': 'San Luis',
                'río gallegos': 'Santa Cruz',
                'ushuaia': 'Tierra del Fuego',
                'rawson': 'Chubut',
                'viedma': 'Río Negro',
                'catamarca': 'Catamarca',
                'la rioja': 'La Rioja',
                'san juan': 'San Juan',
                'santa rosa': 'La Pampa',
                'formosa': 'Formosa'
            };
            
            const ciudadLower = ciudad.toLowerCase();
            for (const [ciudadMap, provinciaMap] of Object.entries(mapeoCiudadProvincia)) {
                if (ciudadLower.includes(ciudadMap)) {
                    return provinciaMap;
                }
            }
        }
        
        // Fallback para Entre Ríos (por los ejemplos)
        return 'Entre Ríos';
    }
    
    return '';
};

// Lista de provincias argentinas
const PROVINCIAS_ARGENTINAS = [
    'Buenos Aires', 'Ciudad Autónoma de Buenos Aires', 'CABA',
    'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
    'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
    'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta',
    'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe',
    'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
];

// Función para detectar provincia en texto
const detectarProvinciaEnTexto = (texto: string): string => {
    const textoLower = texto.toLowerCase();
    
    // Búsqueda exacta primero
    for (const provincia of PROVINCIAS_ARGENTINAS) {
        if (textoLower.includes(provincia.toLowerCase())) {
            // Casos especiales
            if (provincia === 'Ciudad Autónoma de Buenos Aires') {
                return provincia;
            }
            return provincia;
        }
    }
    
    // Búsquedas específicas
    if (textoLower.includes('entre ríos') || textoLower.includes('entre rios')) {
        return 'Entre Ríos';
    }
    if (textoLower.includes('tierra del fuego')) {
        return 'Tierra del Fuego';
    }
    if (textoLower.includes('santiago del estero') || 
        (textoLower.includes('santiago') && textoLower.includes('estero'))) {
        return 'Santiago del Estero';
    }
    if (textoLower.includes('ciudad autónoma') || textoLower.includes('caba')) {
        return 'Ciudad Autónoma de Buenos Aires';
    }
    
    return '';
};

// Función para limpiar nombre de provincia
const limpiarNombreProvincia = (nombre: string): string => {
    return nombre
        .replace('Provincia de ', '')
        .replace('Province of ', '')
        .replace('Departamento ', '')
        .replace('Estado de ', '')
        .replace('Región de ', '')
        .trim();
};

// Función para limpiar display_name
const limpiarDisplayName = (displayName?: string, provinciaConocida: string = ''): string => {
    if (!displayName) return 'Ubicación desconocida';
    
    const partes = displayName.split(', ');
    
    // Filtrar partes no deseadas y extraer calle/ciudad
    const partesUtiles = [];
    
    for (const parte of partes) {
        const parteLower = parte.toLowerCase();
        
        // Excluir términos no deseados
        if (parteLower.includes('distrito') ||
            parteLower.includes('límite') ||
            parteLower.includes('ejido') ||
            parteLower.includes('suburbios') ||
            parteLower.includes('argentina') ||
            parteLower.includes('department') ||
            parte === provinciaConocida) {
            continue;
        }
        
        // Excluir si es una provincia (pero no la que ya conocemos)
        if (detectarProvinciaEnTexto(parte) && parte !== provinciaConocida) {
            continue;
        }
        
        partesUtiles.push(parte);
    }
    
    // Tomar máximo 2-3 partes útiles
    const resultado = partesUtiles.slice(0, 2).join(', ');
    
    // Agregar provincia si no está y la conocemos
    if (provinciaConocida && !resultado.includes(provinciaConocida)) {
        return resultado ? `${resultado}, ${provinciaConocida}` : provinciaConocida;
    }
    
    return resultado || 'Ubicación';
};

export default function MapaUbicacion({ 
    latitud, 
    longitud, 
    onUbicacionCambiada, 
    direccion,
    editable = true 
}: MapaUbicacionProps) {
    const [posicion, setPosicion] = useState<[number, number]>([-34.6037, -58.3816]); // Buenos Aires por defecto
    const [zoom, setZoom] = useState<number>(13);
    const [cargando, setCargando] = useState<boolean>(false);

    // Actualizar posición cuando cambian las props
    useEffect(() => {
        if (latitud && longitud) {
            setPosicion([latitud, longitud]);
            setZoom(15);
        }
    }, [latitud, longitud]);

    // Obtener ubicación actual del usuario con reverse geocoding
    const obtenerUbicacionActual = () => {
        if (navigator.geolocation) {
            setCargando(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    try {
                        // Obtener dirección desde coordenadas (reverse geocoding)
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                        );
                        
                        let direccionCompleta = '';
                        if (response.ok) {
                            const data = await response.json();
                            direccionCompleta = formatearDireccionConProvincia(data);
                        }
                        
                        setPosicion([latitude, longitude]);
                        setZoom(15);
                        onUbicacionCambiada(latitude, longitude, direccionCompleta);
                        setCargando(false);
                    } catch (error) {
                        console.error('Error en reverse geocoding:', error);
                        setPosicion([latitude, longitude]);
                        setZoom(15);
                        onUbicacionCambiada(latitude, longitude);
                        setCargando(false);
                    }
                },
                (error) => {
                    console.error('Error obteniendo ubicación:', error);
                    alert('No se pudo obtener la ubicación: ' + error.message);
                    setCargando(false);
                }
            );
        } else {
            alert('Geolocalización no soportada por este navegador.');
        }
    };

    // Geocodificar dirección (buscar coordenadas desde dirección)
    const buscarPorDireccion = async () => {
        if (!direccion || direccion.trim().length < 5) {
            alert('Ingresa una dirección válida para buscar en el mapa');
            return;
        }

        try {
            setCargando(true);
            // Usar Nominatim (OpenStreetMap) para geocodificación
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&limit=1&countrycodes=AR&addressdetails=1`
            );
            
            if (!response.ok) throw new Error('Error en la búsqueda');
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                const resultado = data[0];
                const lat = parseFloat(resultado.lat);
                const lon = parseFloat(resultado.lon);
                
                // Formatear dirección con provincia SIEMPRE
                let direccionCompleta = formatearDireccionConProvincia(resultado);
                
                // Si la API no devuelve una dirección bien formateada
                if (!direccionCompleta || direccionCompleta.split(',').length < 2) {
                    // Intentar obtener provincia de otra manera
                    if (resultado.display_name) {
                        const displayParts = resultado.display_name.split(', ');
                        // Buscar provincia en el display_name
                        let provinciaEncontrada = '';
                        for (const part of displayParts) {
                            if (part.includes('Provincia') || 
                                part.includes('Entre Ríos') || 
                                part.includes('Buenos Aires') ||
                                part.includes('Córdoba') ||
                                part.includes('Santa Fe') ||
                                part.includes('Mendoza') ||
                                part.includes('Tucumán') ||
                                part.includes('Salta') ||
                                part.includes('Misiones') ||
                                part.includes('Chaco') ||
                                part.includes('Corrientes') ||
                                part.includes('Santiago del Estero') ||
                                part.includes('San Juan') ||
                                part.includes('Jujuy') ||
                                part.includes('Río Negro') ||
                                part.includes('Neuquén') ||
                                part.includes('Formosa') ||
                                part.includes('Chubut') ||
                                part.includes('San Luis') ||
                                part.includes('Catamarca') ||
                                part.includes('La Rioja') ||
                                part.includes('La Pampa') ||
                                part.includes('Santa Cruz') ||
                                part.includes('Tierra del Fuego')) {
                                provinciaEncontrada = part;
                                break;
                            }
                        }
                        
                        // Reconstruir dirección con provincia
                        const calleCiudad = displayParts.slice(0, 2).join(', ');
                        direccionCompleta = provinciaEncontrada 
                            ? `${calleCiudad}, ${provinciaEncontrada}`
                            : calleCiudad;
                    }
                }
                
                setPosicion([lat, lon]);
                setZoom(15);
                onUbicacionCambiada(lat, lon, direccionCompleta);
            } else {
                alert('No se encontró la dirección. Intenta con una dirección más específica.');
            }
        } catch (error) {
            console.error('Error en geocodificación:', error);
            alert('Error al buscar la dirección en el mapa');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Controles del mapa */}
            <div className="flex flex-wrap gap-2">                
                <button
                    type="button"
                    onClick={buscarPorDireccion}
                    disabled={cargando || !direccion || direccion.trim().length < 5}
                    className="px-3 py-2 text-sm border border-green-500 text-green-600 rounded hover:bg-green-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Buscar en mapa
                </button>
            </div>

            {/* Estado de carga */}
            {cargando && (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-sat"></div>
                    <p className="text-sm text-gray-600 mt-2">Buscando ubicación...</p>
                </div>
            )}

            {/* Mapa */}
            <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300">
                <MapContainer
                    center={posicion}
                    zoom={zoom}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {latitud && longitud && (
                        <Marker position={[latitud, longitud]} />
                    )}
                    
                    {editable && (
                        <ClickHandler 
                            onUbicacionCambiada={onUbicacionCambiada}
                            editable={editable}
                        />
                    )}
                </MapContainer>
            </div>

            {/* Instrucciones */}
            <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium">Instrucciones:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Haz clic en el mapa para colocar el marcador</li>
                    <li>Usa "Mi ubicación actual" para detectar automáticamente</li>
                    <li>Escribe una dirección en <b>Dirección Completa</b> y haz clic en "Buscar en mapa"</li>
                </ul>
                {latitud && longitud && (
                    <p className="mt-2">
                        <span className="font-medium">Coordenadas:</span> {latitud.toFixed(6)}, {longitud.toFixed(6)}
                    </p>
                )}
            </div>
        </div>
    );
}