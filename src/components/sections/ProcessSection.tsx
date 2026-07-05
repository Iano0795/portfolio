'use client';

import { useEffect, useState } from 'react';
import type { ProcessData } from '@/types/portfolio';

type ProcessSectionProps = {
  data: ProcessData;
};

export function ProcessSection({ data }: ProcessSectionProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 160);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto">
      <div className="mb-7 grid lg:grid-cols-[0.78fr_1.22fr] gap-6 items-end">
        <div>
          <div className="font-mono text-xs text-[#00ff88] mb-3">{data.eyebrow}</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">{data.heading}</h2>
        </div>
        <p className="text-gray-400 leading-relaxed">{data.intro}</p>
      </div>

      <div className="border border-cyan-400/20 bg-[#090d16]/80 p-5 md:p-6 mb-6">
        <div className="grid md:grid-cols-5 gap-3">
          {data.stages.map((stage, index) => (
            <div
              key={stage.title}
              className={`relative border border-gray-700 bg-black/25 p-4 min-h-32 transition-all duration-500 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="font-mono text-xs text-gray-600 mb-7">{data.stagePrefix}{String(index + 1).padStart(2, '0')}</div>
              <div className="text-lg font-bold text-white leading-tight">{stage.title}</div>
              {index < data.stages.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-[#00ff88]/45" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="border border-[#00ff88]/25 bg-black/30 p-5 md:p-6">
          <div className="font-mono text-xs text-[#00ff88] mb-5">{data.terminalLabel}</div>
          <div className="space-y-3 font-mono">
            {data.terminalPipeline.map((line, index) => (
              <div
                key={line.label}
                className={`grid sm:grid-cols-[88px_1fr] gap-3 text-sm transition-all duration-500 ${
                  visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
                style={{ transitionDelay: `${index * 80 + 220}ms` }}
              >
                <span className="text-cyan-400">{line.label}:</span>
                <span className="text-gray-300">{line.value}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="border border-gray-700 bg-[#090d16]/80 p-5 md:p-6">
          <div className="font-mono text-xs text-gray-500 mb-5">{data.reviewLabel}</div>
          <div className="space-y-3 text-sm text-gray-400">
            {data.reviewChecklist.map((item) => (
              <div key={item}><span className="text-[#00ff88] font-mono">&gt;</span> {item}</div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
