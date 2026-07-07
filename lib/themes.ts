export type ThemeId =
  | 'emerald-dark'
  | 'amber-dark'
  | 'obsidian-dark'
  | 'fresh-light'

export type ThemeMeta = {
  id: ThemeId
  label: string
  desc: string
  dark: boolean
  /** [background, surface, accent] swatch preview colors */
  swatch: [string, string, string]
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'emerald-dark',
    label: '翠绿暗夜',
    desc: '近黑底色 · 鲜果绿点缀',
    dark: true,
    swatch: ['#1a1d1f', '#2a2e31', '#46d18a'],
  },
  {
    id: 'amber-dark',
    label: '琥珀暗夜',
    desc: '暖黑底色 · 琥珀金点缀',
    dark: true,
    swatch: ['#1c1a16', '#2e2a22', '#e6a93c'],
  },
  {
    id: 'obsidian-dark',
    label: '曜石墨黑',
    desc: '极简纯黑 · 灰阶图表',
    dark: true,
    swatch: ['#141414', '#242424', '#ededed'],
  },
  {
    id: 'fresh-light',
    label: '鲜果浅绿',
    desc: '清爽白底 · 自然绿主色',
    dark: false,
    swatch: ['#f5f8f4', '#ffffff', '#2f9e63'],
  },
]

export const DEFAULT_THEME: ThemeId = 'fresh-light'
export const THEME_STORAGE_KEY = 'fruit-theme'

export const themeById = (id: string): ThemeMeta =>
  THEMES.find((t) => t.id === id) ?? THEMES[0]
