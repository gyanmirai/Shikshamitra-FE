# Role-Based Dashboard PRD

Last verified against repo: 2026-06-19.

Sources: `src/screens/mainDashboard/**`, `src/layouts/config-nav-dashboard.tsx`, `src/redux/auth/authSlice.ts`, `src/enums/roles.ts`, `../Shikshamitra-BE/src/ShikshaMitra.Domain/Seeders/RolesSeederContributor.cs`, `../Shikshamitra-BE/src/ShikshaMitra.Domain/Seeders/RolePermissionSeederContributor.cs`, `../Shikshamitra-BE/docs/common/platform/UserScope-Usage.md`.

External anchors: [UDISE+](https://udiseplus.gov.in/), [APAAR](https://apaar.education.gov.in/), [NDEAR](https://www.ndear.gov.in/), [CBSE affiliation bye-laws](https://www.cbse.gov.in/cbsenew/aff-bye-laws.html), [CBSE public disclosure circular](https://www.cbse.gov.in/cbsenew/documents/Circular_Merged_01_08012025.pdf).

## Product Goal

Make `/dashboard` the daily operating cockpit for Indian schools. A user should open the dashboard and quickly understand school health, pending work, time-sensitive risks, today's schedule, and where to act next.

The dashboard is not a collection of static cards. It is a role-template based command center that combines KPIs, approvals, exceptions, charts, calendar items, announcements, and module drilldowns.

## Product Principles

| Principle | Requirement |
| --- | --- |
| Role-template based | Custom school roles map to generic dashboard templates instead of one hard-coded screen per role name. |
| Balanced by default | Each template balances KPIs, actions, trend charts, calendar, announcements, and risk signals. |
| Actionable | Every meaningful count, alert, or list item must have a drilldown route or owner. |
| Permission safe | Widgets are visible only when the user has the relevant module/submodule permission. |
| Scope safe | Counts and lists must respect UserScope so users see only their accessible academic data. |
| India-ready | Dashboard readiness should include UDISE+, APAAR/student identity, CBSE disclosure/compliance, safety, transport, fee, and staff operations signals where supported by modules. |

## Dashboard Templates

Actual roles are user-created and managed in Security. The product should support mapping each role to one of these v1 dashboard templates.

| Template | Typical mapped roles | Primary job |
| --- | --- | --- |
| Leadership | Director, owner, board member, super admin | See whole-school health, growth, finance, compliance, and major risks. |
| Principal/Admin | Principal, vice principal, administrative manager, IT/admin staff | Run today's school operations across academics, attendance, admissions, communication, safety, and compliance. |
| Teacher | Teacher, HOD, academic coordinator, class teacher | Manage classes, attendance, homework, exams, student risks, and school communication. |
| Finance/HR | Finance officer, HR manager, payroll operator, attendance operator | Track fee collections, dues, concessions, payroll readiness, staff attendance, leave, and HR actions. |
| Student/Parent | Student, parent, guardian | See personal academic, attendance, fee, transport, announcements, calendar, and action items. |

### Fallback Behavior

If a role has no explicit template mapping yet, the system may use known seeded role names as temporary fallbacks. This fallback is only a compatibility bridge; production behavior should resolve from Security-managed template mapping.

The existing `/dashboard` role-view dropdown should be treated as demo or development behavior. Production users should not manually switch into dashboards they are not authorized to view.

## Functional Requirements

| Dashboard zone | Requirement | Example signals |
| --- | --- | --- |
| School pulse KPIs | Show current health metrics relevant to the template. | Total students, staff, attendance, fee collection, pending admissions, active routes. |
| Action queue and approvals | Show prioritized work requiring user action. | Admission approvals, leave approvals, fee reconciliation, payroll review, transport applications, gate pass review. |
| Academic and attendance snapshot | Show learning and attendance health. | Student attendance, teacher attendance, syllabus coverage, pending evaluation, homework completion, weak classes/students. |
| Finance, fee, and payroll snapshot | Show money and payroll health where permitted. | Today's collection, dues aging, concessions, refunds, payroll blockers, payslip readiness. |
| Admissions and retention | Show enrollment pipeline and retention risks. | Inquiries, applications, document gaps, conversion rate, TC requests, long absence. |
| Transport, security, and safety exceptions | Surface operational incidents and urgent exceptions. | Delayed buses, route overload, visitor alerts, gate pass pending, safety certificate expiry, incident reports. |
| Compliance readiness | Track India-specific readiness without duplicating official systems. | UDISE+ data completeness, APAAR/PEN readiness, CBSE disclosure documents, staff qualification records, fire/building/transport certificates. |
| Calendar and announcements | Show time-bound events and communications. | Exams, holidays, PTM, meetings, circulars, unread announcements, birthdays/anniversaries where relevant. |
| Recent activity | Show meaningful changes and operational trail. | New admissions, payment received, leave approved, marks uploaded, route changed, document uploaded. |
| Drilldowns | Route users into existing module dashboards or operational screens. | Student, Academic, HR, Finance, Communication, Calendar, Library, Transport, Hostel, Security. |

## Template Requirements

| Template | Must include | Should include when permitted |
| --- | --- | --- |
| Leadership | School pulse, finance health, enrollment trend, compliance readiness, high-risk alerts, module health. | Comparative trends by branch/campus, board/medium/stage filters, cashflow forecast, staff utilization. |
| Principal/Admin | Attendance, academic progress, action queue, admissions, transport/security exceptions, calendar, announcements. | Teacher workload, parent communication SLA, safety checklist, compliance gaps. |
| Teacher | Today's schedule, class attendance, pending homework/evaluation, student risk list, announcements, calendar. | Payroll/leave self-service, class performance trends, parent follow-up tasks. |
| Finance/HR | Fee collection, dues, concessions, refunds, payroll readiness, staff attendance, leave approvals, HR alerts. | Expense approvals, payroll locks, salary structure gaps, employee document expiry. |
| Student/Parent | Attendance, timetable, assignments/exams, fee status, announcements, calendar, transport status. | Library dues, hostel status, certificates, parent action items, PTM follow-ups. |

## Security and Data Rules

| Rule | Requirement |
| --- | --- |
| Template assignment | Security module should eventually own role-to-dashboard-template mapping. |
| Permission gating | A widget appears only if the user has permission for the underlying module or action. |
| UserScope filtering | Dashboard data must use the same academic hierarchy scope rules as module lists and reports. |
| Sensitive data | Student, finance, payroll, HR, and safety data must not appear through aggregate widgets if the same user cannot access the corresponding drilldown data. |
| Multiple roles | If a user has multiple mapped templates, resolve by explicit user preference if configured; otherwise use the highest-priority template available in this order: Leadership, Principal/Admin, Finance/HR, Teacher, Student/Parent. |
| Empty states | If a widget is permission-filtered or has no data, show a controlled empty state instead of misleading zeroes where zero could imply confirmed operational status. |

## High-Level Data Contract

The PRD does not lock endpoint paths or exact DTO names. A later technical spec should convert this into API contracts.

Future dashboard data should support:

| Field | Purpose |
| --- | --- |
| `dashboardTemplate` | Resolved template for the current user/session. |
| `academicYearId` | Active or selected academic year context. |
| `dateRange` | Current date, week, month, term, or custom range used by widgets. |
| `kpiCards` | Template-specific KPI cards with values, trend metadata, status, and drilldown route. |
| `actionItems` | Pending approvals, tasks, exceptions, and ownership metadata. |
| `riskAlerts` | Time-sensitive risks with severity, owner, source module, and action route. |
| `calendarItems` | Events, holidays, exams, meetings, PTM, and reminders. |
| `moduleSnapshots` | Module-level summaries for Student, Academic, HR, Finance, Transport, Security, and other enabled modules. |
| `announcements` | Recent and unread communications relevant to the user. |
| `drilldownUrl` | Safe route for each card/list item, respecting permissions and scope. |

## India-Specific Readiness

| Area | Dashboard intent |
| --- | --- |
| UDISE+ | Indicate completeness of school profile, enrollment, teacher, infrastructure, facilities, and report-ready fields once those source modules exist. |
| APAAR/student identity | Track student identity/document readiness, APAAR/PEN availability, and missing data needed for government-aligned academic records. |
| NDEAR alignment | Keep dashboard data modular and interoperable; do not couple widget logic directly to one screen's local mock shape. |
| CBSE disclosure | Track documents and public disclosure readiness such as affiliation, school information, teacher qualifications, infrastructure, calendar, and mandatory certificates. |
| Safety and operations | Surface certificate expiry, transport exceptions, visitor/gate pass issues, emergency drill status, and incident follow-up where modules support it. |

## Current State

This PRD was the starting product document for replacing the placeholder dashboard. The current implementation now uses the shared dashboard shell under `src/screens/mainDashboard/**`, `GET /api/dashboard/summary`, and `GET /api/dashboard/widgets` for the unified dashboard contract.

The application already has many module dashboards and permission-aware navigation. The role-based dashboard should continue to reuse these as drilldown destinations instead of duplicating full module workflows.

## Scope Markers

| Surface | Status | Notes |
| --- | --- | --- |
| `/dashboard` main hub | Core implemented | Template-driven and permission/scope-safe, with live slices only where scoped sources exist. |
| Module dashboards | Existing downstream surfaces | Remain valid drilldown destinations and data-source candidates. |
| Backend integration | Implemented for dashboard summary and widget metadata | Current public dashboard APIs are `/api/dashboard/summary` and `/api/dashboard/widgets`; future work should add module-owned scoped sources without changing this contract unnecessarily. |
| Security template mapping | Future requirement | PRD expects Security to map custom roles to templates. |
| Demo role switcher | Dev/test behavior | Keep only for demo/dev flows or explicit feature flags; not production authorization behavior. |

## Acceptance Criteria

| Requirement | Acceptance |
| --- | --- |
| Template clarity | PRD and implementation clearly define which dashboard zones each template receives. |
| Custom role support | New school roles can be mapped to a template without adding new dashboard code for each role. |
| Permission safety | Users do not see widgets for modules or actions they cannot access. |
| Scope safety | Dashboard counts and lists match the user's accessible academic scope. |
| India-specific readiness | Compliance and identity readiness are represented as dashboard requirements without pretending official integrations already exist. |
| Actionability | Every card, alert, and list item has a route, owner, or clear next step. |
| Placeholder migration | Existing mock dashboard data can be replaced progressively by module-backed data without redesigning the screen each time. |
| Documentation boundary | Product requirements stay in this PRD; exact endpoints, DTOs, caching, and refresh policies move to a later technical spec. |
