import { createApi } from '@reduxjs/toolkit/query/react';
import { financeModuleType, studentAdmissionType, classType } from 'src/redux/tagTypes';
import type { AssignmentRequest, AssignmentPreview, AssignmentCommit, AssignmentCandidate } from 'src/redux/finance/studentFeeAssignment';

export const candidate: AssignmentCandidate = {
  id: 'structure', name: 'Class 5 fees 2026–27', revisionNumber: 2, academicYearId: 'year', standardId: 'class', total: 16000,
  heads: [
    { feeHeadId: 'tuition', feeHeadName: 'Tuition', isOptional: false, isOneTime: false, included: true, configuredAmount: 12000, effectiveAmount: 12000, amountBasis: 'AnnualTotal', obligation: 12000, verification: 'Configured academic year' },
    { feeHeadId: 'transport', feeHeadName: 'Transport', isOptional: true, isOneTime: false, included: false, configuredAmount: 4000, effectiveAmount: 4000, amountBasis: 'AnnualTotal', obligation: 0, supportsTransportSource: true, verification: 'Configured academic year' },
  ],
};
const saved = new Map<string, AssignmentCommit>();
function preview(input: AssignmentRequest): AssignmentPreview {
  const heads = candidate.heads.map((head) => {
    const included = !head.isOptional || input.selectedOptionalFeeHeadIds.includes(head.feeHeadId);
    const effectiveAmount = input.feeHeadDetails.find((h) => h.feeHeadId === head.feeHeadId)?.amount ?? head.configuredAmount;
    return { ...head, included, effectiveAmount, obligation: included ? effectiveAmount : 0, paymentTermName: 'Two installments', paymentTermVersionNumber: 3,
      servicePeriod: input.servicePeriods.find((p) => p.feeHeadId === head.feeHeadId) ?? { feeHeadId: head.feeHeadId, source: 'AcademicYear' as const, startDate: '2026-04-01T00:00:00Z', endDate: '2027-03-31T00:00:00Z' } };
  });
  const lines = heads.filter((h) => h.included).flatMap((h) => [60, 40].map((share, i) => ({ feeHeadId: h.feeHeadId, feeHeadName: h.feeHeadName, installmentLabel: `Installment ${i + 1}`, sequence: i + 1,
    dueDate: i === 0 ? '2026-04-10' : '2026-10-10', demandDate: i === 0 ? '2026-04-01' : '2026-10-01', allocationPercentage: share, scheduledAmount: h.effectiveAmount * share / 100, proratedAmount: h.obligation * share / 100, paidAmount: 0, outstandingAmount: h.obligation * share / 100 })));
  return { studentId: input.studentId, academicYearId: 'year', structureId: candidate.id, structureName: candidate.name, revisionNumber: 2, currency: 'INR',
    scheduledTotal: lines.reduce((sum, l) => sum + l.scheduledAmount, 0), proratedTotal: lines.reduce((sum, l) => sum + l.proratedAmount, 0), reductionTotal: 0, overrideReason: input.overrideReason,
    previewToken: `fixture-${input.studentId}`, heads, lines, warnings: ['Synthetic preview: calculation accuracy is covered by backend tests.'],
    policies: [{ family: 'collection', name: 'School collection policy', version: 2, headTreatment: { tuition: 'No penalty assessed on assignment.', transport: 'No penalty assessed on assignment.' } }],
  };
}
function commit(input: AssignmentRequest): AssignmentCommit {
  if (saved.has(input.studentId)) return { ...saved.get(input.studentId)!, outcome: 'AlreadyAssigned' };
  const result: AssignmentCommit = { assignmentId: `assignment-${input.studentId}`, outcome: 'Assigned', assignment: preview(input) };
  saved.set(input.studentId, result); return result;
}
export const api = createApi({ reducerPath: 'api', tagTypes: [...Object.values(financeModuleType), ...Object.values(studentAdmissionType), ...Object.values(classType)],
  baseQuery: async (args: { url: string; body?: any }) => {
    if (args.url.endsWith('/standards')) return { data: [{ id: 'class', name: 'Class 5', divisions: [{ id: 'division', name: 'A' }] }] };
    if (args.url.endsWith('/students')) return { data: { totalCount: 2, items: [
      { enrollmentId: 'one', studentId: 'student-one', studentName: 'Aarav Shah', isActive: true, isFeeStructureAssigned: saved.has('student-one') },
      { enrollmentId: 'two', studentId: 'student-two', studentName: 'Meera Rao', isActive: true, isFeeStructureAssigned: saved.has('student-two') },
    ] } };
    if (args.url.endsWith('/candidates')) return { data: [candidate] };
    if (args.url.endsWith('/transport-sources')) return { data: [{ id: 'route', label: 'Transport service from 01 Aug 2026', startDate: '2026-08-01', endDate: '2027-03-31' }] };
    if (args.url.endsWith('/preview-bulk')) return { data: { results: args.body.items.map((input: AssignmentRequest) => ({ studentId: input.studentId, preview: preview(input) })) } };
    if (args.url.endsWith('/preview')) return { data: preview(args.body) };
    if (args.url.endsWith('/assign-bulk')) return { data: { successCount: args.body.items.length, alreadyAssignedCount: 0, failedCount: 0, skippedCount: 0, results: args.body.items.map((input: AssignmentRequest) => ({ studentId: input.studentId, outcome: 'Assigned', result: commit(input) })) } };
    if (args.url.endsWith('/assign')) return { data: commit(args.body) };
    return { data: { assignment: saved.get('student-one')?.assignment, warnings: [] } };
  }, endpoints: () => ({}) });
