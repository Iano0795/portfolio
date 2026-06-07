import { createServerSupabaseClient } from '@/lib/supabase/server';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type SupabaseMaybeSingleResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};

type SupabaseListResponse<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

export type CmsProfile = {
  id: string;
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
  label: string;
  type: string | null;
  url: string;
  icon: string | null;
  order_index: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CmsSiteSettings = {
  id: string;
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
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CmsNavigationItem = {
  id: string;
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

export async function getProfile(): Promise<CmsProfile | null> {
  const supabase = createServerSupabaseClient();

  return requireMaybeSingle<CmsProfile>(
    supabase
      .from('profile')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  );
}

export async function getProjects(): Promise<CmsProject[]> {
  const supabase = createServerSupabaseClient();

  return requireList<CmsProject>(
    supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true }),
  );
}

export async function getSkills(): Promise<CmsSkill[]> {
  const supabase = createServerSupabaseClient();

  return requireList<CmsSkill>(
    supabase
      .from('skills')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('order_index', { ascending: true }),
  );
}

export async function getExperience(): Promise<CmsExperience[]> {
  const supabase = createServerSupabaseClient();

  return requireList<CmsExperience>(
    supabase
      .from('experience')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true }),
  );
}

export async function getCapabilities(): Promise<CmsCapability[]> {
  const supabase = createServerSupabaseClient();

  return requireList<CmsCapability>(
    supabase
      .from('capabilities')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true }),
  );
}

export async function getProcessSteps(): Promise<CmsProcessStep[]> {
  const supabase = createServerSupabaseClient();

  return requireList<CmsProcessStep>(
    supabase
      .from('process_steps')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true }),
  );
}

export async function getContactLinks(): Promise<CmsContactLink[]> {
  const supabase = createServerSupabaseClient();

  return requireList<CmsContactLink>(
    supabase
      .from('contact_links')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true }),
  );
}

export async function getSiteSettings(): Promise<CmsSiteSettings | null> {
  const supabase = createServerSupabaseClient();

  return requireMaybeSingle<CmsSiteSettings>(
    supabase
      .from('site_settings')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  );
}

export async function getNavigationItems(): Promise<CmsNavigationItem[]> {
  const supabase = createServerSupabaseClient();

  return requireList<CmsNavigationItem>(
    supabase
      .from('navigation_items')
      .select('*')
      .eq('is_active', true)
      .eq('is_visible', true)
      .order('order_index', { ascending: true }),
  );
}

export async function getActiveResume(): Promise<CmsResumeAsset | null> {
  const supabase = createServerSupabaseClient();

  return requireMaybeSingle<CmsResumeAsset>(
    supabase
      .from('resume_assets')
      .select('*')
      .eq('is_active', true)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  );
}
