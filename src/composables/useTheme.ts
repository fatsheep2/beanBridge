import { ref, computed, watch, onMounted } from 'vue';
import { darkTheme } from 'naive-ui';
import { greenTheme, greenDarkTheme } from '../theme/naive-theme';

export type ThemeMode = 'light' | 'dark' | 'auto';

const THEME_STORAGE_KEY = 'beanbridge-theme';

export function useTheme() {
  const themeMode = ref<ThemeMode>('auto');
  const isDark = ref(false);

  // 检测系统主题
  const getSystemTheme = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // 应用主题
  const applyTheme = (mode: ThemeMode) => {
    if (mode === 'auto') {
      isDark.value = getSystemTheme();
    } else {
      isDark.value = mode === 'dark';
    }
  };

  // 从 localStorage 加载主题
  const loadTheme = () => {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (saved && ['light', 'dark', 'auto'].includes(saved)) {
      themeMode.value = saved;
    } else {
      themeMode.value = 'auto';
    }
    applyTheme(themeMode.value);
  };

  // 保存主题到 localStorage
  const saveTheme = (mode: ThemeMode) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  // 切换主题
  const toggleTheme = () => {
    if (themeMode.value === 'light') {
      themeMode.value = 'dark';
    } else if (themeMode.value === 'dark') {
      themeMode.value = 'auto';
    } else {
      themeMode.value = 'light';
    }
    applyTheme(themeMode.value);
    saveTheme(themeMode.value);
  };

  // 设置主题
  const setTheme = (mode: ThemeMode) => {
    themeMode.value = mode;
    applyTheme(mode);
    saveTheme(mode);
  };

  // 计算当前使用的主题对象
  const theme = computed(() => {
    return isDark.value ? greenDarkTheme : greenTheme;
  });

  // 监听系统主题变化
  onMounted(() => {
    loadTheme();

    if (themeMode.value === 'auto' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (themeMode.value === 'auto') {
          isDark.value = e.matches;
        }
      };
      
      // 使用 addEventListener（现代浏览器）
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        // 兼容旧浏览器
        mediaQuery.addListener(handleChange);
      }
    }
  });

  // 监听 themeMode 变化
  watch(themeMode, (newMode) => {
    applyTheme(newMode);
  });

  return {
    themeMode,
    isDark,
    theme,
    toggleTheme,
    setTheme,
  };
}
