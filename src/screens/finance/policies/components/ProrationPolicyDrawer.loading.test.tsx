import type { ReactNode } from 'react';

import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import ProrationPolicyDrawer from './ProrationPolicyDrawer';

const state = vi.hoisted(() => ({ loading: false, saving: false, blocked: false }));

vi.mock('react-redux', () => ({
  useSelector: (select: (value: unknown) => unknown) =>
    select({ globalState: { currentYear: { name: '2026–27' } }, auth: { permissions: [] } }),
}));
vi.mock('../hooks/useProrationPolicyForm', () => ({
  useProrationPolicyForm: () => ({
    formik: {
      values: { status: 'Draft', policyName: 'Saved policy name', feeHeadRules: [] },
      isSubmitting: false,
      resetForm: vi.fn(),
    },
    isLoading: state.loading,
    isSaving: state.saving,
    prerequisites: state.blocked ? [{ key: 'fee-head' }] : [],
    unsavedChangesDialog: { value: false, onFalse: vi.fn() },
    handleCloseAttempt: vi.fn(),
    handleCustomSubmit: vi.fn(),
  }),
}));
vi.mock('../hooks/useProrationValidationFocus', () => ({ useProrationValidationFocus: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('../../components/FinancePrerequisiteState', () => ({
  default: () => <div>No fee heads configured</div>,
}));
vi.mock('./proration/ProrationGeneralSection', () => ({
  default: () => <input aria-label="Policy name" defaultValue="Saved policy name" />,
}));
vi.mock('./proration/ProrationFeeHeadsSection', () => ({
  default: () => <div>Fee head controls</div>,
}));
vi.mock('./proration/ProrationFooterActions', () => ({ default: () => <button>Submit</button> }));

const theme = createTheme({ cssVariables: true });
const form = () => (
  <ThemeProvider theme={theme}>
    <ProrationPolicyDrawer open onClose={vi.fn()} academicYearId="year" />
  </ThemeProvider>
);

beforeEach(() => {
  state.loading = false;
  state.saving = false;
  state.blocked = false;
});

it('shows an accessible field skeleton before evaluating missing fee-head prerequisites', () => {
  state.loading = true;
  state.blocked = true;
  render(form());
  expect(screen.getByRole('status', { name: 'Loading proration policy' })).toBeVisible();
  expect(screen.queryByText('No fee heads configured')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Policy name')).not.toBeInTheDocument();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});

it('replaces the skeleton with fields after fetching completes', () => {
  state.loading = true;
  const { rerender } = render(form());
  state.loading = false;
  rerender(form());
  expect(
    screen.queryByRole('status', { name: 'Loading proration policy' })
  ).not.toBeInTheDocument();
  expect(screen.getByLabelText('Policy name')).toHaveValue('Saved policy name');
  expect(screen.getByText('Fee head controls')).toBeVisible();
});

it('preserves entered fields during saving even if a lookup is refetching', () => {
  state.saving = true;
  state.loading = true;
  render(form());
  expect(
    screen.queryByRole('status', { name: 'Loading proration policy' })
  ).not.toBeInTheDocument();
  expect(screen.getByLabelText('Policy name')).toHaveValue('Saved policy name');
  expect(screen.getByText('Saving policy…')).toBeVisible();
});
