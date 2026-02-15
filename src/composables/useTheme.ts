import { ref, computed, watch, onMounted } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

const THEME_STORAGE_KEY = 'beanbridge-theme'

// 单例：所有调用 useTheme() 的地方共享同一份状态，切换按钮才能同步到 App.vue 的 data-theme
const themeMode = ref<ThemeMode>('auto')
const isDark = ref(false)

export function useTheme() {

  const getSystemTheme = (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const applyTheme = (mode: ThemeMode) => {
    if (mode === 'auto') {
      isDark.value = getSystemTheme()
    } else {
      isDark.value = mode === 'dark'
    }
  }

  const loadTheme = () => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
    if (saved && ['light', 'dark', 'auto'].includes(saved)) {
      themeMode.value = saved
    } else {
      themeMode.value = 'auto'
    }
    applyTheme(themeMode.value)
  }

  const saveTheme = (mode: ThemeMode) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  }

  const toggleTheme = () => {
    // 一次点击即在浅色/深色间切换，不再经过 auto
    const nextDark = !isDark.value
    isDark.value = nextDark
    themeMode.value = nextDark ? 'dark' : 'light'
    saveTheme(themeMode.value)
  }

  const setTheme = (mode: ThemeMode) => {
    themeMode.value = mode
    applyTheme(mode)
    saveTheme(mode)
  }

  const theme = computed(() => ({}))

  onMounted(() => {
    loadTheme()
    if (themeMode.value === 'auto' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        if (themeMode.value === 'auto') isDark.value = e.matches
      }
      mediaQuery.addEventListener?.('change', handleChange)
    }
  })

  watch(themeMode, (newMode) => {
    applyTheme(newMode)
  })

  return {
    themeMode,
    isDark,
    theme,
    toggleTheme,
    setTheme,
  }
}
