import { useState, useEffect } from 'react';

export function ExperienceSection() {
  const [showEntries, setShowEntries] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowEntries(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const experiences = [
    {
      timestamp: '2023 - Present',
      company: 'DQ Digital Platform',
      role: 'Lead Full-Stack Engineer',
      description: 'Leading development of enterprise digital workspace platform. Architecting scalable solutions for workflow automation, document management, and team collaboration serving 500+ users.',
      achievements: [
        'Designed and implemented microservices architecture',
        'Reduced system latency by 40% through optimization',
        'Led team of 4 engineers in agile environment',
      ],
    },
    {
      timestamp: '2022 - 2023',
      company: 'QNB Digital Banking',
      role: 'Full-Stack Developer',
      description: 'Built secure digital banking platform features with focus on customer experience and transaction security. Worked with React, Node.js, and GraphQL to deliver scalable solutions.',
      achievements: [
        'Developed secure transaction processing module',
        'Implemented real-time notification system',
        'Improved frontend performance by 35%',
      ],
    },
    {
      timestamp: '2021 - 2022',
      company: 'Khalifa Fund',
      role: 'Solutions Architect',
      description: 'Designed enterprise journey platform for funding applications. Created workflow orchestration system handling complex multi-step processes with approval chains.',
      achievements: [
        'Architected end-to-end application journey system',
        'Integrated with multiple third-party APIs',
        'Reduced application processing time by 50%',
      ],
    },
    {
      timestamp: '2020 - 2021',
      company: 'Microsoft Integration Project',
      role: 'Integration Engineer',
      description: 'Developed real-time chat integration connecting Microsoft Omnichannel with enterprise platforms. Built WebSocket-based communication layer and REST API interfaces.',
      achievements: [
        'Built real-time bidirectional messaging system',
        'Implemented message queue for reliability',
        'Achieved 99.9% uptime in production',
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 font-mono text-sm text-gray-500">
        <span className="text-[#00ff88]">guest@ian-os</span>:<span className="text-cyan-400">~</span>$ tail -f /var/log/experience.log
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">Experience</h2>
        <p className="text-gray-400">
          Professional journey building enterprise platforms and secure systems.
        </p>
      </div>

      <div className="space-y-6">
        {experiences.map((exp, index) => (
          <div
            key={exp.company}
            className={`bg-[#0d1117] border border-gray-600 hover:border-[#00ff88]/30 p-6 transition-all duration-500 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] relative ${
              showEntries ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            {/* Timeline Indicator */}
            <div
              className={`absolute -left-[1px] top-0 bottom-0 w-1 bg-gradient-to-b from-[#00ff88]/50 to-transparent transition-all duration-700 ${
                showEntries ? 'scale-y-100' : 'scale-y-0'
              }`}
              style={{ transitionDelay: `${index * 150}ms`, transformOrigin: 'top' }}
            />

            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                  <span className="font-mono text-xs px-2 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]">
                    [{String(index + 1).padStart(2, '0')}]
                  </span>
                </div>
                <div className="text-cyan-400 mb-2">{exp.company}</div>
              </div>
              <div className="font-mono text-sm text-gray-500 md:text-right">
                {exp.timestamp}
              </div>
            </div>

            <p className="text-gray-400 mb-4 leading-relaxed">
              {exp.description}
            </p>

            <div className="space-y-2">
              <div className="font-mono text-xs text-gray-500 mb-2">KEY ACHIEVEMENTS:</div>
              {exp.achievements.map((achievement, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#00ff88] font-mono text-sm mt-0.5">&gt;</span>
                  <span className="text-gray-400 text-sm">{achievement}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* End of log indicator */}
      <div className="mt-6 font-mono text-sm text-gray-600 text-center">
        [END OF LOG] - Total entries: {experiences.length}
      </div>
    </div>
  );
}
