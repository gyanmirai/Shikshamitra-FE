import { libraryModuleType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import {
  libraryCirculationMutationTags,
  libraryReservationMutationTags,
} from './library-cache-tags';

import type { ReservationPickup } from './reservation-types';

export type PortalStudent = { studentId: string; name: string };
export type PortalReceipt = {
  id: string;
  number: string;
  receivedOn: string;
  kind: string;
  verificationStatus: string;
};
export type PortalBook = {
  id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  availableCopies: number;
};
export type PortalLoan = {
  id: string;
  title: string | null;
  accession: string;
  issuedOn: string | null;
  dueOn: string | null;
  returnedOn: string | null;
  isOpen: boolean;
  renewals: number;
  canPreviewRenewal: boolean;
};
export type PortalReservation = {
  id: string;
  title: string | null;
  state: number;
  requestedOn: string | null;
  pickupBefore: string | null;
  pickupLocation: string | null;
  revision: string;
  canCancel: boolean;
};
export type PortalPage<T> = {
  items: T[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
};
type PortalList = { studentId: string; page: number; pageSize: number };
type PortalReserve = {
  studentId: string;
  body: { bookId: string; pickupSectionId: string | null };
};
type ReservePreview = { canRequest: boolean; reasons: string[] };
type PortalLoanKey = { studentId: string; loanId: string };
export type PortalRenewPreview = {
  canRenew: boolean;
  dueOn: string | null;
  schoolDate: string | null;
  revision: string | null;
  reasons: string[];
};
export type PortalRenewCommand = { schoolDate: string; revision: string; idempotencyKey: string };

const path = (studentId: string) => `/mobile/v1/students/${encodeURIComponent(studentId)}/library`;
const loanPath = ({ studentId, loanId }: PortalLoanKey) =>
  `${path(studentId)}/loans/${encodeURIComponent(loanId)}`;
const booksTag = libraryModuleType.books;
const reserveTag = libraryModuleType.bookReservation;
const loansTag = libraryModuleType.bookIssue;

export const {
  usePortalLibraryStudentsQuery,
  usePortalLibraryReceiptYearsQuery,
  usePortalLibraryReceiptsQuery,
  useDownloadPortalLibraryReceiptMutation,
  usePortalLibrarySearchQuery,
  usePortalLibraryLoansQuery,
  usePortalLibraryReservationsQuery,
  usePortalLibraryPickupQuery,
  usePreviewPortalReservationMutation,
  useSavePortalReservationMutation,
  useCancelPortalReservationMutation,
  useLazyPortalLibraryRenewPreviewQuery,
  useRenewPortalLoanMutation,
} = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    portalLibraryStudents: builder.query<PortalStudent[], void>({
      query: () => '/mobile/v1/library/students',
      keepUnusedDataFor: 0,
    }),
    portalLibraryReceiptYears: builder.query<{ id: string; name: string }[], string>({
      query: (studentId) => `${path(studentId)}/receipt-years`,
      keepUnusedDataFor: 0,
    }),
    portalLibraryReceipts: builder.query<
      PortalPage<PortalReceipt>,
      PortalList & { academicYearId: string }
    >({
      query: ({ studentId, ...params }) => ({ url: `${path(studentId)}/receipts`, params }),
      keepUnusedDataFor: 0,
    }),
    downloadPortalLibraryReceipt: builder.mutation<
      Blob,
      { studentId: string; academicYearId: string; receiptId: string }
    >({
      query: ({ studentId, academicYearId, receiptId }) => ({
        url: `/mobile/v1/finance/students/${encodeURIComponent(studentId)}/receipts/${encodeURIComponent(receiptId)}/pdf`,
        params: { academicYearId },
        responseHandler: (response) => (response.ok ? response.blob() : response.json()),
      }),
    }),
    portalLibrarySearch: builder.query<PortalPage<PortalBook>, PortalList & { search?: string }>({
      query: ({ studentId, ...params }) => ({ url: `${path(studentId)}/catalogue`, params }),
      providesTags: [booksTag],
    }),
    portalLibraryLoans: builder.query<PortalPage<PortalLoan>, PortalList>({
      query: ({ studentId, ...params }) => ({ url: `${path(studentId)}/loans`, params }),
      providesTags: [loansTag],
      keepUnusedDataFor: 0,
    }),
    portalLibraryReservations: builder.query<PortalPage<PortalReservation>, PortalList>({
      query: ({ studentId, ...params }) => ({ url: `${path(studentId)}/reservations`, params }),
      providesTags: [reserveTag],
      keepUnusedDataFor: 0,
    }),
    portalLibraryPickup: builder.query<ReservationPickup[], string>({
      query: (studentId) => `${path(studentId)}/pickup-locations`,
      providesTags: [libraryModuleType.librarySettings],
    }),
    previewPortalReservation: builder.mutation<ReservePreview, PortalReserve>({
      query: ({ studentId, body }) => ({
        url: `${path(studentId)}/reservations/preview`,
        method: 'POST',
        body,
      }),
    }),
    savePortalReservation: builder.mutation<PortalReservation, PortalReserve>({
      query: ({ studentId, body }) => ({
        url: `${path(studentId)}/reservations`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_data, error) => (error ? [] : libraryReservationMutationTags),
    }),
    cancelPortalReservation: builder.mutation<
      PortalReservation,
      { studentId: string; id: string; revision: string }
    >({
      query: ({ studentId, id, revision }) => ({
        url: `${path(studentId)}/reservations/${encodeURIComponent(id)}/cancel`,
        method: 'POST',
        body: { revision },
      }),
      invalidatesTags: (_data, error) => (error ? [] : libraryReservationMutationTags),
    }),
    portalLibraryRenewPreview: builder.query<PortalRenewPreview, PortalLoanKey>({
      query: (owner) => `${loanPath(owner)}/renewal-preview`,
      keepUnusedDataFor: 0,
    }),
    renewPortalLoan: builder.mutation<PortalLoan, PortalLoanKey & { body: PortalRenewCommand }>({
      query: ({ body, ...owner }) => ({ url: `${loanPath(owner)}/renew`, method: 'POST', body }),
      invalidatesTags: (_data, error) => (error ? [] : libraryCirculationMutationTags),
    }),
  }),
});
