import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';
import { EmployeeStatusType } from 'src/enums/employee-status-type';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  formatLeaveDays,
  buildLeaveOverview,
  EMPTY_LEAVE_OVERVIEW,
  shouldFetchHrEmployeeLeaveOverview,
} from 'src/screens/hr/leave-request/leave-overview.utils';
import {
  SELF_OPTION,
  countLeaveUnits,
  SELF_EMPLOYEE_ID,
  isAdminFromProfile,
  LEAVE_NOTICE_PERIOD,
  resolveLeaveCenterTab,
  isActiveEmployeeOption,
  getLeaveAttachmentLabel,
  getMinimumLeaveStartDate,
  isDateWithinAcademicYear,
  getAcademicYearStartMonth,
  getLeaveCenterVisibleTabs,
  isSelectedPaidTypeVisible,
  buildEmployeeSelectOptions,
  getLeaveNoticePeriodMessage,
  isLeaveNoticePeriodSatisfied,
  getLeaveRequestBalanceWarning,
  APPLY_LEAVE_ROW_ACTION_LABELS,
  shouldEnforceLeaveNoticePeriod,
  buildCreateLeaveRequestFormData,
  buildLeaveAttachmentDownloadPath,
  formatLeaveCalendarDateForPayload,
  formatLeaveCalendarDateForDisplay,
  isEmployeeSelectionValidForCreate,
  resolveAcademicYearIdForLeaveDate,
  resolveLeavePolicyPreviewEmployeeId,
  shouldDisableMonthBeforeAcademicYearStart,
  getVisiblePaidTypeOptionsForEffectivePolicy,
  isLeavePolicyPreviewEmployeeResolutionBlocked,
} from 'src/screens/hr/leave-request/leave-request.utils';

describe('leave request payload mapping', () => {
  it('uses forEmployeeId for non-self selection and never sends employeeId', () => {
    const formData = buildCreateLeaveRequestFormData({
      employee: { id: 'emp-123', label: 'John Doe' },
      paidType: 'Paid',
      startDate: dayjs('2026-06-01'),
      endDate: dayjs('2026-06-02'),
      halfDay: false,
      reason: 'Family function',
      docs: null,
    });

    expect(formData.get('forEmployeeId')).toBe('emp-123');
    expect(formData.get('employeeId')).toBeNull();
    expect(formData.get('leavePolicyId')).toBeNull();
    expect(formData.get('paidType')).toBe('Paid');
    expect(formData.get('leaveTypeId')).toBeNull();
  });

  it('omits forEmployeeId for self selection', () => {
    const formData = buildCreateLeaveRequestFormData({
      employee: { id: SELF_EMPLOYEE_ID, label: 'Self' },
      paidType: 'Paid',
      startDate: dayjs('2026-06-01'),
      endDate: dayjs('2026-06-02'),
      halfDay: false,
      reason: 'Personal work',
      docs: null,
    });

    expect(formData.get('forEmployeeId')).toBeNull();
    expect(formData.get('employeeId')).toBeNull();
  });

  it('does not append file when docs is empty', () => {
    const formData = buildCreateLeaveRequestFormData({
      employee: { id: 'emp-123', label: 'John Doe' },
      paidType: 'Paid',
      startDate: dayjs('2026-06-01'),
      endDate: dayjs('2026-06-02'),
      halfDay: false,
      reason: 'Family function',
      docs: null,
    });

    expect(formData.get('File')).toBeNull();
  });

  it('sends half-day flag in create payloads', () => {
    const formData = buildCreateLeaveRequestFormData({
      employee: { id: 'emp-123', label: 'John Doe' },
      paidType: 'Paid',
      startDate: dayjs('2026-06-01'),
      endDate: dayjs('2026-06-01'),
      halfDay: true,
      reason: 'Medical appointment',
      docs: null,
    });

    expect(formData.get('halfDay')).toBe('true');
  });

  it('sends selected leave days as date-only values to avoid timezone date shifts', () => {
    const formData = buildCreateLeaveRequestFormData({
      employee: { id: 'emp-123', label: 'John Doe' },
      paidType: 'Paid',
      startDate: dayjs('2026-07-06'),
      endDate: dayjs('2026-07-10'),
      halfDay: false,
      reason: 'Family function',
      docs: null,
    });

    expect(formData.get('startDate')).toBe('2026-07-06');
    expect(formData.get('endDate')).toBe('2026-07-10');
    expect(String(formData.get('startDate'))).not.toContain('T');
  });

  it('formats API leave dates without applying browser timezone offsets', () => {
    expect(formatLeaveCalendarDateForPayload(dayjs('2026-07-06'))).toBe('2026-07-06');
    expect(formatLeaveCalendarDateForDisplay('2026-07-06T00:00:00.000Z')).toBe('06-07-2026');
  });
});

describe('leave request balance warning', () => {
  it('warns when a finite bucket does not have enough remaining balance', () => {
    expect(
      getLeaveRequestBalanceWarning(
        {
          items: [
            {
              paidType: 'Paid',
              entitlementMode: 'Limited',
              remainingDays: 0.5,
              isUnlimited: false,
              allowNegativeBalance: false,
            },
          ],
        },
        'Paid',
        1
      )
    ).toContain('Paid leave balance is 0.5 day(s)');
  });

  it('does not warn for negative-balance or unlimited buckets', () => {
    expect(
      getLeaveRequestBalanceWarning(
        {
          items: [
            {
              paidType: 'Paid',
              remainingDays: -1,
              isUnlimited: false,
              allowNegativeBalance: true,
            },
          ],
        },
        'Paid',
        2
      )
    ).toBeNull();

    expect(
      getLeaveRequestBalanceWarning(
        {
          items: [
            {
              paidType: 'Unpaid',
              entitlementMode: 'Unlimited',
              remainingDays: null,
              isUnlimited: true,
            },
          ],
        },
        'Unpaid',
        20
      )
    ).toBeNull();
  });
});

describe('leave request effective policy filtering', () => {
  it('uses the selected employee id for HR-created non-self leave', () => {
    expect(
      resolveLeavePolicyPreviewEmployeeId(
        { id: 'employee-1', label: 'Employee One' },
        'auth-employee',
        'hr'
      )
    ).toBe('employee-1');
  });

  it('uses authenticated employee id for self leave preview', () => {
    expect(resolveLeavePolicyPreviewEmployeeId(SELF_OPTION, 'auth-employee', 'hr')).toBe(
      'auth-employee'
    );
    expect(resolveLeavePolicyPreviewEmployeeId(null, 'auth-employee', 'self')).toBe(
      'auth-employee'
    );
  });

  it('blocks self leave preview while authenticated employee id is unresolved', () => {
    expect(isLeavePolicyPreviewEmployeeResolutionBlocked(null, undefined, 'self')).toBe(true);
    expect(isLeavePolicyPreviewEmployeeResolutionBlocked(SELF_OPTION, null, 'hr')).toBe(true);
    expect(isLeavePolicyPreviewEmployeeResolutionBlocked(null, 'auth-employee', 'self')).toBe(
      false
    );
  });

  it('does not block HR preview while no employee has been selected yet', () => {
    expect(isLeavePolicyPreviewEmployeeResolutionBlocked(null, undefined, 'hr')).toBe(false);
  });

  it('shows paid type buckets from the effective policy', () => {
    expect(
      getVisiblePaidTypeOptionsForEffectivePolicy(
        {
          id: 'policy-1',
          allowedPaidTypes: ['Paid', 'Unpaid'],
          rules: [
            { id: 'paid-rule', paidType: 'Paid', isActive: true, leaveCount: 12 },
            {
              id: 'unpaid-rule',
              paidType: 'Unpaid',
              isActive: true,
              entitlementMode: 'Unlimited',
              isUnlimited: true,
            },
          ],
        },
        true
      )
    ).toEqual([
      {
        id: 'Paid',
        name: 'Paid',
        color: '#2E7D32',
        entitlementMode: undefined,
        leaveCount: 12,
        isUnlimited: undefined,
      },
      {
        id: 'Unpaid',
        name: 'Unpaid',
        color: '#ED6C02',
        entitlementMode: 'Unlimited',
        leaveCount: undefined,
        isUnlimited: true,
      },
    ]);
  });

  it('checks whether the selected paid type remains visible after policy filtering', () => {
    const visiblePaidTypes = [{ id: 'Paid', name: 'Paid' }] as any;

    expect(isSelectedPaidTypeVisible('Paid', visiblePaidTypes)).toBe(true);
    expect(isSelectedPaidTypeVisible('Unpaid', visiblePaidTypes)).toBe(false);
    expect(isSelectedPaidTypeVisible('', visiblePaidTypes)).toBe(true);
  });

  it('does not fail open when preview is missing, loading, or errored', () => {
    expect(getVisiblePaidTypeOptionsForEffectivePolicy(null, true)).toEqual([]);
    expect(
      getVisiblePaidTypeOptionsForEffectivePolicy(
        { id: 'policy-1', allowedPaidTypes: ['Paid'] },
        true,
        true
      )
    ).toEqual([]);
    expect(
      getVisiblePaidTypeOptionsForEffectivePolicy(
        { id: 'policy-1', allowedPaidTypes: ['Paid'] },
        true,
        false,
        true
      )
    ).toEqual([]);
  });

  it('keeps both paid type buckets only while no employee/date preview target is resolved', () => {
    expect(getVisiblePaidTypeOptionsForEffectivePolicy(null, false)).toEqual([
      { id: 'Paid', name: 'Paid', color: '#2E7D32' },
      { id: 'Unpaid', name: 'Unpaid', color: '#ED6C02' },
    ]);
  });
});

describe('leave attachment helpers', () => {
  it('builds HR and self attachment download paths', () => {
    expect(buildLeaveAttachmentDownloadPath('leave-1', 'hr')).toBe(
      '/leave-management/leave-1/attachment/download'
    );
    expect(buildLeaveAttachmentDownloadPath('leave-1', 'self')).toBe(
      '/leave-management/my/leave-1/attachment/download'
    );
  });

  it('uses attachment metadata for the link label when available', () => {
    expect(getLeaveAttachmentLabel({ attachmentFileName: 'medical.pdf' })).toBe('medical.pdf');
    expect(getLeaveAttachmentLabel({ id: '12345678-1234' })).toBe('leave-attachment-12345678');
    expect(getLeaveAttachmentLabel({})).toBe('View attachment');
  });
});

describe('leave unit calculation', () => {
  it('counts full-day ranges excluding Sundays and including Saturdays', () => {
    expect(countLeaveUnits(dayjs('2026-06-06'), dayjs('2026-06-08'), false)).toBe(2);
  });

  it('counts single-date half-day leave as 0.5', () => {
    expect(countLeaveUnits(dayjs('2026-06-08'), dayjs('2026-06-08'), true)).toBe(0.5);
  });

  it('rejects multi-date half-day ranges locally as zero units', () => {
    expect(countLeaveUnits(dayjs('2026-06-08'), dayjs('2026-06-09'), true)).toBe(0);
  });
});

describe('leave notice period helpers', () => {
  const today = dayjs('2026-05-28');

  it('requires at least two days advance notice', () => {
    expect(isLeaveNoticePeriodSatisfied(dayjs('2026-05-28'), today)).toBe(false);
    expect(isLeaveNoticePeriodSatisfied(dayjs('2026-05-29'), today)).toBe(false);
    expect(isLeaveNoticePeriodSatisfied(dayjs('2026-05-30'), today)).toBe(true);
  });

  it('builds the earliest available leave date message', () => {
    expect(getMinimumLeaveStartDate(today).format('YYYY-MM-DD')).toBe('2026-05-30');
    expect(getLeaveNoticePeriodMessage(today)).toContain('Earliest available date is 30/05/2026.');
  });

  it('enforces notice only for self-created leave requests', () => {
    expect(shouldEnforceLeaveNoticePeriod('self', false, SELF_OPTION)).toBe(true);
    expect(shouldEnforceLeaveNoticePeriod('self', true, SELF_OPTION)).toBe(true);
    expect(shouldEnforceLeaveNoticePeriod('hr', true, { id: 'emp-1', label: 'Employee' })).toBe(
      false
    );
    expect(shouldEnforceLeaveNoticePeriod('hr', false, { id: 'emp-1', label: 'Employee' })).toBe(
      false
    );
    expect(shouldEnforceLeaveNoticePeriod('hr', false, SELF_OPTION)).toBe(true);
  });
});

describe('leave request employee options', () => {
  const employees = [
    { id: 'emp-1', label: 'Emp 1', status: EmployeeStatusType.Active },
    { id: 'emp-2', label: 'Emp 2', status: 'Active' },
  ];

  it('hides self option for admin users', () => {
    const options = buildEmployeeSelectOptions(employees, true);
    expect(options).toEqual(employees);
    expect(options.find((x) => x.id === SELF_EMPLOYEE_ID)).toBeUndefined();
  });

  it('keeps self option for non-admin users', () => {
    const options = buildEmployeeSelectOptions(employees, false);
    expect(options[0]).toEqual(SELF_OPTION);
    expect(options).toHaveLength(3);
  });

  it('filters inactive employees out of leave target options', () => {
    const options = buildEmployeeSelectOptions(
      [
        { id: 'active-number', label: 'Active Number', status: EmployeeStatusType.Active },
        { id: 'active-string', label: 'Active String', status: 'Active' },
        { id: 'active-numeric-string', label: 'Active Numeric String', status: '0' },
        { id: 'inactive-number', label: 'Inactive Number', status: EmployeeStatusType.Inactive },
        { id: 'inactive-string', label: 'Inactive String', status: 'Inactive' },
        { id: 'missing-status', label: 'Missing Status' },
      ],
      true
    );

    expect(options.map((option) => option.id)).toEqual([
      'active-number',
      'active-string',
      'active-numeric-string',
    ]);
  });

  it('treats the self option as a valid active target for non-admin self leave', () => {
    expect(isActiveEmployeeOption(SELF_OPTION)).toBe(true);
  });

  it('validates admin and non-admin employee selection rules', () => {
    expect(isEmployeeSelectionValidForCreate({ id: 'emp-1', label: 'Emp 1' }, true)).toBe(true);
    expect(isEmployeeSelectionValidForCreate({ id: SELF_EMPLOYEE_ID, label: 'Self' }, true)).toBe(
      false
    );
    expect(isEmployeeSelectionValidForCreate({ id: SELF_EMPLOYEE_ID, label: 'Self' }, false)).toBe(
      true
    );
    expect(isEmployeeSelectionValidForCreate(null, false)).toBe(false);
  });
});

describe('academic year helpers', () => {
  const academicYears = [
    {
      id: 'year-1',
      name: '2025-26',
      startDate: '2025-06-01T00:00:00.000Z',
      endDate: '2026-05-31T23:59:59.999Z',
    },
    {
      id: 'year-2',
      name: '2026-27',
      startDate: '2026-06-01T00:00:00.000Z',
      endDate: '2027-05-31T23:59:59.999Z',
    },
  ] as any;

  it('resolves academic year from selected leave start date', () => {
    expect(
      resolveAcademicYearIdForLeaveDate(dayjs('2026-06-15'), academicYears, 'fallback-year')
    ).toBe('year-2');

    expect(
      resolveAcademicYearIdForLeaveDate(dayjs('2026-05-15'), academicYears, 'fallback-year')
    ).toBe('year-1');
  });

  it('uses fallback academic year when no match is found', () => {
    expect(
      resolveAcademicYearIdForLeaveDate(dayjs('2030-01-01'), academicYears, 'fallback-year')
    ).toBe('fallback-year');
  });

  it('returns undefined for out-of-range date when no fallback is provided', () => {
    expect(resolveAcademicYearIdForLeaveDate(dayjs('2030-01-01'), academicYears)).toBeUndefined();
  });

  it('uses academic year start month and disables earlier months in same year', () => {
    const startMonth = getAcademicYearStartMonth('2026-06-01T00:00:00.000Z');
    expect(startMonth?.format('YYYY-MM')).toBe('2026-06');

    expect(
      shouldDisableMonthBeforeAcademicYearStart(dayjs('2026-05-01'), '2026-06-01T00:00:00.000Z')
    ).toBe(true);
    expect(
      shouldDisableMonthBeforeAcademicYearStart(dayjs('2026-06-01'), '2026-06-01T00:00:00.000Z')
    ).toBe(false);
    expect(
      shouldDisableMonthBeforeAcademicYearStart(dayjs('2027-01-01'), '2026-06-01T00:00:00.000Z')
    ).toBe(false);
  });

  it('checks if a date belongs to current academic year boundaries', () => {
    expect(
      isDateWithinAcademicYear(dayjs('2026-05-31'), {
        startDate: '2025-06-01T00:00:00.000Z',
        endDate: '2026-05-31T23:59:59.999Z',
      } as any)
    ).toBe(true);
    expect(
      isDateWithinAcademicYear(dayjs('2026-06-01'), {
        startDate: '2025-06-01T00:00:00.000Z',
        endDate: '2026-05-31T23:59:59.999Z',
      } as any)
    ).toBe(false);
  });
});

describe('problem details parsing', () => {
  it('prefers detail over legacy nested message', () => {
    const parsed = parseApiProblemDetail({
      data: {
        detail: 'Please select an employee to create leave.',
        error: { message: 'Legacy message' },
      },
    });

    expect(parsed.detail).toBe('Please select an employee to create leave.');
  });

  it('detects admin role from profile payload', () => {
    expect(isAdminFromProfile({ role: 'admin' })).toBe(true);
    expect(isAdminFromProfile({ role: ['teacher', 'admin'] })).toBe(true);
    expect(isAdminFromProfile({ role: 'teacher' })).toBe(false);
  });

  it('preserves leave notice period error detail and code', () => {
    const parsed = parseApiProblemDetail({
      data: {
        detail: 'Minimum notice period requirement is not met.',
        errorCode: LEAVE_NOTICE_PERIOD,
      },
    });

    expect(parsed.detail).toBe('Minimum notice period requirement is not met.');
    expect(parsed.errorCode).toBe(LEAVE_NOTICE_PERIOD);
  });
});

describe('leave center tab visibility', () => {
  it('shows approvals alongside personal tabs for reviewers', () => {
    expect(getLeaveCenterVisibleTabs('hr', true)).toEqual(['balance', 'my-requests', 'approvals']);
    expect(
      resolveLeaveCenterTab('approvals', ['balance', 'my-requests', 'approvals'], 'balance')
    ).toBe('approvals');
  });

  it('keeps only personal leave tabs for self-service users', () => {
    expect(getLeaveCenterVisibleTabs('self', true)).toEqual(['balance', 'my-requests']);
    expect(getLeaveCenterVisibleTabs('self', false)).toEqual(['balance', 'my-requests']);
  });

  it('keeps personal leave tabs for HR users who cannot review leaves', () => {
    expect(getLeaveCenterVisibleTabs('hr', false)).toEqual(['balance', 'my-requests']);
    expect(resolveLeaveCenterTab('balance', ['balance', 'my-requests'], 'balance')).toBe('balance');
  });

  it('uses balance as the fallback tab when the requested tab is not visible', () => {
    expect(resolveLeaveCenterTab('approvals', ['balance', 'my-requests'], 'balance')).toBe(
      'balance'
    );
  });

  it('keeps explicit request and approval tab selections when visible', () => {
    const reviewerTabs = ['balance', 'my-requests', 'approvals'] as const;

    expect(resolveLeaveCenterTab('my-requests', [...reviewerTabs], 'balance')).toBe('my-requests');
    expect(resolveLeaveCenterTab('approvals', [...reviewerTabs], 'balance')).toBe('approvals');
    expect(resolveLeaveCenterTab('balance', [...reviewerTabs], 'balance')).toBe('balance');
  });

  it('uses balance as the self leave default when no query tab is provided', () => {
    expect(resolveLeaveCenterTab('balance', ['balance', 'my-requests'], 'balance')).toBe('balance');
    expect(resolveLeaveCenterTab('my-requests', ['balance', 'my-requests'], 'balance')).toBe(
      'my-requests'
    );
    expect(resolveLeaveCenterTab('approvals', ['balance', 'my-requests'], 'balance')).toBe(
      'balance'
    );
  });
});

describe('leave overview builder', () => {
  it('fetches HR overview only when an employee target is available', () => {
    expect(
      shouldFetchHrEmployeeLeaveOverview({
        enabled: true,
        isSelfMode: false,
        academicYearId: 'year-1',
        employeeId: 'employee-1',
      })
    ).toBe(true);

    expect(
      shouldFetchHrEmployeeLeaveOverview({
        enabled: true,
        isSelfMode: false,
        academicYearId: 'year-1',
        employeeId: undefined,
      })
    ).toBe(false);

    expect(
      shouldFetchHrEmployeeLeaveOverview({
        enabled: true,
        isSelfMode: true,
        academicYearId: 'year-1',
        employeeId: 'employee-1',
      })
    ).toBe(false);
  });

  it('totals entitlement, used, remaining, and pending leave days', () => {
    const overview = buildLeaveOverview(
      {
        items: [
          {
            paidType: 'Paid',
            entitledDays: 10,
            usedDays: 3,
            remainingDays: 7,
          },
          {
            paidType: 'Unpaid',
            entitledDays: 8,
            usedDays: 2,
            remainingDays: 6,
          },
        ],
      },
      {
        items: [
          { paidType: 'Paid', status: 'Pending', totalDays: 0.5 },
          {
            paidType: 'Unpaid',
            status: 'APPROVED',
            totalDays: 1,
          },
          {
            paidType: 'Unpaid',
            status: 'PENDING',
            totalDays: 2,
          },
        ],
      }
    );

    expect(overview.totalLeaves).toBe(18);
    expect(overview.usedLeaves).toBe(5);
    expect(overview.remainingLeaves).toBe(13);
    expect(overview.pendingLeaveDays).toBe(2.5);
    expect(overview.bucketBreakdown).toEqual([
      {
        bucketId: 'Paid',
        bucketName: 'Paid',
        total: 10,
        used: 3,
        pendingDays: 0.5,
        remaining: 7,
        isUnlimited: false,
      },
      {
        bucketId: 'Unpaid',
        bucketName: 'Unpaid',
        total: 8,
        used: 2,
        pendingDays: 2,
        remaining: 6,
        isUnlimited: false,
      },
    ]);
  });

  it('uses accrued days for finite leave buckets when the balance contract provides them', () => {
    const overview = buildLeaveOverview({
      items: [
        {
          paidType: 'Paid',
          entitledDays: 12,
          accruedDays: 3,
          usedDays: 1,
          pendingDays: 0.5,
          remainingDays: 2,
        },
      ],
    });

    expect(overview.totalLeaves).toBe(3);
    expect(overview.usedLeaves).toBe(1);
    expect(overview.remainingLeaves).toBe(2);
    expect(overview.bucketBreakdown[0]).toMatchObject({
      bucketId: 'Paid',
      total: 3,
      used: 1,
      pendingDays: 0.5,
      remaining: 2,
      isUnlimited: false,
    });
  });

  it('keeps negative-balance buckets finite and displays negative remaining days', () => {
    const overview = buildLeaveOverview({
      items: [
        {
          paidType: 'Paid',
          entitlementMode: 'Limited',
          entitledDays: 12,
          accruedDays: 2,
          usedDays: 3,
          pendingDays: 0,
          remainingDays: -1,
          allowNegativeBalance: true,
          isUnlimited: false,
        },
      ],
    });

    expect(overview.totalLeaves).toBe(2);
    expect(overview.remainingLeaves).toBe(-1);
    expect(overview.bucketBreakdown[0]).toMatchObject({
      total: 2,
      used: 3,
      remaining: -1,
      isUnlimited: false,
    });
  });

  it('excludes unlimited unpaid buckets from finite balance totals', () => {
    const overview = buildLeaveOverview({
      items: [
        {
          paidType: 'Paid',
          entitledDays: 12,
          usedDays: 0,
          remainingDays: 12,
        },
        {
          paidType: 'Unpaid',
          entitlementMode: 'Unlimited',
          entitledDays: null,
          usedDays: 0,
          remainingDays: null,
        },
      ],
    });

    expect(overview.totalLeaves).toBe(12);
    expect(overview.remainingLeaves).toBe(12);
    expect(overview.bucketBreakdown[1]).toMatchObject({
      bucketId: 'Unpaid',
      bucketName: 'Unpaid',
      remaining: 0,
      isUnlimited: true,
    });
  });

  it('returns zero overview for empty balance data', () => {
    expect(buildLeaveOverview({ items: [] }, { items: [{ status: 'PENDING' }] })).toEqual(
      EMPTY_LEAVE_OVERVIEW
    );
  });

  it('uses paid type before display names for pending day matching', () => {
    const overview = buildLeaveOverview(
      {
        items: [
          {
            paidType: 'Paid',
            entitledDays: 5,
            usedDays: 1,
            remainingDays: 4,
          },
        ],
      },
      {
        items: [
          {
            paidType: 'Paid',
            leaveType: 'Renamed Leave',
            status: 'PENDING',
            totalDays: 2,
          },
        ],
      }
    );

    expect(overview.pendingLeaveDays).toBe(2);
    expect(overview.bucketBreakdown[0].pendingDays).toBe(2);
  });

  it('uses balance pending days when provided instead of paged history totals', () => {
    const overview = buildLeaveOverview(
      {
        items: [
          {
            paidType: 'Paid',
            entitledDays: 5,
            usedDays: 1,
            pendingDays: 3.5,
            remainingDays: 4,
          },
        ],
      },
      {
        items: [{ paidType: 'Paid', status: 'PENDING', totalDays: 1 }],
      }
    );

    expect(overview.pendingLeaveDays).toBe(3.5);
    expect(overview.bucketBreakdown[0].pendingDays).toBe(3.5);
  });

  it('falls back to paid bucket names when pending requests lack paid type values', () => {
    const overview = buildLeaveOverview(
      {
        items: [
          {
            leaveTypeName: 'Paid',
            entitledDays: 5,
            usedDays: 1,
            remainingDays: 4,
          },
        ],
      },
      {
        items: [
          { leaveType: 'Paid', status: 'PENDING', totalDays: 0.5 },
          { leaveType: 'Paid', status: 'APPROVED', totalDays: 1 },
          { leaveType: 'Paid', status: 'REJECTED', totalDays: 1 },
          { leaveType: 'Paid', status: 'UNKNOWN_VALUE', totalDays: 1 },
        ],
      }
    );

    expect(overview.pendingLeaveDays).toBe(0.5);
    expect(overview.bucketBreakdown[0].pendingDays).toBe(0.5);
  });

  it('formats leave day values without rounding away supported precision', () => {
    expect(formatLeaveDays(37)).toBe('37');
    expect(formatLeaveDays(0.5)).toBe('0.5');
    expect(formatLeaveDays(1.25)).toBe('1.25');
    expect(formatLeaveDays(7.922816251426434e28)).not.toContain('e');
  });
});

describe('apply leave row actions', () => {
  it('keeps approval actions out of My Requests', () => {
    expect([...APPLY_LEAVE_ROW_ACTION_LABELS]).toEqual(['View', 'Cancel']);
    expect(APPLY_LEAVE_ROW_ACTION_LABELS).not.toContain('Approve');
    expect(APPLY_LEAVE_ROW_ACTION_LABELS).not.toContain('Reject');
  });
});
