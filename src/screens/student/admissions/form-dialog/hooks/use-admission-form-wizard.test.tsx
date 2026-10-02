import type { FormikProps } from 'formik';
import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { it, vi, expect, describe } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useAdmissionFormWizard } from './use-admission-form-wizard';
import { getBlankAdmissionFormInitialValues } from '../form-dialog-model';

describe('admission form wizard identity', () => {
  it('requests a generated code when saving a new form from a template', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const { result } = renderHook(() => useAdmissionFormWizard({ onSave, onPublishNow: vi.fn(), onClose }));
    const values = {
      ...getBlankAdmissionFormInitialValues(),
      name: ' New form ',
      code: 'TEMPLATE',
    };
    const formik = { resetForm: vi.fn() } as unknown as FormikProps<CreateUpdateAdmissionForm>;

    await act(async () => result.current.saveDraft(true, values, formik, vi.fn()));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'New form', code: '' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('preserves the original version-family code when renaming an existing draft', async () => {
    const values = getBlankAdmissionFormInitialValues();
    const editing = {
      ...values,
      id: 'form-1',
      code: 'ORIGINAL',
      version: 2,
      status: 0,
    } as AdmissionForm;
    const onSave = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAdmissionFormWizard({ editing, onSave, onPublishNow: vi.fn(), onClose: vi.fn() })
    );
    const formik = { resetForm: vi.fn() } as unknown as FormikProps<CreateUpdateAdmissionForm>;

    await act(async () =>
      result.current.saveDraft(true, { ...values, name: 'Renamed form', code: '' }, formik, vi.fn())
    );

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Renamed form', code: 'ORIGINAL' })
    );
  });

  it('publishes from the final step without invoking the draft-only action', async () => {
    const onSave = vi.fn();
    const onPublishNow = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useAdmissionFormWizard({ onSave, onPublishNow, onClose })
    );
    const values = { ...getBlankAdmissionFormInitialValues(), name: ' Inquiry form ' };
    const formik = { resetForm: vi.fn() } as unknown as FormikProps<CreateUpdateAdmissionForm>;

    await act(async () => result.current.next(true, values, formik, vi.fn()));

    expect(onSave).not.toHaveBeenCalled();
    expect(onPublishNow).toHaveBeenCalledWith(expect.objectContaining({ name: 'Inquiry form' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
