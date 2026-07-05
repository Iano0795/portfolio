'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioManager } from '@/lib/auth/portfolio-access';
import { extractWriteupContent, type EmbeddedWriteupImage } from '@/lib/writeups/extract-content';
import type { WriteupFileUploadResult, WriteupMutationResult, WriteupPayload } from '@/components/admin/writeups/types';

const WRITEUPS_BUCKET = 'writeups';
const WRITEUP_ASSETS_BUCKET = 'writeup-assets';
const MAX_WRITEUP_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_WRITEUP_ASSET_SIZE = 5 * 1024 * 1024; // Matches the writeup-assets bucket limit.
const WRITEUP_EXTRACTION_TIMEOUT_MS = 60_000;

const ALLOWED_WRITEUP_FILE_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word (.docx)',
  'text/markdown': 'Markdown',
  'text/plain': 'Markdown / plain text',
};

const WRITEUP_FILE_TYPES_BY_EXTENSION: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.md': 'text/markdown',
};

const EMBEDDED_IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

type ExtractedWriteupAsset = {
  storagePath: string;
  altText: string | null;
  orderIndex: number;
};

type WriteupInput = {
  project_id: string | null;
  title: string;
  slug: string;
  platform: string | null;
  difficulty: string | null;
  category: string | null;
  lab_type: string | null;
  machine_status: string;
  visibility: string;
  is_requestable: boolean;
  public_summary: string | null;
  public_teaser: string | null;
  content_markdown: string | null;
  cover_image_url: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
  tools: string[];
  skills: string[];
  tags: string[];
  storage_bucket: string | null;
  storage_path: string | null;
  file_name: string | null;
  file_type: string | null;
  is_featured: boolean;
  is_active: boolean;
  order_index: number;
};

function cleanString(value: string) {
  return value.trim();
}

function nullableText(value: string) {
  const clean = cleanString(value);
  return clean ? clean : null;
}

function validateMax(value: string, label: string, max: number, errors: string[]) {
  if (value.length > max) {
    errors.push(`${label} must be ${max} characters or fewer.`);
  }
}

function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 180);
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 180);
}

function getFileExtension(fileName: string) {
  const normalized = fileName.toLowerCase();
  const dotIndex = normalized.lastIndexOf('.');

  return dotIndex >= 0 ? normalized.slice(dotIndex) : '';
}

function inferWriteupFileType(file: File) {
  const extensionType = WRITEUP_FILE_TYPES_BY_EXTENSION[getFileExtension(file.name)];

  if (file.type && ALLOWED_WRITEUP_FILE_TYPES[file.type]) {
    return file.type;
  }

  return extensionType ?? null;
}

async function extractWriteupContentWithTimeout(
  file: File,
  options?: Parameters<typeof extractWriteupContent>[1],
  onTimeout?: () => void,
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      extractWriteupContent(file, options),
      new Promise<Awaited<ReturnType<typeof extractWriteupContent>>>((resolve) => {
        timeout = setTimeout(() => {
          onTimeout?.();
          resolve({
            markdown: null,
            warning:
              'File uploaded, but text extraction took too long. Try a smaller document, reduce embedded image sizes, or paste the Markdown manually.',
          });
        }, WRITEUP_EXTRACTION_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

function createEmbeddedImageUploader({
  portfolioSlug,
  supabase,
  timestamp,
  writeupSlug,
}: {
  portfolioSlug: string;
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>;
  timestamp: number;
  writeupSlug: string;
}) {
  const extractedAssets: ExtractedWriteupAsset[] = [];
  let acceptsUploads = true;

  const uploadEmbeddedImage = async (image: EmbeddedWriteupImage) => {
    if (!acceptsUploads) {
      throw new Error(`Embedded image ${image.index} upload skipped because extraction timed out.`);
    }

    const extension = EMBEDDED_IMAGE_EXTENSIONS[image.contentType];

    if (!extension) {
      throw new Error(
        `Embedded image ${image.index} uses ${image.contentType || 'an unknown format'}; only PNG, JPEG, and WebP are supported.`,
      );
    }

    if (image.data.byteLength > MAX_WRITEUP_ASSET_SIZE) {
      throw new Error(`Embedded image ${image.index} exceeds the 5MB public asset limit.`);
    }

    const paddedIndex = image.index.toString().padStart(2, '0');
    const assetPath = `${portfolioSlug}/${writeupSlug}/extracted/${timestamp}-embedded-${paddedIndex}.${extension}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(WRITEUP_ASSETS_BUCKET)
      .upload(assetPath, image.data, {
        cacheControl: '31536000',
        contentType: image.contentType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Embedded image ${image.index} upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from(WRITEUP_ASSETS_BUCKET).getPublicUrl(uploadData.path);

    extractedAssets.push({
      storagePath: uploadData.path,
      altText: image.altText,
      orderIndex: image.index - 1,
    });

    return { src: publicUrlData.publicUrl };
  };

  return {
    extractedAssets,
    uploadEmbeddedImage,
    cancelUploads: () => {
      acceptsUploads = false;
    },
  };
}

async function recordExtractedWriteupAssets({
  assets,
  portfolioId,
  supabase,
  writeupId,
}: {
  assets: ExtractedWriteupAsset[];
  portfolioId: string;
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>;
  writeupId: string;
}) {
  if (assets.length === 0) {
    return null;
  }

  const { error } = await supabase.from('writeup_media').insert(
    assets.map((asset) => ({
      portfolio_id: portfolioId,
      writeup_id: writeupId,
      media_type: 'image',
      storage_bucket: WRITEUP_ASSETS_BUCKET,
      storage_path: asset.storagePath,
      alt_text: asset.altText,
      caption: null,
      order_index: asset.orderIndex,
      is_active: true,
    })),
  );

  return error?.message ?? null;
}

function appendWarning(existingWarning: string | null, warning: string) {
  return existingWarning ? `${existingWarning} ${warning}` : warning;
}

/** ~200 words per minute, clamped to the 1-300 range the validator accepts. */
function estimateReadingTimeMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.min(300, Math.max(1, Math.ceil(words / 200)));
}

function validateWriteupPayload(payload: WriteupPayload): WriteupInput {
  const title = cleanString(payload.title);
  const errors: string[] = [];

  if (!title) {
    errors.push('Title is required.');
  }

  validateMax(title, 'Title', 180, errors);

  const slug = payload.slug ? cleanString(payload.slug) : generateSlugFromTitle(title);
  validateMax(slug, 'Slug', 180, errors);

  if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens.');
  }

  validateMax(payload.platform, 'Platform', 120, errors);
  validateMax(payload.difficulty, 'Difficulty', 80, errors);
  validateMax(payload.category, 'Category', 120, errors);
  validateMax(payload.publicSummary, 'Public summary', 1200, errors);
  validateMax(payload.publicTeaser, 'Public teaser', 600, errors);
  validateMax(payload.contentMarkdown, 'Full Markdown content', 100000, errors);
  validateMax(payload.coverImageUrl, 'Cover image URL', 500, errors);
  validateMax(payload.storageBucket, 'Storage bucket', 120, errors);
  validateMax(payload.storagePath, 'Storage path', 500, errors);
  validateMax(payload.fileName, 'File name', 240, errors);
  validateMax(payload.fileType, 'File type', 120, errors);

  // Security validation: active machines cannot be public
  if (payload.machineStatus === 'active' && payload.visibility === 'public') {
    errors.push('Active machines cannot have public visibility. Set status to "retired" or visibility to "restricted" or "private".');
  }

  if (payload.labType && !['offensive', 'defensive'].includes(payload.labType)) {
    errors.push('Invalid lab type value.');
  }

  if (payload.visibility === 'public' && payload.machineStatus === 'active') {
    errors.push('Public active labs are blocked. Retire the lab before publishing public content.');
  }

  if (payload.visibility === 'public' && payload.contentMarkdown.trim() && payload.machineStatus === 'active') {
    errors.push('Full public Markdown content requires a retired or non-active lab.');
  }

  if (payload.readingTimeMinutes !== null) {
    if (!Number.isInteger(payload.readingTimeMinutes) || payload.readingTimeMinutes < 1 || payload.readingTimeMinutes > 300) {
      errors.push('Reading time must be between 1 and 300 minutes.');
    }
  }

  const coverImageUrl = cleanString(payload.coverImageUrl);
  if (coverImageUrl) {
    try {
      const url = new URL(coverImageUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push('Cover image URL must use http or https.');
      }
    } catch {
      errors.push('Cover image URL must be a valid URL.');
    }
  }

  // Validate visibility values
  if (!['public', 'restricted', 'private'].includes(payload.visibility)) {
    errors.push('Invalid visibility value.');
  }

  // Validate machine status values
  if (!['active', 'retired', 'other'].includes(payload.machineStatus)) {
    errors.push('Invalid machine status value.');
  }

  const tools = Array.isArray(payload.tools)
    ? payload.tools.map((value) => cleanString(value)).filter(Boolean)
    : [];

  const skills = Array.isArray(payload.skills)
    ? payload.skills.map((value) => cleanString(value)).filter(Boolean)
    : [];

  const tags = Array.isArray(payload.tags)
    ? payload.tags.map((value) => cleanString(value)).filter(Boolean)
    : [];

  tools.forEach((tool, index) => {
    if (tool.length > 80) {
      errors.push(`Tool ${index + 1} must be 80 characters or fewer.`);
    }
  });

  skills.forEach((skill, index) => {
    if (skill.length > 80) {
      errors.push(`Skill ${index + 1} must be 80 characters or fewer.`);
    }
  });

  tags.forEach((tag, index) => {
    if (tag.length > 80) {
      errors.push(`Tag ${index + 1} must be 80 characters or fewer.`);
    }
  });

  const orderIndex = Number.isInteger(payload.orderIndex) ? payload.orderIndex : 0;

  if (errors.length > 0) {
    throw new Error(errors.join(' '));
  }

  return {
    project_id: payload.projectId || null,
    title,
    slug,
    platform: nullableText(payload.platform),
    difficulty: nullableText(payload.difficulty),
    category: nullableText(payload.category),
    lab_type: payload.labType || null,
    machine_status: payload.machineStatus,
    visibility: payload.visibility,
    is_requestable: payload.visibility === 'restricted' ? payload.isRequestable : false,
    public_summary: nullableText(payload.publicSummary),
    public_teaser: nullableText(payload.publicTeaser),
    content_markdown: nullableText(payload.contentMarkdown),
    cover_image_url: coverImageUrl || null,
    reading_time_minutes:
      payload.readingTimeMinutes ??
      (payload.contentMarkdown.trim() ? estimateReadingTimeMinutes(payload.contentMarkdown) : null),
    published_at: nullableText(payload.publishedAt),
    tools,
    skills,
    tags,
    storage_bucket: nullableText(payload.storageBucket),
    storage_path: nullableText(payload.storagePath),
    file_name: nullableText(payload.fileName),
    file_type: nullableText(payload.fileType),
    is_featured: payload.isFeatured,
    is_active: payload.isActive,
    order_index: orderIndex,
  };
}

async function getMutationContext(portfolioSlug: string) {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    throw new Error('Session expired. Sign in again.');
  }

  const access = await requirePortfolioManager(portfolioSlug);
  const supabase = await createAdminSupabaseClient(tokens.accessToken);

  return { access, supabase };
}

function revalidateWriteups(portfolioSlug: string) {
  revalidatePath(`/admin/portfolio/${portfolioSlug}/writeups`);
  revalidatePath(`/admin/portfolio/${portfolioSlug}`);
}

async function ensureWriteupBelongsToPortfolio(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  writeupId: string,
) {
  const { data, error } = await supabase
    .from('lab_writeups')
    .select('id')
    .eq('id', writeupId)
    .eq('portfolio_id', portfolioId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Writeup not found for this portfolio.');
  }
}

async function ensureProjectBelongsToPortfolio(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  projectId: string,
) {
  if (!projectId) {
    return;
  }

  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('portfolio_id', portfolioId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Linked project not found for this portfolio.');
  }
}

async function checkSlugUniqueness(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  slug: string,
  excludeWriteupId?: string,
) {
  let query = supabase
    .from('lab_writeups')
    .select('id')
    .eq('portfolio_id', portfolioId)
    .eq('slug', slug);

  if (excludeWriteupId) {
    query = query.neq('id', excludeWriteupId);
  }

  const { data, error } = await query.maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    throw new Error(`A writeup with slug "${slug}" already exists in this portfolio.`);
  }
}

async function getNextOrderIndex(supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>, portfolioId: string) {
  const { data, error } = await supabase
    .from('lab_writeups')
    .select('order_index')
    .eq('portfolio_id', portfolioId)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle<{ order_index: number | null }>();

  if (error) {
    throw new Error(error.message);
  }

  return (data?.order_index ?? -1) + 1;
}

export async function createWriteupAction(
  portfolioSlug: string,
  payload: WriteupPayload,
): Promise<WriteupMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateWriteupPayload(payload);

    await ensureProjectBelongsToPortfolio(supabase, access.portfolio.id, input.project_id ?? '');
    await checkSlugUniqueness(supabase, access.portfolio.id, input.slug);

    const orderIndex =
      Number.isInteger(payload.orderIndex) && payload.orderIndex >= 0
        ? payload.orderIndex
        : await getNextOrderIndex(supabase, access.portfolio.id);

    const insertPayload = {
      ...input,
      portfolio_id: access.portfolio.id,
      order_index: orderIndex,
    };

    const { error } = await supabase.from('lab_writeups').insert(insertPayload);

    if (error) {
      return { error: error.message };
    }

    revalidateWriteups(portfolioSlug);

    return { success: 'Writeup created successfully.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to create writeup.' };
  }
}

export async function updateWriteupAction(
  portfolioSlug: string,
  writeupId: string,
  payload: WriteupPayload,
): Promise<WriteupMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const input = validateWriteupPayload(payload);

    await ensureWriteupBelongsToPortfolio(supabase, access.portfolio.id, writeupId);
    await ensureProjectBelongsToPortfolio(supabase, access.portfolio.id, input.project_id ?? '');
    await checkSlugUniqueness(supabase, access.portfolio.id, input.slug, writeupId);

    const { error } = await supabase
      .from('lab_writeups')
      .update(input)
      .eq('id', writeupId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateWriteups(portfolioSlug);

    return { success: 'Writeup saved successfully.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to save writeup.' };
  }
}

export async function archiveWriteupAction(
  portfolioSlug: string,
  writeupId: string,
): Promise<WriteupMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureWriteupBelongsToPortfolio(supabase, access.portfolio.id, writeupId);

    const { error } = await supabase
      .from('lab_writeups')
      .update({ is_active: false })
      .eq('id', writeupId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateWriteups(portfolioSlug);

    return { success: 'Writeup archived.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to archive writeup.' };
  }
}

export async function restoreWriteupAction(
  portfolioSlug: string,
  writeupId: string,
): Promise<WriteupMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureWriteupBelongsToPortfolio(supabase, access.portfolio.id, writeupId);

    const { error } = await supabase
      .from('lab_writeups')
      .update({ is_active: true })
      .eq('id', writeupId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateWriteups(portfolioSlug);

    return { success: 'Writeup restored.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to restore writeup.' };
  }
}

async function getWriteupFileContext(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  writeupId: string,
) {
  const { data, error } = await supabase
    .from('lab_writeups')
    .select('id, slug, storage_path')
    .eq('id', writeupId)
    .eq('portfolio_id', portfolioId)
    .maybeSingle<{ id: string; slug: string; storage_path: string | null }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Writeup not found for this portfolio.');
  }

  return data;
}

export async function uploadWriteupFileAction(
  portfolioSlug: string,
  writeupId: string,
  formData: FormData,
): Promise<WriteupFileUploadResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const writeup = await getWriteupFileContext(supabase, access.portfolio.id, writeupId);

    const file = formData.get('file') as File | null;

    if (!file) {
      return { error: 'No file provided.' };
    }

    const fileType = inferWriteupFileType(file);

    if (!fileType) {
      return { error: 'Only PDF, Word (.docx), or Markdown files are allowed.' };
    }

    if (file.size > MAX_WRITEUP_FILE_SIZE) {
      return { error: 'File size must be 20MB or less.' };
    }

    const previousPath = writeup.storage_path;
    const timestamp = Date.now();
    const sanitizedFileName = sanitizeFileName(file.name) || `writeup-${timestamp}`;
    const filePath = `${portfolioSlug}/${writeup.slug}/${timestamp}-${sanitizedFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(WRITEUPS_BUCKET)
      .upload(filePath, file, {
        contentType: fileType,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { error: `Upload failed: ${uploadError.message}` };
    }

    const fileMetadata = {
      storage_bucket: WRITEUPS_BUCKET,
      storage_path: uploadData.path,
      file_name: file.name.slice(0, 240),
      file_type: fileType.slice(0, 120),
    };

    const { error: updateError } = await supabase
      .from('lab_writeups')
      .update(fileMetadata)
      .eq('id', writeupId)
      .eq('portfolio_id', access.portfolio.id);

    if (updateError) {
      await supabase.storage.from(WRITEUPS_BUCKET).remove([uploadData.path]);
      return { error: updateError.message };
    }

    // Replaced file: remove the old object best-effort (metadata already points at the new one).
    if (previousPath && previousPath !== uploadData.path) {
      await supabase.storage.from(WRITEUPS_BUCKET).remove([previousPath]);
    }

    const imageUploader = fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ? createEmbeddedImageUploader({
          portfolioSlug,
          supabase,
          timestamp,
          writeupSlug: writeup.slug,
        })
      : null;

    const extraction = await extractWriteupContentWithTimeout(
      file,
      imageUploader ? { uploadEmbeddedImage: imageUploader.uploadEmbeddedImage } : undefined,
      imageUploader?.cancelUploads,
    );
    const assetRecordingError = imageUploader
      ? await recordExtractedWriteupAssets({
          assets: imageUploader.extractedAssets,
          portfolioId: access.portfolio.id,
          supabase,
          writeupId,
        })
      : null;

    revalidateWriteups(portfolioSlug);

    return {
      success: 'File uploaded successfully.',
      file: {
        storageBucket: fileMetadata.storage_bucket,
        storagePath: fileMetadata.storage_path,
        fileName: fileMetadata.file_name,
        fileType: fileMetadata.file_type,
      },
      extractedMarkdown: extraction.markdown,
      extractionWarning: assetRecordingError
        ? appendWarning(
            extraction.warning,
            `Extracted images were inserted into the Markdown, but their media metadata could not be saved: ${assetRecordingError}`,
          )
        : extraction.warning,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to upload writeup file.' };
  }
}

export async function removeWriteupFileAction(
  portfolioSlug: string,
  writeupId: string,
): Promise<WriteupMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);
    const writeup = await getWriteupFileContext(supabase, access.portfolio.id, writeupId);

    if (!writeup.storage_path) {
      return { error: 'This writeup has no attached file.' };
    }

    const { error: removeError } = await supabase.storage
      .from(WRITEUPS_BUCKET)
      .remove([writeup.storage_path]);

    if (removeError) {
      return { error: `Could not delete the stored file: ${removeError.message}` };
    }

    const { error: updateError } = await supabase
      .from('lab_writeups')
      .update({
        storage_bucket: null,
        storage_path: null,
        file_name: null,
        file_type: null,
      })
      .eq('id', writeupId)
      .eq('portfolio_id', access.portfolio.id);

    if (updateError) {
      return { error: updateError.message };
    }

    revalidateWriteups(portfolioSlug);

    return { success: 'File removed.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to remove writeup file.' };
  }
}

export async function reorderWriteupsAction(
  portfolioSlug: string,
  orderedWriteupIds: string[],
): Promise<WriteupMutationResult> {
  try {
    const ids = orderedWriteupIds.filter(Boolean);

    if (ids.length === 0) {
      return { error: 'No writeups were selected for reordering.' };
    }

    const { access, supabase } = await getMutationContext(portfolioSlug);
    const { data, error: selectError } = await supabase
      .from('lab_writeups')
      .select('id')
      .eq('portfolio_id', access.portfolio.id)
      .in('id', ids)
      .returns<Array<{ id: string }>>();

    if (selectError) {
      return { error: selectError.message };
    }

    if ((data ?? []).length !== ids.length) {
      return { error: 'One or more writeups do not belong to this portfolio.' };
    }

    const updates = await Promise.all(
      ids.map((writeupId, index) =>
        supabase
          .from('lab_writeups')
          .update({ order_index: index })
          .eq('id', writeupId)
          .eq('portfolio_id', access.portfolio.id),
      ),
    );

    const failedUpdate = updates.find((result) => result.error);

    if (failedUpdate?.error) {
      return { error: failedUpdate.error.message };
    }

    revalidateWriteups(portfolioSlug);

    return { success: 'Writeup order saved.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to reorder writeups.' };
  }
}
