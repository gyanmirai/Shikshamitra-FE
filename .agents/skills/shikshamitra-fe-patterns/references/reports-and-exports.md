---
title: Reports and Exports UI Rulebook
status: draft
owner: frontend-team
scope: report-generation-export-jobs-and-downloads
---

# Reports and Exports UI Rulebook

This document defines report generation, export jobs, generated-file lists,
AI-assisted report requests, downloads, retries, and expiry behavior. The
ordinary table toolbar action `Export` remains defined in
[tables.md](../../shikshamitra-ui-consistency/references/tables.md). This document defines what happens after a report or
export request is made.

## 1. Export versus generated report

- Use a direct export when the current visible data can be downloaded quickly
  without a server-side job.
- Use a generated report when the system must assemble, format, or calculate a
  larger result asynchronously.
- Label the action according to the result: `Export current view`, `Generate
  report`, or `Download report`.
- Do not label every action `Export` when the user is actually starting a
  background report job.
- Explain the selected scope before generation: class, division, date range,
  module, academic year, and any applied filters.

## 2. Report workspace anatomy

A report workspace may contain:

1. Report request or scope controls.
2. One primary action such as `Generate report`.
3. Generated report history.
4. Job status and progress.
5. File metadata and download actions.

- Keep page-level title, breadcrumbs, filters, and primary actions governed by
  [page-headers.md](page-headers.md).
- Keep report history in the standard table region governed by
  [tables.md](../../shikshamitra-ui-consistency/references/tables.md).
- Do not show a report-history table before explaining the active scope when
  that scope materially affects the result.
- Avoid summary cards that repeat the same status and count shown in the table.

## 3. Naming and copy conventions

- Use sentence case for report types, buttons, statuses, and helper text.
- Use clear report names such as `Teachers for all classes` or `Class 8
  timetable`, not internal endpoint or job names.
- Use consistent field names: `Report type`, `Format`, `Status`, `File name`,
  `Created`, `Completed`, `Expires`, and `Actions`.
- Use `Generate report`, `Generate report with AI`, `Download`, `Retry`,
  `Cancel generation`, and `Delete report` only when those actions are valid.
- Do not use `Generate with AI` without identifying what will be generated and
  which data will be used.
- Use `Report ready` instead of vague text such as `Done`.
- File names should be readable, stable, and include the report purpose and
  relevant scope. Do not expose internal identifiers as the primary filename.

## 4. Report lifecycle states

| State | Meaning | Visual treatment |
| --- | --- | --- |
| Queued | Request accepted and waiting to run | Neutral or existing accent |
| Generating | Work is currently running | Existing progress treatment |
| Completed | File is ready to download | Success treatment used sparingly |
| Failed | Generation did not complete | Danger treatment with retry |
| Expired | File is no longer available | Muted treatment with regenerate |
| Cancelled | User or system stopped the job | Neutral muted treatment |

- Status text must always accompany color.
- Do not use green for a queued or merely selected report.
- Use warning yellow for expiry approaching or user attention required, not for
  every generated file.
- Use red only for a failed job, blocked download, or destructive error.
- Do not add a different color for every report type or file format.

## 5. Request flow

- The request form must expose required scope and format fields before the
  primary action becomes enabled.
- Show a concise summary before starting a long or expensive report:
  `Generate PDF for all Class 8 divisions for September 2026?`
- Validate that the user has permission to access the selected data.
- If the request can take time, explain that the user may leave the page and
  return to the generated reports list.
- After submission, show the new job in the list with `Queued` or `Generating`.
- Do not close the form or reset its context until the request has been
  accepted or a clear failure has been reported.
- Use [popups.md](popups.md) for consequential cancellation or deletion.

## 6. Progress and loading behavior

- Show progress in the report row or a focused status region, not through an
  unrelated global spinner alone.
- Keep the request and report list responsive while a background job runs.
- Disable only actions that conflict with the running job.
- A running job must not expose `Download` until the file is complete.
- Prevent duplicate generation requests from repeated clicks.
- When polling, update the status and accessible live message without jumping
  the table layout.
- If processing exceeds the expected time, explain the delay and offer a safe
  refresh or retry path.

## 7. Generated report table

Recommended columns are:

- Report type.
- Format.
- Status.
- File name.
- Created.
- Completed.
- Expires.
- Actions.

- Keep only columns needed to identify, assess, or act on a report.
- Keep status and actions sticky on wide tables according to
  [tables.md](../../shikshamitra-ui-consistency/references/tables.md).
- Do not show a large unused action area when only one action is available.
- Use a compact file-format label such as `PDF` or `CSV`; do not repeat the
  full format name in every cell.
- Long filenames must truncate safely and expose the complete name on focus or
  in a detail view.

## 8. Download and expiry

- `Download` must be available only when the file exists and the user can
  access it.
- If a file expires, explain the reason and offer `Generate again` when valid.
- Do not show a disabled download icon without an explanation.
- If a download fails, preserve the report row and provide `Retry download` or
  a clear support/error message.
- Display expiry dates in the same date and timezone convention as the rest of
  the product.
- Destructive deletion of generated files requires a confirmation popup and
  must not delete the underlying source records.

## 9. AI-assisted reports

- State that AI is being used and name the report or summary being generated.
- Show the source scope and any limitations before generation.
- Do not present generated text as verified fact without a review step where
  accuracy matters.
- Keep `Generate report with AI` separate from ordinary file export.
- Show failed, incomplete, or still-processing AI output as such.
- Avoid adding a decorative AI badge if it does not help the user understand
  the action or result.

## 10. Empty, filtered, and error states

- For a new report list, use `No reports have been generated yet.`
- For filters with no matching history, use `No reports match the selected
  filters.`
- For a failed request, say what failed and provide `Retry` when safe.
- Do not use generic `No data available` when the product can explain whether
  there are no reports, no matches, or a loading error.
- Keep the report scope and filters visible in all of these states.

## 11. Spacing, surfaces, and visual restraint

- Use the established page and table surfaces; do not create a separate color
  system for reports.
- Use consistent 8/12/16/24 spacing tokens for request sections, metadata, and
  actions.
- Separate job metadata with whitespace and subtle dividers rather than heavy
  borders or nested cards.
- Use one primary action per request area.
- Keep helper text short and close to the field or status it explains.
- Use icons for file type, download, retry, and status only when their meaning
  is clear and they have accessible labels.

## 12. Reports and exports checklist

- [ ] The user can distinguish direct export from background report generation.
- [ ] Scope, format, permission, and consequence are clear before submission.
- [ ] Job states use consistent names and semantic colors.
- [ ] Duplicate generation and conflicting actions are prevented.
- [ ] Completed, failed, expired, and filtered-empty states are distinct.
- [ ] Downloads are available only when valid.
- [ ] Expiry and retry behavior is explicit.
- [ ] AI-assisted reports disclose their scope and review expectations.
- [ ] Table columns and action width follow the table rulebook.
- [ ] Copy, spacing, borders, and icons use the existing system language.
