import type { HrPolicyVersion, HrPolicyImpactPreview } from 'src/redux/hr/hr-policy-api';

export const pfRules = [
  {
    id: 'pf-rule-1',
    code: 'SYN-PF',
    name: 'Synthetic PF rule',
    employeePercentage: 12,
    employerPercentage: 12,
    contributionBasis: 0,
    wageCeiling: 15000,
    effectiveFrom: '2026-04-01',
    isActive: true,
    version: 1,
  },
];

export function manualAttendanceDay(query: Record<string, unknown>) {
  const allStaff = [
    {
      employeeId: 'manual-1',
      fullName: 'Synthetic Teacher',
      employeeCode: 'SYN-1',
      department: 'Science',
      isTeaching: true,
    },
    {
      employeeId: 'manual-2',
      fullName: 'Synthetic Support',
      employeeCode: 'SYN-2',
      department: 'Support',
      isTeaching: false,
    },
    {
      employeeId: 'manual-3',
      fullName: 'Synthetic Administrator',
      employeeCode: 'SYN-3',
      department: 'Administration',
      isTeaching: false,
    },
  ];
  const items = allStaff
    .filter(
      (staff) =>
        (query.isTeaching == null || staff.isTeaching === (String(query.isTeaching) === 'true')) &&
        (!query.department ||
          staff.department.toLowerCase().includes(String(query.department).toLowerCase()))
    )
    .map((staff) => ({
      ...staff,
      dateIso: `${query.attendanceDate}T00:00:00Z`,
      status: 1,
      captureMode: 'manual_status',
      warnings: [],
      errors: [],
    }));
  return {
    items,
    totalCount: items.length,
    date: query.attendanceDate,
    isDayLocked: false,
    isHoliday: false,
    captureMode: 'manual_status',
  };
}

export const year = {
  id: 'synthetic-year',
  name: '2026–2027',
  startDate: '2026-04-01',
  endDate: '2027-03-31',
};
export const calendars = ['Main calendar', 'Other calendar'].map((name, index) => ({
  id: `calendar-${index + 1}`,
  name,
  academicYearId: year.id,
  status: 'active',
  version: 1,
  weeklyOffPattern: 'saturday_sunday',
  customWeeklyOffs: [],
  holidaySyncMode: 'snapshot',
  holidays: [],
  effectiveFrom: year.startDate,
}));
export const attendance = [
  {
    id: 'attendance-1',
    academicYearId: year.id,
    name: 'Synthetic attendance',
    status: 'active',
    version: 1,
    workCalendarPolicyId: 'calendar-1',
    isDefault: false,
    captureMode: 'integrated',
    fullDayThresholdPercentage: 75,
    halfDayThresholdPercentage: 50,
    absentThresholdPercentage: 0,
    missingPunchBehavior: 'requires_review',
    manualCorrectionAllowed: true,
    graceTime: 7,
    maxLateAllowedPerMonth: 4,
    penaltyType: 'warning',
    penaltyCountThreshold: 5,
    penaltyDeductionAmount: null,
    earlyExitEnabled: true,
    earlyExitGraceTime: 8,
    overtimeEnabled: true,
    overtimeRate: '1.5x',
    minOvertimeMinutes: 30,
    holidayWorkBehavior: 'both',
    payrollPreviewEnabled: false,
  },
];
export const payroll = [
  {
    id: 'payroll-1',
    academicYearId: year.id,
    name: 'Synthetic payroll',
    status: 'active',
    version: 1,
    workCalendarPolicyId: 'calendar-1',
    isDefault: true,
    dayCalculationType: 'working-days',
    manualMonthDays: [],
    saturdayWorkPolicy: 'full-day',
  },
];
export const leave = [
  {
    id: 'leave-1',
    academicYearId: year.id,
    policyTitle: 'Synthetic leave',
    status: 'Active',
    isDefault: true,
    effectiveFrom: year.startDate,
    effectiveTo: year.endDate,
    rules: [
      {
        id: 'paid',
        paidType: 'Paid',
        leaveCount: 0,
        entitlementMode: 'Limited',
        accrualPolicyType: 'Yearly',
        isActive: true,
        requiresApproval: true,
      },
      {
        id: 'unpaid',
        paidType: 'Unpaid',
        entitlementMode: 'Unlimited',
        isUnlimited: true,
        isActive: true,
      },
    ],
  },
];

export const versions: HrPolicyVersion[] = [
  {
    id: 'version-1',
    policyType: 'payroll',
    policyId: payroll[0].id,
    academicYearId: year.id,
    versionNumber: 1,
    name: payroll[0].name,
    status: 'active',
    changeAction: 'created',
    creationTime: '2026-04-01T00:00:00Z',
    snapshotJson: JSON.stringify(payroll[0]),
  },
];

export const policyImpact: HrPolicyImpactPreview = {
  policyType: 'payroll',
  academicYearId: year.id,
  action: 'update',
  affectedEmployeeCount: 0,
  affectedAssignmentCount: 0,
  affectedEmployees: [],
  affectedPayrollMonths: [],
  lockedPayrollMonths: [],
  affectedAttendanceEvaluationMonths: [],
  hasStalePayrollRisk: false,
  warnings: [],
  blockingWarnings: [
    {
      severity: 'blocking',
      code: 'ShikshaMitra:HrPolicyAssignmentOverlap',
      message: 'Synthetic conflicting staff assignment.',
      conflict: {
        assignmentId: 'assignment-1',
        targetType: 'employee',
        targetKey: 'synthetic-user',
        targetDisplayName: 'Synthetic staff',
        payrollPolicyId: payroll[0].id,
        payrollPolicyName: payroll[0].name,
        attendancePolicyId: attendance[0].id,
        attendancePolicyName: attendance[0].name,
        effectiveFrom: year.startDate,
        effectiveTo: year.endDate,
        priority: 100,
        suggestedFixes: [],
      },
    },
  ],
};
