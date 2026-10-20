import { vi, it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import HrEmployee from './employee';

const state = vi.hoisted(() => ({
  query: { currentData: undefined as any, data: undefined as any, isFetching: true },
  params: { employee: '' } as Record<string, string>,
  useQuery: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({ auth: { permissions: [] }, confirmPopup: {}, globalState: {} }),
  useDispatch: () => vi.fn(),
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/hooks/use-search-param', () => ({
  useCustomSearchParams: () => ({
    getAllParams: () => state.params,
    setParam: vi.fn(),
    deleteParam: vi.fn(),
  }),
}));
vi.mock('src/screens/hr/hooks/useAcademicOrganizationOptions', () => ({
  useAcademicOrganizationOptions: () => ({ options: [], isLoading: false }),
}));
vi.mock('src/screens/hr/hooks/use-hr-table-export', () => ({ useHrTableExport: () => vi.fn() }));
vi.mock('src/redux/hr/employeeApi', () => ({
  useGetEmployeeQuery: vi.fn(),
  useGetEmployeeByIdQuery: () => ({}),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: (options: any) => {
    state.useQuery(options);
    return { ...state.query, refetch: vi.fn() };
  },
}));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('src/components/custom-select', () => ({ default: () => null }));
vi.mock('src/components/customDialog', () => ({ default: () => null }));
vi.mock('src/components/student-popover', () => ({ default: () => null }));
vi.mock('./chnage-status-form', () => ({ default: () => null }));
vi.mock('src/components/customizabaleTable', () => ({
  default: (props: any) => (
    <div>
      {props.isLoading ? (
        <span>Loading staff</span>
      ) : (
        props.data.map((row: any) => <span key={row.id}>{row.fullName}</span>)
      )}
      <button type="button" disabled={props.paginationDisabled}>
        Next page
      </button>
    </div>
  ),
}));

describe('staff directory loading', () => {
  it('keeps cached rows visible during a background refresh and blocks page changes', () => {
    state.query = {
      currentData: { items: [{ id: '1', fullName: 'Current staff' }], totalCount: 1 },
      data: undefined,
      isFetching: true,
    };
    render(<HrEmployee />);
    expect(screen.getByText('Current staff')).toBeVisible();
    expect(screen.queryByText('Loading staff')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Refreshing staff directory' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(state.useQuery.mock.lastCall?.[0].options).toEqual({
      skip: false,
      refetchOnMountOrArgChange: 30,
    });
  });

  it('does not display another page of staff while the requested page is loading', () => {
    state.query = {
      currentData: undefined,
      data: { items: [{ id: 'old', fullName: 'Previous page staff' }] },
      isFetching: true,
    };
    render(<HrEmployee />);
    expect(screen.getByText('Loading staff')).toBeVisible();
    expect(screen.queryByText('Previous page staff')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('progressbar', { name: 'Refreshing staff directory' })
    ).not.toBeInTheDocument();
  });

  it('removes refresh progress and unlocks pagination when the request settles', () => {
    state.query = {
      currentData: { items: [{ id: '1', fullName: 'Current staff' }], totalCount: 1 },
      data: undefined,
      isFetching: true,
    };
    const { rerender } = render(<HrEmployee />);
    expect(screen.getByRole('progressbar', { name: 'Refreshing staff directory' })).toBeVisible();

    state.query = { ...state.query, isFetching: false };
    rerender(<HrEmployee />);
    expect(screen.getByText('Current staff')).toBeVisible();
    expect(
      screen.queryByRole('progressbar', { name: 'Refreshing staff directory' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
  });
});
