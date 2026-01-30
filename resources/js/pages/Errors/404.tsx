// resources/js/Pages/Errors/404.tsx
import { Head, Link } from '@inertiajs/react';
import React from 'react';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <Head title="Página no encontrada" />
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-9xl font-bold text-gray-300">404</h1>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Página no encontrada
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>
          </div>
          
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Volver al inicio
            </Link>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              O intenta usar la búsqueda o navegar desde el menú principal.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;