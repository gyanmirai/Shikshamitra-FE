import type { AdmissionPipelineItem } from 'src/redux/student/admissions/admission-pipeline-api';
import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import { act, renderHook } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import { useBulkPipelineCounsellor } from './use-bulk-pipeline-counsellor';

const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  candidates: vi.fn(),
  workflow: vi.fn(),
  assign: vi.fn(),
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useLazyGetAdmissionApplicationQuery: () => [mocks.load],
  useAssignAdmissionApplicationCounsellorMutation: () => [mocks.assign],
  admissionApplicationsApi: {
    useLazyGetAdmissionApplicationCounsellorsQuery: () => [mocks.candidates],
    useLazyGetAdmissionApplicationWorkflowQuery: () => [mocks.workflow],
  },
}));

const row = (id: string, status: AdmissionPipelineItem['status'] = 0) =>
  ({ id, applicantName: `Applicant ${id}`, status }) as AdmissionPipelineItem;
const rows = [row('first'), row('second')];
const detail = (id: string, changes: Partial<AdmissionApplication> = {}) =>
  ({
    id,
    status: 0,
    admissionOfferingId: 'offering-1',
    concurrencyStamp: `${id}-fresh`,
    assignedCounsellorId: null,
    ...changes,
  }) as AdmissionApplication;
const candidates = [
  { id: 'owner-1', name: 'Jay Dalia', userName: 'jay' },
  { id: 'owner-2', name: 'Admin DDVS', userName: 'admin-ddvs' },
];
const query = <T,>(value: T | Promise<T>) => ({
  unwrap: () => Promise.resolve(value),
  abort: vi.fn(),
  unsubscribe: vi.fn(),
});
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((accept, refuse) => {
    resolve = accept;
    reject = refuse;
  });
  return { promise, resolve, reject };
};
const options = {
  rows,
  scopeKey: 'tenant-user-year-board-medium-page-1',
  canAssign: true,
  disabled: false,
};
const render = (overrides: Partial<typeof options> = {}) =>
  renderHook((props) => useBulkPipelineCounsellor(props), {
    initialProps: { ...options, ...overrides },
  });
const prepare = async (hook: ReturnType<typeof render>) => {
  act(() => hook.result.current.toggleAll(true));
  await act(async () => hook.result.current.requestAssignment());
};

describe('Pipeline bulk counsellor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.load.mockImplementation((id: string) => query(detail(id)));
    mocks.candidates.mockImplementation(() => query(candidates));
    mocks.workflow.mockImplementation(() => query({ status: 0 }));
    mocks.assign.mockImplementation(({ id }: { id: string }) => query(detail(id)));
  });

  it('selects only active rows on the current page, deduplicates IDs and supports clear', () => {
    const hook = render({ rows: [...rows, row('finalized', 10), row('rejected', 3)] });
    act(() => {
      hook.result.current.toggleSelection(row('off-page'), true);
      hook.result.current.toggleSelection(row('finalized', 10), true);
      hook.result.current.toggleSelection(rows[0], true);
      hook.result.current.toggleSelection(rows[0], true);
    });
    expect(hook.result.current.selectedIds).toEqual(['first']);
    act(() => hook.result.current.toggleAll(true));
    expect(hook.result.current.selectedIds).toEqual(['first', 'second']);
    act(() => hook.result.current.clearSelection());
    expect(hook.result.current.selectedIds).toEqual([]);
  });

  it('does no reads or writes without permission, and blocks selection when the query is busy', async () => {
    const hook = render({ canAssign: false });
    act(() => hook.result.current.toggleAll(true));
    await act(async () => hook.result.current.requestAssignment());
    expect(hook.result.current.eligibleIds).toEqual([]);
    expect(mocks.load).not.toHaveBeenCalled();
    hook.rerender({ ...options, disabled: true });
    act(() => hook.result.current.toggleSelection(rows[0], true));
    expect(hook.result.current.selectedIds).toEqual([]);
    expect(mocks.assign).not.toHaveBeenCalled();
  });

  it('fresh-loads selected details and fetches eligible counsellors once per offering', async () => {
    const hook = render();
    await prepare(hook);
    expect(mocks.load.mock.calls).toEqual([
      ['first', false],
      ['second', false],
    ]);
    expect(mocks.candidates).toHaveBeenCalledExactlyOnceWith({ offeringId: 'offering-1' }, false);
    expect(hook.result.current.counsellors.map((item) => item.id)).toEqual(['owner-2', 'owner-1']);
    expect(hook.result.current.dialogOpen).toBe(true);
    expect(mocks.assign).not.toHaveBeenCalled();
  });

  it('intersects eligible owners across mixed offerings and never accepts a non-common owner', async () => {
    mocks.load.mockImplementation((id: string) =>
      query(detail(id, { admissionOfferingId: id === 'first' ? 'offering-1' : 'offering-2' }))
    );
    mocks.candidates.mockImplementation(({ offeringId }: { offeringId: string }) =>
      query(offeringId === 'offering-1' ? candidates : [candidates[1]])
    );
    const hook = render();
    await prepare(hook);
    expect(mocks.candidates).toHaveBeenCalledTimes(2);
    expect(hook.result.current.counsellors).toEqual([candidates[1]]);
    await act(async () => hook.result.current.confirmAssignment({ counsellorId: 'owner-1' }));
    expect(mocks.assign).not.toHaveBeenCalled();
  });

  it('keeps an accurate empty common-owner result without any write', async () => {
    mocks.candidates.mockImplementation(() => query([]));
    const hook = render();
    await prepare(hook);
    expect(hook.result.current.counsellors).toEqual([]);
    expect(hook.result.current.optionsError).toBeNull();
    await act(async () => hook.result.current.confirmAssignment({ counsellorId: 'owner-1' }));
    expect(mocks.assign).not.toHaveBeenCalled();
  });

  it.each([{ hasReachedDecision: true }, { decisionEnteredAt: '2026-10-13T08:00:00Z' }])(
    'rejects a case that left Pipeline for Admission decision during preparation (%j)',
    async (change) => {
      mocks.load.mockImplementation((id: string) => query(detail(id, change)));
      const hook = render({ rows: [rows[0]] });
      await prepare(hook);
      expect(hook.result.current.optionsError).toMatch(/no longer active/);
      expect(mocks.candidates).not.toHaveBeenCalled();
      expect(mocks.assign).not.toHaveBeenCalled();
    }
  );

  it('exposes preparation errors, retains selection and reloads before permitting writes', async () => {
    mocks.candidates.mockImplementationOnce(() =>
      query(
        Promise.reject(
          Object.assign(new Error('Scope failed'), { data: { detail: 'Scope failed.' } })
        )
      )
    );
    const hook = render();
    await prepare(hook);
    expect(hook.result.current.optionsError).toBe('Scope failed.');
    expect(hook.result.current.selectedIds).toEqual(['first', 'second']);
    expect(hook.result.current.counsellors).toEqual([]);
    await act(async () => hook.result.current.reloadOptions());
    expect(hook.result.current.optionsError).toBeNull();
    expect(hook.result.current.counsellors).toHaveLength(2);
    expect(mocks.assign).not.toHaveBeenCalled();
  });

  it.each([2, 3])('rejects workflow status %i during preparation', async (status) => {
    mocks.load.mockImplementation((id: string) =>
      query(detail(id, { currentStageInstanceId: 'stage-1' }))
    );
    mocks.workflow.mockImplementation(() => query({ status }));
    const hook = render({ rows: [rows[0]] });
    await prepare(hook);
    expect(hook.result.current.optionsError).toMatch(/workflow is cancelled or failed/);
    expect(mocks.candidates).not.toHaveBeenCalled();
    expect(mocks.assign).not.toHaveBeenCalled();
  });

  it.each([2, 3])(
    'rejects workflow status %i at confirmation before fresh stamp/write',
    async (status) => {
      mocks.load.mockImplementation((id: string) =>
        query(detail(id, { currentStageInstanceId: 'stage-1' }))
      );
      const hook = render({ rows: [rows[0]] });
      await prepare(hook);
      mocks.workflow.mockImplementation(() => query({ status }));
      await act(async () => hook.result.current.confirmAssignment({ counsellorId: 'owner-1' }));
      expect(mocks.load).toHaveBeenCalledTimes(1);
      expect(mocks.assign).not.toHaveBeenCalled();
      expect(hook.result.current.selectedIds).toEqual(['first']);
      expect(hook.result.current.failures[0]?.message).toMatch(/workflow is cancelled or failed/);
    }
  );

  it('requires a successful workflow read for a runtime case during preparation', async () => {
    mocks.load.mockImplementation((id: string) =>
      query(detail(id, { currentStageInstanceId: 'stage-1' }))
    );
    mocks.workflow.mockImplementation(() =>
      query(
        Promise.reject(
          Object.assign(new Error('Unavailable'), {
            status: 404,
            data: { detail: 'Workflow could not be found.' },
          })
        )
      )
    );
    const hook = render({ rows: [rows[0]] });
    await prepare(hook);
    expect(hook.result.current.optionsError).toBe('Workflow could not be found.');
    expect(mocks.assign).not.toHaveBeenCalled();
  });

  it('a failed runtime verification at confirmation leaves the case selected without writing', async () => {
    mocks.load.mockImplementation((id: string) =>
      query(detail(id, { currentStageInstanceId: 'stage-1' }))
    );
    const hook = render({ rows: [rows[0]] });
    await prepare(hook);
    mocks.workflow.mockImplementation(() =>
      query(
        Promise.reject(
          Object.assign(new Error('Unavailable'), {
            status: 500,
            data: { detail: 'Workflow could not be verified.' },
          })
        )
      )
    );
    await act(async () => hook.result.current.confirmAssignment({ counsellorId: 'owner-1' }));
    expect(mocks.assign).not.toHaveBeenCalled();
    expect(hook.result.current.failures[0]?.message).toBe('Workflow could not be verified.');
    expect(hook.result.current.selectedIds).toEqual(['first']);
  });

  it('preserves an inquiry-linked legacy application without requiring a workflow', async () => {
    mocks.load.mockImplementation((id: string) =>
      query(detail(id, { inquiryId: 'inquiry-1', currentStageInstanceId: null }))
    );
    const hook = render({ rows: [rows[0]] });
    await prepare(hook);
    await act(async () => hook.result.current.confirmAssignment({ counsellorId: 'owner-1' }));
    expect(mocks.workflow).not.toHaveBeenCalled();
    expect(mocks.assign).toHaveBeenCalledOnce();
  });

  it('rejects a cancelled direct-registration workflow even without a current stage', async () => {
    mocks.load.mockImplementation((id: string) =>
      query(detail(id, { inquiryId: null, currentStageInstanceId: null }))
    );
    mocks.workflow.mockImplementation(() => query({ status: 2 }));
    const hook = render({ rows: [rows[0]] });
    await prepare(hook);
    expect(hook.result.current.optionsError).toMatch(/workflow is cancelled or failed/);
    expect(mocks.candidates).not.toHaveBeenCalled();
    expect(mocks.assign).not.toHaveBeenCalled();
  });

  it.each([0, 1, 4])(
    'permits direct-registration workflow status %i without a current stage',
    async (status) => {
      mocks.load.mockImplementation((id: string) =>
        query(detail(id, { inquiryId: null, currentStageInstanceId: null }))
      );
      mocks.workflow.mockImplementation(() => query({ status }));
      const hook = render({ rows: [rows[0]] });
      await prepare(hook);
      await act(async () => hook.result.current.confirmAssignment({ counsellorId: 'owner-1' }));
      expect(mocks.workflow).toHaveBeenCalledTimes(2);
      expect(mocks.assign).toHaveBeenCalledOnce();
    }
  );

  it('does not assign a runtime when its workflow response cannot be verified', async () => {
    mocks.load.mockImplementation((id: string) =>
      query(detail(id, { currentStageInstanceId: 'stage-1' }))
    );
    mocks.workflow.mockImplementation(() => query({ status: 9 }));
    const hook = render({ rows: [rows[0]] });
    await prepare(hook);
    expect(hook.result.current.optionsError).toBe(
      'This admission workflow could not be verified. Refresh and retry.'
    );
    expect(mocks.assign).not.toHaveBeenCalled();
  });

  it('checks workflow before obtaining the final stamp for a prepared runtime case', async () => {
    const events: string[] = [];
    mocks.load.mockImplementation((id: string) => {
      events.push('detail');
      return query(
        detail(id, {
          currentStageInstanceId: 'stage-1',
          concurrencyStamp: `stamp-${events.length}`,
        })
      );
    });
    mocks.workflow.mockImplementation(() => {
      events.push('workflow');
      return query({ status: 0 });
    });
    mocks.assign.mockImplementation(() => {
      events.push('assign');
      return query(detail('first'));
    });
    const hook = render({ rows: [rows[0]] });
    await prepare(hook);
    events.length = 0;
    await act(async () => hook.result.current.confirmAssignment({ counsellorId: 'owner-1' }));
    expect(events).toEqual(['workflow', 'detail', 'assign']);
    expect(mocks.assign).toHaveBeenCalledWith({
      id: 'first',
      input: {
        counsellorId: 'owner-1',
        concurrencyStamp: 'stamp-2',
        reason: undefined,
      },
    });
  });

  it('verifies a newly acquired runtime and refreshes the stamp again before assigning', async () => {
    const hook = render({ rows: [rows[0]] });
    await prepare(hook);
    const events: string[] = [];
    mocks.load.mockImplementation((id: string) => {
      events.push('detail');
      return query(
        detail(id, {
          currentStageInstanceId: 'stage-new',
          concurrencyStamp: `stamp-${events.length}`,
        })
      );
    });
    mocks.workflow.mockImplementation(() => {
      events.push('workflow');
      return query({ status: 0 });
    });
    mocks.assign.mockImplementation(() => {
      events.push('assign');
      return query(detail('first'));
    });
    await act(async () => hook.result.current.confirmAssignment({ counsellorId: 'owner-1' }));
    expect(events).toEqual(['detail', 'workflow', 'detail', 'assign']);
    expect(mocks.assign).toHaveBeenCalledWith({
      id: 'first',
      input: {
        counsellorId: 'owner-1',
        concurrencyStamp: 'stamp-3',
        reason: undefined,
      },
    });
  });

  it('a page change aborts a pending workflow read and sends no subsequent detail/write', async () => {
    mocks.load.mockImplementation((id: string) =>
      query(detail(id, { currentStageInstanceId: 'stage-1' }))
    );
    const hook = render({ rows: [rows[0]] });
    await prepare(hook);
    const loading = deferred<{ status: number }>();
    const request = query(loading.promise);
    mocks.workflow.mockReturnValueOnce(request);
    let pending!: Promise<void>;
    act(() => {
      pending = hook.result.current.confirmAssignment({ counsellorId: 'owner-1' });
    });
    hook.rerender({ ...options, rows: [rows[0]], scopeKey: 'page-2' });
    await act(async () => {
      loading.resolve({ status: 0 });
      await pending;
    });
    expect(request.abort).toHaveBeenCalledOnce();
    expect(request.unsubscribe).toHaveBeenCalledOnce();
    expect(mocks.load).toHaveBeenCalledTimes(1);
    expect(mocks.assign).not.toHaveBeenCalled();
  });

  it('blocks duplicate preparation, selection changes and close while a detail request is pending', async () => {
    const loading = deferred<AdmissionApplication>();
    const request = query(loading.promise);
    mocks.load.mockReturnValueOnce(request);
    const hook = render();
    act(() => hook.result.current.toggleAll(true));
    let pending!: Promise<void>;
    act(() => {
      pending = hook.result.current.requestAssignment();
      hook.result.current.requestAssignment();
      hook.result.current.toggleAll(false);
      hook.result.current.closeDialog();
      hook.result.current.clearSelection();
    });
    expect(mocks.load).toHaveBeenCalledTimes(1);
    expect(hook.result.current.busy).toBe(true);
    expect(hook.result.current.dialogOpen).toBe(true);
    expect(hook.result.current.selectedIds).toHaveLength(2);
    await act(async () => {
      loading.resolve(detail('first'));
      await pending;
    });
    expect(request.unsubscribe).toHaveBeenCalledOnce();
  });

  it('cancels old preparation on a page/scope change and ignores its late response', async () => {
    const loading = deferred<AdmissionApplication>();
    const request = query(loading.promise);
    mocks.load.mockReturnValueOnce(request);
    const hook = render();
    act(() => hook.result.current.toggleAll(true));
    let pending!: Promise<void>;
    act(() => {
      pending = hook.result.current.requestAssignment();
    });
    hook.rerender({ ...options, scopeKey: 'tenant-user-year-page-2' });
    expect(request.abort).toHaveBeenCalledOnce();
    expect(hook.result.current.dialogOpen).toBe(false);
    expect(hook.result.current.selectedIds).toEqual([]);
    await act(async () => {
      loading.resolve(detail('first'));
      await pending;
    });
    expect(mocks.candidates).not.toHaveBeenCalled();
    expect(hook.result.current.counsellors).toEqual([]);
    expect(mocks.assign).not.toHaveBeenCalled();
  });

  it('uses fresh stamps, serializes commands and ignores double-submit', async () => {
    const hook = render();
    await prepare(hook);
    const saving = deferred<AdmissionApplication>();
    mocks.load.mockImplementation((id: string) =>
      query(detail(id, { concurrencyStamp: `${id}-latest` }))
    );
    mocks.assign.mockReturnValueOnce(query(saving.promise));
    let pending!: Promise<void>;
    await act(async () => {
      pending = hook.result.current.confirmAssignment({
        counsellorId: 'owner-1',
        reason: ' Handover ',
      });
      hook.result.current.confirmAssignment({ counsellorId: 'owner-1' });
    });
    expect(mocks.assign).toHaveBeenCalledTimes(1);
    expect(mocks.assign).toHaveBeenNthCalledWith(1, {
      id: 'first',
      input: { counsellorId: 'owner-1', concurrencyStamp: 'first-latest', reason: 'Handover' },
    });
    expect(mocks.load).toHaveBeenCalledTimes(3);
    await act(async () => {
      saving.resolve(detail('first', { assignedCounsellorId: 'owner-1' }));
      await pending;
    });
    expect(mocks.assign).toHaveBeenCalledTimes(2);
    expect(hook.result.current.outcome).toEqual({ total: 2, assigned: 2, unchanged: 0, failed: 0 });
    expect(hook.result.current.selectedIds).toEqual([]);
    expect(hook.result.current.dialogOpen).toBe(false);
  });

  it('skips already-assigned owners and retains only failed rows with server reasons', async () => {
    const hook = render();
    await prepare(hook);
    mocks.load.mockImplementation((id: string) =>
      query(detail(id, { assignedCounsellorId: id === 'first' ? 'owner-1' : null }))
    );
    mocks.assign.mockImplementationOnce(() =>
      query(
        Promise.reject(
          Object.assign(new Error('Conflict'), {
            status: 409,
            data: { detail: 'Another user changed this admission.' },
          })
        )
      )
    );
    await act(async () => hook.result.current.confirmAssignment({ counsellorId: 'owner-1' }));
    expect(mocks.assign).toHaveBeenCalledTimes(1);
    expect(hook.result.current.selectedIds).toEqual(['second']);
    expect(hook.result.current.failures).toEqual([
      { id: 'second', name: 'Applicant second', message: 'Another user changed this admission.' },
    ]);
    expect(hook.result.current.outcome).toEqual({ total: 2, assigned: 0, unchanged: 1, failed: 1 });
  });

  it('an uncertain retry reads the existing owner and avoids a second assignment/activity', async () => {
    const hook = render({ rows: [rows[0]] });
    await prepare(hook);
    mocks.assign.mockImplementationOnce(() =>
      query(Promise.reject(Object.assign(new Error('Timed out'), { status: 'TIMEOUT_ERROR' })))
    );
    await act(async () => hook.result.current.confirmAssignment({ counsellorId: 'owner-1' }));
    expect(hook.result.current.selectedIds).toEqual(['first']);
    mocks.load.mockImplementation((id: string) =>
      query(detail(id, { assignedCounsellorId: 'owner-1' }))
    );
    await act(async () => hook.result.current.requestAssignment());
    await act(async () => hook.result.current.confirmAssignment({ counsellorId: 'owner-1' }));
    expect(mocks.assign).toHaveBeenCalledTimes(1);
    expect(hook.result.current.outcome).toEqual({ total: 1, assigned: 0, unchanged: 1, failed: 0 });
    expect(hook.result.current.selectedIds).toEqual([]);
  });

  it.each([
    { status: 10 as const },
    { studentId: 'student' },
    { studentEnrollmentId: 'enrollment' },
    { onboardingCaseId: 'onboarding' },
    { hasReachedDecision: true },
    { decisionEnteredAt: '2026-10-13T08:00:00Z' },
  ])('rejects a newly handed-over application before writing (%j)', async (change) => {
    const hook = render({ rows: [rows[0]] });
    await prepare(hook);
    mocks.load.mockImplementation((id: string) => query(detail(id, change)));
    await act(async () => hook.result.current.confirmAssignment({ counsellorId: 'owner-1' }));
    expect(mocks.assign).not.toHaveBeenCalled();
    expect(hook.result.current.failures[0]?.message).toMatch(/no longer active/);
  });

  it('rejects an offering change and missing concurrency stamp before writes', async () => {
    const hook = render();
    await prepare(hook);
    mocks.load.mockImplementation((id: string) =>
      query(
        detail(id, id === 'first' ? { admissionOfferingId: 'other' } : { concurrencyStamp: null })
      )
    );
    await act(async () => hook.result.current.confirmAssignment({ counsellorId: 'owner-1' }));
    expect(mocks.assign).not.toHaveBeenCalled();
    expect(hook.result.current.failures.map((item) => item.message)).toEqual([
      'The admission offering changed. Reload eligible counsellors.',
      'This admission could not be verified. Refresh and try again.',
    ]);
  });

  it('permission revocation while a fresh read is pending prevents that write', async () => {
    const hook = render();
    await prepare(hook);
    const loading = deferred<AdmissionApplication>();
    const request = query(loading.promise);
    mocks.load.mockReturnValueOnce(request);
    let pending!: Promise<void>;
    act(() => {
      pending = hook.result.current.confirmAssignment({ counsellorId: 'owner-1' });
    });
    hook.rerender({ ...options, canAssign: false });
    await act(async () => {
      loading.resolve(detail('first'));
      await pending;
    });
    expect(request.abort).toHaveBeenCalledOnce();
    expect(mocks.assign).not.toHaveBeenCalled();
    expect(hook.result.current.selectedIds).toEqual([]);
  });

  it('a scope change after one command is sent stops the remaining commands', async () => {
    const hook = render();
    await prepare(hook);
    const saving = deferred<AdmissionApplication>();
    mocks.assign.mockReturnValueOnce(query(saving.promise));
    let pending!: Promise<void>;
    await act(async () => {
      pending = hook.result.current.confirmAssignment({ counsellorId: 'owner-1' });
    });
    hook.rerender({ ...options, scopeKey: 'another-user-or-filter' });
    await act(async () => {
      saving.resolve(detail('first'));
      await pending;
    });
    expect(mocks.assign).toHaveBeenCalledTimes(1);
    expect(mocks.load).toHaveBeenCalledTimes(3);
    expect(hook.result.current.outcome).toBeNull();
    expect(hook.result.current.busy).toBe(false);
  });

  it('continues a pinned batch through its own query refetch without adding new rows', async () => {
    const hook = render();
    await prepare(hook);
    const saving = deferred<AdmissionApplication>();
    mocks.assign.mockReturnValueOnce(query(saving.promise));
    let pending!: Promise<void>;
    await act(async () => {
      pending = hook.result.current.confirmAssignment({ counsellorId: 'owner-1' });
    });
    hook.rerender({ ...options, rows: [rows[1], row('new-page-row')], disabled: true });
    await act(async () => {
      saving.resolve(detail('first'));
      await pending;
    });
    expect(mocks.assign.mock.calls.map(([input]) => input.id)).toEqual(['first', 'second']);
    expect(mocks.load).not.toHaveBeenCalledWith('new-page-row', false);
    expect(hook.result.current.outcome?.assigned).toBe(2);
  });

  it('unmounting during a fresh read aborts it and sends no further writes', async () => {
    const hook = render();
    await prepare(hook);
    const loading = deferred<AdmissionApplication>();
    const request = query(loading.promise);
    mocks.load.mockReturnValueOnce(request);
    let pending!: Promise<void>;
    act(() => {
      pending = hook.result.current.confirmAssignment({ counsellorId: 'owner-1' });
    });
    hook.unmount();
    await act(async () => {
      loading.resolve(detail('first'));
      await pending;
    });
    expect(request.abort).toHaveBeenCalledOnce();
    expect(request.unsubscribe).toHaveBeenCalledOnce();
    expect(mocks.assign).not.toHaveBeenCalled();
  });
});
