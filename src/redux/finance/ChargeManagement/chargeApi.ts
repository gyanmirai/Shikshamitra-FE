import { financeModuleType } from 'src/redux/tagTypes';

import { financeModuleApi } from '../financeModuleApi';
import { buildEligibleChargeStudentsUrl } from './eligibleChargeStudentsUrl';

import type {
  IChargeDetail,
  IGetChargesParams,
  IChargeListResponse,
  IChargeActionRequest,
  ICreateChargeRequest,
  IUpdateChargeRequest,
  IGetChargeLinesParams,
  IChargeMutationResponse,
  IChargeLineListResponse,
} from './chargeTypes';

export interface IEligibleChargeStudentsParams {
  academicYearId: string;
  boardId: string;
  educationMediumId: string;
  classIds: string[];
  divisionIds?: string[];
  chargeCategoryId?: string;
  search?: string;
  gender?: number;
  rollNoFrom?: number;
  rollNoTo?: number;
  charged?: boolean;
  divisionFilterId?: string;
  page: number;
  pageSize: number;
}

export interface IEligibleChargeStudentsResponse {
  items: Array<{
    studentId: string;
    studentName: string;
    rollNo?: number;
    grNo?: string | number;
    standardName?: string;
    divisionName?: string;
    standardId?: string;
    divisionId?: string;
    gender?: number;
    hasFeeStructureAssignment: boolean;
    hasChargeInCategory?: boolean;
  }>;
  candidateStudentIds: string[];
  matchingStudentIds: string[];
  matchingStudentNames: Record<string, string>;
  totalCount: number;
  page: number;
  pageSize: number;
}

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
    getEligibleChargeStudents: builder.query<
      IEligibleChargeStudentsResponse,
      IEligibleChargeStudentsParams
    >({
      query: (params) => ({ url: buildEligibleChargeStudentsUrl(params), method: 'GET' }),
    }),
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
    postCharge: builder.mutation<
      IChargeMutationResponse,
      { academicYearId: string; body: ICreateChargeRequest }
    >({
      query: ({ academicYearId, body }) => ({
        url: '/charges',
        method: 'POST',
        body,
        params: { academicYearId },
      }),
      invalidatesTags: [financeModuleType.studentFeeAssignment, financeModuleType.charges],
    }),
    updateCharge: builder.mutation<
      IChargeMutationResponse,
      { id: string; body: IUpdateChargeRequest }
    >({
      query: ({ id, body }) => ({
        url: `/charges/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [financeModuleType.studentFeeAssignment, financeModuleType.charges],
    }),
    deleteCharge: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/charges/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [financeModuleType.studentFeeAssignment, financeModuleType.charges],
    }),
    approveCharge: builder.mutation<
      IChargeMutationResponse,
      { id: string; body: IChargeActionRequest }
    >({
      query: ({ id, body }) => ({
        url: `/charges/${id}/approve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        financeModuleType.studentFeeAssignment,
        financeModuleType.charges,
        financeModuleType.feeDetails,
        financeModuleType.feeCollection,
        financeModuleType.accountPosting,
        financeModuleType.draftPosting,
      ],
    }),
    rejectCharge: builder.mutation<
      IChargeMutationResponse,
      { id: string; body: IChargeActionRequest }
    >({
      query: ({ id, body }) => ({
        url: `/charges/${id}/reject`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        financeModuleType.studentFeeAssignment,
        financeModuleType.charges,
        financeModuleType.feeDetails,
        financeModuleType.feeCollection,
        financeModuleType.accountPosting,
        financeModuleType.draftPosting,
      ],
    }),
    voidCharge: builder.mutation<
      IChargeMutationResponse,
      { id: string; body: IChargeActionRequest }
    >({
      query: ({ id, body }) => ({
        url: `/charges/${id}/void`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        financeModuleType.studentFeeAssignment,
        financeModuleType.charges,
        financeModuleType.feeDetails,
        financeModuleType.feeCollection,
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
  useLazyGetEligibleChargeStudentsQuery,
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
