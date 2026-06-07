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

export async function getSiteConfigData(): Promise<SiteConfig> {
  return withContentSource('site settings', getLocalSiteConfigData, getSupabaseSiteConfigData);
}

export async function getNavigationData(): Promise<NavigationData> {
  return withContentSource('navigation', getLocalNavigationData, getSupabaseNavigationData);
}

export async function getProfileData(): Promise<ProfileData> {
  return withContentSource('profile', getLocalProfileData, getSupabaseProfileData);
}

export async function getProjectsData(): Promise<ProjectsData> {
  return withContentSource('projects', getLocalProjectsData, getSupabaseProjectsData);
}

export async function getSkillsData(): Promise<SkillsData> {
  return withContentSource('skills', getLocalSkillsData, getSupabaseSkillsData);
}

export async function getExperienceData(): Promise<ExperienceData> {
  return withContentSource('experience', getLocalExperienceData, getSupabaseExperienceData);
}

export async function getCapabilitiesData(): Promise<CapabilitiesData> {
  return withContentSource('capabilities', getLocalCapabilitiesData, getSupabaseCapabilitiesData);
}

export async function getProcessData(): Promise<ProcessData> {
  return withContentSource('process', getLocalProcessData, getSupabaseProcessData);
}

export async function getContactData(): Promise<ContactData> {
  return withContentSource('contact', getLocalContactData, getSupabaseContactData);
}

export async function getResumeData(): Promise<ResumeData> {
  return withContentSource('resume', getLocalResumeData, getSupabaseResumeData);
}

export async function getPortfolioData(): Promise<PortfolioData> {
  return withContentSource('portfolio', getLocalPortfolioData, getSupabasePortfolioData);
}
