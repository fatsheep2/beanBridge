import type { GlobalTheme } from 'naive-ui';
import { darkTheme } from 'naive-ui';

// 绿色系主题配置
export const greenTheme: GlobalTheme = {
  common: {
    primaryColor: '#10b981', // emerald-500
    primaryColorHover: '#059669', // emerald-600
    primaryColorPressed: '#047857', // emerald-700
    primaryColorSuppl: '#34d399', // emerald-400
    infoColor: '#3b82f6', // blue-500
    infoColorHover: '#2563eb', // blue-600
    successColor: '#10b981', // emerald-500
    successColorHover: '#059669', // emerald-600
    warningColor: '#f59e0b', // amber-500
    warningColorHover: '#d97706', // amber-600
    errorColor: '#ef4444', // red-500
    errorColorHover: '#dc2626', // red-600
    borderRadius: '8px',
    borderRadiusSmall: '6px',
  },
  Button: {
    borderRadiusMedium: '8px',
    fontWeight: '600',
  },
  Card: {
    borderRadius: '12px',
    paddingMedium: '24px',
  },
  Input: {
    borderRadius: '8px',
  },
  Form: {
    labelFontWeight: '500',
  },
};

// 暗色主题（基于 darkTheme，覆盖绿色系）
export const greenDarkTheme: GlobalTheme = {
  ...darkTheme,
  common: {
    ...darkTheme.common,
    primaryColor: '#10b981', // emerald-500
    primaryColorHover: '#34d399', // emerald-400
    primaryColorPressed: '#059669', // emerald-600
    primaryColorSuppl: '#34d399', // emerald-400
    infoColor: '#3b82f6', // blue-500
    infoColorHover: '#60a5fa', // blue-400
    successColor: '#10b981', // emerald-500
    successColorHover: '#34d399', // emerald-400
    warningColor: '#f59e0b', // amber-500
    warningColorHover: '#fbbf24', // amber-400
    errorColor: '#ef4444', // red-500
    errorColorHover: '#f87171', // red-400
    borderRadius: '8px',
    borderRadiusSmall: '6px',
  },
  Button: {
    ...darkTheme.Button,
    borderRadiusMedium: '8px',
    fontWeight: '600',
  },
  Card: {
    ...darkTheme.Card,
    borderRadius: '12px',
    paddingMedium: '24px',
  },
  Input: {
    ...darkTheme.Input,
    borderRadius: '8px',
  },
  Form: {
    ...darkTheme.Form,
    labelFontWeight: '500',
  },
};
