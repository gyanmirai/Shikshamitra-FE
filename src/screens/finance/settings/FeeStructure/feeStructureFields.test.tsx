import React from 'react';
import { createPortal } from 'react-dom';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, within, waitFor, cleanup, fireEvent } from '@testing-library/react';

import { structureCandidate } from './feeStructureModel';
import FeeStructureWorkspaceCard from './Components/FeeStructureWorkspaceCard';

const state = vi.hoisted(() => ({
  lookups: {} as any,
  mutate: vi.fn(),
  policyToast: vi.fn(),
  mobile: false,
}));
vi.mock('src/hooks/use-responsive', () => ({
  useResponsive: (query: string, breakpoint: string) =>
    state.mobile && query === 'down' && breakpoint === 'sm',
}));
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
vi.mock('src/components/iconify/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
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
  default: ({ title, children }: any) =>
    createPortal(
      <div role="dialog" aria-label={title}>
        <h2>{title}</h2>
        {children}
      </div>,
      document.body
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
  state.mobile = false;
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
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /Fee head/ }));
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
  expect(screen.getByRole('button', { name: 'Review & continue' })).toBeDisabled();
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
  expect(screen.getByRole('button', { name: 'Review & continue' })).not.toBeDisabled();
  expect(screen.queryByText('Collection Policy is required')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Change Collection Policy' }));
  fireEvent.click(screen.getByRole('button', { name: 'Remove Collection Policy' }));
  expect(screen.getByText('Collection Policy is required')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Review & continue' })).toBeDisabled();
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
  expect(screen.queryByRole('heading', { name: 'Policy coverage' })).toBeNull();
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
  await screen.findByRole('heading', { name: 'Policy coverage' });
  expect(screen.queryByText('All configuration checks passed.')).toBeNull();
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

it('keeps a new fee head local until its required fields are valid', async () => {
  render(ui());
  await addHead();
  const dialog = screen.getByRole('dialog', { name: 'Add Fee Head' });
  expect(within(dialog).getByRole('combobox', { name: /Payment frequency/ }).textContent).toContain(
    'Monthly'
  );
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Enter the total fee for this Fee Head.')).toBeTruthy();
  expect(state.mutate).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Edit Tuition' })).toBeNull();
  fireEvent.change(within(dialog).getByRole('textbox', { name: /Annual amount/ }), {
    target: { value: '1200' },
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  await screen.findByRole('button', { name: 'Edit Tuition' });
  expect(screen.queryByRole('dialog', { name: 'Add Fee Head' })).toBeNull();
  expect(screen.getByText('Total annual amount')).toBeTruthy();
  expect(state.mutate).not.toHaveBeenCalled();
});

it('requires a payment frequency and defaults it when published terms finish loading', async () => {
  state.lookups.settings.terms = [];
  state.lookups.terms = { ...catalog, ready: true, loading: false };
  const view = render(ui());
  await addHead();
  fireEvent.change(screen.getByRole('textbox', { name: /Annual amount/ }), {
    target: { value: '90' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Select a published payment frequency.')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Edit Tuition' })).toBeNull();
  state.lookups.terms = { ...catalog };
  state.lookups.settings = { ...state.lookups.settings, terms: [term] };
  view.rerender(ui());
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: /Payment frequency/ }).textContent).toContain(
      'Monthly'
    )
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await screen.findByRole('button', { name: 'Edit Tuition' });
});

const savedHead = (overrides = {}) => ({
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
  ...overrides,
});
const savedRecord = (head = savedHead()) => ({
  ...structureCandidate(),
  id: 'saved',
  name: 'Saved fees',
  status: 1,
  revisionNumber: 1,
  feeHeads: [head],
});

it('shows field-specific row errors after validation and carries them into Edit until corrected', async () => {
  state.lookups.settings.heads.push({ id: 'transport', name: 'Transport' });
  const record = savedRecord(
    savedHead({ amount: null, paymentTermId: null, paymentTermVersionId: 'monthly-v1' })
  );
  record.feeHeads.push(
    savedHead({
      id: 'transport-line',
      feeHeadId: 'transport',
      feeHeadName: 'Transport',
      paymentTermId: null,
      paymentTermVersionId: null,
      paymentTermName: null,
    })
  );
  render(ui(record));
  const amount = screen.getByRole('group', { name: 'Annual amount for Tuition' });
  const frequency = screen.getByRole('group', { name: 'Payment frequency for Tuition' });
  const transportFrequency = screen.getByRole('group', { name: 'Payment frequency for Transport' });
  expect(amount).toHaveAttribute('data-invalid', 'false');
  expect(frequency).toHaveAttribute('data-invalid', 'false');
  fireEvent.click(screen.getByRole('button', { name: 'Edit draft' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save & continue' }));
  await waitFor(() => expect(amount).toHaveAttribute('data-invalid', 'true'));
  expect(amount).toHaveAccessibleDescription('Enter the total fee for this Fee Head.');
  expect(frequency).toHaveAccessibleDescription(
    'Select a published Payment Term for this Fee Head.'
  );
  expect(transportFrequency).toHaveAccessibleDescription(
    'Select a published Payment Term for this Fee Head.'
  );
  expect(screen.getByRole('group', { name: 'Annual amount for Transport' })).toHaveAttribute(
    'data-invalid',
    'false'
  );
  await waitFor(() => expect(document.activeElement).toBe(amount));
  expect(state.mutate).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Edit Tuition' }));
  const dialog = within(screen.getByRole('dialog', { name: 'Edit Fee Head' }));
  expect(await dialog.findByText('Enter the total fee for this Fee Head.')).toBeTruthy();
  expect(dialog.getByText('Select a published payment frequency.')).toBeTruthy();
  fireEvent.change(dialog.getByRole('textbox', { name: /Annual amount/ }), {
    target: { value: '2500' },
  });
  fireEvent.mouseDown(dialog.getByRole('combobox', { name: /Payment frequency/ }));
  fireEvent.click(await screen.findByRole('option', { name: 'Monthly · v1 · Default' }));
  fireEvent.click(dialog.getByRole('button', { name: /^Save$/ }));
  await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit Fee Head' })).toBeNull());
  expect(amount).toHaveAttribute('data-invalid', 'false');
  expect(frequency).toHaveAttribute('data-invalid', 'false');
  expect(transportFrequency).toHaveAttribute('data-invalid', 'true');
  expect(screen.getByText('Monthly')).toBeTruthy();
  expect(state.mutate).not.toHaveBeenCalled();
});

it('keeps labelled row errors visible under the fee-head name on mobile', async () => {
  state.mobile = true;
  render(ui(savedRecord(savedHead({ paymentTermId: null, paymentTermVersionId: null }))));
  fireEvent.click(screen.getByRole('button', { name: 'Edit draft' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  const errors = await screen.findByRole('group', { name: 'Errors for Tuition' });
  expect(
    within(errors).getByText(
      'Payment frequency: Select a published Payment Term for this Fee Head.'
    )
  ).toBeVisible();
  await waitFor(() => expect(document.activeElement).toBe(errors));
  expect(state.mutate).not.toHaveBeenCalled();
});

it('shows the structure name error alongside row errors without sending an invalid draft', async () => {
  render(ui({ ...savedRecord(savedHead({ paymentTermId: null })), name: '' }));
  fireEvent.click(screen.getByRole('button', { name: 'Edit draft' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  expect(await screen.findByText('Enter a name for this Fee Structure.')).toBeTruthy();
  expect(screen.getByRole('textbox', { name: /Structure name/ })).toHaveAttribute(
    'aria-invalid',
    'true'
  );
  expect(screen.getByRole('group', { name: 'Payment frequency for Tuition' })).toHaveAttribute(
    'data-invalid',
    'true'
  );
  expect(state.mutate).not.toHaveBeenCalled();
});

it('edits a retained payment-term pin and permits cached terms after refresh failure', async () => {
  state.lookups.terms = { ...catalog, error: true, ready: false };
  render(ui(savedRecord()));
  fireEvent.click(screen.getByRole('button', { name: 'Edit draft' }));
  fireEvent.click(screen.getByRole('button', { name: 'Edit Tuition' }));
  const select = screen.getByRole('combobox', { name: /Payment frequency/ });
  expect(select.textContent).toContain('Old monthly');
  expect(select.getAttribute('aria-disabled')).not.toBe('true');
  fireEvent.mouseDown(select);
  fireEvent.click(await screen.findByRole('option', { name: 'Monthly · v1 · Default' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit Fee Head' })).toBeNull());
  expect(screen.getByText('Monthly')).toBeTruthy();
});

it('saves variable pricing with null amount while retaining frequency and optionality', async () => {
  render(ui());
  fireEvent.change(screen.getByRole('textbox', { name: /Structure name/i }), {
    target: { value: 'Variable fees' },
  });
  await addHead();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Optional fee head' }));
  fireEvent.click(screen.getByRole('switch', { name: 'Set amount during student assignment' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await screen.findByRole('button', { name: 'Edit Tuition' });
  state.mutate.mockReturnValue({
    unwrap: () => Promise.resolve({ id: 'saved', name: 'Variable fees', status: 1, feeHeads: [] }),
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  await waitFor(() => expect(state.mutate).toHaveBeenCalledTimes(1));
  expect(state.mutate.mock.calls[0][0].standardFeeStructures.feeHeads[0]).toMatchObject({
    isVariable: true,
    amount: null,
    isOptional: true,
    paymentTermId: 'monthly',
    paymentTermVersionId: 'monthly-v1',
  });
});

it('requires a new fixed price after switching variable pricing off', async () => {
  render(ui());
  await addHead();
  fireEvent.change(screen.getByRole('textbox', { name: /Annual amount/ }), {
    target: { value: '999' },
  });
  fireEvent.click(screen.getByRole('switch', { name: 'Set amount during student assignment' }));
  fireEvent.click(screen.getByRole('switch', { name: 'Set amount during student assignment' }));
  expect(screen.getByRole('textbox', { name: /Annual amount/ })).toHaveValue('');
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('Enter the total fee for this Fee Head.')).toBeTruthy();
});

it.each(['0', '12.25'])(
  'preserves a configured amount of %s through row and draft saves',
  async (amount) => {
    render(ui());
    fireEvent.change(screen.getByRole('textbox', { name: /Structure name/i }), {
      target: { value: 'Annual fees' },
    });
    await addHead();
    fireEvent.change(screen.getByRole('textbox', { name: /Annual amount/ }), {
      target: { value: amount },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByRole('button', { name: 'Edit Tuition' });
    state.mutate.mockReturnValue({
      unwrap: () =>
        Promise.resolve({ ...structureCandidate(), id: 'saved', name: 'Annual fees', status: 1 }),
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(state.mutate).toHaveBeenCalledTimes(1));
    expect(state.mutate.mock.calls[0][0].standardFeeStructures.feeHeads[0].amount).toBe(
      Number(amount)
    );
  }
);

it('excludes fee heads already configured from the Add dropdown', async () => {
  render(ui(savedRecord()));
  fireEvent.click(screen.getByRole('button', { name: 'Edit draft' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add fee head' }));
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /Fee head/ }));
  expect(screen.queryByRole('option', { name: 'Tuition' })).toBeNull();
  expect(await screen.findByText('All available fee heads have been added.')).toBeTruthy();
});

it('cancels an edited row without modifying the parent draft and confirms deletion', async () => {
  render(ui(savedRecord()));
  fireEvent.click(screen.getByRole('button', { name: 'Edit draft' }));
  fireEvent.click(screen.getByRole('button', { name: 'Edit Tuition' }));
  fireEvent.change(screen.getByRole('textbox', { name: /Annual amount/ }), {
    target: { value: '999' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  const discard = await screen.findByRole('dialog', { name: 'Discard unsaved changes?' });
  fireEvent.click(within(discard).getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('textbox', { name: /Annual amount/ }).getAttribute('value')).not.toBe(
    '100'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(
    within(await screen.findByRole('dialog', { name: 'Discard unsaved changes?' })).getByRole(
      'button',
      { name: 'Discard changes' }
    )
  );
  await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit Fee Head' })).toBeNull());
  expect(screen.getAllByText(/100/).length).toBeGreaterThan(0);
  fireEvent.click(screen.getByRole('button', { name: 'Delete Tuition' }));
  expect(screen.getByRole('button', { name: 'Edit Tuition', hidden: true })).toBeTruthy();
  fireEvent.click(
    within(await screen.findByRole('dialog', { name: 'Delete Fee Head?' })).getByRole('button', {
      name: 'Delete fee head',
    })
  );
  expect(screen.queryByRole('button', { name: 'Edit Tuition' })).toBeNull();
  expect(state.mutate).not.toHaveBeenCalled();
});

it('confirms replacing customized installments only when a new payment frequency is saved', async () => {
  render(
    ui(
      savedRecord(
        savedHead({ scheduleMode: 'Customized', installmentOverrides: [{ name: 'custom' }] })
      )
    )
  );
  fireEvent.click(screen.getByRole('button', { name: 'Edit draft' }));
  fireEvent.click(screen.getByRole('button', { name: 'Edit Tuition' }));
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /Payment frequency/ }));
  fireEvent.click(await screen.findByRole('option', { name: 'Monthly · v1 · Default' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  const replace = await screen.findByRole('dialog', { name: 'Replace Customized Schedule?' });
  expect(screen.getByText('Edit Fee Head', { exact: true })).toBeTruthy();
  fireEvent.click(within(replace).getByRole('button', { name: 'Replace schedule' }));
  await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Edit Fee Head' })).toBeNull());
  expect(screen.queryByText('Version 1 · Customized installments')).toBeNull();
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

const checklistCollection = {
  family: 'collection',
  id: 'collection',
  versionId: 'collection-v1',
  name: 'School Collection Policy',
  versionNumber: 1,
  isCurrent: true,
  isDefault: false,
};

function checklistSetup() {
  Object.assign(state.lookups.settings.permissions, {
    collection: true,
    collectionRead: true,
    refund: true,
    refundRead: true,
  });
  state.lookups.settings.policies = [checklistCollection];
  state.lookups.catalogs.collection = {
    ...catalog,
    items: [
      {
        id: 'collection',
        currentVersionId: 'collection-v1',
        enableLateFee: true,
        lateFeeApplyOnFeeHeads: ['tuition'],
      },
    ],
  };
  return {
    ...savedRecord(),
    collectionPolicyId: 'collection',
    collectionPolicyVersionId: 'collection-v1',
  };
}

it('shows the policy checklist with exact-version coverage and opens its coverage view', async () => {
  render(ui(checklistSetup()));
  fireEvent.click(screen.getByRole('button', { name: /^Step 2: Policies$/i }));
  expect(screen.getByRole('heading', { name: 'Your policies are ready' })).toBeTruthy();
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.getByText('School Collection Policy')).toBeTruthy();
  expect(screen.getByText('1 of 1 fee head has late fees')).toBeTruthy();
  expect(screen.getByText('No refund policy attached')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Change Collection Policy' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'View Collection Policy fee head impact' }));
  const details = await screen.findByRole('dialog', { name: 'School Collection Policy · v1' });
  expect(within(details).getByText('Late fee applies')).toBeTruthy();
});

it('replaces the ready checklist state with a warning for a refund policy with no matching heads', () => {
  const record = checklistSetup();
  state.lookups.settings.policies.push({
    family: 'refund',
    id: 'refund',
    versionId: 'refund-v1',
    name: 'Transport refund',
    versionNumber: 1,
    isCurrent: true,
  });
  state.lookups.catalogs.refund = {
    ...catalog,
    items: [
      {
        id: 'refund',
        currentVersionId: 'refund-v1',
        feeHeadScope: 'SelectedFeeHeads',
        applicableFeeHeadIds: ['transport'],
      },
    ],
  };
  render(ui({ ...record, refundPolicyId: 'refund', refundPolicyVersionId: 'refund-v1' }));
  fireEvent.click(screen.getByRole('button', { name: /^Step 2: Policies$/i }));
  expect(screen.getByRole('heading', { name: 'Check your policy selections' })).toBeTruthy();
  expect(screen.queryByText('Your policies are ready')).toBeNull();
  expect(
    screen.getByText(
      'No matching fee heads. Choose another refund policy or remove it before publishing.'
    )
  ).toBeTruthy();
  expect(screen.getByRole('button', { name: 'View Refund Policy fee head impact' })).toBeTruthy();
});

it('keeps retained policy pins visible without inventing coverage when their exact version is unavailable', () => {
  const record = checklistSetup();
  state.lookups.catalogs.collection = {
    ...catalog,
    items: [
      {
        id: 'collection',
        currentVersionId: 'collection-v2',
        enableLateFee: true,
        lateFeeApplyOnFeeHeads: ['tuition'],
      },
    ],
  };
  render(ui(record));
  fireEvent.click(screen.getByRole('button', { name: /^Step 2: Policies$/i }));
  expect(screen.getByText('School Collection Policy')).toBeTruthy();
  expect(screen.getByText('Coverage details unavailable')).toBeTruthy();
  expect(screen.queryByText('1 of 1 fee head has late fees')).toBeNull();
  expect(state.mutate).not.toHaveBeenCalled();
});

it('preserves authorized policy removal without permission to browse replacements', () => {
  const record = checklistSetup();
  state.lookups.settings.permissions.collectionRead = false;
  render(ui(record));
  fireEvent.click(screen.getByRole('button', { name: 'Edit draft' }));
  fireEvent.click(screen.getByRole('button', { name: /^Step 2: Policies$/i }));
  expect(screen.getByRole('button', { name: 'Change Collection Policy' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Remove Collection Policy' }));
  expect(screen.getByText('Collection Policy is required')).toBeTruthy();
  expect(state.mutate).not.toHaveBeenCalled();
});
