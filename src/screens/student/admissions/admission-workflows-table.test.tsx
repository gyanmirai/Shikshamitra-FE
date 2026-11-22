import type { ComponentProps } from 'react';
import type CustomizableTable from 'src/components/customizabaleTable';

import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, fireEvent } from '@testing-library/react';

import AdmissionWorkflowsScreen from './admission-workflows';

const hooks = vi.hoisted(() => ({
  query: vi.fn(),
  table: vi.fn(),
  columns: vi.fn(),
  usageQuery: vi.fn(),
  usagePanel: vi.fn(),
  navigate: vi.fn(),
  update: vi.fn(),
  clear: vi.fn(),
  currentData: undefined as
    { items: { id: string; name: string }[]; totalCount: number } | undefined,
  oldData: { items: [{ id: 'old', name: 'Other scope' }], totalCount: 1 },
  fetching: false,
  error: false,
  version: '',
  status: 'all' as 'all' | 0,
  usage: 'all' as 'all' | 'used',
  createdFrom: '',
  createdTo: '',
  pendingNavigationId: null as string | null,
  publishingId: null as string | null,
  creatingVersionId: null as string | null,
}));

vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));

vi.mock('src/redux/student/admissions/admission-workflows-api', () => ({
  useGetAdmissionWorkflowUsageQuery: (id: string, options: { skip: boolean }) => {
    hooks.usageQuery(id, options);
    return { currentData: undefined, isFetching: !options.skip, isError: false };
  },
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
  WORKFLOW_PAGE_SIZES: [10, 25, 50, 100],
  useWorkflowFilters: () => ({
    filters: {
      search: '',
      status: hooks.status,
      version: hooks.version,
      usage: hooks.usage,
      createdFrom: hooks.createdFrom,
      createdTo: hooks.createdTo,
      page: 2,
      rowsPerPage: 10,
      columnFilters: '',
    },
    update: hooks.update,
    clear: hooks.clear,
    clearFilters: vi.fn(),
  }),
}));
vi.mock('./workflow-list/use-workflow-list-actions', () => ({
  useWorkflowListActions: () => ({
    allowed: { canCreate: true, canViewUsage: true },
    createDialog: { value: false },
    cloneDialog: { value: false },
    createState: { isLoading: false },
    cloneState: { isLoading: false },
    archiveState: { isLoading: false },
    reopenState: { isLoading: false },
    deleteState: { isLoading: false },
    createCloseRef: { current: null },
    pendingNavigationId: hooks.pendingNavigationId,
    publishingId: hooks.publishingId,
    creatingVersionId: hooks.creatingVersionId,
    navigate: hooks.navigate,
  }),
}));
vi.mock('./workflow-list/workflow-columns', () => ({
  STATUS_LABELS: { 0: 'Draft' },
  createWorkflowColumns: (_permissions: unknown, handlers: unknown) => {
    hooks.columns(handlers);
    return [];
  },
}));
vi.mock('./workflow-builder/components/workflow-side-panel', () => ({
  WorkflowSidePanel: ({ onClose, ...props }: { onClose: () => void }) => {
    hooks.usagePanel(props);
    return (
      <button type="button" onClick={onClose}>
        Close usage
      </button>
    );
  },
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
    hooks.status = 'all';
    hooks.usage = 'all';
    hooks.createdFrom = '';
    hooks.createdTo = '';
    hooks.pendingNavigationId = null;
    hooks.publishingId = null;
    hooks.creatingVersionId = null;
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
      usage: 'all',
      createdFrom: '',
      createdTo: '',
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
      usage: 'all',
      createdFrom: '',
      createdTo: '',
      columnFilters: '[{"column":"version","type":"greaterThan","value":3,"valueType":"number"}]',
    });
    table.onServerFilter([{ column: 'version', type: 'equals', value: 4, valueType: 'number' }]);
    expect(hooks.update).toHaveBeenLastCalledWith({
      status: 'all',
      version: '4',
      usage: 'all',
      createdFrom: '',
      createdTo: '',
      columnFilters: '',
    });
  });

  it('shows all applied filters and lets staff remove individual criteria or clear them together', () => {
    render(<AdmissionWorkflowsScreen />);
    expect(hooks.table.mock.lastCall![0].filters).toEqual([]);

    hooks.status = 0;
    hooks.version = '2';
    hooks.usage = 'used';
    hooks.createdFrom = '2026-11-17';
    hooks.createdTo = '2026-11-18';
    render(<AdmissionWorkflowsScreen />);

    const table = hooks.table.mock.lastCall![0];
    expect(table.filters).toHaveLength(5);
    expect(table.filters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ column: 'status', displayValue: 'Draft' }),
        expect.objectContaining({ column: 'version', value: 2 }),
        expect.objectContaining({ column: 'usage', displayValue: 'In Use' }),
        expect.objectContaining({ column: 'createdFrom', displayValue: '17/11/2026' }),
        expect.objectContaining({ column: 'createdTo', displayValue: '18/11/2026' }),
      ])
    );
    expect(hooks.query.mock.lastCall![0]).toMatchObject({
      status: 0,
      version: 2,
      isUsed: true,
      createdFrom: expect.stringMatching(/\.000Z$/),
      createdTo: expect.stringMatching(/\.9999999Z$/),
    });

    table.onServerFilter(
      table.filters.filter(({ column }: { column: string }) => column !== 'createdFrom')
    );
    expect(hooks.update).toHaveBeenLastCalledWith({
      status: 0,
      version: '2',
      usage: 'used',
      createdFrom: '',
      createdTo: '2026-11-18',
      columnFilters: '',
    });
    table.onServerFilter([]);
    expect(hooks.update).toHaveBeenLastCalledWith({
      status: 'all',
      version: '',
      usage: 'all',
      createdFrom: '',
      createdTo: '',
      columnFilters: '',
    });
    table.onClearCriteria();
    expect(hooks.clear).toHaveBeenCalledOnce();
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
      refreshIndicator: 'skeleton',
    });
    hooks.fetching = false;
    hooks.error = true;
    rerender(<AdmissionWorkflowsScreen />);
    expect(hooks.table.mock.lastCall![0]).toMatchObject({
      data: hooks.currentData.items,
      errorContent: undefined,
    });
  });

  it('uses fixed page sizes and keeps navigation feedback out of the row', () => {
    const row = { id: 'workflow-1', name: 'Admissions' };
    const { rerender } = render(<AdmissionWorkflowsScreen />);
    const table = hooks.table.mock.lastCall![0];
    expect(table.rowsPerPageOptions).toEqual([10, 25, 50, 100]);
    table.getRowAction(row).onClick();
    expect(hooks.navigate).toHaveBeenCalledExactlyOnceWith(row, 'preview');
    expect(hooks.usagePanel).not.toHaveBeenCalled();

    hooks.pendingNavigationId = row.id;
    rerender(<AdmissionWorkflowsScreen />);
    const openingTable = hooks.table.mock.lastCall![0];
    expect(openingTable.getRowAction(row)).toEqual({
      label: 'Preview Admissions',
      onClick: expect.any(Function),
      disabled: true,
    });
    expect(openingTable.rowProps(row)).toEqual({ 'aria-busy': true });
  });

  it('opens usage over the same listing without navigating or resetting pagination', () => {
    const workflow = { id: 'used', name: 'Admissions', stages: [], transitions: [] };
    hooks.currentData = { items: [workflow], totalCount: 21 };
    render(<AdmissionWorkflowsScreen />);

    act(() => hooks.columns.mock.lastCall![0].onUsage(workflow));
    expect(hooks.navigate).not.toHaveBeenCalled();
    expect(hooks.usageQuery).toHaveBeenLastCalledWith(workflow.id, { skip: false });
    expect(hooks.usagePanel.mock.lastCall![0]).toMatchObject({
      panel: 'usage',
      workflow,
      usageLoading: true,
    });
    expect(hooks.table.mock.lastCall![0]).toMatchObject({
      data: [workflow],
      page: 2,
      rowsPerPage: 10,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Close usage' }));
    expect(hooks.usageQuery).toHaveBeenLastCalledWith('', { skip: true });
    expect(hooks.update).not.toHaveBeenCalled();
  });

  it.each(['publishingId', 'creatingVersionId'] as const)(
    'retains safe rows without extra table feedback during %s',
    (action) => {
      hooks.currentData = { items: [{ id: 'workflow-1', name: 'Admissions' }], totalCount: 1 };
      hooks.fetching = true;
      hooks[action] = 'workflow-1';
      render(<AdmissionWorkflowsScreen />);
      expect(hooks.table.mock.lastCall![0]).toMatchObject({
        data: hooks.currentData.items,
        isLoading: false,
        isRefreshing: false,
      });
    }
  );
});
