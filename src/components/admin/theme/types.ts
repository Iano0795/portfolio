import type { ThemeConfig } from '@/types/portfolio';

export type ThemeEditorValue = ThemeConfig;

export type ThemeMutationResult = {
  error?: string;
  success?: string;
};
