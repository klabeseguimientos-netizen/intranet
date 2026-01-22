import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Search, Plus, Bell, Menu, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

interface PageProps {
    compania: {
        nombre: string;
        logo: string;
        short_name: string;
        colores: {
            primary: string;
            secondary: string;
        };
    };
    [key: string]: any;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { props } = usePage<PageProps>();
    
    // Datos de la compañía desde Inertia
    const compania = props.compania || {
        nombre: 'Intranet 2026',
        logo: 'logo.webp',
        short_name: 'LS',
        colores: {
            primary: '#fa6400',
            secondary: '#3b3b3d',
        }
    };
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            type="button"
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <div className="ml-2 lg:ml-0">
                            <Link href="/">
                                {/* Solo la imagen del logo, sin contenedor extra ni texto */}
                                <img 
                                    src={`/images/logos/${compania.logo}`}
                                    alt={`Logo ${compania.nombre}`}
                                    className="h-14 w-auto object-contain"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        // Fallback a un logo simple si la imagen no carga
                                        target.src = '/images/logos/logo.webp';
                                    }}
                                />
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 max-w-2xl mx-4">
                        <form onSubmit={handleSearch} className="flex gap-2 items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <Input
                                    type="search"
                                    placeholder="Buscar empresas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 w-full border-gray-300 focus:border-sat focus:ring-sat/20"
                                />
                            </div>
                            
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => console.log('Cambiar vista')}
                                title="Cambiar vista"
                                type="button"
                                className="border-gray-300 hover:border-sat hover:text-sat"
                            >
                                <RefreshCw size={20} />
                            </Button>
                            
                            <Button 
                                size="icon" 
                                onClick={() => console.log('Agregar')}
                                title="Agregar nuevo"
                                type="button"
                                className="bg-sat hover:bg-sat-600 text-white"
                            >
                                <Plus size={20} />
                            </Button>
                        </form>
                    </div>

                    <div className="flex items-center">
                        <button
                            className="relative p-2 text-gray-600 hover:text-sat transition-colors"
                            title="Notificaciones"
                            type="button"
                        >
                            <Bell size={22} />
                            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                                3
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}