# Table workspaces

Adapted from [table rules](../../shikshamitra-fe-patterns/references/tables.md) and the full-height
table workspace sections of [DESIGN.md](../../../../DESIGN.md).

## When to use

Use for finding, comparing, filtering, and acting on a primary record collection. An embedded
history/preview table is a documented exception, not a full-height page workspace.

## Reference image

Image pending: `assets/table-workspace.png`. See [image references](image-references.md).
Expected callouts: 1 page header, 2 domain filters, 3 table utilities, 4 status/actions, 5 pagination.

## How to build

1. Use `CustomBreadcrumbs` first, followed by page context/domain filters, then `CustomizableTable`.
2. Make the desktop root a column flex container with `height: 1` and `minHeight: 0`. Every flex
   parent containing the table keeps `minHeight: 0`; the table region uses `flex: 1` and
   `overflow: 'hidden'`. The table fills remaining shell height and owns scrolling.
3. Use the table's current `wrapperProps` and `tableContainerProps` for filling the region.
   Do not use `calc(100vh - ...)`, fixed desktop max heights, or arbitrary minimum heights.
4. Define typed `IColumn[]`, a contextual accessible name, and a stable unique `tableId`.
   Reuse typed formatters and semantic status mappings rather than pre-formatting/mutating rows.
5. Keep global search, density, columns, export, and full-screen utilities inside the shared table.
   Domain filters belong outside. Use server-driven paging/search/sort/filter when data can grow
   beyond a bounded client-safe result; preserve the backend contract.

## Required layout shape

This is a layout illustration, not a standalone component. Wire typed table props from the feature
and inspect the current table API before using it.

```tsx
<Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}>
  <CustomBreadcrumbs heading={heading} description={description} links={links} />
  <FilterPanel />
  <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
    <CustomizableTable
      {...tableProps}
      wrapperProps={{ sx: { height: 1 } }}
      tableContainerProps={{ sx: { height: 1 } }}
    />
  </Box>
</Box>
```

## Columns, actions, and states

- Actions are the rightmost sticky column, with status immediately before them when present.
  Keep sticky cells opaque, aligned, and subtly separated during horizontal scroll.
- Show at most two direct row actions; put additional actions in an anchored three-dots menu.
  Give actions record-specific accessible names. Keep menus keyboard accessible and unclipped.
- Action columns are not sortable, filterable, or exported. Preserve export exclusion settings.
- Initial loading uses the shared table skeleton. Safe refreshes retain rows with progress.
- Distinguish genuinely empty data, search no-results, filter no-results, and missing prerequisites.
  Offer `Clear search` or `Clear filters` only when relevant; do not invent a create permission.
- Synchronize displayed rows, counts, filters, sorting, and pagination. Preserve context on refresh.

## Responsive and verification rules

- On narrow screens allow table-contained horizontal scroll, not document overflow. Mobile layouts
  may scroll naturally, but header/context/table order stays intact.
- Verify remaining-height fill, vertical and horizontal scroll ownership, sticky columns, toolbar,
  state messages, focus, row actions, pagination, and safe long-text rendering.

## Code reference

Inspect `src/components/customizabaleTable/index.tsx` and `types.ts`. Locate a current comparable
workspace under the owning module; do not use the missing legacy classManagement reference in
DESIGN.md as a reason to invent an API or treat a stale path as verified.
