import type { FormikProps } from 'formik';
import type {
  AdmissionForm,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { it, vi, expect, describe } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { shikshaMitraToast } from 'src/components/toast';

import { useAdmissionFormWizard } from './use-admission-form-wizard';
import { getBlankAdmissionFormInitialValues } from '../form-dialog-model';

vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: vi.fn() } }));

describe('admission form wizard identity', () => {
  it('omits dormant Registration inheritance when saving a new form switched to Inquiry', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const values = {
      ...getBlankAdmissionFormInitialValues(0),
      name: 'Inquiry',
      inheritance: {
        enabled: true,
        sources: [
          {
            inquiryFormDefinitionId: 'source',
            requiredFieldIdentities: [],
            fieldMappings: [],
            layouts: [],
          },
        ],
      },
    };
    const { result } = renderHook(() =>
      useAdmissionFormWizard({ onSave, onPublishNow: vi.fn(), onClose: vi.fn() })
    );
    const formik = { resetForm: vi.fn() } as unknown as FormikProps<CreateUpdateAdmissionForm>;
    await act(async () => result.current.saveDraft(false, values, formik, vi.fn()));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ purpose: 0, inheritance: undefined })
    );
    expect(values.inheritance.enabled).toBe(true);
  });
  it('allows entering the builder but blocks Continue and Publish until inherited compatibility is current', async () => {
    const canContinue = vi.fn(() => false);
    const onPublishNow = vi.fn();
    const values = {
      ...getBlankAdmissionFormInitialValues(1),
      inheritance: {
        enabled: true,
        sources: [
          {
            inquiryFormDefinitionId: 'source',
            requiredFieldIdentities: [],
            fieldMappings: [],
            layouts: [],
          },
        ],
      },
    };
    const { result } = renderHook(() =>
      useAdmissionFormWizard({ onSave: vi.fn(), onPublishNow, onClose: vi.fn(), canContinue })
    );
    const formik = { resetForm: vi.fn() } as unknown as FormikProps<CreateUpdateAdmissionForm>;
    await act(async () => result.current.next(false, values, formik, vi.fn()));
    expect(result.current.activeStep).toBe(1);
    await act(async () => result.current.next(false, values, formik, vi.fn()));
    expect(result.current.activeStep).toBe(1);
    act(() => result.current.goTo(2));
    expect(result.current.activeStep).toBe(1);
    canContinue.mockReturnValue(true);
    await act(async () => result.current.next(false, values, formik, vi.fn()));
    expect(result.current.activeStep).toBe(2);
    canContinue.mockReturnValue(false);
    await act(async () => result.current.next(true, values, formik, vi.fn()));
    expect(onPublishNow).not.toHaveBeenCalled();
  });
  it('keeps an incomplete Inquiry editable as a draft but prevents publishing unconfigured identity', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onPublishNow = vi.fn();
    const values = { ...getBlankAdmissionFormInitialValues(0), name: 'Inquiry form' };
    // A historical incomplete draft is still saveable; new Inquiry defaults are valid.
    values.sections[0].fields = [];
    const { result } = renderHook(() =>
      useAdmissionFormWizard({ onSave, onPublishNow, onClose: vi.fn() })
    );
    const formik = { resetForm: vi.fn() } as unknown as FormikProps<CreateUpdateAdmissionForm>;
    await act(async () => result.current.saveDraft(true, values, formik, vi.fn()));
    expect(onSave).toHaveBeenCalledOnce();
    await act(async () => result.current.next(true, values, formik, vi.fn()));
    expect(onPublishNow).not.toHaveBeenCalled();
    expect(shikshaMitraToast.error).toHaveBeenCalledWith({
      message: expect.stringContaining(
        'Add a required Parent / Guardian mobile field before publishing.'
      ),
    });
    expect(result.current.submitting).toBe(false);
  });

  it('requests a generated code when saving a new form from a template', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useAdmissionFormWizard({ onSave, onPublishNow: vi.fn(), onClose })
    );
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
    const { result } = renderHook(() => useAdmissionFormWizard({ onSave, onPublishNow, onClose }));
    const values = { ...getBlankAdmissionFormInitialValues(), name: ' Inquiry form ' };
    const formik = { resetForm: vi.fn() } as unknown as FormikProps<CreateUpdateAdmissionForm>;

    await act(async () => result.current.next(true, values, formik, vi.fn()));

    expect(onSave).not.toHaveBeenCalled();
    expect(onPublishNow).toHaveBeenCalledWith(expect.objectContaining({ name: 'Inquiry form' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
