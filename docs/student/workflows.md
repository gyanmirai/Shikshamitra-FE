---
module: student
domain: workflows
content_type: How-to
status: canonical
updated_on: 2026-07-25
owner: frontend-team
audience: humans-and-agents
---

# Trace Student frontend workflows

TL;DR: trace Student workflows from the visible menu route to the App Router page, screen folder, client, and backend contract.
Backend workflow rules are canonical in [Student backend workflows](../../../Shikshamitra-BE/docs/modules/student/workflows.md).

## Core workflows

Use this map to find the first screen and client.

| Workflow                     | Screen entry                                                                     | Main client                                                    |
| ---------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Dashboard                    | `/student/dashboard`                                                             | `src/redux/student/index.ts`                                   |
| Admission cycles             | `/student/enrollment`                                                            | `src/redux/student/admissions-crm/admissions-crm-api.ts`       |
| My admissions work           | `/student/enrollment/overview`                                                   | `src/redux/student/admissions-crm/admissions-crm-api.ts`       |
| Admissions pipeline          | `/student/enrollment/pipeline`                                                   | `src/redux/student/admissions-crm/admissions-crm-api.ts`       |
| Applicant workspace          | `/student/enrollment/applicants/{leadId}`                                        | `src/redux/student/admissions-crm/admissions-crm-api.ts`       |
| Entrance exams               | `/student/enrollment/exams`                                                      | `src/redux/student/admissions-crm/admissions-crm-api.ts`       |
| Registration                 | `/student/enrollment/registrations`                                              | `src/redux/student/admissions-crm/admissions-crm-api.ts`       |
| Offers and class placement   | `/student/enrollment/offers-seats`                                               | `src/redux/student/admissions-crm/admissions-crm-api.ts`       |
| Activation                   | `/student/enrollment/activation`                                                 | `src/redux/student/admissions-crm/admissions-crm-api.ts`       |
| Enrollment operations        | `/student/enrollment/operations`                                                 | `src/redux/student/admissions-crm/admissions-crm-api.ts`       |
| Enrollment analytics         | `/student/enrollment/analytics`                                                  | `src/redux/student/admissions-crm/admissions-crm-api.ts`       |
| Admissions CRM settings      | Dedicated Student Enrollment settings routes                                     | Cycle readiness, inquiry channel defaults, applicant checklist, dynamic form templates, scoring, target-standard, branch, and language routing strategy, owner pool, condition-aware journey rules, merit rules, message template preview, and provider settings use CRM contracts |
| Admissions CRM school defaults | Journey settings route                                                         | School default admission-cycle settings can be applied into the selected cycle form or saved from the current form |
| Public admissions inquiry    | `/student/admissions/inquiry/{tenantId}/{templateId}`                            | Direct public fetch with dynamic template fields               |
| Public admissions status     | `/student/admissions/status/{tenantId}/{token}`                                  | Direct public fetch with OTP resend, delivery status, cycle-configured applicant checklist progress, recent activity, exam, and eligibility status |
| Student management           | `/student/management`                                                            | `src/redux/student/index.ts` and records-specific clients      |
| Student list and profile     | `/student/profile`                                                               | `src/redux/student/index.ts`                                   |
| Certificates                 | `/student/certificates`                                                          | `src/redux/student/certificate/certificate.ts`                 |
| Student attendance           | `/student/attendance/take-attendance`                                            | `src/redux/student/take-attendance/take-attendace-api.ts`      |
| Student leave                | `/student/attendance/leave-absent`                                               | `src/redux/student/student-leave/student-leave-api.ts`         |
| Reports                      | `/student/reports`, `/student/attendance/reports`                                | Report clients under `src/redux/student/**`                    |
| Settings                     | `/student/enrollment/settings` plus records and attendance settings              | CRM and Student setting clients under `src/redux/student/**`   |
| Notification                 | `/student/attendance/notification`                                               | Student notification screens under `src/screens/student/**`    |

## Integration rules

Frontend workflows must respect backend data ownership.

| Integration                    | Rule                                                                                            |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Inquiry Source label           | Product copy and CRM contracts use Inquiry Source                                                   |
| Quick inquiry identity         | Quick inquiry captures the applicant as required first name plus optional middle and last names, validates email on both client and server, and carries the same structured identity into registration |
| Quick inquiry configuration    | Quick inquiry shows only enabled inquiry channels and published effective admission pathways from the selected cycle, while campaign, intent, and notes remain optional details |
| Quick inquiry academic scope   | Academic stage and target class are resolved inside the selected academic year, board, and medium hierarchy, and the backend rejects mismatched placement |
| Direct registration            | Authorized direct registration uses the enabled Manual entry channel, a published effective admission pathway, validated contact details, and the same academic stage and target-class mapping as Quick Inquiry |
| Applicant journey              | The full-page applicant workspace presents Inquiry, Entrance, Registration, Offer and Seat, and Activation as stage-aware steps, and skips Entrance when the cycle does not require an exam |
| Admission cycle entry point     | The Admission Cycles list is the Student Enrollment entry point for configuration managers and opens the existing setup URLs for the selected academic year |
| Class Placement Plan            | User-facing setup copy uses Class Placement Plan for enrollment-owned placement planning while current internal APIs still use the existing seat-pool contract |
| Applicant terminal stages      | Rejected, stale, and archived inquiries cannot start later journey work, while staff can still review artifacts that already exist |
| Applicant pathway governance   | Governance shows only fields required by the selected pathway and captures one verified reference per configured evidence code; an inquiry can complete its first audited assignment against the exact pathway version captured at intake even if that version is later retired |
| Applicant activity             | Applicant activity and audit evidence use a separate permission-safe section with retry and incremental older-event loading |
| Applicant My Work context      | Opening an applicant from My Admissions Work carries the selected instruction, due state, priority, assignee, and recommended action into the full-page workspace |
| Inquiry CRM to entrance exam   | CRM leads can schedule into entrance exam slots before a `Student` record exists                |
| Inquiry CRM registration form  | Staff can issue a CRM-native registration form from an inquiry lead before exam scheduling when the cycle requires it |
| Admissions CRM registration    | Applicant operations issue the applicable versioned registration template, manage correction and link lifecycle actions, record fee references, and verify submissions |
| Admissions CRM registration languages | Registration-template settings capture Gujarati and Hindi section titles, descriptions, field labels, help text, and option labels, while the public registration route resolves the selected language with English fallback |
| Admissions CRM registration preview | Registration-template settings preview online or print rendering at desktop or mobile width in English, Gujarati, or Hindi before publication |
| Admissions CRM documents       | Applicant operations assign the applicable checklist, show configured family upload instructions, use configured rejection-reason shortcuts, review or waive requirements, confirm originals, and enforce one-person or two-person readiness approval |
| Admissions CRM document expiry | Each validity-aware requirement may define a reminder window; the backend `DocumentExpiring` journey trigger creates the configured deduplicated task or approved parent message when a current document enters that window |
| Admissions CRM fee policy      | Admission Criteria offers supported quick starts, a live INR parent quotation preview, friendly Finance-owned payment gates, and collapsed campus, class, board, medium, route, date, and grace-period filters |
| Admissions CRM operations      | Pipeline and exception-queue rows open the dedicated applicant page on the relevant section and preserve the exact table state for Back |
| Inquiry CRM eligibility handoff | Exam view handoff uses CRM eligibility context and missing-admission-field review before the admission team creates student records |
| Inquiry CRM exam management    | Exam view actions let permitted staff mark attendance, enter first-time marks inline, give distinct marks in bulk, import CSV, XLS, XLSX, or OMR-scanner spreadsheet exports, correct existing results with a reason, decide eligibility, and review handoff |
| Inquiry CRM filters            | Board and list views support search, stage, channel, campaign, owner, desired-class, score-band, and manual-priority filtering |
| Inquiry CRM board              | Board columns use configured pipeline stage labels, ordering, and stage colors |
| Inquiry CRM stage movement     | Staff can move active inquiry leads only through configured allowed next stages with reason while exam and eligibility stages remain exam-governed |
| Inquiry CRM pipeline settings  | Settings can configure each fixed stage label, order, enabled state, color, SLA hours, owner responsibility, and enforced allowed next stages |
| Inquiry CRM SLA automation     | SLA reminders use the current stage SLA target when configured, with cycle default as fallback |
| Inquiry CRM bulk operations    | List view selection supports bulk owner assignment, follow-up task creation, operational stage movement, archive actions, and template messaging |
| Inquiry CRM timeline           | Staff can review lead, task, archive, and exam events from the applicant page Activity section |
| Inquiry CRM notes              | Staff can add lead notes or call notes from board and list leads, and those notes appear in the CRM timeline |
| Inquiry CRM owner, priority, checklist, and tasks | Staff can assign or clear a lead owner, set manual lead priority, update applicant checklist progress, and create, review, or complete follow-up tasks from board or list leads |
| Inquiry CRM workload           | Staff workload comes from the CRM analytics summary and groups leads, tasks, stale pressure, and exams by owner |
| Inquiry CRM exam outcomes      | Exam outcome cards and class breakdowns come from CRM analytics rather than recalculating the funnel locally |
| Inquiry CRM campaigns          | Campaign filtering and campaign performance come from CRM lead list parameters and analytics summary output |
| Inquiry CRM daily trends       | Date-range controls update CRM analytics and show daily lead, exam, eligibility, stale, archive, and SLA trend rows |
| Inquiry CRM conversion KPIs    | Workspace summary cards show lead-level exam scheduling, stage-configured first-response SLA, duplicate warning, stale or archived, and eligibility handoff conversion rates |
| Inquiry CRM automation runs     | Automation run count, failed run count, recent run details, failure count, and recent failure details come from CRM analytics and are shown in the inquiry workspace |
| Inquiry CRM message action     | Workspace message actions render approved templates and record queued, sent, failed, provider-not-configured, or opt-out blocked delivery logs |
| Inquiry CRM opt-out controls   | Workspace send-message flow can record parent opt-out or clear opt-out with reason for the selected channel and recipient |
| Inquiry CRM opt-out register   | Workspace opt-out register shows active and cleared opt-outs with channel, contact, and status filters |
| Inquiry CRM delivery logs      | Workspace communication logs show recent delivery evidence, provider message IDs, provider ID search, channel and status filters, plus retry actions for failed or blocked logs |
| Inquiry CRM journey automation | Settings journey rules can filter by channel, Inquiry Source, campaign, current stage, owner, target standard, desired class, branch, language, priority, score, idle days, and lead age before creating deduplicated tasks, message delivery logs, or failure timeline evidence from CRM events, document expiry windows, and manual runner invocations |
| Public admissions links        | Public inquiry and status routes live outside authenticated Student navigation                   |
| Public duplicate privacy       | Public inquiry submission never displays private duplicate match details to the applicant, including contact, parent-profile, or DOB-profile matches |
| Public campaign tracking       | Public inquiry links can pass `campaignName`, `campaign`, `utm_campaign`, or `utmCampaign` into CRM campaign analytics without showing the field to applicants |
| Public status checklist        | OTP-verified status links show inquiry progress, registration, document requirements, readiness approval state, cycle-configured applicant checklist items, sanitized recent activity, exam schedule, exam result, and eligibility details from the backend |
| Public status OTP              | Status links display backend OTP delivery results, resend controls, and applicant-safe cooldown, invalid, expired, or locked challenge states |
| Duplicate inquiry review       | Staff quick-entry previews contact, email, parent, DOB, and desired-class duplicate signals with confidence and matched-field chips before save, must collect a continue reason when creating after a duplicate warning, and warning leads can be merged from the CRM workspace |
| CRM message templates          | Admissions CRM settings configure WhatsApp, SMS, and email templates before provider dispatch   |
| CRM inquiry channels           | Admissions CRM settings enable intake channels and set default Inquiry Source from the academic-year source selector, owner, form template, acknowledgement template, and display order per admission cycle |
| CRM channel acknowledgements   | Backend lead capture uses the configured channel acknowledgement template to create delivery-log evidence for staff and public inquiries |
| CRM form templates             | Admissions CRM settings create, edit, activate, and deactivate dynamic inquiry form fields with CRM mappings including applicant DOB, sections, helper text, placeholders, default values, conditional visibility, select options, required state, preview order, and channel-specific publishing state |
| CRM form template duplication  | Duplicate creates an inactive deep copy with a unique Copy name so staff can review fields and localizations before activation |
| CRM parent form preview        | Language Preview renders branding, validation hints, required state, conditional fields, and English, Gujarati, or Hindi fallback behavior at desktop or mobile width |
| CRM public form links          | Admissions CRM settings copy active public inquiry form links, campaign-specific links, and staff-shared owner links using the current tenant context, template ID, campaign name, and configured staff owner |
| CRM public form QR             | Download QR generates a PNG for an active public inquiry form only when tenant context is available |
| CRM routing selectors          | Admissions CRM settings use staff and Inquiry Source selectors for channel defaults, routing defaults, owner pools, and routing rules while preserving unknown historical IDs |
| CRM lead branch and language   | Quick inquiry can capture campus branch and preferred communication language for routing and template variables |
| CRM template preview           | Admissions CRM settings can preview and copy rendered draft or approved message templates without sending provider messages |
| CRM communication providers    | Communications settings configure adapter mode, webhook URL, payload mode, sender identity, headers, parameters, dispatch response message-ID mapping, callback secret, copyable callback URL, and callback field mappings through structured controls for each message channel |
| CRM delivery callbacks         | Provider callbacks use public tenant-scoped routes with a provider callback secret and optional payload mappings to reconcile queued, sent, delivered, or failed delivery logs by delivery log ID or provider message ID |
| CRM action permissions         | Offer, waitlist, decision, registration, document, government-readiness, financial, activation, identifier, and service-handoff actions are hidden or disabled from the exact backend permission grant rather than from route access alone |
| CRM configuration references  | Configuration Safety lets authorized staff inspect Stage, Round, Exam, Seat Plan, or Route references by code before changing shared configuration |
| CRM configuration impact      | Configuration Safety previews affected applicants, changed cycle fields, reference families, warnings, and a server fingerprint before a critical configuration change |
| CRM academic-year clone       | Configuration Safety previews source, target, conflicts, warnings, and per-family clone behavior, then requires explicit confirmation with the returned fingerprint |
| Enrollment to records          | Admission and registration changes must keep academic scope and identity data consistent        |
| Records to Finance and reports | Student scope, roll number, GR number, and division changes affect downstream reports           |
| Attendance to reporting        | Attendance saves must refresh day, dashboard, leave, and report assumptions                     |
| Documents and photos           | Upload flows must preserve backend access and audit rules                                       |

## Partial workflow rule

Do not add a route to docs as active navigation until `src/constants/student-menu.ts` exposes it.
If a page exists but menu access is commented or unclear, mark the workflow as partial.
