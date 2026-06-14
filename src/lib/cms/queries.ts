import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Portfolio, PortfolioMember, PortfolioQueryOptions, PortfolioRole } from '@/types/portfolio';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type SupabaseMaybeSingleResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};

type SupabaseListResponse<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

export const DEFAULT_PORTFOLIO_SLUG = 'ian';

export type CmsPortfolio = {
  id: string;
  slug: string;
  owner_name: string;
  title: string;
  app_name: string | null;
  public_url: string | null;
  brand_name: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CmsPortfolioMember = {
  id: string;
  portfolio_id: string;
  user_id: string;
  email: string;
  role: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CmsProfile = {
  id: string;
  portfolio_id: string;
  name: string | null;
  headline: string | null;
  subheadline: string | null;
  intro_line: string | null;
  location: string | null;
  availability_status: string | null;
  current_focus: string | null;
  core_stack: JsonValue;
  terminal_lines: JsonValue;
  cta_primary_label: string | null;
  cta_secondary_label: string | null;
  cta_contact_label: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CmsProject = {
  id: string;
  portfolio_id: string;
  title: string;
  slug: string;
  category: string | null;
  role: string | null;
  short_description: string | null;
  problem: string | null;
  solution: string | null;
  outcome: string | null;
  stack: JsonValue;
  is_featured: boolean | null;
  is_private: boolean | null;
  github_url: string | null;
  live_url: string | null;
  case_study_url: string | null;
  image_url: string | null;
  order_index: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CmsSkill = {
  id: string;
  portfolio_id: string;
  name: string;
  category: string;
  level: string | null;
  order_index: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CmsExperience = {
  id: string;
  portfolio_id: string;
  stage_label: string | null;
  title: string;
  organization: string | null;
  period: string | null;
  description: string | null;
  achievements: JsonValue;
  order_index: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CmsCapability = {
  id: string;
  portfolio_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  order_index: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CmsProcessStep = {
  id: string;
  portfolio_id: string;
  title: string;
  description: string | null;
  command: string | null;
  label: string | null;
  order_index: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CmsContactLink = {
  id: string;
  portfolio_id: string;
  label: string;
  type: string | null;
  url: string;
  icon: string | null;
  order_index: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CmsCredential = {
  id: string;
  portfolio_id: string;
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
  skills: JsonValue;
  order_index: number | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CmsLabWriteup = {
  id: string;
  portfolio_id: string;
  project_id: string | null;
  title: string;
  slug: string;
  platform: string | null;
  difficulty: string | null;
  category: string | null;
  machine_status: string;
  visibility: string;
  public_summary: string | null;
  public_teaser: string | null;
  tools: JsonValue;
  skills: JsonValue;
  tags: JsonValue;
  storage_bucket: string | null;
  storage_path: string | null;
  file_name: string | null;
  file_type: string | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  order_index: number | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CmsWriteupAccessRequest = {
  id: string;
  portfolio_id: string;
  writeup_id: string;
  requester_name: string;
  requester_email: string;
  requester_reason: string | null;
  requester_organization: string | null;
  status: string;
  reviewer_user_id: string | null;
  reviewer_note: string | null;
  reviewed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CmsWriteupAccessGrant = {
  id: string;
  portfolio_id: string;
  writeup_id: string;
  request_id: string | null;
  requester_email: string;
  token_hash: string;
  token_label: string | null;
  expires_at: string | null;
  max_views: number | null;
  views_used: number;
  revoked_at: string | null;
  revoked_by: string | null;
  revoke_reason: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CmsWriteupAccessLog = {
  id: string;
  portfolio_id: string;
  writeup_id: string | null;
  grant_id: string | null;
  request_id: string | null;
  event_type: string;
  actor_email: string | null;
  actor_user_id: string | null;
  metadata: JsonValue;
  created_at: string | null;
};

export type CmsSiteSettings = {
  id: string;
  portfolio_id: string;
  brand_name: string | null;
  app_title: string | null;
  tagline: string | null;
  version_label: string | null;
  mode_label: string | null;
  status_label: string | null;
  availability_label: string | null;
  footer_text: string | null;
  command_prompt_prefix: string | null;
  default_section: string | null;
  theme_preset: string | null;
  theme_primary: string | null;
  theme_secondary: string | null;
  theme_background: string | null;
  theme_panel: string | null;
  theme_foreground: string | null;
  theme_muted: string | null;
  theme_border: string | null;
  theme_glow_intensity: number | null;
  theme_scanlines_enabled: boolean | null;
  theme_animation_intensity: number | null;
  theme_font_mode: string | null;
  theme_is_active: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CmsNavigationItem = {
  id: string;
  portfolio_id: string;
  section_id: string;
  label: string;
  system_label: string | null;
  command: string | null;
  icon: string | null;
  order_index: number | null;
  is_visible: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CmsResumeAsset = {
  id: string;
  portfolio_id: string;
  file_name: string;
  file_url: string;
  version_label: string | null;
  is_active: boolean | null;
  uploaded_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

async function requireMaybeSingle<T>(query: PromiseLike<SupabaseMaybeSingleResponse<T>>): Promise<T | null> {
  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function requireList<T>(query: PromiseLike<SupabaseListResponse<T>>): Promise<T[]> {
  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

function normalizePortfolioSlug(options?: PortfolioQueryOptions) {
  return options?.portfolioSlug?.trim().toLowerCase() || DEFAULT_PORTFOLIO_SLUG;
}

function normalizePortfolio(row: CmsPortfolio): Portfolio {
  return {
    id: row.id,
    slug: row.slug,
    ownerName: row.owner_name,
    title: row.title,
    appName: row.app_name,
    publicUrl: row.public_url,
    brandName: row.brand_name,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizePortfolioMember(row: CmsPortfolioMember): PortfolioMember {
  return {
    id: row.id,
    portfolioId: row.portfolio_id,
    userId: row.user_id,
    email: row.email,
    role: (row.role ?? 'viewer') as PortfolioRole,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPortfolioBySlug(options?: PortfolioQueryOptions): Promise<Portfolio | null> {
  const supabase = createServerSupabaseClient();

  const portfolio = await requireMaybeSingle<CmsPortfolio>(
    supabase
      .from('portfolios')
      .select('*')
      .eq('slug', normalizePortfolioSlug(options))
      .eq('is_active', true)
      .maybeSingle(),
  );

  return portfolio ? normalizePortfolio(portfolio) : null;
}

async function getPortfolioId(options?: PortfolioQueryOptions) {
  const portfolio = await getPortfolioBySlug(options);

  return portfolio?.id ?? null;
}

export async function getPortfolioMembers(options?: PortfolioQueryOptions): Promise<PortfolioMember[]> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return [];
  }

  const supabase = createServerSupabaseClient();
  const rows = await requireList<CmsPortfolioMember>(
    supabase
      .from('portfolio_members')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('is_active', true)
      .order('created_at', { ascending: true }),
  );

  return rows.map(normalizePortfolioMember);
}

export async function getProfile(options?: PortfolioQueryOptions): Promise<CmsProfile | null> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return null;
  }

  const supabase = createServerSupabaseClient();

  return requireMaybeSingle<CmsProfile>(
    supabase
      .from('profile')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  );
}

export async function getProjects(options?: PortfolioQueryOptions): Promise<CmsProject[]> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return [];
  }

  const supabase = createServerSupabaseClient();

  return requireList<CmsProject>(
    supabase
      .from('projects')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true }),
  );
}

export async function getSkills(options?: PortfolioQueryOptions): Promise<CmsSkill[]> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return [];
  }

  const supabase = createServerSupabaseClient();

  return requireList<CmsSkill>(
    supabase
      .from('skills')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('order_index', { ascending: true }),
  );
}

export async function getExperience(options?: PortfolioQueryOptions): Promise<CmsExperience[]> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return [];
  }

  const supabase = createServerSupabaseClient();

  return requireList<CmsExperience>(
    supabase
      .from('experience')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('is_active', true)
      .order('order_index', { ascending: true }),
  );
}

export async function getCapabilities(options?: PortfolioQueryOptions): Promise<CmsCapability[]> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return [];
  }

  const supabase = createServerSupabaseClient();

  return requireList<CmsCapability>(
    supabase
      .from('capabilities')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('is_active', true)
      .order('order_index', { ascending: true }),
  );
}

export async function getProcessSteps(options?: PortfolioQueryOptions): Promise<CmsProcessStep[]> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return [];
  }

  const supabase = createServerSupabaseClient();

  return requireList<CmsProcessStep>(
    supabase
      .from('process_steps')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('is_active', true)
      .order('order_index', { ascending: true }),
  );
}

export async function getContactLinks(options?: PortfolioQueryOptions): Promise<CmsContactLink[]> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return [];
  }

  const supabase = createServerSupabaseClient();

  return requireList<CmsContactLink>(
    supabase
      .from('contact_links')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('is_active', true)
      .order('order_index', { ascending: true }),
  );
}

export async function getCredentials(options?: PortfolioQueryOptions): Promise<CmsCredential[]> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return [];
  }

  const supabase = createServerSupabaseClient();

  return requireList<CmsCredential>(
    supabase
      .from('credentials')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true }),
  );
}

export async function getSiteSettings(options?: PortfolioQueryOptions): Promise<CmsSiteSettings | null> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return null;
  }

  const supabase = createServerSupabaseClient();

  return requireMaybeSingle<CmsSiteSettings>(
    supabase
      .from('site_settings')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  );
}

export async function getNavigationItems(options?: PortfolioQueryOptions): Promise<CmsNavigationItem[]> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return [];
  }

  const supabase = createServerSupabaseClient();

  return requireList<CmsNavigationItem>(
    supabase
      .from('navigation_items')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('is_active', true)
      .eq('is_visible', true)
      .order('order_index', { ascending: true }),
  );
}

export async function getActiveResume(options?: PortfolioQueryOptions): Promise<CmsResumeAsset | null> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return null;
  }

  const supabase = createServerSupabaseClient();

  return requireMaybeSingle<CmsResumeAsset>(
    supabase
      .from('resume_assets')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('is_active', true)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  );
}

// ============================================================================
// Lab Writeups - Restricted Access System
// ============================================================================

/**
 * Get public lab writeups for display on public portfolio
 * Only returns active writeups with visibility='public' for active portfolios
 */
export async function getPublicLabWriteups(options?: PortfolioQueryOptions): Promise<CmsLabWriteup[]> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return [];
  }

  const supabase = createServerSupabaseClient();

  return requireList<CmsLabWriteup>(
    supabase
      .from('lab_writeups')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('is_active', true)
      .eq('visibility', 'public')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false }),
  );
}

/**
 * Get all lab writeups for admin/CMS view
 * Returns all writeups (including restricted/private) for portfolio members
 * Requires authentication and portfolio access
 */
export async function getAdminLabWriteups(options?: PortfolioQueryOptions): Promise<CmsLabWriteup[]> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return [];
  }

  const supabase = createServerSupabaseClient();

  return requireList<CmsLabWriteup>(
    supabase
      .from('lab_writeups')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false }),
  );
}

/**
 * Get a specific lab writeup by slug
 * Returns writeup if user has access (public for all, or portfolio member for restricted/private)
 */
export async function getLabWriteupBySlug(
  slug: string,
  options?: PortfolioQueryOptions,
): Promise<CmsLabWriteup | null> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return null;
  }

  const supabase = createServerSupabaseClient();

  return requireMaybeSingle<CmsLabWriteup>(
    supabase
      .from('lab_writeups')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle(),
  );
}

/**
 * Get writeup access requests for a portfolio
 * Requires authentication and portfolio access
 */
export async function getWriteupAccessRequests(
  options?: PortfolioQueryOptions,
): Promise<CmsWriteupAccessRequest[]> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return [];
  }

  const supabase = createServerSupabaseClient();

  return requireList<CmsWriteupAccessRequest>(
    supabase
      .from('writeup_access_requests')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: false }),
  );
}

/**
 * Get writeup access grants for a portfolio
 * Requires authentication and portfolio access
 */
export async function getWriteupAccessGrants(options?: PortfolioQueryOptions): Promise<CmsWriteupAccessGrant[]> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return [];
  }

  const supabase = createServerSupabaseClient();

  return requireList<CmsWriteupAccessGrant>(
    supabase
      .from('writeup_access_grants')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: false }),
  );
}

/**
 * Get writeup access logs for a portfolio
 * Requires authentication and portfolio access
 */
export async function getWriteupAccessLogs(options?: PortfolioQueryOptions): Promise<CmsWriteupAccessLog[]> {
  const portfolioId = await getPortfolioId(options);

  if (!portfolioId) {
    return [];
  }

  const supabase = createServerSupabaseClient();

  return requireList<CmsWriteupAccessLog>(
    supabase
      .from('writeup_access_logs')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: false })
      .limit(100),
  );
}
