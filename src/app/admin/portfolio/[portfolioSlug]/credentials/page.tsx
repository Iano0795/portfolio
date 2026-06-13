import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { CredentialsManager } from '@/components/admin/credentials/CredentialsManager';
import type { CredentialEditorValue } from '@/components/admin/credentials/types';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioAccess } from '@/lib/auth/portfolio-access';
import {
  archiveCredentialAction,
  createCredentialAction,
  reorderCredentialsAction,
  restoreCredentialAction,
  updateCredentialAction,
} from './actions';

export const dynamic = 'force-dynamic';

type CredentialsPageProps = {
  params: Promise<{
    portfolioSlug: string;
  }>;
};

type CmsCredentialRow = {
  id: string;
  title: string;
  issuer: string | null;
  credential_type: string | null;
  category: string | null;
  description: string | null;
  issued_at: string | null;
  expires_at: string | null;
  credential_id: string | null;
  credential_url: string | null;
  image_url: string | null;
  skills: unknown;
  order_index: number | null;
  is_featured: boolean | null;
  is_active: boolean | null;
};

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function normalizeCredential(credential: CmsCredentialRow): CredentialEditorValue {
  return {
    id: credential.id,
    title: credential.title ?? '',
    issuer: credential.issuer ?? '',
    credentialType: credential.credential_type ?? '',
    category: credential.category ?? '',
    description: credential.description ?? '',
    issuedAt: credential.issued_at ?? '',
    expiresAt: credential.expires_at ?? '',
    credentialId: credential.credential_id ?? '',
    credentialUrl: credential.credential_url ?? '',
    imageUrl: credential.image_url ?? '',
    skills: stringArray(credential.skills).map((value, index) => ({
      id: `credential-skill-${credential.id}-${index}`,
      value,
    })),
    orderIndex: credential.order_index ?? 0,
    isFeatured: credential.is_featured ?? false,
    isActive: credential.is_active ?? true,
  };
}

async function getEditableCredentials(portfolioId: string) {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return [];
  }

  const supabase = await createAdminSupabaseClient(tokens.accessToken);
  const { data, error } = await supabase
    .from('credentials')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })
    .returns<CmsCredentialRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeCredential);
}

export default async function CredentialsPage({ params }: CredentialsPageProps) {
  const { portfolioSlug } = await params;

  try {
    const access = await requirePortfolioAccess(portfolioSlug);
    const credentials = await getEditableCredentials(access.portfolio.id);

    return (
      <AdminShell activeItem="credentials" portfolio={access.portfolio} user={access.user} role={access.member.role}>
        <CredentialsManager
          initialCredentials={credentials}
          portfolio={access.portfolio}
          role={access.member.role}
          createCredential={createCredentialAction.bind(null, portfolioSlug)}
          updateCredential={updateCredentialAction.bind(null, portfolioSlug)}
          archiveCredential={archiveCredentialAction.bind(null, portfolioSlug)}
          restoreCredential={restoreCredentialAction.bind(null, portfolioSlug)}
          reorderCredentials={reorderCredentialsAction.bind(null, portfolioSlug)}
        />
      </AdminShell>
    );
  } catch {
    redirect('/admin/login?error=access_denied');
  }
}
