import type { ICustomizableTableProps } from 'src/components/customizabaleTable/types';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { AdmissionOfferingTable } from './admission-offering-table';

vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data, handleRowClick, rowProps, noDataText }: ICustomizableTableProps) => (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.id}>{column.renderColumn?.(column) ?? column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && <tr><td colSpan={columns.length}>{noDataText}</td></tr>}
        {data.map((row, index) => (
          <tr key={row.id} {...rowProps?.(row, index)} onClick={() => handleRowClick?.(row, index)}>
            {columns.map((column) => (
              <td key={column.id}>{column.render?.(row[column.id], row)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}));
vi.mock('./admission-offering-columns', () => ({
  buildAdmissionOfferingColumns: () => [
    { id: 'name', label: 'Offering', render: (name: string) => name },
  ],
}));

const rows = [
  { id: 'ready', name: 'Class 1 General', isActive: false, canActivate: true },
  { id: 'active', name: 'Class 2 General', isActive: true, canActivate: false },
  { id: 'blocked', name: 'Class 3 General', isActive: false, canActivate: false },
] as AdmissionOfferingListItem[];

const props = () => ({
  rows,
  loading: false,
  totalCount: 3,
  page: 0,
  rowsPerPage: 10,
  search: '',
  canEdit: true,
  canClone: true,
  canActivate: true,
  canDeactivate: true,
  canDelete: true,
  onView: vi.fn(),
  onEdit: vi.fn(),
  onClone: vi.fn(),
  onToggleActive: vi.fn(),
  onDelete: vi.fn(),
  onSearch: vi.fn(),
  onSort: vi.fn(),
  onPagination: vi.fn(),
  selection: {
    selectedIds: [],
    eligibleIds: ['ready'],
    disabled: false,
    onToggle: vi.fn(),
    onToggleAll: vi.fn(),
  },
});

describe('Offering table selection', () => {
  it('selects a ready offering without opening its details', () => {
    const input = props();
    render(<AdmissionOfferingTable {...input} />);
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select Class 1 General for activation' })
    );
    expect(input.selection.onToggle).toHaveBeenCalledWith(rows[0], true);
    expect(input.onView).not.toHaveBeenCalled();
  });
  it('disables active and blocked offerings', () => {
    render(<AdmissionOfferingTable {...props()} />);
    expect(
      screen.getByRole('checkbox', { name: 'Select Class 2 General for activation' })
    ).toBeDisabled();
    expect(
      screen.getByRole('checkbox', { name: 'Select Class 3 General for activation' })
    ).toBeDisabled();
  });
  it('offers select-all only for eligible rows on the current page', () => {
    const input = props();
    render(<AdmissionOfferingTable {...input} />);
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select all eligible offerings on this page' })
    );
    expect(input.selection.onToggleAll).toHaveBeenCalledWith(true);
  });
  it('supports checkbox keyboard input without triggering the row shortcut', () => {
    const input = props();
    render(<AdmissionOfferingTable {...input} />);
    fireEvent.keyDown(
      screen.getByRole('checkbox', { name: 'Select Class 1 General for activation' }),
      { key: ' ' }
    );
    expect(input.onView).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByText('Class 1 General').closest('tr')!, { key: 'Enter' });
    expect(input.onView).toHaveBeenCalledWith(rows[0]);
  });
  it('locks all selection controls during loading or activation', () => {
    const input = props();
    input.selection.disabled = true;
    render(<AdmissionOfferingTable {...input} />);
    screen.getAllByRole('checkbox').forEach((checkbox) => expect(checkbox).toBeDisabled());
  });
  it('does not show selection without activation permission', () => {
    render(<AdmissionOfferingTable {...props()} canActivate={false} selection={undefined} />);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
  it('disables select-all on an empty page', () => {
    const input = props();
    render(
      <AdmissionOfferingTable
        {...input}
        rows={[]}
        selection={{ ...input.selection, eligibleIds: [] }}
      />
    );
    expect(
      screen.getByRole('checkbox', { name: 'Select all eligible offerings on this page' })
    ).toBeDisabled();
  });

  it('offers filter recovery inside the empty table instead of claiming no offerings exist', () => {
    const onClearFilters = vi.fn();
    render(<AdmissionOfferingTable {...props()} rows={[]} filteredEmpty onClearFilters={onClearFilters} />);
    expect(screen.getByText('No admission offerings match the selected filters.')).toBeVisible();
    expect(screen.queryByText('No admission offering has been configured.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onClearFilters).toHaveBeenCalledOnce();
  });

  it('keeps a distinct initial empty state without a filter reset action', () => {
    render(<AdmissionOfferingTable {...props()} rows={[]} />);
    expect(screen.getByText('No admission offering has been configured.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });
});
