export type SectionId =
  | 'profile'
  | 'about'
  | 'capabilities'
  | 'skills'
  | 'projects'
  | 'process'
  | 'experience'
  | 'contact';

export type Section = SectionId;

export type NavigationIconName =
  | 'user'
  | 'file-text'
  | 'network'
  | 'cpu'
  | 'folder-git'
  | 'git-branch'
  | 'briefcase'
  | 'send';

export type NavigationItem = {
  id: SectionId;
  label: string;
  module: string;
  command: string;
  icon: NavigationIconName;
  order: number;
  visible: boolean;
  visibility: 'public';
};

export type SectionConfig = NavigationItem;

export type QuickCommand = {
  command: string;
  output: string;
  target?: SectionId;
};

export type ConsoleCommand = {
  command: string;
  target?: SectionId;
  action?: 'showHelp' | 'downloadCv';
  output: string;
};

export type ConsoleData = {
  suggestions: string[];
  commands: ConsoleCommand[];
};

export type NavigationData = {
  items: NavigationItem[];
  quickCommands: QuickCommand[];
};

export type SiteConfig = {
  brandName: string;
  appTitle: string;
  status: string;
  version: string;
  modulePrefix: string;
  commandPrompt: {
    userHost: string;
    path: string;
    status: string;
  };
  defaultActiveSection: SectionId;
  initialConsoleOutput: string;
  loadingPrefix: string;
  loadingCompleteLabel: string;
  mountedConsolePrefix: string;
  mobileMenuLabel: string;
  mobileCloseLabel: string;
  sidebar: {
    title: string;
    description: string;
    commandPaletteTitle: string;
    commandPaletteMeta: string;
    activeLabel: string;
  };
  statusBar: {
    stdoutLabel: string;
    modeLabel: string;
    mode: string;
    availabilityLabel: string;
    availability: string;
  };
  messages: {
    cvUnavailable: string;
  };
};

export type LabelValue = {
  label: string;
  value: string;
};

export type ProfileCommand = {
  command: string;
  target?: Extract<SectionId, 'projects' | 'contact' | 'skills'>;
  action?: 'downloadCv';
};

export type ProfileData = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  ctas: Array<{
    label: string;
    target: Extract<SectionId, 'projects' | 'contact' | 'skills'>;
  }>;
  identityBlockLabel: string;
  identityBlockStatus: string;
  identityRows: LabelValue[];
  nowBuildingLabel: string;
  nowBuilding: string[];
  consoleLabel: string;
  commands: ProfileCommand[];
};

export type StoryPoint = {
  label: string;
  title: string;
  body: string;
};

export type AboutData = {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  storyPoints: StoryPoint[];
};

export type Capability = {
  title: string;
  description: string;
  signal: string;
  order: number;
};

export type CapabilitiesData = {
  eyebrow: string;
  heading: string;
  intro: string;
  nodePrefix: string;
  output: string;
  items: Capability[];
};

export type SkillGroup = {
  category: string;
  path: string;
  accent: string;
  skills: string[];
  order: number;
};

export type SkillsData = {
  eyebrow: string;
  heading: string;
  intro: string;
  levelPrefix: string;
  loadedLabel: string;
  groups: SkillGroup[];
};

export type ProjectCategory = 'Enterprise Platforms' | 'DXP/DWS' | 'Integrations' | 'Security';
export type ProjectFilter = 'All' | ProjectCategory;

export type FeaturedProject = {
  title: string;
  label: string;
  badge: string;
  fields: Array<LabelValue>;
};

export type Project = {
  title: string;
  slug: string;
  category: ProjectCategory[];
  role: string;
  description: string;
  stack: string[];
  access: string;
  featured: boolean;
  status: 'private' | 'selected-notes';
  order: number;
  visibility: 'public';
};

export type ProjectsData = {
  eyebrow: string;
  heading: string;
  defaultFilter: 'All';
  filters: ProjectFilter[];
  featuredBuild: FeaturedProject;
  indexLabel: string;
  caseStudyPreviewLabel: string;
  caseStudyPreviewItems: string[];
  caseStudyPreviewMeta: string;
  projects: Project[];
};

export type ProcessStep = {
  title: string;
  order: number;
};

export type TerminalLine = {
  label: string;
  value: string;
};

export type ProcessData = {
  eyebrow: string;
  heading: string;
  intro: string;
  stagePrefix: string;
  terminalLabel: string;
  reviewLabel: string;
  stages: ProcessStep[];
  terminalPipeline: TerminalLine[];
  reviewChecklist: string[];
};

export type ExperienceEntry = {
  stage: string;
  title: string;
  period: string;
  description: string;
  achievements: string[];
  order: number;
};

export type ExperienceData = {
  eyebrow: string;
  heading: string;
  intro: string;
  footerPrefix: string;
  entries: ExperienceEntry[];
};

export type ContactLink = {
  label: string;
  text: string;
  href?: string;
  variant: 'cyan' | 'green';
};

export type ContactData = {
  eyebrow: string;
  heading: string;
  intro: string;
  availabilityLabel: string;
  availability: string[];
  collaborationSignals: LabelValue[];
  composeLabel: string;
  sendingSteps: string[];
  acceptedMessage: string;
  alertMessage: string;
  form: {
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    sendButton: string;
    sendingButton: string;
  };
  links: ContactLink[];
};

export type ResumeData = {
  fileName: string;
  fileUrl: string;
  versionLabel: string;
} | null;

export type PortfolioData = {
  site: SiteConfig;
  navigation: NavigationData;
  console: ConsoleData;
  profile: ProfileData;
  about: AboutData;
  projects: ProjectsData;
  skills: SkillsData;
  experience: ExperienceData;
  capabilities: CapabilitiesData;
  process: ProcessData;
  contact: ContactData;
  resume: ResumeData;
};
