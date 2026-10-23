import { vi, it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import { BulkPipelineCounsellor } from './bulk-pipeline-counsellor';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

import type { useBulkPipelineCounsellor } from './use-bulk-pipeline-counsellor';

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));

const state = () =>
  ({
    selectedRows: [{ id: 'one' }, { id: 'two' }],
    selectedIds: ['one', 'two'],
    eligibleIds: ['one', 'two'],
    busy: false,
    loadingOptions: false,
    assigning: false,
    progress: null,
    dialogOpen: false,
    counsellors: [{ id: 'owner-1', name: 'Jay Dalia', userName: 'jay' }],
    optionsError: null,
    failures: [],
    outcome: null,
    clearSelection: vi.fn(),
    requestAssignment: vi.fn(),
    reloadOptions: vi.fn(),
    confirmAssignment: vi.fn(),
    closeDialog: vi.fn(),
    toggleSelection: vi.fn(),
    toggleAll: vi.fn(),
  }) as unknown as ReturnType<typeof useBulkPipelineCounsellor>;

describe('Pipeline bulk counsellor UI', () => {
  it('shows page-scoped selection and opens the ownership action', async () => {
    const assignment = state();
    const user = userEvent.setup();
    renderDocumentUi(<BulkPipelineCounsellor assignment={assignment} disabled={false} />);
    expect(screen.getByRole('status')).toHaveTextContent('2 admissions selected on this page');
    await user.click(screen.getByRole('button', { name: 'Assign / change counsellor' }));
    expect(assignment.requestAssignment).toHaveBeenCalledOnce();
  });

  it('explains the linked inquiry/follow-up effect and submits the existing assignment input', async () => {
    const assignment = { ...state(), dialogOpen: true };
    const user = userEvent.setup();
    renderDocumentUi(<BulkPipelineCounsellor assignment={assignment} disabled={false} />);
    expect(screen.getByRole('dialog', { name: 'Assign / change counsellor' })).toBeVisible();
    expect(
      screen.getByText(/If an inquiry is linked, it and its scheduled follow-ups/)
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    await user.click(screen.getByRole('combobox', { name: 'Counsellor' }));
    await user.click(screen.getByRole('option', { name: 'Jay Dalia' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Reason for change (optional)' }), {
      target: { value: 'Coverage change' },
    });
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(assignment.confirmAssignment).toHaveBeenCalledWith({
        counsellorId: 'owner-1',
        reason: 'Coverage change',
      })
    );
  });

  it('displays a useful common-owner empty state and prevents submission', () => {
    renderDocumentUi(
      <BulkPipelineCounsellor
        assignment={{ ...state(), dialogOpen: true, counsellors: [] }}
        disabled={false}
      />
    );
    expect(
      screen.getByText('No counsellor has access to all selected admissions.', { exact: false })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  });

  it('shows the options failure with retry and prevents submission', async () => {
    const assignment = {
      ...state(),
      dialogOpen: true,
      optionsError: 'Eligible staff could not be loaded.',
    };
    const user = userEvent.setup();
    renderDocumentUi(<BulkPipelineCounsellor assignment={assignment} disabled={false} />);
    expect(screen.getByText('Eligible staff could not be loaded.', { exact: false })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(assignment.reloadOptions).toHaveBeenCalledOnce();
    expect(screen.getByRole('combobox', { name: 'Counsellor' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('locks close, fields and competing actions while assigning and reports progress', () => {
    const assignment = {
      ...state(),
      dialogOpen: true,
      busy: true,
      assigning: true,
      progress: { completed: 1, total: 2 },
    };
    renderDocumentUi(<BulkPipelineCounsellor assignment={assignment} disabled={false} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^close$/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Counsellor' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.getByRole('status')).toHaveTextContent('Assigning 1 of 2 admissions');
  });

  it('keeps partial failure reasons and selected failures available for retry', () => {
    const assignment = {
      ...state(),
      selectedRows: [{ id: 'two' }] as ReturnType<typeof state>['selectedRows'],
      selectedIds: ['two'],
      outcome: { total: 2, assigned: 1, unchanged: 0, failed: 1 },
      failures: [
        { id: 'two', name: 'Kabir Shah', message: 'Another user changed this admission.' },
      ],
    };
    renderDocumentUi(<BulkPipelineCounsellor assignment={assignment} disabled={false} />);
    expect(
      screen.getByText('1 assigned, 1 could not be assigned of 2 selected admissions.', {
        exact: false,
      })
    ).toBeVisible();
    expect(screen.getByText('Kabir Shah: Another user changed this admission.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Assign / change counsellor' })).toBeEnabled();
  });

  it('guards a dirty ownership form using the existing discard dialog', async () => {
    const assignment = { ...state(), dialogOpen: true };
    const user = userEvent.setup();
    renderDocumentUi(<BulkPipelineCounsellor assignment={assignment} disabled={false} />);
    await user.type(
      screen.getByRole('textbox', { name: 'Reason for change (optional)' }),
      'Pending reason'
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(assignment.closeDialog).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Discard counsellor change?' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(assignment.closeDialog).toHaveBeenCalledOnce();
  });

  it('does not add an empty toolbar', () => {
    renderDocumentUi(
      <BulkPipelineCounsellor
        assignment={{ ...state(), selectedRows: [], selectedIds: [] }}
        disabled={false}
      />
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('disables bulk initiation during an external table loading/error state', () => {
    renderDocumentUi(<BulkPipelineCounsellor assignment={state()} disabled />);
    expect(screen.getByRole('button', { name: 'Assign / change counsellor' })).toBeDisabled();
  });
});
