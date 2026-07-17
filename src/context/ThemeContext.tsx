import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider, Theme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type ColorMode = "light" | "dark";

interface ThemeContextValue {
  mode: ColorMode;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const buildMuiTheme = (mode: ColorMode): Theme =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#1565C0",
        light: "#1976D2",
        dark: "#0D47A1",
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#00897B",
        light: "#26A69A",
        dark: "#00695C",
        contrastText: "#ffffff",
      },
      error: { main: "#D32F2F" },
      warning: { main: "#F57C00" },
      info: { main: "#0288D1" },
      success: { main: "#388E3C" },
      background: {
        default: mode === "light" ? "#F0F4F8" : "#0A0E1A",
        paper: mode === "light" ? "#FFFFFF" : "#131929",
      },
      text: {
        primary: mode === "light" ? "#0D1B2A" : "#E8EDF5",
        secondary: mode === "light" ? "#4A5568" : "#8FA3BF",
      },
      divider: mode === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)",
    },
    typography: {
      fontFamily: '"Inter", "DM Sans", system-ui, sans-serif',
      h1: { fontWeight: 700, letterSpacing: "-0.02em" },
      h2: { fontWeight: 700, letterSpacing: "-0.01em" },
      h3: { fontWeight: 600, letterSpacing: "-0.01em" },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      body1: { lineHeight: 1.6 },
      body2: { lineHeight: 1.5 },
      caption: { letterSpacing: "0.03em" },
      overline: { letterSpacing: "0.08em", fontWeight: 600 },
    },
    shape: { borderRadius: 10 },
    shadows: mode === "light"
      ? [
          "none",
          "0 1px 2px rgba(0,0,0,0.04)",
          "0 2px 4px rgba(0,0,0,0.06)",
          "0 4px 8px rgba(0,0,0,0.08)",
          "0 8px 16px rgba(0,0,0,0.1)",
          ...Array(20).fill("0 12px 24px rgba(0,0,0,0.12)"),
        ] as Theme["shadows"]
      : [
          "none",
          "0 1px 2px rgba(0,0,0,0.3)",
          "0 2px 4px rgba(0,0,0,0.35)",
          "0 4px 8px rgba(0,0,0,0.4)",
          "0 8px 16px rgba(0,0,0,0.45)",
          ...Array(20).fill("0 12px 24px rgba(0,0,0,0.5)"),
        ] as Theme["shadows"],
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            boxShadow: mode === "light"
              ? "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"
              : "0 2px 8px rgba(0,0,0,0.4)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 8,
          },
          contained: { boxShadow: "none", "&:hover": { boxShadow: "0 2px 8px rgba(21,101,192,0.35)" } },
        },
      },
      MuiTextField: {
        defaultProps: { variant: "outlined", size: "small" },
        styleOverrides: {
          root: { "& .MuiOutlinedInput-root": { borderRadius: 8 } },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 500 } },
      },
      MuiTableCell: {
        styleOverrides: {
          head: { fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase" },
        },
      },
      MuiLinearProgress: {
        styleOverrides: { root: { borderRadius: 4 } },
      },
    },
  });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ColorMode>(() => {
    return (localStorage.getItem("theme_mode") as ColorMode) ?? "light";
  });

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme_mode", next);
      return next;
    });
  }, []);

  const theme = useMemo(() => buildMuiTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeProvider");
  return ctx;
};
