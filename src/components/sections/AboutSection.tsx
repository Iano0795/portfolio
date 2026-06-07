'use client';

import { useEffect, useState } from 'react';

const storyPoints = [
  {
    label: 'business.input',
    title: 'Reads the requirement behind the ticket',
    body: 'Ian maps business journeys, stakeholder constraints, and operational risk before choosing a technical path.',
  },
  {
    label: 'architecture.bridge',
    title: 'Connects product, UX, services, and delivery',
    body: 'He thinks across the interface, backend systems, APIs, workflow states, access models, and implementation tradeoffs.',
  },
  {
    label: 'security.baseline',
    title: 'Builds with a security-aware mindset',
    body: 'Security is treated as part of the system shape: validation, permissions, data exposure, logs, and operational behavior.',
  },
];

export function AboutSection() {
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowCards(true), 160);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto">
      {/* <div className="mb-5 font-mono text-sm text-gray-500">
        <span className="text-[#00ff88]">ian@IanOS</span>:<span className="text-cyan-400">~</span>$ tail /logs/origin.log
      </div> */}

      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="border border-[#00ff88]/25 bg-[#090d16]/80 p-6 md:p-7">
          <div className="font-mono text-xs text-[#00ff88] mb-4">origin.log / system narrative</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-5">From requirement to working platform.</h2>
          <p className="text-gray-300 leading-relaxed mb-5">
            Ian Kipkorir is a full-stack engineer and solutions architect focused on enterprise-grade digital
            platforms. His work sits where business requirements, user journeys, platform architecture, backend
            systems, and secure implementation need to line up.
          </p>
          <p className="text-gray-400 leading-relaxed">
            The strongest pattern in his work is translation: turning static specifications and complex stakeholder
            needs into usable product experiences, technical blueprints, APIs, workflows, and production-ready
            implementation paths.
          </p>
        </div>

        <div className="grid gap-4">
          {storyPoints.map((point, index) => (
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
