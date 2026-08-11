import { api } from 'src/redux/service';

import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

import { buildPublicAdmissionCrmFormRequest } from './public-admissions-contracts';

import { AdmissionCrmFormTemplateDto } from './setup-playbooks-contracts';

export const PublicAdmissionsCrmApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPublicAdmissionCrmForm: builder.query<
      AdmissionCrmFormTemplateDto,
      { tenantId: string; templateId: string; language?: 'en' | 'gu' | 'hi' }
    >({
      query: buildPublicAdmissionCrmFormRequest,
      providesTags: [studentAdmissionsCrmType.publicForm],
    }),
  }),
});

export const { useGetPublicAdmissionCrmFormQuery } = PublicAdmissionsCrmApi;
