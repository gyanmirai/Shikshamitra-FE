import { it, expect, describe } from 'vitest';

import { INITIAL_ATTENDANCE_CONFIG } from './types';
import {
  canCancelAttendanceEvaluation,
  shouldRenderEvaluationSummary,
  canPublishAttendanceEvaluation,
  canApproveAttendanceEvaluation,
  pickLatestAttendanceEvaluation,
  shouldRenderEvaluationEmptyState,
  buildAttendanceConfigurationRequest,
  buildAttendancePolicyEvaluationRequest,
  buildAttendanceConfigurationPreviewRequest,
} from './attendance-configuration-utils';

describe('attendance configuration request builder', () => {
  it('removes blank optional override fields before submitting', () => {
    const payload = buildAttendanceConfigurationRequest({
      ...INITIAL_ATTENDANCE_CONFIG,
      overrides: [
        {
          id: 'local-1',
          targetType: 'department',
          targetId: 'dept-1',
          targetName: 'Science',
          isActive: true,
          hoursBasedPayPercentage: '',
          graceTime: '',
          maxLateAllowedPerMonth: 4,
          penaltyType: '',
          overtimeRate: '',
          minOvertimeMinutes: '',
        },
      ],
    });

    expect(payload.overrides[0]).toMatchObject({
      targetType: 'department',
      targetId: 'dept-1',
      targetName: 'Science',
      maxLateAllowedPerMonth: 4,
    });
    expect(payload.overrides[0].hoursBasedPayPercentage).toBeUndefined();
    expect(payload.overrides[0].graceTime).toBeUndefined();
    expect(payload.overrides[0].penaltyType).toBeUndefined();
    expect(payload.overrides[0].overtimeRate).toBeUndefined();
    expect(payload.overrides[0].minOvertimeMinutes).toBeUndefined();
  });

  it('mirrors canonical full-day threshold to the legacy daily rule field', () => {
    const payload = buildAttendanceConfigurationRequest({
      ...INITIAL_ATTENDANCE_CONFIG,
      punchRules: {
        ...INITIAL_ATTENDANCE_CONFIG.punchRules,
        fullDayThresholdPercentage: 80,
      },
      dailyRules: {
        hoursBasedPayPercentage: 60,
      },
    });

    expect(payload.punchRules.fullDayThresholdPercentage).toBe(80);
    expect(payload.dailyRules.hoursBasedPayPercentage).toBe(80);
  });

  it('omits hidden overtime values when overtime is disabled', () => {
    const payload = buildAttendanceConfigurationRequest({
      ...INITIAL_ATTENDANCE_CONFIG,
      overtime: {
        enabled: false,
        rate: '2.0x',
        minOvertimeMinutes: 45,
      },
    });

    expect(payload.overtime).toEqual({ enabled: false });
  });

  it('preserves active and inactive overrides in payload', () => {
    const payload = buildAttendanceConfigurationRequest({
      ...INITIAL_ATTENDANCE_CONFIG,
      overrides: [
        {
          id: 'active-1',
          targetType: 'role',
          targetId: 'role-1',
          targetName: 'Teacher',
          isActive: true,
        },
        {
          id: 'inactive-1',
          targetType: 'role',
          targetId: 'role-1',
          targetName: 'Teacher',
          isActive: false,
        },
      ],
    });

    expect(payload.overrides).toHaveLength(2);
    expect(payload.overrides.map((row) => row.isActive)).toEqual([true, false]);
  });

  it('preserves approved-results payroll integration settings', () => {
    const payload = buildAttendanceConfigurationRequest({
      ...INITIAL_ATTENDANCE_CONFIG,
      payrollIntegrationMode: 'approved_results',
      requirePublishedAttendanceForPayrollLock: true,
    });

    expect(payload.payrollIntegrationMode).toBe('approved_results');
    expect(payload.requirePublishedAttendanceForPayrollLock).toBe(true);
  });

  it('builds preview request with structured filters and trimmed blanks', () => {
    const payload = buildAttendanceConfigurationPreviewRequest(
      {
        fromDate: '2026-04-01',
        toDate: '2026-04-30',
        departmentId: ' Science ',
        roleId: ' ',
        employeeType: 'teaching',
        shiftId: 'shift-1',
      },
      INITIAL_ATTENDANCE_CONFIG
    );

    expect(payload).toMatchObject({
      fromDate: '2026-04-01',
      toDate: '2026-04-30',
      departmentId: 'Science',
      roleId: undefined,
      employeeType: 'teaching',
      shiftId: 'shift-1',
    });
    expect(payload.configuration.dailyRules.hoursBasedPayPercentage).toBe(
      INITIAL_ATTENDANCE_CONFIG.punchRules.fullDayThresholdPercentage
    );
  });

  it('builds filtered preview evaluation request and full-scope create request', () => {
    const filtered = buildAttendancePolicyEvaluationRequest('ay-1', '2026-04', {
      departmentId: ' Science ',
      roleId: ' ',
      employeeType: 'teaching',
      shiftId: 'shift-1',
    });
    const fullScope = buildAttendancePolicyEvaluationRequest('ay-1', '2026-04');

    expect(filtered).toMatchObject({
      academicYearId: 'ay-1',
      month: 4,
      year: 2026,
      departmentId: 'Science',
      roleId: undefined,
      employeeType: 'teaching',
      shiftId: 'shift-1',
    });
    expect(fullScope).toEqual({
      academicYearId: 'ay-1',
      month: 4,
      year: 2026,
      departmentId: undefined,
      roleId: undefined,
      employeeType: undefined,
      shiftId: undefined,
    });
  });

  it('chooses published monthly evaluation when it is newer than actionable runs', () => {
    const runs: any[] = [
      {
        id: 'old',
        status: 'evaluated',
        createdAt: '2026-05-01T00:00:00Z',
        toDate: '2026-04-30',
        warnings: [],
        results: [],
      },
      {
        id: 'blocked',
        status: 'needs_review',
        createdAt: '2026-05-01T01:00:00Z',
        toDate: '2026-04-30',
        warnings: [],
        results: [],
      },
      {
        id: 'published',
        status: 'published',
        publishedAt: '2026-05-02T00:00:00Z',
        createdAt: '2026-05-02T00:00:00Z',
        toDate: '2026-04-30',
        warnings: [],
        results: [],
      },
    ];

    const selected = pickLatestAttendanceEvaluation(runs);

    expect(selected?.id).toBe('published');
  });

  it('chooses newer actionable run over an older published run', () => {
    const runs: any[] = [
      {
        id: 'published',
        status: 'published',
        publishedAt: '2026-05-02T00:00:00Z',
        createdAt: '2026-05-02T00:00:00Z',
        toDate: '2026-04-30',
        warnings: [],
        results: [],
      },
      {
        id: 'approved-new',
        status: 'approved',
        createdAt: '2026-05-03T00:00:00Z',
        toDate: '2026-04-30',
        warnings: [],
        results: [],
      },
    ];

    expect(pickLatestAttendanceEvaluation(runs)?.id).toBe('approved-new');
  });

  it('gates evaluation actions by persisted status', () => {
    const run: any = {
      id: 'run-1',
      createdAt: '2026-05-01T00:00:00Z',
      toDate: '2026-04-30',
      warnings: [],
      results: [],
    };

    expect(canApproveAttendanceEvaluation({ ...run, status: 'evaluated' })).toBe(true);
    expect(canApproveAttendanceEvaluation({ ...run, status: 'needs_review' })).toBe(false);
    expect(canPublishAttendanceEvaluation({ ...run, status: 'approved' })).toBe(true);
    expect(canPublishAttendanceEvaluation({ ...run, status: 'published' })).toBe(false);
    expect(canCancelAttendanceEvaluation({ ...run, status: 'needs_review' })).toBe(true);
    expect(canCancelAttendanceEvaluation({ ...run, status: 'published' })).toBe(false);
  });

  it('renders evaluation panels only for active preview or persisted runs', () => {
    const run: any = {
      id: 'run-1',
      status: 'published',
      createdAt: '2026-05-01T00:00:00Z',
      toDate: '2026-04-30',
      warnings: [],
      results: [],
    };

    expect(shouldRenderEvaluationSummary(true)).toBe(true);
    expect(shouldRenderEvaluationSummary(false, run)).toBe(true);
    expect(shouldRenderEvaluationSummary(false)).toBe(false);

    expect(shouldRenderEvaluationEmptyState(false, false)).toBe(true);
    expect(shouldRenderEvaluationEmptyState(false, true)).toBe(false);
    expect(shouldRenderEvaluationEmptyState(false, false, run)).toBe(false);
    expect(shouldRenderEvaluationEmptyState(true, false)).toBe(false);
  });
});
