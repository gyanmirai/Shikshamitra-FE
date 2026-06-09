import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';
import { EmployeeStatusType } from 'src/enums/employee-status-type';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
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
  buildEmployeeSelectOptions,
  getLeaveNoticePeriodMessage,
  isLeaveNoticePeriodSatisfied,
  APPLY_LEAVE_ROW_ACTION_LABELS,
  shouldEnforceLeaveNoticePeriod,
  buildCreateLeaveRequestFormData,
  buildLeaveAttachmentDownloadPath,
  getSelectableLeaveRequestOptions,
  formatLeaveCalendarDateForPayload,
  formatLeaveCalendarDateForDisplay,
  isEmployeeSelectionValidForCreate,
  resolveAcademicYearIdForLeaveDate,
  shouldDisableMonthBeforeAcademicYearStart,
} from 'src/screens/hr/leave-request/leave-request.utils';

describe('leave request payload mapping', () => {
  it('uses forEmployeeId for non-self selection and never sends employeeId', () => {
    const formData = buildCreateLeaveRequestFormData({
      employee: { id: 'emp-123', label: 'John Doe' },
      leaveTypeMasterId: 'type-1',
      startDate: dayjs('2026-06-01'),
      endDate: dayjs('2026-06-02'),
      halfDay: false,
      reason: 'Family function',
      docs: null,
    });

    expect(formData.get('forEmployeeId')).toBe('emp-123');
    expect(formData.get('employeeId')).toBeNull();
    expect(formData.get('leavePolicyId')).toBeNull();
    expect(formData.get('leaveTypeId')).toBe('type-1');
  });

  it('omits forEmployeeId for self selection', () => {
    const formData = buildCreateLeaveRequestFormData({
      employee: { id: SELF_EMPLOYEE_ID, label: 'Self' },
      leaveTypeMasterId: 'type-1',
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
      leaveTypeMasterId: 'type-1',
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
      leaveTypeMasterId: 'type-1',
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
      leaveTypeMasterId: 'type-1',
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

  it('excludes policy rules whose leave type is missing from the active catalog', () => {
    const result = getSelectableLeaveRequestOptions(
      [{ id: 'type-1', name: 'Sick' } as any],
      [
        {
          id: 'policy-1',
          rules: [{ id: 'rule-1', leaveType: { id: 'deleted-type' }, isActive: true }],
        } as any,
      ]
    );

    expect(result.leaveTypes).toEqual([]);
    expect(result.leavePolicies).toEqual([]);
  });

  it('excludes policies without active rules', () => {
    const result = getSelectableLeaveRequestOptions(
      [{ id: 'type-1', name: 'Sick' } as any],
      [{ id: 'policy-1', rules: [] } as any]
    );

    expect(result.leaveTypes).toEqual([]);
    expect(result.leavePolicies).toEqual([]);
  });

  it('keeps leave types from active policy rules selectable', () => {
    const result = getSelectableLeaveRequestOptions(
      [
        { id: 'type-1', name: 'Sick' },
        { id: 'type-2', name: 'Casual' },
      ] as any,
      [
        { id: 'policy-1', rules: [{ id: 'rule-1', leaveType: { id: 'type-1' }, isActive: true }] },
      ] as any
    );

    expect(result.leaveTypes.map((item: any) => item.id)).toEqual(['type-1']);
    expect(result.leavePolicies.map((item: any) => item.id)).toEqual(['policy-1']);
  });

  it('deduplicates the same leave type across policy rules', () => {
    const policies = [
      { id: 'policy-1', rules: [{ id: 'rule-1', leaveType: { id: 'type-1' }, isActive: true }] },
      { id: 'policy-2', rules: [{ id: 'rule-2', leaveType: { id: 'type-1' }, isActive: true }] },
    ];
    const result = getSelectableLeaveRequestOptions(
      [{ id: 'type-1', name: 'Sick' } as any],
      policies
    );

    expect(result.leaveTypes.map((item: any) => item.id)).toEqual(['type-1']);
    expect(result.leavePolicies.map((item: any) => item.id)).toEqual(['policy-1', 'policy-2']);
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
    expect(getLeaveCenterVisibleTabs('self', true)).toEqual([
      'balance',
      'my-requests',
      'approvals',
    ]);
    expect(
      resolveLeaveCenterTab('approvals', ['balance', 'my-requests', 'approvals'], 'balance')
    ).toBe('approvals');
  });

  it('keeps personal leave tabs for users who cannot review leaves', () => {
    expect(getLeaveCenterVisibleTabs('self', false)).toEqual(['balance', 'my-requests']);
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
});

describe('apply leave row actions', () => {
  it('keeps approval actions out of My Requests', () => {
    expect([...APPLY_LEAVE_ROW_ACTION_LABELS]).toEqual(['View', 'Cancel']);
    expect(APPLY_LEAVE_ROW_ACTION_LABELS).not.toContain('Approve');
    expect(APPLY_LEAVE_ROW_ACTION_LABELS).not.toContain('Reject');
  });
});
