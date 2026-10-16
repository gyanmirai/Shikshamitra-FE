import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { skipToken } from '@reduxjs/toolkit/query';

import { useApplicationDetail } from './use-application-detail';

const requests = vi.hoisted(() => ({
  update: vi.fn(),
  submit: vi.fn(),
  end: vi.fn(),
  formStage: vi.fn(),
  form: vi.fn(),
  history: vi.fn(),
  workflow: vi.fn(),
}));
const context = vi.hoisted(() => ({
  manage: false,
  canEndJourney: true,
  stageId: 'current-form',
  applicationLoaded: true,
}));
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn(), info: vi.fn() }));
const application = { id: 'application', concurrencyStamp: 'current', status: 0 };
const form = {
  values: [],
  definition: {
    sections: [
      {
        id: 'student',
        fields: [{ code: 'FirstName', label: 'First name', fieldType: 0, required: true }],
      },
      {
        id: 'address',
        fields: [
          {
            code: 'City',
            label: 'City',
            fieldType: 0,
            required: true,
            validationJson: JSON.stringify({ format: 'city' }),
          },
        ],
      },
    ],
  },
};

vi.mock('src/components/toast', () => ({ shikshaMitraToast: toast }));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({
      auth: {
        permissions: [{ name: 'Students.Admissions.Applications.Add', isGranted: context.manage }],
      },
    }),
}));
vi.mock('src/redux/student/admissions/admission-form-stage-api', () => ({
  useGetAdmissionFormStageQuery: (input: unknown) => {
    requests.formStage(input);
    return {};
  },
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => {
  const mutation = () => [vi.fn(), { isLoading: false }];
  return {
    useGetAdmissionApplicationQuery: () => ({
      data: context.applicationLoaded
        ? { ...application, canEndJourney: context.canEndJourney }
        : undefined,
    }),
    useGetAdmissionApplicationFormQuery: (input: unknown) => {
      requests.form(input);
      return { data: input === skipToken ? undefined : form };
    },
    useGetAdmissionApplicationWorkflowQuery: (input: unknown) => {
      requests.workflow(input);
      return {
        data: {
          currentStageInstanceId: context.stageId,
          stages: [
            { id: 'current-form', stageType: 1, formStageEnabled: true },
            { id: 'future-form', stageType: 1, formStageEnabled: true },
            { id: 'documents', stageType: 5, formStageEnabled: false },
          ],
        },
      };
    },
    useGetAdmissionApplicationFormHistoryQuery: (input: unknown) => {
      requests.history(input);
      return {};
    },
    useUpdateAdmissionApplicationFormValuesMutation: () => [requests.update, { isLoading: false }],
    useSubmitAdmissionApplicationMutation: () => [requests.submit, { isLoading: false }],
    useReopenAdmissionApplicationFormMutation: mutation,
    useAdvanceAdmissionApplicationWorkflowMutation: mutation,
    useEndAdmissionApplicationJourneyMutation: () => [requests.end, { isLoading: false }],
  };
});

describe('application answer validation timing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    context.manage = false;
    context.canEndJourney = true;
    context.stageId = 'current-form';
    context.applicationLoaded = true;
    requests.end.mockReturnValue({ unwrap: async () => ({ status: 2 }) });
    requests.update.mockReturnValue({ unwrap: async () => ({}) });
    requests.submit.mockReturnValue({
      unwrap: async () => ({ validationErrors: [], fieldErrors: {} }),
    });
  });

  it('starts workflow without waiting for the application response', () => {
    context.applicationLoaded = false;
    renderHook(() => useApplicationDetail('application'));
    expect(requests.workflow).toHaveBeenLastCalledWith('application');
    expect(requests.form).toHaveBeenLastCalledWith(skipToken);
    expect(requests.history).toHaveBeenLastCalledWith(skipToken);
  });

  it('does not fetch form answers or history for the document journey', () => {
    context.stageId = 'documents';
    const { result } = renderHook(() => useApplicationDetail('application'));
    expect(requests.form).toHaveBeenLastCalledWith(skipToken);
    expect(requests.history).toHaveBeenLastCalledWith(skipToken);
    expect(requests.formStage).toHaveBeenLastCalledWith(skipToken);
    expect(result.current.requiresForm).toBe(false);
  });

  it('loads form answers and history only when their view is opened', () => {
    context.stageId = 'documents';
    const { rerender } = renderHook(
      ({ view }: { view: 'form' | 'history' | 'journey' }) =>
        useApplicationDetail('application', undefined, view),
      { initialProps: { view: 'journey' } }
    );
    rerender({ view: 'form' });
    expect(requests.form).toHaveBeenLastCalledWith('application');
    expect(requests.history).toHaveBeenLastCalledWith(skipToken);
    rerender({ view: 'history' });
    expect(requests.form).toHaveBeenLastCalledWith(skipToken);
    expect(requests.history).toHaveBeenLastCalledWith('application');
    rerender({ view: 'journey' });
    expect(requests.history).toHaveBeenLastCalledWith(skipToken);
  });

  it('loads the selected future form policy without submitting or advancing', () => {
    renderHook(() => useApplicationDetail('application', 'future-form'));
    expect(requests.formStage).toHaveBeenLastCalledWith({
      applicationId: 'application',
      stageId: 'future-form',
    });
    expect(requests.submit).not.toHaveBeenCalled();
  });

  it('requires permission, business eligibility and a nonempty reason before ending', async () => {
    const { result, rerender } = renderHook(() => useApplicationDetail('application'));
    await act(async () => expect(await result.current.endJourney('Parent withdrew')).toBe(false));
    context.manage = true;
    rerender();
    await act(async () => expect(await result.current.endJourney('   ')).toBe(false));
    context.canEndJourney = false;
    rerender();
    await act(async () => expect(await result.current.endJourney('Parent withdrew')).toBe(false));
    expect(requests.end).not.toHaveBeenCalled();
  });

  it('sends the trimmed audit reason and stamp and reports failures without clearing answers', async () => {
    context.manage = true;
    const { result } = renderHook(() => useApplicationDetail('application'));
    await act(async () => result.current.setFieldValue('FirstName', 'Vivaan'));
    requests.end.mockReturnValue({
      unwrap: async () => {
        throw Object.assign(new Error('Application changed'), {
          data: { detail: 'Application changed. Refresh and try again.' },
        });
      },
    });
    await act(async () =>
      expect(await result.current.endJourney('  Parent withdrew  ')).toBe(false)
    );
    expect(result.current.currentValues.FirstName).toBe('Vivaan');
    expect(requests.end).toHaveBeenCalledWith({
      id: 'application',
      input: { reason: 'Parent withdrew', concurrencyStamp: 'current' },
    });
    expect(toast.error).toHaveBeenCalledWith({
      message: 'Application changed. Refresh and try again.',
    });
    requests.end.mockReturnValue({ unwrap: async () => ({ status: 2 }) });
    await act(async () => expect(await result.current.endJourney('Parent withdrew')).toBe(true));
    expect(result.current.hasUnsavedAnswers).toBe(false);
  });

  it('validates only the blurred field without showing errors for later steps', async () => {
    const { result } = renderHook(() => useApplicationDetail('application'));
    await act(async () => result.current.setFieldTouched('FirstName'));

    expect(result.current.fieldErrors).toEqual({ FirstName: 'First name is required.' });
    expect(requests.update).not.toHaveBeenCalled();
    expect(requests.submit).not.toHaveBeenCalled();
  });

  it('clears a corrected city error before blur and keeps the current selection on immediate blur', async () => {
    const { result } = renderHook(() => useApplicationDetail('application'));
    await act(async () => result.current.setFieldTouched('City'));
    expect(result.current.fieldErrors.City).toBe('City is required.');

    // Autocomplete can change its value and blur within the same event/render.
    const { setFieldValue, setFieldTouched } = result.current;
    await act(async () => setFieldValue('City', JSON.stringify({ name: 'Surat' })));
    expect(result.current.fieldErrors.City).toBeUndefined();
    await act(async () => setFieldTouched('City'));

    expect(result.current.currentValues.City).toBe(JSON.stringify({ name: 'Surat' }));
    expect(result.current.fieldErrors).toEqual({});
    act(() => expect(result.current.validateStep('address')).toBe(true));
  });

  it('revalidates an edited touched field and still blocks an incomplete step', async () => {
    const { result } = renderHook(() => useApplicationDetail('application'));
    await act(async () => result.current.setFieldValue('FirstName', 'Vivaan'));
    await act(async () => result.current.setFieldTouched('FirstName'));
    await act(async () => result.current.setFieldValue('FirstName', ''));

    expect(result.current.fieldErrors.FirstName).toBe('First name is required.');
    act(() => expect(result.current.validateStep('student')).toBe(false));
    expect(requests.update).not.toHaveBeenCalled();
  });

  it('uses the selected value when change and blur run before another render', async () => {
    const { result } = renderHook(() => useApplicationDetail('application'));
    const { setFieldValue, setFieldTouched } = result.current;
    await act(async () => {
      await Promise.all([
        setFieldValue('City', JSON.stringify({ name: 'Surat' })),
        setFieldTouched('City'),
      ]);
    });

    expect(result.current.fieldErrors).toEqual({});
    expect(result.current.currentValues.City).toBe(JSON.stringify({ name: 'Surat' }));
  });

  it('validates the complete form on submit before making any write request', async () => {
    const { result } = renderHook(() => useApplicationDetail('application'));
    await act(async () => result.current.setFieldValue('FirstName', 'Vivaan'));
    await act(async () => result.current.submitApplication());

    expect(result.current.fieldErrors).toEqual({ City: 'City is required.' });
    expect(requests.update).not.toHaveBeenCalled();
    expect(requests.submit).not.toHaveBeenCalled();
  });

  it('submits valid answers once while preserving an unrelated server field error during edits', async () => {
    const { result } = renderHook(() => useApplicationDetail('application'));
    await act(async () => result.current.setFieldValue('FirstName', 'Vivaan'));
    await act(async () => result.current.setFieldValue('City', JSON.stringify({ name: 'Surat' })));
    requests.submit.mockReturnValue({
      unwrap: async () => ({
        validationErrors: ['Review city'],
        fieldErrors: { City: 'Review city' },
      }),
    });
    await act(async () => result.current.submitApplication());
    await act(async () => result.current.setFieldValue('FirstName', 'Vivaan Sharma'));

    expect(result.current.fieldErrors.City).toBe('Review city');
    expect(requests.update).toHaveBeenCalledOnce();
    expect(requests.submit).toHaveBeenCalledOnce();
  });
});
