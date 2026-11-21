import { libraryModuleType, librarySettingsType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import { libraryInventoryMutationTags, libraryReservationMutationTags } from './library-cache-tags';

import type {
  CustodyCopy,
  CustodyCommand,
  CustodyPreview,
  CustodyReturnInput,
  CustodyReturnCondition,
} from './custody-api';

export type TransferDispatch = {
  sourceSectionId: string;
  destinationSectionId: string;
  destinationShelfId: string;
  dispatchedOn: string;
  reason: string;
  copyIds: string[];
};

type TransferLocation = { campusId: string; campus: string; sectionId: string; section: string };
type TransferShelf = { id: string; name: string };
export type TransferSection = { location: TransferLocation; shelves: TransferShelf[] };
export type TransferHeader = {
  id: string;
  source: TransferLocation;
  destination: TransferLocation;
  destinationShelf: TransferShelf;
  dispatchedOn: string;
  reason: string;
  actorId: string;
  recordedAt: string;
  copyCount: number;
};

export type TransferCopy = Omit<CustodyCopy, 'status'> & {
  sourceShelfId: string;
  receiptId: string | null;
  condition: CustodyReturnCondition | null;
};

type TransferReceipt = {
  id: string;
  transferId: string;
  receivedOn: string;
  notes: string | null;
  actorId: string;
  recordedAt: string;
  copies: TransferCopy[];
};

export type TransferDetail = {
  transfer: TransferHeader;
  pendingCount: number;
  copies: TransferCopy[];
  receipts: TransferReceipt[];
};

type TransferList = {
  items: Pick<TransferDetail, 'transfer' | 'pendingCount'>[];
  currentPage: number;
  totalCount: number;
};

const path = '/library/campus-transfers';
const record = (id: string) => `${path}/${encodeURIComponent(id)}`;
const tags = [
  libraryModuleType.campusTransfers,
  libraryModuleType.bookIssue,
  ...libraryInventoryMutationTags,
  ...libraryReservationMutationTags,
] as const;

export const {
  useGetTransferRegisterQuery,
  useGetTransferDetailQuery,
  useGetTransferLocationsQuery,
  useLazyFindTransferCopiesQuery,
  usePreviewCampusDispatchMutation,
  useRecordCampusDispatchMutation,
  usePreviewCampusReceiptMutation,
  useRecordCampusReceiptMutation,
} = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransferRegister: builder.query<TransferList, { page: number; pageSize: number }>({
      query: (params) => ({ url: path, params }),
      providesTags: [libraryModuleType.campusTransfers],
    }),
    getTransferDetail: builder.query<TransferDetail, string>({
      query: record,
      providesTags: (_result, _error, id) => [{ type: libraryModuleType.campusTransfers, id }],
    }),
    getTransferLocations: builder.query<TransferSection[], void>({
      query: () => `${path}/locations`,
      providesTags: [librarySettingsType.librarySettings],
    }),
    findTransferCopies: builder.query<CustodyCopy[], { sourceSectionId: string; search: string }>({
      query: (params) => ({ url: `${path}/copies`, params }),
      providesTags: [libraryModuleType.copies],
    }),
    previewCampusDispatch: builder.mutation<CustodyPreview, TransferDispatch>({
      query: (body) => ({ url: `${path}/preview`, method: 'POST', body }),
    }),
    recordCampusDispatch: builder.mutation<TransferHeader, CustodyCommand<TransferDispatch>>({
      query: ({ details, ...command }) => ({
        url: path,
        method: 'POST',
        body: { ...command, dispatch: details },
      }),
      invalidatesTags: (_result, error) => (error ? [] : tags),
    }),
    previewCampusReceipt: builder.mutation<
      CustodyPreview,
      { id: string; body: CustodyReturnInput }
    >({
      query: ({ id, body }) => ({ url: `${record(id)}/receipts/preview`, method: 'POST', body }),
    }),
    recordCampusReceipt: builder.mutation<
      TransferReceipt,
      { id: string; body: CustodyCommand<CustodyReturnInput> }
    >({
      query: ({ id, body: { details, ...command } }) => ({
        url: `${record(id)}/receipts`,
        method: 'POST',
        body: { ...command, receipt: details },
      }),
      invalidatesTags: (_result, error) => (error ? [] : tags),
    }),
  }),
});
