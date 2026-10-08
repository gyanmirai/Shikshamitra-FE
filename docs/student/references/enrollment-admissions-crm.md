---
module: student
domain: enrollment-admissions-crm
content_type: Reference
status: canonical
updated_on: 2026-10-07
owner: frontend-team
audience: humans-and-agents
---

# Individual project: Enrollment Admissions CRM

TL;DR: this individual project delivers the Phase 1 configurable Admissions CRM from administrator setup through inquiry, Applicant 360, and application submission.

See the maintained [Enrollment Admissions workflow](../workflows.md) for the current setup-to-runtime flow. The earlier editable Excalidraw file is not present in this checkout.

## Project scope implemented

| Capability                     | Implemented surface                                                                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Admission cycles and offerings | Cycle setup plus scoped offering CRUD, inherited or override dates, readiness, availability, concurrency, clone, state commands, and bulk preview or commit                          |
| Workflow configuration         | Graph-based immutable versions with explicit entry and terminal stages, controlled conditional or default transitions, validation, preview, usage, clone, archive, and publish       |
| Dynamic form runtime           | Published form versions are pinned to applications; controlled Applicant, Guardian, and Address bindings prefill canonical data, while custom values remain in form-instance storage |
| Form configuration             | Versioned sections and fields with system bindings, defaults, validation, visibility rules, preview, and publish                                                                     |
| Inquiry CRM                    | Offering-gated inquiry capture, original-form editing, duplicate checks, family and applicant linking, follow-ups, and Pending / Interested / Not interested status                 |
| Intake and assignment          | Offering-linked intake profiles, automatic counsellor routing, secure public inquiry links, and reasoned reassignment with eligible-pool and capacity checks                        |
| Applicant 360                  | Applicant and family context, identity completeness, explainable next action, frozen application-stage progress, unified activity timeline, and staff notes                          |
| Application runtime            | Start, prefill, draft save, concurrency handling, authoritative submit validation, condition-based advancement, stage handlers, idempotency, and transition history                  |

## Demo path

1. Open `/student/admissions/settings/cycles` and create an admission cycle.
2. Open `/student/admissions/settings/workflows`, create a draft from the appropriate starting journey, configure its stages and connect every non-terminal stage, then save and publish after server validation. Use the stage drawer's Advanced settings to set the entry and ending stages; plain labels replace their redundant information icons, and the saved flags retain their existing runtime behavior.
3. Open `/student/admissions/settings/forms` and publish an inquiry and application form.
4. Open `/student/admissions/settings/intake-assignment` and create Inquiry and Counsellor Assignment profiles.
5. Open `/student/admissions/settings/offerings`, select scoped academic hierarchy, entry mode, published definitions, and the matching profiles, then save or activate the offering.
6. Use Bulk create when several Standards share one workflow, forms, profiles, and admission window; commit only after every preview row is ready.
7. Under `/student/admissions/inquiries`, choose the admission period, Board, Medium, and Class. An open, ready Offering is required before the configured Inquiry form opens; unavailable classes are denied. Public links use the same gate.
8. Use **Edit** for the originally captured form and its form-change history. Use **Follow-up** separately for notes cards, staff attribution, a reminder date, and Pending, Interested, or Not interested. One atomic submit saves the note, status, and reminder; Not interested needs no reminder. The first Interested transition requests a qualification email when a valid contact email exists; delivery remains governed by Communication consent, approval, and provider settings.
9. For an Interested inquiry, use **Move to next stage**. The server rechecks availability and capacity and creates or reuses the linked draft application. The inquiry appears in **Pipeline** and opens the existing application journey; repeated moves do not create duplicates.
10. Complete, save, and submit the application through its configured journey. Direct Registration remains a separate entry route.

Qualification emails use the existing school email settings when Communication has an enabled Email provider named **SMTP**. Pending approval or missing provider configuration waits for resolution; delivery errors remain visible without reverting Interested status. SMTP Sent confirms sender acceptance, not inbox delivery. Existing bulk operations are not part of this inquiry redesign.

## Frontend source map

| Concern                         | Source                                                |
| ------------------------------- | ----------------------------------------------------- |
| Routes                          | `src/app/(auth-route)/student/admissions/**/page.tsx` |
| Screens                         | `src/screens/student/admissions/**`                   |
| RTK Query clients               | `src/redux/student/admissions/**`                     |
| Navigation and permission names | `src/constants/student-menu.ts`                       |

## Backend ownership

The backend owns tenant isolation, authorization, domain invariants, duplicate rules, published-version immutability, form validation, workflow transitions, persistence, and audit activities.
Use `../../../Shikshamitra-BE/src/ShikshaMitra.Application/Students/StudentEnrollments/Admissions/**` and `../../../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/Students/Enrollments/Admissions/**` as the source paths for those rules.

## Explicit Phase 1 boundary

Exams, payments, document collection, seat allocation, enrollment conversion, approvals, and public-family portals are outside this individual project until separately implemented and documented.
