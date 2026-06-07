import type { SiteConfig } from '@/types/portfolio';

export const siteConfig: SiteConfig = {
  brandName: 'IanOS',
  appTitle: 'personal operating system',
  status: 'ONLINE',
  version: 'kernel v2.6',
  modulePrefix: 'MODULE:',
  commandPrompt: {
    userHost: 'ian@IanOS',
    path: '~',
    status: 'secure-build-mode',
  },
  defaultActiveSection: 'profile',
  initialConsoleOutput: 'IanOS ready. Type help or switch a module.',
  loadingPrefix: 'Loading',
  loadingCompleteLabel: '[OK]',
  mountedConsolePrefix: 'Mounted',
  mobileMenuLabel: '[MENU]',
  mobileCloseLabel: '[CLOSE]',
  sidebar: {
    title: '/SYSTEM MODULES',
    description: 'Switch modules from requirement to secure platform delivery.',
    commandPaletteTitle: 'command.palette',
    commandPaletteMeta: 'visible actions',
    activeLabel: 'RUN',
  },
  statusBar: {
    stdoutLabel: 'stdout:',
    modeLabel: 'mode:',
    mode: 'solutions-architecture',
    availabilityLabel: 'availability:',
    availability: 'selected opportunities',
  },
  messages: {
    cvUnavailable: 'CV artifact is not attached in this build. Use connect.sh to request it.',
  },
};
