import type { NavigationItem, QuickCommand } from '@/types/portfolio';

export const navigationItems: NavigationItem[] = [
  { id: 'profile', label: 'Profile', module: 'identity.sys', command: 'cat /profile/identity.sys', order: 1, visibility: 'public' },
  { id: 'about', label: 'About', module: 'origin.log', command: 'tail /logs/origin.log', order: 2, visibility: 'public' },
  { id: 'capabilities', label: 'Capabilities', module: 'capabilities.map', command: 'open /maps/capabilities.map', order: 3, visibility: 'public' },
  { id: 'skills', label: 'Skills', module: 'toolchain.bin', command: 'scan /bin/toolchain.bin', order: 4, visibility: 'public' },
  { id: 'projects', label: 'Projects', module: 'builds/', command: 'ls /builds/', order: 5, visibility: 'public' },
  { id: 'process', label: 'Process', module: 'process.pipeline', command: 'run /pipelines/process.pipeline', order: 6, visibility: 'public' },
  { id: 'experience', label: 'Experience', module: 'career.log', command: 'tail -f /logs/career.log', order: 7, visibility: 'public' },
  { id: 'contact', label: 'Contact', module: 'connect.sh', command: './connect.sh', order: 8, visibility: 'public' },
];

export const quickCommands: QuickCommand[] = [
  { command: 'help', output: 'modules: identity, origin, capabilities, toolchain, builds, process, career, connect' },
  { command: 'whoami', target: 'profile', output: 'Ian Kipkorir / full-stack engineer / solutions architect' },
  { command: 'open builds', target: 'projects', output: 'Opening proof-of-work index...' },
  { command: 'open toolchain', target: 'skills', output: 'Loading layered engineering toolchain...' },
  { command: 'open career', target: 'experience', output: 'Streaming career growth stages...' },
  { command: 'download cv', output: 'CV artifact is not attached in this build. Use connect.sh to request it.' },
  { command: 'contact', target: 'contact', output: 'Opening secure collaboration channel...' },
];
