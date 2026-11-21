import type { LibrarySchoolContext } from './circulation-types';
import type { LibraryCopyMoveOptions } from './copy-lifecycle-types';

export type LibraryStockSource = 0 | 1 | 2 | 3;
export type ReceivingLineInput = {
  bookId: string;
  sectionId: string;
  shelfId: string;
  quantity: number;
  unitCost: string | null;
  currency: string | null;
  accessions?: string[] | null;
};
export type ReceivingInput = {
  receivedOn: string;
  source: LibraryStockSource;
  sourceName: string | null;
  reference: string | null;
  lines: ReceivingLineInput[];
};
export type ReceiveCommand = {
  idempotencyKey: string;
  revision: string;
  receipt: ReceivingInput;
};
export type ReceivingPreview = {
  canReceive: boolean;
  revision: string | null;
  errors: { lineIndex: number | null; code: string; message: string }[];
  lines: (Omit<ReceivingLineInput, 'accessions'> & {
    lineIndex: number;
    bookTitle: string;
    sectionName: string;
    shelfName: string;
  })[];
  knownCostCopyCount: number;
  unknownCostCopyCount: number;
  knownTotals: { currency: string; amount: string }[];
};
export type StockReceipt = {
  id: string;
  receivedOn: string;
  source: LibraryStockSource;
  sourceName: string | null;
  reference: string | null;
  recordedBy: string;
  recordedAt: string;
  copyCount: number;
  lines: {
    id: string;
    lineNumber: number;
    bookId: string;
    sectionId: string;
    shelfId: string;
    currentBookTitle?: string | null;
    currentSectionName?: string | null;
    currentShelfName?: string | null;
    unitCost: string | null;
    currency: string | null;
    copies: { copyId: string; accessionNumber: string; copyNumber: number }[];
  }[];
};
export type ReceivingOptions = {
  sections: LibraryCopyMoveOptions['sections'];
  schoolContext?: LibrarySchoolContext;
};
export type ReceivingHistoryParams = {
  page: number;
  pageSize: number;
  receivedFrom?: string;
  receivedTo?: string;
  source?: LibraryStockSource;
  search?: string;
  copyId?: string;
};
export type StockReceiptSummary = Omit<StockReceipt, 'lines'> & { lineCount: number };
export type ReceivingHistoryPage = {
  items: StockReceiptSummary[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
};
