import { capabilitiesData } from '@/data/capabilities';
import { commandSuggestions, consoleCommands } from '@/data/commands';
import { contactData } from '@/data/contact';
import { experienceData } from '@/data/experience';
import { navigationItems, quickCommands } from '@/data/navigation';
import { processData } from '@/data/process';
import { aboutData, profileData } from '@/data/profile';
import { projectsData } from '@/data/projects';
import { siteConfig } from '@/data/site';
import { skillsData } from '@/data/skills';
import type {
  AboutData,
  CapabilitiesData,
  ConsoleData,
  ContactData,
  ExperienceData,
  NavigationData,
  Portfolio,
  PortfolioData,
  PortfolioQueryOptions,
  ProcessData,
  ProfileData,
  ProjectsData,
  ResumeData,
  SiteConfig,
  SkillsData,
} from '@/types/portfolio';

const DEFAULT_PORTFOLIO_SLUG = 'ian';

const localPortfolios: Record<string, Portfolio> = {
  ian: {
    id: 'local-ian',
    slug: 'ian',
    ownerName: 'Ian Kipkorir',
    title: 'IanOS Portfolio',
    appName: 'ian-portfolio',
    publicUrl: null,
    brandName: 'IanOS',
    isActive: true,
    createdAt: null,
    updatedAt: null,
  },
  violet: {
    id: 'local-violet',
    slug: 'violet',
    ownerName: 'Violet Achieng',
    title: 'Violet Achieng Portfolio',
    appName: 'violet-portfolio',
    publicUrl: null,
    brandName: 'VioletSec',
    isActive: true,
    createdAt: null,
    updatedAt: null,
  },
};

function getPortfolioSlug(options?: PortfolioQueryOptions) {
  return options?.portfolioSlug?.trim().toLowerCase() || DEFAULT_PORTFOLIO_SLUG;
}

export async function getLocalPortfolio(options?: PortfolioQueryOptions): Promise<Portfolio> {
  const slug = getPortfolioSlug(options);

  return localPortfolios[slug] ?? localPortfolios[DEFAULT_PORTFOLIO_SLUG];
}

function isIanPortfolio(options?: PortfolioQueryOptions) {
  return getPortfolioSlug(options) === DEFAULT_PORTFOLIO_SLUG;
}

export async function getLocalSiteConfigData(options?: PortfolioQueryOptions): Promise<SiteConfig> {
  if (isIanPortfolio(options)) {
    return siteConfig;
  }

  const portfolio = await getLocalPortfolio(options);

  return {
    ...siteConfig,
    brandName: portfolio.brandName ?? portfolio.ownerName,
    appTitle: portfolio.title,
    initialConsoleOutput: `${portfolio.brandName ?? portfolio.ownerName} content pending. CMS portfolio shell ready.`,
    commandPrompt: {
      ...siteConfig.commandPrompt,
      userHost: `${portfolio.slug}@${portfolio.brandName ?? portfolio.ownerName}`,
    },
  };
}

export async function getLocalNavigationData(_options?: PortfolioQueryOptions): Promise<NavigationData> {
  return {
    items: navigationItems,
    quickCommands,
  };
}

export async function getLocalConsoleData(_options?: PortfolioQueryOptions): Promise<ConsoleData> {
  return {
    suggestions: commandSuggestions,
    commands: consoleCommands,
  };
}

export async function getLocalProfileData(options?: PortfolioQueryOptions): Promise<ProfileData> {
  if (!isIanPortfolio(options)) {
    const portfolio = await getLocalPortfolio(options);

    return {
      ...profileData,
      eyebrow: 'portfolio.content / pending',
      headline: `${portfolio.ownerName} portfolio content pending`,
      subheadline: 'This portfolio shell exists in the shared CMS foundation. Public content has not been seeded yet.',
      identityRows: [
        { label: 'NAME', value: portfolio.ownerName },
        { label: 'ROLE', value: 'Pending' },
        { label: 'MODE', value: 'CMS Foundation' },
        { label: 'FOCUS', value: 'Portfolio setup' },
      ],
      nowBuilding: ['Portfolio content model', 'Owner-scoped CMS access'],
    };
  }

  return profileData;
}

export async function getLocalAboutData(options?: PortfolioQueryOptions): Promise<AboutData> {
  if (!isIanPortfolio(options)) {
    return {
      ...aboutData,
      eyebrow: 'origin.log / pending',
      heading: 'Portfolio content has not been seeded yet.',
      paragraphs: ['This portfolio exists for owner-scoped CMS access and future public rendering.'],
      storyPoints: [],
    };
  }

  return aboutData;
}

export async function getLocalProjectsData(options?: PortfolioQueryOptions): Promise<ProjectsData> {
  if (!isIanPortfolio(options)) {
    return {
      ...projectsData,
      projects: [],
    };
  }

  return projectsData;
}

export async function getLocalSkillsData(options?: PortfolioQueryOptions): Promise<SkillsData> {
  if (!isIanPortfolio(options)) {
    return {
      ...skillsData,
      groups: [],
    };
  }

  return skillsData;
}

export async function getLocalExperienceData(options?: PortfolioQueryOptions): Promise<ExperienceData> {
  if (!isIanPortfolio(options)) {
    return {
      ...experienceData,
      entries: [],
    };
  }

  return experienceData;
}

export async function getLocalCapabilitiesData(options?: PortfolioQueryOptions): Promise<CapabilitiesData> {
  if (!isIanPortfolio(options)) {
    return {
      ...capabilitiesData,
      items: [],
    };
  }

  return capabilitiesData;
}

export async function getLocalProcessData(options?: PortfolioQueryOptions): Promise<ProcessData> {
  if (!isIanPortfolio(options)) {
    return {
      ...processData,
      stages: [],
    };
  }

  return processData;
}

export async function getLocalContactData(options?: PortfolioQueryOptions): Promise<ContactData> {
  if (!isIanPortfolio(options)) {
    return {
      ...contactData,
      availability: [],
      collaborationSignals: [],
      links: [],
    };
  }

  return contactData;
}

export async function getLocalResumeData(_options?: PortfolioQueryOptions): Promise<ResumeData> {
  return null;
}

export async function getLocalPortfolioData(options?: PortfolioQueryOptions): Promise<PortfolioData> {
  const [portfolio, site, navigation, console, profile, about, projects, skills, experience, capabilities, process, contact, resume] =
    await Promise.all([
      getLocalPortfolio(options),
      getLocalSiteConfigData(options),
      getLocalNavigationData(options),
      getLocalConsoleData(options),
      getLocalProfileData(options),
      getLocalAboutData(options),
      getLocalProjectsData(options),
      getLocalSkillsData(options),
      getLocalExperienceData(options),
      getLocalCapabilitiesData(options),
      getLocalProcessData(options),
      getLocalContactData(options),
      getLocalResumeData(options),
    ]);

  return {
    portfolio,
    site,
    navigation,
    console,
    profile,
    about,
    projects,
    skills,
    experience,
    capabilities,
    process,
    contact,
    resume,
  };
}
