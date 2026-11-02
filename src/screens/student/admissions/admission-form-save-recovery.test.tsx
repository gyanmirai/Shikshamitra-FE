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
  }: {
    activeStep: number;
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
        onClick={() => handleNext(activeStep === 2, formik.values, formik, () => undefined)}
      >
        {activeStep === 2 ? 'Publish now' : 'Continue'}
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
  }: {
    formik: FormikProps<CreateUpdateAdmissionForm>;
    activeStep: number;
  }) => (
    <>
      <input
        aria-label="Form name"
        value={formik.values.name}
        onChange={(event) => formik.setFieldValue('name', event.target.value)}
      />
      <output aria-label="Revision">{formik.values.concurrencyStamp}</output>
      <output aria-label="Current step">{activeStep}</output>
    </>
  ),
}));

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
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(screen.getByLabelText('Current step')).toHaveTextContent('1'));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(screen.getByLabelText('Current step')).toHaveTextContent('2'));
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
