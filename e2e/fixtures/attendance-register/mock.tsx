import React, { useSyncExternalStore } from 'react';

export const stages = [
  { id: 'division-a', label: 'Primary / English' },
  { id: 'division-b', label: 'Secondary / English' },
  { id: 'division-c', label: 'Higher Secondary / Gujarati' },
];
export const useAcademicOrganizationOptions = () => ({ options: stages, isLoading: false });
const staff = Array.from({ length: 65 }, (_, index) => ({
  id: `staff-${index + 1}`,
  employeeId: `staff-${index + 1}`,
  employeeName: `Synthetic Staff ${String(index + 1).padStart(2, '0')}`,
  employeeCode: `S${index + 1}`,
  educationMediumStageId: stages[index % 3].id,
  educationMediumStageName: stages[index % 3].label,
  department: index % 2 ? 'Administration' : 'Science',
  employeeGroup: index % 2 ? 'NonTeaching' : 'Teaching',
}));
let revision = 0;
const listeners = new Set<() => void>();
const edits = new Map<string, any>();
const fixture = { query: {} as any, export: null as any, adjustments: [] as any[] };
(window as any).attendanceFixture = fixture;
export const useSearchParams = () => new URLSearchParams();
export const usePathname = () => '/hr/attendanceTracking';
export const useRouter = () => ({ push() {}, replace() {}, prefetch() {} });
export default function queryOrLink(props: any) {
  if (props.currentQueryAndMutation)
    return props.currentQueryAndMutation(props.params, props.options);
  return <a {...props} />;
}
export const shikshaMitraToast = { error: console.error, success() {}, warning() {}, info() {} };
export const useLazyGetEmployeeQuery = () => [
  React.useCallback(
    (query: any) => ({
      unwrap: async () => {
        const matches = staff.filter((row) =>
          row.employeeName.toLowerCase().includes(query.search.toLowerCase())
        );
        return {
          items: matches.slice((query.page - 1) * query.pageSize, query.page * query.pageSize),
          totalCount: matches.length,
        };
      },
    }),
    []
  ),
];
export function useGetGroupedAttendanceRegisterQuery(query: any) {
  useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => revision
  );
  fixture.query = structuredClone(query);
  let rows = staff
    .filter(
      (row) =>
        (!query.educationMediumStageIds?.length ||
          query.educationMediumStageIds.includes(row.educationMediumStageId)) &&
        (!query.employeeId || row.id === query.employeeId) &&
        (!query.department || row.department.includes(query.department)) &&
        (!query.employeeGroup || row.employeeGroup === query.employeeGroup) &&
        (!query.search ||
          `${row.employeeName} ${row.employeeCode}`
            .toLowerCase()
            .includes(query.search.toLowerCase()))
    )
    .map((row) => {
      const day = {
        attendanceId: `${row.id}-day`,
        ...row,
        attendanceDate: query.startDate,
        payrollMonth: query.startDate.slice(0, 7),
        inTime: '09:00:00',
        outTime: '17:00:00',
        status: 'Present',
        canEdit: true,
        isDayLocked: false,
        isPayrollLocked: false,
        captureMode: 'manual_with_time',
        ...edits.get(`${row.id}-day`),
      };
      return {
        ...row,
        days: [day],
        recordedDays: 1,
        present: day.status === 'Present' ? 1 : 0,
        absent: day.status === 'FullDayLeave' ? 1 : 0,
        halfDay: 0,
        editable: 1,
        locked: 0,
        missingPunch: 0,
        hasExceptions: day.status !== 'Present',
      };
    });
  if (query.status) rows = rows.filter((row) => row.days[0].status === query.status);
  if (
    query.payrollState === 'Locked' ||
    query.exceptionFilter === 'Locked' ||
    query.exceptionFilter === 'MissingPunch'
  )
    rows = [];
  if (query.exceptionFilter === 'NeedsAttention' || query.exceptionFilter === 'Absent')
    rows = rows.filter((row) => row.absent > 0);
  if (query.sorting) {
    const [key, direction] = query.sorting.split(' ');
    rows.sort(
      (a: any, b: any) =>
        String(a[key]).localeCompare(String(b[key])) * (direction === 'desc' ? -1 : 1)
    );
  }
  const currentData = {
    totalCount: rows.length,
    items: rows.slice(query.skipCount, query.skipCount + query.maxResultCount),
  };
  return { currentData, data: currentData, isLoading: false, isFetching: false, refetch() {} };
}
const mutate = (body: any) => ({
  unwrap: async () => {
    fixture.adjustments.push(body);
    for (const id of body.attendanceIds || [body.attendanceId])
      if (id)
        edits.set(id, {
          status: body.statusWire === 'ABSENT' ? 'FullDayLeave' : 'Present',
          remarks: body.remarks,
        });
    revision += 1;
    listeners.forEach((listener) => listener());
    return { updatedCount: 1, skippedCount: 0 };
  },
});
export const useAdjustAttendanceRegisterMutation = () => [mutate, { isLoading: false }];
export const useBulkAdjustAttendanceRegisterMutation = useAdjustAttendanceRegisterMutation;
export const useHrTableExport = (_table: string, query: any) => async (request: any) => {
  fixture.export = { query: structuredClone(query), request: { ...request, signal: undefined } };
};
