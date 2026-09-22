import { financeModuleType } from 'src/redux/tagTypes';

import type {
	IChargeDetail,
	IGetChargesParams,
	IChargeListResponse,
	IChargeActionRequest,
	IGetChargeLinesParams,
	ICreateChargeRequest,
	IUpdateChargeRequest,
	IChargeMutationResponse,
	IChargeLineListResponse,
} from './chargeTypes';

import { financeModuleApi } from '../financeModuleApi';

const unwrapDetail = (response: unknown): IChargeDetail => {
  const wrapped = response as { data?: IChargeDetail };
  return wrapped?.data ?? (response as IChargeDetail);
};
const unwrapChargeList = (response: unknown): IChargeListResponse => {
  const result = response as IChargeListResponse;
  return { ...result, items: result?.items ?? [] };
};
const unwrapChargeLineList = (response: unknown): IChargeLineListResponse => {
  const result = response as IChargeLineListResponse;
  return { ...result, items: result?.items ?? [] };
};

export const chargesApi = financeModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getCharges: builder.query<IChargeListResponse, IGetChargesParams>({
      query: (params) => ({
        url: '/charges',
        method: 'GET',
        params,
      }),
      transformResponse: unwrapChargeList,
      providesTags: [financeModuleType.charges],
    }),
    getChargeLines: builder.query<IChargeLineListResponse, IGetChargeLinesParams>({
      query: (params) => ({
        url: '/charges/lines',
        method: 'GET',
        params,
      }),
      transformResponse: unwrapChargeLineList,
      providesTags: [financeModuleType.charges],
    }),
    postCharge: builder.mutation<IChargeMutationResponse, { academicYearId: string; body: ICreateChargeRequest }>({
      query: ({ academicYearId, body }) => ({
        url: '/charges',
        method: 'POST',
        body,
        params: { academicYearId },
      }),
      invalidatesTags: [financeModuleType.charges],
    }),
    updateCharge: builder.mutation<IChargeMutationResponse, { id: string; body: IUpdateChargeRequest }>({
      query: ({ id, body }) => ({
        url: `/charges/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.charges],
    }),
    deleteCharge: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/charges/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.charges],
    }),
    approveCharge: builder.mutation<IChargeMutationResponse, { id: string; body: IChargeActionRequest }>({
      query: ({ id, body }) => ({
        url: `/charges/${id}/approve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        financeModuleType.charges,
        financeModuleType.accountPosting,
        financeModuleType.draftPosting,
      ],
    }),
    rejectCharge: builder.mutation<IChargeMutationResponse, { id: string; body: IChargeActionRequest }>({
      query: ({ id, body }) => ({
        url: `/charges/${id}/reject`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        financeModuleType.charges,
        financeModuleType.accountPosting,
        financeModuleType.draftPosting,
      ],
    }),
    voidCharge: builder.mutation<IChargeMutationResponse, { id: string; body: IChargeActionRequest }>({
      query: ({ id, body }) => ({
        url: `/charges/${id}/void`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
		financeModuleType.charges,
		financeModuleType.accountPosting,
		financeModuleType.draftPosting,
	  ],
	}),
    getChargeById: builder.query<IChargeDetail, { id: string }>({
      query: ({ id }: { id: string }) => ({
        url: `/charges/${id}`,
        method: 'GET',
      }),
      transformResponse: unwrapDetail,
      providesTags: [financeModuleType.charges],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetChargesQuery,
  useGetChargeLinesQuery,
  usePostChargeMutation,
  useUpdateChargeMutation,
  useDeleteChargeMutation,
  useApproveChargeMutation,
  useRejectChargeMutation,
	useVoidChargeMutation,
  useGetChargeByIdQuery,
} = chargesApi;
