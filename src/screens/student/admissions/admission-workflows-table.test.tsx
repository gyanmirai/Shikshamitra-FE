import type { ComponentProps } from 'react';
import type CustomizableTable from 'src/components/customizabaleTable';

import { render } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import AdmissionWorkflowsScreen from './admission-workflows';

const hooks = vi.hoisted(() => ({
  query: vi.fn(),
  table: vi.fn(),
  update: vi.fn(),
  currentData: undefined as
    { items: { id: string; name: string }[]; totalCount: number } | undefined,
  oldData: { items: [{ id: 'old', name: 'Other scope' }], totalCount: 1 },
  fetching: false,
  error: false,
  version: '',
}));

vi.mock('src/redux/student/admissions/admission-workflows-api', () => ({
  useGetAdmissionWorkflowsQuery: (params: unknown) => {
    hooks.query(params);
    return {
      data: hooks.oldData,
      currentData: hooks.currentData,
      isLoading: false,
      isFetching: hooks.fetching,
      isError: hooks.error,
      refetch: vi.fn(),
    };
  },
}));
vi.mock('./workflow-list/use-workflow-filters', () => ({
  useWorkflowFilters: () => ({
    filters: {
      search: '',
      status: 'all',
      version: hooks.version,
      usage: 'all',
      page: 2,
      rowsPerPage: 10,
      columnFilters: '',
    },
    update: hooks.update,
    clear: vi.fn(),
  }),
}));
vi.mock('./workflow-list/use-workflow-list-actions', () => ({
  useWorkflowListActions: () => ({
    allowed: { canCreate: true },
    createDialog: { value: false },
    createCloseRef: { current: null },
  }),
}));
vi.mock('./workflow-list/workflow-columns', () => ({
  STATUS_LABELS: { 0: 'Draft' },
  createWorkflowColumns: () => [],
}));
vi.mock('./workflow-list/workflow-list-filters', () => ({ WorkflowListFilters: () => null }));
vi.mock('./workflow-list/workflow-list-dialogs', () => ({ WorkflowListDialogs: () => null }));
vi.mock('./admission-query-error', () => ({ AdmissionQueryError: () => null }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: ComponentProps<typeof CustomizableTable>) => {
    hooks.table(props);
    return null;
  },
}));

describe('Admission stage server table', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hooks.currentData = undefined;
    hooks.fetching = false;
    hooks.error = false;
    hooks.version = '';
  });

  it('submits all header filters to the server while preserving explicit Draft status', () => {
    render(<AdmissionWorkflowsScreen />);
    const table = hooks.table.mock.lastCall![0];
    expect(table).toMatchObject({ serverSideFilter: true, serverSideSort: true, isFilter: true });
    table.onServerFilter([
      { column: 'name', type: 'contains', value: 'Spring', valueType: 'string' },
      { column: 'status', type: 'equals', value: 0, valueType: 'enum' },
    ]);
    expect(hooks.update).toHaveBeenLastCalledWith({
      status: 0,
      version: '',
      columnFilters: '[{"column":"name","type":"contains","value":"Spring","valueType":"string"}]',
    });
    table.onServerSort('offeringCount', [{ column: 'offeringCount', direction: 'desc' }]);
    expect(hooks.update).toHaveBeenLastCalledWith({ sorting: 'offeringCount desc' });
    table.onServerSort('status', [
      { column: 'status', originalId: 'statusLabel', direction: 'asc' },
    ]);
    expect(hooks.update).toHaveBeenLastCalledWith({ sorting: 'statusLabel' });
  });

  it('synchronizes the advanced version equality and header numeric predicates', () => {
    hooks.version = '2';
    render(<AdmissionWorkflowsScreen />);
    const table = hooks.table.mock.lastCall![0];
    expect(table.filters).toContainEqual(
      expect.objectContaining({ column: 'version', type: 'equals', value: 2 })
    );
    table.onServerFilter([
      { column: 'version', type: 'greaterThan', value: 3, valueType: 'number' },
    ]);
    expect(hooks.update).toHaveBeenLastCalledWith({
      status: 'all',
      version: '',
      columnFilters: '[{"column":"version","type":"greaterThan","value":3,"valueType":"number"}]',
    });
    table.onServerFilter([{ column: 'version', type: 'equals', value: 4, valueType: 'number' }]);
    expect(hooks.update).toHaveBeenLastCalledWith({
      status: 'all',
      version: '4',
      columnFilters: '',
    });
  });

  it('does not show previous arguments rows while the new query loads or fails', () => {
    hooks.fetching = true;
    const { rerender } = render(<AdmissionWorkflowsScreen />);
    expect(hooks.table.mock.lastCall![0]).toMatchObject({ data: [], isLoading: true });
    hooks.fetching = false;
    hooks.error = true;
    rerender(<AdmissionWorkflowsScreen />);
    const table = hooks.table.mock.lastCall![0];
    expect(table.data).toEqual([]);
    expect(table.errorContent).toBeTruthy();
  });

  it('preserves current rows during refresh and refresh failure', () => {
    hooks.currentData = { items: [{ id: 'safe', name: 'Current scope' }], totalCount: 1 };
    hooks.fetching = true;
    const { rerender } = render(<AdmissionWorkflowsScreen />);
    expect(hooks.table.mock.lastCall![0]).toMatchObject({
      data: hooks.currentData.items,
      isLoading: false,
      isRefreshing: true,
    });
    hooks.fetching = false;
    hooks.error = true;
    rerender(<AdmissionWorkflowsScreen />);
    expect(hooks.table.mock.lastCall![0]).toMatchObject({
      data: hooks.currentData.items,
      errorContent: undefined,
    });
  });
});
