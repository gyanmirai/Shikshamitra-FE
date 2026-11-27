import type { ReactNode } from 'react';

import { it, vi, expect, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { ApplicationFormCorrectionDrawer } from './application-form-correction-drawer';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const state = vi.hoisted(() => ({
  application: {} as any,
  form: {} as any,
  permissions: [] as any[],
  applicationOptions: undefined as any,
  formOptions: undefined as any,
  editorPending: null as Promise<void> | null,
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ auth: { permissions: state.permissions } }),
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useGetAdmissionApplicationQuery: (_id: string, options: any) => {
    state.applicationOptions = options;
    return state.application;
  },
  useGetAdmissionApplicationFormQuery: (_id: string, options: any) => {
    state.formOptions = options;
    return state.form;
  },
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogScrollContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('./application-form-correction-frame', () => ({
  ApplicationFormCorrectionFrame: ({
    children,
    onClose,
    closing,
    onExited,
  }: {
    children: ReactNode;
    onClose: () => void;
    closing?: boolean;
    onExited?: () => void;
  }) => (
    <div data-testid="correction-frame" onTransitionEnd={closing ? onExited : undefined}>
      <button type="button" onClick={onClose}>
        Close Edit Application Form
      </button>
      {children}
    </div>
  ),
}));
vi.mock('./application-form-correction-editor', () => ({
  ApplicationFormCorrectionEditor: ({ application, form, allowed, blockedReason }: any) => (
    <div>
      <span>{application.concurrencyStamp}</span>
      <span>{form.values[0].valueJson}</span>
      <span>{String(allowed)}</span>
      <span>{blockedReason}</span>
    </div>
  ),
}));
beforeEach(() => {
  state.editorPending = null;
  state.permissions = [
    'Students.Admissions.Applications.View',
    'Students.Admissions.Applications.Add',
  ].map((name) => ({ name, isGranted: true }));
  state.application = {
    currentData: { id: 'app', concurrencyStamp: 'original-stamp', status: 6 },
    isFetching: false,
    isError: false,
  };
  state.form = {
    currentData: { canCorrectForm: true, values: [{ valueJson: 'Original answer' }] },
    isFetching: false,
    isError: false,
  };
});
const props = { open: true, applicationId: 'app', onClose: vi.fn(), onSaved: vi.fn() };

it('waits for fresh reads before freezing a correction snapshot', async () => {
  state.form.isFetching = true;
  const { rerender } = render(<ApplicationFormCorrectionDrawer {...props} />);
  expect(screen.getByRole('status', { name: 'Loading application form' })).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  expect(screen.queryByText('original-stamp')).not.toBeInTheDocument();
  state.form.isFetching = false;
  rerender(<ApplicationFormCorrectionDrawer {...props} />);
  expect(await screen.findByText('original-stamp')).toBeVisible();
  expect(state.formOptions.refetchOnMountOrArgChange).toBe(true);
});

it('retains answers and original stamp through background changes while updating write capability', async () => {
  const { rerender } = render(<ApplicationFormCorrectionDrawer {...props} />);
  expect(await screen.findByText('original-stamp')).toBeVisible();
  state.application = {
    ...state.application,
    currentData: { id: 'app', concurrencyStamp: 'new-stamp', status: 11 },
  };
  state.form = {
    ...state.form,
    currentData: {
      canCorrectForm: false,
      correctionBlockedReason: 'Admission has been finalized.',
      values: [{ valueJson: 'New answer' }],
    },
  };
  rerender(<ApplicationFormCorrectionDrawer {...props} />);
  expect(screen.getByText('original-stamp')).toBeVisible();
  expect(screen.getByText('Original answer')).toBeVisible();
  expect(screen.getByText('false')).toBeVisible();
  expect(screen.getByText('Admission has been finalized.')).toBeVisible();
  expect(screen.queryByText('new-stamp')).not.toBeInTheDocument();
});

it('does not enable a backend response without correction capability', async () => {
  delete state.form.currentData.canCorrectForm;
  render(<ApplicationFormCorrectionDrawer {...props} />);
  await waitFor(() => expect(screen.getByText('false')).toBeVisible());
});

it('does not fetch form data when existing view/edit permissions are missing', () => {
  state.permissions = [];
  state.application = {};
  state.form = {};
  render(<ApplicationFormCorrectionDrawer {...props} />);
  expect(screen.getByText('You do not have permission to correct this application.')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  expect(state.applicationOptions.skip).toBe(true);
  expect(state.formOptions.skip).toBe(true);
});
vi.mock('./application-workspace-panels', async () => {
  const { ApplicationFormCorrectionEditor } = await import('./application-form-correction-editor');
  return {
    ApplicationFormCorrectionEditor: (editorProps: any) => {
      if (state.editorPending) {
        // React Suspense signals an unresolved code import with its promise.
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw state.editorPending;
      }
      return <ApplicationFormCorrectionEditor {...editorProps} />;
    },
  };
});

it('keeps the correction frame and Close available while the editor chunk is loading', async () => {
  let finish!: () => void;
  state.editorPending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const onClose = vi.fn();
  render(<ApplicationFormCorrectionDrawer {...props} onClose={onClose} />);
  expect(await screen.findByRole('status', { name: 'Loading application editor' })).toBeVisible();
  const frame = screen.getByTestId('correction-frame');
  expect(frame).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Close Edit Application Form' }));
  expect(onClose).not.toHaveBeenCalled();
  state.editorPending = null;
  await act(async () => finish());
  expect(await screen.findByText('original-stamp')).toBeVisible();
  expect(screen.getByText('Original answer')).toBeVisible();
  expect(screen.getByTestId('correction-frame')).toBe(frame);
  fireEvent.transitionEnd(frame);
  expect(onClose).toHaveBeenCalledOnce();
});
