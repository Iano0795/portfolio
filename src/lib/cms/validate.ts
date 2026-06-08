import {
  getActiveResume,
  getCapabilities,
  getContactLinks,
  getExperience,
  getNavigationItems,
  getProcessSteps,
  getProfile,
  getProjects,
  getSiteSettings,
  getSkills,
} from '@/lib/cms/queries';
import type { PortfolioQueryOptions } from '@/types/portfolio';

export type CmsValidationResult = {
  profileFound: boolean;
  projectCount: number;
  skillCount: number;
  experienceCount: number;
  capabilityCount: number;
  processStepCount: number;
  contactLinkCount: number;
  siteSettingsFound: boolean;
  navigationItemCount: number;
  activeResumeFound: boolean;
};

export async function validateCmsQueries(options?: PortfolioQueryOptions): Promise<CmsValidationResult> {
  const [
    profile,
    projects,
    skills,
    experience,
    capabilities,
    processSteps,
    contactLinks,
    siteSettings,
    navigationItems,
    activeResume,
  ] = await Promise.all([
    getProfile(options),
    getProjects(options),
    getSkills(options),
    getExperience(options),
    getCapabilities(options),
    getProcessSteps(options),
    getContactLinks(options),
    getSiteSettings(options),
    getNavigationItems(options),
    getActiveResume(options),
  ]);

  return {
    profileFound: Boolean(profile),
    projectCount: projects.length,
    skillCount: skills.length,
    experienceCount: experience.length,
    capabilityCount: capabilities.length,
    processStepCount: processSteps.length,
    contactLinkCount: contactLinks.length,
    siteSettingsFound: Boolean(siteSettings),
    navigationItemCount: navigationItems.length,
    activeResumeFound: Boolean(activeResume),
  };
}
