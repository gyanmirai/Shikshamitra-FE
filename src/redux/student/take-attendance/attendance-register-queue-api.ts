import { api } from 'src/redux/service';
import { studentType, studentTakeAttendanceType } from 'src/redux/tagTypes';

export type AttendanceRegisterQueueInput = {
  academicYearId: string;
  boardId?: string;
  mediumId?: string;
  standardId?: string;
  divisionId?: string;
  skipCount: number;
  maxResultCount: number;
};

export type AttendanceRegisterQueueItem = {
  standardId: string;
  divisionId: string;
  className: string;
  divisionName: string;
  date: string;
  status: 'missing' | 'draft' | 'review';
  href: string;
};

export const buildAttendanceRegisterQueueRequest = (params: AttendanceRegisterQueueInput) => ({
  url: '/students/dashboard/attendance-registers',
  params,
});

const attendanceRegisterQueueApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAttendanceRegisterQueue: builder.query<
      { items: AttendanceRegisterQueueItem[]; totalCount: number },
      AttendanceRegisterQueueInput
    >({
      query: buildAttendanceRegisterQueueRequest,
      providesTags: [
        { type: studentTakeAttendanceType.studentTakeAttendance, id: 'WORKSPACE' },
        studentType.student,
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAttendanceRegisterQueueQuery } = attendanceRegisterQueueApi;
