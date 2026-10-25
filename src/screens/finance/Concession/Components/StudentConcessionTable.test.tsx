import React from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { financePermissions } from 'src/constants/finance-menu';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConcessionStatusType } from 'src/enums/concession-status-type';

import StudentConcessionTable from './StudentConcessionTable';

const state = vi.hoisted(() => ({
  params: {} as any,
  table: {} as any,
  userId: 'checker',
  role: 'staff',
  error: false,
  draft: false,
  confirmWithUndo: vi.fn(),
  onViewConcession: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      auth: {
        user: { sub: state.userId, role: state.role },
        permissions: Object.values(financePermissions.fees.concessionActions).map((name) => ({
          name,
          isGranted: true,
        })),
      },
    }),
}));
vi.mock('src/screens/finance/hooks/useFinanceAcademicFilters', () => ({
  useFinanceAcademicFilters: () => ({
    isReady: true,
    filterPayload: { academicYearId: 'year', boardId: 'board', educationMediumId: 'medium' },
  }),
}));
vi.mock('src/screens/finance/components/FinanceAcademicContextFilter', () => ({
  default: () => null,
}));
vi.mock('src/screens/finance/components/FinanceClassDivisionFilter', () => ({
  default: () => null,
}));
vi.mock('src/components/confirm-dialog', () => ({
  ConfirmDialog: ({ open, title, content, action, onClose }: any) =>
    open ? (
      <div role="dialog" aria-label={title}>
        {content}
        <button type="button" onClick={onClose}>
          Cancel deletion
        </button>
        {action}
      </div>
    ) : null,
}));
vi.mock('src/components/customDialog', () => ({
  default: () => null,
  DialogScrollContent: () => null,
}));
vi.mock('src/hooks/useConfirmWithUndo', () => ({
  useConfirmWithUndo: () => ({ confirmWithUndo: state.confirmWithUndo }),
}));
vi.mock('src/redux/finance/ConcessionManagement/concessionManagementApi', () => ({
  concessionManagementApi: {},
  useGetConcessionApplicationsQuery: vi.fn(),
  useCancelConcessionRequestMutation: vi.fn(),
  useDeleteConcessionApplicationMutation: vi.fn(),
  useGetConcessionApprovalContextQuery: () => ({}),
  useApproveConcessionRequestMutation: () => [vi.fn(), {}],
  usePreviewConcessionApprovalMutation: () => [vi.fn(), {}],
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: (options: any) => {
    if (options.type === 'mutation') return [vi.fn(), {}];
    state.params = options.params;
    return {
      isError: state.error,
      refetch: vi.fn(),
      data: {
        totalCount: 53,
        pendingCount: 53,
        items: [
          {
            id: 'request',
            studentName: 'Asha Patel',
            grNumber: '1001',
            standardName: 'Class 4',
            divisionName: 'B',
            rollNo: '0',
            status: state.draft ? ConcessionStatusType.Draft : ConcessionStatusType.Pending,
            requesterId: 'maker',
            availableActions: state.draft ? ['delete', 'edit'] : ['approve', 'reject', 'cancel'],
            concessionAmount: 500,
            createdAt: '2026-10-14T00:00:00Z',
          },
        ],
      },
    };
  },
}));
vi.mock('src/components/adaptive-three-dots-actions', () => ({
  default: ({ actions }: any) => (
    <>
      {actions.map((action: any) => (
        <button type="button" key={action.id} disabled={action.disabled} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    state.table = props;
    const row = props.data[0];
    const rowAction = props.getRowAction?.(row, 0);
    return (
      <>
        <button type="button" onClick={() => props.onServerPagination(3, 10)}>
          Third page
        </button>
        <button
          type="button"
          onClick={() =>
            props.onServerFilter([
              { column: 'classDivision', type: 'contains', value: 'B', valueType: 'string' },
              { column: 'status', type: 'equals', value: 0, valueType: 'enum' },
            ])
          }
        >
          Filter rows
        </button>
        <button
          type="button"
          onClick={() =>
            props.onServerSort('concessionAmount', [
              { column: 'concessionAmount', direction: 'desc' },
            ])
          }
        >
          Sort rows
        </button>
        <button type="button" onClick={() => props.onServerFilter([])}>
          Clear filters
        </button>
        <button
          type="button"
          onClick={() =>
            props.onServerFilter([
              ...props.filters,
              { column: 'status', type: 'equals', value: 1, valueType: 'enum' },
            ])
          }
        >
          Filter approved
        </button>
        <div>{row.classDivision}</div>
        {rowAction && (
          <button type="button" disabled={rowAction.disabled} onClick={rowAction.onClick}>
            {rowAction.label}
          </button>
        )}
        {props.columns.find((column: any) => column.id === 'actions').render(null, row)}
        {props.errorContent}
      </>
    );
  },
}));

function setup() {
  render(
    <StudentConcessionTable
      onReject={vi.fn()}
      onAddConcession={vi.fn()}
      onViewConcession={state.onViewConcession}
    />
  );
}

describe('Concessions table query and actions', () => {
  beforeEach(() => {
    state.userId = 'checker';
    state.role = 'staff';
    state.error = false;
    state.draft = false;
    state.confirmWithUndo.mockClear();
    state.onViewConcession.mockClear();
  });
  it('passes server paging, filters and sort together and resets to the first page', () => {
    setup();
    fireEvent.click(screen.getByText('Third page'));
    expect(state.params).toMatchObject({ page: 3, pageSize: 10, tab: 'pending' });
    expect(state.table.page).toBe(2);
    fireEvent.click(screen.getByText('Filter rows'));
    expect(state.params.page).toBe(1);
    expect(JSON.parse(state.params.filters)).toEqual([
      { column: 'classDivision', type: 'contains', value: 'B' },
      { column: 'status', type: 'equals', value: 6 },
      { column: 'status', type: 'equals', value: 0 },
    ]);
    fireEvent.click(screen.getByText('Sort rows'));
    expect(state.params).toMatchObject({ sortBy: 'concessionAmount', sortOrder: 'desc', page: 1 });
    fireEvent.click(screen.getByText('Third page'));
    expect(state.params.filters).toBeDefined();
    expect(state.table.totalCount).toBe(53);
    fireEvent.click(screen.getByText('Clear filters'));
    expect(state.params.filters).toBeUndefined();
  });
  it('clears only status when moving between operational tabs', () => {
    setup();
    fireEvent.click(screen.getByText('Filter rows'));
    fireEvent.click(screen.getByRole('tab', { name: /Approved/ }));
    expect(state.params).toMatchObject({ tab: 'approved', page: 1 });
    expect(JSON.parse(state.params.filters)).toEqual([
      { column: 'classDivision', type: 'contains', value: 'B' },
    ]);
    expect(
      state.table.columns
        .find((column: any) => column.id === 'status')
        .enumOptions.map((option: any) => option.label)
    ).toEqual(['Pending', 'Approved', 'Rejected']);
  });
  it('switches to the selected status group and replaces a conflicting status filter', () => {
    state.draft = true;
    setup();
    const statusColumn = state.table.columns.find((column: any) => column.id === 'status');
    expect(statusColumn.enumOptions.map((option: any) => option.label)).toEqual([
      'Pending',
      'Approved',
      'Rejected',
    ]);
    render(statusColumn.render(ConcessionStatusType.Draft));
    expect(screen.getByText('Pending', { selector: 'span' })).toBeVisible();
    expect(screen.queryByText('Draft')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Filter rows'));
    fireEvent.click(screen.getByText('Filter approved'));
    expect(state.params).toMatchObject({ tab: 'approved', page: 1 });
    expect(JSON.parse(state.params.filters)).toEqual([
      { column: 'classDivision', type: 'contains', value: 'B' },
      { column: 'status', type: 'equals', value: 1 },
      { column: 'status', type: 'equals', value: 4 },
      { column: 'status', type: 'equals', value: 5 },
    ]);
    expect(state.table.filters.filter((filter: any) => filter.column === 'status')).toHaveLength(1);
  });
  it('filters the displayed class/division and keeps status/actions at the right', () => {
    setup();
    expect(screen.getByText('Class 4 (B)')).toBeVisible();
    expect(state.table.data[0].studentIdentity).toBe('Asha Patel (1001)');
    expect(state.table.columns.find((column: any) => column.id === 'createdAt').filterType).toBe(
      'date'
    );
    expect(
      state.table.columns.slice(-2).map((column: any) => [column.id, column.stickyPosition])
    ).toEqual([
      ['status', 'right'],
      ['actions', 'right'],
    ]);
    expect(state.table.columns.at(-1)).toMatchObject({
      isFilter: false,
      isSort: false,
      excludeFromExport: true,
    });
  });
  it('retains maker-checker restrictions on row decisions', () => {
    state.userId = 'maker';
    setup();
    expect(screen.getByRole('button', { name: 'Approve Asha Patel (1001)' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reject Asha Patel (1001)' })).toBeDisabled();
    const openRecord = screen.getByRole('button', { name: 'Open Asha Patel (1001)' });
    expect(openRecord).toBeEnabled();
    fireEvent.click(openRecord);
    expect(state.onViewConcession).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'request', requesterId: 'maker' })
    );
  });
  it('allows administrator creator decisions in the register', () => {
    state.userId = 'maker';
    state.role = 'admin';
    setup();
    expect(screen.getByRole('button', { name: /Approve Asha Patel/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Reject Asha Patel/ })).toBeEnabled();
  });
  it('offers decisions to an independent checker with the exact grants and server actions', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Approve Asha Patel (1001)' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Reject Asha Patel (1001)' })).toBeEnabled();
  });
  it('shows a query failure as an error with retry', () => {
    state.error = true;
    setup();
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load concessions');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeEnabled();
  });
  it('requires explicit confirmation before deleting a draft and preserves it on Cancel', () => {
    state.draft = true;
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Delete Asha Patel (1001)' }));
    expect(screen.getByRole('dialog', { name: 'Delete Concession Draft?' })).toHaveTextContent(
      'Asha Patel'
    );
    expect(state.confirmWithUndo).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel deletion' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(state.confirmWithUndo).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Delete Asha Patel (1001)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete draft' }));
    expect(state.confirmWithUndo).toHaveBeenCalledTimes(1);
  });
});
