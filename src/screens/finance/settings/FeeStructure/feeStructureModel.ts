import type {
  PolicyFamily,
  StructureLine,
  StructureRecord,
  StructureSettings,
  StructureCandidate,
} from 'src/redux/finance/feeStructureWorkspace';

export type StructurePolicyFamily = Exclude<PolicyFamily, 'concession'>;
export const structurePolicyFamilies: StructurePolicyFamily[] = ['collection', 'refund'];

/** Exact server contract: do not refill explicit nulls with a previous/default attachment. */
export const structureCandidate = (source?: Partial<StructureRecord>): StructureCandidate => ({
  name: source?.name ?? '',
  concurrencyStamp: source?.concurrencyStamp,
  saveAsDraft: true,
  feeHeads: (source?.feeHeads ?? []).map((line) => ({
    id: line.id,
    feeHeadId: line.feeHeadId,
    feeHeadName: line.feeHeadName,
    categoryName: line.categoryName,
    amount: line.amount,
    isOneTime: line.isOneTime,
    isOptional: line.isOptional,
    scheduleMode: line.scheduleMode,
    paymentTermName: line.paymentTermName,
    paymentTermVersionNumber: line.paymentTermVersionNumber,
    isVariable: line.isVariable ?? false,
    payableMonth: line.payableMonth ?? 0,
    payableYear: line.payableYear ?? 0,
    paymentTermId: line.paymentTermId ?? null,
    paymentTermVersionId: line.paymentTermVersionId ?? null,
    installmentOverrides: (line.installmentOverrides ?? []).map((entry) => ({ ...entry })),
  })),
  collectionPolicyId: source?.collectionPolicyId ?? null,
  collectionPolicyVersionId: source?.collectionPolicyVersionId ?? null,
  concessionPolicyId: source?.concessionPolicyId ?? null,
  concessionPolicyVersionId: source?.concessionPolicyVersionId ?? null,
  refundPolicyId: source?.refundPolicyId ?? null,
  refundPolicyVersionId: source?.refundPolicyVersionId ?? null,
  concessionFeeHeadScope: source?.concessionFeeHeadScope ?? 'EntireFeeStructure',
  concessionApplicableFeeHeadIds: [...(source?.concessionApplicableFeeHeadIds ?? [])],
});

export const structureError = (error: unknown): string => {
  const response = error as {
    data?: {
      error?: { code?: string; message?: string; data?: { Errors?: string[] } };
      message?: string;
      errorCode?: string;
      detail?: string;
      data?: { Errors?: string[] };
      errors?: Record<string, string[]>;
    };
  };
  const problem = response?.data?.error;
  if ((problem?.code ?? response?.data?.errorCode)?.includes('ConcurrencyConflict'))
    return 'This structure changed in another session. Refresh and review the latest version before saving.';
  if ((problem?.code ?? response?.data?.errorCode)?.includes('DuplicateName'))
    return 'A Fee Structure with this name already exists in this class. Choose a different name.';
  return (
    problem?.data?.Errors?.join('\n') ||
    response?.data?.data?.Errors?.join('\n') ||
    Object.values(response?.data?.errors ?? {})
      .flat()
      .join('\n') ||
    problem?.message ||
    response?.data?.detail ||
    response?.data?.message ||
    'The operation could not be completed. Your changes are still available; refresh the status before retrying.'
  );
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const schedule = (line: StructureLine) => ({
  paymentTermId: line.paymentTermId,
  paymentTermVersionId: line.paymentTermVersionId,
  scheduleMode: line.scheduleMode,
  installmentOverrides: line.installmentOverrides,
});
const fields = [
  'isVariable',
  'amount',
  'isOneTime',
  'isOptional',
  'payableMonth',
  'payableYear',
] as const;
export function buildStructureChanges(
  before: StructureCandidate,
  after: StructureCandidate
): Record<string, unknown> {
  const changes: Record<string, unknown> = {};
  if (before.name !== after.name) changes.name = after.name;
  const policies: Record<string, unknown> = {};
  structurePolicyFamilies.forEach((family) => {
    const id = `${family}PolicyId` as const;
    const version = `${family}PolicyVersionId` as const;
    if (before[id] !== after[id] || before[version] !== after[version])
      policies[family] = after[id]
        ? {
            policyId: after[id],
            policyVersionId: after[version],
          }
        : null;
  });
  if (Object.keys(policies).length) changes.policies = policies;
  const add = after.feeHeads
    .filter((line) => !line.id)
    .map((line) => ({
      feeHeadId: line.feeHeadId,
      ...Object.fromEntries(fields.map((key) => [key, line[key]])),
      ...schedule(line),
    }));
  const update = after.feeHeads
    .filter((line) => line.id)
    .flatMap((line) => {
      const old = before.feeHeads.find((item) => item.id === line.id);
      if (!old)
        throw new Error('A saved Fee Head is missing from the baseline. Reload the structure.');
      const patch: Record<string, unknown> = { lineId: line.id };
      fields.forEach((key) => {
        if (line[key] !== old[key]) patch[key] = line[key];
      });
      if (!same(schedule(old), schedule(line))) patch.schedule = schedule(line);
      return Object.keys(patch).length > 1 ? [patch] : [];
    });
  const removeLineIds = before.feeHeads
    .filter((line) => line.id && !after.feeHeads.some((item) => item.id === line.id))
    .map((line) => line.id);
  if (add.length || update.length || removeLineIds.length)
    changes.feeHeads = { add, update, removeLineIds };
  return changes;
}

export function defaultPolicy(settings: StructureSettings, family: PolicyFamily) {
  const defaults = settings.policies.filter(
    (policy) => policy.family === family && policy.isDefault && policy.isCurrent
  );
  return defaults.length === 1 ? defaults[0] : undefined;
}
/** Only active, published terms from the requested year and board can be attached. */
export function selectablePaymentTerms(
  items: import('src/redux/finance/paymentTerm').PaymentTermListItem[],
  academicYearId: string,
  boardId: string
): StructureSettings['terms'] {
  return items
    .filter(
      (item) =>
        item.status === 'Active' &&
        item.publishedVersionId &&
        item.publishedVersionNumber &&
        item.academicYearId === academicYearId &&
        item.boardId === boardId
    )
    .map((item) => ({
      id: item.id,
      name: item.name,
      versionId: item.publishedVersionId!,
      versionNumber: item.publishedVersionNumber!,
      isCurrent: true,
      isDefault: item.isDefault,
      demandGenerationRule: '',
      installments: [],
    }));
}

export function defaultPaymentTerm(terms: StructureSettings['terms']) {
  const defaults = terms.filter((term) => term.isDefault && term.isCurrent);
  return defaults.length === 1 ? defaults[0] : undefined;
}

export function withDefaultPaymentTerm(
  line: StructureLine,
  term?: StructureSettings['terms'][number]
): StructureLine {
  if (
    !term ||
    line.paymentTermId ||
    line.paymentTermVersionId ||
    line.scheduleMode === 'Customized' ||
    line.installmentOverrides.length
  )
    return line;
  return {
    ...line,
    paymentTermId: term.id,
    paymentTermVersionId: term.versionId,
    paymentTermName: term.name,
    paymentTermVersionNumber: term.versionNumber,
  };
}

export const paymentTermError = (
  line: Pick<StructureLine, 'paymentTermId' | 'paymentTermVersionId'>
) =>
  !line.paymentTermId || !line.paymentTermVersionId
    ? 'Select a published Payment Term for this Fee Head.'
    : '';

export const amountError = (value: number | string | null | undefined) => {
  if (value == null) return 'Enter the total fee for this Fee Head.';
  if (typeof value === 'string' && !value.trim()) return 'Enter the total fee for this Fee Head.';
  const amount = Number(value);
  return !Number.isFinite(amount) ||
    amount < 0 ||
    amount > 9999999999.99 ||
    Math.abs(amount * 100 - Math.round(amount * 100)) > 0.0001
    ? 'Enter an amount from 0 to 9,999,999,999.99 with up to 2 decimal places.'
    : '';
};
