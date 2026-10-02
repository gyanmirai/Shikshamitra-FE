import { api } from 'src/redux/service';
import { employeeType } from 'src/redux/tagTypes';

export type DailyStaffStatus =
  'Present' | 'Absent' | 'OnLeave' | 'HalfDay' | 'NotMarked' | 'NotScheduled' | 'NeedsSetup';
export type DashboardSectionState = 'Available' | 'Forbidden' | 'Failed' | 'Unavailable';
export type DashboardOption = { id: string; name: string };
export type DashboardCounts = {
  date: string;
  staffCount: number;
  present: number;
  absent: number;
  onLeave: number;
  halfDay: number;
  notMarked: number;
  notScheduled: number;
  needsSetup: number;
  needsReview: number;
};
export type DashboardStaff = {
  employeeId: string;
  name: string;
  employeeCode: string;
  isTeaching: boolean;
  department?: string | null;
  stages: DashboardOption[];
  shiftName?: string | null;
  status: DailyStaffStatus;
  approvedLeaveCoverage?: 'FullDay' | 'HalfDay' | null;
  source?: string | null;
  timeIn?: string | null;
  timeOut?: string | null;
  reviewFlags: {
    code:
      | 'FullDayLeaveConflict'
      | 'IncompletePunch'
      | 'CalendarNeedsConfiguration'
      | 'AttendanceOnNonWorkingDay'
      | 'RemainingHalfDayUnmarked'
      | 'ConflictingAttendanceRecords';
    message: string;
  }[];
};
export type DashboardCapabilities = {
  canViewAttendance: boolean;
  canViewStaff: boolean;
  canViewEmployees: boolean;
  canMarkAttendance: boolean;
  canViewLeave: boolean;
  canViewPayroll: boolean;
  canOpenPayroll: boolean;
};
export type OperationalOverview = {
  date: string;
  generatedAt: string;
  scopeLabel: string;
  capabilities: DashboardCapabilities;
  attendanceState: DashboardSectionState;
  workforceState: DashboardSectionState;
  leaveState: DashboardSectionState;
  payrollState: DashboardSectionState;
  staffCount?: number | null;
  summary?: DashboardCounts | null;
  trend?: DashboardCounts[] | null;
  filters: { departments: string[]; stages: DashboardOption[]; shifts: DashboardOption[] };
  attention: { kind: string; title: string; count: number; action: string }[];
  pendingLeaveRequests?: number | null;
  payroll?: {
    month: string;
    savedStaffCount: number;
    reviewedCount: number;
    lockedCount: number;
    pendingCount: number;
    lastUpdatedAt?: string | null;
  } | null;
};
export type OverviewQuery = {
  date: string;
  isTeaching?: boolean;
  educationMediumStageId?: string;
  department?: string;
  shiftId?: string;
  // Cache identity only. Never sent to the server or trusted for authorization.
  accessKey: string;
};
export type StaffQuery = OverviewQuery & {
  search?: string;
  status?: DailyStaffStatus | 'Review';
  sorting: string;
  skipCount: number;
  maxResultCount: number;
};
export type OperationalStaffPage = {
  date: string;
  generatedAt: string;
  totalCount: number;
  items: DashboardStaff[];
};

export const operationalDashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHROperationalOverview: builder.query<OperationalOverview, OverviewQuery>({
      query: ({ accessKey, ...params }) => ({ url: '/hr/dashboard/overview', params }),
      providesTags: [
        employeeType.hrDashboard,
        employeeType.employee,
        employeeType.attendance,
        employeeType.runPayroll,
      ],
      keepUnusedDataFor: 0,
    }),
    getHROperationalStaff: builder.query<OperationalStaffPage, StaffQuery>({
      query: ({ accessKey, ...params }) => ({ url: '/hr/dashboard/staff', params }),
      providesTags: [employeeType.hrDashboard, employeeType.employee, employeeType.attendance],
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetHROperationalOverviewQuery, useGetHROperationalStaffQuery } =
  operationalDashboardApi;
