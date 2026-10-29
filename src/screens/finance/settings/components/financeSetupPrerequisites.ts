import { isFinancePrerequisiteMissing } from '../../components/financePrerequisites';

import type { FinancePrerequisiteKey } from '../../components/financePrerequisites';

interface SetupQuery {
  currentData?: unknown;
  data?: unknown;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  isUninitialized?: boolean;
}
const items = (data: unknown): readonly unknown[] | undefined => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'items' in data && Array.isArray(data.items))
    return data.items;
  return undefined;
};
// Only currentData proves that the current academic/context request has resolved.
export function setupOptionsMissing(query: SetupQuery, required = true, savedValue?: unknown) {
  return isFinancePrerequisiteMissing({
    ...query,
    options: items(query.currentData),
    required: required && !savedValue,
  });
}
export function paymentTermCalendarMissing(
  query: SetupQuery,
  academicYearId?: string,
  boardId?: string
) {
  if (!academicYearId) return false;
  const boards = items(query.currentData) as
    { id: string; academicYearId: string; startDate?: string; endDate?: string }[] | undefined;
  const scoped = boards?.filter((board) => board.academicYearId === academicYearId);
  if (isFinancePrerequisiteMissing({ ...query, options: scoped })) return true;
  if (
    !boardId ||
    !scoped ||
    query.isLoading ||
    query.isFetching ||
    query.isError ||
    query.isUninitialized
  )
    return false;
  const board = scoped.find((entry) => entry.id === boardId);
  return !board?.startDate || !board.endDate;
}
interface PublicationInput {
  locked?: boolean;
  heads: SetupQuery;
  terms: { ready?: boolean };
  collection: { ready?: boolean };
  settings?: { heads: unknown[]; terms: unknown[]; policies: { family: string }[] };
  candidate: {
    feeHeads: { feeHeadId?: string; paymentTermVersionId?: string | null }[];
    collectionPolicyVersionId?: string | null;
  };
}
export function structurePublicationPrerequisites({
  locked,
  heads,
  terms,
  collection,
  settings,
  candidate,
}: PublicationInput): FinancePrerequisiteKey[] {
  if (locked || !settings) return [];
  const keys: FinancePrerequisiteKey[] = [];
  if (setupOptionsMissing(heads, true, candidate.feeHeads.length)) keys.push('fee-head');
  const allTermsPinned =
    candidate.feeHeads.length > 0 && candidate.feeHeads.every((line) => line.paymentTermVersionId);
  if (terms.ready && !settings.terms.length && !allTermsPinned) keys.push('payment-term');
  if (
    collection.ready &&
    !settings.policies.some((policy) => policy.family === 'collection') &&
    !candidate.collectionPolicyVersionId
  )
    keys.push('collection-policy');
  return keys;
}
