import type { ExperienceData } from '@/types/portfolio';

export const experienceData: ExperienceData = {
  eyebrow: 'career.log / growth stages',
  heading: 'Career progression as capability growth.',
  intro:
    'The timeline is framed less as a list of jobs and more as a progression: execution, platform thinking, solution leadership, and security-aware engineering.',
  footerPrefix: '[END OF CAREER.LOG] - stages indexed:',
  entries: [
    {
      stage: 'Stage 01',
      title: 'Full-Stack Execution',
      period: 'foundation',
      description: 'Built modern interfaces, service endpoints, integrations, and production features across the stack.',
      achievements: ['React and Next.js interfaces', 'Node.js service work', 'API integration and delivery discipline'],
      order: 1,
    },
    {
      stage: 'Stage 02',
      title: 'Platform Thinking',
      period: 'enterprise systems',
      description: 'Moved from feature delivery into workflow platforms, DXP/DWS concepts, data surfaces, and system-wide product behavior.',
      achievements: ['Enterprise journey mapping', 'Workspace platform modules', 'Cross-system workflow awareness'],
      order: 2,
    },
    {
      stage: 'Stage 03',
      title: 'Solution Leadership',
      period: 'architecture track',
      description: 'Translated stakeholder requirements into architecture, prototype direction, implementation plans, and handoff-ready specs.',
      achievements: ['Architecture blueprints', 'Prototype-to-build alignment', 'Technical communication across roles'],
      order: 3,
    },
    {
      stage: 'Stage 04',
      title: 'Security-Aware Engineering',
      period: 'active focus',
      description: 'Strengthened delivery with cybersecurity practice across access, validation, data exposure, testing, and operations.',
      achievements: ['Nmap, Wireshark, Burp Suite', 'CTF and lab practice', 'Security thinking inside product delivery'],
      order: 4,
    },
  ],
};
