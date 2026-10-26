import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import ManualAttendance from './index';

const captured = vi.hoisted(() => ({
  table: {} as any,
  query: {} as any,
  exportQuery: {} as any,
  dispatch: vi.fn(),
  day: {
    isDayLocked: false,
    captureMode: 'manual_status',
    totalCount: 101,
    items: [
      {
        employeeId: 'synthetic-1',
        fullName: 'Synthetic staff',
        employeeCode: 'SYN-1',
        status: 1,
        captureMode: 'manual_status',
      },
    ],
  },
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: any) =>
    selector({ globalState: { currentYear: { startDate: '2026-04-01', endDate: '2027-03-31' } } }),
  useDispatch: () => captured.dispatch,
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('date=2026-10-24'),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ type, params }: any) => {
    if (type === 'query') {
      captured.query = params;
      return {
        currentData: captured.day,
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
      };
    }
    return [vi.fn(), { isLoading: false }];
  },
}));
vi.mock('src/screens/hr/hooks/use-hr-table-export', () => ({
  useHrTableExport: (_: string, query: any) => {
    captured.exportQuery = query;
    return vi.fn();
  },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: () => null,
  TimePicker: () => null,
  renderTimeViewClock: vi.fn(),
}));
vi.mock('./substitution/use-hr-substitution', () => ({
  useHrSubstitution: () => ({ allowed: false, opening: false, selected: null }),
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, onChange, options, disabled }: any) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option: any) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => {
    captured.table = props;
    const status = props.columns.find((column: any) => column.id === 'status');
    return (
      <div>
        {props.data.map((row: any) => (
          <div key={row.id}>{status?.render?.(row.status, row)}</div>
        ))}
      </div>
    );
  },
}));
const show = () =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ManualAttendance />
    </ThemeProvider>
  );

describe('manual attendance endpoint-owned table filters', () => {
  it('applies group/department before pagination and uses identical full-export predicates', () => {
    show();
    act(() => captured.table.onServerPagination(3, 50));
    expect(captured.query.skipCount).toBe(100);
    fireEvent.change(screen.getByRole('combobox', { name: 'Staff group' }), {
      target: { value: 'false' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Department contains' }), {
      target: { value: ' Support ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(captured.query).toMatchObject({
      skipCount: 0,
      department: 'Support',
      isTeaching: false,
    });
    expect(captured.exportQuery).toMatchObject({ department: 'Support', isTeaching: false });
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(captured.query).toMatchObject({ skipCount: 0, department: '', isTeaching: undefined });
  });
  it('locks scope changes and export while an attendance draft is dirty', () => {
    show();
    fireEvent.click(screen.getByRole('button', { name: 'Mark SYN-1 Absent' }));
    expect(screen.getByRole('button', { name: 'Apply filters' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Staff group' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Department contains' })).toBeDisabled();
    expect(captured.table.exportDisabled).toBe(true);
    expect(captured.table.paginationDisabled).toBe(true);
  });
});

// This screen test isolates its owning reader; typed criteria transport is covered by the adapter suite.
vi.mock('src/redux/hr/hrOperationalTableApi', () => ({
  useHrOperationalTableQuery: () => ({
    currentData: undefined,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));
