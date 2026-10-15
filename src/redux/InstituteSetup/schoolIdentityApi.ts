import type {
  IdentityKind,
  IdentityCopy,
  IdentityAsset,
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
    getSchoolBranding: builder.query<IdentityProfile, void>({
      query: () => `${base}/branding`,
      providesTags: [tag],
    }),
    getSchoolBrandingImage: builder.query<Blob, number>({
      query: (kind) => ({
        url: `${base}/branding/${kind}`,
        responseHandler: (response) => response.blob(),
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
      query: ({ kind, file, boardId, mediumId }) => {
        const body = new FormData();
        body.append('file', file);
        body.append('kind', String(['logo', 'banner', 'signature'].indexOf(kind)));
        if (boardId) body.append('boardId', boardId);
        if (mediumId) body.append('mediumId', mediumId);
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
} = schoolIdentityApi;
