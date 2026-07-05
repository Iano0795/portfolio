/**
 * Server-side query helpers for writeup access management
 * Used by Control Center access request queue
 * 
 * SECURITY:
 * - Only for authenticated admin users
 * - All data must be portfolio-scoped
 * - Never trust portfolio_id from client
 */

import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import type {
  WriteupAccessRequest,
  WriteupAccessGrant,
  WriteupAccessLog,
  LabWriteup,
} from '@/types/portfolio';

export type AccessRequestWithDetails = WriteupAccessRequest & {
  writeup_title?: string;
  writeup_slug?: string;
  writeup_visibility?: string;
  writeup_machine_status?: string;
  grant?: {
    id: string;
    token_label: string | null;
    expires_at: string | null;
    max_views: number | null;
    views_used: number;
    revoked_at: string | null;
    created_at: string;
  } | null;
};

export type AccessGrantWithDetails = WriteupAccessGrant & {
  writeup_title?: string;
  writeup_slug?: string;
  request_id?: string | null;
};

/**
 * Get all access requests for a portfolio
 * Includes writeup details and grant status
 */
export async function getAccessRequestsForAdmin(portfolioId: string): Promise<AccessRequestWithDetails[]> {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return [];
  }

  const supabase = await createAdminSupabaseClient(tokens.accessToken);

  // Load requests with writeup details
  const { data: requests, error: requestsError } = await supabase
    .from('writeup_access_requests')
    .select(`
      *,
      lab_writeups!inner(
        title,
        slug,
        visibility,
        machine_status
      )
    `)
    .eq('portfolio_id', portfolioId)
    .order('created_at', { ascending: false });

  if (requestsError) {
    console.error('Failed to load access requests:', requestsError);
    return [];
  }

  if (!requests || requests.length === 0) {
    return [];
  }

  // Load grants for approved requests
  const requestIds = requests.map((r) => r.id);
  const { data: grants, error: grantsError } = await supabase
    .from('writeup_access_grants')
    .select('id, request_id, token_label, expires_at, max_views, views_used, revoked_at, created_at')
    .in('request_id', requestIds);

  if (grantsError) {
    console.error('Failed to load grants:', grantsError);
  }

  // Map grants to requests
  const grantsMap = new Map(
    (grants ?? []).map((g) => [g.request_id, g])
  );

  return requests.map((request) => {
    const writeup = Array.isArray(request.lab_writeups)
      ? request.lab_writeups[0]
      : request.lab_writeups;

    return {
      ...request,
      writeup_title: writeup?.title,
      writeup_slug: writeup?.slug,
      writeup_visibility: writeup?.visibility,
      writeup_machine_status: writeup?.machine_status,
      grant: grantsMap.get(request.id) || null,
    };
  });
}

/**
 * Get detailed information for a single access request
 */
export async function getAccessRequestDetail(
  portfolioId: string,
  requestId: string
): Promise<AccessRequestWithDetails | null> {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return null;
  }

  const supabase = await createAdminSupabaseClient(tokens.accessToken);

  const { data: request, error: requestError } = await supabase
    .from('writeup_access_requests')
    .select(`
      *,
      lab_writeups!inner(
        title,
        slug,
        visibility,
        machine_status
      )
    `)
    .eq('id', requestId)
    .eq('portfolio_id', portfolioId)
    .single();

  if (requestError || !request) {
    return null;
  }

  // Load grant if exists
  const { data: grant } = await supabase
    .from('writeup_access_grants')
    .select('id, token_label, expires_at, max_views, views_used, revoked_at, created_at')
    .eq('request_id', requestId)
    .maybeSingle();

  const writeup = Array.isArray(request.lab_writeups)
    ? request.lab_writeups[0]
    : request.lab_writeups;

  return {
    ...request,
    writeup_title: writeup?.title,
    writeup_slug: writeup?.slug,
    writeup_visibility: writeup?.visibility,
    writeup_machine_status: writeup?.machine_status,
    grant: grant || null,
  };
}

/**
 * Get all access grants for a portfolio
 */
export async function getAccessGrantsForAdmin(portfolioId: string): Promise<AccessGrantWithDetails[]> {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return [];
  }

  const supabase = await createAdminSupabaseClient(tokens.accessToken);

  const { data: grants, error } = await supabase
    .from('writeup_access_grants')
    .select(`
      *,
      lab_writeups!inner(
        title,
        slug
      )
    `)
    .eq('portfolio_id', portfolioId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load grants:', error);
    return [];
  }

  return (grants ?? []).map((grant) => {
    const writeup = Array.isArray(grant.lab_writeups)
      ? grant.lab_writeups[0]
      : grant.lab_writeups;

    return {
      ...grant,
      writeup_title: writeup?.title,
      writeup_slug: writeup?.slug,
    };
  });
}

/**
 * Get access logs for a portfolio
 * Optionally filter by request_id or grant_id
 */
export async function getAccessLogsForAdmin(
  portfolioId: string,
  filters?: {
    requestId?: string;
    grantId?: string;
    writeupId?: string;
  }
): Promise<WriteupAccessLog[]> {
  const tokens = await getAdminSessionTokens();

  if (!tokens) {
    return [];
  }

  const supabase = await createAdminSupabaseClient(tokens.accessToken);

  let query = supabase
    .from('writeup_access_logs')
    .select('*')
    .eq('portfolio_id', portfolioId);

  if (filters?.requestId) {
    query = query.eq('request_id', filters.requestId);
  }

  if (filters?.grantId) {
    query = query.eq('grant_id', filters.grantId);
  }

  if (filters?.writeupId) {
    query = query.eq('writeup_id', filters.writeupId);
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(50);

  if (error) {
    console.error('Failed to load access logs:', error);
    return [];
  }

  return data ?? [];
}
