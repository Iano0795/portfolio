'use client';

import {
  Mail,
  Linkedin,
  Github,
  Globe,
  Phone,
  MessageCircle,
  FileText,
  ExternalLink,
  Link as LinkIcon,
} from 'lucide-react';
import type { ContactLinkEditorValue } from './types';

type ContactPreviewCardProps = {
  contactLink: ContactLinkEditorValue | null;
};

function getIconComponent(iconKey: string) {
  const iconMap: Record<string, React.ElementType> = {
    mail: Mail,
    linkedin: Linkedin,
    github: Github,
    globe: Globe,
    phone: Phone,
    'message-circle': MessageCircle,
    'file-text': FileText,
    'external-link': ExternalLink,
    link: LinkIcon,
  };

  return iconMap[iconKey.toLowerCase()] || LinkIcon;
}

export function ContactPreviewCard({ contactLink }: ContactPreviewCardProps) {
  if (!contactLink) {
    return (
      <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6">
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <LinkIcon className="h-12 w-12 text-gray-700" aria-hidden="true" />
          <p className="font-mono text-xs text-gray-500">No contact link selected</p>
        </div>
      </div>
    );
  }

  const hasContent = contactLink.label || contactLink.url;

  if (!hasContent) {
    return (
      <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6">
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <LinkIcon className="h-12 w-12 text-gray-600" aria-hidden="true" />
          <p className="font-mono text-xs text-gray-500">Preview will appear as you type</p>
        </div>
      </div>
    );
  }

  const IconComponent = getIconComponent(contactLink.icon || 'link');

  return (
    <div className="border border-cyan-400/20 bg-[#090d16]/80">
      <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">Link Preview</div>

      <div className="space-y-4 p-4">
        <div className="flex items-start gap-3 border border-cyan-400/20 bg-[#050812]/40 p-4 transition-all hover:border-cyan-400/30 hover:bg-[#050812]/60">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-cyan-400/30 bg-cyan-400/10">
            <IconComponent className="h-5 w-5 text-cyan-400" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            {contactLink.label && (
              <div className="font-mono text-sm font-medium text-white">{contactLink.label}</div>
            )}
            {contactLink.type && (
              <div className="mt-1 font-mono text-xs text-gray-400">{contactLink.type}</div>
            )}
            {contactLink.url && (
              <div className="mt-2 break-all font-mono text-xs text-cyan-400">{contactLink.url}</div>
            )}
          </div>

          <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-500" aria-hidden="true" />
        </div>

        <div className="space-y-2 border-t border-cyan-400/10 pt-3 font-mono text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="text-cyan-400">{contactLink.type || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span>Icon:</span>
            <span className="text-cyan-400">{contactLink.icon || 'link'}</span>
          </div>
          <div className="flex justify-between">
            <span>Order:</span>
            <span className="text-cyan-400">#{contactLink.orderIndex}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={contactLink.isActive ? 'text-[#00ff88]' : 'text-gray-500'}>
              {contactLink.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
