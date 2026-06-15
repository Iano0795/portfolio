"use server";

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, getAdminSessionTokens } from '@/lib/auth/admin-session';
import { requirePortfolioAccess } from '@/lib/auth/portfolio-access';
import { generateAccessToken, hashAccessToken, generateTokenLabel } from '@/lib/writeups/tokens';

type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Approve a pending access request and create a grant
 */
export async function approveAccessRequest(
  portfolioSlug: string,
  requestId: string,
  payload: {
    reviewerNote?: string;
    expiresInDays?: number;
    expiresAt?: string;
    maxViews?: number;
    tokenLabel?: string;
  }
): Promise<ActionResult<{ rawToken: string; grantId: string }>> {
  try {
    // Authenticate and authorize
    const access = await requirePortfolioAccess(portfolioSlug);

    // Only owner/admin/editor can approve
    if (access.member.role === 'viewer') {
      return { success: false, error: 'Viewers cannot approve requests' };
    }

    const tokens = await getAdminSessionTokens();
    if (!tokens) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = await createAdminSupabaseClient(tokens.accessToken);

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(requestId)) {
      return { success: false, error: 'Invalid request ID' };
    }

    // Validate inputs
    if (payload.reviewerNote && payload.reviewerNote.length > 1000) {
      return { success: false, error: 'Reviewer note must be 1000 characters or less' };
    }

    if (payload.expiresInDays && (payload.expiresInDays < 1 || payload.expiresInDays > 365)) {
      return { success: false, error: 'Expiry days must be between 1 and 365' };
    }

    if (payload.maxViews && (payload.maxViews < 1 || payload.maxViews > 100)) {
      return { success: false, error: 'Max views must be between 1 and 100' };
    }

    if (payload.tokenLabel && payload.tokenLabel.length > 120) {
      return { success: false, error: 'Token label must be 120 characters or less' };
    }

    // Load request with writeup details
    const { data: request, error: requestError } = await supabase
      .from('writeup_access_requests')
      .select(`
        *,
        lab_writeups!inner(
          id,
          title,
          visibility,
          machine_status,
          is_active
        )
      `)
      .eq('id', requestId)
      .eq('portfolio_id', access.portfolio.id)
      .maybeSingle();

    if (requestError || !request) {
      return { success: false, error: 'Request not found' };
    }

    // Validate request status
    if (request.status !== 'pending') {
      return { success: false, error: `Request is already ${request.status}` };
    }

    // Get writeup
    const writeup = Array.isArray(request.lab_writeups)
      ? request.lab_writeups[0]
      : request.lab_writeups;

    if (!writeup) {
      return { success: false, error: 'Associated writeup not found' };
    }

    // Validate writeup
    if (!writeup.is_active) {
      return { success: false, error: 'Writeup is not active' };
    }

    if (writeup.visibility !== 'restricted') {
      return { success: false, error: 'Only restricted writeups can have access grants' };
    }

    if (writeup.machine_status === 'active') {
      return { success: false, error: 'Cannot grant access to active machines' };
    }

    // Check if grant already exists
    const { data: existingGrant } = await supabase
      .from('writeup_access_grants')
      .select('id')
      .eq('request_id', requestId)
      .maybeSingle();

    if (existingGrant) {
      return { success: false, error: 'Grant already exists for this request' };
    }

    // Calculate expiry
    let expiresAt: string | null = null;
    if (payload.expiresAt) {
      expiresAt = payload.expiresAt;
    } else if (payload.expiresInDays) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + payload.expiresInDays);
      expiresAt = expiryDate.toISOString();
    } else {
      // Default: 14 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 14);
      expiresAt = expiryDate.toISOString();
    }

    // Default max views
    const maxViews = payload.maxViews ?? 5;

    // Generate token
    const rawToken = generateAccessToken();
    const tokenHash = hashAccessToken(rawToken);
    const tokenLabel = payload.tokenLabel || generateTokenLabel(rawToken);

    // Create grant
    const { data: grant, error: grantError } = await supabase
      .from('writeup_access_grants')
      .insert({
        portfolio_id: access.portfolio.id,
        writeup_id: writeup.id,
        request_id: requestId,
        requester_email: request.requester_email,
        token_hash: tokenHash,
        token_label: tokenLabel,
        expires_at: expiresAt,
        max_views: maxViews,
        views_used: 0,
        created_by: access.user.id,
      })
      .select('id')
      .single();

    if (grantError || !grant) {
      console.error('Failed to create grant:', grantError);
      return { success: false, error: 'Failed to create grant' };
    }

    // Update request
    const { error: updateError } = await supabase
      .from('writeup_access_requests')
      .update({
        status: 'approved',
        reviewer_user_id: access.user.id,
        reviewer_note: payload.reviewerNote || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Failed to update request:', updateError);
      return { success: false, error: 'Failed to update request status' };
    }

    // Log approval
    await supabase.from('writeup_access_logs').insert({
      portfolio_id: access.portfolio.id,
      writeup_id: writeup.id,
      request_id: requestId,
      event_type: 'request_approved',
      actor_email: access.user.email,
      actor_user_id: access.user.id,
      metadata: {
        reviewer_note: payload.reviewerNote || null,
        approved_by_role: access.member.role,
      },
    });

    // Log grant creation
    await supabase.from('writeup_access_logs').insert({
      portfolio_id: access.portfolio.id,
      writeup_id: writeup.id,
      grant_id: grant.id,
      request_id: requestId,
      event_type: 'grant_created',
      actor_email: access.user.email,
      actor_user_id: access.user.id,
      metadata: {
        expires_at: expiresAt,
        max_views: maxViews,
        token_label: tokenLabel,
      },
    });

    revalidatePath(`/admin/portfolio/${portfolioSlug}/access-requests`);

    return {
      success: true,
      data: {
        rawToken,
        grantId: grant.id,
      },
    };
  } catch (error) {
    console.error('Failed to approve request:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Reject a pending access request
 */
export async function rejectAccessRequest(
  portfolioSlug: string,
  requestId: string,
  payload: {
    reviewerNote?: string;
  }
): Promise<ActionResult> {
  try {
    // Authenticate and authorize
    const access = await requirePortfolioAccess(portfolioSlug);

    // Only owner/admin/editor can reject
    if (access.member.role === 'viewer') {
      return { success: false, error: 'Viewers cannot reject requests' };
    }

    const tokens = await getAdminSessionTokens();
    if (!tokens) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = await createAdminSupabaseClient(tokens.accessToken);

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(requestId)) {
      return { success: false, error: 'Invalid request ID' };
    }

    // Validate inputs
    if (payload.reviewerNote && payload.reviewerNote.length > 1000) {
      return { success: false, error: 'Reviewer note must be 1000 characters or less' };
    }

    // Load request
    const { data: request, error: requestError } = await supabase
      .from('writeup_access_requests')
      .select('id, status, writeup_id, requester_email')
      .eq('id', requestId)
      .eq('portfolio_id', access.portfolio.id)
      .maybeSingle();

    if (requestError || !request) {
      return { success: false, error: 'Request not found' };
    }

    // Validate request status
    if (request.status !== 'pending') {
      return { success: false, error: `Request is already ${request.status}` };
    }

    // Update request
    const { error: updateError } = await supabase
      .from('writeup_access_requests')
      .update({
        status: 'rejected',
        reviewer_user_id: access.user.id,
        reviewer_note: payload.reviewerNote || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Failed to update request:', updateError);
      return { success: false, error: 'Failed to update request status' };
    }

    // Log rejection
    await supabase.from('writeup_access_logs').insert({
      portfolio_id: access.portfolio.id,
      writeup_id: request.writeup_id,
      request_id: requestId,
      event_type: 'request_rejected',
      actor_email: access.user.email,
      actor_user_id: access.user.id,
      metadata: {
        reviewer_note: payload.reviewerNote || null,
        rejected_by_role: access.member.role,
      },
    });

    revalidatePath(`/admin/portfolio/${portfolioSlug}/access-requests`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Failed to reject request:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Revoke an access grant
 */
export async function revokeAccessGrant(
  portfolioSlug: string,
  grantId: string,
  payload: {
    revokeReason?: string;
  }
): Promise<ActionResult> {
  try {
    // Authenticate and authorize
    const access = await requirePortfolioAccess(portfolioSlug);

    // Only owner/admin/editor can revoke
    if (access.member.role === 'viewer') {
      return { success: false, error: 'Viewers cannot revoke grants' };
    }

    const tokens = await getAdminSessionTokens();
    if (!tokens) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = await createAdminSupabaseClient(tokens.accessToken);

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(grantId)) {
      return { success: false, error: 'Invalid grant ID' };
    }

    // Validate inputs
    if (payload.revokeReason && payload.revokeReason.length > 1000) {
      return { success: false, error: 'Revoke reason must be 1000 characters or less' };
    }

    // Load grant
    const { data: grant, error: grantError } = await supabase
      .from('writeup_access_grants')
      .select('id, writeup_id, request_id, revoked_at')
      .eq('id', grantId)
      .eq('portfolio_id', access.portfolio.id)
      .maybeSingle();

    if (grantError || !grant) {
      return { success: false, error: 'Grant not found' };
    }

    // Check if already revoked
    if (grant.revoked_at) {
      return { success: false, error: 'Grant is already revoked' };
    }

    // Revoke grant
    const { error: updateError } = await supabase
      .from('writeup_access_grants')
      .update({
        revoked_at: new Date().toISOString(),
        revoked_by: access.user.id,
        revoke_reason: payload.revokeReason || null,
      })
      .eq('id', grantId);

    if (updateError) {
      console.error('Failed to revoke grant:', updateError);
      return { success: false, error: 'Failed to revoke grant' };
    }

    // Log revocation
    await supabase.from('writeup_access_logs').insert({
      portfolio_id: access.portfolio.id,
      writeup_id: grant.writeup_id,
      grant_id: grantId,
      request_id: grant.request_id,
      event_type: 'grant_revoked',
      actor_email: access.user.email,
      actor_user_id: access.user.id,
      metadata: {
        revoke_reason: payload.revokeReason || null,
        revoked_by_role: access.member.role,
      },
    });

    revalidatePath(`/admin/portfolio/${portfolioSlug}/access-requests`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Failed to revoke grant:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Cancel a pending access request (optional feature)
 */
export async function cancelAccessRequest(
  portfolioSlug: string,
  requestId: string
): Promise<ActionResult> {
  try {
    // Authenticate and authorize
    const access = await requirePortfolioAccess(portfolioSlug);

    // Only owner/admin/editor can cancel
    if (access.member.role === 'viewer') {
      return { success: false, error: 'Viewers cannot cancel requests' };
    }

    const tokens = await getAdminSessionTokens();
    if (!tokens) {
      return { success: false, error: 'Not authenticated' };
    }

    const supabase = await createAdminSupabaseClient(tokens.accessToken);

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(requestId)) {
      return { success: false, error: 'Invalid request ID' };
    }

    // Load request
    const { data: request, error: requestError } = await supabase
      .from('writeup_access_requests')
      .select('id, status, writeup_id')
      .eq('id', requestId)
      .eq('portfolio_id', access.portfolio.id)
      .maybeSingle();

    if (requestError || !request) {
      return { success: false, error: 'Request not found' };
    }

    // Validate request status
    if (request.status !== 'pending') {
      return { success: false, error: `Cannot cancel ${request.status} request` };
    }

    // Cancel request
    const { error: updateError } = await supabase
      .from('writeup_access_requests')
      .update({
        status: 'cancelled',
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Failed to cancel request:', updateError);
      return { success: false, error: 'Failed to cancel request' };
    }

    // Log cancellation
    await supabase.from('writeup_access_logs').insert({
      portfolio_id: access.portfolio.id,
      writeup_id: request.writeup_id,
      request_id: requestId,
      event_type: 'access_denied',
      actor_email: access.user.email,
      actor_user_id: access.user.id,
      metadata: {
        action: 'cancelled',
        cancelled_by_role: access.member.role,
      },
    });

    revalidatePath(`/admin/portfolio/${portfolioSlug}/access-requests`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Failed to cancel request:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
