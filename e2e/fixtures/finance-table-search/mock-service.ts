import type { FetchArgs } from '@reduxjs/toolkit/query/react';

import { tagTypes } from 'src/redux/tagTypes';
import { createApi } from '@reduxjs/toolkit/query/react';

import { applyFixtureColumnFilters } from './table-filters';

export const requests: Array<{ url: string; params: Record<string, unknown> }> = [];
const receipts = Array.from({ length: 70 }, (_, i) => ({
  id: `receipt-${i}`,
  receiptNumber: `R-${String(i + 1).padStart(3, '0')}`,
  studentId: `student-${i}`,
  studentName: i === 34 ? 'Zoya Shah' : 'Aarav Patel',
  grNo: 1000 + i,
  rollNo: String(i + 1),
  receiptKind: i % 2 ? 2 : 1,
  receiptKindLabel: i % 2 ? 'Provisional Receipt (Fee)' : 'Receipt (Fee)',
  receiptScope: 1,
  verificationStatus: i % 2 ? 1 : 0,
  linkedFinalReceiptNumber: null,
  totalPaidAmount: (i + 1) * 100,
  receiptDate: i < 35 ? '2026-10-05' : '2026-12-05',
  creationTime: '2026-10-05T10:00:00Z',
  hasPdf: true,
  paymentMethodLabel: i % 2 ? 'UPI' : 'Cash',
  feeCollectionTransactionId: `transaction-${i}`,
}));
const methodNames = [
  'Cash',
  'Cheque',
  'DemandDraft',
  'BankTransfer',
  'CreditCard',
  'DebitCard',
  'UPI',
  'OnlineGateway',
  'Wallet',
];
const rows = Array.from({ length: 76 }, (_, i) => ({
  id: `entry-${i}`,
  receiptNumber: `P-${String(i + 1).padStart(3, '0')}`,
  studentId: `student-${i}`,
  studentName: i === 75 ? 'Zoya Shah' : 'Aarav Patel',
  grNumber: 2000 + i,
  rollNumber: i + 1,
  board: 'GSEB',
  medium: 'English',
  class: 'Class 3',
  division: 'A',
  amount: (i + 1) * 100,
  status: i % 3,
  verificationStatus: (i % 3) + 1,
  statusLabel: ['Pending', 'Approved', 'Rejected'][i % 3],
  receiptDate: '2026-10-05',
  paymentDate: '2026-10-05',
  provisionalReceiptId: `provisional-${i}`,
  provisionalReceiptNumber: `P-${String(i + 1).padStart(3, '0')}`,
  finalReceiptId: i % 3 === 1 ? `final-${i}` : null,
  finalReceiptNumber: i % 3 === 1 ? `F-${i}` : null,
  instrumentDetails: {
    bankName: 'School Bank',
    chequeNumber: `CHQ-${i}`,
    chequeDate: '2026-10-05',
    ddNumber: `DD-${i}`,
    ddDate: '2026-10-05',
    paymentDate: '2026-10-05',
    upiTransactionId: `UPI-${i}`,
    transactionId: `TX-${i}`,
    transactionReferenceNumber: `UTR-${i}`,
    transferDate: '2026-10-05',
    accountHolderName: 'Aarav Patel',
    cardHolderName: 'Aarav Patel',
    cardLast4: '0123',
  },
}));
const baseQuery = async (args: string | FetchArgs) => {
  const request = typeof args === 'string' ? { url: args } : args;
  const { url } = request;
  const params = request.params ?? {};
  requests.push({ url, params: structuredClone(params) });
  if (request.method && request.method !== 'GET')
    return { error: { status: 405, data: { message: 'This fixture is read only.' } } };
  const term = String(params.search ?? '')
    .trim()
    .toLowerCase();
  if (url.toLowerCase().includes('standard'))
    return {
      data: [{ id: 'class-3', name: 'Class 3', divisions: [{ id: 'division-a', name: 'A' }] }],
    };
  if (url === '/fee-adjustments/applications') {
    const records = [
      {
        id: 'adjustment-pending',
        studentId: 'student-pending',
        studentName: 'Aarav Patel',
        grNumber: '3001',
        rollNo: '1',
        status: 0,
        statusName: 'Pending',
      },
      {
        id: 'adjustment-rejected',
        studentId: 'student-rejected',
        studentName: 'Zoya Shah',
        grNumber: '3002',
        rollNo: '2',
        status: 1,
        statusName: 'Rejected',
      },
    ].map((row) => ({
      ...row,
      standardName: 'Class 3',
      divisionName: 'A',
      requestedAmount: 1000,
      createdAt: '2026-10-05',
      requestedByName: 'QA accountant',
    }));
    return {
      data: {
        items: params.completedOnly
          ? []
          : records.filter(
              (row) => params.status === undefined || row.status === Number(params.status)
            ),
        totalCount: 1,
        pendingCount: 1,
        rejectedCount: 1,
      },
    };
  }
  if (url === '/v1/fee-receipts') {
    const items = applyFixtureColumnFilters(receipts.filter(
      (r) =>
        (!params.month || Number(r.receiptDate.slice(5, 7)) === Number(params.month)) &&
        (!params.receiptKind || r.receiptKind === Number(params.receiptKind)) &&
        (!term || `${r.receiptNumber} ${r.studentName} ${r.grNo}`.toLowerCase().includes(term))
    ), params.filters, true);
    const skip = Number(params.skipCount ?? 0);
    return {
      data: {
        items: items.slice(skip, skip + Number(params.maxResultCount ?? 20)),
        totalCount: items.length,
      },
    };
  }
  if (url === '/v1/finance/reconciliations/tab-counts') {
    const counts: any = { totalPending: 156 };
    ['cheque', 'demandDraft', 'bankTransfer', 'creditCard', 'debitCard', 'upi'].forEach((name) => {
      const available =
        (!params.month || Number(params.month) === 10) &&
        (!params.year || Number(params.year) === 2026);
      counts[`${name}Pending`] = available ? 26 : 0;
      counts[`${name}Approved`] = available ? 25 : 0;
      counts[`${name}Rejected`] = available ? 25 : 0;
      if (!available) counts.totalPending = 0;
    });
    return { data: counts };
  }
  if (url === '/v1/finance/reconciliations') {
    const method = String(params.paymentMethod ?? 'Cheque');
    const methodId = /^\d+$/.test(method) ? Number(method) : methodNames.indexOf(method);
    const scopedRows =
      (!params.month || Number(params.month) === 10) &&
      (!params.year || Number(params.year) === 2026)
        ? rows
        : [];
    const items = applyFixtureColumnFilters(scopedRows
      .filter(
        (r) =>
          (!params.status || r.verificationStatus === Number(params.status)) &&
          (!term ||
            `${r.receiptNumber} ${r.studentName} ${r.grNumber}`.toLowerCase().includes(term))
      )
      .map((r) => ({ ...r, paymentMethod: methodId, paymentMethodLabel: methodNames[methodId] })), params.filters, false);
    const page = Number(params.page ?? 1);
    const pageSize = Number(params.pageSize ?? 50);
    return {
      data: {
        success: true,
        items: items.slice((page - 1) * pageSize, page * pageSize),
        totalCount: items.length,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(items.length / pageSize),
        tabCounts: {},
      },
    };
  }
  return {
    error: { status: 404, data: { message: `No synthetic response configured for ${url}` } },
  };
};
export const api = createApi({ reducerPath: 'api', tagTypes, endpoints: () => ({}), baseQuery });
