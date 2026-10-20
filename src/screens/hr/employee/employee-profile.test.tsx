import { vi, it, expect, describe } from 'vitest';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, fireEvent } from '@testing-library/react';

import EmployeeProfile from './employee-profile';

const renderProfile = (setSearchParams: (key: string, value: string) => void) =>
  render(
    <ThemeProvider theme={createTheme({ cssVariables: true })}>
      <EmployeeProfile searchParams={{ employee: 'staff-1' }} setSearchParams={setSearchParams} />
    </ThemeProvider>
  );

const state = vi.hoisted(() => ({
  getEmployee: vi.fn(),
  query: { data: undefined as any, isLoading: true, isError: false },
  isChanges: false,
}));

vi.mock('next/dynamic', () => ({
  default: (_loader: unknown, options: any) => options.loading,
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ confirmPopup: { isChanges: state.isChanges } }),
  useDispatch: () => vi.fn(),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => [state.getEmployee, state.query],
}));
vi.mock('src/redux/hr/employeeApi', () => ({ useLazyGetEmployeeByIdQuery: vi.fn() }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading, onBack, links }: any) => (
    <nav aria-label="Staff profile navigation">
      <h1>{heading}</h1>
      <button type="button" onClick={onBack}>
        Back
      </button>
      <button type="button" onClick={links[2].onClick}>
        Staff Directory
      </button>
    </nav>
  ),
}));

describe('staff profile chunk loading', () => {
  it('keeps the profile heading and return navigation available while code loads', () => {
    state.query = { data: undefined, isLoading: true, isError: false };
    state.isChanges = false;
    const setSearchParams = vi.fn();
    renderProfile(setSearchParams);

    expect(state.getEmployee).toHaveBeenCalledWith('staff-1');
    expect(screen.getByRole('heading', { name: 'Staff Profile' })).toBeVisible();
    expect(screen.getByRole('status', { name: 'Loading staff profile' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(setSearchParams).toHaveBeenCalledWith('employee', '');
  });

  it('preserves unsaved changes when return navigation is cancelled during loading', () => {
    state.isChanges = true;
    const confirm = vi.fn(() => false);
    vi.stubGlobal('confirm', confirm);
    const setSearchParams = vi.fn();
    renderProfile(setSearchParams);

    fireEvent.click(screen.getByRole('button', { name: 'Staff Directory' }));
    expect(confirm).toHaveBeenCalled();
    expect(setSearchParams).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
    state.isChanges = false;
  });
});
