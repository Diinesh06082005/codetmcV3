/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: "#0b0c10",
          card: "rgba(28, 28, 30, 0.6)",
          cardHover: "rgba(44, 44, 46, 0.8)",
          blue: "#007AFF",
          blueHover: "#0062CC",
          red: "#FF453A",
          green: "#30D158",
          text: "#F2F2F7",
          textMuted: "#8E8E93",
          border: "rgba(255, 255, 255, 0.12)",
          glass: "rgba(30, 30, 32, 0.75)",
        },
      },
      fontFamily: {
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Inter",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "SF Mono",
          "JetBrains Mono",
          "ui-monospace",
          "monospace",
        ],
      },
      boxShadow: {
        glass: "0 4px 24px rgba(0, 0, 0, 0.4)",
        glow: "none",
        apple: "0 2px 8px rgba(0, 0, 0, 0.25)",
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
        "fade-in": "fadeIn 0.3s ease-out forwards",
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
