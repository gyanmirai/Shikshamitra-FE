# CI Testing Strategy

## Pull Request

- `npm run ts`
- `npm run lint`
- `npm run test`
- `npm run test:e2e:academic:smoke -- --list`
- Run Academic smoke against a provisioned E2E stack when credentials are available.

## Main

- Chromium Academic smoke and critical workflows.
- Permission and tenant-isolation suites when test tenants are available.
- Generate bug reports and coverage artifacts.

## Nightly

- Set `E2E_FULL_BROWSERS=1`.
- Run Chromium, Firefox, WebKit, Mobile Chrome, and Mobile Safari.
- Include accessibility, responsive, permission, tenant, resilience, and visual suites.

## Release

- Academic Calendar critical workflows.
- Curriculum subject setup and allocation.
- Timetable setup and conflict workflows.
- Examination schedule, marks, and result publication.
- Permission and tenant isolation release gates.
