export type BrandSettingsEditorValue = {
  ownerName: string;
  brandName: string;
  title: string;
  appName: string;
  publicUrl: string;
  isActive: boolean;
};

export type SiteSettingsEditorValue = {
  appTitle: string;
  tagline: string;
  statusLabel: string;
  modeLabel: string;
  versionLabel: string;
  availabilityLabel: string;
  footerText: string;
};

export type SidebarSettingsEditorValue = {
  enabledItems: string[];
};

export type SettingsMutationResult = {
  error?: string;
  success?: string;
};
