import type { ConsoleCommand } from '@/types/portfolio';

export const commandSuggestions = [
  'open profile',
  'open about',
  'open capabilities',
  'open skills',
  'open builds',
  'open process',
  'open career',
  'open contact',
  'download cv',
];

export const consoleCommands: ConsoleCommand[] = [
  { command: 'help', action: 'showHelp', output: 'Available commands:' },
  { command: 'whoami', target: 'profile', output: 'Ian Kipkorir / full-stack engineer / solutions architect' },
  { command: 'open profile', target: 'profile', output: 'Opening identity.sys...' },
  { command: 'open identity', target: 'profile', output: 'Opening identity.sys...' },
  { command: 'open about', target: 'about', output: 'Opening origin.log...' },
  { command: 'open origin', target: 'about', output: 'Opening origin.log...' },
  { command: 'open capabilities', target: 'capabilities', output: 'Opening capabilities.map...' },
  { command: 'open skills', target: 'skills', output: 'Opening toolchain.bin...' },
  { command: 'open toolchain', target: 'skills', output: 'Opening toolchain.bin...' },
  { command: 'open projects', target: 'projects', output: 'Opening builds/...' },
  { command: 'open builds', target: 'projects', output: 'Opening builds/...' },
  { command: 'open process', target: 'process', output: 'Opening process.pipeline...' },
  { command: 'open pipeline', target: 'process', output: 'Opening process.pipeline...' },
  { command: 'open experience', target: 'experience', output: 'Opening career.log...' },
  { command: 'open career', target: 'experience', output: 'Opening career.log...' },
  { command: 'open contact', target: 'contact', output: 'Opening connect.sh...' },
  { command: 'connect', target: 'contact', output: 'Opening connect.sh...' },
  { command: 'download cv', action: 'downloadCv', output: 'CV not connected yet.' },
];
