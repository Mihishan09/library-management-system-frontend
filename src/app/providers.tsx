"use client";

import React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider } from "@/context/AuthContext";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
    },
    background: {
      default: "#f4f4f5",
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}


