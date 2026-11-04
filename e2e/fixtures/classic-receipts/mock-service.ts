import { tagTypes } from 'src/redux/tagTypes';
import { createApi } from '@reduxjs/toolkit/query/react';

const files: Record<string, string> = { Fee: 'classic-Fee-official.pdf', 'Provisional fee': 'classic-Fee-provisional.pdf',
  Charge: 'classic-Charge-official.pdf', Combined: 'classic-Combined-official.pdf',
  Refund: 'classic-refund-official.pdf', 'Provisional refund': 'classic-refund-provisional.pdf' };

export const api = createApi({ reducerPath: 'api', tagTypes,
  baseQuery: async (request: any): Promise<any> => {
    const url = decodeURIComponent(typeof request === 'string' ? request : request.url);
    const id = Object.keys(files).find((key) => url.includes(`/${key}/`) || url.endsWith(`/${key}`));
    if (!id) return { error: { status: 404, data: 'Unknown receipt' } };
    if (url.endsWith('/pdf')) {
      const response = await fetch(`/documents/${files[id]}`);
      if (!response.ok) return { error: { status: response.status, data: 'Generate backend receipt PDFs first.' } };
      return { data: await response.blob(), meta: { response } };
    }
    return { data: { id, receiptNumber: 'FIN-2026-000001', receiptKind: id === 'Provisional fee' ? 2 : id === 'Charge' ? 4 : 1,
      receiptKindLabel: id === 'Provisional fee' ? 'Provisional Fee Receipt' : 'Fee Receipt', receiptScope: id === 'Charge' ? 2 : id === 'Combined' ? 3 : 1,
      totalPaidAmount: id === 'Combined' ? 15500 : id === 'Charge' ? 500 : 15000, feePaidAmount: 15000, chargePaidAmount: 500,
      academicYearName: '2026 - 2027', studentName: 'Aarav Sharma', grNo: 148, className: 'VII', division: 'B',
      receiptDate: '2026-05-15', pdfFileName: files[id], verificationStatus: id === 'Provisional fee' ? 1 : 0 } };
  }, endpoints: () => ({}) });
