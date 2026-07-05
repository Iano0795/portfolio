-- Violet portfolio content seed.
-- Source: ../violets_portfolio
--
-- Safe to rerun:
-- - Upserts only public.portfolios where slug = 'violet'.
-- - Deletes/reinserts content only for the resolved Violet portfolio_id.
-- - Does not touch Ian's portfolio or membership records.

begin;

insert into public.portfolios (
  slug,
  owner_name,
  title,
  app_name,
  public_url,
  brand_name,
  is_active
)
values (
  'violet',
  'Violet Achieng',
  'Violet Achieng | Cybersecurity Portfolio',
  'violet-portfolio',
  null,
  'VioletSec',
  true
)
on conflict (slug) do update
set
  owner_name = excluded.owner_name,
  title = excluded.title,
  app_name = excluded.app_name,
  public_url = coalesce(excluded.public_url, public.portfolios.public_url),
  brand_name = excluded.brand_name,
  is_active = excluded.is_active,
  updated_at = now();

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
delete from public.profile
using violet_portfolio
where public.profile.portfolio_id = violet_portfolio.id;

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
delete from public.projects
using violet_portfolio
where public.projects.portfolio_id = violet_portfolio.id;

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
delete from public.skills
using violet_portfolio
where public.skills.portfolio_id = violet_portfolio.id;

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
delete from public.experience
using violet_portfolio
where public.experience.portfolio_id = violet_portfolio.id;

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
delete from public.capabilities
using violet_portfolio
where public.capabilities.portfolio_id = violet_portfolio.id;

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
delete from public.credentials
using violet_portfolio
where public.credentials.portfolio_id = violet_portfolio.id;

-- No Violet-specific workflow/process section exists in the reference project.
-- Keep this table clear for Violet until a real process is authored.
with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
delete from public.process_steps
using violet_portfolio
where public.process_steps.portfolio_id = violet_portfolio.id;

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
delete from public.contact_links
using violet_portfolio
where public.contact_links.portfolio_id = violet_portfolio.id;

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
delete from public.resume_assets
using violet_portfolio
where public.resume_assets.portfolio_id = violet_portfolio.id;

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
delete from public.site_settings
using violet_portfolio
where public.site_settings.portfolio_id = violet_portfolio.id;

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
delete from public.navigation_items
using violet_portfolio
where public.navigation_items.portfolio_id = violet_portfolio.id;

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
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
)
select
  violet_portfolio.id,
  'Violet Achieng',
  'Cybersecurity Analyst',
  'I''m a cybersecurity professional with hands-on exposure to network security, vulnerability assessment, phishing analysis, Linux systems, and practical security labs. I am focused on supporting SOC operations, monitoring security alerts, and strengthening digital defenses.',
  'Hello, I''m Violet Achieng',
  'Nairobi, Kenya',
  'Open to cybersecurity, SOC monitoring, network security, and IT security support opportunities.',
  'SOC monitoring, threat detection, network security, and incident response',
  '{
    "stack": [
      "SOC monitoring",
      "Network security",
      "Vulnerability assessment",
      "Phishing analysis",
      "Linux systems",
      "Security labs"
    ],
    "now_building": [
      "SOC monitoring workflows",
      "Defensive lab analysis",
      "Incident documentation",
      "Network security fundamentals"
    ],
    "target_roles": [
      "Cybersecurity Intern",
      "SOC Analyst L1",
      "Network Security Analyst",
      "IT Security Support"
    ],
    "trust_indicators": [
      "SOC-focused",
      "Hands-on Labs",
      "Network Security",
      "Incident Response"
    ]
  }'::jsonb,
  '[
    { "label": "ROLE", "value": "Cybersecurity Analyst" },
    { "label": "LOCATION", "value": "Nairobi, Kenya" },
    { "label": "FOCUS", "value": "SOC monitoring / threat detection / network security" },
    { "label": "STATUS", "value": "Open to roles" },
    { "label": "TOOLS", "value": "Nmap / Wireshark / Hydra / Burp Suite / Linux / Ghidra" }
  ]'::jsonb,
  'Download Resume',
  'View Security Labs',
  'Send Email',
  true
from violet_portfolio;

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
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
  github_url,
  live_url,
  case_study_url,
  image_url,
  order_index,
  is_active
)
select
  violet_portfolio.id,
  project.title,
  project.slug,
  project.category,
  project.role,
  project.short_description,
  project.problem,
  project.solution,
  project.outcome,
  project.stack::jsonb,
  project.is_featured,
  project.is_private,
  project.github_url,
  project.live_url,
  project.case_study_url,
  project.image_url,
  project.order_index,
  true
from violet_portfolio
cross join (
  values
    (
      'Security Monitoring & Enumeration Lab',
      'security-monitoring-enumeration-lab',
      'Security Labs',
      'TryHackMe Lab',
      'Practiced service enumeration, network scanning, and basic exploitation analysis in a controlled lab environment.',
      'Identify exposed services, understand attack surface, and document findings from a vulnerable machine.',
      'Performed network scanning and service enumeration using Nmap. Identified open ports, service versions, and potential attack paths. Reviewed common misconfigurations and exploitation possibilities. Documented findings, risk areas, and basic mitigation recommendations.',
      'Improved understanding of how exposed services can be identified, assessed, and reported during early-stage security analysis.',
      '["Nmap", "Wireshark", "Metasploit", "Linux"]',
      true,
      false,
      null,
      null,
      null,
      null,
      0
    ),
    (
      'Basic Pentesting & Incident Analysis Lab',
      'basic-pentesting-incident-analysis-lab',
      'Incident Analysis',
      'Custom Lab',
      'Simulated a basic attack investigation workflow from discovery to incident documentation.',
      'Trace a controlled attack path, identify indicators of compromise, and summarize incident findings.',
      'Used basic scanning and enumeration to identify possible entry points. Reviewed authentication weaknesses and brute-force concepts using Hydra in a controlled setting. Mapped observed activity to possible incident indicators. Created a short incident-style summary with findings and recommendations.',
      'Built practical understanding of how offensive observations can support defensive investigation and SOC-style triage.',
      '["Hydra", "Nmap", "Linux", "Burp Suite"]',
      false,
      false,
      null,
      null,
      null,
      null,
      1
    ),
    (
      'Reverse Engineering & Malware Analysis Practice',
      'reverse-engineering-malware-analysis-practice',
      'Reverse Engineering',
      'CrackMe / Practice Binary',
      'Analyzed a simple practice binary to understand program behavior, strings, and basic reverse engineering workflow.',
      'Inspect binary behavior, identify useful strings, and understand how sensitive logic can be exposed through poor software protection.',
      'Loaded and inspected a practice binary using Ghidra. Reviewed strings, functions, and control flow at a basic level. Identified exposed logic and sensitive indicators. Documented observations in a beginner-friendly analysis note.',
      'Developed foundational awareness of binary analysis, exposed logic risks, and malware investigation concepts.',
      '["Ghidra", "Linux", "Strings", "Terminal"]',
      false,
      false,
      null,
      null,
      null,
      null,
      2
    )
) as project (
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
  github_url,
  live_url,
  case_study_url,
  image_url,
  order_index
);

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
insert into public.skills (
  portfolio_id,
  name,
  category,
  level,
  order_index,
  is_active
)
select
  violet_portfolio.id,
  skill.name,
  skill.category,
  skill.level,
  skill.order_index,
  true
from violet_portfolio
cross join (
  values
    ('Alert triage', 'SOC & Monitoring', 'SOC readiness', 0),
    ('Log review', 'SOC & Monitoring', 'SOC readiness', 1),
    ('Incident escalation', 'SOC & Monitoring', 'SOC readiness', 2),
    ('Phishing investigation', 'SOC & Monitoring', 'SOC readiness', 3),
    ('IOC identification', 'SOC & Monitoring', 'SOC readiness', 4),
    ('Security reporting', 'SOC & Monitoring', 'SOC readiness', 5),
    ('TCP/IP', 'Networking', 'Network defense', 0),
    ('DNS', 'Networking', 'Network defense', 1),
    ('HTTP/S', 'Networking', 'Network defense', 2),
    ('Subnetting', 'Networking', 'Network defense', 3),
    ('VPN fundamentals', 'Networking', 'Network defense', 4),
    ('Network segmentation', 'Networking', 'Network defense', 5),
    ('Wireshark', 'Security Tools', 'Tooling', 0),
    ('Nmap', 'Security Tools', 'Tooling', 1),
    ('Burp Suite', 'Security Tools', 'Tooling', 2),
    ('Metasploit', 'Security Tools', 'Tooling', 3),
    ('Hydra', 'Security Tools', 'Tooling', 4),
    ('Ghidra', 'Security Tools', 'Tooling', 5),
    ('Linux', 'Systems & Platforms', 'Systems', 0),
    ('Windows basics', 'Systems & Platforms', 'Systems', 1),
    ('Docker basics', 'Systems & Platforms', 'Systems', 2),
    ('Git/GitHub', 'Systems & Platforms', 'Systems', 3),
    ('Command line', 'Systems & Platforms', 'Systems', 4),
    ('Virtual labs', 'Systems & Platforms', 'Systems', 5),
    ('Python', 'Scripting & Data', 'Scripting', 0),
    ('SQL', 'Scripting & Data', 'Scripting', 1),
    ('Bash basics', 'Scripting & Data', 'Scripting', 2),
    ('Data validation', 'Scripting & Data', 'Scripting', 3),
    ('Automation basics', 'Scripting & Data', 'Scripting', 4),
    ('Technical documentation', 'Scripting & Data', 'Scripting', 5),
    ('Vulnerability assessment', 'Security Concepts', 'Security fundamentals', 0),
    ('Enumeration', 'Security Concepts', 'Security fundamentals', 1),
    ('Brute-force analysis', 'Security Concepts', 'Security fundamentals', 2),
    ('Privilege escalation basics', 'Security Concepts', 'Security fundamentals', 3),
    ('Malware analysis basics', 'Security Concepts', 'Security fundamentals', 4),
    ('Incident response lifecycle', 'Security Concepts', 'Security fundamentals', 5)
) as skill (name, category, level, order_index);

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
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
)
select
  violet_portfolio.id,
  entry.stage_label,
  entry.title,
  entry.organization,
  entry.period,
  entry.description,
  entry.achievements::jsonb,
  entry.order_index,
  true
from violet_portfolio
cross join (
  values
    (
      'Cybersecurity Labs',
      'Cybersecurity & Programming Intern',
      'Adept College',
      'May 2024 - August 2024',
      'Supported practical cybersecurity and programming activities, including hands-on labs, basic security testing, and technical learning support.',
      '[
        "Facilitated hands-on security labs using tools such as Nmap and Hydra.",
        "Supported learners in understanding enumeration, brute-force concepts, and secure coding basics.",
        "Assisted with basic programming and cybersecurity exercises.",
        "Reinforced practical threat detection and incident analysis concepts through lab-based learning."
      ]',
      0
    ),
    (
      'Data Integrity',
      'Data Encoder & Reconciliation Assistant',
      'Promze Store',
      'September 2025 - November 2025',
      'Supported data accuracy, reconciliation, and record validation workflows with a focus on consistency and auditability.',
      '[
        "Validated and reconciled 500+ records to improve data accuracy and consistency.",
        "Maintained audit trails for record updates and reconciliation activities.",
        "Identified data gaps, inconsistencies, and duplicate entries for correction.",
        "Supported structured reporting and documentation for operational records."
      ]',
      1
    )
) as entry (
  stage_label,
  title,
  organization,
  period,
  description,
  achievements,
  order_index
);

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
insert into public.capabilities (
  portfolio_id,
  title,
  description,
  icon,
  order_index,
  is_active
)
select
  violet_portfolio.id,
  capability.title,
  capability.description,
  capability.icon,
  capability.order_index,
  true
from violet_portfolio
cross join (
  values
    ('Defensive Mindset', 'Interested in protecting systems through monitoring, investigation, and practical risk reduction.', 'shield', 0),
    ('Analytical Foundation', 'Applies structured thinking from mathematics and computer science to security analysis.', 'activity', 1),
    ('Hands-on Practice', 'Builds practical confidence through labs, simulations, and security tool workflows.', 'terminal', 2),
    ('Clear Documentation', 'Values accurate notes, concise reporting, and evidence-based communication.', 'file-text', 3)
) as capability (title, description, icon, order_index);

-- Source credential periods/statuses are textual ("2021 - 2025", "Ongoing", "Learning Path").
-- Date fields are left null rather than inventing exact issue/expiry dates.
with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
insert into public.credentials (
  portfolio_id,
  title,
  issuer,
  credential_type,
  category,
  description,
  issued_at,
  expires_at,
  credential_id,
  credential_url,
  image_url,
  skills,
  order_index,
  is_featured,
  is_active
)
select
  violet_portfolio.id,
  credential.title,
  credential.issuer,
  credential.credential_type,
  credential.category,
  credential.description,
  null,
  null,
  null,
  null,
  null,
  credential.skills::jsonb,
  credential.order_index,
  credential.is_featured,
  true
from violet_portfolio
cross join (
  values
    (
      'Bachelor''s Degree in Mathematics and Computer Science',
      'Kirinyaga University',
      'Education',
      'Completed / Awaiting Graduation',
      'Built a strong foundation in programming, systems thinking, mathematics, databases, and computer science fundamentals.',
      '["Programming fundamentals", "Computer science foundations", "Mathematics and analytical thinking", "Databases and systems concepts"]',
      0,
      true
    ),
    (
      'CCNA / Networking Fundamentals',
      'Cisco Networking Academy',
      'Certification / Training',
      'Learning Path',
      'Developing networking fundamentals relevant to SOC analysis, network security, and infrastructure monitoring.',
      '["TCP/IP", "Routing and switching basics", "Subnetting", "Network troubleshooting", "Security fundamentals"]',
      1,
      false
    ),
    (
      'Cybersecurity Labs & SOC Foundations',
      'TryHackMe',
      'Practical Labs',
      'Hands-on Practice',
      'Completing practical cybersecurity labs focused on enumeration, Linux, network scanning, security tools, and beginner SOC concepts.',
      '["Pre-Security", "Linux fundamentals", "Nmap", "Web security basics", "Defensive security concepts"]',
      2,
      false
    ),
    (
      'SOC Analyst & Incident Response Preparation',
      'Cybersecurity Self-Study',
      'Learning Track',
      'Active Development',
      'Structured self-study focused on SOC monitoring, phishing analysis, alert triage, incident response, and vulnerability assessment.',
      '["SIEM concepts", "Alert triage", "Phishing analysis", "Incident response lifecycle", "Vulnerability assessment"]',
      3,
      false
    )
) as credential (
  title,
  issuer,
  credential_type,
  category,
  description,
  skills,
  order_index,
  is_featured
);

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
insert into public.contact_links (
  portfolio_id,
  label,
  type,
  url,
  icon,
  order_index,
  is_active
)
select
  violet_portfolio.id,
  link.label,
  link.type,
  link.url,
  link.icon,
  link.order_index,
  true
from violet_portfolio
cross join (
  values
    ('Email', 'email', 'mailto:achiengviolet381@gmail.com', 'mail', 0),
    ('Phone', 'phone', 'tel:+254742953000', 'phone', 1),
    ('LinkedIn', 'linkedin', 'https://www.linkedin.com/in/violet-achieng-265191299/', 'linkedin', 2),
    ('GitHub', 'github', 'https://github.com/', 'github', 3),
    ('TryHackMe', 'tryhackme', 'https://tryhackme.com/', 'globe', 4),
    ('Resume Download', 'resume', '/documents/violet-achieng-resume.pdf', 'file-text', 5)
) as link (label, type, url, icon, order_index);

-- The source resume exists at ../violets_portfolio/public/documents/violet-achieng-resume.pdf.
-- This row records the public reference path only; upload/copy the PDF to the production public app
-- or Supabase Storage before depending on this URL in production.
with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
insert into public.resume_assets (
  portfolio_id,
  file_name,
  file_url,
  version_label,
  is_active,
  uploaded_at
)
select
  violet_portfolio.id,
  'violet-achieng-resume.pdf',
  '/documents/violet-achieng-resume.pdf',
  'Reference resume from violets_portfolio/public/documents',
  true,
  now()
from violet_portfolio;

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
)
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
  is_active,
  theme_preset,
  theme_primary,
  theme_secondary,
  theme_background,
  theme_panel,
  theme_foreground,
  theme_muted,
  theme_border,
  theme_glow_intensity,
  theme_scanlines_enabled,
  theme_animation_intensity,
  theme_font_mode,
  theme_is_active
)
select
  violet_portfolio.id,
  'VioletSec',
  'Violet Achieng | Cybersecurity Portfolio',
  'Cybersecurity portfolio focused on SOC monitoring, threat detection, network security, and incident response.',
  'violet.seed.v1',
  'CMS READY',
  'Open to roles',
  'Cybersecurity Intern / SOC Analyst L1 / Network Security Analyst / IT Security Support',
  'Violet Achieng builds practical security skills through monitoring workflows, defensive lab work, incident analysis, and clear security documentation.',
  'violet@security-lab',
  'profile',
  true,
  'Violet Reference',
  '#d7a86e',
  '#8f7658',
  '#0b0a08',
  '#14110d',
  '#f5efe6',
  '#c6baaa',
  '#2b241c',
  24,
  false,
  28,
  'readable',
  true
from violet_portfolio;

with violet_portfolio as (
  select id
  from public.portfolios
  where slug = 'violet'
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
  violet_portfolio.id,
  item.section_id,
  item.label,
  item.system_label,
  item.command,
  item.icon,
  item.order_index,
  true,
  true
from violet_portfolio
cross join (
  values
    ('profile', 'Home', 'home', 'open /home', 'user', 0),
    ('about', 'About', 'about', 'open /about', 'info', 1),
    ('skills', 'Skills', 'skills', 'scan /skills', 'shield', 2),
    ('experience', 'Experience', 'experience', 'tail /experience', 'briefcase', 3),
    ('projects', 'Projects', 'security-labs', 'open /projects', 'folder-git', 4),
    ('credentials', 'Certifications', 'certifications', 'open certifications', 'award', 5),
    ('contact', 'Contact', 'contact', 'open /contact', 'mail', 6)
) as item (section_id, label, system_label, command, icon, order_index);

-- Verification queries:
--
-- select slug, owner_name, title, brand_name
-- from public.portfolios
-- where slug = 'violet';
--
-- select p.slug, pr.name, pr.headline
-- from public.profile pr
-- join public.portfolios p on p.id = pr.portfolio_id
-- where p.slug = 'violet';
--
-- select p.slug, count(*) as projects_count
-- from public.projects projects
-- join public.portfolios p on p.id = projects.portfolio_id
-- where p.slug = 'violet'
-- group by p.slug;
--
-- select p.slug, count(*) as skills_count
-- from public.skills skills
-- join public.portfolios p on p.id = skills.portfolio_id
-- where p.slug = 'violet'
-- group by p.slug;
--
-- select p.slug, count(*) as credentials_count
-- from public.credentials c
-- join public.portfolios p on p.id = c.portfolio_id
-- where p.slug = 'violet'
-- group by p.slug;
--
-- select p.slug, c.title, c.issuer, c.credential_type, c.is_active
-- from public.credentials c
-- join public.portfolios p on p.id = c.portfolio_id
-- where p.slug = 'violet'
-- order by c.order_index;

commit;
