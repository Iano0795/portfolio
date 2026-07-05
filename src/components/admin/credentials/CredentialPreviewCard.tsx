import { Award, ExternalLink } from 'lucide-react';
import { CredentialStatusBadge } from './CredentialStatusBadge';
import type { CredentialEditorValue } from './types';

type CredentialPreviewCardProps = {
  credential: CredentialEditorValue | null;
};

export function CredentialPreviewCard({ credential }: CredentialPreviewCardProps) {
  if (!credential) {
    return (
      <aside className="border border-dashed border-cyan-400/20 bg-black/20 p-5 font-mono text-xs text-gray-500">
        Select or create a credential to preview the public-facing record.
      </aside>
    );
  }

  return (
    <aside className="space-y-4 border border-cyan-400/20 bg-[#090d16]/80 p-5">
      <div className="flex items-start justify-between gap-3 border-b border-gray-800 pb-4">
        <div>
          <div className="mb-1 font-mono text-xs text-cyan-400">credential.preview</div>
          <h2 className="text-xl font-semibold text-white">{credential.title || 'Untitled credential'}</h2>
          <p className="mt-1 font-mono text-xs text-gray-500">{credential.issuer || 'Issuer pending'}</p>
        </div>
        <Award className="h-5 w-5 text-[#00ff88]" aria-hidden="true" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {credential.isFeatured && <CredentialStatusBadge label="FEATURED" tone="green" />}
        <CredentialStatusBadge label={credential.isActive ? 'ACTIVE' : 'ARCHIVED'} tone={credential.isActive ? 'cyan' : 'gray'} />
        {credential.credentialType && <CredentialStatusBadge label={credential.credentialType} tone="amber" />}
      </div>

      {credential.description && <p className="text-sm leading-relaxed text-gray-400">{credential.description}</p>}

      <dl className="grid gap-2 font-mono text-xs">
        <div className="flex justify-between gap-4 border-b border-gray-900 pb-2">
          <dt className="text-gray-600">Issued</dt>
          <dd className="text-gray-300">{credential.issuedAt || 'unset'}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-gray-900 pb-2">
          <dt className="text-gray-600">Expires</dt>
          <dd className="text-gray-300">{credential.expiresAt || 'unset'}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">Order</dt>
          <dd className="text-gray-300">#{credential.orderIndex}</dd>
        </div>
      </dl>

      {credential.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {credential.skills
            .map((skill) => ({ ...skill, value: skill.value.trim() }))
            .filter((skill) => skill.value)
            .map((skill) => (
              <span key={skill.id} className="border border-cyan-400/20 bg-cyan-400/5 px-2 py-1 font-mono text-[11px] text-cyan-300">
                {skill.value}
              </span>
            ))}
        </div>
      )}

      {credential.credentialUrl && (
        <div className="border-t border-gray-800 pt-4">
          <span className="inline-flex items-center gap-2 font-mono text-xs text-[#00ff88]">
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Verification URL attached
          </span>
        </div>
      )}
    </aside>
  );
}
