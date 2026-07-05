'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import type { Portfolio, PortfolioRole } from '@/types/portfolio';
import { ProjectForm } from './ProjectForm';
import { ProjectList } from './ProjectList';
import { ProjectPreviewCard } from './ProjectPreviewCard';
import type { EditableListItem, ProjectEditorValue, ProjectMutationResult, ProjectPayload } from './types';

type ProjectsManagerProps = {
  archiveProject: (projectId: string) => Promise<ProjectMutationResult>;
  createProject: (payload: ProjectPayload) => Promise<ProjectMutationResult>;
  initialProjects: ProjectEditorValue[];
  portfolio: Portfolio;
  reorderProjects: (orderedProjectIds: string[]) => Promise<ProjectMutationResult>;
  role: PortfolioRole;
  setFeaturedProject: (projectId: string) => Promise<ProjectMutationResult>;
  toggleProjectActive: (projectId: string, isActive: boolean) => Promise<ProjectMutationResult>;
  updateProject: (projectId: string, payload: ProjectPayload) => Promise<ProjectMutationResult>;
};

function canSave(role: PortfolioRole) {
  return role === 'owner' || role === 'admin' || role === 'editor';
}

function createItem(value: string): EditableListItem {
  return {
    id: crypto.randomUUID(),
    value,
  };
}

function cloneProject(project: ProjectEditorValue): ProjectEditorValue {
  return {
    ...project,
    stack: project.stack.map((item) => createItem(item.value)),
  };
}

function sortedProjects(projects: ProjectEditorValue[]) {
  return [...projects].sort((a, b) => a.orderIndex - b.orderIndex || a.title.localeCompare(b.title));
}

function createDraftProject(nextOrderIndex: number): ProjectEditorValue {
  return {
    id: null,
    title: '',
    slug: '',
    category: '',
    role: '',
    shortDescription: '',
    problem: '',
    solution: '',
    outcome: '',
    stack: [],
    githubUrl: '',
    liveUrl: '',
    caseStudyUrl: '',
    imageUrl: '',
    orderIndex: nextOrderIndex,
    isFeatured: false,
    isPrivate: true,
    isActive: true,
  };
}

function projectToPayload(project: ProjectEditorValue): ProjectPayload {
  return {
    title: project.title,
    slug: project.slug,
    category: project.category,
    role: project.role,
    shortDescription: project.shortDescription,
    problem: project.problem,
    solution: project.solution,
    outcome: project.outcome,
    stack: project.stack.map((item) => item.value),
    githubUrl: project.githubUrl,
    liveUrl: project.liveUrl,
    caseStudyUrl: project.caseStudyUrl,
    imageUrl: project.imageUrl,
    orderIndex: project.orderIndex,
    isFeatured: project.isFeatured,
    isPrivate: project.isPrivate,
    isActive: project.isActive,
  };
}

export function ProjectsManager({
  archiveProject,
  createProject,
  initialProjects,
  portfolio,
  reorderProjects,
  role,
  setFeaturedProject,
  toggleProjectActive,
  updateProject,
}: ProjectsManagerProps) {
  const router = useRouter();
  const manager = canSave(role);
  const [projects, setProjects] = useState(() => sortedProjects(initialProjects));
  const [editingProject, setEditingProject] = useState<ProjectEditorValue | null>(null);
  const [message, setMessage] = useState<ProjectMutationResult>({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setProjects(sortedProjects(initialProjects));
  }, [initialProjects]);

  const nextOrderIndex = projects.length > 0 ? Math.max(...projects.map((project) => project.orderIndex)) + 1 : 0;
  const readOnly = !manager;

  const finishMutation = (result: ProjectMutationResult, closeEditor = false) => {
    setMessage(result);

    if (result.success) {
      if (closeEditor) {
        setEditingProject(null);
      }

      router.refresh();
    }
  };

  const runMutation = async (mutation: () => Promise<ProjectMutationResult>, closeEditor = false) => {
    if (pending) {
      return;
    }

    setPending(true);
    setMessage({});

    try {
      finishMutation(await mutation(), closeEditor);
    } finally {
      setPending(false);
    }
  };

  const handleNewProject = () => {
    if (readOnly) {
      return;
    }

    setMessage({});
    setEditingProject(createDraftProject(nextOrderIndex));
  };

  const handleSave = () => {
    if (!editingProject || readOnly) {
      return;
    }

    const payload = projectToPayload(editingProject);

    void runMutation(
      () => (editingProject.id ? updateProject(editingProject.id, payload) : createProject(payload)),
      true,
    );
  };

  const handleArchive = (projectId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => archiveProject(projectId));
  };

  const handleToggleActive = (project: ProjectEditorValue) => {
    if (!project.id || readOnly) {
      return;
    }

    void runMutation(() => toggleProjectActive(project.id as string, !project.isActive));
  };

  const handleSetFeatured = (projectId: string) => {
    if (readOnly) {
      return;
    }

    void runMutation(() => setFeaturedProject(projectId));
  };

  const handleMove = (projectId: string, direction: 'up' | 'down') => {
    if (readOnly) {
      return;
    }

    const ordered = sortedProjects(projects);
    const currentIndex = ordered.findIndex((project) => project.id === projectId);
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= ordered.length) {
      return;
    }

    const reordered = [...ordered];
    const [project] = reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, project);

    setProjects(reordered.map((item, index) => ({ ...item, orderIndex: index })));
    void runMutation(() => reorderProjects(reordered.map((item) => item.id).filter((id): id is string => Boolean(id))));
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="border border-[#00ff88]/25 bg-[#090d16]/80 p-5 shadow-[0_0_30px_rgba(0,255,136,0.07)] md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-cyan-400">projects.manager</span>
          <span className="border border-[#00ff88]/25 px-2 py-1 text-[#00ff88]">{portfolio.title}</span>
          <span className="border border-cyan-400/25 px-2 py-1 text-cyan-300">{role}</span>
          {readOnly && <span className="border border-[#ffbd2e]/35 px-2 py-1 text-[#ffbd2e]">Read-only access</span>}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-4xl">Projects Manager</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">
              Manage portfolio builds, case studies, and project visibility.
            </p>
          </div>
          <button
            type="button"
            disabled={readOnly || pending}
            onClick={handleNewProject}
            className="inline-flex items-center gap-2 border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Project
          </button>
        </div>
      </header>

      {message.error && (
        <div className="border border-[#ff5f56]/35 bg-[#ff5f56]/10 px-3 py-2 font-mono text-xs text-[#ffb4ad]" role="alert">
          {message.error}
        </div>
      )}
      {message.success && (
        <div className="border border-[#00ff88]/35 bg-[#00ff88]/10 px-3 py-2 font-mono text-xs text-[#00ff88]" role="status">
          {message.success}
        </div>
      )}

      <section className="border border-cyan-400/20 bg-[#090d16]/80">
        <div className="border-b border-cyan-400/10 px-4 py-3 font-mono text-xs text-cyan-400">Project Index</div>
        <ProjectList
          disabled={readOnly}
          pending={pending}
          projects={projects}
          selectedProjectId={editingProject?.id ?? null}
          onArchive={handleArchive}
          onEdit={(project) => {
            setMessage({});
            setEditingProject(cloneProject(project));
          }}
          onMove={handleMove}
          onSetFeatured={handleSetFeatured}
          onToggleActive={handleToggleActive}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        {editingProject ? (
          <ProjectForm
            disabled={readOnly}
            mode={editingProject.id ? 'edit' : 'create'}
            pending={pending}
            project={editingProject}
            onCancel={() => setEditingProject(null)}
            onChange={setEditingProject}
            onSave={handleSave}
          />
        ) : (
          <div className="border border-dashed border-cyan-400/20 bg-black/20 p-6 font-mono text-xs text-gray-500">
            Select Edit on a project or start a new project record.
          </div>
        )}

        <ProjectPreviewCard project={editingProject} />
      </section>
    </div>
  );
}
