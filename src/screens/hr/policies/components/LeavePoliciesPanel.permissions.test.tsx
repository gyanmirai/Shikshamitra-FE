import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { hrLeavePolicyPermissions } from 'src/constants/hr-policy-permissions';

import { LeavePoliciesPanel } from './LeavePoliciesPanel';

const fixture = vi.hoisted(() => ({ archived: false, mutate: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/screens/hr/hooks/use-hr-table-export', () => ({ useHrTableExport: () => vi.fn() }));
vi.mock('src/screens/hr/hooks/use-hr-table-query', () => ({
  useHrTableQuery: () => ({
    currentData: {
      items: [
        {
          id: 'policy',
          policyTitle: 'Synthetic policy',
          status: fixture.archived ? 'Archived' : 'Active',
          rules: [{ paidType: 'Paid', leaveCount: 0, requiresApproval: true }],
        },
      ],
      totalCount: 1,
    },
    refetch: vi.fn(),
    tableProps: {},
  }),
}));
vi.mock('src/redux/hr/leaveApi', () => ({
  useGetLeavePoliciesQuery: () => ({ data: { totalCount: 1 } }),
  useDeleteLeavePolicyMutation: () => [fixture.mutate, { isLoading: false }],
  useUnarchiveLeavePolicyMutation: () => [fixture.mutate, { isLoading: false }],
  useSetDefaultLeavePolicyMutation: () => [fixture.mutate, { isLoading: false }],
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: any) => currentQueryAndMutation(),
}));
vi.mock('./LeaveYearEndSettlementsPanel', () => ({ LeaveYearEndSettlementsPanel: () => null }));
vi.mock('./LeavePolicyForm', () => ({ LeavePolicyForm: () => <span>Editable leave form</span> }));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data }: any) => (
    <div>{columns.find((column: any) => column.id === 'actions').render(null, data[0])}</div>
  ),
}));
vi.mock('src/components/three-dots-actions', () => ({
  default: ({ showEditIcon, handleEditClick, handleViewClick, actions }: any) => (
    <>
      <button type="button" onClick={handleViewClick}>
        View policy
      </button>
      {showEditIcon ? (
        <button type="button" onClick={handleEditClick}>
          Edit policy
        </button>
      ) : null}
      {actions({ popover: { onClose: vi.fn() } })}
    </>
  ),
}));

function setup(grants: string[]) {
  const store = configureStore({
    reducer: {
      confirmPopup,
      globalState: () => ({ currentYear: { id: 'year' } }),
      auth: () => ({ permissions: grants.map((name) => ({ name, isGranted: true })) }),
    },
  });
  return render(
    <Provider store={store}>
      <LeavePoliciesPanel />
    </Provider>
  );
}

beforeEach(() => {
  fixture.archived = false;
  fixture.mutate.mockReset();
});

describe('leave policy action grants', () => {
  it.each([
    [hrLeavePolicyPermissions.view, false, false, false, false],
    [hrLeavePolicyPermissions.create, true, false, false, false],
    [hrLeavePolicyPermissions.edit, false, true, false, false],
    [hrLeavePolicyPermissions.archive, false, false, true, false],
    [hrLeavePolicyPermissions.setDefault, false, false, false, true],
  ])('uses only the exact action granted by %s', (grant, create, edit, archive, setDefault) => {
    setup([hrLeavePolicyPermissions.view, String(grant)]);
    expect(Boolean(screen.queryByRole('button', { name: 'New Leave Policy' }))).toBe(create);
    expect(Boolean(screen.queryByRole('menuitem', { name: 'Duplicate' }))).toBe(create);
    expect(Boolean(screen.queryByRole('button', { name: 'Edit policy' }))).toBe(edit);
    expect(Boolean(screen.queryByRole('menuitem', { name: 'Archive' }))).toBe(archive);
    expect(Boolean(screen.queryByRole('menuitem', { name: 'Set as default' }))).toBe(setDefault);
    expect(fixture.mutate).not.toHaveBeenCalled();
  });

  it('lets view-only readers inspect saved rules separately from impact', () => {
    setup([hrLeavePolicyPermissions.view]);
    fireEvent.click(screen.getByRole('button', { name: 'View policy' }));
    expect(screen.getByText('Paid Rules')).toBeInTheDocument();
    expect(screen.getByText('Leave allocation: 0')).toBeInTheDocument();
    expect(screen.queryByText('Editable leave form')).not.toBeInTheDocument();
    expect(screen.queryByText('Staff: Not calculated')).not.toBeInTheDocument();
  });

  it.each([
    hrLeavePolicyPermissions.view,
    hrLeavePolicyPermissions.create,
    hrLeavePolicyPermissions.archive,
  ])('restores archived records only with the existing Delete/Archive grant: %s', (grant) => {
    fixture.archived = true;
    setup([hrLeavePolicyPermissions.view, grant]);
    expect(Boolean(screen.queryByRole('menuitem', { name: 'Restore as draft' }))).toBe(
      grant === hrLeavePolicyPermissions.archive
    );
    expect(screen.queryByRole('button', { name: 'Edit policy' })).not.toBeInTheDocument();
  });
});
