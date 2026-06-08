import type { User } from '@supabase/supabase-js';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import type { Portfolio, PortfolioMember, PortfolioRole } from '@/types/portfolio';

type CmsPortfolioRow = {
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

type CmsPortfolioMemberRow = {
  id: string;
  portfolio_id: string;
  user_id: string;
  email: string;
  role: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type UserPortfolioAccess = {
  user: User;
  portfolio: Portfolio;
  member: PortfolioMember;
};

function normalizePortfolio(row: CmsPortfolioRow): Portfolio {
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

function normalizePortfolioMember(row: CmsPortfolioMemberRow): PortfolioMember {
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

async function getAuthenticatedUser(accessToken: string) {
  const supabase = createAdminSupabaseClient(accessToken);
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return null;
  }

  return {
    accessToken,
    user: data.user,
  };
}

function isManagerRole(role: PortfolioRole) {
  return role === 'owner' || role === 'admin' || role === 'editor';
}

export async function getUserPortfoliosForAccessToken(accessToken: string): Promise<UserPortfolioAccess[]> {
  const auth = await getAuthenticatedUser(accessToken);

  if (!auth) {
    return [];
  }

  const supabase = createAdminSupabaseClient(auth.accessToken);
  const { data: memberRows, error: memberError } = await supabase
    .from('portfolio_members')
    .select('id,portfolio_id,user_id,email,role,is_active,created_at,updated_at')
    .eq('user_id', auth.user.id)
    .eq('is_active', true)
    .returns<CmsPortfolioMemberRow[]>();

  if (memberError || !memberRows || memberRows.length === 0) {
    return [];
  }

  const portfolioIds = memberRows.map((member) => member.portfolio_id);
  const { data: portfolioRows, error: portfolioError } = await supabase
    .from('portfolios')
    .select('id,slug,owner_name,title,app_name,public_url,brand_name,is_active,created_at,updated_at')
    .in('id', portfolioIds)
    .eq('is_active', true)
    .returns<CmsPortfolioRow[]>();

  if (portfolioError || !portfolioRows) {
    return [];
  }

  const portfoliosById = new Map(portfolioRows.map((portfolio) => [portfolio.id, normalizePortfolio(portfolio)]));

  return memberRows.flatMap((memberRow) => {
    const portfolio = portfoliosById.get(memberRow.portfolio_id);

    if (!portfolio) {
      return [];
    }

    return {
      user: auth.user,
      portfolio,
      member: normalizePortfolioMember(memberRow),
    };
  });
}

export async function getUserPortfolios(): Promise<UserPortfolioAccess[]> {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return [];
  }

  return getUserPortfoliosForAccessToken(tokens.accessToken);
}

export async function getCurrentPortfolioForUser(preferredSlug?: string): Promise<UserPortfolioAccess | null> {
  const portfolios = await getUserPortfolios();

  if (portfolios.length === 0) {
    return null;
  }

  if (preferredSlug) {
    return portfolios.find((item) => item.portfolio.slug === preferredSlug) ?? null;
  }

  return portfolios[0] ?? null;
}

export async function requirePortfolioAccess(portfolioSlug: string): Promise<UserPortfolioAccess> {
  const access = await getCurrentPortfolioForUser(portfolioSlug);

  if (!access) {
    throw new Error(`Portfolio access denied for "${portfolioSlug}".`);
  }

  return access;
}

export async function requirePortfolioManager(portfolioSlug: string): Promise<UserPortfolioAccess> {
  const access = await requirePortfolioAccess(portfolioSlug);

  if (!isManagerRole(access.member.role)) {
    throw new Error(`Portfolio manager access denied for "${portfolioSlug}".`);
  }

  return access;
}
