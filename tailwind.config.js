/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary)',
                secondary: 'var(--secondary)',
                accent: 'var(--accent)',
                background: 'var(--background)',
                surface: 'var(--surface)',
                unset: 'var(--unset)'
            }
        },
    },
    plugins: [],
}