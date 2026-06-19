'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  themeById,
  type ThemeId,
} from '@/lib/themes'

type ThemeContextValue = {
  theme: ThemeId
  setTheme: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

/** Inline script that applies the saved theme before paint to avoid FOUC. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'${DEFAULT_THEME}';var d=document.documentElement;d.setAttribute('data-theme',t);if(t==='emerald-dark'||t==='amber-dark'||t==='obsidian-dark'){d.classList.add('dark')}else{d.classList.remove('dark')}}catch(e){}})();`

function applyTheme(id: ThemeId) {
  const root = document.documentElement
  root.setAttribute('data-theme', id)
  root.classList.toggle('dark', themeById(id).dark)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME)

  useEffect(() => {
    const stored = (localStorage.getItem(THEME_STORAGE_KEY) as ThemeId) || DEFAULT_THEME
    setThemeState(stored)
    applyTheme(stored)
  }, [])

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id)
    applyTheme(id)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id)
    } catch {
      // ignore write failures (private mode, etc.)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
