import { useEffect, useState } from 'react';

const pipelineStages = ['Requirement', 'Architecture', 'Prototype', 'Implementation', 'Review'];

const terminalPipeline = [
  ['input', 'business requirement'],
  ['parse', 'user journeys + platform stages'],
  ['design', 'UX + architecture'],
  ['build', 'React / Node / APIs'],
  ['secure', 'access + validation + NFRs'],
  ['ship', 'prototype / specification / production handoff'],
];

export function ProcessSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 160);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto">
      <div className="mb-5 font-mono text-sm text-gray-500">
        <span className="text-[#00ff88]">ian@IanOS</span>:<span className="text-cyan-400">~</span>$ run /pipelines/process.pipeline
      </div>

      <div className="mb-7 grid lg:grid-cols-[0.78fr_1.22fr] gap-6 items-end">
        <div>
          <div className="font-mono text-xs text-[#00ff88] mb-3">process.pipeline / build flow</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">How a platform idea becomes buildable.</h2>
        </div>
        <p className="text-gray-400 leading-relaxed">
          The pipeline keeps strategy and execution connected: understand the business requirement, shape the
          architecture, make the experience tangible, build the system, then review for security and handoff quality.
        </p>
      </div>

      <div className="border border-cyan-400/20 bg-[#090d16]/80 p-5 md:p-6 mb-6">
        <div className="grid md:grid-cols-5 gap-3">
          {pipelineStages.map((stage, index) => (
            <div
              key={stage}
              className={`relative border border-gray-700 bg-black/25 p-4 min-h-32 transition-all duration-500 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="font-mono text-xs text-gray-600 mb-7">stage.{String(index + 1).padStart(2, '0')}</div>
              <div className="text-lg font-bold text-white leading-tight">{stage}</div>
              {index < pipelineStages.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-[#00ff88]/45" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="border border-[#00ff88]/25 bg-black/30 p-5 md:p-6">
          <div className="font-mono text-xs text-[#00ff88] mb-5">terminal.pipeline</div>
          <div className="space-y-3 font-mono">
            {terminalPipeline.map(([label, value], index) => (
              <div
                key={label}
                className={`grid sm:grid-cols-[88px_1fr] gap-3 text-sm transition-all duration-500 ${
                  visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
                style={{ transitionDelay: `${index * 80 + 220}ms` }}
              >
                <span className="text-cyan-400">{label}:</span>
                <span className="text-gray-300">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="border border-gray-700 bg-[#090d16]/80 p-5 md:p-6">
          <div className="font-mono text-xs text-gray-500 mb-5">review.checklist</div>
          <div className="space-y-3 text-sm text-gray-400">
            <div><span className="text-[#00ff88] font-mono">&gt;</span> Does the flow match the business journey?</div>
            <div><span className="text-[#00ff88] font-mono">&gt;</span> Are permissions and data boundaries explicit?</div>
            <div><span className="text-[#00ff88] font-mono">&gt;</span> Are APIs, states, and handoffs documented?</div>
            <div><span className="text-[#00ff88] font-mono">&gt;</span> Can the prototype become production work?</div>
          </div>
        </aside>
      </div>
    </section>
  );
}
