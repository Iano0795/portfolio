import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { ResumeManager } from '@/components/admin/resume/ResumeManager';
import type { ResumeAssetEditorValue } from '@/components/admin/resume/types';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioAccess } from '@/lib/auth/portfolio-access';
import { archiveResumeAction, setActiveResumeAction, uploadResumeAction } from './actions';

export const dynamic = 'force-dynamic';

type ResumePageProps = {
  params: Promise<{
    portfolioSlug: string;
  }>;
};

type CmsResumeAsset = {
  id: string;
  file_name: string;
  file_url: string;
  version_label: string | null;
  is_active: boolean;
  uploaded_at: string;
};

function normalizeResumeAsset(asset: CmsResumeAsset): ResumeAssetEditorValue {
  return {
    id: asset.id,
    fileName: asset.file_name ?? '',
    fileUrl: asset.file_url ?? '',
    versionLabel: asset.version_label ?? '',
    isActive: asset.is_active ?? false,
    uploadedAt: asset.uploaded_at ?? new Date().toISOString(),
  };
}

async function getEditableResumeAssets(portfolioId: string) {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return [];
  }

  const supabase = await createAdminSupabaseClient(tokens.accessToken);
  const { data, error } = await supabase
    .from('resume_assets')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('uploaded_at', { ascending: false })
    .returns<CmsResumeAsset[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeResumeAsset);
}

export default async function ResumePage({ params }: ResumePageProps) {
  const { portfolioSlug } = await params;

  try {
    const access = await requirePortfolioAccess(portfolioSlug);
    const resumeAssets = await getEditableResumeAssets(access.portfolio.id);

    return (
      <AdminShell activeItem="resume" portfolio={access.portfolio} user={access.user} role={access.member.role}>
        <ResumeManager
          initialResumes={resumeAssets}
          portfolio={access.portfolio}
          role={access.member.role}
          uploadResume={uploadResumeAction.bind(null, portfolioSlug)}
          setActiveResume={setActiveResumeAction.bind(null, portfolioSlug)}
          archiveResume={archiveResumeAction.bind(null, portfolioSlug)}
        />
      </AdminShell>
    );
  } catch {
    redirect('/admin/login?error=access_denied');
  }
}
