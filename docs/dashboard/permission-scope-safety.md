# Dashboard Permission And Scope Safety

## Purpose

The dashboard uses frontend permission gating to avoid exposing widgets, labels, counts, and drilldowns for modules the current user cannot access. This is UI safety only. When live dashboard aggregation is introduced, backend services must still apply UserScope before returning counts, lists, and exceptions.

## Frontend Rules

- Dashboard widgets must be registered in the dashboard widget registry before they can render when permission enforcement is enabled.
- Registry metadata owns widget `requiredPermissions`, `drilldownUrl`, and `owner`.
- Unknown widgets are hidden after permissions are initialized.
- Denied widgets must not render titles, values, counts, chips, or clickable drilldown actions.
- Permission arrays are treated as OR conditions, matching the existing `hasGrantedPermission` helper.
- Before permissions are initialized, the dashboard may render the shell with mock/adapted data to avoid a blank page during auth loading.

## Backend UserScope Requirements

Future dashboard aggregation APIs must apply the same UserScope rules used by module lists and reports:

- Student and academic counts must be filtered by accessible academic year, board, medium, standard, and division.
- HR and payroll aggregates must respect the same scoped employee visibility used by HR reports and HR module screens.
- Finance aggregates that are student-linked must not include students outside the user's academic scope.
- Transport, safety, hostel, and communication exceptions must not include scoped students, employees, or routes the user cannot access.
- Aggregate widgets must not reveal sensitive totals if the user cannot access the corresponding drilldown data.

## Release Gate

Phase C is complete when frontend widget gating is registry-driven and tested with both unit/component coverage and a real seeded limited-permission user. Backend UserScope enforcement remains a later requirement for the dashboard aggregation API phase.
