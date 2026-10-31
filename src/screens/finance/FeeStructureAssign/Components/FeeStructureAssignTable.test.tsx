import React from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, fireEvent } from '@testing-library/react';

import FeeStructureAssignTable from './FeeStructureAssignTable';

const state = vi.hoisted(() => ({
  query: {} as any,
  table: {} as any,
  items: [] as any[],
  deniedPermissions: [] as string[],
  isFetching: false,
  context: {
    selectedStandardId: 'all-classes',
    selectedDivisionId: 'all-divisions',
    selectedBoard: 'board',
    selectedMedium: 'medium',
    isReady: true,
  } as any,
}));
vi.mock('react-redux', () => ({
  useSelector: () => ({ currentYear: { id: 'year' }, permissions: [] }),
}));
vi.mock('src/utils/permissions', () => ({
  hasGrantedPermission: (_permissions: unknown, name: string) =>
    !state.deniedPermissions.includes(name),
}));
vi.mock('src/screens/finance/hooks/useFinanceAcademicFilters', () => ({
  ALL_CLASS_OPTION: { id: 'all-classes' },
  ALL_DIVISION_OPTION: { id: 'all-divisions' },
  useFinanceAcademicFilters: () => state.context,
}));
vi.mock('src/components/custom-select', () => ({ default: () => null }));
vi.mock('src/screens/finance/components/FinanceAcademicContextFilter', () => ({
  default: () => null,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/redux/finance/studentFeeAssignment', () => ({
  useAssignmentStudentsQuery: (params: any) => {
    state.query = params;
    return { currentData: { items: state.items, totalCount: 45 }, isFetching: state.isFetching };
  },
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    state.table = props;
    const selection = props.columns.find((column: any) => column.id === 'select');
    return (
      <>
        {selection?.renderColumn()}
        {props.data.map((row: any) => (
          <React.Fragment key={row.id}>{selection?.render(undefined, row)}</React.Fragment>
        ))}
      </>
    );
  },
}));

describe('Fee assignment student table', () => {
  beforeEach(() => {
    state.items = [];
    state.deniedPermissions = [];
    state.isFetching = false;
    state.context = {
      ...state.context,
      selectedStandardId: 'all-classes',
      selectedDivisionId: 'all-divisions',
    };
  });

  it('opens editing for an assigned student through a separate permitted row action', () => {
    const onEdit = vi.fn();
    const onView = vi.fn();
    render(<FeeStructureAssignTable onAssignStructure={onView} onEdit={onEdit} />);
    const row = {
      studentId: 'assigned',
      studentName: 'Aarav',
      isActive: true,
      isFeeStructureAssigned: true,
    };
    const action = state.table.columns.find((column: any) => column.id === 'action');
    const controls = render(action.render(undefined, row));
    fireEvent.click(
      controls.getByRole('button', { name: 'Edit fee structure assignment for Aarav' })
    );
    expect(onEdit).toHaveBeenCalledWith(row);
    expect(onView).not.toHaveBeenCalled();
    fireEvent.click(controls.getByRole('button', { name: 'View fee structure for Aarav' }));
    expect(onView).toHaveBeenCalledWith(row);
  });

  it('keeps assigned rows read-only without policy override access and locks actions on refresh', () => {
    state.deniedPermissions = ['Finance.Fees.StructureAssign.OverridePolicies'];
    const onEdit = vi.fn();
    const view = render(<FeeStructureAssignTable onAssignStructure={vi.fn()} onEdit={onEdit} />);
    const row = { studentId: 'assigned', studentName: 'Aarav', isFeeStructureAssigned: true };
    const action = () => state.table.columns.find((column: any) => column.id === 'action');
    const controls = render(action().render(undefined, row));
    expect(controls.queryByRole('button', { name: /Edit fee structure/ })).not.toBeInTheDocument();
    expect(controls.getByRole('button', { name: 'View fee structure for Aarav' })).toBeEnabled();

    state.deniedPermissions = [];
    state.isFetching = true;
    view.rerender(<FeeStructureAssignTable onAssignStructure={vi.fn()} onEdit={onEdit} />);
    controls.rerender(action().render(undefined, row));
    expect(controls.getByRole('button', { name: /Edit fee structure/ })).toBeDisabled();
    expect(controls.getByRole('button', { name: /View fee structure/ })).toBeDisabled();
    expect(onEdit).not.toHaveBeenCalled();
  });

  it.each(['all-classes', ''])('disables row and bulk selection for class %s', (classId) => {
    state.context.selectedStandardId = classId;
    state.items = [
      { enrollmentId: 'enrollment', studentId: 'student', studentName: 'Student', isActive: true },
    ];
    const view = render(<FeeStructureAssignTable onAssignStructure={vi.fn()} />);

    expect(view.getByRole('checkbox', { name: 'Select Student' })).toBeDisabled();
    expect(
      view.getByRole('checkbox', { name: 'Select eligible students on this page' })
    ).toBeDisabled();
    expect(view.queryByRole('button', { name: 'Assign structure' })).not.toBeInTheDocument();
  });

  it('enables eligible selection for a specific class and clears it when the class changes', () => {
    state.context.selectedStandardId = 'class-a';
    state.items = [
      { enrollmentId: 'e1', studentId: 's1', studentName: 'Eligible', isActive: true },
      { enrollmentId: 'e2', studentId: 's2', studentName: 'Inactive', isActive: false },
      {
        enrollmentId: 'e3',
        studentId: 's3',
        studentName: 'Assigned',
        isActive: true,
        isFeeStructureAssigned: true,
      },
    ];
    const onBulkAssign = vi.fn();
    const view = render(
      <FeeStructureAssignTable onAssignStructure={vi.fn()} onBulkAssign={onBulkAssign} />
    );
    expect(view.getByRole('checkbox', { name: 'Select Eligible' })).toBeEnabled();
    expect(view.getByRole('checkbox', { name: 'Select Inactive' })).toBeDisabled();
    expect(view.getByRole('checkbox', { name: 'Select Assigned' })).toBeDisabled();
    fireEvent.click(view.getByRole('checkbox', { name: 'Select eligible students on this page' }));
    expect(view.getByRole('checkbox', { name: 'Select Eligible' })).toBeChecked();
    fireEvent.click(view.getByRole('button', { name: 'Assign structure' }));
    expect(onBulkAssign).toHaveBeenCalledWith(
      [expect.objectContaining({ studentId: 's1' })],
      'class-a'
    );

    state.context.selectedStandardId = 'all-classes';
    view.rerender(
      <FeeStructureAssignTable onAssignStructure={vi.fn()} onBulkAssign={onBulkAssign} />
    );
    expect(view.getByRole('checkbox', { name: 'Select Eligible' })).toBeDisabled();
    expect(view.getByRole('checkbox', { name: 'Select Eligible' })).not.toBeChecked();
    expect(view.queryByRole('button', { name: 'Assign structure' })).not.toBeInTheDocument();

    state.context.selectedStandardId = 'class-b';
    view.rerender(
      <FeeStructureAssignTable onAssignStructure={vi.fn()} onBulkAssign={onBulkAssign} />
    );
    expect(view.getByRole('checkbox', { name: 'Select Eligible' })).toBeEnabled();
    expect(view.getByRole('checkbox', { name: 'Select Eligible' })).not.toBeChecked();
  });

  it('sends filters and sorting across pages, resets offsets immediately, and preserves scope', () => {
    const view = render(<FeeStructureAssignTable onAssignStructure={vi.fn()} />);
    act(() => state.table.onServerPagination(3, 10));
    expect(state.query.skipCount).toBe(20);
    expect(state.table.page).toBe(2);

    const filters = [
      { column: 'isFeeStructureAssigned', type: 'equals', value: 1, valueType: 'enum' },
      { column: 'rollNumber', type: 'between', value: { min: 2, max: 10 }, valueType: 'number' },
    ];
    act(() => state.table.onServerFilter(filters));
    expect(state.query.skipCount).toBe(0);
    expect(JSON.parse(state.query.filters)).toEqual(
      filters.map(({ valueType, ...filter }) => filter)
    );
    act(() =>
      state.table.onServerSort('rollNumber', [{ column: 'rollNumber', direction: 'desc' }])
    );
    act(() => state.table.onServerPagination(2, 10));
    expect(state.query).toMatchObject({
      skipCount: 10,
      sortBy: 'rollNumber',
      sortOrder: 'desc',
      boardId: 'board',
    });
    expect(state.query.filters).toBeDefined();

    state.context = { ...state.context, selectedDivisionId: 'division-b' };
    view.rerender(<FeeStructureAssignTable onAssignStructure={vi.fn()} />);
    expect(state.query).toMatchObject({
      skipCount: 0,
      divisionId: 'division-b',
      sortBy: 'rollNumber',
    });
    act(() => state.table.onServerSearch('10025'));
    expect(state.query).toMatchObject({ skipCount: 0, search: '10025' });
    act(() => state.table.onServerFilter([]));
    expect(state.query.filters).toBeUndefined();
  });

  it('excludes assigned students from header selection and drops stale selections after assignment', () => {
    state.context.selectedStandardId = 'class-a';
    state.items = [
      { enrollmentId: 'e1', studentId: 's1', studentName: 'Eligible', isActive: true },
      {
        enrollmentId: 'e2',
        studentId: 's2',
        studentName: 'Already assigned',
        isActive: true,
        isFeeStructureAssigned: true,
      },
    ];
    const onBulkAssign = vi.fn();
    const view = render(
      <FeeStructureAssignTable onAssignStructure={vi.fn()} onBulkAssign={onBulkAssign} />
    );
    const header = () =>
      view.getByRole('checkbox', { name: 'Select eligible students on this page' });
    fireEvent.click(header());
    expect(header()).toBeChecked();
    expect(view.getByRole('checkbox', { name: 'Select Already assigned' })).not.toBeChecked();
    fireEvent.click(view.getByRole('button', { name: 'Assign structure' }));
    expect(onBulkAssign).toHaveBeenCalledWith(
      [expect.objectContaining({ studentId: 's1' })],
      'class-a'
    );

    state.items = state.items.map((item) => ({ ...item, isFeeStructureAssigned: true }));
    view.rerender(
      <FeeStructureAssignTable onAssignStructure={vi.fn()} onBulkAssign={onBulkAssign} />
    );
    expect(header()).toBeDisabled();
    expect(header()).not.toBeChecked();
    expect(view.getByRole('checkbox', { name: 'Select Eligible' })).toBeDisabled();
    expect(view.getByRole('checkbox', { name: 'Select Eligible' })).not.toBeChecked();
    expect(view.queryByRole('button', { name: 'Assign structure' })).not.toBeInTheDocument();
    expect(state.table.rowProps(state.items[0])).toMatchObject({
      'data-assignment-status': 'assigned',
    });
  });

  it('provides typed controls for every student field and excludes action controls from export', () => {
    render(<FeeStructureAssignTable onAssignStructure={vi.fn()} />);
    [
      'studentName',
      'grNumber',
      'standardDivision',
      'boardName',
      'mediumName',
      'stageName',
      'className',
      'divisionName',
    ].forEach((id) => {
      expect(state.table.columns.find((column: any) => column.id === id)).toMatchObject({
        isFilter: true,
        isSort: true,
        filterType: 'string',
        align: 'left',
      });
    });
    expect(state.table.columns.find((column: any) => column.id === 'rollNumber')).toMatchObject({
      filterType: 'number',
      align: 'left',
      cellSx: { textAlign: 'left', verticalAlign: 'middle' },
    });
    ['isActive', 'isFeeStructureAssigned'].forEach((id) => {
      expect(state.table.columns.find((column: any) => column.id === id)).toMatchObject({
        filterType: 'enum',
        isFilter: true,
        isSort: true,
      });
    });
    ['select', 'action'].forEach((id) => {
      expect(state.table.columns.find((column: any) => column.id === id)).toMatchObject({
        isFilter: false,
        isSort: false,
        excludeFromExport: true,
      });
    });
    expect(state.table).toMatchObject({
      serverSideFilter: true,
      serverSideSort: true,
      serverSideSortMode: 'single',
    });
    const action = state.table.columns
      .find((column: any) => column.id === 'action')
      .render(undefined, { studentId: 'eligible', studentName: 'Eligible', isActive: true });
    expect(action.props.variant).toBe('outlined');
    expect(action.props.startIcon).toBeTruthy();
  });

  it('scopes dependency-review links to the requested fee head and exposes a clear action', () => {
    const view = render(
      <FeeStructureAssignTable onAssignStructure={vi.fn()} feeHeadId="tuition" />
    );
    expect(state.query.feeHeadId).toBe('tuition');
    expect(view.getByRole('link', { name: 'Clear fee head filter' })).toHaveAttribute(
      'href',
      '/finance/fee-structure-assign'
    );
  });
});
