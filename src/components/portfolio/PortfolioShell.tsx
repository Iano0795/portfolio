'use client';

import type { CSSProperties } from 'react';
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
import { WriteupsSection } from '@/components/sections/WriteupsSection';
import { MainPanel } from './MainPanel';
import { MobileNavigation } from './MobileNavigation';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { TopBar } from './TopBar';

type PortfolioShellProps = {
  portfolioData: PortfolioData;
};

function getFontFamily(fontMode: PortfolioData['site']['theme']['fontMode']) {
  switch (fontMode) {
    case 'system':
      return 'ui-sans-serif, system-ui, sans-serif';
    case 'readable':
      return 'var(--font-display), ui-sans-serif, system-ui, sans-serif';
    case 'mono':
      return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    case 'retro':
    default:
      return 'var(--font-terminal), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  }
}

export function PortfolioShell({ portfolioData }: PortfolioShellProps) {
  const sections = portfolioData.navigation.items;
  const site = portfolioData.site;
  const theme = site.theme;
  const [activeSection, setActiveSection] = useState<SectionId>(site.defaultActiveSection);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [booted, setBooted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [loadingModule, setLoadingModule] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState(site.initialConsoleOutput);

  const activeConfig = sections.find((section) => section.id === activeSection) ?? sections[0];
  const animationDuration = `${Math.max(8, 60 - theme.animationIntensity * 0.45)}s`;
  const themeStyle = {
    '--portfolio-primary': theme.primary,
    '--portfolio-secondary': theme.secondary,
    '--portfolio-background': theme.background,
    '--portfolio-panel': theme.panel,
    '--portfolio-foreground': theme.foreground,
    '--portfolio-muted': theme.muted,
    '--portfolio-border': theme.border,
    '--portfolio-glow-intensity': String(theme.glowIntensity),
    backgroundColor: theme.background,
    color: theme.foreground,
    fontFamily: getFontFamily(theme.fontMode),
  } as CSSProperties;

  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const hashSection = window.location.hash.replace('#', '') as SectionId;

    if (sections.some((section) => section.id === hashSection)) {
      setActiveSection(hashSection);
    }
  }, [sections]);

  const handleSectionChange = (section: SectionId, output?: string) => {
    if (output) {
      setConsoleOutput(output);
    }

    if (section === activeSection) {
      return;
    }

    window.history.replaceState(null, '', `#${section}`);

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

  const handleConsoleCommand = (rawCommand: string) => {
    const normalizedCommand = rawCommand.trim().toLowerCase().replace(/\s+/g, ' ');
    const command = portfolioData.console.commands.find((item) => item.command === normalizedCommand);

    if (!command) {
      const missingCommandMessage = `command not found: ${rawCommand.trim()}`;
      setConsoleOutput(missingCommandMessage);
      return [missingCommandMessage, 'Type "help" to list available commands.'];
    }

    if (command.action === 'showHelp') {
      setConsoleOutput('Available commands loaded.');
      return [command.output, ...portfolioData.console.suggestions.map((suggestion) => `- ${suggestion}`)];
    }

    if (command.action === 'downloadCv') {
      if (portfolioData.resume?.fileUrl) {
        window.open(portfolioData.resume.fileUrl, '_blank', 'noopener,noreferrer');
        const resumeMessage = `Opening ${portfolioData.resume.fileName || 'CV'}...`;
        setConsoleOutput(resumeMessage);
        return [resumeMessage];
      }

      setConsoleOutput(site.messages.cvUnavailable);
      return [site.messages.cvUnavailable];
    }

    if (command.target) {
      handleSectionChange(command.target, command.output);
      setMobileMenuOpen(false);
      return [command.output];
    }

    setConsoleOutput(command.output);
    return [command.output];
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
            data={portfolioData.profile}
            onNavigate={handleSectionChange}
            onDownloadCv={() => setConsoleOutput(site.messages.cvUnavailable)}
          />
        );
      case 'about':
        return <AboutSection data={portfolioData.about} />;
      case 'capabilities':
        return <CapabilitiesSection data={portfolioData.capabilities} />;
      case 'skills':
        return <SkillsSection data={portfolioData.skills} />;
      case 'projects':
        return <ProjectsSection data={portfolioData.projects} />;
      case 'writeups':
        return <WriteupsSection data={portfolioData.writeups} />;
      case 'process':
        return <ProcessSection data={portfolioData.process} />;
      case 'experience':
        return <ExperienceSection data={portfolioData.experience} />;
      case 'contact':
        return <ContactSection data={portfolioData.contact} />;
      default:
        return <ProfileSection data={portfolioData.profile} onNavigate={handleSectionChange} onDownloadCv={() => undefined} />;
    }
  };

  return (
    <div
      className="h-screen flex flex-col bg-[#050812] text-gray-200 overflow-hidden relative selection:bg-[#00ff88]/20 selection:text-[#eafff5]"
      style={themeStyle}
    >
      {theme.scanlinesEnabled && (
        <div
          className="absolute inset-0 pointer-events-none z-50 animate-scanline"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${theme.primary} 2px, ${theme.primary} 4px)`,
            opacity: Math.max(0.01, theme.glowIntensity / 2000),
            animationDuration,
          }}
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none animate-grid-move"
        style={{
          backgroundImage: `linear-gradient(${theme.primary} 1px, transparent 1px), linear-gradient(90deg, ${theme.secondary} 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
          opacity: Math.max(0, theme.glowIntensity / 2500),
          animationDuration,
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
          quickCommands={portfolioData.navigation.quickCommands}
          sections={sections}
          site={site}
          onQuickCommand={runQuickCommand}
          onSectionChange={handleSectionChange}
        />

        {mobileMenuOpen && (
          <MobileNavigation
            activeSection={activeSection}
            quickCommands={portfolioData.navigation.quickCommands}
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

      <StatusBar booted={booted} consoleOutput={consoleOutput} site={site} onSubmitCommand={handleConsoleCommand} />
    </div>
  );
}
