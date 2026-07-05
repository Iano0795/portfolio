'use client';

import type { ProfileEditorValue } from './types';

type ProfilePreviewProps = {
  profile: ProfileEditorValue;
};

export function ProfilePreview({ profile }: ProfilePreviewProps) {
  return (
    <aside className="h-fit border border-cyan-400/20 bg-black/25 p-5">
      <div className="mb-4 font-mono text-xs text-cyan-400">live.preview</div>
      <div className="border border-[#00ff88]/25 bg-[#090d16]/80 p-5 shadow-[0_0_20px_rgba(0,255,136,0.07)]">
        <div className="mb-3 font-mono text-xs text-[#00ff88]">{profile.introLine || 'intro_line pending'}</div>
        <h2 className="mb-3 text-2xl font-bold leading-tight text-white">{profile.headline || 'Headline pending'}</h2>
        <p className="mb-5 text-sm leading-relaxed text-gray-400">{profile.subheadline || 'Subheadline pending.'}</p>

        <div className="mb-5 grid gap-2 border border-gray-800 bg-black/20 p-3 font-mono text-xs">
          {(profile.terminalLines.length > 0 ? profile.terminalLines : [{ id: 'pending', value: 'NAME=pending' }]).map((line) => (
            <div key={line.id} className="grid grid-cols-[88px_1fr] gap-3">
              <span className="text-gray-600">{line.value.split('=')[0] || 'FIELD'}</span>
              <span className="text-cyan-300">{line.value.split('=').slice(1).join('=') || line.value}</span>
            </div>
          ))}
        </div>

        <div className="mb-5">
          <div className="mb-2 font-mono text-xs text-gray-500">current.focus</div>
          <div className="text-sm text-gray-300">{profile.currentFocus || 'Pending'}</div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {profile.coreStack.map((tech) => (
            <span key={tech.id} className="border border-gray-700 bg-black/25 px-2 py-1 font-mono text-xs text-gray-300">
              {tech.value}
            </span>
          ))}
        </div>

        <div className="font-mono text-xs text-[#00ff88]">{profile.availabilityStatus || 'availability pending'}</div>
      </div>
    </aside>
  );
}
