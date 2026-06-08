import { getContentSource } from '@/lib/cms/content-source';
import {
  getLocalCapabilitiesData,
  getLocalContactData,
  getLocalExperienceData,
  getLocalNavigationData,
  getLocalPortfolioData,
  getLocalProcessData,
  getLocalProfileData,
  getLocalProjectsData,
  getLocalResumeData,
  getLocalSiteConfigData,
  getLocalSkillsData,
} from '@/lib/cms/local-adapter';
import {
  getSupabaseCapabilitiesData,
  getSupabaseContactData,
  getSupabaseExperienceData,
  getSupabaseNavigationData,
  getSupabasePortfolioData,
  getSupabaseProcessData,
  getSupabaseProfileData,
  getSupabaseProjectsData,
  getSupabaseResumeData,
  getSupabaseSiteConfigData,
  getSupabaseSkillsData,
} from '@/lib/cms/supabase-adapter';
import type {
  CapabilitiesData,
  ContactData,
  ExperienceData,
  NavigationData,
  PortfolioData,
  PortfolioQueryOptions,
  ProcessData,
  ProfileData,
  ProjectsData,
  ResumeData,
  SiteConfig,
  SkillsData,
} from '@/types/portfolio';

function warnSupabaseFallback(scope: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`CONTENT_SOURCE=supabase failed for ${scope}. Falling back to local content. ${message}`);
}

async function withContentSource<T>(scope: string, localGetter: () => Promise<T>, supabaseGetter: () => Promise<T>): Promise<T> {
  if (getContentSource() === 'local') {
    return localGetter();
  }

  try {
    return await supabaseGetter();
  } catch (error) {
    warnSupabaseFallback(scope, error);
    return localGetter();
  }
}

export async function getSiteConfigData(options?: PortfolioQueryOptions): Promise<SiteConfig> {
  return withContentSource('site settings', () => getLocalSiteConfigData(options), () => getSupabaseSiteConfigData(options));
}

export async function getNavigationData(options?: PortfolioQueryOptions): Promise<NavigationData> {
  return withContentSource('navigation', () => getLocalNavigationData(options), () => getSupabaseNavigationData(options));
}

export async function getProfileData(options?: PortfolioQueryOptions): Promise<ProfileData> {
  return withContentSource('profile', () => getLocalProfileData(options), () => getSupabaseProfileData(options));
}

export async function getProjectsData(options?: PortfolioQueryOptions): Promise<ProjectsData> {
  return withContentSource('projects', () => getLocalProjectsData(options), () => getSupabaseProjectsData(options));
}

export async function getSkillsData(options?: PortfolioQueryOptions): Promise<SkillsData> {
  return withContentSource('skills', () => getLocalSkillsData(options), () => getSupabaseSkillsData(options));
}

export async function getExperienceData(options?: PortfolioQueryOptions): Promise<ExperienceData> {
  return withContentSource('experience', () => getLocalExperienceData(options), () => getSupabaseExperienceData(options));
}

export async function getCapabilitiesData(options?: PortfolioQueryOptions): Promise<CapabilitiesData> {
  return withContentSource('capabilities', () => getLocalCapabilitiesData(options), () => getSupabaseCapabilitiesData(options));
}

export async function getProcessData(options?: PortfolioQueryOptions): Promise<ProcessData> {
  return withContentSource('process', () => getLocalProcessData(options), () => getSupabaseProcessData(options));
}

export async function getContactData(options?: PortfolioQueryOptions): Promise<ContactData> {
  return withContentSource('contact', () => getLocalContactData(options), () => getSupabaseContactData(options));
}

export async function getResumeData(options?: PortfolioQueryOptions): Promise<ResumeData> {
  return withContentSource('resume', () => getLocalResumeData(options), () => getSupabaseResumeData(options));
}

export async function getPortfolioData(options?: PortfolioQueryOptions): Promise<PortfolioData> {
  return withContentSource('portfolio', () => getLocalPortfolioData(options), () => getSupabasePortfolioData(options));
}
