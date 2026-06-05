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
      providesTags: [organizationType.academicOrganizationOptions],
    }),
  }),
});

export const { useGetAcademicOrganizationOptionsQuery } = academicOrganizationOptionsApi;
