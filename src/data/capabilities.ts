import type { CapabilitiesData } from '@/types/portfolio';

export const capabilitiesData: CapabilitiesData = {
  eyebrow: 'capabilities.map / delivery model',
  heading: 'A bridge from requirements to secure delivery.',
  intro:
    "Ian's value is not only writing code. It is connecting product intent, platform structure, implementation details, and operational security into systems that can be understood, built, and maintained.",
  nodePrefix: 'node.',
  output: 'output: buildable scope + implementation path + security-aware constraints + prototype-ready interface',
  items: [
    {
      title: 'Translate Requirements',
      description: 'Convert business journeys and specs into buildable systems.',
      signal: 'business -> system',
      order: 1,
    },
    {
      title: 'Design Platform Architecture',
      description: 'Structure frontend, backend, workflows, APIs, and access models.',
      signal: 'shape -> platform',
      order: 2,
    },
    {
      title: 'Build Working Prototypes',
      description: 'Move ideas from static requirements to usable product experiences.',
      signal: 'spec -> prototype',
      order: 3,
    },
    {
      title: 'Secure the System Thinking',
      description: 'Apply cybersecurity awareness to access, data, APIs, logging, and operations.',
      signal: 'surface -> controls',
      order: 4,
    },
  ],
};
