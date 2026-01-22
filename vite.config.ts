import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css', 
                'resources/js/app.tsx'
            ],
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
    ],
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'], // Agrega extensiones TypeScript
    },
    server: {
        host: '0.0.0.0', // Acepta todas las conexiones
        port: 5173,
        hmr: {
            host: 'localhost',
        },
    },
});