'use client';

import { useEffect, useState } from 'react';
import type { PortfolioData, QuickCommand, SectionId } from '@/types/portfolio';
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

type PortfolioShellProps = {
  data: PortfolioData;
};

export function PortfolioShell({ data }: PortfolioShellProps) {
  const sections = data.navigation.items;
  const site = data.site;
  const [activeSection, setActiveSection] = useState<SectionId>(site.defaultActiveSection);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [booted, setBooted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [loadingModule, setLoadingModule] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState(site.initialConsoleOutput);

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
    setConsoleOutput(output ?? `${site.loadingPrefix} ${nextModule}...`);

    setTimeout(() => {
      setActiveSection(section);
      setLoadingModule(false);
    }, 260);

    setTimeout(() => {
      setTransitioning(false);
      setConsoleOutput(`${site.mountedConsolePrefix} ${nextModule}.`);
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
            data={data.profile}
            onNavigate={handleSectionChange}
            onDownloadCv={() => setConsoleOutput(site.messages.cvUnavailable)}
          />
        );
      case 'about':
        return <AboutSection data={data.about} />;
      case 'capabilities':
        return <CapabilitiesSection data={data.capabilities} />;
      case 'skills':
        return <SkillsSection data={data.skills} />;
      case 'projects':
        return <ProjectsSection data={data.projects} />;
      case 'process':
        return <ProcessSection data={data.process} />;
      case 'experience':
        return <ExperienceSection data={data.experience} />;
      case 'contact':
        return <ContactSection data={data.contact} />;
      default:
        return <ProfileSection data={data.profile} onNavigate={handleSectionChange} onDownloadCv={() => undefined} />;
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
        site={site}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeSection={activeSection}
          booted={booted}
          quickCommands={data.navigation.quickCommands}
          sections={sections}
          site={site}
          onQuickCommand={runQuickCommand}
          onSectionChange={handleSectionChange}
        />

        {mobileMenuOpen && (
          <MobileNavigation
            activeSection={activeSection}
            quickCommands={data.navigation.quickCommands}
            sections={sections}
            onQuickCommand={runQuickCommand}
            onSectionChange={handleMobileSectionChange}
          />
        )}

        <MainPanel
          activeConfig={activeConfig}
          booted={booted}
          loadingModule={loadingModule}
          site={site}
          transitioning={transitioning}
        >
          {renderSection()}
        </MainPanel>
      </div>

      <StatusBar booted={booted} consoleOutput={consoleOutput} site={site} />
    </div>
  );
}
