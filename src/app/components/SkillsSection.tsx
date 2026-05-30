import { useEffect, useState } from 'react';

const skillLayers = [
  {
    layer: 'Interface Layer',
    path: '/ui',
    accent: '#00ff88',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
  },
  {
    layer: 'Service Layer',
    path: '/services',
    accent: '#00d9ff',
    skills: ['Node.js', 'Express', 'GraphQL', 'REST'],
  },
  {
    layer: 'Data Layer',
    path: '/data',
    accent: '#9af7c7',
    skills: ['PostgreSQL', 'Prisma', 'Supabase'],
  },
  {
    layer: 'Platform Layer',
    path: '/platform',
    accent: '#ffbd2e',
    skills: ['Vercel', 'Docker', 'Git'],
  },
  {
    layer: 'Security Layer',
    path: '/security',
    accent: '#ff5f56',
    skills: ['Nmap', 'Wireshark', 'Burp Suite', 'SIEM basics'],
  },
  {
    layer: 'Design/AI Layer',
    path: '/design-ai',
    accent: '#b7f7ff',
    skills: ['Figma', 'Magic Patterns', 'Codex'],
  },
];

export function SkillsSection() {
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowCards(true), 160);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto">
      <div className="mb-5 font-mono text-sm text-gray-500">
        <span className="text-[#00ff88]">ian@IanOS</span>:<span className="text-cyan-400">~</span>$ scan /bin/toolchain.bin
      </div>

      <div className="mb-7 grid lg:grid-cols-[0.8fr_1.2fr] gap-6 items-end">
        <div>
          <div className="font-mono text-xs text-[#00ff88] mb-3">toolchain.bin / layered stack</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">Skills organized by system layer.</h2>
        </div>
        <p className="text-gray-400 leading-relaxed">
          The toolchain spans interface engineering, backend services, data modeling, deployment, security analysis,
          design translation, and AI-assisted development workflows.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {skillLayers.map((group, index) => (
          <article
            key={group.layer}
            className={`border border-gray-700 bg-[#090d16]/80 p-5 hover:border-[#00ff88]/35 hover:-translate-y-0.5 transition-all duration-500 ${
              showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: `${index * 85}ms` }}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="font-mono text-xs text-gray-600 mb-2">{group.path}</div>
                <h3 className="text-xl font-bold text-white">{group.layer}</h3>
              </div>
              <div
                className="font-mono text-xs px-2 py-1 border"
                style={{
                  borderColor: `${group.accent}66`,
                  color: group.accent,
                  backgroundColor: `${group.accent}12`,
                }}
              >
                L{String(index + 1).padStart(2, '0')}
              </div>
            </div>

            <div className="grid gap-2">
              {group.skills.map((skill) => (
                <div
                  key={skill}
                  className="font-mono text-sm flex items-center justify-between gap-3 bg-black/20 border border-gray-800 px-3 py-2"
                >
                  <span className="text-gray-300">{skill}</span>
                  <span className="text-gray-700">loaded</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
