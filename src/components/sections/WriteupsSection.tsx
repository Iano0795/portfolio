'use client';

import Link from 'next/link';
import { ArrowUpRight, BookOpen, Clock, Shield } from 'lucide-react';
import type { LabWriteup, WriteupsData } from '@/types/portfolio';

type WriteupsSectionProps = {
  data: WriteupsData;
};

function metaParts(writeup: LabWriteup) {
  return [writeup.platform, writeup.difficulty, writeup.category].filter(Boolean);
}

function formatPublishedDate(value?: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(value));
}

function CoverFrame({ writeup }: { writeup: LabWriteup }) {
  if (writeup.cover_image_url) {
    return (
      <div className="relative aspect-[16/9] overflow-hidden border-b border-cyan-400/15 bg-black">
        <img
          src={writeup.cover_image_url}
          alt=""
          className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.025]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050812] via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] overflow-hidden border-b border-cyan-400/15 bg-[#050812]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,255,136,0.18),transparent_34%),linear-gradient(45deg,rgba(34,211,238,0.14),transparent_45%)]" />
      <div className="absolute inset-x-5 bottom-5 flex items-center gap-3 font-mono text-xs text-cyan-300">
        <Shield className="h-4 w-4 text-[#00ff88]" aria-hidden="true" />
        public.writeup
      </div>
    </div>
  );
}

export function WriteupsSection({ data }: WriteupsSectionProps) {
  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="mb-7">
        <div className="mb-3 font-mono text-xs text-[#00ff88]">{data.eyebrow}</div>
        <h2 className="mb-4 text-3xl font-bold leading-tight text-white md:text-4xl">{data.heading}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-gray-400 md:text-base">{data.intro}</p>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="font-mono text-xs text-cyan-400">{data.indexLabel}</div>
        <div className="font-mono text-xs text-gray-600">{data.writeups.length} published</div>
      </div>

      {data.writeups.length === 0 ? (
        <div className="border border-dashed border-cyan-400/25 bg-black/20 p-6 font-mono text-xs text-gray-500">
          {data.emptyLabel}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.writeups.map((writeup, index) => {
            const publishedDate = formatPublishedDate(writeup.published_at);

            return (
              <article
                key={writeup.id}
                className="group overflow-hidden border border-gray-700 bg-[#090d16]/82 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00ff88]/35 hover:shadow-[0_0_26px_rgba(0,255,136,0.08)]"
              >
                <CoverFrame writeup={writeup} />
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3 font-mono text-xs">
                    <span className="text-cyan-300">{String(index + 1).padStart(2, '0')}</span>
                    {publishedDate ? <span className="text-gray-600">{publishedDate}</span> : null}
                  </div>
                  <h3 className="mb-3 text-xl font-bold leading-tight text-white">{writeup.title}</h3>
                  <div className="mb-3 flex flex-wrap gap-2 font-mono text-[10px]">
                    {metaParts(writeup).map((item) => (
                      <span key={item} className="border border-cyan-400/20 bg-cyan-400/5 px-2 py-1 text-cyan-200">
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-400">
                    {writeup.public_teaser || writeup.public_summary || 'Public writeup notes are available.'}
                  </p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {writeup.tools.slice(0, 4).map((tool) => (
                      <span key={tool} className="border border-gray-800 bg-black/25 px-2 py-1 font-mono text-[10px] text-gray-300">
                        {tool}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-gray-800 pt-4">
                    <div className="inline-flex items-center gap-2 font-mono text-[10px] text-gray-500">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {writeup.reading_time_minutes ? `${writeup.reading_time_minutes} min read` : 'read time pending'}
                    </div>
                    <Link
                      href={`/writeups/${writeup.slug}`}
                      className="inline-flex items-center gap-2 font-mono text-xs text-[#00ff88] transition-colors hover:text-cyan-300"
                    >
                      <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                      Read
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
