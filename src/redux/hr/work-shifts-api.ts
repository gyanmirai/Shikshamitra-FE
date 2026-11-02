import { api } from 'src/redux/service';
import { employeeType, workShiftType } from 'src/redux/tagTypes';

export type WorkShift = {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  isAssigned: boolean;
  concurrencyStamp: string;
};
export type ShiftAssignment = {
  id: string;
  workShiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  provenance: string;
  concurrencyStamp: string;
};
export type WorkSchedule = {
  today: string;
  concurrencyStamp: string;
  current: ShiftAssignment | null;
  upcoming: ShiftAssignment[];
  history: ShiftAssignment[];
};
export const workShiftsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWorkShifts: builder.query<
      { items: WorkShift[]; totalCount: number },
      { skipCount?: number; maxResultCount?: number; sorting?: string } | void
    >({
      query: (params) => ({ url: '/hr/work-shifts', params: params || undefined }),
      providesTags: [workShiftType.workShift],
    }),
    getWorkShiftOptions: builder.query<{ items: WorkShift[]; today: string }, void>({
      query: () => '/hr/work-shifts/lookup',
      providesTags: [workShiftType.workShift],
    }),
    addWorkShift: builder.mutation<WorkShift, Partial<WorkShift>>({
      query: (body) => ({ url: '/hr/work-shifts', method: 'POST', body }),
      invalidatesTags: [workShiftType.workShift],
    }),
    updateWorkShift: builder.mutation<WorkShift, { id: string; body: Partial<WorkShift> }>({
      query: ({ id, body }) => ({ url: `/hr/work-shifts/${id}`, method: 'PUT', body }),
      invalidatesTags: [workShiftType.workShift],
    }),
    deleteWorkShift: builder.mutation<void, { id: string; concurrencyStamp: string }>({
      query: ({ id, concurrencyStamp }) => ({
        url: `/hr/work-shifts/${id}`,
        method: 'DELETE',
        params: { concurrencyStamp },
      }),
      invalidatesTags: [workShiftType.workShift],
    }),
    getWorkSchedule: builder.query<WorkSchedule, string>({
      query: (id) => `/hr/employees/${id}/shift-assignments`,
      providesTags: [workShiftType.shiftAssignment],
    }),
    scheduleWorkShift: builder.mutation<
      WorkSchedule,
      { employeeId: string; workShiftId: string; effectiveFrom: string; concurrencyStamp: string }
    >({
      query: ({ employeeId, ...body }) => ({
        url: `/hr/employees/${employeeId}/shift-assignments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        workShiftType.shiftAssignment,
        workShiftType.workShift,
        employeeType.employee,
      ],
    }),
    cancelWorkShift: builder.mutation<
      WorkSchedule,
      { employeeId: string; assignmentId: string; concurrencyStamp: string }
    >({
      query: ({ employeeId, assignmentId, concurrencyStamp }) => ({
        url: `/hr/employees/${employeeId}/shift-assignments/${assignmentId}`,
        method: 'DELETE',
        params: { concurrencyStamp },
      }),
      invalidatesTags: [
        workShiftType.shiftAssignment,
        employeeType.employee,
        employeeType.attendance,
        employeeType.hrDashboard,
        employeeType.runPayroll,
        employeeType.hrReports,
      ],
    }),
  }),
});
export const {
  useGetWorkShiftsQuery,
  useGetWorkShiftOptionsQuery,
  useAddWorkShiftMutation,
  useUpdateWorkShiftMutation,
  useDeleteWorkShiftMutation,
  useGetWorkScheduleQuery,
  useScheduleWorkShiftMutation,
  useCancelWorkShiftMutation,
} = workShiftsApi;
