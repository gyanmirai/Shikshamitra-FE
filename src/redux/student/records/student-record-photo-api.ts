import { api } from 'src/redux/service';
import { studentType } from 'src/redux/tagTypes';

export const studentPhotoTag = (studentId: string) => ({ type: studentType.photo, id: studentId });

const studentRecordPhotoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentRecordPhoto: builder.query<Blob, string>({
      query: (studentId) => ({
        url: `/students/records/${encodeURIComponent(studentId)}/photo`,
        cache: 'no-store',
        responseHandler: (response) => {
          if (response.ok) return response.blob();
          return response.headers.get('content-type')?.includes('json')
            ? response.json()
            : response.text();
        },
      }),
      keepUnusedDataFor: 0,
      providesTags: (_result, _error, studentId) => [studentPhotoTag(studentId)],
    }),
  }),
});

export const { useGetStudentRecordPhotoQuery } = studentRecordPhotoApi;
