"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type ThemeType, defaultTheme, themes } from "./themes"

type ThemeContextType = {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  currentTheme: typeof themes.berry
}

const defaultContext: ThemeContextType = {
  theme: defaultTheme,
  setTheme: () => {},
  currentTheme: themes[defaultTheme],
}

const ThemeContext = createContext<ThemeContextType>(defaultContext)

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeType>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("whack-a-berry-theme") as ThemeType | null
    if (savedTheme && themes[savedTheme]) {
      setThemeState(savedTheme)
    }
  }, [])

  // Save theme to localStorage when it changes
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme)
    localStorage.setItem("whack-a-berry-theme", newTheme)
  }

  // Use default theme until mounted to prevent hydration mismatch
  const currentTheme = mounted ? themes[theme] : themes[defaultTheme]

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        currentTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

