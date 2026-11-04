import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import {
  HrSetupEditorContext,
  type SetupEditorState,
} from 'src/screens/hr/setup/hr-setup-editor-context';

import { PfCoverageSettings } from './pf-coverage-settings';

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  refetch: vi.fn(),
  permissions: ['View', 'Add'],
  wideScope: true,
  loading: false,
  failed: false,
  fetching: false,
  pending: false,
  history: [
    { id: 'coverage-1', effectiveMonth: '2026-10-01', isCovered: true, isCancelled: false },
  ],
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { permissions: [] }, confirmPopup: { isChanges: false } }),
  useDispatch: () => vi.fn(),
}));
vi.mock('src/utils/permissions', () => ({
  hasGrantedPermission: (_: unknown, permission: string) =>
    mocks.permissions.includes(permission.split('.').pop()!),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/iconify/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('../structure/salary-structure-builder-utils', () => ({
  getLocalMonthKey: () => '2026-10',
}));
vi.mock('src/redux/hr/pf-coverage-api', () => ({
  useGetPfCoverageQuery: () => ({
    isLoading: mocks.loading,
    isFetching: mocks.fetching,
    isError: mocks.failed,
    refetch: mocks.refetch,
    data: mocks.loading
      ? undefined
      : {
          hasSchoolWideScope: mocks.wideScope,
          history: mocks.history,
        },
  }),
  useSavePfCoverageMutation: () => [mocks.save, { isLoading: mocks.pending }],
}));

describe('School PF coverage', () => {
  beforeEach(() => {
    mocks.permissions = ['View', 'Add'];
    mocks.wideScope = true;
    mocks.loading = false;
    mocks.failed = false;
    mocks.fetching = false;
    mocks.pending = false;
    mocks.history = [
      { id: 'coverage-1', effectiveMonth: '2026-10-01', isCovered: true, isCancelled: false },
    ];
    mocks.refetch.mockReset();
    mocks.save.mockReset().mockReturnValue({ unwrap: () => Promise.resolve({}) });
  });
  afterEach(cleanup);
  it('keeps coverage writes hidden without the exact Add permission or school scope', () => {
    mocks.permissions = ['View'];
    const view = render(<PfCoverageSettings />);
    expect(
      screen.queryByRole('button', { name: /Configure coverage|Set up PF coverage/ })
    ).toBeNull();
    mocks.permissions = ['View', 'Add'];
    mocks.wideScope = false;
    view.rerender(<PfCoverageSettings />);
    expect(screen.queryByRole('button', { name: 'Submit' })).toBeNull();
  });
  it('requires coverage and evidence before writing', async () => {
    render(<PfCoverageSettings />);
    fireEvent.click(screen.getByRole('button', { name: 'Configure coverage' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await screen.findByText('Select school coverage.');
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it('embeds in setup with one footer owner and reports successful saves', async () => {
    let editor: SetupEditorState = { dirty: false, busy: false, save: null };
    const onSaved = vi.fn();
    render(
      <HrSetupEditorContext.Provider
        value={(value) => {
          editor = value;
        }}
      >
        <PfCoverageSettings onSaved={onSaved} />
      </HrSetupEditorContext.Provider>
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Submit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Configure coverage' })).toBeNull();
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /School establishment coverage/ }));
    fireEvent.click(screen.getByRole('option', { name: /^Not covered under PF$/ }));
    fireEvent.change(screen.getByLabelText(/PF coverage evidence reference/), {
      target: { value: 'Wizard review evidence' },
    });
    expect(editor.dirty).toBe(true);
    await act(async () => {
      await editor.save?.();
    });
    expect(onSaved).toHaveBeenCalledOnce();
    expect(mocks.save).toHaveBeenCalledWith(
      expect.objectContaining({ isCovered: false, evidenceReference: 'Wizard review evidence' })
    );
  });
  it('closes and resets the form only after a successful save', async () => {
    render(<PfCoverageSettings />);
    fireEvent.click(screen.getByRole('button', { name: 'Configure coverage' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /School establishment coverage/ }));
    fireEvent.click(screen.getByRole('option', { name: /^Not covered under PF$/ }));
    fireEvent.change(screen.getByLabelText(/PF coverage evidence reference/), {
      target: { value: 'School review reference' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ isCovered: false }));
    fireEvent.click(screen.getByRole('button', { name: 'Configure coverage' }));
    expect(screen.getByLabelText(/PF coverage evidence reference/)).toHaveValue('');
  });
  it('locks editing, cancel, close, and submit during saving', () => {
    const view = render(<PfCoverageSettings />);
    fireEvent.click(screen.getByRole('button', { name: 'Configure coverage' }));
    mocks.pending = true;
    view.rerender(<PfCoverageSettings />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Submit/ })).toBeDisabled();
    expect(screen.getByLabelText(/PF coverage evidence reference/)).toBeDisabled();
  });
  it('retains the evidence and idempotency key after a failed save', async () => {
    mocks.save.mockReturnValue({
      unwrap: () => Promise.reject(new Error('Temporary test failure')),
    });
    render(<PfCoverageSettings />);
    fireEvent.click(screen.getByRole('button', { name: 'Configure coverage' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /School establishment coverage/ }));
    fireEvent.click(screen.getByRole('option', { name: /^Covered under PF$/ }));
    fireEvent.change(screen.getByLabelText(/PF coverage evidence reference/), {
      target: { value: 'Synthetic registration' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledTimes(2));
    expect(mocks.save.mock.calls[1][0]).toEqual(mocks.save.mock.calls[0][0]);
    expect(mocks.save.mock.calls[0][0]).toMatchObject({
      expectedConfigurationId: 'coverage-1',
      effectiveMonth: '2026-10-01T00:00:00.000Z',
      isCovered: true,
      evidenceReference: 'Synthetic registration',
    });
    expect(screen.getByLabelText(/PF coverage evidence reference/)).toHaveValue(
      'Synthetic registration'
    );
  });
});

describe('PF coverage request states', () => {
  beforeEach(() => {
    mocks.permissions = ['View', 'Add'];
    mocks.wideScope = true;
    mocks.loading = false;
    mocks.failed = false;
    mocks.fetching = false;
    mocks.pending = false;
    mocks.history = [];
    mocks.refetch.mockReset();
  });
  it('shows loading without claiming setup is missing', () => {
    mocks.loading = true;
    render(<PfCoverageSettings />);
    expect(screen.getByText('Loading school PF coverage...')).toBeVisible();
    expect(screen.queryByText(/not configured/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Set up PF coverage' })).toBeNull();
  });
  it('shows only the request error and allows retry, even with cached data', () => {
    mocks.failed = true;
    render(<PfCoverageSettings />);
    expect(screen.getByRole('alert')).toHaveTextContent('PF coverage could not be loaded');
    expect(screen.queryByText(/not configured/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Set up PF coverage' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });
  it('prompts confirmed missing coverage to open setup without showing an inline form', () => {
    render(<PfCoverageSettings />);
    expect(screen.getByRole('alert')).toHaveTextContent('not configured for the current month');
    expect(screen.queryByRole('textbox')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Set up PF coverage' }));
    expect(screen.getByRole('dialog', { name: 'Configure PF Coverage' })).toBeVisible();
  });
  it('keeps future and cancelled coverage from satisfying the current month', () => {
    mocks.history = [
      { id: 'future', effectiveMonth: '2026-11-01', isCovered: true, isCancelled: false },
      { id: 'cancelled', effectiveMonth: '2026-09-01', isCovered: true, isCancelled: true },
    ];
    render(<PfCoverageSettings />);
    expect(screen.getByRole('button', { name: 'Set up PF coverage' })).toBeVisible();
  });
  it('treats not-covered as configured rather than missing', () => {
    mocks.history = [
      { id: 'saved', effectiveMonth: '2026-09-01', isCovered: false, isCancelled: false },
    ];
    render(<PfCoverageSettings />);
    expect(screen.getByText('Not covered under PF. Effective 2026-09.')).toBeVisible();
    expect(screen.queryByText(/not configured/)).toBeNull();
  });
  it('gives read-only users an actionable administrator explanation', () => {
    mocks.permissions = ['View'];
    render(<PfCoverageSettings />);
    expect(screen.getByText(/Ask an authorized school-wide HR administrator/)).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Set up PF coverage' })).toBeNull();
  });
  it('preserves a draft through refresh and locks submission until coverage is available', () => {
    const view = render(<PfCoverageSettings />);
    fireEvent.click(screen.getByRole('button', { name: 'Set up PF coverage' }));
    fireEvent.change(screen.getByLabelText(/PF coverage evidence reference/), {
      target: { value: 'Draft evidence' },
    });
    mocks.fetching = true;
    view.rerender(<PfCoverageSettings />);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    mocks.fetching = false;
    mocks.failed = true;
    view.rerender(<PfCoverageSettings />);
    expect(screen.getByLabelText(/PF coverage evidence reference/)).toHaveValue('Draft evidence');
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });
  it('protects unsaved changes with keep-editing and discard actions', async () => {
    render(<PfCoverageSettings />);
    fireEvent.click(screen.getByRole('button', { name: 'Set up PF coverage' }));
    fireEvent.change(screen.getByLabelText(/PF coverage evidence reference/), {
      target: { value: 'Draft evidence' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible());
    expect(screen.getByLabelText(/PF coverage evidence reference/)).toHaveValue('Draft evidence');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
