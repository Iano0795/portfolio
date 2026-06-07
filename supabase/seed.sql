-- CMS seed data generated from the current src/data files.
--
-- RLS assumptions:
-- - Public users can read rows marked active by the migration policies.
-- - Only authenticated users listed in public.admins can insert, update, or delete CMS content.
-- - The first admin must be created manually after a Supabase Auth user exists.
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

insert into public.profile (
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

insert into public.skills (name, category, level, order_index, is_active) values
('React', 'Interface Layer', 'loaded', 1, true),
('Next.js', 'Interface Layer', 'loaded', 2, true),
('TypeScript', 'Interface Layer', 'loaded', 3, true),
('Tailwind', 'Interface Layer', 'loaded', 4, true),
('Node.js', 'Service Layer', 'loaded', 1, true),
('Express', 'Service Layer', 'loaded', 2, true),
('GraphQL', 'Service Layer', 'loaded', 3, true),
('REST', 'Service Layer', 'loaded', 4, true),
('PostgreSQL', 'Data Layer', 'loaded', 1, true),
('Prisma', 'Data Layer', 'loaded', 2, true),
('Supabase', 'Data Layer', 'loaded', 3, true),
('Vercel', 'Platform Layer', 'loaded', 1, true),
('Docker', 'Platform Layer', 'loaded', 2, true),
('Git', 'Platform Layer', 'loaded', 3, true),
('Nmap', 'Security Layer', 'loaded', 1, true),
('Wireshark', 'Security Layer', 'loaded', 2, true),
('Burp Suite', 'Security Layer', 'loaded', 3, true),
('SIEM basics', 'Security Layer', 'loaded', 4, true),
('Figma', 'Design/AI Layer', 'loaded', 1, true),
('Magic Patterns', 'Design/AI Layer', 'loaded', 2, true),
('Codex', 'Design/AI Layer', 'loaded', 3, true);

-- Skill group accent colors and paths remain local UI metadata in src/data/skills.ts.

insert into public.experience (
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
  'Stage 04',
  'Security-Aware Engineering',
  null,
  'active focus',
  'Strengthened delivery with cybersecurity practice across access, validation, data exposure, testing, and operations.',
  '["Nmap, Wireshark, Burp Suite", "CTF and lab practice", "Security thinking inside product delivery"]'::jsonb,
  4,
  true
);

insert into public.capabilities (title, description, icon, order_index, is_active) values
('Translate Requirements', 'Convert business journeys and specs into buildable systems.', null, 1, true),
('Design Platform Architecture', 'Structure frontend, backend, workflows, APIs, and access models.', null, 2, true),
('Build Working Prototypes', 'Move ideas from static requirements to usable product experiences.', null, 3, true),
('Secure the System Thinking', 'Apply cybersecurity awareness to access, data, APIs, logging, and operations.', null, 4, true);

-- Capability signal labels remain local until a metadata/jsonb field is added:
-- business -> system, shape -> platform, spec -> prototype, surface -> controls.

insert into public.process_steps (title, description, command, label, order_index, is_active) values
('Requirement', null, null, 'stage.01', 1, true),
('Architecture', null, null, 'stage.02', 2, true),
('Prototype', null, null, 'stage.03', 3, true),
('Implementation', null, null, 'stage.04', 4, true),
('Review', null, null, 'stage.05', 5, true);

-- Terminal pipeline and review checklist content remain local until process metadata
-- fields or related child tables are added.

insert into public.contact_links (label, type, url, icon, order_index, is_active) values
('LINKEDIN', 'linkedin', 'https://linkedin.com/in/iankipkorir', null, 1, true),
('GITHUB', 'github', 'https://github.com/iankipkorir', null, 2, true);

-- The CV contact tile has no URL today. Add it to resume_assets after a real file_url exists.
-- Contact form labels, demo send states, availability copy, and collaboration signals
-- remain local until the CMS schema grows contact section settings.

insert into public.site_settings (
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
  section_id,
  label,
  system_label,
  command,
  icon,
  order_index,
  is_visible,
  is_active
) values
('profile', 'Profile', 'identity.sys', 'cat /profile/identity.sys', 'user', 1, true, true),
('about', 'About', 'origin.log', 'tail /logs/origin.log', 'file-text', 2, true, true),
('capabilities', 'Capabilities', 'capabilities.map', 'open /maps/capabilities.map', 'network', 3, true, true),
('skills', 'Skills', 'toolchain.bin', 'scan /bin/toolchain.bin', 'cpu', 4, true, true),
('projects', 'Projects', 'builds/', 'ls /builds/', 'folder-git', 5, true, true),
('process', 'Process', 'process.pipeline', 'run /pipelines/process.pipeline', 'git-branch', 6, true, true),
('experience', 'Experience', 'career.log', 'tail -f /logs/career.log', 'briefcase', 7, true, true),
('contact', 'Contact', 'connect.sh', './connect.sh', 'send', 8, true, true);
