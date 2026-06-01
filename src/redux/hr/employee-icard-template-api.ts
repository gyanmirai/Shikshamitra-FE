import { api } from 'src/redux/service';
import { employeeType } from 'src/redux/tagTypes';

const compactParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );

export const buildEmployeeICardAssetParams = (blobName: string) => ({ blobName });

export const buildEmployeeICardPdfUrl = (templateId: string) =>
  `/employees/i-card/templates/${templateId}/pdf`;

export type EmployeeICardTemplate = {
  id: string;
  academicYearId: string;
  mediumStageId?: string | null;
  name: string;
  width: number;
  height: number;
  backgroundColor?: string | null;
  backgroundImageBlobName?: string | null;
  logoBlobName?: string | null;
  schoolName?: string | null;
  schoolAddress?: string | null;
  themeColor?: string | null;
  orientation?: 'Horizontal' | 'Vertical' | string;
  presetKey?: string | null;
  qrCodeEnabled?: boolean;
  barcodeEnabled?: boolean;
  backSideEnabled?: boolean;
  schemaVersion?: number;
  layoutJson?: string;
  printSettingsJson?: string;
  fieldsJson: string;
  isActive: boolean;
  creationTime?: string;
  lastModificationTime?: string | null;
};

export type EmployeeICardTemplateRequest = Omit<
  EmployeeICardTemplate,
  'id' | 'creationTime' | 'lastModificationTime'
>;

export const employeeICardTemplateApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeeICardTemplates: builder.query({
      query: (params = {}) => ({
        url: '/employees/i-card/templates',
        method: 'GET',
        params: compactParams({ page: 1, pageSize: 20, ...params }),
      }),
      providesTags: [employeeType.employeeICardTemplate],
    }),
    getEmployeeICardTemplateById: builder.query({
      query: (id) => `/employees/i-card/templates/${id}`,
      providesTags: [employeeType.employeeICardTemplate],
    }),
    createEmployeeICardTemplate: builder.mutation({
      query: (body) => ({
        url: '/employees/i-card/templates',
        method: 'POST',
        body,
      }),
      invalidatesTags: [employeeType.employeeICardTemplate],
    }),
    updateEmployeeICardTemplate: builder.mutation({
      query: ({ id, body }) => ({
        url: `/employees/i-card/templates/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [employeeType.employeeICardTemplate],
    }),
    deleteEmployeeICardTemplate: builder.mutation({
      query: (id) => ({
        url: `/employees/i-card/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [employeeType.employeeICardTemplate],
    }),
    uploadEmployeeICardAsset: builder.mutation({
      query: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        return {
          url: '/employees/i-card/templates/assets',
          method: 'POST',
          body: formData,
        };
      },
    }),
    getEmployeeICardAsset: builder.query({
      query: (blobName: string) => ({
        url: '/employees/i-card/templates/assets',
        method: 'GET',
        params: buildEmployeeICardAssetParams(blobName),
        responseHandler: (response) => response.blob(),
      }),
    }),
    downloadEmployeeICardsPdf: builder.mutation({
      query: ({ templateId, body }) => ({
        url: buildEmployeeICardPdfUrl(templateId),
        method: 'POST',
        body,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetEmployeeICardTemplatesQuery,
  useCreateEmployeeICardTemplateMutation,
  useUpdateEmployeeICardTemplateMutation,
  useDeleteEmployeeICardTemplateMutation,
  useUploadEmployeeICardAssetMutation,
  useLazyGetEmployeeICardAssetQuery,
  useDownloadEmployeeICardsPdfMutation,
} = employeeICardTemplateApi;
