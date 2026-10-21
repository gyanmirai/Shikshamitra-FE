import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

export type AdmissionAssessmentClassOption = {
  id: string;
  name: string;
  boardId: string;
  boardName: string;
  mediumId: string;
  mediumName: string;
  academicYearId: string;
  academicYearName: string;
};
export type AdmissionAssessmentSubjectOption = {
  id: string;
  name: string;
  code?: string | null;
  mediumId: string;
  assignedStandardIds: string[];
};
export type AdmissionAssessmentCatalog = {
  classes: AdmissionAssessmentClassOption[];
  subjects: AdmissionAssessmentSubjectOption[];
};

export const admissionAssessmentCatalogApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionAssessmentCatalog: builder.query<AdmissionAssessmentCatalog, void>({
      query: () => '/student/enrollment/admissions/workflows/assessment-catalog',
      transformResponse: (
        response: AdmissionAssessmentCatalog | { data: AdmissionAssessmentCatalog }
      ) => ('data' in response ? response.data : response),
      providesTags: [studentAdmissionsCrmType.admissionWorkflow],
    }),
  }),
});

export const { useGetAdmissionAssessmentCatalogQuery } = admissionAssessmentCatalogApi;
