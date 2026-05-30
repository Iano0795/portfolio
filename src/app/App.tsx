import { useEffect, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { CapabilitiesSection } from './components/CapabilitiesSection';
import { ContactSection } from './components/ContactSection';
import { ExperienceSection } from './components/ExperienceSection';
import { ProcessSection } from './components/ProcessSection';
import { ProfileSection } from './components/ProfileSection';
import { ProjectsSection } from './components/ProjectsSection';
import { SkillsSection } from './components/SkillsSection';

type Section =
  | 'profile'
  | 'about'
  | 'capabilities'
  | 'skills'
  | 'projects'
  | 'process'
  | 'experience'
  | 'contact';

type SectionConfig = {
  id: Section;
  label: string;
  module: string;
  command: string;
};

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

const quickCommands = [
  { command: 'help', output: 'modules: identity, origin, capabilities, toolchain, builds, process, career, connect' },
  { command: 'whoami', target: 'profile' as Section, output: 'Ian Kipkorir / full-stack engineer / solutions architect' },
  { command: 'open builds', target: 'projects' as Section, output: 'Opening proof-of-work index...' },
  { command: 'open toolchain', target: 'skills' as Section, output: 'Loading layered engineering toolchain...' },
  { command: 'open career', target: 'experience' as Section, output: 'Streaming career growth stages...' },
  { command: 'download cv', output: 'CV artifact is not attached in this build. Use connect.sh to request it.' },
  { command: 'contact', target: 'contact' as Section, output: 'Opening secure collaboration channel...' },
];

export default function App() {
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

  const runQuickCommand = (item: (typeof quickCommands)[number]) => {
    if (item.target) {
      handleSectionChange(item.target, item.output);
      setMobileMenuOpen(false);
      return;
    }

    setConsoleOutput(item.output);
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

      <div
        className={`h-12 bg-[#090d16]/95 border-b border-[#00ff88]/20 flex items-center justify-between px-4 flex-shrink-0 shadow-[0_0_24px_rgba(0,255,136,0.08)] transition-all duration-500 ${
          booted ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex gap-2" aria-hidden="true">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.45)]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.45)]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.45)]" />
          </div>
          <div className="font-mono">
            <div className="text-sm text-[#00ff88] leading-none">IanOS</div>
            <div className="text-[10px] text-gray-500 hidden sm:block">personal operating system</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 font-mono text-xs">
          <span className="px-2 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]">ONLINE</span>
          <span className="text-gray-500">kernel v2.6</span>
          <span className="text-cyan-400">MODULE: {activeConfig.module}</span>
        </div>

        <button
          className="md:hidden text-[#00ff88] font-mono text-sm border border-[#00ff88]/30 px-3 py-1"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '[CLOSE]' : '[MENU]'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`hidden md:flex w-72 bg-[#090d16]/95 border-r border-[#00ff88]/20 flex-col shadow-[0_0_20px_rgba(0,255,136,0.04)] transition-all duration-500 delay-150 ${
            booted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
          }`}
        >
          <div className="p-3 border-b border-[#00ff88]/10">
            <div className="font-mono text-xs text-gray-500 mb-2">/SYSTEM MODULES</div>
            <div className="text-xs text-gray-400 leading-relaxed">
              Switch modules from requirement to secure platform delivery.
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {sections.map((section, index) => {
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`w-full text-left px-3 py-2 font-mono text-sm transition-all duration-200 group border ${
                    active
                      ? 'bg-[#00ff88]/10 border-[#00ff88]/45 text-[#00ff88] shadow-[inset_3px_0_0_#00ff88,0_0_16px_rgba(0,255,136,0.12)]'
                      : 'text-gray-400 bg-[#050812]/30 border-transparent hover:text-[#00ff88] hover:bg-[#00ff88]/5 hover:border-[#00ff88]/20'
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <span className={active ? 'text-cyan-400' : 'text-gray-600 group-hover:text-cyan-400'}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] leading-tight">{section.label}</span>
                      <span className={`block text-[11px] leading-tight mt-1 ${active ? 'text-cyan-300' : 'text-gray-600 group-hover:text-gray-400'}`}>
                        /{section.module}
                      </span>
                    </span>
                    {active && <span className="ml-auto text-[10px] text-[#00ff88]">RUN</span>}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="m-3 border border-cyan-400/20 bg-[#050812]/70">
            <div className="flex items-center justify-between border-b border-cyan-400/10 px-3 py-2 font-mono text-[11px]">
              <span className="text-cyan-400">command.palette</span>
              <span className="text-gray-600">visible actions</span>
            </div>
            <div className="p-2 grid grid-cols-2 gap-1">
              {quickCommands.map((item) => (
                <button
                  key={item.command}
                  onClick={() => runQuickCommand(item)}
                  className="font-mono text-left text-[11px] text-gray-400 hover:text-[#00ff88] hover:bg-[#00ff88]/5 px-2 py-1.5 border border-transparent hover:border-[#00ff88]/20 transition-colors"
                >
                  <span className="text-cyan-500">$</span> {item.command}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-12 left-0 right-0 bg-[#090d16] border-b border-[#00ff88]/20 z-40 shadow-lg">
            <nav className="p-3 grid gap-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    handleSectionChange(section.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 font-mono text-sm transition-all border ${
                    activeSection === section.id
                      ? 'bg-[#00ff88]/10 border-[#00ff88]/40 text-[#00ff88]'
                      : 'text-gray-400 hover:text-[#00ff88] hover:bg-[#00ff88]/5 border-transparent'
                  }`}
                >
                  {section.label} <span className="text-gray-600">/ {section.module}</span>
                </button>
              ))}
            </nav>
            <div className="px-3 pb-3 flex flex-wrap gap-2">
              {quickCommands.map((item) => (
                <button
                  key={item.command}
                  onClick={() => runQuickCommand(item)}
                  className="font-mono text-[11px] text-cyan-300 border border-cyan-400/20 px-2 py-1 bg-cyan-400/5"
                >
                  {item.command}
                </button>
              ))}
            </div>
          </div>
        )}

        <main
          className={`min-w-0 flex-1 flex flex-col overflow-hidden transition-all duration-500 delay-300 ${
            booted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
        >
          <div className="h-11 flex items-center justify-between px-4 md:px-6 border-b border-[#00ff88]/10 bg-[#070b13]/70 font-mono text-xs flex-shrink-0">
            <div className="text-gray-500 truncate">
              <span className="text-[#00ff88]">ian@IanOS</span>:<span className="text-cyan-400">~</span>$ {activeConfig.command}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-gray-600">
              <span>secure-build-mode</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-7 relative">
            {loadingModule && (
              <div className="absolute inset-0 flex items-start justify-center pt-20 bg-[#050812]/82 backdrop-blur-sm z-40">
                <div className="font-mono text-sm text-[#00ff88] border border-[#00ff88]/25 bg-[#050812] px-5 py-4 shadow-[0_0_24px_rgba(0,255,136,0.12)]">
                  Loading {activeConfig.module}... <span className="animate-pulse">[OK]</span>
                </div>
              </div>
            )}

            <div
              className={`transition-all duration-300 ${
                transitioning ? 'opacity-0 translate-y-3 blur-sm' : 'opacity-100 translate-y-0 blur-0'
              }`}
            >
              {renderSection()}
            </div>
          </div>
        </main>
      </div>

      <div
        className={`min-h-8 bg-[#090d16]/95 border-t border-[#00ff88]/20 flex items-center justify-between gap-3 px-4 font-mono text-xs flex-shrink-0 shadow-[0_0_18px_rgba(0,255,136,0.08)] transition-all duration-500 delay-[450ms] ${
          booted ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 py-1">
          <span className="text-gray-500">stdout:</span>
          <span className="text-cyan-300 truncate">{consoleOutput}</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 py-1">
          <span className="text-gray-500">mode:</span>
          <span className="text-[#00ff88]">solutions-architecture</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-500">availability:</span>
          <span className="text-cyan-400">selected opportunities</span>
        </div>
      </div>
    </div>
  );
}
