"use client"

import * as React from "react"

type Theme = "light" | "dark"
type ThemePreference = Theme | "system"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: Theme
  setTheme: (theme: ThemePreference) => void
  toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): Theme {
  if (typeof window === "undefined") {
    return "light"
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  root.style.colorScheme = theme
}

function ThemeProvider({ children }: React.PropsWithChildren) {
  const [theme, setThemeState] = React.useState<ThemePreference>(() => {
    if (typeof window === "undefined") {
      return "system"
    }

    return (window.localStorage.getItem("theme") as ThemePreference | null) ?? "system"
  })
  const [systemTheme, setSystemTheme] = React.useState<Theme>(() => getSystemTheme())

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? "dark" : "light")
    }

    handleChange()
    mediaQuery.addEventListener("change", handleChange)

    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  React.useEffect(() => {
    const nextTheme = theme === "system" ? systemTheme : theme
    applyTheme(nextTheme)
  }, [theme, systemTheme])

  const setTheme = React.useCallback((nextTheme: ThemePreference) => {
    setThemeState(nextTheme)
    window.localStorage.setItem("theme", nextTheme)
  }, [])

  const toggleTheme = React.useCallback(() => {
    const resolved = theme === "system" ? systemTheme : theme
    const nextTheme = resolved === "dark" ? "light" : "dark"
    setTheme(nextTheme)
  }, [setTheme, systemTheme, theme])

  const value = React.useMemo(
    () => ({
      theme: theme === "system" ? systemTheme : theme,
      resolvedTheme: theme === "system" ? systemTheme : theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, systemTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

function useTheme() {
  const context = React.useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}

export { ThemeProvider, useTheme }
