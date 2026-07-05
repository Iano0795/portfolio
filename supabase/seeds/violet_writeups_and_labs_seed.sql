-- Violet Writeups & Labs consolidation seed.
--
-- Safe to rerun:
-- - Resolves portfolio_id from slug = 'violet'.
-- - Upserts only Violet lab_writeups by (portfolio_id, slug).
-- - Archives only Violet project rows migrated into lab_writeups.
-- - Updates only Violet navigation rows.
--
-- Content source:
-- - ../violets_portfolio/src/data/portfolio.ts
-- - No full Markdown writeup files or screenshots were found in the workspace.
-- - content_markdown is intentionally left null to avoid fabricating full writeups.

begin;

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
),
source_labs as (
  select *
  from (
    values
      (
        'Security Monitoring & Enumeration Lab',
        'security-monitoring-enumeration-lab',
        'TryHackMe',
        null,
        'Security Monitoring',
        'defensive',
        'retired',
        'public',
        false,
        'Practiced service enumeration, network scanning, and basic exploitation analysis in a controlled lab environment.',
        'Identify exposed services, understand attack surface, and document findings from a vulnerable machine.',
        '["Nmap", "Wireshark", "Metasploit", "Linux"]'::jsonb,
        '["Enumeration", "Network analysis", "Vulnerability assessment", "Documentation"]'::jsonb,
        '["monitoring", "enumeration", "network-security", "documentation"]'::jsonb,
        true,
        0
      ),
      (
        'Basic Pentesting & Incident Analysis Lab',
        'basic-pentesting-incident-analysis-lab',
        'Custom Lab',
        null,
        'Pentesting / Incident Analysis',
        'offensive',
        'retired',
        'public',
        false,
        'Simulated a basic attack investigation workflow from discovery to incident documentation.',
        'Trace a controlled attack path, identify indicators of compromise, and summarize incident findings.',
        '["Hydra", "Nmap", "Linux", "Burp Suite"]'::jsonb,
        '["Incident analysis", "Brute-force analysis", "Authentication testing", "Security reporting"]'::jsonb,
        '["pentesting", "incident-analysis", "authentication", "soc-triage"]'::jsonb,
        false,
        1
      ),
      (
        'Reverse Engineering & Malware Analysis Practice',
        'reverse-engineering-malware-analysis-practice',
        'CrackMe / Practice Binary',
        null,
        'Reverse Engineering',
        'defensive',
        'retired',
        'public',
        false,
        'Analyzed a simple practice binary to understand program behavior, strings, and basic reverse engineering workflow.',
        'Inspect binary behavior, identify useful strings, and understand how sensitive logic can be exposed through poor software protection.',
        '["Ghidra", "Linux", "Strings", "Terminal"]'::jsonb,
        '["Reverse engineering basics", "Malware analysis fundamentals", "Static analysis", "Technical documentation"]'::jsonb,
        '["reverse-engineering", "malware-analysis", "static-analysis", "documentation"]'::jsonb,
        false,
        2
      )
  ) as lab (
    title,
    slug,
    platform,
    difficulty,
    category,
    lab_type,
    machine_status,
    visibility,
    is_requestable,
    public_teaser,
    public_summary,
    tools,
    skills,
    tags,
    is_featured,
    order_index
  )
),
project_matches as (
  select pr.id, pr.slug
  from public.projects pr
  join violet_portfolio vp on vp.id = pr.portfolio_id
  join source_labs lab on lab.slug = pr.slug
)
insert into public.lab_writeups (
  portfolio_id,
  project_id,
  title,
  slug,
  platform,
  difficulty,
  category,
  lab_type,
  machine_status,
  visibility,
  is_requestable,
  public_summary,
  public_teaser,
  tools,
  skills,
  tags,
  content_markdown,
  cover_image_url,
  reading_time_minutes,
  published_at,
  is_featured,
  is_active,
  order_index
)
select
  vp.id,
  pm.id,
  lab.title,
  lab.slug,
  lab.platform,
  lab.difficulty,
  lab.category,
  lab.lab_type,
  lab.machine_status,
  lab.visibility,
  lab.is_requestable,
  lab.public_summary,
  lab.public_teaser,
  lab.tools,
  lab.skills,
  lab.tags,
  null,
  null,
  null,
  null,
  lab.is_featured,
  true,
  lab.order_index
from violet_portfolio vp
cross join source_labs lab
left join project_matches pm on pm.slug = lab.slug
on conflict on constraint lab_writeups_slug_unique_per_portfolio
do update set
  project_id = excluded.project_id,
  title = excluded.title,
  platform = excluded.platform,
  difficulty = excluded.difficulty,
  category = excluded.category,
  lab_type = excluded.lab_type,
  machine_status = excluded.machine_status,
  visibility = excluded.visibility,
  is_requestable = excluded.is_requestable,
  public_summary = excluded.public_summary,
  public_teaser = excluded.public_teaser,
  tools = excluded.tools,
  skills = excluded.skills,
  tags = excluded.tags,
  cover_image_url = excluded.cover_image_url,
  reading_time_minutes = excluded.reading_time_minutes,
  published_at = excluded.published_at,
  is_featured = excluded.is_featured,
  is_active = true,
  order_index = excluded.order_index,
  updated_at = now();

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
update public.projects pr
set is_active = false,
    updated_at = now()
from violet_portfolio vp
where pr.portfolio_id = vp.id
  and pr.slug in (
    'security-monitoring-enumeration-lab',
    'basic-pentesting-incident-analysis-lab',
    'reverse-engineering-malware-analysis-practice'
  );

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
update public.navigation_items nav
set is_visible = false,
    is_active = false,
    updated_at = now()
from violet_portfolio vp
where nav.portfolio_id = vp.id
  and nav.section_id = 'projects';

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
),
updated as (
  update public.navigation_items nav
  set label = 'Writeups & Labs',
      system_label = 'WRITEUPS_AND_LABS',
      command = 'open writeups',
      icon = 'file-text',
      order_index = 4,
      is_visible = true,
      is_active = true,
      updated_at = now()
  from violet_portfolio vp
  where nav.portfolio_id = vp.id
    and nav.section_id = 'writeups'
  returning nav.id
)
insert into public.navigation_items (
  portfolio_id,
  section_id,
  label,
  system_label,
  command,
  icon,
  order_index,
  is_visible,
  is_active
)
select
  vp.id,
  'writeups',
  'Writeups & Labs',
  'WRITEUPS_AND_LABS',
  'open writeups',
  'file-text',
  4,
  true,
  true
from violet_portfolio vp
where not exists (select 1 from updated);

-- Classification assumptions:
-- - Security Monitoring & Enumeration Lab is defensive because the source emphasizes monitoring, exposed-service assessment, and reporting.
-- - Basic Pentesting & Incident Analysis Lab is offensive because the source emphasizes pentesting, authentication testing, and controlled attack-path discovery.
-- - Reverse Engineering & Malware Analysis Practice is defensive because the source emphasizes malware investigation/static analysis rather than exploit development.
--
-- Full public Markdown and screenshots are still missing. These rows are public teaser/catalog records
-- but can_read_full remains false until safe content_markdown is added for retired public labs.

commit;

