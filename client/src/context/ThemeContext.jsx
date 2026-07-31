import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export const THEMES = [
  { id: "df1", name: "Dynamic Glass Motion (df1 - Default)", color: "#22d3ee" },
  { id: "df2", name: "Static Glass Wallpaper (df2)", color: "#bef264" },
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("codetmc_theme") || "df1";
  });

  useEffect(() => {
    localStorage.setItem("codetmc_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "light-studio") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const currentIndex = THEMES.findIndex((t) => t.id === prev);
      const nextIndex = (currentIndex + 1) % THEMES.length;
      return THEMES[nextIndex].id;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }
  return context;
};
