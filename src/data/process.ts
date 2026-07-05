import type { ProcessData } from '@/types/portfolio';

export const processData: ProcessData = {
  eyebrow: 'process.pipeline / build flow',
  heading: 'How a platform idea becomes buildable.',
  intro:
    'The pipeline keeps strategy and execution connected: understand the business requirement, shape the architecture, make the experience tangible, build the system, then review for security and handoff quality.',
  stagePrefix: 'stage.',
  terminalLabel: 'terminal.pipeline',
  reviewLabel: 'review.checklist',
  stages: [
    { title: 'Requirement', order: 1 },
    { title: 'Architecture', order: 2 },
    { title: 'Prototype', order: 3 },
    { title: 'Implementation', order: 4 },
    { title: 'Review', order: 5 },
  ],
  terminalPipeline: [
    { label: 'input', value: 'business requirement' },
    { label: 'parse', value: 'user journeys + platform stages' },
    { label: 'design', value: 'UX + architecture' },
    { label: 'build', value: 'React / Node / APIs' },
    { label: 'secure', value: 'access + validation + NFRs' },
    { label: 'ship', value: 'prototype / specification / production handoff' },
  ],
  reviewChecklist: [
    'Does the flow match the business journey?',
    'Are permissions and data boundaries explicit?',
    'Are APIs, states, and handoffs documented?',
    'Can the prototype become production work?',
  ],
};
