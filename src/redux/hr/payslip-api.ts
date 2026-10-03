import { api } from 'src/redux/service';
import { employeeType } from 'src/redux/tagTypes';

export type PayslipDocument = {
  id: string;
  salarySlipId: string;
  revision: number;
  issuedAt: string;
  issuedBy: string | null;
  sha256: string;
  isCurrent: boolean;
  replacesDocumentId: string | null;
  replacementReason: string | null;
  recipientEmail: string | null;
  paymentStatus: string;
  paidAt: string | null;
  paymentReference: string | null;
};
export type PayslipDelivery = {
  id: string;
  documentId: string;
  revision: number;
  recipient: string | null;
  status: 'QUEUED' | 'PROCESSING' | 'PROVIDER_ACCEPTED' | 'FAILED' | 'UNCERTAIN' | 'SUPERSEDED';
  errorCategory: string | null;
  automatic: boolean;
  requestedBy: string | null;
  requestedAt: string;
  startedAt: string | null;
  completedAt: string | null;
};
export type PayslipSettings = {
  schoolName: string;
  schoolAddress: string;
  automaticEmail: boolean;
  concurrencyStamp: string | null;
  idempotencyKey: string;
};
export type PayslipCorrectionAttendance = {
  date: string;
  status: 0 | 1 | 2;
  timeIn: string | null;
  timeOut: string | null;
};
export type PayslipCorrection = {
  id: string;
  sourceMonth: string;
  sourceDocumentId: string;
  reason: string;
  status: 'DRAFT' | 'CALCULATED' | 'REVIEWED' | 'APPLIED' | 'CANCELLED';
  concurrencyStamp: string;
  attendance: PayslipCorrectionAttendance[];
  originalEarnings: number;
  originalDeductions: number;
  originalNetPay: number;
  originalEmployerCost: number;
  candidate: null | {
    totalEarnings: number;
    totalDeduction: number;
    netPay: number;
    employerCost: number;
    payableDays: number;
    issueCodes: string[];
    earningComponents: { name: string; amount: number }[];
    deductionComponents: { name: string; amount: number }[];
    employerContributions: { name: string; amount: number }[];
  };
  reviewedBy: string | null;
  reviewedAt: string | null;
  resultDocumentId: string | null;
  settlementMonth: string | null;
};
type CorrectionAction = { id: string; concurrencyStamp: string };
const tags = [employeeType.salarySlip];
export const payslipApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPayslipCorrections: builder.query<PayslipCorrection[], string>({
      query: (documentId) => ({ url: '/payroll/payslip-corrections', params: { documentId } }),
      providesTags: [...tags, employeeType.runPayroll],
    }),
    startPayslipCorrection: builder.mutation<PayslipCorrection, { documentId: string; idempotencyKey: string; reason: string }>({
      query: (body) => ({ url: '/payroll/payslip-corrections', method: 'POST', body }),
      invalidatesTags: tags,
    }),
    calculatePayslipCorrection: builder.mutation<PayslipCorrection, CorrectionAction & { attendance: PayslipCorrectionAttendance[] }>({
      query: ({ id, ...body }) => ({ url: `/payroll/payslip-corrections/${id}/calculate`, method: 'POST', body }),
      invalidatesTags: tags,
    }),
    reviewPayslipCorrection: builder.mutation<PayslipCorrection, CorrectionAction>({
      query: ({ id, ...body }) => ({ url: `/payroll/payslip-corrections/${id}/review`, method: 'POST', body }),
      invalidatesTags: tags,
    }),
    cancelPayslipCorrection: builder.mutation<PayslipCorrection, CorrectionAction>({
      query: ({ id, ...body }) => ({ url: `/payroll/payslip-corrections/${id}/cancel`, method: 'POST', body }),
      invalidatesTags: tags,
    }),
    applyPayslipCorrection: builder.mutation<PayslipCorrection, CorrectionAction>({
      query: ({ id, ...body }) => ({ url: `/payroll/payslip-corrections/${id}/apply`, method: 'POST', body }),
      invalidatesTags: [...tags, employeeType.runPayroll],
    }),
    settlePayslipCorrection: builder.mutation<PayslipCorrection, CorrectionAction & { targetMonth: string; previewRunId: string }>({
      query: ({ id, ...body }) => ({ url: `/payroll/payslip-corrections/${id}/settle`, method: 'POST', body }),
      invalidatesTags: [...tags, employeeType.runPayroll],
    }),
    getPayslipDocuments: builder.query<PayslipDocument[], { employeeId: string; monthYear: string }>({
      query: (params) => ({ url: '/payroll/payslip-documents', params }),
      providesTags: tags,
    }),
    getPayslipDocumentPdf: builder.query<Blob, string>({
      query: (id) => ({ url: `/payroll/payslip-documents/${id}/pdf`, responseHandler: (response) => response.blob() }),
    }),
    getPayslipDeliveries: builder.query<PayslipDelivery[], string>({
      query: (salarySlipId) => ({ url: '/payroll/payslip-deliveries', params: { salarySlipId } }),
      providesTags: tags,
    }),
    sendPayslip: builder.mutation<PayslipDelivery, { documentId: string; idempotencyKey: string }>({
      query: (body) => ({ url: '/payroll/payslip-deliveries', method: 'POST', body }),
      invalidatesTags: tags,
    }),
    getPayslipSettings: builder.query<PayslipSettings, void>({
      query: () => '/payroll/payslip-settings', providesTags: tags,
    }),
    savePayslipSettings: builder.mutation<PayslipSettings, PayslipSettings>({
      query: (body) => ({ url: '/payroll/payslip-settings', method: 'PUT', body }), invalidatesTags: tags,
    }),
    recordPayslipPayment: builder.mutation<void, { documentId: string; idempotencyKey: string; paidAt: string; reference: string }>({
      query: (body) => ({ url: '/payroll/payslip-documents/payment', method: 'POST', body }),
      invalidatesTags: [...tags, employeeType.runPayroll],
    }),
    replacePayslipFacts: builder.mutation<PayslipDocument, { documentId: string; idempotencyKey: string; reason: string }>({
      query: (body) => ({ url: '/payroll/payslip-documents/replace-facts', method: 'POST', body }),
      invalidatesTags: tags,
    }),
  }),
});
export const {
  useGetPayslipCorrectionsQuery, useStartPayslipCorrectionMutation, useCalculatePayslipCorrectionMutation,
  useReviewPayslipCorrectionMutation, useCancelPayslipCorrectionMutation, useApplyPayslipCorrectionMutation,
  useSettlePayslipCorrectionMutation,
  useGetPayslipDocumentsQuery, useLazyGetPayslipDocumentPdfQuery, useGetPayslipDeliveriesQuery,
  useSendPayslipMutation, useGetPayslipSettingsQuery, useSavePayslipSettingsMutation, useRecordPayslipPaymentMutation,
  useReplacePayslipFactsMutation,
} = payslipApi;
