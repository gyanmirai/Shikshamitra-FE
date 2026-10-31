import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';
import { academicReorderTags } from 'src/redux/academic-reorder-tags';

export type AdmissionFormStatus = 0 | 1 | 2;
export type AdmissionFormLayoutType = 0 | 1;
export type AdmissionFormPurpose = 0 | 1;
export type AdmissionFormFieldType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type AdmissionFormBindingType = 0 | 1;
export type AdmissionFormInheritedOrigin = {
  inquiryFormDefinitionId: string;
  sourceFieldCode: string;
  sourceFieldIdentity?: string | null;
  fieldIdentity: string;
  sourceRequired?: boolean;
  sourceReadOnly?: boolean;
  sourceBindingKey?: string | null;
};
export type AdmissionFormInheritanceSource = {
  inquiryFormDefinitionId: string;
  requiredFieldIdentities: string[];
  fieldMappings: { sourceFieldCode: string; registrationFieldCode: string }[];
  layouts: {
    fieldIdentity: string;
    targetSectionCode?: string | null;
    displayOrder?: number | null;
  }[];
};
export type AdmissionFormInheritance = {
  enabled: boolean;
  sources: AdmissionFormInheritanceSource[];
};
export type AdmissionFormTranslation = {
  label?: string | null;
  placeholder?: string | null;
  helpText?: string | null;
  validationMessage?: string | null;
  choices?: Record<string, string>;
};
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
  optionsJson?: string | null;
  required: boolean;
  readOnly: boolean;
  displayOrder: number;
  validationJson?: string | null;
  visibilityRuleJson?: string | null;
  requiredRuleJson?: string | null;
  translations?: Record<string, AdmissionFormTranslation>;
  fieldIdentity?: string | null;
  inheritedFrom?: AdmissionFormInheritedOrigin | null;
};
export type AdmissionFormSection = {
  /** Source-owned columns on an effective inherited section; absent on ordinary drafts. */
  fieldsPerRow?: 1 | 2 | 3 | 4 | null;
  id: string;
  code: string;
  name: string;
  displayOrder: number;
  stepId?: string | null;
  stepCode?: string | null;
  stepName?: string | null;
  stepDisplayOrder?: number | null;
  stepVisibilityRuleJson?: string | null;
  fields: AdmissionFormField[];
  visibilityRuleJson?: string | null;
  requiredRuleJson?: string | null;
  isRepeatable?: boolean;
  minEntries?: number;
  maxEntries?: number;
  entryLabel?: string | null;
  translations?: Record<string, AdmissionFormTranslation>;
};
export type AdmissionForm = {
  id: string;
  name: string;
  code: string;
  version: number;
  status: AdmissionFormStatus;
  layoutType: AdmissionFormLayoutType;
  purpose?: AdmissionFormPurpose;
  fieldsPerRow?: 1 | 2 | 3 | 4;
  defaultLanguage?: string;
  supportedLanguages?: string[];
  sectionCount: number;
  sections: AdmissionFormSection[];
  description?: string | null;
  parentVersionId?: string | null;
  publishedAt?: string | null;
  publishedBy?: string | null;
  concurrencyStamp?: string;
  inheritance?: AdmissionFormInheritance | null;
};
export type CreateUpdateAdmissionForm = {
  name: string;
  code: string;
  description?: string | null;
  layoutType: AdmissionFormLayoutType;
  purpose?: AdmissionFormPurpose;
  fieldsPerRow: 1 | 2 | 3 | 4;
  defaultLanguage: string;
  supportedLanguages: string[];
  concurrencyStamp?: string | null;
  sections: AdmissionFormSection[];
  inheritance?: AdmissionFormInheritance | null;
};
export type AdmissionFormInheritancePreview = {
  definition: AdmissionForm;
  inquiryFormDefinitionId?: string | null;
  inquiryContextSections: AdmissionFormSection[];
  issues: { code: string; message: string; fieldIdentity?: string | null }[];
  isValid: boolean;
};
export type AdmissionFormConnectedSource = {
  inquiryFormDefinitionId: string;
  name: string;
  version: number;
  connections: { offeringId: string; offeringName: string }[];
  isApproved: boolean;
};
export type AdmissionFormFieldMetadata = {
  fieldType: AdmissionFormFieldType;
  displayName: string;
  description: string;
  supportsOptions: boolean;
  supportsBinding: boolean;
  supportsVisibilityRule: boolean;
  isRuntimeReady: boolean;
};
export type AdmissionFormSystemFieldMetadata = {
  key: string;
  displayName: string;
  description: string;
  fieldType: AdmissionFormFieldType;
  optionsJson?: string | null;
  readOnly: boolean;
  validationJson?: string | null;
  destination?: 'studentProfile' | 'capturedAdmissionDetails';
};
export type AdmissionFormDataSourceMetadata = {
  key: string;
  displayName: string;
  description: string;
  supportsParent: boolean;
};
export type AdmissionFormOption = {
  value: string;
  label: string;
  displayOrder: number;
  isActive: boolean;
  boardId?: string | null;
  boardLabel?: string | null;
};
export type AdmissionFormOptionsQuery = {
  sourceKey: string;
  parentId?: string;
  academicYearId?: string;
  // Client-only identity for a fresh dependent-field check; never sent to the API.
  optionsCheckId?: string;
  searchTerm?: string;
  skipCount?: number;
  maxResultCount?: number;
  selectedIds?: string[];
};
export type AdmissionFormAuditEntry = {
  id: string;
  action: string;
  actorId?: string | null;
  occurredAt: string;
  comment?: string | null;
  version: number;
};
export type AdmissionFormVersionSummary = {
  id: string;
  version: number;
  status: AdmissionFormStatus;
  creationTime: string;
  publishedAt?: string | null;
  parentVersionId?: string | null;
};
export type AdmissionFormVersionComparison = {
  fromId: string;
  toId: string;
  changes: string[];
};
type Result<T> = { data?: T };
const unwrap = <T>(r: Result<T> | T): T => {
  if (typeof r === 'object' && r !== null && 'data' in r && r.data !== undefined) return r.data;
  return r as T;
};
export const admissionFormsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionFormInheritanceSources: builder.query<
      { totalCount: number; items: AdmissionFormConnectedSource[] },
      string | { id: string; skipCount?: number; maxResultCount?: number }
    >({
      query: (input) => {
        const { id, ...params } = typeof input === 'string' ? { id: input } : input;
        return { url: `/student/enrollment/admissions/forms/${id}/inheritance/sources`, params };
      },
      transformResponse: (
        r:
          | Result<{ totalCount: number; items: AdmissionFormConnectedSource[] }>
          | { totalCount: number; items: AdmissionFormConnectedSource[] }
      ) => unwrap(r),
      providesTags: [studentAdmissionsCrmType.admissionForm],
    }),
    previewAdmissionFormInheritance: builder.mutation<
      AdmissionFormInheritancePreview,
      {
        inquiryFormDefinitionId: string;
        registrationFormDefinitionId?: string;
        draft?: CreateUpdateAdmissionForm;
      }
    >({
      query: (body) => ({
        url: '/student/enrollment/admissions/forms/inheritance/preview',
        method: 'POST',
        body,
      }),
      transformResponse: (
        r: Result<AdmissionFormInheritancePreview> | AdmissionFormInheritancePreview
      ) => unwrap(r),
    }),
    getAdmissionForms: builder.query<
      { totalCount: number; items: AdmissionForm[] },
      {
        search?: string;
        status?: AdmissionFormStatus;
        purpose?: AdmissionFormPurpose;
        version?: number;
        columnFilters?: string;
        skipCount?: number;
        maxResultCount?: number;
      }
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
    cloneAdmissionForm: builder.mutation<
      AdmissionForm,
      { id: string; body: { name: string; code: string; description?: string | null } }
    >({
      query: ({ id, body }) => ({
        url: `/student/enrollment/admissions/forms/${id}/clone`,
        method: 'POST',
        body,
      }),
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
    publishAdmissionForm: builder.mutation<AdmissionForm, { id: string; concurrencyStamp: string }>(
      {
        query: ({ id, concurrencyStamp }) => ({
          url: `/student/enrollment/admissions/forms/${id}/publish`,
          method: 'POST',
          params: { concurrencyStamp },
        }),
        transformResponse: (r: Result<AdmissionForm> | AdmissionForm) => unwrap(r),
        invalidatesTags: [studentAdmissionsCrmType.admissionForm],
      }
    ),
    getAdmissionFormAudit: builder.query<AdmissionFormAuditEntry[], string>({
      query: (id) => `/student/enrollment/admissions/forms/${id}/audit`,
      transformResponse: (r: Result<AdmissionFormAuditEntry[]> | AdmissionFormAuditEntry[]) =>
        unwrap(r),
    }),
    getAdmissionFormVersions: builder.query<AdmissionFormVersionSummary[], string>({
      query: (id) => `/student/enrollment/admissions/forms/${id}/versions`,
      transformResponse: (
        r: Result<AdmissionFormVersionSummary[]> | AdmissionFormVersionSummary[]
      ) => unwrap(r),
    }),
    compareAdmissionFormVersions: builder.query<
      AdmissionFormVersionComparison,
      { id: string; otherId: string }
    >({
      query: ({ id, otherId }) => `/student/enrollment/admissions/forms/${id}/compare/${otherId}`,
      transformResponse: (
        r: Result<AdmissionFormVersionComparison> | AdmissionFormVersionComparison
      ) => unwrap(r),
    }),
    createAdmissionFormVersion: builder.mutation<AdmissionForm, string>({
      query: (id) => ({
        url: `/student/enrollment/admissions/forms/${id}/versions`,
        method: 'POST',
      }),
      transformResponse: (r: Result<AdmissionForm> | AdmissionForm) => unwrap(r),
      invalidatesTags: [studentAdmissionsCrmType.admissionForm],
    }),
    archiveAdmissionForm: builder.mutation<AdmissionForm, { id: string; concurrencyStamp: string }>(
      {
        query: ({ id, concurrencyStamp }) => ({
          url: `/student/enrollment/admissions/forms/${id}/archive`,
          method: 'POST',
          params: { concurrencyStamp },
        }),
        transformResponse: (r: Result<AdmissionForm> | AdmissionForm) => unwrap(r),
        invalidatesTags: [studentAdmissionsCrmType.admissionForm],
      }
    ),
    deleteAdmissionForm: builder.mutation<void, { id: string; concurrencyStamp: string }>({
      query: ({ id, concurrencyStamp }) => ({
        url: `/student/enrollment/admissions/forms/${id}`,
        method: 'DELETE',
        params: { concurrencyStamp },
      }),
      invalidatesTags: [studentAdmissionsCrmType.admissionForm],
    }),
    getAdmissionFormUsage: builder.query<
      {
        formDefinitionId: string;
        offeringCount: number;
        applicationCount: number;
        canDelete: boolean;
      },
      string
    >({
      query: (id) => `/student/enrollment/admissions/forms/${id}/usage`,
      transformResponse: (
        r:
          | Result<{
              formDefinitionId: string;
              offeringCount: number;
              applicationCount: number;
              canDelete: boolean;
            }>
          | {
              formDefinitionId: string;
              offeringCount: number;
              applicationCount: number;
              canDelete: boolean;
            }
      ) => unwrap(r),
    }),
    getAdmissionFormFieldTypes: builder.query<AdmissionFormFieldMetadata[], void>({
      query: () => '/student/enrollment/admissions/forms/metadata/field-types',
      transformResponse: (r: Result<AdmissionFormFieldMetadata[]> | AdmissionFormFieldMetadata[]) =>
        unwrap(r),
    }),
    getAdmissionFormSystemFields: builder.query<AdmissionFormSystemFieldMetadata[], void>({
      query: () => '/student/enrollment/admissions/forms/metadata/system-fields',
      transformResponse: (
        r: Result<AdmissionFormSystemFieldMetadata[]> | AdmissionFormSystemFieldMetadata[]
      ) => unwrap(r),
    }),
    getAdmissionFormDataSources: builder.query<AdmissionFormDataSourceMetadata[], void>({
      query: () => '/student/enrollment/admissions/forms/metadata/data-sources',
      transformResponse: (
        r: Result<AdmissionFormDataSourceMetadata[]> | AdmissionFormDataSourceMetadata[]
      ) => unwrap(r),
    }),
    getAdmissionFormOptions: builder.query<AdmissionFormOption[], AdmissionFormOptionsQuery>({
      providesTags: academicReorderTags,
      query: ({
        sourceKey,
        parentId,
        academicYearId,
        searchTerm,
        skipCount,
        maxResultCount,
        selectedIds,
      }) => {
        const url = '/student/enrollment/admissions/forms/metadata/options';
        if (sourceKey !== 'StudentSiblings') {
          return { url, params: { sourceKey, parentId, academicYearId } };
        }
        const params = {
          sourceKey,
          parentId,
          academicYearId,
          searchTerm,
          skipCount,
          maxResultCount,
        };
        if (!selectedIds?.length) return { url, params };
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) queryParams.set(key, String(value));
        });
        selectedIds.forEach((id) => queryParams.append('selectedIds', id));
        return { url, params: queryParams };
      },
      transformResponse: (r: Result<AdmissionFormOption[]> | AdmissionFormOption[]) => unwrap(r),
    }),
  }),
});
export const {
  useGetAdmissionFormInheritanceSourcesQuery,
  usePreviewAdmissionFormInheritanceMutation,
  useGetAdmissionFormsQuery,
  useLazyGetAdmissionFormsQuery,
  useGetAdmissionFormQuery,
  useLazyGetAdmissionFormQuery,
  useCreateAdmissionFormMutation,
  useUpdateAdmissionFormMutation,
  useCloneAdmissionFormMutation,
  useCreateAdmissionFormVersionMutation,
  useArchiveAdmissionFormMutation,
  useDeleteAdmissionFormMutation,
  useGetAdmissionFormUsageQuery,
  useGetAdmissionFormFieldTypesQuery,
  useGetAdmissionFormSystemFieldsQuery,
  useGetAdmissionFormDataSourcesQuery,
  useGetAdmissionFormOptionsQuery,
  useLazyGetAdmissionFormOptionsQuery,
  useValidateAdmissionFormMutation,
  usePublishAdmissionFormMutation,
  useGetAdmissionFormAuditQuery,
  useGetAdmissionFormVersionsQuery,
  useLazyCompareAdmissionFormVersionsQuery,
} = admissionFormsApi;
