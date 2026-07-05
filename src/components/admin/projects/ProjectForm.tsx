'use client';

import { useEffect, useState } from 'react';
import type { ProjectEditorValue } from './types';
import { ProjectStackFields } from './ProjectStackFields';

type ProjectFormProps = {
  disabled: boolean;
  mode: 'create' | 'edit';
  pending: boolean;
  project: ProjectEditorValue;
  onCancel: () => void;
  onChange: (project: ProjectEditorValue) => void;
  onSave: () => void;
};

type TextFieldProps = {
  disabled: boolean;
  label: string;
  name: keyof ProjectEditorValue;
  onChange: (name: keyof ProjectEditorValue, value: string) => void;
  placeholder?: string;
  textarea?: boolean;
  value: string;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function TextField({ disabled, label, name, onChange, placeholder, textarea = false, value }: TextFieldProps) {
  const className =
    'w-full border border-gray-700 bg-black/30 px-3 py-2 font-mono text-xs text-gray-200 placeholder:text-gray-600 focus:border-cyan-400/50 focus:outline-none disabled:text-gray-600';

  return (
    <label className="block">
      <span className="mb-2 block font-mono text-xs text-gray-500">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          disabled={disabled}
          className={`${className} min-h-24 resize-y`}
          placeholder={placeholder}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          disabled={disabled}
          className={className}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

export function ProjectForm({ disabled, mode, pending, project, onCancel, onChange, onSave }: ProjectFormProps) {
  const readOnly = disabled || pending;
  const [slugEdited, setSlugEdited] = useState(mode === 'edit');

  useEffect(() => {
    setSlugEdited(mode === 'edit');
  }, [mode, project.id]);

  const updateField = (name: keyof ProjectEditorValue, value: string) => {
    const nextProject = {
      ...project,
      [name]: value,
    };

    if (name === 'slug') {
      setSlugEdited(true);
    }

    if (mode === 'create' && name === 'title' && !slugEdited) {
      nextProject.slug = slugify(value);
    }

    onChange(nextProject);
  };

  const updateNumber = (name: keyof ProjectEditorValue, value: string) => {
    onChange({
      ...project,
      [name]: Number.parseInt(value, 10) || 0,
    });
  };

  const updateBoolean = (name: keyof ProjectEditorValue, value: boolean) => {
    onChange({
      ...project,
      [name]: value,
    });
  };

  return (
    <section className="space-y-5 border border-cyan-400/20 bg-[#090d16]/80 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-4">
        <div>
          <div className="mb-1 font-mono text-xs text-cyan-400">{mode === 'create' ? 'project.create' : 'project.edit'}</div>
          <h2 className="text-xl font-semibold text-white">{mode === 'create' ? 'New Project' : project.title || 'Edit Project'}</h2>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="border border-gray-700 px-3 py-2 font-mono text-xs text-gray-400 transition-colors hover:border-cyan-400/35 hover:text-cyan-300 disabled:cursor-not-allowed disabled:text-gray-700"
        >
          Close
        </button>
      </div>

      <section className="space-y-4">
        <h3 className="font-mono text-xs text-cyan-400">Basic Info</h3>
        <TextField disabled={readOnly} label="Title" name="title" value={project.title} onChange={updateField} />
        <TextField disabled={readOnly} label="Slug" name="slug" value={project.slug} onChange={updateField} placeholder="url-safe-project-slug" />
        <div className="grid gap-4 md:grid-cols-2">
          <TextField disabled={readOnly} label="Category" name="category" value={project.category} onChange={updateField} />
          <TextField disabled={readOnly} label="Role" name="role" value={project.role} onChange={updateField} />
        </div>
        <TextField
          disabled={readOnly}
          label="Short description"
          name="shortDescription"
          value={project.shortDescription}
          onChange={updateField}
          textarea
        />
      </section>

      <section className="space-y-4 border-t border-gray-800 pt-5">
        <h3 className="font-mono text-xs text-cyan-400">Case Study Details</h3>
        <TextField disabled={readOnly} label="Problem" name="problem" value={project.problem} onChange={updateField} textarea />
        <TextField disabled={readOnly} label="Solution" name="solution" value={project.solution} onChange={updateField} textarea />
        <TextField disabled={readOnly} label="Outcome" name="outcome" value={project.outcome} onChange={updateField} textarea />
      </section>

      <section className="border-t border-gray-800 pt-5">
        <ProjectStackFields
          disabled={readOnly}
          stack={project.stack}
          onChange={(stack) =>
            onChange({
              ...project,
              stack,
            })
          }
        />
      </section>

      <section className="space-y-4 border-t border-gray-800 pt-5">
        <h3 className="font-mono text-xs text-cyan-400">Links</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField disabled={readOnly} label="GitHub URL" name="githubUrl" value={project.githubUrl} onChange={updateField} />
          <TextField disabled={readOnly} label="Live URL" name="liveUrl" value={project.liveUrl} onChange={updateField} />
          <TextField disabled={readOnly} label="Case study URL" name="caseStudyUrl" value={project.caseStudyUrl} onChange={updateField} />
          <TextField disabled={readOnly} label="Image URL" name="imageUrl" value={project.imageUrl} onChange={updateField} />
        </div>
      </section>

      <section className="space-y-4 border-t border-gray-800 pt-5">
        <h3 className="font-mono text-xs text-cyan-400">Visibility</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex items-center gap-3 border border-gray-800 bg-black/20 px-3 py-2 font-mono text-xs text-gray-400">
            <input
              type="checkbox"
              checked={project.isFeatured}
              onChange={(event) => updateBoolean('isFeatured', event.target.checked)}
              disabled={readOnly}
              className="h-4 w-4 accent-[#00ff88]"
            />
            Featured
          </label>
          <label className="flex items-center gap-3 border border-gray-800 bg-black/20 px-3 py-2 font-mono text-xs text-gray-400">
            <input
              type="checkbox"
              checked={project.isPrivate}
              onChange={(event) => updateBoolean('isPrivate', event.target.checked)}
              disabled={readOnly}
              className="h-4 w-4 accent-[#00ff88]"
            />
            Private project
          </label>
          <label className="flex items-center gap-3 border border-gray-800 bg-black/20 px-3 py-2 font-mono text-xs text-gray-400">
            <input
              type="checkbox"
              checked={project.isActive}
              onChange={(event) => updateBoolean('isActive', event.target.checked)}
              disabled={readOnly}
              className="h-4 w-4 accent-[#00ff88]"
            />
            Active/published
          </label>
        </div>
        <label className="block max-w-48">
          <span className="mb-2 block font-mono text-xs text-gray-500">Order index</span>
          <input
            type="number"
            value={project.orderIndex}
            onChange={(event) => updateNumber('orderIndex', event.target.value)}
            disabled={readOnly}
            className="w-full border border-gray-700 bg-black/30 px-3 py-2 font-mono text-xs text-gray-200 focus:border-cyan-400/50 focus:outline-none disabled:text-gray-600"
          />
        </label>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-gray-800 pt-5">
        <button
          type="button"
          disabled={readOnly}
          onClick={onSave}
          className="border border-[#00ff88]/45 bg-[#00ff88]/10 px-4 py-2.5 font-mono text-sm text-[#00ff88] shadow-[0_0_16px_rgba(0,255,136,0.12)] transition-all hover:bg-[#00ff88]/18 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-600"
        >
          {pending ? 'Saving project...' : mode === 'create' ? 'Create project' : 'Save project'}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="border border-cyan-400/30 px-4 py-2.5 font-mono text-sm text-cyan-300 transition-colors hover:border-[#00ff88]/45 hover:text-[#00ff88] disabled:cursor-not-allowed disabled:text-gray-600"
        >
          Reset view
        </button>
      </div>
    </section>
  );
}
