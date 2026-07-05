import type { AboutData, ProfileData } from '@/types/portfolio';

export const profileData: ProfileData = {
  eyebrow: 'module.identity / professional kernel',
  headline: 'Full-Stack Engineer & Solutions Architect',
  subheadline:
    'I turn complex business requirements into secure, scalable digital platforms — from prototype and architecture to production-ready systems.',
  ctas: [
    { label: 'open builds', target: 'projects' },
    { label: 'open toolchain', target: 'skills' },
    { label: 'connect.sh', target: 'contact' },
  ],
  identityBlockLabel: 'identity.block',
  identityBlockStatus: 'verified',
  identityRows: [
    { label: 'NAME', value: 'Ian Kipkorir' },
    { label: 'ROLE', value: 'Full-Stack Engineer' },
    { label: 'MODE', value: 'Solutions Architect' },
    { label: 'FOCUS', value: 'Enterprise Platforms' },
    { label: 'SIGNAL', value: 'Security-aware builder' },
    { label: 'STACK', value: 'React / Next.js / Node.js / TypeScript' },
  ],
  nowBuildingLabel: 'now_building.queue',
  nowBuilding: [
    'Enterprise digital platforms',
    'DXP / DWS prototypes',
    'Security-aware full-stack systems',
    'AI-assisted engineering workflows',
  ],
  consoleLabel: 'mini_build_console',
  commands: [
    { command: 'help' },
    { command: 'whoami' },
    { command: 'open builds', target: 'projects' },
    { command: 'open toolchain', target: 'skills' },
    { command: 'open career' },
    { command: 'download cv', action: 'downloadCv' },
    { command: 'contact', target: 'contact' },
  ],
};

export const aboutData: AboutData = {
  eyebrow: 'origin.log / system narrative',
  heading: 'From requirement to working platform.',
  paragraphs: [
    'Ian Kipkorir is a full-stack engineer and solutions architect focused on enterprise-grade digital platforms. His work sits where business requirements, user journeys, platform architecture, backend systems, and secure implementation need to line up.',
    'The strongest pattern in his work is translation: turning static specifications and complex stakeholder needs into usable product experiences, technical blueprints, APIs, workflows, and production-ready implementation paths.',
  ],
  storyPoints: [
    {
      label: 'business.input',
      title: 'Reads the requirement behind the ticket',
      body: 'Ian maps business journeys, stakeholder constraints, and operational risk before choosing a technical path.',
    },
    {
      label: 'architecture.bridge',
      title: 'Connects product, UX, services, and delivery',
      body: 'He thinks across the interface, backend systems, APIs, workflow states, access models, and implementation tradeoffs.',
    },
    {
      label: 'security.baseline',
      title: 'Builds with a security-aware mindset',
      body: 'Security is treated as part of the system shape: validation, permissions, data exposure, logs, and operational behavior.',
    },
  ],
};
