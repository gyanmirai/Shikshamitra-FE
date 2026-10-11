import { api } from 'src/redux/service';
import { studentAttendanceType } from 'src/redux/tagTypes';

export type StudentLeaveType = {
  id: string;
  leaveTypeName: string;
  color: string;
  isActive: boolean;
  creationTime?: string;
  lastModificationTime?: string | null;
};

export type StudentLeaveTypeInput = Pick<StudentLeaveType, 'leaveTypeName' | 'color' | 'isActive'>;

export type StudentLeaveTypeList = { items: StudentLeaveType[]; totalCount: number };
export type StudentLeaveTypeQuery = {
  filterText?: string;
  isActive?: boolean;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
};

const tag = studentAttendanceType.studentAttendanceType;

export const StudentAttendanceTypeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentAttendanceType: builder.query<StudentLeaveTypeList, StudentLeaveTypeQuery | void>({
      query: (params) => ({
        url: '/students/attendance/settings/leave-types',
        params: params || undefined,
      }),
      providesTags: [tag],
    }),
    addStudentAttendanceType: builder.mutation<StudentLeaveType, StudentLeaveTypeInput>({
      query: (body) => ({ url: '/students/attendance/settings/leave-types', method: 'POST', body }),
      invalidatesTags: [tag],
    }),
    updateStudentAttendanceType: builder.mutation<
      StudentLeaveType,
      { id: string; body: StudentLeaveTypeInput }
    >({
      query: ({ id, body }) => ({
        url: `/students/attendance/settings/leave-types/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [tag],
    }),
    deleteStudentAttendanceType: builder.mutation<void, string>({
      query: (id) => ({ url: `/students/attendance/settings/leave-types/${id}`, method: 'DELETE' }),
      invalidatesTags: [tag],
    }),
  }),
});

export const {
  useAddStudentAttendanceTypeMutation,
  useUpdateStudentAttendanceTypeMutation,
  useDeleteStudentAttendanceTypeMutation,
  useGetStudentAttendanceTypeQuery,
} = StudentAttendanceTypeApi;
