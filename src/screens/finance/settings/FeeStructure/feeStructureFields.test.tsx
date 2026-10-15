import React from 'react';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, within, waitFor, cleanup, fireEvent } from '@testing-library/react';

import { structureCandidate } from './feeStructureModel';
import FeeStructureWorkspaceCard from './Components/FeeStructureWorkspaceCard';

const state = vi.hoisted(() => ({ lookups: {} as any, mutate: vi.fn(), policyToast: vi.fn() }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: state.policyToast, error: vi.fn() },
}));
vi.mock('./hooks/useFeeStructureLookups', () => ({ default: () => state.lookups }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => [state.mutate, { isLoading: false }],
}));
vi.mock('src/redux/finance/feeStructureWorkspace', () => ({
  useSaveStructureDraftMutation: vi.fn(),
  usePreviewStructureMutation: vi.fn(),
  usePublishStructureMutation: vi.fn(),
  useReviseStructureMutation: vi.fn(),
}));
vi.mock('src/redux/finance/financeFeeStructure', () => ({
  useDeleteClassWiseFeeStructureMutation: vi.fn(),
}));
vi.mock('./Components/StructureScheduleDialog', () => ({ default: () => null }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
// Keep these tests focused on the editor's row interactions and request gating.
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, columns }: any) => (
    <div>
      {data.map((row: any) => (
        <div key={row._id}>
          {columns.map((column: any) => (
            <div key={column.id}>
              {column.render ? column.render(row[column.id] ?? '-', row) : row[column.id]}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));
vi.mock('src/components/adaptive-three-dots-actions', () => ({
  default: ({ actions }: any) => (
    <div>
      {actions.map((action: any) => (
        <button key={action.id} type="button" disabled={action.disabled} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </div>
  ),
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ title, children }: any) => (
    <div role="dialog" aria-label={title}>
      {children}
    </div>
  ),
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));

const term = {
  id: 'monthly',
  versionId: 'monthly-v1',
  name: 'Monthly',
  versionNumber: 1,
  isDefault: true,
  isCurrent: true,
  demandGenerationRule: '',
  installments: [],
};
const catalog = { items: [], ready: true, loading: false, error: false, retry: vi.fn() };
const initialData = {
  name: '',
  classId: 'class',
  feeStructureMetaDataId: 'metadata',
  feeHeads: [],
  status: 1,
};
const theme = createTheme(defaultSettings);
const ui = (record?: any) => (
  <ThemeProvider theme={theme}>
    <FeeStructureWorkspaceCard index={0} initialData={{ ...initialData, record }} />
  </ThemeProvider>
);

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
  state.mutate.mockReset();
  state.policyToast.mockReset();
  state.lookups = {
    settings: {
      academicYearId: 'year',
      boardId: 'board',
      className: 'Class 1',
      academicYearName: '2026-27',
      heads: [{ id: 'tuition', name: 'Tuition' }],
      terms: [term],
      policies: [],
      permissions: { add: true, edit: true, termsRead: true, headsRead: true },
    },
    context: { isLoading: false, isFetching: false, isError: false },
    heads: { isFetching: false, isError: false },
    terms: { ...catalog },
    catalogs: { collection: catalog, refund: catalog },
    termDetail: {},
  };
});

async function addHead() {
  fireEvent.click(screen.getByRole('button', { name: 'Add fee head' }));
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Select fee head' }));
  fireEvent.click(await screen.findByRole('option', { name: 'Tuition' }));
  expect(screen.queryByRole('button', { name: 'Add Head' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Edit Fee Head' })).toBeNull();
}

async function chooseCollection(name: string) {
  fireEvent.click(screen.getByRole('button', { name: /^(Select|Change) Collection Policy$/ }));
  fireEvent.click(await screen.findByRole('button', { name: `Select ${name} version 1` }));
}

it('blocks Next and direct Review when collection is missing while allowing incomplete draft saves', () => {
  render(ui());
  fireEvent.click(screen.getByRole('button', { name: /^Step 2: Policies$/i }));
  expect(screen.getByText('Collection Policy is required')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Save & continue' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Save draft' })).not.toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: /^Step 3: Review & publish$/i }));
  expect(screen.getByRole('button', { name: /^Step 2: Policies$/i })).toHaveAttribute(
    'aria-current',
    'step'
  );
  expect(state.mutate).not.toHaveBeenCalled();
});

it('validates clearing collection immediately and keeps refund optional', async () => {
  Object.assign(state.lookups.settings.permissions, { collection: true, collectionRead: true });
  state.lookups.settings.policies = [
    {
      family: 'collection',
      id: 'collection',
      versionId: 'collection-v1',
      name: 'Collection',
      versionNumber: 1,
      isDefault: false,
    },
  ];
  render(ui());
  fireEvent.click(screen.getByRole('button', { name: /^Step 2: Policies$/i }));
  await chooseCollection('Collection');
  expect(state.policyToast).toHaveBeenCalledTimes(1);
  expect(state.policyToast).toHaveBeenCalledWith({
    message: 'Collection Policy added to this draft.',
  });
  expect(screen.getByRole('button', { name: 'Save & continue' })).not.toBeDisabled();
  expect(screen.queryByText('Collection Policy is required')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Remove Collection Policy' }));
  expect(screen.getByText('Collection Policy is required')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Save & continue' })).toBeDisabled();
});

it('resumes a saved structure at its scoped saved navigation step', () => {
  window.localStorage.setItem(
    'fee-structure-progress:metadata:class:saved',
    JSON.stringify('policies')
  );
  render(
    ui({ ...structureCandidate(), id: 'saved', name: 'Saved fees', status: 1, revisionNumber: 1 })
  );
  expect(screen.getByRole('button', { name: /^Step 2: Policies$/i })).toHaveAttribute(
    'aria-current',
    'step'
  );
  expect(screen.getByRole('button', { name: 'Select Collection Policy' })).toBeTruthy();
});

it('returns an incomplete saved draft to Policies when its stored progress points to Review', () => {
  window.localStorage.setItem(
    'fee-structure-progress:metadata:class:saved',
    JSON.stringify('review')
  );
  render(
    ui({ ...structureCandidate(), id: 'saved', name: 'Saved fees', status: 1, revisionNumber: 1 })
  );
  expect(screen.getByText('Collection Policy is required')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: /^Step 3: Review & publish$/i }));
  expect(screen.getByRole('button', { name: /^Step 2: Policies$/i })).toHaveAttribute(
    'aria-current',
    'step'
  );
  expect(state.mutate).not.toHaveBeenCalled();
});

it('ignores an outstanding preview when a newer saved structure arrives', async () => {
  Object.assign(state.lookups.settings.permissions, { publish: true });
  let resolvePreview!: (value: any) => void;
  state.mutate.mockReturnValueOnce({
    unwrap: () =>
      new Promise((resolve) => {
        resolvePreview = resolve;
      }),
  });
  const record = {
    ...structureCandidate(),
    id: 'saved',
    name: 'Original fees',
    collectionPolicyVersionId: 'collection-v1',
    status: 1,
    revisionNumber: 1,
    concurrencyStamp: 'old',
  };
  const view = render(ui(record));
  fireEvent.click(screen.getByRole('button', { name: /^Step 3: Review & publish$/i }));
  view.rerender(ui({ ...record, name: 'Refreshed fees', concurrencyStamp: 'new' }));
  await act(async () => {
    resolvePreview({ isReady: true, errors: [], warnings: [], coverage: [], schedules: [] });
  });
  expect(screen.queryByText('All configuration checks passed.')).toBeNull();
  expect(screen.getByRole('button', { name: 'Publish structure' })).toBeDisabled();
});

it('keeps the current step and entered name when Save & next fails', async () => {
  state.mutate.mockReturnValue({
    unwrap: () =>
      Promise.reject(Object.assign(new Error('Save failed'), { data: { detail: 'Save failed' } })),
  });
  render(ui());
  fireEvent.change(screen.getByRole('textbox', { name: /Structure name/i }), {
    target: { value: 'Annual fees' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save & continue' }));
  await waitFor(() => expect(state.mutate).toHaveBeenCalledTimes(1));
  expect(screen.getByRole('textbox', { name: /Structure name/i })).toHaveValue('Annual fees');
  expect(screen.getByRole('button', { name: /^Step 1: Fee heads & terms$/i })).toHaveAttribute(
    'aria-current',
    'step'
  );
  expect(screen.queryByRole('combobox', { name: 'Collection Policy' })).toBeNull();
});

it('advances after a successful save and restores the canonical name when navigating back', async () => {
  state.mutate.mockReturnValue({
    unwrap: () =>
      Promise.resolve({
        ...structureCandidate(),
        id: 'saved',
        name: 'Annual fees (saved)',
        status: 1,
        revisionNumber: 1,
        concurrencyStamp: 'stamp',
      }),
  });
  render(ui());
  fireEvent.change(screen.getByRole('textbox', { name: /Structure name/i }), {
    target: { value: 'Annual fees' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save & continue' }));
  await screen.findByRole('button', { name: 'Select Collection Policy' });
  expect(screen.getByRole('button', { name: /^Step 2: Policies$/i })).toHaveAttribute(
    'aria-current',
    'step'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByRole('textbox', { name: /Structure name/i })).toHaveValue(
    'Annual fees (saved)'
  );
  expect(state.mutate).toHaveBeenCalledTimes(1);
});

it('preserves unsaved input while freely visiting policies and returning with Back', async () => {
  render(ui());
  fireEvent.change(screen.getByRole('textbox', { name: /Structure name/i }), {
    target: { value: 'Unsaved school fees' },
  });
  fireEvent.click(screen.getByRole('button', { name: /^Step 2: Policies$/i }));
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByRole('textbox', { name: /Structure name/i })).toHaveValue(
    'Unsaved school fees'
  );
  expect(state.mutate).not.toHaveBeenCalled();
});

it('saves the selected collection policy before allowing review and publication of the saved draft', async () => {
  const record = {
    ...structureCandidate(),
    id: 'saved',
    name: 'Annual fees',
    concurrencyStamp: 'stamp-1',
    status: 1,
    revisionNumber: 1,
  };
  const policy = {
    id: '3a23b6a9-b5c6-d770-f6b3-0a6beef1e6ad',
    versionId: '3a23b6a9-b871-f152-9cb7-077f2314db92',
    family: 'collection',
    name: 'collection prerna policy',
    versionNumber: 1,
    isCurrent: true,
  };
  state.lookups.settings.policies = [policy];
  Object.assign(state.lookups.settings.permissions, {
    publish: true,
    collection: true,
    collectionRead: true,
  });
  const saved = {
    ...record,
    collectionPolicyId: policy.id,
    collectionPolicyVersionId: policy.versionId,
    concurrencyStamp: 'stamp-2',
  };
  const ready = {
    isReady: true,
    candidate: structureCandidate(saved),
    errors: [],
    warnings: [],
    coverage: [],
    schedules: [],
  };
  render(ui(record));
  const publishButton = () =>
    screen.getByRole('button', { name: 'Publish structure' }) as HTMLButtonElement;
  expect(screen.queryByRole('button', { name: 'Publish structure' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /^Step 2: Policies$/i }));
  expect(screen.getByRole('button', { name: 'Select Collection Policy' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Edit draft' }));
  await chooseCollection('collection prerna policy');
  expect(screen.queryByRole('button', { name: 'Publish structure' })).toBeNull();
  // Reviewing unsaved input must not permit publishing the older server record.
  state.mutate.mockReturnValueOnce({ unwrap: () => Promise.resolve(ready) });
  fireEvent.click(screen.getByRole('button', { name: /^Step 3: Review & publish$/i }));
  await screen.findByText('All configuration checks passed.');
  expect(publishButton().disabled).toBe(true);
  state.mutate.mockReturnValueOnce({ unwrap: () => Promise.resolve(saved) });
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Save draft' })).toBeNull());
  expect(state.mutate.mock.calls[1][0].changes).toEqual({
    policies: { collection: { policyId: policy.id, policyVersionId: policy.versionId } },
  });
  expect(publishButton().disabled).toBe(true);
  state.mutate.mockReturnValueOnce({ unwrap: () => Promise.resolve(ready) });
  fireEvent.click(screen.getByRole('button', { name: 'Check readiness' }));
  await waitFor(() => expect(publishButton().disabled).toBe(false));
  state.mutate.mockReturnValueOnce({ unwrap: () => Promise.resolve({ ...saved, status: 0 }) });
  fireEvent.click(publishButton());
  fireEvent.click(
    await screen
      .findByRole('dialog')
      .then((dialog) => within(dialog).getByRole('button', { name: 'Publish structure' }))
  );
  await waitFor(() => expect(state.mutate).toHaveBeenCalledTimes(4));
  expect(state.mutate.mock.calls[3][0]).toEqual({
    structureId: record.id,
    standardId: 'class',
    concurrencyStamp: 'stamp-2',
  });
});

it.each(['collection', 'collectionRead'])(
  'prevents policy selection without %s permission',
  (permission) => {
    Object.assign(state.lookups.settings.permissions, { collection: true, collectionRead: true });
    state.lookups.settings.permissions[permission] = false;
    render(ui());
    fireEvent.click(screen.getByRole('button', { name: /^Step 2: Policies$/i }));
    expect(screen.getByRole('button', { name: 'Select Collection Policy' })).toBeDisabled();
  }
);

it('offers only structure policies and preserves a legacy concession attachment when saving', async () => {
  const record = {
    id: 'saved',
    name: 'Saved fees',
    status: 1,
    revisionNumber: 1,
    feeHeads: [],
    concessionPolicyId: 'legacy',
    concessionPolicyVersionId: 'legacy-v1',
    concessionFeeHeadScope: 'SelectedFeeHeads',
    concessionApplicableFeeHeadIds: ['old-head'],
  };
  state.mutate.mockReturnValue({
    unwrap: () => Promise.resolve({ ...record, name: 'Renamed fees' }),
  });
  render(ui(record));
  fireEvent.click(screen.getByRole('button', { name: 'Edit draft' }));
  fireEvent.change(screen.getByRole('textbox', { name: /Structure name/i }), {
    target: { value: 'Renamed fees' },
  });
  fireEvent.click(screen.getByRole('button', { name: /^Step 2: Policies$/i }));
  expect(screen.getByRole('button', { name: 'Select Collection Policy' })).toBeTruthy();
  expect(screen.queryByRole('combobox', { name: 'Proration Policy' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Select Refund Policy' })).toBeTruthy();
  expect(
    screen.queryByText(/Concession Policy|Concession eligibility|Concession Fee Heads/)
  ).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  await waitFor(() => expect(state.mutate).toHaveBeenCalled());
  expect(state.mutate.mock.calls[0][0].changes).toEqual({ name: 'Renamed fees' });
  expect(state.mutate.mock.calls[0][0].standardFeeStructures.concessionPolicyVersionId).toBe(
    'legacy-v1'
  );
});

it('defaults a new row, keeps the selector enabled, and blocks a blank amount before any save request', async () => {
  render(ui());
  await addHead();
  expect(screen.queryByRole('checkbox', { name: /one.time/i })).toBeNull();
  expect(screen.getByRole('checkbox', { name: 'Tuition optional for students' })).toBeTruthy();
  const select = screen.getByRole('combobox', { name: /Payment term/ });
  await waitFor(() => expect(select.textContent).toContain('Monthly'));
  expect(select.getAttribute('aria-disabled')).not.toBe('true');
  expect(screen.queryByRole('tab', { name: /All Fee Heads/ })).toBeNull();
  const amount = screen.getByRole('textbox', {
    name: 'Tuition configured amount',
  }) as HTMLInputElement;
  expect(amount.required).toBe(true);
  expect(amount.value).toBe('');
  fireEvent.change(screen.getByRole('textbox', { name: /Structure name/i }), {
    target: { value: 'Annual fees' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  expect(await screen.findByText('Enter the total fee for this Fee Head.')).toBeTruthy();
  expect(state.mutate).not.toHaveBeenCalled();
});

it('requires a term, then fills the pending row when the published default arrives', async () => {
  state.lookups.settings.terms = [];
  state.lookups.terms = { ...catalog, ready: false, loading: true };
  const view = render(ui());
  fireEvent.change(screen.getByRole('textbox', { name: /Structure name/i }), {
    target: { value: 'Annual fees' },
  });
  await addHead();
  fireEvent.change(screen.getByRole('textbox', { name: 'Tuition configured amount' }), {
    target: { value: '90' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  expect(state.mutate).not.toHaveBeenCalled();
  state.lookups.terms = { ...catalog };
  state.lookups.settings = { ...state.lookups.settings, terms: [term] };
  view.rerender(ui());
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: /Payment term/ }).textContent).toContain('Monthly')
  );
  expect(screen.queryByText('Select a published Payment Term for this Fee Head.')).toBeNull();
});

it('preserves a saved older pin and permits choosing loaded terms after a failed refresh', async () => {
  state.lookups.terms = { ...catalog, error: true, ready: false };
  const record = {
    id: 'saved',
    name: 'Saved fees',
    status: 1,
    revisionNumber: 1,
    feeHeads: [
      {
        id: 'line',
        feeHeadId: 'tuition',
        feeHeadName: 'Tuition',
        amount: 100,
        isOneTime: true,
        isOptional: false,
        payableMonth: 0,
        payableYear: 0,
        paymentTermId: 'monthly',
        paymentTermVersionId: 'old-v1',
        paymentTermName: 'Old monthly',
        paymentTermVersionNumber: 1,
        scheduleMode: 'Inherited',
        installmentOverrides: [],
      },
    ],
  };
  render(ui(record));
  expect(screen.queryByRole('checkbox', { name: /one.time/i })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Edit draft' }));
  expect(screen.queryByRole('checkbox', { name: /one.time/i })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Edit Fee Head' })).toBeNull();
  const select = screen.getByRole('combobox', { name: /Payment term/ });
  expect(select.textContent).toContain('Old monthly');
  expect(select.getAttribute('aria-disabled')).not.toBe('true');
  fireEvent.mouseDown(select);
  const option = await screen.findByRole('option', { name: 'Monthly · v1 · Default' });
  expect(option.getAttribute('aria-disabled')).not.toBe('true');
  fireEvent.click(option);
  expect(select.textContent).toContain('Monthly · v1 · Default');
});

it('clears configured pricing for variable rows, retains terms and optionality, and requires a new fixed amount', async () => {
  render(ui());
  await addHead();
  fireEvent.change(screen.getByRole('textbox', { name: /Structure name/i }), {
    target: { value: 'Variable fees' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: 'Tuition configured amount' }), {
    target: { value: '999' },
  });
  fireEvent.click(screen.getByRole('checkbox', { name: 'Tuition optional for students' }));
  fireEvent.click(screen.getByRole('switch', { name: 'Tuition variable fee' }));
  expect(screen.queryByRole('textbox', { name: 'Tuition configured amount' })).toBeNull();
  expect(screen.getByRole('combobox', { name: /Payment term/ }).textContent).toContain('Monthly');
  expect(screen.getByRole('checkbox', { name: 'Tuition optional for students' })).toBeChecked();
  state.mutate.mockReturnValue({
    unwrap: () => Promise.resolve({ id: 'saved', name: 'Variable fees', status: 1, feeHeads: [] }),
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  await waitFor(() => expect(state.mutate).toHaveBeenCalledTimes(1));
  const row = state.mutate.mock.calls[0][0].standardFeeStructures.feeHeads[0];
  expect(row).toMatchObject({
    isVariable: true,
    amount: null,
    isOptional: true,
    paymentTermId: 'monthly',
    paymentTermVersionId: 'monthly-v1',
  });
});

it('does not restore an old fixed price after switching variable pricing off', async () => {
  render(ui());
  await addHead();
  fireEvent.change(screen.getByRole('textbox', { name: /Structure name/i }), {
    target: { value: 'Annual fees' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: 'Tuition configured amount' }), {
    target: { value: '999' },
  });
  fireEvent.click(screen.getByRole('switch', { name: 'Tuition variable fee' }));
  fireEvent.click(screen.getByRole('switch', { name: 'Tuition variable fee' }));
  expect(screen.getByRole('textbox', { name: 'Tuition configured amount' })).toHaveValue('');
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  expect(await screen.findByText('Enter the total fee for this Fee Head.')).toBeTruthy();
  expect(state.mutate).not.toHaveBeenCalled();
});

it('shows unpriced variable installments as entered at assignment even when the table supplies its null placeholder', async () => {
  Object.assign(state.lookups.settings.permissions, { collection: true, collectionRead: true });
  state.lookups.settings.policies = [
    {
      family: 'collection',
      id: 'collection',
      versionId: 'collection-v1',
      name: 'Collection',
      versionNumber: 1,
      isDefault: false,
    },
  ];
  render(ui());
  fireEvent.change(screen.getByRole('textbox', { name: /Structure name/i }), {
    target: { value: 'Variable fees' },
  });
  fireEvent.click(screen.getByRole('button', { name: /^Step 2: Policies$/i }));
  await chooseCollection('Collection');
  state.mutate.mockReturnValueOnce({
    unwrap: () =>
      Promise.resolve({
        isReady: true,
        candidate: { collectionPolicyVersionId: 'collection-v1' },
        errors: [],
        warnings: [],
        coverage: [],
        schedules: [
          {
            feeHeadId: 'tuition',
            feeHeadName: 'Tuition',
            paymentTermName: 'Monthly',
            versionNumber: 1,
            installments: [
              {
                sequence: 1,
                name: 'First',
                calculatedAmount: null,
                coverageStartDate: '2026-04-01',
                coverageEndDate: '2026-04-30',
                demandDate: '2026-04-01',
                dueDate: '2026-04-10',
              },
            ],
          },
        ],
      }),
  });
  fireEvent.click(screen.getByRole('button', { name: /^Step 3: Review & publish$/i }));
  expect(await screen.findByText('Calculated during assignment')).toBeTruthy();
  expect(screen.queryByText(/NaN/)).toBeNull();
});

it('keeps published policy and payment-term names from the saved snapshot after catalog renames', () => {
  state.lookups.settings.policies = [
    {
      family: 'collection',
      id: 'collection',
      versionId: 'collection-v1',
      name: 'Renamed Collection',
      versionNumber: 1,
    },
  ];
  const candidate = {
    ...structureCandidate(),
    name: 'Published fees',
    collectionPolicyId: 'collection',
    collectionPolicyVersionId: 'collection-v1',
    feeHeads: [
      {
        feeHeadId: 'tuition',
        feeHeadName: 'Tuition',
        amount: 100,
        isVariable: false,
        isOptional: false,
        isOneTime: false,
        payableMonth: 0,
        payableYear: 0,
        paymentTermId: 'monthly',
        paymentTermVersionId: 'monthly-v1',
        paymentTermName: 'Original monthly',
        paymentTermVersionNumber: 1,
        scheduleMode: 'Inherited',
        installmentOverrides: [],
      },
    ],
  };
  render(
    ui({
      ...candidate,
      id: 'published',
      status: 0,
      revisionNumber: 1,
      publicationReview: {
        candidate,
        policyLabels: { collection: 'Original Collection · v1' },
        isReady: true,
        errors: [],
        warnings: [],
        coverage: [
          {
            feeHeadId: 'tuition',
            name: 'Tuition',
            collection: 'No late fee',
            refund: 'Not attached',
            accounting: 'Ready',
          },
        ],
        schedules: [],
      },
    })
  );
  fireEvent.click(screen.getByRole('button', { name: /^Step 2: Policies$/i }));
  expect(screen.getByText('Original Collection · v1')).toBeTruthy();
  expect(screen.queryByText('Renamed Collection')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.queryByRole('button', { name: 'View Fee Head' })).toBeNull();
  expect(screen.getByText('Original monthly')).toBeTruthy();
  expect(screen.queryByRole('combobox', { name: /Payment term/ })).toBeNull();
  expect(screen.queryByText('Renamed monthly')).toBeNull();
});
