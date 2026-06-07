'use client';

import { useEffect, useState } from 'react';
import type { QuickCommand, Section, SectionConfig } from '@/types/portfolio';
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

const sections: SectionConfig[] = [
  { id: 'profile', label: 'Profile', module: 'identity.sys', command: 'cat /profile/identity.sys' },
  { id: 'about', label: 'About', module: 'origin.log', command: 'tail /logs/origin.log' },
  { id: 'capabilities', label: 'Capabilities', module: 'capabilities.map', command: 'open /maps/capabilities.map' },
  { id: 'skills', label: 'Skills', module: 'toolchain.bin', command: 'scan /bin/toolchain.bin' },
  { id: 'projects', label: 'Projects', module: 'builds/', command: 'ls /builds/' },
  { id: 'process', label: 'Process', module: 'process.pipeline', command: 'run /pipelines/process.pipeline' },
  { id: 'experience', label: 'Experience', module: 'career.log', command: 'tail -f /logs/career.log' },
  { id: 'contact', label: 'Contact', module: 'connect.sh', command: './connect.sh' },
];

const quickCommands: QuickCommand[] = [
  { command: 'help', output: 'modules: identity, origin, capabilities, toolchain, builds, process, career, connect' },
  { command: 'whoami', target: 'profile', output: 'Ian Kipkorir / full-stack engineer / solutions architect' },
  { command: 'open builds', target: 'projects', output: 'Opening proof-of-work index...' },
  { command: 'open toolchain', target: 'skills', output: 'Loading layered engineering toolchain...' },
  { command: 'open career', target: 'experience', output: 'Streaming career growth stages...' },
  { command: 'download cv', output: 'CV artifact is not attached in this build. Use connect.sh to request it.' },
  { command: 'contact', target: 'contact', output: 'Opening secure collaboration channel...' },
];

export function PortfolioShell() {
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [booted, setBooted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [loadingModule, setLoadingModule] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('IanOS ready. Type help or switch a module.');

  const activeConfig = sections.find((section) => section.id === activeSection) ?? sections[0];

  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSectionChange = (section: Section, output?: string) => {
    if (output) {
      setConsoleOutput(output);
    }

    if (section === activeSection) {
      return;
    }

    const nextModule = sections.find((item) => item.id === section)?.module ?? section;
    setTransitioning(true);
    setLoadingModule(true);
    setConsoleOutput(output ?? `Loading ${nextModule}...`);

    setTimeout(() => {
      setActiveSection(section);
      setLoadingModule(false);
    }, 260);

    setTimeout(() => {
      setTransitioning(false);
      setConsoleOutput(`Mounted ${nextModule}.`);
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

  const handleMobileSectionChange = (section: Section) => {
    handleSectionChange(section);
    setMobileMenuOpen(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <ProfileSection
            onNavigate={handleSectionChange}
            onDownloadCv={() => setConsoleOutput('CV artifact is not attached in this build. Use connect.sh to request it.')}
          />
        );
      case 'about':
        return <AboutSection />;
      case 'capabilities':
        return <CapabilitiesSection />;
      case 'skills':
        return <SkillsSection />;
      case 'projects':
        return <ProjectsSection />;
      case 'process':
        return <ProcessSection />;
      case 'experience':
        return <ExperienceSection />;
      case 'contact':
        return <ContactSection />;
      default:
        return <ProfileSection onNavigate={handleSectionChange} onDownloadCv={() => undefined} />;
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
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeSection={activeSection}
          booted={booted}
          quickCommands={quickCommands}
          sections={sections}
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
          transitioning={transitioning}
        >
          {renderSection()}
        </MainPanel>
      </div>

      <StatusBar booted={booted} consoleOutput={consoleOutput} />
    </div>
  );
}
