'use client';

import { useEffect, useState } from 'react';
import type { ProfileData, SectionId } from '@/types/portfolio';

type ProfileSectionProps = {
  data: ProfileData;
  onNavigate: (section: SectionId) => void;
  onDownloadCv: () => void;
};

const ctaClasses = [
  'font-mono text-sm px-4 py-3 bg-[#00ff88]/10 border border-[#00ff88]/40 text-[#00ff88] hover:bg-[#00ff88]/18 transition-all shadow-[0_0_16px_rgba(0,255,136,0.12)]',
  'font-mono text-sm px-4 py-3 bg-cyan-400/10 border border-cyan-400/35 text-cyan-300 hover:bg-cyan-400/15 transition-all',
  'font-mono text-sm px-4 py-3 border border-gray-600 text-gray-300 hover:border-[#00ff88]/35 hover:text-[#00ff88] transition-all',
];

export function ProfileSection({ data, onNavigate, onDownloadCv }: ProfileSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(timer);
  }, []);

  const runProfileCommand = (command: ProfileData['commands'][number]) => {
    if (command.target) {
      onNavigate(command.target);
    }

    if (command.action === 'downloadCv') {
      onDownloadCv();
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto min-w-0">
      <div className="grid xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-6">
        <div
          className={`border border-[#00ff88]/25 bg-[#090d16]/80 p-6 md:p-8 shadow-[0_0_30px_rgba(0,255,136,0.07)] transition-all duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="font-mono text-xs text-cyan-400 mb-5">{data.eyebrow}</div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.04] mb-5 tracking-normal">
            {data.headline}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl">{data.subheadline}</p>

          <div className="mt-7 grid sm:grid-cols-3 gap-3">
            {data.ctas.map((cta, index) => (
              <button key={cta.label} onClick={() => onNavigate(cta.target)} className={ctaClasses[index]}>
                {cta.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 min-w-0">
          <div
            className={`border border-cyan-400/25 bg-[#090d16]/85 p-5 transition-all duration-500 delay-100 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            <div className="flex items-center justify-between mb-4 font-mono text-xs">
              <span className="text-cyan-400">{data.identityBlockLabel}</span>
              <span className="text-gray-600">{data.identityBlockStatus}</span>
            </div>
            <div className="space-y-3 font-mono text-sm">
              {data.identityRows.map(({ label, value }) => (
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
              <div className="font-mono text-xs text-[#00ff88] mb-4">{data.nowBuildingLabel}</div>
              <div className="space-y-3">
                {data.nowBuilding.map((item) => (
                  <div key={item} className="flex gap-3 text-sm text-gray-300">
                    <span className="font-mono text-[#00ff88] mt-0.5">&gt;</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-gray-700 bg-black/25 p-5">
              <div className="font-mono text-xs text-gray-500 mb-4">{data.consoleLabel}</div>
              <div className="space-y-1">
                {data.commands.map((command) => (
                  <button
                    key={command.command}
                    onClick={() => runProfileCommand(command)}
                    className="block w-full text-left font-mono text-xs text-gray-400 hover:text-cyan-300 px-2 py-1.5 hover:bg-cyan-400/5 border border-transparent hover:border-cyan-400/15 transition-all"
                  >
                    <span className="text-cyan-500">$</span> {command.command}
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
