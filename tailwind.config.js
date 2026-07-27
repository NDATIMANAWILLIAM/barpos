import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Manrope', ...defaultTheme.fontFamily.sans],
                serif: ['"Source Serif 4"', ...defaultTheme.fontFamily.serif],
            },
            colors: {
                // Warm near-black chrome (replaces default slate for a less
                // "generic SaaS dashboard" feel — sidebars, headers, dark cards).
                ink: {
                    50:  '#F6F4F1',
                    100: '#EDE9E3',
                    200: '#D8D0C4',
                    300: '#B7A991',
                    400: '#8F7C61',
                    500: '#6B5A45',
                    600: '#4E4133',
                    700: '#3A2F25',
                    800: '#291F18',
                    900: '#1C1510',
                    950: '#120D09',
                },
                // Copper/bronze brand accent — deliberately not the default
                // Tailwind amber/indigo that every generated template reaches for.
                brass: {
                    50:  '#FBF3EA',
                    100: '#F4E1C9',
                    200: '#E8C9A0',
                    300: '#D9AC72',
                    400: '#C88F4E',
                    500: '#B5762F',
                    600: '#985F24',
                    700: '#7A4B1D',
                    800: '#5F3A17',
                    900: '#4A2E13',
                },
            },
        },
    },

    plugins: [forms],
};
