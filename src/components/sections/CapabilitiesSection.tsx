'use client';

import { useEffect, useState } from 'react';
import type { CapabilitiesData } from '@/types/portfolio';

type CapabilitiesSectionProps = {
  data: CapabilitiesData;
};

export function CapabilitiesSection({ data }: CapabilitiesSectionProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 160);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto">
      <div className="mb-7 grid lg:grid-cols-[0.85fr_1.15fr] gap-6 items-end">
        <div>
          <div className="font-mono text-xs text-cyan-400 mb-3">{data.eyebrow}</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">{data.heading}</h2>
        </div>
        <p className="text-gray-400 leading-relaxed">{data.intro}</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {data.items.map((capability, index) => (
          <article
            key={capability.title}
            className={`min-h-[260px] border bg-[#090d16]/80 p-5 flex flex-col transition-all duration-500 hover:-translate-y-1 ${
              index % 2 === 0
                ? 'border-[#00ff88]/25 hover:border-[#00ff88]/45'
                : 'border-cyan-400/25 hover:border-cyan-400/45'
            } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: `${index * 95}ms` }}
          >
            <div className="font-mono text-xs text-gray-600 mb-8">{data.nodePrefix}{String(index + 1).padStart(2, '0')}</div>
            <h3 className="text-xl font-bold text-white leading-tight mb-3">{capability.title}</h3>
            <p className="text-gray-400 leading-relaxed flex-1">{capability.description}</p>
            <div className="mt-6 font-mono text-xs text-cyan-300 border-t border-gray-800 pt-3">{capability.signal}</div>
          </article>
        ))}
      </div>

      <div className="mt-6 border border-gray-700 bg-black/25 p-4 font-mono text-xs text-gray-500">{data.output}</div>
    </section>
  );
}
