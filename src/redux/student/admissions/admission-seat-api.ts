import { api } from 'src/redux/service';
import { studentAdmissionsCrmType as tags } from 'src/redux/tagTypes';

import { unwrapSeat, seatStageUrl } from './admission-seat-types';

import type { AdmissionSeatStage, AdmissionSeatCommand, AdmissionSeatStageKey } from './admission-seat-types';

const seatTags = [tags.admissionApplication];
const result = (response: { data?: AdmissionSeatStage } | AdmissionSeatStage) => unwrapSeat(response);
export const admissionSeatApi = api.injectEndpoints({ endpoints: (builder) => ({
  getAdmissionSeatStage: builder.query<AdmissionSeatStage, AdmissionSeatStageKey>({
    query: seatStageUrl, transformResponse: result, providesTags: seatTags,
  }),
  reserveAdmissionSeat: builder.mutation<AdmissionSeatStage, AdmissionSeatCommand & {
    expiresAt?: string; joinWaitlistWhenFull: boolean; overrideCapacity: boolean;
    reason?: string; idempotencyKey: string;
  }>({ query: ({ applicationId, stageId, ...body }) => ({ url: `${seatStageUrl({ applicationId, stageId })}/reserve`, method: 'POST', body }),
    transformResponse: result, invalidatesTags: seatTags }),
  confirmAdmissionSeat: builder.mutation<AdmissionSeatStage, AdmissionSeatCommand & { reason?: string; idempotencyKey: string }>({
    query: ({ applicationId, stageId, ...body }) => ({ url: `${seatStageUrl({ applicationId, stageId })}/confirm`, method: 'POST', body }),
    transformResponse: result, invalidatesTags: seatTags }),
  renewAdmissionSeat: builder.mutation<AdmissionSeatStage, AdmissionSeatCommand & { expiresAt: string; reason?: string; idempotencyKey: string }>({
    query: ({ applicationId, stageId, ...body }) => ({ url: `${seatStageUrl({ applicationId, stageId })}/renew`, method: 'POST', body }),
    transformResponse: result, invalidatesTags: seatTags }),
  releaseAdmissionSeat: builder.mutation<AdmissionSeatStage, AdmissionSeatCommand & { reason?: string; idempotencyKey: string }>({
    query: ({ applicationId, stageId, ...body }) => ({ url: `${seatStageUrl({ applicationId, stageId })}/release`, method: 'POST', body }),
    transformResponse: result, invalidatesTags: seatTags }),
  waitlistAdmissionSeat: builder.mutation<AdmissionSeatStage, AdmissionSeatCommand & { reason?: string; idempotencyKey: string }>({
    query: ({ applicationId, stageId, ...body }) => ({ url: `${seatStageUrl({ applicationId, stageId })}/waitlist`, method: 'POST', body }),
    transformResponse: result, invalidatesTags: seatTags }),
  updateAdmissionSeatCapacity: builder.mutation<AdmissionSeatStage, AdmissionSeatStageKey & {
    capacity: number; allowBelowOccupied: boolean; reason: string; idempotencyKey: string;
    concurrencyStamp: string; poolConcurrencyStamp?: string;
  }>({ query: ({ applicationId, stageId, ...body }) => ({ url: `${seatStageUrl({ applicationId, stageId })}/capacity`, method: 'PUT', body }),
    transformResponse: result, invalidatesTags: seatTags }),
}) });
export const { useGetAdmissionSeatStageQuery, useReserveAdmissionSeatMutation,
  useConfirmAdmissionSeatMutation, useRenewAdmissionSeatMutation,
  useReleaseAdmissionSeatMutation, useWaitlistAdmissionSeatMutation,
  useUpdateAdmissionSeatCapacityMutation } = admissionSeatApi;
