import type { SkillsData } from '@/types/portfolio';

export const skillsData: SkillsData = {
  eyebrow: 'toolchain.bin / layered stack',
  heading: 'Skills organized by system layer.',
  intro:
    'The toolchain spans interface engineering, backend services, data modeling, deployment, security analysis, design translation, and AI-assisted development workflows.',
  levelPrefix: 'L',
  loadedLabel: 'loaded',
  groups: [
    {
      category: 'Interface Layer',
      path: '/ui',
      accent: '#00ff88',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
      order: 1,
    },
    {
      category: 'Service Layer',
      path: '/services',
      accent: '#00d9ff',
      skills: ['Node.js', 'Express', 'GraphQL', 'REST'],
      order: 2,
    },
    {
      category: 'Data Layer',
      path: '/data',
      accent: '#9af7c7',
      skills: ['PostgreSQL', 'Prisma', 'Supabase'],
      order: 3,
    },
    {
      category: 'Platform Layer',
      path: '/platform',
      accent: '#ffbd2e',
      skills: ['Vercel', 'Docker', 'Git'],
      order: 4,
    },
    {
      category: 'Security Layer',
      path: '/security',
      accent: '#ff5f56',
      skills: ['Nmap', 'Wireshark', 'Burp Suite', 'SIEM basics'],
      order: 5,
    },
    {
      category: 'Design/AI Layer',
      path: '/design-ai',
      accent: '#b7f7ff',
      skills: ['Figma', 'Magic Patterns', 'Codex'],
      order: 6,
    },
  ],
};
