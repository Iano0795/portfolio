import 'server-only';

import { Buffer } from 'node:buffer';
import TurndownService from 'turndown';

export type ExtractionResult = {
  markdown: string | null;
  warning: string | null;
};

export type EmbeddedWriteupImage = {
  index: number;
  contentType: string;
  altText: string | null;
  data: Buffer;
};

export type EmbeddedWriteupImageUpload = {
  src: string;
};

export type ExtractWriteupContentOptions = {
  uploadEmbeddedImage?: (image: EmbeddedWriteupImage) => Promise<EmbeddedWriteupImageUpload>;
};

const MAX_MARKDOWN_LENGTH = 100000;

const PDF_MIME = 'application/pdf';
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MARKDOWN_MIMES = ['text/markdown', 'text/plain'];

export const EXTRACTABLE_MIMES = [PDF_MIME, DOCX_MIME, ...MARKDOWN_MIMES];

function getFileExtension(fileName: string) {
  const normalized = fileName.toLowerCase();
  const dotIndex = normalized.lastIndexOf('.');

  return dotIndex >= 0 ? normalized.slice(dotIndex) : '';
}

function joinWarnings(warnings: Array<string | null | undefined>) {
  const cleanWarnings = warnings.map((warning) => warning?.trim()).filter((warning): warning is string => Boolean(warning));

  return cleanWarnings.length > 0 ? cleanWarnings.join(' ') : null;
}

function capMarkdown(markdown: string, extraWarnings: string[] = []): ExtractionResult {
  const clean = markdown.trim();

  if (!clean) {
    return {
      markdown: null,
      warning: joinWarnings(['No text content could be extracted from the document.', ...extraWarnings]),
    };
  }

  if (clean.length > MAX_MARKDOWN_LENGTH) {
    return {
      markdown: clean.slice(0, MAX_MARKDOWN_LENGTH),
      warning: joinWarnings([`Extracted content exceeded ${MAX_MARKDOWN_LENGTH} characters and was truncated.`, ...extraWarnings]),
    };
  }

  return { markdown: clean, warning: joinWarnings(extraWarnings) };
}

async function extractPdf(buffer: ArrayBuffer): Promise<ExtractionResult> {
  const { extractText, getDocumentProxy } = await import('unpdf');
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });

  const result = capMarkdown(text);

  if (result.markdown && !result.warning) {
    return {
      markdown: result.markdown,
      warning: 'PDF text extracted as plain text - headings, code blocks, and images need manual cleanup.',
    };
  }

  return result;
}

async function extractDocx(buffer: ArrayBuffer, options: ExtractWriteupContentOptions = {}): Promise<ExtractionResult> {
  const mammoth = await import('mammoth');
  let embeddedImageCount = 0;
  let uploadedImageCount = 0;

  const convertImage = options.uploadEmbeddedImage
    ? mammoth.images.imgElement(async (image) => {
        embeddedImageCount += 1;
        const imageWithAltText = image as typeof image & { altText?: string };

        const upload = await options.uploadEmbeddedImage?.({
          index: embeddedImageCount,
          contentType: image.contentType,
          altText: imageWithAltText.altText ?? null,
          data: await image.readAsBuffer(),
        });

        if (!upload?.src) {
          throw new Error(`Embedded image ${embeddedImageCount} was not uploaded.`);
        }

        uploadedImageCount += 1;

        return { src: upload.src };
      })
    : undefined;

  const { value: html, messages } = await mammoth.convertToHtml(
    { buffer: Buffer.from(buffer) },
    convertImage ? { convertImage } : undefined,
  );

  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });

  // Without an upload callback, embedded images come out as huge base64 data URIs.
  turndown.addRule('dropDataUriImages', {
    filter: (node) =>
      node.nodeName === 'IMG' && (node.getAttribute('src') ?? '').startsWith('data:'),
    replacement: () => '\n\n*[Embedded image removed - upload it as writeup media instead.]*\n\n',
  });

  const warnings: string[] = [];
  const conversionIssues = messages.length;

  if (conversionIssues > 0) {
    const issueDetails = messages
      .map((message) => message.message)
      .filter(Boolean)
      .slice(0, 3)
      .join(' ');

    warnings.push(
      `Document converted with ${conversionIssues} formatting warning(s) - review the result before publishing.${
        issueDetails ? ` ${issueDetails}` : ''
      }`,
    );
  }

  if (uploadedImageCount > 0) {
    warnings.push(
      `${uploadedImageCount} embedded image(s) were uploaded to public writeup assets and inserted into the Markdown. Review them before publishing.`,
    );
  }

  if (embeddedImageCount > uploadedImageCount) {
    warnings.push(`${embeddedImageCount - uploadedImageCount} embedded image(s) could not be uploaded and were omitted.`);
  }

  return capMarkdown(turndown.turndown(html), warnings);
}

async function extractMarkdownFile(buffer: ArrayBuffer): Promise<ExtractionResult> {
  return capMarkdown(new TextDecoder('utf-8').decode(buffer));
}

/**
 * Extract the text of an uploaded writeup document as Markdown.
 * Never throws: extraction failure returns a warning so the file upload itself can still succeed.
 */
export async function extractWriteupContent(
  file: File,
  options: ExtractWriteupContentOptions = {},
): Promise<ExtractionResult> {
  try {
    const buffer = await file.arrayBuffer();
    const extension = getFileExtension(file.name);

    if (file.type === PDF_MIME || extension === '.pdf') {
      return await extractPdf(buffer);
    }

    if (file.type === DOCX_MIME || extension === '.docx') {
      return await extractDocx(buffer, options);
    }

    if (MARKDOWN_MIMES.includes(file.type) || extension === '.md') {
      return await extractMarkdownFile(buffer);
    }

    return { markdown: null, warning: null };
  } catch (error) {
    return {
      markdown: null,
      warning: `Could not extract text from the document: ${error instanceof Error ? error.message : 'unknown error'}.`,
    };
  }
}
