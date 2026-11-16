import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import { vi, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { ApplicationDecisionForm } from './application-decision-form';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

const application = {
  id: 'application-1',
  applicationNumber: 'APP-QA',
  status: 1,
  concurrencyStamp: 'stamp',
} as AdmissionApplication;

function setup(extra = {}) {
  const props = {
    application,
    actions: ['approve', 'waitlist', 'reject'] as const,
    busy: false,
    onSubmit: vi.fn().mockResolvedValue(true),
    onReload: vi.fn().mockResolvedValue({ ...application, concurrencyStamp: 'latest' }),
    onBusyChange: vi.fn(),
    onDirtyChange: vi.fn(),
    ...extra,
  };
  const user = userEvent.setup();
  const view = render(
    <ThemeProvider theme={createTheme()}>
      <ApplicationDecisionForm {...props}>Decision history</ApplicationDecisionForm>
    </ThemeProvider>
  );
  return { ...view, props, user };
}

it('starts without a selected outcome or reason and never submits on selection', async () => {
  const { user, props } = setup();
  expect(screen.getByRole('group', { name: 'Choose an Outcome' })).toBeVisible();
  expect(screen.getAllByRole('radio')).toHaveLength(3);
  screen.getAllByRole('radio').forEach((radio) => expect(radio).not.toBeChecked());
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Record Decision' })).toBeDisabled();
  await user.click(screen.getByRole('radio', { name: 'Approve' }));
  expect(screen.getByRole('textbox', { name: 'Reason (Optional)' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Record Decision' })).toBeEnabled();
  expect(props.onSubmit).not.toHaveBeenCalled();
  expect(props.onDirtyChange).toHaveBeenLastCalledWith(true);
});

it('records approval with its saved stamp and optional reason, then clears the draft', async () => {
  const { user, props } = setup();
  await user.click(screen.getByRole('radio', { name: 'Approve' }));
  await user.click(screen.getByRole('button', { name: 'Record Decision' }));
  await waitFor(() =>
    expect(props.onSubmit).toHaveBeenCalledWith('approve', {
      concurrencyStamp: 'stamp',
      reason: undefined,
    })
  );
  await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
  expect(props.onDirtyChange).toHaveBeenLastCalledWith(false);
});

it.each(['waitlist', 'reject'] as const)(
  'requires a trimmed reason for %s and sends the same contract',
  async (action) => {
    const { user, props } = setup();
    await user.click(
      screen.getByRole('radio', { name: action === 'reject' ? 'Reject' : 'Waitlist' })
    );
    const reason = screen.getByRole('textbox', { name: 'Reason' });
    expect(reason).toBeRequired();
    await user.type(reason, '   ');
    await user.click(screen.getByRole('button', { name: 'Record Decision' }));
    expect(await screen.findByText('Reason is required for this decision')).toBeVisible();
    expect(reason).toHaveFocus();
    expect(props.onSubmit).not.toHaveBeenCalled();
    await user.clear(reason);
    await user.type(reason, '  Reviewed by the school  ');
    await user.click(screen.getByRole('button', { name: 'Record Decision' }));
    await waitFor(() =>
      expect(props.onSubmit).toHaveBeenCalledWith(action, {
        concurrencyStamp: 'stamp',
        reason: 'Reviewed by the school',
      })
    );
  }
);

it('supports keyboard selection and retains the reason when changing outcomes', async () => {
  const { user, props } = setup();
  await user.tab();
  expect(screen.getByRole('radio', { name: 'Approve' })).toHaveFocus();
  await user.keyboard('[ArrowDown]');
  expect(screen.getByRole('radio', { name: 'Waitlist' })).toBeChecked();
  await user.type(screen.getByRole('textbox', { name: 'Reason' }), 'Keep this draft');
  await user.click(screen.getByRole('radio', { name: 'Approve' }));
  expect(screen.getByRole('textbox', { name: 'Reason (Optional)' })).toHaveValue('Keep this draft');
  expect(props.onSubmit).not.toHaveBeenCalled();
});

it('locks choices and the reason during submission and blocks duplicate saves', async () => {
  let release!: (value: boolean) => void;
  const onSubmit = vi.fn(
    () =>
      new Promise<boolean>((resolve) => {
        release = resolve;
      })
  );
  const { user, props } = setup({ onSubmit });
  await user.click(screen.getByRole('radio', { name: 'Waitlist' }));
  await user.type(screen.getByRole('textbox', { name: 'Reason' }), 'No place yet');
  await user.click(screen.getByRole('button', { name: 'Record Decision' }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
  expect(screen.getByRole('radio', { name: 'Approve' })).toBeDisabled();
  expect(screen.getByRole('textbox', { name: 'Reason' })).toBeDisabled();
  expect(props.onBusyChange).toHaveBeenLastCalledWith(true);
  fireEvent.submit(screen.getByRole('form', { name: 'Record Decision' }));
  expect(onSubmit).toHaveBeenCalledOnce();
  await act(async () => release(true));
  await waitFor(() => expect(props.onBusyChange).toHaveBeenLastCalledWith(false));
});

it('retains failed input, blocks blind retries and recovers through the existing reload confirmation', async () => {
  const { user, props } = setup({ onSubmit: vi.fn().mockResolvedValue(false) });
  await user.click(screen.getByRole('radio', { name: 'Reject' }));
  await user.type(screen.getByRole('textbox', { name: 'Reason' }), 'Saved draft reason');
  await user.click(screen.getByRole('button', { name: 'Record Decision' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Record Decision' })).toBeDisabled()
  );
  expect(screen.getByRole('textbox', { name: 'Reason' })).toHaveValue('Saved draft reason');
  await user.click(screen.getByRole('button', { name: 'Reload Latest application' }));
  expect(props.onReload).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Discard Edits and Reload' }));
  await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
  expect(props.onReload).toHaveBeenCalledOnce();
  await user.click(screen.getByRole('radio', { name: 'Reject' }));
  await user.type(screen.getByRole('textbox', { name: 'Reason' }), 'Updated reason');
  await user.click(screen.getByRole('button', { name: 'Record Decision' }));
  await waitFor(() =>
    expect(props.onSubmit).toHaveBeenLastCalledWith('reject', {
      concurrencyStamp: 'latest',
      reason: 'Updated reason',
    })
  );
});

it('does not submit when busy or when the concurrency stamp is unavailable', async () => {
  const { props, user, unmount } = setup({ busy: true });
  expect(screen.getByRole('radio', { name: 'Approve' })).toBeDisabled();
  fireEvent.submit(screen.getByRole('form', { name: 'Record Decision' }));
  expect(props.onSubmit).not.toHaveBeenCalled();
  unmount();
  setup({ application: { ...application, concurrencyStamp: '' } });
  await user.click(screen.getByRole('radio', { name: 'Approve' }));
  expect(screen.getByRole('button', { name: 'Record Decision' })).toBeDisabled();
});

it('clears workspace dirty/busy state when the panel unmounts', async () => {
  const { props, user, unmount } = setup();
  await user.click(screen.getByRole('radio', { name: 'Waitlist' }));
  expect(props.onDirtyChange).toHaveBeenLastCalledWith(true);
  unmount();
  expect(props.onDirtyChange).toHaveBeenLastCalledWith(false);
  expect(props.onBusyChange).toHaveBeenLastCalledWith(false);
});

it('uses a refreshed revision for a clean form but preserves the revision of an active draft', async () => {
  const { props, user, rerender } = setup();
  const update = (stamp: string) =>
    rerender(
      <ThemeProvider theme={createTheme()}>
        <ApplicationDecisionForm
          {...props}
          application={{ ...application, concurrencyStamp: stamp }}
        />
      </ThemeProvider>
    );
  update('refreshed');
  await user.click(screen.getByRole('radio', { name: 'Approve' }));
  update('background-change');
  await user.click(screen.getByRole('button', { name: 'Record Decision' }));
  await waitFor(() =>
    expect(props.onSubmit).toHaveBeenLastCalledWith('approve', {
      concurrencyStamp: 'refreshed',
      reason: undefined,
    })
  );
  await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
  await user.click(screen.getByRole('radio', { name: 'Approve' }));
  await user.click(screen.getByRole('button', { name: 'Record Decision' }));
  await waitFor(() =>
    expect(props.onSubmit).toHaveBeenLastCalledWith('approve', {
      concurrencyStamp: 'background-change',
      reason: undefined,
    })
  );
});

it('retains a too-long reason and reports the existing 512-character limit', async () => {
  const { props, user } = setup();
  await user.click(screen.getByRole('radio', { name: 'Approve' }));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x'.repeat(513) } });
  await user.click(screen.getByRole('button', { name: 'Record Decision' }));
  expect(await screen.findByText('Use 512 characters or fewer')).toBeVisible();
  expect(screen.getByRole('textbox')).toHaveFocus();
  expect(props.onSubmit).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox')).toHaveValue('x'.repeat(513));
});
