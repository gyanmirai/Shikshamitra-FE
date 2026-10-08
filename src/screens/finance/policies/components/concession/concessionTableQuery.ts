import type { IParams } from 'src/components/customizabaleTable/types';
import type { ConcessionPolicyListArgs } from 'src/redux/finance/concessionPolicy';

type ConcessionFilters = Pick<
  ConcessionPolicyListArgs,
  | 'policyNameFilter'
  | 'policyNameOperator'
  | 'valueSource'
  | 'calculationMethod'
  | 'applyOn'
  | 'limitOperator'
  | 'limitValue'
  | 'limitMax'
  | 'updatedAtOperator'
  | 'updatedAt'
  | 'updatedAtEnd'
>;

// The table supports several chips per column; this list has one server-side rule per field.
export const normalizeConcessionFilters = (filters: IParams['filters']): IParams['filters'] =>
  filters.filter(
    (filter, index) =>
      !filters.some((item, laterIndex) => laterIndex > index && item.column === filter.column)
  );

export const concessionFilterArgs = (filters: IParams['filters']): ConcessionFilters => {
  const byColumn = Object.fromEntries(
    normalizeConcessionFilters(filters).map((filter) => [filter.column, filter])
  );
  const name = byColumn.policyName;
  const limit = byColumn.policyLimit;
  const updated = byColumn.updatedAt;
  const limitRange = limit?.type === 'between' ? limit.value : null;
  const updatedDate = String(updated?.value ?? '');
  const dateParts = /^([0-9]{2})-([0-9]{2})-([0-9]{4})$/.exec(updatedDate);
  const selectedDay = dateParts
    ? new Date(Number(dateParts[3]), Number(dateParts[2]) - 1, Number(dateParts[1]))
    : null;
  const followingDay = dateParts
    ? new Date(Number(dateParts[3]), Number(dateParts[2]) - 1, Number(dateParts[1]) + 1)
    : null;

  return {
    policyNameFilter: name ? String(name.value) : undefined,
    policyNameOperator: name?.type,
    valueSource: byColumn.valueSource?.value,
    calculationMethod: byColumn.calculationMethod?.value,
    applyOn: byColumn.applyOn?.value,
    limitOperator: limit?.type,
    limitValue: limit ? Number(limitRange ? limitRange.min : limit.value) : undefined,
    limitMax: limitRange ? Number(limitRange.max) : undefined,
    updatedAtOperator: updated?.type,
    updatedAt: selectedDay?.toISOString(),
    updatedAtEnd: followingDay?.toISOString(),
  };
};
