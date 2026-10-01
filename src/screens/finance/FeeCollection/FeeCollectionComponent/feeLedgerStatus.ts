import { FeeCollectionStatusType } from 'src/enums/fee-collection-type';

/** Repair serialized enum representations once at the ledger API boundary. */
export const normalizeLedgerStatus = (
  status: number | string | undefined,
  paid: number,
  due: number
): FeeCollectionStatusType => {
  if (status !== undefined && String(status).trim() !== '') {
    const numeric = Number(status);
    if (Number.isInteger(numeric) && FeeCollectionStatusType[numeric] !== undefined) {
      return numeric as FeeCollectionStatusType;
    }
    if (typeof status === 'string') {
      const key = status.replace(/[\s_-]/g, '').toLowerCase();
      const alias = key === 'partialpending' || key === 'partialpaid' ? 'partial' : key;
      const name = Object.keys(FeeCollectionStatusType).find(
        (candidate) => Number.isNaN(Number(candidate)) && candidate.toLowerCase() === alias
      );
      if (name) return FeeCollectionStatusType[name as keyof typeof FeeCollectionStatusType];
    }
  }
  if (due <= 0) return FeeCollectionStatusType.Paid;
  return paid > 0 ? FeeCollectionStatusType.Partial : FeeCollectionStatusType.Pending;
};
