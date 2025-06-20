/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom colors for Ramesh Sweets
        gold: {
          DEFAULT: "#D3AE6E", // Exact gold as specified
          dark: "#B99656", // Darker version
          light: "#E0C28A", // Lighter version
        },
        cream: "#FFF8E1", // Lighter cream
        "cream-dark": "#FFF3C4", // Darker cream
        maroon: {
          DEFAULT: "#800000", // Maroon
          dark: "#5C0000", // Darker maroon
        },
        // Pink color palette based on Pantone 197C
        pink: {
          DEFAULT: "#F8B9C1", // Pantone 197C
          light: "#FFC5CD", // Lighter shade
          lighter: "#FFFAFB", // Extremely light pink, almost white with just a hint of pink
          dark: "#E09DA5", // Darker shade
          darker: "#C7858D", // Even darker for accents
        },
        // Black color palette
        black: {
          DEFAULT: "#000000",
          light: "#222222",
          lighter: "#333333",
          dark: "#111111",
          rich: "#0A0A0A", // Rich black for premium look
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        display: ["Cormorant Garamond", "serif"],
        cinzel: ["Cinzel", "serif"],
        "eb-garamond": ["EB Garamond", "serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite linear",
      },
      backgroundImage: {
        "heritage-gradient": "linear-gradient(to right, transparent, #D3AE6E, transparent)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
