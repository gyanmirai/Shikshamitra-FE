# Dashboard Phase G-K Execution Roadmap

## Purpose

This roadmap converts the remaining dashboard work into controlled phases after Phase F. The goal is to keep `/dashboard` moving toward a world-class ERP command center while protecting existing module behavior.

Phase G through Phase K must continue using the existing dashboard summary contract and the existing widget registry. New work should enrich known widgets through safe, scoped data sources. Do not introduce separate role pages, broad navigation changes, or duplicated module workflows.

## Execution Status

Implemented through 2026-06-20:

- Phase G live Finance/HR enrichment is backend-backed from scoped fee receipt, due, concession, payroll, and HR attendance sources.
- Phase H live enrichment is limited to the next visible Calendar event/holiday through `CalendarViewReadService`; announcements remain readiness/drilldown-only because no scoped announcement summary feed exists.
- Phase I adds permission-gated Transport and Security readiness/drilldown widgets; no exception counts are invented.
- Phase J enriches Leadership compliance with local, scoped APAAR, PEN, and UDISE readiness when student compliance permission is granted.
- Phase K keeps Teacher and Student/Parent personalization readiness-only where identity/class mapping is not proven, and explicitly avoids school-wide data as personal Student/Parent data.

## Non-Negotiable Rules

- Keep `GET /api/dashboard/summary` as the single dashboard aggregation endpoint unless a later technical spec explicitly replaces it.
- Server-side permission filtering must happen before labels, values, counts, or drilldowns are returned.
- Existing frontend permission filtering remains defense in depth.
- Every live count must use a module-owned scoped source or a dashboard reader that applies the same UserScope rules as the owning module.
- If a scoped source is not reliable, keep the widget as readiness/drilldown-only instead of inventing a count.
- Slice failures must populate the relevant `zoneErrors` key and leave the rest of the dashboard usable.
- Do not change Finance, HR, Academic, Calendar, Communication, Transport, Security, Student, or Settings workflows while implementing dashboard summaries.
- Keep production mock and contract-preview access disabled unless explicitly enabled by env flags.
- Restore `next-env.d.ts` if build tooling changes it.

## Phase G: Finance, Fee, And Payroll Snapshot

### Goal

Replace the most valuable Finance/HR placeholder KPIs with live, scoped summary values while keeping the existing module workflows untouched.

### Candidate Widgets

| Widget ID | Template | Zone | Live source expectation |
| --- | --- | --- | --- |
| `leadership-fee-collection` | Leadership | KPIs | Finance fee collection progress or readiness summary. |
| `finance-collection` | Finance/HR | KPIs | Today's posted fee collection and receipt count. |
| `finance-dues` | Finance/HR | KPIs | Outstanding dues amount/count in the active academic year. |
| `hr-payroll-readiness` | Finance/HR | KPIs | Existing HR payroll readiness reader. |
| `hr-staff-attendance` | Finance/HR | KPIs | Existing scoped HR attendance summary, if available. |
| `finance-concession-impact` | Finance/HR | Risks | Existing concession summary or threshold readiness. |

### Implementation Notes

- Prefer existing Finance/HR read services over new repository queries.
- If fee collection APIs require `academicYearId`, keep the widget as readiness-only when the value is missing or invalid.
- Payroll should reuse the same payroll readiness semantics as Phase F, but now update the KPI widget, not only the Leadership action item.
- Staff attendance must use the same scoped employee/attendance rules as HR dashboards.
- Keep `zoneErrors.kpis` and `zoneErrors.risks` isolated per failed slice.

### Acceptance Criteria

- Finance/HR template shows live collection, dues, payroll readiness, and staff attendance when permissions and data sources exist.
- Leadership fee collection is live or explicitly readiness-only when scoped source requirements are not met.
- Users without Finance or HR permissions receive no related widget IDs, titles, values, counts, or links.
- Dashboard remains usable when one Finance/HR slice fails.

### Quality Gate

- Backend Dashboard tests for live finance/payroll widget enrichment, denied permissions, missing/invalid academic year, and slice failure.
- Frontend dashboard tests for API mapping and permission hiding after enrichment.
- E2E with `finance-officer@ddvs.com` proving Finance widgets render and unauthorized HR widgets stay hidden.
- `npm run test -- dashboard`
- Targeted dashboard eslint
- `npm run ts`
- `npm run build`
- `npm run test:e2e -- e2e/dashboard`

## Phase H: Calendar And Announcements

### Goal

Replace shared static calendar and announcement widgets with live, scoped items relevant to the active template.

### Candidate Widgets

| Widget ID | Template | Zone | Live source expectation |
| --- | --- | --- | --- |
| `calendar-periodic-test` | All permitted templates | Calendar | Academic exam/calendar schedule where the user has access. |
| `calendar-safety-drill` | Admin/Leadership | Calendar | Calendar event or safety follow-up item. |
| `announcement-board-practical` | Academic-facing templates | Announcements | Communication/academic announcement source. |
| `announcement-ptm` | All permitted templates | Announcements | Communication acknowledgement or unread circular source. |

### Implementation Notes

- Keep calendar and announcement items as small dashboard summaries, not full inbox/event lists.
- Respect template context: student/parent should not receive staff-only events; teachers should not receive leadership-only operational reminders.
- If Communication or Calendar modules do not expose scoped summary readers, keep the item as a drilldown with readiness copy.
- Calendar item dates must come from backend time and the requested dashboard date range.

### Acceptance Criteria

- Calendar and announcement zones are populated from safe sources or intentionally readiness-only.
- Items are permission-filtered server-side and frontend-side.
- Empty zones show the existing empty state rather than mock data pretending to be live.
- Partial failure in calendar or announcements does not affect KPIs, actions, risks, or modules.

### Quality Gate

- Backend tests for scoped calendar/announcement item emission and permission filtering.
- Frontend tests for empty/live/partial-error states.
- E2E smoke for calendar and announcement visibility on at least Leadership, Teacher, and Student/Parent templates.

## Phase I: Transport, Security, And Safety Exceptions

### Goal

Surface operational exceptions that school administrators care about in the morning review: transport issues, gate/security follow-ups, and safety incidents.

### Candidate Widgets

| Widget ID | Template | Zone | Live source expectation |
| --- | --- | --- | --- |
| `leadership-transport-health` | Leadership | Modules | Transport dashboard health or exception count. |
| `principal-transport-applications` | Principal/Admin | Actions | Pending transport applications or route allocation items. |
| `principal-security-dashboard` | Principal/Admin | Modules | Security/gate-pass exception summary. |
| `student-transport-alert` | Student/Parent | Risks | Personal route timing/status only after identity mapping is reliable. |

### Implementation Notes

- Transport and Security data must not expose students, staff, visitors, routes, or incidents outside the user's module scope.
- Student/Parent transport alerts stay readiness-only until student/parent identity and route assignment mapping are reliable.
- Do not add new Transport or Security workflows from the dashboard.
- Use dashboard drilldowns to existing module screens for operational resolution.

### Acceptance Criteria

- Leadership and Principal/Admin receive scoped transport/security exception summaries when permitted.
- Denied users receive no operational exception labels, values, or links.
- Student/Parent does not receive school-wide transport alerts as personal data.
- Failures use `zoneErrors.actions`, `zoneErrors.risks`, or `zoneErrors.modules` depending on affected widget zone.

### Quality Gate

- Backend tests for permission-filtered transport/security widgets.
- E2E drilldown tests for at least one transport or security widget.
- Regression test proving Student/Parent personal transport remains hidden/readiness-only without identity mapping.

## Phase J: Compliance Readiness

### Goal

Make the dashboard India-ready by showing operational readiness for UDISE+, APAAR/PEN, CBSE disclosure, and safety certificates without pretending official external integrations already exist.

### Candidate Widgets

| Widget ID | Template | Zone | Live source expectation |
| --- | --- | --- | --- |
| `leadership-compliance` | Leadership | KPIs | Composite readiness from local school/student/staff/settings data. |
| `leadership-certificate-risk` | Leadership | Risks | Certificate expiry, missing document, or disclosure follow-up readiness. |

### Implementation Notes

- This phase should measure local ERP readiness, not official government portal status.
- UDISE+ readiness can use local completeness indicators only when source fields are known.
- APAAR/PEN readiness can use student identity/document completeness only when scoped student data is available.
- CBSE disclosure readiness can use configured school information, documents, staff qualification records, infrastructure records, and certificate metadata if those modules already store them.
- Safety certificate risk should only use local certificate/document expiry data if an existing source exists; otherwise remain readiness/drilldown-only.

### Acceptance Criteria

- Compliance widgets clearly represent local readiness, not official external submission state.
- No external-system status is implied without integration.
- Compliance values are permission-gated and scope-safe.
- Missing source modules produce actionable readiness copy, not fake percentages.

### Quality Gate

- Backend tests for composite readiness with complete, partial, and unavailable sources.
- Tests proving denied users do not receive compliance labels, values, or drilldowns.
- Documentation updated with exact readiness inputs used by the backend.

## Phase K: Teacher And Student/Parent Personalization

### Goal

Move the Teacher and Student/Parent templates from generic readiness cards to personal daily cockpit views after class assignment and student/parent identity mapping are reliable.

### Candidate Widgets

| Widget ID | Template | Zone | Live source expectation |
| --- | --- | --- | --- |
| `teacher-classes` | Teacher | KPIs | Today's assigned timetable/class count. |
| `teacher-homework` | Teacher | KPIs | Pending homework or assessment feedback in assigned classes. |
| `teacher-exam-evaluation` | Teacher | KPIs | Pending marks entry/evaluation for assigned exams. |
| `teacher-attendance` | Teacher | Actions | Assigned class periods needing attendance. |
| `teacher-student-risk` | Teacher | Risks | Scoped class students needing follow-up. |
| `teacher-class-performance` | Teacher | Modules | Academic/class performance readiness or summary. |
| `student-attendance` | Student/Parent | KPIs | Personal student attendance only. |
| `student-assignments` | Student/Parent | KPIs | Personal homework/learning tasks. |
| `student-fee-status` | Student/Parent | KPIs | Personal fee status only. |
| `student-document-update` | Student/Parent | Actions | Personal student identity/document readiness. |
| `student-academic-summary` | Student/Parent | Modules | Personal academic summary/drilldown. |

### Implementation Notes

- Do not populate Student/Parent cards from school-wide aggregates.
- Student/Parent dashboard requires reliable mapping from authenticated user to student/guardian profile and permitted student IDs.
- Teacher dashboard requires reliable mapping from authenticated user to employee/teacher profile and assigned classes.
- If identity mapping is absent or ambiguous, keep widgets readiness-only and show no personal counts.
- This phase should also connect Security-owned custom role-to-template mapping if the Security module has a reliable configuration surface by then.

### Acceptance Criteria

- Teacher widgets reflect only assigned classes/students.
- Student/Parent widgets reflect only the mapped student or guardian-linked students.
- Ambiguous identity mapping produces safe empty/readiness states, not broad data.
- Multi-role users resolve through explicit Security mapping or documented priority fallback.
- Production template switcher and mock/preview paths remain disabled unless env flags explicitly enable them.

### Quality Gate

- Backend tests for teacher scope, student/guardian identity scope, ambiguous identity fallback, and denied permissions.
- Frontend tests for safe empty states on unmapped users.
- E2E with seeded Teacher and Student/Parent users when seed data exists.
- Full dashboard E2E suite with all five templates.

## Cross-Phase Execution Checklist

Each phase must start with discovery and end with sign-off:

1. List the widget IDs touched by the phase.
2. Identify the exact existing scoped source for every live value.
3. Confirm required permissions already exist in both backend and frontend registry.
4. Keep unsupported widgets readiness/drilldown-only.
5. Add or update backend Dashboard tests before relying on manual validation.
6. Add frontend tests only in dashboard-owned files.
7. Run targeted dashboard unit tests, lint, type check, build, and E2E when the local DDVS stack is available.
8. Update `docs/dashboard/data-contract.md` and `docs/dashboard/testing-and-acceptance.md` with the phase result.
9. Check final diffs for unrelated module, nav, layout, logo, or generated-file churn.

## Recommended Execution Order

1. Phase G: Finance/Fee/Payroll Snapshot.
2. Phase H: Calendar And Announcements.
3. Phase I: Transport, Security, And Safety Exceptions.
4. Phase J: Compliance Readiness.
5. Phase K: Teacher And Student/Parent Personalization.

This order prioritizes daily operational value while delaying identity-sensitive Teacher and Student/Parent personalization until the required mappings can be proven safe.
