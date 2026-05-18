import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';
import { EmployeeStatusType } from 'src/enums/employee-status-type';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  SELF_OPTION,
  countLeaveUnits,
  SELF_EMPLOYEE_ID,
  isAdminFromProfile,
  resolveLeaveCenterTab,
  isActiveEmployeeOption,
  isDateWithinAcademicYear,
  getAcademicYearStartMonth,
  getLeaveCenterVisibleTabs,
  buildEmployeeSelectOptions,
  buildCreateLeaveRequestFormData,
  isEmployeeSelectionValidForCreate,
  resolveAcademicYearIdForLeaveDate,
  shouldDisableMonthBeforeAcademicYearStart,
} from 'src/screens/hr/leave-request/leave-request.utils';

describe('leave request payload mapping', () => {
  it('uses forEmployeeId for non-self selection and never sends employeeId', () => {
    const formData = buildCreateLeaveRequestFormData({
      employee: { id: 'emp-123', label: 'John Doe' },
      leavePolicyId: 'policy-1',
      leaveTypeId: 'type-1',
      startDate: dayjs('2026-06-01'),
      endDate: dayjs('2026-06-02'),
      halfDay: false,
      reason: 'Family function',
      docs: null,
    });

    expect(formData.get('forEmployeeId')).toBe('emp-123');
    expect(formData.get('employeeId')).toBeNull();
  });

  it('omits forEmployeeId for self selection', () => {
    const formData = buildCreateLeaveRequestFormData({
      employee: { id: SELF_EMPLOYEE_ID, label: 'Self' },
      leavePolicyId: 'policy-1',
      leaveTypeId: 'type-1',
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
      leavePolicyId: 'policy-1',
      leaveTypeId: 'type-1',
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
      leavePolicyId: 'policy-1',
      leaveTypeId: 'type-1',
      startDate: dayjs('2026-06-01'),
      endDate: dayjs('2026-06-01'),
      halfDay: true,
      reason: 'Medical appointment',
      docs: null,
    });

    expect(formData.get('halfDay')).toBe('true');
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
});

describe('leave center tab visibility', () => {
  it('shows approvals alongside personal tabs for reviewers', () => {
    expect(getLeaveCenterVisibleTabs('hr', true)).toEqual(['my-requests', 'approvals', 'balance']);
    expect(getLeaveCenterVisibleTabs('self', true)).toEqual([
      'my-requests',
      'approvals',
      'balance',
    ]);
    expect(
      resolveLeaveCenterTab('approvals', ['my-requests', 'approvals', 'balance'], 'my-requests')
    ).toBe('approvals');
  });

  it('keeps personal leave tabs for users who cannot review leaves', () => {
    expect(getLeaveCenterVisibleTabs('self', false)).toEqual(['my-requests', 'balance']);
    expect(getLeaveCenterVisibleTabs('hr', false)).toEqual(['my-requests', 'balance']);
    expect(resolveLeaveCenterTab('balance', ['my-requests', 'balance'], 'my-requests')).toBe(
      'balance'
    );
  });
});
