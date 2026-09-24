# ShikshaMitra FE implementation patterns

This reference preserves the repository-specific component, hook, form, and RTK Query guidance.
Use it together with the surface-specific UI rulebook selected by the skill router.

This project has one established way to build a CRUD screen. Before writing a new screen, dialog,
table, or form — or editing an existing one — check this skill and follow the existing pattern
instead of inventing a new one or pulling in a different library.

Gold-standard reference file (uses almost every pattern below in one place):
`src/screens/academic/academic-calendar-management/emergencyClosure/index.tsx`

## Workflow

1. Identify which patterns the task touches (table? dialog? form? new API slice?) using the table
   below.
2. Open the referenced source file(s) to copy the current shape — types and props drift, so trust
   the live file over this doc if they disagree.
3. Reuse the shared component/hook. Do not build a bespoke table, dialog, toast, or confirm popup.
4. If a screen needs a genuinely new pattern, prefer extending the shared component
   (`components/customizabaleTable`, `components/customDialog`, etc.) over a one-off local version.

| Concern | Component / hook | Path |
|---|---|---|
| Page header + breadcrumb | `CustomBreadcrumbs` | `src/components/custom-breadcrumbs` |
| Data table | `CustomizableTable` | `src/components/customizabaleTable` |
| Modal / dialog shell | `CustomDialog`, `DialogScrollContent` | `src/components/customDialog` |
| Confirm popup | `ConfirmDialog` | `src/components/confirm-dialog` |
| Notifications | `shikshaMitraToast` | `src/components/toast` |
| Forms | `formik` + `yup` | (npm packages, no wrapper) |
| Loading action button | `LoadingButton` | `@mui/lab` |
| Boolean/dialog-open state | `useBoolean` | `src/hooks/use-boolean` |
| RTK base api | `api` | `src/redux/service.ts` |
| RTK per-module api | `injectEndpoints` on a `xModuleApi` | `src/redux/<module>/<module>ModuleApi.ts` |

---

## 1. Screen layout & section spacing

Every screen root is a `Box` with a vertical flex column and a small, consistent gap — do not use
ad-hoc margins between sections:

```tsx
<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
  <CustomBreadcrumbs sx={{ mb: 1 }} ... />
  {/* optional Alert for permission/empty states */}
  <CustomizableTable ... />
  <CustomDialog ... />
  <ConfirmDialog ... />
</Box>
```

Recurring spacing conventions across screens (match these, don't reinvent):
- Root screen gap: `gap: 1`. Breadcrumb: `sx={{ mb: 1 }}`.
- Card/Paper sections inside dialogs: `variant="outlined"`, `sx={{ p: 2, borderRadius: 2 }}`
  (use `p: 1.5, borderRadius: 1` for denser info cards).
- Form field grids: MUI `Grid` v2 (`size={{ xs, sm }}`) with `spacing={1}`, fields are `size="small"`
  and `fullWidth`.
- Dialog content padding comes from `DialogScrollContent` (`p: 2`); don't add outer padding again.
- `DialogActions` gets `sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}`.
- Table cards: `borderRadius: 2`, `border: 1px solid theme.palette.divider`.

## 2. Breadcrumbs — `CustomBreadcrumbs`

```tsx
<CustomBreadcrumbs
  heading="Emergency Closure"
  description="Optional one-line explainer, shown as an info tooltip next to the heading."
  links={[
    { name: 'Academics', href: '/academic/dashboard' },
    { name: 'Academic Calendar', href: '/academic/academicCalendarDashboard' },
    { name: 'Emergency Closure' }, // last item: no href = current page, not a link
  ]}
  action={<Button variant="contained" onClick={addDialog.onTrue}>Declare Closure</Button>}
/>
```
- `links` is breadcrumb trail root→leaf; the last entry normally has no `href`.
- `action` is the top-right primary button (create/add), gate it on permission with `disabled`.
- `isBack` + `onBack` renders a back icon button instead of/alongside the heading.

## 3. Table — `CustomizableTable`

Always define `columns: IColumn[]` (from `src/components/customizabaleTable/types`) — this is the
"column configuration" the user should reach for, not a hand-rolled MUI `Table`.

Best-practice column config:
```tsx
const columns: IColumn[] = [
  {
    id: 'title',                // maps to a row key (supports lodash-style path via _.get)
    label: 'Title',
    filterType: 'string',       // 'string' | 'number' | 'date' | 'dateTime' | 'enum' | 'formattedNumber'
    isFilter: true,
    minWidth: 280,
    render: (value, row) => <Typography variant="body2">{value}</Typography>,
  },
  {
    id: 'status',
    label: 'Status',
    filterType: 'enum',
    enumOptions: Object.entries(STATUS_LABELS).map(([value, label]) => ({ label, value: Number(value) })),
    align: 'center',
    sticky: true,                // pins the column (use on status/actions columns)
    render: (value) => <Label color={statusColor[value]}>{STATUS_LABELS[value]}</Label>,
  },
  {
    id: 'actions',
    label: 'Actions',
    align: 'center',
    sticky: true,
    isSort: false,
    isFilter: false,             // never filterable/sortable/exported
    excludeFromExport: true,
    render: (_, row) => <Stack direction="row" gap={0.5}>{/* icon buttons */}</Stack>,
  },
];
```
Column rules:
- Give every filterable/sortable column a `filterType`; set `isFilter: false`/`isSort: false` on
  computed or action columns.
- `sticky: true` on the last 1–2 columns (status/actions) so they stay visible on horizontal scroll.
- `excludeFromExport: true` on columns that only make sense on-screen (action buttons, avatars).
- Use `render(value, row)` for all custom cell content; never mutate `data` to pre-format it.

Table usage:
```tsx
<CustomizableTable
  tableId="emergency-closure-table"   // stable, unique per screen — used for localStorage column prefs
  isLoading={isLoading}               // wire straight from the RTK Query hook
  isPagination isSearch isFilter
  columns={columns}
  data={tableData}
  noDataText={<CustomEmptyState .../>}
/>
```
- Client-side paging/sort/search/filter is the default (`serverSide*` props off). Only turn on
  `serverSidePagination`/`serverSideSearch`/`serverSideSort`/`serverSideFilter` (+ the matching
  `onServer*` callback) when the API is paginated server-side — see
  `screens/finance/FeeCollection` for a server-side example.
- `tableId` doubles as the persisted-column-visibility key; never reuse one `tableId` for two
  different tables.

## 4. Dialogs — `CustomDialog`

```tsx
<CustomDialog open={addDialog.value} handleClose={closeAddDialog} title="Declare Closure" maxWidth="md">
  <DialogScrollContent>
    <Grid container spacing={1}>{/* form fields */}</Grid>
  </DialogScrollContent>
  <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
    <Button variant="outlined" size="small" onClick={closeAddDialog} disabled={creating}>Cancel</Button>
    <LoadingButton variant="contained" size="small" loading={creating} onClick={(e) => formik.handleSubmit(e)}>
      Save
    </LoadingButton>
  </DialogActions>
</CustomDialog>
```
- `handleClose` receives `(event, reason)`; it already blocks `backdropClick` from closing and
  prompts via the `confirmPopup` redux slice when `isChanges` is true — don't re-implement
  "unsaved changes" confirmation yourself, dispatch `setIsChanges(true)` from `formik`'s
  `onChange`/`enableReinitialize` flow if the dialog needs it.
- Content always goes inside `DialogScrollContent` (adds the scrollbar + consistent padding), not
  a raw `DialogContent`.
- Pair `open`/close state with `useBoolean()`, not raw `useState<boolean>`.

### Dialog-with-form structure (the standard CRUD add/edit pattern)

1. `const addDialog = useBoolean();` + one `useFormik` per dialog.
2. One state var for edit-vs-create, e.g. `const [editingId, setEditingId] = useState<string | null>(null)`.
3. `handleEditClick(row)` calls `formik.setValues(...)`, sets the id, opens the dialog.
4. `closeAddDialog()` calls `addDialog.onFalse()` **and** `formik.resetForm()` **and** clears the
   edit id — always do all three together so stale values don't leak into the next "Add".
5. `formik.onSubmit` branches on the edit id to call the create vs update mutation, then on success:
   `shikshaMitraToast.success(...)`, `helpers.resetForm()`, clear edit id, close dialog. On failure:
   `shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to ...' })`.
6. The submit button is a `LoadingButton` wired to the mutation's `isLoading`, and calls
   `formik.handleSubmit(e)` on click (buttons live in `DialogActions`, outside the scrollable
   content, so they can't submit via native form `onSubmit`).

## 5. Confirm dialogs — `ConfirmDialog`

Prefer the controlled component (`src/components/confirm-dialog`) driven by `useBoolean` — this is
the dominant pattern in the codebase. Only reach for the `useConfirmDialog()` hook
(`src/hooks/use-confirm-dialog.tsx`, promise-based) for one-off imperative confirms outside a
component's normal render flow; it's rare and not the default.

```tsx
const cancelDialog = useBoolean();
const [selected, setSelected] = useState<Row | null>(null);

<ConfirmDialog
  open={cancelDialog.value}
  onClose={cancelDialog.onFalse}
  title="Cancel Closure"
  content={<>Are you sure you want to cancel <strong>{selected?.title}</strong>?</>}
  action={
    <LoadingButton loading={cancelling} variant="contained" color="error" size="small" onClick={handleCancel}>
      Cancel Closure
    </LoadingButton>
  }
/>
```
`icon` prop defaults to `'error'`; pass `'warning' | 'success' | 'info'` for non-destructive
confirms. The Cancel button and dialog chrome are built-in — only pass `action` for the confirm
button.

## 6. Toast — `shikshaMitraToast`

```tsx
import { shikshaMitraToast } from 'src/components/toast';

shikshaMitraToast.success({ message: 'Emergency closure declared successfully' });
shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to save emergency closure' });
shikshaMitraToast.warning({ message: '...' });
shikshaMitraToast.info({ message: '...' });
shikshaMitraToast.promise(promise, { pending: 'Saving...', success: 'Saved', error: 'Failed' });
```
Always read the error message off the RTK error shape (`err?.data?.detail`) with a fallback
string — never surface a raw thrown error object. Don't call `sonner`'s `toast` directly in screen
code; go through this wrapper so styling stays consistent.

## 7. Forms — Formik + Yup

**This project uses Formik, not React Hook Form.** `src/components/hook-form/*` exists but is
legacy/near-unused (3 files vs 485+ using Formik) — do not build new forms on it.

```tsx
const schema = Yup.object().shape({
  title: Yup.string().min(3, 'Title must be at least 3 characters').required('Title is required'),
  standardIds: Yup.array().when('appliesToAll', {
    is: false,
    then: (schema) => schema.min(1, 'Select at least one class'),
    otherwise: (schema) => schema,
  }),
});

const formik = useFormik({
  initialValues: { title: '', appliesToAll: true, standardIds: [] as string[] },
  validationSchema: schema,
  onSubmit: async (values, helpers) => {
    try {
      await createThing(values).unwrap();
      shikshaMitraToast.success({ message: 'Saved' });
      helpers.resetForm();
      addDialog.onFalse();
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.detail || 'Failed to save' });
    }
  },
});
```
Field wiring convention for a plain MUI `TextField`:
```tsx
<TextField
  fullWidth size="small" label="Title *" name="title"
  value={formik.values.title}
  onChange={formik.handleChange}
  onBlur={formik.handleBlur}
  error={formik.touched.title && Boolean(formik.errors.title)}
  helperText={formik.touched.title && formik.errors.title}
/>
```
For non-native inputs (date pickers, custom selects) use `formik.setFieldValue('field', val)`
directly instead of `onChange={formik.handleChange}`. Use `Yup.mixed().test(...)`/`.when(...)` for
cross-field validation instead of validating in the submit handler.

## 8. RTK structure

Three layers, don't collapse them:

1. **Global base api** — `src/redux/service.ts`: one `createApi` (`reducerPath: 'api'`) with the
   shared `fetchBaseQuery`, auth header injection, 401 handling, and the combined `tagTypes` list
   from `src/redux/tagTypes.ts`. Don't create a second `createApi` unless it's a genuinely separate
   backend (see `openLibraryApi` in `redux/library/LibraryDataSearch` for the one exception, wired
   separately into `store.ts`).
2. **Per-module api** — `src/redux/<module>/<module>ModuleApi.ts`, e.g.
   `financeModuleApi = api.injectEndpoints({ endpoints: () => ({}) })`. This is just a typed
   namespace to `injectEndpoints` into; add one per top-level module (finance, academic, library…).
3. **Per-feature endpoints** — `src/redux/<module>/<feature>/<feature>-api.ts` (or `<feature>.ts`)
   calls `xModuleApi.injectEndpoints({ endpoints: (builder) => ({...}) })` with `overrideExisting: true`,
   defines request/response types alongside the endpoints, and exports the generated hooks.

```ts
export const feeCollectionApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeeCollectionList: builder.query<PagedResult<Item>, Params>({
      query: (params) => ({ url: FEE_COLLECTION_V2_BASE_URL, method: 'GET', params }),
      providesTags: [financeModuleType.feeCollection],
    }),
    collectFee: builder.mutation<Output, Input>({
      query: (body) => ({ url: FEE_COLLECTION_V2_BASE_URL, method: 'POST', body }),
      invalidatesTags: [financeModuleType.feeCollection, financeModuleType.feeDetails],
    }),
  }),
  overrideExisting: true,
});

export const { useGetFeeCollectionListQuery, useCollectFeeMutation } = feeCollectionApi;
```
- Tag names come from `src/redux/tagTypes.ts` (one flat `const` object per module, e.g.
  `financeModuleType`, `academicType`) — add new tags there, never inline string literals for tags.
- Mutations that change a feature's data must `invalidatesTags` everything a screen reads
  (list + detail + any derived audit/summary tag), or the table won't refresh after save.

## 9. Query hooks & API loading

Call the generated hooks directly in the screen — there is no extra data-fetching wrapper layer:

```tsx
const { data, isLoading } = useGetEmergencyClosuresQuery(
  { academicYearId: currentYear?.id, skipCount: 0, maxResultCount: 200 },
  { skip: !currentYear?.id }               // always skip when a required id/filter isn't ready yet
);
const [createThing, { isLoading: creating }] = useCreateEmergencyClosureMutation();
```
Loading conventions:
- Table loading: pass the query's `isLoading` straight to `CustomizableTable`'s `isLoading` prop
  (renders `TableBody`'s built-in skeleton) — don't build a separate spinner over the table.
- Action loading: pass a mutation's `isLoading` to `LoadingButton`'s `loading` prop, and also
  `disabled` the sibling Cancel button so users can't dismiss mid-submit.
- Full-page/route loading uses `src/components/loading-screen` (`LoadingScreen`/`SplashScreen`) —
  used at layout/suspense boundaries, not inside a normal screen body.
- Always destructure `isLoading`/`isFetching` by name per call (`isLoading: creating`,
  `isLoading: cancelling`) when a screen has more than one mutation, so they don't collide.

## 10. Common hooks

Check `src/hooks/` before writing local `useState`/`useEffect` boilerplate:

| Hook | Use for |
|---|---|
| `use-boolean` | Any open/closed, on/off flag — dialogs, toggles, expand/collapse |
| `use-debounce` | Debouncing a search input before firing a query |
| `use-local-storage` | Persisting a simple value across sessions |
| `use-set-state` | Merging partial updates into an object state |
| `use-responsive` | Breakpoint-based conditional rendering |
| `use-copy-to-clipboard` | Copy-to-clipboard actions |
| `use-confirm-dialog` | Promise-based imperative confirm (rare — prefer `ConfirmDialog` component, see §5) |
| `useConfirmWithUndo` | Destructive action with an "Undo" toast window instead of a confirm dialog |
| `use-keyboard-shortcuts` | Global/screen keyboard shortcuts |

Don't copy one of these hooks' logic inline into a screen — import it.
