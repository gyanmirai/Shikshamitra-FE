# HR Employee Manual Regression Checklist

Run this after `npm run test:e2e` passes against a seeded DDVS environment.

## Environment

- Backend host is running with `SeedTestLogins=true`.
- Frontend `NEXT_PUBLIC_API_URL` points to that backend.
- Login as `hr-manager@ddvs.com` / `Temp@123`.
- Tenant/school code is `DDVS`.

## Visual and UX

- Employee List table renders without column overlap at desktop width.
- Sticky Role, Name, Status, and Actions columns stay aligned while horizontally scrolling.
- Loading skeletons and empty state do not overlap toolbar or pagination.
- Search, organization filter, rows-per-page, pagination, column picker, export menu, and fullscreen controls open and close correctly.
- Add/Edit stepper labels remain readable and selected step state is clear.
- Back button and unsaved changes confirmation work from Add/Edit and Profile views.
- Change Status and Salary Structure dialogs fit within viewport and can be closed by cancel and close icon.
- Profile tabs render correctly at desktop and mobile widths.

## Functional

- Create employee and verify generated employee code format.
- Refresh Employee List and confirm created employee is searchable by name, code, email, and mobile.
- Edit personal information and verify list/profile reflect changes after refresh.
- Save family, additional details, work experience, payroll bank details, reporting manager, and academic permissions; reopen each step and verify persisted values.
- Upload valid PDF/JPG/PNG employee document; refresh profile and verify it is listed.
- Download/view uploaded document and verify it is not empty.
- Try unsupported and oversized document uploads; verify controlled validation error.
- Change status to Inactive, Left, and Retired; verify remarks are required for Left/Retired.
- Attempt Left/Retired to Active and verify it is blocked.
- Login as a lower-permission user and verify write actions are hidden or blocked with a controlled 403 message.

## Acceptance

- No browser console errors.
- No unhandled API failures.
- No visible toast/error unless the case intentionally validates a failure path.
- No text overlap on desktop or mobile.
