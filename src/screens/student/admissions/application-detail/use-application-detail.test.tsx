import { skipToken } from '@reduxjs/toolkit/query';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useApplicationDetail } from './use-application-detail';

const requests = vi.hoisted(() => ({
  update: vi.fn(),
  submit: vi.fn(),
  end: vi.fn(),
  formStage: vi.fn(),
  form: vi.fn(),
  history: vi.fn(),
  workflow: vi.fn(),
  advance: vi.fn(),
  applicationRefetch: vi.fn(),
  workflowRefetch: vi.fn(),
}));
const context = vi.hoisted(() => ({
  manage: false,
  canEndJourney: true,
  stageId: 'current-form',
  applicationLoaded: true,
  emailForm: false,
  readonlyInherited: false,
  formOverride: null as Record<string, unknown> | null,
  staleForm: false,
  stamp: 'current',
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
const emailForm = {
  values: [
    { fieldCode: 'EMAIL', valueJson: '"Existing@Example.COM"' },
    { fieldCode: 'NOTE', valueJson: '"KEEP Case"' },
  ],
  definition: {
    sections: [
      {
        fields: [
          { code: 'EMAIL', fieldType: 3 },
          { code: 'NOTE', fieldType: 0 },
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
    useGetAdmissionApplicationQuery: (id: string) => ({
      refetch: requests.applicationRefetch,
      data: context.applicationLoaded
        ? {
            ...application,
            id,
            concurrencyStamp: context.stamp,
            canEndJourney: context.canEndJourney,
          }
        : undefined,
    }),
    useGetAdmissionApplicationFormQuery: (input: unknown) => {
      requests.form(input);
      const data =
        context.formOverride ??
        (input === skipToken
          ? undefined
          : context.emailForm
            ? context.readonlyInherited
              ? {
                  ...emailForm,
                  definition: {
                    ...emailForm.definition,
                    inheritance: { enabled: true, sources: [] },
                    sections: emailForm.definition.sections.map((section) => ({
                      ...section,
                      fields: section.fields.map((field) => ({
                        ...field,
                        readOnly: field.code === 'EMAIL',
                      })),
                    })),
                  },
                }
              : emailForm
            : form);
      return { data, currentData: context.staleForm ? undefined : data };
    },
    useGetAdmissionApplicationWorkflowQuery: (input: unknown) => {
      requests.workflow(input);
      return {
        refetch: requests.workflowRefetch,
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
    useAdvanceAdmissionApplicationWorkflowMutation: () => [requests.advance, { isLoading: false }],
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
    context.emailForm = false;
    context.readonlyInherited = false;
    context.formOverride = null;
    context.staleForm = false;
    context.stamp = 'current';
    requests.applicationRefetch.mockReset().mockReturnValue({ unwrap: async () => application });
    requests.workflowRefetch.mockReset().mockReturnValue({ unwrap: async () => ({ stages: [] }) });
    requests.end.mockReturnValue({ unwrap: async () => ({ status: 2 }) });
    requests.update.mockReturnValue({ unwrap: async () => ({}) });
    requests.submit.mockReturnValue({
      unwrap: async () => ({ validationErrors: [], fieldErrors: {} }),
    });
  });

  const familyForm = (
    values = { PARENT: 'Saved father', CHILD: 'Priya', NOTE: 'Manual note' }
  ) => ({
    ...form,
    autoFilledFieldCodes: ['PARENT', 'PARENT', 'UNKNOWN', 'LOCKED'],
    familyPrefill: {
      sourceApplicantId: 'sibling',
      sourceApplicantName: 'Riya',
      relationship: 'father',
    },
    values: Object.entries(values).map(([fieldCode, value]) => ({
      fieldCode,
      valueJson: JSON.stringify(value),
    })),
    definition: {
      sections: [
        {
          id: 'parent',
          fields: [
            { code: 'PARENT', label: 'Parent name', fieldType: 0 },
            { code: 'CHILD', label: 'Child name', fieldType: 0 },
            { code: 'NOTE', label: 'Notes', fieldType: 0 },
            { code: 'LOCKED', label: 'Frozen field', fieldType: 0, readOnly: true },
          ],
        },
      ],
    },
  });

  it('saves exactly the writable projected fields without requiring an edit and does not repeat the write', async () => {
    context.formOverride = {
      ...familyForm(),
      values: [
        ...familyForm().values,
        { fieldCode: 'LOCKED', valueJson: '"Frozen parent answer"' },
        { fieldCode: 'UNKNOWN', valueJson: '"Not in this form"' },
      ],
    };
    const { result } = renderHook(() => useApplicationDetail('application'));
    expect(result.current.currentValues).toEqual({
      PARENT: 'Saved father',
      CHILD: 'Priya',
      NOTE: 'Manual note',
      LOCKED: 'Frozen parent answer',
      UNKNOWN: 'Not in this form',
    });
    await act(async () => expect(await result.current.save()).toBe(true));
    expect(requests.update).toHaveBeenCalledWith({
      id: 'application',
      concurrencyStamp: 'current',
      values: [{ fieldCode: 'PARENT', valueJson: '"Saved father"' }],
      autoFilledFieldCodes: ['PARENT'],
    });
    await act(async () => expect(await result.current.save()).toBe(true));
    expect(requests.update).toHaveBeenCalledOnce();
  });

  it('keeps an explicit clear in the PATCH and does not restore it after the persisted response', async () => {
    context.formOverride = familyForm();
    const { result, rerender } = renderHook(() => useApplicationDetail('application'));
    await act(async () => result.current.setFieldValue('PARENT', ''));
    await act(async () => expect(await result.current.save()).toBe(true));
    expect(requests.update.mock.calls[0][0].values).toEqual([
      { fieldCode: 'PARENT', valueJson: '""' },
    ]);
    context.formOverride = {
      ...familyForm({ PARENT: '', CHILD: 'Priya', NOTE: 'Manual note' }),
      autoFilledFieldCodes: [],
    };
    rerender();
    expect(result.current.currentValues.PARENT).toBe('');
    await act(async () => result.current.save());
    expect(requests.update).toHaveBeenCalledOnce();
  });

  it.each([
    { order: ['CANONICAL', 'GENERIC'], edited: 'CANONICAL', value: 'Doctor', hint: ['GENERIC'] },
    { order: ['GENERIC', 'CANONICAL'], edited: 'GENERIC', value: 'Doctor', hint: ['CANONICAL'] },
    { order: ['CANONICAL', 'GENERIC'], edited: 'CANONICAL', value: '', hint: ['GENERIC'] },
    { order: ['GENERIC', 'CANONICAL'], edited: 'GENERIC', value: '', hint: ['CANONICAL'] },
  ])(
    'hints only the untouched projected alias when $edited is authored as "$value"',
    async ({ order, edited, value, hint }) => {
      context.formOverride = {
        ...familyForm(),
        autoFilledFieldCodes: order,
        values: order.map((fieldCode) => ({ fieldCode, valueJson: '"Teacher"' })),
        definition: {
          sections: [
            { id: 'parent', fields: order.map((code) => ({ code, label: code, fieldType: 0 })) },
          ],
        },
      };
      const { result } = renderHook(() => useApplicationDetail('application'));
      await act(async () => result.current.setFieldValue(edited, value));
      await act(async () => expect(await result.current.save()).toBe(true));
      expect(requests.update.mock.calls[0][0].autoFilledFieldCodes).toEqual(hint);
      expect(requests.update.mock.calls[0][0].values).toContainEqual({
        fieldCode: edited,
        valueJson: JSON.stringify(value),
      });
      expect(requests.update.mock.calls[0][0].values).toContainEqual({
        fieldCode: hint[0],
        valueJson: '"Teacher"',
      });
      expect(requests.update.mock.calls[0][0].values).toHaveLength(2);
    }
  );

  it('compares normalized projection and initial values when deriving optional autofill hints', async () => {
    context.emailForm = true;
    context.formOverride = { ...emailForm, autoFilledFieldCodes: ['EMAIL'] };
    const { result } = renderHook(() => useApplicationDetail('application'));
    await act(async () => expect(await result.current.save()).toBe(true));
    expect(requests.update).toHaveBeenCalledWith({
      id: 'application',
      concurrencyStamp: 'current',
      values: [{ fieldCode: 'EMAIL', valueJson: '"existing@example.com"' }],
      autoFilledFieldCodes: ['EMAIL'],
    });
  });

  it('omits optional autofill hints when every projected answer was edited or cleared', async () => {
    context.formOverride = familyForm();
    const { result } = renderHook(() => useApplicationDetail('application'));
    await act(async () => result.current.setFieldValue('PARENT', ''));
    await act(async () => result.current.save());
    expect(requests.update.mock.calls[0][0]).not.toHaveProperty('autoFilledFieldCodes');
  });

  it('does not attach a newer application stamp to an older edited form baseline', async () => {
    context.formOverride = familyForm();
    const { result, rerender } = renderHook(() => useApplicationDetail('application'));
    await act(async () => result.current.setFieldValue('NOTE', 'My local note'));
    context.stamp = 'parent-saved-stamp';
    context.formOverride = familyForm({
      PARENT: 'Parent changed',
      CHILD: 'Priya',
      NOTE: 'Parent note',
    });
    rerender();
    await act(async () => expect(await result.current.save()).toBe(false));
    expect(requests.update).not.toHaveBeenCalled();
    expect(result.current.currentValues.NOTE).toBe('My local note');
    expect(toast.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/changed|refresh/i) })
    );
  });

  it('merges a refreshed form into untouched fields while preserving edits and deliberate clears', async () => {
    context.formOverride = familyForm();
    const { result, rerender } = renderHook(() => useApplicationDetail('application'));
    await act(async () => result.current.setFieldValue('PARENT', ''));
    await act(async () => result.current.setFieldValue('NOTE', 'Typed note'));
    context.formOverride = familyForm({
      PARENT: 'New source father',
      CHILD: 'Priya updated',
      NOTE: 'Server note',
    });
    rerender();
    expect(result.current.currentValues).toEqual({
      PARENT: '',
      CHILD: 'Priya updated',
      NOTE: 'Typed note',
    });
    expect(result.current.hasUnsavedAnswers).toBe(true);
    await act(async () => result.current.save());
    expect(requests.update.mock.calls[0][0].values).toEqual([
      { fieldCode: 'PARENT', valueJson: '""' },
      { fieldCode: 'NOTE', valueJson: '"Typed note"' },
    ]);
  });

  it('retains touched validation context through a background form refresh', async () => {
    const { result, rerender } = renderHook(() => useApplicationDetail('application'));
    await act(async () => result.current.setFieldTouched('FirstName'));
    context.formOverride = { ...form, values: [{ fieldCode: 'City', valueJson: '"Surat"' }] };
    rerender();
    expect(result.current.fieldErrors.FirstName).toBe('First name is required.');
    await act(async () => result.current.setFieldValue('FirstName', 'Priya'));
    expect(result.current.fieldErrors.FirstName).toBeUndefined();
  });

  it.each(['Saved father', 'Changed source father'])(
    'does not resurrect a saved clear when an older projected GET returns %s',
    async (delayedParent) => {
      context.formOverride = familyForm();
      // The read captured this source value before Save, but arrives afterwards.
      const delayedRead = familyForm({
        PARENT: delayedParent,
        CHILD: 'Priya',
        NOTE: 'Manual note',
      });
      const { result, rerender } = renderHook(() => useApplicationDetail('application'));
      await act(async () => result.current.setFieldValue('PARENT', ''));
      requests.update.mockReturnValue({
        unwrap: async () => ({
          ...familyForm({ PARENT: '', CHILD: 'Priya', NOTE: 'Manual note' }),
          autoFilledFieldCodes: [],
        }),
      });
      await act(async () => result.current.save());
      context.formOverride = delayedRead;
      rerender();
      expect(result.current.currentValues.PARENT).toBe('');
      expect(result.current.hasUnsavedAnswers).toBe(false);
      await act(async () => result.current.save());
      expect(requests.update).toHaveBeenCalledOnce();
    }
  );

  it('does not apply an earlier application save response after navigating to another application', async () => {
    context.formOverride = familyForm();
    let finish!: (value: unknown) => void;
    requests.update.mockReturnValue({
      unwrap: () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    });
    const { result, rerender } = renderHook(({ id }) => useApplicationDetail(id), {
      initialProps: { id: 'application' },
    });
    let pending!: Promise<boolean>;
    await act(async () => {
      pending = result.current.save();
    });
    context.formOverride = {
      ...familyForm({ PARENT: 'B parent', CHILD: 'B child', NOTE: 'B note' }),
      autoFilledFieldCodes: [],
    };
    rerender({ id: 'other-application' });
    await act(async () => {
      finish(familyForm());
      await pending;
    });
    expect(result.current.currentValues).toEqual({
      PARENT: 'B parent',
      CHILD: 'B child',
      NOTE: 'B note',
    });
    expect(result.current.hasUnsavedAnswers).toBe(false);
  });

  it('resets independently when the application changes and hides retained stale query data', async () => {
    context.formOverride = familyForm();
    const { result, rerender } = renderHook(({ id }) => useApplicationDetail(id), {
      initialProps: { id: 'application' },
    });
    await act(async () => result.current.setFieldValue('NOTE', 'A private draft'));
    context.staleForm = true;
    rerender({ id: 'other-application' });
    expect(result.current.currentValues).toEqual({});
    expect(result.current.formQuery.data).toBeUndefined();
    context.formOverride = familyForm({ PARENT: 'B parent', CHILD: 'B child', NOTE: 'B note' });
    context.staleForm = false;
    rerender({ id: 'other-application' });
    expect(result.current.currentValues).toEqual({
      PARENT: 'B parent',
      CHILD: 'B child',
      NOTE: 'B note',
    });
    expect(result.current.hasUnsavedAnswers).toBe(false);
  });

  it('keeps a normal unchanged form a no-op and preserves typed data on a failed save', async () => {
    const { result } = renderHook(() => useApplicationDetail('application'));
    await act(async () => expect(await result.current.save()).toBe(true));
    expect(requests.update).not.toHaveBeenCalled();
    await act(async () => result.current.setFieldValue('FirstName', 'Typed student'));
    requests.update.mockReturnValue({
      unwrap: async () => {
        throw new Error('offline');
      },
    });
    await act(async () => expect(await result.current.save()).toBe(false));
    expect(result.current.currentValues.FirstName).toBe('Typed student');
    expect(result.current.hasUnsavedAnswers).toBe(true);
  });

  it('prevents two saves from posting the same projected values while the first save is pending', async () => {
    context.formOverride = familyForm();
    let finish!: (value: unknown) => void;
    requests.update.mockReturnValue({
      unwrap: () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    });
    const { result } = renderHook(() => useApplicationDetail('application'));
    let pending!: Promise<boolean>;
    await act(async () => {
      pending = result.current.save();
    });
    await act(async () => expect(await result.current.save()).toBe(false));
    expect(requests.update).toHaveBeenCalledOnce();
    await act(async () => {
      finish({});
      await pending;
    });
  });

  it('normalizes an existing email at save without sending unchanged non-email answers', async () => {
    context.emailForm = true;
    const { result } = renderHook(() => useApplicationDetail('application'));
    await act(async () => {
      expect(await result.current.save()).toBe(true);
    });
    expect(requests.update).toHaveBeenCalledWith({
      id: 'application',
      concurrencyStamp: 'current',
      values: [{ fieldCode: 'EMAIL', valueJson: '"existing@example.com"' }],
    });
    expect(result.current.currentValues.EMAIL).toBe('existing@example.com');
    expect(result.current.currentValues.NOTE).toBe('KEEP Case');
  });
  it('does not submit normalized changes to readonly fields in an inherited schema', async () => {
    context.emailForm = true;
    context.readonlyInherited = true;
    const { result } = renderHook(() => useApplicationDetail('application'));
    await act(async () => expect(await result.current.save()).toBe(true));
    expect(requests.update).not.toHaveBeenCalled();
    expect(result.current.currentValues.EMAIL).toBe('Existing@Example.COM');
  });

  it('starts workflow without waiting for the application response', () => {
    context.applicationLoaded = false;
    renderHook(() => useApplicationDetail('application'));
    expect(requests.workflow).toHaveBeenLastCalledWith('application');
    expect(requests.form).toHaveBeenLastCalledWith(skipToken);
    expect(requests.history).toHaveBeenLastCalledWith(skipToken);
  });

  it('keeps Continue pending through preflight, the write and destination refresh, without duplicate writes', async () => {
    const { result } = renderHook(() => useApplicationDetail('application'));
    const workflow = {
      ...result.current.workflowQuery.data,
      currentStageInstanceId: 'current-form',
    };
    const resolveApplication = { ...application, status: 1, concurrencyStamp: 'latest' };
    let finishRefresh!: (value: unknown) => void;
    const refresh = new Promise((resolve) => {
      finishRefresh = resolve;
    });
    requests.applicationRefetch
      .mockReturnValueOnce({ unwrap: async () => resolveApplication })
      .mockReturnValueOnce({ unwrap: () => refresh });
    requests.workflowRefetch.mockReturnValue({ unwrap: async () => workflow });
    requests.advance.mockReturnValue({ unwrap: async () => workflow });
    let pending!: Promise<boolean>;
    await act(async () => {
      pending = result.current.advance();
    });
    expect(requests.advance).toHaveBeenCalledOnce();
    expect(result.current.advanceState.isLoading).toBe(true);
    await act(async () => {
      expect(await result.current.advance()).toBe(false);
    });
    expect(requests.advance).toHaveBeenCalledOnce();
    await act(async () => {
      finishRefresh(resolveApplication);
      await pending;
    });
    expect(result.current.advanceState.isLoading).toBe(false);
    expect(await pending).toBe(true);
  });

  it('unlocks Continue after preflight failure without posting a transition', async () => {
    requests.applicationRefetch.mockReturnValue({
      unwrap: async () => {
        throw new Error('offline');
      },
    });
    requests.workflowRefetch.mockReturnValue({ unwrap: async () => ({}) });
    const { result } = renderHook(() => useApplicationDetail('application'));
    await act(async () => {
      expect(await result.current.advance()).toBe(false);
    });
    expect(result.current.advanceState.isLoading).toBe(false);
    expect(requests.advance).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledOnce();
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

  it('keeps Submit pending while changed answers are saved and blocks a second submit', async () => {
    let finishSave!: (value: unknown) => void;
    const saveResponse = new Promise((resolve) => {
      finishSave = resolve;
    });
    requests.update.mockReturnValue({ unwrap: () => saveResponse });
    const { result } = renderHook(() => useApplicationDetail('application'));
    await act(async () => result.current.setFieldValue('FirstName', 'QA'));
    await act(async () => result.current.setFieldValue('City', JSON.stringify({ name: 'Surat' })));
    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current.submitApplication();
    });
    expect(result.current.submitState.isLoading).toBe(true);
    await waitFor(() => expect(requests.update).toHaveBeenCalledOnce());
    expect(requests.submit).not.toHaveBeenCalled();
    await act(async () => result.current.submitApplication());
    expect(requests.update).toHaveBeenCalledOnce();
    await act(async () => {
      finishSave({});
      await pending;
    });
    expect(requests.submit).toHaveBeenCalledOnce();
    expect(result.current.submitState.isLoading).toBe(false);
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
