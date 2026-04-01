import { api } from 'src/redux/service';
import { studentChangeClassType } from 'src/redux/tagTypes';

export const studentChangeClassApi = api.injectEndpoints({
  endpoints: (builder) => ({
    changeStudentClass: builder.mutation({
      query: (body) => ({
        url: '/app/student/student-standard',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [studentChangeClassType.studentChangeClass],
    }),
  }),
});

export const { useChangeStudentClassMutation } = studentChangeClassApi;
