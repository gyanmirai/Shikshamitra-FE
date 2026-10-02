import { vi, it, expect, describe } from 'vitest';

import { getInitialValues } from './workflow-config';
import { createGuidedSeatingNext } from './workflow-next';

import type { GuidedSeatingNextContext } from './workflow-next';

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));

function context(step: number): GuidedSeatingNextContext {
  return {
    activeStep: step,
    isPublished: false,
    seatingPlanId: 'plan-1',
    formik: {
      values: getInitialValues(),
      setFieldValue: vi.fn(),
    } as unknown as GuidedSeatingNextContext['formik'],
    readiness: { isReadyToPublish: true } as GuidedSeatingNextContext['readiness'],
    workspace: { version: 'v1' } as GuidedSeatingNextContext['workspace'],
    operations: {
      preview: { assignments: [], unallocatedStudentIds: [] },
      validation: { isValid: true, blockers: [], warnings: [] },
      runExaminationValidation: vi.fn().mockResolvedValue({ isReadyToPublish: true }),
      publish: vi.fn().mockResolvedValue({ readiness: { isPublished: true } }),
      applyPreview: vi.fn(),
      runValidation: vi.fn(),
      showError: vi.fn(),
    } as unknown as GuidedSeatingNextContext['operations'],
    manualPreviousRoomIds: { current: [] },
    navigate: vi.fn(),
    onComplete: vi.fn(),
  };
}

describe('guided seating completion navigation', () => {
  it('returns to the list after saving a validated plan, without resetting to step zero', async () => {
    const args = context(2);
    const loading = vi.fn();
    await createGuidedSeatingNext(args)(loading);
    expect(args.operations.runExaminationValidation).toHaveBeenCalledOnce();
    expect(args.onComplete).toHaveBeenCalledOnce();
    expect(args.navigate).not.toHaveBeenCalled();
    expect(loading.mock.calls).toEqual([[true], [false]]);
  });

  it('returns to the list immediately after successful publication', async () => {
    const args = context(3);
    await createGuidedSeatingNext(args)(vi.fn());
    expect(args.operations.publish).toHaveBeenCalledWith(args.formik.values);
    expect(args.onComplete).toHaveBeenCalledOnce();
    expect(args.navigate).not.toHaveBeenCalled();
  });

  it('stays in the publish step when publication is blocked', async () => {
    const args = context(3);
    vi.mocked(args.operations.publish).mockResolvedValueOnce(false);
    await createGuidedSeatingNext(args)(vi.fn());
    expect(args.onComplete).not.toHaveBeenCalled();
  });

  it('keeps errors in the current step and clears loading when an API request fails', async () => {
    const args = context(3);
    const error = new Error('Publish unavailable');
    vi.mocked(args.operations.publish).mockRejectedValueOnce(error);
    const loading = vi.fn();
    await createGuidedSeatingNext(args)(loading);
    expect(args.operations.showError).toHaveBeenCalledWith(error);
    expect(args.onComplete).not.toHaveBeenCalled();
    expect(loading).toHaveBeenLastCalledWith(false);
  });

  it('keeps the first apply-and-validate action on Review so results can be inspected', async () => {
    const args = context(2);
    args.operations.validation = undefined;
    await createGuidedSeatingNext(args)(vi.fn());
    expect(args.operations.applyPreview).toHaveBeenCalledOnce();
    expect(args.operations.runValidation).toHaveBeenCalledWith('plan-1');
    expect(args.onComplete).not.toHaveBeenCalled();
  });

  it('returns to the list for an already published examination without publishing again', async () => {
    const args = context(3);
    args.isPublished = true;
    await createGuidedSeatingNext(args)(vi.fn());
    expect(args.onComplete).toHaveBeenCalledOnce();
    expect(args.operations.publish).not.toHaveBeenCalled();
  });
});
