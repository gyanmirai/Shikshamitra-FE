import { api } from 'src/redux/service';
import { studentAdmissionsCrmType as tags } from 'src/redux/tagTypes';

import { unwrapOffer, offerStageUrl } from './admission-offer-types';

import type { AdmissionOfferStage, AdmissionOfferCommand, AdmissionOfferStageKey } from './admission-offer-types';

const offerTags = [tags.admissionApplication];
export const admissionOfferApi = api.injectEndpoints({ endpoints: (builder) => ({
  getAdmissionOfferStage: builder.query<AdmissionOfferStage, AdmissionOfferStageKey>({
    query: offerStageUrl, transformResponse: unwrapOffer<AdmissionOfferStage>, providesTags: offerTags,
  }),
  issueAdmissionStageOffer: builder.mutation<AdmissionOfferStage, AdmissionOfferCommand & {
    expiresAt?: string; reason?: string; idempotencyKey: string;
  }>({ query: ({ applicationId, stageId, ...body }) => ({ url: `${offerStageUrl({ applicationId, stageId })}/issue`, method: 'POST', body }),
    transformResponse: unwrapOffer<AdmissionOfferStage>, invalidatesTags: offerTags }),
  respondAdmissionOffer: builder.mutation<AdmissionOfferStage, AdmissionOfferCommand & {
    accepted: boolean; reason?: string; confirmTermsAccepted: boolean;
    confirmConditionsSatisfied: boolean; idempotencyKey: string;
  }>({ query: ({ applicationId, stageId, ...body }) => ({ url: `${offerStageUrl({ applicationId, stageId })}/respond`, method: 'POST', body }),
    transformResponse: unwrapOffer<AdmissionOfferStage>, invalidatesTags: offerTags }),
  extendAdmissionOffer: builder.mutation<AdmissionOfferStage, AdmissionOfferCommand & {
    expiresAt: string; reason?: string; idempotencyKey: string;
  }>({ query: ({ applicationId, stageId, ...body }) => ({ url: `${offerStageUrl({ applicationId, stageId })}/extend`, method: 'POST', body }),
    transformResponse: unwrapOffer<AdmissionOfferStage>, invalidatesTags: offerTags }),
  withdrawAdmissionOffer: builder.mutation<AdmissionOfferStage, AdmissionOfferCommand & {
    reason: string; idempotencyKey: string;
  }>({ query: ({ applicationId, stageId, ...body }) => ({ url: `${offerStageUrl({ applicationId, stageId })}/withdraw`, method: 'POST', body }),
    transformResponse: unwrapOffer<AdmissionOfferStage>, invalidatesTags: offerTags }),
  reissueAdmissionOffer: builder.mutation<AdmissionOfferStage, AdmissionOfferCommand & {
    expiresAt?: string; reason?: string; idempotencyKey: string;
  }>({ query: ({ applicationId, stageId, ...body }) => ({ url: `${offerStageUrl({ applicationId, stageId })}/reissue`, method: 'POST', body }),
    transformResponse: unwrapOffer<AdmissionOfferStage>, invalidatesTags: offerTags }),
}) });
export const { useGetAdmissionOfferStageQuery, useIssueAdmissionStageOfferMutation,
  useRespondAdmissionOfferMutation, useExtendAdmissionOfferMutation,
  useWithdrawAdmissionOfferMutation, useReissueAdmissionOfferMutation } = admissionOfferApi;
