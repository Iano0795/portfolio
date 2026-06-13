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
import {
  getActiveResume,
  getCapabilities,
  getContactLinks,
  getExperience,
  getNavigationItems,
  getPortfolioBySlug,
  getProcessSteps,
  getProfile,
  getProjects,
  getSiteSettings,
  getSkills,
  type CmsCapability,
  type CmsContactLink,
  type CmsExperience,
  type CmsNavigationItem,
  type CmsProcessStep,
  type CmsProfile,
  type CmsProject,
  type CmsSiteSettings,
  type CmsSkill,
} from '@/lib/cms/queries';
import type {
  Capability,
  CapabilitiesData,
  ConsoleData,
  ContactData,
  ContactLink,
  ExperienceData,
  ExperienceEntry,
  LabelValue,
  NavigationData,
  NavigationIconName,
  NavigationItem,
  Portfolio,
  PortfolioData,
  PortfolioQueryOptions,
  ProcessData,
  ProcessStep,
  ProfileData,
  Project,
  ProjectCategory,
  ProjectsData,
  ResumeData,
  SectionId,
  SiteConfig,
  SkillGroup,
  SkillsData,
} from '@/types/portfolio';

type JsonObject = Record<string, unknown>;

const validSectionIds: SectionId[] = ['profile', 'about', 'capabilities', 'skills', 'projects', 'process', 'experience', 'contact'];
const validNavigationIcons: NavigationIconName[] = ['user', 'file-text', 'network', 'cpu', 'folder-git', 'git-branch', 'briefcase', 'send'];
const validProjectCategories: ProjectCategory[] = ['Enterprise Platforms', 'DXP/DWS', 'Integrations', 'Security'];

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isLabelValueArray(value: unknown): value is LabelValue[] {
  return (
    Array.isArray(value) &&
    value.every((item) => isObject(item) && typeof item.label === 'string' && typeof item.value === 'string')
  );
}

function normalizeString(value: string | null | undefined, fallback = '') {
  return value ?? fallback;
}

function normalizeSectionId(value: string): SectionId | null {
  return validSectionIds.includes(value as SectionId) ? (value as SectionId) : null;
}

function normalizeProjectCategory(value: string | null): ProjectCategory[] {
  if (!value) {
    return [];
  }

  return validProjectCategories.includes(value as ProjectCategory) ? [value as ProjectCategory] : [];
}

function normalizeNavigationIcon(value: string | null | undefined, fallback: NavigationIconName): NavigationIconName {
  return validNavigationIcons.includes(value as NavigationIconName) ? (value as NavigationIconName) : fallback;
}

function getProfileCoreStack(profile: CmsProfile | null) {
  return isObject(profile?.core_stack) ? profile.core_stack : {};
}

function isDefaultPortfolio(portfolio: Portfolio | null) {
  return !portfolio || portfolio.slug === 'ian';
}

function requirePortfolio(portfolio: Portfolio | null, options?: PortfolioQueryOptions): Portfolio {
  if (!portfolio) {
    throw new Error(`Portfolio "${options?.portfolioSlug ?? 'ian'}" was not found.`);
  }

  return portfolio;
}

async function resolvePortfolio(options?: PortfolioQueryOptions) {
  return requirePortfolio(await getPortfolioBySlug(options), options);
}

export async function getSupabaseSiteConfigData(options?: PortfolioQueryOptions): Promise<SiteConfig> {
  const portfolio = await resolvePortfolio(options);
  const settings = await getSiteSettings(options);

  return normalizeSiteConfig(settings, portfolio);
}

export async function getSupabaseNavigationData(options?: PortfolioQueryOptions): Promise<NavigationData> {
  const portfolio = await resolvePortfolio(options);
  const items = await getNavigationItems(options);

  return {
    items: normalizeNavigationItems(items, portfolio),
    quickCommands,
  };
}

export async function getSupabaseConsoleData(_options?: PortfolioQueryOptions): Promise<ConsoleData> {
  return {
    suggestions: commandSuggestions,
    commands: consoleCommands,
  };
}

export async function getSupabaseProfileData(options?: PortfolioQueryOptions): Promise<ProfileData> {
  const portfolio = await resolvePortfolio(options);
  const profile = await getProfile(options);

  return normalizeProfileData(profile, portfolio);
}

export async function getSupabaseProjectsData(options?: PortfolioQueryOptions): Promise<ProjectsData> {
  const portfolio = await resolvePortfolio(options);
  const projects = await getProjects(options);

  return normalizeProjectsData(projects, portfolio);
}

export async function getSupabaseSkillsData(options?: PortfolioQueryOptions): Promise<SkillsData> {
  const portfolio = await resolvePortfolio(options);
  const skills = await getSkills(options);

  return normalizeSkillsData(skills, portfolio);
}

export async function getSupabaseExperienceData(options?: PortfolioQueryOptions): Promise<ExperienceData> {
  const portfolio = await resolvePortfolio(options);
  const entries = await getExperience(options);

  return normalizeExperienceData(entries, portfolio);
}

export async function getSupabaseCapabilitiesData(options?: PortfolioQueryOptions): Promise<CapabilitiesData> {
  const portfolio = await resolvePortfolio(options);
  const capabilities = await getCapabilities(options);

  return normalizeCapabilitiesData(capabilities, portfolio);
}

export async function getSupabaseProcessData(options?: PortfolioQueryOptions): Promise<ProcessData> {
  const portfolio = await resolvePortfolio(options);
  const steps = await getProcessSteps(options);

  return normalizeProcessData(steps, portfolio);
}

export async function getSupabaseContactData(options?: PortfolioQueryOptions): Promise<ContactData> {
  const portfolio = await resolvePortfolio(options);
  const links = await getContactLinks(options);

  return normalizeContactData(links, portfolio);
}

export async function getSupabaseResumeData(options?: PortfolioQueryOptions): Promise<ResumeData> {
  await resolvePortfolio(options);
  const resume = await getActiveResume(options);

  if (!resume) {
    return null;
  }

  return {
    fileName: resume.file_name,
    fileUrl: resume.file_url,
    versionLabel: resume.version_label ?? '',
  };
}

export async function getSupabasePortfolioData(options?: PortfolioQueryOptions): Promise<PortfolioData> {
  const portfolio = await resolvePortfolio(options);
  const [site, navigation, console, profile, projects, skills, experience, capabilities, process, contact, resume] =
    await Promise.all([
      getSupabaseSiteConfigData(options),
      getSupabaseNavigationData(options),
      getSupabaseConsoleData(options),
      getSupabaseProfileData(options),
      getSupabaseProjectsData(options),
      getSupabaseSkillsData(options),
      getSupabaseExperienceData(options),
      getSupabaseCapabilitiesData(options),
      getSupabaseProcessData(options),
      getSupabaseContactData(options),
      getSupabaseResumeData(options),
    ]);

  return {
    portfolio,
    site,
    navigation,
    console,
    profile,
    about: aboutData,
    projects,
    skills,
    experience,
    capabilities,
    process,
    contact,
    resume,
  };
}

function normalizeSiteConfig(settings: CmsSiteSettings | null, portfolio: Portfolio | null): SiteConfig {
  const portfolioBrandName = portfolio?.brandName ?? portfolio?.ownerName ?? siteConfig.brandName;
  const portfolioTitle = portfolio?.title ?? siteConfig.appTitle;

  if (!settings) {
    return {
      ...siteConfig,
      brandName: portfolioBrandName,
      appTitle: portfolioTitle,
      initialConsoleOutput: isDefaultPortfolio(portfolio)
        ? siteConfig.initialConsoleOutput
        : `${portfolioBrandName} content pending. CMS portfolio shell ready.`,
      commandPrompt: {
        ...siteConfig.commandPrompt,
        userHost: portfolio ? `${portfolio.slug}@${portfolioBrandName}` : siteConfig.commandPrompt.userHost,
      },
    };
  }

  const defaultSection = settings.default_section ? normalizeSectionId(settings.default_section) : null;

  return {
    ...siteConfig,
    brandName: normalizeString(settings.brand_name, portfolioBrandName),
    appTitle: normalizeString(settings.app_title, portfolioTitle),
    version: normalizeString(settings.version_label, siteConfig.version),
    status: normalizeString(settings.status_label, siteConfig.status),
    defaultActiveSection: defaultSection ?? siteConfig.defaultActiveSection,
    commandPrompt: {
      ...siteConfig.commandPrompt,
      userHost: normalizeString(settings.command_prompt_prefix, siteConfig.commandPrompt.userHost),
    },
    statusBar: {
      ...siteConfig.statusBar,
      mode: normalizeString(settings.mode_label, siteConfig.statusBar.mode),
      availability: normalizeString(settings.availability_label, siteConfig.statusBar.availability),
    },
    initialConsoleOutput: normalizeString(settings.footer_text, siteConfig.initialConsoleOutput),
  };
}

function normalizeNavigationItems(items: CmsNavigationItem[], portfolio: Portfolio | null): NavigationItem[] {
  if (items.length === 0) {
    return isDefaultPortfolio(portfolio) ? navigationItems : [];
  }

  return items.flatMap((item) => {
    const sectionId = normalizeSectionId(item.section_id);

    if (!sectionId) {
      return [];
    }

    const localItem = navigationItems.find((navigationItem) => navigationItem.id === sectionId);

    return {
      id: sectionId,
      label: item.label,
      module: normalizeString(item.system_label),
      command: normalizeString(item.command),
      icon: normalizeNavigationIcon(item.icon, localItem?.icon ?? 'user'),
      order: item.order_index ?? 0,
      visible: item.is_visible ?? true,
      visibility: 'public' as const,
    };
  });
}

function normalizeProfileData(profile: CmsProfile | null, portfolio: Portfolio | null): ProfileData {
  if (!profile) {
    if (!isDefaultPortfolio(portfolio)) {
      return {
        ...profileData,
        eyebrow: 'portfolio.content / pending',
        headline: `${portfolio?.ownerName ?? 'Portfolio'} content pending`,
        subheadline: 'This portfolio exists in the shared CMS foundation. Public content has not been seeded yet.',
        identityRows: [
          { label: 'NAME', value: portfolio?.ownerName ?? 'Pending' },
          { label: 'ROLE', value: 'Pending' },
          { label: 'MODE', value: 'CMS Foundation' },
          { label: 'FOCUS', value: 'Portfolio setup' },
        ],
        nowBuilding: ['Portfolio content model', 'Owner-scoped CMS access'],
      };
    }

    return profileData;
  }

  const coreStack = getProfileCoreStack(profile);
  const nowBuilding = isStringArray(coreStack.now_building) ? coreStack.now_building : profileData.nowBuilding;
  const terminalLines = isLabelValueArray(profile.terminal_lines) ? profile.terminal_lines : profileData.identityRows;

  return {
    ...profileData,
    eyebrow: normalizeString(profile.intro_line, profileData.eyebrow),
    headline: normalizeString(profile.headline, profileData.headline),
    subheadline: normalizeString(profile.subheadline, profileData.subheadline),
    identityRows: terminalLines,
    nowBuilding,
    ctas: [
      { ...profileData.ctas[0], label: normalizeString(profile.cta_primary_label, profileData.ctas[0].label) },
      { ...profileData.ctas[1], label: normalizeString(profile.cta_secondary_label, profileData.ctas[1].label) },
      { ...profileData.ctas[2], label: normalizeString(profile.cta_contact_label, profileData.ctas[2].label) },
    ],
  };
}

function normalizeProjectsData(rows: CmsProject[], portfolio: Portfolio | null): ProjectsData {
  if (rows.length === 0) {
    return isDefaultPortfolio(portfolio)
      ? projectsData
      : {
          ...projectsData,
          projects: [],
        };
  }

  const projects = rows.map((row): Project => {
    const localProject = projectsData.projects.find((project) => project.slug === row.slug);
    const stack = isStringArray(row.stack) ? row.stack : localProject?.stack ?? [];

    return {
      title: row.title,
      slug: row.slug,
      role: normalizeString(row.role, localProject?.role),
      description: normalizeString(row.short_description, localProject?.description),
      stack,
      category: localProject?.category ?? normalizeProjectCategory(row.category),
      access: normalizeString(row.outcome, localProject?.access),
      featured: row.is_featured ?? false,
      status: localProject?.status ?? (row.is_private ? 'private' : 'selected-notes'),
      order: row.order_index ?? localProject?.order ?? 0,
      visibility: 'public',
    };
  });

  return {
    ...projectsData,
    projects,
  };
}

function normalizeSkillsData(rows: CmsSkill[], portfolio: Portfolio | null): SkillsData {
  if (rows.length === 0) {
    return isDefaultPortfolio(portfolio)
      ? skillsData
      : {
          ...skillsData,
          groups: [],
        };
  }

  const groups = skillsData.groups.map((group): SkillGroup => {
    const skills = rows
      .filter((row) => row.category === group.category)
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map((row) => row.name);

    return {
      ...group,
      skills: skills.length > 0 ? skills : group.skills,
    };
  });

  const knownCategories = new Set(groups.map((group) => group.category));
  const extraGroups = rows
    .filter((row) => !knownCategories.has(row.category))
    .reduce<SkillGroup[]>((accumulator, row) => {
      const group = accumulator.find((item) => item.category === row.category);

      if (group) {
        group.skills.push(row.name);
        return accumulator;
      }

      accumulator.push({
        category: row.category,
        path: `/${row.category.toLowerCase().replaceAll(' ', '-')}`,
        accent: '#00ff88',
        skills: [row.name],
        order: skillsData.groups.length + accumulator.length + 1,
      });

      return accumulator;
    }, []);

  return {
    ...skillsData,
    groups: [...groups, ...extraGroups],
  };
}

function normalizeExperienceData(rows: CmsExperience[], portfolio: Portfolio | null): ExperienceData {
  if (rows.length === 0) {
    return isDefaultPortfolio(portfolio)
      ? experienceData
      : {
          ...experienceData,
          entries: [],
        };
  }

  const entries = rows.map((row): ExperienceEntry => {
    const localEntry = experienceData.entries.find((entry) => entry.title === row.title);

    return {
      stage: normalizeString(row.stage_label, localEntry?.stage),
      title: row.title,
      period: normalizeString(row.period, localEntry?.period),
      description: normalizeString(row.description, localEntry?.description),
      achievements: isStringArray(row.achievements) ? row.achievements : localEntry?.achievements ?? [],
      order: row.order_index ?? localEntry?.order ?? 0,
    };
  });

  return {
    ...experienceData,
    entries,
  };
}

function normalizeCapabilitiesData(rows: CmsCapability[], portfolio: Portfolio | null): CapabilitiesData {
  if (rows.length === 0) {
    return isDefaultPortfolio(portfolio)
      ? capabilitiesData
      : {
          ...capabilitiesData,
          items: [],
        };
  }

  const items = rows.map((row): Capability => {
    const localItem = capabilitiesData.items.find((item) => item.title === row.title);

    return {
      title: row.title,
      description: normalizeString(row.description, localItem?.description),
      signal: localItem?.signal ?? '',
      order: row.order_index ?? localItem?.order ?? 0,
    };
  });

  return {
    ...capabilitiesData,
    items,
  };
}

function normalizeProcessData(rows: CmsProcessStep[], portfolio: Portfolio | null): ProcessData {
  if (rows.length === 0) {
    return isDefaultPortfolio(portfolio)
      ? processData
      : {
          ...processData,
          stages: [],
        };
  }

  const stages = rows.map((row): ProcessStep => ({
    title: row.title,
    order: row.order_index ?? 0,
  }));

  return {
    ...processData,
    stages,
  };
}

function normalizeContactData(rows: CmsContactLink[], portfolio: Portfolio | null): ContactData {
  if (rows.length === 0) {
    return isDefaultPortfolio(portfolio)
      ? contactData
      : {
          ...contactData,
          availability: [],
          collaborationSignals: [],
          links: [],
        };
  }

  const links = rows.map((row): ContactLink => {
    const localLink = contactData.links.find((link) => link.label === row.label);

    return {
      label: row.label,
      text: localLink?.text ?? row.url,
      href: row.url,
      variant: localLink?.variant ?? 'green',
    };
  });

  const localOnlyLinks = contactData.links.filter((link) => !link.href);

  return {
    ...contactData,
    links: [...links, ...localOnlyLinks],
  };
}
