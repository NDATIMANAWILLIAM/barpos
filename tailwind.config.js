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
                // Dark blue chrome for sidebars, headers, and dark cards.
                // Deliberately more saturated/vivid than a desaturated navy —
                // should read unmistakably as blue, not near-black.
                ink: {
                    50:  '#F4F7FC',
                    100: '#E6EDF9',
                    200: '#C2D3EF',
                    300: '#93AEE0',
                    400: '#5F82C9',
                    500: '#3D5FAE',
                    600: '#2C478C',
                    700: '#203570',
                    800: '#16264F',
                    900: '#0F1B3C',
                    950: '#0A1128',
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
