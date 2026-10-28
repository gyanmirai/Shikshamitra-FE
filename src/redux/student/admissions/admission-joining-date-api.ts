import type { FeeProrationResult } from 'src/redux/finance/fee-proration-result';

import { api } from 'src/redux/service';
import {
  financeModuleType,
  studentOnboardingType,
  studentAdmissionsCrmType,
} from 'src/redux/tagTypes';

import { unwrapAdmissionFeeSelection } from './admission-fee-selection-types';

import type { AdmissionVariableFeeHead } from './admission-fee-collection-types';

export type AdmissionJoiningDate = {
  joiningDate: string | null;
  concurrencyStamp: string;
  canEdit: boolean;
  canPreview: boolean;
  isLocked: boolean;
  lockReason: string | null;
  academicYearStartDate: string;
  academicYearEndDate: string;
};

export type AdmissionJoiningDatePreview = {
  joiningDate: string;
  totalAmount: number;
  scheduledAmount: number;
  reductionAmount: number;
  proration: FeeProrationResult | null;
  warnings: string[];
};

const joiningDateUrl = (applicationId: string) =>
  `/student/enrollment/admissions/applications/${applicationId}/joining-date`;
const dateTag = (applicationId: string) => ({
  type: studentAdmissionsCrmType.admissionApplication,
  id: applicationId,
});

export const admissionJoiningDateApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionJoiningDate: builder.query<AdmissionJoiningDate, string>({
      query: joiningDateUrl,
      transformResponse: unwrapAdmissionFeeSelection<AdmissionJoiningDate>,
      providesTags: (_, __, id) => [dateTag(id), { type: financeModuleType.feeCollection, id }],
    }),
    previewAdmissionJoiningDate: builder.query<
      AdmissionJoiningDatePreview,
      {
        applicationId: string;
        joiningDate: string;
        variableFeeHeads: AdmissionVariableFeeHead[];
      }
    >({
      query: ({ applicationId, ...body }) => ({
        url: `${joiningDateUrl(applicationId)}/preview`,
        method: 'POST',
        body,
        timeout: 30_000,
      }),
      transformResponse: unwrapAdmissionFeeSelection<AdmissionJoiningDatePreview>,
      // A preview has no side effects. Scope tags retire cached prices after a selection/date change.
      providesTags: (_, __, { applicationId }) => [
        dateTag(applicationId),
        { type: financeModuleType.feeCollection, id: applicationId },
      ],
    }),
    saveAdmissionJoiningDate: builder.mutation<
      AdmissionJoiningDate,
      {
        applicationId: string;
        joiningDate: string;
        concurrencyStamp: string;
      }
    >({
      query: ({ applicationId, ...body }) => ({
        url: joiningDateUrl(applicationId),
        method: 'PUT',
        body,
      }),
      transformResponse: unwrapAdmissionFeeSelection<AdmissionJoiningDate>,
      invalidatesTags: (_, error, { applicationId }) =>
        error
          ? []
          : [
              dateTag(applicationId),
              studentAdmissionsCrmType.admissionApplicant,
              { type: financeModuleType.feeCollection, id: applicationId },
              studentOnboardingType.onboardingCaseDetail,
            ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdmissionJoiningDateQuery,
  usePreviewAdmissionJoiningDateQuery,
  useSaveAdmissionJoiningDateMutation,
} = admissionJoiningDateApi;
