'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

export type Language = 'zh-CN' | 'en-US'

export const LANGUAGES: { id: Language; label: string; hint: string }[] = [
  { id: 'zh-CN', label: '简体中文', hint: 'Simplified Chinese' },
  { id: 'en-US', label: 'English', hint: '英文' },
]

const LANG_STORAGE_KEY = 'fruit-language'
const DEFAULT_LANGUAGE: Language = 'zh-CN'

type PreferencesContextValue = {
  language: Language
  setLanguage: (lang: Language) => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)

  useEffect(() => {
    const stored = localStorage.getItem(LANG_STORAGE_KEY) as Language | null
    if (stored === 'zh-CN' || stored === 'en-US') setLanguageState(stored)
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang)
    } catch {
      // ignore write failures (private mode, etc.)
    }
  }, [])

  return (
    <PreferencesContext.Provider value={{ language, setLanguage }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}
