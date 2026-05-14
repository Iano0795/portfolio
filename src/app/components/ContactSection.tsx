import { useState, useEffect } from 'react';

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
    const timer = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendingStep(1);

    await new Promise(resolve => setTimeout(resolve, 600));
    setSendingStep(2);

    await new Promise(resolve => setTimeout(resolve, 600));
    setSendingStep(3);

    await new Promise(resolve => setTimeout(resolve, 600));
    setSendingStep(4);

    await new Promise(resolve => setTimeout(resolve, 800));
    setSending(false);
    setSendingStep(0);
    alert('Message sent! (This is a demo - no actual email is sent)');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 font-mono text-sm text-gray-500">
        <span className="text-[#00ff88]">guest@ian-os</span>:<span className="text-cyan-400">~</span>$ ./contact.sh
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">Get In Touch</h2>
        <p className="text-gray-400">
          Let's discuss your next project or opportunity.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel - Availability */}
        <div
          className={`bg-[#0d1117] border border-[#00ff88]/30 p-6 space-y-4 transition-all duration-500 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="font-mono text-xs text-[#00ff88] mb-4">[AVAILABILITY]</div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.8)] animate-pulse-slow" />
              <span className="text-sm text-gray-400">Open to opportunities</span>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="font-mono text-xs text-gray-500 mb-2">RESPONSE TIME</div>
              <div className="text-cyan-400">Within 24 hours</div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="font-mono text-xs text-gray-500 mb-2">TIMEZONE</div>
              <div className="text-gray-300">GMT+3 (EAT)</div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="font-mono text-xs text-gray-500 mb-2">INTERESTS</div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>&gt; Enterprise platforms</div>
                <div>&gt; Architecture consulting</div>
                <div>&gt; Security projects</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Contact Form */}
        <div
          className={`lg:col-span-2 bg-[#0d1117] border border-cyan-400/30 p-6 transition-all duration-500 delay-150 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="font-mono text-xs text-cyan-400 mb-4">
            guest@ian-os:~$ nano contact_form.txt
          </div>

          {/* Sending Status */}
          {sending && (
            <div className="mb-4 font-mono text-sm text-[#00ff88] space-y-1">
              {sendingStep >= 1 && <div className="animate-fade-up">&gt; Executing transmission...</div>}
              {sendingStep >= 2 && <div className="animate-fade-up">&gt; Validating payload...</div>}
              {sendingStep >= 3 && <div className="animate-fade-up">&gt; Sending message...</div>}
              {sendingStep >= 4 && <div className="animate-fade-up text-[#27c93f]">[OK] Message queued</div>}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-gray-500 mb-2 transition-colors group-focus-within:text-cyan-400">
                NAME:
              </label>
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
              <label className="block font-mono text-xs text-gray-500 mb-2 transition-colors">
                EMAIL:
              </label>
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

            <div>
              <label className="block font-mono text-xs text-gray-500 mb-2 transition-colors">
                MESSAGE:
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-black/30 border border-gray-700 px-4 py-3 text-gray-200 focus:border-cyan-400/50 focus:shadow-[0_0_10px_rgba(0,255,255,0.1)] focus:outline-none transition-all font-mono text-sm resize-none"
                placeholder="Your message..."
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
                  : 'bg-cyan-500/10 border-cyan-400/40 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] shadow-[0_0_15px_rgba(0,255,255,0.2)]'
              }`}
            >
              {sending ? '[SENDING...]' : '[SEND MESSAGE]'}
            </button>

            <div className="font-mono text-xs text-gray-600 text-center">
              Press Enter to submit or Ctrl+C to cancel
            </div>
          </form>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          href="mailto:ian@example.com"
          className={`bg-[#0d1117] border border-gray-600 hover:border-[#00ff88]/40 p-4 transition-all duration-500 group ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="font-mono text-xs text-gray-500 mb-2">EMAIL</div>
          <div className="text-gray-300 group-hover:text-[#00ff88] transition-colors">
            ian@example.com
          </div>
        </a>

        <a
          href="https://linkedin.com/in/iankipkorir"
          target="_blank"
          rel="noopener noreferrer"
          className={`bg-[#0d1117] border border-gray-600 hover:border-cyan-400/40 p-4 transition-all duration-500 group ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <div className="font-mono text-xs text-gray-500 mb-2">LINKEDIN</div>
          <div className="text-gray-300 group-hover:text-cyan-400 transition-colors">
            /in/iankipkorir &rarr;
          </div>
        </a>

        <a
          href="https://github.com/iankipkorir"
          target="_blank"
          rel="noopener noreferrer"
          className={`bg-[#0d1117] border border-gray-600 hover:border-[#00ff88]/40 p-4 transition-all duration-500 group ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <div className="font-mono text-xs text-gray-500 mb-2">GITHUB</div>
          <div className="text-gray-300 group-hover:text-[#00ff88] transition-colors">
            @iankipkorir &rarr;
          </div>
        </a>

        <button
          className={`bg-[#0d1117] border border-gray-600 hover:border-cyan-400/40 p-4 transition-all duration-500 group text-left ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '700ms' }}
        >
          <div className="font-mono text-xs text-gray-500 mb-2">DOWNLOAD</div>
          <div className="text-gray-300 group-hover:text-cyan-400 transition-colors">
            CV / Resume &darr;
          </div>
        </button>
      </div>
    </div>
  );
}
