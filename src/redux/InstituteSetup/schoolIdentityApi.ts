import type {
  IdentityKind,
  BrandingKind,
  IdentityCopy,
  IdentityAsset,
  SchoolBranding,
  IdentityContext,
  IdentityChoices,
  IdentityProfile,
  IdentityRevision,
} from 'src/screens/setting/school-identity/types';

import { api } from 'src/redux/service';
import { instituteSetupType } from 'src/redux/tagTypes';

const base = '/institute-setup/school-identity';
const tag = instituteSetupType.schoolIdentity;
export const schoolIdentityApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSchoolBranding: builder.query<SchoolBranding, { tenantId: string }>({
      query: () => `${base}/branding`,
      providesTags: [tag],
    }),
    getSchoolBrandingImage: builder.query<Blob | null, { kind: BrandingKind; tenantId: string }>({
      query: ({ kind }) => ({
        url: `${base}/branding/${kind}`,
        responseHandler: async (response) => {
          if (!response.ok) {
            return response.headers.get('content-type')?.includes('json')
              ? response.json()
              : response.text();
          }
          return response.status === 204 ? null : response.blob();
        },
      }),
      providesTags: [tag],
      keepUnusedDataFor: 0,
    }),
    previewSchoolIdentity: builder.mutation<Blob, IdentityContext & { choices?: IdentityChoices }>({
      query: (body) => ({
        url: `${base}/preview`,
        method: 'POST',
        body,
        responseHandler: (response) => response.blob(),
      }),
    }),
    getSchoolIdentity: builder.query<IdentityProfile, IdentityContext>({
      query: (params) => ({ url: base, params }),
      providesTags: [tag],
    }),
    updateSchoolIdentity: builder.mutation<
      IdentityProfile,
      IdentityContext & { choices: IdentityChoices; concurrencyStamp: string }
    >({
      query: (body) => ({ url: base, method: 'PUT', body }),
      invalidatesTags: [tag],
    }),
    copySchoolIdentity: builder.mutation<IdentityProfile, IdentityCopy>({
      query: (body) => ({ url: `${base}/copy`, method: 'POST', body }),
      invalidatesTags: [tag],
    }),
    getSchoolIdentityHistory: builder.query<IdentityRevision[], IdentityContext>({
      query: (params) => ({ url: `${base}/history`, params }),
      providesTags: [tag],
    }),
    uploadSchoolIdentityAsset: builder.mutation<
      IdentityAsset,
      IdentityContext & { kind: IdentityKind; file: File }
    >({
      query: ({ kind, file, boardId, mediumId, organizationId }) => {
        const body = new FormData();
        body.append('file', file);
        body.append('kind', String(['logo', 'banner', 'signature'].indexOf(kind)));
        if (boardId) body.append('boardId', boardId);
        if (mediumId) body.append('mediumId', mediumId);
        if (organizationId) body.append('organizationId', organizationId);
        return { url: `${base}/assets`, method: 'POST', body };
      },
    }),
    getSchoolIdentityAsset: builder.query<Blob, IdentityContext & { id: string }>({
      query: ({ id, ...params }) => ({
        url: `${base}/assets/${id}`,
        params,
        responseHandler: (response) => response.blob(),
      }),
      keepUnusedDataFor: 0,
    }),
  }),
});
export const {
  useGetSchoolBrandingQuery,
  useGetSchoolBrandingImageQuery,
  usePreviewSchoolIdentityMutation,
  useGetSchoolIdentityQuery,
  useUpdateSchoolIdentityMutation,
  useCopySchoolIdentityMutation,
  useGetSchoolIdentityHistoryQuery,
  useUploadSchoolIdentityAssetMutation,
  useGetSchoolIdentityAssetQuery,
  useLazyGetSchoolIdentityAssetQuery,
} = schoolIdentityApi;
