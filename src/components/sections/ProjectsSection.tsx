'use client';

import { useEffect, useState } from 'react';
import type { ProjectFilter, ProjectsData } from '@/types/portfolio';

type ProjectsSectionProps = {
  data: ProjectsData;
};

export function ProjectsSection({ data }: ProjectsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>(data.defaultFilter);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 160);
    return () => clearTimeout(timer);
  }, []);

  const filteredProjects = activeFilter === data.defaultFilter
    ? data.projects
    : data.projects.filter((project) => project.category.includes(activeFilter));

  return (
    <section className="w-full max-w-7xl mx-auto">
      <div className="mb-7">
        <div className="font-mono text-xs text-[#00ff88] mb-3">{data.eyebrow}</div>
        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">{data.heading}</h2>
        <div className="flex flex-wrap gap-2">
          {data.filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`font-mono text-xs md:text-sm px-3 py-2 border transition-all ${
                activeFilter === filter
                  ? 'bg-[#00ff88]/10 border-[#00ff88]/45 text-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.14)]'
                  : 'bg-[#090d16] border-gray-700 text-gray-400 hover:border-cyan-400/35 hover:text-cyan-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {activeFilter === data.defaultFilter && (
        <article
          className={`mb-6 border border-[#00ff88]/35 bg-[#090d16]/85 p-5 md:p-6 shadow-[0_0_28px_rgba(0,255,136,0.11)] transition-all duration-500 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
            <div>
              <div className="font-mono text-xs text-[#00ff88] mb-2">{data.featuredBuild.label}</div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">{data.featuredBuild.title}</h3>
            </div>
            <div className="font-mono text-xs text-cyan-300 border border-cyan-400/25 px-3 py-2 bg-cyan-400/5">
              {data.featuredBuild.badge}
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-3">
            {data.featuredBuild.fields.map(({ label, value }) => (
              <div key={label} className="border border-gray-800 bg-black/20 p-4">
                <div className="font-mono text-xs text-gray-500 mb-2">{label}</div>
                <p className="text-sm text-gray-300 leading-relaxed">{value}</p>
              </div>
            ))}
          </div>
        </article>
      )}

      <div className="grid lg:grid-cols-[1fr_0.55fr] gap-6">
        <div>
          <div className="font-mono text-xs text-cyan-400 mb-3">{data.indexLabel}</div>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredProjects.map((project, index) => (
              <article
                key={project.title}
                className={`border border-gray-700 bg-[#090d16]/80 p-5 hover:border-[#00ff88]/35 hover:-translate-y-0.5 transition-all duration-500 ${
                  showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${index * 85 + 120}ms` }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-lg md:text-xl font-bold text-white leading-tight">{project.title}</h3>
                  <span className="font-mono text-xs text-gray-600">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div className="font-mono text-xs text-cyan-300 mb-3">{project.role}</div>
                <p className="text-gray-400 mb-4 text-sm leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.stack.map((tech) => (
                    <span key={tech} className="font-mono text-xs px-2 py-1 bg-black/25 border border-gray-800 text-gray-300">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="font-mono text-xs text-gray-500 border-t border-gray-800 pt-3">{project.access}</div>
              </article>
            ))}
          </div>
        </div>

        <aside className="border border-cyan-400/20 bg-black/25 p-5 h-fit">
          <div className="font-mono text-xs text-cyan-400 mb-4">{data.caseStudyPreviewLabel}</div>
          <div className="space-y-4">
            {data.caseStudyPreviewItems.map((item, index) => (
              <div key={item} className="flex gap-3">
                <span className="font-mono text-[#00ff88] text-xs mt-1">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <div className="font-mono text-sm text-gray-300">{item}</div>
                  <div className="text-xs text-gray-600">{data.caseStudyPreviewMeta}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
