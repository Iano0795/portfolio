import { capabilitiesData } from '@/data/capabilities';
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

export async function getLocalSiteConfigData(): Promise<SiteConfig> {
  return siteConfig;
}

export async function getLocalNavigationData(): Promise<NavigationData> {
  return {
    items: navigationItems,
    quickCommands,
  };
}

export async function getLocalProfileData(): Promise<ProfileData> {
  return profileData;
}

export async function getLocalAboutData(): Promise<AboutData> {
  return aboutData;
}

export async function getLocalProjectsData(): Promise<ProjectsData> {
  return projectsData;
}

export async function getLocalSkillsData(): Promise<SkillsData> {
  return skillsData;
}

export async function getLocalExperienceData(): Promise<ExperienceData> {
  return experienceData;
}

export async function getLocalCapabilitiesData(): Promise<CapabilitiesData> {
  return capabilitiesData;
}

export async function getLocalProcessData(): Promise<ProcessData> {
  return processData;
}

export async function getLocalContactData(): Promise<ContactData> {
  return contactData;
}

export async function getLocalResumeData(): Promise<ResumeData> {
  return null;
}

export async function getLocalPortfolioData(): Promise<PortfolioData> {
  const [site, navigation, profile, about, projects, skills, experience, capabilities, process, contact, resume] =
    await Promise.all([
      getLocalSiteConfigData(),
      getLocalNavigationData(),
      getLocalProfileData(),
      getLocalAboutData(),
      getLocalProjectsData(),
      getLocalSkillsData(),
      getLocalExperienceData(),
      getLocalCapabilitiesData(),
      getLocalProcessData(),
      getLocalContactData(),
      getLocalResumeData(),
    ]);

  return {
    site,
    navigation,
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
