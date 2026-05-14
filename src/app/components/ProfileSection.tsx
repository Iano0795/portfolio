import { useState, useEffect } from 'react';

export function ProfileSection() {
  const [showInit, setShowInit] = useState(false);
  const [showHeadline, setShowHeadline] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLines, setTerminalLines] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowInit(true), 100),
      setTimeout(() => setShowHeadline(true), 800),
      setTimeout(() => setShowText(true), 1200),
      setTimeout(() => setShowButtons(true), 1600),
      setTimeout(() => setShowTerminal(true), 2000),
      setTimeout(() => setTerminalLines(1), 2400),
      setTimeout(() => setTerminalLines(2), 2600),
      setTimeout(() => setTerminalLines(3), 2800),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 font-mono text-sm text-gray-500">
        <span className="text-[#00ff88]">guest@ian-os</span>:<span className="text-cyan-400">~</span>$ cat profile.txt
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div
              className={`font-mono text-sm text-[#00ff88] mb-4 transition-all duration-500 ${
                showInit ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
            >
              <span className="text-gray-500">&gt;</span> Initializing Ian Kipkorir... <span className="text-[#27c93f]">[OK]</span>
            </div>

            <h1
              className={`text-4xl font-bold text-white mb-3 transition-all duration-500 ${
                showHeadline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Full-Stack Engineer &<br />Solutions Architect
            </h1>

            <p
              className={`text-lg text-gray-400 leading-relaxed transition-all duration-500 ${
                showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              I design and build enterprise-grade digital platforms, modern web applications,
              and security-aware systems.
            </p>
          </div>

          <div
            className={`flex flex-wrap gap-3 transition-all duration-500 ${
              showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <button className="px-6 py-3 bg-[#00ff88]/10 border border-[#00ff88]/40 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all font-mono text-sm shadow-[0_0_15px_rgba(0,255,136,0.2)]">
              View Projects
            </button>
            <button className="px-6 py-3 bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 hover:bg-cyan-500/20 transition-all font-mono text-sm">
              Download CV
            </button>
            <button className="px-6 py-3 border border-gray-600 text-gray-300 hover:border-[#00ff88]/40 hover:text-[#00ff88] transition-all font-mono text-sm">
              Contact Me
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Terminal Identity Card */}
          <div
            className={`bg-[#0d1117] border border-[#00ff88]/30 p-5 shadow-[0_0_20px_rgba(0,255,136,0.1)] transition-all duration-500 ${
              showTerminal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="font-mono text-sm mb-4 text-gray-500">
              <span className="text-[#00ff88]">guest@ian-os</span>:<span className="text-cyan-400">~</span>$ whoami
            </div>
            <div className="space-y-2 font-mono text-sm">
              <div
                className={`text-gray-400 transition-all duration-300 ${
                  terminalLines >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
              >
                <span className="text-[#00ff88]">&gt;</span> full-stack engineer
              </div>
              <div
                className={`text-gray-400 transition-all duration-300 ${
                  terminalLines >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
              >
                <span className="text-[#00ff88]">&gt;</span> solutions architect
              </div>
              <div
                className={`text-gray-400 transition-all duration-300 ${
                  terminalLines >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
              >
                <span className="text-[#00ff88]">&gt;</span> cybersecurity-focused builder
              </div>
            </div>
          </div>

          {/* Info Widgets */}
          <div className="grid grid-cols-1 gap-3">
            <div
              className={`bg-[#0d1117] border border-cyan-400/30 p-4 transition-all duration-500 delay-100 ${
                showTerminal ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
            >
              <div className="font-mono text-xs text-gray-500 mb-2">CURRENT FOCUS</div>
              <div className="text-cyan-400">Digital platforms</div>
            </div>

            <div
              className={`bg-[#0d1117] border border-[#00ff88]/30 p-4 transition-all duration-500 delay-200 ${
                showTerminal ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
            >
              <div className="font-mono text-xs text-gray-500 mb-2">CORE STACK</div>
              <div className="text-[#00ff88] text-sm">React, Next.js, Node.js, TypeScript</div>
            </div>

            <div
              className={`bg-[#0d1117] border border-gray-600 p-4 transition-all duration-500 delay-300 ${
                showTerminal ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
            >
              <div className="font-mono text-xs text-gray-500 mb-2">AVAILABILITY</div>
              <div className="text-gray-300">Open to selected opportunities</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
