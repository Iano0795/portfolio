import { useState, useEffect } from 'react';

export function SkillsSection() {
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowCards(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const skillGroups = [
    {
      category: 'Frontend',
      color: '#00ff88',
      skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Vite', 'Responsive Design'],
    },
    {
      category: 'Backend',
      color: '#00d9ff',
      skills: ['Node.js', 'Express', 'GraphQL', 'Prisma', 'PostgreSQL', 'REST APIs'],
    },
    {
      category: 'Architecture',
      color: '#ff00ff',
      skills: ['DXP', 'DWS', 'API-first systems', 'Workflow platforms', 'Microservices', 'System Design'],
    },
    {
      category: 'Cybersecurity',
      color: '#ff5f56',
      skills: ['Nmap', 'Wireshark', 'Burp Suite', 'SIEM basics', 'CTFs', 'Network Analysis'],
    },
    {
      category: 'Tools & Platforms',
      color: '#ffbd2e',
      skills: ['Git', 'Vercel', 'Supabase', 'Figma', 'Codex', 'Docker'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 font-mono text-sm text-gray-500">
        <span className="text-[#00ff88]">guest@ian-os</span>:<span className="text-cyan-400">~</span>$ ls -la /skills
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">Technical Skills</h2>
        <p className="text-gray-400">
          A comprehensive toolkit for building modern, secure, and scalable solutions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skillGroups.map((group, index) => (
          <div
            key={group.category}
            className={`bg-[#0d1117] border border-gray-600 hover:border-[#00ff88]/40 hover:-translate-y-0.5 p-6 transition-all duration-500 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] ${
              showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{group.category}</h3>
              <div
                className="font-mono text-xs px-2 py-1 border"
                style={{
                  borderColor: `${group.color}40`,
                  color: group.color,
                  backgroundColor: `${group.color}10`,
                }}
              >
                [{String(index + 1).padStart(2, '0')}]
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill, skillIndex) => (
                <span
                  key={skill}
                  className={`font-mono text-xs px-2 py-1 bg-gray-800/50 border border-gray-700 text-gray-300 transition-all duration-300 ${
                    showCards ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                  }`}
                  style={{ transitionDelay: `${(index * 100) + (skillIndex * 50) + 200}ms` }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
