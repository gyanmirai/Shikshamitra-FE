import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { PfCoverageSettings } from './pf-coverage-settings';

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  permissions: ['View', 'Add'],
  wideScope: true,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: vi.fn(),
  history: [
    {
      id: 'coverage-1',
      effectiveMonth: '2026-10-01',
      isCovered: true,
      isCancelled: false,
      evidenceReference: 'Synthetic registration',
    },
  ],
}));
vi.mock('react-redux', () => ({ useSelector: () => [] }));
vi.mock('src/utils/permissions', () => ({
  hasGrantedPermission: (_: unknown, permission: string) =>
    mocks.permissions.includes(permission.split('.').pop()!),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('../structure/salary-structure-builder-utils', () => ({
  getLocalMonthKey: () => '2026-10',
}));
vi.mock('src/redux/hr/pf-coverage-api', () => ({
  useGetPfCoverageQuery: () => ({
    isLoading: mocks.isLoading,
    isFetching: mocks.isFetching,
    isError: mocks.isError,
    refetch: mocks.refetch,
    data:
      mocks.isLoading || mocks.isError
        ? undefined
        : {
            hasSchoolWideScope: mocks.wideScope,
            history: mocks.history,
          },
  }),
  useSavePfCoverageMutation: () => [mocks.save, { isLoading: false }],
}));

const theme = createTheme(defaultSettings);
const show = () =>
  render(<PfCoverageSettings />, {
    wrapper: ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>,
  });

describe('School PF coverage', () => {
  beforeEach(() => {
    mocks.permissions = ['View', 'Add'];
    mocks.wideScope = true;
    mocks.isLoading = false;
    mocks.isFetching = false;
    mocks.isError = false;
    mocks.refetch.mockReset();
    mocks.history = [
      {
        id: 'coverage-1',
        effectiveMonth: '2026-10-01',
        isCovered: true,
        isCancelled: false,
        evidenceReference: 'Synthetic registration',
      },
    ];
    mocks.save.mockReset().mockReturnValue({ unwrap: () => Promise.resolve({}) });
  });
  afterEach(cleanup);
  it('keeps coverage writes hidden without the exact Add permission or school scope', () => {
    mocks.permissions = ['View'];
    const view = show();
    expect(screen.queryByRole('button', { name: 'Save PF coverage' })).toBeNull();
    mocks.permissions = ['View', 'Add'];
    mocks.wideScope = false;
    view.rerender(<PfCoverageSettings />);
    expect(screen.queryByRole('button', { name: 'Save PF coverage' })).toBeNull();
  });
  it('requires coverage and evidence before writing', async () => {
    show();
    fireEvent.click(screen.getByRole('button', { name: 'Save PF coverage' }));
    await screen.findByText('Select school coverage.');
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it('retains the evidence and idempotency key after a failed save', async () => {
    mocks.save.mockReturnValue({
      unwrap: () => Promise.reject(new Error('Temporary test failure')),
    });
    show();
    await act(async () =>
      fireEvent.mouseDown(screen.getByRole('combobox', { name: 'School establishment coverage' }))
    );
    await act(async () =>
      fireEvent.click(screen.getByRole('option', { name: /^Covered under PF$/ }))
    );
    await act(async () =>
      fireEvent.change(screen.getByLabelText(/^PF coverage evidence reference/), {
        target: { value: 'Synthetic registration' },
      })
    );
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Save PF coverage' }))
    );
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: 'Save PF coverage' }))
    );
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(2));
    expect(mocks.save.mock.calls[1][0]).toEqual(mocks.save.mock.calls[0][0]);
    expect(mocks.save.mock.calls[0][0]).toMatchObject({
      expectedConfigurationId: 'coverage-1',
      effectiveMonth: '2026-10-01T00:00:00.000Z',
      isCovered: true,
      evidenceReference: 'Synthetic registration',
    });
    expect(screen.getByLabelText(/^PF coverage evidence reference/)).toHaveValue(
      'Synthetic registration'
    );
  });
  it('explains missing effective coverage as a separate school setting', () => {
    mocks.history = [];
    show();
    expect(
      screen.getByText(/No PF coverage record is effective for October 2026/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'School PF Coverage information' })
    ).toBeInTheDocument();
  });
  it('does not present loading or refreshing coverage as missing', () => {
    mocks.history = [];
    mocks.isLoading = true;
    const view = show();
    expect(screen.queryByText(/needs review|No PF coverage record/)).toBeNull();
    expect(screen.getByRole('progressbar', { name: 'Loading PF coverage' })).toBeInTheDocument();
    mocks.isLoading = false;
    mocks.isFetching = true;
    view.rerender(<PfCoverageSettings />);
    expect(screen.queryByText(/needs review|No PF coverage record/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Save PF coverage' })).toBeDisabled();
  });
  it('shows a retryable load error without a misleading coverage warning', () => {
    mocks.isError = true;
    show();
    expect(screen.queryByText(/needs review|No PF coverage record/)).toBeNull();
    expect(screen.getByText('PF coverage could not be loaded.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });
  it('shows the saved coverage status without a review banner', () => {
    show();
    expect(screen.getByText('Covered under PF', { exact: true })).toBeInTheDocument();
    expect(screen.queryByText(/No PF coverage record|needs review/)).toBeNull();
  });
  it('does not use future or cancelled coverage as the current setting', () => {
    mocks.history = [
      { ...mocks.history[0], effectiveMonth: '2026-11-01' },
      { ...mocks.history[0], isCancelled: true },
    ];
    show();
    expect(
      screen.getByText(/No PF coverage record is effective for October 2026/)
    ).toBeInTheDocument();
  });
});
