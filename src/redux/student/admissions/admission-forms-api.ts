import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

export type AdmissionFormStatus = 0 | 1 | 2;
export type AdmissionFormLayoutType = 0 | 1;
export type AdmissionFormFieldType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type AdmissionFormBindingType = 0 | 1;
export type AdmissionFormField = {
  id: string;
  sectionId?: string;
  code: string;
  label: string;
  fieldType: AdmissionFormFieldType;
  bindingType: AdmissionFormBindingType;
  bindingKey?: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  required: boolean;
  readOnly: boolean;
  displayOrder: number;
  validationJson?: string | null;
  visibilityRuleJson?: string | null;
};
export type AdmissionFormSection = {
  id: string;
  code: string;
  name: string;
  displayOrder: number;
  fields: AdmissionFormField[];
  visibilityRuleJson?: string | null;
};
export type AdmissionForm = {
  id: string;
  name: string;
  code: string;
  version: number;
  status: AdmissionFormStatus;
  layoutType: AdmissionFormLayoutType;
  sections: AdmissionFormSection[];
};
export type CreateUpdateAdmissionForm = Omit<AdmissionForm, 'id' | 'version' | 'status'>;
type Result<T> = { data?: T };
const unwrap = <T>(r: Result<T> | T): T => {
  if (typeof r === 'object' && r !== null && 'data' in r && r.data !== undefined) return r.data;
  return r as T;
};
export const admissionFormsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionForms: builder.query<
      { totalCount: number; items: AdmissionForm[] },
      { search?: string; status?: AdmissionFormStatus; skipCount?: number; maxResultCount?: number }
    >({
      query: (params) => ({ url: '/student/enrollment/admissions/forms', params }),
      transformResponse: (
        r:
          | Result<{ totalCount: number; items: AdmissionForm[] }>
          | { totalCount: number; items: AdmissionForm[] }
      ) => unwrap(r),
      providesTags: [studentAdmissionsCrmType.admissionForm],
    }),
    getAdmissionForm: builder.query<AdmissionForm, string>({
      query: (id) => `/student/enrollment/admissions/forms/${id}`,
      transformResponse: (r: Result<AdmissionForm> | AdmissionForm) => unwrap(r),
      providesTags: [studentAdmissionsCrmType.admissionForm],
    }),
    createAdmissionForm: builder.mutation<AdmissionForm, CreateUpdateAdmissionForm>({
      query: (body) => ({ url: '/student/enrollment/admissions/forms', method: 'POST', body }),
      transformResponse: (r: Result<AdmissionForm> | AdmissionForm) => unwrap(r),
      invalidatesTags: [studentAdmissionsCrmType.admissionForm],
    }),
    updateAdmissionForm: builder.mutation<
      AdmissionForm,
      { id: string; body: CreateUpdateAdmissionForm }
    >({
      query: ({ id, body }) => ({
        url: `/student/enrollment/admissions/forms/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (r: Result<AdmissionForm> | AdmissionForm) => unwrap(r),
      invalidatesTags: [studentAdmissionsCrmType.admissionForm],
    }),
    cloneAdmissionForm: builder.mutation<AdmissionForm, string>({
      query: (id) => ({ url: `/student/enrollment/admissions/forms/${id}/clone`, method: 'POST' }),
      transformResponse: (r: Result<AdmissionForm> | AdmissionForm) => unwrap(r),
      invalidatesTags: [studentAdmissionsCrmType.admissionForm],
    }),
    validateAdmissionForm: builder.mutation<{ isValid: boolean; errors: string[] }, string>({
      query: (id) => ({
        url: `/student/enrollment/admissions/forms/${id}/validate`,
        method: 'POST',
      }),
      transformResponse: (
        r: Result<{ isValid: boolean; errors: string[] }> | { isValid: boolean; errors: string[] }
      ) => unwrap(r),
    }),
    publishAdmissionForm: builder.mutation<AdmissionForm, string>({
      query: (id) => ({
        url: `/student/enrollment/admissions/forms/${id}/publish`,
        method: 'POST',
      }),
      transformResponse: (r: Result<AdmissionForm> | AdmissionForm) => unwrap(r),
      invalidatesTags: [studentAdmissionsCrmType.admissionForm],
    }),
  }),
});
export const {
  useGetAdmissionFormsQuery,
  useGetAdmissionFormQuery,
  useCreateAdmissionFormMutation,
  useUpdateAdmissionFormMutation,
  useCloneAdmissionFormMutation,
  useValidateAdmissionFormMutation,
  usePublishAdmissionFormMutation,
} = admissionFormsApi;
