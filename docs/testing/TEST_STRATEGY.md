# Academic Test Strategy

The Academic module should be automated in layers:

1. Route smoke for every active route.
2. Critical CRUD/workflow tests for Curriculum, Timetable, Homework, Examination, and Academic Calendar.
3. Permission matrix for menu visibility, direct route access, and direct API access.
4. Multi-tenant isolation tests for read, write, delete, search, reports, exports, uploads, Redux cache, and tenant headers.
5. Accessibility checks on critical routes with `@axe-core/playwright`.
6. Responsive checks on desktop, tablet, and mobile.
7. Visual snapshots only for stable dashboards, reports, receipts, results, and calendar views.

The current implementation starts with route smoke and subject-management workflow coverage. The next safest expansion is Academic Calendar because it has explicit backend permissions, audit logs, and manageable workflow size.
