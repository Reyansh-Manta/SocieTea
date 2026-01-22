import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "var(--color-primary)",
                secondary: "var(--color-secondary)",
                accent: {
                    DEFAULT: "var(--color-accent)",
                    coral: "var(--color-accent-coral)",
                },
                // Explicit palette names
                "oxford-blue": "var(--color-oxford-blue)",
                charcoal: "var(--color-charcoal)",
                "off-white": "var(--color-off-white)",
                "electric-saffron": "var(--color-electric-saffron)",
                coral: "var(--color-coral)",
            },
            fontFamily: {
                sans: ["var(--font-sans)", "sans-serif"],
                serif: ["var(--font-serif)", "serif"],
            },
        },
    },
    plugins: [],
};
export default config;
