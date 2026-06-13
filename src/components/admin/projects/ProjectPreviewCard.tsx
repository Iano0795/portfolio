import { ExternalLink, Lock, Unlock } from 'lucide-react';
import type { ProjectEditorValue } from './types';
import { ProjectStatusBadge } from './ProjectStatusBadge';

type ProjectPreviewCardProps = {
  project: ProjectEditorValue | null;
};

export function ProjectPreviewCard({ project }: ProjectPreviewCardProps) {
  if (!project) {
    return (
      <aside className="border border-cyan-400/20 bg-black/25 p-5">
        <div className="mb-3 font-mono text-xs text-cyan-400">project.preview</div>
        <p className="font-mono text-xs leading-relaxed text-gray-500">Select a project or create a new build record to preview metadata.</p>
      </aside>
    );
  }

  return (
    <aside className="space-y-4 border border-cyan-400/20 bg-black/25 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="font-mono text-xs text-cyan-400">project.preview</div>
        {project.isPrivate ? <Lock className="h-4 w-4 text-[#ffbd2e]" aria-hidden="true" /> : <Unlock className="h-4 w-4 text-[#00ff88]" aria-hidden="true" />}
      </div>

      <div>
        <div className="mb-2 flex flex-wrap gap-2">
          {project.isFeatured && <ProjectStatusBadge label="FEATURED" tone="green" />}
          <ProjectStatusBadge label={project.isPrivate ? 'PRIVATE' : 'PUBLIC'} tone={project.isPrivate ? 'amber' : 'cyan'} />
          <ProjectStatusBadge label={project.isActive ? 'ACTIVE' : 'INACTIVE'} tone={project.isActive ? 'green' : 'gray'} />
        </div>
        <h2 className="mb-2 text-xl font-semibold leading-tight text-white">{project.title || 'Untitled project'}</h2>
        <div className="mb-4 font-mono text-xs text-gray-500">/{project.slug || 'project-slug'}</div>
        <p className="text-sm leading-relaxed text-gray-400">{project.shortDescription || 'Short description preview will render here.'}</p>
      </div>

      <div className="grid gap-2 font-mono text-xs text-gray-500">
        <div>
          <span className="text-cyan-300">category:</span> {project.category || 'unset'}
        </div>
        <div>
          <span className="text-cyan-300">role:</span> {project.role || 'unset'}
        </div>
        <div>
          <span className="text-cyan-300">order:</span> {project.orderIndex}
        </div>
      </div>

      {project.stack.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.stack
            .filter((tech) => tech.value.trim())
            .map((tech) => (
              <span key={tech.id} className="border border-gray-700 bg-[#090d16]/80 px-2 py-1 font-mono text-[11px] text-gray-300">
                {tech.value}
              </span>
            ))}
        </div>
      )}

      <div className="space-y-2 border-t border-gray-800 pt-4 font-mono text-xs text-gray-500">
        {[project.githubUrl, project.liveUrl, project.caseStudyUrl].filter(Boolean).length === 0 ? (
          <div>links.pending</div>
        ) : (
          [
            ['github', project.githubUrl],
            ['live', project.liveUrl],
            ['case-study', project.caseStudyUrl],
          ].map(([label, href]) =>
            href ? (
              <div key={label} className="flex items-center gap-2 text-cyan-300">
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </div>
            ) : null,
          )
        )}
      </div>
    </aside>
  );
}
