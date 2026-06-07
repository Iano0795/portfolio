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

export async function validateCmsQueries(): Promise<CmsValidationResult> {
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
    getProfile(),
    getProjects(),
    getSkills(),
    getExperience(),
    getCapabilities(),
    getProcessSteps(),
    getContactLinks(),
    getSiteSettings(),
    getNavigationItems(),
    getActiveResume(),
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
