'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioManager } from '@/lib/auth/portfolio-access';
import type { ResumeMutationResult } from '@/components/admin/resume/types';

const BUCKET_NAME = 'resumes';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function sanitizeFileName(fileName: string): string {
  // Remove or replace unsafe characters
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 180);
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

function revalidateResumes(portfolioSlug: string) {
  revalidatePath(`/admin/portfolio/${portfolioSlug}/resume`);
  revalidatePath(`/admin/portfolio/${portfolioSlug}`);
}

async function ensureResumeBelongsToPortfolio(
  supabase: Awaited<ReturnType<typeof createAdminSupabaseClient>>,
  portfolioId: string,
  resumeId: string,
) {
  const { data, error } = await supabase
    .from('resume_assets')
    .select('id, file_url')
    .eq('id', resumeId)
    .eq('portfolio_id', portfolioId)
    .maybeSingle<{ id: string; file_url: string }>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Resume not found for this portfolio.');
  }

  return data;
}

export async function uploadResumeAction(portfolioSlug: string, formData: FormData): Promise<ResumeMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    const file = formData.get('file') as File | null;
    const versionLabel = (formData.get('versionLabel') as string) || null;

    if (!file) {
      return { error: 'No file provided.' };
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return { error: 'Only PDF files are allowed.' };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return { error: 'File size must be 10MB or less.' };
    }

    // Validate version label
    if (versionLabel && versionLabel.length > 120) {
      return { error: 'Version label must be 120 characters or fewer.' };
    }

    // Create unique file path
    const timestamp = Date.now();
    const sanitizedFileName = sanitizeFileName(file.name);
    const filePath = `${portfolioSlug}/${timestamp}-${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { error: `Upload failed: ${uploadError.message}` };
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uploadData.path);

    if (!urlData?.publicUrl) {
      return { error: 'Failed to generate file URL.' };
    }

    // Check if this is the first resume for this portfolio
    const { data: existingResumes, error: countError } = await supabase
      .from('resume_assets')
      .select('id')
      .eq('portfolio_id', access.portfolio.id)
      .limit(1);

    if (countError) {
      return { error: countError.message };
    }

    const isFirstResume = !existingResumes || existingResumes.length === 0;

    // Insert resume record
    const { error: insertError } = await supabase.from('resume_assets').insert({
      portfolio_id: access.portfolio.id,
      file_name: file.name,
      file_url: urlData.publicUrl,
      version_label: versionLabel,
      is_active: isFirstResume, // First resume becomes active automatically
      uploaded_at: new Date().toISOString(),
    });

    if (insertError) {
      // If database insert fails, try to delete the uploaded file
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      return { error: insertError.message };
    }

    revalidateResumes(portfolioSlug);

    return { success: isFirstResume ? 'Resume uploaded and set as active.' : 'Resume uploaded successfully.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to upload resume.' };
  }
}

export async function setActiveResumeAction(portfolioSlug: string, resumeId: string): Promise<ResumeMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureResumeBelongsToPortfolio(supabase, access.portfolio.id, resumeId);

    // Set all resumes for this portfolio to inactive
    const { error: deactivateError } = await supabase
      .from('resume_assets')
      .update({ is_active: false })
      .eq('portfolio_id', access.portfolio.id);

    if (deactivateError) {
      return { error: deactivateError.message };
    }

    // Set selected resume to active
    const { error: activateError } = await supabase
      .from('resume_assets')
      .update({ is_active: true })
      .eq('id', resumeId)
      .eq('portfolio_id', access.portfolio.id);

    if (activateError) {
      return { error: activateError.message };
    }

    revalidateResumes(portfolioSlug);

    return { success: 'Active resume updated.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to set active resume.' };
  }
}

export async function archiveResumeAction(portfolioSlug: string, resumeId: string): Promise<ResumeMutationResult> {
  try {
    const { access, supabase } = await getMutationContext(portfolioSlug);

    await ensureResumeBelongsToPortfolio(supabase, access.portfolio.id, resumeId);

    // Set resume to inactive
    const { error } = await supabase
      .from('resume_assets')
      .update({ is_active: false })
      .eq('id', resumeId)
      .eq('portfolio_id', access.portfolio.id);

    if (error) {
      return { error: error.message };
    }

    revalidateResumes(portfolioSlug);

    return { success: 'Resume deactivated.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to deactivate resume.' };
  }
}
