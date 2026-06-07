'use client';

import { useEffect, useState } from 'react';

const availability = [
  'Full-stack engineering roles',
  'Solution architecture opportunities',
  'Platform prototype work',
  'Cybersecurity-oriented engineering roles',
  'Technical collaboration',
];

const collaborationSignals = [
  ['response.mode', 'strategic and technical'],
  ['timezone', 'GMT+3 / EAT'],
  ['working.style', 'prototype -> spec -> build'],
  ['fit', 'secure enterprise platforms'],
];

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sendingStep, setSendingStep] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 160);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendingStep(1);

    await new Promise((resolve) => setTimeout(resolve, 500));
    setSendingStep(2);

    await new Promise((resolve) => setTimeout(resolve, 500));
    setSendingStep(3);

    await new Promise((resolve) => setTimeout(resolve, 500));
    setSendingStep(4);

    await new Promise((resolve) => setTimeout(resolve, 650));
    setSending(false);
    setSendingStep(0);
    alert('Message queued in demo mode. Connect this form to an email endpoint before production use.');
  };

  return (
    <section className="w-full max-w-7xl mx-auto">
      {/* <div className="mb-5 font-mono text-sm text-gray-500">
        <span className="text-[#00ff88]">ian@IanOS</span>:<span className="text-cyan-400">~</span>$ ./connect.sh
      </div> */}

      <div className="mb-7 grid lg:grid-cols-[0.82fr_1.18fr] gap-6 items-end">
        <div>
          <div className="font-mono text-xs text-[#00ff88] mb-3">connect.sh / collaboration endpoint</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">Connect around serious platform work.</h2>
        </div>
        <p className="text-gray-400 leading-relaxed">
          Best-fit conversations involve building secure full-stack products, shaping enterprise platform
          architecture, moving prototypes toward implementation, or collaborating on security-aware engineering.
        </p>
      </div>

      <div className="grid lg:grid-cols-[0.72fr_1.28fr] gap-6">
        <aside
          className={`border border-[#00ff88]/25 bg-[#090d16]/80 p-5 md:p-6 transition-all duration-500 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="font-mono text-xs text-[#00ff88] mb-5">Available for:</div>
          <div className="space-y-3 mb-6">
            {availability.map((item) => (
              <div key={item} className="flex gap-3 text-gray-300">
                <span className="font-mono text-[#00ff88] mt-0.5">&gt;</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-5 space-y-3 font-mono text-sm">
            {collaborationSignals.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[112px_1fr] gap-3">
                <span className="text-gray-600">{label}</span>
                <span className="text-cyan-300">{value}</span>
              </div>
            ))}
          </div>
        </aside>

        <div
          className={`border border-cyan-400/25 bg-[#090d16]/80 p-5 md:p-6 transition-all duration-500 delay-120 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="font-mono text-xs text-cyan-400 mb-4">compose.transmission</div>

          {sending && (
            <div className="mb-4 font-mono text-sm text-[#00ff88] space-y-1 border border-[#00ff88]/20 bg-[#00ff88]/5 p-3">
              {sendingStep >= 1 && <div className="animate-fade-up">&gt; Executing transmission...</div>}
              {sendingStep >= 2 && <div className="animate-fade-up">&gt; Validating payload...</div>}
              {sendingStep >= 3 && <div className="animate-fade-up">&gt; Queueing message...</div>}
              {sendingStep >= 4 && <div className="animate-fade-up text-[#27c93f]">[OK] Demo payload accepted</div>}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-gray-500 mb-2">NAME:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/30 border border-gray-700 px-4 py-3 text-gray-200 focus:border-cyan-400/50 focus:shadow-[0_0_10px_rgba(0,255,255,0.1)] focus:outline-none transition-all font-mono text-sm"
                  placeholder="Your name"
                  required
                  disabled={sending}
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-gray-500 mb-2">EMAIL:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/30 border border-gray-700 px-4 py-3 text-gray-200 focus:border-cyan-400/50 focus:shadow-[0_0_10px_rgba(0,255,255,0.1)] focus:outline-none transition-all font-mono text-sm"
                  placeholder="your.email@example.com"
                  required
                  disabled={sending}
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-gray-500 mb-2">MESSAGE:</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-black/30 border border-gray-700 px-4 py-3 text-gray-200 focus:border-cyan-400/50 focus:shadow-[0_0_10px_rgba(0,255,255,0.1)] focus:outline-none transition-all font-mono text-sm resize-none"
                placeholder="What should we build, secure, or architect?"
                rows={6}
                required
                disabled={sending}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className={`w-full py-3 border font-mono text-sm transition-all ${
                sending
                  ? 'bg-[#00ff88]/10 border-[#00ff88]/40 text-[#00ff88] cursor-wait'
                  : 'bg-cyan-500/10 border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/18 hover:shadow-[0_0_18px_rgba(0,255,255,0.18)]'
              }`}
            >
              {sending ? '[SENDING...]' : '[SEND MESSAGE]'}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-3 gap-4">
        <a
          href="https://linkedin.com/in/iankipkorir"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-gray-700 bg-black/25 p-4 group hover:border-cyan-400/35 transition-colors"
        >
          <div className="font-mono text-xs text-gray-500 mb-2">LINKEDIN</div>
          <div className="text-gray-300 group-hover:text-cyan-300 transition-colors">/in/iankipkorir -&gt;</div>
        </a>

        <a
          href="https://github.com/iankipkorir"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-gray-700 bg-black/25 p-4 group hover:border-[#00ff88]/35 transition-colors"
        >
          <div className="font-mono text-xs text-gray-500 mb-2">GITHUB</div>
          <div className="text-gray-300 group-hover:text-[#00ff88] transition-colors">@iankipkorir -&gt;</div>
        </a>

        <button className="border border-gray-700 bg-black/25 p-4 group hover:border-[#00ff88]/35 transition-colors text-left">
          <div className="font-mono text-xs text-gray-500 mb-2">CV</div>
          <div className="text-gray-300 group-hover:text-[#00ff88] transition-colors">available on request</div>
        </button>
      </div>
    </section>
  );
}
