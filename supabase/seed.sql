-- CMS seed data generated from the current src/data files.
-- Existing seed content belongs to Ian's portfolio (`portfolios.slug = 'ian'`).
-- Violet's portfolio shell is created here, but Violet content is intentionally not fully seeded yet.
--
-- RLS assumptions:
-- - Public users can read rows marked active by the migration policies.
-- - Authenticated users can manage content only for portfolios where they are active owner/admin/editor members.
-- - The legacy public.admins table may still bootstrap portfolio creation temporarily.
--
-- This seed intentionally does not insert resume_assets because there is no real resume URL yet.

truncate table
  public.profile,
  public.projects,
  public.skills,
  public.experience,
  public.capabilities,
  public.process_steps,
  public.contact_links,
  public.resume_assets,
  public.site_settings,
  public.navigation_items
restart identity cascade;

-- Seed placeholder for admin bootstrap.
-- Replace with a real authenticated Supabase user id after creating the first admin user.
-- insert into public.admins (user_id, email, role)
-- values ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'admin');

insert into public.portfolios (slug, owner_name, title, app_name, brand_name, is_active)
values ('ian', 'Ian Kipkorir', 'IanOS Portfolio', 'ian-portfolio', 'IanOS', true)
on conflict (slug) do update
set
  owner_name = excluded.owner_name,
  title = excluded.title,
  app_name = excluded.app_name,
  brand_name = excluded.brand_name,
  is_active = excluded.is_active;

insert into public.portfolios (slug, owner_name, title, app_name, brand_name, is_active)
values ('violet', 'Violet Achieng', 'Violet Achieng Portfolio', 'violet-portfolio', 'VioletSec', true)
on conflict (slug) do update
set
  owner_name = excluded.owner_name,
  title = excluded.title,
  app_name = excluded.app_name,
  brand_name = excluded.brand_name,
  is_active = excluded.is_active;

-- Grant Ian access:
-- insert into public.portfolio_members (portfolio_id, user_id, email, role)
-- select p.id, u.id, u.email, 'owner'
-- from public.portfolios p
-- cross join auth.users u
-- where p.slug = 'ian'
-- and u.email = 'ian-email@example.com'
-- on conflict do nothing;
--
-- Grant Violet access:
-- insert into public.portfolio_members (portfolio_id, user_id, email, role)
-- select p.id, u.id, u.email, 'owner'
-- from public.portfolios p
-- cross join auth.users u
-- where p.slug = 'violet'
-- and u.email = 'violet-email@example.com'
-- on conflict do nothing;

insert into public.profile (
  portfolio_id,
  name,
  headline,
  subheadline,
  intro_line,
  location,
  availability_status,
  current_focus,
  core_stack,
  terminal_lines,
  cta_primary_label,
  cta_secondary_label,
  cta_contact_label,
  is_active
) values (
  (select id from public.portfolios where slug = 'ian'),
  'Ian Kipkorir',
  'Full-Stack Engineer & Solutions Architect',
  'I turn complex business requirements into secure, scalable digital platforms — from prototype and architecture to production-ready systems.',
  'module.identity / professional kernel',
  null,
  'selected opportunities',
  'Enterprise Platforms',
  '{
    "stack": ["React", "Next.js", "Node.js", "TypeScript"],
    "now_building": [
      "Enterprise digital platforms",
      "DXP / DWS prototypes",
      "Security-aware full-stack systems",
      "AI-assisted engineering workflows"
    ]
  }'::jsonb,
  '[
    { "label": "NAME", "value": "Ian Kipkorir" },
    { "label": "ROLE", "value": "Full-Stack Engineer" },
    { "label": "MODE", "value": "Solutions Architect" },
    { "label": "FOCUS", "value": "Enterprise Platforms" },
    { "label": "SIGNAL", "value": "Security-aware builder" },
    { "label": "STACK", "value": "React / Next.js / Node.js / TypeScript" }
  ]'::jsonb,
  'open builds',
  'open toolchain',
  'connect.sh',
  true
);

insert into public.projects (
  portfolio_id,
  title,
  slug,
  category,
  role,
  short_description,
  problem,
  solution,
  outcome,
  stack,
  is_featured,
  is_private,
  order_index,
  is_active
) values
(
  (select id from public.portfolios where slug = 'ian'),
  'Digital Workspace Platform',
  'dq-digital-workspace-platform',
  'Enterprise Platforms',
  'Featured Build',
  'Enterprise digital workspace platform for workflows, documents, teams, and operational tooling.',
  'Enterprise teams needed a unified workspace for documents, workflows, collaboration, and operational visibility.',
  'Workspace modules, workflow stages, access-aware journeys, data surfaces, and prototype-ready interface behavior.',
  'Private enterprise project — case study available on request.',
  '["React", "Next.js", "Node.js", "PostgreSQL"]'::jsonb,
  true,
  true,
  1,
  true
),
(
  (select id from public.portfolios where slug = 'ian'),
  'Digital Banking DXP',
  'qnb-digital-banking-dxp',
  'Enterprise Platforms',
  'Digital Experience Platform',
  'Banking DXP work focused on secure customer journeys, service surfaces, and scalable platform behavior.',
  null,
  null,
  'Private enterprise project — case study available on request.',
  '["React", "GraphQL", "Node.js", "Prisma"]'::jsonb,
  false,
  true,
  2,
  true
),
(
  (select id from public.portfolios where slug = 'ian'),
  'Khalifa Fund Enterprise Journey Platform',
  'khalifa-fund-enterprise-journey-platform',
  'Enterprise Platforms',
  'Enterprise Journey System',
  'Journey platform shaping multi-stage funding workflows, approval paths, and application visibility.',
  null,
  null,
  'Private enterprise project — case study available on request.',
  '["Next.js", "TypeScript", "Express", "PostgreSQL"]'::jsonb,
  false,
  true,
  3,
  true
),
(
  (select id from public.portfolios where slug = 'ian'),
  'Microsoft Omnichannel Chat Integration',
  'microsoft-omnichannel-chat-integration',
  'Integrations',
  'Integration Build',
  'Chat integration connecting Microsoft Omnichannel with enterprise platform workflows and service touchpoints.',
  null,
  null,
  'Private enterprise project — case study available on request.',
  '["Node.js", "REST APIs", "WebSockets", "Azure"]'::jsonb,
  false,
  true,
  4,
  true
),
(
  (select id from public.portfolios where slug = 'ian'),
  'Cybersecurity Labs & CTF Projects',
  'cybersecurity-labs-ctf-projects',
  'Security',
  'Security Practice',
  'Hands-on labs and CTF work covering network analysis, web testing, vulnerability thinking, and defensive awareness.',
  null,
  null,
  'Selected notes and walkthroughs available on request.',
  '["Nmap", "Wireshark", "Burp Suite", "Linux"]'::jsonb,
  false,
  false,
  5,
  true
);

-- Secondary project categories such as DXP/DWS are present in src/data/projects.ts but
-- the MVP projects table has a single text category column. Preserve multi-category
-- filtering locally until a future taxonomy table or jsonb category field is added.

insert into public.skills (portfolio_id, name, category, level, order_index, is_active) values
((select id from public.portfolios where slug = 'ian'), 'React', 'Interface Layer', 'loaded', 1, true),
((select id from public.portfolios where slug = 'ian'), 'Next.js', 'Interface Layer', 'loaded', 2, true),
((select id from public.portfolios where slug = 'ian'), 'TypeScript', 'Interface Layer', 'loaded', 3, true),
((select id from public.portfolios where slug = 'ian'), 'Tailwind', 'Interface Layer', 'loaded', 4, true),
((select id from public.portfolios where slug = 'ian'), 'Node.js', 'Service Layer', 'loaded', 1, true),
((select id from public.portfolios where slug = 'ian'), 'Express', 'Service Layer', 'loaded', 2, true),
((select id from public.portfolios where slug = 'ian'), 'GraphQL', 'Service Layer', 'loaded', 3, true),
((select id from public.portfolios where slug = 'ian'), 'REST', 'Service Layer', 'loaded', 4, true),
((select id from public.portfolios where slug = 'ian'), 'PostgreSQL', 'Data Layer', 'loaded', 1, true),
((select id from public.portfolios where slug = 'ian'), 'Prisma', 'Data Layer', 'loaded', 2, true),
((select id from public.portfolios where slug = 'ian'), 'Supabase', 'Data Layer', 'loaded', 3, true),
((select id from public.portfolios where slug = 'ian'), 'Vercel', 'Platform Layer', 'loaded', 1, true),
((select id from public.portfolios where slug = 'ian'), 'Docker', 'Platform Layer', 'loaded', 2, true),
((select id from public.portfolios where slug = 'ian'), 'Git', 'Platform Layer', 'loaded', 3, true),
((select id from public.portfolios where slug = 'ian'), 'Nmap', 'Security Layer', 'loaded', 1, true),
((select id from public.portfolios where slug = 'ian'), 'Wireshark', 'Security Layer', 'loaded', 2, true),
((select id from public.portfolios where slug = 'ian'), 'Burp Suite', 'Security Layer', 'loaded', 3, true),
((select id from public.portfolios where slug = 'ian'), 'SIEM basics', 'Security Layer', 'loaded', 4, true),
((select id from public.portfolios where slug = 'ian'), 'Figma', 'Design/AI Layer', 'loaded', 1, true),
((select id from public.portfolios where slug = 'ian'), 'Magic Patterns', 'Design/AI Layer', 'loaded', 2, true),
((select id from public.portfolios where slug = 'ian'), 'Codex', 'Design/AI Layer', 'loaded', 3, true);

-- Skill group accent colors and paths remain local UI metadata in src/data/skills.ts.

insert into public.experience (
  portfolio_id,
  stage_label,
  title,
  organization,
  period,
  description,
  achievements,
  order_index,
  is_active
) values
(
  (select id from public.portfolios where slug = 'ian'),
  'Stage 01',
  'Full-Stack Execution',
  null,
  'foundation',
  'Built modern interfaces, service endpoints, integrations, and production features across the stack.',
  '["React and Next.js interfaces", "Node.js service work", "API integration and delivery discipline"]'::jsonb,
  1,
  true
),
(
  (select id from public.portfolios where slug = 'ian'),
  'Stage 02',
  'Platform Thinking',
  null,
  'enterprise systems',
  'Moved from feature delivery into workflow platforms, DXP/DWS concepts, data surfaces, and system-wide product behavior.',
  '["Enterprise journey mapping", "Workspace platform modules", "Cross-system workflow awareness"]'::jsonb,
  2,
  true
),
(
  (select id from public.portfolios where slug = 'ian'),
  'Stage 03',
  'Solution Leadership',
  null,
  'architecture track',
  'Translated stakeholder requirements into architecture, prototype direction, implementation plans, and handoff-ready specs.',
  '["Architecture blueprints", "Prototype-to-build alignment", "Technical communication across roles"]'::jsonb,
  3,
  true
),
(
  (select id from public.portfolios where slug = 'ian'),
  'Stage 04',
  'Security-Aware Engineering',
  null,
  'active focus',
  'Strengthened delivery with cybersecurity practice across access, validation, data exposure, testing, and operations.',
  '["Nmap, Wireshark, Burp Suite", "CTF and lab practice", "Security thinking inside product delivery"]'::jsonb,
  4,
  true
);

insert into public.capabilities (portfolio_id, title, description, icon, order_index, is_active) values
((select id from public.portfolios where slug = 'ian'), 'Translate Requirements', 'Convert business journeys and specs into buildable systems.', null, 1, true),
((select id from public.portfolios where slug = 'ian'), 'Design Platform Architecture', 'Structure frontend, backend, workflows, APIs, and access models.', null, 2, true),
((select id from public.portfolios where slug = 'ian'), 'Build Working Prototypes', 'Move ideas from static requirements to usable product experiences.', null, 3, true),
((select id from public.portfolios where slug = 'ian'), 'Secure the System Thinking', 'Apply cybersecurity awareness to access, data, APIs, logging, and operations.', null, 4, true);

-- Capability signal labels remain local until a metadata/jsonb field is added:
-- business -> system, shape -> platform, spec -> prototype, surface -> controls.

insert into public.process_steps (portfolio_id, title, description, command, label, order_index, is_active) values
((select id from public.portfolios where slug = 'ian'), 'Requirement', null, null, 'stage.01', 1, true),
((select id from public.portfolios where slug = 'ian'), 'Architecture', null, null, 'stage.02', 2, true),
((select id from public.portfolios where slug = 'ian'), 'Prototype', null, null, 'stage.03', 3, true),
((select id from public.portfolios where slug = 'ian'), 'Implementation', null, null, 'stage.04', 4, true),
((select id from public.portfolios where slug = 'ian'), 'Review', null, null, 'stage.05', 5, true);

-- Terminal pipeline and review checklist content remain local until process metadata
-- fields or related child tables are added.

insert into public.contact_links (portfolio_id, label, type, url, icon, order_index, is_active) values
((select id from public.portfolios where slug = 'ian'), 'LINKEDIN', 'linkedin', 'https://linkedin.com/in/iankipkorir', null, 1, true),
((select id from public.portfolios where slug = 'ian'), 'GITHUB', 'github', 'https://github.com/iankipkorir', null, 2, true);

-- The CV contact tile has no URL today. Add it to resume_assets after a real file_url exists.
-- Contact form labels, demo send states, availability copy, and collaboration signals
-- remain local until the CMS schema grows contact section settings.

insert into public.site_settings (
  portfolio_id,
  brand_name,
  app_title,
  tagline,
  version_label,
  mode_label,
  status_label,
  availability_label,
  footer_text,
  command_prompt_prefix,
  default_section,
  is_active
) values (
  (select id from public.portfolios where slug = 'ian'),
  'IanOS',
  'personal operating system',
  null,
  'kernel v2.6',
  'solutions-architecture',
  'ONLINE',
  'selected opportunities',
  'IanOS ready. Type help or switch a module.',
  'ian@IanOS',
  'profile',
  true
);

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
) values
((select id from public.portfolios where slug = 'ian'), 'profile', 'Profile', 'identity.sys', 'cat /profile/identity.sys', 'user', 1, true, true),
((select id from public.portfolios where slug = 'ian'), 'about', 'About', 'origin.log', 'tail /logs/origin.log', 'file-text', 2, true, true),
((select id from public.portfolios where slug = 'ian'), 'capabilities', 'Capabilities', 'capabilities.map', 'open /maps/capabilities.map', 'network', 3, true, true),
((select id from public.portfolios where slug = 'ian'), 'skills', 'Skills', 'toolchain.bin', 'scan /bin/toolchain.bin', 'cpu', 4, true, true),
((select id from public.portfolios where slug = 'ian'), 'projects', 'Projects', 'builds/', 'ls /builds/', 'folder-git', 5, true, true),
((select id from public.portfolios where slug = 'ian'), 'process', 'Process', 'process.pipeline', 'run /pipelines/process.pipeline', 'git-branch', 6, true, true),
((select id from public.portfolios where slug = 'ian'), 'experience', 'Experience', 'career.log', 'tail -f /logs/career.log', 'briefcase', 7, true, true),
((select id from public.portfolios where slug = 'ian'), 'contact', 'Contact', 'connect.sh', './connect.sh', 'send', 8, true, true);
