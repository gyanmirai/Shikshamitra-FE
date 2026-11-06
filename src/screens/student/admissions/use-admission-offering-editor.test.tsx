import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type { AdmissionOffering } from 'src/redux/student/admissions/admission-offerings-api';

import { it, vi, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { getOfferingInitialValues } from './admission-offering-model';
import { useAdmissionOfferingEditor } from './use-admission-offering-editor';

const mocks = vi.hoisted(() => ({ validate: vi.fn(), error: vi.fn() }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: mocks.error } }));
vi.mock('src/redux/student/admissions/admission-offerings-api', () => ({
  useValidateAdmissionOfferingMutation: () => [mocks.validate, { isLoading: false }],
}));
vi.mock('src/redux/academicOrganizationOptions/academicOrganizationOptionsApi', () => ({
  useGetAcademicOrganizationOptionsQuery: () => ({ data: { items: [] } }),
}));
vi.mock('./use-admission-definition-options', () => ({
  useAdmissionDefinitionOptions: () => ({}),
}));
const cycle = { id: 'cycle', academicYearId: 'year' } as AdmissionCycle;
const offering = { id: 'offering' } as AdmissionOffering;
beforeEach(() => vi.clearAllMocks());
it.each(['resolve', 'reject'])(
  'ignores a cancelled preview %s after closing and reopening',
  async (outcome) => {
    let resolve!: (value: unknown) => void;
    let reject!: (error: Error) => void;
    mocks.validate.mockReturnValue({
      unwrap: () =>
        new Promise((done, fail) => {
          resolve = done;
          reject = fail;
        }),
    });
    const onSave = vi.fn();
    const view = renderHook(
      ({ open }) => useAdmissionOfferingEditor({ open, cycle, offering, onSave }),
      { initialProps: { open: true } }
    );
    let pending!: ReturnType<typeof view.result.current.validateForReview>;
    act(() => {
      pending = view.result.current.validateForReview(getOfferingInitialValues(offering));
    });
    view.rerender({ open: false });
    view.rerender({ open: true });
    await act(async () => {
      if (outcome === 'resolve') resolve({ isValid: true, errors: [] });
      else reject(new Error('Stale validation failure'));
      await pending;
    });
    expect(view.result.current.readiness).toBeNull();
    expect(mocks.error).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  }
);
