// tailwind.config.js
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
        './resources/js/**/*.js',
        './resources/js/**/*.ts',
    ],
    
    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Tus colores personalizados
                'local': '#1e40af',     // Azul para LocalSat
                'sat': '#7c3aed',       // Púrpura para SmartSat
                'local-50': '#eff6ff',
                'sat-50': '#f5f3ff',
                'local-600': '#2563eb',
                'sat-600': '#7c3aed',
            },
            animation: {
                'fade-in': 'fade-in 0.8s ease-out',
                'slide-up': 'slide-up 0.8s ease-out 0.3s both',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'bounce-slow': 'bounce 2s infinite',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
        },
    },
    
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        // Opcional: require('@tailwindcss/aspect-ratio'),
    ],

    
};

module.exports = {
    theme: {
        extend: {
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'shine': 'shine 2s linear infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'spin-slow': 'spin 3s linear infinite',
                'fade-in': 'fade-in 0.5s ease-out forwards',
                'slide-up': 'slide-up 0.8s ease-out 0.3s both',
            },
            keyframes: {
                'float': {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg)', opacity: '0.3' },
                    '50%': { transform: 'translateY(-20px) rotate(180deg)', opacity: '0.1' },
                },
                'shine': {
                    '0%': { backgroundPosition: '-200% center' },
                    '100%': { backgroundPosition: '200% center' },
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
                    '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)' },
                },
                'fade-in': {
                    from: { opacity: '0', transform: 'translateY(10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-up': {
                    from: { opacity: '0', transform: 'translateY(30px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
}

module.exports = {
    theme: {
        extend: {
            animation: {
                'fade-in-up': 'fade-in-up 0.6s ease-out',
                'fade-in': 'fade-in-up 0.4s ease-out',
                'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
            },
            keyframes: {
                'fade-in-up': {
                    'from': { opacity: '0', transform: 'translateY(20px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                },
                'pulse-subtle': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
            },
        },
    },
}