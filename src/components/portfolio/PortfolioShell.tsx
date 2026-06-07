'use client';

import { useEffect, useState } from 'react';
import { capabilitiesData } from '@/data/capabilities';
import { contactData } from '@/data/contact';
import { experienceData } from '@/data/experience';
import { navigationItems, quickCommands } from '@/data/navigation';
import { processData } from '@/data/process';
import { aboutData, profileData } from '@/data/profile';
import { projectsData } from '@/data/projects';
import { siteConfig } from '@/data/site';
import { skillsData } from '@/data/skills';
import type { QuickCommand, SectionId } from '@/types/portfolio';
import { AboutSection } from '@/components/sections/AboutSection';
import { CapabilitiesSection } from '@/components/sections/CapabilitiesSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { ProfileSection } from '@/components/sections/ProfileSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { MainPanel } from './MainPanel';
import { MobileNavigation } from './MobileNavigation';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { TopBar } from './TopBar';

const sections = navigationItems;

export function PortfolioShell() {
  const [activeSection, setActiveSection] = useState<SectionId>(siteConfig.defaultActiveSection);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [booted, setBooted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [loadingModule, setLoadingModule] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState(siteConfig.initialConsoleOutput);

  const activeConfig = sections.find((section) => section.id === activeSection) ?? sections[0];

  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSectionChange = (section: SectionId, output?: string) => {
    if (output) {
      setConsoleOutput(output);
    }

    if (section === activeSection) {
      return;
    }

    const nextModule = sections.find((item) => item.id === section)?.module ?? section;
    setTransitioning(true);
    setLoadingModule(true);
    setConsoleOutput(output ?? `${siteConfig.loadingPrefix} ${nextModule}...`);

    setTimeout(() => {
      setActiveSection(section);
      setLoadingModule(false);
    }, 260);

    setTimeout(() => {
      setTransitioning(false);
      setConsoleOutput(`${siteConfig.mountedConsolePrefix} ${nextModule}.`);
    }, 420);
  };

  const runQuickCommand = (item: QuickCommand) => {
    if (item.target) {
      handleSectionChange(item.target, item.output);
      setMobileMenuOpen(false);
      return;
    }

    setConsoleOutput(item.output);
  };

  const handleMobileSectionChange = (section: SectionId) => {
    handleSectionChange(section);
    setMobileMenuOpen(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <ProfileSection
            data={profileData}
            onNavigate={handleSectionChange}
            onDownloadCv={() => setConsoleOutput(siteConfig.messages.cvUnavailable)}
          />
        );
      case 'about':
        return <AboutSection data={aboutData} />;
      case 'capabilities':
        return <CapabilitiesSection data={capabilitiesData} />;
      case 'skills':
        return <SkillsSection data={skillsData} />;
      case 'projects':
        return <ProjectsSection data={projectsData} />;
      case 'process':
        return <ProcessSection data={processData} />;
      case 'experience':
        return <ExperienceSection data={experienceData} />;
      case 'contact':
        return <ContactSection data={contactData} />;
      default:
        return <ProfileSection data={profileData} onNavigate={handleSectionChange} onDownloadCv={() => undefined} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#050812] text-gray-200 overflow-hidden relative selection:bg-[#00ff88]/20 selection:text-[#eafff5]">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] z-50 animate-scanline"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00ff88 2px, #00ff88 4px)' }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] animate-grid-move"
        style={{
          backgroundImage: 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00d9ff 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <TopBar
        activeModule={activeConfig.module}
        booted={booted}
        mobileMenuOpen={mobileMenuOpen}
        site={siteConfig}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeSection={activeSection}
          booted={booted}
          quickCommands={quickCommands}
          sections={sections}
          site={siteConfig}
          onQuickCommand={runQuickCommand}
          onSectionChange={handleSectionChange}
        />

        {mobileMenuOpen && (
          <MobileNavigation
            activeSection={activeSection}
            quickCommands={quickCommands}
            sections={sections}
            onQuickCommand={runQuickCommand}
            onSectionChange={handleMobileSectionChange}
          />
        )}

        <MainPanel
          activeConfig={activeConfig}
          booted={booted}
          loadingModule={loadingModule}
          site={siteConfig}
          transitioning={transitioning}
        >
          {renderSection()}
        </MainPanel>
      </div>

      <StatusBar booted={booted} consoleOutput={consoleOutput} site={siteConfig} />
    </div>
  );
}
