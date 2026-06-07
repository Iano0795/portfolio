'use client';

import { useEffect, useState } from 'react';

type ProfileSectionProps = {
  onNavigate: (section: 'projects' | 'contact' | 'skills') => void;
  onDownloadCv: () => void;
};

const identityRows = [
  ['NAME', 'Ian Kipkorir'],
  ['ROLE', 'Full-Stack Engineer'],
  ['MODE', 'Solutions Architect'],
  ['FOCUS', 'Enterprise Platforms'],
  ['SIGNAL', 'Security-aware builder'],
  ['STACK', 'React / Next.js / Node.js / TypeScript'],
];

const nowBuilding = [
  'Enterprise digital platforms',
  'DXP / DWS prototypes',
  'Security-aware full-stack systems',
  'AI-assisted engineering workflows',
];

const commands = ['help', 'whoami', 'open builds', 'open toolchain', 'open career', 'download cv', 'contact'];

export function ProfileSection({ onNavigate, onDownloadCv }: ProfileSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(timer);
  }, []);

  const runProfileCommand = (command: string) => {
    if (command === 'open builds') {
      onNavigate('projects');
    }

    if (command === 'open toolchain') {
      onNavigate('skills');
    }

    if (command === 'download cv') {
      onDownloadCv();
    }

    if (command === 'contact') {
      onNavigate('contact');
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto min-w-0">
      {/* <div className="mb-5 font-mono text-sm text-gray-500">
        <span className="text-[#00ff88]">ian@IanOS</span>:<span className="text-cyan-400">~</span>$ boot identity.sys
      </div> */}

      <div className="grid xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-6">
        <div
          className={`border border-[#00ff88]/25 bg-[#090d16]/80 p-6 md:p-8 shadow-[0_0_30px_rgba(0,255,136,0.07)] transition-all duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="font-mono text-xs text-cyan-400 mb-5">module.identity / professional kernel</div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.04] mb-5 tracking-normal">
            Full-Stack Engineer &amp; Solutions Architect
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl">
            I turn complex business requirements into secure, scalable digital platforms &mdash; from prototype and
            architecture to production-ready systems.
          </p>

          <div className="mt-7 grid sm:grid-cols-3 gap-3">
            <button
              onClick={() => onNavigate('projects')}
              className="font-mono text-sm px-4 py-3 bg-[#00ff88]/10 border border-[#00ff88]/40 text-[#00ff88] hover:bg-[#00ff88]/18 transition-all shadow-[0_0_16px_rgba(0,255,136,0.12)]"
            >
              open builds
            </button>
            <button
              onClick={() => onNavigate('skills')}
              className="font-mono text-sm px-4 py-3 bg-cyan-400/10 border border-cyan-400/35 text-cyan-300 hover:bg-cyan-400/15 transition-all"
            >
              open toolchain
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="font-mono text-sm px-4 py-3 border border-gray-600 text-gray-300 hover:border-[#00ff88]/35 hover:text-[#00ff88] transition-all"
            >
              connect.sh
            </button>
          </div>
        </div>

        <div className="grid gap-4 min-w-0">
          <div
            className={`border border-cyan-400/25 bg-[#090d16]/85 p-5 transition-all duration-500 delay-100 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            <div className="flex items-center justify-between mb-4 font-mono text-xs">
              <span className="text-cyan-400">identity.block</span>
              <span className="text-gray-600">verified</span>
            </div>
            <div className="space-y-3 font-mono text-sm">
              {identityRows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[86px_minmax(0,1fr)] gap-3 border-b border-gray-800/80 pb-2 last:border-0 last:pb-0">
                  <span className="text-gray-500">{label}:</span>
                  <span className={`${label === 'NAME' ? 'text-white' : 'text-gray-300'} min-w-0 break-words`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`grid md:grid-cols-2 gap-4 transition-all duration-500 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            <div className="border border-[#00ff88]/20 bg-[#090d16]/75 p-5">
              <div className="font-mono text-xs text-[#00ff88] mb-4">now_building.queue</div>
              <div className="space-y-3">
                {nowBuilding.map((item) => (
                  <div key={item} className="flex gap-3 text-sm text-gray-300">
                    <span className="font-mono text-[#00ff88] mt-0.5">&gt;</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-gray-700 bg-black/25 p-5">
              <div className="font-mono text-xs text-gray-500 mb-4">mini_build_console</div>
              <div className="space-y-1">
                {commands.map((command) => (
                  <button
                    key={command}
                    onClick={() => runProfileCommand(command)}
                    className="block w-full text-left font-mono text-xs text-gray-400 hover:text-cyan-300 px-2 py-1.5 hover:bg-cyan-400/5 border border-transparent hover:border-cyan-400/15 transition-all"
                  >
                    <span className="text-cyan-500">$</span> {command}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
