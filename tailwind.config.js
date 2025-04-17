/** @type {import('tailwindcss').Config} */
const themeData = require('./colors.json');
const lightTheme = themeData.light || {};
const darkTheme = themeData.dark || {};

module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: Object.fromEntries(
                Object.keys(lightTheme).map(key => [key, `var(--${key})`])
            )
        },
    },
    plugins: [
        function({ addBase }) {
            const lightColors = {};
            Object.entries(lightTheme).forEach(([key, value]) => lightColors[`--${key}`] = value);
            const darkColors = {};
            Object.entries(darkTheme).forEach(([key, value]) => darkColors[`--${key}`] = value);

            addBase({
                ':root': lightColors,
                '@media (prefers-color-scheme: dark)': {
                    ':root': darkColors
                }
            });
        }
    ],
}