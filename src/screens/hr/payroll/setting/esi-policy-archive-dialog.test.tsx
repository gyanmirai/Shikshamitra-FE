/* eslint-disable prefer-promise-reject-errors -- Synthetic API problem payloads match RTK Query errors. */
import { vi, it, expect, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { EsiPolicyArchiveDialog } from './esi-policy-archive-dialog';

const policy = {
  id: 'p1',
  name: 'DM ESIC',
  code: 'DM',
  isArchived: false,
  isDefault: false,
  concurrencyStamp: 'fresh',
  versions: [],
};
const mocks = vi.hoisted(() => ({
  archive: vi.fn(),
  refetch: vi.fn(),
  review: {} as any,
  busy: false,
  close: vi.fn(),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/redux/hr/esi-policy-api', () => ({
  useGetEsiPolicyArchiveReviewQuery: () => ({ ...mocks.review, refetch: mocks.refetch }),
  useArchiveEsiPolicyMutation: () => [mocks.archive, { isLoading: mocks.busy }],
}));
const ready = () => ({
  currentData: { policy, canArchive: true, templates: [] },
  isFetching: false,
  isError: false,
});
const show = () =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <EsiPolicyArchiveDialog policy={policy} onClose={mocks.close} />
    </ThemeProvider>
  );
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.busy = false;
  mocks.review = ready();
});
mocks.review = ready();

it('shows dependencies, preserves date meaning and blocks archive', () => {
  mocks.review = {
    ...ready(),
    currentData: {
      ...ready().currentData,
      canArchive: false,
      templates: [
        { templateId: 't1', templateName: 'DM Salary Template', version: 2, status: 'Published' },
      ],
      policy: {
        ...policy,
        versions: [
          { id: 'v1', version: 1, effectiveFrom: '2026-01-01', effectiveTo: '2026-12-31' },
        ],
      },
    },
  };
  show();
  expect(screen.getByText(/DM Salary Template/)).toBeInTheDocument();
  expect(screen.getByText(/Salary templates have no effective date range/)).toBeInTheDocument();
  expect(screen.getByText(/2026-01-01 to 2026-12-31/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Archive policy' })).toBeDisabled();
  expect(mocks.archive).not.toHaveBeenCalled();
});
it('shows recorded expiry before a successor without implying gap or inactive-version coverage', () => {
  mocks.review = {
    ...ready(),
    currentData: {
      ...ready().currentData,
      policy: {
        ...policy,
        versions: [
          {
            id: 'v1',
            version: 1,
            effectiveFrom: '2026-01-01',
            effectiveTo: '2026-01-31',
            appliesUntil: '2026-03-31',
          },
          {
            id: 'v2',
            version: 2,
            effectiveFrom: '2026-04-01',
            effectiveTo: null,
            appliesUntil: null,
          },
        ],
      },
    },
  };
  show();
  expect(screen.getByText(/2026-01-01 to 2026-01-31/)).toBeInTheDocument();
  expect(screen.queryByText(/2026-03-31/)).not.toBeInTheDocument();
  expect(screen.getByText(/2026-04-01 to no recorded end date/)).toBeInTheDocument();
  expect(screen.getByText(/do not confirm version activity or availability/)).toBeInTheDocument();
  expect(screen.queryByText(/Policy version coverage/)).not.toBeInTheDocument();
});
it.each(['loading', 'failed', 'stale', 'missing', 'archived'])(
  'fails closed for %s review',
  (mode) => {
    mocks.review = ready();
    if (mode === 'loading') mocks.review.isFetching = true;
    if (mode === 'failed') mocks.review.isError = true;
    if (mode === 'missing') mocks.review.currentData = undefined;
    if (mode === 'stale') mocks.review.currentData.policy = { ...policy, id: 'other' };
    if (mode === 'archived')
      mocks.review.currentData = {
        ...ready().currentData,
        canArchive: false,
        policy: { ...policy, isArchived: true },
      };
    show();
    expect(screen.getByRole('button', { name: 'Archive policy' })).toBeDisabled();
  }
);
it('allows cancel without mutation and retries failed loading', async () => {
  mocks.review = { ...ready(), isError: true };
  show();
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mocks.refetch).toHaveBeenCalledOnce();
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(mocks.close).toHaveBeenCalledOnce();
  expect(mocks.archive).not.toHaveBeenCalled();
});
it('requires an explicit click, sends the reviewed stamp and prevents duplicate requests', async () => {
  let resolve!: () => void;
  mocks.archive.mockReturnValue({
    unwrap: () =>
      new Promise<void>((done) => {
        resolve = done;
      }),
  });
  show();
  expect(mocks.archive).not.toHaveBeenCalled();
  const button = screen.getByRole('button', { name: 'Archive policy' });
  fireEvent.click(button);
  fireEvent.click(button);
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(mocks.close).not.toHaveBeenCalled();
  expect(mocks.archive).toHaveBeenCalledExactlyOnceWith({
    id: 'p1',
    concurrencyStamp: 'fresh',
    confirmed: true,
  });
  resolve();
  await waitFor(() => expect(mocks.close).toHaveBeenCalledOnce());
});
it('keeps failure visible and refreshes dependencies before a retry', async () => {
  mocks.archive.mockReturnValue({
    unwrap: () => Promise.reject({ data: { detail: 'Dependencies changed' } }),
  });
  show();
  await userEvent.setup().click(screen.getByRole('button', { name: 'Archive policy' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Dependencies changed');
  expect(mocks.refetch).toHaveBeenCalledOnce();
  expect(mocks.close).not.toHaveBeenCalled();
});
it('locks cancel and Escape during the mutation', async () => {
  mocks.busy = true;
  show();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await userEvent.setup().keyboard('{Escape}');
  expect(mocks.close).not.toHaveBeenCalled();
});
