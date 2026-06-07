'use client';

import { useEffect, useState } from 'react';
import type { SkillsData } from '@/types/portfolio';

type SkillsSectionProps = {
  data: SkillsData;
};

export function SkillsSection({ data }: SkillsSectionProps) {
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowCards(true), 160);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto">
      <div className="mb-7 grid lg:grid-cols-[0.8fr_1.2fr] gap-6 items-end">
        <div>
          <div className="font-mono text-xs text-[#00ff88] mb-3">{data.eyebrow}</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">{data.heading}</h2>
        </div>
        <p className="text-gray-400 leading-relaxed">{data.intro}</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.groups.map((group, index) => (
          <article
            key={group.category}
            className={`border border-gray-700 bg-[#090d16]/80 p-5 hover:border-[#00ff88]/35 hover:-translate-y-0.5 transition-all duration-500 ${
              showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: `${index * 85}ms` }}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="font-mono text-xs text-gray-600 mb-2">{group.path}</div>
                <h3 className="text-xl font-bold text-white">{group.category}</h3>
              </div>
              <div
                className="font-mono text-xs px-2 py-1 border"
                style={{
                  borderColor: `${group.accent}66`,
                  color: group.accent,
                  backgroundColor: `${group.accent}12`,
                }}
              >
                {data.levelPrefix}{String(index + 1).padStart(2, '0')}
              </div>
            </div>

            <div className="grid gap-2">
              {group.skills.map((skill) => (
                <div
                  key={skill}
                  className="font-mono text-sm flex items-center justify-between gap-3 bg-black/20 border border-gray-800 px-3 py-2"
                >
                  <span className="text-gray-300">{skill}</span>
                  <span className="text-gray-700">{data.loadedLabel}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
