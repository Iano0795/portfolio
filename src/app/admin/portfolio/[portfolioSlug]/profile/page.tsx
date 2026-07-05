import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { ProfileEditor } from '@/components/admin/profile/ProfileEditor';
import type { ProfileEditorValue } from '@/components/admin/profile/types';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioAccess } from '@/lib/auth/portfolio-access';
import type { CmsProfile } from '@/lib/cms/queries';
import { saveProfileAction } from './actions';

export const dynamic = 'force-dynamic';

type ProfileEditorPageProps = {
  params: Promise<{
    portfolioSlug: string;
  }>;
};

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function terminalLinesToStrings(value: unknown, fallbackName: string) {
  if (
    Array.isArray(value) &&
    value.every((item) => isObject(item) && typeof item.label === 'string' && typeof item.value === 'string')
  ) {
    return value.map((item) => `${item.label}=${item.value}`);
  }

  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return value;
  }

  return [`NAME=${fallbackName}`];
}

function coreStackToStrings(value: unknown) {
  if (Array.isArray(value)) {
    return stringArray(value);
  }

  if (isObject(value)) {
    return stringArray(value.stack);
  }

  return [];
}

function createDefaultProfile(ownerName: string): ProfileEditorValue {
  return {
    name: ownerName,
    headline: '',
    subheadline: '',
    introLine: 'module.identity / professional kernel',
    location: '',
    availabilityStatus: '',
    currentFocus: '',
    terminalLines: [{ id: 'terminal-0', value: `NAME=${ownerName}` }],
    coreStack: [],
    ctaPrimaryLabel: 'open builds',
    ctaSecondaryLabel: 'open toolchain',
    ctaContactLabel: 'connect.sh',
    isActive: true,
  };
}

function normalizeProfile(profile: CmsProfile | null, ownerName: string): ProfileEditorValue {
  if (!profile) {
    return createDefaultProfile(ownerName);
  }

  return {
    name: profile.name ?? ownerName,
    headline: profile.headline ?? '',
    subheadline: profile.subheadline ?? '',
    introLine: profile.intro_line ?? '',
    location: profile.location ?? '',
    availabilityStatus: profile.availability_status ?? '',
    currentFocus: profile.current_focus ?? '',
    terminalLines: terminalLinesToStrings(profile.terminal_lines, profile.name ?? ownerName).map((value, index) => ({
      id: `terminal-${index}`,
      value,
    })),
    coreStack: coreStackToStrings(profile.core_stack).map((value, index) => ({
      id: `stack-${index}`,
      value,
    })),
    ctaPrimaryLabel: profile.cta_primary_label ?? '',
    ctaSecondaryLabel: profile.cta_secondary_label ?? '',
    ctaContactLabel: profile.cta_contact_label ?? '',
    isActive: profile.is_active ?? true,
  };
}

async function getEditableProfile(portfolioId: string) {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return null;
  }

  const supabase = await createAdminSupabaseClient(tokens.accessToken);
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle<CmsProfile>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export default async function ProfileEditorPage({ params }: ProfileEditorPageProps) {
  const { portfolioSlug } = await params;

  try {
    const access = await requirePortfolioAccess(portfolioSlug);
    const profile = await getEditableProfile(access.portfolio.id);
    const saveAction = saveProfileAction.bind(null, portfolioSlug);

    return (
      <AdminShell activeItem="profile" portfolio={access.portfolio} user={access.user} role={access.member.role}>
        <ProfileEditor
          initialProfile={normalizeProfile(profile, access.portfolio.ownerName)}
          portfolio={access.portfolio}
          role={access.member.role}
          saveAction={saveAction}
        />
      </AdminShell>
    );
  } catch {
    redirect('/admin/login?error=access_denied');
  }
}
