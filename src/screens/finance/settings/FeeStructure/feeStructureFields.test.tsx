import React from 'react';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

import FeeStructureWorkspaceCard from './Components/FeeStructureWorkspaceCard';

const state = vi.hoisted(() => ({ lookups: {} as any, mutate: vi.fn() }));
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
vi.mock('src/components/custom-tabs', () => ({
  CustomTabs: ({ children, onChange }: any) => (
    <div>
      {React.Children.map(children, (child: any) =>
        React.cloneElement(child, {
          onClick: () => onChange(undefined, child.props.value),
        })
      )}
    </div>
  ),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
// Keep these tests focused on the editor's row interactions and request gating.
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, columns }: any) => (
    <div>
      {data.map((row: any) => (
        <div key={row._id}>
          {columns.map((column: any) => (
            <div key={column.id}>
              {column.render ? column.render(row[column.id], row) : row[column.id]}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));
vi.mock('src/components/three-dots-actions', () => ({ default: () => null }));

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
const catalog = { ready: true, loading: false, error: false, retry: vi.fn() };
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
  state.mutate.mockClear();
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
    catalogs: { collection: catalog, refund: catalog, proration: catalog },
    termDetail: {},
  };
});

async function addHead() {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Add Fee Head' }));
  fireEvent.click(await screen.findByRole('option', { name: 'Tuition' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add head' }));
}

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
  fireEvent.click(screen.getByRole('tab', { name: /Policies/i }));
  expect(screen.getByRole('combobox', { name: 'Collection Policy' })).toBeTruthy();
  expect(screen.getByRole('combobox', { name: 'Proration Policy' })).toBeTruthy();
  expect(screen.getByRole('combobox', { name: 'Refund Policy' })).toBeTruthy();
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
  expect(screen.getByRole('checkbox', { name: 'Optional' })).toBeTruthy();
  const select = screen.getByRole('combobox', { name: /Payment Term/ });
  await waitFor(() => expect(select.textContent).toContain('Monthly'));
  expect(select.getAttribute('aria-disabled')).not.toBe('true');
  expect(screen.queryByRole('tab', { name: /All Fee Heads/ })).toBeNull();
  const amount = screen.getByRole('spinbutton', { name: 'Tuition total fee' }) as HTMLInputElement;
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
  fireEvent.change(screen.getByRole('spinbutton', { name: 'Tuition total fee' }), {
    target: { value: '90' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  expect(state.mutate).not.toHaveBeenCalled();
  state.lookups.terms = { ...catalog };
  state.lookups.settings = { ...state.lookups.settings, terms: [term] };
  view.rerender(ui());
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: /Payment Term/ }).textContent).toContain('Monthly')
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
  const select = screen.getByRole('combobox', { name: /Payment Term/ });
  expect(select.textContent).toContain('Old monthly');
  expect(select.getAttribute('aria-disabled')).not.toBe('true');
  fireEvent.mouseDown(select);
  const option = await screen.findByRole('option', { name: 'Monthly · v1 · Default' });
  expect(option.getAttribute('aria-disabled')).not.toBe('true');
  fireEvent.click(option);
  expect(select.textContent).toContain('Monthly · v1 · Default');
});
