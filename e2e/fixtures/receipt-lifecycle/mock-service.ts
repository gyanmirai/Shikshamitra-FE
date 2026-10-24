/** Synthetic UI contract state only. Actual payment rules are tested through ReceiptLifecycleApi_Tests. */
import { createApi } from '@reduxjs/toolkit/query/react';
import type { FetchArgs } from '@reduxjs/toolkit/query/react';
import { tagTypes } from 'src/redux/tagTypes';
import { fixtureBaseQuery, requests, resetFixture as resetCollection, refreshSelectionBalances } from '../fee-collection-late-fees/mock-service';

export { requests, refreshSelectionBalances };
const documents = new Map<string, any>();
const payments = new Map<string, any>();
let sequence = 1;
const methodLabels = ['Cash', 'Cheque', 'Demand Draft', 'Bank Transfer', 'Credit Card', 'Debit Card', 'UPI'];
const date = new Date().toISOString().slice(0, 10);
export function resetFixture() { resetCollection(); documents.clear(); payments.clear(); sequence = 1; }

function documentFor(id: string, transaction: any, scope: number, provisional: boolean, amount: number): any {
  const kind = scope === 2 ? provisional ? 3 : 4 : provisional ? 2 : 1;
  const prefix = scope === 2 ? provisional ? 'KCH' : 'FCH' : provisional ? 'KFE' : 'FIN';
  const receiptNumber = `${prefix}-2026-${String(sequence++).padStart(6, '0')}`;
  const type = provisional ? 'Provisional' : 'Official';
  return {
    id, receiptNumber, receiptKind: kind, receiptScope: scope,
    receiptKindLabel: `${type} Receipt (${scope === 2 ? 'Charge' : scope === 3 ? 'Fees and Charges' : 'Fee'})`,
    verificationStatus: provisional ? 1 : 0, paymentMethodLabel: methodLabels[transaction.method],
    pdfFileName: `${type}-Receipt_${scope === 2 ? 'Charge' : scope === 3 ? 'Fees-And-Charges' : 'Fee'}_${receiptNumber}_${date}.pdf`,
    feeCollectionTransactionId: transaction.id, totalPaidAmount: amount,
    feePaidAmount: scope === 1 ? amount : 0, chargePaidAmount: scope === 2 ? amount : 0,
    studentId: 'diya-10092', studentName: 'Diya Sweta Badgujar', grNo: 10092, rollNo: '2',
    academicYearId: 'year-2026', academicYearName: '2026-2027', boardId: 'gseb', educationMediumId: 'english',
    boardName: 'GSEB', mediumName: 'English', className: 'Class 3', division: 'A',
    receiptDate: date, creationTime: new Date().toISOString(), hasPdf: true,
    linkedFinalReceiptId: null, linkedFinalReceiptNumber: null, linkedProvisionalReceiptId: null,
    linkedProvisionalReceiptNumber: null, remarks: 'Synthetic browser receipt lifecycle test',
  };
}

const query = async (args: string | FetchArgs): Promise<any> => {
  const request = typeof args === 'string' ? { url: args } : args;
  const { url, body, method = 'GET' } = request;
  const params: any = request.params ?? {};
  if (url === '/fee-collections' && method === 'POST') {
    // Reuse the collection fixture's allocation checks and reserve balances.
    // Its older response policy is replaced below for this dedicated lifecycle fixture.
    const delegated = structuredClone(body);
    delegated.paymentConfirmed = undefined;
    delegated.payments = delegated.payments.map((p: any) => ({ ...p, paymentMethod: 0 }));
    const response: any = await fixtureBaseQuery({ ...request, body: delegated });
    const evidence = requests.at(-1);
    if (evidence) evidence.body = structuredClone(body);
    if (response.error) return response;
    const result = response.data;
    if (!payments.has(result.id)) {
      const transaction = { id: result.id, method: body.payments[0].paymentMethod, body, originals: [] as string[] };
      const provisional = transaction.method !== 0;
      const feeAmount = [...(body.dueFeePayments ?? []), ...(body.lateFeePayments ?? [])].reduce((sum, line) => sum + line.amount, 0);
      const chargeAmount = (body.chargePayments ?? []).reduce((sum: number, line: any) => sum + line.amount, 0);
      const combined = result.receiptGrouping === 'Combined' && feeAmount > 0 && chargeAmount > 0;
      for (const [scope, amount] of combined ? [[3, feeAmount + chargeAmount]] : [[1, feeAmount], [2, chargeAmount]]) {
        if (!amount) continue;
        const id = `${result.id}-${scope === 3 ? 1 : scope}`;
        const document = documentFor(id, transaction, scope, provisional, amount);
        document.feePaidAmount = scope === 3 ? feeAmount : document.feePaidAmount;
        document.chargePaidAmount = scope === 3 ? chargeAmount : document.chargePaidAmount;
        documents.set(id, document);
        transaction.originals.push(id);
      }
      payments.set(result.id, transaction);
    }
    const transaction = payments.get(result.id);
    const fee = documents.get(`${result.id}-1`);
    const charge = documents.get(`${result.id}-2`);
    return { data: { ...result, status: transaction.method === 0 ? 1 : 5,
      feeReceiptId: fee?.id, feeReceiptNumber: fee?.receiptNumber, feeReceiptPdfFileName: fee?.pdfFileName,
      chargeReceiptId: charge?.id, chargeReceiptNumber: charge?.receiptNumber, chargeReceiptPdfFileName: charge?.pdfFileName } };
  }
  if (url === '/v1/fee-receipts') {
    let items = [...documents.values()].filter(d => !params.receiptKind || d.receiptKind === Number(params.receiptKind));
    if (params.search) items = items.filter(d => `${d.receiptNumber} ${d.studentName}`.toLowerCase().includes(String(params.search).toLowerCase()));
    return { data: { totalCount: items.length, items: items.reverse().slice(params.skipCount ?? 0, (params.skipCount ?? 0) + (params.maxResultCount ?? 20)) } };
  }
  if (/^\/v1\/(?:fee|charge)-receipts\/[^/]+\/pdf$/.test(url)) {
    const doc = documents.get(url.split('/').at(-2)!);
    if (!doc) return { error: { status: 404, data: { message: 'Synthetic receipt not found' } } };
    const type = doc.receiptKind === 2 || doc.receiptKind === 3 ? 'Provisional' : 'Official';
    const response = await fetch(`/pdf/${type}-Receipt-Example.pdf`);
    if (!response.ok) return { error: { status: 404, data: { message: 'Build the production PDF examples before running the fixture.' } } };
    return { data: await response.blob(), meta: { response: { headers: new Headers({ 'content-disposition': `attachment; filename="${doc.pdfFileName}"` }) } } };
  }
  if (url.startsWith('/v1/fee-receipts/')) return { data: documents.get(url.split('/').at(-1)!) };
  const originals = [...documents.values()].filter(d => !d.linkedProvisionalReceiptId);
  if (url === '/v1/finance/reconciliations/tab-counts') {
    const counts: any = { totalPending: 0, cashOfficial: originals.filter(d => payments.get(d.feeCollectionTransactionId).method === 0).length };
    for (const [index, name] of ['cash', 'cheque', 'demandDraft', 'bankTransfer', 'creditCard', 'debitCard', 'upi'].entries()) {
      const rows = originals.filter(d => payments.get(d.feeCollectionTransactionId).method === index);
      counts[`${name}Pending`] = rows.filter(d => d.verificationStatus === 1).length;
      counts[`${name}Approved`] = rows.filter(d => d.verificationStatus === 2).length;
      counts[`${name}Rejected`] = rows.filter(d => d.verificationStatus === 3).length;
      counts.totalPending += counts[`${name}Pending`];
    }
    return { data: counts };
  }
  if (url === '/v1/finance/reconciliations') {
    const methodId = /^\d+$/.test(String(params.paymentMethod)) ? Number(params.paymentMethod)
      : ['Cash', 'Cheque', 'DemandDraft', 'BankTransfer', 'CreditCard', 'DebitCard', 'UPI'].indexOf(params.paymentMethod);
    const items = originals.filter(d => payments.get(d.feeCollectionTransactionId).method === methodId).map(d => ({
      ...d, receiptScope: d.receiptScope === 2 ? 'Charge' : d.receiptScope === 3 ? 'Combined' : 'Fee', paymentReceiptCount: payments.get(d.feeCollectionTransactionId).originals.length,
      grNumber: d.grNo, rollNumber: 2, board: 'GSEB', medium: 'English', class: 'Class 3',
      paymentMethod: methodId, amount: d.totalPaidAmount, instrumentDetails: { ...payments.get(d.feeCollectionTransactionId).body.payments[0].details, upiTransactionId: payments.get(d.feeCollectionTransactionId).body.payments[0].details?.transactionId },
      status: d.verificationStatus === 3 ? 2 : d.verificationStatus === 1 ? 0 : 1,
      statusLabel: methodId === 0 ? 'Official receipt issued' : d.verificationStatus === 2 ? 'Approved' : d.verificationStatus === 3 ? 'Rejected' : 'Pending',
      provisionalReceiptId: methodId === 0 ? null : d.id, provisionalReceiptNumber: methodId === 0 ? null : d.receiptNumber,
      finalReceiptId: methodId === 0 ? d.id : d.linkedFinalReceiptId, finalReceiptNumber: methodId === 0 ? d.receiptNumber : d.linkedFinalReceiptNumber,
    }));
    return { data: { success: true, items, totalCount: items.length, currentPage: 1, pageSize: 50, totalPages: 1, tabCounts: {} } };
  }
  if (/^\/v1\/finance\/reconciliations\/[^/]+\/(approve|reject)$/.test(url)) {
    const doc = documents.get(url.split('/').at(-2)!);
    if (!doc || doc.verificationStatus !== 1) return { error: { status: 409, data: { message: 'Receipt already processed' } } };
    const transaction = payments.get(doc.feeCollectionTransactionId);
    const reject = url.endsWith('/reject');
    for (const id of transaction.originals) {
      const original = documents.get(id);
      original.verificationStatus = reject ? 3 : 2;
      original.remarks = body.remarks;
      if (!reject) {
        const final = documentFor(`${id}-official`, transaction, original.receiptScope, false, original.totalPaidAmount);
        final.linkedProvisionalReceiptId = original.id; final.linkedProvisionalReceiptNumber = original.receiptNumber;
        original.linkedFinalReceiptId = final.id; original.linkedFinalReceiptNumber = final.receiptNumber;
        documents.set(final.id, final);
      }
    }
    return { data: { success: true, message: reject ? 'Rejected' : 'Approved', data: { receiptId: doc.id,
      verificationStatus: doc.verificationStatus, status: reject ? 2 : 1, finalReceiptNumber: doc.linkedFinalReceiptNumber } } };
  }
  if (url.toLowerCase().includes('class') && method === 'GET') return { data: [{ id: 'class-3', name: 'Class 3', divisions: [{ id: 'division-a', name: 'A' }] }] };
  return fixtureBaseQuery(args);
};

export const api = createApi({ reducerPath: 'api', tagTypes, baseQuery: async (args) => { const result = await query(args); return { ...result, data: structuredClone(result.data) }; }, endpoints: () => ({}) });
