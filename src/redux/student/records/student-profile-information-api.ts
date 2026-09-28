import { api } from 'src/redux/service';
import { studentType, studentRegistrationType } from 'src/redux/tagTypes';

const profileInformationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProfileBasicDetails: builder.query({
      query: ({ studentId }) => ({ url: `/students/records/${studentId}/information/general` }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateProfileBasicDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/${id}/information/general`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration, studentType.student],
    }),
    getProfileFamilyDetails: builder.query({
      query: ({ studentId }) => ({ url: `/students/records/${studentId}/information/family` }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateProfileFamilyDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/${id}/information/family`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration, studentType.student],
    }),
    getProfileStudentCommunicationDetails: builder.query({
      query: ({ studentId }) => ({ url: `/students/records/${studentId}/information/communication` }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateProfileStudentCommunicationDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/${id}/information/communication`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration, studentType.student],
    }),
    getProfileStudentAdditionalDetails: builder.query({
      query: ({ studentId }) => ({ url: `/students/records/${studentId}/information/additional` }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateProfileStudentAdditionalDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/${id}/information/additional`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration, studentType.student],
    }),
    getProfileStudentMedicalDetails: builder.query({
      query: ({ studentId }) => ({ url: `/students/records/${studentId}/information/medical` }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateProfileStudentMedicalDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/${id}/information/medical`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration, studentType.student],
    }),
    getProfilePreviousSchoolDetails: builder.query({
      query: ({ studentId }) => ({ url: `/students/records/${studentId}/information/previous-school` }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateProfilePreviousSchoolDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/${id}/information/previous-school`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration, studentType.student],
    }),
    getProfileParentBankDetails: builder.query({
      query: ({ studentId }) => ({ url: `/students/records/${studentId}/information/bank` }),
      providesTags: [studentRegistrationType.studentRegistration],
    }),
    updateProfileParentBankDetails: builder.mutation({
      query: ({ id, body }) => ({
        url: `/students/records/${id}/information/bank`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentRegistrationType.studentRegistration, studentType.student],
    }),
  }),
});

export const {
  useGetProfileBasicDetailsQuery: useGetBasicDetailsQuery,
  useUpdateProfileBasicDetailsMutation: useUpdateBasicDetailsMutation,
  useGetProfileFamilyDetailsQuery: useGetFamilyDetailsQuery,
  useUpdateProfileFamilyDetailsMutation: useUpdateFamilyDetailsMutation,
  useGetProfileStudentCommunicationDetailsQuery: useGetStudentCommunicationDetailsQuery,
  useUpdateProfileStudentCommunicationDetailsMutation: useUpdateStudentCommunicationDetailsMutation,
  useGetProfileStudentAdditionalDetailsQuery: useGetStudentAdditionalDetailsQuery,
  useUpdateProfileStudentAdditionalDetailsMutation: useUpdateStudentAdditionalDetailsMutation,
  useGetProfileStudentMedicalDetailsQuery: useGetStudentMedicalDetailsQuery,
  useUpdateProfileStudentMedicalDetailsMutation: useUpdateStudentMedicalDetailsMutation,
  useGetProfilePreviousSchoolDetailsQuery: useGetPreviousSchoolDetailsQuery,
  useUpdateProfilePreviousSchoolDetailsMutation: useUpdatePreviousSchoolDetailsMutation,
  useGetProfileParentBankDetailsQuery: useGetParentBankDetailsQuery,
  useUpdateProfileParentBankDetailsMutation: useUpdateParentBankDetailsMutation,
} = profileInformationApi;

