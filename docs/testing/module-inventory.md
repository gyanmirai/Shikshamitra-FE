# Academic Module Inventory

Generated: 2026-07-29

This inventory is based on the active Academic menu, Next.js route folders, frontend RTK Query clients, backend Academic controllers, and backend Academic permission constants.

| Submodule                  | Status               | Risk     | Routes                                 | API Surface                                                                      |
| -------------------------- | -------------------- | -------- | -------------------------------------- | -------------------------------------------------------------------------------- |
| Dashboard                  | Confirmed            | High     | `/academic/dashboard`                  | `/api/academic/dashboard`                                                        |
| Student Academic 360       | Confirmed            | High     | `/academic/studentAcademic360`         | `/api/academics/student-academic-360`                                            |
| Curriculum                 | Confirmed            | Critical | 6 active routes                        | curriculum, syllabus, teacher diary, subjects, elective groups                   |
| Timetable                  | Confirmed            | Critical | 6 active routes                        | timetable, room availability, substitutions, weekly lectures, lecture slots      |
| Homework And Assignment    | Confirmed            | Critical | 6 active routes                        | homeworks, assignments, submissions, feedback, types, rubrics                    |
| Examination                | Confirmed            | Critical | 9 active routes                        | exams, marks, seat allocation, results, settings, question bank, question papers |
| Academic Calendar          | Confirmed            | Critical | 3 active routes                        | calendar, emergency closure, audit logs                                          |
| Audits                     | Confirmed            | High     | `/academic/audits`                     | `/api/academic/audit-events`                                                     |
| Notification               | Confirmed route only | Medium   | `/academic/notification`               | Needs API confirmation                                                           |
| Group Management           | Not confirmed        | Medium   | route folders exist; menu is commented | Needs product confirmation                                                       |
| Learning Management System | Not confirmed        | Medium   | route folders exist; menu is commented | Needs product confirmation                                                       |

## Active Route Count

31 active Academic routes are represented by existing smoke/signoff suites.

## Immediate Automation Priority

1. Catalogue and stabilize all 31 route smoke checks.
2. Harden critical Academic Calendar, Curriculum, Timetable, Homework, and Examination workflows.
3. Add permission-denial tests for each protected route and direct API action.
4. Add multi-tenant read/write isolation checks once two safe test tenants are available.
