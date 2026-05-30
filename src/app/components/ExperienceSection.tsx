import { useEffect, useState } from 'react';

const stages = [
  {
    stage: 'Stage 01',
    title: 'Full-Stack Execution',
    period: 'foundation',
    summary: 'Built modern interfaces, service endpoints, integrations, and production features across the stack.',
    evidence: ['React and Next.js interfaces', 'Node.js service work', 'API integration and delivery discipline'],
  },
  {
    stage: 'Stage 02',
    title: 'Platform Thinking',
    period: 'enterprise systems',
    summary: 'Moved from feature delivery into workflow platforms, DXP/DWS concepts, data surfaces, and system-wide product behavior.',
    evidence: ['Enterprise journey mapping', 'Workspace platform modules', 'Cross-system workflow awareness'],
  },
  {
    stage: 'Stage 03',
    title: 'Solution Leadership',
    period: 'architecture track',
    summary: 'Translated stakeholder requirements into architecture, prototype direction, implementation plans, and handoff-ready specs.',
    evidence: ['Architecture blueprints', 'Prototype-to-build alignment', 'Technical communication across roles'],
  },
  {
    stage: 'Stage 04',
    title: 'Security-Aware Engineering',
    period: 'active focus',
    summary: 'Strengthened delivery with cybersecurity practice across access, validation, data exposure, testing, and operations.',
    evidence: ['Nmap, Wireshark, Burp Suite', 'CTF and lab practice', 'Security thinking inside product delivery'],
  },
];

export function ExperienceSection() {
  const [showEntries, setShowEntries] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowEntries(true), 160);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto">
      <div className="mb-5 font-mono text-sm text-gray-500">
        <span className="text-[#00ff88]">ian@IanOS</span>:<span className="text-cyan-400">~</span>$ tail -f /logs/career.log
      </div>

      <div className="mb-7 grid lg:grid-cols-[0.85fr_1.15fr] gap-6 items-end">
        <div>
          <div className="font-mono text-xs text-cyan-400 mb-3">career.log / growth stages</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">Career progression as capability growth.</h2>
        </div>
        <p className="text-gray-400 leading-relaxed">
          The timeline is framed less as a list of jobs and more as a progression: execution, platform thinking,
          solution leadership, and security-aware engineering.
        </p>
      </div>

      <div className="relative space-y-4">
        <div className="absolute left-5 top-4 bottom-4 w-px bg-gradient-to-b from-[#00ff88]/60 via-cyan-400/30 to-transparent hidden md:block" />

        {stages.map((item, index) => (
          <article
            key={item.title}
            className={`relative md:ml-12 border border-gray-700 bg-[#090d16]/80 p-5 md:p-6 hover:border-[#00ff88]/35 transition-all duration-500 ${
              showEntries ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'
            }`}
            style={{ transitionDelay: `${index * 120}ms` }}
          >
            <div className="hidden md:block absolute -left-[43px] top-6 w-3 h-3 bg-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.8)]" />
            <div className="grid lg:grid-cols-[0.45fr_1fr] gap-5">
              <div>
                <div className="font-mono text-xs text-[#00ff88] mb-2">{item.stage}</div>
                <h3 className="text-2xl font-bold text-white leading-tight mb-2">{item.title}</h3>
                <div className="font-mono text-xs text-cyan-300">{item.period}</div>
              </div>
              <div>
                <p className="text-gray-400 leading-relaxed mb-4">{item.summary}</p>
                <div className="grid sm:grid-cols-3 gap-2">
                  {item.evidence.map((evidence) => (
                    <div key={evidence} className="border border-gray-800 bg-black/20 p-3 text-sm text-gray-300">
                      {evidence}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 font-mono text-sm text-gray-600 text-center">[END OF CAREER.LOG] - stages indexed: {stages.length}</div>
    </section>
  );
}
