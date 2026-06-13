'use client';

import { ArrowDown, ArrowUp, Eye, EyeOff, Star, Archive, Pencil } from 'lucide-react';
import type { ProjectEditorValue } from './types';
import { ProjectStatusBadge } from './ProjectStatusBadge';

type ProjectListProps = {
  disabled: boolean;
  pending: boolean;
  projects: ProjectEditorValue[];
  selectedProjectId: string | null;
  onArchive: (projectId: string) => void;
  onEdit: (project: ProjectEditorValue) => void;
  onMove: (projectId: string, direction: 'up' | 'down') => void;
  onSetFeatured: (projectId: string) => void;
  onToggleActive: (project: ProjectEditorValue) => void;
};

function actionClass(disabled: boolean) {
  return `inline-flex items-center gap-1 border px-2 py-1 font-mono text-[11px] transition-colors ${
    disabled
      ? 'cursor-not-allowed border-gray-800 text-gray-700'
      : 'border-gray-700 text-gray-400 hover:border-cyan-400/35 hover:text-cyan-300'
  }`;
}

export function ProjectList({
  disabled,
  pending,
  projects,
  selectedProjectId,
  onArchive,
  onEdit,
  onMove,
  onSetFeatured,
  onToggleActive,
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6 font-mono text-xs text-gray-500">
        No projects exist for this portfolio yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left font-mono text-xs">
        <thead className="border-b border-gray-800 text-gray-500">
          <tr>
            <th className="px-4 py-3 font-medium">Project</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => {
            const rowDisabled = disabled || pending || !project.id;
            const selected = project.id === selectedProjectId;

            return (
              <tr key={project.id ?? project.slug} className={`border-b border-gray-900 last:border-0 ${selected ? 'bg-[#00ff88]/5' : ''}`}>
                <td className="px-4 py-3">
                  <div className="text-gray-200">{project.title || 'Untitled project'}</div>
                  <div className="mt-1 text-gray-600">/{project.slug || 'draft'}</div>
                </td>
                <td className="px-4 py-3 text-gray-400">{project.category || 'unset'}</td>
                <td className="px-4 py-3 text-gray-400">{project.role || 'unset'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.isFeatured && <ProjectStatusBadge label="FEATURED" tone="green" />}
                    <ProjectStatusBadge label={project.isPrivate ? 'PRIVATE' : 'PUBLIC'} tone={project.isPrivate ? 'amber' : 'cyan'} />
                    <ProjectStatusBadge label={project.isActive ? 'ACTIVE' : 'INACTIVE'} tone={project.isActive ? 'green' : 'gray'} />
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400">{project.orderIndex}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <button type="button" onClick={() => onEdit(project)} className={actionClass(pending)}>
                      <Pencil className="h-3 w-3" aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={rowDisabled || project.isFeatured}
                      onClick={() => project.id && onSetFeatured(project.id)}
                      className={actionClass(rowDisabled || project.isFeatured)}
                    >
                      <Star className="h-3 w-3" aria-hidden="true" />
                      Featured
                    </button>
                    <button type="button" disabled={rowDisabled} onClick={() => onToggleActive(project)} className={actionClass(rowDisabled)}>
                      {project.isActive ? <EyeOff className="h-3 w-3" aria-hidden="true" /> : <Eye className="h-3 w-3" aria-hidden="true" />}
                      {project.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button type="button" disabled={rowDisabled} onClick={() => project.id && onArchive(project.id)} className={actionClass(rowDisabled)}>
                      <Archive className="h-3 w-3" aria-hidden="true" />
                      Archive
                    </button>
                    <button type="button" disabled={rowDisabled || index === 0} onClick={() => project.id && onMove(project.id, 'up')} className={actionClass(rowDisabled || index === 0)}>
                      <ArrowUp className="h-3 w-3" aria-hidden="true" />
                      Up
                    </button>
                    <button
                      type="button"
                      disabled={rowDisabled || index === projects.length - 1}
                      onClick={() => project.id && onMove(project.id, 'down')}
                      className={actionClass(rowDisabled || index === projects.length - 1)}
                    >
                      <ArrowDown className="h-3 w-3" aria-hidden="true" />
                      Down
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
