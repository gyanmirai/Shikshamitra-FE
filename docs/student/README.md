---
module: student
domain: overview
content_type: Landing
status: canonical
updated_on: 2026-08-14
owner: frontend-team
audience: humans-and-agents
---

# Understand Student frontend integration

TL;DR: use this page as the entrypoint for Student routes, clients, workflows, and validation, including the individual Enrollment Admissions CRM project.

## Read order

| Step | File                                                                                 | Use it to                                                                              |
| ---- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| 1    | [routes.md](./routes.md)                                                             | Confirm Student and Enrollment Admissions routes, menu ownership, and permission gates |
| 2    | [clients.md](./clients.md)                                                           | Find Student RTK Query clients and backend ownership                                   |
| 3    | [workflows.md](./workflows.md)                                                       | Trace screen-level Student and Admissions workflows                                    |
| 4    | [references/enrollment-admissions-crm.md](./references/enrollment-admissions-crm.md) | Understand the implemented Enrollment Admissions CRM project as an individual project  |
| 5    | [testing.md](./testing.md)                                                           | Choose documentation, type, lint, unit, and browser checks                             |

## Source of truth

| Need                               | Source                                                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Student navigation and permissions | `src/constants/student-menu.ts`                                                                      |
| Enrollment Admissions routes       | `src/app/(auth-route)/student/admissions/**/page.tsx`                                                |
| Enrollment Admissions screens      | `src/screens/student/admissions/**`                                                                  |
| Enrollment Admissions clients      | `src/redux/student/admissions/**`                                                                    |
| Backend Admissions implementation  | `../../../Shikshamitra-BE/src/ShikshaMitra.Application/Students/StudentEnrollments/Admissions/**`    |
| Backend Admissions contracts       | `../../../Shikshamitra-BE/src/ShikshaMitra.Application.Contracts/Students/Enrollments/Admissions/**` |

## For agents

| Question                                     | First file                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------ |
| Which Student or Admissions route is active? | [routes.md](./routes.md)                                                             |
| Which client owns an Admissions request?     | [clients.md](./clients.md)                                                           |
| How does the Admissions demo flow work?      | [references/enrollment-admissions-crm.md](./references/enrollment-admissions-crm.md) |
| Which frontend checks should run?            | [testing.md](./testing.md)                                                           |

## Validation

Run these commands from the `Shikshamitra-FE` repository root:

```bash
npm run docs:check
git diff --check
```

Frontend docs own route, screen, client, cache, and browser behavior.
Backend Admissions rules, contracts, permissions, errors, and data integrity remain owned by the backend source paths linked above.
