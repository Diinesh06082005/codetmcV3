/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: "#000000",
          card: "#1c1c1e",
          cardHover: "#2c2c2e",
          blue: "#0A84FF",
          blueHover: "#007AFF",
          text: "#F5F5F7",
          textMuted: "#8E8E93",
          border: "rgba(255, 255, 255, 0.1)",
          glass: "rgba(28, 28, 30, 0.65)",
        },
      },
      fontFamily: {
        display: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Segoe UI",
          "Roboto",
          "sans-serif"
        ],
        mono: [
          "SF Mono",
          "JetBrains Mono",
          "ui-monospace",
          "monospace"
        ],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.3)",
        glow: "0 0 20px rgba(10, 132, 255, 0.4)",
      },
      animation: {
        "pulse-soft": "pulse-soft 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s infinite linear",
        "fade-in": "fadeIn 0.5s ease-out forwards",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: 0.6, transform: "scale(0.98)" },
          "50%": { opacity: 1, transform: "scale(1.02)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
