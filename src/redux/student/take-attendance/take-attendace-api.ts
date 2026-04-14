import { api } from 'src/redux/service';
import { studentTakeAttendanceType } from 'src/redux/tagTypes';

export const StudentTakeAttendanceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /** GET /students/attendance/students
     *  Returns attendance day info + student list for a given class/date.
     */
    getAttendanceByFilter: builder.query({
      query: ({ AcademicYearId, StandardId, DivisionId, Date }) => {
        const params = new URLSearchParams();
        if (AcademicYearId) params.append('AcademicYearId', AcademicYearId);
        if (StandardId) params.append('StandardId', StandardId);
        if (DivisionId) params.append('DivisionId', DivisionId);
        if (Date) params.append('Date', Date);
        return {
          url: `/students/attendance/students?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: [studentTakeAttendanceType.studentTakeAttendance],
    }),

    /** POST /students/attendance/mark
     *  Saves attendance entries for a day.
     *  Body: { academicYearId, standardId, divisionId, date, entries: [{studentId, status, remarks}] }
     */
    markAttendance: builder.mutation({
      query: (data) => ({
        url: `/students/attendance/mark`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [studentTakeAttendanceType.studentTakeAttendance],
    }),

    /** POST /students/attendance/lock
     *  Locks the attendance day so no further edits are allowed.
     *  Body: { academicYearId, standardId, divisionId, date }
     */
    lockAttendance: builder.mutation({
      query: (data) => ({
        url: `/students/attendance/lock`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [studentTakeAttendanceType.studentTakeAttendance],
    }),

    /** POST /students/attendance/unlock
     *  Unlocks a previously locked attendance day.
     *  Body: { academicYearId, standardId, divisionId, date }
     */
    unlockAttendance: builder.mutation({
      query: (data) => ({
        url: `/students/attendance/unlock`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [studentTakeAttendanceType.studentTakeAttendance],
    }),
  }),
});

export const {
  useGetAttendanceByFilterQuery,
  useMarkAttendanceMutation,
  useLockAttendanceMutation,
  useUnlockAttendanceMutation,
} = StudentTakeAttendanceApi;
