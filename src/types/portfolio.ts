export type SectionId =
  | 'profile'
  | 'about'
  | 'capabilities'
  | 'skills'
  | 'projects'
  | 'writeups'
  | 'credentials'
  | 'process'
  | 'experience'
  | 'contact';

export type Section = SectionId;

export type PortfolioRole = 'owner' | 'admin' | 'editor' | 'viewer';

export type PortfolioSlug = string;

export type Portfolio = {
  id: string;
  slug: PortfolioSlug;
  ownerName: string;
  title: string;
  appName: string | null;
  publicUrl: string | null;
  brandName: string | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PortfolioMember = {
  id: string;
  portfolioId: string;
  userId: string;
  email: string;
  role: PortfolioRole;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PortfolioQueryOptions = {
  portfolioSlug?: PortfolioSlug;
};

export type NavigationIconName =
  | 'user'
  | 'file-text'
  | 'network'
  | 'shield'
  | 'award'
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

export type ThemeFontMode = 'system' | 'mono' | 'retro' | 'readable';

export type ThemeConfig = {
  presetName: string;
  primary: string;
  secondary: string;
  background: string;
  panel: string;
  foreground: string;
  muted: string;
  border: string;
  glowIntensity: number;
  scanlinesEnabled: boolean;
  animationIntensity: number;
  fontMode: ThemeFontMode;
  isActive: boolean;
};

export type SiteConfig = {
  brandName: string;
  appTitle: string;
  status: string;
  version: string;
  theme: ThemeConfig;
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

export type WriteupsData = {
  eyebrow: string;
  heading: string;
  intro: string;
  indexLabel: string;
  emptyLabel: string;
  writeups: LabWriteup[];
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

export type Credential = {
  id: string;
  portfolio_id?: string;
  title: string;
  issuer?: string | null;
  credential_type?: string | null;
  category?: string | null;
  description?: string | null;
  issued_at?: string | null;
  expires_at?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
  image_url?: string | null;
  skills: string[];
  order_index: number;
  is_featured: boolean;
  is_active: boolean;
};

// ============================================================================
// Lab Writeups - Restricted Access System
// ============================================================================

export type LabWriteupVisibility = 'public' | 'restricted' | 'private';
export type LabWriteupMachineStatus = 'active' | 'retired' | 'other';
export type LabWriteupType = 'offensive' | 'defensive';

export type LabWriteup = {
  id: string;
  portfolio_id?: string;
  project_id?: string | null;
  title: string;
  slug: string;
  platform?: string | null;
  difficulty?: string | null;
  category?: string | null;
  lab_type?: LabWriteupType | null;
  machine_status: LabWriteupMachineStatus;
  visibility: LabWriteupVisibility;
  is_requestable: boolean;
  public_summary?: string | null;
  public_teaser?: string | null;
  content_markdown?: string | null;
  cover_image_url?: string | null;
  reading_time_minutes?: number | null;
  published_at?: string | null;
  tools: string[];
  skills: string[];
  tags: string[];
  storage_bucket?: string | null;
  storage_path?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  is_featured: boolean;
  is_active: boolean;
  order_index: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type WriteupMedia = {
  id: string;
  portfolio_id?: string;
  writeup_id: string;
  media_type: 'image';
  storage_bucket: string;
  storage_path: string;
  alt_text?: string | null;
  caption?: string | null;
  order_index: number;
  is_active: boolean;
};

export type WriteupAccessRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type WriteupAccessRequest = {
  id: string;
  portfolio_id: string;
  writeup_id: string;
  requester_name: string;
  requester_email: string;
  requester_reason?: string | null;
  requester_organization?: string | null;
  status: WriteupAccessRequestStatus;
  reviewer_user_id?: string | null;
  reviewer_note?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type WriteupAccessGrant = {
  id: string;
  portfolio_id: string;
  writeup_id: string;
  request_id?: string | null;
  requester_email: string;
  token_hash: string;
  token_label?: string | null;
  expires_at?: string | null;
  max_views?: number | null;
  views_used: number;
  revoked_at?: string | null;
  revoked_by?: string | null;
  revoke_reason?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
};

export type WriteupAccessLogEventType =
  | 'request_created'
  | 'request_approved'
  | 'request_rejected'
  | 'grant_created'
  | 'grant_viewed'
  | 'grant_revoked'
  | 'grant_expired'
  | 'file_signed_url_created'
  | 'access_denied';

export type WriteupAccessLog = {
  id: string;
  portfolio_id: string;
  writeup_id?: string | null;
  grant_id?: string | null;
  request_id?: string | null;
  event_type: WriteupAccessLogEventType;
  actor_email?: string | null;
  actor_user_id?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type PortfolioData = {
  portfolio: Portfolio;
  site: SiteConfig;
  navigation: NavigationData;
  console: ConsoleData;
  profile: ProfileData;
  about: AboutData;
  projects: ProjectsData;
  writeups: WriteupsData;
  skills: SkillsData;
  experience: ExperienceData;
  capabilities: CapabilitiesData;
  process: ProcessData;
  contact: ContactData;
  resume: ResumeData;
  credentials: Credential[];
};
