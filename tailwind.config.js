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
                // Deep navy chrome — matches the Isaro Rubengera brand mark's
                // dark backdrop — for sidebars, headers, and dark cards.
                ink: {
                    50:  '#F6F8FB',
                    100: '#EBEFF6',
                    200: '#D2DAE8',
                    300: '#A9B8D2',
                    400: '#7A8FB4',
                    500: '#576D93',
                    600: '#3F5378',
                    700: '#2C3D5C',
                    800: '#1B2740',
                    900: '#111A2E',
                    950: '#0A101F',
                },
                // Copper/bronze brand accent, taken from the logo's copper
                // arc and lettering — deliberately not the default Tailwind
                // amber/indigo that every generated template reaches for.
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
