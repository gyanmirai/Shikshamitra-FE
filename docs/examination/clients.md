---
module: examination
domain: clients
content_type: Reference
status: canonical
updated_on: 2026-09-02
owner: frontend-team
audience: humans-and-agents
---

# Find Examination seating clients

TL;DR: guided seating uses one typed RTK Query injection and the shared `academicType.seatAllocation` cache tag.

| Client action                    | Request                                                               | Cache behavior                                                      |
| -------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Load workspace                   | `GET /academics/exams/{examId}/seating-plan/v2/workspace`             | Provides exam subjects, plan groups, selected plan, and seating tag |
| Create individual or shared plan | `POST /academics/exams/{examId}/seating-plan/v2/plans`                | Sends one or many exam-subject IDs and invalidates seating tag      |
| Edit a draft subject group       | `POST /academics/exams/{examId}/seating-plan/scopes`                  | Can explicitly clear that plan's seats when its subjects change     |
| Delete an empty draft plan       | `DELETE /academics/exams/{examId}/seating-plan/scopes/{planId}`       | Invalidates seating tag                                             |
| Reset the complete draft         | `POST /academics/exams/{examId}/seating-plan/v2/reset-draft`          | Deletes every draft plan and seat, then returns a clean workspace   |
| Save rooms and rules             | `PUT /academics/exams/{examId}/seating-plan`                          | Invalidates seating tag                                             |
| Generate preview                 | `POST /academics/exams/{examId}/seating-plan/auto-allocate`           | No mutation cache invalidation                                      |
| Apply reviewed preview           | `POST /academics/exams/{examId}/seating-plan/v2/apply-preview`        | Invalidates seating tag                                             |
| Validate a plan                  | `POST /academics/exams/{examId}/seating-plan/validate`                | Checks the selected plan before returning to subject planning       |
| Validate the examination         | `POST /academics/exams/{examId}/seating-plan/v2/validate-examination` | Returns global coverage, plan readiness, blockers, and warnings     |
| Publish the examination          | `POST /academics/exams/{examId}/seating-plan/v2/publish`              | Atomically publishes all plans and invalidates seating tag          |
| Load published room seats        | Existing student and seat-layout routes                               | Lazy room queries; no invalidation                                  |

Request and response wire types are in `src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types.ts`.
Draft and apply requests echo the opaque server `version`; the frontend does not derive concurrency from timestamps.
The guided client never calls the legacy per-plan finalize or publish routes. The older `v2/session` route remains a backend compatibility surface.
Backend endpoint and permission truth is in [backend api.md](../../../Shikshamitra-BE/docs/modules/examination/api.md).
