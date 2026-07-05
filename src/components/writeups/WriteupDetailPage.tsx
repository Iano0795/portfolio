import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Clock, Code2, Github, Shield } from 'lucide-react';
import type { LabWriteup } from '@/types/portfolio';
import { extractGithubArtifacts, extractMarkdownSections, renderMarkdown } from '@/lib/writeups/markdown-renderer';

type WriteupDetailPageProps = {
  writeup: LabWriteup;
};

function formatPublishedDate(value?: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function Cover({ writeup }: { writeup: LabWriteup }) {
  if (writeup.cover_image_url) {
    return (
      <div className="relative aspect-[21/8] min-h-[220px] overflow-hidden border-b border-cyan-400/15 bg-black">
        <img src={writeup.cover_image_url} alt="" className="h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050812] via-[#050812]/25 to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative aspect-[21/8] min-h-[220px] overflow-hidden border-b border-cyan-400/15 bg-[#050812]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,255,136,0.20),transparent_35%),linear-gradient(45deg,rgba(34,211,238,0.16),transparent_46%)]" />
      <div className="absolute bottom-6 left-6 flex items-center gap-3 font-mono text-sm text-cyan-200">
        <Shield className="h-5 w-5 text-[#00ff88]" aria-hidden="true" />
        public.writeup.reader
      </div>
    </div>
  );
}

function DetailMeta({ writeup }: { writeup: LabWriteup }) {
  const publishedDate = formatPublishedDate(writeup.published_at);
  const items = [
    writeup.platform,
    writeup.difficulty,
    writeup.category,
    writeup.lab_type,
    publishedDate,
    writeup.reading_time_minutes ? `${writeup.reading_time_minutes} min read` : null,
  ].filter(Boolean);

  return (
    <div className="flex flex-wrap gap-2 font-mono text-[10px]">
      {items.map((item) => (
        <span key={item} className="border border-cyan-400/25 bg-cyan-400/5 px-2 py-1 text-cyan-200">
          {item}
        </span>
      ))}
    </div>
  );
}

export function WriteupDetailPage({ writeup }: WriteupDetailPageProps) {
  const markdown = writeup.content_markdown?.trim() ?? '';
  const sections = extractMarkdownSections(markdown);
  const githubArtifacts = extractGithubArtifacts(markdown);

  return (
    <main className="min-h-screen bg-[#050812] text-gray-200">
      <div className="pointer-events-none fixed inset-0 opacity-[0.04] [background-image:linear-gradient(#00ff88_1px,transparent_1px),linear-gradient(90deg,#22d3ee_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative mx-auto max-w-[1500px] px-4 py-5 md:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-4 border border-cyan-400/20 bg-[#090d16]/90 px-4 py-3">
          <Link href="/#writeups" className="inline-flex items-center gap-2 font-mono text-xs text-cyan-300 hover:text-[#00ff88]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            writeups.index
          </Link>
          <div className="hidden items-center gap-2 font-mono text-xs text-gray-600 sm:inline-flex">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            public retired lab content
          </div>
        </div>

        <article className="overflow-hidden border border-cyan-400/20 bg-[#090d16]/90 shadow-[0_0_34px_rgba(0,255,136,0.08)]">
          <Cover writeup={writeup} />
          <header className="space-y-5 p-5 md:p-8">
            <DetailMeta writeup={writeup} />
            <div className="max-w-5xl">
              <h1 className="text-3xl font-bold leading-tight text-white md:text-5xl">{writeup.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-gray-400">
                {writeup.public_summary || writeup.public_teaser || 'Public lab writeup notes.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[...writeup.tools, ...writeup.tags].slice(0, 10).map((item) => (
                <span key={item} className="border border-gray-800 bg-black/30 px-2 py-1 font-mono text-[10px] text-gray-300">
                  {item}
                </span>
              ))}
            </div>
          </header>
        </article>

        <div className="mt-5 grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
          <aside className="h-fit border border-cyan-400/20 bg-[#090d16]/85 p-4 xl:sticky xl:top-5">
            <div className="mb-4 font-mono text-xs text-cyan-400">Section Nav</div>
            {sections.length > 0 ? (
              <nav className="space-y-1" aria-label="Writeup sections">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`block border-l px-3 py-2 font-mono text-xs transition-colors hover:border-[#00ff88] hover:text-[#00ff88] ${
                      section.depth === 3
                        ? 'ml-3 border-cyan-400/10 text-gray-500'
                        : 'border-cyan-400/25 text-gray-300'
                    }`}
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            ) : (
              <p className="font-mono text-xs leading-6 text-gray-500">No Markdown headings found.</p>
            )}
          </aside>

          <section className="min-w-0 border border-cyan-400/20 bg-[#090d16]/88 p-5 md:p-8">
            {markdown ? (
              <div className="space-y-6">{renderMarkdown(markdown, sections)}</div>
            ) : (
              <div className="border border-dashed border-cyan-400/20 bg-black/20 p-5 font-mono text-xs text-gray-500">
                Full public content has not been added for this writeup.
              </div>
            )}
          </section>

          <aside className="h-fit space-y-4 border border-cyan-400/20 bg-[#090d16]/85 p-4 xl:sticky xl:top-5">
            <div>
              <div className="mb-2 flex items-center gap-2 font-mono text-xs text-cyan-400">
                <Github className="h-4 w-4" aria-hidden="true" />
                GitHub Artifacts
              </div>
              <p className="text-xs leading-6 text-gray-500">
                Exploit scripts, proof-of-concept repos, or gist links referenced in the writeup.
              </p>
            </div>

            {githubArtifacts.length > 0 ? (
              <div className="space-y-2">
                {githubArtifacts.map((artifact) => (
                  <a
                    key={artifact.url}
                    href={artifact.url}
                    className="group block border border-gray-800 bg-black/25 p-3 transition-colors hover:border-[#00ff88]/35"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 font-mono text-[10px] text-[#00ff88]">
                        <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {artifact.source}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-cyan-300" aria-hidden="true" />
                    </div>
                    <div className="break-words text-sm leading-6 text-gray-300">{artifact.label}</div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-gray-800 bg-black/20 p-3 font-mono text-xs leading-6 text-gray-500">
                No public GitHub exploit artifacts are linked in this writeup yet.
              </div>
            )}

            <div className="border-t border-cyan-400/10 pt-4">
              <div className="mb-2 font-mono text-xs text-cyan-400">Toolchain</div>
              <div className="flex flex-wrap gap-2">
                {writeup.tools.length > 0 ? (
                  writeup.tools.map((tool) => (
                    <span key={tool} className="border border-gray-800 bg-black/25 px-2 py-1 font-mono text-[10px] text-gray-300">
                      {tool}
                    </span>
                  ))
                ) : (
                  <span className="font-mono text-xs text-gray-500">No tools listed.</span>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
