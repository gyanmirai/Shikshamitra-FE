import { api } from 'src/redux/service';
import { organizationType } from 'src/redux/tagTypes';

export type AcademicOrganizationOption = {
  id: string;
  label: string;
  stageName: string;
  mediumId: string;
  mediumName: string;
  boardId: string;
  boardName: string;
  academicYearId: string;
};

type ResultEnvelope<T> = { data?: T };

const unwrapResult = <T>(response: ResultEnvelope<T> | T): T => {
  if (typeof response === 'object' && response !== null && 'data' in response) {
    const envelope = response as ResultEnvelope<T>;
    if (envelope.data !== undefined) return envelope.data;
  }
  return response as T;
};

export const academicOrganizationOptionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAcademicOrganizationOptions: builder.query<
      { items: AcademicOrganizationOption[] },
      { academicYearId: string }
    >({
      query: ({ academicYearId }) => ({
        url: '/app/academic-organization-options',
        params: { academicYearId },
      }),
      transformResponse: (
        response:
          | ResultEnvelope<{ items: AcademicOrganizationOption[] }>
          | {
              items: AcademicOrganizationOption[];
            }
      ) => unwrapResult(response),
      providesTags: [organizationType.academicOrganizationOptions],
    }),
  }),
});

export const { useGetAcademicOrganizationOptionsQuery } = academicOrganizationOptionsApi;
