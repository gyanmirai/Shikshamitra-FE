import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { vi, it, expect, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';

import CopyFeeStructureDialog from './CopyFeeStructureDialog';

const state = vi.hoisted(() => ({
  save: vi.fn(),
  retry: vi.fn(),
  copied: vi.fn(),
  close: vi.fn(),
  busy: vi.fn(),
  policiesRetry: vi.fn(),
  policies: { currentData: [] as any[], isError: false, isFetching: false },
  query: { currentData: [] as any[], isError: false, isLoading: false, isFetching: false },
}));
vi.mock('src/redux/finance/feeStructureWorkspace', () => ({
  useGetStructureCopySourcesQuery: () => ({ ...state.query, refetch: state.retry }),
  useSaveStructureDraftMutation: () => [state.save],
  useGetStructureCopyPoliciesQuery: () => ({ ...state.policies, refetch: state.policiesRetry }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <svg aria-hidden="true" /> }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
  state.policies = { currentData: [], isError: false, isFetching: false };
  state.query = {
    currentData: [
      {
        standardId: 'class-1',
        className: 'Class 1',
        structure: {
          id: 'source-1',
          name: 'Annual fees',
          revisionNumber: 1,
          concurrencyStamp: 'source',
          feeHeads: [{ id: 'line', feeHeadId: 'head', amount: 1234.56, installmentOverrides: [] }],
        },
      },
      {
        standardId: 'class-2',
        className: 'Class 2',
        structure: { id: 'source-2', name: 'Bus fees', revisionNumber: 2, feeHeads: [] },
      },
    ],
    isError: false,
    isLoading: false,
    isFetching: false,
  };
  state.save.mockReturnValue({
    unwrap: async () => ({ id: 'copied', name: 'Annual fees (copy)' }),
  });
});
afterEach(cleanup);

function setup() {
  const store = configureStore({
    reducer: { confirmPopup: (value = { isChanges: true }) => value },
  });
  render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <CopyFeeStructureDialog
          feeStructureMetadataId="metadata"
          standardId="class-2"
          classes={[
            { id: 'class-1', name: 'Class 1' },
            { id: 'class-2', name: 'Class 2' },
          ]}
          existingNames={['Annual fees']}
          onClose={state.close}
          onCopied={state.copied}
          onBusyChange={state.busy}
        />
      </ThemeProvider>
    </Provider>
  );
  return store;
}
function selectSource() {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /Source fee structure/ }));
  fireEvent.click(screen.getByRole('option', { name: 'Annual fees' }));
}

it('validates source selection and displays a searchable class → structure hierarchy', async () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('Select a fee structure to copy.')).toBeVisible();
  expect(state.save).not.toHaveBeenCalled();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: /Source fee structure/ }));
  const list = screen.getByRole('listbox');
  expect(within(list).getByText('Class 1')).toBeVisible();
  expect(within(list).getByText('Class 2')).toBeVisible();
  fireEvent.change(screen.getByRole('textbox', { name: 'Search Source fee structure' }), {
    target: { value: 'Class 2' },
  });
  expect(screen.queryByRole('option', { name: 'Annual fees' })).toBeNull();
  expect(screen.getByRole('option', { name: 'Bus fees' })).toBeVisible();
});

it('copies into the active class with fresh identities and preserves the parent dirty state', async () => {
  const store = setup();
  selectSource();
  expect(screen.getByRole('textbox', { name: /Structure name/ })).toHaveValue('Annual fees (copy)');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(state.copied).toHaveBeenCalledWith({ id: 'copied', name: 'Annual fees (copy)' })
  );
  const body = state.save.mock.calls[0][0];
  expect(body).toMatchObject({
    feeStructureMetadataId: 'metadata',
    standardId: 'class-2',
    standardFeeStructures: {
      name: 'Annual fees (copy)',
      saveAsDraft: true,
      feeHeads: [{ feeHeadId: 'head', amount: 1234.56 }],
    },
  });
  expect(body.requestId).toMatch(/^[\da-f-]{36}$/i);
  expect(body.standardFeeStructures.feeHeads[0]).not.toHaveProperty('id');
  expect(body.standardFeeStructures).not.toHaveProperty('concurrencyStamp');
  expect(store.getState().confirmPopup.isChanges).toBe(true);
});

it('preserves values after failure and reuses the request ID for an unchanged retry', async () => {
  setup();
  state.save.mockReturnValueOnce({
    unwrap: async () => {
      throw Object.assign(new Error('Connection lost'), { data: { detail: 'Connection lost' } });
    },
  });
  selectSource();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('Connection lost')).toBeVisible();
  expect(screen.getByRole('textbox', { name: /Structure name/ })).toHaveValue('Annual fees (copy)');
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(state.copied).toHaveBeenCalled());
  expect(state.save.mock.calls[0][0].requestId).toBe(state.save.mock.calls[1][0].requestId);
});

it('locks submission, close and cancel while copying and blocks duplicate requests', async () => {
  let resolve!: (record: any) => void;
  state.save.mockReturnValue({
    unwrap: () =>
      new Promise((done) => {
        resolve = done;
      }),
  });
  setup();
  selectSource();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(state.save).toHaveBeenCalledTimes(1));
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
  fireEvent.submit(document.getElementById('copy-fee-structure-form')!);
  expect(state.save).toHaveBeenCalledTimes(1);
  resolve({ id: 'copied' });
  await waitFor(() => expect(state.copied).toHaveBeenCalled());
});

it('shows load errors with retry and distinguishes an empty medium', () => {
  state.query.isError = true;
  setup();
  expect(screen.getByText(/could not be loaded/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(state.retry).toHaveBeenCalledOnce();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  cleanup();
  state.query.isError = false;
  state.query.currentData = [];
  setup();
  expect(screen.getByText(/No saved fee structures/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
});

it('guards dirty cancellation without consuming the parent workspace edits', async () => {
  const store = setup();
  selectSource();
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(await screen.findByRole('dialog', { name: /Discard unsaved changes/ })).toBeVisible();
  expect(state.close).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /Keep editing/i }));
  expect(screen.getByRole('textbox', { name: /Structure name/ })).toHaveValue('Annual fees (copy)');
  expect(store.getState().confirmPopup.isChanges).toBe(true);
});

it('shows the actual stale linked policy and selects its current version without modifying the source', async () => {
  const source = state.query.currentData[0].structure;
  Object.assign(source, { refundPolicyId: 'refund', refundPolicyVersionId: 'refund-v1' });
  state.policies.currentData = [
    {
      family: 'refund',
      policyId: 'refund',
      policyName: 'School Refund',
      sourceVersionId: 'refund-v1',
      sourceVersionNumber: 1,
      currentVersionId: 'refund-v3',
      currentVersionNumber: 3,
      error: null,
    },
  ];
  setup();
  selectSource();
  expect(screen.getByText('Refund Policy: School Refund')).toBeVisible();
  expect(screen.getByText('Source snapshot: v1 · Current version: v3')).toBeVisible();
  expect(screen.getByText('Selected for copy: v3')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(state.copied).toHaveBeenCalledOnce());
  expect(state.save.mock.calls[0][0].standardFeeStructures.refundPolicyVersionId).toBe('refund-v3');
  expect(source.refundPolicyVersionId).toBe('refund-v1');
});

it('explains retirement of a legacy concession attachment and copies without requiring its unavailable version', async () => {
  Object.assign(state.query.currentData[0].structure, {
    concessionPolicyId: 'legacy',
    concessionPolicyVersionId: 'legacy-v1',
  });
  state.policies.currentData = [
    {
      family: 'concession',
      policyId: 'legacy',
      policyName: 'Legacy concession',
      sourceVersionId: 'legacy-v1',
      sourceVersionNumber: 1,
      currentVersionId: null,
      currentVersionNumber: null,
      error: 'This policy is inactive.',
    },
  ];
  setup();
  selectSource();
  expect(
    screen.getByText(/Legacy attachment; new structures use concession request policies/)
  ).toBeVisible();
  expect(screen.queryByText(/Selected for copy/)).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(state.copied).toHaveBeenCalledOnce());
  expect(state.save.mock.calls[0][0].standardFeeStructures).toMatchObject({
    concessionPolicyId: null,
    concessionPolicyVersionId: null,
    concessionFeeHeadScope: 'EntireFeeStructure',
    concessionApplicableFeeHeadIds: [],
  });
});

it.each(['inactive', 'missing', 'loading', 'failed'])(
  'blocks copying when linked policy check is %s and offers refresh',
  async (problem) => {
    Object.assign(state.query.currentData[0].structure, {
      refundPolicyId: 'refund',
      refundPolicyVersionId: 'refund-v1',
    });
    state.policies.currentData = [
      {
        family: 'refund',
        policyId: 'refund',
        policyName: 'School Refund',
        sourceVersionId: 'refund-v1',
        sourceVersionNumber: 1,
        currentVersionId: null,
        currentVersionNumber: 2,
        error: 'This policy is inactive.',
      },
    ];
    if (problem === 'loading') state.policies.isFetching = true;
    if (problem === 'failed') state.policies.isError = true;
    if (problem === 'missing') state.policies.currentData = [];
    setup();
    selectSource();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    fireEvent.submit(document.getElementById('copy-fee-structure-form')!);
    await waitFor(() => expect(state.save).not.toHaveBeenCalled());
    if (problem !== 'loading') {
      fireEvent.click(screen.getByRole('button', { name: 'Refresh and select current versions' }));
      expect(state.policiesRetry).toHaveBeenCalledOnce();
    }
  }
);

it('keeps the named version error and entered values when the policy changes during submission', async () => {
  Object.assign(state.query.currentData[0].structure, {
    refundPolicyId: 'refund',
    refundPolicyVersionId: 'refund-v1',
  });
  state.policies.currentData = [
    {
      family: 'refund',
      policyId: 'refund',
      policyName: 'School Refund',
      sourceVersionId: 'refund-v1',
      sourceVersionNumber: 1,
      currentVersionId: 'refund-v2',
      currentVersionNumber: 2,
      error: null,
    },
  ];
  state.save.mockReturnValueOnce({
    unwrap: async () => {
      throw Object.assign(new Error('Policy version changed'), {
        data: {
          error: {
            data: {
              Errors: [
                'Refund Policy "School Refund": selected snapshot v2; current active version v3. Refresh and select the current policy version before copying or attaching it.',
              ],
            },
          },
        },
      });
    },
  });
  setup();
  selectSource();
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText(/selected snapshot v2; current active version v3/)).toBeVisible();
  expect(state.copied).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox', { name: /Structure name/ })).toHaveValue('Annual fees (copy)');
  fireEvent.click(screen.getByRole('button', { name: 'Refresh and select current versions' }));
  expect(state.policiesRetry).toHaveBeenCalledOnce();
});
