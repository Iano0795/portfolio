import type { NavigationItem, QuickCommand } from '@/types/portfolio';

export const navigationItems: NavigationItem[] = [
  { id: 'profile', label: 'Profile', module: 'identity.sys', command: 'cat /profile/identity.sys', icon: 'user', order: 1, visible: true, visibility: 'public' },
  { id: 'about', label: 'About', module: 'origin.log', command: 'tail /logs/origin.log', icon: 'file-text', order: 2, visible: true, visibility: 'public' },
  { id: 'capabilities', label: 'Capabilities', module: 'capabilities.map', command: 'open /maps/capabilities.map', icon: 'network', order: 3, visible: true, visibility: 'public' },
  { id: 'skills', label: 'Skills', module: 'toolchain.bin', command: 'scan /bin/toolchain.bin', icon: 'cpu', order: 4, visible: true, visibility: 'public' },
  { id: 'projects', label: 'Projects', module: 'builds/', command: 'ls /builds/', icon: 'folder-git', order: 5, visible: true, visibility: 'public' },
  { id: 'process', label: 'Process', module: 'process.pipeline', command: 'run /pipelines/process.pipeline', icon: 'git-branch', order: 6, visible: true, visibility: 'public' },
  { id: 'experience', label: 'Experience', module: 'career.log', command: 'tail -f /logs/career.log', icon: 'briefcase', order: 7, visible: true, visibility: 'public' },
  { id: 'contact', label: 'Contact', module: 'connect.sh', command: './connect.sh', icon: 'send', order: 8, visible: true, visibility: 'public' },
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
