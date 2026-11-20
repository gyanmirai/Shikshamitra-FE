import { libraryModuleType, librarySettingsType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import { libraryInventoryMutationTags, libraryReservationMutationTags } from './library-cache-tags';

export type CustodyHandoffInput = {
  academicYearId: string;
  employeeId: string;
  standardId: string | null;
  roomId: string | null;
  purpose: string;
  handedOffOn: string;
  expectedReturnOn: string | null;
  copyIds: string[];
};
export type CustodyReturnCondition = 0 | 4 | 5;
export type CustodyReturnInput = {
  receivedOn: string;
  notes: string | null;
  copies: { copyId: string; condition: CustodyReturnCondition }[];
};
export type CustodyCommand<T> = { details: T; revision: string; idempotencyKey: string };
export type CustodyCopy = {
  copyId: string;
  bookId: string;
  title: string;
  accessionNumber: string;
  status: number;
};
export type CustodyPreview = {
  revision: string | null;
  copies: CustodyCopy[];
  errors: { copyId: string | null; code: string; message: string }[];
};
export type CustodyHandoff = Omit<CustodyHandoffInput, 'copyIds'> & {
  id: string;
  custodian: string;
  className: string | null;
  roomName: string | null;
  actorId: string;
  recordedAt: string;
  copyCount: number;
};
export type CustodyItem = Omit<CustodyCopy, 'status'> & {
  returnReceiptId: string | null;
  returnedCondition: CustodyReturnCondition | null;
  homeSectionId: string;
  homeShelfId: string;
};
export type CustodyReceipt = {
  id: string;
  handoffId: string;
  receivedOn: string;
  notes: string | null;
  actorId: string;
  recordedAt: string;
  copies: CustodyItem[];
};
export type CustodyDetail = {
  handoff: CustodyHandoff;
  pendingCount: number;
  copies: CustodyItem[];
  receipts: CustodyReceipt[];
};
type CustodyListItem = Pick<CustodyDetail, 'handoff' | 'pendingCount'>;
type CustodyPage = { items: CustodyListItem[]; currentPage: number; totalCount: number };
type NamedOption = { id: string; name: string };
type CustodyOptions = {
  years: NamedOption[];
  employees: NamedOption[];
  classes: NamedOption[];
  rooms: NamedOption[];
};
type CustodyReturnArgs<T> = { id: string; body: T };

const route = '/library/custody';
const custodyTags = [libraryModuleType.copies, libraryModuleType.bookIssue] as const;
const updatedStockTags = [
  ...libraryInventoryMutationTags,
  ...libraryReservationMutationTags,
  ...custodyTags,
] as const;
const returnRoute = (id: string) => `${route}/${encodeURIComponent(id)}/returns`;
export const {
  useGetCustodyListQuery,
  useGetCustodyDetailQuery,
  useGetCustodyOptionsQuery,
  useLazyFindCustodyCopiesQuery,
  usePreviewCustodyHandoffMutation,
  useCommitCustodyHandoffMutation,
  usePreviewCustodyReturnMutation,
  useCommitCustodyReturnMutation,
} = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustodyList: builder.query<CustodyPage, { page: number; pageSize: number }>({
      query: (params) => ({ url: route, params }),
      providesTags: custodyTags,
    }),
    getCustodyDetail: builder.query<CustodyDetail, string>({
      query: (id) => `${route}/${encodeURIComponent(id)}`,
      providesTags: custodyTags,
    }),
    getCustodyOptions: builder.query<CustodyOptions, string>({
      query: (academicYearId) => ({ url: `${route}/options`, params: { academicYearId } }),
      providesTags: [librarySettingsType.librarySettings],
    }),
    findCustodyCopies: builder.query<CustodyCopy[], string>({
      query: (search) => ({ url: `${route}/copies`, params: { search } }),
      providesTags: custodyTags,
    }),
    previewCustodyHandoff: builder.mutation<CustodyPreview, CustodyHandoffInput>({
      query: (body) => ({ url: `${route}/preview`, body, method: 'POST' }),
    }),
    commitCustodyHandoff: builder.mutation<CustodyHandoff, CustodyCommand<CustodyHandoffInput>>({
      query: ({ details, ...command }) => ({
        url: route,
        body: { ...command, handoff: details },
        method: 'POST',
      }),
      invalidatesTags: (_result, error) => (error ? [] : updatedStockTags),
    }),
    previewCustodyReturn: builder.mutation<CustodyPreview, CustodyReturnArgs<CustodyReturnInput>>({
      query: ({ id, body }) => ({ url: `${returnRoute(id)}/preview`, body, method: 'POST' }),
    }),
    commitCustodyReturn: builder.mutation<
      CustodyReceipt,
      CustodyReturnArgs<CustodyCommand<CustodyReturnInput>>
    >({
      query: ({ id, body: { details, ...command } }) => ({
        url: returnRoute(id),
        body: { ...command, return: details },
        method: 'POST',
      }),
      invalidatesTags: (_result, error) => (error ? [] : updatedStockTags),
    }),
  }),
});
