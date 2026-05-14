import { useState, useEffect } from 'react';
import { ProfileSection } from './components/ProfileSection';
import { AboutSection } from './components/AboutSection';
import { SkillsSection } from './components/SkillsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { ContactSection } from './components/ContactSection';

type Section = 'profile' | 'about' | 'skills' | 'projects' | 'experience' | 'contact';

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [booted, setBooted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [loadingModule, setLoadingModule] = useState(false);

  const sections: { id: Section; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'contact', label: 'Contact' },
  ];

  // Boot sequence
  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle section change with transition
  const handleSectionChange = (section: Section) => {
    if (section === activeSection) return;

    setTransitioning(true);
    setLoadingModule(true);

    setTimeout(() => {
      setActiveSection(section);
      setLoadingModule(false);
    }, 280);

    setTimeout(() => {
      setTransitioning(false);
    }, 350);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'about':
        return <AboutSection />;
      case 'skills':
        return <SkillsSection />;
      case 'projects':
        return <ProjectsSection />;
      case 'experience':
        return <ExperienceSection />;
      case 'contact':
        return <ContactSection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0e1a] text-gray-200 overflow-hidden relative">
      {/* Animated Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 animate-scanline"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00ff88 2px, #00ff88 4px)' }}
      />

      {/* Animated grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02] animate-grid-move"
        style={{
          backgroundImage: 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* Top Bar */}
      <div
        className={`h-12 bg-[#0d1117] border-b border-[#00ff88]/20 flex items-center justify-between px-4 flex-shrink-0 shadow-[0_0_15px_rgba(0,255,136,0.1)] transition-all duration-500 ${
          booted ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.5)]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.5)]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.5)]" />
          </div>
          <span className="font-mono text-sm text-[#00ff88]">IkOS</span>
        </div>
        <div className="hidden md:flex items-center gap-4 font-mono text-xs">
          <span className="px-2 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]">ONLINE</span>
          <span className="text-gray-500">v1.0</span>
          <span className="text-cyan-400">PORTFOLIO MODE</span>
        </div>
        <button
          className="md:hidden text-[#00ff88] font-mono text-sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '[CLOSE]' : '[MENU]'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation - Desktop */}
        <div
          className={`hidden md:flex w-56 bg-[#0d1117] border-r border-[#00ff88]/20 flex-col shadow-[0_0_15px_rgba(0,255,136,0.05)] transition-all duration-500 delay-150 ${
            booted ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
          }`}
        >
          <div className="p-4 border-b border-[#00ff88]/10">
            <div className="font-mono text-xs text-gray-500 mb-2">NAVIGATION</div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`w-full text-left px-3 py-2 font-mono text-sm transition-all duration-200 group ${
                  activeSection === section.id
                    ? 'bg-[#00ff88]/10 border border-[#00ff88]/40 text-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.2)]'
                    : 'text-gray-400 hover:text-[#00ff88] hover:bg-[#00ff88]/5 hover:translate-x-1 border border-transparent hover:border-[#00ff88]/20'
                }`}
              >
                <span className={`inline-block transition-opacity ${activeSection === section.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  &gt;{' '}
                </span>
                {section.label}
                {activeSection === section.id && <span className="float-right">[ACTIVE]</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-12 left-0 right-0 bg-[#0d1117] border-b border-[#00ff88]/20 z-40 shadow-lg">
            <nav className="p-3 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    handleSectionChange(section.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 font-mono text-sm transition-all ${
                    activeSection === section.id
                      ? 'bg-[#00ff88]/10 border border-[#00ff88]/40 text-[#00ff88]'
                      : 'text-gray-400 hover:text-[#00ff88] hover:bg-[#00ff88]/5 border border-transparent'
                  }`}
                >
                  {activeSection === section.id ? '> ' : '  '}
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Main Content Window */}
        <div
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 delay-300 ${
            booted ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
        >
          <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
            {/* Loading Module */}
            {loadingModule && (
              <div className="absolute inset-0 flex items-start justify-center pt-20 bg-[#0a0e1a]/80 backdrop-blur-sm z-50">
                <div className="font-mono text-sm text-[#00ff88]">
                  Loading {activeSection}.module... <span className="animate-pulse">[OK]</span>
                </div>
              </div>
            )}

            {/* Content with transition */}
            <div
              className={`transition-all duration-300 ${
                transitioning
                  ? 'opacity-0 translate-y-4 blur-sm'
                  : 'opacity-100 translate-y-0 blur-0'
              }`}
            >
              {renderSection()}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div
        className={`h-8 bg-[#0d1117] border-t border-[#00ff88]/20 flex items-center justify-between px-4 font-mono text-xs flex-shrink-0 shadow-[0_0_15px_rgba(0,255,136,0.1)] transition-all duration-500 delay-[450ms] ${
          booted ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="text-gray-500">STATUS:</span>
          <span className="text-cyan-400 transition-all duration-200">
            Viewing {sections.find(s => s.id === activeSection)?.label}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="text-gray-500">MODE:</span>
          <span className="text-[#00ff88]">Portfolio</span>
          <span className="text-gray-500 mx-2">|</span>
          <span className="text-gray-500">AVAILABILITY:</span>
          <span className="text-cyan-400">Open to selected opportunities</span>
        </div>
      </div>
    </div>
  );
}