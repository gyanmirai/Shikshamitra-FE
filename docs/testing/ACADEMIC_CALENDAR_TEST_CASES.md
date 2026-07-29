# Academic Calendar Test Cases

## Scope

These test cases cover the Academic Calendar module end to end, excluding tenant-isolation checks. They validate authenticated calendar operations, API contracts, permission boundaries, negative edge cases, auditability, emergency closure impact flow, and UI resilience.

Run command:

```bash
npx playwright test e2e/academic/academic-calendar-api.spec.ts e2e/academic/academic-calendar-workflow.spec.ts e2e/academic/academic-calendar-permissions.guest.spec.ts e2e/academic/academic-calendar-resilience.spec.ts e2e/academic/academic-calendar-ui.spec.ts --output=test-results-academic-calendar
```

## Preconditions

- Frontend is running at `http://localhost:3000`.
- Backend API is running at `https://localhost:44332`.
- `E2E_TENANT` is set or defaults to `DDVS`.
- Seeded academic year exists.
- Seeded `admin-ddvs` user can authenticate and has Academic Calendar permissions.
- Playwright auth setup can create storage states for HR manager, academic admin, and teacher.

## Functional Flow

| ID | Area | Scenario | Role | Steps | Expected Result | Automated |
| --- | --- | --- | --- | --- | --- | --- |
| AC-CAL-001 | Calendar list | Load calendars by academic year | Academic Admin | Resolve current academic year, call `GET /api/academic/calendars?academicYearId={id}` | Response is `200`; body uses ABP paged shape with `items` array | Yes |
| AC-CAL-002 | Dashboard | Load calendar dashboard | Academic Admin | Call `GET /api/academic/calendar/dashboard?academicYearId={id}` | Response is `200`; includes `academicYearId`, numeric `totalWorkingDays`, numeric `pendingImpactLogsCount`, and `upcomingDays` array | Yes |
| AC-CAL-003 | Emergency closure list | Load emergency closures | Academic Admin | Call `GET /api/academic/calendar-emergency-closures?academicYearId={id}&skipCount=0&maxResultCount=5` | Response is `200`; body uses paged `items` array | Yes |
| AC-CAL-004 | Audit summary | Load audit summary | Academic Admin | Call `GET /api/academic/calendar-audit-logs/summary` | Response is `200`; includes numeric `totalAuditEvents` and `criticalChanges` | Yes |
| AC-CAL-005 | Calendar create | Create a draft calendar | Academic Admin | POST a unique calendar name, academic year, start date, end date, description, and `isDefault=false` | Response is `200`; created calendar returns an `id`, expected name, and draft status | Yes |
| AC-CAL-006 | Calendar edit | Update calendar details | Academic Admin | PUT updated name, description, and default flag to `/api/academic/calendars/{id}` | Response is `200`; updated response contains the new name | Yes |
| AC-CAL-007 | Day marker | Add event day to calendar | Academic Admin | POST event day payload to `/api/academic/calendars/{id}/days` | Response is `200`; returned day has expected title | Yes |
| AC-CAL-008 | Publish | Publish draft calendar | Academic Admin | POST `/api/academic/calendars/{id}/publish` | Response is `200`; status changes to published | Yes |
| AC-CAL-009 | Emergency closure | Declare an emergency closure | Academic Admin | POST closure payload to `/api/academic/calendar-days/emergency-closure` | Response is `200`; returns closure day list with expected title | Yes |
| AC-CAL-010 | Impact logs | Read impact logs for closure day | Academic Admin | Call `GET /api/academic/calendar-impact-logs/by-day/{calendarDayId}` | Response is `200`; returns a safe JSON list | Yes |
| AC-CAL-011 | Audit trail | Verify workflow audit entries | Academic Admin | Call `GET /api/academic/calendar-audit-logs/by-calendar/{calendarId}` after create, update, publish, and closure | Audit labels include `Calendar Created`, `Calendar Updated`, `Calendar Published`, and `Emergency Closure Declared` | Yes |
| AC-CAL-012 | Cancel closure | Cancel emergency closure | Academic Admin | POST `/api/academic/calendar-days/{calendarDayId}/cancel-emergency-closure` | Response is successful | Yes |
| AC-CAL-013 | Archive | Archive calendar | Academic Admin | POST `/api/academic/calendars/{id}/archive` | Response is `200`; status changes to archived | Yes |
| AC-CAL-014 | Delete | Delete archived calendar | Academic Admin | DELETE `/api/academic/calendars/{id}` | Response is successful; cleanup leaves no test calendar behind | Yes |

## Negative And Edge Cases

| ID | Area | Scenario | Role | Steps | Expected Result | Automated |
| --- | --- | --- | --- | --- | --- | --- |
| AC-CAL-015 | Date validation | Reject malformed date | Academic Admin | Call `/api/academic/calendar/check-date?date=not-a-date&validationType=ExamSchedule` | Returns controlled `4xx`; no `5xx` | Yes |
| AC-CAL-016 | Missing id | Request empty GUID calendar | Academic Admin | Call `GET /api/academic/calendars/00000000-0000-0000-0000-000000000000` | Returns controlled `400` or `404` | Yes |
| AC-CAL-017 | Duplicate calendar | Reject duplicate calendar name | Academic Admin | Create a calendar, then create another with same academic year/name | Returns controlled `4xx`; no `5xx` | Yes |
| AC-CAL-018 | Duplicate day marker | Reject duplicate day marker | Academic Admin | Add an event day, then add another event for same date/calendar | Returns controlled `4xx`; no `5xx` | Yes |
| AC-CAL-019 | Invalid vacation range | Reject vacation where end date is before start date | Academic Admin | POST vacation day with `endDate < date` | Returns controlled `4xx`; no `5xx` | Yes |

## Permission Boundary

| ID | Area | Scenario | Role | Steps | Expected Result | Automated |
| --- | --- | --- | --- | --- | --- | --- |
| AC-CAL-020 | Anonymous read | Anonymous user cannot read calendar management APIs | Guest | Call `GET /api/academic/calendars` without bearer token and do not follow redirect | Returns `302`, `401`, or `403` | Yes |
| AC-CAL-021 | Anonymous create | Anonymous user cannot create Academic Calendar records | Guest | POST calendar payload without bearer token and do not follow redirect | Returns `302`, `401`, or `403` | Yes |

## UI Resilience

| ID | Area | Scenario | Role | Steps | Expected Result | Automated |
| --- | --- | --- | --- | --- | --- | --- |
| AC-CAL-022 | API 400 | Calendar management handles bad request | Academic Admin | Mock calendar API as `400`, open `/academic/calendarManagement` | Page stays visible; no `Application Error`; no `Internal Server Error` | Yes |
| AC-CAL-023 | API 403 | Calendar management handles forbidden response | Academic Admin | Mock calendar API as `403`, open `/academic/calendarManagement` | Page stays visible; no crash text | Yes |
| AC-CAL-024 | API 404 | Calendar management handles not found response | Academic Admin | Mock calendar API as `404`, open `/academic/calendarManagement` | Page stays visible; no crash text | Yes |
| AC-CAL-025 | API 409 | Calendar management handles conflict response | Academic Admin | Mock calendar API as `409`, open `/academic/calendarManagement` | Page stays visible; no crash text | Yes |
| AC-CAL-026 | API 500 | Calendar management handles server error response | Academic Admin | Mock calendar API as `500`, open `/academic/calendarManagement` | Page stays visible; no crash text | Yes |
| AC-CAL-027 | Partial response | Calendar management handles partial calendar payload | Academic Admin | Mock calendar list as `200` with partial item fields | Page stays visible; no crash text | Yes |
| AC-CAL-028 | Offline/timeout | Calendar management handles offline reload | Academic Admin | Load page with partial response, switch browser context offline, reload, switch online | Page stays visible; no crash text | Yes |

## UI Forms

| ID | Area | Scenario | Role | Steps | Expected Result | Automated |
| --- | --- | --- | --- | --- | --- | --- |
| AC-CAL-029 | Calendar management UI | Render Calendar Management and switch views | Academic Admin | Open `/academic/calendarManagement`, verify selected calendar details, switch to Month View | Page renders management heading, selected calendar, and clickable month day cells | Yes |
| AC-CAL-030 | Day marker validation | Required fields are enforced | Academic Admin | Open day marker dialog and submit without day type/title | Form shows `Day Type is required` and `Title is required` | Yes |
| AC-CAL-031 | Conditional fields | Marker type and scope fields change dynamically | Academic Admin | Select Holiday, Vacation, Half Day, then turn off all-class scope | Holiday category, vacation end date, half-day time fields, and class selector appear when required | Yes |
| AC-CAL-032 | Day marker submit | Valid event marker submits expected payload | Academic Admin | Open marker dialog, choose Event, enter title/description, submit | POST payload includes event day type, entered title, and all-class scope | Yes |
| AC-CAL-033 | Published calendar validation | Published calendar changes require a reason | Academic Admin | Mock selected calendar as published, fill marker type/title, submit without reason | Form shows `Change reason is required for published calendar` | Yes |

## Coverage Notes

- Current automated Calendar module coverage: 33 documented scenarios.
- Tenant isolation is intentionally excluded from this set and should be handled with a separate second-tenant fixture.
- The tests clean up calendars they create by archiving and deleting them in `finally` blocks.
- The workflow intentionally uses unique run IDs to avoid collisions across repeated runs.
