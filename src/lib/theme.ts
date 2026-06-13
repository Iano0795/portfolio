import type { ThemeConfig, ThemeFontMode } from '@/types/portfolio';

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

type ThemeConfigInput = Omit<Partial<ThemeConfig>, 'fontMode'> & {
  fontMode?: string | null;
};

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  presetName: 'IanOS Classic',
  primary: '#00ff88',
  secondary: '#00d9ff',
  background: '#050812',
  panel: '#090d16',
  foreground: '#e5e7eb',
  muted: '#9ca3af',
  border: '#1f3b3f',
  glowIntensity: 70,
  scanlinesEnabled: true,
  animationIntensity: 70,
  fontMode: 'retro',
  isActive: true,
};

export const THEME_PRESETS: ThemeConfig[] = [
  DEFAULT_THEME_CONFIG,
  {
    presetName: 'Cyber Blue',
    primary: '#38bdf8',
    secondary: '#22d3ee',
    background: '#06111f',
    panel: '#0b1729',
    foreground: '#e0f2fe',
    muted: '#94a3b8',
    border: '#1e3a5f',
    glowIntensity: 62,
    scanlinesEnabled: true,
    animationIntensity: 60,
    fontMode: 'mono',
    isActive: true,
  },
  {
    presetName: 'Minimal Dark',
    primary: '#a7f3d0',
    secondary: '#cbd5e1',
    background: '#0a0a0b',
    panel: '#121214',
    foreground: '#f4f4f5',
    muted: '#a1a1aa',
    border: '#27272a',
    glowIntensity: 18,
    scanlinesEnabled: false,
    animationIntensity: 20,
    fontMode: 'readable',
    isActive: true,
  },
  {
    presetName: 'Soft Light',
    primary: '#047857',
    secondary: '#0369a1',
    background: '#f8fafc',
    panel: '#ffffff',
    foreground: '#111827',
    muted: '#475569',
    border: '#cbd5e1',
    glowIntensity: 8,
    scanlinesEnabled: false,
    animationIntensity: 15,
    fontMode: 'readable',
    isActive: true,
  },
];

export const THEME_FONT_MODES: ThemeFontMode[] = ['system', 'mono', 'retro', 'readable'];

function validHexColor(value: string | null | undefined, fallback: string) {
  return value && HEX_COLOR_PATTERN.test(value) ? value : fallback;
}

function validIntensity(value: number | null | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100 ? value : fallback;
}

function validFontMode(value: string | null | undefined, fallback: ThemeFontMode): ThemeFontMode {
  return THEME_FONT_MODES.includes(value as ThemeFontMode) ? (value as ThemeFontMode) : fallback;
}

export function getThemePresetByName(presetName: string) {
  return THEME_PRESETS.find((preset) => preset.presetName === presetName) ?? null;
}

export function normalizeThemeConfig(input: ThemeConfigInput | null | undefined): ThemeConfig {
  if (!input) {
    return DEFAULT_THEME_CONFIG;
  }

  const isActive = input.isActive ?? DEFAULT_THEME_CONFIG.isActive;

  if (!isActive) {
    return {
      ...DEFAULT_THEME_CONFIG,
      presetName: input.presetName || DEFAULT_THEME_CONFIG.presetName,
      isActive: false,
    };
  }

  return {
    presetName: input.presetName?.trim() || DEFAULT_THEME_CONFIG.presetName,
    primary: validHexColor(input.primary, DEFAULT_THEME_CONFIG.primary),
    secondary: validHexColor(input.secondary, DEFAULT_THEME_CONFIG.secondary),
    background: validHexColor(input.background, DEFAULT_THEME_CONFIG.background),
    panel: validHexColor(input.panel, DEFAULT_THEME_CONFIG.panel),
    foreground: validHexColor(input.foreground, DEFAULT_THEME_CONFIG.foreground),
    muted: validHexColor(input.muted, DEFAULT_THEME_CONFIG.muted),
    border: validHexColor(input.border, DEFAULT_THEME_CONFIG.border),
    glowIntensity: validIntensity(input.glowIntensity, DEFAULT_THEME_CONFIG.glowIntensity),
    scanlinesEnabled: input.scanlinesEnabled ?? DEFAULT_THEME_CONFIG.scanlinesEnabled,
    animationIntensity: validIntensity(input.animationIntensity, DEFAULT_THEME_CONFIG.animationIntensity),
    fontMode: validFontMode(input.fontMode, DEFAULT_THEME_CONFIG.fontMode),
    isActive,
  };
}
