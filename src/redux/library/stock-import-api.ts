import { bookCategoryType, libraryModuleType, librarySettingsType } from 'src/redux/tagTypes';

import { libraryModuleApi } from './libraryModuleApi';
import { libraryInventoryMutationTags, libraryReservationMutationTags } from './library-cache-tags';

import type { ReceivingOptions, LibraryStockSource } from './receiving-types';
import type { CatalogueConfiguration } from './catalogue-configuration-types';

export type StockImportInput = {
  csv: string;
  academicYearId: string;
  sectionId: string;
  shelfId: string;
  categoryId: string | null;
  receivedOn: string;
  source: LibraryStockSource;
  sourceName: string | null;
  columnMap: Record<string, string>;
};

export type StockImportCommand = {
  import: StockImportInput;
  revision: string;
  idempotencyKey: string;
};
export type StockImportRowError = {
  rowNumber: number | null;
  field: string;
  code: string;
  message: string;
};
export type StockImportPreview = {
  revision: string | null;
  newTitleCount: number;
  errors: StockImportRowError[];
  rows: {
    rowNumber: number;
    sourceRowId: string;
    bookId: string | null;
    titleKey: string | null;
    title: string;
    accession: string | null;
    receivedOn: string;
    cataloguePrice: string | null;
    unitCost: string | null;
    currency: string | null;
  }[];
};
export type StockImportOptions = ReceivingOptions & {
  canCreateTitles: boolean;
  categories: { id: string; name: string }[];
  years: { id: string; name: string }[];
  catalogueConfiguration: CatalogueConfiguration | null;
};
export type StockImportSummary = {
  id: string;
  academicYearId: string;
  sectionId: string;
  shelfId: string;
  importedBy: string;
  importedAt: string;
  rowCount: number;
  newTitleCount: number;
  source: LibraryStockSource;
  sourceName: string | null;
};
export type StockImportBatch = {
  id: string;
  batch: StockImportSummary;
  rows: {
    rowNumber: number;
    sourceRowId: string;
    bookId: string;
    title: string;
    isNewTitle: boolean;
    copyId: string;
    receiptId: string;
    accessionNumber: string;
  }[];
};
type StockImportPage = { items: StockImportSummary[]; totalCount: number; currentPage: number };

const importsPath = '/library/receiving/imports';

export const {
  useGetStockImportOptionsQuery,
  useGetStockImportsQuery,
  useGetStockImportBatchQuery,
  usePreviewStockImportMutation,
  useCommitStockImportMutation,
} = libraryModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockImportOptions: builder.query<StockImportOptions, string>({
      query: (academicYearId) => ({ url: `${importsPath}/options`, params: { academicYearId } }),
      providesTags: [librarySettingsType.librarySettings, bookCategoryType.bookCategory],
    }),
    getStockImports: builder.query<StockImportPage, { page: number; pageSize: number }>({
      query: (params) => ({ url: importsPath, params }),
      providesTags: [libraryModuleType.receiving],
    }),
    getStockImportBatch: builder.query<StockImportBatch, string>({
      query: (id) => ({ url: `${importsPath}/${encodeURIComponent(id)}` }),
    }),
    previewStockImport: builder.mutation<StockImportPreview, StockImportInput>({
      query: (body) => ({ url: `${importsPath}/preview`, method: 'POST', body }),
    }),
    commitStockImport: builder.mutation<StockImportBatch, StockImportCommand>({
      query: (body) => ({ url: importsPath, method: 'POST', body }),
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              ...libraryInventoryMutationTags,
              ...libraryReservationMutationTags,
              libraryModuleType.libraryNotificationHistory,
              libraryModuleType.receiving,
            ],
    }),
  }),
});
