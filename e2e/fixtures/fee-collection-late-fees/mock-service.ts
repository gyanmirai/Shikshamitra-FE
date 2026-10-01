/**
 * Isolated browser contract fixture. This does not simulate or validate backend policy
 * calculation. Fixed, already-assessed charge obligations are supplied to the actual
 * frontend API slice; collection alters only explicitly selected payment allocations.
 * No network requests or real financial writes are made.
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import type { FetchArgs } from '@reduxjs/toolkit/query/react';
import { tagTypes } from 'src/redux/tagTypes';
import type {
  ChargeDetail, CollectFeeInput, CollectFeeOutput, FeeCollectFormDto, FeeLedgerMonth,
} from 'src/redux/feeCollection/feeCollection';

const student = {
  studentId: 'diya-10092', studentName: 'Diya Sweta Badgujar', grNo: '10092', rollNo: '2',
  boardId: 'gseb', boardName: 'GSEB', educationMediumId: 'english', educationMediumName: 'English',
  standardId: 'class-3', standardName: 'Class 3', divisionId: 'division-a', divisionName: 'A',
  contactNo: '0000000000', email: '', feeStructureName: 'Synthetic Class 3 fees',
  isFeeStructureAssigned: true,
};

function initialLedger(): FeeLedgerMonth[] {
  return Array.from({ length: 12 }, (_, index) => {
    const month = (index + 5) % 12;
    const year = month >= 5 ? 2026 : 2027;
    const label = new Date(year, month, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    const tuition = index === 11 ? 2008.8 : 1999.2;
    const items = [{
      dueFeeId: `tuition-${index}`, feeHeadId: 'tuition', feeHeadName: 'Class 3 Tuition Fee',
      installmentLabel: label, dueDate: `${year}-${String(month + 1).padStart(2, '0')}-05`,
      total: tuition, paid: 0, due: tuition, status: new Date(year, month, 5) < new Date(2026, 9, 1) ? 2 : 0, lateFeeAmount: 0,
    }];
    if ([2, 5, 8, 11].includes(index)) {
      const quarter = Math.floor(index / 3) + 1;
      const ranges = ['Jun to Aug', 'Sep to Nov', 'Dec to Feb', 'Mar to May'];
      items.push({
        dueFeeId: `transport-${quarter}`, feeHeadId: 'transport', feeHeadName: 'Class 3 Student Transport Fee',
        installmentLabel: `Quarter ${quarter} — ${ranges[quarter - 1]}`, dueDate: `${year}-${String(month + 1).padStart(2, '0')}-05`,
        total: 2400, paid: 0, due: 2400, status: new Date(year, month, 5) < new Date(2026, 9, 1) ? 2 : 0, lateFeeAmount: 0,
      });
    }
    return { month, year, totalDue: items.reduce((sum, item) => sum + item.due, 0), items };
  });
}

function initialCharges(): ChargeDetail[] {
  return [
    ['tuition-0', 'Class 3 Tuition Fee (Jun 2026)'],
    ['tuition-1', 'Class 3 Tuition Fee (Jul 2026)'],
    ['transport-1', 'Class 3 Student Transport Fee (Quarter 1 — Jun to Aug)'],
    ['tuition-2', 'Class 3 Tuition Fee (Aug 2026)'],
  ].map(([sourceId, name]) => ({
    // Canonical system-generated charge identity is its source DueFee ID.
    chargeId: sourceId, sourceType: 'LateFee', sourceId,
    name: `Late Fee - ${name}`, isSystemGenerated: true,
    amount: 100, paidAmount: 0, pendingAmount: 100, waivedAmount: 0, canWaive: true,
    explanation: 'Synthetic assessed late-fee obligation supplied by the API contract.', status: 0,
  }));
}

let ledger = initialLedger();
let charges = initialCharges();
let receiptSequence = 4;
export const requests: Array<{ url: string; method: string; body?: unknown }> = [];
const replay = new Map<string, CollectFeeOutput>();

export function resetFixture(scenario?: 'statuses') {
  ledger = initialLedger();
  charges = initialCharges();
  if (scenario === 'statuses') {
    const lines = ledger.flatMap((group) => group.items);
    Object.assign(lines[0], { paid: lines[0].total, due: 0, status: 'Paid' });
    Object.assign(lines[1], { paid: 500, due: lines[1].total - 500, status: 'Overdue' });
    Object.assign(lines[6], { paid: 500, due: lines[6].total - 500, status: 'Partial' });
    Object.assign(lines[7], { paid: lines[7].total, due: 0, reconciliationAmount: lines[7].total, status: 'InReconciliation' });
    charges.push({ ...charges[0], chargeId: 'fixture-paid-charge', sourceId: 'fixture-paid-charge', sourceType: 'Charge', name: 'Synthetic paid charge', isSystemGenerated: false, paidAmount: 100, pendingAmount: 0, status: 'Paid' });
    charges.push({ ...charges[0], chargeId: 'fixture-partial-charge', sourceId: 'fixture-partial-charge', sourceType: 'Charge', name: 'Synthetic partial charge', isSystemGenerated: false, paidAmount: 40, pendingAmount: 60, status: 'Partial' });
    charges.push({ ...charges[0], chargeId: 'fixture-reversed-charge', sourceId: 'fixture-reversed-charge', sourceType: 'Charge', name: 'Synthetic reversed charge', isSystemGenerated: false, status: 'Reversed' });
    ledger.forEach((group) => { group.totalDue = group.items.reduce((sum, item) => sum + item.due, 0); });
  }
  receiptSequence = 4;
  requests.length = 0;
  replay.clear();
}

const money = (value: number) => Math.round(value * 100) / 100;
function balances() {
  const items = ledger.flatMap((month) => month.items);
  return {
    totalFees: money(items.reduce((sum, item) => sum + item.total, 0)),
    paidFees: money(items.reduce((sum, item) => sum + item.paid, 0)),
    pendingFees: money(items.reduce((sum, item) => sum + item.due, 0)),
    totalCharges: money(charges.reduce((sum, charge) => sum + charge.amount, 0)),
    pendingCharges: money(charges.reduce((sum, charge) => sum + charge.pendingAmount, 0)),
  };
}

function collect(body: CollectFeeInput): CollectFeeOutput {
  const prior = replay.get(body.idempotencyKey);
  if (prior) return prior;
  // Validate and allocate against isolated copies before committing anything.
  // The actual server accepts principal through Ceiling(OutstandingAmount),
  // preserving whole-rupee payments while clamping outstanding to zero.
  const nextLedger = structuredClone(ledger);
  const nextCharges = structuredClone(charges);
  const items = nextLedger.flatMap((month) => month.items);
  const paidDueFees = body.dueFeePayments.map((payment) => {
    const item = items.find((line) => line.dueFeeId === payment.dueFeeId);
    if (!item || item.feeHeadId !== payment.feeHeadId || !Number.isFinite(payment.amount) || payment.amount <= 0 || payment.amount > Math.ceil(item.due)) {
      throw new Error('Invalid synthetic fee allocation');
    }
    item.paid = money(item.paid + payment.amount);
    item.due = Math.max(0, money(item.due - payment.amount));
    item.status = item.due === 0 ? 1 : 4;
    return { dueFeeId: item.dueFeeId, feeHeadId: item.feeHeadId, amountPaid: payment.amount };
  });
  const paidLateFees = (body.lateFeePayments ?? []).map((payment) => {
    const charge = nextCharges.find((candidate) => candidate.sourceType === 'LateFee' && candidate.sourceId === payment.dueFeeId);
    if (!charge || !Number.isFinite(payment.amount) || payment.amount <= 0 || payment.amount > charge.pendingAmount) throw new Error('Invalid synthetic late-fee allocation');
    charge.paidAmount = money(charge.paidAmount + payment.amount);
    charge.pendingAmount = money(charge.pendingAmount - payment.amount);
    charge.status = charge.pendingAmount === 0 ? 1 : 4;
    charge.canWaive = charge.pendingAmount > 0;
    return { dueFeeId: payment.dueFeeId, feeHeadId: payment.dueFeeId.startsWith('transport') ? 'transport' : 'tuition', amountPaid: payment.amount };
  });
  const paidCharges = (body.chargePayments ?? []).map((payment) => {
    const charge = nextCharges.find((candidate) => candidate.sourceType === 'Charge' && candidate.chargeId === payment.chargeId);
    if (!charge || !Number.isFinite(payment.amount) || payment.amount <= 0 || payment.amount > charge.pendingAmount) throw new Error('Invalid synthetic charge allocation');
    charge.paidAmount = money(charge.paidAmount + payment.amount);
    charge.pendingAmount = money(charge.pendingAmount - payment.amount);
    charge.status = charge.pendingAmount === 0 ? 1 : 4;
    charge.canWaive = charge.pendingAmount > 0;
    return { chargeId: charge.chargeId, chargeName: charge.name, amountPaid: payment.amount };
  });
  const allocationTotal = money([...paidDueFees, ...paidLateFees, ...paidCharges].reduce((sum, item) => sum + item.amountPaid, 0));
  const paymentTotal = money(body.payments.reduce((sum, payment) => sum + payment.amount, 0));
  if (allocationTotal <= 0 || allocationTotal !== paymentTotal) throw new Error('Synthetic payment must reconcile to its allocations');
  nextLedger.forEach((month) => { month.totalDue = money(month.items.reduce((sum, item) => sum + item.due, 0)); });
  const paidFeeHeads = ['tuition', 'transport'].map((feeHeadId) => ({
    feeHeadId,
    feeHeadName: feeHeadId === 'tuition' ? 'Class 3 Tuition Fee' : 'Class 3 Student Transport Fee',
    amountPaid: money(paidDueFees.filter((item) => item.feeHeadId === feeHeadId).reduce((sum, item) => sum + item.amountPaid, 0)),
  })).filter((head) => head.amountPaid > 0);
  const id = `fixture-receipt-${receiptSequence++}`;
  const receiptNumber = `REC-2026-${String(receiptSequence - 1).padStart(6, '0')}`;
  const totalAmount = paymentTotal;
  const result: CollectFeeOutput = {
    id, receiptNumber, feeReceiptId: id, feeReceiptNumber: receiptNumber,
    studentId: student.studentId, studentName: student.studentName, academicYearId: 'year-2026',
    totalAmount, status: 1, collectedBy: 'Synthetic cashier',
    collectedAt: '2026-10-01T12:00:00+05:30', createdAt: '2026-10-01T12:00:00+05:30',
    paidFeeHeads, paidDueFees, paidLateFees, receivedAmount: totalAmount,
    paidCharges: [...paidCharges, ...paidLateFees.map((payment) => ({
      chargeId: payment.dueFeeId,
      chargeName: nextCharges.find((charge) => charge.sourceId === payment.dueFeeId)!.name,
      amountPaid: payment.amountPaid,
    }))],
  };
  if (paidLateFees.length > 0 || paidCharges.length > 0) {
    result.chargeReceiptId = `${id}-charges`;
    result.chargeReceiptNumber = `CHG-${receiptNumber}`;
  }
  if (paidFeeHeads.length === 0) {
    result.feeReceiptId = undefined;
    result.feeReceiptNumber = undefined;
  }
  ledger = nextLedger;
  charges = nextCharges;
  replay.set(body.idempotencyKey, result);
  return result;
}

export const api = createApi({
  reducerPath: 'api', tagTypes,
  baseQuery: async (args: string | FetchArgs) => {
    const request = typeof args === 'string' ? { url: args } : args;
    const { url, method = 'GET', body } = request;
    requests.push({ url, method, body });
    try {
      if (url === '/fee-collections' && method === 'POST') return { data: structuredClone(collect(body)) };
      if (url === '/fee-collections/waivers') {
        const charge = charges.find((item) => item.sourceId === body.sourceId);
        if (!charge || !body.reason?.trim()) throw new Error('Missing charge or waiver reason');
        const waivedAmount = charge.pendingAmount;
        charge.waivedAmount = money(charge.waivedAmount + waivedAmount);
        charge.pendingAmount = 0;
        charge.status = 6;
        charge.canWaive = false;
        return { data: { id: 'fixture-waiver', ...body, studentId: student.studentId, academicYearId: 'year-2026', waivedAmount, remainingAmount: 0, creationTime: '2026-10-01T12:00:00+05:30' } };
      }
      if (url === '/fee-collections') {
        return { data: { totalCount: 1, items: [{
          ...balances(), studentId: student.studentId, studentName: student.studentName,
          grNumber: student.grNo, rollNumber: student.rollNo, standardDivision: 'Class 3 - A',
          overdueFees: ledger.flatMap((group) => group.items).filter((item) => Number(item.status) === 2 || item.status === 'Overdue').reduce((sum, item) => sum + item.due, 0), totalConcessionAmount: 0, status: 2,
        }] } };
      }
      if (url.endsWith('/collect-form')) {
        const balance = balances();
        const form: FeeCollectFormDto = {
          student, summary: { totalFee: balance.totalFees, paidFee: balance.paidFees, pendingFee: balance.pendingFees },
          ledger, charges, allowOnlineCollection: true,
        };
        return { data: structuredClone(form) };
      }
      if (url === '/bank-accounts') return { data: { items: [], totalCount: 0 } };
      if (url.startsWith('/student-fee-structure/student/')) return { data: {
        feeHeads: ['tuition', 'transport'].map((feeHeadId) => ({ feeHeadId, feeHeadName: feeHeadId === 'tuition' ? 'Class 3 Tuition Fee' : 'Class 3 Student Transport Fee', isSelected: true })),
      } };
      if (url === '/fee-structures/academic-year-months') return { data: ledger.map(({ month, year }) => ({ month, year })) };
      if (url.endsWith('/pdf')) return { error: { status: 404, data: { message: 'Synthetic fixture: PDF generation is unavailable; receipt data is displayed.' } } };
      return { error: { status: 404, data: { message: `Unhandled synthetic fixture API: ${method} ${url}` } } };
    } catch (error) {
      return { error: { status: 400, data: { message: error instanceof Error ? error.message : 'Fixture request failed' } } };
    }
  },
  endpoints: () => ({}),
});
