import { useState, useEffect } from 'react';

type FilterType = 'All' | 'Platforms' | 'Architecture' | 'Frontend' | 'Cybersecurity';

export function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const filters: FilterType[] = ['All', 'Platforms', 'Architecture', 'Frontend', 'Cybersecurity'];

  const projects = [
    {
      title: 'DQ Digital Workspace Platform',
      role: 'Lead Engineer',
      description: 'Enterprise digital workspace platform serving 500+ employees with workflow automation, document management, and integrated collaboration tools.',
      stack: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'TypeScript'],
      category: ['Platforms', 'Architecture'],
      featured: true,
    },
    {
      title: 'QNB Digital Banking DXP',
      role: 'Full-Stack Developer',
      description: 'Digital experience platform for banking services with secure transaction processing and customer journey optimization.',
      stack: ['React', 'GraphQL', 'Node.js', 'Prisma'],
      category: ['Platforms', 'Frontend'],
      featured: false,
    },
    {
      title: 'Khalifa Fund Enterprise Journey Platform',
      role: 'Solutions Architect',
      description: 'End-to-end enterprise journey platform for funding applications with complex workflow orchestration.',
      stack: ['Next.js', 'TypeScript', 'Express', 'PostgreSQL'],
      category: ['Platforms', 'Architecture'],
      featured: false,
    },
    {
      title: 'Microsoft Omnichannel Chat Integration',
      role: 'Integration Engineer',
      description: 'Real-time chat integration system connecting Microsoft Omnichannel with enterprise platforms.',
      stack: ['Node.js', 'WebSockets', 'REST APIs', 'Azure'],
      category: ['Architecture', 'Frontend'],
      featured: false,
    },
    {
      title: 'Cybersecurity Labs & CTF Projects',
      role: 'Security Researcher',
      description: 'Capture The Flag competitions and security labs focusing on network analysis, penetration testing, and vulnerability assessment.',
      stack: ['Nmap', 'Wireshark', 'Burp Suite', 'Python'],
      category: ['Cybersecurity'],
      featured: false,
    },
  ];

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter(project => project.category.includes(activeFilter));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 font-mono text-sm text-gray-500">
        <span className="text-[#00ff88]">guest@ian-os</span>:<span className="text-cyan-400">~</span>$ cd /projects
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Projects</h2>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`font-mono text-sm px-4 py-2 border transition-all ${
                activeFilter === filter
                  ? 'bg-[#00ff88]/10 border-[#00ff88]/40 text-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.2)]'
                  : 'bg-[#0d1117] border-gray-600 text-gray-400 hover:border-[#00ff88]/30 hover:text-[#00ff88]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Project */}
      {activeFilter === 'All' && (
        <div
          className={`mb-8 bg-[#0d1117] border border-[#00ff88]/40 p-6 shadow-[0_0_25px_rgba(0,255,136,0.15)] transition-all duration-500 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="font-mono text-xs text-[#00ff88] mb-3">[FEATURED]</div>
          <h3 className="text-2xl font-bold text-white mb-2">DQ Digital Workspace Platform</h3>
          <div className="font-mono text-sm text-cyan-400 mb-4">Lead Engineer</div>
          <p className="text-gray-400 mb-4 leading-relaxed">
            Enterprise digital workspace platform serving 500+ employees with workflow automation,
            document management, and integrated collaboration tools. Built with modern stack and
            designed for scalability and security.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {['React', 'Next.js', 'Node.js', 'PostgreSQL', 'TypeScript'].map((tech) => (
              <span
                key={tech}
                className="font-mono text-xs px-2 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]"
              >
                {tech}
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            <button className="font-mono text-sm px-4 py-2 bg-[#00ff88]/10 border border-[#00ff88]/40 text-[#00ff88] hover:bg-[#00ff88]/20 transition-all">
              View Details
            </button>
            <button className="font-mono text-sm px-4 py-2 border border-gray-600 text-gray-400 hover:border-[#00ff88]/30 hover:text-[#00ff88] transition-all">
              Case Study
            </button>
          </div>
        </div>
      )}

      {/* Project Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredProjects.filter(p => !p.featured).map((project, index) => (
          <div
            key={project.title}
            className={`bg-[#0d1117] border border-gray-600 hover:border-[#00ff88]/30 hover:-translate-y-1 p-6 transition-all duration-500 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: `${index * 100 + 300}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-white">{project.title}</h3>
              <div className="font-mono text-xs text-gray-500">
                [{String(index + 1).padStart(2, '0')}]
              </div>
            </div>
            <div className="font-mono text-sm text-cyan-400 mb-3">{project.role}</div>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="font-mono text-xs px-2 py-1 bg-gray-800/50 border border-gray-700 text-gray-300"
                >
                  {tech}
                </span>
              ))}
            </div>
            <button className="font-mono text-sm text-[#00ff88] hover:underline">
              View Project &rarr;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
