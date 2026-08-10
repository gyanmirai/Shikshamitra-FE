import { api } from 'src/redux/service';

import { studentAdmissionsCrmType } from 'src/redux/tagTypes';

import {
  AdmissionCrmMessageDeliveryLogDto,
  ApplyAdmissionCrmDeliveryCallbackDto,
} from './communication-exams-events-contracts';

import {
  buildPublicAdmissionCrmDeliveryCallbackRequest,
  buildPublicAdmissionCrmFormRequest,
} from './public-admissions-contracts';

import { AdmissionCrmFormTemplateDto } from './setup-playbooks-contracts';

export const PublicAdmissionsCrmApi = api.injectEndpoints({
  endpoints: (builder) => ({
    applyPublicAdmissionCrmDeliveryCallback: builder.mutation<
      AdmissionCrmMessageDeliveryLogDto,
      {
        tenantId: string;
        deliveryLogId: string;
        body: ApplyAdmissionCrmDeliveryCallbackDto;
      }
    >({
      query: buildPublicAdmissionCrmDeliveryCallbackRequest,
      invalidatesTags: [studentAdmissionsCrmType.communication, studentAdmissionsCrmType.timeline],
    }),
    getPublicAdmissionCrmForm: builder.query<
      AdmissionCrmFormTemplateDto,
      { tenantId: string; templateId: string; language?: 'en' | 'gu' | 'hi' }
    >({
      query: buildPublicAdmissionCrmFormRequest,
      providesTags: [studentAdmissionsCrmType.publicForm],
    }),
  }),
});

export const {
  useApplyPublicAdmissionCrmDeliveryCallbackMutation,
  useGetPublicAdmissionCrmFormQuery,
} = PublicAdmissionsCrmApi;
