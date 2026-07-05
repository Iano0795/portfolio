'use client';

import { useEffect, useState } from 'react';
import type { AboutData } from '@/types/portfolio';

type AboutSectionProps = {
  data: AboutData;
};

export function AboutSection({ data }: AboutSectionProps) {
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowCards(true), 160);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="border border-[#00ff88]/25 bg-[#090d16]/80 p-6 md:p-7">
          <div className="font-mono text-xs text-[#00ff88] mb-4">{data.eyebrow}</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-5">{data.heading}</h2>
          {data.paragraphs.map((paragraph, index) => (
            <p key={paragraph} className={`${index === 0 ? 'text-gray-300 mb-5' : 'text-gray-400'} leading-relaxed`}>
              {paragraph}
            </p>
          ))}
        </div>

        <div className="grid gap-4">
          {data.storyPoints.map((point, index) => (
            <div
              key={point.label}
              className={`border border-gray-700 bg-[#090d16]/75 p-5 hover:border-cyan-400/30 transition-all duration-500 ${
                showCards ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'
              }`}
              style={{ transitionDelay: `${index * 110}ms` }}
            >
              <div className="flex items-center justify-between mb-3 font-mono text-xs">
                <span className={index === 0 ? 'text-[#00ff88]' : 'text-cyan-400'}>{point.label}</span>
                <span className="text-gray-600">0{index + 1}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{point.title}</h3>
              <p className="text-gray-400 leading-relaxed">{point.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
