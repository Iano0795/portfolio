import type { ContactData } from '@/types/portfolio';

export const contactData: ContactData = {
  eyebrow: 'connect.sh / collaboration endpoint',
  heading: 'Connect around serious platform work.',
  intro:
    'Best-fit conversations involve building secure full-stack products, shaping enterprise platform architecture, moving prototypes toward implementation, or collaborating on security-aware engineering.',
  availabilityLabel: 'Available for:',
  availability: [
    'Full-stack engineering roles',
    'Solution architecture opportunities',
    'Platform prototype work',
    'Cybersecurity-oriented engineering roles',
    'Technical collaboration',
  ],
  collaborationSignals: [
    { label: 'response.mode', value: 'strategic and technical' },
    { label: 'timezone', value: 'GMT+3 / EAT' },
    { label: 'working.style', value: 'prototype -> spec -> build' },
    { label: 'fit', value: 'secure enterprise platforms' },
  ],
  composeLabel: 'compose.transmission',
  sendingSteps: ['> Executing transmission...', '> Validating payload...', '> Queueing message...'],
  acceptedMessage: '[OK] Demo payload accepted',
  alertMessage: 'Message queued in demo mode. Connect this form to an email endpoint before production use.',
  form: {
    nameLabel: 'NAME:',
    namePlaceholder: 'Your name',
    emailLabel: 'EMAIL:',
    emailPlaceholder: 'your.email@example.com',
    messageLabel: 'MESSAGE:',
    messagePlaceholder: 'What should we build, secure, or architect?',
    sendButton: '[SEND MESSAGE]',
    sendingButton: '[SENDING...]',
  },
  links: [
    {
      label: 'LINKEDIN',
      text: '/in/iankipkorir ->',
      href: 'https://linkedin.com/in/iankipkorir',
      variant: 'cyan',
    },
    {
      label: 'GITHUB',
      text: '@iankipkorir ->',
      href: 'https://github.com/iankipkorir',
      variant: 'green',
    },
    {
      label: 'CV',
      text: 'available on request',
      variant: 'green',
    },
  ],
};
