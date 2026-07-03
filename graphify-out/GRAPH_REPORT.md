# Graph Report - .  (2026-07-03)

## Corpus Check
- 269 files · ~135,834 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1508 nodes · 3334 edges · 62 communities (58 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.69)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Core UI Primitives|Core UI Primitives]]
- [[_COMMUNITY_Writeups Admin Actions|Writeups Admin Actions]]
- [[_COMMUNITY_Projects Admin Actions|Projects Admin Actions]]
- [[_COMMUNITY_Theme Settings Actions|Theme Settings Actions]]
- [[_COMMUNITY_Admin Dashboard & CMS Types|Admin Dashboard & CMS Types]]
- [[_COMMUNITY_Form & Overlay UI|Form & Overlay UI]]
- [[_COMMUNITY_Admin Dashboard Components|Admin Dashboard Components]]
- [[_COMMUNITY_Navigation Admin Actions|Navigation Admin Actions]]
- [[_COMMUNITY_Manager Docs & Concepts|Manager Docs & Concepts]]
- [[_COMMUNITY_Contact Links Actions|Contact Links Actions]]
- [[_COMMUNITY_Supabase CMS Adapter|Supabase CMS Adapter]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Site Settings Actions|Site Settings Actions]]
- [[_COMMUNITY_Skills Admin Actions|Skills Admin Actions]]
- [[_COMMUNITY_Capabilities Admin Actions|Capabilities Admin Actions]]
- [[_COMMUNITY_Access Request UI|Access Request UI]]
- [[_COMMUNITY_Process Steps Actions|Process Steps Actions]]
- [[_COMMUNITY_Alert & OTP UI|Alert & OTP UI]]
- [[_COMMUNITY_Contact Section|Contact Section]]
- [[_COMMUNITY_Portfolio Shell & Navigation|Portfolio Shell & Navigation]]
- [[_COMMUNITY_Static Portfolio Data|Static Portfolio Data]]
- [[_COMMUNITY_Admin Login & Pages|Admin Login & Pages]]
- [[_COMMUNITY_Experience Admin Forms|Experience Admin Forms]]
- [[_COMMUNITY_Access Request Actions|Access Request Actions]]
- [[_COMMUNITY_Experience Admin Actions|Experience Admin Actions]]
- [[_COMMUNITY_Alert Dialog UI|Alert Dialog UI]]
- [[_COMMUNITY_Public Page & CMS Adapter|Public Page & CMS Adapter]]
- [[_COMMUNITY_Resume Manager UI|Resume Manager UI]]
- [[_COMMUNITY_Command Palette UI|Command Palette UI]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Email Sending|Email Sending]]
- [[_COMMUNITY_Migration 011 Docs|Migration 011 Docs]]
- [[_COMMUNITY_Terminal Console UI|Terminal Console UI]]
- [[_COMMUNITY_Context Menu UI|Context Menu UI]]
- [[_COMMUNITY_Resume Admin Actions|Resume Admin Actions]]
- [[_COMMUNITY_Auth Session Routes|Auth Session Routes]]
- [[_COMMUNITY_Carousel UI|Carousel UI]]
- [[_COMMUNITY_Form UI|Form UI]]
- [[_COMMUNITY_Profile Editor Page|Profile Editor Page]]
- [[_COMMUNITY_Chart UI|Chart UI]]
- [[_COMMUNITY_Drawer UI|Drawer UI]]
- [[_COMMUNITY_Select UI|Select UI]]
- [[_COMMUNITY_Navigation Menu UI|Navigation Menu UI]]
- [[_COMMUNITY_Package Metadata|Package Metadata]]
- [[_COMMUNITY_Profile Save Actions|Profile Save Actions]]
- [[_COMMUNITY_Breadcrumb UI|Breadcrumb UI]]
- [[_COMMUNITY_Dev Dependencies|Dev Dependencies]]
- [[_COMMUNITY_Toggle UI|Toggle UI]]
- [[_COMMUNITY_Project Docs & Attributions|Project Docs & Attributions]]
- [[_COMMUNITY_Capabilities Section|Capabilities Section]]
- [[_COMMUNITY_Process Section|Process Section]]
- [[_COMMUNITY_Skills Section|Skills Section]]
- [[_COMMUNITY_Root Layout & Fonts|Root Layout & Fonts]]
- [[_COMMUNITY_Toast Notifications|Toast Notifications]]
- [[_COMMUNITY_Admin Layout|Admin Layout]]
- [[_COMMUNITY_Supabase CMS Docs|Supabase CMS Docs]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Writeup Visibility Concepts|Writeup Visibility Concepts]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 221 edges
2. `createAdminSupabaseClient()` - 70 edges
3. `getAdminSessionTokens()` - 67 edges
4. `requirePortfolioAccess()` - 36 edges
5. `requirePortfolioManager()` - 27 edges
6. `createServerSupabaseClient()` - 23 edges
7. `Portfolio` - 21 edges
8. `getPortfolioId()` - 20 edges
9. `PortfolioRole` - 20 edges
10. `compilerOptions` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Responsive Personal Portfolio Website` --references--> `shadcn/ui Component Library`  [INFERRED]
  README.md → ATTRIBUTIONS.md
- `Responsive Personal Portfolio Website` --references--> `Unsplash Photos`  [INFERRED]
  README.md → ATTRIBUTIONS.md
- `System Guidelines Template (Figma Make)` --conceptually_related_to--> `Responsive Personal Portfolio Website`  [INFERRED]
  guidelines/Guidelines.md → README.md
- `pnpm Workspace Configuration` --conceptually_related_to--> `Responsive Personal Portfolio Website`  [INFERRED]
  pnpm-workspace.yaml → README.md
- `Migration 011: Restricted Writeups Foundation` --implements--> `lab_writeups Table`  [EXTRACTED]
  supabase/APPLY_WRITEUPS_MIGRATION.md → WRITEUPS_MANAGER_COMPLETE.md

## Import Cycles
- 1-file cycle: `src/components/ui/input-otp.tsx -> src/components/ui/input-otp.tsx`
- 1-file cycle: `src/components/ui/sonner.tsx -> src/components/ui/sonner.tsx`

## Hyperedges (group relationships)
- **Portfolio-Scoped CMS Manager Pattern** — docs_capabilities_process_managers_summary_capabilities_manager, docs_capabilities_process_managers_summary_process_manager, docs_contact_manager_summary_contact_manager, docs_experience_manager_summary_experience_manager, docs_navigation_manager_summary_navigation_manager, docs_resume_manager_summary_resume_manager, docs_skills_manager_summary_skills_manager, docs_writeups_manager_writeups_manager [EXTRACTED 1.00]
- **Writeup Access Data Model** — docs_restricted_writeups_foundation_lab_writeups, docs_restricted_writeups_foundation_writeup_access_requests, docs_restricted_writeups_foundation_writeup_access_grants, docs_restricted_writeups_foundation_writeup_access_logs [EXTRACTED 1.00]
- **Restricted Writeup Access Lifecycle** — docs_restricted_writeups_foundation_restricted_writeup_access_system, docs_public_writeup_request_flow_summary_public_writeup_request_flow, docs_access_request_queue_access_request_queue, docs_writeup_email_notifications_writeup_email_notifications, docs_restricted_writeups_foundation_token_utilities [EXTRACTED 1.00]
- **Restricted Writeups Feature Lifecycle (Tasks 26-28)** — supabase_apply_writeups_migration_migration_011, supabase_migrations_migration_011_checklist_checklist, writeups_manager_complete_lab_writeups_table, writeups_manager_complete_writeups_manager, writeups_manager_complete_task_28_access_workflow [EXTRACTED 1.00]
- **Writeup Content Safety Model** — writeups_manager_complete_three_level_visibility, writeups_manager_complete_machine_status_safety, writeups_manager_complete_rls_policies, writeups_manager_complete_portfolio_scoping [INFERRED 0.85]
- **Multi-Portfolio Access Control System** — supabase_readme_portfolio_ownership, supabase_apply_writeups_migration_can_manage_portfolio, writeups_manager_complete_role_permissions, writeups_manager_complete_requireportfolioaccess, writeups_manager_complete_requireportfoliomanager [INFERRED 0.85]

## Communities (62 total, 4 thin omitted)

### Community 0 - "Core UI Primitives"
Cohesion: 0.05
Nodes (50): AccordionContent(), AccordionItem(), AccordionTrigger(), Avatar(), AvatarFallback(), AvatarImage(), Card(), CardAction() (+42 more)

### Community 1 - "Writeups Admin Actions"
Cohesion: 0.06
Nodes (48): archiveWriteupAction(), checkSlugUniqueness(), cleanString(), createWriteupAction(), ensureProjectBelongsToPortfolio(), ensureWriteupBelongsToPortfolio(), generateSlugFromTitle(), getMutationContext() (+40 more)

### Community 2 - "Projects Admin Actions"
Cohesion: 0.06
Nodes (47): archiveProjectAction(), cleanString(), createProjectAction(), ensureProjectBelongsToPortfolio(), ensureSlugIsAvailable(), getMutationContext(), getNextOrderIndex(), nullableText() (+39 more)

### Community 3 - "Theme Settings Actions"
Cohesion: 0.07
Nodes (45): cleanString(), defaultThemePayload(), getExistingSiteSettingsId(), getMutationContext(), resetThemeSettingsToDefault(), revalidateTheme(), saveThemeSettingsRow(), ThemeSettingsInput (+37 more)

### Community 4 - "Admin Dashboard & CMS Types"
Cohesion: 0.11
Nodes (47): AdminPortfolioPage(), AdminPortfolioPageProps, getDashboardSummary(), CmsLabWriteup, CmsPortfolio, CmsPortfolioMember, CmsResumeAsset, CmsWriteupAccessGrant (+39 more)

### Community 5 - "Form & Overlay UI"
Cohesion: 0.05
Nodes (42): Input(), Separator(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay() (+34 more)

### Community 6 - "Admin Dashboard Components"
Cohesion: 0.06
Nodes (38): AdminDashboard(), AdminDashboardProps, AdminDashboardSummary, canManage(), contentRows, AdminPlaceholderPanel(), AdminPlaceholderPanelProps, borderClasses (+30 more)

### Community 7 - "Navigation Admin Actions"
Cohesion: 0.08
Nodes (38): archiveNavigationItemAction(), cleanString(), createNavigationItemAction(), ensureNavigationItemBelongsToPortfolio(), getMutationContext(), getNextOrderIndex(), hideNavigationItemAction(), NavigationItemInput (+30 more)

### Community 8 - "Manager Docs & Concepts"
Cohesion: 0.07
Nodes (49): Access Request Queue, Raw Token One-Time Display, Archive/Restore Soft Delete, Capabilities Manager, Portfolio Scoping, Process Manager, requirePortfolioManager, Capabilities & Process Quick Reference (+41 more)

### Community 9 - "Contact Links Actions"
Cohesion: 0.08
Nodes (37): archiveContactLinkAction(), cleanString(), ContactLinkInput, createContactLinkAction(), ensureContactLinkBelongsToPortfolio(), getMutationContext(), getNextOrderIndex(), normalizeUrl() (+29 more)

### Community 10 - "Supabase CMS Adapter"
Cohesion: 0.09
Nodes (43): CmsCapability, CmsContactLink, CmsCredential, CmsExperience, CmsNavigationItem, CmsProcessStep, CmsSkill, getProfileCoreStack() (+35 more)

### Community 11 - "Package Dependencies"
Cohesion: 0.04
Nodes (45): dependencies, class-variance-authority, clsx, cmdk, embla-carousel-react, lucide-react, next, next-themes (+37 more)

### Community 12 - "Site Settings Actions"
Cohesion: 0.09
Nodes (37): BrandSettingsInput, cleanString(), getExistingSiteSettingsId(), getMutationContext(), nullableText(), revalidateSettings(), saveSiteSettingsRow(), SiteSettingsInput (+29 more)

### Community 13 - "Skills Admin Actions"
Cohesion: 0.09
Nodes (33): archiveSkillAction(), cleanString(), createSkillAction(), ensureSkillBelongsToPortfolio(), getMutationContext(), getNextOrderIndex(), nullableText(), reorderSkillsAction() (+25 more)

### Community 14 - "Capabilities Admin Actions"
Cohesion: 0.10
Nodes (32): archiveCapabilityAction(), CapabilityInput, cleanString(), createCapabilityAction(), ensureCapabilityBelongsToPortfolio(), getMutationContext(), getNextOrderIndex(), nullableText() (+24 more)

### Community 15 - "Access Request UI"
Cohesion: 0.08
Nodes (32): ApproveEmailResult, RejectEmailResult, RevokeEmailResult, AccessRequestActions(), AccessRequestActionsProps, AccessRequestDetailPanel(), AccessRequestDetailPanelProps, ActiveForm (+24 more)

### Community 16 - "Process Steps Actions"
Cohesion: 0.10
Nodes (31): archiveProcessStepAction(), cleanString(), createProcessStepAction(), ensureProcessStepBelongsToPortfolio(), getMutationContext(), getNextOrderIndex(), nullableText(), ProcessStepInput (+23 more)

### Community 17 - "Alert & OTP UI"
Cohesion: 0.06
Nodes (19): input-otp, Alert(), AlertDescription(), AlertTitle(), alertVariants, Badge(), badgeVariants, Checkbox() (+11 more)

### Community 18 - "Contact Section"
Cohesion: 0.06
Nodes (33): ContactSection(), ContactSectionProps, linkClasses, linkTextClasses, contactData, Capability, ConsoleData, ContactData (+25 more)

### Community 19 - "Portfolio Shell & Navigation"
Cohesion: 0.08
Nodes (26): MobileNavigation(), MobileNavigationProps, navigationIcons, getFontFamily(), PortfolioShell(), PortfolioShellProps, navigationIcons, Sidebar() (+18 more)

### Community 20 - "Static Portfolio Data"
Cohesion: 0.13
Nodes (27): commandSuggestions, consoleCommands, experienceData, aboutData, profileData, projectsData, getLocalAboutData(), getLocalCapabilitiesData() (+19 more)

### Community 21 - "Admin Login & Pages"
Cohesion: 0.11
Nodes (19): AdminLoginPage(), AdminLoginPageProps, AdminPage(), SelectPortfolioPage(), AdminLoginForm(), AdminLoginFormProps, PortfolioSelector(), PortfolioSelectorProps (+11 more)

### Community 22 - "Experience Admin Forms"
Cohesion: 0.11
Nodes (17): ExperienceAchievementsFields(), ExperienceAchievementsFieldsProps, ExperienceForm(), ExperienceFormProps, ExperienceList(), ExperienceListProps, canSave(), ExperienceManager() (+9 more)

### Community 23 - "Access Request Actions"
Cohesion: 0.17
Nodes (25): ActionResult, approveAccessRequest(), cancelAccessRequest(), EmailStatus, rejectAccessRequest(), revokeAccessGrant(), AccessRequestsPage(), AccessRequestsPageProps (+17 more)

### Community 24 - "Experience Admin Actions"
Cohesion: 0.18
Nodes (23): archiveExperienceEntryAction(), cleanString(), createExperienceEntryAction(), ensureExperienceBelongsToPortfolio(), ExperienceInput, getMutationContext(), getNextOrderIndex(), nullableText() (+15 more)

### Community 25 - "Alert Dialog UI"
Cohesion: 0.11
Nodes (17): AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay(), AlertDialogTitle() (+9 more)

### Community 26 - "Public Page & CMS Adapter"
Cohesion: 0.15
Nodes (20): Page(), getCapabilitiesData(), getContactData(), getCredentialsData(), getExperienceData(), getNavigationData(), getPortfolioData(), getProcessData() (+12 more)

### Community 27 - "Resume Manager UI"
Cohesion: 0.15
Nodes (14): ResumeList(), ResumeListProps, canSave(), ResumeManager(), ResumeManagerProps, formatDate(), ResumePreviewCard(), ResumePreviewCardProps (+6 more)

### Community 28 - "Command Palette UI"
Cohesion: 0.12
Nodes (14): Command(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator(), CommandShortcut(), Dialog() (+6 more)

### Community 29 - "TypeScript Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 30 - "Email Sending"
Cohesion: 0.21
Nodes (17): sendEmail(), SendEmailOptions, SendEmailResult, ApprovalEmailOptions, EmailConfig, getEmailConfig(), sendApprovalEmail(), sendGrantRevokedEmail() (+9 more)

### Community 31 - "Migration 011 Docs"
Cohesion: 0.15
Nodes (18): can_manage_portfolio() / can_view_portfolio_admin() Helpers, Migration 011: Restricted Writeups Foundation, set_updated_at() Trigger Function, Private 'writeups' Storage Bucket, Writeup Access Token Utilities, Migration 011 Pre-Flight Checklist, Writeup Access Tables (requests/grants/logs), Migration 003: Multi Portfolio Access (+10 more)

### Community 32 - "Terminal Console UI"
Cohesion: 0.14
Nodes (12): CommandConsole(), CommandConsoleProps, CommandLine(), CommandLineProps, MainPanel(), MainPanelProps, StatusBar(), StatusBarProps (+4 more)

### Community 33 - "Context Menu UI"
Cohesion: 0.12
Nodes (9): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+1 more)

### Community 34 - "Resume Admin Actions"
Cohesion: 0.27
Nodes (13): archiveResumeAction(), ensureResumeBelongsToPortfolio(), getMutationContext(), revalidateResumes(), sanitizeFileName(), setActiveResumeAction(), uploadResumeAction(), CmsResumeAsset (+5 more)

### Community 35 - "Auth Session Routes"
Cohesion: 0.25
Nodes (10): GET(), AdminSessionRequestBody, DELETE(), POST(), getAuthenticatedUser(), getUserPortfoliosForAccessToken(), adminCookieOptions, clearAdminSessionCookies() (+2 more)

### Community 36 - "Carousel UI"
Cohesion: 0.19
Nodes (13): Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext(), CarouselOptions (+5 more)

### Community 37 - "Form UI"
Cohesion: 0.20
Nodes (11): FormControl(), FormDescription(), FormFieldContext, FormFieldContextValue, FormItem(), FormItemContext, FormItemContextValue, FormLabel() (+3 more)

### Community 38 - "Profile Editor Page"
Cohesion: 0.27
Nodes (11): coreStackToStrings(), createDefaultProfile(), getEditableProfile(), isObject(), JsonObject, normalizeProfile(), ProfileEditorPage(), ProfileEditorPageProps (+3 more)

### Community 39 - "Chart UI"
Cohesion: 0.22
Nodes (8): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), THEMES, useChart()

### Community 40 - "Drawer UI"
Cohesion: 0.18
Nodes (6): DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay(), DrawerTitle()

### Community 41 - "Select UI"
Cohesion: 0.18
Nodes (7): SelectContent(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), SelectTrigger()

### Community 42 - "Navigation Menu UI"
Cohesion: 0.22
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuTrigger(), navigationMenuTriggerStyle (+1 more)

### Community 43 - "Package Metadata"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, start, type, version

### Community 44 - "Profile Save Actions"
Cohesion: 0.42
Nodes (8): getProfileInput(), normalizeTerminalLines(), parseStringArray(), ProfileInput, readString(), saveProfileAction(), validateMax(), requirePortfolioManager()

### Community 45 - "Breadcrumb UI"
Cohesion: 0.25
Nodes (6): BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 46 - "Dev Dependencies"
Cohesion: 0.29
Nodes (7): devDependencies, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, typescript

### Community 47 - "Toggle UI"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 48 - "Project Docs & Attributions"
Cohesion: 0.33
Nodes (6): shadcn/ui Component Library, Unsplash Photos, System Guidelines Template (Figma Make), pnpm Workspace Configuration, Figma Design Source, Responsive Personal Portfolio Website

### Community 49 - "Capabilities Section"
Cohesion: 0.33
Nodes (4): CapabilitiesSection(), CapabilitiesSectionProps, capabilitiesData, CapabilitiesData

### Community 50 - "Process Section"
Cohesion: 0.33
Nodes (4): ProcessSection(), ProcessSectionProps, processData, ProcessData

### Community 51 - "Skills Section"
Cohesion: 0.33
Nodes (4): SkillsSection(), SkillsSectionProps, skillsData, SkillsData

### Community 52 - "Root Layout & Fonts"
Cohesion: 0.40
Nodes (3): jetBrainsMono, metadata, spaceGrotesk

### Community 56 - "Supabase CMS Docs"
Cohesion: 0.67
Nodes (3): Supabase CMS Foundation, CONTENT_SOURCE Data Adapter Switch, validateCmsQueries() Helper

## Knowledge Gaps
- **320 isolated node(s):** `name`, `private`, `version`, `type`, `build` (+315 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createAdminSupabaseClient()` connect `Access Request Actions` to `Writeups Admin Actions`, `Projects Admin Actions`, `Auth Session Routes`, `Resume Admin Actions`, `Theme Settings Actions`, `Profile Editor Page`, `Navigation Admin Actions`, `Contact Links Actions`, `Profile Save Actions`, `Site Settings Actions`, `Capabilities Admin Actions`, `Skills Admin Actions`, `Process Steps Actions`, `Admin Login & Pages`, `Experience Admin Actions`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `getAdminSessionTokens()` connect `Access Request Actions` to `Writeups Admin Actions`, `Projects Admin Actions`, `Auth Session Routes`, `Resume Admin Actions`, `Theme Settings Actions`, `Profile Editor Page`, `Navigation Admin Actions`, `Contact Links Actions`, `Profile Save Actions`, `Site Settings Actions`, `Capabilities Admin Actions`, `Skills Admin Actions`, `Process Steps Actions`, `Admin Login & Pages`, `Experience Admin Actions`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `Portfolio` connect `Admin Dashboard Components` to `Writeups Admin Actions`, `Projects Admin Actions`, `Theme Settings Actions`, `Admin Dashboard & CMS Types`, `Navigation Admin Actions`, `Contact Links Actions`, `Supabase CMS Adapter`, `Site Settings Actions`, `Skills Admin Actions`, `Capabilities Admin Actions`, `Access Request UI`, `Process Steps Actions`, `Contact Section`, `Static Portfolio Data`, `Admin Login & Pages`, `Experience Admin Forms`, `Resume Manager UI`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _326 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core UI Primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.04788732394366197 - nodes in this community are weakly interconnected._
- **Should `Writeups Admin Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.062004662004662 - nodes in this community are weakly interconnected._
- **Should `Projects Admin Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.06299603174603174 - nodes in this community are weakly interconnected._