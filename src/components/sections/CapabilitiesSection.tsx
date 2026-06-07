'use client';

import { useEffect, useState } from 'react';

const capabilities = [
  {
    title: 'Translate Requirements',
    body: 'Convert business journeys and specs into buildable systems.',
    signal: 'business -> system',
  },
  {
    title: 'Design Platform Architecture',
    body: 'Structure frontend, backend, workflows, APIs, and access models.',
    signal: 'shape -> platform',
  },
  {
    title: 'Build Working Prototypes',
    body: 'Move ideas from static requirements to usable product experiences.',
    signal: 'spec -> prototype',
  },
  {
    title: 'Secure the System Thinking',
    body: 'Apply cybersecurity awareness to access, data, APIs, logging, and operations.',
    signal: 'surface -> controls',
  },
];

export function CapabilitiesSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 160);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto">
      {/* <div className="mb-5 font-mono text-sm text-gray-500">
        <span className="text-[#00ff88]">ian@IanOS</span>:<span className="text-cyan-400">~</span>$ open /maps/capabilities.map
      </div> */}

      <div className="mb-7 grid lg:grid-cols-[0.85fr_1.15fr] gap-6 items-end">
        <div>
          <div className="font-mono text-xs text-cyan-400 mb-3">capabilities.map / delivery model</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">A bridge from requirements to secure delivery.</h2>
        </div>
        <p className="text-gray-400 leading-relaxed">
          Ian&apos;s value is not only writing code. It is connecting product intent, platform structure, implementation
          details, and operational security into systems that can be understood, built, and maintained.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {capabilities.map((capability, index) => (
          <article
            key={capability.title}
            className={`min-h-[260px] border bg-[#090d16]/80 p-5 flex flex-col transition-all duration-500 hover:-translate-y-1 ${
              index % 2 === 0
                ? 'border-[#00ff88]/25 hover:border-[#00ff88]/45'
                : 'border-cyan-400/25 hover:border-cyan-400/45'
            } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: `${index * 95}ms` }}
          >
            <div className="font-mono text-xs text-gray-600 mb-8">node.{String(index + 1).padStart(2, '0')}</div>
            <h3 className="text-xl font-bold text-white leading-tight mb-3">{capability.title}</h3>
            <p className="text-gray-400 leading-relaxed flex-1">{capability.body}</p>
            <div className="mt-6 font-mono text-xs text-cyan-300 border-t border-gray-800 pt-3">{capability.signal}</div>
          </article>
        ))}
      </div>

      <div className="mt-6 border border-gray-700 bg-black/25 p-4 font-mono text-xs text-gray-500">
        output: buildable scope + implementation path + security-aware constraints + prototype-ready interface
      </div>
    </section>
  );
}
