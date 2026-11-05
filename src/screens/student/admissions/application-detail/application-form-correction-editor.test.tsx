import type { ComponentProps } from 'react';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { vi, it, expect, afterEach, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, screen, within, waitFor, fireEvent } from '@testing-library/react';

import { ApplicationFormCorrectionEditor } from './application-form-correction-editor';

const api = vi.hoisted(() => ({
  save: vi.fn(),
  push: vi.fn(),
  photo: undefined as undefined | ((busy: boolean) => void),
  change: undefined as undefined | ((code: string, value: string) => void),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: api.push }) }));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useCorrectAdmissionApplicationFormMutation: () => [
    (command: unknown) => ({ unwrap: () => api.save(command) }),
  ],
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('./application-runtime-form', () => ({
  ApplicationRuntimeForm: ({
    onPhotoReadingChange,
    values,
    readOnly,
    saving,
    onChange,
    fieldErrors,
    errors,
    footerActions,
    canSubmitForm,
    onSubmit,
  }: ComponentProps<typeof import('./application-runtime-form').ApplicationRuntimeForm>) => {
    api.photo = onPhotoReadingChange;
    api.change = onChange;
    return (
      <div>
        <input
          aria-label="Student name"
          aria-invalid={Boolean(fieldErrors.NAME)}
          value={values.NAME ?? ''}
          disabled={readOnly || saving}
          onChange={(event) => onChange('NAME', event.target.value)}
        />
        <input
          aria-label="Email"
          value={values.EMAIL ?? ''}
          disabled={readOnly || saving}
          onChange={(event) => onChange('EMAIL', event.target.value)}
        />
        <p>{fieldErrors.NAME}</p>
        {errors.map((error: string) => (
          <p key={error}>{error}</p>
        ))}
        {footerActions}
        {!readOnly && (
          <button type="button" disabled={!canSubmitForm} onClick={onSubmit}>
            Save Corrections
          </button>
        )}
      </div>
    );
  },
}));
type Props = ComponentProps<typeof ApplicationFormCorrectionEditor>;
const form = {
  canCorrectForm: true,
  status: 1,
  formInstanceId: 'instance',
  formVersion: 3,
  definition: {
    layoutType: 0,
    fieldsPerRow: 2,
    sections: [
      {
        id: 'basic',
        fields: [
          { id: 'name', code: 'NAME', label: 'Student name', fieldType: 0, required: true },
          { id: 'email', code: 'EMAIL', label: 'Email', fieldType: 3 },
        ],
      },
    ],
  },
  values: [
    { fieldCode: 'NAME', valueJson: '"Original"' },
    { fieldCode: 'EMAIL', valueJson: '"parent@example.com"' },
  ],
} as Props['form'];
function setup(overrides: Partial<Props> = {}) {
  const props: Props = {
    application: {
      id: 'app',
      concurrencyStamp: 'saved-stamp',
      status: 6,
      applicationNumber: 'APP-46',
    } as Props['application'],
    form,
    allowed: true,
    onClose: vi.fn(),
    onSaved: vi.fn(),
    onRefresh: vi.fn(),
    ...overrides,
  };
  const wrap = (value: Props) => (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <ApplicationFormCorrectionEditor {...value} />
    </ThemeProvider>
  );
  const result = renderWithProviders(wrap(props));
  return {
    ...result,
    props,
    rerenderProps: (next: Partial<Props>) => result.rerender(wrap({ ...props, ...next })),
  };
}
async function reasonDialog() {
  fireEvent.change(screen.getByLabelText('Student name'), { target: { value: 'Corrected' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save Corrections' }));
  return screen.findByRole('dialog', { name: 'Save Form Corrections' });
}
async function saveReason(dialog: HTMLElement) {
  fireEvent.change(within(dialog).getByRole('textbox', { name: /^Reason/ }), {
    target: { value: '  Verified correction  ' },
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save Corrections' }));
}
beforeEach(() => {
  api.save.mockReset();
  api.push.mockClear();
  api.save.mockResolvedValue({});
});
afterEach(() => vi.unstubAllGlobals());

it('guards same-document navigation until unsaved corrections are explicitly discarded', async () => {
  setup();
  fireEvent.change(screen.getByLabelText('Student name'), { target: { value: 'Corrected' } });
  const link = document.createElement('a');
  link.href = '/student/admissions/applications';
  document.body.appendChild(link);
  fireEvent.click(link);
  const confirm = await screen.findByRole('dialog', { name: 'Discard Form Corrections?' });
  expect(api.push).not.toHaveBeenCalled();
  fireEvent.click(within(confirm).getByRole('button', { name: 'Discard Changes' }));
  expect(api.push).toHaveBeenCalledWith('/student/admissions/applications');
  link.remove();
});

it('blocks a browser Back traversal during an active save', async () => {
  const navigation = new EventTarget();
  vi.stubGlobal('navigation', navigation);
  let finish!: () => void;
  api.save.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
  );
  setup();
  const dialog = await reasonDialog();
  await saveReason(dialog);
  await waitFor(() => expect(api.save).toHaveBeenCalledOnce());
  await waitFor(() =>
    expect(within(dialog).getByRole('button', { name: 'Back to Form' })).toBeDisabled()
  );
  const event = new Event('navigate', { cancelable: true });
  Object.assign(event, {
    navigationType: 'traverse',
    destination: { key: 'previous', url: 'http://localhost/previous' },
  });
  act(() => navigation.dispatchEvent(event));
  expect(event.defaultPrevented).toBe(true);
  expect(
    screen.queryByRole('dialog', { name: 'Discard Form Corrections?' })
  ).not.toBeInTheDocument();
  await act(async () => finish());
});

it('validates the entire frozen form before requesting a reason and requires an audit reason', async () => {
  setup();
  fireEvent.change(screen.getByLabelText('Student name'), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save Corrections' }));
  expect(screen.getByRole('status', { name: 'Checking form…' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save Corrections' })).toBeDisabled();
  expect(await screen.findByText('Student name is required.')).toBeVisible();
  await waitFor(() => expect(screen.getByLabelText('Student name')).toHaveFocus());
  expect(api.save).not.toHaveBeenCalled();
  const dialog = await reasonDialog();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save Corrections' }));
  expect(await within(dialog).findByText('Enter a reason for this correction')).toBeVisible();
  expect(api.save).not.toHaveBeenCalled();
});

it('can save a visible correction when a hidden step has an unanswered required question', async () => {
  const { props } = setup({
    form: {
      ...form,
      definition: {
        ...form.definition,
        sections: [
          ...form.definition.sections,
          {
            id: 'hidden',
            code: 'hidden',
            name: 'Hidden',
            displayOrder: 1,
            stepVisibilityRuleJson: JSON.stringify({
              field: 'SHOW',
              operator: 'equals',
              value: 'yes',
            }),
            fields: [
              {
                id: 'required-hidden',
                code: 'HIDDEN',
                label: 'Hidden question',
                fieldType: 0,
                required: true,
              },
            ],
          },
        ],
      },
    } as Props['form'],
  });
  const dialog = await reasonDialog();
  await saveReason(dialog);
  await waitFor(() => expect(props.onSaved).toHaveBeenCalledOnce());
});

it('validates only the visible repeat row before saving an unrelated correction', async () => {
  const { props } = setup({
    form: {
      ...form,
      definition: {
        ...form.definition,
        sections: [
          ...form.definition.sections,
          {
            id: 'repeat',
            code: 'repeat',
            name: 'Repeat',
            displayOrder: 1,
            isRepeatable: true,
            minEntries: 1,
            maxEntries: 3,
            fields: [
              { id: 'show', code: 'SHOW', label: 'Show', fieldType: 0 },
              {
                id: 'row-email',
                code: 'ROW_EMAIL',
                label: 'Row email',
                fieldType: 3,
                required: true,
                visibilityRuleJson: JSON.stringify({
                  field: 'SHOW',
                  operator: 'equals',
                  value: 'yes',
                }),
              },
            ],
          },
        ],
      },
      values: [
        ...form.values,
        { fieldCode: 'SHOW', valueJson: JSON.stringify('["no","yes"]') },
        { fieldCode: 'ROW_EMAIL', valueJson: JSON.stringify('["","parent@example.com"]') },
      ],
    } as Props['form'],
  });
  const dialog = await reasonDialog();
  await saveReason(dialog);
  await waitFor(() => expect(props.onSaved).toHaveBeenCalledOnce());
});

it('sends only changed normalized answers with the original stamp and required reason', async () => {
  const { props } = setup();
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'PARENT@EXAMPLE.COM' } });
  const dialog = await reasonDialog();
  await saveReason(dialog);
  await waitFor(() => expect(props.onSaved).toHaveBeenCalledOnce());
  expect(api.save).toHaveBeenCalledWith({
    id: 'app',
    concurrencyStamp: 'saved-stamp',
    reason: 'Verified correction',
    idempotencyKey: expect.any(String),
    values: [{ fieldCode: 'NAME', valueJson: '"Corrected"' }],
  });
  expect(props.onRefresh).not.toHaveBeenCalled();
});

it('preserves edited answers and audit reason on a rejected save and displays the actual blocker', async () => {
  api.save.mockRejectedValue({
    status: 400,
    data: {
      data: {
        Reason: 'Joining date is locked by Finance.',
        FieldErrors: { NAME: 'Correct this name' },
      },
    },
  });
  setup();
  const dialog = await reasonDialog();
  await saveReason(dialog);
  expect(await within(dialog).findByText('Joining date is locked by Finance.')).toBeVisible();
  expect(within(dialog).getByRole('textbox', { name: /^Reason/ })).toHaveValue(
    '  Verified correction  '
  );
  fireEvent.click(within(dialog).getByRole('button', { name: 'Back to Form' }));
  await waitFor(() => expect(screen.getByLabelText('Student name')).toBeVisible());
  expect(screen.getByLabelText('Student name')).toHaveValue('Corrected');
  expect(screen.getByText('Correct this name')).toBeVisible();
});

it('freezes an unconfirmed command and retries the exact payload even after fresh capability is locked', async () => {
  api.save.mockRejectedValueOnce({ status: 'FETCH_ERROR' }).mockResolvedValueOnce({});
  const { props, rerenderProps } = setup();
  const dialog = await reasonDialog();
  await saveReason(dialog);
  expect(await within(dialog).findByText(/Save confirmation was not received/)).toBeVisible();
  const first = api.save.mock.calls[0][0];
  rerenderProps({ allowed: false });
  expect(within(dialog).getByRole('textbox', { name: /^Reason/ })).toBeDisabled();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Retry Save' }));
  await waitFor(() => expect(props.onSaved).toHaveBeenCalledOnce());
  expect(api.save).toHaveBeenCalledTimes(2);
  expect(api.save.mock.calls[1][0]).toEqual(first);
});

it('does not overwrite an edited answer or silently adopt a new stamp after a conflict', async () => {
  api.save.mockRejectedValue({
    status: 409,
    data: { data: { Reason: 'The application changed.' } },
  });
  const { props } = setup();
  const dialog = await reasonDialog();
  await saveReason(dialog);
  expect(
    await within(dialog).findByText(/The application changed.*reopen the latest application/)
  ).toBeVisible();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Back to Form' }));
  await waitFor(() => expect(screen.getByLabelText('Student name')).toBeVisible());
  expect(screen.getByLabelText('Student name')).toHaveValue('Corrected');
  expect(screen.getByLabelText('Student name')).toBeDisabled();
  fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
  const discard = await screen.findByRole('dialog', { name: 'Discard Form Corrections?' });
  fireEvent.click(within(discard).getByRole('button', { name: 'Discard Changes' }));
  expect(props.onClose).toHaveBeenCalledOnce();
  expect(props.onSaved).not.toHaveBeenCalled();
});

it('blocks close and duplicate saves during an in-flight correction', async () => {
  let finish!: () => void;
  api.save.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      })
  );
  const { props } = setup();
  const dialog = await reasonDialog();
  const staleChange = api.change;
  await saveReason(dialog);
  await waitFor(() => expect(api.save).toHaveBeenCalledOnce());
  expect(within(dialog).getByRole('button', { name: 'Back to Form' })).toBeDisabled();
  expect(within(dialog).getByRole('button', { name: 'close' })).toBeDisabled();
  expect(within(dialog).getByRole('textbox', { name: /^Reason/ })).toBeDisabled();
  act(() => staleChange?.('NAME', 'Late asynchronous answer'));
  expect(screen.getByLabelText('Student name')).toHaveValue('Corrected');
  await act(async () => finish());
  await waitFor(() => expect(props.onSaved).toHaveBeenCalledOnce());
});

it('locks close while a photo is being read and guards dirty discard', async () => {
  const { props } = setup();
  act(() => api.photo?.(true));
  expect(screen.getByRole('button', { name: 'Close Edit Application Form' })).toBeDisabled();
  act(() => api.change?.('NAME', 'Completed photo callback'));
  expect(screen.getByLabelText('Student name')).toHaveValue('Completed photo callback');
  act(() => api.photo?.(false));
  fireEvent.change(screen.getByLabelText('Student name'), { target: { value: 'Corrected' } });
  fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
  expect(await screen.findByRole('dialog', { name: 'Discard Form Corrections?' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Keep Editing' }));
  expect(props.onClose).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Student name')).toHaveValue('Corrected');
});

it('refreshes instead of claiming success when closing an unconfirmed save', async () => {
  api.save.mockRejectedValue({ status: 500 });
  const { props } = setup();
  const dialog = await reasonDialog();
  await saveReason(dialog);
  expect(await within(dialog).findByText(/Save confirmation was not received/)).toBeVisible();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Back to Form' }));
  await waitFor(() => expect(screen.getByLabelText('Student name')).toBeVisible());
  fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
  const discard = await screen.findByRole('dialog', { name: 'Discard Form Corrections?' });
  fireEvent.click(within(discard).getByRole('button', { name: 'Discard Changes' }));
  expect(props.onRefresh).toHaveBeenCalledOnce();
  expect(props.onSaved).not.toHaveBeenCalled();
});
