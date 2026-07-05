import type { ReactNode } from 'react';

export type MarkdownSection = {
  id: string;
  title: string;
  depth: 2 | 3;
};

export type GithubArtifact = {
  label: string;
  url: string;
  source: 'github' | 'gist' | 'code';
};

type MarkdownRenderState = {
  blocks: ReactNode[];
  paragraph: string[];
  list: string[];
  orderedList: string[];
  codeFence: string[] | null;
  codeLanguage: string | null;
  sectionsByTitle: Map<string, string[]>;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function uniqueId(base: string, used: Map<string, number>) {
  const cleanBase = base || 'section';
  const count = used.get(cleanBase) ?? 0;
  used.set(cleanBase, count + 1);

  return count === 0 ? cleanBase : `${cleanBase}-${count + 1}`;
}

export function extractMarkdownSections(markdown: string): MarkdownSection[] {
  const used = new Map<string, number>();

  return markdown
    .split(/\r?\n/)
    .flatMap((line): MarkdownSection[] => {
      const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());

      if (!match) {
        return [];
      }

      const title = match[2].replace(/#+$/, '').trim();

      return [
        {
          id: uniqueId(slugify(title), used),
          title,
          depth: match[1].length as 2 | 3,
        },
      ];
    });
}

function renderInline(value: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenPattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)]+)/g;
  let lastIndex = 0;
  let tokenIndex = 0;

  for (const match of value.matchAll(tokenPattern)) {
    if (match.index === undefined) {
      continue;
    }

    if (match.index > lastIndex) {
      nodes.push(value.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${tokenIndex}`;

    if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code key={key} className="border border-cyan-400/20 bg-cyan-400/5 px-1 py-0.5 font-mono text-[0.9em] text-cyan-200">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={key} className="font-semibold text-gray-100">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('[')) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);

      if (linkMatch) {
        nodes.push(
          <a
            key={key}
            href={linkMatch[2]}
            className="text-[#00ff88] underline decoration-[#00ff88]/35 underline-offset-4 hover:text-cyan-300"
            rel="noreferrer"
            target="_blank"
          >
            {linkMatch[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(
        <a
          key={key}
          href={token}
          className="text-[#00ff88] underline decoration-[#00ff88]/35 underline-offset-4 hover:text-cyan-300"
          rel="noreferrer"
          target="_blank"
        >
          {token}
        </a>,
      );
    }

    lastIndex = match.index + token.length;
    tokenIndex += 1;
  }

  if (lastIndex < value.length) {
    nodes.push(value.slice(lastIndex));
  }

  return nodes;
}

function flushParagraph(state: MarkdownRenderState) {
  if (state.paragraph.length === 0) {
    return;
  }

  const blockIndex = state.blocks.length;
  state.blocks.push(
    <p key={`p-${blockIndex}`} className="text-base leading-8 text-gray-300">
      {renderInline(state.paragraph.join(' '), `p-${blockIndex}`)}
    </p>,
  );
  state.paragraph = [];
}

function flushList(state: MarkdownRenderState) {
  if (state.list.length > 0) {
    const blockIndex = state.blocks.length;
    state.blocks.push(
      <ul key={`ul-${blockIndex}`} className="space-y-2 pl-5 text-sm leading-7 text-gray-300">
        {state.list.map((item, index) => (
          <li key={`${blockIndex}-${index}`} className="list-disc marker:text-[#00ff88]">
            {renderInline(item, `ul-${blockIndex}-${index}`)}
          </li>
        ))}
      </ul>,
    );
    state.list = [];
  }

  if (state.orderedList.length > 0) {
    const blockIndex = state.blocks.length;
    state.blocks.push(
      <ol key={`ol-${blockIndex}`} className="space-y-2 pl-5 text-sm leading-7 text-gray-300">
        {state.orderedList.map((item, index) => (
          <li key={`${blockIndex}-${index}`} className="list-decimal marker:text-[#00ff88]">
            {renderInline(item, `ol-${blockIndex}-${index}`)}
          </li>
        ))}
      </ol>,
    );
    state.orderedList = [];
  }
}

function flushOpenBlocks(state: MarkdownRenderState) {
  flushParagraph(state);
  flushList(state);
}

function sectionIdForTitle(state: MarkdownRenderState, title: string) {
  const ids = state.sectionsByTitle.get(title);

  if (!ids || ids.length === 0) {
    return undefined;
  }

  return ids.shift();
}

export function renderMarkdown(markdown: string, sections = extractMarkdownSections(markdown)): ReactNode[] {
  const state: MarkdownRenderState = {
    blocks: [],
    paragraph: [],
    list: [],
    orderedList: [],
    codeFence: null,
    codeLanguage: null,
    sectionsByTitle: sections.reduce((accumulator, section) => {
      const ids = accumulator.get(section.title) ?? [];
      ids.push(section.id);
      accumulator.set(section.title, ids);
      return accumulator;
    }, new Map<string, string[]>()),
  };

  markdown.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trimEnd();

    if (line.startsWith('```')) {
      if (state.codeFence) {
        const blockIndex = state.blocks.length;
        state.blocks.push(
          <pre key={`code-${blockIndex}`} className="overflow-x-auto border border-cyan-400/20 bg-black/35 p-4 text-xs leading-6 text-cyan-100">
            <code>{state.codeFence.join('\n')}</code>
          </pre>,
        );
        state.codeFence = null;
        state.codeLanguage = null;
      } else {
        flushOpenBlocks(state);
        state.codeFence = [];
        state.codeLanguage = line.slice(3).trim() || null;
      }

      return;
    }

    if (state.codeFence) {
      state.codeFence.push(rawLine);
      return;
    }

    if (!line.trim()) {
      flushOpenBlocks(state);
      return;
    }

    const imageMatch = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(line.trim());

    if (imageMatch) {
      flushOpenBlocks(state);
      const blockIndex = state.blocks.length;
      state.blocks.push(
        <figure key={`img-${blockIndex}`} className="overflow-hidden border border-cyan-400/20 bg-black/25">
          <img src={imageMatch[2]} alt={imageMatch[1]} className="w-full object-contain" loading="lazy" />
          {imageMatch[1] ? (
            <figcaption className="border-t border-cyan-400/10 px-3 py-2 font-mono text-[10px] text-gray-500">
              {imageMatch[1]}
            </figcaption>
          ) : null}
        </figure>,
      );
      return;
    }

    const headingMatch = /^(#{1,4})\s+(.+)$/.exec(line.trim());

    if (headingMatch) {
      flushOpenBlocks(state);
      const depth = headingMatch[1].length;
      const title = headingMatch[2].replace(/#+$/, '').trim();
      const id = depth === 2 || depth === 3 ? sectionIdForTitle(state, title) : undefined;
      const blockIndex = state.blocks.length;

      if (depth === 1) {
        state.blocks.push(
          <h2 key={`h1-${blockIndex}`} className="pt-4 text-3xl font-bold leading-tight text-white">
            {title}
          </h2>,
        );
      } else if (depth === 2) {
        state.blocks.push(
          <h2 id={id} key={`h2-${blockIndex}`} className="scroll-mt-24 pt-8 text-2xl font-bold leading-tight text-white">
            {title}
          </h2>,
        );
      } else {
        state.blocks.push(
          <h3 id={id} key={`h3-${blockIndex}`} className="scroll-mt-24 pt-6 text-xl font-semibold leading-tight text-cyan-100">
            {title}
          </h3>,
        );
      }

      return;
    }

    const unorderedMatch = /^[-*]\s+(.+)$/.exec(line.trim());

    if (unorderedMatch) {
      flushParagraph(state);
      state.list.push(unorderedMatch[1]);
      return;
    }

    const orderedMatch = /^\d+\.\s+(.+)$/.exec(line.trim());

    if (orderedMatch) {
      flushParagraph(state);
      state.orderedList.push(orderedMatch[1]);
      return;
    }

    state.paragraph.push(line.trim());
  });

  flushOpenBlocks(state);

  if (state.codeFence) {
    const blockIndex = state.blocks.length;
    state.blocks.push(
      <pre key={`code-${blockIndex}`} className="overflow-x-auto border border-cyan-400/20 bg-black/35 p-4 text-xs leading-6 text-cyan-100">
        <code>{state.codeFence.join('\n')}</code>
      </pre>,
    );
  }

  return state.blocks;
}

export function extractGithubArtifacts(markdown: string): GithubArtifact[] {
  const artifacts = new Map<string, GithubArtifact>();
  const markdownLinks = [...markdown.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)];
  const bareLinks = [...markdown.matchAll(/(?<!\]\()https?:\/\/[^\s)]+/g)].map((match) => [match[0], match[0]] as const);

  [...markdownLinks.map((match) => [match[1], match[2]] as const), ...bareLinks].forEach(([label, rawUrl]) => {
    const url = rawUrl.replace(/[.,;]+$/, '');
    const lowerUrl = url.toLowerCase();

    if (!lowerUrl.includes('github.com') && !lowerUrl.includes('gist.github.com')) {
      return;
    }

    artifacts.set(url, {
      label: label === url ? url.replace(/^https?:\/\//, '') : label,
      url,
      source: lowerUrl.includes('gist.github.com') ? 'gist' : 'github',
    });
  });

  return [...artifacts.values()];
}
