import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

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
                ink: {
                    50: '#f7f8f4', 100: '#eef0e9', 200: '#dce1d6',
                    300: '#b8c2b2', 400: '#788571', 500: '#63735d',
                    600: '#4c5d47', 700: '#3c4d38', 800: '#293c2e',
                    900: '#1e3024', 950: '#15221b',
                },
                gray: {
                    50: '#fafaf7', 100: '#f3f4ef', 200: '#e4e6dd',
                    300: '#cdd2c4', 400: '#788171', 500: '#6e7868',
                    600: '#53614e', 700: '#3e4b39', 800: '#2b3528',
                    900: '#20291f', 950: '#141b13',
                },
                brass: {
                    50: '#fbf5ed', 100: '#f4e6d3', 200: '#e7cead',
                    300: '#d6ad7b', 400: '#b98550', 500: '#98623c',
                    600: '#80502e', 700: '#694026', 800: '#553421',
                    900: '#442c1d', 950: '#27180f',
                },
            },
        },
    },
    plugins: [forms],
};
