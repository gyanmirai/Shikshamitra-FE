import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';
import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import { it, vi, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { AdmissionFormDialog } from './admission-form-dialog';
import { getBlankAdmissionFormInitialValues } from './form-dialog/form-dialog-model';
import { UnchangedAdmissionFormError } from './form-list/form-validation-errors';

const checkName = vi.hoisted(() => vi.fn(() => ({ unwrap: async () => ({ isAvailable: true }) })));

vi.mock('src/redux/student/admissions/admission-forms-api', () => ({
  useLazyCheckAdmissionFormNameQuery: () => [checkName],
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: vi.fn() } }));
// Keep the real editor, Formik and wizard. Isolate presentation, already covered by the dialog UI suite.
vi.mock('src/components/customDialog', () => ({
  default: ({ children }: { children: ReactNode }) => <section>{children}</section>,
  DialogScrollContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/components/custom-stepper', () => ({
  CustomStepperWithFormik: ({
    activeStep,
    formikInstance: formik,
    handleNext,
    onSave,
    renderItem,
    saveAndNextButtonProps,
    steps,
  }: {
    activeStep: number;
    steps: unknown[];
    saveAndNextButtonProps: { disabled?: boolean };
    formikInstance: FormikProps<CreateUpdateAdmissionForm>;
    handleNext: (
      last: boolean,
      values: CreateUpdateAdmissionForm,
      formik: FormikProps<CreateUpdateAdmissionForm>,
      loading: (busy: boolean) => void
    ) => Promise<void>;
    onSave: (
      last: boolean,
      values: CreateUpdateAdmissionForm,
      formik: FormikProps<CreateUpdateAdmissionForm>,
      loading: (busy: boolean) => void
    ) => Promise<void>;
    renderItem: (props: { formik: FormikProps<CreateUpdateAdmissionForm> }) => ReactNode;
  }) => (
    <>
      {renderItem({ formik })}
      <button
        type="button"
        disabled={saveAndNextButtonProps.disabled}
        onClick={() =>
          handleNext(activeStep === steps.length - 1, formik.values, formik, () => undefined)
        }
      >
        {activeStep === steps.length - 1 ? 'Publish now' : 'Continue'}
      </button>
      <button
        type="button"
        onClick={() => onSave(activeStep === 2, formik.values, formik, () => undefined)}
      >
        Save draft
      </button>
    </>
  ),
}));
vi.mock('./form-dialog/components/form-builder-wizard-content', () => ({
  FormBuilderWizardContent: ({
    formik,
    activeStep,
    publishMessage,
  }: {
    formik: FormikProps<CreateUpdateAdmissionForm>;
    activeStep: number;
    publishMessage?: string;
  }) => (
    <>
      <input
        aria-label="Form name"
        value={formik.values.name}
        onChange={(event) => formik.setFieldValue('name', event.target.value)}
      />
      <output aria-label="Revision">{formik.values.concurrencyStamp}</output>
      <output aria-label="Current step">{activeStep}</output>
      {publishMessage && <div role="alert">{publishMessage}</div>}
    </>
  ),
}));

async function continueToStep(step: number) {
  const next = screen.getByRole('button', { name: 'Continue' });
  await waitFor(() => expect(next).toBeEnabled());
  fireEvent.click(next);
  await waitFor(() => expect(screen.getByLabelText('Current step')).toHaveTextContent(String(step)));
}

it.each([0, 1] as const)(
  'blocks a reopened unchanged draft while allowing editing and draft saves (purpose=%s)',
  async (purpose) => {
    const draft = {
      ...getBlankAdmissionFormInitialValues(purpose),
      name: 'Version two',
      id: 'draft',
      version: 2,
      status: 0,
      concurrencyStamp: 'saved-stamp',
    } as AdmissionForm;
    const message =
      'This draft matches published v1. Make a change before publishing, or keep using v1.';
    const check = vi.fn().mockResolvedValue(message);
    const save = vi.fn().mockResolvedValue(undefined);
    render(
      <AdmissionFormDialog
        open
        editing={draft}
        checkUnchangedVersion={check}
        onClose={vi.fn()}
        saving={false}
        onSave={save}
        onPublishNow={vi.fn()}
      />
    );
    await continueToStep(1);
    await continueToStep(2);
    if (purpose === 1) await continueToStep(3);
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(check).toHaveBeenCalledExactlyOnceWith('draft');
    expect(screen.getByRole('button', { name: 'Publish now' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save draft' })).toBeEnabled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Form name' }), {
      target: { value: 'Corrected version two' },
    });
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('button', { name: 'Publish now' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
  }
);

it('keeps a server rejection visible and allows publication after a further edit', async () => {
  const draft = {
    ...getBlankAdmissionFormInitialValues(0),
    name: 'Version two',
    id: 'draft',
    version: 2,
    status: 0,
    concurrencyStamp: 'saved-stamp',
  } as AdmissionForm;
  const message =
    'This draft matches published v1. Make a change before publishing, or keep using v1.';
  const publish = vi
    .fn()
    .mockRejectedValueOnce(new UnchangedAdmissionFormError(message))
    .mockResolvedValueOnce(undefined);
  render(
    <AdmissionFormDialog
      open
      editing={draft}
      onClose={vi.fn()}
      saving={false}
      onSave={vi.fn()}
      onPublishNow={publish}
    />
  );
  await continueToStep(1);
  await continueToStep(2);
  fireEvent.click(screen.getByRole('button', { name: 'Publish now' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(message);
  expect(screen.getByRole('button', { name: 'Publish now' })).toBeDisabled();
  fireEvent.change(screen.getByRole('textbox', { name: 'Form name' }), {
    target: { value: 'Changed Inquiry' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Publish now' }));
  await waitFor(() => expect(publish).toHaveBeenCalledTimes(2));
});

it.each([
  { existing: false, action: 'Save draft' },
  { existing: true, action: 'Save draft' },
  { existing: false, action: 'Publish now' },
  { existing: true, action: 'Publish now' },
])(
  'retains values and review position before $action retry (existing=$existing)',
  async ({ existing, action }) => {
    const original = {
      ...getBlankAdmissionFormInitialValues(0),
      name: 'Original Inquiry',
      code: 'FORM_RECOVERY',
      id: 'recovery-form',
      version: 1,
      status: 0,
      concurrencyStamp: 'before-save',
    } as AdmissionForm;
    const save = vi.fn().mockResolvedValue(undefined);
    const publish = vi.fn();
    const close = vi.fn();
    function RecoveryEditor() {
      const [editing, setEditing] = useState<AdmissionForm | null>(existing ? original : null);
      return (
        <AdmissionFormDialog
          open
          editingId={editing?.id}
          editing={editing}
          initialPurpose={0}
          saving={false}
          onClose={close}
          onSave={save}
          onPublishNow={async (values) => {
            publish(values);
            if (publish.mock.calls.length === 1) {
              setEditing({
                ...original,
                ...values,
                concurrencyStamp: 'after-save',
              } as AdmissionForm);
              throw new Error('Draft saved, but not published. Correct the field choices.');
            }
          }}
        />
      );
    }
    render(<RecoveryEditor />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Form name' }), {
      target: { value: 'Preserved Inquiry' },
    });
    await continueToStep(1);
    await continueToStep(2);
    fireEvent.click(screen.getByRole('button', { name: 'Publish now' }));
    await waitFor(() => expect(screen.getByLabelText('Revision')).toHaveTextContent('after-save'));
    expect(screen.getByRole('textbox', { name: 'Form name' })).toHaveValue('Preserved Inquiry');
    expect(screen.getByLabelText('Current step')).toHaveTextContent('2');
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: action }));
    if (action === 'Publish now') {
      await waitFor(() => expect(publish).toHaveBeenCalledTimes(2));
      expect(publish.mock.calls[1][0]).toMatchObject({
        name: 'Preserved Inquiry',
        concurrencyStamp: 'after-save',
      });
    } else {
      await waitFor(() => expect(save).toHaveBeenCalledOnce());
      expect(save.mock.calls[0][0]).toMatchObject({
        name: 'Preserved Inquiry',
        concurrencyStamp: 'after-save',
      });
      expect(publish).toHaveBeenCalledOnce();
    }
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
  }
);

it('retains the prior revision and entered fields after a genuine conflict without an acknowledged save', async () => {
  const original = {
    ...getBlankAdmissionFormInitialValues(0),
    name: 'Inquiry',
    code: 'FORM_CONFLICT',
    id: 'conflict-form',
    version: 1,
    status: 0,
    concurrencyStamp: 'original-revision',
  } as AdmissionForm;
  const close = vi.fn();
  const save = vi.fn().mockRejectedValue(new Error('Admissions.FormConcurrencyConflict'));
  render(
    <AdmissionFormDialog
      open
      editingId={original.id}
      editing={original}
      saving={false}
      onClose={close}
      onSave={save}
      onPublishNow={vi.fn()}
    />
  );
  fireEvent.change(screen.getByRole('textbox', { name: 'Form name' }), {
    target: { value: 'Unsaved correction' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
  await waitFor(() => expect(save).toHaveBeenCalledOnce());
  expect(screen.getByRole('textbox', { name: 'Form name' })).toHaveValue('Unsaved correction');
  expect(screen.getByLabelText('Revision')).toHaveTextContent('original-revision');
  expect(close).not.toHaveBeenCalled();
});
