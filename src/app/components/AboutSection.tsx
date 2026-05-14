import { useState, useEffect } from 'react';

export function AboutSection() {
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowCards(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 font-mono text-sm text-gray-500">
        <span className="text-[#00ff88]">guest@ian-os</span>:<span className="text-cyan-400">~</span>$ cat about.txt
      </div>

      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-4">About Me</h2>
        <p className="text-lg text-gray-400 leading-relaxed max-w-3xl">
          I'm a full-stack engineer passionate about building scalable digital experiences that solve real problems.
          With expertise spanning modern web technologies, enterprise architecture, and cybersecurity, I bring a
          holistic approach to software development. I thrive on designing systems that are not just functional,
          but secure, maintainable, and built to last.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Platform Engineering */}
        <div
          className={`bg-[#0d1117] border border-[#00ff88]/30 p-6 shadow-[0_0_20px_rgba(0,255,136,0.05)] hover:shadow-[0_0_25px_rgba(0,255,136,0.15)] transition-all duration-500 ${
            showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div
            className={`font-mono text-xs text-[#00ff88] mb-3 transition-all duration-300 delay-100 ${
              showCards ? 'opacity-100' : 'opacity-0'
            }`}
          >
            [01]
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Platform Engineering</h3>
          <p className="text-gray-400 leading-relaxed">
            Building enterprise-grade digital experience platforms (DXP) and digital workspace solutions (DWS)
            that power complex business workflows and serve thousands of users.
          </p>
          <div className="mt-4 font-mono text-xs text-cyan-400">
            &gt; React &bull; Next.js &bull; Node.js &bull; TypeScript
          </div>
        </div>

        {/* Solution Architecture */}
        <div
          className={`bg-[#0d1117] border border-cyan-400/30 p-6 shadow-[0_0_20px_rgba(0,255,255,0.05)] hover:shadow-[0_0_25px_rgba(0,255,255,0.15)] transition-all duration-500 delay-150 ${
            showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div
            className={`font-mono text-xs text-cyan-400 mb-3 transition-all duration-300 delay-250 ${
              showCards ? 'opacity-100' : 'opacity-0'
            }`}
          >
            [02]
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Solution Architecture</h3>
          <p className="text-gray-400 leading-relaxed">
            Designing API-first systems, microservices architectures, and workflow platforms that scale.
            I focus on creating modular, maintainable systems with clear separation of concerns.
          </p>
          <div className="mt-4 font-mono text-xs text-cyan-400">
            &gt; API Design &bull; GraphQL &bull; Microservices &bull; Scalability
          </div>
        </div>

        {/* Cybersecurity Mindset */}
        <div
          className={`bg-[#0d1117] border border-gray-600 p-6 hover:border-[#00ff88]/30 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] transition-all duration-500 delay-300 ${
            showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div
            className={`font-mono text-xs text-gray-500 mb-3 transition-all duration-300 delay-400 ${
              showCards ? 'opacity-100' : 'opacity-0'
            }`}
          >
            [03]
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Cybersecurity Mindset</h3>
          <p className="text-gray-400 leading-relaxed">
            Security is never an afterthought. From network analysis to penetration testing, I bring
            a security-first approach to every system I build, ensuring robust protection at every layer.
          </p>
          <div className="mt-4 font-mono text-xs text-gray-400">
            &gt; Nmap &bull; Wireshark &bull; Burp Suite &bull; CTFs
          </div>
        </div>
      </div>
    </div>
  );
}
